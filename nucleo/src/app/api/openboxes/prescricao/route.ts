import { NextRequest, NextResponse } from "next/server";
import { OpenBoxesInventoryRepository } from "@/lib/openboxesInventoryRepository";

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

    // Execução do Algoritmo FEFO (First Expired, First Out) via OpenBoxesInventoryRepository
    for (const item of payload.itens) {
      const resultadoFEFO = OpenBoxesInventoryRepository.reservarEstoqueFEFO(
        item.codigo_br,
        item.quantidade_solicitada
      );

      if (resultadoFEFO.alocacoes.length > 0) {
        reservasExecutadas.push({
          codigo_br: item.codigo_br,
          nome_medicamento: item.nome_medicamento,
          quantidade_solicitada: item.quantidade_solicitada,
          quantidade_atendida: resultadoFEFO.quantidade_atendida,
          lotes_alocados: resultadoFEFO.alocacoes
        });
      }

      if (!resultadoFEFO.sucesso) {
        pendenciasEstoque.push({
          codigo_br: item.codigo_br,
          nome: item.nome_medicamento,
          motivo: `Saldo insuficiente no FEFO OpenBoxes. Faltam ${resultadoFEFO.quantidade_faltante} unidades.`
        });
      }
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
      mensagem: "Prescrição processada com sucesso via algoritmo FEFO no banco OpenBoxes.",
      prescricao_id: payload.prescricao_id,
      tenant_id: payload.tenant_id,
      reservas: reservasExecutadas,
      pendencias: pendenciasEstoque,
      wms_ordem_separacao: wmsNotificacao,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao processar prescrição FEFO no OpenBoxes", detalhes: error.message },
      { status: 500 }
    );
  }
}
