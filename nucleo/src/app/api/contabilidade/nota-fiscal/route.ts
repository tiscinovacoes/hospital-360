import { NextRequest, NextResponse } from "next/server";

export interface EmissaoNFSePayload {
  atendimento_id: string;
  tomador_cpf_cnpj: string;
  tomador_nome: string;
  tomador_email?: string;
  descricao_servicos: string;
  valor_servico: number;
  aliquota_iss_pct?: number; // padrão 2.0% a 5.0%
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: EmissaoNFSePayload = await req.json();

    if (!payload.atendimento_id || !payload.tomador_cpf_cnpj || !payload.valor_servico || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar atendimento_id, tomador_cpf_cnpj, valor_servico e tenant_id." },
        { status: 400 }
      );
    }

    const valorServico = payload.valor_servico;
    const aliquotaIss = payload.aliquota_iss_pct || 2.0;

    // Cálculo de Impostos Retidos
    const valorIss = Number(((aliquotaIss / 100) * valorServico).toFixed(2));
    const valorPis = Number((0.0065 * valorServico).toFixed(2)); // 0.65%
    const valorCofins = Number((0.03 * valorServico).toFixed(2)); // 3.00%
    const valorIrrf = Number((0.015 * valorServico).toFixed(2)); // 1.50%

    const totalImpostos = Number((valorIss + valorPis + valorCofins + valorIrrf).toFixed(2));
    const valorLiquido = Number((valorServico - totalImpostos).toFixed(2));

    const numeroNfse = Math.floor(100000 + Math.random() * 900000);

    return NextResponse.json({
      status: "NFSE_EMITIDA",
      numero_nfse: `${numeroNfse}`,
      codigo_verificacao: `NFSE-${Date.now()}-AUTH`,
      atendimento_id: payload.atendimento_id,
      tenant_id: payload.tenant_id,
      tomador: {
        cpf_cnpj: payload.tomador_cpf_cnpj,
        nome: payload.tomador_nome
      },
      valores: {
        valor_bruto: valorServico,
        iss: valorIss,
        pis: valorPis,
        cofins: valorCofins,
        irrf: valorIrrf,
        total_impostos: totalImpostos,
        valor_liquido: valorLiquido
      },
      url_pdf_nfse: `http://localhost:3000/api/contabilidade/nfse/${numeroNfse}.pdf`,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao emitir Nota Fiscal Eletrônica de Serviços", detalhes: error.message },
      { status: 500 }
    );
  }
}
