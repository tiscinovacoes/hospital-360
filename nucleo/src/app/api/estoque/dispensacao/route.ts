import { NextRequest, NextResponse } from 'next/server';
import { EstoqueStore } from '@/lib/estoque/estoqueStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pacienteCpf,
      pacienteNome,
      localId,
      produtoId,
      loteEscolhidoId,
      quantidade,
      numeroReceita,
      justificativaOverride,
      usuario = 'farmaceutico_ubs'
    } = body;

    if (!pacienteCpf || !localId || !produtoId || !loteEscolhidoId || !quantidade) {
      return NextResponse.json(
        { success: false, error: 'Campos pacienteCpf, localId, produtoId, loteEscolhidoId e quantidade são obrigatórios.' },
        { status: 400 }
      );
    }

    const resultado = await EstoqueStore.dispensarAoPaciente({
      pacienteCpf,
      pacienteNome,
      localId,
      produtoId,
      loteEscolhidoId,
      quantidade: Number(quantidade),
      numeroReceita,
      justificativaOverride,
      usuario
    });

    return NextResponse.json({
      success: true,
      mensagem: 'Dispensação realizada com sucesso e imputada no custeio assistencial do paciente.',
      resultado
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 422 });
  }
}
