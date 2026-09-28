import { NextRequest, NextResponse } from "next/server";

export interface SolicitarTfdPayload {
  solicitacao_id?: string;
  paciente_cpf: string;
  paciente_nome: string;
  municipio_origem: string;
  municipio_destino: string;
  hospital_destino: string;
  diagnostico_cid10: string;
  tipo_transporte: "AMBULANCIA_UTI" | "AMBULANCIA_SIMPLES" | "TRANSPORTE_AEREO" | "VAN_MUNICIPAL";
  necessita_acompanhante: boolean;
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: SolicitarTfdPayload = await req.json();

    if (!payload.paciente_cpf || !payload.municipio_destino || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar paciente_cpf, municipio_destino e tenant_id." },
        { status: 400 }
      );
    }

    const solicitacaoId = payload.solicitacao_id || `TFD-SUS-${Date.now()}`;
    const valorDiariaAjudaCusto = payload.necessita_acompanhante ? 180.00 : 90.00;

    return NextResponse.json({
      status: "TFD_DEFERIDO_AUTORIZADO",
      solicitacao_id: solicitacaoId,
      paciente: {
        cpf: payload.paciente_cpf,
        nome: payload.paciente_nome,
        cid10: payload.diagnostico_cid10
      },
      trajeto: {
        origem: payload.municipio_origem,
        destino: payload.municipio_destino,
        hospital: payload.hospital_destino,
        modalidade: payload.tipo_transporte
      },
      ajuda_custo: {
        necessita_acompanhante: payload.necessita_acompanhante,
        valor_diaria_estimado_brl: valorDiariaAjudaCusto,
        voucher_codigo: `VOUCHER-TFD-${Math.floor(100000 + Math.random() * 900000)}`
      },
      sisreg_protocolo: `SISREG-${Date.now()}`,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao processar regulação e autorização de TFD", detalhes: error.message },
      { status: 500 }
    );
  }
}
