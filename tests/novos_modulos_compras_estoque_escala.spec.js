/**
 * Teste de Homologação Integrada dos 3 Novos Módulos:
 * 1. Compras Públicas & Atas ARP (Lei 14.133/21, CMED, BPS)
 * 2. Estoque Central & CD Vigia Saúde (FEFO, Climatização RDC 430, Quarentena)
 * 3. Escala Médica & Plantonistas (Ponto GPS <100m, Trocas, Antecipação PIX D+0, CNAB 240)
 */

async function executarTestesModulos() {
  console.log('================================================================');
  console.log('INICIANDO TESTE DOS 3 NOVOS MÓDULOS EXPANDIDOS (HOSPITAL 360)');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:3000';

  // -------------------------------------------------------------
  // TESTE 1: COMPRAS PÚBLICAS & GESTÃO DE ATAS (ARP)
  // -------------------------------------------------------------
  console.log('🧪 [TESTE 1] Validando Compras Públicas & Atas ARP (Lei 14.133/21)...');
  const resAtas = await fetch(`${BASE_URL}/api/compras-atas`);
  const dataAtas = await resAtas.json();
  
  if (!dataAtas.success || dataAtas.atas.length === 0) {
    throw new Error('Falha ao listar atas de registro de preço');
  }
  console.log(`   ✓ Atas Vigentes Listadas: ${dataAtas.metricas.total_atas_vigentes}`);
  console.log(`   ✓ Valor Total Homologado: R$ ${dataAtas.metricas.valor_total_homologado.toLocaleString('pt-BR')}`);
  console.log(`   ✓ Conformidade Lei 14.133/21: ${dataAtas.metricas.conformidade_lei_14133}`);

  // Testando emissão de empenho
  const itemAta = dataAtas.atas[0].itens[0];
  const resEmpenho = await fetch(`${BASE_URL}/api/compras-atas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ata_id: dataAtas.atas[0].id,
      item_id: itemAta.id,
      quantidade_empenho: 50,
      orgao_demandante: 'Hospital Central 360',
      tipo_adesao: 'ORGAO_GERENCIADOR'
    })
  });
  const dataEmpenho = await resEmpenho.json();
  if (!dataEmpenho.success) {
    throw new Error(`Falha no empenho: ${dataEmpenho.error}`);
  }
  console.log(`   ✓ Empenho emitido com sucesso: ${dataEmpenho.empenho.numero_empenho} (R$ ${dataEmpenho.empenho.valor_total})`);

  // -------------------------------------------------------------
  // TESTE 2: ESTOQUE CENTRAL & CD VIGIA SAÚDE
  // -------------------------------------------------------------
  console.log('\n🧪 [TESTE 2] Validando Estoque Central & CD Vigia Saúde (RDC 430/2020)...');
  const resCD = await fetch(`${BASE_URL}/api/estoque-central`);
  const dataCD = await resCD.json();
  
  if (!dataCD.success || dataCD.locais.length === 0) {
    throw new Error('Falha ao consultar estoque central');
  }
  console.log(`   ✓ Locais Monitorados: ${dataCD.metricas.total_locais_ativos} unidades`);
  console.log(`   ✓ Valor Total em Estoque: R$ ${dataCD.metricas.valor_total_estoque_consolidado.toLocaleString('pt-BR')}`);
  console.log(`   ✓ Status Cadeia de Frio: ${dataCD.metricas.status_cadeia_frio}`);

  // Testando Transferência CD para Satélite
  const loteTransferir = dataCD.lotes.find(l => l.status === 'DISPONIVEL' && !l.termo_sensivel);
  const localDestino = dataCD.locais.find(l => l.tipo === 'FARMACIA_SATELITE_UTI');

  const resTransferencia = await fetch(`${BASE_URL}/api/estoque-central`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      acao: 'TRANSFERIR_SATELITE',
      lote_id: loteTransferir.id,
      local_destino_id: localDestino.id,
      quantidade: 25
    })
  });
  const dataTransferencia = await resTransferencia.json();
  if (!dataTransferencia.success) {
    throw new Error(`Falha na transferência do CD: ${dataTransferencia.error}`);
  }
  console.log(`   ✓ Remessa despachada para satélite: ${dataTransferencia.transferencia.codigo_remessa} (${dataTransferencia.transferencia.quantidade} un. de ${dataTransferencia.transferencia.medicamento})`);

  // -------------------------------------------------------------
  // TESTE 3: ESCALA MÉDICA, CHECK-IN GPS & ANTECIPAÇÃO PIX D+0
  // -------------------------------------------------------------
  console.log('\n🧪 [TESTE 3] Validando Escala Médica, Ponto GPS <100m e Antecipação PIX...');
  const resEscala = await fetch(`${BASE_URL}/api/escala-medica`);
  const dataEscala = await resEscala.json();

  if (!dataEscala.success || dataEscala.plantoes.length === 0) {
    throw new Error('Falha ao consultar escala médica');
  }
  console.log(`   ✓ Plantões do Dia: ${dataEscala.metricas.total_plantoes_hoje}`);
  console.log(`   ✓ Alertas Certificados Médicos: ${dataEscala.metricas.medicos_com_certificados_a_vencer_30d} médicos`);

  // Teste Check-in GPS Válido (<100m)
  const plantaoAlvo = dataEscala.plantoes[1]; // Dra. Camila
  const resCheckinOk = await fetch(`${BASE_URL}/api/escala-medica`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      acao: 'CHECKIN_PRESENCIAL',
      plantao_id: plantaoAlvo.id,
      latitude: -23.550520 + (30 / 111000), // ~30 metros
      longitude: -46.633308,
      metodo: 'GPS_BIOMETRIA_FACIAL'
    })
  });
  const dataCheckinOk = await resCheckinOk.json();
  if (!dataCheckinOk.success) {
    throw new Error(`Falha no check-in GPS: ${dataCheckinOk.error}`);
  }
  console.log(`   ✓ Check-in GPS validado: Distância ${dataCheckinOk.detalhes.distancia_metros}m • Score Facial ${dataCheckinOk.detalhes.biometria_score_pct}%`);

  // Teste Check-in GPS Recusado Fora do Raio (>100m)
  const resCheckinFora = await fetch(`${BASE_URL}/api/escala-medica`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      acao: 'CHECKIN_PRESENCIAL',
      plantao_id: plantaoAlvo.id,
      latitude: -23.550520 + (250 / 111000), // ~250 metros
      longitude: -46.633308,
      metodo: 'GPS_BIOMETRIA_FACIAL'
    })
  });
  const dataCheckinFora = await resCheckinFora.json();
  if (dataCheckinFora.success) {
    throw new Error('Falha de segurança: Check-in a 250m do hospital não deveria ser aceito!');
  }
  console.log(`   ✓ Trava Geofence comprovada: Bloqueou check-in a >100m ("${dataCheckinFora.error.slice(0, 40)}...")`);

  // Teste Antecipação PIX D+0 & Remessa CNAB 240
  const resAntecipacao = await fetch(`${BASE_URL}/api/escala-medica`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      acao: 'ANTECIPAR_PAGAMENTO_PIX',
      plantao_id: plantaoAlvo.id
    })
  });
  const dataAntecipacao = await resAntecipacao.json();
  if (!dataAntecipacao.success) {
    throw new Error(`Falha na antecipação PIX: ${dataAntecipacao.error}`);
  }
  console.log(`   ✓ Antecipação PIX D+0 Executada: Bruto R$ ${dataAntecipacao.antecipacao.valor_bruto} -> Líquido R$ ${dataAntecipacao.antecipacao.valor_liquido} (Taxa 3.5%)`);
  console.log(`   ✓ Registro CNAB 240 Gerado: ${dataAntecipacao.antecipacao.cnab_registro_preview.slice(0, 45)}...`);

  console.log('\n================================================================');
  console.log('TODOS OS TESTES DOS 3 MÓDULOS PASSARAM COM 100% DE SUCESSO!');
  console.log('================================================================');
}

executarTestesModulos().catch(err => {
  console.error('\n❌ ERRO NO TESTE DOS NOVOS MÓDULOS:', err);
  process.exit(1);
});
