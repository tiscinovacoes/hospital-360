/**
 * Vigia Faturamento / AIVIQ Saúde — Parser Oficial da Tabela SIGTAP (DATASUS)
 * Sprint 11 do Plano de MVP
 * 
 * Lê arquivos compactados da Tabela Unificada do DATASUS ou extrações textuais
 * e converte para registros de procedimentos com valores SH, SA, SP e Total.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class SigtapParser {
  /**
   * Processa uma linha do arquivo tb_procedimento.txt segundo o layout oficial:
   * CO_PROCEDIMENTO: 1 a 10 (10 chars)
   * NO_PROCEDIMENTO: 11 a 260 (250 chars)
   * TP_COMPLEXIDADE: 261 (1 char)
   * VL_SH: 283 a 294 (12 chars - valor em centavos)
   * VL_SA: 295 a 306 (12 chars - valor em centavos)
   * VL_SP: 307 a 318 (12 chars - valor em centavos)
   */
  static parseLinhaProcedimento(linha) {
    if (!linha || linha.length < 318) return null;

    const codigo = linha.substring(0, 10).trim();
    const nome = linha.substring(10, 260).trim();
    const complexidade = linha.substring(260, 261).trim();
    
    const vl_sh = (parseFloat(linha.substring(282, 294).trim()) || 0) / 100;
    const vl_sa = (parseFloat(linha.substring(294, 306).trim()) || 0) / 100;
    const vl_sp = (parseFloat(linha.substring(306, 318).trim()) || 0) / 100;
    const valor_total = vl_sh + vl_sa + vl_sp;

    return {
      codigo,
      nome,
      complexidade,
      valor_servico_hospitalar: vl_sh,
      valor_servico_ambulatorial: vl_sa,
      valor_servico_profissional: vl_sp,
      valor_total_repasse_sus: Math.round(valor_total * 100) / 100
    };
  }

  /**
   * Retorna os principais procedimentos de referência para cálculo de defasagem hospitalar
   */
  static getProcedimentosReferencia() {
    return [
      {
        codigo: '0303140151',
        nome: 'TRATAMENTO DE PNEUMONIAS OU INFLUENZA (GRIPE)',
        valor_repasse_sus: 582.42,
        custo_real_estimado: 992.50
      },
      {
        codigo: '0310010039',
        nome: 'PARTO NORMAL',
        valor_repasse_sus: 443.40,
        custo_real_estimado: 1840.00
      },
      {
        codigo: '0802010091',
        nome: 'DIARIA DE UNIDADE DE TERAPIA INTENSIVA ADULTO (UTI III)',
        valor_repasse_sus: 700.00,
        custo_real_estimado: 2450.00
      },
      {
        codigo: '0301010072',
        nome: 'CONSULTA MEDICA EM ATENCAO ESPECIALIZADA',
        valor_repasse_sus: 45.00,
        custo_real_estimado: 168.00
      }
    ];
  }

  /**
   * Calcula o percentual e valor absoluto de déficit municipal vs SUS
   */
  static calcularDeficit({ custo_real, repasse_sus }) {
    const deficit_nominal = Math.max(0, custo_real - repasse_sus);
    const percentual_cobertura = (repasse_sus / custo_real) * 100;
    const percentual_deficit = ((custo_real - repasse_sus) / custo_real) * 100;

    return {
      custo_real,
      repasse_sus,
      deficit_nominal: Math.round(deficit_nominal * 100) / 100,
      percentual_cobertura: Math.round(percentual_cobertura * 10) / 10,
      percentual_deficit: Math.round(percentual_deficit * 10) / 10,
      fonte: 'SIGTAP DATASUS / AIVIQ Custeio Absorção + ABC'
    };
  }
}
