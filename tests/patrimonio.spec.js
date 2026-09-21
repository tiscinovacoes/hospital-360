/**
 * Vigia Compras & Patrimônio — Suíte de Testes Automatizados (Sprint 7 / OS-01)
 */

import assert from 'node:assert/strict';
import { NotaFiscalServico, AtivoPatrimonial } from '../src/modules/patrimonio/patrimonioModel.js';
import { CustoContractStub } from '../src/contracts/custoContractStub.js';

console.log('🧪 Iniciando testes unitários do Vigia Compras & Patrimônio (Sprint 7 / OS-01)...\n');

async function run() {
  // --- TESTE 1: Lançamento de Nota Fiscal de Serviço Indireto ---
  console.log('Test 1: Lançamento de NF de Higienização/Limpeza');
  const stub = new CustoContractStub();

  const nfLimpeza = new NotaFiscalServico({
    numero_nf: 'NF-88210',
    fornecedor: 'Limpeza & Conservação Urbana Ltda',
    descricao_servico: 'Prestação de Serviços de Higienização Hospitalar (Mês 08/2026)',
    valor_total: 18500.00,
    centro_custo_id: 'CC-03'
  });

  const eventoNF = await nfLimpeza.emitirEventoCusto(stub);

  assert.equal(eventoNF.valor, 18500.00, 'Valor do evento deve ser R$ 18.500,00');
  assert.equal(eventoNF.tipo, 'NOTA_SERVICO_INDIRETO');
  assert.equal(eventoNF.centro_custo_id, 'CC-03');
  console.log('✅ Teste 1 passou: NF de R$ 18.500,00 alocada no CC-03 (Manutenção & Limpeza)\n');

  // --- TESTE 2: Cadastro de Ativo Fixo e Depreciação Linear ---
  console.log('Test 2: Cadastro de Aparelho de Ultrassom e Cálculo de Depreciação');

  const ultrassom = new AtivoPatrimonial({
    codigo_tombamento: 'TOMB-2026-044',
    descricao: 'Aparelho de Ultrassonografia Digital Colorido',
    categoria: 'EQUIPAMENTO_MEDICO',
    valor_aquisicao: 120000.00,
    vida_util_meses: 60,
    valor_residual: 0,
    centro_custo_id: 'CC-04'
  });

  const depreciacaoMensal = ultrassom.getDepreciacaoMensal();
  assert.equal(depreciacaoMensal, 2000.00, 'Depreciação mensal deve ser R$ 2.000,00/mês');

  const eventoDepr = await ultrassom.emitirEventoDepreciacao(stub);
  assert.equal(eventoDepr.valor, 2000.00);
  assert.equal(eventoDepr.tipo, 'DEPRECIACAO_ATIVO_FIXO');
  console.log('✅ Teste 2 passou: Depreciação mensal de R$ 2.000,00 gerada com sucesso para o ativo TOMB-2026-044\n');

  console.log('🎉 TODOS OS TESTES DO SPRINT 7 PASSARAM COM SUCESSO!');
}

run();
