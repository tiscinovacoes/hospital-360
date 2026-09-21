/**
 * Vigia Estoque — Modelo de Dados e Gestão de Lotes/Dispensação
 * 
 * Referência de schema: frappe/erpnext (Stock & Batch Management)
 * Gerencia medicamentos, lotes, validade FEFO e dispensação vinculada a custo do paciente/episódio.
 */

export class ItemEstoque {
  constructor({
    id = null,
    tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    codigo,
    descricao,
    categoria = 'MEDICAMENTO',
    unidade_medida = 'UNIDADE',
    curva_abc = 'A'
  }) {
    this.id = id || `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.tenant_id = tenant_id;
    this.codigo = codigo;
    this.descricao = descricao;
    this.categoria = categoria;
    this.unidade_medida = unidade_medida;
    this.curva_abc = curva_abc;
  }
}

export class LoteEstoque {
  constructor({
    id = null,
    tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    item_id,
    item_descricao = '',
    numero_lote,
    data_validade,
    quantidade_inicial = 0,
    quantidade_atual = 0,
    valor_unitario = 0,
    fornecedor = 'Distribuidora Farmacêutica'
  }) {
    this.id = id || `LOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.tenant_id = tenant_id;
    this.item_id = item_id;
    this.item_descricao = item_descricao;
    this.numero_lote = numero_lote;
    this.data_validade = data_validade;
    this.quantidade_inicial = Number(quantidade_inicial) || 0;
    this.quantidade_atual = Number(quantidade_atual) || 0;
    this.valor_unitario = Number(valor_unitario) || 0;
    this.fornecedor = fornecedor;
  }

  isVencido() {
    if (!this.data_validade) return false;
    return new Date(this.data_validade) < new Date();
  }

  getValorTotalEstoque() {
    return Math.round(this.quantidade_atual * this.valor_unitario * 100) / 100;
  }
}

export class GestorEstoque {
  constructor() {
    this.itens = [];
    this.lotes = [];
    this.movimentacoes = [];
  }

  adicionarItem(item) {
    this.itens.push(item);
    return item;
  }

  adicionarLote(lote) {
    this.lotes.push(lote);
    return lote;
  }

  async darBaixaMedicamento({
    lote_id,
    quantidade,
    centro_custo_id,
    episodio_id = null,
    paciente_nome = 'Paciente Ambulatorial',
    custoContract
  }) {
    const lote = this.lotes.find(l => l.id === lote_id);
    if (!lote) {
      throw new Error(`Lote '${lote_id}' não encontrado no estoque.`);
    }

    if (lote.quantidade_atual < quantidade) {
      throw new Error(`Saldo insuficiente no lote ${lote.numero_lote}. Disponível: ${lote.quantidade_atual}, Solicitado: ${quantidade}`);
    }

    lote.quantidade_atual -= quantidade;

    const valorTotalBaixa = Math.round(quantidade * lote.valor_unitario * 100) / 100;

    const movimentacao = {
      id: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      lote_id: lote.id,
      numero_lote: lote.numero_lote,
      item_descricao: lote.item_descricao,
      tipo: 'SAIDA_DISPENSACAO',
      quantidade,
      valor_unitario: lote.valor_unitario,
      valor_total: valorTotalBaixa,
      centro_custo_id,
      episodio_id,
      paciente_nome,
      timestamp: new Date().toISOString()
    };

    this.movimentacoes.unshift(movimentacao);

    if (custoContract) {
      const evt = await custoContract.emitirEventoCusto({
        tenant_id: lote.tenant_id,
        centro_custo_id,
        episodio_id,
        tipo: 'SAIDA_ESTOQUE_MEDICAMENTO',
        valor: valorTotalBaixa,
        origem_modulo: 'VIGIA_ESTOQUE',
        detalhes: {
          item_descricao: lote.item_descricao,
          numero_lote: lote.numero_lote,
          quantidade,
          valor_unitario: lote.valor_unitario,
          paciente_nome
        }
      });
      movimentacao.eventoCusto = evt;
    }

    return movimentacao;
  }

  getSaldoTotalEstoque() {
    return this.lotes.reduce((acc, l) => acc + l.getValorTotalEstoque(), 0);
  }
}
