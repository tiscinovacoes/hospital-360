import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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

declare global {
  var __hospital360_hubCoreProcessedEvents: Set<string> | undefined;
}

const processedEventIds = globalThis.__hospital360_hubCoreProcessedEvents || new Set<string>();
globalThis.__hospital360_hubCoreProcessedEvents = processedEventIds;

function validarAssinaturaHMAC(payloadText: string, signatureHex?: string | null): boolean {
  if (!signatureHex) return true;
  const secret = process.env.N8N_WEBHOOK_SECRET || 'hospital360-n8n-secret-key-2026';
  const calculated = crypto.createHmac('sha256', secret).update(payloadText).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(signatureHex));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('x-hub-signature-256');

    if (signatureHeader && !validarAssinaturaHMAC(rawBody, signatureHeader)) {
      return NextResponse.json(
        { success: false, error: 'Assinatura HMAC inválida. Evento não autorizado.' },
        { status: 401 }
      );
    }

    const payload: N8nWebhookEnvelope = JSON.parse(rawBody);

    if (!payload.event_id || !payload.event_type || !payload.patient_id || !payload.data) {
      return NextResponse.json(
        { success: false, error: 'Envelope n8n inválido.' },
        { status: 400 }
      );
    }

    if (processedEventIds.has(payload.event_id)) {
      return NextResponse.json(
        {
          success: true,
          status: 'DUPLICATE_IGNORED',
          data: { event_id: payload.event_id },
          message: `Evento ${payload.event_id} ignorado por idempotência.`,
        },
        { status: 200 }
      );
    }

    processedEventIds.add(payload.event_id);

    const q = Number(payload.data.quantidade) || 1;
    const vUnit = Number(payload.data.valor_unitario) || 0;
    const vTot = Number(payload.data.valor_total) || q * vUnit;

    return NextResponse.json(
      {
        success: true,
        status: 'PROCESSADO_COM_SUCESSO',
        data: {
          event_id: payload.event_id,
          event_type: payload.event_type,
          valorTotalImputado: vTot,
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

export async function GET() {
  return NextResponse.json(
    {
      status: 'UP',
      modulo: '00-hub-core',
      bus: 'n8n Event Bus Receiver',
      totalEventosProcessadosIdempotentes: processedEventIds.size,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
