import { NextRequest, NextResponse } from "next/server";

export interface RegraSplit {
  recebedor_id: string; // ex: "CNPJ_HOSPITAL", "CPF_MEDICO_991823"
  papel: "HOSPITAL" | "MEDICO" | "LABORATORIO" | "PLATAFORMA";
  percentual: number; // ex: 60.0, 30.0, 10.0
  valor_calculado?: number;
}

export interface TransacaoSplitPayload {
  transacao_id: string;
  atendimento_id: string;
  paciente_nome: string;
  valor_total: number;
  metodo_pagamento: "CARTAO_CREDITO" | "PIX" | "BOLETO" | "CONVENIO";
  regras_split: RegraSplit[];
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: TransacaoSplitPayload = await req.json();

    if (!payload.transacao_id || !payload.valor_total || !payload.regras_split?.length || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar transacao_id, valor_total, regras_split e tenant_id." },
        { status: 400 }
      );
    }

    const valorTotal = payload.valor_total;
    const somaPercentuais = payload.regras_split.reduce((acc, r) => acc + r.percentual, 0);

    if (Math.abs(somaPercentuais - 100) > 0.01) {
      return NextResponse.json(
        { erro: `A soma dos percentuais de split deve ser exatamente 100%. Soma informada: ${somaPercentuais}%` },
        { status: 422 }
      );
    }

    const splitsCalculados = payload.regras_split.map(r => ({
      recebedor_id: r.recebedor_id,
      papel: r.papel,
      percentual: r.percentual,
      valor_calculado: Number(((r.percentual / 100) * valorTotal).toFixed(2))
    }));

    return NextResponse.json({
      status: "SPLIT_PROCESSADO",
      transacao_id: payload.transacao_id,
      tenant_id: payload.tenant_id,
      valor_total: valorTotal,
      metodo_pagamento: payload.metodo_pagamento,
      splits: splitsCalculados,
      gateway_transacao_id: `GW-SPLIT-${Date.now()}`,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao processar split de pagamento fintech", detalhes: error.message },
      { status: 500 }
    );
  }
}
