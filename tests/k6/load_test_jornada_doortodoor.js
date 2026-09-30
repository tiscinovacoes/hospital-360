import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 20 },   // Ramp-up
    { duration: '30s', target: 100 },  // 100 VUs em leitura concorrente
    { duration: '15s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<150', 'p(99)<250', 'avg<80'],
    http_req_failed: ['rate<0.001'],
  },
};

const POOL_CPFS = [
  '123.456.789-00',
  '987.654.321-99',
  '111.222.333-44',
  '555.666.777-88',
  '999.888.777-66'
];

export default function () {
  const cpf = POOL_CPFS[Math.floor(Math.random() * POOL_CPFS.length)];
  const url = `http://localhost:3000/api/v1/jornada-doortodoor?cpf=${encodeURIComponent(cpf)}`;

  const params = {
    headers: {
      'Accept': 'application/json',
      'X-Tenant-Id': 'hospital_360_default'
    }
  };

  const res = http.get(url, params);

  check(res, {
    'Status é 200 (OK)': (r) => r.status === 200,
    'Contém consolidado de custos': (r) => r.json('data') !== undefined || r.json('paciente') !== undefined,
    'Tempo de resposta < 150ms': (r) => r.timings.duration < 150,
  });

  sleep(0.1);
}
