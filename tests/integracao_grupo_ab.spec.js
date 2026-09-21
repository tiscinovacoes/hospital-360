/**
 * Vigia Custos — Suíte de Testes de Integração Ponta a Ponta (Sprint 8 / OS-01 Real)
 */

import assert from 'node:assert/strict';
import { CustoContractStub } from '../src/contracts/custoContractStub.js';
import { supabaseCustoContract } from '../src/contracts/supabaseCustoContract.js';
import { MotorIntegracaoCicloCompleto } from '../src/modules/integracao/cicloCompleto.js';

console.log('🧪 Iniciando testes de integração ponta a ponta Grupo A + B (Sprint 8 / OS-01 Real)...\n');

async function run() {
  console.log('1. Rodando ciclo de integração contra Supabase Cloud Real...');
  const motorReal = new MotorIntegracaoCicloCompleto(supabaseCustoContract);
  const resultadoReal = await motorReal.simularMesCompletoPostoEInternacao();

  assert(resultadoReal.totalEventosEmitidos >= 4, 'Deve emitir eventos de RH, Estoque, NF e Depreciação');
  assert(resultadoReal.custoTotalProcessado > 20000, 'Custo total processado no mês deve ser superior a R$ 20.000,00');
  assert.equal(resultadoReal.pacienteTeste.custoDiretoEstoque, 92.50, 'Custo direto de estoque do paciente teste deve ser R$ 92,50');

  console.log(`✅ Teste de Integração Real passou: ${resultadoReal.totalEventosEmitidos} eventos transmitidos | Custo Total: R$ ${resultadoReal.custoTotalProcessado.toLocaleString('pt-BR')} | Custo Direto Paciente: R$ ${resultadoReal.pacienteTeste.custoDiretoEstoque}\n`);
  console.log('🎉 OS-01: CICLO REAL DO SPRINT 8 CONCLUÍDO COM SUCESSO!');
}

run();
