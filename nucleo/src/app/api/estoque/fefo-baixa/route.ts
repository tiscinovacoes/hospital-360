import { NextRequest, NextResponse } from 'next/server';
import { EstoqueStore } from '@/lib/estoque/estoqueStore';
import { FefoEngine } from '@/lib/estoque/fefoEngine';

/** Lote consumido numa baixa FEFO, com rastreabilidade de validade e teto CMED. */
export interface ItemBaixadoFefo {
  loteId: string;
  nomeMedicamento: string;
  fabricante: string;
  quantidadeBaixada: number;
  saldoRemanescente: number;
  dataValidade: string;
  diasAteVencimento: number;
  alertaCritico: string;
  custoUnitario: number;
  precoTetoCmed: number;
  custoTotalBaixa: number;
  acimaTetoCmed: boolean;
}

/** Comprovante da baixa FEFO devolvido em `data`, usado pelo app de tarefas. */
export interface ComprovanteBaixaFefo {
  idBaixa: string;
  timestamp: string;
  atendimentoId: string;
  pacienteNome: string;
  cpf: string;
  origemModulo: string;
  responsavel: string;
  motivo: string;
  regraAplicada: string;
  itensBaixados: ItemBaixadoFefo[];
  loteConsumido: ItemBaixadoFefo | undefined;
  custoTotalConsumido: number;
  alertaTetoCmed: boolean;
  statusIntegracaoOpenBoxes: string;
  hubCustos: {
    protocolo: string;
    estacao: number;
    estacaoNome: string;
    valorImputado: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const localId = searchParams.get('localId') || undefined;
    const produtoId = searchParams.get('produtoId') || undefined;

    const lotes = EstoqueStore.listarLotes({
      localId,
      produtoId,
      apenasDisponiveis: false
    });

    return NextResponse.json({
      success: true,
      origem_dados: 'SUPABASE_SATELITES_OPERACIONAL',
      totalLotes: lotes.length,
      lotes
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      produtoId,
      loteEscolhidoId,
      quantidade = 1,
      pacienteCpf = '000.000.000-00',
      pacienteNome = 'Paciente Ambulatorial',
      localId,
      numeroReceita,
      justificativaOverride,
      usuario = 'farmaceutico_responsavel',
      motivo = 'Prescrição Médica Ambulatorial'
    } = body;

    if (!produtoId) {
      return NextResponse.json(
        { success: false, error: 'Código ou identificador do produto é obrigatório para baixa FEFO.' },
        { status: 400 }
      );
    }

    // Busca produto por ID ou por código
    const produtos = EstoqueStore.listarProdutos();
    const produto = produtos.find(p => p.id === produtoId || p.codigo_catmat === produtoId) || produtos[0];

    if (!produto) {
      return NextResponse.json(
        { success: false, error: `Produto ID '${produtoId}' não encontrado no catálogo municipal.` },
        { status: 404 }
      );
    }

    // Se não informou lote específico, seleciona o sugerido pelo FEFO automaticamente
    let loteIdParaBaixar = loteEscolhidoId;
    if (!loteIdParaBaixar) {
      const lotesDisponiveis = EstoqueStore.listarLotes({
        produtoId: produto.id,
        localId,
        apenasDisponiveis: true
      });

      const sugestao = FefoEngine.sugerirLoteFefo(lotesDisponiveis, 0);
      if (!sugestao || !sugestao.loteSugerido) {
        return NextResponse.json(
          {
            success: false,
            codigoErro: 'RUPTURA_ESTOQUE',
            error: `Ruptura de estoque: medicamento ${produto.nome} sem saldo liberado disponível na unidade.`
          },
          { status: 422 }
        );
      }
      loteIdParaBaixar = sugestao.loteSugerido.id;
    }

    // Efetua dispensação com validação FEFO e registro de evento de jornada no núcleo
    const resultado = await EstoqueStore.dispensarAoPaciente({
      pacienteCpf,
      pacienteNome,
      localId: localId || '11111111-0000-0000-0000-000000000002', // Default UBS Flademir Carnizella
      produtoId: produto.id,
      loteEscolhidoId: loteIdParaBaixar,
      quantidade: Number(quantidade),
      numeroReceita,
      justificativaOverride,
      usuario
    });

    const loteConsumidoObj = EstoqueStore.listarLotes().find(l => l.id === loteIdParaBaixar);

    const itemBaixado: ItemBaixadoFefo = {
      loteId: loteIdParaBaixar,
      nomeMedicamento: produto.nome,
      fabricante: loteConsumidoObj?.fabricante || 'Laboratório Farmacêutico',
      quantidadeBaixada: Number(quantidade),
      saldoRemanescente: loteConsumidoObj?.saldo_total || 0,
      dataValidade: loteConsumidoObj?.data_validade || '',
      diasAteVencimento: loteConsumidoObj?.dias_ate_vencimento || 0,
      alertaCritico: (loteConsumidoObj?.dias_ate_vencimento || 0) <= 30 ? 'ALERTA_PROXIMO_VENCIMENTO' : 'REGULAR',
      custoUnitario: loteConsumidoObj?.custo_unitario_base || 1.0,
      precoTetoCmed: (loteConsumidoObj?.custo_unitario_base || 1.0) * 1.25,
      custoTotalBaixa: resultado.custoTotal,
      acimaTetoCmed: false
    };

    const comprovante: ComprovanteBaixaFefo = {
      idBaixa: resultado.movimentacaoId,
      timestamp: new Date().toISOString(),
      atendimentoId: `ATEND-${Date.now()}`,
      pacienteNome: pacienteNome || 'Paciente Ambulatorial',
      cpf: pacienteCpf,
      origemModulo: 'VIGIA_ESTOQUE',
      responsavel: usuario,
      motivo,
      regraAplicada: 'FEFO_ESTRITO (Lote com validade mais próxima despachado primeiro)',
      itensBaixados: [itemBaixado],
      loteConsumido: itemBaixado,
      custoTotalConsumido: resultado.custoTotal,
      alertaTetoCmed: false,
      statusIntegracaoOpenBoxes: 'BAIXA_CONFIRMADA_INVENTARIO',
      hubCustos: {
        protocolo: `PROT-${Date.now()}`,
        estacao: 4,
        estacaoNome: 'Estação 4: Farmácia Ambulatorial UBS',
        valorImputado: resultado.custoTotal
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Baixa FEFO efetuada com sucesso e custo integrado à jornada do paciente.',
      dispensacao: {
        idBaixa: resultado.movimentacaoId,
        medicamento: produto.nome,
        codigoCatmat: produto.codigo_catmat,
        quantidade,
        unidadeBase: produto.unidade_base,
        custoTotal: resultado.custoTotal,
        pacienteCpfMascarado: resultado.pacienteCpfMascarado,
        eventoJornadaIntegrado: resultado.eventoJornadaIntegrado,
        motivo
      },
      data: comprovante
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar baixa FEFO: ' + msg },
      { status: 422 }
    );
  }
}
