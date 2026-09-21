import { NextResponse } from 'next/server';

// Simulação de banco de lotes FEFO do OpenBoxes (Mariana Siqueira - Sprint 2)
let inventarioLotes = [
  {
    loteId: 'LOT-DIP-2026-08',
    codigoMedicamento: 'MED-001',
    nome: 'Dipirona 500mg/mL Ampola 2mL',
    fabricante: 'Farmacêutica Sanofi/EMS',
    dataFabricacao: '2025-08-10',
    dataValidade: '2026-10-15', // Lote que vence primeiro!
    quantidadeSaldo: 48,
    custoAquisicao: 4.20,
    precoCmed: 4.85,
    localizacao: 'Armário A - Gaveta 02',
  },
  {
    loteId: 'LOT-DIP-2027-01',
    codigoMedicamento: 'MED-001',
    nome: 'Dipirona 500mg/mL Ampola 2mL',
    fabricante: 'Farmacêutica EMS',
    dataFabricacao: '2026-01-15',
    dataValidade: '2027-03-30',
    quantidadeSaldo: 150,
    custoAquisicao: 4.30,
    precoCmed: 4.85,
    localizacao: 'Armário A - Gaveta 03',
  },
  {
    loteId: 'LOT-AMO-2026-11',
    codigoMedicamento: 'MED-002',
    nome: 'Amoxicilina + Clavulanato 500/125mg',
    fabricante: 'Eurofarma',
    dataFabricacao: '2025-11-01',
    dataValidade: '2026-11-20',
    quantidadeSaldo: 24,
    custoAquisicao: 28.90,
    precoCmed: 38.50,
    localizacao: 'Armário B - Gaveta 01',
  },
  {
    loteId: 'LOT-SOR-2026-09',
    codigoMedicamento: 'MED-003',
    nome: 'Soro Fisiológico 0.9% 500mL',
    fabricante: 'Baxter / Fresenius',
    dataFabricacao: '2025-09-01',
    dataValidade: '2026-09-30', // Vence este mês! Alerta crítico FEFO
    quantidadeSaldo: 85,
    custoAquisicao: 6.50,
    precoCmed: 8.20,
    localizacao: 'Palete 04 - Prateleira C',
  },
  {
    loteId: 'LOT-CEF-2026-12',
    codigoMedicamento: 'MED-004',
    nome: 'Ceftriaxona Dissódica 1g IV Frasco-Ampola',
    fabricante: 'Novartis / Sandoz',
    dataFabricacao: '2025-12-10',
    dataValidade: '2026-12-31',
    quantidadeSaldo: 60,
    custoAquisicao: 19.80,
    precoCmed: 26.40,
    localizacao: 'Armário Antibióticos - Gaveta 01',
  },
];

export async function GET() {
  // Retorna lotes ordenados por data de validade (FEFO) - Otimização em memória
  const lotesOrdenados = [...inventarioLotes].sort(
    (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime()
  );

  return NextResponse.json({
    success: true,
    totalLotes: lotesOrdenados.length,
    algoritmo: 'FEFO_ESTRITO (First Expired, First Out)',
    data: lotesOrdenados,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      codigoMedicamento,
      quantidadeRequisitada = 1,
      atendimentoId,
      pacienteNome,
      cpf,
      origemModulo = 'OpenEMR_Prescricao_Sala204',
      responsavel = 'Farmacêutica Mariana Siqueira (CRF/MS 3140)',
      motivo = 'Prescrição Médica Ambulatorial',
    } = body;

    if (!codigoMedicamento) {
      return NextResponse.json(
        { success: false, error: 'Código do medicamento é obrigatório para baixa FEFO.' },
        { status: 400 }
      );
    }

    const qtdRequisitadaNum = Number(quantidadeRequisitada) || 1;

    // Algoritmo FEFO: Filtra lotes do medicamento e ordena por validade mais próxima
    const lotesDisponiveis = inventarioLotes
      .filter((l) => l.codigoMedicamento === codigoMedicamento && l.quantidadeSaldo > 0)
      .sort((a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime());

    if (lotesDisponiveis.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Ruptura de estoque: medicamento ${codigoMedicamento} sem saldo disponível no OpenBoxes.`,
        },
        { status: 422 }
      );
    }

    let quantidadeRestante = qtdRequisitadaNum;
    const baixasEfetuadas: any[] = [];
    let alertaPrecoCmedDetectado = false;

    for (const lote of lotesDisponiveis) {
      if (quantidadeRestante <= 0) break;

      const qtdBaixar = Math.min(lote.quantidadeSaldo, quantidadeRestante);
      lote.quantidadeSaldo -= qtdBaixar;
      quantidadeRestante -= qtdBaixar;

      const diasParaVencer = Math.ceil(
        (new Date(lote.dataValidade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      // Verificação de conformidade de compras (Sprint 2 - Mariana Siqueira & CMED)
      const acimaTetoCmed = lote.custoAquisicao > lote.precoCmed;
      if (acimaTetoCmed) alertaPrecoCmedDetectado = true;

      baixasEfetuadas.push({
        loteId: lote.loteId,
        nomeMedicamento: lote.nome,
        fabricante: lote.fabricante,
        quantidadeBaixada: qtdBaixar,
        saldoRemanescente: lote.quantidadeSaldo,
        dataValidade: lote.dataValidade,
        diasAteVencimento: diasParaVencer,
        alertaCritico: diasParaVencer <= 30 ? 'VALIDADE_PROXIMA' : 'REGULAR',
        custoUnitario: lote.custoAquisicao,
        precoTetoCmed: lote.precoCmed,
        custoTotalBaixa: qtdBaixar * lote.custoAquisicao,
        acimaTetoCmed,
      });
    }

    if (quantidadeRestante > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Saldo insuficiente para atender toda a requisição (faltaram ${quantidadeRestante} unidades).`,
          baixasParciais: baixasEfetuadas,
        },
        { status: 409 }
      );
    }

    const valorTotalMedicamento = baixasEfetuadas.reduce((acc, curr) => acc + curr.custoTotalBaixa, 0);
    const lotePrincipal = baixasEfetuadas[0];

    const comprovanteBaixaFefo = {
      idBaixa: `FEFO-${Date.now()}`,
      timestamp: new Date().toISOString(),
      atendimentoId: atendimentoId || `ATEND-${Date.now()}`,
      pacienteNome: pacienteNome || 'Paciente',
      cpf: cpf || '000.000.000-00',
      origemModulo,
      responsavel,
      motivo,
      regraAplicada: 'FEFO_ESTRITO (Lote mais antigo com validade mais próxima despachado primeiro)',
      itensBaixados: baixasEfetuadas,
      loteConsumido: lotePrincipal,
      custoTotalConsumido: valorTotalMedicamento,
      alertaTetoCmed: alertaPrecoCmedDetectado,
      statusIntegracaoOpenBoxes: 'BAIXA_CONFIRMADA_INVENTARIO',
    };

    return NextResponse.json({
      success: true,
      message: 'Baixa FEFO efetuada com sucesso no OpenBoxes.',
      custoTotalConsumido: valorTotalMedicamento,
      loteConsumido: lotePrincipal,
      data: comprovanteBaixaFefo,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar baixa FEFO: ' + error.message },
      { status: 500 }
    );
  }
}
