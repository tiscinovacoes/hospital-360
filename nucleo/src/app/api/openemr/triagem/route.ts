import { NextRequest, NextResponse } from "next/server";
import { OpenEMRDatabaseRepository } from "@/lib/openemrDatabaseRepository";

export interface TriagemManchesterRequest {
  paciente_cpf: string;
  paciente_nome: string;
  sinais_vitais: {
    pressao_arterial: string;
    frequencia_cardiaca: number;
    temperatura_c: number;
    saturacao_oxigenio_pct: number;
  };
  queixa_principal: string;
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: TriagemManchesterRequest = await req.json();

    if (!payload.paciente_cpf || !payload.paciente_nome || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar paciente_cpf, paciente_nome e tenant_id." },
        { status: 400 }
      );
    }

    const encontro = OpenEMRDatabaseRepository.registrarTriagemManchester({
      paciente_cpf: payload.paciente_cpf,
      paciente_nome: payload.paciente_nome,
      sinais_vitais: payload.sinais_vitais,
      queixa_principal: payload.queixa_principal
    });

    return NextResponse.json({
      status: "TRIAGEM_REGISTRADA_OPENEMR",
      mensagem: "Paciente classificado no protocolo de Manchester e inserido no banco de dados OpenEMR.",
      encounter_id: encontro.encounter_id,
      pid: encontro.pid,
      paciente_nome: encontro.paciente_nome,
      classificacao_manchester: {
        cor: encontro.cor_classificacao,
        prioridade_minutos: encontro.prioridade_minutos
      },
      tenant_id: payload.tenant_id,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao registrar triagem no OpenEMR", detalhes: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const fila = OpenEMRDatabaseRepository.listarFilaTriagem();
  return NextResponse.json({
    status: "SUCESSO",
    total_fila: fila.length,
    fila_atendimento: fila
  }, { status: 200 });
}
