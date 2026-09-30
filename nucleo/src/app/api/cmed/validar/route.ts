import { NextRequest, NextResponse } from "next/server";
import { CMEDDatabaseStore } from "@/lib/cmedDatabaseStore";

export interface ValidacaoPrecoRequest {
  codigo_br?: string;
  ean?: string;
  nome_medicamento: string;
  preco_fornecedor_unitario: number;
  quantidade: number;
  fornecedor_cnpj: string;
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: ValidacaoPrecoRequest = await req.json();

    if (!payload.nome_medicamento || payload.preco_fornecedor_unitario === undefined || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar nome_medicamento, preco_fornecedor_unitario e tenant_id." },
        { status: 400 }
      );
    }

    const chaveBusca = payload.codigo_br || payload.ean || payload.nome_medicamento;
    const resultado = await CMEDDatabaseStore.validarCotacaoAsync({
      codigo_br_ou_ean: chaveBusca,
      preco_fornecedor: payload.preco_fornecedor_unitario
    });

    if (resultado.status === "NOT_FOUND") {
      return NextResponse.json({
        status: "NOT_FOUND",
        motivo: resultado.motivo,
        recomendacao: resultado.recomendacao,
        supplier_price: payload.preco_fornecedor_unitario,
        audit_log_id: `AUDIT-CMED-${Date.now()}`
      }, { status: 404 });
    }

    const reg = resultado.registro!;
    const auditLogId = `AUDIT-CMED-${Date.now()}`;

    return NextResponse.json({
      status: resultado.status,
      codigo_br: reg.codigo_br,
      ean: reg.ean,
      nome_catmat: `${reg.principio_ativo} - ${reg.apresentacao}`,
      laboratorio: reg.laboratorio,
      precos: {
        preco_fornecedor: payload.preco_fornecedor_unitario,
        bps_preco_sus_ref: reg.bps_preco_medio_sus,
        cmed_preco_teto_max: reg.preco_fabrica_teto,
        cmed_pmc_max: reg.preco_max_consumidor,
        divergencia_bps_pct: resultado.divergencia_bps_pct,
        divergencia_cmed_pct: resultado.divergencia_cmed_pct
      },
      validacao: {
        status: resultado.status,
        motivo: resultado.motivo,
        recomendacao: resultado.recomendacao
      },
      versoes_tabelas: {
        catmat_version: "2026_04_24",
        bps_version: "2026_04_24",
        cmed_version: "2026_04_24"
      },
      audit_log_id: auditLogId,
      timestamp: new Date().toISOString()
    }, { status: resultado.status === "ILLEGAL" ? 422 : 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao validar preço na base CMED/BPS ANVISA", detalhes: error.message },
      { status: 500 }
    );
  }
}
