import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const consolidado = HubDespesasService.obterConsolidadoPaciente(cpf);

    if (!consolidado) {
      return NextResponse.json(
        {
          success: false,
          error: `Nenhuma despesa localizada no Hub 360 para o paciente CPF ${cpf}. Realize a ingestão a partir dos módulos hospitalares.`
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: consolidado,
      meta: {
        versao: '2.0-door-to-door-vigia',
        timestamp: new Date().toISOString(),
        gerado_por: 'Motor de Custos Door-to-Door Hospital 360'
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
