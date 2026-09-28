import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const consolidado = HubDespesasService.obterConsolidadoPaciente(cpf);

    if (!consolidado) {
      return NextResponse.json(
        { success: false, data: null, error: `Jornada não encontrada para o CPF: ${cpf}` },
        { status: 404 }
      );
    }

    const estacoesFormatadas = consolidado.estacoes.map(e => ({
      ordem: e.estacaoNumero,
      estacao: e.titulo,
      moduloResponsavel: e.modulosRelacionados.join(', '),
      horarioEntrada: '08:00',
      horarioSaida: '10:00',
      duracaoMinutos: Math.round(consolidado.paciente.tempoPermanenciaHoras * 60),
      custoGerado: e.totalGasto,
      descricao: `${e.quantidadeItens} itens de custo computados nesta estação.`,
      detalhesIntegracao: `Módulos integrados: ${e.modulosRelacionados.join(' | ')}`,
      status: e.quantidadeItens > 0 ? 'CONCLUIDO' : 'AGUARDANDO',
      itensDetalhes: e.itens.map(it => ({
        descricao: it.item_descricao,
        valor: it.valor_total_imputado,
        origem: it.origem_modulo,
        lote: it.lote_fabricante,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        cpf: consolidado.paciente.cpf,
        nomePaciente: consolidado.paciente.nome,
        convenio: 'Unimed Pleno (TUSS / SIGTAP)',
        clinicaResponsavel: 'Clínica Especializada 360',
        dataAtendimento: consolidado.paciente.dataAdmissao,
        estacoes: estacoesFormatadas,
        custoTotalAcumulado: consolidado.custoTotalReal,
        faturamentoEsperado: consolidado.benchmarkFinanceiro.faturamentoPrevistoTuss,
        margemFinal: consolidado.benchmarkFinanceiro.margemBrutaReais,
        repasseSusSigtap: consolidado.benchmarkFinanceiro.repasseSigtapSus,
        deficitSus: consolidado.benchmarkFinanceiro.deficitSusReais,
      },
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        metodologia: 'CUSTEIO_DOOR_TO_DOOR_360',
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao consultar jornada.';
    return NextResponse.json({ success: false, data: null, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.pacienteCpf || !body.itemDescricao || !body.valorUnitario) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios ausentes (pacienteCpf, itemDescricao, valorUnitario).' },
        { status: 400 }
      );
    }

    const resultado = HubDespesasService.ingerirLote({
      origem_modulo: body.moduloOrigem || 'GESTAO_CLINICA',
      despesas: [
        {
          id_transacao: `DSP-${Date.now()}`,
          paciente_cpf: body.pacienteCpf,
          paciente_nome: body.pacienteNome || 'Paciente Hospital 360',
          prontuario_episodio: body.episodioId || 'EPIS-2026-001',
          centro_custo: body.centroCusto || 'CENTRO_CUSTO_GERAL',
          item_codigo: body.itemCodigo || 'ITEM-001',
          item_descricao: body.itemDescricao,
          lote_fabricante: body.lote,
          quantidade: Number(body.quantidade) || 1,
          unidade_medida: 'Unidade',
          valor_unitario_medio: Number(body.valorUnitario),
          valor_total_imputado: (Number(body.quantidade) || 1) * Number(body.valorUnitario),
          data_consumo: new Date().toISOString(),
          estacao_jornada: Number(body.estacaoNumero) || 1,
        },
      ],
    });

    const atualizado = HubDespesasService.obterConsolidadoPaciente(body.pacienteCpf);

    return NextResponse.json(
      {
        success: true,
        data: {
          protocolo: resultado.protocolo,
          novoCustoTotal: atualizado?.custoTotalReal,
          consolidado: atualizado,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao registrar item da jornada.';
    return NextResponse.json({ success: false, data: null, error: errorMsg }, { status: 500 });
  }
}
