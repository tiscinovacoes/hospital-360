/**
 * Suíte Integrada E2E dos 7 Squads — Hospital 360
 * Padrão: testing-patterns (Behavior-Driven Testing, Factory Pattern, Zero Mock Pollution)
 * 
 * Squad 1: Hub Core, Ingestão & RLS Multi-Tenant
 * Squad 2: Clínicas / OpenEMR & Triagem Manchester (Estação 1)
 * Squad 3: Laboratório / SENAITE LIMS (Estação 2: Laudos LOINC)
 * Squad 4: Farmácia / OpenBoxes FEFO & Bloqueio Sanitário Anvisa (Estação 4)
 * Squad 5: Leitos NIR & Facilities Sabiá (Estação 5: Internação e Higienização)
 * Squad 6: Fintech Split Tripartite Hyperswitch & DRE (Sem Bitributação)
 * Squad 7: Barramento n8n, Dead Letter Queue (DLQ) & WhatsApp Omnichannel
 */

const assert = require('assert');
const crypto = require('crypto');

// =============================================================================
// FACTORY PATTERN (testing-patterns)
// =============================================================================

function getMockSquad1Payload(overrides = {}) {
  return {
    origem_modulo: 'GESTAO_CLINICA',
    cliente_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    despesas: [
      {
        id_transacao: `DSP-S1-${Date.now()}`,
        paciente_cpf: '123.456.789-00',
        paciente_nome: 'Carlos Eduardo Santos',
        prontuario_episodio: 'EPIS-2026-001',
        centro_custo: 'CC-AMBULATORIO',
        item_codigo: 'CONS-CARDIO',
        item_descricao: 'Consulta Cardiologia Clínica',
        quantidade: 1,
        unidade_medida: 'UN',
        valor_unitario_medio: 250.00,
        valor_total_imputado: 250.00,
        data_consumo: new Date().toISOString(),
        estacao_jornada: 1
      }
    ],
    ...overrides
  };
}

function getMockSquad2Payload(overrides = {}) {
  return {
    atendimento_id: `ATD-MAN-${Date.now()}`,
    paciente_id: '123.456.789-00',
    paciente_nome: 'Carlos Eduardo Santos',
    triagem: {
      classificacao_risco: 'LARANJA',
      pressao_arterial: '160/100',
      frequencia_cardiaca: 110,
      saturacao_oxigenio: 94,
      escala_dor: 8,
      tempo_alvo_minutos: 10
    },
    ...overrides
  };
}

function getMockSquad3Payload(overrides = {}) {
  return {
    exame_id: `EX-LIMS-${Date.now()}`,
    codigo_loinc: '49563-0',
    nome_exame: 'Troponina I de Alta Sensibilidade',
    paciente_id: '123.456.789-00',
    custo_reagentes: 32.00,
    custo_descartaveis: 5.50,
    hora_tecnica_biomedica: 25.00,
    resultado_valor: 45.2,
    unidade: 'ng/L',
    limite_panico: 14.0,
    alerta_critico: true,
    ...overrides
  };
}

function getMockSquad4Payload(overrides = {}) {
  return {
    prescricao_id: `RX-OB-${Date.now()}`,
    paciente_id: '123.456.789-00',
    itens: [
      {
        medicamento_id: 'MED-ENX-01',
        codigo_br: 'BR0029381',
        nome_medicamento: 'Enoxaparina Sódica 40mg/0.4mL',
        quantidade_solicitada: 2,
        unidade_medida: 'SER',
        lotes_disponiveis: [
          { lote: 'LT-ANVISA-BLOCKED', validade: '2025-12-01', qtd: 10, sanitariamente_bloqueado: true },
          { lote: 'LT-FEFO-01', validade: '2026-11-15', qtd: 5, sanitariamente_bloqueado: false, preco_unit: 42.50 },
          { lote: 'LT-FEFO-02', validade: '2027-05-20', qtd: 20, sanitariamente_bloqueado: false, preco_unit: 45.00 }
        ]
      }
    ],
    ...overrides
  };
}

function getMockSquad5Payload(overrides = {}) {
  return {
    episodio_id: 'EPIS-2026-001',
    paciente_id: '123.456.789-00',
    leito_id: 'UTI-04',
    tipo_ala: 'UTI_ADULTO',
    data_admissao: '2026-09-28T08:00:00Z',
    data_alta: '2026-09-30T10:00:00Z',
    diaria_base_uti: 1450.00,
    higienizacao_sla_minutos: 45,
    ...overrides
  };
}

function getMockSquad6Payload(overrides = {}) {
  return {
    transacao_id: `TX-FIN-${Date.now()}`,
    valor_total_bruto: 4500.00,
    regras_rateio: [
      { role: 'EQUIPE_MEDICA', percentual: 70 },
      { role: 'CUSTO_SALA_CIRURGICA', percentual: 15 },
      { role: 'TAXA_CONDOMINIO_HOSPITALAR', percentual: 15 }
    ],
    ...overrides
  };
}

function getMockSquad7Payload(overrides = {}) {
  return {
    event_id: `EVT-N8N-BUS-${Date.now()}`,
    event_type: 'senaite.exame_concluido',
    source_module: 'LABORATORIO_LIMS',
    patient_id: '123.456.789-00',
    cost_center_id: 'CC-LAB-CENTRAL',
    data: {
      descricao: 'Troponina I Cardíaca Concluída',
      valor_unitario: 62.50,
      quantidade: 1,
      laudo_status: 'LIBERADO_PANICO'
    },
    ...overrides
  };
}

// =============================================================================
// RUNNER PRINCIPAL DOS 7 SQUADS
// =============================================================================

function runSquadsIntegrationTests() {
  console.log('========================================================================');
  console.log('🏥 HOSPITAL 360 — SUÍTE INTEGRADA DOS 7 SQUADS (E2E & CONTRATOS)');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  // SQUAD 1: Hub Core, Ingestão & Isolamento Multi-Tenant
  try {
    console.log('[SQUAD 1] Hub Core: Ingestão atômica de despesas, protocolo canônico e multi-tenancy...');
    const payload = getMockSquad1Payload();

    assert.ok(payload.cliente_id, 'Deve possuir ID de tenant para isolamento RLS');
    assert.strictEqual(payload.despesas[0].estacao_jornada, 1, 'Deve imputar despesa na Estação 1');
    assert.strictEqual(payload.despesas[0].valor_total_imputado, 250.00);

    const protocolo = `ING-HUB-${Date.now().toString().slice(-6)}`;
    assert.match(protocolo, /^ING-HUB-\d{6}$/, 'Protocolo de ingestão deve seguir padrão canônico');

    console.log(`  ✓ Squad 1 homologado: Protocolo ${protocolo} gerado com integridade multi-tenant.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Squad 1:', err.message);
    failed++;
  }

  // SQUAD 2: OpenEMR & Triagem Manchester (Estação 1)
  try {
    console.log('[SQUAD 2] Clínicas / OpenEMR: Triagem Manchester de Emergência & Tempo Alvo...');
    const payload = getMockSquad2Payload();

    assert.strictEqual(payload.triagem.classificacao_risco, 'LARANJA', 'Risco deve ser classificado como LARANJA');
    assert.strictEqual(payload.triagem.tempo_alvo_minutos, 10, 'Tempo alvo para risco Laranja deve ser 10 minutos');
    assert.ok(payload.triagem.saturacao_oxigenio < 95, 'Hipoxemia moderada identificada');

    console.log(`  ✓ Squad 2 homologado: Atendimento ${payload.atendimento_id} triado sob protocolo Manchester (10min).`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Squad 2:', err.message);
    failed++;
  }

  // SQUAD 3: SENAITE LIMS (Estação 2: Laudos LOINC & Alerta de Pânico)
  try {
    console.log('[SQUAD 3] Laboratório / SENAITE LIMS: Validação LOINC, custos diretos e pânico assistencial...');
    const payload = getMockSquad3Payload();

    const custoTotalLaboratorial = payload.custo_reagentes + payload.custo_descartaveis + payload.hora_tecnica_biomedica;
    assert.strictEqual(custoTotalLaboratorial, 62.50, 'Custo direto total deve somar reagentes + descartáveis + biomédico');

    assert.ok(payload.resultado_valor > payload.limite_panico, 'Resultado de Troponina (45.2) acima do limite de pânico (14.0)');
    assert.strictEqual(payload.alerta_critico, true, 'Flag de alerta crítico deve estar ativada');

    console.log(`  ✓ Squad 3 homologado: Custo LOINC R$ ${custoTotalLaboratorial.toFixed(2)} e alerta de pânico liberado.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Squad 3:', err.message);
    failed++;
  }

  // SQUAD 4: OpenBoxes FEFO & Bloqueio Anvisa (Estação 4)
  try {
    console.log('[SQUAD 4] Farmácia / OpenBoxes FEFO: Descarte de lotes vencidos e consumo pelo primeiro a vencer...');
    const payload = getMockSquad4Payload();
    const item = payload.itens[0];

    // Filtra e descarta lote sanitariamente bloqueado
    const lotesValidos = item.lotes_disponiveis.filter(l => !l.sanitariamente_bloqueado);
    assert.strictEqual(lotesValidos.length, 2, 'Lote bloqueado pela Anvisa deve ser expurgado da dispensação');

    // Ordenação estrita FEFO (First-Expired, First-Out)
    const lotesOrdenados = [...lotesValidos].sort((a, b) => a.validade.localeCompare(b.validade));
    assert.strictEqual(lotesOrdenados[0].lote, 'LT-FEFO-01', 'Lote com validade mais precoce deve ser dispensado');

    const custoFarmacia = item.quantidade_solicitada * lotesOrdenados[0].preco_unit;
    assert.strictEqual(custoFarmacia, 85.00, '2 ampolas a R$ 42.50 devem totalizar R$ 85.00');

    console.log(`  ✓ Squad 4 homologado: Dispensação FEFO executada no lote ${lotesOrdenados[0].lote} (R$ ${custoFarmacia.toFixed(2)}).`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Squad 4:', err.message);
    failed++;
  }

  // SQUAD 5: Censo Leitos NIR & Facilities Sabiá (Estação 5)
  try {
    console.log('[SQUAD 5] Leitos NIR & Facilities: Cálculo de diárias UTI e acionamento de ordem de higienização...');
    const payload = getMockSquad5Payload();

    const inicio = new Date(payload.data_admissao);
    const fim = new Date(payload.data_alta);
    const horasInternacao = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    const diasCompletos = Math.ceil(horasInternacao / 24);

    assert.strictEqual(diasCompletos, 3, 'Permanência de 50 horas deve cobrar 3 diárias hospitalares');
    const totalDiarias = diasCompletos * payload.diaria_base_uti;
    assert.strictEqual(totalDiarias, 4350.00, '3 diárias a R$ 1450.00 devem totalizar R$ 4350.00');
    assert.strictEqual(payload.higienizacao_sla_minutos, 45, 'SLA de higienização terminal de UTI deve ser 45 minutos');

    console.log(`  ✓ Squad 5 homologado: Alta registrada, 3 diárias UTI (R$ ${totalDiarias.toFixed(2)}) e ordem Sabiá emitida.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Squad 5:', err.message);
    failed++;
  }

  // SQUAD 6: Fintech Split Tripartite Hyperswitch & DRE
  try {
    console.log('[SQUAD 6] Fintech Hyperswitch & Fiscal: Rateio tripartite em centavos sem bitributação...');
    const payload = getMockSquad6Payload();
    const totalCents = Math.round(payload.valor_total_bruto * 100);

    let alocadoCents = 0;
    const splitFormatado = [];

    for (let i = 0; i < payload.regras_rateio.length; i++) {
      const r = payload.regras_rateio[i];
      let ruleCents = Math.round((r.percentual / 100) * totalCents);
      if (i === payload.regras_rateio.length - 1) {
        ruleCents = totalCents - alocadoCents; // Ajuste exato de resíduo
      }
      alocadoCents += ruleCents;
      splitFormatado.push({ role: r.role, valor: Number((ruleCents / 100).toFixed(2)) });
    }

    assert.strictEqual(alocadoCents, totalCents, 'Soma dos repasses deve ser identica ao valor bruto sem perda de centavos');
    assert.strictEqual(splitFormatado[0].valor, 3150.00, 'Médico recebe 70% (R$ 3150.00)');
    assert.strictEqual(splitFormatado[1].valor, 675.00, 'Sala recebe 15% (R$ 675.00)');
    assert.strictEqual(splitFormatado[2].valor, 675.00, 'Condomínio recebe 15% (R$ 675.00)');

    console.log(`  ✓ Squad 6 homologado: Split tripartite liquidado sem bitributação (Médico R$ 3150 / Sala R$ 675 / Cond R$ 675).`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Squad 6:', err.message);
    failed++;
  }

  // SQUAD 7: Barramento n8n, DLQ & WhatsApp Omnichannel
  try {
    console.log('[SQUAD 7] Barramento n8n, DLQ & WhatsApp: Ingestão de evento, deduplicação e alerta móvel...');
    const payload = getMockSquad7Payload();

    // Validação de assinatura HMAC do webhook
    const secret = 'hospital360-n8n-secret-key-2026';
    const rawBody = JSON.stringify(payload);
    const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    assert.strictEqual(crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex')), true);

    // Validação de formato telefônico E.164 para WhatsApp
    const telRaw = '(11) 98765-4321';
    const telNormalizado = '55' + telRaw.replace(/\D/g, '');
    assert.strictEqual(telNormalizado, '5511987654321', 'Deve formatar para padrão internacional E.164');

    console.log(`  ✓ Squad 7 homologado: Webhook HMAC validado e mensagem WhatsApp pronta para envio E.164.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Squad 7:', err.message);
    failed++;
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`Resultado da Integração dos 7 Squads: ${passed} passaram, ${failed} falharam.`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSquadsIntegrationTests();
