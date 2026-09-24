import { NextRequest, NextResponse } from 'next/server';
import { RelatoriosService } from '@/lib/estoque/relatoriosService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') || 'resumo';
    const formato = searchParams.get('formato') || 'json';

    if (tipo === 'curva_abc') {
      const curva = RelatoriosService.gerarCurvaAbc();
      return NextResponse.json({ success: true, curva });
    }

    if (tipo === 'auditoria_fefo') {
      const desvios = RelatoriosService.listarAuditoriaDesviosFefo();
      return NextResponse.json({ success: true, total: desvios.length, desvios });
    }

    if (tipo === 'bnafar') {
      const bnafar = RelatoriosService.exportarBnafarHorus();

      if (formato === 'csv') {
        return new NextResponse(bnafar.csvConteudo, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="exportacao_bnafar_horus_itaquirai.csv"'
          }
        });
      }

      return NextResponse.json({ success: true, bnafar });
    }

    // Resumo consolidado de relatórios
    const curva = RelatoriosService.gerarCurvaAbc();
    const desviosFefo = RelatoriosService.listarAuditoriaDesviosFefo();

    return NextResponse.json({
      success: true,
      relatorios: {
        totalValorEstoque: curva.totalValor,
        itensCurvaA: curva.itens.filter(i => i.classificacao === 'A').length,
        itensCurvaB: curva.itens.filter(i => i.classificacao === 'B').length,
        itensCurvaC: curva.itens.filter(i => i.classificacao === 'C').length,
        totalDesviosFefoAuditados: desviosFefo.length
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
