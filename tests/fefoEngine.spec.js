/**
 * Testes Unitários do Motor FEFO (First Expired, First Out)
 */

import assert from 'node:assert/strict';
import { FefoEngine } from '../nucleo/src/lib/estoque/fefoEngine.ts';

console.log('🧪 Iniciando testes do Motor FEFO...');

const dataReferencia = new Date('2026-10-01T00:00:00Z');

const lotesTeste = [
  {
    id: 'lote-longe',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-001',
    numero_lote: 'LT-LONGE',
    fabricante: 'Lab A',
    data_validade: '2027-10-01',
    custo_unitario_base: 2.0,
    status: 'LIBERADO',
    saldo_total: 100
  },
  {
    id: 'lote-proximo',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-001',
    numero_lote: 'LT-PROXIMO',
    fabricante: 'Lab B',
    data_validade: '2026-11-15', // Vence em ~45 dias
    custo_unitario_base: 2.0,
    status: 'LIBERADO',
    saldo_total: 50
  },
  {
    id: 'lote-vencido',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-001',
    numero_lote: 'LT-VENCIDO',
    fabricante: 'Lab C',
    data_validade: '2026-09-01', // Venceu antes de outubro
    custo_unitario_base: 2.0,
    status: 'VENCIDO',
    saldo_total: 20
  },
  {
    id: 'lote-quarentena',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-001',
    numero_lote: 'LT-QUARENTENA',
    fabricante: 'Lab D',
    data_validade: '2026-10-25',
    custo_unitario_base: 2.0,
    status: 'QUARENTENA',
    saldo_total: 80
  },
  {
    id: 'lote-critico-20dias',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-001',
    numero_lote: 'LT-CRITICO-20D',
    fabricante: 'Lab E',
    data_validade: '2026-10-20', // Vence em 19 dias
    custo_unitario_base: 2.0,
    status: 'LIBERADO',
    saldo_total: 10
  }
];

// Teste 1: Ordenação por validade ascendente
const ordenados = FefoEngine.ordenarPorFefo(lotesTeste);
assert.equal(ordenados[0].numero_lote, 'LT-VENCIDO');
assert.equal(ordenados[1].numero_lote, 'LT-CRITICO-20D');
assert.equal(ordenados[ordenados.length - 1].numero_lote, 'LT-LONGE');
console.log('✅ 1. Ordenação FEFO estrita aprovada.');

// Teste 2: Sugestão automática ignorando vencidos, quarentena e < 30 dias de prateleira para UBS
const sugestaoUbs = FefoEngine.sugerirLoteFefo(lotesTeste, 30, dataReferencia);
assert(sugestaoUbs !== null);
assert.equal(sugestaoUbs.loteSugerido.numero_lote, 'LT-PROXIMO');
console.log('✅ 2. Sugestão FEFO com filtro de 30 dias de margem aprovada.');

// Teste 3: Escolha do lote sugerido não exige justificativa
const validacaoOk = FefoEngine.validarEscolhaLote(
  'lote-proximo',
  lotesTeste,
  '',
  30,
  dataReferencia
);
assert.equal(validacaoOk.ehDesvioFefo, false);
assert.equal(validacaoOk.exigeJustificativa, false);
console.log('✅ 3. Seleção do lote correto pelo FEFO sem atrito aprovada.');

// Teste 4: Desvio de lote sem justificativa deve ser rejeitado
const validacaoInvalida = FefoEngine.validarEscolhaLote(
  'lote-longe',
  lotesTeste,
  'curta', // Menos de 10 caracteres
  30,
  dataReferencia
);
assert.equal(validacaoInvalida.ehDesvioFefo, true);
assert.equal(validacaoInvalida.exigeJustificativa, true);
assert.equal(validacaoInvalida.justificativaValida, false);
assert(validacaoInvalida.erroJustificativa !== undefined);
console.log('✅ 4. Bloqueio de desvio de FEFO sem justificativa adequada aprovado.');

// Teste 5: Desvio de lote com justificativa válida (>= 10 caracteres)
const validacaoComJustificativa = FefoEngine.validarEscolhaLote(
  'lote-longe',
  lotesTeste,
  'Lote separado para atendimento emergencial específico com autorização médica.',
  30,
  dataReferencia
);
assert.equal(validacaoComJustificativa.ehDesvioFefo, true);
assert.equal(validacaoComJustificativa.justificativaValida, true);
console.log('✅ 5. Aprovação auditada de override com justificativa técnica aprovada.');

console.log('🎉 Todos os testes do motor FEFO concluídos com sucesso!');
