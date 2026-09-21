/**
 * Vigia Estoque — Suíte de Testes Automatizados (Sprint 6 / OS-01)
 */

import assert from 'node:assert/strict';
import { ItemEstoque, LoteEstoque, GestorEstoque } from '../src/modules/estoque/estoqueModel.js';
import { EstoqueImporter } from '../src/modules/estoque/estoqueImporter.js';
import { CustoContractStub } from '../src/contracts/custoContractStub.js';

console.log('🧪 Iniciando testes unitários do Vigia Estoque (Sprint 6 / OS-01)...\n');

async function run() {
  // --- TESTE 1: Cadastro e Cálculo de Valor em Estoque ---
  console.log('Test 1: Cadastro de Lote e Valor Total');
  const gestor = new GestorEstoque();

  const dipirona = new ItemEstoque({ codigo: 'MED-01', descricao: 'Dipirona 500mg Ampola' });
  const loteDipirona = new LoteEstoque({
    item_id: dipirona.id,
    item_descricao: dipirona.descricao,
    numero_lote: 'LT-2026-X',
    data_validade: '2027-12-31',
    quantidade_inicial: 100,
    quantidade_atual: 100,
    valor_unitario: 2.50
  });

  gestor.adicionarItem(dipirona);
  gestor.adicionarLote(loteDipirona);

  assert.equal(loteDipirona.getValorTotalEstoque(), 250.00, 'Valor total deve ser R$ 250,00');
  console.log('✅ Teste 1 passou: Valor total do lote em estoque R$ 250,00\n');

  // --- TESTE 2: Baixa de Medicamento e Emissão de Evento de Custo ---
  console.log('Test 2: Baixa por Dispensação e Emissão de Custo (SAIDA_ESTOQUE_MEDICAMENTO)');
  const stub = new CustoContractStub();

  const movimentacao = await gestor.darBaixaMedicamento({
    lote_id: loteDipirona.id,
    quantidade: 20,
    centro_custo_id: 'CC-04',
    episodio_id: 'EPI-9901',
    paciente_nome: 'João da Silva',
    custoContract: stub
  });

  assert.equal(loteDipirona.quantidade_atual, 80, 'Saldo restante deve ser 80 ampolas');
  assert.equal(movimentacao.valor_total, 50.00, 'Valor da baixa deve ser R$ 50,00');

  const eventos = stub.getEventos();
  assert.equal(eventos.length, 1, 'Deve emitir 1 evento de custo de estoque');
  assert.equal(eventos[0].tipo, 'SAIDA_ESTOQUE_MEDICAMENTO');
  assert.equal(eventos[0].valor, 50.00);
  console.log('✅ Teste 2 passou: Saldo atualizado para 80 e evento de R$ 50,00 gerado para o episódio EPI-9901\n');

  // --- TESTE 3: Importador de CSV de Estoque ---
  console.log('Test 3: Importação de Planilha de Farmácia/Almoxarifado');
  const csvModel = EstoqueImporter.getModeloCSV();
  const preview = EstoqueImporter.preview(csvModel);

  assert.equal(preview.resumo.qtdValidos, 4, 'Deve importar 4 lotes válidos');
  assert.equal(preview.resumo.qtdErros, 0);
  assert(preview.resumo.valorTotalEstoque > 0, 'Valor total do estoque importado deve ser maior que zero');
  console.log(`✅ Teste 3 passou: ${preview.resumo.qtdValidos} lotes importados | Total: R$ ${preview.resumo.valorTotalEstoque}\n`);

  console.log('🎉 TODOS OS TESTES DO SPRINT 6 PASSARAM COM SUCESSO!');
}

run();
