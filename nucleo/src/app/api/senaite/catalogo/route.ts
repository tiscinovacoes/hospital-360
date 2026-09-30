import { NextRequest, NextResponse } from "next/server";
import { SenaiteApiClient } from "@/lib/senaiteApiClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenant_id") || "hospital_360_default";

  const client = new SenaiteApiClient();
  const catalogo = await client.obterCatalogoExamesLOINCAsync();

  return NextResponse.json({
    status: "SUCESSO",
    fonte: "SENAITE LIMS 2.x API (Catálogo Oficial LOINC)",
    tenant_id: tenantId,
    total_exames: catalogo.length,
    catalogo,
    timestamp: new Date().toISOString()
  }, { status: 200 });
}
