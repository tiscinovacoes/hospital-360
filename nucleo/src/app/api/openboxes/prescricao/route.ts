import { NextRequest, NextResponse } from "next/server";

export interface ItemPrescrito {
  medicamento_id: string;
  codigo_br: string;
  nome_medicamento: string;
  quantidade_solicitada: number;
  unidade_medida: string;
}

export interface PrescricaoPayload {
  prescricao_id: string;
  atendimento_id: string;
  paciente_id: string;
  paciente_nome: string;
  leito_unidade?: string;
  medico_crm: string;
  tenant_id: string;
  itens: ItemPrescrito[];
}

export interface LoteEstoqueFEFO {
  lote_id: string;
  numero_lote: string;
  codigo_br: string;
  data_fabricacao: string;
  data_vencimento: string; // ISO date string
  quantidade_disponivel: number;
  localizacao_prateleira: string;
  custo_unitario: number;
  temperatura_conservacao_c: number;
}

// Simulador de Banco de Dados de Lotes de Estoque OpenBoxes
const ESTOQUE_OPENBOXES_MOCK: Record<string, LoteEstoqueFEFO[]> = {
  "BR100200300": [
    {
      lote_id: "LOT-DIP-2026-02",
      numero_lote: "DIP2026B",
      codigo_br: "BR100200300",
      data_fabricacao: "2025-06-01",
      data_vencimento: "2026-11-15", // Expira antes! (FEFO Escolhe este)
      quantidade_disponivel: 500,
      localizacao_prateleira: "A-04-12",
      custo_unitario: 1.80,
      temperatura_conservacao_c: 22.0
    },
    {
      lote_id: "LOT-DIP-2026-05",
      numero_lote: "DIP2026E",
      codigo_br: "BR100200300",
      data_fabricacao: "2025-09-01",
      data_vencimento: "2027-05-20",
      quantidade_disponivel: 1200,
      localizacao_prateleira: "A-04-13",
      custo_unitario: 1.75,
      temperatura_conservacao_c: 22.0
    }
  ],
  "BR400500600": [
    {
      lote_id: "LOT-AMX-2026-01",
      numero_lote: "AMX991",
      codigo_br: "BR400500600",
      data_fabricacao: "2025-01-10",
      data_vencimento: "2026-10-01", // FEFO Vencedor
      quantidade_disponivel: 80,
      localizacao_prateleira: "B-02-05",
      custo_unitario: 12.50,
      temperatura_conservacao_c: 20.0
    }
  ]
};

export async function POST(req: NextRequest) {
  try {
    const payload: PrescricaoPayload = await req.json();

    if (!payload.prescricao_id || !payload.tenant_id || !payload.itens?.length) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar prescricao_id, tenant_id e itens." },
        { status: 400 }
      );
    }

    const reservasExecutadas = [];
    const pendenciasEstoque = [];

    // Execução do Algoritmo FEFO (First Expired, First Out)
    for (const item of payload.itens) {
      const lotesMed = ESTOQUE_OPENBOXES_MOCK[item.codigo_br] || [];

      // Filtrar lotes não vencidos e ordenar por data_vencimento ascendente (FEFO)
      const hojeStr = new Date().toISOString().split("T")[0];
      const lotesValidos = lotesMed
        .filter(l => l.data_vencimento > hojeStr && l.quantidade_disponivel > 0)
        .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento));

      if (!lotesValidos.length) {
        pendenciasEstoque.push({
          codigo_br: item.codigo_br,
          nome: item.nome_medicamento,
          motivo: "Ruptura de Estoque / Lotes Vencidos"
        });
        continue;
      }

      let qtdFaltante = item.quantidade_solicitada;
      const lotesReservadosItem = [];

      for (const lote of lotesValidos) {
        if (qtdFaltante <= 0) break;

        const qtdAlocada = Math.min(lote.quantidade_disponivel, qtdFaltante);
        qtdFaltante -= qtdAlocada;

        lotesReservadosItem.push({
          lote_id: lote.lote_id,
          numero_lote: lote.numero_lote,
          data_vencimento: lote.data_vencimento,
          quantidade_reservada: qtdAlocada,
          localizacao_prateleira: lote.localizacao_prateleira,
          custo_unitario: lote.custo_unitario,
          custo_total_lote: Number((qtdAlocada * lote.custo_unitario).toFixed(2))
        });
      }

      if (qtdFaltante > 0) {
        pendenciasEstoque.push({
          codigo_br: item.codigo_br,
          nome: item.nome_medicamento,
          motivo: `Saldo insuficiente no FEFO. Faltam ${qtdFaltante} unidades.`
        });
      }

      reservasExecutadas.push({
        codigo_br: item.codigo_br,
        nome_medicamento: item.nome_medicamento,
        quantidade_solicitada: item.quantidade_solicitada,
        lotes_alocados: lotesReservadosItem
      });
    }

    // Notificação ao WMS (05-modulo-wms-intralogistica) para Pick & Pack
    const wmsNotificacao = {
      ordem_separacao_id: `WMS-SEP-${Date.now()}`,
      prescricao_id: payload.prescricao_id,
      paciente_nome: payload.paciente_nome,
      leito_unidade: payload.leito_unidade || "Posto Enfermagem Central",
      status_separacao: "AGUARDANDO_PICKING",
      itens_para_separar: reservasExecutadas
    };

    return NextResponse.json({
      status: "RESERVADO_FEFO",
      mensagem: "Prescrição processada com sucesso via algoritmo FEFO (OpenBoxes).",
      prescricao_id: payload.prescricao_id,
      tenant_id: payload.tenant_id,
      reservas: reservasExecutadas,
      pendencias: pendenciasEstoque,
      wms_ordem_separacao: wmsNotificacao,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao processar prescrição FEFO", detalhes: error.message },
      { status: 500 }
    );
  }
}
