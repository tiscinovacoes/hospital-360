import { NextResponse } from 'next/server';
import { validateMedicinePrice, CmedValidationInput } from '../../../lib/compras/cmedValidator';
import {
  BANCO_CESTAS_LOTE,
  consolidarMetricasCesta,
  classificarPrecoIA,
  ItemComparativoLote,
  CestaLoteComparativo
} from '../../../lib/compras/comparativoLoteEngine';

// Tipagens do Módulo Compras
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
  status: 'VIGENTE' | 'ESGOTADA' | 'VENCIDA' | 'CANCELADA';
  limite_carona_orgao_pct: number;
  itens: AtaItem[];
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
  lote: string;
  validade: string;
  temperatura_exigida: string;
  temperatura_aferida?: string;
  laudo_fabricante_anexo: boolean;
  status_conferencia: 'PENDENTE' | 'CONFORME' | 'DIVERGENTE' | 'REJEITADO';
}

export interface PedidoCompra {
  id: string;
  numero_pdc: string;
  numero_empenho: string;
  numero_ata: string;
  fornecedor_razao_social: string;
  fornecedor_cnpj: string;
  data_emissao: string;
  prazo_entrega: string;
  valor_total: number;
  status: 'AGUARDANDO_RECEBIMENTO' | 'RECEBIDO_PROVISORIO' | 'RECEBIDO_DEFINITIVO' | 'RECUSADO';
  nota_fiscal: {
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

// Armazenamento em memória com sementes reais
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
        quantidade_consumida: 6500,
        quantidade_saldo: 13500,
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
        quantidade_consumida: 21000,
        quantidade_saldo: 29000,
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
        quantidade_consumida: 4800,
        quantidade_saldo: 10200,
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
        quantidade_consumida: 12500,
        quantidade_saldo: 27500,
        preco_homologado: 23.40,
        preco_teto_cmed: 34.00,
        preco_referencia_bps: 25.80,
        economia_cmed_pct: 31.17,
        trava_sobrepreco: false
      },
      {
        id: 'item-005',
        item_numero: 2,
        codigo_catmat: 'BR0401928',
        descricao_medicamento: 'Imunoglobulina Humana 5g Frasco 100mL',
        principio_ativo: 'Imunoglobulina Humana Endovenosa',
        unidade_fornecimento: 'Frasco',
        quantidade_total: 1200,
        quantidade_consumida: 980,
        quantidade_saldo: 220,
        preco_homologado: 1250.00,
        preco_teto_cmed: 1580.00,
        preco_referencia_bps: 1320.00,
        economia_cmed_pct: 20.88,
        trava_sobrepreco: false
      }
    ]
  }
];

// Pedidos de Compra (PdC) para confirmação de entrega física/fiscal
let pedidosCompraDB: PedidoCompra[] = [
  {
    id: 'pdc-001',
    numero_pdc: 'PdC-2026-0001',
    numero_empenho: 'EMP-2026/894120',
    numero_ata: 'ARP-2026/042-SMS',
    fornecedor_razao_social: 'Distribuidora Farmacêutica Nacional S/A',
    fornecedor_cnpj: '12.345.678/0001-90',
    data_emissao: '2026-09-18',
    prazo_entrega: '2026-09-23',
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
    numero_empenho: 'EMP-2026/512903',
    numero_ata: 'ARP-2026/042-SMS',
    fornecedor_razao_social: 'Distribuidora Farmacêutica Nacional S/A',
    fornecedor_cnpj: '12.345.678/0001-90',
    data_emissao: '2026-09-19',
    prazo_entrega: '2026-09-25',
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
  },
  {
    id: 'chm-002',
    protocolo: 'CHM-COMPRAS-2026-003',
    modulo_origem: 'compras-publicas',
    setor: 'Auditoria de Custos',
    titulo: 'Atualização periódica da tabela CMED de setembro',
    descricao: 'Executada carga de atualização do PMVG da ANVISA com novos tetos de medicamentos biológicos.',
    prioridade: 'media',
    status: 'resolvido',
    autor_nome: 'Dra. Marina Santos (Auditora)',
    autor_perfil: 'compras_auditor_cmed',
    criado_em: '2026-09-21 09:30'
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
    usuario_email: 'auditor.cmed@hospital360.com.br',
    perfil_ativo: 'compras_auditor_cmed',
    acao: 'validacao_preco_cmed',
    entidade: 'item_da_receita_anvisa',
    descricao: 'Auditoria preventiva executada: Meropenem 1g validado com status OK (Economia de 28.88% frente ao teto CMED).',
    data_hora: '2026-09-21 18:10:05'
  },
  {
    id: 'log-002',
    modulo: 'compras-publicas',
    usuario_email: 'admin.compras@hospital360.com.br',
    perfil_ativo: 'compras_admin',
    acao: 'aprovacao_homologacao',
    entidade: 'atas_registro_precos',
    descricao: 'Homologação digital da Ata ARP-2026/089-SES confirmada no banco de dados.',
    data_hora: '2026-09-21 17:42:19'
  }
];

// 1. GET: Retorna dados completos para o módulo compras
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');

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

  // Métricas Consolidadas
  const totalAtas = atasDB.length;
  const totalItens = atasDB.reduce((acc, a) => acc + a.itens.length, 0);
  const valorTotalAtas = atasDB.reduce((acc, a) => acc + a.valor_total, 0);

  const valorTotalConsumido = atasDB.reduce((acc, a) =>
    acc + a.itens.reduce((iAcc, item) => iAcc + (item.quantidade_consumida * item.preco_homologado), 0)
  , 0);

  const economiaGlobalReais = atasDB.reduce((acc, a) =>
    acc + a.itens.reduce((iAcc, item) =>
      iAcc + (item.quantidade_consumida * (item.preco_teto_cmed - item.preco_homologado))
    , 0)
  , 0);

  const economiaMediaPct = valorTotalConsumido > 0
    ? Number(((economiaGlobalReais / (valorTotalConsumido + economiaGlobalReais)) * 100).toFixed(2))
    : 28.5;

  return NextResponse.json({
    success: true,
    atas: atasDB,
    pedidos_compra: pedidosCompraDB,
    metricas: {
      total_atas_vigentes: totalAtas,
      total_itens_registrados: totalItens,
      valor_total_atas: valorTotalAtas,
      valor_executado_empenhos: valorTotalConsumido,
      economia_gerada_cmed_reais: economiaGlobalReais,
      economia_media_cmed_pct: economiaMediaPct,
      pedidos_empenho_totais: 142,
      pedidos_aguardando_entrega: pedidosCompraDB.filter(p => p.status === 'AGUARDANDO_RECEBIMENTO').length,
      travas_sobrepreco_evitadas: 6
    },
    chamados_recentes: chamadosDB,
    ocorrencias_recentes: ocorrenciasDB,
    logs_recentes: logsDB
  });
}

// 2. POST: Ações do Módulo Compras
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { acao } = body;

    // Ação 1: Validar Preço CMED
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

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'auditor@hospital360.com.br',
        perfil_ativo: body.perfil_ativo || 'compras_auditor_cmed',
        acao: 'validacao_preco_cmed',
        entidade: 'catalogo_medicamentos_cmed',
        descricao: `Validação executada para ${input.nome_medicamento} (CATMAT: ${input.codigo_catmat}). Status: ${resultado.validation.status} | Proposta: R$ ${input.preco_proposto} vs CMED: R$ ${resultado.prices.cmed_ceiling_price}.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        resultado,
        audit_log: {
          id: resultado.audit_log_id,
          timestamp: resultado.timestamp,
          hash: resultado.audit_hash
        }
      });
    }

    // Ação 1.5: Importação e Auditoria de Lote em Larga Escala
    if (acao === 'comparativo_lote_importar') {
      const { itens, titulo, orgao_demandante } = body;
      const itensFormatados: ItemComparativoLote[] = (itens || []).map((it: any, index: number) => {
        const precoProposto = Number(it.menor_preco || it.preco_proposto || 10.0);
        const precoCmed = Number(it.preco_cmed_teto || precoProposto * 1.3);
        const precoBps = Number(it.preco_bps_mediana || precoProposto * 1.08);
        const qtd = Number(it.quantidade || 1000);
        const classif = classificarPrecoIA(precoProposto, precoCmed, precoBps);
        const divBps = Number((((precoProposto - precoBps) / precoBps) * 100).toFixed(2));
        const divCmed = Number((((precoProposto - precoCmed) / precoCmed) * 100).toFixed(2));
        const econ = precoProposto < precoBps ? (precoBps - precoProposto) * qtd : 0;
        const sobrepreco = precoProposto > precoCmed ? (precoProposto - precoCmed) * qtd : 0;

        return {
          id: `lote-custom-${index + 1}`,
          numero_item: index + 1,
          codigo_catmat: it.codigo_catmat || `BR0${Math.floor(100000 + Math.random() * 900000)}`,
          descricao_medicamento: it.descricao_medicamento || 'Medicamento Sob Análise',
          principio_ativo: it.principio_ativo || 'Princípio Ativo Não Especificado',
          concentracao: it.concentracao || 'Padrão Hospitalar',
          apresentacao: it.apresentacao || 'Frasco-Ampola',
          unidade_fornecimento: it.unidade_fornecimento || 'Frasco',
          quantidade: qtd,
          preco_cmed_teto: precoCmed,
          preco_bps_mediana: precoBps,
          preco_bps_media: precoBps * 1.02,
          menor_preco: precoProposto,
          fornecedor_lider: it.fornecedor_lider || 'Proponente Comercial Principal',
          status_ia: classif.classificacao,
          cor_ia: classif.cor,
          divergencia_lider_bps_pct: divBps,
          divergencia_lider_cmed_pct: divCmed,
          economia_projetada_reais: Number(econ.toFixed(2)),
          sobrepreco_evitado_reais: Number(sobrepreco.toFixed(2)),
          trava_obrigatoria: classif.trava,
          parecer_conclusivo: classif.parecer,
          propostas: it.propostas || [
            {
              fornecedor_id: 'forn-import-01',
              razao_social: it.fornecedor_lider || 'Proponente Comercial Principal',
              cnpj: '00.000.000/0001-00',
              preco_unitario: precoProposto,
              preco_total: Number((precoProposto * qtd).toFixed(2)),
              is_vencedor: true,
              divergencia_bps_pct: divBps,
              divergencia_cmed_pct: divCmed,
              classificacao_ia: classif.classificacao,
              cor_ia: classif.cor,
              trava_ativa: classif.trava,
              parecer_individual: classif.parecer
            }
          ]
        };
      });

      const metricasCustom = consolidarMetricasCesta(itensFormatados);
      const cestaCustom: CestaLoteComparativo = {
        id: `cesta-${Date.now()}`,
        codigo_cotacao: `COT-IMP-${Date.now().toString().slice(-4)}`,
        titulo: titulo || 'Cesta Importada via Planilha / Lote Especial',
        categoria: 'Importação em Lote / Auditoria Customizada',
        modalidade: 'Dispensa / Pregão SRP (Lei 14.133/21)',
        data_abertura: new Date().toISOString().substring(0, 10),
        data_apuracao: new Date().toISOString().substring(0, 10),
        orgao_demandante: orgao_demandante || 'Hospital Central 360',
        responsavel_auditoria: body.usuario_email || 'auditor@hospital360.com.br',
        itens: itensFormatados,
        metricas: metricasCustom
      };

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'auditor@hospital360.com.br',
        perfil_ativo: body.perfil_ativo || 'compras_auditor_cmed',
        acao: 'importacao_lote_comparativo',
        entidade: 'comparativo_larga_escala',
        descricao: `Lote "${cestaCustom.titulo}" com ${itensFormatados.length} itens auditado com sucesso. Taxa de conformidade: ${metricasCustom.taxa_conformidade_pct}%.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({ success: true, cesta: cestaCustom });
    }

    // Ação 2: Emitir Empenho Digital com Travas
    if (acao === 'emitir_empenho') {
      const ata_id = body.ata_id;
      const item_id = body.item_id;
      const quantidade_empenho = Number(body.quantidade_empenho);
      const orgao_demandante = body.orgao_demandante || 'Hospital Central 360';
      const tipo_adesao = body.tipo_adesao || 'ORGAO_GERENCIADOR';

      const ata = atasDB.find(a => a.id === ata_id || a.itens.some(i => i.id === item_id));
      if (!ata) {
        return NextResponse.json({ success: false, error: 'Ata de Registro de Preços não encontrada.' }, { status: 404 });
      }

      const item = ata.itens.find(i => i.id === item_id);
      if (!item) {
        return NextResponse.json({ success: false, error: 'Item de ata não encontrado.' }, { status: 404 });
      }

      // Trava de Saldo
      if (quantidade_empenho > item.quantidade_saldo) {
        return NextResponse.json({
          success: false,
          error: `Quantidade solicitada (${quantidade_empenho}) excede o saldo remanescente (${item.quantidade_saldo} ${item.unidade_fornecimento}).`
        }, { status: 400 });
      }

      // Trava de Carona (Lei 14.133/21: máx 50% por item)
      if (tipo_adesao === 'CARONA_ADESAO') {
        const limiteCaronaItem = Math.floor(item.quantidade_total * 0.50);
        if (quantidade_empenho > limiteCaronaItem) {
          return NextResponse.json({
            success: false,
            error: `Trava Lei 14.133/21 violada: Órgãos carona não podem solicitar mais de 50% do quantitativo do item (${limiteCaronaItem} ${item.unidade_fornecimento}). Solicitado: ${quantidade_empenho}.`
          }, { status: 400 });
        }
      }

      // Baixa do saldo atômica
      item.quantidade_consumida += quantidade_empenho;
      item.quantidade_saldo -= quantidade_empenho;

      const valorEmpenho = Number((quantidade_empenho * item.preco_homologado).toFixed(2));
      const numeroEmpenho = `EMP-2026/${Math.floor(100000 + Math.random() * 900000)}`;
      const numeroPdc = `PdC-2026-${String(pedidosCompraDB.length + 1).padStart(4, '0')}`;

      // Criação automática do Pedido de Compra (PdC)
      const novoPdc: PedidoCompra = {
        id: `pdc-${Date.now()}`,
        numero_pdc: numeroPdc,
        numero_empenho: numeroEmpenho,
        numero_ata: ata.numero_ata,
        fornecedor_razao_social: ata.fornecedor_razao_social,
        fornecedor_cnpj: ata.fornecedor_cnpj,
        data_emissao: new Date().toISOString().substring(0, 10),
        prazo_entrega: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        valor_total: valorEmpenho,
        status: 'AGUARDANDO_RECEBIMENTO',
        nota_fiscal: {
          numero: `004.${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}`,
          serie: '1',
          chave_acesso: `3526 0912 3456 7800 0190 5500 1004 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
          data_emissao: new Date().toISOString().substring(0, 10),
          valor_danfe: valorEmpenho
        },
        itens: [
          {
            item_id: item.id,
            descricao: item.descricao_medicamento,
            catmat: item.codigo_catmat,
            quantidade_pedida: quantidade_empenho,
            quantidade_entregue: quantidade_empenho,
            unidade: item.unidade_fornecimento,
            preco_unitario: item.preco_homologado,
            valor_total: valorEmpenho,
            lote: `LT-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
            validade: '2027-12-31',
            temperatura_exigida: item.descricao_medicamento.includes('Noradrenalina') ? '2ºC a 8ºC (Cadeia de Frio)' : '15ºC a 30ºC (Ambiente Controlado)',
            temperatura_aferida: item.descricao_medicamento.includes('Noradrenalina') ? '4.5ºC' : '22.0ºC',
            laudo_fabricante_anexo: true,
            status_conferencia: 'CONFORME'
          }
        ]
      };

      pedidosCompraDB.unshift(novoPdc);

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'operador@hospital360.com.br',
        perfil_ativo: body.perfil_ativo || 'compras_operador',
        acao: 'emissao_empenho_digital',
        entidade: 'pedidos_empenho_ata',
        descricao: `Empenho ${numeroEmpenho} e Pedido ${numeroPdc} emitidos para ${orgao_demandante}: ${quantidade_empenho} ${item.unidade_fornecimento} de ${item.descricao_medicamento} (R$ ${valorEmpenho.toFixed(2)}).`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        numero_empenho: numeroEmpenho,
        numero_pdc: numeroPdc,
        orgao_demandante,
        tipo_adesao,
        quantidade_empenhada: quantidade_empenho,
        valor_total_empenho: valorEmpenho,
        novo_saldo_item: item.quantidade_saldo,
        mensagem: 'Empenho digital emitido com sucesso e transmitido ao módulo de Estoque Central WMS.'
      });
    }

    // Ação 3: Confirmar Entrega / Recebimento Provisório (Art. 140 Lei 14.133/21)
    if (acao === 'confirmar_entrega_pdc') {
      const { pdc_id, fiscal_nome, fiscal_cargo, tipo_recebimento, observacoes } = body;
      const pdc = pedidosCompraDB.find(p => p.id === pdc_id || p.numero_pdc === pdc_id);

      if (!pdc) {
        return NextResponse.json({ success: false, error: 'Pedido de Compra não localizado.' }, { status: 404 });
      }

      pdc.status = tipo_recebimento === 'definitivo' ? 'RECEBIDO_DEFINITIVO' : 'RECEBIDO_PROVISORIO';
      pdc.recebimento = {
        fiscal_nome: fiscal_nome || 'Fiscal do Contrato',
        fiscal_cargo: fiscal_cargo || 'Farmacêutico / Fiscal Técnico',
        data_recebimento: new Date().toISOString().replace('T', ' ').substring(0, 19),
        tipo_recebimento: tipo_recebimento || 'provisorio',
        termo_recebimento_numero: `TRP-2026/${Math.floor(1000 + Math.random() * 9000)}`,
        observacoes: observacoes || 'Recebimento efetuado em conformidade com as especificações do edital e temperatura adequada.',
        encaminhado_wms: true
      };

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'fiscal@hospital360.com.br',
        perfil_ativo: body.perfil_ativo || 'compras_admin',
        acao: 'confirmacao_entrega_pdc',
        entidade: 'pedidos_compra_entrega',
        descricao: `Recebimento Provisório confirmado para ${pdc.numero_pdc} (DANFE nº ${pdc.nota_fiscal.numero}). Termo gerado: ${pdc.recebimento.termo_recebimento_numero}. Lote encaminhado ao Almoxarifado Central WMS.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        pdc,
        mensagem: `Entrega do ${pdc.numero_pdc} confirmada com sucesso! Lote liberado para quarentena técnica do Farmacêutico RT no Módulo 02 (Estoque Central WMS).`
      });
    }

    // Ação 4: Recusar Entrega
    if (acao === 'recusar_entrega_pdc') {
      const { pdc_id, motivo_recusa } = body;
      const pdc = pedidosCompraDB.find(p => p.id === pdc_id || p.numero_pdc === pdc_id);

      if (!pdc) {
        return NextResponse.json({ success: false, error: 'Pedido de Compra não localizado.' }, { status: 404 });
      }

      pdc.status = 'RECUSADO';

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'fiscal@hospital360.com.br',
        perfil_ativo: body.perfil_ativo || 'compras_admin',
        acao: 'recusa_entrega_pdc',
        entidade: 'pedidos_compra_entrega',
        descricao: `Recusa formal de entrega do ${pdc.numero_pdc}. Motivo: ${motivo_recusa || 'Desconformidade física ou excursão térmica'}. Notificação ao fornecedor acionada.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        pdc,
        mensagem: `Carga do ${pdc.numero_pdc} recusada. Notificação formal gerada com registro no livro de ocorrências.`
      });
    }

    // Ação 5: Abrir Chamado
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

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'usuario@hospital360.com.br',
        perfil_ativo: novoChamado.autor_perfil,
        acao: 'abertura_chamado',
        entidade: 'chamados_modulos',
        descricao: `Chamado ${novoChamado.protocolo} aberto: "${novoChamado.titulo}" [${novoChamado.prioridade.toUpperCase()}].`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({ success: true, chamado: novoChamado });
    }

    // Ação 6: Registrar Ocorrência
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

      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: body.usuario_email || 'operador@hospital360.com.br',
        perfil_ativo: novaOcorrencia.autor_perfil,
        acao: 'registro_livro_ocorrencias',
        entidade: 'livro_ocorrencias_modulos',
        descricao: `Ocorrência registrada por ${novaOcorrencia.autor_nome}: "${novaOcorrencia.relato.substring(0, 60)}..."`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({ success: true, ocorrencia: novaOcorrencia });
    }

    return NextResponse.json({ success: false, error: 'Ação não reconhecida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
