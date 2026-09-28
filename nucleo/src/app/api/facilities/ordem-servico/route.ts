import { NextRequest, NextResponse } from "next/server";

export interface OrdemHigienizacaoPayload {
  ordem_id: string;
  leito_id: string;
  codigo_leito: string;
  unidade_ala: string;
  equipe_higienizacao: string;
  tipo_limpeza: "CONCORRENTE" | "TERMINAL" | "DESINFECÇÃO_UTI";
  status: "SOLICITADA" | "EM_ANDAMENTO" | "CONCLUIDA";
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: OrdemHigienizacaoPayload = await req.json();

    if (!payload.leito_id || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar leito_id e tenant_id." },
        { status: 400 }
      );
    }

    const tempoGiroMinutos = payload.tipo_limpeza === "TERMINAL" ? 35 : 15;

    return NextResponse.json({
      status: "HIGIENIZACAO_CONCLUIDA",
      mensagem: `Higienização terminal de alta eficiência finalizada no leito ${payload.codigo_leito || payload.leito_id}. Leito retornado para o status LIVRE.`,
      ordem_id: payload.ordem_id || `OS-FAC-${Date.now()}`,
      leito_id: payload.leito_id,
      tempo_giro_minutos: tempoGiroMinutos,
      status_leito_novo: "LIVRE",
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao processar ordem de higienização", detalhes: error.message },
      { status: 500 }
    );
  }
}
