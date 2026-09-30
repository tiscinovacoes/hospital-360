import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService, DespesaItem } from '@/lib/hubDespesasStore';
import { SenaiteApiClient } from '@/lib/senaiteApiClient';

export interface DisparoConclusaoPayload {
  workorderId: string;
  pacienteCpf: string;
  pacienteNome?: string;
  codigoExame?: string;
  nomeExame?: string;
  custoTotalRealExame?: number;
  urlLaudoPdf?: string;
  tenant_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DisparoConclusaoPayload = await request.json();

    if (!body.workorderId || !body.pacienteCpf) {
      return NextResponse.json(
        { success: false, error: 'Payload incompleto para disparo de conclusão. Informar workorderId e pacienteCpf.' },
        { status: 400 }
      );
    }

    const eventId = `evt-senaite-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const codigoLoinc = body.codigoExame || '57021-8';
    
    // Apuração de Custo Real LOINC (Reagentes + Descartáveis + Hora Técnica Biomédica)
    let custoReal = Number(body.custoTotalRealExame);
    let detalhesCusto = null;
    if (!custoReal || isNaN(custoReal) || custoReal <= 0) {
      detalhesCusto = SenaiteApiClient.calcularCustoRealProducao(codigoLoinc);
      custoReal = detalhesCusto.custo_total_real;
    }

    const nomeExameFinal = body.nomeExame || detalhesCusto?.nome_exame || 'Exame Laboratorial SENAITE';
    const laudoPdfFinal = body.urlLaudoPdf || `/laudos/laudo_${body.workorderId}.pdf`;

    // 1. Payload oficial de evento de saída no formato Envelope n8n
    const envelopeN8n = {
      event_id: eventId,
      timestamp,
      event_type: 'senaite.exame_concluido',
      source_module: 'SENAITE_LIMS',
      patient_id: body.pacienteCpf,
      cost_center_id: 'CC-LABORATORIO-CENTRAL',
      data: {
        item_codigo: codigoLoinc,
        descricao: `Laudo Laboratorial Concluído: ${nomeExameFinal}`,
        valor_unitario: custoReal,
        quantidade: 1,
        valor_total: custoReal,
        laudo_url: laudoPdfFinal,
        nome_paciente: body.pacienteNome || 'Paciente LIMS',
      },
      metadata: {
        version: '1.0',
        tenant_id: body.tenant_id || 'tenant-cardiovida',
      },
    };

    const despesasLab: DespesaItem[] = [
      {
        id_transacao: eventId,
        paciente_cpf: body.pacienteCpf,
        paciente_nome: body.pacienteNome || 'Paciente LIMS',
        prontuario_episodio: `EPIS-${new Date().getFullYear()}-LAB`,
        centro_custo: 'LABORATORIO_CENTRAL',
        item_codigo: codigoLoinc,
        item_descricao: nomeExameFinal,
        quantidade: 1,
        unidade_medida: 'Exame',
        valor_unitario_medio: custoReal,
        valor_total_imputado: custoReal,
        data_consumo: timestamp,
        origem_modulo: 'LABORATORIO_LIMS',
        estacao_jornada: 2, // Estação 2: Apoio Diagnóstico & Exames LIMS
        metadados: {
          workorder_id: body.workorderId,
          laudo_url: laudoPdfFinal,
          custo_reagentes: detalhesCusto?.custo_reagentes,
          custo_descartaveis: detalhesCusto?.custo_descartaveis,
          custo_hora_tecnica: detalhesCusto?.custo_hora_tecnica,
          tempo_bancada_minutos: detalhesCusto?.tempo_bancada_minutos
        }
      },
    ];

    // 2. Ingestão direta na Estação 2 (Exames LIMS) do Hub 360
    const resultadoHub = HubDespesasService.ingerirLote({
      origem_modulo: 'LABORATORIO_LIMS',
      cliente_id: 'senaite_lims_gateway',
      lote_exportacao_id: `LOTE-LAB-${body.workorderId}`,
      data_geracao: timestamp,
      despesas: despesasLab,
    });

    // 3. Persistência assíncrona no PostgreSQL / Supabase
    await HubDespesasService.persistirLoteNoSupabase({
      protocolo: resultadoHub.protocolo,
      origem_modulo: 'LABORATORIO_LIMS',
      cliente_id: 'senaite_lims_gateway',
      idempotency_key: `SENAITE-CONCLUSAO-${body.workorderId}`,
      itens: despesasLab,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          eventId,
          event_type: 'senaite.exame_concluido',
          protocoloHub: resultadoHub.protocolo,
          custoIngeridoEstacao2: custoReal,
          envelopeN8n,
          despachadoParaBarramento: true,
        },
        error: null,
        meta: {
          timestamp,
          squad: 'Squad 3 - SENAITE LIMS Event Driven',
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao disparar evento de conclusão de exame.';
    return NextResponse.json({ success: false, data: null, error: msg }, { status: 500 });
  }
}
