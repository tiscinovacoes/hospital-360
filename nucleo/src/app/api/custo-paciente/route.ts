import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

export interface PacienteCustoAnalysis {
  cpf: string;
  nome: string;
  episodioId: string;
  tipoAtendimento: 'AMBULATORIAL' | 'INTERNACAO' | 'URGENCIA';
  dataEntrada: string;
  dataAlta?: string;
  diasInternacao: number;
  custosDiretos: {
    medicamentosMateriais: number;
    procedimentosExames: number;
    equipeAssistencial: number;
    totalDireto: number;
    itensDetalhados: Array<{
      descricao: string;
      origem: string;
      valor: number;
      lote?: string;
    }>;
  };
  custosIndiretosRateados: {
    diariaHotelaria: number;
    higienizacaoFacilities: number;
    depreciacaoEquipamentos: number;
    apoioAdministrativoABC: number;
    totalIndireto: number;
  };
  custoTotalReal: number;
  benchmarkPrivado: {
    tabelaTussParticular: number;
    margemContribuicao: number;
    margemPercentual: number;
    statusMargem: 'LUCRO_SAUDAVEL' | 'MARGEM_APERTADA' | 'PREJUIZO';
  };
  benchmarkPublicoSus: {
    repasseTabelaSigtap: number;
    subsidioMunicipalNecessario: number;
    percentualCoberturaSus: number;
    deficitPorProcedimento: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const consolidado = HubDespesasService.obterConsolidadoPaciente(cpf);

    if (!consolidado) {
      return NextResponse.json(
        { success: false, error: `Paciente com CPF ${cpf} não localizado no Hub de Custos.` },
        { status: 404 }
      );
    }

    // Separação de custos diretos e indiretos com base nas estações clínicas
    const estacao1 = consolidado.estacoes.find(e => e.estacaoNumero === 1)?.totalGasto || 0;
    const estacao2 = consolidado.estacoes.find(e => e.estacaoNumero === 2)?.totalGasto || 0;
    const estacao3 = consolidado.estacoes.find(e => e.estacaoNumero === 3)?.totalGasto || 0;
    const estacao4 = consolidado.estacoes.find(e => e.estacaoNumero === 4)?.totalGasto || 0;
    const estacao5 = consolidado.estacoes.find(e => e.estacaoNumero === 5)?.totalGasto || 0;

    const medMateriais = Number((estacao3 + estacao4).toFixed(2));
    const procExames = Number((estacao1 + estacao2).toFixed(2));
    const equipeAssist = Number((estacao5 * 0.4).toFixed(2)); // 40% de honorários e assistência médica
    const totalDireto = Number((medMateriais + procExames + equipeAssist).toFixed(2));

    const diariaHotelaria = Number((estacao5 * 0.4).toFixed(2));
    const higienizacao = Number((estacao5 * 0.08).toFixed(2));
    const depreciacao = Number((estacao5 * 0.06).toFixed(2));
    const apoioAdm = Number((estacao5 * 0.06).toFixed(2));
    const totalIndireto = Number((diariaHotelaria + higienizacao + depreciacao + apoioAdm).toFixed(2));

    // Mapeamento dos itens detalhados de todas as estações
    const itensDetalhados = consolidado.estacoes.flatMap(e =>
      e.itens.map(it => ({
        descricao: it.item_descricao,
        origem: `${it.origem_modulo} (${it.centro_custo})`,
        valor: it.valor_total_imputado,
        lote: it.lote_fabricante
      }))
    );

    let statusMargem: PacienteCustoAnalysis['benchmarkPrivado']['statusMargem'] = 'LUCRO_SAUDAVEL';
    if (consolidado.benchmarkFinanceiro.margemPercentual < 10 && consolidado.benchmarkFinanceiro.margemPercentual >= 0) {
      statusMargem = 'MARGEM_APERTADA';
    } else if (consolidado.benchmarkFinanceiro.margemPercentual < 0) {
      statusMargem = 'PREJUIZO';
    }

    const analysis: PacienteCustoAnalysis = {
      cpf: consolidado.paciente.cpf,
      nome: consolidado.paciente.nome,
      episodioId: consolidado.paciente.episodioId,
      tipoAtendimento: 'INTERNACAO',
      dataEntrada: consolidado.paciente.dataAdmissao,
      diasInternacao: Math.max(1, Math.round(consolidado.paciente.tempoPermanenciaHoras / 24)),
      custosDiretos: {
        medicamentosMateriais: medMateriais,
        procedimentosExames: procExames,
        equipeAssistencial: equipeAssist,
        totalDireto: totalDireto,
        itensDetalhados
      },
      custosIndiretosRateados: {
        diariaHotelaria,
        higienizacaoFacilities: higienizacao,
        depreciacaoEquipamentos: depreciacao,
        apoioAdministrativoABC: apoioAdm,
        totalIndireto
      },
      custoTotalReal: consolidado.custoTotalReal,
      benchmarkPrivado: {
        tabelaTussParticular: consolidado.benchmarkFinanceiro.faturamentoPrevistoTuss,
        margemContribuicao: consolidado.benchmarkFinanceiro.margemBrutaReais,
        margemPercentual: consolidado.benchmarkFinanceiro.margemPercentual,
        statusMargem
      },
      benchmarkPublicoSus: {
        repasseTabelaSigtap: consolidado.benchmarkFinanceiro.repasseSigtapSus,
        subsidioMunicipalNecessario: consolidado.benchmarkFinanceiro.deficitSusReais,
        percentualCoberturaSus: consolidado.benchmarkFinanceiro.percentualCoberturaSus,
        deficitPorProcedimento: -consolidado.benchmarkFinanceiro.deficitSusReais
      }
    };

    return NextResponse.json({
      success: true,
      data: analysis,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v2.0-dynamic-door-to-door',
        fonte_dados: 'HubDespesasService'
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
