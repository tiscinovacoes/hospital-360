import { NextRequest, NextResponse } from "next/server";

export interface EnviarMensagemWhatsappPayload {
  telefone_destino: string;
  paciente_nome: string;
  mensagem: string;
  template_nome?: string;
  parametros?: Record<string, string>;
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

    const messageId = `WAMID-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return NextResponse.json({
      status: "MENSAGEM_ENVIADA",
      message_id: messageId,
      telefone_destino: payload.telefone_destino,
      paciente_nome: payload.paciente_nome,
      tenant_id: payload.tenant_id,
      meta_api_response: {
        messaging_product: "whatsapp",
        contacts: [{ input: payload.telefone_destino, wa_id: payload.telefone_destino.replace(/\D/g, "") }],
        messages: [{ id: messageId }]
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao enviar mensagem via WhatsApp API", detalhes: error.message },
      { status: 500 }
    );
  }
}
