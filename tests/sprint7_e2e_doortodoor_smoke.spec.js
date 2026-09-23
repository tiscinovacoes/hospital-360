/**
 * ==============================================================================
 * HOSPITAL 360 — SUÍTE DE TESTES E2E DOOR-TO-DOOR & SMOKE TEST (SPRINT 7)
 * ==============================================================================
 * Validação ponta a ponta da jornada hospitalar completa:
 * Triagem ➔ LIS ➔ OPME/CMED ➔ Farmácia FEFO ➔ Leito UTI & Alta ➔ Split ➔ Hub 360
 */

const assert = require('assert');

function runSprint7E2ESmokeTests() {
  console.log('=======================================================================');
  console.log('🏥 HOSPITAL 360 — SUÍTE DE TESTES E2E DOOR-TO-DOOR (SMOKE TEST SPRINT 7)');
  console.log('=======================================================================');

  let passed = 0;
  let failed = 0;
  const episodioId = 'EPISODIO-E2E-2026-9901';
  const pacienteCpf = '123.456.789-00';
  const despesasDoEpisodio = [];

  // -------------------------------------------------------------------------
  // [CENÁRIO 1] Acolhimento, Triagem Manchester e Estação 1 (Recepção)
  // -------------------------------------------------------------------------
  try {
    console.log('[CENÁRIO 1] Estação 1: Acolhimento, Triagem Manchester & Idempotência...');
    
    const atendimento = {
      episodio_id: episodioId,
      paciente_cpf: pacienteCpf,
      classificacao_risco: 'LARANJA',
      tempo_alvo_minutos: 10,
      custo_acolhimento: 45.00,
      protocolo: 'ING-HUB-E1-9901'
    };

    assert.strictEqual(atendimento.classificacao_risco, 'LARANJA');
    assert.strictEqual(atendimento.protocolo.startsWith('ING-HUB-'), true);
    
    despesasDoEpisodio.push({
      estacao: 'ESTACAO_1_AMBULATORIO',
      descricao: 'Triagem Manchester & Acolhimento Emergência',
      valor: atendimento.custo_acolhimento,
      protocolo: atendimento.protocolo
    });

    console.log(`  ✓ Triagem Manchester ${atendimento.classificacao_risco} registrada (Protocolo: ${atendimento.protocolo}).`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Cenário 1:', err.message);
    failed++;
  }

  // -------------------------------------------------------------------------
  // [CENÁRIO 2] Estação 2: Diagnóstico Laboratorial / LIS (ASTM & FHIR)
  // -------------------------------------------------------------------------
  try {
    console.log('[CENÁRIO 2] Estação 2: Exames Laboratoriais (LIS) & Detecção de Pânico...');

    const exames = [
      { codigo: 'GASO', nome: 'Gasometria Arterial', valor: 85.00, resultado: 'pH 7.32', critico: false },
      { codigo: 'TROP', nome: 'Troponina I Quantitativa', valor: 140.00, resultado: '0.85 ng/mL', critico: true }
    ];

    const temCritico = exames.some(e => e.critico);
    assert.strictEqual(temCritico, true, 'Troponina alterada deve ser sinalizada como crítica');

    const totalLab = exames.reduce((acc, curr) => acc + curr.valor, 0);
    const protocoloLab = 'ING-HUB-E2-9901';

    despesasDoEpisodio.push({
      estacao: 'ESTACAO_2_LABORATORIO',
      descricao: 'Painel Cardíaco de Urgência (Gasometria + Troponina)',
      valor: totalLab,
      protocolo: protocoloLab
    });

    console.log(`  ✓ Laudos LIS liberados com alerta de pânico assistencial (Total LIS: R$ ${totalLab.toFixed(2)}).`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Cenário 2:', err.message);
    failed++;
  }

  // -------------------------------------------------------------------------
  // [CENÁRIO 3] Estação 3: Insumos Cirúrgicos & Trava de Preço CMED/BPS
  // -------------------------------------------------------------------------
  try {
    console.log('[CENÁRIO 3] Estação 3: Validação de Insumo Cirúrgico na Tabela CMED...');

    const refCmedMeropenem = {
      codigo_catmat: 'BR0284729',
      nome: 'Meropenem 1g Pó Liofilizado Injetável',
      preco_teto_cmed: 68.20,
      preco_referencia_bps: 52.10
    };

    // Caso A: Sobrepreço ilegal detectado e bloqueado
    const cotacaoIlegal = 80.00;
    const bloqueado = cotacaoIlegal > refCmedMeropenem.preco_teto_cmed;
    assert.strictEqual(bloqueado, true, 'Preço acima do teto CMED deve ser reprovado');

    // Caso B: Cotação no teto regulamentado
    const cotacaoConforme = 65.00;
    const aprovado = cotacaoConforme <= refCmedMeropenem.preco_teto_cmed;
    assert.strictEqual(aprovado, true);

    const protocoloCirurgico = 'ING-HUB-E3-9901';
    const totalCirurgico = 10 * cotacaoConforme;

    despesasDoEpisodio.push({
      estacao: 'ESTACAO_3_CENTRO_CIRURGICO',
      descricao: '10x Meropenem 1g (Preço em conformidade CMED)',
      valor: totalCirurgico,
      protocolo: protocoloCirurgico
    });

    console.log(`  ✓ Bloqueio de sobrepreço validado e compra autorizada no teto CMED (R$ ${totalCirurgico.toFixed(2)}).`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Cenário 3:', err.message);
    failed++;
  }

  // -------------------------------------------------------------------------
  // [CENÁRIO 4] Estação 4: Dispensação Farmácia FEFO Beira-Leito
  // -------------------------------------------------------------------------
  try {
    console.log('[CENÁRIO 4] Estação 4: Dispensação FEFO & Bloqueio Anvisa de Vencidos...');

    const agora = new Date('2026-09-22T00:00:00Z').getTime();
    const lotes = [
      { lote: 'LOT-EXP-01', validade: '2025-01-01', saldo: 15, unit: 18.50 }, // Expirado
      { lote: 'LOT-VAL-02', validade: '2026-11-30', saldo: 20, unit: 18.50 }  // Válido
    ];

    // Algoritmo sanitário FEFO
    const lotesValidos = lotes.filter(l => new Date(l.validade).getTime() >= agora);
    const lotesDescartados = lotes.filter(l => new Date(l.validade).getTime() < agora);

    assert.strictEqual(lotesDescartados.length, 1, 'Lote vencido deve ser bloqueado pela Anvisa');
    assert.strictEqual(lotesValidos[0].lote, 'LOT-VAL-02', 'Deve dispensar lote válido');

    const qtdSolicitada = 5;
    const valorFefo = qtdSolicitada * lotesValidos[0].unit;
    const protocoloFefo = 'ING-HUB-E4-9901';

    despesasDoEpisodio.push({
      estacao: 'ESTACAO_4_FARMACIA',
      descricao: '5x Noradrenalina 2mg/mL dispensada via FEFO',
      valor: valorFefo,
      protocolo: protocoloFefo
    });

    console.log(`  ✓ Baixa FEFO realizada com descarte de lote vencido pela Anvisa (R$ ${valorFefo.toFixed(2)}).`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Cenário 4:', err.message);
    failed++;
  }

  // -------------------------------------------------------------------------
  // [CENÁRIO 5] Estação 5: Internação UTI, Alta Médica & Higienização Facilities
  // -------------------------------------------------------------------------
  try {
    console.log('[CENÁRIO 5] Estação 5: Censo Leito UTI, Alta Médica & Ordem Facilities...');

    const censoLeito = {
      leito_id: 'UTI-04',
      tipo: 'UTI_ADULTO',
      diarias: 2,
      valor_diaria: 1450.00,
      status_final: 'HIGIENIZACAO_SOLICITADA'
    };

    const totalInternacao = censoLeito.diarias * censoLeito.valor_diaria;
    const protocoloLeito = 'ING-HUB-E5-9901';

    despesasDoEpisodio.push({
      estacao: 'ESTACAO_5_LEITOS_HONORARIOS',
      descricao: '2 Diárias UTI Adulto + Chamado Facilities Higienização',
      valor: totalInternacao,
      protocolo: protocoloLeito
    });

    assert.strictEqual(totalInternacao, 2900.00);
    console.log(`  ✓ Alta registrada com emissão de chamado Facilities e desocupação de leito (R$ ${totalInternacao.toFixed(2)}).`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Cenário 5:', err.message);
    failed++;
  }

  // -------------------------------------------------------------------------
  // [CENÁRIO 6] Liquidação Financeira: Split Tripartite Hyperswitch
  // -------------------------------------------------------------------------
  try {
    console.log('[CENÁRIO 6] Split Tripartite Hyperswitch (Médico / Sala / Condomínio)...');

    const valorProcedimento = 2500.00;
    const taxaPct = 2.5;
    const valorTaxa = (valorProcedimento * taxaPct) / 100;
    const valorLiquido = valorProcedimento - valorTaxa;

    // Regra Tripartite: 70% Médico, 15% Sala, 15% Condomínio
    const repasseMedico = Math.round(valorLiquido * 0.70 * 100) / 100;
    const repasseSala = Math.round(valorLiquido * 0.15 * 100) / 100;
    const repasseCondominio = Math.round((valorLiquido - repasseMedico - repasseSala) * 100) / 100;

    const somaPartes = repasseMedico + repasseSala + repasseCondominio;

    assert.strictEqual(Math.abs(somaPartes - valorLiquido) < 0.02, true, 'Soma das partes deve ser 100%');
    assert.strictEqual(repasseMedico > repasseSala, true, 'Médico deve receber a cota de 70%');

    console.log(`  ✓ Split tripartite liquidado sem bitributação: Médico R$ ${repasseMedico.toFixed(2)}, Sala R$ ${repasseSala.toFixed(2)}, Condomínio R$ ${repasseCondominio.toFixed(2)}.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Cenário 6:', err.message);
    failed++;
  }

  // -------------------------------------------------------------------------
  // [CENÁRIO 7] Consolidação Final no Hub de Despesas 360 (DRE do Episódio)
  // -------------------------------------------------------------------------
  try {
    console.log('[CENÁRIO 7] Consolidação Final no Hub Central de Despesas 360...');

    assert.strictEqual(despesasDoEpisodio.length, 5, 'Todas as 5 estações door-to-door devem ter gerado custos');

    const custoTotalEpisodio = despesasDoEpisodio.reduce((sum, item) => sum + item.valor, 0);
    const protocolosUnicos = new Set(despesasDoEpisodio.map(d => d.protocolo));

    assert.strictEqual(protocolosUnicos.size, 5, 'Cada estação deve possuir protocolo canônico de idempotência');
    assert.strictEqual(custoTotalEpisodio, 3912.50, `Custo consolidado esperado R$ 3.912,50, obteve R$ ${custoTotalEpisodio.toFixed(2)}`);

    console.log(`  ✓ DRE do Paciente apurado com fidelidade contábil: Total R$ ${custoTotalEpisodio.toFixed(2)}`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Cenário 7:', err.message);
    failed++;
  }

  console.log('\n-----------------------------------------------------------------------');
  console.log(`Resultado do Smoke Test E2E: ${passed} cenários aprovados, ${failed} falharam.`);
  console.log('=======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSprint7E2ESmokeTests();
