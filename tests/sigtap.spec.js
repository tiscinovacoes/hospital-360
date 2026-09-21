/**
 * Testes Unitários do Parser SIGTAP / DATASUS (Sprint 11)
 */

import assert from 'assert';
import { SigtapParser } from '../src/modules/faturamento/sigtapParser.js';

console.log('🧪 Iniciando testes do Parser SIGTAP (Sprint 11 / DATASUS)...\n');

// Test 1: Parser de linha fixa do layout oficial do DATASUS
// Montando uma linha sintética com código 0303140151, nome Pneumonia e valores SH/SP
const linhaPneumonia = 
  '0303140151' + 
  'TRATAMENTO DE PNEUMONIAS OU INFLUENZA (GRIPE)'.padEnd(250, ' ') + 
  '2' + 'I' + '0001' + '0005' + '0000' + '0000' + '0130' + 
  '000000045000' + // VL_SH = R$ 450,00 (em centavos)
  '000000000000' + // VL_SA = R$ 0,00
  '000000013242' + // VL_SP = R$ 132,42 (em centavos)
  '01' + '000000' + '0000' + '202607';

const proc = SigtapParser.parseLinhaProcedimento(linhaPneumonia);

assert.strictEqual(proc.codigo, '0303140151');
assert.strictEqual(proc.nome, 'TRATAMENTO DE PNEUMONIAS OU INFLUENZA (GRIPE)');
assert.strictEqual(proc.valor_servico_hospitalar, 450.00);
assert.strictEqual(proc.valor_servico_profissional, 132.42);
assert.strictEqual(proc.valor_total_repasse_sus, 582.42);
console.log('✅ Teste 1 passou: Linha SIGTAP parseada com sucesso (Total R$ 582,42)');

// Test 2: Cálculo de Defasagem SUS vs Custo Real
const analise = SigtapParser.calcularDeficit({
  custo_real: 992.50,
  repasse_sus: 582.42
});

assert.strictEqual(analise.deficit_nominal, 410.08);
assert.strictEqual(analise.percentual_cobertura, 58.7);
assert.strictEqual(analise.percentual_deficit, 41.3);
console.log(`✅ Teste 2 passou: Análise de déficit validada (SUS cobre ${analise.percentual_cobertura}%, Déficit R$ ${analise.deficit_nominal})`);

// Test 3: Lista de procedimentos de referência
const refs = SigtapParser.getProcedimentosReferencia();
assert.strictEqual(refs.length, 4);
assert.strictEqual(refs[0].codigo, '0303140151');
assert.strictEqual(refs[1].codigo, '0310010039');
console.log('✅ Teste 3 passou: Procedimentos de referência hospitalar carregados com sucesso');

console.log('\n🎉 TODOS OS TESTES DO PARSER SIGTAP PASSARAM COM SUCESSO!\n');
