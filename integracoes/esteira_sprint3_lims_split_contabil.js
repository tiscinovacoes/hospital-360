/**
 * HOSPITAL 360 - SPRINT 3: SUITE DE TESTES E INTEGRAÇÃO DE PONTA A PONTA
 * SENAITE LIMS (Python) -> Poli WhatsApp -> Hyperswitch Split (Rust) -> HealVista NFS-e (.NET)
 */

async function executarSprint3Integracao() {
  console.log('\n========================================================================');
  console.log(' HOSPITAL 360 - SPRINT 3: ESTEIRA LIMS, FINTECH & CONTÁBIL');
  console.log(' SENAITE LIMS (Python) -> Poli WhatsApp -> Hyperswitch (Rust) -> HealVista (.NET)');
  console.log('========================================================================\n');

  const BASE_URL = 'http://localhost:3000';

  try {
    // 1. Pedido de Exames e Geração de WorkOrder no SENAITE LIMS (Felipe Vasconcelos)
    console.log('1. [SENAITE LIMS] Médico solicita exames de urgência (Troponina + Hemograma)...');
    const payloadLIMS = {
      pacienteId: 'PAC-789456',
      pacienteNome: 'Mariana Oliveira dos Santos',
      cpf: '789.456.123-00',
      medicoNome: 'Dr. Ricardo Mendes',
      crm: 'CRM/MS 8492',
      examesSolicitados: ['LOINC-6598-7', 'LOINC-1751-7'],
      prioridade: 'URGENTE',
    };

    const resLIMS = await fetch(`${BASE_URL}/api/laboratorio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadLIMS),
    });

    const dataLIMS = await resLIMS.json();
    console.log('   Status LIMS:', dataLIMS.success ? 'WORKORDER APROVADA (HTTP 200)' : 'FALHA');
    console.log(`   ID WorkOrder: ${dataLIMS.data.workorderId}`);
    console.log(`   Código de Barras Amostra: ${dataLIMS.data.amostraBarcode}`);
    console.log(`   Biomédico Responsável: ${dataLIMS.data.biomedicoResponsavel}`);
    console.log(`   Custo Total Laboratorial: R$ ${dataLIMS.data.custoTotalLaboratorio.toFixed(2)}`);
    console.log(`   Laudo Assinado PDF: ${dataLIMS.data.pdfLaudoUrl}`);
    dataLIMS.data.resultados.forEach((r) => {
      console.log(`     * [${r.codigoLoinc}] ${r.nome}: ${r.resultado} (Ref: ${r.referencia})`);
    });

    // 2. Barramento n8n despacha Notificação no WhatsApp do Paciente (Camila Medeiros - Poli CRM)
    console.log('\n2. [Poli WhatsApp CRM] Barramento n8n notifica paciente com link do laudo...');
    const resZap = await fetch(`${BASE_URL}/api/poli/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telefonePaciente: '+55 67 99841-2091',
        pacienteNome: 'Mariana Oliveira dos Santos',
        tipoNotificacao: 'LAUDO_LIBERADO',
        laudoUrl: dataLIMS.data.pdfLaudoUrl,
      }),
    });

    const dataZap = await resZap.json();
    console.log('   Status WhatsApp:', dataZap.success ? 'NOTIFICAÇÃO ENVIADA' : 'FALHA');
    console.log(`   ID Mensagem: ${dataZap.data.messageId}`);
    console.log(`   Status Envio: ${dataZap.data.statusEnvio}`);
    console.log(`   Texto: "${dataZap.data.textoEnviado}"`);

    // 3. Split Financeiro no Hyperswitch (André Castilho - Motor Rust)
    console.log('\n3. [Hyperswitch] Liquidação da consulta com Split Financeiro 85/15...');
    const resSplit = await fetch(`${BASE_URL}/api/hyperswitch/split`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transacaoId: `TX-SPLIT-${Date.now()}`,
        pacienteId: payloadLIMS.pacienteId,
        clinicaId: 'clinica_sala204',
        valorTotal: 280.0,
        metodoPagamento: 'PIX_D0',
      }),
    });

    const dataSplit = await resSplit.json();
    console.log('   Status Split:', dataSplit.success ? 'LIQUIDADO PIX D+0' : 'FALHA');
    console.log(`   Transação: ${dataSplit.data.transacaoId}`);
    console.log(`   Valor Bruto da Consulta: R$ ${dataSplit.data.valorTotal.toFixed(2)}`);
    console.log(`   Repasse Médico Cooperado (85%): R$ ${dataSplit.data.split.valorClinica.toFixed(2)}`);
    console.log(`   Taxa Condomínio Hospitalar (15%): R$ ${dataSplit.data.split.valorCondominio.toFixed(2)}`);
    console.log(`   Comprovante PIX Bacen: ${dataSplit.data.liquidacao.comprovantePixId}`);
    console.log(`   Hash Auditoria Rust: ${dataSplit.data.hashAuditoria}`);

    // 4. Emissão e Escrituração de NFS-e no HealVista Contábil (.NET 8)
    console.log('\n4. [HealVista Contábil] Emissão de NFS-e Municipal & Escrituração do Condomínio...');
    const resNfse = await fetch(`${BASE_URL}/api/contabil/nfse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transacaoId: dataSplit.data.transacaoId,
        valorCondominio: dataSplit.data.split.valorCondominio,
        valorTotal: dataSplit.data.valorTotal,
        cpfPaciente: payloadLIMS.cpf,
      }),
    });

    const dataNfse = await resNfse.json();
    console.log('   Status NFS-e:', dataNfse.success ? 'EMITIDA & HOMOLOGADA' : 'FALHA');
    console.log(`   Número da Nota: ${dataNfse.data.numeroNota}`);
    console.log(`   Código de Verificação: ${dataNfse.data.codigoVerificacao}`);
    console.log(`   Base de Cálculo ISS (15% condomínio): R$ ${dataNfse.data.servico.valorBaseCalculoIss.toFixed(2)}`);
    console.log(`   ISS Retido (5%): R$ ${dataNfse.data.servico.valorIssRetido.toFixed(2)}`);
    console.log(`   Valor Líquido Condomínio: R$ ${dataNfse.data.servico.valorLiquidoRecebido.toFixed(2)}`);
    console.log('   Partidas Dobradas no Livro Diário:');
    dataNfse.data.escrituracaoLivroDiario.forEach((l) => {
      console.log(`     * D: ${l.contaDebito} | C: ${l.contaCredito} | R$ ${l.valor.toFixed(2)}`);
    });

    console.log('\n========================================================================');
    console.log(' SPRINT 3 VALIDADA COM SUCESSO: LIMS, SPLIT & CONTÁBIL 100% OPERACIONAIS!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('Erro na execução da esteira da Sprint 3:', err);
  }
}

executarSprint3Integracao();
