import { NextRequest, NextResponse } from "next/server";

export interface EventoDispatchPayload {
  evento: string; // ex: "openemr.triagem_concluida", "senaite.exame_concluido", "openboxes.farmacia_dispensado"
  origem_modulo: string;
  dados: Record<string, unknown>;
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: EventoDispatchPayload = await req.json();

    if (!payload.evento || !payload.origem_modulo || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar evento, origem_modulo e tenant_id." },
        { status: 400 }
      );
    }

    const n8nBaseUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook";
    const webhookTarget = `${n8nBaseUrl}/${payload.evento.replace(".", "/")}`;

    let statusDisparo = "SIMULADO_SUCESSO";
    try {
      await fetch(webhookTarget, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      statusDisparo = "DISPARADO_SUCESSO";
    } catch {
      statusDisparo = "SIMULADO_LOCAL";
    }

    return NextResponse.json({
      status: "EVENTO_PROCESSADO",
      evento: payload.evento,
      origem: payload.origem_modulo,
      tenant_id: payload.tenant_id,
      n8n_target: webhookTarget,
      disparo_status: statusDisparo,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao despachar evento para o barramento n8n", detalhes: error.message },
      { status: 500 }
    );
  }
}
