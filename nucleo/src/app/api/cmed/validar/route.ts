import { NextRequest, NextResponse } from "next/server";

export interface ValidacaoPrecoRequest {
  codigo_br?: string;
  nome_medicamento: string;
  preco_fornecedor_unitario: number;
  quantidade: number;
  fornecedor_cnpj: string;
  integrator_id?: string;
  tenant_id: string;
}

export interface TabelaPrecoOficial {
  codigo_br: string;
  nome_catmat: string;
  bps_preco_sus_ref: number; // Preço médio SUS (BPS)
  cmed_preco_teto_max: number; // Teto legal ANVISA/CMED
}

// Simulação de banco de dados oficial (CATMAT + BPS + CMED)
const BASE_GOVERNAMENTAL_MOCK: Record<string, TabelaPrecoOficial> = {
  "BR100200300": {
    codigo_br: "BR100200300",
    nome_catmat: "Dipirona Sódica 500mg/mL Solução Injetável 2mL",
    bps_preco_sus_ref: 1.50,
    cmed_preco_teto_max: 2.10
  },
  "BR400500600": {
    codigo_br: "BR400500600",
    nome_catmat: "Amoxicilina + Clavulanato 500mg + 125mg Comprimido",
    bps_preco_sus_ref: 10.00,
    cmed_preco_teto_max: 14.50
  },
  "BR700800900": {
    codigo_br: "BR700800900",
    nome_catmat: "Vacina Hepatite B Recombinante 10mcg/0.5mL Susp Inj",
    bps_preco_sus_ref: 45.00,
    cmed_preco_teto_max: 58.00
  }
};

export async function POST(req: NextRequest) {
  try {
    const payload: ValidacaoPrecoRequest = await req.json();

    if (!payload.nome_medicamento || payload.preco_fornecedor_unitario === undefined || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar nome_medicamento, preco_fornecedor_unitario e tenant_id." },
        { status: 400 }
      );
    }

    const codigoBr = payload.codigo_br || "BR100200300";
    const refOficial = BASE_GOVERNAMENTAL_MOCK[codigoBr];

    if (!refOficial) {
      return NextResponse.json({
        status: "NOT_FOUND",
        motivo: `Medicamento/Código BR ${codigoBr} não localizado na tabela CATMAT/CMED vigente.`,
        recomendacao: "PESQUISA_MANUAL_REQUERIDA",
        supplier_price: payload.preco_fornecedor_unitario,
        audit_log_id: `AUDIT-CMED-${Date.now()}`
      }, { status: 404 });
    }

    const precoFornecedor = payload.preco_fornecedor_unitario;
    const cmedTeto = refOficial.cmed_preco_teto_max;
    const bpsRef = refOficial.bps_preco_sus_ref;

    const divVsCmed = Number((((precoFornecedor - cmedTeto) / cmedTeto) * 100).toFixed(2));
    const divVsBps = Number((((precoFornecedor - bpsRef) / bpsRef) * 100).toFixed(2));

    let statusValidacao: "OK" | "WARNING" | "ILLEGAL" = "OK";
    let recomendacao = "APROVAR_COMPRA";
    let motivo = `Preço R$ ${precoFornecedor.toFixed(2)} dentro dos limites legais (Teto CMED R$ ${cmedTeto.toFixed(2)}).`;

    if (precoFornecedor > cmedTeto) {
      statusValidacao = "ILLEGAL";
      recomendacao = "BLOQUEAR_COMPRA_SOBREPRECO";
      motivo = `VIOLAÇÃO LEGAL: Preço R$ ${precoFornecedor.toFixed(2)} excede o Teto Máximo CMED/ANVISA R$ ${cmedTeto.toFixed(2)} em ${divVsCmed}%.`;
    } else if (precoFornecedor > bpsRef) {
      statusValidacao = "WARNING";
      recomendacao = "ALERTA_NEGOCIACAO_BPS";
      motivo = `Preço R$ ${precoFornecedor.toFixed(2)} acima da referência SUS BPS R$ ${bpsRef.toFixed(2)} (+${divVsBps}%), porém dentro do teto CMED.`;
    }

    const auditLogId = `AUDIT-CMED-${Date.now()}`;

    return NextResponse.json({
      status: statusValidacao,
      codigo_br: codigoBr,
      nome_catmat: refOficial.nome_catmat,
      precos: {
        preco_fornecedor: precoFornecedor,
        bps_preco_sus_ref: bpsRef,
        cmed_preco_teto_max: cmedTeto,
        divergencia_bps_pct: divVsBps,
        divergencia_cmed_pct: divVsCmed
      },
      validacao: {
        status: statusValidacao,
        motivo,
        recomendacao
      },
      versoes_tabelas: {
        catmat_version: "2026_04_24",
        bps_version: "2026_04_24",
        cmed_version: "2026_04_24"
      },
      audit_log_id: auditLogId,
      timestamp: new Date().toISOString()
    }, { status: statusValidacao === "ILLEGAL" ? 422 : 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao validar preço na base CMED/BPS", detalhes: error.message },
      { status: 500 }
    );
  }
}
