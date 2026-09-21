/**
 * Vigia Custos — Módulo Facilities (Limpeza)
 */

export class RequisicaoLimpeza {
  constructor({
    id = null,
    local,
    centro_custo_id,
    tipo = 'CONCORRENTE', // TERMINAL | CONCORRENTE | PREVENTIVA
    prioridade = 'NORMAL', // NORMAL | ALTA | URGENTE
    status = 'PENDENTE', // PENDENTE | CONCLUIDA
    data_hora = new Date().toISOString()
  }) {
    this.id = id || `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.local = local;
    this.centro_custo_id = centro_custo_id;
    this.tipo = tipo;
    this.prioridade = prioridade;
    this.status = status;
    this.data_hora = data_hora;
    this.valorCustoEstimado = this.calcularCusto();
  }

  calcularCusto() {
    // Custos baseados no tipo (insumos + tempo do profissional terceiro)
    const custosBase = {
      'TERMINAL': 150.00,
      'CONCORRENTE': 45.00,
      'PREVENTIVA': 30.00
    };
    
    let custo = custosBase[this.tipo] || 45.00;

    // Adicional por urgência (deslocamento rápido, EPIs extras)
    if (this.prioridade === 'URGENTE') {
      custo *= 1.5;
    }

    return custo;
  }

  concluir(custoContract) {
    if (this.status === 'CONCLUIDA') return null;
    this.status = 'CONCLUIDA';
    
    if (!custoContract) return null;

    // Emite o evento de custo para o Vigia Custos
    return custoContract.emitirEventoCusto({
      centro_custo_id: this.centro_custo_id,
      episodio_id: null, // Pode ser vinculado a um episódio depois
      tipo: 'LIMPEZA',
      valor: this.valorCustoEstimado,
      origem_modulo: 'VIGIA_FACILITIES',
      detalhes: {
        local: this.local,
        tipo_limpeza: this.tipo,
        prioridade: this.prioridade
      }
    });
  }
}
