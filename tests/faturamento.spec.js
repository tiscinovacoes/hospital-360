/**
 * Vigia Faturamento — Suíte de Testes Automatizados (Sprint 11)
 */

import assert from 'node:assert/strict';
import { ComparadorCustoFaturamento } from '../src/modules/faturamento/faturamentoModel.js';

console.log('🧪 Iniciando testes unitários do Vigia Faturamento / SUS (Sprint 11)...\n');

// Simulação de internação simples: Custo Apurado Real = R$ 992,50 vs SIGTAP 0303010037 (R$ 305,50)
const analise = ComparadorCustoFaturamento.analisarPacienteEpisodio({
  episodio_id: 'EPI-INT-8801',
  paciente_nome: 'Marcos Vinicius',
  codigo_procedimento_sigtap: '0303010037',
  custoRealApurado: 992.50
});

assert.equal(analise.repasseSUS, 305.50, 'Repasse SIGTAP deve ser R$ 305,50');
assert.equal(analise.custoRealApurado, 992.50, 'Custo real deve ser R$ 992,50');
assert.equal(analise.resultadoFinanceiro, -687.00, 'Déficit do município deve ser R$ -687,00');
assert.equal(analise.situacao, 'DEFICIT_COBERTO_MUNICIPIO');
assert.equal(analise.coberturaPercentual, 30.8, 'Repasse SUS cobriu apenas 30,8% do custo real');

console.log(`✅ Teste 1 passou: Custo Real R$ 992,50 vs SUS R$ 305,50 -> Déficit Municipal de R$ 687,00 (SUS cobre apenas 30,8%)\n`);
console.log('🎉 TODOS OS TESTES DO SPRINT 11 PASSARAM COM SUCESSO!');
