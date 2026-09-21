/**
 * Vigia Agenda — Gancho de Custo para Atendimentos Ambulatoriais (Sprint 9)
 * 
 * Adapta consultas e procedimentos ambulatoriais para emitir eventos de custo no episódio do paciente.
 */

export class ConsultaAtendimento {
  constructor({
    id = null,
    episodio_id = null,
    paciente_id,
    paciente_nome,
    profissional_nome,
    especialidade = 'Clínica Geral',
    tipo_atendimento = 'CONSULTA_CLINICA', // CONSULTA_CLINICA | PROCEDIMENTO_SIMPLES | EXAME
    duracao_minutos = 20,
    centro_custo_id = 'CC-04',
    data_hora = new Date().toISOString()
  }) {
    this.id = id || `ATD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.episodio_id = episodio_id || `EPI-AMB-${Date.now()}`;
    this.paciente_id = paciente_id;
    this.paciente_nome = paciente_nome;
    this.profissional_nome = profissional_nome;
    this.especialidade = especialidade;
    this.tipo_atendimento = tipo_atendimento;
    this.duracao_minutos = Number(duracao_minutos) || 20;
    this.centro_custo_id = centro_custo_id;
    this.data_hora = data_hora;
  }

  /**
   * Emite evento de custo para a consulta considerando o custo/hora do profissional + taxa da sala
   */
  emitirEventoCusto({ custoContract, custoHoraProfissional = 75.00 }) {
    if (!custoContract) return null;

    const horasAtendimento = this.duracao_minutos / 60;
    const custoProfissionalAtendimento = Math.round((custoHoraProfissional * horasAtendimento) * 100) / 100;

    return custoContract.emitirEventoCusto({
      centro_custo_id: this.centro_custo_id,
      episodio_id: this.episodio_id,
      tipo: 'ATENDIMENTO_AMBULATORIAL',
      valor: custoProfissionalAtendimento,
      origem_modulo: 'VIGIA_AGENDA',
      detalhes: {
        paciente_nome: this.paciente_nome,
        profissional_nome: this.profissional_nome,
        especialidade: this.especialidade,
        duracao_minutos: this.duracao_minutos,
        custo_hora_profissional: custoHoraProfissional
      }
    });
  }
}
