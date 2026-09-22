import { NextResponse } from 'next/server';
import { validateMedicinePrice, CmedValidationInput } from '../../../lib/compras/cmedValidator';

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

// Armazenamento em memória com sementes reais enriquecidas
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

let chamadosDB: ChamadoModulo[] = [
  {
    id: 'chm-001',
    protocolo: 'CHM-COMPRAS-2026-004',
    modulo_origem: 'compras-publicas',
    setor: 'Coordenação de Licitações',
    titulo: 'Divergência de lote na entrega de Meropenem 1g',
    descricao: 'Fornecedor entregou lote 8829 com prazo de validade inferior a 12 meses, violando termo de referência da ARP-2026/042.',
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
    entidade: 'itens_ata_registro_precos',
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

  // Consolidação de métricas
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
    metricas: {
      total_atas_vigentes: totalAtas,
      total_itens_registrados: totalItens,
      valor_total_atas: valorTotalAtas,
      valor_executado_empenhos: valorTotalConsumido,
      economia_gerada_cmed_reais: economiaGlobalReais,
      economia_media_cmed_pct: economiaMediaPct,
      pedidos_empenho_totais: 142,
      travas_sobrepreco_evitadas: 6
    },
    chamados_recentes: chamadosDB.slice(0, 3),
    ocorrencias_recentes: ocorrenciasDB.slice(0, 3),
    logs_recentes: logsDB.slice(0, 5)
  });
}

// 2. POST: Processamento de ações do módulo compras
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { acao } = body;

    // Ação 1: Validar Preço CMED/BPS/CATMAT
    if (acao === 'validar_preco') {
      const input: CmedValidationInput = {
        codigo_catmat: body.codigo_catmat,
        nome_medicamento: body.nome_medicamento || 'Medicamento Sob Análise',
        principio_ativo: body.principio_ativo || 'Princípio Ativo',
        preco_proposto: Number(body.preco_proposto),
        fornecedor_cnpj: body.fornecedor_cnpj || '00.000.000/0001-00',
        fornecedor_razao_social: body.fornecedor_razao_social || 'Proponente Comercial',
        usuario_email: body.usuario_email || 'auditor@hospital360.com.br',
        perfil_ativo: body.perfil_ativo || 'compras_auditor_cmed'
      };

      const resultado = validateMedicinePrice(input);

      // Grava log da validação
      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: input.usuario_email!,
        perfil_ativo: input.perfil_ativo!,
        acao: 'validacao_cmed_executada',
        entidade: 'cmed_bps_catmat_validator',
        descricao: `Validação executada para ${input.codigo_catmat}: Preço R$ ${input.preco_proposto.toFixed(2)} resultou em status ${resultado.validation.status}.`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({ success: true, resultado });
    }

    // Ação 2: Emitir Empenho com Travas da Lei 14.133/21
    if (acao === 'emitir_empenho') {
      const { ata_id, item_id, quantidade_empenho, orgao_demandante, tipo_adesao, usuario_email, perfil_ativo } = body;

      const ata = atasDB.find(a => a.id === ata_id);
      if (!ata) {
        return NextResponse.json({ success: false, error: 'Ata de Registro de Preços não encontrada.' }, { status: 404 });
      }

      const item = ata.itens.find(i => i.id === item_id);
      if (!item) {
        return NextResponse.json({ success: false, error: 'Item de ata não encontrado.' }, { status: 404 });
      }

      const qtd = Number(quantidade_empenho);

      // Trava de Saldo
      if (qtd > item.quantidade_saldo) {
        return NextResponse.json({
          success: false,
          error: `Quantidade solicitada (${qtd}) excede o saldo remanescente disponível (${item.quantidade_saldo} ${item.unidade_fornecimento}).`
        }, { status: 400 });
      }

      // Trava de Carona (Art. 86 da Lei 14.133/21: máx 50% por item para caronas)
      if (tipo_adesao === 'CARONA_ADESAO') {
        const limiteCaronaItem = Math.floor(item.quantidade_total * 0.50);
        if (qtd > limiteCaronaItem) {
          return NextResponse.json({
            success: false,
            error: `Trava Lei 14.133/21 violada: Órgãos não-participantes (carona) não podem solicitar mais de 50% do item (${limiteCaronaItem} ${item.unidade_fornecimento}). Solicitado: ${qtd}.`
          }, { status: 400 });
        }
      }

      // Baixa do saldo atômica
      item.quantidade_consumida += qtd;
      item.quantidade_saldo -= qtd;

      const valorEmpenho = Number((qtd * item.preco_homologado).toFixed(2));
      const numeroEmpenho = `EMP-2026/${Math.floor(100000 + Math.random() * 900000)}`;

      // Grava log de auditoria
      logsDB.unshift({
        id: `log-${Date.now()}`,
        modulo: 'compras-publicas',
        usuario_email: usuario_email || 'operador@hospital360.com.br',
        perfil_ativo: perfil_ativo || 'compras_operador',
        acao: 'emissao_empenho_digital',
        entidade: 'pedidos_empenho_ata',
        descricao: `Empenho ${numeroEmpenho} emitido para ${orgao_demandante}: ${qtd} ${item.unidade_fornecimento} de ${item.descricao_medicamento} (Total: R$ ${valorEmpenho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({
        success: true,
        numero_empenho: numeroEmpenho,
        orgao_demandante,
        tipo_adesao,
        quantidade_empenhada: qtd,
        valor_total_empenho: valorEmpenho,
        novo_saldo_item: item.quantidade_saldo,
        mensagem: 'Empenho digital emitido com sucesso e transmitido ao módulo de Estoque Central WMS.'
      });
    }

    // Ação 3: Abrir Chamado no Módulo Compras
    if (acao === 'abrir_chamado') {
      const novoChamado: ChamadoModulo = {
        id: `chm-${Date.now()}`,
        protocolo: `CHM-COMPRAS-2026-${Math.floor(100 + Math.random() * 900)}`,
        modulo_origem: 'compras-publicas',
        setor: body.setor || 'Setor de Compras / Licitações',
        titulo: body.titulo,
        descricao: body.descricao,
        prioridade: body.prioridade || 'media',
        status: 'aberto',
        autor_nome: body.autor_nome || 'Usuário do Sistema',
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
        descricao: `Chamado ${novoChamado.protocolo} aberto: "${novoChamado.titulo}" [Prioridade: ${novoChamado.prioridade.toUpperCase()}].`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({ success: true, chamado: novoChamado });
    }

    // Ação 4: Registrar Ocorrência no Livro Digital de Compras
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
        descricao: `Ocorrência registrada por ${novaOcorrencia.autor_nome} no turno ${novaOcorrencia.turno}: "${novaOcorrencia.relato.substring(0, 60)}..."`,
        data_hora: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });

      return NextResponse.json({ success: true, ocorrencia: novaOcorrencia });
    }

    return NextResponse.json({ success: false, error: 'Ação não reconhecida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
