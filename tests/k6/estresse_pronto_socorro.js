import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up para 50 VUs (Usuários Virtuais)
    { duration: '1m', target: 200 },   // Pico de estresse de 200 VUs simultâneos
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% das requisições devem responder em menos de 200ms
    http_req_failed: ['rate<0.01'],   // Menos de 1% de erros 5xx
  },
};

export default function () {
  const url = 'http://localhost:3000/api/openemr/triagem';
  const payload = JSON.stringify({
    paciente_cpf: `123.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}-00`,
    paciente_nome: `Paciente K6 Estresse ${Math.floor(Math.random() * 10000)}`,
    sinais_vitais: {
      pressao_arterial: '130/85',
      frequencia_cardiaca: 105,
      temperatura_c: 38.2,
      saturacao_oxigenio_pct: 96
    },
    queixa_principal: 'Febre e dor de cabeça intensa',
    tenant_id: 'hospital_360_default'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'Status é 201 (Created)': (r) => r.status === 201,
    'Triagem registrada': (r) => r.json('status') === 'TRIAGEM_REGISTRADA_OPENEMR',
  });

  sleep(0.5);
}
