import { GET as CensoGET, POST as CensoPOST } from '../app/api/leitos/censo/route';
import { POST as FacilitiesPOST } from '../app/api/facilities/ordem-servico/route';
import { POST as EscalaPOST } from '../app/api/escala/plantao/route';
import { NextRequest } from 'next/server';

export async function executarSuiteDeTestesSquad5() {
  const resultados: Array<{ teste: string; status: 'PASS' | 'FAIL'; detalhe?: string }> = [];

  // Teste 1: Censo de Leitos NIR
  try {
    const req1 = new NextRequest("http://localhost:3000/api/leitos/censo?tenant_id=hospital_360_default", { method: "GET" });
    const res1 = await CensoGET(req1);
    const data1 = await res1.json();
    if (res1.status === 200 && data1.censo.total_leitos > 0) {
      resultados.push({ teste: "Censo Hospitalar NIR", status: "PASS" });
    } else {
      resultados.push({ teste: "Censo Hospitalar NIR", status: "FAIL", detalhe: JSON.stringify(data1) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Censo Hospitalar NIR", status: "FAIL", detalhe: err.message });
  }

  // Teste 2: Alta de Paciente & Solicitação de Higienização
  try {
    const req2 = new NextRequest("http://localhost:3000/api/leitos/censo", {
      method: "POST",
      body: JSON.stringify({
        acao: "ALTA_SOLICITAR_HIGIENIZACAO",
        leito_id: "LET-101",
        paciente_cpf: "123.456.789-00",
        paciente_nome: "Carlos Eduardo Silva",
        tenant_id: "hospital_360_default"
      })
    });
    const res2 = await CensoPOST(req2);
    const data2 = await res2.json();
    if (res2.status === 200 && data2.status === "HIGIENIZACAO_SOLICITADA") {
      resultados.push({ teste: "Alta & Transição para Higienização", status: "PASS" });
    } else {
      resultados.push({ teste: "Alta & Transição para Higienização", status: "FAIL", detalhe: JSON.stringify(data2) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Alta & Transição para Higienização", status: "FAIL", detalhe: err.message });
  }

  // Teste 3: Higienização Terminal de Leito (Facilities)
  try {
    const req3 = new NextRequest("http://localhost:3000/api/facilities/ordem-servico", {
      method: "POST",
      body: JSON.stringify({
        ordem_id: "OS-FAC-9912",
        leito_id: "LET-101",
        codigo_leito: "101-A",
        unidade_ala: "UTI Adulto",
        equipe_higienizacao: "Equipe Noturna A",
        tipo_limpeza: "TERMINAL",
        status: "SOLICITADA",
        tenant_id: "hospital_360_default"
      })
    });
    const res3 = await FacilitiesPOST(req3);
    const data3 = await res3.json();
    if (res3.status === 200 && data3.status_leito_novo === "LIVRE") {
      resultados.push({ teste: "Conclusão Higienização Facilities", status: "PASS" });
    } else {
      resultados.push({ teste: "Conclusão Higienização Facilities", status: "FAIL", detalhe: JSON.stringify(data3) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Conclusão Higienização Facilities", status: "FAIL", detalhe: err.message });
  }

  // Teste 4: Rateio de Plantão Médico por Paciente-Dia
  try {
    const req4 = new NextRequest("http://localhost:3000/api/escala/plantao", {
      method: "POST",
      body: JSON.stringify({
        plantao_id: "PLT-2026-881",
        medico_crm: "CRM/SP 142981",
        medico_nome: "Dr. Roberto Albuquerque",
        especialidade: "Intensivista",
        unidade_ala: "UTI Adulto",
        duracao_horas: 12,
        valor_plantao: 1200.00,
        pacientes_atendidos_cpfs: ["123.456.789-00", "987.654.321-11"],
        tenant_id: "hospital_360_default"
      })
    });
    const res4 = await EscalaPOST(req4);
    const data4 = await res4.json();
    if (res4.status === 200 && data4.status === "PLANTAO_ALOCADO_RATEADO") {
      resultados.push({ teste: "Rateio de Honorário Médico", status: "PASS" });
    } else {
      resultados.push({ teste: "Rateio de Honorário Médico", status: "FAIL", detalhe: JSON.stringify(data4) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Rateio de Honorário Médico", status: "FAIL", detalhe: err.message });
  }

  return resultados;
}
