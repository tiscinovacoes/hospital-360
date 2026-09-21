/**
 * Teste de registro de jornada por CPF com suporte a token de autenticação
 */

import { supabaseCustoContract } from '../src/contracts/supabaseCustoContract.js';

const PAT = 'sbp_v0_b78f8fc67eb37082fb8b9f424ffe37bc531ce41c';
const KEY = 'sb_publishable_a0cwEmheXaFCeNuNYWRNPA_d4aEpQMI';

async function testWithToken() {
  console.log('📡 Testando registrar_evento_jornada com token autenticado...');
  const res = await fetch('https://oogpcdaosexarxmvupiw.supabase.co/rest/v1/rpc/registrar_evento_jornada', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': `Bearer ${PAT}`
    },
    body: JSON.stringify({
      p_centro_custo_id: 'CC-04',
      p_tipo: 'DISPENSACAO_MEDICAMENTO',
      p_valor: 3.75,
      p_origem_modulo: 'VIGIA_ESTOQUE',
      p_cpf: '12345678900',
      p_nome_paciente: 'João Félix',
      p_detalhes: { medicamento: 'Paracetamol 500mg', quantidade: 1 }
    })
  });

  console.log('Status HTTP:', res.status);
  const data = await res.json();
  console.log('Retorno RPC:', data);
}

testWithToken();
