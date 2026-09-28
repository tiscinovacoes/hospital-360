import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const tenantId = req.headers.get("x-tenant-id") || "standalone_hospital";

  if (!apiKey || apiKey !== "hospital360_farmacia_fefo_secret_key") {
    return NextResponse.json(
      { erro: "Não autorizado. Chave x-api-key pública de integração avulsa inválida." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: "STANDALONE_READY",
    modulo: "04-modulo-estoque-farmacia",
    descricao: "API Aberta de Farmácia FEFO & Validação CMED para Integração com ERPs Terceiros (TOTVS, MV, TASY)",
    endpoints_publicos: {
      prescricao_fefo: "/api/openboxes/prescricao",
      validacao_cmed_bps: "/api/cmed/validar",
      telemetria_cadeia_frio: "/api/openboxes/alerta-temperatura-estoque",
      disparo_baixa: "/api/openboxes/disparo-dispensacao"
    },
    tenant_id: tenantId,
    timestamp: new Date().toISOString()
  }, { status: 200 });
}
