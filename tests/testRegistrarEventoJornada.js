/**
 * Teste de Integração: registrar_evento_jornada por CPF (PROTOCOLO-AGENTES §3.1)
 */

import assert from 'node:assert/strict';
import { supabaseCustoContract } from '../src/contracts/supabaseCustoContract.js';

console.log('📡 Testando RPC public.registrar_evento_jornada no Supabase Cloud...\n');

async function testJornadaCPF() {
  const cpfTeste = '12345678900';
  const nomePaciente = 'João Félix';

  console.log(`1. Registrando dispensação de medicamento no centro CC-04 para CPF ${cpfTeste}...`);
  const res1 = await supabaseCustoContract.registrarEventoJornada({
    centro_custo_id: 'CC-04',
    tipo: 'DISPENSACAO_MEDICAMENTO',
    valor: 3.75,
    origem_modulo: 'VIGIA_ESTOQUE',
    cpf: cpfTeste,
    nome_paciente: nomePaciente,
    detalhes: { medicamento: 'Paracetamol 500mg', quantidade: 1 }
  });

  console.log('✅ Resposta do Supabase para evento 1:', res1);

  console.log(`\n2. Registrando consulta médica minutos depois para o MESMO CPF ${cpfTeste}...`);
  const res2 = await supabaseCustoContract.registrarEventoJornada({
    centro_custo_id: 'CC-04',
    tipo: 'CONSULTA_MEDICA',
    valor: 65.00,
    origem_modulo: 'VIGIA_AGENDA',
    cpf: cpfTeste,
    nome_paciente: nomePaciente,
    detalhes: { especialidade: 'Clínica Geral' }
  });

  console.log('✅ Resposta do Supabase para evento 2:', res2);
}

testJornadaCPF();
