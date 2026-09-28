import { POST as SplitPOST } from '../app/api/fintech/split/route';
import { POST as NfsePOST } from '../app/api/contabilidade/nota-fiscal/route';
import { POST as TfdPOST } from '../app/api/regulacao/tfd/route';
import { NextRequest } from 'next/server';

export async function executarSuiteDeTestesSquad6() {
  const resultados: Array<{ teste: string; status: 'PASS' | 'FAIL'; detalhe?: string }> = [];

  // Teste 1: Split de Pagamentos Fintech (Hospital 60%, Médico 30%, Laboratório 10%)
  try {
    const req1 = new NextRequest("http://localhost:3000/api/fintech/split", {
      method: "POST",
      body: JSON.stringify({
        transacao_id: "TRX-FIN-9921",
        atendimento_id: "ATD-7711",
        paciente_nome: "Carlos Eduardo Silva",
        valor_total: 1000.00,
        metodo_pagamento: "CARTAO_CREDITO",
        tenant_id: "hospital_360_default",
        regras_split: [
          { recebedor_id: "CNPJ-HOSPITAL", papel: "HOSPITAL", percentual: 60.0 },
          { recebedor_id: "CPF-MEDICO", papel: "MEDICO", percentual: 30.0 },
          { recebedor_id: "CNPJ-LAB", papel: "LABORATORIO", percentual: 10.0 }
        ]
      })
    });
    const res1 = await SplitPOST(req1);
    const data1 = await res1.json();
    if (res1.status === 200 && data1.splits[0].valor_calculado === 600.00) {
      resultados.push({ teste: "Split de Pagamento Fintech (100%)", status: "PASS" });
    } else {
      resultados.push({ teste: "Split de Pagamento Fintech (100%)", status: "FAIL", detalhe: JSON.stringify(data1) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Split de Pagamento Fintech (100%)", status: "FAIL", detalhe: err.message });
  }

  // Teste 2: Emissão de NFSe com Apuração de Impostos Retidos
  try {
    const req2 = new NextRequest("http://localhost:3000/api/contabilidade/nota-fiscal", {
      method: "POST",
      body: JSON.stringify({
        atendimento_id: "ATD-7711",
        tomador_cpf_cnpj: "123.456.789-00",
        tomador_nome: "Carlos Eduardo Silva",
        descricao_servicos: "Atendimento Médico Intensivo e Diária UTI",
        valor_servico: 2000.00,
        aliquota_iss_pct: 2.0,
        tenant_id: "hospital_360_default"
      })
    });
    const res2 = await NfsePOST(req2);
    const data2 = await res2.json();
    if (res2.status === 200 && data2.status === "NFSE_EMITIDA" && data2.valores.iss === 40.00) {
      resultados.push({ teste: "Emissão NFSe & Impostos Retidos", status: "PASS" });
    } else {
      resultados.push({ teste: "Emissão NFSe & Impostos Retidos", status: "FAIL", detalhe: JSON.stringify(data2) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Emissão NFSe & Impostos Retidos", status: "FAIL", detalhe: err.message });
  }

  // Teste 3: Regulação & Autorização de TFD
  try {
    const req3 = new NextRequest("http://localhost:3000/api/regulacao/tfd", {
      method: "POST",
      body: JSON.stringify({
        paciente_cpf: "123.456.789-00",
        paciente_nome: "Carlos Eduardo Silva",
        municipio_origem: "Sorocaba",
        municipio_destino: "São Paulo",
        hospital_destino: "Hospital das Clínicas",
        diagnostico_cid10: "I21.9",
        tipo_transporte: "AMBULANCIA_UTI",
        necessita_acompanhante: true,
        tenant_id: "hospital_360_default"
      })
    });
    const res3 = await TfdPOST(req3);
    const data3 = await res3.json();
    if (res3.status === 200 && data3.status === "TFD_DEFERIDO_AUTORIZADO") {
      resultados.push({ teste: "Autorização de Regulação & TFD", status: "PASS" });
    } else {
      resultados.push({ teste: "Autorização de Regulação & TFD", status: "FAIL", detalhe: JSON.stringify(data3) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Autorização de Regulação & TFD", status: "FAIL", detalhe: err.message });
  }

  return resultados;
}
