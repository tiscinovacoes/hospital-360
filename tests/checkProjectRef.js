/**
 * Verifica explicitamente a qual banco de dados Supabase estamos conectados.
 */

const KEY = 'sb_publishable_a0cwEmheXaFCeNuNYWRNPA_d4aEpQMI';

async function check() {
  console.log('--- TESTANDO PROJETO 1: oogpcdaosexarxmvupiw (custo paciente) ---');
  try {
    const res1 = await fetch('https://oogpcdaosexarxmvupiw.supabase.co/rest/v1/centros_custo?tenant_id=eq.a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
    });
    console.log('Status HTTP (oogpcdaosexarxmvupiw):', res1.status);
    const data1 = await res1.json();
    console.log('Retorno de oogpcdaosexarxmvupiw:', data1);
  } catch (err) {
    console.error('Erro em oogpcdaosexarxmvupiw:', err);
  }

  console.log('\n--- TESTANDO PROJETO 2: oxanubfolkoulklrhrpr (Vigia-Saude) ---');
  try {
    const res2 = await fetch('https://oxanubfolkoulklrhrpr.supabase.co/rest/v1/centros_custo?tenant_id=eq.a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
    });
    console.log('Status HTTP (oxanubfolkoulklrhrpr):', res2.status);
    const data2 = await res2.json();
    console.log('Retorno de oxanubfolkoulklrhrpr:', data2);
  } catch (err) {
    console.error('Erro em oxanubfolkoulklrhrpr:', err);
  }
}

check();
