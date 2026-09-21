/**
 * Vigia Agenda — Suíte de Testes Automatizados (Sprint 9)
 */

import assert from 'node:assert/strict';
import { ConsultaAtendimento } from '../src/modules/agenda/agendaModel.js';
import { CustoContractStub } from '../src/contracts/custoContractStub.js';

console.log('🧪 Iniciando testes unitários do Vigia Agenda (Sprint 9)...\n');

const stub = new CustoContractStub();

const consulta = new ConsultaAtendimento({
  paciente_id: 'PAC-101',
  paciente_nome: 'Maria Eduarda Ramos',
  profissional_nome: 'Dr. Lucas Silveira',
  especialidade: 'Clínica Geral',
  duracao_minutos: 30, // 30 min = 0.5h
  centro_custo_id: 'CC-04'
});

// Custo/Hora do Médico = R$ 100,00 -> 30 min = R$ 50,00
const evento = consulta.emitirEventoCusto({
  custoContract: stub,
  custoHoraProfissional: 100.00
});

assert.equal(evento.valor, 50.00, 'Custo da consulta de 30 min deve ser R$ 50,00');
assert.equal(evento.tipo, 'ATENDIMENTO_AMBULATORIAL');
assert.equal(evento.origem_modulo, 'VIGIA_AGENDA');
assert.equal(evento.centro_custo_id, 'CC-04');

console.log('✅ Teste 1 passou: Consulta de 30 min a R$ 100/h gerou evento de custo de R$ 50,00\n');
console.log('🎉 TODOS OS TESTES DO SPRINT 9 PASSARAM COM SUCESSO!');
