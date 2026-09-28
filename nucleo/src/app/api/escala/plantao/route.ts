import { NextRequest, NextResponse } from "next/server";
import { HubDespesasService } from "@/lib/hubDespesasStore";

export interface PlantaoMedicoPayload {
  plantao_id: string;
  medico_crm: string;
  medico_nome: string;
  especialidade: string;
  unidade_ala: string;
  duracao_horas: number;
  valor_plantao: number;
  pacientes_atendidos_cpfs: string[];
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: PlantaoMedicoPayload = await req.json();

    if (!payload.medico_crm || !payload.valor_plantao || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar medico_crm, valor_plantao e tenant_id." },
        { status: 400 }
      );
    }

    const totalPacientes = payload.pacientes_atendidos_cpfs?.length || 1;
    const rateioPorPaciente = Number((payload.valor_plantao / totalPacientes).toFixed(2));

    // Ratear honorário do plantão por paciente-dia na Estação 5 do Hub Core
    const despesasRateadas = (payload.pacientes_atendidos_cpfs || ["123.456.789-00"]).map((cpf, idx) => ({
      id_transacao: `DSP-ESC-${payload.plantao_id || Date.now()}-${idx}`,
      paciente_cpf: cpf,
      paciente_nome: `Paciente Rateio ${idx + 1}`,
      prontuario_episodio: `EPIS-ESC-${idx + 1}`,
      centro_custo: payload.unidade_ala,
      item_codigo: "HON-MEDICO-PLANTAO",
      item_descricao: `Rateio de Plantão Médico (${payload.medico_nome} - ${payload.especialidade})`,
      quantidade: 1,
      unidade_medida: "Rateio Paciente-Dia",
      valor_unitario_medio: rateioPorPaciente,
      valor_total_imputado: rateioPorPaciente,
      data_consumo: new Date().toISOString(),
      estacao_jornada: 5 // 5. Hotelaria, Diárias & Honorários
    }));

    const hubResult = HubDespesasService.ingerirLote({
      origem_modulo: "ESCALA_MEDICA",
      despesas: despesasRateadas
    });

    return NextResponse.json({
      status: "PLANTAO_ALOCADO_RATEADO",
      mensagem: `Honorário de plantão R$ ${payload.valor_plantao.toFixed(2)} rateado entre ${totalPacientes} pacientes (R$ ${rateioPorPaciente.toFixed(2)} / paciente).`,
      plantao_id: payload.plantao_id,
      tenant_id: payload.tenant_id,
      hub_core_despesas: hubResult,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao processar rateio de plantão médico", detalhes: error.message },
      { status: 500 }
    );
  }
}
