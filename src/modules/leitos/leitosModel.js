/**
 * Vigia Leitos — Modelo de Internação Simples e Emissão de Diárias (Sprint 10)
 * 
 * Gerencia ciclo de internação (admissão, diária de enfermaria, alta) e emissão de eventos de custo por diária.
 */

export class InternacaoLeito {
  constructor({
    id = null,
    episodio_id = null,
    paciente_id,
    paciente_nome,
    numero_leito = 'LEITO-01',
    tipo_leito = 'ENFERMARIA', // ENFERMARIA | APARTAMENTO
    custo_diaria_base = 250.00, // Custo base da diária hotelaria/enfermagem
    centro_custo_id = 'CC-06', // Enfermaria Geral
    data_admissao = new Date().toISOString()
  }) {
    this.id = id || `INT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.episodio_id = episodio_id || `EPI-INT-${Date.now()}`;
    this.paciente_id = paciente_id;
    this.paciente_nome = paciente_nome;
    this.numero_leito = numero_leito;
    this.tipo_leito = tipo_leito;
    this.custo_diaria_base = Number(custo_diaria_base) || 250.00;
    this.centro_custo_id = centro_custo_id;
    this.data_admissao = data_admissao;
    this.data_alta = null;
    this.diarias_cumpridas = 0;
  }

  /**
   * Adiciona N diárias de permanência e emite os eventos de custo para o centro de custo Enfermaria
   */
  registrarDiarias(qtdDiarias, custoContract) {
    this.diarias_cumpridas += qtdDiarias;
    const eventosEmitidos = [];

    for (let i = 0; i < qtdDiarias; i++) {
      if (custoContract) {
        const evt = custoContract.emitirEventoCusto({
          centro_custo_id: this.centro_custo_id,
          episodio_id: this.episodio_id,
          tipo: 'DIARIA_INTERNACAO_ENFERMARIA',
          valor: this.custo_diaria_base,
          origem_modulo: 'VIGIA_LEITOS',
          detalhes: {
            paciente_nome: this.paciente_nome,
            numero_leito: this.numero_leito,
            tipo_leito: this.tipo_leito,
            diaria_numero: this.diarias_cumpridas - qtdDiarias + i + 1
          }
        });
        eventosEmitidos.push(evt);
      }
    }

    return eventosEmitidos;
  }

  darAlta() {
    this.data_alta = new Date().toISOString();
    return this;
  }
}
