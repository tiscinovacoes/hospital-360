import { NextRequest, NextResponse } from "next/server";
import { HubDespesasService } from "@/lib/hubDespesasStore";

export interface ItemDispensado {
  codigo_br: string;
  nome_medicamento: string;
  numero_lote: string;
  quantidade_dispensada: number;
  custo_unitario_aquisicao: number;
  custo_total_item: number;
}

export interface DispensacaoConcluidaPayload {
  dispensacao_id: string;
  prescricao_id: string;
  atendimento_id: string;
  paciente_id: string;
  paciente_nome: string;
  leito_unidade: string;
  farmaceutico_crf: string;
  tenant_id: string;
  itens_dispensados: ItemDispensado[];
}

export async function POST(req: NextRequest) {
  try {
    const payload: DispensacaoConcluidaPayload = await req.json();

    if (!payload.dispensacao_id || !payload.tenant_id || !payload.itens_dispensados?.length) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar dispensacao_id, tenant_id e itens_dispensados." },
        { status: 400 }
      );
    }

    // Calcular o custo total de aquisição de insumos/medicamentos nesta dispensação
    const custoTotalInsumos = payload.itens_dispensados.reduce(
      (acc, item) => acc + (item.custo_total_item || (item.quantidade_dispensada * item.custo_unitario_aquisicao)),
      0
    );
    const custoFormatado = Number(custoTotalInsumos.toFixed(2));

    // 1. Reportar custo exato de insumos para o Hub Core (00-hub-core/ - Estação 3: Insumos e Medicamentos)
    const registroHub = HubDespesasService.ingerirLote({
      origem_modulo: "FARMACIA_HOSPITALAR",
      despesas: payload.itens_dispensados.map(item => ({
        id_transacao: `DSP-FAR-${payload.dispensacao_id}`,
        paciente_cpf: "123.456.789-00",
        paciente_nome: payload.paciente_nome,
        prontuario_episodio: payload.atendimento_id,
        centro_custo: payload.leito_unidade,
        item_codigo: item.codigo_br,
        item_descricao: item.nome_medicamento,
        lote_fabricante: item.numero_lote,
        quantidade: item.quantidade_dispensada,
        unidade_medida: "UN",
        valor_unitario_medio: item.custo_unitario_aquisicao,
        valor_total_imputado: item.custo_total_item,
        data_consumo: new Date().toISOString(),
        estacao_jornada: 4 // 4. Terapia Medicamentosa Beira-Leito
      }))
    });

    // 2. Notificar barramento de eventos e n8n (openboxes.farmacia_dispensado)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/farmacia-dispensado";
    let statusN8n = "SIMULADO_SUCESSO";

    try {
      await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evento: "openboxes.farmacia_dispensado",
          dispensacao_id: payload.dispensacao_id,
          paciente_id: payload.paciente_id,
          custo_total_insumos: custoFormatado,
          itens: payload.itens_dispensados,
          timestamp: new Date().toISOString()
        })
      });
      statusN8n = "ENVIADO";
    } catch {
      statusN8n = "FALHA_CONEXAO_N8N_DESPONTADO";
    }

    return NextResponse.json({
      status: "DISPENSACAO_CONCLUIDA",
      evento: "openboxes.farmacia_dispensado",
      dispensacao_id: payload.dispensacao_id,
      tenant_id: payload.tenant_id,
      custo_total_insumos: custoFormatado,
      hub_core_despesa: registroHub,
      barramento_n8n: { status: statusN8n },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao disparar baixa e apuração de custos de dispensação", detalhes: error.message },
      { status: 500 }
    );
  }
}
