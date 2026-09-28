import { POST as DispatchPOST } from '../app/api/automacao/n8n-dispatch/route';
import { POST as IaPOST } from '../app/api/ia/diagnostico-auxiliar/route';
import { POST as WhatsappPOST } from '../app/api/mensageria/whatsapp/route';
import { NextRequest } from 'next/server';

export async function executarSuiteDeTestesSquad7() {
  const resultados: Array<{ teste: string; status: 'PASS' | 'FAIL'; detalhe?: string }> = [];

  // Teste 1: Disparo de Evento Central n8n
  try {
    const req1 = new NextRequest("http://localhost:3000/api/automacao/n8n-dispatch", {
      method: "POST",
      body: JSON.stringify({
        evento: "senaite.exame_concluido",
        origem_modulo: "02-modulo-laboratorio",
        dados: { workorder_id: "WO-9912", status: "APROVADO" },
        tenant_id: "hospital_360_default"
      })
    });
    const res1 = await DispatchPOST(req1);
    const data1 = await res1.json();
    if (res1.status === 200 && data1.status === "EVENTO_PROCESSADO") {
      resultados.push({ teste: "Disparo Central de Workflow n8n", status: "PASS" });
    } else {
      resultados.push({ teste: "Disparo Central de Workflow n8n", status: "FAIL", detalhe: JSON.stringify(data1) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Disparo Central de Workflow n8n", status: "FAIL", detalhe: err.message });
  }

  // Teste 2: Apoio à Decisão Clínica por IA Diagnóstica
  try {
    const req2 = new NextRequest("http://localhost:3000/api/ia/diagnostico-auxiliar", {
      method: "POST",
      body: JSON.stringify({
        sintomas_relatados: ["Dor torácica intensa", "Sudorese"],
        sinais_vitais: { pressao_arterial: "140/90", frequencia_cardiaca: 110 },
        tenant_id: "hospital_360_default"
      })
    });
    const res2 = await IaPOST(req2);
    const data2 = await res2.json();
    if (res2.status === 200 && data2.sugestao_clinica.nivel_prioridade_sugerido === "VERMELHO") {
      resultados.push({ teste: "Apoio Diagnóstico IA (Dor Torácica / Vermelho)", status: "PASS" });
    } else {
      resultados.push({ teste: "Apoio Diagnóstico IA (Dor Torácica / Vermelho)", status: "FAIL", detalhe: JSON.stringify(data2) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Apoio Diagnóstico IA (Dor Torácica / Vermelho)", status: "FAIL", detalhe: err.message });
  }

  // Teste 3: Disparo de Mensagem WhatsApp Omnichannel
  try {
    const req3 = new NextRequest("http://localhost:3000/api/mensageria/whatsapp", {
      method: "POST",
      body: JSON.stringify({
        telefone_destino: "+5511999998888",
        paciente_nome: "Carlos Eduardo Silva",
        mensagem: "Seu laudo de exame de sangue está disponível no portal Hospital 360.",
        tenant_id: "hospital_360_default"
      })
    });
    const res3 = await WhatsappPOST(req3);
    const data3 = await res3.json();
    if (res3.status === 200 && data3.status === "MENSAGEM_ENVIADA") {
      resultados.push({ teste: "Disparo Mensageria WhatsApp", status: "PASS" });
    } else {
      resultados.push({ teste: "Disparo Mensageria WhatsApp", status: "FAIL", detalhe: JSON.stringify(data3) });
    }
  } catch (err: any) {
    resultados.push({ teste: "Disparo Mensageria WhatsApp", status: "FAIL", detalhe: err.message });
  }

  return resultados;
}
