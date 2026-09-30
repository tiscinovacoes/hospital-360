import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 20 },   // Ramp-up
    { duration: '30s', target: 100 },  // 100 VUs de carga sustentada
    { duration: '15s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<350', 'avg<100'],
    http_req_failed: ['rate<0.001'],
  },
};

const ESTACOES = [1, 2, 3, 4, 5];
const MODULOS = ['GESTAO_CLINICA', 'LABORATORIO_LIMS', 'ESTOQUE_CENTRAL', 'FARMACIA_HOSPITALAR', 'LEITOS_CENSO_NIR'];

export default function () {
  const url = 'http://localhost:3000/api/hub/despesas/ingestao';
  const estacao = ESTACOES[Math.floor(Math.random() * ESTACOES.length)];
  const modulo = MODULOS[Math.floor(Math.random() * MODULOS.length)];
  const vuId = __VU;
  const iterId = __ITER;

  const payload = JSON.stringify({
    origem_modulo: modulo,
    cliente_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    lote_exportacao_id: `LOTE-K6-${vuId}-${iterId}`,
    data_geracao: new Date().toISOString(),
    despesas: [
      {
        id_transacao: `TX-K6-${vuId}-${iterId}-${Date.now()}`,
        paciente_cpf: `123.456.${String(vuId).padStart(3, '0')}-00`,
        paciente_nome: `Paciente Teste Carga VU-${vuId}`,
        prontuario_episodio: `EPIS-K6-${vuId}`,
        centro_custo: 'CC-CENTRAL-K6',
        item_codigo: `ITEM-K6-${estacao}`,
        item_descricao: `Item Hospitalar Teste Carga Estacao ${estacao}`,
        quantidade: 1,
        unidade_medida: 'UN',
        valor_unitario_medio: 45.50,
        valor_total_imputado: 45.50,
        data_consumo: new Date().toISOString(),
        estacao_jornada: estacao
      }
    ]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': 'hospital_360_default'
    }
  };

  const res = http.post(url, payload, params);

  check(res, {
    'Status é 200 ou 201': (r) => r.status === 200 || r.status === 201,
    'Contém protocolo de ingestão': (r) => r.json('protocolo') !== undefined || r.json('success') === true,
  });

  sleep(0.1);
}
