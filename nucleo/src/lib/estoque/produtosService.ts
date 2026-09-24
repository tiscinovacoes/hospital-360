// ============================================================================
// ProdutosService: Gestão de Medicamentos Padronizados & Fracionamento
// ============================================================================

import { ProdutoFarmacia } from './types';

export const UNIDADES_CONTAVEIS = ['COMPRIMIDO', 'CAPSULA', 'AMPOLA', 'FRASCO', 'ADESIVO', 'SERINGA'];

export class ProdutosService {
  /**
   * Converte uma quantidade informada em uma apresentação comercial para a unidade base
   * Regra de ouro: Garante valor inteiro para itens contáveis.
   */
  static converterParaUnidadeBase(
    quantidadeEmbalagem: number,
    tipoEmbalagem: string,
    produto: ProdutoFarmacia
  ): number {
    if (quantidadeEmbalagem <= 0) {
      throw new Error('A quantidade informada deve ser maior que zero.');
    }

    const embalagemTipoNormalizado = tipoEmbalagem.trim().toUpperCase();
    const unidadeBaseNormalizada = produto.unidade_base.trim().toUpperCase();

    if (embalagemTipoNormalizado === unidadeBaseNormalizada) {
      if (UNIDADES_CONTAVEIS.includes(unidadeBaseNormalizada) && !Number.isInteger(quantidadeEmbalagem)) {
        throw new Error(`A unidade base '${produto.unidade_base}' é contável e não admite frações (${quantidadeEmbalagem}).`);
      }
      return quantidadeEmbalagem;
    }

    const embalagem = produto.embalagens?.find(
      e => e.tipo_embalagem.trim().toUpperCase() === embalagemTipoNormalizado
    );

    if (!embalagem) {
      throw new Error(`Embalagem '${tipoEmbalagem}' não cadastrada para o medicamento '${produto.nome}'.`);
    }

    const fator = embalagem.fator_conversao_base;
    if (fator <= 0) {
      throw new Error(`Fator de conversão inválido (${fator}) para a embalagem '${tipoEmbalagem}'.`);
    }

    const quantidadeBase = quantidadeEmbalagem * fator;

    if (UNIDADES_CONTAVEIS.includes(unidadeBaseNormalizada)) {
      if (!Number.isInteger(quantidadeBase)) {
        throw new Error(
          `A conversão de ${quantidadeEmbalagem} ${tipoEmbalagem} gerou saldo fracionário (${quantidadeBase} ${produto.unidade_base}). Proibido saldo fracionário de embalagem.`
        );
      }
    }

    return quantidadeBase;
  }

  /**
   * Converte da unidade base para uma embalagem desejada, devolvendo unidades inteiras e sobras
   */
  static converterDaUnidadeBase(
    quantidadeBase: number,
    tipoEmbalagemAlvo: string,
    produto: ProdutoFarmacia
  ): { quantidadeEmbalagem: number; sobraBase: number; textoFormatado: string } {
    const embalagemTipoNormalizado = tipoEmbalagemAlvo.trim().toUpperCase();
    const unidadeBaseNormalizada = produto.unidade_base.trim().toUpperCase();

    if (embalagemTipoNormalizado === unidadeBaseNormalizada) {
      return {
        quantidadeEmbalagem: quantidadeBase,
        sobraBase: 0,
        textoFormatado: `${quantidadeBase} ${produto.unidade_base}`
      };
    }

    const embalagem = produto.embalagens?.find(
      e => e.tipo_embalagem.trim().toUpperCase() === embalagemTipoNormalizado
    );

    if (!embalagem || embalagem.fator_conversao_base <= 0) {
      return {
        quantidadeEmbalagem: quantidadeBase,
        sobraBase: 0,
        textoFormatado: `${quantidadeBase} ${produto.unidade_base}`
      };
    }

    const fator = embalagem.fator_conversao_base;
    const embalagensInteiras = Math.floor(quantidadeBase / fator);
    const sobra = quantidadeBase % fator;

    const textoFormatado = sobra > 0
      ? `${embalagensInteiras} ${tipoEmbalagemAlvo} + ${sobra} ${produto.unidade_base}`
      : `${embalagensInteiras} ${tipoEmbalagemAlvo}`;

    return {
      quantidadeEmbalagem: embalagensInteiras,
      sobraBase: sobra,
      textoFormatado
    };
  }
}
