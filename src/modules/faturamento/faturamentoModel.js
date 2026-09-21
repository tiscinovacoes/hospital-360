/**
 * Vigia Faturamento — Comparativo Custo Real × Repasse SUS (SIGTAP) (Sprint 11)
 * 
 * Fonte de tabela SIGTAP: RenatoKR/SIGTAP
 * Permite confrontar o custo real apurado da jornada do paciente contra a tabela de repasses do SUS (SIA/SIH/SIGTAP).
 */

export const MOCK_TABELA_SIGTAP = [
  {
    codigo: '0301010072',
    nome: 'CONSULTA MEDICA EM ATENCAO ESPECIALIZADA',
    valor_ambulatorial: 10.00,
    valor_hospitalar: 0.00,
    valor_profissional: 0.00,
    total_repasse_sus: 10.00
  },
  {
    codigo: '0303010037',
    nome: 'TRATAMENTO DE OUTRAS DOENCAS BACTERIANAS (INTERNACAO CLICA)',
    valor_ambulatorial: 0.00,
    valor_hospitalar: 220.50,
    valor_profissional: 85.00,
    total_repasse_sus: 305.50
  },
  {
    codigo: '0204030153',
    nome: 'RADIOGRAFIA DE TORAX (PA E PERFIL)',
    valor_ambulatorial: 21.33,
    valor_hospitalar: 0.00,
    valor_profissional: 0.00,
    total_repasse_sus: 21.33
  }
];

export class ComparadorCustoFaturamento {
  static buscarProcedimentoSIGTAP(codigoProcedimento) {
    return MOCK_TABELA_SIGTAP.find(p => p.codigo === codigoProcedimento) || {
      codigo: codigoProcedimento,
      nome: 'Procedimento Genérico SUS',
      total_repasse_sus: 50.00
    };
  }

  /**
   * Realiza a análise comparativa entre Custo Apurado Real × Repasse Tabela SUS
   */
  static analisarPacienteEpisodio({
    episodio_id,
    paciente_nome,
    codigo_procedimento_sigtap,
    custoRealApurado
  }) {
    const procedimientoSUS = this.buscarProcedimentoSIGTAP(codigo_procedimento_sigtap);
    const repasseSUS = procedimientoSUS.total_repasse_sus;
    const resultadoFinanceiro = Math.round((repasseSUS - custoRealApurado) * 100) / 100;
    const coberturaPercentual = custoRealApurado > 0
      ? Math.round((repasseSUS / custoRealApurado) * 1000) / 10
      : 0;

    return {
      episodio_id,
      paciente_nome,
      procedimento: {
        codigo: procedimientoSUS.codigo,
        nome: procedimientoSUS.nome
      },
      custoRealApurado: parseFloat(custoRealApurado.toFixed(2)),
      repasseSUS: parseFloat(repasseSUS.toFixed(2)),
      resultadoFinanceiro,
      coberturaPercentual,
      situacao: resultadoFinanceiro >= 0 ? 'SUPERAVIT' : 'DEFICIT_COBERTO_MUNICIPIO'
    };
  }
}
