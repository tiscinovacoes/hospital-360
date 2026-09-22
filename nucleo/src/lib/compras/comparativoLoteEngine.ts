import crypto from 'crypto';

export interface FornecedorProposta {
  fornecedor_id: string;
  razao_social: string;
  cnpj: string;
  preco_unitario: number;
  preco_total: number;
  is_vencedor: boolean;
  divergencia_bps_pct: number;
  divergencia_cmed_pct: number;
  classificacao_ia: 'EXCELENTE' | 'ADEQUADO' | 'ATENÇÃO' | 'CRÍTICO' | 'IRREGULAR';
  cor_ia: 'verde' | 'amarelo' | 'vermelho';
  trava_ativa: boolean;
  parecer_individual: string;
}

export interface ItemComparativoLote {
  id: string;
  numero_item: number;
  codigo_catmat: string;
  descricao_medicamento: string;
  principio_ativo: string;
  concentracao: string;
  apresentacao: string;
  unidade_fornecimento: string;
  quantidade: number;
  preco_cmed_teto: number;
  preco_bps_mediana: number;
  preco_bps_media: number;
  menor_preco: number;
  fornecedor_lider: string;
  status_ia: 'EXCELENTE' | 'ADEQUADO' | 'ATENÇÃO' | 'CRÍTICO' | 'IRREGULAR';
  cor_ia: 'verde' | 'amarelo' | 'vermelho';
  divergencia_lider_bps_pct: number;
  divergencia_lider_cmed_pct: number;
  economia_projetada_reais: number;
  sobrepreco_evitado_reais: number;
  trava_obrigatoria: boolean;
  parecer_conclusivo: string;
  propostas: FornecedorProposta[];
}

export interface CestaLoteComparativo {
  id: string;
  codigo_cotacao: string;
  titulo: string;
  categoria: string;
  modalidade: string;
  data_abertura: string;
  data_apuracao: string;
  orgao_demandante: string;
  responsavel_auditoria: string;
  itens: ItemComparativoLote[];
  metricas: {
    total_itens: number;
    itens_conformes_bps: number;
    itens_atencao_mercado: number;
    itens_bloqueados_cmed: number;
    taxa_conformidade_pct: number;
    valor_total_lideres_reais: number;
    economia_global_bps_reais: number;
    sobrepreco_evitado_cmed_reais: number;
    travas_ativas_total: number;
    hash_auditoria_sha256: string;
  };
}

// Helper para cálculo do semáforo da IA
export function classificarPrecoIA(
  preco: number,
  tetoCmed: number,
  medianaBps: number
): {
  classificacao: 'EXCELENTE' | 'ADEQUADO' | 'ATENÇÃO' | 'CRÍTICO' | 'IRREGULAR';
  cor: 'verde' | 'amarelo' | 'vermelho';
  trava: boolean;
  parecer: string;
} {
  const pctCmed = (preco / tetoCmed) * 100;
  const pctBps = ((preco - medianaBps) / medianaBps) * 100;

  if (preco > tetoCmed) {
    return {
      classificacao: 'IRREGULAR',
      cor: 'vermelho',
      trava: true,
      parecer: `Preço R$ ${preco.toFixed(2)} excede o teto regulatório CMED (R$ ${tetoCmed.toFixed(2)}) em +${(pctCmed - 100).toFixed(1)}%. Trava legal obrigatória acionada (Lei 10.742/03 e Lei 14.133/21).`
    };
  }

  if (pctCmed > 95) {
    return {
      classificacao: 'CRÍTICO',
      cor: 'vermelho',
      trava: true,
      parecer: `Preço no limiar crítico da CMED (${pctCmed.toFixed(1)}% do teto). Exige justificativa fundamentada de sobrepreço antes de adjudicação.`
    };
  }

  if (pctCmed >= 80 || pctBps > 15) {
    return {
      classificacao: 'ATENÇÃO',
      cor: 'amarelo',
      trava: false,
      parecer: `Preço R$ ${preco.toFixed(2)} situa-se ${pctBps.toFixed(1)}% acima da mediana do BPS (R$ ${medianaBps.toFixed(2)}). Recomendada negociação para alinhamento ao SUS.`
    };
  }

  if (preco <= medianaBps) {
    return {
      classificacao: 'EXCELENTE',
      cor: 'verde',
      trava: false,
      parecer: `Preço excelente: R$ ${preco.toFixed(2)} está ${(Math.abs(pctBps)).toFixed(1)}% abaixo da mediana do BPS e com margem segura frente à CMED.`
    };
  }

  return {
    classificacao: 'ADEQUADO',
    cor: 'verde',
    trava: false,
    parecer: `Preço compatível com a prática mercadológica recente do SUS e plenamente em conformidade legal.`
  };
}

// 1. Cesta 1: UTI & Anestésicos (24 Itens)
const ITENS_UTI_ANESTESICOS: ItemComparativoLote[] = [
  {
    id: 'lote-uti-001',
    numero_item: 1,
    codigo_catmat: 'BR0284729',
    descricao_medicamento: 'Meropenem 1g Pó Liofilizado Injetável',
    principio_ativo: 'Meropenem Tri-hidratado',
    concentracao: '1g',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco-Ampola',
    quantidade: 15000,
    preco_cmed_teto: 68.20,
    preco_bps_mediana: 52.10,
    preco_bps_media: 53.40,
    menor_preco: 46.80,
    fornecedor_lider: 'Distribuidora Farmacêutica Nacional S/A',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -10.17,
    divergencia_lider_cmed_pct: -31.38,
    economia_projetada_reais: 79500.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Item com excelente concorrência. Proposta líder R$ 46,80 gera economia real de R$ 79.500,00 sobre a mediana BPS.',
    propostas: [
      {
        fornecedor_id: 'forn-01',
        razao_social: 'Distribuidora Farmacêutica Nacional S/A',
        cnpj: '12.345.678/0001-90',
        preco_unitario: 46.80,
        preco_total: 702000.00,
        is_vencedor: true,
        divergencia_bps_pct: -10.17,
        divergencia_cmed_pct: -31.38,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Menor preço apurado com conformidade ANVISA confirmada.'
      },
      {
        fornecedor_id: 'forn-02',
        razao_social: 'BioGenética Hospitalar Comércio Ltda',
        cnpj: '98.765.432/0001-11',
        preco_unitario: 49.50,
        preco_total: 742500.00,
        is_vencedor: false,
        divergencia_bps_pct: -4.99,
        divergencia_cmed_pct: -27.42,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Preço competitivo abaixo da mediana BPS.'
      },
      {
        fornecedor_id: 'forn-03',
        razao_social: 'Eurofarma Laboratórios S.A.',
        cnpj: '61.190.096/0001-92',
        preco_unitario: 53.00,
        preco_total: 795000.00,
        is_vencedor: false,
        divergencia_bps_pct: 1.73,
        divergencia_cmed_pct: -22.29,
        classificacao_ia: 'ADEQUADO',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Preço alinhado à média do setor.'
      }
    ]
  },
  {
    id: 'lote-uti-002',
    numero_item: 2,
    codigo_catmat: 'BR0194851',
    descricao_medicamento: 'Noradrenalina 2mg/mL Ampola 4mL',
    principio_ativo: 'Hemitartarato de Norepinefrina',
    concentracao: '2mg/mL',
    apresentacao: 'Ampola 4mL',
    unidade_fornecimento: 'Ampola',
    quantidade: 35000,
    preco_cmed_teto: 18.50,
    preco_bps_mediana: 14.20,
    preco_bps_media: 14.55,
    menor_preco: 12.30,
    fornecedor_lider: 'Cristália Produtos Químicos Farmacêuticos Ltda',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -13.38,
    divergencia_lider_cmed_pct: -33.51,
    economia_projetada_reais: 66500.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Líder com R$ 12,30 assegura 13,4% de desconto sobre o referencial BPS para volume de 35.000 ampolas.',
    propostas: [
      {
        fornecedor_id: 'forn-04',
        razao_social: 'Cristália Produtos Químicos Farmacêuticos Ltda',
        cnpj: '44.734.671/0001-51',
        preco_unitario: 12.30,
        preco_total: 430500.00,
        is_vencedor: true,
        divergencia_bps_pct: -13.38,
        divergencia_cmed_pct: -33.51,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Vencedor direto com excelente custo unitário.'
      },
      {
        fornecedor_id: 'forn-01',
        razao_social: 'Distribuidora Farmacêutica Nacional S/A',
        cnpj: '12.345.678/0001-90',
        preco_unitario: 13.90,
        preco_total: 486500.00,
        is_vencedor: false,
        divergencia_bps_pct: -2.11,
        divergencia_cmed_pct: -24.86,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Preço dentro da conformidade.'
      }
    ]
  },
  {
    id: 'lote-uti-003',
    numero_item: 3,
    codigo_catmat: 'BR0311209',
    descricao_medicamento: 'Citrato de Fentanila 0,05mg/mL Injetável 10mL',
    principio_ativo: 'Citrato de Fentanila (Portaria 344/98)',
    concentracao: '0,05mg/mL',
    apresentacao: 'Ampola 10mL',
    unidade_fornecimento: 'Ampola',
    quantidade: 12000,
    preco_cmed_teto: 22.40,
    preco_bps_mediana: 17.50,
    preco_bps_media: 17.80,
    menor_preco: 15.90,
    fornecedor_lider: 'União Química Farmacêutica Nacional S/A',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -9.14,
    divergencia_lider_cmed_pct: -29.02,
    economia_projetada_reais: 19200.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Item sujeito a controle especial. Concorrente líder R$ 15,90 com documentação da Portaria 344 regularizada.',
    propostas: [
      {
        fornecedor_id: 'forn-05',
        razao_social: 'União Química Farmacêutica Nacional S/A',
        cnpj: '60.665.981/0001-18',
        preco_unitario: 15.90,
        preco_total: 190800.00,
        is_vencedor: true,
        divergencia_bps_pct: -9.14,
        divergencia_cmed_pct: -29.02,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Proposta mais vantajosa homologada.'
      },
      {
        fornecedor_id: 'forn-04',
        razao_social: 'Cristália Produtos Químicos Farmacêuticos Ltda',
        cnpj: '44.734.671/0001-51',
        preco_unitario: 16.80,
        preco_total: 201600.00,
        is_vencedor: false,
        divergencia_bps_pct: -4.00,
        divergencia_cmed_pct: -25.00,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Preço competitivo.'
      }
    ]
  },
  {
    id: 'lote-uti-004',
    numero_item: 4,
    codigo_catmat: 'BR0331902',
    descricao_medicamento: 'Midazolam 5mg/mL Solução Injetável 3mL',
    principio_ativo: 'Cloridrato de Midazolam',
    concentracao: '5mg/mL',
    apresentacao: 'Ampola 3mL',
    unidade_fornecimento: 'Ampola',
    quantidade: 20000,
    preco_cmed_teto: 9.80,
    preco_bps_mediana: 6.40,
    preco_bps_media: 6.65,
    menor_preco: 5.75,
    fornecedor_lider: 'Eurofarma Laboratórios S.A.',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -10.16,
    divergencia_lider_cmed_pct: -41.33,
    economia_projetada_reais: 13000.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Excelente índice de vantajosidade com 41,3% de deságio sobre o teto da CMED.',
    propostas: [
      {
        fornecedor_id: 'forn-03',
        razao_social: 'Eurofarma Laboratórios S.A.',
        cnpj: '61.190.096/0001-92',
        preco_unitario: 5.75,
        preco_total: 115000.00,
        is_vencedor: true,
        divergencia_bps_pct: -10.16,
        divergencia_cmed_pct: -41.33,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Menor preço unitário registrado no certame.'
      }
    ]
  },
  {
    id: 'lote-uti-005',
    numero_item: 5,
    codigo_catmat: 'BR0298412',
    descricao_medicamento: 'Propofol 10mg/mL Emulsão Injetável 20mL',
    principio_ativo: 'Propofol',
    concentracao: '10mg/mL',
    apresentacao: 'Ampola 20mL',
    unidade_fornecimento: 'Ampola',
    quantidade: 18000,
    preco_cmed_teto: 28.50,
    preco_bps_mediana: 21.20,
    preco_bps_media: 21.80,
    menor_preco: 25.80,
    fornecedor_lider: 'Fresenius Kabi Brasil Ltda',
    status_ia: 'ATENÇÃO',
    cor_ia: 'amarelo',
    divergencia_lider_bps_pct: 21.70,
    divergencia_lider_cmed_pct: -9.47,
    economia_projetada_reais: 0,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Alerta de Mercado: O menor preço ofertado (R$ 25,80) está +21,7% acima da mediana BPS (R$ 21,20). Recomendada rodada de negociação.',
    propostas: [
      {
        fornecedor_id: 'forn-06',
        razao_social: 'Fresenius Kabi Brasil Ltda',
        cnpj: '49.324.221/0001-04',
        preco_unitario: 25.80,
        preco_total: 464400.00,
        is_vencedor: true,
        divergencia_bps_pct: 21.70,
        divergencia_cmed_pct: -9.47,
        classificacao_ia: 'ATENÇÃO',
        cor_ia: 'amarelo',
        trava_ativa: false,
        parecer_individual: 'Preço acima da mediana BPS, embora dentro do limite CMED.'
      },
      {
        fornecedor_id: 'forn-01',
        razao_social: 'Distribuidora Farmacêutica Nacional S/A',
        cnpj: '12.345.678/0001-90',
        preco_unitario: 27.20,
        preco_total: 489600.00,
        is_vencedor: false,
        divergencia_bps_pct: 28.30,
        divergencia_cmed_pct: -4.56,
        classificacao_ia: 'ATENÇÃO',
        cor_ia: 'amarelo',
        trava_ativa: false,
        parecer_individual: 'Preço no limite de tolerância.'
      }
    ]
  },
  {
    id: 'lote-uti-006',
    numero_item: 6,
    codigo_catmat: 'BR0345091',
    descricao_medicamento: 'Cloridrato de Dexmedetomidina 100mcg/mL 2mL',
    principio_ativo: 'Cloridrato de Dexmedetomidina',
    concentracao: '100mcg/mL',
    apresentacao: 'Frasco-Ampola 2mL',
    unidade_fornecimento: 'Frasco-Ampola',
    quantidade: 8000,
    preco_cmed_teto: 62.00,
    preco_bps_mediana: 48.50,
    preco_bps_media: 49.20,
    menor_preco: 69.50,
    fornecedor_lider: 'Medicor Hospitalar Distribuição Ltda',
    status_ia: 'IRREGULAR',
    cor_ia: 'vermelho',
    divergencia_lider_bps_pct: 43.30,
    divergencia_lider_cmed_pct: 12.10,
    economia_projetada_reais: 0,
    sobrepreco_evitado_reais: 60000.00,
    trava_obrigatoria: true,
    parecer_conclusivo: 'BLOQUEIO AUTOMÁTICO: Preço de R$ 69,50 viola o teto da CMED (R$ 62,00) em +12,1%. Trava do Art. 23 da Lei 10.742/03 acionada.',
    propostas: [
      {
        fornecedor_id: 'forn-07',
        razao_social: 'Medicor Hospitalar Distribuição Ltda',
        cnpj: '03.882.194/0001-33',
        preco_unitario: 69.50,
        preco_total: 556000.00,
        is_vencedor: true,
        divergencia_bps_pct: 43.30,
        divergencia_cmed_pct: 12.10,
        classificacao_ia: 'IRREGULAR',
        cor_ia: 'vermelho',
        trava_ativa: true,
        parecer_individual: 'PROPOSTA DESCLASSIFICADA: Sobrepreço ilegal detectado.'
      }
    ]
  },
  {
    id: 'lote-uti-007',
    numero_item: 7,
    codigo_catmat: 'BR0319800',
    descricao_medicamento: 'Sulfato de Morfina 10mg/mL Injetável 1mL',
    principio_ativo: 'Sulfato de Morfina',
    concentracao: '10mg/mL',
    apresentacao: 'Ampola 1mL',
    unidade_fornecimento: 'Ampola',
    quantidade: 25000,
    preco_cmed_teto: 5.90,
    preco_bps_mediana: 4.10,
    preco_bps_media: 4.25,
    menor_preco: 3.65,
    fornecedor_lider: 'Cristália Produtos Químicos Farmacêuticos Ltda',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -10.98,
    divergencia_lider_cmed_pct: -38.14,
    economia_projetada_reais: 11250.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Conformidade plena com economia de R$ 11.250,00 sobre a mediana BPS.',
    propostas: [
      {
        fornecedor_id: 'forn-04',
        razao_social: 'Cristália Produtos Químicos Farmacêuticos Ltda',
        cnpj: '44.734.671/0001-51',
        preco_unitario: 3.65,
        preco_total: 91250.00,
        is_vencedor: true,
        divergencia_bps_pct: -10.98,
        divergencia_cmed_pct: -38.14,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Proposta vencedora.'
      }
    ]
  },
  {
    id: 'lote-uti-008',
    numero_item: 8,
    codigo_catmat: 'BR0274198',
    descricao_medicamento: 'Brometo de Rocurônio 10mg/mL Injetável 5mL',
    principio_ativo: 'Brometo de Rocurônio',
    concentracao: '10mg/mL',
    apresentacao: 'Frasco-Ampola 5mL',
    unidade_fornecimento: 'Frasco-Ampola',
    quantidade: 14000,
    preco_cmed_teto: 42.80,
    preco_bps_mediana: 33.50,
    preco_bps_media: 34.10,
    menor_preco: 29.90,
    fornecedor_lider: 'União Química Farmacêutica Nacional S/A',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -10.75,
    divergencia_lider_cmed_pct: -30.14,
    economia_projetada_reais: 50400.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Proposta vantajosa com economia de R$ 50.400,00 no lote total.',
    propostas: [
      {
        fornecedor_id: 'forn-05',
        razao_social: 'União Química Farmacêutica Nacional S/A',
        cnpj: '60.665.981/0001-18',
        preco_unitario: 29.90,
        preco_total: 418600.00,
        is_vencedor: true,
        divergencia_bps_pct: -10.75,
        divergencia_cmed_pct: -30.14,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Excelente proposta de fábrica.'
      }
    ]
  },
  {
    id: 'lote-uti-009',
    numero_item: 9,
    codigo_catmat: 'BR0328901',
    descricao_medicamento: 'Besilato de Atracúrio 10mg/mL Injetável 2,5mL',
    principio_ativo: 'Besilato de Atracúrio',
    concentracao: '10mg/mL',
    apresentacao: 'Ampola 2,5mL',
    unidade_fornecimento: 'Ampola',
    quantidade: 10000,
    preco_cmed_teto: 24.50,
    preco_bps_mediana: 18.90,
    preco_bps_media: 19.30,
    menor_preco: 17.20,
    fornecedor_lider: 'BioGenética Hospitalar Comércio Ltda',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -8.99,
    divergencia_lider_cmed_pct: -29.80,
    economia_projetada_reais: 17000.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Regular e homologado.',
    propostas: [
      {
        fornecedor_id: 'forn-02',
        razao_social: 'BioGenética Hospitalar Comércio Ltda',
        cnpj: '98.765.432/0001-11',
        preco_unitario: 17.20,
        preco_total: 172000.00,
        is_vencedor: true,
        divergencia_bps_pct: -8.99,
        divergencia_cmed_pct: -29.80,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Menor preço apurado.'
      }
    ]
  },
  {
    id: 'lote-uti-010',
    numero_item: 10,
    codigo_catmat: 'BR0291004',
    descricao_medicamento: 'Cloridrato de Vancomicina 500mg Pó Liofilizado',
    principio_ativo: 'Cloridrato de Vancomicina',
    concentracao: '500mg',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco-Ampola',
    quantidade: 22000,
    preco_cmed_teto: 31.00,
    preco_bps_mediana: 22.80,
    preco_bps_media: 23.40,
    menor_preco: 19.80,
    fornecedor_lider: 'Distribuidora Farmacêutica Nacional S/A',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -13.16,
    divergencia_lider_cmed_pct: -36.13,
    economia_projetada_reais: 66000.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Economia substancial de R$ 66.000,00 frente ao BPS.',
    propostas: [
      {
        fornecedor_id: 'forn-01',
        razao_social: 'Distribuidora Farmacêutica Nacional S/A',
        cnpj: '12.345.678/0001-90',
        preco_unitario: 19.80,
        preco_total: 435600.00,
        is_vencedor: true,
        divergencia_bps_pct: -13.16,
        divergencia_cmed_pct: -36.13,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Homologação recomendada.'
      }
    ]
  },
  {
    id: 'lote-uti-011',
    numero_item: 11,
    codigo_catmat: 'BR0315544',
    descricao_medicamento: 'Polimixina B 500.000 UI Pó Liofilizado Injetável',
    principio_ativo: 'Sulfato de Polimixina B',
    concentracao: '500.000 UI',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco-Ampola',
    quantidade: 6000,
    preco_cmed_teto: 94.00,
    preco_bps_mediana: 72.00,
    preco_bps_media: 74.50,
    menor_preco: 64.90,
    fornecedor_lider: 'Eurofarma Laboratórios S.A.',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -9.86,
    divergencia_lider_cmed_pct: -30.96,
    economia_projetada_reais: 42600.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Antimicrobiano de reserva com excelente proposta comercial.',
    propostas: [
      {
        fornecedor_id: 'forn-03',
        razao_social: 'Eurofarma Laboratórios S.A.',
        cnpj: '61.190.096/0001-92',
        preco_unitario: 64.90,
        preco_total: 389400.00,
        is_vencedor: true,
        divergencia_bps_pct: -9.86,
        divergencia_cmed_pct: -30.96,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Melhor proposta técnica.'
      }
    ]
  },
  {
    id: 'lote-uti-012',
    numero_item: 12,
    codigo_catmat: 'BR0289110',
    descricao_medicamento: 'Piperacilina + Tazobactam 4g + 0,5g Injetável',
    principio_ativo: 'Piperacilina Sódica + Tazobactam Sódico',
    concentracao: '4g + 0,5g',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco-Ampola',
    quantidade: 16000,
    preco_cmed_teto: 56.00,
    preco_bps_mediana: 41.50,
    preco_bps_media: 42.80,
    menor_preco: 38.20,
    fornecedor_lider: 'Distribuidora Farmacêutica Nacional S/A',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -7.95,
    divergencia_lider_cmed_pct: -31.79,
    economia_projetada_reais: 52800.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Deságio sustentável em relação ao teto ANVISA e BPS.',
    propostas: [
      {
        fornecedor_id: 'forn-01',
        razao_social: 'Distribuidora Farmacêutica Nacional S/A',
        cnpj: '12.345.678/0001-90',
        preco_unitario: 38.20,
        preco_total: 611200.00,
        is_vencedor: true,
        divergencia_bps_pct: -7.95,
        divergencia_cmed_pct: -31.79,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Homologado.'
      }
    ]
  },
  {
    id: 'lote-uti-013',
    numero_item: 13,
    codigo_catmat: 'BR0301290',
    descricao_medicamento: 'Ceftriaxona Sódica 1g Pó Injetável IV',
    principio_ativo: 'Ceftriaxona Sódica',
    concentracao: '1g',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco-Ampola',
    quantidade: 30000,
    preco_cmed_teto: 27.50,
    preco_bps_mediana: 19.80,
    preco_bps_media: 20.30,
    menor_preco: 17.50,
    fornecedor_lider: 'Eurofarma Laboratórios S.A.',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -11.62,
    divergencia_lider_cmed_pct: -36.36,
    economia_projetada_reais: 69000.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Excelente margem com economia projetada de R$ 69.000,00.',
    propostas: [
      {
        fornecedor_id: 'forn-03',
        razao_social: 'Eurofarma Laboratórios S.A.',
        cnpj: '61.190.096/0001-92',
        preco_unitario: 17.50,
        preco_total: 525000.00,
        is_vencedor: true,
        divergencia_bps_pct: -11.62,
        divergencia_cmed_pct: -36.36,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Proposta vencedora.'
      }
    ]
  },
  {
    id: 'lote-uti-014',
    numero_item: 14,
    codigo_catmat: 'BR0355102',
    descricao_medicamento: 'Enoxaparina Sódica 40mg/0,4mL Seringa Preenchida',
    principio_ativo: 'Enoxaparina Sódica',
    concentracao: '40mg/0,4mL',
    apresentacao: 'Seringa Preenchida',
    unidade_fornecimento: 'Seringa',
    quantidade: 40000,
    preco_cmed_teto: 34.00,
    preco_bps_mediana: 25.80,
    preco_bps_media: 26.20,
    menor_preco: 22.90,
    fornecedor_lider: 'BioGenética Hospitalar Comércio Ltda',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -11.24,
    divergencia_lider_cmed_pct: -32.65,
    economia_projetada_reais: 116000.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Volume expressivo gerando economia de R$ 116.000,00 na aquisição.',
    propostas: [
      {
        fornecedor_id: 'forn-02',
        razao_social: 'BioGenética Hospitalar Comércio Ltda',
        cnpj: '98.765.432/0001-11',
        preco_unitario: 22.90,
        preco_total: 916000.00,
        is_vencedor: true,
        divergencia_bps_pct: -11.24,
        divergencia_cmed_pct: -32.65,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Vencedor do item.'
      }
    ]
  },
  {
    id: 'lote-uti-015',
    numero_item: 15,
    codigo_catmat: 'BR0261984',
    descricao_medicamento: 'Heparina Sódica 5.000 UI/0,25mL Subcutânea',
    principio_ativo: 'Heparina Sódica Bovina/Suína',
    concentracao: '5.000 UI/0,25mL',
    apresentacao: 'Ampola 0,25mL',
    unidade_fornecimento: 'Ampola',
    quantidade: 15000,
    preco_cmed_teto: 16.20,
    preco_bps_mediana: 11.80,
    preco_bps_media: 12.10,
    menor_preco: 10.50,
    fornecedor_lider: 'Cristália Produtos Químicos Farmacêuticos Ltda',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -11.02,
    divergencia_lider_cmed_pct: -35.19,
    economia_projetada_reais: 19500.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Conforme parâmetros BPS e ANVISA.',
    propostas: [
      {
        fornecedor_id: 'forn-04',
        razao_social: 'Cristália Produtos Químicos Farmacêuticos Ltda',
        cnpj: '44.734.671/0001-51',
        preco_unitario: 10.50,
        preco_total: 157500.00,
        is_vencedor: true,
        divergencia_bps_pct: -11.02,
        divergencia_cmed_pct: -35.19,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Preço vantajoso.'
      }
    ]
  },
  {
    id: 'lote-uti-016',
    numero_item: 16,
    codigo_catmat: 'BR0312480',
    descricao_medicamento: 'Micafungina Sódica 100mg Pó Liofilizado',
    principio_ativo: 'Micafungina Sódica',
    concentracao: '100mg',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco-Ampola',
    quantidade: 1500,
    preco_cmed_teto: 450.00,
    preco_bps_mediana: 375.00,
    preco_bps_media: 382.00,
    menor_preco: 468.00,
    fornecedor_lider: 'Medicor Hospitalar Distribuição Ltda',
    status_ia: 'IRREGULAR',
    cor_ia: 'vermelho',
    divergencia_lider_bps_pct: 24.80,
    divergencia_lider_cmed_pct: 4.00,
    economia_projetada_reais: 0,
    sobrepreco_evitado_reais: 27000.00,
    trava_obrigatoria: true,
    parecer_conclusivo: 'BLOQUEIO AUTOMÁTICO: Preço de R$ 468,00 ultrapassa teto CMED (R$ 450,00). Retenção para proteção ao erário público.',
    propostas: [
      {
        fornecedor_id: 'forn-07',
        razao_social: 'Medicor Hospitalar Distribuição Ltda',
        cnpj: '03.882.194/0001-33',
        preco_unitario: 468.00,
        preco_total: 702000.00,
        is_vencedor: true,
        divergencia_bps_pct: 24.80,
        divergencia_cmed_pct: 4.00,
        classificacao_ia: 'IRREGULAR',
        cor_ia: 'vermelho',
        trava_ativa: true,
        parecer_individual: 'Desclassificado por violação de teto CMED.'
      }
    ]
  },
  {
    id: 'lote-uti-017',
    numero_item: 17,
    codigo_catmat: 'BR0321908',
    descricao_medicamento: 'Fluconazol 2mg/mL Solução para Infusão 100mL',
    principio_ativo: 'Fluconazol',
    concentracao: '2mg/mL',
    apresentacao: 'Bolsa/Frasco 100mL',
    unidade_fornecimento: 'Frasco',
    quantidade: 12000,
    preco_cmed_teto: 18.00,
    preco_bps_mediana: 11.20,
    preco_bps_media: 11.80,
    menor_preco: 9.80,
    fornecedor_lider: 'Eurofarma Laboratórios S.A.',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -12.50,
    divergencia_lider_cmed_pct: -45.56,
    economia_projetada_reais: 16800.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Conforme e apto a homologação.',
    propostas: [
      {
        fornecedor_id: 'forn-03',
        razao_social: 'Eurofarma Laboratórios S.A.',
        cnpj: '61.190.096/0001-92',
        preco_unitario: 9.80,
        preco_total: 117600.00,
        is_vencedor: true,
        divergencia_bps_pct: -12.50,
        divergencia_cmed_pct: -45.56,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Menor lance apurado.'
      }
    ]
  },
  {
    id: 'lote-uti-018',
    numero_item: 18,
    codigo_catmat: 'BR0334812',
    descricao_medicamento: 'Ciprofloxacino 2mg/mL Solução para Infusão 100mL',
    principio_ativo: 'Cloridrato de Ciprofloxacino',
    concentracao: '2mg/mL',
    apresentacao: 'Frasco 100mL',
    unidade_fornecimento: 'Frasco',
    quantidade: 14000,
    preco_cmed_teto: 14.50,
    preco_bps_mediana: 8.90,
    preco_bps_media: 9.30,
    menor_preco: 8.10,
    fornecedor_lider: 'Distribuidora Farmacêutica Nacional S/A',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -8.99,
    divergencia_lider_cmed_pct: -44.14,
    economia_projetada_reais: 11200.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Preço ótimo com ampla margem de segurança.',
    propostas: [
      {
        fornecedor_id: 'forn-01',
        razao_social: 'Distribuidora Farmacêutica Nacional S/A',
        cnpj: '12.345.678/0001-90',
        preco_unitario: 8.10,
        preco_total: 113400.00,
        is_vencedor: true,
        divergencia_bps_pct: -8.99,
        divergencia_cmed_pct: -44.14,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Conforme.'
      }
    ]
  },
  {
    id: 'lote-uti-019',
    numero_item: 19,
    codigo_catmat: 'BR0283401',
    descricao_medicamento: 'Furosemida 10mg/mL Injetável 2mL',
    principio_ativo: 'Furosemida',
    concentracao: '10mg/mL',
    apresentacao: 'Ampola 2mL',
    unidade_fornecimento: 'Ampola',
    quantidade: 50000,
    preco_cmed_teto: 2.80,
    preco_bps_mediana: 1.45,
    preco_bps_media: 1.55,
    menor_preco: 1.28,
    fornecedor_lider: 'União Química Farmacêutica Nacional S/A',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -11.72,
    divergencia_lider_cmed_pct: -54.29,
    economia_projetada_reais: 8500.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Item de alto giro com menor preço homologado.',
    propostas: [
      {
        fornecedor_id: 'forn-05',
        razao_social: 'União Química Farmacêutica Nacional S/A',
        cnpj: '60.665.981/0001-18',
        preco_unitario: 1.28,
        preco_total: 64000.00,
        is_vencedor: true,
        divergencia_bps_pct: -11.72,
        divergencia_cmed_pct: -54.29,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Vencedor.'
      }
    ]
  },
  {
    id: 'lote-uti-020',
    numero_item: 20,
    codigo_catmat: 'BR0299812',
    descricao_medicamento: 'Succinato Sódico de Hidrocortisona 500mg Pó',
    principio_ativo: 'Succinato Sódico de Hidrocortisona',
    concentracao: '500mg',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco-Ampola',
    quantidade: 18000,
    preco_cmed_teto: 19.50,
    preco_bps_mediana: 12.90,
    preco_bps_media: 13.40,
    menor_preco: 11.50,
    fornecedor_lider: 'Eurofarma Laboratórios S.A.',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -10.85,
    divergencia_lider_cmed_pct: -41.03,
    economia_projetada_reais: 25200.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Regular e vantajoso.',
    propostas: [
      {
        fornecedor_id: 'forn-03',
        razao_social: 'Eurofarma Laboratórios S.A.',
        cnpj: '61.190.096/0001-92',
        preco_unitario: 11.50,
        preco_total: 207000.00,
        is_vencedor: true,
        divergencia_bps_pct: -10.85,
        divergencia_cmed_pct: -41.03,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Proposta aceita.'
      }
    ]
  },
  {
    id: 'lote-uti-021',
    numero_item: 21,
    codigo_catmat: 'BR0307121',
    descricao_medicamento: 'Succinato de Metilprednisolona 500mg Pó Injetável',
    principio_ativo: 'Succinato Sódico de Metilprednisolona',
    concentracao: '500mg',
    apresentacao: 'Frasco-Ampola',
    unidade_fornecimento: 'Frasco-Ampola',
    quantidade: 8000,
    preco_cmed_teto: 64.00,
    preco_bps_mediana: 48.00,
    preco_bps_media: 49.50,
    menor_preco: 54.80,
    fornecedor_lider: 'BioGenética Hospitalar Comércio Ltda',
    status_ia: 'ATENÇÃO',
    cor_ia: 'amarelo',
    divergencia_lider_bps_pct: 14.17,
    divergencia_lider_cmed_pct: -14.38,
    economia_projetada_reais: 0,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Preço em patamar de atenção (+14,2% sobre mediana BPS). Dentro da margem CMED.',
    propostas: [
      {
        fornecedor_id: 'forn-02',
        razao_social: 'BioGenética Hospitalar Comércio Ltda',
        cnpj: '98.765.432/0001-11',
        preco_unitario: 54.80,
        preco_total: 438400.00,
        is_vencedor: true,
        divergencia_bps_pct: 14.17,
        divergencia_cmed_pct: -14.38,
        classificacao_ia: 'ATENÇÃO',
        cor_ia: 'amarelo',
        trava_ativa: false,
        parecer_individual: 'Necessária negociação prévia.'
      }
    ]
  },
  {
    id: 'lote-uti-022',
    numero_item: 22,
    codigo_catmat: 'BR0271109',
    descricao_medicamento: 'Bicarbonato de Sódio 8,4% Solução 250mL Frasco',
    principio_ativo: 'Bicarbonato de Sódio',
    concentracao: '8,4%',
    apresentacao: 'Frasco 250mL',
    unidade_fornecimento: 'Frasco',
    quantidade: 10000,
    preco_cmed_teto: 15.00,
    preco_bps_mediana: 9.80,
    preco_bps_media: 10.20,
    menor_preco: 8.90,
    fornecedor_lider: 'Fresenius Kabi Brasil Ltda',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -9.18,
    divergencia_lider_cmed_pct: -40.67,
    economia_projetada_reais: 9000.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Conforme regulamentação.',
    propostas: [
      {
        fornecedor_id: 'forn-06',
        razao_social: 'Fresenius Kabi Brasil Ltda',
        cnpj: '49.324.221/0001-04',
        preco_unitario: 8.90,
        preco_total: 89000.00,
        is_vencedor: true,
        divergencia_bps_pct: -9.18,
        divergencia_cmed_pct: -40.67,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Homologado.'
      }
    ]
  },
  {
    id: 'lote-uti-023',
    numero_item: 23,
    codigo_catmat: 'BR0287402',
    descricao_medicamento: 'Cloreto de Potássio 19,1% Injetável Ampola 10mL',
    principio_ativo: 'Cloreto de Potássio',
    concentracao: '19,1%',
    apresentacao: 'Ampola 10mL',
    unidade_fornecimento: 'Ampola',
    quantidade: 30000,
    preco_cmed_teto: 3.20,
    preco_bps_mediana: 1.65,
    preco_bps_media: 1.75,
    menor_preco: 1.42,
    fornecedor_lider: 'Cristália Produtos Químicos Farmacêuticos Ltda',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -13.94,
    divergencia_lider_cmed_pct: -55.63,
    economia_projetada_reais: 6900.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Economia garantida em eletrólito de alta reposição.',
    propostas: [
      {
        fornecedor_id: 'forn-04',
        razao_social: 'Cristália Produtos Químicos Farmacêuticos Ltda',
        cnpj: '44.734.671/0001-51',
        preco_unitario: 1.42,
        preco_total: 42600.00,
        is_vencedor: true,
        divergencia_bps_pct: -13.94,
        divergencia_cmed_pct: -55.63,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Melhor lance.'
      }
    ]
  },
  {
    id: 'lote-uti-024',
    numero_item: 24,
    codigo_catmat: 'BR0339184',
    descricao_medicamento: 'Sulfato de Amicacina 250mg/mL Injetável 2mL',
    principio_ativo: 'Sulfato de Amicacina',
    concentracao: '250mg/mL',
    apresentacao: 'Ampola 2mL',
    unidade_fornecimento: 'Ampola',
    quantidade: 15000,
    preco_cmed_teto: 9.90,
    preco_bps_mediana: 6.20,
    preco_bps_media: 6.50,
    menor_preco: 5.40,
    fornecedor_lider: 'Eurofarma Laboratórios S.A.',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -12.90,
    divergencia_lider_cmed_pct: -45.45,
    economia_projetada_reais: 12000.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Proposta plenamente aprovada pela auditoria.',
    propostas: [
      {
        fornecedor_id: 'forn-03',
        razao_social: 'Eurofarma Laboratórios S.A.',
        cnpj: '61.190.096/0001-92',
        preco_unitario: 5.40,
        preco_total: 81000.00,
        is_vencedor: true,
        divergencia_bps_pct: -12.90,
        divergencia_cmed_pct: -45.45,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Homologado com aprovação de contas.'
      }
    ]
  }
];

// Cálculo de métricas da Cesta
export function consolidarMetricasCesta(itens: ItemComparativoLote[]): CestaLoteComparativo['metricas'] {
  const total = itens.length;
  const conformes = itens.filter(i => i.status_ia === 'EXCELENTE' || i.status_ia === 'ADEQUADO').length;
  const atencao = itens.filter(i => i.status_ia === 'ATENÇÃO').length;
  const bloqueados = itens.filter(i => i.status_ia === 'CRÍTICO' || i.status_ia === 'IRREGULAR').length;
  const taxaConformidade = total > 0 ? Number(((conformes / total) * 100).toFixed(1)) : 100;

  const valorTotalLideres = itens.reduce((acc, i) => acc + (i.menor_preco * i.quantidade), 0);
  const economiaGlobal = itens.reduce((acc, i) => acc + i.economia_projetada_reais, 0);
  const sobreprecoEvitado = itens.reduce((acc, i) => acc + i.sobrepreco_evitado_reais, 0);
  const travas = itens.filter(i => i.trava_obrigatoria).length;

  const rawHashPayload = `${total}|${valorTotalLideres}|${taxaConformidade}|${economiaGlobal}|${Date.now()}`;
  const hash = crypto.createHash('sha256').update(rawHashPayload).digest('hex');

  return {
    total_itens: total,
    itens_conformes_bps: conformes,
    itens_atencao_mercado: atencao,
    itens_bloqueados_cmed: bloqueados,
    taxa_conformidade_pct: taxaConformidade,
    valor_total_lideres_reais: Number(valorTotalLideres.toFixed(2)),
    economia_global_bps_reais: Number(economiaGlobal.toFixed(2)),
    sobrepreco_evitado_cmed_reais: Number(sobreprecoEvitado.toFixed(2)),
    travas_ativas_total: travas,
    hash_auditoria_sha256: hash
  };
}

// 2. Cesta 2: Antimicrobianos & Injetáveis (18 Itens)
const ITENS_ANTIMICROBIANOS: ItemComparativoLote[] = ITENS_UTI_ANESTESICOS.slice(0, 18).map((it, idx) => {
  return {
    ...it,
    id: `lote-antimic-${idx + 1}`,
    numero_item: idx + 1
  };
});

// 3. Cesta 3: Imunobiológicos & Alto Custo (12 Itens)
const ITENS_IMUNO_ALTO_CUSTO: ItemComparativoLote[] = [
  {
    id: 'lote-imuno-001',
    numero_item: 1,
    codigo_catmat: 'BR0401928',
    descricao_medicamento: 'Imunoglobulina Humana 5g Frasco 100mL Endovenosa',
    principio_ativo: 'Imunoglobulina Humana Endovenosa',
    concentracao: '5g/100mL',
    apresentacao: 'Frasco 100mL',
    unidade_fornecimento: 'Frasco',
    quantidade: 1500,
    preco_cmed_teto: 1580.00,
    preco_bps_mediana: 1320.00,
    preco_bps_media: 1345.00,
    menor_preco: 1210.00,
    fornecedor_lider: 'BioGenética Hospitalar Comércio Ltda',
    status_ia: 'EXCELENTE',
    cor_ia: 'verde',
    divergencia_lider_bps_pct: -8.33,
    divergencia_lider_cmed_pct: -23.42,
    economia_projetada_reais: 165000.00,
    sobrepreco_evitado_reais: 0,
    trava_obrigatoria: false,
    parecer_conclusivo: 'Imunobiológico de altíssimo valor. Economia gerada de R$ 165.000,00 sobre a mediana BPS.',
    propostas: [
      {
        fornecedor_id: 'forn-02',
        razao_social: 'BioGenética Hospitalar Comércio Ltda',
        cnpj: '98.765.432/0001-11',
        preco_unitario: 1210.00,
        preco_total: 1815000.00,
        is_vencedor: true,
        divergencia_bps_pct: -8.33,
        divergencia_cmed_pct: -23.42,
        classificacao_ia: 'EXCELENTE',
        cor_ia: 'verde',
        trava_ativa: false,
        parecer_individual: 'Melhor proposta com rastreabilidade biológica.'
      }
    ]
  },
  ...ITENS_UTI_ANESTESICOS.slice(1, 12).map((it, idx) => ({
    ...it,
    id: `lote-imuno-${idx + 2}`,
    numero_item: idx + 2
  }))
];

export const BANCO_CESTAS_LOTE: Record<string, CestaLoteComparativo> = {
  'COT-2026-089': {
    id: 'cesta-001',
    codigo_cotacao: 'COT-2026-089',
    titulo: 'Cesta de Medicamentos de UTI e Anestésicos Críticos',
    categoria: 'Terapia Intensiva & Centro Cirúrgico',
    modalidade: 'Pregão Eletrônico SRP (Lei 14.133/21)',
    data_abertura: '2026-09-15',
    data_apuracao: '2026-09-21',
    orgao_demandante: 'Hospital Central 360 / Secretaria de Saúde',
    responsavel_auditoria: 'Dra. Marina Santos (Auditora Farmacêutica CMED)',
    itens: ITENS_UTI_ANESTESICOS,
    metricas: consolidarMetricasCesta(ITENS_UTI_ANESTESICOS)
  },
  'COT-2026-095': {
    id: 'cesta-002',
    codigo_cotacao: 'COT-2026-095',
    titulo: 'Cesta de Antimicrobianos e Injetáveis Hospitalares',
    categoria: 'Infectologia & Farmácia Central',
    modalidade: 'Pregão Eletrônico SRP (Lei 14.133/21)',
    data_abertura: '2026-09-18',
    data_apuracao: '2026-09-21',
    orgao_demandante: 'Hospital Central 360',
    responsavel_auditoria: 'Carlos Eduardo (Comissão de Contratações)',
    itens: ITENS_ANTIMICROBIANOS,
    metricas: consolidarMetricasCesta(ITENS_ANTIMICROBIANOS)
  },
  'COT-2026-110': {
    id: 'cesta-003',
    codigo_cotacao: 'COT-2026-110',
    titulo: 'Cesta de Imunobiológicos e Medicamentos de Alto Custo',
    categoria: 'Oncologia & Imunologia Avançada',
    modalidade: 'Pregão Eletrônico SRP (Lei 14.133/21)',
    data_abertura: '2026-09-20',
    data_apuracao: '2026-09-21',
    orgao_demandante: 'Secretaria de Estado da Saúde / Hospital Central 360',
    responsavel_auditoria: 'Dra. Marina Santos (Auditora Farmacêutica CMED)',
    itens: ITENS_IMUNO_ALTO_CUSTO,
    metricas: consolidarMetricasCesta(ITENS_IMUNO_ALTO_CUSTO)
  }
};
