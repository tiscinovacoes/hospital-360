/**
 * Testando chamada da RPC emitir_evento_custo vs registrar_evento_jornada com a anon key
 */

const KEY = 'sb_publishable_a0cwEmheXaFCeNuNYWRNPA_d4aEpQMI';

async function checkGrants() {
  console.log('1. Testando emitir_evento_custo...');
  const res1 = await fetch('https://oogpcdaosexarxmvupiw.supabase.co/rest/v1/rpc/emitir_evento_custo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`
    },
    body: JSON.stringify({
      p_tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      p_centro_custo_id: 'CC-04',
      p_tipo: 'TESTE_RPC',
      p_valor: 10.00,
      p_origem_modulo: 'TESTE'
    })
  });
  console.log('Status emitir_evento_custo:', res1.status, await res1.json());

  console.log('\n2. Testando registrar_evento_jornada...');
  const res2 = await fetch('https://oogpcdaosexarxmvupiw.supabase.co/rest/v1/rpc/registrar_evento_jornada', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`
    },
    body: JSON.stringify({
      p_centro_custo_id: 'CC-04',
      p_tipo: 'TESTE_RPC',
      p_valor: 10.00,
      p_origem_modulo: 'TESTE',
      p_cpf: '12345678900'
    })
  });
  console.log('Status registrar_evento_jornada:', res2.status, await res2.json());
}

checkGrants();
