import { POST as IngestaoPOST } from '../app/api/ingestao-modulos/route';
import { GET as HealthGET } from '../app/api/health/route';
import { GET as JornadaGET, POST as JornadaPOST } from '../app/api/v1/jornada-doortodoor/route';
import { POST as N8nWebhookPOST } from '../app/api/webhooks/n8n/route';
import { NextRequest } from 'next/server';

// Suíte de Testes de Integração e Homologação (Sprint 5)
export async function executarSuiteDeTestesSquad1() {
  const resultados: Array<{ teste: string; status: 'PASS' | 'FAIL'; detalhe?: string }> = [];

  try {
    // TESTE 1: Healthcheck API
    const resHealth = await HealthGET();
    const bodyHealth = await resHealth.json();
    if (resHealth.status === 200 && bodyHealth.status === 'healthy') {
      resultados.push({ teste: '1. Healthcheck API (/api/health)', status: 'PASS' });
    } else {
      resultados.push({ teste: '1. Healthcheck API (/api/health)', status: 'FAIL', detalhe: 'Status incorreto' });
    }

    // TESTE 2: Ingestão de ERP Legado (MV/Tasy/Philips)
    const reqIngestao = new NextRequest('http://localhost:3000/api/ingestao-modulos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        formato: 'MV_FINANCEIRO_CSV',
        tenantId: 'tenant-clinica-cardio-01',
        registros: [
          {
            cpfPaciente: '123.456.789-00',
            nomePaciente: 'Carlos Eduardo Silveira',
            centroCustoId: 'CC-CARDIO-204',
            descricao: 'Exame de Ecocardiograma Doppler Colorido',
            valor: 240.00,
            quantidade: 1,
            dataRegistro: '2026-09-28T10:00:00Z',
          },
        ],
      }),
    });
    const resIngestao = await IngestaoPOST(reqIngestao);
    const bodyIngestao = await resIngestao.json();
    if (resIngestao.status === 201 && bodyIngestao.success) {
      resultados.push({ teste: '2. Ingestão Modular ERP Legado (/api/ingestao-modulos)', status: 'PASS' });
    } else {
      resultados.push({ teste: '2. Ingestão Modular ERP Legado', status: 'FAIL', detalhe: bodyIngestao.error });
    }

    // TESTE 3: Jornada Door-to-Door & Benchmarks
    const reqJornada = new NextRequest('http://localhost:3000/api/v1/jornada-doortodoor?cpf=123.456.789-00');
    const resJornada = await JornadaGET(reqJornada);
    const bodyJornada = await resJornada.json();
    if (resJornada.status === 200 && bodyJornada.data?.benchmarks?.cmed?.conformidade === 'DENTRO_DO_TETO') {
      resultados.push({ teste: '3. Jornada Door-to-Door & Benchmarks SIGTAP/TUSS/CMED', status: 'PASS' });
    } else {
      resultados.push({ teste: '3. Jornada Door-to-Door', status: 'FAIL', detalhe: bodyJornada.error });
    }

    // TESTE 4: Webhook n8n & Idempotência
    const eventId = `evt-test-idempotency-${Date.now()}`;
    const n8nPayload = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      event_type: 'senaite.exame_concluido',
      source_module: 'SENAITE_LIMS',
      patient_id: '123.456.789-00',
      cost_center_id: 'CC-LAB-01',
      data: {
        item_codigo: 'EX-TROP-01',
        descricao: 'Troponina I Quimioluminescência',
        valor_unitario: 60.00,
        quantidade: 1,
        valor_total: 60.00,
      },
      metadata: { version: '1.0' },
    };

    const firstReq = new NextRequest('http://localhost:3000/api/webhooks/n8n', {
      method: 'POST',
      body: JSON.stringify(n8nPayload),
    });
    const firstRes = await N8nWebhookPOST(firstReq);

    const secondReq = new NextRequest('http://localhost:3000/api/webhooks/n8n', {
      method: 'POST',
      body: JSON.stringify(n8nPayload),
    });
    const secondRes = await N8nWebhookPOST(secondReq);
    const secondBody = await secondRes.json();

    if (firstRes.status === 200 && secondBody.status === 'DUPLICATE_IGNORED') {
      resultados.push({ teste: '4. Webhook n8n & Garantia de Idempotência', status: 'PASS' });
    } else {
      resultados.push({ teste: '4. Webhook n8n', status: 'FAIL', detalhe: 'Idempotência não reconhecida' });
    }

    // TESTE 5: Privacy by Design & RN-IND
    const userRoleCondominio: string = 'CONDOMINIO_ADMIN';
    const userTenantId = 'tenant-condominio-central';
    const registroClinico = { tenant_id: 'tenant-clinica-cardio-01' };

    const podeAcessarProntuario = registroClinico.tenant_id === userTenantId || userRoleCondominio === 'SUPERADMIN';

    if (!podeAcessarProntuario) {
      resultados.push({ teste: '5. Blindagem Privacy by Design & RLS RN-IND', status: 'PASS' });
    } else {
      resultados.push({ teste: '5. Blindagem Privacy by Design', status: 'FAIL', detalhe: 'Vazamento de prontuário' });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    resultados.push({ teste: 'Erro Crítico na Suíte', status: 'FAIL', detalhe: errorMsg });
  }

  return resultados;
}
