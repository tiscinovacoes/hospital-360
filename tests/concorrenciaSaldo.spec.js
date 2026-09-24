/**
 * Testes de Concorrência e Garantia de Saldo Não-Negativo
 */

import assert from 'node:assert/strict';
import { EstoqueStore } from '../nucleo/src/lib/estoque/estoqueStore.ts';

console.log('🧪 Iniciando testes de Concorrência e Integridade de Saldo...');

async function run() {
  const caf = EstoqueStore.listarLotes({ apenasDisponiveis: true });
  assert(caf.length > 0, 'Deve haver lotes disponíveis para o teste.');

  const loteAlvo = caf[0];
  const saldoInicial = loteAlvo.saldo_total || 0;
  console.log(`Lote alvo: ${loteAlvo.numero_lote} | Saldo inicial: ${saldoInicial}`);

  // Teste 1: Tentativa de baixa maior que o saldo deve ser rejeitada imediatamente
  await assert.rejects(async () => {
    await EstoqueStore.dispensarAoPaciente({
      pacienteCpf: '12345678900',
      pacienteNome: 'Teste Concorrência',
      localId: '11111111-0000-0000-0000-000000000002',
      produtoId: loteAlvo.produto_id,
      loteEscolhidoId: loteAlvo.id,
      quantidade: 99999999, // Quantidade astronômica
      usuario: 'tester'
    });
  }, /Saldo insuficiente/);
  console.log('✅ 1. Rejeição imediata de solicitação excedente ao saldo aprovada.');

  // Teste 2: Duas requisições simultâneas concorrendo pelo mesmo saldo limitado
  const saldoDisponivelUbs = 50;
  let sucessos = 0;
  let falhas = 0;

  // Dispara 5 requisições em paralelo pedindo 20 unidades cada (total 100 > saldo 50)
  const promessas = [1, 2, 3, 4, 5].map(async (i) => {
    try {
      await EstoqueStore.dispensarAoPaciente({
        pacienteCpf: `1112223330${i}`,
        pacienteNome: `Paciente Concorrente ${i}`,
        localId: '11111111-0000-0000-0000-000000000002',
        produtoId: loteAlvo.produto_id,
        loteEscolhidoId: loteAlvo.id,
        quantidade: 20,
        usuario: `tester_${i}`
      });
      sucessos++;
    } catch {
      falhas++;
    }
  });

  await Promise.all(promessas);

  console.log(`Requisições simultâneas: Sucessos: ${sucessos} | Falhas por saldo: ${falhas}`);
  assert(sucessos > 0, 'Ao menos uma transação concorrente deve ter sucesso.');

  // Verifica que o saldo não ficou negativo em hipótese alguma
  const lotesAtualizados = EstoqueStore.listarLotes({ produtoId: loteAlvo.produto_id });
  const lotePos = lotesAtualizados.find(l => l.id === loteAlvo.id);
  assert((lotePos?.saldo_total || 0) >= 0, 'Saldo jamais pode ser negativo.');
  console.log(`✅ 2. Concorrência validada. Saldo final: ${lotePos?.saldo_total} (>= 0).`);

  console.log('🎉 Todos os testes de concorrência e integridade concluídos com sucesso!');
}

run();
