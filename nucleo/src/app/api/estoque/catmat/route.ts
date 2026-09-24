import { NextRequest, NextResponse } from 'next/server';
import { CatmatService } from '@/lib/estoque/catmatService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const limite = parseInt(searchParams.get('limite') || '30', 10);

    const itens = CatmatService.buscarItens(q, limite);

    return NextResponse.json({
      success: true,
      total: itens.length,
      itens
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const pagina = Number(body.pagina) || 1;
    const tamanhoPagina = Number(body.tamanhoPagina) || 50;

    const res = await CatmatService.sincronizarCatmat(pagina, tamanhoPagina);

    return NextResponse.json({
      success: res.sucesso,
      mensagem: res.sucesso 
        ? `Sincronizados ${res.itensImportados} itens oficiais da Classe 6505 do Compras.gov.br.`
        : 'API do Compras.gov.br indisponível no momento; mantido catálogo oficial em cache.',
      detalhes: res
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
