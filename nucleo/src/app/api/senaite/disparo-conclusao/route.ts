import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

export interface DisparoConclusaoPayload {
  workorderId: string;
  pacienteCpf: string;
  pacienteNome: string;
  codigoExame: string;
  nomeExame: string;
  custoTotalRealExame: number;
  urlLaudoPdf: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DisparoConclusaoPayload = await request.json();

    if (!body.workorderId || !body.pacienteCpf || !body.custoTotalRealExame) {
      return NextResponse.json(
        { success: false, error: 'Payload incompleto para disparo de conclusão.' },
        { status: 400 }
      );
    }

    const eventId = `evt-senaite-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. Payload oficial de evento de saída no formato Envelope n8n
    const envelopeN8n = {
      event_id: eventId,
      timestamp,
      event_type: 'senaite.exame_concluido',
      source_module: 'SENAITE_LIMS',
      patient_id: body.pacienteCpf,
      cost_center_id: 'CC-LABORATORIO-CENTRAL',
      data: {
        item_codigo: body.codigoExame || 'LOINC-1751-7',
        descricao: `Laudo Laboratorial Concluído: ${body.nomeExame}`,
        valor_unitario: body.custoTotalRealExame,
        quantidade: 1,
        valor_total: body.custoTotalRealExame,
        laudo_url: body.urlLaudoPdf,
        nome_paciente: body.pacienteNome,
      },
      metadata: {
        version: '1.0',
        tenant_id: 'tenant-cardiovida',
      },
    };

    // 2. Ingestão direta na Estação 2 (Exames LIMS) do Hub 360
    const resultadoHub = HubDespesasService.ingerirLote({
      origem_modulo: 'LABORATORIO_LIMS',
      despesas: [
        {
          id_transacao: eventId,
          paciente_cpf: body.pacienteCpf,
          paciente_nome: body.pacienteNome || 'Paciente LIMS',
          prontuario_episodio: `EPIS-${new Date().getFullYear()}-LAB`,
          centro_custo: 'LABORATORIO_CENTRAL',
          item_codigo: body.codigoExame || 'LOINC-1751-7',
          item_descricao: body.nomeExame || 'Exame Laboratorial SENAITE',
          quantidade: 1,
          unidade_medida: 'Exame',
          valor_unitario_medio: body.custoTotalRealExame,
          valor_total_imputado: body.custoTotalRealExame,
          data_consumo: timestamp,
          estacao_jornada: 2,
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          eventId,
          event_type: 'senaite.exame_concluido',
          protocoloHub: resultadoHub.protocolo,
          custoIngeridoEstacao2: body.custoTotalRealExame,
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
