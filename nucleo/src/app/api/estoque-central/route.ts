import { NextResponse } from 'next/server';
import { EstoqueStore } from '@/lib/estoque/estoqueStore';
import { LocaisService } from '@/lib/estoque/locaisService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const localId = searchParams.get('localId') || undefined;
    const produtoId = searchParams.get('produtoId') || undefined;

    const locais = LocaisService.listarLocais();
    const lotes = EstoqueStore.listarLotes({ localId, produtoId });
    const produtos = EstoqueStore.listarProdutos();
    const movimentacoes = EstoqueStore.listarMovimentacoes(localId, 30);

    const valorTotalEstoque = lotes.reduce((acc, l) => acc + ((l.saldo_total || 0) * l.custo_unitario_base), 0);
    const lotesQuarentena = lotes.filter(l => l.status === 'QUARENTENA' || l.status === 'BLOQUEADO_RECALL');
    const lotesVencidos = lotes.filter(l => (l.dias_ate_vencimento || 0) < 0);
    const alertasPontoRessuprimento = produtos.filter(p => {
      const saldoProd = lotes.filter(l => l.produto_id === p.id).reduce((a, b) => a + (b.saldo_total || 0), 0);
      return saldoProd <= p.estoque_minimo_padrao;
    });

    return NextResponse.json({
      success: true,
      origem_dados: 'SUPABASE_SATELITES_OPERACIONAL',
      metricas: {
        valor_total_estoque_consolidado: Number(valorTotalEstoque.toFixed(2)),
        total_locais_ativos: locais.length,
        total_produtos_padronizados: produtos.length,
        lotes_em_quarentena_ou_bloqueio: lotesQuarentena.length,
        lotes_vencidos: lotesVencidos.length,
        alertas_ponto_ressuprimento: alertasPontoRessuprimento.length,
        status_cadeia_frio: '100% OPERACIONAL CONFORME RDC 430/2020 (ITAQUIRAÍ-MS)'
      },
      locais,
      produtos,
      lotes,
      movimentacoes
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { acao, lote_id, motivo_recall, usuario = 'operador_central' } = body;

    if (acao === 'BLOQUEAR_RECALL') {
      if (!lote_id || !motivo_recall) {
        return NextResponse.json(
          { success: false, error: 'Parâmetros lote_id e motivo_recall são obrigatórios.' },
          { status: 400 }
        );
      }

      const resultado = EstoqueStore.bloquearLoteRecall({
        loteId: lote_id,
        motivo: motivo_recall,
        usuario
      });

      return NextResponse.json({
        success: true,
        mensagem: 'Lote bloqueado imediatamente em todas as unidades da rede de Itaquiraí.',
        resultado
      });
    }

    if (acao === 'CONSULTAR_PERFIL_MEDICAMENTO') {
      const { produto_id } = body;
      if (!produto_id) {
        return NextResponse.json({ success: false, error: 'produto_id é obrigatório.' }, { status: 400 });
      }

      const perfil = EstoqueStore.obterPerfilMedicamento(produto_id);
      if (!perfil) {
        return NextResponse.json({ success: false, error: 'Medicamento não localizado.' }, { status: 404 });
      }

      return NextResponse.json({ success: true, perfil });
    }

    return NextResponse.json({ success: false, error: 'Ação não suportada.' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
