import { NextResponse } from 'next/server';
import { validateMedicinePrice, CmedValidationInput } from '../../../lib/compras/cmedValidator';
import {
  BANCO_CESTAS_LOTE,
  consolidarMetricasCesta,
  classificarPrecoIA,
  ItemComparativoLote,
  CestaLoteComparativo
} from '../../../lib/compras/comparativoLoteEngine';
import {
  BANCO_PRECOS_MEDICAMENTOS_OFICIAL,
  buscarMedicamentoNoBanco,
  obterReferenciaPorCatmat,
  obterBancoPrecosDoBanco,
  semearBancoPrecosMedicamentosSupabase,
  MedicamentoPrecoReferencia
} from '../../../lib/compras/bancoPrecosMedicamentos';

// =====================================================================
// TIPAGENS DDD DO MÓDULO DE COMPRAS PÚBLICAS
// =====================================================================

export interface AtaItem {
  id: string;
  item_numero: number;
  codigo_catmat: string;
  descricao_medicamento: string;
  principio_ativo: string;
  unidade_fornecimento: string;
  quantidade_total: number;
  quantidade_consumida: number;
  quantidade_saldo: number;
  preco_homologado: number;
  preco_teto_cmed: number;
  preco_referencia_bps: number;
  economia_cmed_pct: number;
  trava_sobrepreco: boolean;
}

export interface AtaRegistroPreco {
  id: string;
  numero_ata: string;
  processo_licitatorio: string;
  modalidade: string;
  orgao_gerenciador: string;
  fornecedor_cnpj: string;
  fornecedor_razao_social: string;
  vigencia_inicio: string;
  vigencia_fim: string;
  valor_total: number;
  saldo_disponivel: number;
  status: 'VIGENTE' | 'ESGOTADA' | 'VENCIDA' | 'CANCELADA';
  limite_carona_orgao_pct: number;
  itens: AtaItem[];
}

export interface ContratoItem {
  id: string;
  ata_item_id: string;
  codigo_catmat: string;
  descricao_medicamento: string;
  unidade_fornecimento: string;
  quantidade_contratada: number;
  quantidade_empenhada: number;
  saldo_item_contrato: number;
  preco_unitario: number;
  valor_total: number;
}

export interface ContratoAdministrativo {
  id: string;
  numero_contrato: string;
  ata_id: string;
  numero_ata: string;
  tipo_fracionamento: 'INTEGRAL' | 'FRACIONADO';
  percentual_fracionamento: number; // Padrão: 50% da Ata
  fornecedor_cnpj: string;
  fornecedor_razao_social: string;
  data_assinatura: string;
  vigencia_inicio: string;
  vigencia_fim: string;
  valor_total_contrato: number;
  saldo_contrato_remanescente: number;
  status: 'ATIVO' | 'FINALIZADO' | 'CANCELADO';
  itens: ContratoItem[];
}

export interface EmpenhoItem {
  id: string;
  contrato_item_id: string;
  codigo_catmat: string;
  descricao_medicamento: string;
  quantidade_empenhada: number;
  quantidade_entregue_nf: number;
  saldo_item_empenho: number;
  preco_unitario: number;
  valor_total: number;
}

export interface NotaEmpenho {
  id: string;
  numero_empenho: string;
  contrato_id: string;
  numero_contrato: string;
  ata_id: string;
  numero_ata: string;
  dotacao_orcamentaria: string;
  orgao_demandante: string;
  valor_total_empenhado: number;
  saldo_empenho_remanescente: number;
  status: 'EMITIDO' | 'PARCIALMENTE_LIQUIDADO' | 'TOTALMENTE_LIQUIDADO' | 'ANULADO';
  criado_em: string;
  itens: EmpenhoItem[];
}

export interface ItemPedidoCompra {
  item_id: string;
  descricao: string;
  catmat: string;
  quantidade_pedida: number;
  quantidade_entregue: number;
  unidade: string;
  preco_unitario: number;
  valor_total: number;
  lote?: string;
  validade?: string;
  temperatura_exigida?: string;
  temperatura_aferida?: string;
  laudo_fabricante_anexo?: boolean;
  status_conferencia?: 'PENDENTE' | 'CONFORME' | 'DIVERGENTE' | 'REJEITADO';
}

export interface PedidoCompra {
  id: string;
  numero_pdc: string;
  data_emissao: string;
  prazo_entrega: string;
  vinculado_ata: boolean;
  ata_id?: string;
  numero_ata?: string;
  contrato_id?: string;
  numero_contrato?: string;
  empenho_id?: string;
  numero_empenho?: string;
  fornecedor_razao_social: string;
  fornecedor_cnpj: string;
  valor_total: number;
  status: 'AGUARDANDO_RECEBIMENTO' | 'RECEBIDO_PROVISORIO' | 'RECEBIDO_DEFINITIVO' | 'RECUSADO' | 'CANCELADO';
  
  // Governança de Exceção e Travas de Saldo
  tem_excecao_saldo_empenho?: boolean;
  tem_excecao_saldo_contrato?: boolean;
  justificativa_excecao?: string;
  aprovador_nome?: string;
  aprovador_cargo?: string;
  aprovado_em?: string;

  nota_fiscal?: {
    numero: string;
    serie: string;
    chave_acesso: string;
    data_emissao: string;
    valor_danfe: number;
  };
  recebimento?: {
    fiscal_nome: string;
    fiscal_cargo: string;
    data_recebimento: string;
    tipo_recebimento: 'provisorio' | 'definitivo';
    termo_recebimento_numero: string;
    observacoes: string;
    encaminhado_wms: boolean;
  };
  itens: ItemPedidoCompra[];
}

// Cotação Multipolar & Comparativo de Preços
export interface CotacaoPropostaFornecedor {
  id: string;
  cotacao_item_id: string;
  fornecedor_id: string;
  razao_social: string;
  cnpj: string;
  preco_unitario: number;
  preco_total: number;
  lote_fabricante: string;
  data_validade: string;
  fabricante_marca: string;
  prazo_entrega_dias: number;
  aceito_responsavel: boolean;
  excluido_acima_media: boolean;
  motivo_descarte?: string;
  data_envio: string;
}

export interface CotacaoItem {
  id: string;
  item_numero: number;
  codigo_catmat: string;
  descricao_medicamento: string;
  principio_ativo: string;
  unidade_fornecimento: string;
  quantidade: number;
  preco_cmed_teto: number;
  preco_bps_mediana: number;
  preco_medio_calculado?: number;
  propostas: CotacaoPropostaFornecedor[];
}

export interface CotacaoPreco {
  id: string;
  codigo_cotacao: string;
  titulo: string;
  origem_importacao: 'MANUAL' | 'LOTE_PDF' | 'LOTE_CSV';
  status: 'ABERTA' | 'DISPARADA_FORNECEDORES' | 'EM_ANALISE' | 'HOMOLOGADA';
  responsavel_abertura: string;
  data_abertura: string;
  data_limite_proposta: string;
  itens: CotacaoItem[];
  homologacao?: {
    data_homologacao: string;
    responsavel_nome: string;
    total_itens_homologados: number;
    valor_total_homologado: number;
    economia_cmed_total: number;
  };
}

export interface ChamadoModulo {
  id: string;
  protocolo: string;
  modulo_origem: string;
  setor: string;
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica_bloqueante';
  status: 'aberto' | 'em_atendimento' | 'resolvido';
  autor_nome: string;
  autor_perfil: string;
  criado_em: string;
}

export interface OcorrenciaModulo {
  id: string;
  modulo_origem: string;
  unidade_setor: string;
  data: string;
  turno: string;
  gravidade: 'informativa' | 'atencao' | 'grave' | 'critica_emergencial';
  relato: string;
  providencias: string;
  autor_nome: string;
  autor_perfil: string;
  criado_em: string;
}

export interface LogInteracao {
  id: string;
  modulo: string;
  usuario_email: string;
  perfil_ativo: string;
  acao: string;
  entidade: string;
  descricao: string;
  data_hora: string;
}

// =====================================================================
// BANCO DE DADOS EM MEMÓRIA (PERSISTÊNCIA OPERACIONAL)
// =====================================================================

let atasDB: AtaRegistroPreco[] = [
  {
    id: 'ata-001',
    numero_ata: 'ARP-2026/042-SMS',
    processo_licitatorio: 'PE-SRP nº 018/2026',
    modalidade: 'Pregão Eletrônico SRP (Lei 14.133/21)',
    orgao_gerenciador: 'Secretaria Municipal de Saúde / Hospital Central 360',
    fornecedor_cnpj: '12.345.678/0001-90',
    fornecedor_razao_social: 'Distribuidora Farmacêutica Nacional S/A',
    vigencia_inicio: '2026-01-15',
    vigencia_fim: '2027-01-14',
    valor_total: 4850000.00,
    saldo_disponivel: 2425000.00, // Após fracionamento inicial de 50%
    status: 'VIGENTE',
    limite_carona_orgao_pct: 50.0,
    itens: [
      {
        id: 'item-001',
        item_numero: 1,
        codigo_catmat: 'BR0284729',
        descricao_medicamento: 'Meropenem 1g Pó Liofilizado Injetável',
        principio_ativo: 'Meropenem Tri-hidratado',
        unidade_fornecimento: 'Frasco-Ampola',
        quantidade_total: 20000,
        quantidade_consumida: 10000,
        quantidade_saldo: 10000, // 10.000 consumidas no contrato de 50%
        preco_homologado: 48.50,
        preco_teto_cmed: 68.20,
        preco_referencia_bps: 52.10,
        economia_cmed_pct: 28.88,
        trava_sobrepreco: false
      },
      {
        id: 'item-002',
        item_numero: 2,
        codigo_catmat: 'BR0194851',
        descricao_medicamento: 'Noradrenalina 2mg/mL Ampola 4mL',
        principio_ativo: 'Hemitartarato de Norepinefrina',
        unidade_fornecimento: 'Ampola',
        quantidade_total: 50000,
        quantidade_consumida: 25000,
        quantidade_saldo: 25000,
        preco_homologado: 12.80,
        preco_teto_cmed: 18.50,
        preco_referencia_bps: 14.20,
        economia_cmed_pct: 30.81,
        trava_sobrepreco: false
      },
      {
        id: 'item-003',
        item_numero: 3,
        codigo_catmat: 'BR0311209',
        descricao_medicamento: 'Fentanila 0,05mg/mL Injetável 10mL',
        principio_ativo: 'Citrato de Fentanila (Portaria 344/98)',
        unidade_fornecimento: 'Ampola',
        quantidade_total: 15000,
        quantidade_consumida: 7500,
        quantidade_saldo: 7500,
        preco_homologado: 16.90,
        preco_teto_cmed: 22.40,
        preco_referencia_bps: 17.50,
        economia_cmed_pct: 24.55,
        trava_sobrepreco: false
      }
    ]
  },
  {
    id: 'ata-002',
    numero_ata: 'ARP-2026/089-SES',
    processo_licitatorio: 'PE-SRP nº 033/2026',
    modalidade: 'Pregão Eletrônico SRP (Lei 14.133/21)',
    orgao_gerenciador: 'Secretaria de Estado da Saúde',
    fornecedor_cnpj: '98.765.432/0001-11',
    fornecedor_razao_social: 'BioGenética Hospitalar Comércio Ltda',
    vigencia_inicio: '2026-03-01',
    vigencia_fim: '2027-02-28',
    valor_total: 8200000.00,
    saldo_disponivel: 8200000.00,
    status: 'VIGENTE',
    limite_carona_orgao_pct: 50.0,
    itens: [
      {
        id: 'item-004',
        item_numero: 1,
        codigo_catmat: 'BR0355102',
        descricao_medicamento: 'Enoxaparina Sódica 40mg/0,4mL Seringa',
        principio_ativo: 'Enoxaparina Sódica',
        unidade_fornecimento: 'Seringa Preenchida',
        quantidade_total: 40000,
        quantidade_consumida: 0,
        quantidade_saldo: 40000,
        preco_homologado: 23.40,
        preco_teto_cmed: 34.00,
        preco_referencia_bps: 25.80,
        economia_cmed_pct: 31.17,
        trava_sobrepreco: false
      }
    ]
  }
];

// Contratos Administrativos (Padrão: 50% do valor da Ata)
let contratosDB: ContratoAdministrativo[] = [
  {
    id: 'cont-001',
    numero_contrato: 'CONT-2026/042-A',
    ata_id: 'ata-001',
    numero_ata: 'ARP-2026/042-SMS',
    tipo_fracionamento: 'FRACIONADO',
    percentual_fracionamento: 50.0,
    fornecedor_cnpj: '12.345.678/0001-90',
    fornecedor_razao_social: 'Distribuidora Farmacêutica Nacional S/A',
    data_assinatura: '2026-01-20',
    vigencia_inicio: '2026-01-20',
    vigencia_fim: '2027-01-19',
    valor_total_contrato: 2425000.00,
    saldo_contrato_remanescente: 1940000.00, // Após empenho emitido
    status: 'ATIVO',
    itens: [
      {
        id: 'citem-001',
        ata_item_id: 'item-001',
        codigo_catmat: 'BR0284729',
        descricao_medicamento: 'Meropenem 1g Pó Liofilizado Injetável',
        unidade_fornecimento: 'Frasco-Ampola',
        quantidade_contratada: 10000, // 50% de 20.000
        quantidade_empenhada: 3000,
        saldo_item_contrato: 7000,
        preco_unitario: 48.50,
        valor_total: 485000.00
      },
      {
        id: 'citem-002',
        ata_item_id: 'item-002',
        codigo_catmat: 'BR0194851',
        descricao_medicamento: 'Noradrenalina 2mg/mL Ampola 4mL',
        unidade_fornecimento: 'Ampola',
        quantidade_contratada: 25000, // 50% de 50.000
        quantidade_empenhada: 10000,
        saldo_item_contrato: 15000,
        preco_unitario: 12.80,
        valor_total: 320000.00
      }
    ]
  }
];

// Notas de Empenho (emitidas do Contrato)
let empenhosDB: NotaEmpenho[] = [
  {
    id: 'emp-001',
    numero_empenho: 'EMP-2026/894120',
    contrato_id: 'cont-001',
    numero_contrato: 'CONT-2026/042-A',
    ata_id: 'ata-001',
    numero_ata: 'ARP-2026/042-SMS',
    dotacao_orcamentaria: '10.302.0042.2045.339030 (Medicamentos e Insumos Hospitalares)',
    orgao_demandante: 'Hospital Central 360 / UTI Adulto & Farmácia',
    valor_total_empenhado: 145500.00,
    saldo_empenho_remanescente: 48500.00, // 3000 Meropenem total -> 2000 no PdC-0001 -> saldo 1000 un (R$ 48.500)
    status: 'EMITIDO',
    criado_em: '2026-09-15 10:00',
    itens: [
      {
        id: 'eitem-001',
        contrato_item_id: 'citem-001',
        codigo_catmat: 'BR0284729',
        descricao_medicamento: 'Meropenem 1g Pó Liofilizado Injetável',
        quantidade_empenhada: 3000,
        quantidade_entregue_nf: 2000,
        saldo_item_empenho: 1000,
        preco_unitario: 48.50,
        valor_total: 145500.00
      }
    ]
  },
  {
    id: 'emp-002',
    numero_empenho: 'EMP-2026/512903',
    contrato_id: 'cont-001',
    numero_contrato: 'CONT-2026/042-A',
    ata_id: 'ata-001',
    numero_ata: 'ARP-2026/042-SMS',
    dotacao_orcamentaria: '10.302.0042.2045.339030 (Urgência e Emergência)',
    orgao_demandante: 'Hospital Central 360 / Pronto Socorro',
    valor_total_empenhado: 128000.00,
    saldo_empenho_remanescente: 64000.00,
    status: 'EMITIDO',
    criado_em: '2026-09-16 11:30',
    itens: [
      {
        id: 'eitem-002',
        contrato_item_id: 'citem-002',
        codigo_catmat: 'BR0194851',
        descricao_medicamento: 'Noradrenalina 2mg/mL Ampola 4mL',
        quantidade_empenhada: 10000,
        quantidade_entregue_nf: 5000,
        saldo_item_empenho: 5000,
        preco_unitario: 12.80,
        valor_total: 128000.00
      }
    ]
  }
];

// Pedidos de Compra (PdC)
let pedidosCompraDB: PedidoCompra[] = [
  {
    id: 'pdc-001',
    numero_pdc: 'PdC-2026-0001',
    data_emissao: '2026-09-18',
    prazo_entrega: '2026-09-23',
    vinculado_ata: true,
    ata_id: 'ata-001',
    numero_ata: 'ARP-2026/042-SMS',
    contrato_id: 'cont-001',
    numero_contrato: 'CONT-2026/042-A',
    empenho_id: 'emp-001',
    numero_empenho: 'EMP-2026/894120',
    fornecedor_razao_social: 'Distribuidora Farmacêutica Nacional S/A',
    fornecedor_cnpj: '12.345.678/0001-90',
    valor_total: 97000.00,
    status: 'AGUARDANDO_RECEBIMENTO',
    nota_fiscal: {
      numero: '004.891.201',
      serie: '1',
      chave_acesso: '3526 0912 3456 7800 0190 5500 1004 8912 0110 4918 2741',
      data_emissao: '2026-09-20',
      valor_danfe: 97000.00
    },
    itens: [
      {
        item_id: 'item-001',
        descricao: 'Meropenem 1g Pó Liofilizado Injetável',
        catmat: 'BR0284729',
        quantidade_pedida: 2000,
        quantidade_entregue: 2000,
        unidade: 'Frasco-Ampola',
        preco_unitario: 48.50,
        valor_total: 97000.00,
        lote: 'MP-2026/X08',
        validade: '2027-10-31',
        temperatura_exigida: '15ºC a 30ºC (Ambiente Controlado)',
        temperatura_aferida: '21.4ºC',
        laudo_fabricante_anexo: true,
        status_conferencia: 'CONFORME'
      }
    ]
  },
  {
    id: 'pdc-002',
    numero_pdc: 'PdC-2026-0002',
    data_emissao: '2026-09-19',
    prazo_entrega: '2026-09-25',
    vinculado_ata: true,
    ata_id: 'ata-001',
    numero_ata: 'ARP-2026/042-SMS',
    contrato_id: 'cont-001',
    numero_contrato: 'CONT-2026/042-A',
    empenho_id: 'emp-002',
    numero_empenho: 'EMP-2026/512903',
    fornecedor_razao_social: 'Distribuidora Farmacêutica Nacional S/A',
    fornecedor_cnpj: '12.345.678/0001-90',
    valor_total: 64000.00,
    status: 'AGUARDANDO_RECEBIMENTO',
    nota_fiscal: {
      numero: '004.891.240',
      serie: '1',
      chave_acesso: '3526 0912 3456 7800 0190 5500 1004 8912 4010 8821 9912',
      data_emissao: '2026-09-21',
      valor_danfe: 64000.00
    },
    itens: [
      {
        item_id: 'item-002',
        descricao: 'Noradrenalina 2mg/mL Ampola 4mL',
        catmat: 'BR0194851',
        quantidade_pedida: 5000,
        quantidade_entregue: 5000,
        unidade: 'Ampola',
        preco_unitario: 12.80,
        valor_total: 64000.00,
        lote: 'NA-4491-B',
        validade: '2027-08-30',
        temperatura_exigida: '2ºC a 8ºC (Cadeia de Frio Termolábil)',
        temperatura_aferida: '4.8ºC',
        laudo_fabricante_anexo: true,
        status_conferencia: 'CONFORME'
      }
    ]
  }
];

// Cotações de Preço & Comparativos Multipolares
let cotacoesDB: CotacaoPreco[] = [
  {
    id: 'cot-001',
    codigo_cotacao: 'COT-2026-089',
    titulo: 'Cotação Emergencial de Antibióticos e Anestésicos Hospitalares',
    origem_importacao: 'MANUAL',
    status: 'EM_ANALISE',
    responsavel_abertura: 'Carlos Eduardo (Gerente de Compras)',
    data_abertura: '2026-09-18',
    data_limite_proposta: '2026-09-25',
    itens: [
      {
        id: 'coti-001',
        item_numero: 1,
        codigo_catmat: 'BR0284729',
        descricao_medicamento: 'Meropenem 1g Pó Liofilizado Injetável',
        principio_ativo: 'Meropenem Tri-hidratado',
        unidade_fornecimento: 'Frasco-Ampola',
        quantidade: 10000,
        preco_cmed_teto: 68.20,
        preco_bps_mediana: 52.10,
        preco_medio_calculado: 49.30,
        propostas: [
          {
            id: 'prop-001',
            cotacao_item_id: 'coti-001',
            fornecedor_id: 'forn-01',
            razao_social: 'Distribuidora Farmacêutica Nacional S/A',
            cnpj: '12.345.678/0001-90',
            preco_unitario: 47.90,
            preco_total: 479000.00,
            lote_fabricante: 'LT-MER-9941',
            data_validade: '2028-02-28',
            fabricante_marca: 'Eurofarma Laboratórios',
            prazo_entrega_dias: 5,
            aceito_responsavel: true,
            excluido_acima_media: false,
            data_envio: '2026-09-20 14:30'
          },
          {
            id: 'prop-002',
            cotacao_item_id: 'coti-001',
            fornecedor_id: 'forn-02',
            razao_social: 'BioGenética Hospitalar Comércio Ltda',
            cnpj: '98.765.432/0001-11',
            preco_unitario: 49.20,
            preco_total: 492000.00,
            lote_fabricante: 'BG-MP-2026',
            data_validade: '2027-11-30',
            fabricante_marca: 'Blau Farmacêutica',
            prazo_entrega_dias: 4,
            aceito_responsavel: false,
            excluido_acima_media: false,
            data_envio: '2026-09-20 16:15'
          },
          {
            id: 'prop-003',
            cotacao_item_id: 'coti-001',
            fornecedor_id: 'forn-03',
            razao_social: 'MedFarma Express Distribuição Eireli',
            cnpj: '44.555.666/0001-22',
            preco_unitario: 72.50, // Ultrapassa média e CMED
            preco_total: 725000.00,
            lote_fabricante: 'MF-8812',
            data_validade: '2027-06-30',
            fabricante_marca: 'União Química',
            prazo_entrega_dias: 7,
            aceito_responsavel: false,
            excluido_acima_media: true,
            motivo_descarte: 'Preço acima do teto regulatório CMED (R$ 68,20) e superior à média das propostas.',
            data_envio: '2026-09-21 09:10'
          }
        ]
      },
      {
        id: 'coti-002',
        item_numero: 2,
        codigo_catmat: 'BR0194851',
        descricao_medicamento: 'Noradrenalina 2mg/mL Ampola 4mL',
        principio_ativo: 'Hemitartarato de Norepinefrina',
        unidade_fornecimento: 'Ampola',
        quantidade: 20000,
        preco_cmed_teto: 18.50,
        preco_bps_mediana: 14.20,
        preco_medio_calculado: 12.90,
        propostas: [
          {
            id: 'prop-004',
            cotacao_item_id: 'coti-002',
            fornecedor_id: 'forn-01',
            razao_social: 'Distribuidora Farmacêutica Nacional S/A',
            cnpj: '12.345.678/0001-90',
            preco_unitario: 12.50,
            preco_total: 250000.00,
            lote_fabricante: 'NA-4001',
            data_validade: '2028-05-31',
            fabricante_marca: 'Hipolabor Farmacêutica',
            prazo_entrega_dias: 3,
            aceito_responsavel: true,
            excluido_acima_media: false,
            data_envio: '2026-09-20 14:32'
          },
          {
            id: 'prop-005',
            cotacao_item_id: 'coti-002',
            fornecedor_id: 'forn-02',
            razao_social: 'BioGenética Hospitalar Comércio Ltda',
            cnpj: '98.765.432/0001-11',
            preco_unitario: 13.30,
            preco_total: 266000.00,
            lote_fabricante: 'BG-NA-88',
            data_validade: '2027-12-15',
            fabricante_marca: 'Cristália Produtos Químicos',
            prazo_entrega_dias: 5,
            aceito_responsavel: false,
            excluido_acima_media: false,
            data_envio: '2026-09-20 16:20'
          }
        ]
      }
    ]
  }
];

let chamadosDB: ChamadoModulo[] = [
  {
    id: 'chm-001',
    protocolo: 'CHM-COMPRAS-2026-004',
    modulo_origem: 'compras-publicas',
    setor: 'Coordenação de Licitações',
    titulo: 'Divergência de lote na entrega de Meropenem 1g',
    descricao: 'Fornecedor entregou lote com prazo de validade inferior a 12 meses, violando termo de referência da ARP-2026/042.',
    prioridade: 'alta',
    status: 'em_atendimento',
    autor_nome: 'Carlos Eduardo (Operador)',
    autor_perfil: 'compras_operador',
    criado_em: '2026-09-21 14:15'
  }
];

let ocorrenciasDB: OcorrenciaModulo[] = [
  {
    id: 'oco-001',
    modulo_origem: 'compras-publicas',
    unidade_setor: 'Almoxarifado Central / Setor de Compras',
    data: '2026-09-21',
    turno: 'manha',
    gravidade: 'atencao',
    relato: 'Fornecedor Distribuidora Farmacêutica Nacional comunicou atraso de 48h no despacho da Ordem de Fornecimento nº 022 por bloqueio de carga interestadual.',
    providencias: 'Notificação formal expedida com aplicação de advertência contratual e acionamento de estoque regulador de segurança.',
    autor_nome: 'Carlos Eduardo',
    autor_perfil: 'compras_operador',
    criado_em: '2026-09-21 11:45'
  }
];

let logsDB: LogInteracao[] = [
  {
    id: 'log-001',
    modulo: 'compras-publicas',
    usuario_email: 'gerente.compras@hospital360.com.br',
    perfil_ativo: 'compras_admin',
    acao: 'alinhamento_arquitetural',
    entidade: 'modulo_compras_fluxo_completo',
    descricao: 'Estrutura DDD ativada: Ata -> Contrato (50% fracionado) -> Empenho -> PdC com Cascata de Travas -> NF com Baixa Atômica.',
    data_hora: '2026-09-21 21:50:00'
  }
];

// =====================================================================
// ROTAS GET
// =====================================================================

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');

  if (tipo === 'banco_precos') {
    const busca = searchParams.get('busca') || '';
    const resultado = await obterBancoPrecosDoBanco(busca);
    return NextResponse.json({
      success: true,
      medicamentos: resultado.medicamentos,
      origem: resultado.origem,
      total: resultado.total
    });
  }

  if (tipo === 'contratos') {
    return NextResponse.json({ success: true, contratos: contratosDB });
  }

  if (tipo === 'empenhos') {
    return NextResponse.json({ success: true, empenhos: empenhosDB });
  }

  if (tipo === 'cotacoes') {
    return NextResponse.json({ success: true, cotacoes: cotacoesDB });
  }

  if (tipo === 'chamados') {
    return NextResponse.json({ success: true, chamados: chamadosDB });
  }

  if (tipo === 'ocorrencias') {
    return NextResponse.json({ success: true, ocorrencias: ocorrenciasDB });
  }

  if (tipo === 'logs') {
    return NextResponse.json({ success: true, logs: logsDB });
  }

  if (tipo === 'pedidos' || tipo === 'entregas') {
    return NextResponse.json({ success: true, pedidos_compra: pedidosCompraDB });
  }

  if (tipo === 'comparativo_lote') {
    const cotacaoId = searchParams.get('cotacao_id') || 'COT-2026-089';
    const cesta = BANCO_CESTAS_LOTE[cotacaoId] || BANCO_CESTAS_LOTE['COT-2026-089'];
    return NextResponse.json({
      success: true,
      cotacoes_disponiveis: Object.keys(BANCO_CESTAS_LOTE).map(k => ({
        codigo: k,
        titulo: BANCO_CESTAS_LOTE[k].titulo,
        total_itens: BANCO_CESTAS_LOTE[k].itens.length,
        categoria: BANCO_CESTAS_LOTE[k].categoria,
        modalidade: BANCO_CESTAS_LOTE[k].modalidade,
        data_apuracao: BANCO_CESTAS_LOTE[k].data_apuracao
      })),
      cesta
    });
  }

  // Consulta assíncrona do Banco Oficial de Preços de Medicamentos
  const dadosBancoPrecos = await obterBancoPrecosDoBanco();

  // Métricas Consolidadas do Módulo
  const totalAtas = atasDB.length;
  const totalItens = atasDB.reduce((acc, a) => acc + a.itens.length, 0);
  const valorTotalAtas = atasDB.reduce((acc, a) => acc + a.valor_total, 0);
  const saldoTotalAtas = atasDB.reduce((acc, a) => acc + (a.saldo_disponivel || 0), 0);
  const totalContratos = contratosDB.length;
  const valorTotalContratos = contratosDB.reduce((acc, c) => acc + c.valor_total_contrato, 0);
  const saldoTotalContratos = contratosDB.reduce((acc, c) => acc + c.saldo_contrato_remanescente, 0);
  const totalEmpenhos = empenhosDB.length;
  const valorTotalEmpenhado = empenhosDB.reduce((acc, e) => acc + e.valor_total_empenhado, 0);
  const saldoTotalEmpenhos = empenhosDB.reduce((acc, e) => acc + e.saldo_empenho_remanescente, 0);

  return NextResponse.json({
    success: true,
    atas: atasDB,
    contratos: contratosDB,
    empenhos: empenhosDB,
    pedidos_compra: pedidosCompraDB,
    cotacoes: cotacoesDB,
    banco_precos: dadosBancoPrecos.medicamentos,
    origem_banco_precos: dadosBancoPrecos.origem,
    total_medicamentos_banco: dadosBancoPrecos.total,
    metricas: {
      total_atas_vigentes: totalAtas,
      total_itens_registrados: totalItens,
      valor_total_atas: valorTotalAtas,
      saldo_disponivel_atas: saldoTotalAtas,
      total_contratos_ativos: totalContratos,
      valor_total_contratos: valorTotalContratos,
      saldo_total_contratos: saldoTotalContratos,
      total_empenhos_emitidos: totalEmpenhos,
      valor_total_empenhos: valorTotalEmpenhado,
      saldo_total_empenhos: saldoTotalEmpenhos,
      pedidos_aguardando_entrega: pedidosCompraDB.filter(p => p.status === 'AGUARDANDO_RECEBIMENTO').length
    },
    chamados_recentes: chamadosDB,
    ocorrencias_recentes: ocorrenciasDB,
    logs_recentes: logsDB
  });
}

// =====================================================================
// ROTAS POST (AÇÕES DE DOMÍNIO E TRANSAÇÕES EM CASCATA)
// =====================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { acao } = body;

    // -----------------------------------------------------------------
    // AÇÃO 1: GERAR CONTRATO A PARTIR DA ATA (INTEGRAL OU FRACIONADO 50%)
    // -----------------------------------------------------------------
    if (acao === 'gerar_contrato') {
      const { ata_id, tipo_fracionamento = 'FRACIONADO', percentual_fracionamento = 50.0 } = body;
      const ata = atasDB.find(a => a.id === ata_id);
      if (!ata) {
        return NextResponse.json({ success: false, error: 'Ata de Registro de Preços não localizada.' }, { status: 404 });
      }

      const pct = tipo_fracionamento === 'INTEGRAL' ? 100 : Number(percentual_fracionamento);
      const fator = pct / 100.0;

      // Validação: Ata possui saldo para este fracionamento?
      const valorDesejado = Number((ata.valor_total * fator).toFixed(2));
      if (valorDesejado > ata.saldo_disponivel) {
        return NextResponse.json({
          success: false,
          error: `Saldo insuficiente na ATA. Saldo atual disponível: R$ ${ata.saldo_disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Solicitado para o contrato: R$ ${valorDesejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
        }, { status: 400 });
      }

      // Abate saldo da Ata
      ata.saldo_disponivel -= valorDesejado;

      const numeroContrato = `CONT-2026/${ata.numero_ata.split('/')[1]?.split('-')[0] || '042'}-${String.fromCharCode(65 + contratosDB.length)}`;

      const itensContrato: ContratoItem[] = ata.itens.map((it, idx) => {
        const qtdContratada = Math.floor(it.quantidade_total * fator);
        const valorItem = Number((qtdContratada * it.preco_homologado).toFixed(2));
        it.quantidade_saldo -= qtdContratada;
        it.quantidade_consumida += qtdContratada;

        return {
          id: `citem-${Date.now()}-${idx + 1}`,
          ata_item_id: it.id,
          codigo_catmat: it.codigo_catmat,
          descricao_medicamento: it.descricao_medicamento,
          unidade_fornecimento: it.unidade_fornecimento,
          quantidade_contratada: qtdContratada,
          quantidade_empenhada: 0,
          saldo_item_contrato: qtdContratada,
          preco_unitario: it.preco_homologado,
          valor_total: valorItem
        };
      });

      const novoContrato: ContratoAdministrativo = {
        id: `cont-${Date.now()}`,
        numero_contrato: numeroContrato,
        ata_id: ata.id,
        numero_ata: ata.numero_ata,
        tipo_fracionamento,
        percentual_fracionamento: pct,
        fornecedor_cnpj: ata.fornecedor_cnpj,
        fornecedor_razao_social: ata.fornecedor_razao_social,
        data_assinatura: new Date().toISOString().substring(0, 10),
        vigencia_inicio: new Date().toISOString().substring(0, 10),
        vigencia_fim: ata.vigencia_fim,
        valor_total_contrato: valorDesejado,
        saldo_contrato_remanescente: valorDesejado,
        status: 'ATIVO',
        itens: itensContrato
      };

      contratosDB.unshift(novoContrato);

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'compras@hospital360.com.br',
        perfil_ativo: 'compras_admin',
        acao: 'geracao_contrato_administrativo',
        entidade: 'contratos_administrativos',
        descricao: `Contrato ${novoContrato.numero_contrato} gerado (${pct}% da Ata ${ata.numero_ata}). Valor: R$ ${valorDesejado.toFixed(2)}. Saldo restante na Ata: R$ ${ata.saldo_disponivel.toFixed(2)}.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        contrato: novoContrato,
        saldo_remanescente_ata: ata.saldo_disponivel,
        mensagem: `Contrato administrativo ${novoContrato.numero_contrato} gerado com sucesso (${pct}% do valor da Ata).`
      });
    }

    // -----------------------------------------------------------------
    // AÇÃO 2: EMITIR NOTA DE EMPENHO A PARTIR DO CONTRATO
    // -----------------------------------------------------------------
    if (acao === 'emitir_empenho') {
      const { contrato_id, dotacao_orcamentaria, orgao_demandante, itens_empenho } = body;
      const contrato = contratosDB.find(c => c.id === contrato_id);
      if (!contrato) {
        return NextResponse.json({ success: false, error: 'Contrato administrativo não localizado.' }, { status: 404 });
      }

      // Validar se os itens cabem no saldo do contrato
      let valorTotalEmpenhado = 0;
      const itensValidados: EmpenhoItem[] = [];

      for (const itemReq of itens_empenho || []) {
        const cItem = contrato.itens.find(ci => ci.id === itemReq.contrato_item_id || ci.codigo_catmat === itemReq.codigo_catmat);
        if (!cItem) continue;

        const qtdDesejada = Number(itemReq.quantidade);
        if (qtdDesejada > cItem.saldo_item_contrato) {
          return NextResponse.json({
            success: false,
            error: `Quantidade solicitada (${qtdDesejada}) excede o saldo contratual disponível (${cItem.saldo_item_contrato}) para o medicamento ${cItem.descricao_medicamento}.`
          }, { status: 400 });
        }

        const vTot = Number((qtdDesejada * cItem.preco_unitario).toFixed(2));
        valorTotalEmpenhado += vTot;

        // Abate saldo do contrato
        cItem.quantidade_empenhada += qtdDesejada;
        cItem.saldo_item_contrato -= qtdDesejada;

        itensValidados.push({
          id: `eitem-${Date.now()}-${itensValidados.length + 1}`,
          contrato_item_id: cItem.id,
          codigo_catmat: cItem.codigo_catmat,
          descricao_medicamento: cItem.descricao_medicamento,
          quantidade_empenhada: qtdDesejada,
          quantidade_entregue_nf: 0,
          saldo_item_empenho: qtdDesejada,
          preco_unitario: cItem.preco_unitario,
          valor_total: vTot
        });
      }

      if (itensValidados.length === 0) {
        return NextResponse.json({ success: false, error: 'Nenhum item válido informado para o empenho.' }, { status: 400 });
      }

      contrato.saldo_contrato_remanescente -= valorTotalEmpenhado;

      const numeroEmpenho = `EMP-2026/${Math.floor(100000 + Math.random() * 900000)}`;
      const novoEmpenho: NotaEmpenho = {
        id: `emp-${Date.now()}`,
        numero_empenho: numeroEmpenho,
        contrato_id: contrato.id,
        numero_contrato: contrato.numero_contrato,
        ata_id: contrato.ata_id,
        numero_ata: contrato.numero_ata,
        dotacao_orcamentaria: dotacao_orcamentaria || '10.302.0042.2045.339030 (Medicamentos e Insumos)',
        orgao_demandante: orgao_demandante || 'Hospital Central 360',
        valor_total_empenhado: valorTotalEmpenhado,
        saldo_empenho_remanescente: valorTotalEmpenhado,
        status: 'EMITIDO',
        criado_em: new Date().toISOString().replace('T', ' ').substring(0, 16),
        itens: itensValidados
      };

      empenhosDB.unshift(novoEmpenho);

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'compras@hospital360.com.br',
        perfil_ativo: 'compras_operador',
        acao: 'emissao_nota_empenho',
        entidade: 'notas_empenho',
        descricao: `Nota de Empenho ${numeroEmpenho} emitida para o Contrato ${contrato.numero_contrato}. Valor: R$ ${valorTotalEmpenhado.toFixed(2)}.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        empenho: novoEmpenho,
        saldo_remanescente_contrato: contrato.saldo_contrato_remanescente,
        mensagem: `Nota de Empenho ${numeroEmpenho} emitida com sucesso.`
      });
    }

    // -----------------------------------------------------------------
    // AÇÃO 3: VALIDAÇÃO DE SALDO EM CASCATA & EMISSÃO DE PEDIDO DE COMPRA (PdC)
    // -----------------------------------------------------------------
    if (acao === 'emitir_pedido_compra') {
      const {
        empenho_id,
        itens_pedido,
        data_entrega_prevista,
        tem_justificativa,
        justificativa_texto,
        aprovador_nome,
        aprovador_cargo
      } = body;

      const empenho = empenhosDB.find(e => e.id === empenho_id);
      if (!empenho) {
        return NextResponse.json({ success: false, error: 'Nota de Empenho não localizada.' }, { status: 404 });
      }

      const contrato = contratosDB.find(c => c.id === empenho.contrato_id);
      const ata = atasDB.find(a => a.id === empenho.ata_id);

      if (!contrato || !ata) {
        return NextResponse.json({ success: false, error: 'Vínculo contratual ou Ata não localizada.' }, { status: 404 });
      }

      // 1. Checagem de Saldo em Cascata para cada item
      let faltaSaldoEmpenho = false;
      let faltaSaldoContrato = false;
      let faltaSaldoAta = false;
      let valorTotalPedido = 0;

      const itensFormatados: ItemPedidoCompra[] = [];

      for (const itemReq of itens_pedido || []) {
        const eItem = empenho.itens.find(ei => ei.id === itemReq.empenho_item_id || ei.codigo_catmat === itemReq.catmat);
        const qtdPedida = Number(itemReq.quantidade);
        const precoUnit = eItem ? eItem.preco_unitario : Number(itemReq.preco_unitario || 10.0);
        const vTot = Number((qtdPedida * precoUnit).toFixed(2));
        valorTotalPedido += vTot;

        // Checagem 1: Empenho
        if (!eItem || qtdPedida > eItem.saldo_item_empenho) {
          faltaSaldoEmpenho = true;
        }

        // Checagem 2: Contrato
        const cItem = contrato.itens.find(ci => ci.codigo_catmat === itemReq.catmat || (eItem && ci.id === eItem.contrato_item_id));
        if (!cItem || qtdPedida > cItem.saldo_item_contrato) {
          faltaSaldoContrato = true;
        }

        // Checagem 3: Ata (Hard Stop)
        const aItem = ata.itens.find(ai => ai.codigo_catmat === itemReq.catmat);
        if (!aItem || qtdPedida > aItem.quantidade_saldo) {
          faltaSaldoAta = true;
        }

        itensFormatados.push({
          item_id: aItem ? aItem.id : `it-${Date.now()}`,
          descricao: aItem ? aItem.descricao_medicamento : itemReq.descricao,
          catmat: itemReq.catmat,
          quantidade_pedida: qtdPedida,
          quantidade_entregue: 0,
          unidade: aItem ? aItem.unidade_fornecimento : 'Unidade',
          preco_unitario: precoUnit,
          valor_total: vTot,
          status_conferencia: 'PENDENTE'
        });
      }

      // TRAVA 3: Se não tem saldo na ATA -> BLOQUEIO TOTAL INTRANSPONÍVEL (Lei 14.133/21 Art. 82)
      if (faltaSaldoAta) {
        return NextResponse.json({
          success: false,
          bloqueio_tipo: 'ATA_INTRANSPONIVEL',
          error: 'BLOQUEIO LEGAL INTRANSPONÍVEL: O quantitativo solicitado excede o saldo total registrado na Ata de Registro de Preços (ARP). Conforme Art. 82 da Lei 14.133/21, é vedado emitir pedidos além do limite registrado na Ata. Necessário abrir nova cotação/licitação.'
        }, { status: 422 });
      }

      // TRAVA 1 & 2: Se falta saldo no Empenho ou Contrato:
      // Pode fazer o pedido SOMENTE se houver justificativa e aprovação formal
      if (faltaSaldoEmpenho || faltaSaldoContrato) {
        if (!tem_justificativa || !justificativa_texto || !aprovador_nome) {
          return NextResponse.json({
            success: false,
            bloqueio_tipo: faltaSaldoEmpenho ? 'SALDO_EMPENHO_INSUFICIENTE' : 'SALDO_CONTRATO_INSUFICIENTE',
            exige_justificativa: true,
            error: faltaSaldoEmpenho
              ? 'Saldo insuficiente na Nota de Empenho. É necessário emitir outro empenho ou prosseguir mediante Justificativa Formal e Aprovação do Ordenador de Despesa.'
              : 'Saldo insuficiente no Contrato Administrativo. É necessário formalizar termo aditivo/novo contrato ou prosseguir com Justificativa Formal e Aprovação da Gestão Contratual.'
          }, { status: 400 });
        }
      }

      // Emissão do Pedido de Compra
      const numeroPdc = `PdC-2026-${String(pedidosCompraDB.length + 1).padStart(4, '0')}`;
      const novoPdc: PedidoCompra = {
        id: `pdc-${Date.now()}`,
        numero_pdc: numeroPdc,
        data_emissao: new Date().toISOString().substring(0, 10),
        prazo_entrega: data_entrega_prevista || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        vinculado_ata: true,
        ata_id: ata.id,
        numero_ata: ata.numero_ata,
        contrato_id: contrato.id,
        numero_contrato: contrato.numero_contrato,
        empenho_id: empenho.id,
        numero_empenho: empenho.numero_empenho,
        fornecedor_razao_social: ata.fornecedor_razao_social,
        fornecedor_cnpj: ata.fornecedor_cnpj,
        valor_total: valorTotalPedido,
        status: 'AGUARDANDO_RECEBIMENTO',
        tem_excecao_saldo_empenho: faltaSaldoEmpenho,
        tem_excecao_saldo_contrato: faltaSaldoContrato,
        justificativa_excecao: justificativa_texto || undefined,
        aprovador_nome: aprovador_nome || undefined,
        aprovador_cargo: aprovador_cargo || undefined,
        aprovado_em: (faltaSaldoEmpenho || faltaSaldoContrato) ? new Date().toISOString() : undefined,
        itens: itensFormatados
      };

      pedidosCompraDB.unshift(novoPdc);

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'compras@hospital360.com.br',
        perfil_ativo: 'compras_operador',
        acao: 'emissao_pedido_compra',
        entidade: 'pedidos_compra',
        descricao: `Pedido de Compra ${numeroPdc} emitido para ${novoPdc.fornecedor_razao_social}. Valor: R$ ${valorTotalPedido.toFixed(2)}. Exceção justificada: ${novoPdc.tem_excecao_saldo_empenho ? 'Sim' : 'Não'}.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        pedido: novoPdc,
        mensagem: `Pedido de Compra ${numeroPdc} emitido com sucesso e transmitido ao fornecedor.`
      });
    }

    // -----------------------------------------------------------------
    // AÇÃO 4: ENTRADA DE NOTA FISCAL (NF-e) COM BAIXA ATÔMICA EM CASCATA
    // -----------------------------------------------------------------
    if (acao === 'dar_entrada_nfe_cascata') {
      const {
        pdc_id,
        numero_danfe,
        serie_danfe,
        chave_acesso,
        data_emissao_danfe,
        valor_danfe,
        itens_conferencia,
        fiscal_nome,
        fiscal_cargo,
        tipo_recebimento = 'provisorio'
      } = body;

      const pdc = pedidosCompraDB.find(p => p.id === pdc_id || p.numero_pdc === pdc_id);
      if (!pdc) {
        return NextResponse.json({ success: false, error: 'Pedido de Compra não localizado.' }, { status: 404 });
      }

      const empenho = empenhosDB.find(e => e.id === pdc.empenho_id || e.numero_empenho === pdc.numero_empenho);
      const contrato = contratosDB.find(c => c.id === pdc.contrato_id || c.numero_contrato === pdc.numero_contrato);
      const ata = atasDB.find(a => a.id === pdc.ata_id || a.numero_ata === pdc.numero_ata);

      // Executa a baixa atômica nos 3 níveis para cada item faturado
      for (const itemConf of itens_conferencia || []) {
        const qtdFaturada = Number(itemConf.quantidade_entregue || itemConf.quantidade_faturada);
        const valorItem = Number((qtdFaturada * Number(itemConf.preco_unitario)).toFixed(2));

        // 1. Abate no Empenho
        if (empenho) {
          const eItem = empenho.itens.find(ei => ei.codigo_catmat === itemConf.catmat);
          if (eItem) {
            eItem.quantidade_entregue_nf += qtdFaturada;
            eItem.saldo_item_empenho = Math.max(0, eItem.saldo_item_empenho - qtdFaturada);
          }
          empenho.saldo_empenho_remanescente = Math.max(0, empenho.saldo_empenho_remanescente - valorItem);
        }

        // 2. Abate no Contrato
        if (contrato) {
          const cItem = contrato.itens.find(ci => ci.codigo_catmat === itemConf.catmat);
          if (cItem) {
            cItem.saldo_item_contrato = Math.max(0, cItem.saldo_item_contrato - qtdFaturada);
          }
          contrato.saldo_contrato_remanescente = Math.max(0, contrato.saldo_contrato_remanescente - valorItem);
        }

        // 3. Abate na Ata
        if (ata) {
          const aItem = ata.itens.find(ai => ai.codigo_catmat === itemConf.catmat);
          if (aItem) {
            aItem.quantidade_saldo = Math.max(0, aItem.quantidade_saldo - qtdFaturada);
          }
          ata.saldo_disponivel = Math.max(0, ata.saldo_disponivel - valorItem);
        }

        // Atualiza item do PdC
        const pItem = pdc.itens.find(pi => pi.catmat === itemConf.catmat);
        if (pItem) {
          pItem.quantidade_entregue = qtdFaturada;
          pItem.lote = itemConf.lote;
          pItem.validade = itemConf.validade;
          pItem.temperatura_aferida = itemConf.temperatura_aferida;
          pItem.status_conferencia = 'CONFORME';
        }
      }

      const termoRecebimento = `TRP-2026/${Math.floor(1000 + Math.random() * 9000)}`;

      pdc.status = tipo_recebimento === 'definitivo' ? 'RECEBIDO_DEFINITIVO' : 'RECEBIDO_PROVISORIO';
      pdc.nota_fiscal = {
        numero: numero_danfe || '004.891.201',
        serie: serie_danfe || '1',
        chave_acesso: chave_acesso || '3526 0912 3456 7800 0190 5500 1004 8912 0110 4918 2741',
        data_emissao: data_emissao_danfe || new Date().toISOString().substring(0, 10),
        valor_danfe: valor_danfe || pdc.valor_total
      };
      pdc.recebimento = {
        fiscal_nome: fiscal_nome || 'Fiscal do Contrato',
        fiscal_cargo: fiscal_cargo || 'Farmacêutico RT',
        data_recebimento: new Date().toISOString().replace('T', ' ').substring(0, 19),
        tipo_recebimento: tipo_recebimento as any,
        termo_recebimento_numero: termoRecebimento,
        observacoes: 'Entrada física e fiscal realizada com baixa em cascata concluída (Empenho -> Contrato -> Ata). Carga liberada para quarentena WMS.',
        encaminhado_wms: true
      };

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'almoxarife@hospital360.com.br',
        perfil_ativo: 'compras_admin',
        acao: 'entrada_nfe_baixa_cascata',
        entidade: 'notas_fiscais_entrada',
        descricao: `DANFE nº ${pdc.nota_fiscal.numero} registrada para ${pdc.numero_pdc}. Baixa atômica efetuada: Empenho ${pdc.numero_empenho}, Contrato ${pdc.numero_contrato}, Ata ${pdc.numero_ata}. Termo: ${termoRecebimento}.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        pdc,
        saldos_atualizados: {
          saldo_empenho: empenho ? empenho.saldo_empenho_remanescente : 0,
          saldo_contrato: contrato ? contrato.saldo_contrato_remanescente : 0,
          saldo_ata: ata ? ata.saldo_disponivel : 0
        },
        termo_recebimento: termoRecebimento,
        mensagem: 'Nota Fiscal lançada com sucesso! Quantidades abatidas em cascata no Empenho, Contrato e Ata de Registro de Preços.'
      });
    }

    // -----------------------------------------------------------------
    // AÇÃO 5: ABERTURA DE COTAÇÃO DE PREÇO (MANUAL OU LOTE CSV/PDF)
    // -----------------------------------------------------------------
    if (acao === 'abrir_cotacao_preco') {
      const { titulo, origem_importacao = 'MANUAL', data_limite, itens, responsavel } = body;

      const codigoCotacao = `COT-2026-${String(cotacoesDB.length + 1).padStart(3, '0')}`;
      const novaCotacao: CotacaoPreco = {
        id: `cot-${Date.now()}`,
        codigo_cotacao: codigoCotacao,
        titulo: titulo || 'Cotação de Preços Hospitalares',
        origem_importacao: origem_importacao as any,
        status: 'DISPARADA_FORNECEDORES',
        responsavel_abertura: responsavel || 'Carlos Eduardo (Comprador)',
        data_abertura: new Date().toISOString().substring(0, 10),
        data_limite_proposta: data_limite || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        itens: (itens || []).map((it: any, index: number) => ({
          id: `coti-${Date.now()}-${index + 1}`,
          item_numero: index + 1,
          codigo_catmat: it.codigo_catmat || `BR0${Math.floor(100000 + Math.random() * 900000)}`,
          descricao_medicamento: it.descricao_medicamento || 'Medicamento Sob Cotação',
          principio_ativo: it.principio_ativo || 'Princípio Ativo Padrão',
          unidade_fornecimento: it.unidade_fornecimento || 'Frasco-Ampola',
          quantidade: Number(it.quantidade || 1000),
          preco_cmed_teto: Number(it.preco_cmed_teto || 50.0),
          preco_bps_mediana: Number(it.preco_bps_mediana || 40.0),
          preco_medio_calculado: 0,
          propostas: []
        }))
      };

      cotacoesDB.unshift(novaCotacao);

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'compras@hospital360.com.br',
        perfil_ativo: 'compras_operador',
        acao: 'abertura_cotacao_precos',
        entidade: 'cotacoes_precos',
        descricao: `Cotação ${codigoCotacao} aberta com ${novaCotacao.itens.length} itens via ${origem_importacao}. Disparada para fornecedores.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        cotacao: novaCotacao,
        mensagem: `Cotação ${codigoCotacao} aberta com sucesso e disparada aos fornecedores.`
      });
    }

    // -----------------------------------------------------------------
    // AÇÃO 6: PREENCHIMENTO DE PROPOSTA PELO FORNECEDOR (PREÇO, LOTE, VALIDADE, FABRICANTE)
    // -----------------------------------------------------------------
    if (acao === 'lancar_proposta_fornecedor') {
      const {
        cotacao_id,
        cotacao_item_id,
        razao_social,
        cnpj,
        preco_unitario,
        lote_fabricante,
        data_validade,
        fabricante_marca,
        prazo_entrega_dias = 5
      } = body;

      const cotacao = cotacoesDB.find(c => c.id === cotacao_id || c.codigo_cotacao === cotacao_id);
      if (!cotacao) {
        return NextResponse.json({ success: false, error: 'Cotação não localizada.' }, { status: 404 });
      }

      const item = cotacao.itens.find(i => i.id === cotacao_item_id || i.item_numero === Number(cotacao_item_id));
      if (!item) {
        return NextResponse.json({ success: false, error: 'Item de cotação não localizado.' }, { status: 404 });
      }

      const pUnit = Number(preco_unitario);
      const pTot = Number((pUnit * item.quantidade).toFixed(2));

      const novaProp: CotacaoPropostaFornecedor = {
        id: `prop-${Date.now()}`,
        cotacao_item_id: item.id,
        fornecedor_id: `forn-${Date.now()}`,
        razao_social: razao_social || 'Fornecedor Proponente',
        cnpj: cnpj || '00.000.000/0001-00',
        preco_unitario: pUnit,
        preco_total: pTot,
        lote_fabricante: lote_fabricante || 'LT-2026/01',
        data_validade: data_validade || '2028-12-31',
        fabricante_marca: fabricante_marca || 'Laboratório Farmacêutico',
        prazo_entrega_dias: Number(prazo_entrega_dias),
        aceito_responsavel: false,
        excluido_acima_media: pUnit > item.preco_cmed_teto,
        motivo_descarte: pUnit > item.preco_cmed_teto ? 'Preço proposto excede o teto CMED.' : undefined,
        data_envio: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      item.propostas.push(novaProp);

      // Recalcula média do item
      const propsValidas = item.propostas.filter(p => !p.excluido_acima_media);
      if (propsValidas.length > 0) {
        const soma = propsValidas.reduce((a, b) => a + b.preco_unitario, 0);
        item.preco_medio_calculado = Number((soma / propsValidas.length).toFixed(2));
      }

      return NextResponse.json({
        success: true,
        proposta: novaProp,
        preco_medio_calculado: item.preco_medio_calculado,
        mensagem: 'Proposta do fornecedor registrada com sucesso com lote, validade e fabricante.'
      });
    }

    // -----------------------------------------------------------------
    // AÇÃO 7: HOMOLOGAÇÃO DO COMPARATIVO (ACEITAR PREÇOS / EXCLUIR FORA DA MÉDIA)
    // -----------------------------------------------------------------
    if (acao === 'homologar_comparativo_precos') {
      const { cotacao_id, acoes_propostas, responsavel_nome } = body;
      const cotacao = cotacoesDB.find(c => c.id === cotacao_id || c.codigo_cotacao === cotacao_id);
      if (!cotacao) {
        return NextResponse.json({ success: false, error: 'Cotação não localizada.' }, { status: 404 });
      }

      // Aplica aceites e exclusões
      for (const item of cotacao.itens) {
        for (const prop of item.propostas) {
          const config = (acoes_propostas || []).find((a: any) => a.proposta_id === prop.id);
          if (config) {
            prop.aceito_responsavel = !!config.aceito;
            prop.excluido_acima_media = !!config.excluido;
            if (config.motivo_descarte) {
              prop.motivo_descarte = config.motivo_descarte;
            }
          }
        }
      }

      // Calcula totais homologados
      let totalItensHomologados = 0;
      let valorTotalHomologado = 0;
      let economiaTotal = 0;

      for (const item of cotacao.itens) {
        const vencedora = item.propostas.find(p => p.aceito_responsavel);
        if (vencedora) {
          totalItensHomologados++;
          valorTotalHomologado += vencedora.preco_total;
          economiaTotal += (item.preco_cmed_teto - vencedora.preco_unitario) * item.quantidade;
        }
      }

      cotacao.status = 'HOMOLOGADA';
      cotacao.homologacao = {
        data_homologacao: new Date().toISOString().replace('T', ' ').substring(0, 19),
        responsavel_nome: responsavel_nome || 'Carlos Eduardo (Gerente de Compras)',
        total_itens_homologados: totalItensHomologados,
        valor_total_homologado: Number(valorTotalHomologado.toFixed(2)),
        economia_cmed_total: Number(economiaTotal.toFixed(2))
      };

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'compras@hospital360.com.br',
        perfil_ativo: 'compras_admin',
        acao: 'homologacao_mapa_precos',
        entidade: 'cotacoes_precos',
        descricao: `Cotação ${cotacao.codigo_cotacao} homologada por ${cotacao.homologacao.responsavel_nome}. ${totalItensHomologados} itens homologados. Valor Total: R$ ${valorTotalHomologado.toFixed(2)}.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        cotacao,
        mensagem: 'Mapa de cotação de preços homologado com sucesso! Lista de preços aceitáveis gerada e pronta para impressão/exportação para os autos do processo.'
      });
    }

    // Ações complementares existentes (CMED, Chamados, Ocorrências)
    if (acao === 'validar_preco') {
      const input: CmedValidationInput = {
        codigo_catmat: body.codigo_catmat,
        nome_medicamento: body.nome_medicamento,
        preco_proposto: Number(body.preco_proposto),
        fornecedor_cnpj: body.fornecedor_cnpj,
        fornecedor_razao_social: body.fornecedor_razao_social,
        quantidade_ofertada: body.quantidade_ofertada || 1000
      };
      const resultado = validateMedicinePrice(input);
      return NextResponse.json({ success: true, resultado });
    }

    if (acao === 'abrir_chamado') {
      const novoChamado: ChamadoModulo = {
        id: `chm-${Date.now()}`,
        protocolo: `CHM-COMPRAS-2026-${String(chamadosDB.length + 1).padStart(3, '0')}`,
        modulo_origem: 'compras-publicas',
        setor: body.setor || 'Setor de Compras e Suprimentos',
        titulo: body.titulo,
        descricao: body.descricao,
        prioridade: body.prioridade || 'media',
        status: 'aberto',
        autor_nome: body.autor_nome || 'Operador',
        autor_perfil: body.autor_perfil || 'compras_operador',
        criado_em: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      chamadosDB.unshift(novoChamado);
      return NextResponse.json({ success: true, chamado: novoChamado });
    }

    if (acao === 'registrar_ocorrencia') {
      const novaOcorrencia: OcorrenciaModulo = {
        id: `oco-${Date.now()}`,
        modulo_origem: 'compras-publicas',
        unidade_setor: body.unidade_setor || 'Almoxarifado & Compras',
        data: new Date().toISOString().substring(0, 10),
        turno: body.turno || 'manha',
        gravidade: body.gravidade || 'informativa',
        relato: body.relato,
        providencias: body.providencias || 'Providências imediatas tomadas.',
        autor_nome: body.autor_nome || 'Operador em Exercício',
        autor_perfil: body.autor_perfil || 'compras_operador',
        criado_em: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      ocorrenciasDB.unshift(novaOcorrencia);
      return NextResponse.json({ success: true, ocorrencia: novaOcorrencia });
    }

    if (acao === 'semear_banco_precos' || acao === 'sincronizar_banco_precos') {
      const resSemeadura = await semearBancoPrecosMedicamentosSupabase();
      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'admin.cmed@hospital360.com.br',
        perfil_ativo: 'compras_admin',
        acao: 'sincronizacao_banco_precos_medicamentos',
        entidade: 'banco_precos_medicamentos',
        descricao: resSemeadura.success
          ? `Banco de Preços de Medicamentos sincronizado com sucesso no Supabase (${resSemeadura.inseridos} itens catalogados).`
          : `Tentativa de sincronização com Supabase: ${resSemeadura.error}. Sistema em contingência regulatória ativa.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: resSemeadura.success,
        inseridos: resSemeadura.inseridos,
        error: resSemeadura.error,
        mensagem: resSemeadura.success
          ? `Tabela public.banco_precos_medicamentos sincronizada no Supabase com ${resSemeadura.inseridos} medicamentos oficiais.`
          : `Status de sincronização remota: ${resSemeadura.error}. O módulo permanece 100% operacional com o catálogo oficial CMED/BPS.`
      });
    }

    return NextResponse.json({ success: false, error: 'Ação não reconhecida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
