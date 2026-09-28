import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 30 },
    { duration: '1m', target: 150 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<150'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const urlPrescricao = 'http://localhost:3000/api/openboxes/prescricao';
  const payloadPrescricao = JSON.stringify({
    prescricao_id: `RX-K6-${Math.floor(Date.now() + Math.random() * 1000)}`,
    atendimento_id: `ATD-K6-${Math.floor(Math.random() * 9000)}`,
    paciente_id: `PAC-K6-${Math.floor(Math.random() * 9000)}`,
    paciente_nome: 'Paciente K6 FEFO',
    medico_crm: 'CRM/SP 991823',
    tenant_id: 'hospital_360_default',
    itens: [
      {
        medicamento_id: 'MED-001',
        codigo_br: 'BR100200300',
        nome_medicamento: 'Dipirona Sódica 500mg/mL Solução Injetável',
        quantidade_solicitada: 2,
        unidade_medida: 'AMP'
      }
    ]
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  const resPrescricao = http.post(urlPrescricao, payloadPrescricao, params);

  check(resPrescricao, {
    'Status é 200 (OK)': (r) => r.status === 200,
    'Reservado FEFO': (r) => r.json('status') === 'RESERVADO_FEFO',
  });

  sleep(0.5);
}
