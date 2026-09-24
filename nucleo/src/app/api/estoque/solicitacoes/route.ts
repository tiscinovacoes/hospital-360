import { NextRequest, NextResponse } from 'next/server';
import { EstoqueStore } from '@/lib/estoque/estoqueStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const localId = searchParams.get('localId') || undefined;
    const solicitacaoId = searchParams.get('id') || undefined;

    if (solicitacaoId) {
      const sol = EstoqueStore.obterSolicitacaoPorId(solicitacaoId);
      if (!sol) return NextResponse.json({ success: false, error: 'Solicitação não encontrada.' }, { status: 404 });
      return NextResponse.json({ success: true, solicitacao: sol });
    }

    const solicitacoes = EstoqueStore.listarSolicitacoes(localId);

    return NextResponse.json({
      success: true,
      total: solicitacoes.length,
      solicitacoes
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { acao = 'CRIAR', usuario = 'operador_farmacia' } = body;

    if (acao === 'CRIAR') {
      const { localSolicitanteId, itens, observacoes } = body;
      if (!localSolicitanteId || !itens || !Array.isArray(itens) || itens.length === 0) {
        return NextResponse.json(
          { success: false, error: 'localSolicitanteId e array de itens são obrigatórios.' },
          { status: 400 }
        );
      }

      const novaSolicitacao = EstoqueStore.criarSolicitacao({
        localSolicitanteId,
        solicitadoPor: usuario,
        itens,
        observacoes
      });

      return NextResponse.json({
        success: true,
        mensagem: 'Solicitação de medicamentos despachada para a Farmácia Central (CAF).',
        solicitacao: novaSolicitacao
      });
    }

    if (acao === 'SEPARAR') {
      const { solicitacaoId, separacoes } = body;
      if (!solicitacaoId || !separacoes || !Array.isArray(separacoes)) {
        return NextResponse.json(
          { success: false, error: 'solicitacaoId e array de separacoes são obrigatórios.' },
          { status: 400 }
        );
      }

      const solicitacaoAtualizada = EstoqueStore.separarSolicitacao({
        solicitacaoId,
        separacoes,
        usuario
      });

      return NextResponse.json({
        success: true,
        mensagem: 'Separação FEFO validada e medicamentos liberados para trânsito à UBS.',
        solicitacao: solicitacaoAtualizada
      });
    }

    if (acao === 'CONFIRMAR_RECEBIMENTO') {
      const { solicitacaoId, divergencia } = body;
      if (!solicitacaoId) {
        return NextResponse.json({ success: false, error: 'solicitacaoId é obrigatório.' }, { status: 400 });
      }

      const solicitacaoRecebida = EstoqueStore.confirmarRecebimentoUbs({
        solicitacaoId,
        usuario,
        divergencia
      });

      return NextResponse.json({
        success: true,
        mensagem: divergencia 
          ? 'Recebimento confirmado com registro de ocorrência/divergência.'
          : 'Recebimento confirmado e saldo creditado na farmácia da UBS.',
        solicitacao: solicitacaoRecebida
      });
    }

    return NextResponse.json({ success: false, error: 'Ação não suportada.' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 422 });
  }
}
