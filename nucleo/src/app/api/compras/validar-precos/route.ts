import { NextRequest, NextResponse } from 'next/server';
import { validateMedicinePrice, CmedValidationInput, CmedValidationResult } from '@/lib/compras/cmedValidator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Se for validação em lote
    if (Array.isArray(body.itens)) {
      const resultados: CmedValidationResult[] = body.itens.map((item: CmedValidationInput) => validateMedicinePrice(item));
      const totalItens = resultados.length;
      const conformes = resultados.filter((r: CmedValidationResult) => r.validation.status === 'OK').length;
      const alertas = resultados.filter((r: CmedValidationResult) => r.validation.status === 'WARNING').length;
      const ilegais = resultados.filter((r: CmedValidationResult) => r.validation.status === 'ILLEGAL').length;

      return NextResponse.json({
        sucesso: true,
        tipo: 'LOTE',
        estatisticas: {
          total: totalItens,
          conformes,
          alertas,
          ilegais_bloqueados: ilegais,
          taxa_conformidade_percentual: totalItens > 0 ? Number(((conformes / totalItens) * 100).toFixed(1)) : 100
        },
        resultados,
        timestamp: new Date().toISOString()
      });
    }

    // Se for validação unitária
    const input: CmedValidationInput = body.item || body;
    if (!input.codigo_catmat && !input.nome_medicamento) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'É obrigatório informar codigo_catmat ou nome_medicamento.'
        },
        { status: 400 }
      );
    }

    const resultado = validateMedicinePrice(input);
    return NextResponse.json({
      sucesso: true,
      tipo: 'UNITARIO',
      resultado
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro interno na validação governamental CMED/BPS';
    return NextResponse.json(
      {
        sucesso: false,
        erro: msg
      },
      { status: 500 }
    );
  }
}
