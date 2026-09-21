/**
 * Vigia RH — Suíte de Testes Automatizados (Sprint 5 / OS-01)
 */

import assert from 'node:assert/strict';
import { Servidor } from '../src/modules/rh/rhModel.js';
import { RHImporter } from '../src/modules/rh/rhImporter.js';
import { CustoContractStub, MOCK_CENTROS_CUSTO } from '../src/contracts/custoContractStub.js';

console.log('🧪 Iniciando testes unitários do Vigia RH (Sprint 5 / OS-01)...\n');

async function run() {
  // --- TESTE 1: Cálculo de Custo/Hora de Servidor ---
  console.log('Test 1: Cálculo de Custo/Hora de Servidor');
  const medico = new Servidor({
    nome: 'Dr. Roberto Mello',
    cpf: '111.222.333-44',
    matricula: 'MAT-9901',
    cargo: 'Médico Clínico',
    vinculo: 'EFETIVO',
    carga_horaria_semanal: 40,
    salario_base: 10000,
    encargos_percentual: 20,
    beneficios_valor: 1000,
    alocacoes_centros_custo: [
      { centro_custo_id: 'CC-04', percentual: 100 }
    ]
  });

  const horasMensais = medico.getHorasMensais();
  assert.equal(horasMensais, 173.3, 'Horas mensais devem ser 173.3');

  const custoTotal = medico.getCustoTotalMensal();
  assert.equal(custoTotal, 13000.00, 'Custo total mensal deve ser R$ 13.000,00');

  const custoHora = medico.getCustoHora();
  assert.equal(custoHora, 75.01, 'Custo/Hora deve ser ~R$ 75,01');
  console.log('✅ Teste 1 passou: Custo total mensal R$ 13.000,00 | Custo/Hora R$ 75,01\n');

  // --- TESTE 2: Alocação em Múltiplos Centros de Custo ---
  console.log('Test 2: Alocação em Múltiplos Centros de Custo (50% CC-04, 50% CC-06)');
  const enfermeiro = new Servidor({
    nome: 'Enf. Juliana Paes',
    salario_base: 6000,
    encargos_percentual: 20,
    beneficios_valor: 0,
    carga_horaria_semanal: 40,
    alocacoes_centros_custo: [
      { centro_custo_id: 'CC-04', percentual: 50 },
      { centro_custo_id: 'CC-06', percentual: 50 }
    ]
  });

  const distribuicao = enfermeiro.getDistribuicaoCustosPorCentro();
  assert.equal(distribuicao.length, 2, 'Deve conter 2 distribuições');
  assert.equal(distribuicao[0].valor_mensal, 3600.00, '50% deve ser R$ 3.600,00');
  assert.equal(distribuicao[1].valor_mensal, 3600.00, '50% deve ser R$ 3.600,00');
  console.log('✅ Teste 2 passou: Distribuição em 2 centros de custo correta (R$ 3.600,00 cada)\n');

  // --- TESTE 3: Importador de CSV ---
  console.log('Test 3: Importação de Planilha CSV de RH');
  const csvExemplo = RHImporter.getModeloCSV();
  const previewResult = RHImporter.preview(csvExemplo, MOCK_CENTROS_CUSTO);

  assert.equal(previewResult.totalLinhas, 5, 'Deve ler 5 linhas do CSV');
  assert.equal(previewResult.resumo.qtdValidos, 5, 'Todas as 5 linhas devem ser válidas');
  assert.equal(previewResult.resumo.qtdErros, 0, 'Não deve haver erros no modelo padrão');
  assert(previewResult.resumo.custoTotalImportado > 0, 'Custo total importado deve ser maior que zero');
  console.log(`✅ Teste 3 passou: ${previewResult.resumo.qtdValidos} servidores importados | Custo total: R$ ${previewResult.resumo.custoTotalImportado}\n`);

  // --- TESTE 4: Emissão de Eventos de Custo no Stub/Mock ---
  console.log('Test 4: Emissão de Eventos de Custo de RH no Stub/Mock');
  const stub = new CustoContractStub();
  const eventos = await medico.emitirEventosCustoRH(stub);

  assert.equal(eventos.length, 1, 'Deve emitir 1 evento de custo para CC-04');
  assert.equal(eventos[0].centro_custo_id, 'CC-04', 'Centro de custo deve ser CC-04');
  assert.equal(eventos[0].valor, 13000.00, 'Valor do evento deve ser R$ 13.000,00');
  assert.equal(eventos[0].tipo, 'RH_HORA_TRABALHADA', 'Tipo deve ser RH_HORA_TRABALHADA');
  assert.equal(eventos[0].origem_modulo, 'VIGIA_RH', 'Origem deve ser VIGIA_RH');
  console.log('✅ Teste 4 passou: Evento de custo emitido com sucesso no contrato Stub!\n');

  console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
}

run();
