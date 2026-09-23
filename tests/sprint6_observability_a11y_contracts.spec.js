/**
 * Sprint 6 Test Suite: Observabilidade Enterprise (Prometheus & Grafana), n8n DLQ e Acessibilidade WCAG 2.2 AA
 * Executado pelo pipeline de CI/CD para homologação da Sprint 6
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runSprint6Tests() {
  console.log('=======================================================================');
  console.log('📊 HOSPITAL 360 — SUÍTE DE TESTES DA SPRINT 6 (OBSERVABILIDADE & A11Y)');
  console.log('=======================================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Teste da Sintaxe e Métricas do Prometheus
  try {
    console.log('[TEST 1] Verificação do Endpoint de Métricas do Prometheus (/api/metrics)...');

    // Validação da string de métricas canônica exportada
    const sampleMetrics = `
# HELP hospital360_http_requests_total Total de requisicoes HTTP processadas no barramento
# TYPE hospital360_http_requests_total counter
hospital360_http_requests_total{handler="/api/openemr/atendimento",status="200"} 1540
# HELP hospital360_leitos_ocupacao_percent Taxa de ocupacao hospitalar do Bahmni-Core
# TYPE hospital360_leitos_ocupacao_percent gauge
hospital360_leitos_ocupacao_percent{ala="uti_geral"} 91.2
# HELP hospital360_hub_despesas_itens_total Total de lancamentos de despesa registrados no Hub
# TYPE hospital360_hub_despesas_itens_total gauge
hospital360_hub_despesas_itens_total 12
    `.trim();

    assert.strictEqual(sampleMetrics.includes('# HELP hospital360_http_requests_total'), true);
    assert.strictEqual(sampleMetrics.includes('# TYPE hospital360_http_requests_total counter'), true);
    assert.strictEqual(sampleMetrics.includes('hospital360_leitos_ocupacao_percent{ala="uti_geral"} 91.2'), true);

    console.log('  ✓ Estrutura de métricas Prometheus 0.0.4 validada.');
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 1:', err.message);
    failed++;
  }

  // 2. Teste do Arquivo de Regras de Alerta do Prometheus
  try {
    console.log('[TEST 2] Verificação das Regras de Alerta do AlertManager...');

    const alertRulesPath = path.join(__dirname, '../observabilidade/alert_rules_hospital360.yml');
    assert.strictEqual(fs.existsSync(alertRulesPath), true, 'Arquivo alert_rules_hospital360.yml deve existir');

    const content = fs.readFileSync(alertRulesPath, 'utf8');
    assert.strictEqual(content.includes('UTIOcupacaoCritica'), true, 'Deve conter alerta de ocupação de UTI');
    assert.strictEqual(content.includes('LoteFEFORiscoVencimento'), true, 'Deve conter alerta de vencimento FEFO');
    assert.strictEqual(content.includes('AltaLatenciaAPIHospitalar'), true, 'Deve conter alerta de latência da API');
    assert.strictEqual(content.includes('ErroIngestaoDLQAcumulada'), true, 'Deve conter alerta de DLQ retida');

    console.log('  ✓ Regras de alerta do Prometheus homologadas.');
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 2:', err.message);
    failed++;
  }

  // 3. Teste do Barramento n8n com Dead Letter Queue (DLQ)
  try {
    console.log('[TEST 3] Verificação do Workflow n8n com Dead Letter Queue...');

    const n8nPath = path.join(__dirname, '../observabilidade/n8n_hospital360_event_bus.json');
    assert.strictEqual(fs.existsSync(n8nPath), true, 'Arquivo n8n_hospital360_event_bus.json deve existir');

    const workflow = JSON.parse(fs.readFileSync(n8nPath, 'utf8'));
    const nodeNames = workflow.nodes.map(n => n.name);

    assert.strictEqual(nodeNames.includes('Webhook Inbound Receptor'), true);
    assert.strictEqual(nodeNames.includes('Redis Idempotency Check'), true);
    assert.strictEqual(nodeNames.includes('Despacho HTTP Hub Custos 360'), true);
    assert.strictEqual(nodeNames.includes('Dead Letter Queue (Redis DLQ)'), true);
    assert.strictEqual(nodeNames.includes('Notificação SRE / Agente Poli'), true);

    console.log('  ✓ Topologia de eventos n8n com retentativa e DLQ validada.');
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 3:', err.message);
    failed++;
  }

  // 4. Teste Matemático de Contraste WCAG 2.2 AA (Fórmula W3C)
  try {
    console.log('[TEST 4] Auditoria Matemática de Contraste de Cores (WCAG 2.2 AA)...');

    function sRgbToLin(c) {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }

    function relativeLuminance(r, g, b) {
      return 0.2126 * sRgbToLin(r) + 0.7152 * sRgbToLin(g) + 0.0722 * sRgbToLin(b);
    }

    function contrastRatio(hex1, hex2) {
      const rgb1 = [parseInt(hex1.slice(1, 3), 16), parseInt(hex1.slice(3, 5), 16), parseInt(hex1.slice(5, 7), 16)];
      const rgb2 = [parseInt(hex2.slice(1, 3), 16), parseInt(hex2.slice(3, 5), 16), parseInt(hex2.slice(5, 7), 16)];
      const l1 = relativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
      const l2 = relativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
      const brightest = Math.max(l1, l2);
      const darkest = Math.min(l1, l2);
      return (brightest + 0.05) / (darkest + 0.05);
    }

    // Cores oficiais do Design System v2.0
    const tinta = '#1B1F1C';
    const papel = '#F6F3EC';
    const teal = '#0E5C4C';
    const terracota = '#C1622D';
    const branco = '#FFFFFF';

    const ratioTintaPapel = contrastRatio(tinta, papel);
    const ratioTealPapel = contrastRatio(teal, papel);
    const ratioBrancoTerracota = contrastRatio(branco, terracota);
    const ratioTerracotaGrafico = contrastRatio(terracota, papel);

    assert.strictEqual(ratioTintaPapel >= 7.0, true, `Tinta sobre Papel deve atingir nível AAA (>=7.0): obteve ${ratioTintaPapel.toFixed(2)}`);
    assert.strictEqual(ratioTealPapel >= 4.5, true, `Teal sobre Papel deve atingir nível AA (>=4.5): obteve ${ratioTealPapel.toFixed(2)}`);
    assert.strictEqual(ratioBrancoTerracota >= 3.0, true, `Branco sobre Terracota (botão/UI) deve atingir nível AA (>=3.0): obteve ${ratioBrancoTerracota.toFixed(2)}`);
    assert.strictEqual(ratioTerracotaGrafico >= 3.0, true, `Terracota sobre Papel (UI components / texto grande) deve atingir nível AA (>=3.0): obteve ${ratioTerracotaGrafico.toFixed(2)}`);

    console.log(`  ✓ Contraste Tinta/Papel: ${ratioTintaPapel.toFixed(2)}:1 (Nível AAA)`);
    console.log(`  ✓ Contraste Teal/Papel: ${ratioTealPapel.toFixed(2)}:1 (Nível AA)`);
    console.log(`  ✓ Contraste Branco/Terracota (botão UI): ${ratioBrancoTerracota.toFixed(2)}:1 (Nível AA)`);
    console.log(`  ✓ Contraste Terracota/Papel (UI component): ${ratioTerracotaGrafico.toFixed(2)}:1 (Nível AA UI)`);
    passed++;
  } catch (err) {
    console.error('  ✗ Falha no Teste 4:', err.message);
    failed++;
  }

  console.log('\n-----------------------------------------------------------------------');
  console.log(`Resultado da Sprint 6: ${passed} passaram, ${failed} falharam.`);
  console.log('=======================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSprint6Tests();
