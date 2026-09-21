/**
 * Teste de Conexão com o Supabase Real (Projeto oogpcdaosexarxmvupiw)
 */

import { supabaseCustoContract } from '../src/contracts/supabaseCustoContract.js';

console.log('📡 Testando comunicação com o projeto Supabase: oogpcdaosexarxmvupiw...\n');

const DEMO_TENANT_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

async function runTest() {
  console.log(`1. Consultando Centros de Custo para Tenant UUID: ${DEMO_TENANT_UUID}...`);
  const centros = await supabaseCustoContract.getCentrosCusto(DEMO_TENANT_UUID);
  console.log('✅ Centros de Custo retornados do Supabase:', centros);

  console.log('\n2. Testando disparo da Stored Procedure emitir_evento_custo no Supabase...');
  const evento = await supabaseCustoContract.emitirEventoCusto({
    tenant_id: DEMO_TENANT_UUID,
    centro_custo_id: 'CC-04',
    tipo: 'TESTE_CONEXAO_SUPABASE',
    valor: 150.00,
    origem_modulo: 'TESTE_ANTIGRAVITY',
    detalhes: { cliente: 'Vigia Custos', status: 'LIVE_SUPABASE_OK' }
  });

  console.log('✅ Evento de Custo emitido com sucesso no Supabase Cloud:', evento);
}

runTest();
