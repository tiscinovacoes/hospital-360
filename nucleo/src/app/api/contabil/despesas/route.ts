import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    // Obtém o custo real apurado no Hub
    const consolidado = HubDespesasService.obterConsolidadoPaciente(cpf);

    if (!consolidado) {
      return NextResponse.json(
        { success: false, error: 'Paciente sem custos consolidados no Hub para apuração contábil.' },
        { status: 404 }
      );
    }

    const custoReal = consolidado.custoTotalReal;
    const faturamentoBrutoTuss = consolidado.benchmarkFinanceiro.faturamentoPrevistoTuss;
    const glosaProvisao = consolidado.benchmarkFinanceiro.glosaEstimada;
    const faturamentoLiquido = consolidado.benchmarkFinanceiro.faturamentoLiquidoEsperado;

    // Regra do Condomínio Hospitalar 360:
    // Taxa de Condomínio Hospitalar = 20% do faturamento líquido
    // Repasse Operador / Clínica Parceira = 80% do faturamento líquido
    const taxaCondominioHospitalar = Number((faturamentoLiquido * 0.20).toFixed(2));
    const repasseClinicaParceira = Number((faturamentoLiquido * 0.80).toFixed(2));
    const margemContribuicaoCondominio = Number((taxaCondominioHospitalar - (custoReal * 0.20)).toFixed(2));

    return NextResponse.json({
      success: true,
      modulo: 'FINTECH_SPLIT_CONTABIL',
      paciente: consolidado.paciente,
      demonstrativo_dre_paciente: {
        faturamento_bruto_tuss: faturamentoBrutoTuss,
        deducao_glosas_tecnicas: -glosaProvisao,
        faturamento_liquido_operacional: faturamentoLiquido,
        custo_total_assistencial_real: -custoReal,
        split_recebiveis: {
          taxa_administracao_condominio_20pct: taxaCondominioHospitalar,
          repasse_corpo_clinico_parceiro_80pct: repasseClinicaParceira
        },
        resultado_liquido_episodio: consolidado.benchmarkFinanceiro.margemBrutaReais,
        margem_contribuicao_percentual: consolidado.benchmarkFinanceiro.margemPercentual,
        status_lucratividade: consolidado.benchmarkFinanceiro.statusMargem
      },
      confronto_publico_sus: {
        teto_repasse_sigtap: consolidado.benchmarkFinanceiro.repasseSigtapSus,
        deficit_assistencial_sus: consolidado.benchmarkFinanceiro.deficitSusReais,
        cobertura_sus_percentual: consolidado.benchmarkFinanceiro.percentualCoberturaSus
      },
      nfse_status: {
        numero_rps: `RPS-2026-${Date.now().toString().slice(-4)}`,
        tomador: consolidado.paciente.nome,
        valor_servicos: faturamentoLiquido,
        iss_retido_2pct: Number((faturamentoLiquido * 0.02).toFixed(2)),
        situacao: 'PRONTO_PARA_TRANSMISSAO_PREFEITURA'
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
