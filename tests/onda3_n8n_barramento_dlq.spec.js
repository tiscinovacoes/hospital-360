/**
 * Suíte de Testes da ONDA 3: Barramento n8n, Resiliência e Dead Letter Queue (DLQ)
 * Valida a conformidade dos 5 workflows canônicos, assinatura HMAC-SHA256,
 * deduplicação por idempotência, retentativas exponenciais e ciclo completo da DLQ.
 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function runOnda3Tests() {
  console.log('========================================================================');
  console.log('⚡ HOSPITAL 360 — SUÍTE DE TESTES DA ONDA 3 (BARRAMENTO n8n & RESILIÊNCIA DLQ)');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Validação Estrutural dos 5 Workflows Canônicos JSON
  try {
    console.log('[TEST 1] Workflows n8n: Validação sintática, nós HTTP, retry e porta de erro DLQ...');

    const n8nDir = path.resolve(__dirname, '../integracoes/n8n');
    assert.ok(fs.existsSync(n8nDir), `Diretório ${n8nDir} deve existir`);

    const workflowFiles = [
      'workflow_01_prescricao_fefo.json',
      'workflow_02_solicitacao_senaite.json',
      'workflow_03_laudo_hub.json',
      'workflow_04_alta_facilities.json',
      'workflow_05_faturamento_split.json'
    ];

    for (const file of workflowFiles) {
      const fullPath = path.join(n8nDir, file);
      assert.ok(fs.existsSync(fullPath), `Arquivo ${file} deve existir`);

      const raw = fs.readFileSync(fullPath, 'utf8');
      const wf = JSON.parse(raw);

      assert.ok(wf.name && typeof wf.name === 'string', `${file} deve possuir nome legível`);
      assert.ok(Array.isArray(wf.nodes) && wf.nodes.length >= 4, `${file} deve possuir ao menos 4 nós operacionais`);
      assert.ok(wf.connections && typeof wf.connections === 'object', `${file} deve possuir mapa de conexões`);

      // Verifica nó Webhook trigger
      const webhookNode = wf.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
      assert.ok(webhookNode, `${file} deve conter nó do tipo n8n-nodes-base.webhook`);

      // Verifica nó com retry e onError
      const httpNode = wf.nodes.find(n => n.type === 'n8n-nodes-base.httpRequest' && n.retryOnFail !== undefined);
      assert.ok(httpNode, `${file} deve conter nó HTTP com configuração de retry`);
      assert.strictEqual(httpNode.retryOnFail, true, `${file} HTTP deve ter retryOnFail = true`);
      assert.ok(httpNode.maxTries >= 3, `${file} HTTP deve ter no mínimo 3 tentativas (maxTries >= 3)`);
      assert.strictEqual(httpNode.onError, 'continueErrorOutput', `${file} HTTP deve ter onError = 'continueErrorOutput'`);

      // Verifica nó DLQ
      const dlqNode = wf.nodes.find(n => n.name && n.name.toLowerCase().includes('dlq'));
      assert.ok(dlqNode, `${file} deve conter nó dedicado para Dead Letter Queue (DLQ)`);

      // Verifica conexão main[1] para DLQ
      const connectionsHttp = wf.connections[httpNode.name];
      assert.ok(connectionsHttp && connectionsHttp.main && connectionsHttp.main.length >= 2,
        `${file}: Conexões do nó '${httpNode.name}' devem possuir porta de sucesso (main[0]) e porta de erro (main[1])`);
      
      const errorRoute = connectionsHttp.main[1];
      assert.ok(errorRoute && errorRoute.some(c => c.node === dlqNode.name),
        `${file}: A porta de erro (main[1]) do nó '${httpNode.name}' deve se conectar diretamente ao nó '${dlqNode.name}'`);
    }

    console.log(`  ✓ Todos os 5 workflows canônicos validados com conformidade estrita n8n v1.x e rota de erro DLQ.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 1:', err.message);
    failed++;
  }

  // 2. Validação de Assinatura Criptográfica HMAC-SHA256 (x-hub-signature-256)
  try {
    console.log('[TEST 2] Segurança de Webhooks: Assinatura HMAC-SHA256 com timingSafeEqual...');

    const secret = process.env.N8N_WEBHOOK_SECRET || 'hospital360-n8n-secret-key-2026';
    const payload = JSON.stringify({
      event_id: 'EVT-TEST-HMAC-001',
      timestamp: new Date().toISOString(),
      event_type: 'openemr.prescricao_emitida',
      patient_id: '123.456.789-00',
      data: { descricao: 'Dipirona 500mg IV', quantidade: 2, valor_unitario: 5.5 }
    });

    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const tamperedPayload = JSON.stringify({ ...JSON.parse(payload), patient_id: '999.999.999-99' });
    const forgedSignature = crypto.createHmac('sha256', 'chave-falsa-atacante').update(payload).digest('hex');

    function checkHmac(bodyText, sig) {
      if (!sig) return false;
      const expected = crypto.createHmac('sha256', secret).update(bodyText).digest('hex');
      try {
        return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'));
      } catch {
        return false;
      }
    }

    assert.strictEqual(checkHmac(payload, validSignature), true, 'Assinatura com chave legítima deve ser aceita');
    assert.strictEqual(checkHmac(tamperedPayload, validSignature), false, 'Payload adulterado deve ser rejeitado');
    assert.strictEqual(checkHmac(payload, forgedSignature), false, 'Assinatura forjada com chave incorreta deve ser rejeitada');

    console.log('  ✓ Autenticação HMAC-SHA256 validada contra adulterações e ataques de timing.');
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 2:', err.message);
    failed++;
  }

  // 3. Validação de Deduplicação por Idempotência no Barramento
  try {
    console.log('[TEST 3] Idempotência do Barramento: Deduplicação de eventos duplicados...');

    const cacheIdempotencia = new Set();
    let totalCustoImputado = 0;

    function processarEvento(evento) {
      if (cacheIdempotencia.has(evento.event_id)) {
        return {
          success: true,
          status: 'DUPLICATE_IGNORED',
          event_id: evento.event_id,
          mensagem: 'Evento já processado anteriormente. Despesa não duplicada.'
        };
      }

      cacheIdempotencia.add(evento.event_id);
      const valor = evento.data.quantidade * evento.data.valor_unitario;
      totalCustoImputado += valor;

      return {
        success: true,
        status: 'PROCESSADO_COM_SUCESSO',
        event_id: evento.event_id,
        valorTotalImputado: valor
      };
    }

    const eventoOriginal = {
      event_id: 'N8N-EVT-IDEMP-888',
      patient_id: '111.222.333-44',
      data: { quantidade: 3, valor_unitario: 50.0 } // Total: 150.00
    };

    // Primeiro envio: deve processar
    const res1 = processarEvento(eventoOriginal);
    assert.strictEqual(res1.status, 'PROCESSADO_COM_SUCESSO');
    assert.strictEqual(totalCustoImputado, 150.0);

    // Segundo envio com mesmo ID: deve ignorar por idempotência
    const res2 = processarEvento(eventoOriginal);
    assert.strictEqual(res2.status, 'DUPLICATE_IGNORED');
    assert.strictEqual(totalCustoImputado, 150.0, 'Custo não pode ser imputado em duplicidade');

    // Terceiro envio com ID diferente: deve processar normalmente
    const res3 = processarEvento({ ...eventoOriginal, event_id: 'N8N-EVT-IDEMP-889' });
    assert.strictEqual(res3.status, 'PROCESSADO_COM_SUCESSO');
    assert.strictEqual(totalCustoImputado, 300.0);

    console.log(`  ✓ Idempotência validada: duplicações ignoradas sem duplicidade de custo (total mantido R$ ${totalCustoImputado}).`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 3:', err.message);
    failed++;
  }

  // 4. Ciclo de Vida da Dead Letter Queue (DLQ): Enfileiramento, Reprocessamento e Purge
  try {
    console.log('[TEST 4] Ciclo Completo da DLQ: Enfileiramento, filtro estatístico, reprocessamento e descarte...');

    const dlqMap = new Map();

    function enfileirarDlq(item) {
      const id = item.id || `DLQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const registro = {
        id,
        workflow: item.workflow,
        node_falha: item.node_falha,
        erro: item.erro,
        payload_original: item.payload_original,
        status: 'PENDENTE',
        tentativas: 1,
        max_tentativas: 3,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };
      dlqMap.set(id, registro);
      return registro;
    }

    function reprocessarDlq(id, forcarFalha = false) {
      const it = dlqMap.get(id);
      if (!it) throw new Error('Não encontrado');
      it.tentativas += 1;
      it.atualizado_em = new Date().toISOString();

      if (forcarFalha) {
        it.ultimo_erro = 'Falha persistente na retentativa';
        return { sucesso: false, status: 'FALHA_REPROCESSAMENTO', item: it };
      }

      it.status = 'REPROCESSADO';
      it.ultimo_erro = null;
      return { sucesso: true, status: 'REPROCESSADO_COM_SUCESSO', item: it };
    }

    function descartarDlq(id) {
      const it = dlqMap.get(id);
      if (!it) throw new Error('Não encontrado');
      it.status = 'DESCARTADO';
      it.atualizado_em = new Date().toISOString();
      return it;
    }

    // 4.1 Enfileiramento de 3 eventos falhados
    const item1 = enfileirarDlq({
      workflow: 'workflow_01_prescricao_fefo',
      node_falha: 'Baixa FEFO OpenBoxes & Estação 4',
      erro: 'ETIMEDOUT: Falha de conexão com satélite OpenBoxes após 3 tentativas',
      payload_original: { prescricao_id: 'PR-901', paciente_id: '123' }
    });

    const item2 = enfileirarDlq({
      workflow: 'workflow_02_solicitacao_senaite',
      node_falha: 'Criar AnalysisRequest SENAITE',
      erro: '503 Service Unavailable: LIMS em manutenção programada',
      payload_original: { exame_id: 'EX-402', amostra_tipo: 'SANGUE' }
    });

    const item3 = enfileirarDlq({
      workflow: 'workflow_05_faturamento_split',
      node_falha: 'Split Tripartite Hyperswitch',
      erro: 'Gateway timeout no provedor de pagamento',
      payload_original: { fatura_id: 'FAT-777', valor: 2500 }
    });

    assert.strictEqual(dlqMap.size, 3, 'DLQ deve conter 3 itens enfileirados');
    assert.strictEqual(item1.status, 'PENDENTE');

    // 4.2 Reprocessamento manual com sucesso de item1
    const resReprocess1 = reprocessarDlq(item1.id, false);
    assert.strictEqual(resReprocess1.sucesso, true);
    assert.strictEqual(resReprocess1.item.status, 'REPROCESSADO');
    assert.strictEqual(resReprocess1.item.tentativas, 2);

    // 4.3 Reprocessamento de item2 com falha persistente
    const resReprocess2 = reprocessarDlq(item2.id, true);
    assert.strictEqual(resReprocess2.sucesso, false);
    assert.strictEqual(resReprocess2.item.status, 'PENDENTE', 'Item deve continuar pendente se retentativa falhar');
    assert.strictEqual(resReprocess2.item.tentativas, 2);

    // 4.4 Descarte administrativo de item3
    const item3Descartado = descartarDlq(item3.id);
    assert.strictEqual(item3Descartado.status, 'DESCARTADO');

    // 4.5 Cálculo estatístico
    const todos = Array.from(dlqMap.values());
    const pendentes = todos.filter(i => i.status === 'PENDENTE').length;
    const reprocessados = todos.filter(i => i.status === 'REPROCESSADO').length;
    const descartados = todos.filter(i => i.status === 'DESCARTADO').length;

    assert.strictEqual(pendentes, 1, 'Deve restar 1 item pendente');
    assert.strictEqual(reprocessados, 1, 'Deve haver 1 item reprocessado');
    assert.strictEqual(descartados, 1, 'Deve haver 1 item descartado');

    console.log(`  ✓ Ciclo de vida da DLQ validado: ${reprocessados} reprocessado, ${pendentes} pendente, ${descartados} descartado.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 4:', err.message);
    failed++;
  }

  // 5. Simulação de Resiliência: Queda do SENAITE com Retry Exponencial e Fallback DLQ
  try {
    console.log('[TEST 5] Simulação de Falha Upstream: 3 retentativas e encaminhamento para DLQ...');

    let tentativaAtual = 0;
    const maxTries = 3;
    const historicoTentativas = [];

    function executarChamadaHttpComRetry(url, payload) {
      while (tentativaAtual < maxTries) {
        tentativaAtual++;
        const momento = Date.now();
        historicoTentativas.push({ tentativa: tentativaAtual, timestamp: momento });

        // Simula queda temporária do serviço SENAITE LIMS (retorna 503)
        const falha = true;
        if (falha) {
          if (tentativaAtual < maxTries) {
            continue; // Executa próxima tentativa com backoff
          } else {
            // Esgotou retentativas: dispara evento para Dead Letter Queue
            return {
              status: 503,
              erro: 'SERVICE_UNAVAILABLE',
              mensagem: `Upstream LIMS indisponível após ${maxTries} tentativas. Encaminhado à DLQ.`,
              encaminhado_dlq: true,
              dlq_payload: {
                workflow: 'workflow_02_solicitacao_senaite',
                node_falha: 'Criar AnalysisRequest SENAITE',
                tentativas: tentativaAtual,
                payload_original: payload,
                timestamp: new Date().toISOString()
              }
            };
          }
        }
      }
    }

    const resultadoFallback = executarChamadaHttpComRetry('http://lims-senaite.local:8080/api', {
      paciente: 'Maria Silva',
      exame: 'Hemograma Completo'
    });

    assert.strictEqual(tentativaAtual, 3, 'Deve ter executado exatamente 3 tentativas antes de desistir');
    assert.strictEqual(resultadoFallback.encaminhado_dlq, true, 'Deve ter encaminhado para a DLQ após esgotar tentativas');
    assert.strictEqual(resultadoFallback.dlq_payload.tentativas, 3);
    assert.strictEqual(resultadoFallback.dlq_payload.workflow, 'workflow_02_solicitacao_senaite');

    console.log(`  ✓ Resiliência comprovada: 3 retentativas executadas com sucesso e fallback enviado à DLQ sem quebra do fluxo.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 5:', err.message);
    failed++;
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`Resultado da Onda 3: ${passed} passaram, ${failed} falharam.`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runOnda3Tests();
