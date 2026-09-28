import { NextResponse } from 'next/server';

export interface ParametroExame {
  nome: string;
  unidade: string;
  valorReferenciaMin?: number;
  valorReferenciaMax?: number;
  valorReferenciaTexto?: string;
}

export interface ExameCatalogo {
  codigoLoinc: string;
  codigoInterno: string;
  nome: string;
  categoria: 'HEMATOLOGIA' | 'CARDIOLOGIA' | 'BIOQUIMICA' | 'URINALISE' | 'ENDOCRINOLOGIA';
  custoReagenteBase: number;
  insumosDescartaveisCusto: number;
  tempoBancadaMinutos: number;
  parametros: ParametroExame[];
}

export const CATALOGO_EXAMES_SENAITE: ExameCatalogo[] = [
  {
    codigoLoinc: 'LOINC-1751-7',
    codigoInterno: 'EX-HEMO-01',
    nome: 'Hemograma Completo com Plaquetas',
    categoria: 'HEMATOLOGIA',
    custoReagenteBase: 12.50,
    insumosDescartaveisCusto: 4.00,
    tempoBancadaMinutos: 15,
    parametros: [
      { nome: 'Hemácias', unidade: 'milhões/mm³', valorReferenciaMin: 4.3, valorReferenciaMax: 5.8 },
      { nome: 'Hemoglobina', unidade: 'g/dL', valorReferenciaMin: 13.5, valorReferenciaMax: 17.5 },
      { nome: 'Hematócrito', unidade: '%', valorReferenciaMin: 41, valorReferenciaMax: 53 },
      { nome: 'Leucócitos Totais', unidade: '/mm³', valorReferenciaMin: 4000, valorReferenciaMax: 11000 },
      { nome: 'Plaquetas', unidade: '/mm³', valorReferenciaMin: 150000, valorReferenciaMax: 450000 },
    ],
  },
  {
    codigoLoinc: 'LOINC-6598-7',
    codigoInterno: 'EX-TROP-01',
    nome: 'Troponina I Cardíaca Ultrassensível',
    categoria: 'CARDIOLOGIA',
    custoReagenteBase: 48.00,
    insumosDescartaveisCusto: 6.00,
    tempoBancadaMinutos: 25,
    parametros: [
      { nome: 'Troponina I', unidade: 'ng/mL', valorReferenciaMax: 0.04, valorReferenciaTexto: '< 0.04 ng/mL (Negativo)' },
    ],
  },
  {
    codigoLoinc: 'LOINC-24331-1',
    codigoInterno: 'EX-LIPI-01',
    nome: 'Lipidograma Completo (Colesterol Total, HDL, LDL, VLDL, Triglicérides)',
    categoria: 'BIOQUIMICA',
    custoReagenteBase: 22.00,
    insumosDescartaveisCusto: 5.00,
    tempoBancadaMinutos: 20,
    parametros: [
      { nome: 'Colesterol Total', unidade: 'mg/dL', valorReferenciaMax: 190 },
      { nome: 'HDL Colesterol', unidade: 'mg/dL', valorReferenciaMin: 40 },
      { nome: 'LDL Colesterol', unidade: 'mg/dL', valorReferenciaMax: 130 },
      { nome: 'Triglicérides', unidade: 'mg/dL', valorReferenciaMax: 150 },
    ],
  },
  {
    codigoLoinc: 'LOINC-5804-0',
    codigoInterno: 'EX-EAS-01',
    nome: 'Urina I (EAS - Elementos Anormais e Sedimentoscopia)',
    categoria: 'URINALISE',
    custoReagenteBase: 8.50,
    insumosDescartaveisCusto: 3.50,
    tempoBancadaMinutos: 12,
    parametros: [
      { nome: 'Densidade', unidade: 'g/mL', valorReferenciaMin: 1.015, valorReferenciaMax: 1.025 },
      { nome: 'pH', unidade: 'pH', valorReferenciaMin: 5.0, valorReferenciaMax: 7.0 },
      { nome: 'Proteínas', unidade: 'mg/dL', valorReferenciaTexto: 'Ausente' },
      { nome: 'Glicose', unidade: 'mg/dL', valorReferenciaTexto: 'Ausente' },
      { nome: 'Leucócitos', unidade: '/campo', valorReferenciaMax: 5 },
    ],
  },
  {
    codigoLoinc: 'LOINC-3016-3',
    codigoInterno: 'EX-TSH-01',
    nome: 'TSH — Hormônio Tireoestimulante Ultrassensível',
    categoria: 'ENDOCRINOLOGIA',
    custoReagenteBase: 28.00,
    insumosDescartaveisCusto: 4.50,
    tempoBancadaMinutos: 30,
    parametros: [
      { nome: 'TSH', unidade: 'µUI/mL', valorReferenciaMin: 0.4, valorReferenciaMax: 4.5 },
    ],
  },
  {
    codigoLoinc: 'LOINC-2345-7',
    codigoInterno: 'EX-GLIC-01',
    nome: 'Glicemia em Jejum',
    categoria: 'BIOQUIMICA',
    custoReagenteBase: 6.00,
    insumosDescartaveisCusto: 3.00,
    tempoBancadaMinutos: 10,
    parametros: [
      { nome: 'Glicose em Jejum', unidade: 'mg/dL', valorReferenciaMin: 70, valorReferenciaMax: 99 },
    ],
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: CATALOGO_EXAMES_SENAITE,
    totalExamesDisponiveis: CATALOGO_EXAMES_SENAITE.length,
    meta: {
      timestamp: new Date().toISOString(),
      sistema: 'SENAITE LIMS v2.4',
      squad: 'Squad 3 - Laboratório & Diagnóstico',
    },
  });
}
