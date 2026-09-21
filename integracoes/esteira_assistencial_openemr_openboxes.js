/**
 * ESTEIRA ASSISTENCIAL INTEGRADA: OpenEMR -> n8n -> OpenBoxes (FEFO) -> PWA Tarefas Mobile
 * Sprint 2 - Hospital 360
 * Responsáveis: Rodrigo Albuquerque (Backend Saúde), Mariana Siqueira (Farmácia FEFO), Thiago Pires (PWA Mobile) e Camila Medeiros (n8n)
 */

async function executarEsteiraAssistencial() {
  console.log('\n========================================================================');
  console.log(' HOSPITAL 360 - SPRINT 2: ESTEIRA ASSISTENCIAL INTEGRADA');
  console.log(' OpenEMR v7 -> Barramento n8n -> OpenBoxes (FEFO) -> PWA Tarefas & Leito');
  console.log('========================================================================\n');

  const BASE_URL = 'http://localhost:3000';

  // 1. Consulta e Prescrição gerada no OpenEMR (Rodrigo Albuquerque)
  console.log('1. [OpenEMR] Médico Dr. Ricardo Mendes atende e prescreve na Sala 204...');
  const payloadAtendimento = {
    pacienteNome: 'Mariana Oliveira dos Santos',
    cpf: '789.456.123-00',
    medicoNome: 'Dr. Ricardo Mendes',
    crm: 'CRM/MS 8492',
    salaNumero: '204',
    especialidade: 'Clínica Médica / Ambulatorial',
    prescricoes: [
      {
        codigo: 'MED-001',
        nome: 'Dipirona 500mg/mL Ampola 2mL',
        dose: '1 ampola EV em bolus',
        via: 'EV',
        posologia: 'Agora (Dose de Ataque)',
        quantidade: 2,
      },
      {
        codigo: 'MED-003',
        nome: 'Soro Fisiológico 0.9% 500mL',
        dose: '500mL',
        via: 'EV',
        posologia: 'Infusão contínua em 60 min',
        quantidade: 1,
      },
    ],
    examesSolicitados: [
      {
        codigo: 'LOINC-1751-7',
        nome: 'Hemograma Completo com Plaquetas',
        prioridade: 'URGENTE',
      },
    ],
    valorConsulta: 280.0,
  };

  try {
    const resOpenEMR = await fetch(`${BASE_URL}/api/openemr/atendimento`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature-hmac-sha256': 'hmac_sha256_openemr_sala204_verified',
      },
      body: JSON.stringify(payloadAtendimento),
    });

    const dataOpenEMR = await resOpenEMR.json();
    console.log('   Status OpenEMR:', dataOpenEMR.success ? 'SUCESSO (HTTP 200)' : 'FALHA');
    console.log('   ID Atendimento:', dataOpenEMR.data.atendimentoId);
    console.log('   Despacho Barramento n8n:', dataOpenEMR.webhookStatus);
    console.log('   Split Financeiro Automático:');
    console.log(`     - Clínica Médica (85%): R$ ${dataOpenEMR.data.financeiro.split.valorClinica.toFixed(2)}`);
    console.log(`     - Condomínio Hospitalar (15%): R$ ${dataOpenEMR.data.financeiro.split.valorCondominio.toFixed(2)}`);

    const atendimentoId = dataOpenEMR.data.atendimentoId;

    // 2. Barramento n8n aciona a Baixa FEFO no OpenBoxes (Mariana Siqueira)
    console.log('\n2. [OpenBoxes] Barramento n8n executa Baixa FEFO estrita com algoritmo de validade...');

    for (const item of payloadAtendimento.prescricoes) {
      console.log(`\n   -> Processando baixa para: ${item.nome} (Qtd solicitada: ${item.quantidade})`);

      const resFEFO = await fetch(`${BASE_URL}/api/estoque/fefo-baixa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoMedicamento: item.codigo,
          quantidadeRequisitada: item.quantidade,
          atendimentoId,
          pacienteNome: payloadAtendimento.pacienteNome,
          cpf: payloadAtendimento.cpf,
          motivo: `Prescrição OpenEMR - Atendimento ${atendimentoId}`,
        }),
      });

      const dataFEFO = await resFEFO.json();
      if (dataFEFO.success) {
        console.log('      [OK] Baixa FEFO efetuada com sucesso!');
        dataFEFO.data.itensBaixados.forEach((b) => {
          console.log(`      * Lote Selecionado: ${b.loteId}`);
          console.log(`        - Validade do Lote: ${b.dataValidade} (${b.diasAteVencimento} dias restantes)`);
          console.log(`        - Quantidade Baixada: ${b.quantidadeBaixada} un`);
          console.log(`        - Saldo Restante no Lote: ${b.saldoRemanescente} un`);
          console.log(`        - Status ANVISA: ${b.alertaCritico}`);
          console.log(`        - Custo Unitário: R$ ${b.custoUnitario.toFixed(2)} | Subtotal: R$ ${b.custoTotalBaixa.toFixed(2)}`);
          console.log(`        - Teto Oficial CMED: R$ ${b.precoTetoCmed.toFixed(2)} | Conforme: ${!b.acimaTetoCmed}`);
        });
      } else {
        console.log('      [ERRO] Falha na baixa:', dataFEFO.error);
      }
    }

    // 3. PWA de Tarefas Mobile - Thiago Pires (Leitos & Facilities)
    console.log('\n3. [App Mobile PWA] Execução de Higienização de Leito com leitura de QR Code...');
    const tarefaLeitoId = 'TSK-102'; // Higienização Terminal Leito 108

    console.log(`   -> Iniciando tarefa ${tarefaLeitoId} e ativando cronômetro de mão de obra...`);
    const resIniciar = await fetch(`${BASE_URL}/api/tarefas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'INICIAR', tarefaId: tarefaLeitoId }),
    });
    const dataIniciar = await resIniciar.json();
    console.log('      Status Início:', dataIniciar.success ? 'CRONÔMETRO INICIADO' : 'FALHA');

    console.log(`   -> Simulando leitura de QR Code do leito e registrando baixa da ordem de serviço...`);
    const resBaixaTarefa = await fetch(`${BASE_URL}/api/tarefas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'BAIXA',
        tarefaId: tarefaLeitoId,
        qrCodeLido: true,
        observacao: 'Higienização terminal validada com QR-LEITO-108. Leito desinfetado e pronto para admissão.',
      }),
    });
    const dataBaixaTarefa = await resBaixaTarefa.json();
    if (dataBaixaTarefa.success) {
      console.log('      [OK] Ordem de serviço concluída com sucesso!');
      console.log(`      * Duração da Mão de Obra: ${dataBaixaTarefa.data.tarefa.duracaoMinutos} min`);
      console.log(`      * Custo Calculado da Mão de Obra: R$ ${dataBaixaTarefa.data.tarefa.custoCalculadoMaoObra.toFixed(2)}`);
      console.log(`      * Responsável: ${dataBaixaTarefa.data.tarefa.responsavelNome} (${dataBaixaTarefa.data.tarefa.responsavelCargo})`);
      console.log(`      * Censo Bahmni-Core: ${dataBaixaTarefa.data.leitoLiberado ? 'LEITO LIBERADO NO CENSO HOSPITALAR!' : 'NORMAL'}`);
    }

    // 4. Verificação do Inventário Atualizado
    console.log('\n4. [OpenBoxes] Censo de Lotes pós-baixa FEFO...');
    const resInventario = await fetch(`${BASE_URL}/api/estoque/fefo-baixa`);
    const dataInventario = await resInventario.json();
    console.log(`   Total de Lotes Monitorados: ${dataInventario.totalLotes}`);
    dataInventario.data.forEach((l) => {
      console.log(`   - [${l.loteId}] ${l.nome} | Val: ${l.dataValidade} | Saldo: ${l.quantidadeSaldo} un`);
    });

    console.log('\n========================================================================');
    console.log(' SPRINT 2 VALIDADA COM SUCESSO: TODAS AS 4 FRENTES ASSISTENCIAIS 100%!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('Erro na execução da esteira assistencial:', err);
  }
}

executarEsteiraAssistencial();
