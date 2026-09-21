/**
 * Vigia Compras & Patrimônio — Modelo de Lançamentos de NF e Depreciação de Ativos (OS-01)
 * 
 * Referência de schema: frappe/erpnext (Asset Management & Purchase Invoice)
 * Gerencia Notas Fiscais de serviços/insumos indiretos e Ativos Fixos com depreciação linear.
 */

export class NotaFiscalServico {
  constructor({
    id = null,
    tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    numero_nf,
    fornecedor,
    cnpj_fornecedor = '',
    descricao_servico,
    valor_total = 0,
    centro_custo_id,
    data_emissao = new Date().toISOString().split('T')[0]
  }) {
    this.id = id || `NF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.tenant_id = tenant_id;
    this.numero_nf = numero_nf;
    this.fornecedor = fornecedor;
    this.cnpj_fornecedor = cnpj_fornecedor;
    this.descricao_servico = descricao_servico;
    this.valor_total = Number(valor_total) || 0;
    this.centro_custo_id = centro_custo_id;
    this.data_emissao = data_emissao;
  }

  async emitirEventoCusto(custoContract) {
    if (!custoContract) return null;

    return await custoContract.emitirEventoCusto({
      tenant_id: this.tenant_id,
      centro_custo_id: this.centro_custo_id,
      tipo: 'NOTA_SERVICO_INDIRETO',
      valor: this.valor_total,
      origem_modulo: 'VIGIA_COMPRAS',
      detalhes: {
        numero_nf: this.numero_nf,
        fornecedor: this.fornecedor,
        descricao_servico: this.descricao_servico,
        data_emissao: this.data_emissao
      }
    });
  }
}

export class AtivoPatrimonial {
  constructor({
    id = null,
    tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    codigo_tombamento,
    descricao,
    categoria = 'EQUIPAMENTO_MEDICO',
    valor_aquisicao = 0,
    vida_util_meses = 60,
    valor_residual = 0,
    centro_custo_id,
    data_aquisicao = new Date().toISOString().split('T')[0]
  }) {
    this.id = id || `PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.tenant_id = tenant_id;
    this.codigo_tombamento = codigo_tombamento;
    this.descricao = descricao;
    this.categoria = categoria;
    this.valor_aquisicao = Number(valor_aquisicao) || 0;
    this.vida_util_meses = Number(vida_util_meses) || 60;
    this.valor_residual = Number(valor_residual) || 0;
    this.centro_custo_id = centro_custo_id;
    this.data_aquisicao = data_aquisicao;
  }

  getDepreciacaoMensal() {
    if (this.vida_util_meses <= 0) return 0;
    const depreciável = Math.max(0, this.valor_aquisicao - this.valor_residual);
    return Math.round((depreciável / this.vida_util_meses) * 100) / 100;
  }

  async emitirEventoDepreciacao(custoContract) {
    if (!custoContract) return null;
    const valorDepreciacao = this.getDepreciacaoMensal();

    return await custoContract.emitirEventoCusto({
      tenant_id: this.tenant_id,
      centro_custo_id: this.centro_custo_id,
      tipo: 'DEPRECIACAO_ATIVO_FIXO',
      valor: valorDepreciacao,
      origem_modulo: 'VIGIA_PATRIMONIO',
      detalhes: {
        codigo_tombamento: this.codigo_tombamento,
        descricao: this.descricao,
        categoria: this.categoria,
        valor_aquisicao: this.valor_aquisicao,
        depreciacao_mensal: valorDepreciacao
      }
    });
  }
}
