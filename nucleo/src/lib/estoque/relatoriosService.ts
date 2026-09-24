// ============================================================================
// RelatoriosService: Inteligência de Estoque, Curva ABC, Auditoria e BNAFAR/Hórus
// ============================================================================

import { EstoqueStore } from './estoqueStore';
import { LocaisService } from './locaisService';

export interface ItemCurvaAbc {
  produtoId: string;
  nome: string;
  codigoCatmat: string;
  saldoConsolidado: number;
  valorTotalEstoque: number;
  percentualValor: number;
  percentualAcumulado: number;
  classificacao: 'A' | 'B' | 'C';
}

export interface RegistroBnafar {
  cnes_estabelecimento: string;
  nome_estabelecimento: string;
  codigo_catmat: string;
  descricao_medicamento: string;
  numero_lote: string;
  data_validade: string;
  tipo_movimento: string;
  quantidade: number;
  data_movimento: string;
  documento_referencia?: string;
  justificativa?: string;
}

export class RelatoriosService {
  /**
   * Gera Análise de Curva ABC de Medicamentos
   */
  static gerarCurvaAbc(): { itens: ItemCurvaAbc[]; totalValor: number } {
    const produtos = EstoqueStore.listarProdutos();
    const itensCalculados = produtos.map(prod => {
      const lotes = EstoqueStore.listarLotes({ produtoId: prod.id });
      const saldoTotal = lotes.reduce((acc, l) => acc + (l.saldo_total || 0), 0);
      const custoMedio = lotes.length > 0 
        ? lotes.reduce((acc, l) => acc + l.custo_unitario_base, 0) / lotes.length 
        : 1.0;
      const valorTotal = saldoTotal * custoMedio;

      return {
        produtoId: prod.id,
        nome: prod.nome,
        codigoCatmat: prod.codigo_catmat,
        saldoConsolidado: saldoTotal,
        valorTotalEstoque: valorTotal
      };
    });

    const valorGeral = itensCalculados.reduce((acc, curr) => acc + curr.valorTotalEstoque, 0) || 1;

    // Ordena decrescente por valor financeiro
    itensCalculados.sort((a, b) => b.valorTotalEstoque - a.valorTotalEstoque);

    let acumulado = 0;
    const itensFinal: ItemCurvaAbc[] = itensCalculados.map(item => {
      const pct = (item.valorTotalEstoque / valorGeral) * 100;
      acumulado += pct;

      let classe: 'A' | 'B' | 'C' = 'C';
      if (acumulado <= 75) {
        classe = 'A';
      } else if (acumulado <= 90) {
        classe = 'B';
      }

      return {
        ...item,
        percentualValor: Number(pct.toFixed(2)),
        percentualAcumulado: Number(acumulado.toFixed(2)),
        classificacao: classe
      };
    });

    return {
      itens: itensFinal,
      totalValor: Number(valorGeral.toFixed(2))
    };
  }

  /**
   * Lista auditoria de dispensações e separações fora de FEFO com justificativas
   */
  static listarAuditoriaDesviosFefo() {
    const movimentacoes = EstoqueStore.listarMovimentacoes(undefined, 200);
    return movimentacoes.filter(m => 
      m.justificativa?.includes('[OVERRIDE FEFO]') || 
      m.justificativa?.includes('[DISPENSAÇÃO FORA FEFO]')
    );
  }

  /**
   * Prepara os registros para exportação BNAFAR / Hórus (Ministério da Saúde)
   */
  static exportarBnafarHorus(dataInicio?: string, dataFim?: string): {
    registros: RegistroBnafar[];
    csvConteudo: string;
    totalMovimentacoes: number;
  } {
    const locais = LocaisService.listarLocais();
    const mapaLocais = new Map(locais.map(l => [l.id, l]));
    const movimentacoes = EstoqueStore.listarMovimentacoes(undefined, 500);

    const filtradas = movimentacoes.filter(m => {
      if (dataInicio && new Date(m.criado_em) < new Date(dataInicio)) return false;
      if (dataFim && new Date(m.criado_em) > new Date(dataFim)) return false;
      return true;
    });

    const registros: RegistroBnafar[] = filtradas.map(m => {
      const local = m.local_origem_id ? mapaLocais.get(m.local_origem_id) : mapaLocais.get(m.local_destino_id || '');
      const lote = EstoqueStore.listarLotes().find(l => l.id === m.lote_id);
      const prod = lote ? EstoqueStore.obterProdutoPorId(lote.produto_id) : null;

      return {
        cnes_estabelecimento: local?.cnes || '5540887',
        nome_estabelecimento: local?.nome || 'Estabelecimento Municipal',
        codigo_catmat: prod?.codigo_catmat || 'BR0000000',
        descricao_medicamento: prod?.nome || 'Medicamento',
        numero_lote: lote?.numero_lote || 'S/LOTE',
        data_validade: lote?.data_validade || '',
        tipo_movimento: m.tipo,
        quantidade: m.quantidade,
        data_movimento: m.criado_em,
        documento_referencia: m.documento_referencia,
        justificativa: m.justificativa
      };
    });

    // Gera CSV em formato padrão federal com cabeçalho delimitado por ponto-e-vírgula
    const cabecalho = 'CNES;ESTABELECIMENTO;CATMAT;MEDICAMENTO;LOTE;VALIDADE;TIPO_MOVIMENTO;QUANTIDADE;DATA_MOVIMENTO;DOCUMENTO;JUSTIFICATIVA\n';
    const linhas = registros.map(r => 
      `"${r.cnes_estabelecimento}";"${r.nome_estabelecimento}";"${r.codigo_catmat}";"${r.descricao_medicamento}";"${r.numero_lote}";"${r.data_validade}";"${r.tipo_movimento}";${r.quantidade};"${r.data_movimento}";"${r.documento_referencia || ''}";"${r.justificativa || ''}"`
    ).join('\n');

    return {
      registros,
      csvConteudo: cabecalho + linhas,
      totalMovimentacoes: registros.length
    };
  }
}
