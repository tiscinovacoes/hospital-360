import { NextRequest, NextResponse } from "next/server";
import { WhatsappCloudApiClient } from "@/lib/whatsappCloudApiClient";

export interface EnviarMensagemWhatsappPayload {
  telefone_destino: string;
  paciente_nome: string;
  mensagem: string;
  template_nome?: string;
  template_language?: string;
  tenant_id: string;
}

// GET Endpoint para Verificação de Webhook do Meta WhatsApp Business API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN || process.env.VERIFY_TOKEN || "hospital360_whatsapp_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge || "ok", { status: 200 });
  }

  return NextResponse.json({
    status: "UP",
    servico: "Meta WhatsApp Cloud API v21.0 & Evolution API Bridge",
    webhook_endpoint: true,
    timestamp: new Date().toISOString()
  }, { status: 200 });
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
      templateName: payload.template_nome,
      templateLanguage: payload.template_language
    });

    return NextResponse.json({
      status: "MENSAGEM_ENVIADA",
      message_id: resultadoMeta.wamid,
      telefone_destino: resultadoMeta.phone_formatted,
      paciente_nome: payload.paciente_nome,
      tenant_id: payload.tenant_id,
      origem_disparo: resultadoMeta.origem_disparo,
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
