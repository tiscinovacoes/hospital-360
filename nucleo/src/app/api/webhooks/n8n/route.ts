import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { HubDespesasService, ModuloOrigem } from '@/lib/hubDespesasStore';

export type N8nEventType =
  | 'openemr.prescricao_emitida'
  | 'senaite.exame_concluido'
  | 'openboxes.farmacia_dispensado'
  | 'bahmni.leito_higienizado'
  | 'hyperswitch.financeiro_liquidado';

export interface N8nWebhookEnvelope {
  event_id: string;
  timestamp: string;
  event_type: N8nEventType;
  source_module: string;
  patient_id: string;
  cost_center_id: string;
  data: {
    item_codigo?: string;
    descricao: string;
    valor_unitario: number;
    quantidade: number;
    valor_total?: number;
    lote?: string;
    validade?: string;
    leito?: string;
    laudo_url?: string;
    [key: string]: unknown;
  };
  metadata: {
    version: string;
    auth_signature?: string;
    tenant_id?: string;
  };
}

// Armazenamento global de IDs de eventos já processados para Idempotência
declare global {
  var __hospital360_processedEvents: Set<string> | undefined;
}

const processedEventIds = globalThis.__hospital360_processedEvents || new Set<string>();
globalThis.__hospital360_processedEvents = processedEventIds;

// Mapeamento de event_type para módulo de origem do Hub de Custos
function resolverModuloOrigem(eventType: N8nEventType, sourceModule: string): ModuloOrigem {
  switch (eventType) {
    case 'openemr.prescricao_emitida':
      return 'GESTAO_CLINICA';
    case 'senaite.exame_concluido':
      return 'LABORATORIO_LIMS';
    case 'openboxes.farmacia_dispensado':
      return 'FARMACIA_HOSPITALAR';
    case 'bahmni.leito_higienizado':
      return 'LEITOS_CENSO_NIR';
    case 'hyperswitch.financeiro_liquidado':
      return 'FINTECH_SPLIT';
    default:
      return sourceModule || 'AUTOMACAO_MENSAGERIA';
  }
}

// Validação de assinatura HMAC SHA256 (Se enviada no header ou metadata)
function validarAssinaturaHMAC(payloadText: string, signatureHex?: string | null): boolean {
  if (!signatureHex) return true; // Se não for configurada chave estrita em dev, permite transitar
  const secret = process.env.N8N_WEBHOOK_SECRET || 'hospital360-n8n-secret-key-2026';
  const calculated = crypto.createHmac('sha256', secret).update(payloadText).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signatureHex));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('x-hub-signature-256');

    // 1. Validação de HMAC (se presente)
    if (signatureHeader && !validarAssinaturaHMAC(rawBody, signatureHeader)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assinatura HMAC inválida. Evento não autorizado.',
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 401 }
      );
    }

    const payload: N8nWebhookEnvelope = JSON.parse(rawBody);

    // 2. Validação da estrutura mínima do envelope n8n
    if (!payload.event_id || !payload.event_type || !payload.patient_id || !payload.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Envelope n8n inválido: event_id, event_type, patient_id e data são obrigatórios.',
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 400 }
      );
    }

    // 3. IDEMPOTÊNCIA: Verifica se este evento já foi processado anteriormente
    if (processedEventIds.has(payload.event_id)) {
      return NextResponse.json(
        {
          success: true,
          status: 'DUPLICATE_IGNORED',
          data: { event_id: payload.event_id },
          message: `Evento ${payload.event_id} já processado anteriormente. Processamento ignorado por idempotência.`,
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 200 }
      );
    }

    // Marca como processado na memória de idempotência
    processedEventIds.add(payload.event_id);

    const moduloOrigem = resolverModuloOrigem(payload.event_type, payload.source_module);
    const q = Number(payload.data.quantidade) || 1;
    const vUnit = Number(payload.data.valor_unitario) || 0;
    const vTot = Number(payload.data.valor_total) || q * vUnit;

    // 4. Ingestão no motor de custeio Door-to-Door 360
    const resultadoIngestao = HubDespesasService.ingerirLote({
      origem_modulo: moduloOrigem,
      despesas: [
        {
          id_transacao: payload.event_id,
          paciente_cpf: payload.patient_id,
          paciente_nome: payload.data.nome_paciente ? String(payload.data.nome_paciente) : 'Paciente Auditado n8n',
          prontuario_episodio: `EPIS-${new Date().getFullYear()}-N8N`,
          centro_custo: payload.cost_center_id || 'CC-GERAL-BUS',
          leito_identificador: payload.data.leito ? String(payload.data.leito) : undefined,
          item_codigo: payload.data.item_codigo || `EVT-${payload.event_type.toUpperCase()}`,
          item_descricao: payload.data.descricao,
          lote_fabricante: payload.data.lote ? String(payload.data.lote) : undefined,
          quantidade: q,
          unidade_medida: 'Unidade',
          valor_unitario_medio: vUnit,
          valor_total_imputado: vTot,
          data_consumo: payload.timestamp || new Date().toISOString(),
        },
      ],
    });

    const consolidadoAtualizado = HubDespesasService.obterConsolidadoPaciente(payload.patient_id);

    return NextResponse.json(
      {
        success: true,
        status: 'PROCESSADO_COM_SUCESSO',
        data: {
          event_id: payload.event_id,
          event_type: payload.event_type,
          origem_modulo: moduloOrigem,
          protocolo: resultadoIngestao.protocolo,
          valorTotalImputado: vTot,
          novoCustoTotalPaciente: consolidadoAtualizado?.custoTotalReal || vTot,
        },
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1.0-n8n-bus',
          squad: 'Squad 1 & Squad 7 Integration',
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro no processamento do webhook n8n.';
    return NextResponse.json({ success: false, data: null, error: errorMsg }, { status: 500 });
  }
}

// GET Endpoint para verificar o status da fila de idempotência e conectores n8n
export async function GET() {
  return NextResponse.json(
    {
      status: 'UP',
      modulo: '00-hub-core',
      bus: 'n8n Event Bus Receiver',
      totalEventosProcessadosIdempotentes: processedEventIds.size,
      eventosSuportados: [
        'openemr.prescricao_emitida',
        'senaite.exame_concluido',
        'openboxes.farmacia_dispensado',
        'bahmni.leito_higienizado',
        'hyperswitch.financeiro_liquidado',
      ],
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
