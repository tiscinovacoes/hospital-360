import { NextRequest, NextResponse } from "next/server";
import { FintechGatewayClient } from "@/lib/fintechGatewayClient";

export interface RegraSplit {
  recebedor_id: string;
  papel: "HOSPITAL" | "MEDICO" | "LABORATORIO" | "PLATAFORMA";
  percentual: number;
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

    const resultadoGateway = FintechGatewayClient.processarTransacaoSplit({
      transacaoId: payload.transacao_id,
      valorTotal: payload.valor_total,
      metodoPagamento: payload.metodo_pagamento,
      rules: payload.regras_split.map(r => ({
        recipient_id: r.recebedor_id,
        role: r.papel,
        percentage: r.percentual
      }))
    });

    return NextResponse.json({
      status: "SPLIT_PROCESSADO",
      gateway_transacao_id: resultadoGateway.gateway_transaction_id,
      transacao_id: payload.transacao_id,
      tenant_id: payload.tenant_id,
      valor_total: payload.valor_total,
      metodo_pagamento: payload.metodo_pagamento,
      settlement_date: resultadoGateway.settlement_date,
      splits: resultadoGateway.splits.map(s => ({
        recebedor_id: s.recipient_id,
        papel: s.role,
        percentual: s.percentage,
        valor_calculado: s.amount_formatted
      })),
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao processar split no gateway de pagamento", detalhes: error.message },
      { status: 500 }
    );
  }
}
