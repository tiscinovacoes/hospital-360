/**
 * Vigia RH — Modelo de Dados e Calculadora de Custo/Hora
 * 
 * Referência de schema: frappe/hrms
 * Trata vínculos, salários, encargos trabalhistas, benefícios e distribuição em Centros de Custo.
 */

export class Servidor {
  constructor({
    id = null,
    tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    nome,
    cpf,
    matricula,
    cargo,
    vinculo = 'EFETIVO', // EFETIVO | COMISSIONADO | CONTRATADO | TERCEIRIZADO
    carga_horaria_semanal = 40,
    salario_base = 0,
    encargos_percentual = 22,
    beneficios_valor = 0,
    alocacoes_centros_custo = [],
    status = 'ATIVO'
  }) {
    this.id = id || `SRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.tenant_id = tenant_id;
    this.nome = nome;
    this.cpf = cpf;
    this.matricula = matricula;
    this.cargo = cargo;
    this.vinculo = vinculo;
    this.carga_horaria_semanal = Number(carga_horaria_semanal) || 40;
    this.salario_base = Number(salario_base) || 0;
    this.encargos_percentual = Number(encargos_percentual) || 0;
    this.beneficios_valor = Number(beneficios_valor) || 0;
    this.alocacoes_centros_custo = Array.isArray(alocacoes_centros_custo) ? alocacoes_centros_custo : [];
    this.status = status;
  }

  getHorasMensais() {
    return Math.round(this.carga_horaria_semanal * 4.3333 * 10) / 10;
  }

  getValorEncargos() {
    return (this.salario_base * this.encargos_percentual) / 100;
  }

  getCustoTotalMensal() {
    const total = this.salario_base + this.getValorEncargos() + this.beneficios_valor;
    return Math.round(total * 100) / 100;
  }

  getCustoHora() {
    const horas = this.getHorasMensais();
    if (horas <= 0) return 0;
    return Math.round((this.getCustoTotalMensal() / horas) * 100) / 100;
  }

  getDistribuicaoCustosPorCentro() {
    const custoTotal = this.getCustoTotalMensal();
    const horasTotais = this.getHorasMensais();
    const custoHora = this.getCustoHora();

    if (this.alocacoes_centros_custo.length === 0) {
      return [];
    }

    return this.alocacoes_centros_custo.map(aloc => {
      const perc = Number(aloc.percentual) || 0;
      const valorAlocado = Math.round((custoTotal * (perc / 100)) * 100) / 100;
      const horasAlocadas = Math.round((horasTotais * (perc / 100)) * 10) / 10;

      return {
        centro_custo_id: aloc.centro_custo_id,
        percentual: perc,
        valor_mensal: valorAlocado,
        horas_alocadas: horasAlocadas,
        custo_hora: custoHora
      };
    });
  }

  async emitirEventosCustoRH(custoContract) {
    const distribuicao = this.getDistribuicaoCustosPorCentro();
    const promessas = distribuicao.map(dist => custoContract.emitirEventoCusto({
      tenant_id: this.tenant_id,
      centro_custo_id: dist.centro_custo_id,
      tipo: 'RH_HORA_TRABALHADA',
      valor: dist.valor_mensal,
      origem_modulo: 'VIGIA_RH',
      detalhes: {
        servidor_id: this.id,
        servidor_nome: this.nome,
        matricula: this.matricula,
        cargo: this.cargo,
        horas_alocadas: dist.horas_alocadas,
        custo_hora: dist.custo_hora,
        percentual_alocado: dist.percentual
      }
    }));

    return await Promise.all(promessas);
  }

  toJSON() {
    return {
      id: this.id,
      tenant_id: this.tenant_id,
      nome: this.nome,
      cpf: this.cpf,
      matricula: this.matricula,
      cargo: this.cargo,
      vinculo: this.vinculo,
      carga_horaria_semanal: this.carga_horaria_semanal,
      salario_base: this.salario_base,
      encargos_percentual: this.encargos_percentual,
      beneficios_valor: this.beneficios_valor,
      alocacoes_centros_custo: this.alocacoes_centros_custo,
      status: this.status,
      horas_mensais: this.getHorasMensais(),
      custo_total_mensal: this.getCustoTotalMensal(),
      custo_hora: this.getCustoHora()
    };
  }
}
