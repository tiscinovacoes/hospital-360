import { POST as PrescricaoPOST } from '../app/api/openboxes/prescricao/route';
import { POST as ValidarCMEDPOST } from '../app/api/cmed/validar/route';
import { POST as TelemetriaPOST } from '../app/api/openboxes/alerta-temperatura-estoque/route';
import { POST as DispensacaoPOST } from '../app/api/openboxes/disparo-dispensacao/route';
import { GET as StandaloneGET } from '../app/api/openboxes/standalone/route';
import { NextRequest } from 'next/server';

export async function executarSuiteDeTestesSquad4() {
  const resultados: Array<{ teste: string; status: 'PASS' | 'FAIL'; detalhe?: string }> = [];

  // Teste 1: FEFO Prescription Allocation
  try {
    const req1 = new NextRequest("http://localhost:3000/api/openboxes/prescricao", {
      method: "POST",
      body: JSON.stringify({
        prescricao_id: "RX-2026-9912",
        atendimento_id: "ATD-7711",
        paciente_id: "PAC-3312",
        paciente_nome: "Carlos Eduardo Silva",
        medico_crm: "CRM/SP 991823",
        tenant_id: "hospital_360_default",
        itens: [
          {
            medicamento_id: "MED-001",
            codigo_br: "BR100200300",
            nome_medicamento: "Dipirona Sódica 500mg/mL Solução Injetável",
            quantidade_solicitada: 10,
            unidade_medida: "AMP"
          }
        ]
      })
    });
    const res1 = await PrescricaoPOST(req1);
    const data1 = await res1.json();
    if (res1.status === 200 && data1.status === "RESERVADO_FEFO") {
      resultados.push({ teste: "Prescrição com Alocação FEFO", status: "PASS" });
    } else {
      resultados.push({ teste: "Prescrição com Alocação FEFO", status: "FAIL", detalhe: JSON.stringify(data1) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Prescrição com Alocação FEFO", status: "FAIL", detalhe: err.message });
  }

  // Teste 2: CMED Overprice Trava (ILLEGAL status when supplier price > CMED ceiling)
  try {
    const req2 = new NextRequest("http://localhost:3000/api/cmed/validar", {
      method: "POST",
      body: JSON.stringify({
        codigo_br: "BR100200300",
        nome_medicamento: "Dipirona Sódica 500mg/mL Solução Injetável 2mL",
        preco_fornecedor_unitario: 5.50, // CMED teto é 2.10
        quantidade: 1000,
        fornecedor_cnpj: "12.345.678/0001-90",
        tenant_id: "hospital_360_default"
      })
    });
    const res2 = await ValidarCMEDPOST(req2);
    const data2 = await res2.json();
    if (res2.status === 422 && data2.status === "ILLEGAL") {
      resultados.push({ teste: "Trava de Sobrepreço CMED (ILLEGAL)", status: "PASS" });
    } else {
      resultados.push({ teste: "Trava de Sobrepreço CMED (ILLEGAL)", status: "FAIL", detalhe: JSON.stringify(data2) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Trava de Sobrepreço CMED (ILLEGAL)", status: "FAIL", detalhe: err.message });
  }

  // Teste 3: Cold Chain Temperature Alert
  try {
    const req3 = new NextRequest("http://localhost:3000/api/openboxes/alerta-temperatura-estoque", {
      method: "POST",
      body: JSON.stringify({
        sensor_id: "SNS-GELADEIRA-VACINAS-01",
        localizacao: "Farmácia Central - Câmara Fria 02",
        temperatura_atual_c: 11.5,
        temperatura_min_permitida_c: 2.0,
        temperatura_max_permitida_c: 8.0,
        tenant_id: "hospital_360_default"
      })
    });
    const res3 = await TelemetriaPOST(req3);
    const data3 = await res3.json();
    if (res3.status === 422 && data3.status === "ALERTA_TEMPERATURA_DISPARADO") {
      resultados.push({ teste: "Alerta Crítico de Cadeia de Frio", status: "PASS" });
    } else {
      resultados.push({ teste: "Alerta Crítico de Cadeia de Frio", status: "FAIL", detalhe: JSON.stringify(data3) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Alerta Crítico de Cadeia de Frio", status: "FAIL", detalhe: err.message });
  }

  // Teste 4: Prescription fulfillment dispatch and cost reporting
  try {
    const req4 = new NextRequest("http://localhost:3000/api/openboxes/disparo-dispensacao", {
      method: "POST",
      body: JSON.stringify({
        dispensacao_id: "DSP-88219",
        prescricao_id: "RX-2026-9912",
        atendimento_id: "ATD-7711",
        paciente_id: "PAC-3312",
        paciente_nome: "Carlos Eduardo Silva",
        leito_unidade: "Leito 402 - Bloco B",
        farmaceutico_crf: "CRF/SP 44910",
        tenant_id: "hospital_360_default",
        itens_dispensados: [
          {
            codigo_br: "BR100200300",
            nome_medicamento: "Dipirona Sódica 500mg/mL",
            numero_lote: "DIP2026B",
            quantidade_dispensada: 10,
            custo_unitario_aquisicao: 1.80,
            custo_total_item: 18.00
          }
        ]
      })
    });
    const res4 = await DispensacaoPOST(req4);
    const data4 = await res4.json();
    if (res4.status === 200 && data4.custo_total_insumos === 18.00) {
      resultados.push({ teste: "Disparo Baixa & Hub Despesa Insumos", status: "PASS" });
    } else {
      resultados.push({ teste: "Disparo Baixa & Hub Despesa Insumos", status: "FAIL", detalhe: JSON.stringify(data4) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Disparo Baixa & Hub Despesa Insumos", status: "FAIL", detalhe: err.message });
  }

  // Teste 5: Standalone API authentication
  try {
    const req5 = new NextRequest("http://localhost:3000/api/openboxes/standalone", {
      method: "GET",
      headers: {
        "x-api-key": "hospital360_farmacia_fefo_secret_key"
      }
    });
    const res5 = await StandaloneGET(req5);
    const data5 = await res5.json();
    if (res5.status === 200 && data5.status === "STANDALONE_READY") {
      resultados.push({ teste: "API Standalone Autêntica", status: "PASS" });
    } else {
      resultados.push({ teste: "API Standalone Autêntica", status: "FAIL", detalhe: JSON.stringify(data5) });
    }
  } catch (err: any) {
    resultados.push({ teste: "API Standalone Autêntica", status: "FAIL", detalhe: err.message });
  }

  return resultados;
}
