import { NextRequest, NextResponse } from 'next/server';
import {
  HubDespesasService,
  DespesaItem,
  IngestaoDespesasPayload,
  ModuloOrigem
} from '@/lib/hubDespesasStore';

export type DespesaItemPayload = DespesaItem;
export type { IngestaoDespesasPayload };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || undefined;
    const episodio = searchParams.get('episodio') || undefined;
    const origem = searchParams.get('origem') || searchParams.get('origem_modulo') || undefined;
    const centroCusto = searchParams.get('centro_custo') || undefined;
    const estacao = searchParams.get('estacao') ? Number(searchParams.get('estacao')) : undefined;
    const termo = searchParams.get('termo') || searchParams.get('busca') || undefined;

    const despesasFiltradas = HubDespesasService.listarDespesas({
      cpf,
      episodio,
      origem_modulo: origem,
      centro_custo: centroCusto,
      estacao,
      termo
    });

    const totalConsolidado = despesasFiltradas.reduce((acc, d) => acc + d.valor_total_imputado, 0);
    const modulosEmissores = HubDespesasService.obterModulosEmissores();

    // Agrupamento por módulo emissor
    const totalPorModulo = despesasFiltradas.reduce((acc: Record<string, number>, d) => {
      acc[d.origem_modulo] = Number(((acc[d.origem_modulo] || 0) + d.valor_total_imputado).toFixed(2));
      return acc;
    }, {});

    // Agrupamento por centro de custo
    const totalPorCentroCusto = despesasFiltradas.reduce((acc: Record<string, number>, d) => {
      acc[d.centro_custo] = Number(((acc[d.centro_custo] || 0) + d.valor_total_imputado).toFixed(2));
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      total_registros: despesasFiltradas.length,
      valor_total_acumulado: Number(totalConsolidado.toFixed(2)),
      modulos_emissores: modulosEmissores,
      resumo_por_modulo: totalPorModulo,
      resumo_por_centro_custo: totalPorCentroCusto,
      despesas: despesasFiltradas,
      filtros_aplicados: {
        cpf: cpf || null,
        episodio: episodio || null,
        origem: origem || null,
        centro_custo: centroCusto || null,
        estacao: estacao || null
      },
      status_hub: 'OPERACIONAL'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestaoDespesasPayload = await request.json();

    if (!body.origem_modulo || !Array.isArray(body.despesas)) {
      return NextResponse.json(
        { success: false, error: 'Payload inválido. "origem_modulo" e array de "despesas" são obrigatórios.' },
        { status: 400 }
      );
    }

    if (body.despesas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'O lote de despesas não contém itens.' },
        { status: 400 }
      );
    }

    // Ingestão e validação através do HubDespesasService
    const resultado = HubDespesasService.ingerirLote(body);

    return NextResponse.json({
      success: true,
      protocolo: resultado.protocolo,
      mensagem: `Lote de ${resultado.itensAdicionados.length} despesa(s) do módulo ${body.origem_modulo} ingerido com sucesso no Hub 360.`,
      resumo: {
        origem: body.origem_modulo,
        itens_processados: resultado.itensAdicionados.length,
        valor_total: Number(resultado.valorTotal.toFixed(2)),
        pacientes_impactados: resultado.cpfsImpactados.length,
        timestamp_processamento: new Date().toISOString()
      },
      itens_ingeridos: resultado.itensAdicionados
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
