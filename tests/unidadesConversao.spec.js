/**
 * Testes Unitários de Fracionamento e Conversão para Unidade Base Inteira
 */

import assert from 'node:assert/strict';
import { ProdutosService } from '../nucleo/src/lib/estoque/produtosService.ts';

console.log('🧪 Iniciando testes de Fracionamento e Conversão de Embalagens...');

const produtoAmoxicilina = {
  id: 'prod-001',
  tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  codigo_catmat: 'BR0154320',
  nome: 'Amoxicilina + Clavulanato 500/125mg',
  principio_ativo: 'Amoxicilina + Clavulanato',
  concentracao: '500/125mg',
  forma_farmaceutica: 'Comprimido',
  unidade_base: 'COMPRIMIDO',
  controlado: false,
  termolabil: false,
  estoque_minimo_padrao: 1000,
  ativo: true,
  embalagens: [
    { id: 'emb-cx', tenant_id: 'tenant-1', produto_id: 'prod-001', tipo_embalagem: 'CAIXA', fator_conversao_base: 30 },
    { id: 'emb-bl', tenant_id: 'tenant-1', produto_id: 'prod-001', tipo_embalagem: 'CARTELA', fator_conversao_base: 10 },
    { id: 'emb-un', tenant_id: 'tenant-1', produto_id: 'prod-001', tipo_embalagem: 'COMPRIMIDO', fator_conversao_base: 1 }
  ]
};

// Teste 1: Entrada em Caixas converte para quantidade exata de comprimidos
const qtdBaseCaixas = ProdutosService.converterParaUnidadeBase(5, 'CAIXA', produtoAmoxicilina);
assert.equal(qtdBaseCaixas, 150); // 5 * 30 = 150
console.log('✅ 1. Entrada de 5 Caixas convertida para 150 comprimidos.');

// Teste 2: Solicitação em Cartelas converte para unidade base
const qtdBaseCartelas = ProdutosService.converterParaUnidadeBase(4, 'CARTELA', produtoAmoxicilina);
assert.equal(qtdBaseCartelas, 40); // 4 * 10 = 40
console.log('✅ 2. Solicitação de 4 Cartelas convertida para 40 comprimidos.');

// Teste 3: Dispensação direta em Comprimidos permanece na unidade base
const qtdBaseDireta = ProdutosService.converterParaUnidadeBase(12, 'COMPRIMIDO', produtoAmoxicilina);
assert.equal(qtdBaseDireta, 12);
console.log('✅ 3. Dispensação de 12 comprimidos preservada na unidade base.');

// Teste 4: Proibição de fração de item contável (ex: 0.5 comprimido)
assert.throws(() => {
  ProdutosService.converterParaUnidadeBase(0.5, 'COMPRIMIDO', produtoAmoxicilina);
}, /contável e não admite frações/);
console.log('✅ 4. Rejeição de fracionamento decimal para itens contáveis aprovada.');

// Teste 5: Reversão da unidade base para embalagem comercial com sobra
const conversaoReversa = ProdutosService.converterDaUnidadeBase(75, 'CAIXA', produtoAmoxicilina);
assert.equal(conversaoReversa.quantidadeEmbalagem, 2); // 2 caixas (60 comp)
assert.equal(conversaoReversa.sobraBase, 15); // + 15 comprimidos soltos
assert.equal(conversaoReversa.textoFormatado, '2 CAIXA + 15 COMPRIMIDO');
console.log('✅ 5. Decomposição reversa (2 Caixas + 15 comprimidos) aprovada.');

console.log('🎉 Todos os testes de conversão e fracionamento concluídos com sucesso!');
