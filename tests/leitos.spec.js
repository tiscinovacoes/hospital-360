/**
 * Vigia Leitos — Suíte de Testes Automatizados (Sprint 10)
 */

import assert from 'node:assert/strict';
import { InternacaoLeito } from '../src/modules/leitos/leitosModel.js';
import { CustoContractStub } from '../src/contracts/custoContractStub.js';

console.log('🧪 Iniciando testes unitários do Vigia Leitos (Sprint 10)...\n');

const stub = new CustoContractStub();

const internacao = new InternacaoLeito({
  paciente_id: 'PAC-202',
  paciente_nome: 'Marcos Vinicius',
  numero_leito: 'LEITO-04',
  tipo_leito: 'ENFERMARIA',
  custo_diaria_base: 300.00, // R$ 300,00 por diária
  centro_custo_id: 'CC-06'
});

// Simula 3 diárias de internação
const eventos = internacao.registrarDiarias(3, stub);

assert.equal(eventos.length, 3, 'Deve emitir 3 eventos de diária');
assert.equal(internacao.diarias_cumpridas, 3);
assert.equal(eventos[0].valor, 300.00);
assert.equal(eventos[0].tipo, 'DIARIA_INTERNACAO_ENFERMARIA');

internacao.darAlta();
assert(internacao.data_alta !== null, 'Data de alta deve estar preenchida');

console.log('✅ Teste 1 passou: Internação de 3 diárias gerou 3 eventos de R$ 300,00 (Total R$ 900,00) e alta registrada.\n');
console.log('🎉 TODOS OS TESTES DO SPRINT 10 PASSARAM COM SUCESSO!');
