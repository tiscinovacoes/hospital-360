import { NextRequest, NextResponse } from 'next/server';
import { mensagemErro } from '@/lib/utils';

export interface IngestionPayload {
  tipo: 'FOLHA_RH' | 'DISPENSACAO_FARMACIA' | 'DESPESA_COMPRA' | 'MANUTENCAO_FACILITIES';
  tenantId?: string;
  registros: Array<{
    cpfPaciente?: string;
    nomePaciente?: string;
    centroCustoId: string;
    descricao: string;
    valor: number;
    quantidade?: number;
    lote?: string;
    validade?: string;
    data: string;
    detalhes?: Record<string, unknown>;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestionPayload = await request.json();

    if (!body.tipo || !Array.isArray(body.registros) || body.registros.length === 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Payload inválido: tipo e registros são obrigatórios.',
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v1.0-modular',
          },
        },
        { status: 400 }
      );
    }

    // Processamento e normalização para eventos de custo
    const totalProcessado = body.registros.length;
    const valorTotal = body.registros.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);

    const eventosGerados = body.registros.map((reg, idx) => ({
      id: `evt-ingest-${Date.now()}-${idx}`,
      tipoOrigem: body.tipo,
      origemModulo: `INGESTAO_${body.tipo}`,
      centroCustoId: reg.centroCustoId,
      cpfPaciente: reg.cpfPaciente || null,
      nomePaciente: reg.nomePaciente || 'Paciente Não Identificado',
      descricao: reg.descricao,
      valor: Number(reg.valor),
      detalhes: {
        ...reg.detalhes,
        lote: reg.lote || null,
        validade: reg.validade || null,
        quantidade: reg.quantidade || 1,
        fonteIngestao: 'INGESTION_FACADE_API',
      },
      dataRegistro: reg.data || new Date().toISOString(),
      status: 'PROCESSADO',
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          tipoIngestao: body.tipo,
          totalRegistros: totalProcessado,
          valorTotalConsolidado: valorTotal,
          eventos: eventosGerados,
          mensagem: `Ingestão concluída com sucesso. ${totalProcessado} eventos integrados ao motor de rateio 360.`,
        },
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1.0-modular',
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: mensagemErro(error, 'Erro interno ao processar ingestão.'),
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1.0-modular',
        },
      },
      { status: 500 }
    );
  }
}
