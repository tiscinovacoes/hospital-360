import { NextRequest, NextResponse } from "next/server";
import { WhatsappCloudApiClient } from "@/lib/whatsappCloudApiClient";

export interface EnviarMensagemWhatsappPayload {
  telefone_destino: string;
  paciente_nome: string;
  mensagem: string;
  template_nome?: string;
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: EnviarMensagemWhatsappPayload = await req.json();

    if (!payload.telefone_destino || !payload.mensagem || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar telefone_destino, mensagem e tenant_id." },
        { status: 400 }
      );
    }

    const resultadoMeta = await WhatsappCloudApiClient.dispararNotificacao({
      telefoneDestino: payload.telefone_destino,
      pacienteNome: payload.paciente_nome,
      mensagemText: payload.mensagem,
      templateName: payload.template_nome
    });

    return NextResponse.json({
      status: "MENSAGEM_ENVIADA",
      message_id: resultadoMeta.wamid,
      telefone_destino: resultadoMeta.phone_formatted,
      paciente_nome: payload.paciente_nome,
      tenant_id: payload.tenant_id,
      meta_api_response: resultadoMeta,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao disparar mensagem na API Meta WhatsApp Cloud", detalhes: error.message },
      { status: 500 }
    );
  }
}
