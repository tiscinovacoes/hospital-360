import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService, ModuloOrigem } from '@/lib/hubDespesasStore';

export interface RegistrarEstacaoPayload {
  pacienteCpf: string;
  pacienteNome: string;
  episodioId?: string;
  estacaoNumero?: number; // 1: Triagem, 2: Exames, 3: OPME/Almox, 4: Farmácia, 5: Hotelaria/Médico
  moduloOrigem: ModuloOrigem;
  centroCusto: string;
  itemCodigo: string;
  itemDescricao: string;
  quantidade: number;
  valorUnitario: number;
  loteFabricante?: string;
  leitoIdentificador?: string;
}

// GET: Consulta Consolidado Door-to-Door por CPF ou Episódio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const consolidado = HubDespesasService.obterConsolidadoPaciente(cpf);

    if (!consolidado) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: `Nenhuma jornada paciente localizada para o CPF/Episódio informado: ${cpf}`,
          meta: { timestamp: new Date().toISOString(), version: 'v1.0-rest' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          paciente: consolidado.paciente,
          custoTotalReal: consolidado.custoTotalReal,
          estacoes: consolidado.estacoes,
          benchmarks: {
            tuss: {
              faturamentoPrevisto: consolidado.benchmarkFinanceiro.faturamentoPrevistoTuss,
              faturamentoLiquido: consolidado.benchmarkFinanceiro.faturamentoLiquidoEsperado,
              margemBrutaReais: consolidado.benchmarkFinanceiro.margemBrutaReais,
              margemPercentual: consolidado.benchmarkFinanceiro.margemPercentual,
              status: consolidado.benchmarkFinanceiro.statusMargem,
            },
            sigtapSus: {
              repasseOficial: consolidado.benchmarkFinanceiro.repasseSigtapSus,
              deficitReal: consolidado.benchmarkFinanceiro.deficitSusReais,
              percentualCobertura: consolidado.benchmarkFinanceiro.percentualCoberturaSus,
            },
            cmed: {
              tetoMaximo: consolidado.benchmarkFinanceiro.cmedTetoMaximoPermitido,
              conformidade: consolidado.benchmarkFinanceiro.statusConformidadeCmed,
            },
          },
          alertas: consolidado.alertasVigiaCustos,
        },
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1.0-rest',
          metodologia: 'DOOR_TO_DOOR_REALTIME_ENGINE',
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao consultar jornada paciente.';
    return NextResponse.json(
      { success: false, data: null, error: msg },
      { status: 500 }
    );
  }
}

// POST: Registrar Nova Estação de Atendimento / Imputar Item de Custo
export async function POST(request: NextRequest) {
  try {
    const body: RegistrarEstacaoPayload = await request.json();

    if (!body.pacienteCpf || !body.itemCodigo || !body.itemDescricao || !body.valorUnitario) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Payload incompleto. pacienteCpf, itemCodigo, itemDescricao e valorUnitario são obrigatórios.',
          meta: { timestamp: new Date().toISOString(), version: 'v1.0-rest' },
        },
        { status: 400 }
      );
    }

    const valorTotal = (Number(body.quantidade) || 1) * Number(body.valorUnitario);

    // Ingestão no repositório de custeio real
    const resultadoIngestao = HubDespesasService.ingerirLote({
      origem_modulo: body.moduloOrigem || 'GESTAO_CLINICA',
      despesas: [
        {
          id_transacao: `DSP-POST-${Date.now()}`,
          paciente_cpf: body.pacienteCpf,
          paciente_nome: body.pacienteNome || 'Paciente Cadastrado',
          prontuario_episodio: body.episodioId || `EPIS-${new Date().getFullYear()}-001`,
          centro_custo: body.centroCusto || 'AMBULATORIO_GERAL',
          leito_identificador: body.leitoIdentificador,
          item_codigo: body.itemCodigo,
          item_descricao: body.itemDescricao,
          lote_fabricante: body.loteFabricante,
          quantidade: body.quantidade || 1,
          unidade_medida: 'Unidade',
          valor_unitario_medio: body.valorUnitario,
          valor_total_imputado: valorTotal,
          data_consumo: new Date().toISOString(),
          estacao_jornada: body.estacaoNumero,
        },
      ],
    });

    // Reobter consolidado atualizado
    const consolidadoAtualizado = HubDespesasService.obterConsolidadoPaciente(body.pacienteCpf);

    return NextResponse.json(
      {
        success: true,
        data: {
          protocolo: resultadoIngestao.protocolo,
          itemRegistrado: resultadoIngestao.itensAdicionados[0],
          novoCustoTotalReal: consolidadoAtualizado?.custoTotalReal || valorTotal,
          resumoJornada: consolidadoAtualizado,
        },
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1.0-rest',
          mensagem: 'Item de custo imputado com sucesso no cálculo Door-to-Door.',
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao registrar estação da jornada.';
    return NextResponse.json(
      { success: false, data: null, error: msg },
      { status: 500 }
    );
  }
}
