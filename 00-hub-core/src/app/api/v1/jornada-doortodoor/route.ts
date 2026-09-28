import { NextRequest, NextResponse } from 'next/server';

export interface RegistrarEstacaoPayload {
  pacienteCpf: string;
  pacienteNome: string;
  episodioId?: string;
  estacaoNumero?: number;
  moduloOrigem: string;
  centroCusto: string;
  itemCodigo: string;
  itemDescricao: string;
  quantidade: number;
  valorUnitario: number;
  loteFabricante?: string;
  leitoIdentificador?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const mockConsolidado = {
      paciente: {
        cpf,
        nome: 'Carlos Eduardo Silveira',
        episodioId: 'EPIS-2026-8841',
        leitoAtual: 'Leito 204-B (UTI Isolamento)',
        dataAdmissao: '2026-09-20T08:30:00Z',
        tempoPermanenciaHoras: 48,
      },
      custoTotalReal: 7461.50,
      estacoes: [
        { estacaoNumero: 1, titulo: '1. Acolhimento & Triagem / Consultório', totalGasto: 180.00 },
        { estacaoNumero: 2, titulo: '2. Apoio Diagnóstico & Exames LIMS', totalGasto: 152.50 },
        { estacaoNumero: 3, titulo: '3. Insumos de Almoxarifado & OPME', totalGasto: 3760.00 },
        { estacaoNumero: 4, titulo: '4. Terapia Medicamentosa Beira-Leito', totalGasto: 419.00 },
        { estacaoNumero: 5, titulo: '5. Hotelaria, Diárias & Honorários Médicos', totalGasto: 3350.00 },
      ],
      benchmarks: {
        tuss: {
          faturamentoPrevisto: 12500.00,
          faturamentoLiquido: 11875.00,
          margemBrutaReais: 4413.50,
          margemPercentual: 37.16,
          status: 'LUCRO_EXCELENTE',
        },
        sigtapSus: {
          repasseOficial: 2850.00,
          deficitReal: -4611.50,
          percentualCobertura: 38.20,
        },
        cmed: {
          tetoMaximo: 8900.00,
          conformidade: 'DENTRO_DO_TETO',
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: mockConsolidado,
      error: null,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1.0-rest',
        metodologia: 'DOOR_TO_DOOR_REALTIME_ENGINE',
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro ao consultar jornada.';
    return NextResponse.json({ success: false, data: null, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RegistrarEstacaoPayload = await request.json();

    if (!body.pacienteCpf || !body.itemCodigo || !body.itemDescricao || !body.valorUnitario) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Payload incompleto. pacienteCpf, itemCodigo, itemDescricao e valorUnitario são obrigatórios.',
        },
        { status: 400 }
      );
    }

    const valorTotal = (Number(body.quantidade) || 1) * Number(body.valorUnitario);

    return NextResponse.json(
      {
        success: true,
        data: {
          protocolo: `PROT-DOOR-${Date.now()}`,
          itemRegistrado: {
            pacienteCpf: body.pacienteCpf,
            estacaoNumero: body.estacaoNumero || 1,
            itemCodigo: body.itemCodigo,
            itemDescricao: body.itemDescricao,
            valorTotalImputado: valorTotal,
          },
          novoCustoTotalReal: 7461.50 + valorTotal,
        },
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1.0-rest',
          mensagem: 'Item de custo imputado com sucesso no cálculo Door-to-Door.',
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro ao registrar estação da jornada.';
    return NextResponse.json({ success: false, data: null, error: errorMsg }, { status: 500 });
  }
}
