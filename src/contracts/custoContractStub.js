/**
 * Vigia Custos — Contrato Stub/Mock para Módulos Satélites (Caminho Antigravity)
 * 
 * Emite eventos de custo conforme o contrato estabelecido no caminho Claude:
 * - Tabela centros_custo (id, tipo, nome, tenant_id)
 * - Tabela eventos_custo (id, episodio_id, centro_custo_id, tipo, valor, timestamp, origem_modulo)
 * - Função emitir_evento_custo(...)
 */

export const MOCK_CENTROS_CUSTO = [
  { id: 'CC-01', nome: 'Administração Geral', tipo: 'auxiliar', tenant_id: 'tenant-demo' },
  { id: 'CC-02', nome: 'Almoxarifado & Farmácia Central', tipo: 'auxiliar', tenant_id: 'tenant-demo' },
  { id: 'CC-03', nome: 'Manutenção & Limpeza', tipo: 'auxiliar', tenant_id: 'tenant-demo' },
  { id: 'CC-04', nome: 'UBS Central — Atendimento Clínico', tipo: 'produtivo', tenant_id: 'tenant-demo' },
  { id: 'CC-05', nome: 'UBS Bairro Novo — Pediatria', tipo: 'produtivo', tenant_id: 'tenant-demo' },
  { id: 'CC-06', nome: 'Enfermaria Geral', tipo: 'produtivo', tenant_id: 'tenant-demo' },
  { id: 'CC-07', nome: 'Laboratório Municipal', tipo: 'produtivo', tenant_id: 'tenant-demo' }
];

export class CustoContractStub {
  constructor() {
    this.eventosEmitidos = [];
    this.centrosCusto = [...MOCK_CENTROS_CUSTO];
    this.listeners = [];
  }

  getCentrosCusto() {
    return this.centrosCusto;
  }

  getCentroCustoById(id) {
    return this.centrosCusto.find(cc => cc.id === id) || null;
  }

  /**
   * Emite um evento de custo para o motor do núcleo
   * @param {Object} evento 
   * @returns {Object} Evento registrado com ID e Timestamp
   */
  emitirEventoCusto({ centro_custo_id, tipo, valor, origem_modulo, episodio_id = null, detalhes = {} }) {
    if (!centro_custo_id || !tipo || valor === undefined || valor === null) {
      throw new Error('Parâmetros obrigatórios em falta: centro_custo_id, tipo, valor');
    }

    const centro = this.getCentroCustoById(centro_custo_id);
    const novoEvento = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: 'tenant-demo',
      centro_custo_id,
      centro_custo_nome: centro ? centro.nome : 'Desconhecido',
      episodio_id,
      tipo, // ex: 'RH_HORA_TRABALHADA', 'SAIDA_ESTOQUE', 'NOTA_SERVICO'
      valor: parseFloat(parseFloat(valor).toFixed(2)),
      origem_modulo, // ex: 'VIGIA_RH', 'VIGIA_ESTOQUE'
      detalhes,
      timestamp: new Date().toISOString()
    };

    this.eventosEmitidos.unshift(novoEvento);
    this.notifyListeners(novoEvento);
    return novoEvento;
  }

  getEventos() {
    return this.eventosEmitidos;
  }

  clearEventos() {
    this.eventosEmitidos = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners(evento) {
    this.listeners.forEach(fn => fn(evento));
  }
}

export const custoContract = new CustoContractStub();
