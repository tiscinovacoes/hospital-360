// ============================================================================
// FefoEngine: Motor FEFO (First Expired, First Out) com Override Justificado
// ============================================================================

import { LoteEstoque } from './types';

export interface SugestaoFefo {
  loteSugerido: LoteEstoque;
  diasAteVencimento: number;
  saldoDisponivel: number;
  valido: boolean;
}

export interface ValidacaoOverrideFefo {
  ehDesvioFefo: boolean;
  loteSugerido: LoteEstoque | null;
  loteEscolhido: LoteEstoque;
  mensagemAlerta?: string;
  exigeJustificativa: boolean;
  justificativaValida: boolean;
  erroJustificativa?: string;
}

export type ClassificacaoValidade = 'VENCIDO' | 'CRITICO_30D' | 'ALERTA_60D' | 'ATENCAO_90D' | 'REGULAR';

export class FefoEngine {
  /**
   * Calcula dias restantes até a data de validade
   */
  static calcularDiasAteVencimento(dataValidade: string, dataReferencia: Date = new Date()): number {
    const validade = new Date(dataValidade);
    // Zera horas para comparação puramente de dias
    validade.setHours(0, 0, 0, 0);
    const ref = new Date(dataReferencia);
    ref.setHours(0, 0, 0, 0);

    const diferencaMs = validade.getTime() - ref.getTime();
    return Math.round(diferencaMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Classifica a validade do lote para realces visuais
   */
  static classificarValidade(dataValidade: string, dataReferencia: Date = new Date()): {
    categoria: ClassificacaoValidade;
    diasRestantes: number;
    badgeColor: string;
    label: string;
  } {
    const dias = this.calcularDiasAteVencimento(dataValidade, dataReferencia);

    if (dias < 0) {
      return {
        categoria: 'VENCIDO',
        diasRestantes: dias,
        badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
        label: `VENCIDO (${Math.abs(dias)} dias atrás)`
      };
    }
    if (dias <= 30) {
      return {
        categoria: 'CRITICO_30D',
        diasRestantes: dias,
        badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
        label: `Crítico: ${dias} dias`
      };
    }
    if (dias <= 60) {
      return {
        categoria: 'ALERTA_60D',
        diasRestantes: dias,
        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        label: `Alerta: ${dias} dias`
      };
    }
    if (dias <= 90) {
      return {
        categoria: 'ATENCAO_90D',
        diasRestantes: dias,
        badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
        label: `Atenção: ${dias} dias`
      };
    }

    return {
      categoria: 'REGULAR',
      diasRestantes: dias,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      label: `${dias} dias`
    };
  }

  /**
   * Obtém a data de validade normalizada do lote
   */
  static extrairDataValidade(lote: LoteEstoque): string {
    return lote.data_validade || (lote as unknown as { dataValidade?: string }).dataValidade || '';
  }

  /**
   * Ordena lotes estritamente por FEFO (validade ascendente)
   */
  static ordenarPorFefo(lotes: LoteEstoque[]): LoteEstoque[] {
    return [...lotes].sort((a, b) => {
      const timeA = new Date(this.extrairDataValidade(a)).getTime();
      const timeB = new Date(this.extrairDataValidade(b)).getTime();
      return timeA - timeB;
    });
  }

  /**
   * Filtra lotes elegíveis para movimentação (ignora vencidos, quarentena e recall)
   * e que respeitam a validade mínima remanescente (ex.: 30 dias para remessa à UBS)
   */
  static filtrarLotesElegiveis(
    lotes: LoteEstoque[],
    diasValidadeMinima = 30,
    dataReferencia: Date = new Date()
  ): LoteEstoque[] {
    return lotes.filter(lote => {
      if (lote.status !== 'LIBERADO') return false;
      const dataVal = this.extrairDataValidade(lote);
      const dias = this.calcularDiasAteVencimento(dataVal, dataReferencia);
      return dias >= diasValidadeMinima;
    });
  }

  /**
   * Sugere o lote padrão pelo critério estrito de FEFO
   */
  static sugerirLoteFefo(
    lotesDisponiveis: LoteEstoque[],
    diasValidadeMinima = 30,
    dataReferencia: Date = new Date()
  ): SugestaoFefo | null {
    const elegiveis = this.filtrarLotesElegiveis(lotesDisponiveis, diasValidadeMinima, dataReferencia);
    const ordenados = this.ordenarPorFefo(elegiveis);

    if (ordenados.length === 0) return null;

    const loteSugerido = ordenados[0];
    const dataVal = this.extrairDataValidade(loteSugerido);
    const dias = this.calcularDiasAteVencimento(dataVal, dataReferencia);

    return {
      loteSugerido,
      diasAteVencimento: dias,
      saldoDisponivel: loteSugerido.saldo_total || 0,
      valido: true
    };
  }

  /**
   * Valida se a escolha do operador respeita o FEFO ou se caracteriza um desvio (override)
   * Se houver desvio, a justificativa mínima de 10 caracteres é obrigatória.
   */
  static validarEscolhaLote(
    loteEscolhidoId: string,
    lotesDisponiveis: LoteEstoque[],
    justificativa = '',
    diasValidadeMinima = 30,
    dataReferencia: Date = new Date()
  ): ValidacaoOverrideFefo {
    const loteEscolhido = lotesDisponiveis.find(l => l.id === loteEscolhidoId);
    if (!loteEscolhido) {
      throw new Error(`Lote escolhido ID '${loteEscolhidoId}' não encontrado.`);
    }

    const sugestao = this.sugerirLoteFefo(lotesDisponiveis, diasValidadeMinima, dataReferencia);
    const loteSugerido = sugestao ? sugestao.loteSugerido : null;

    // Se o lote escolhido for exatamente o primeiro do FEFO
    if (loteSugerido && loteSugerido.id === loteEscolhido.id) {
      return {
        ehDesvioFefo: false,
        loteSugerido,
        loteEscolhido,
        exigeJustificativa: false,
        justificativaValida: true
      };
    }

    // Se o operador escolheu outro lote ou se não há lote sugerido com >= 30 dias
    const diasSugerido = loteSugerido ? this.calcularDiasAteVencimento(this.extrairDataValidade(loteSugerido), dataReferencia) : 0;
    const diasEscolhido = this.calcularDiasAteVencimento(this.extrairDataValidade(loteEscolhido), dataReferencia);

    const ehDesvio = loteSugerido !== null && loteSugerido.id !== loteEscolhido.id;
    const justLimpa = justificativa.trim();
    const justificativaValida = justLimpa.length >= 10;

    let erroJustificativa: string | undefined;
    if (ehDesvio && !justificativaValida) {
      erroJustificativa = `Justificativa obrigatória (mínimo 10 caracteres) para override de FEFO. O lote com validade mais próxima é ${loteSugerido?.numero_lote} (vence em ${diasSugerido} dias), mas foi selecionado o lote ${loteEscolhido.numero_lote} (vence em ${diasEscolhido} dias).`;
    }

    return {
      ehDesvioFefo: ehDesvio,
      loteSugerido,
      loteEscolhido,
      mensagemAlerta: ehDesvio
        ? `ALERTA DE DESVIO FEFO: Existe lote com vencimento mais próximo disponível (${loteSugerido?.numero_lote} - Vcto: ${loteSugerido?.data_validade}). Confirmação exige justificativa técnica registrada para auditoria.`
        : undefined,
      exigeJustificativa: ehDesvio,
      justificativaValida,
      erroJustificativa
    };
  }
}
