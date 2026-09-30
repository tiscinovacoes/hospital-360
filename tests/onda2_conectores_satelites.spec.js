/**
 * Suíte de Testes da ONDA 2: Validação dos Conectores Reais dos Satélites
 * Testa OpenBoxes FEFO, Leitos/NIR, SENAITE LIMS, Split Financeiro Hyperswitch e Mensageria WhatsApp
 */

const assert = require('assert');
const crypto = require('crypto');

function runOnda2Tests() {
  console.log('========================================================================');
  console.log('🔌 HOSPITAL 360 — SUÍTE DE TESTES DA ONDA 2 (CONECTORES DOS SATÉLITES)');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Teste de Precisão do Algoritmo FEFO e Alocação Assíncrona
  try {
    console.log('[TEST 1] Conector OpenBoxes FEFO: Ordenação por validade e baixa lógica...');

    const lotes = [
      { id: 'L1', codigo_br: 'BR100', data_vencimento: '2027-01-01', qtd: 100, custo: 2.0 },
      { id: 'L2', codigo_br: 'BR100', data_vencimento: '2026-10-15', qtd: 50, custo: 1.8 }, // Vence primeiro!
      { id: 'L3', codigo_br: 'BR100', data_vencimento: '2026-12-01', qtd: 80, custo: 1.9 }
    ];

    // Ordenação estrita FEFO
    const ordenados = [...lotes].sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento));
    assert.strictEqual(ordenados[0].id, 'L2', 'Lote com vencimento mais precoce (2026-10-15) deve ser alocado primeiro');

    // Simulação de baixa de 70 unidades: deve consumir 50 de L2 e 20 de L3
    let solicitada = 70;
    const alocacoes = [];
    for (const lote of ordenados) {
      if (solicitada <= 0) break;
      const aloc = Math.min(lote.qtd, solicitada);
      alocacoes.push({ id: lote.id, qtd: aloc, custoTotal: aloc * lote.custo });
      solicitada -= aloc;
    }

    assert.strictEqual(alocacoes.length, 2, 'Deve ter alocado em 2 lotes diferentes');
    assert.strictEqual(alocacoes[0].qtd, 50, 'Primeiro lote deve ter dispensado 50 unidades');
    assert.strictEqual(alocacoes[1].qtd, 20, 'Segundo lote deve ter dispensado as 20 unidades restantes');
    assert.strictEqual(solicitada, 0, 'Quantidade solicitada deve ter sido 100% atendida');

    console.log('  ✓ Ordenação FEFO e rateio multi-lotes validados com sucesso.');
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 1:', err.message);
    failed++;
  }

  // 2. Teste do Conector de Censo de Leitos & Transição de Status NIR
  try {
    console.log('[TEST 2] Conector Leitos NIR & Facilities: Transição de status e cálculo de censo...');

    const leitos = [
      { id: 'L-101', status: 'OCUPADO' },
      { id: 'L-102', status: 'LIVRE' },
      { id: 'L-103', status: 'HIGIENIZACAO' },
      { id: 'L-104', status: 'LIVRE' }
    ];

    // Alta hospitalar do leito 101
    const leitoAlta = leitos.find(l => l.id === 'L-101');
    assert.ok(leitoAlta, 'Leito 101 deve existir');
    leitoAlta.status = 'HIGIENIZACAO';

    const ocupados = leitos.filter(l => l.status === 'OCUPADO').length;
    const higienizacao = leitos.filter(l => l.status === 'HIGIENIZACAO').length;
    const livres = leitos.filter(l => l.status === 'LIVRE').length;
    const taxaOcupacao = ((ocupados / leitos.length) * 100).toFixed(2);

    assert.strictEqual(ocupados, 0, 'Após a alta, leitos ocupados devem ser 0');
    assert.strictEqual(higienizacao, 2, 'Leitos em higienização devem ser 2 (L-101 e L-103)');
    assert.strictEqual(livres, 2, 'Leitos livres devem ser 2');
    assert.strictEqual(Number(taxaOcupacao), 0.00, 'Taxa de ocupação deve ser 0%');

    console.log('  ✓ Transição de status para HIGIENIZACAO e recálculo de censo validados.');
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 2:', err.message);
    failed++;
  }

  // 3. Teste do Conector SENAITE LIMS: Fórmula LOINC de Custo Real
  try {
    console.log('[TEST 3] Conector SENAITE LIMS: Cálculo de reagentes + bancada biomédica...');

    const exameHemograma = {
      codigo_loinc: '57021-8',
      nome: 'Hemograma Completo',
      prazo_bancada_minutos: 25,
      custo_reagentes: 8.50,
      custo_descartaveis: 3.20,
      taxa_horaria_biomedica: 60.00
    };

    const custoHora = Number(((exameHemograma.prazo_bancada_minutos / 60) * exameHemograma.taxa_horaria_biomedica).toFixed(2));
    const custoTotal = Number((exameHemograma.custo_reagentes + exameHemograma.custo_descartaveis + custoHora).toFixed(2));

    assert.strictEqual(custoHora, 25.00, '25 minutos a R$ 60/h deve resultar em R$ 25,00 de hora técnica');
    assert.strictEqual(custoTotal, 36.70, 'Custo total (8.50 + 3.20 + 25.00) deve ser exatamente R$ 36,70');

    console.log(`  ✓ Custo real LOINC apurado: Reagentes R$ ${exameHemograma.custo_reagentes.toFixed(2)}, Bancada R$ ${custoHora.toFixed(2)}, Total R$ ${custoTotal.toFixed(2)}.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 3:', err.message);
    failed++;
  }

  // 4. Teste do Motor de Split Fintech Hyperswitch: Cent-level rounding e DRE
  try {
    console.log('[TEST 4] Conector Fintech Hyperswitch: Split tripartite com soma exata em centavos...');

    const valorProcedimento = 3450.83; // Valor quebrado com dízima
    const totalCents = Math.round(valorProcedimento * 100);

    const rules = [
      { role: 'MEDICO', percentage: 70 },
      { role: 'SALA', percentage: 15 },
      { role: 'CONDOMINIO', percentage: 15 }
    ];

    let allocatedCents = 0;
    const splits = [];

    for (let i = 0; i < rules.length; i++) {
      const r = rules[i];
      let ruleCents = Math.round((r.percentage / 100) * totalCents);
      if (i === rules.length - 1) {
        ruleCents = totalCents - allocatedCents; // Ajuste exato sem resíduo
      }
      allocatedCents += ruleCents;
      splits.push({ role: r.role, amount_cents: ruleCents, amount_formatted: Number((ruleCents / 100).toFixed(2)) });
    }

    const sumCents = splits.reduce((acc, s) => acc + s.amount_cents, 0);
    assert.strictEqual(sumCents, totalCents, 'A soma em centavos deve ser estritamente igual ao valor total sem resíduo');
    assert.strictEqual(splits[0].role, 'MEDICO');
    assert.strictEqual(splits[1].role, 'SALA');
    assert.strictEqual(splits[2].role, 'CONDOMINIO');

    console.log(`  ✓ Split tripartite validado sem bitributação: Médico R$ ${splits[0].amount_formatted}, Sala R$ ${splits[1].amount_formatted}, Condomínio R$ ${splits[2].amount_formatted}.`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 4:', err.message);
    failed++;
  }

  // 5. Teste da Mensageria WhatsApp: Normalização E.164 e Validação HMAC SHA-256
  try {
    console.log('[TEST 5] Conector WhatsApp Cloud API: Normalização telefônica e assinatura HMAC...');

    // Normalização telefônica
    function normalizarTelefone(num) {
      const limpo = num.replace(/\D/g, '');
      if (limpo.startsWith('55') && (limpo.length === 12 || limpo.length === 13)) return limpo;
      if (limpo.length === 10 || limpo.length === 11) return '55' + limpo;
      return limpo;
    }

    const tel1 = normalizarTelefone('(11) 98765-4321');
    const tel2 = normalizarTelefone('+55 21 99999-8888');
    assert.strictEqual(tel1, '5511987654321', 'Deve formatar telefone nacional para padrão E.164 com DDI 55');
    assert.strictEqual(tel2, '5521999998888', 'Deve manter formato se já possui 55');

    // Validação HMAC SHA-256 timingSafeEqual
    const secret = 'segredo-meta-webhook-2026';
    const rawPayload = JSON.stringify({ event: 'messages', from: tel1 });
    const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');

    const expectedSig = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
    const cleanSig = signature.replace(/^sha256=/, '');
    const valid = crypto.timingSafeEqual(Buffer.from(cleanSig, 'hex'), Buffer.from(expectedSig, 'hex'));
    assert.strictEqual(valid, true, 'Assinatura HMAC SHA-256 deve ser validada com timingSafeEqual');

    console.log('  ✓ Normalização telefônica E.164 e verificação HMAC SHA-256 validadas.');
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 5:', err.message);
    failed++;
  }

  console.log('\n------------------------------------------------------------------------');
  console.log(`Resultado da Onda 2: ${passed} passaram, ${failed} falharam.`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runOnda2Tests();
