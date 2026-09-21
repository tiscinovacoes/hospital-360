/**
 * SUÍTE DE TESTES AUTOMATIZADOS - SPRINT 2
 * Teste E2E da Esteira Assistencial: OpenEMR -> n8n -> OpenBoxes FEFO -> App Tarefas PWA
 * Hospital 360
 */

import assert from 'node:assert';

async function runSprint2Tests() {
  console.log('\n--- INICIANDO TESTES AUTOMATIZADOS DA SPRINT 2 ---');
  const BASE_URL = 'http://localhost:3000';

  // Teste 1: Contrato do OpenEMR (Rodrigo Albuquerque)
  console.log('\n[TESTE 1] Validando emissão de atendimento no OpenEMR...');
  const resAtend = await fetch(`${BASE_URL}/api/openemr/atendimento`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pacienteNome: 'Paciente Homologação Sprint 2',
      cpf: '000.111.222-33',
      medicoNome: 'Dr. Ricardo Mendes',
      valorConsulta: 300.0,
      prescricoes: [{ codigo: 'MED-001', nome: 'Dipirona 500mg/mL', quantidade: 1 }],
    }),
  });
  const jsonAtend = await resAtend.json();
  assert.strictEqual(resAtend.status, 200, 'Endpoint OpenEMR deve retornar HTTP 200');
  assert.strictEqual(jsonAtend.success, true, 'Atendimento deve retornar success true');
  assert.strictEqual(jsonAtend.data.financeiro.split.valorClinica, 255.0, 'Split clínica deve ser 85% de R$ 300 = R$ 255');
  assert.strictEqual(jsonAtend.data.financeiro.split.valorCondominio, 45.0, 'Split condomínio deve ser 15% de R$ 300 = R$ 45');
  console.log(' -> [PASSED] OpenEMR emitiu evento e split 85/15 validado.');

  // Teste 2: Motor de Baixa FEFO do OpenBoxes (Mariana Siqueira)
  console.log('\n[TESTE 2] Validando motor de baixa FEFO estrita no OpenBoxes...');
  const resFefo = await fetch(`${BASE_URL}/api/estoque/fefo-baixa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      codigoMedicamento: 'MED-001',
      quantidadeRequisitada: 2,
      atendimentoId: jsonAtend.data.atendimentoId,
      pacienteNome: 'Paciente Homologação Sprint 2',
    }),
  });
  const jsonFefo = await resFefo.json();
  assert.strictEqual(resFefo.status, 200, 'Baixa FEFO deve retornar HTTP 200');
  assert.strictEqual(jsonFefo.success, true, 'Baixa FEFO deve ter sucesso');
  assert.strictEqual(jsonFefo.data.itensBaixados[0].loteId, 'LOT-DIP-2026-08', 'FEFO deve obrigatoriamente selecionar o lote com validade 2026 antes do lote 2027');
  assert.strictEqual(jsonFefo.data.itensBaixados[0].quantidadeBaixada, 2, 'Quantidade baixada deve ser 2');
  console.log(' -> [PASSED] OpenBoxes consumiu o lote de validade mais próxima com sucesso.');

  // Teste 3: App de Tarefas PWA e Baixa por QR Code (Thiago Pires)
  console.log('\n[TESTE 3] Validando fluxo de baixa de tarefas no App PWA com QR Code...');
  const resTarefas = await fetch(`${BASE_URL}/api/tarefas`);
  const jsonTarefas = await resTarefas.json();
  assert.strictEqual(resTarefas.status, 200, 'API de tarefas deve responder HTTP 200');
  const tarefaParaBaixar = jsonTarefas.data.find(t => t.status === 'EM_ANDAMENTO') || jsonTarefas.data[0];

  const resBaixaTarefa = await fetch(`${BASE_URL}/api/tarefas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'BAIXA',
      tarefaId: tarefaParaBaixar.id,
      qrCodeLido: true,
      observacao: 'Baixa homologada via suíte de testes da Sprint 2.',
    }),
  });
  const jsonBaixaTarefa = await resBaixaTarefa.json();
  assert.strictEqual(resBaixaTarefa.status, 200, 'Baixa da tarefa deve retornar HTTP 200');
  assert.strictEqual(jsonBaixaTarefa.success, true, 'Baixa deve ter sucesso');
  assert.ok(jsonBaixaTarefa.data.eventoCustoIntegrado.valorCusto > 0, 'Custo de mão de obra deve ser apurado');
  console.log(` -> [PASSED] Tarefa ${tarefaParaBaixar.id} baixada com apuração de R$ ${jsonBaixaTarefa.data.eventoCustoIntegrado.valorCusto.toFixed(2)} de mão de obra.`);

  console.log('\n=============================================================');
  console.log(' TODOS OS 3 TESTES DA SPRINT 2 FORAM APROVADOS COM SUCESSO!');
  console.log('=============================================================\n');
}

runSprint2Tests();
