import { NextRequest, NextResponse } from "next/server";
import { OpenBoxesInventoryRepository } from "@/lib/openboxesInventoryRepository";
import { HubDespesasService, DespesaItem } from "@/lib/hubDespesasStore";

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

    const timestamp = new Date().toISOString();
    const reservasExecutadas = [];
    const pendenciasEstoque = [];
    const despesasParaHub: DespesaItem[] = [];

    // Execução do Algoritmo FEFO (First Expired, First Out) com busca assíncrona no PostgreSQL / Supabase
    for (const item of payload.itens) {
      const resultadoFEFO = await OpenBoxesInventoryRepository.reservarEstoqueFEFOAsync(
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

        // Converte cada alocação de lote em uma despesa canônica da Estação 4
        for (const alloc of resultadoFEFO.alocacoes) {
          despesasParaHub.push({
            id_transacao: `DSP-FAR-${payload.prescricao_id}-${alloc.lote_id}-${Date.now()}`,
            paciente_cpf: payload.paciente_id || "000.000.000-00",
            paciente_nome: payload.paciente_nome || "Paciente Prescrição",
            prontuario_episodio: payload.atendimento_id || `EPIS-${payload.prescricao_id}`,
            centro_custo: payload.leito_unidade ? payload.leito_unidade.toUpperCase().replace(/\s+/g, '_') : "FARMACIA_HOSPITALAR",
            leito_identificador: payload.leito_unidade || "Posto Enfermagem Central",
            item_codigo: item.codigo_br,
            item_descricao: `Dispensação Beira-Leito FEFO: ${item.nome_medicamento} (Lote: ${alloc.numero_lote})`,
            lote_fabricante: alloc.numero_lote,
            quantidade: alloc.quantidade_reservada,
            unidade_medida: item.unidade_medida || "UN",
            valor_unitario_medio: alloc.custo_unitario,
            valor_total_imputado: alloc.custo_total_lote,
            data_consumo: timestamp,
            origem_modulo: "FARMACIA_HOSPITALAR",
            estacao_jornada: 4, // Estação 4: Terapia Medicamentosa Beira-Leito
            metadados: {
              prescricao_id: payload.prescricao_id,
              medico_crm: payload.medico_crm,
              lote_id: alloc.lote_id,
              data_vencimento: alloc.data_vencimento,
              localizacao_prateleira: alloc.localizacao_prateleira,
              origem_dados: (alloc as { origem_dados?: string }).origem_dados || "OPENBOXES_FEFO"
            }
          });
        }
      }

      if (!resultadoFEFO.sucesso) {
        pendenciasEstoque.push({
          codigo_br: item.codigo_br,
          nome: item.nome_medicamento,
          motivo: `Saldo insuficiente no FEFO OpenBoxes. Faltam ${resultadoFEFO.quantidade_faltante} unidades.`
        });
      }
    }

    // Ingestão e Persistência no Hub de Custos (Estação 4)
    let hubInfo = null;
    if (despesasParaHub.length > 0) {
      const loteIngerido = HubDespesasService.ingerirLote({
        origem_modulo: "FARMACIA_HOSPITALAR",
        cliente_id: "openboxes_fefo_central",
        lote_exportacao_id: `LOTE-FAR-${payload.prescricao_id}`,
        data_geracao: timestamp,
        despesas: despesasParaHub
      });

      // Persistência assíncrona no PostgreSQL / Supabase
      await HubDespesasService.persistirLoteNoSupabase({
        protocolo: loteIngerido.protocolo,
        origem_modulo: "FARMACIA_HOSPITALAR",
        cliente_id: "openboxes_fefo_central",
        idempotency_key: `PRESCRICAO-${payload.prescricao_id}`,
        itens: despesasParaHub
      });

      hubInfo = {
        protocolo: loteIngerido.protocolo,
        estacao: 4,
        estacaoNome: "Estação 4: Terapia Medicamentosa Beira-Leito",
        valorTotalImputado: loteIngerido.valorTotal,
        itensIngeridos: despesasParaHub.length
      };
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
      mensagem: "Prescrição processada com sucesso via algoritmo FEFO no banco OpenBoxes com custos lançados na Estação 4.",
      prescricao_id: payload.prescricao_id,
      tenant_id: payload.tenant_id,
      reservas: reservasExecutadas,
      pendencias: pendenciasEstoque,
      hub_custos: hubInfo,
      wms_ordem_separacao: wmsNotificacao,
      timestamp
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao processar prescrição FEFO no OpenBoxes", detalhes: error.message },
      { status: 500 }
    );
  }
}
