import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

// Simulação de inventário de lotes FEFO do OpenBoxes / P-MACS (Sprint 5 - Mariana Siqueira)
const inventarioLotes = [
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
    custoAquisicao: 18.50,
    precoCmed: 22.00,
    localizacao: 'Geladeira 02 - Prateleira 01',
  },
  {
    loteId: 'LOT-VENCIDO-001',
    codigoMedicamento: 'MED-VENCIDO',
    nome: 'Lote Teste Expirado',
    fabricante: 'Laboratório Genérico',
    dataFabricacao: '2024-01-01',
    dataValidade: '2025-01-01', // Data no passado: estritamente bloqueado!
    quantidadeSaldo: 10,
    custoAquisicao: 5.00,
    precoCmed: 8.00,
    localizacao: 'Quarentena Descarte',
  }
];

/** Lote consumido numa baixa FEFO, com rastreabilidade de validade e teto CMED. */
export interface ItemBaixadoFefo {
  loteId: string;
  nomeMedicamento: string;
  fabricante: string;
  quantidadeBaixada: number;
  saldoRemanescente: number;
  dataValidade: string;
  diasAteVencimento: number;
  alertaCritico: string;
  custoUnitario: number;
  precoTetoCmed: number;
  custoTotalBaixa: number;
  acimaTetoCmed: boolean;
}

/** Comprovante da baixa FEFO devolvido em `data`, usado pelo app de tarefas. */
export interface ComprovanteBaixaFefo {
  idBaixa: string;
  timestamp: string;
  atendimentoId: string;
  pacienteNome: string;
  cpf: string;
  origemModulo: string;
  responsavel: string;
  motivo: string;
  regraAplicada: string;
  itensBaixados: ItemBaixadoFefo[];
  loteConsumido: ItemBaixadoFefo | undefined;
  custoTotalConsumido: number;
  alertaTetoCmed: boolean;
  statusIntegracaoOpenBoxes: string;
  hubCustos: {
    protocolo: string;
    estacao: number;
    estacaoNome: string;
    valorImputado: number;
  };
}

export async function GET() {
  const agora = new Date().getTime();
  const lotesMapeados = inventarioLotes.map(l => {
    const validadeTime = new Date(l.dataValidade).getTime();
    const expirado = validadeTime < agora;
    const diasAteVencer = Math.ceil((validadeTime - agora) / (1000 * 60 * 60 * 24));

    return {
      ...l,
      expirado,
      diasAteVencer,
      alertaCritico: expirado ? 'VENCIDO_BLOQUEADO' : diasAteVencer <= 30 ? 'ALERTA_PROXIMO_VENCIMENTO' : 'REGULAR'
    };
  });

  return NextResponse.json({
    success: true,
    totalLotes: lotesMapeados.length,
    lotes: lotesMapeados
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      codigoMedicamento,
      quantidadeRequisitada = 1,
      atendimentoId,
      pacienteNome,
      cpf,
      origemModulo = 'FARMACIA_HOSPITALAR',
      responsavel = 'Farmacêutica Mariana Siqueira (CRF/MS 3140)',
      motivo = 'Prescrição Médica Beira-Leito',
    } = body;

    if (!codigoMedicamento) {
      return NextResponse.json(
        { success: false, error: 'Código do medicamento é obrigatório para baixa FEFO.' },
        { status: 400 }
      );
    }

    const qtdRequisitadaNum = Number(quantidadeRequisitada) || 1;
    const agora = new Date().getTime();

    // 1. Filtragem com Bloqueio de Medicamentos Vencidos (Anvisa RDC 306/2004)
    const lotesDoMedicamento = inventarioLotes.filter(l => l.codigoMedicamento === codigoMedicamento);
    const lotesValidos = lotesDoMedicamento.filter(l => {
      const validadeTime = new Date(l.dataValidade).getTime();
      return validadeTime >= agora && l.quantidadeSaldo > 0;
    });

    if (lotesDoMedicamento.length > 0 && lotesValidos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          codigoErro: 'MEDICAMENTO_VENCIDO_BLOQUEADO',
          error: `BLOQUEIO SANITÁRIO (Anvisa RDC 306/04): Todos os lotes do medicamento ${codigoMedicamento} estão com data de validade expirada ou saldo zerado. Dispensação estritamente proibida.`
        },
        { status: 422 }
      );
    }

    if (lotesValidos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          codigoErro: 'RUPTURA_ESTOQUE',
          error: `Ruptura de estoque: medicamento ${codigoMedicamento} sem saldo disponível no OpenBoxes.`
        },
        { status: 422 }
      );
    }

    // 2. Ordenação Rigorosa FEFO (First Expired, First Out)
    const lotesOrdenadosFefo = [...lotesValidos].sort(
      (a, b) => new Date(a.dataValidade).getTime() - new Date(b.dataValidade).getTime()
    );

    let quantidadeRestante = qtdRequisitadaNum;
    const baixasEfetuadas: ItemBaixadoFefo[] = [];

    let alertaPrecoCmedDetectado = false;

    for (const lote of lotesOrdenadosFefo) {
      if (quantidadeRestante <= 0) break;

      const qtdBaixar = Math.min(lote.quantidadeSaldo, quantidadeRestante);
      lote.quantidadeSaldo -= qtdBaixar;
      quantidadeRestante -= qtdBaixar;

      const diasParaVencer = Math.ceil(
        (new Date(lote.dataValidade).getTime() - agora) / (1000 * 60 * 60 * 24)
      );

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
        alertaCritico: diasParaVencer <= 30 ? 'ALERTA_PROXIMO_VENCIMENTO' : 'REGULAR',
        custoUnitario: lote.custoAquisicao,
        precoTetoCmed: lote.precoCmed,
        custoTotalBaixa: Number((qtdBaixar * lote.custoAquisicao).toFixed(2)),
        acimaTetoCmed
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

    // 3. Ingestão Automática no Hub de Custos (Estação 4: Farmácia Beira-Leito)
    const timestamp = new Date().toISOString();
    const despesasHub = baixasEfetuadas.map((b, idx) => ({
      id_transacao: `DSP-FAR-${Date.now()}-${b.loteId}-${idx}`,
      paciente_cpf: cpf || '000.000.000-00',
      paciente_nome: pacienteNome || 'Paciente Internado',
      prontuario_episodio: atendimentoId || `EPIS-${Date.now()}`,
      centro_custo: 'FARMACIA_HOSPITALAR_BEIRA_LEITO',
      item_codigo: codigoMedicamento,
      item_descricao: b.nomeMedicamento,
      lote_fabricante: b.loteId,
      quantidade: b.quantidadeBaixada,
      unidade_medida: 'UN',
      valor_unitario_medio: b.custoUnitario,
      valor_total_imputado: b.custoTotalBaixa,
      data_consumo: timestamp,
      origem_modulo: 'FARMACIA_HOSPITALAR',
      estacao_jornada: 4, // Estação 4: Farmácia Beira-Leito
      metadados: {
        fabricante: b.fabricante,
        data_validade: b.dataValidade,
        dias_ate_vencimento: b.diasAteVencimento,
        alerta_vencimento_30d: b.diasAteVencimento <= 30,
        alerta_teto_cmed: b.acimaTetoCmed,
        responsavel
      }
    }));

    const resultadoIngestaoHub = HubDespesasService.ingerirLote({
      origem_modulo: 'FARMACIA_HOSPITALAR',
      cliente_id: 'farmacia_central',
      lote_exportacao_id: `LOTE-FAR-${Date.now()}`,
      data_geracao: timestamp,
      despesas: despesasHub
    });

    const comprovanteBaixaFefo: ComprovanteBaixaFefo = {
      idBaixa: `FEFO-${Date.now()}`,
      timestamp,
      atendimentoId: atendimentoId || `ATEND-${Date.now()}`,
      pacienteNome: pacienteNome || 'Paciente Internado',
      cpf: cpf || '000.000.000-00',
      origemModulo,
      responsavel,
      motivo,
      regraAplicada: 'FEFO_ESTRITO (Lote com validade mais próxima despachado primeiro com bloqueio de expirados)',
      itensBaixados: baixasEfetuadas,
      loteConsumido: baixasEfetuadas[0],
      custoTotalConsumido: valorTotalMedicamento,
      alertaTetoCmed: alertaPrecoCmedDetectado,
      statusIntegracaoOpenBoxes: 'BAIXA_CONFIRMADA_INVENTARIO',
      hubCustos: {
        protocolo: resultadoIngestaoHub.protocolo,
        estacao: 4,
        estacaoNome: 'Estação 4: Farmácia Beira-Leito',
        valorImputado: resultadoIngestaoHub.valorTotal
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Baixa FEFO efetuada com sucesso no OpenBoxes e custo imputado na Estação 4.',
      protocoloHub: resultadoIngestaoHub.protocolo,
      estacao: 4,
      custoTotalConsumido: valorTotalMedicamento,
      data: comprovanteBaixaFefo,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar baixa FEFO: ' + msg },
      { status: 500 }
    );
  }
}
