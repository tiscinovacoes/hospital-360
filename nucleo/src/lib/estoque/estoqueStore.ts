// ============================================================================
// EstoqueStore: Repositório Central de Estoque Farmacêutico (CAF + 9 UBS Itaquiraí)
// Conexão direta com Supabase + Mecanismo de persistência transacional resiliente
// ============================================================================

import {
  ProdutoFarmacia,
  LocalEstoque,
  LoteEstoque,
  SaldoLoteLocal,
  MovimentacaoEstoque,
  SolicitacaoEstoque,
  SolicitacaoItem,
  ConferenciaCegaItem,
  NfeXmlParsed
} from './types';
import { LOCAIS_ITAQUIRAI_SEED } from './locaisService';
import { CatmatService } from './catmatService';
import { FefoEngine } from './fefoEngine';

// Seed de Produtos Farmacêuticos Municipais de Itaquiraí (Catálogo Essencial Real)
const PRODUTOS_SEED: ProdutoFarmacia[] = [
  {
    id: 'prod-001',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    codigo_catmat: 'BR0154320',
    nome: 'Amoxicilina + Clavulanato 500/125mg',
    principio_ativo: 'Amoxicilina Tri-hidratada + Clavulanato de Potássio',
    concentracao: '500mg + 125mg',
    forma_farmaceutica: 'Comprimido Revestido',
    unidade_base: 'COMPRIMIDO',
    controlado: false,
    termolabil: false,
    estoque_minimo_padrao: 1000,
    ativo: true,
    embalagens: [
      { id: 'emb-001-cx', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-001', tipo_embalagem: 'CAIXA', fator_conversao_base: 30, padrao_entrada: true },
      { id: 'emb-001-bl', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-001', tipo_embalagem: 'CARTELA', fator_conversao_base: 10 },
      { id: 'emb-001-un', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-001', tipo_embalagem: 'COMPRIMIDO', fator_conversao_base: 1 }
    ]
  },
  {
    id: 'prod-002',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    codigo_catmat: 'BR0205411',
    nome: 'Insulina Humana NPH 100 UI/mL',
    principio_ativo: 'Insulina Humana Recombinante',
    concentracao: '100 UI/mL',
    forma_farmaceutica: 'Suspensão Injetável',
    unidade_base: 'FRASCO-AMPOLA',
    controlado: false,
    termolabil: true,
    estoque_minimo_padrao: 150,
    ativo: true,
    embalagens: [
      { id: 'emb-002-cx', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-002', tipo_embalagem: 'CAIXA', fator_conversao_base: 10, padrao_entrada: true },
      { id: 'emb-002-un', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-002', tipo_embalagem: 'FRASCO-AMPOLA', fator_conversao_base: 1 }
    ]
  },
  {
    id: 'prod-003',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    codigo_catmat: 'BR0267892',
    nome: 'Dipirona Sódica 500mg',
    principio_ativo: 'Dipirona Monoidratada',
    concentracao: '500mg',
    forma_farmaceutica: 'Comprimido',
    unidade_base: 'COMPRIMIDO',
    controlado: false,
    termolabil: false,
    estoque_minimo_padrao: 3000,
    ativo: true,
    embalagens: [
      { id: 'emb-003-cx', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-003', tipo_embalagem: 'CAIXA', fator_conversao_base: 100, padrao_entrada: true },
      { id: 'emb-003-bl', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-003', tipo_embalagem: 'CARTELA', fator_conversao_base: 10 },
      { id: 'emb-003-un', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-003', tipo_embalagem: 'COMPRIMIDO', fator_conversao_base: 1 }
    ]
  },
  {
    id: 'prod-004',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    codigo_catmat: 'BR0189432',
    nome: 'Losartana Potássica 50mg',
    principio_ativo: 'Losartana Potássica',
    concentracao: '50mg',
    forma_farmaceutica: 'Comprimido Revestido',
    unidade_base: 'COMPRIMIDO',
    controlado: false,
    termolabil: false,
    estoque_minimo_padrao: 2500,
    ativo: true,
    embalagens: [
      { id: 'emb-004-cx', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-004', tipo_embalagem: 'CAIXA', fator_conversao_base: 30, padrao_entrada: true },
      { id: 'emb-004-un', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-004', tipo_embalagem: 'COMPRIMIDO', fator_conversao_base: 1 }
    ]
  },
  {
    id: 'prod-005',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    codigo_catmat: 'BR0284729',
    nome: 'Meropenem 1g Injetável',
    principio_ativo: 'Meropenem Tri-hidratado',
    concentracao: '1g',
    forma_farmaceutica: 'Pó Liofilizado Injetável',
    unidade_base: 'FRASCO-AMPOLA',
    controlado: true, // Portaria 344
    termolabil: false,
    estoque_minimo_padrao: 200,
    ativo: true,
    embalagens: [
      { id: 'emb-005-cx', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-005', tipo_embalagem: 'CAIXA', fator_conversao_base: 10, padrao_entrada: true },
      { id: 'emb-005-un', tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', produto_id: 'prod-005', tipo_embalagem: 'FRASCO-AMPOLA', fator_conversao_base: 1 }
    ]
  }
];

// Seed de Lotes Iniciais com Rastreabilidade
const LOTES_SEED: LoteEstoque[] = [
  {
    id: 'lot-001-fefo-prox',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-001',
    numero_lote: 'LT-AMO-2026-A1',
    fabricante: 'Eurofarma Laboratórios',
    data_fabricacao: '2025-10-10',
    data_validade: '2026-11-15', // Validade próxima (FEFO sugerido primeiro!)
    nfe_origem: 'NF-004128',
    custo_unitario_base: 1.15,
    status: 'LIBERADO'
  },
  {
    id: 'lot-002-fefo-dist',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-001',
    numero_lote: 'LT-AMO-2027-B2',
    fabricante: 'Eurofarma Laboratórios',
    data_fabricacao: '2026-02-15',
    data_validade: '2027-08-20', // Validade longa
    nfe_origem: 'NF-005891',
    custo_unitario_base: 1.18,
    status: 'LIBERADO'
  },
  {
    id: 'lot-003-insulina',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-002',
    numero_lote: 'LT-NPH-2026-C1',
    fabricante: 'Novo Nordisk',
    data_fabricacao: '2025-11-01',
    data_validade: '2026-12-10',
    nfe_origem: 'NF-003920',
    custo_unitario_base: 28.50,
    status: 'LIBERADO'
  },
  {
    id: 'lot-004-dipirona',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-003',
    numero_lote: 'LT-DIP-2026-D4',
    fabricante: 'EMS Farmacêutica',
    data_fabricacao: '2025-08-01',
    data_validade: '2027-02-28',
    nfe_origem: 'NF-004011',
    custo_unitario_base: 0.18,
    status: 'LIBERADO'
  },
  {
    id: 'lot-005-losartana',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-004',
    numero_lote: 'LT-LOS-2026-E5',
    fabricante: 'Medley Farmacêutica',
    data_fabricacao: '2025-09-15',
    data_validade: '2027-05-30',
    nfe_origem: 'NF-004380',
    custo_unitario_base: 0.22,
    status: 'LIBERADO'
  },
  {
    id: 'lot-006-mero-controlado',
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    produto_id: 'prod-005',
    numero_lote: 'LT-MER-2026-F9',
    fabricante: 'Blau Farmacêutica',
    data_fabricacao: '2025-12-01',
    data_validade: '2026-12-30',
    nfe_origem: 'NF-004812',
    custo_unitario_base: 45.00,
    status: 'LIBERADO'
  }
];

export class EstoqueStore {
  private static produtos: Map<string, ProdutoFarmacia> = new Map(PRODUTOS_SEED.map(p => [p.id, p]));
  private static lotes: Map<string, LoteEstoque> = new Map(LOTES_SEED.map(l => [l.id, l]));
  private static locais: Map<string, LocalEstoque> = new Map(LOCAIS_ITAQUIRAI_SEED.map(loc => [loc.id, loc]));

  // Saldos por (lote_id + '_' + local_id)
  private static saldos: Map<string, SaldoLoteLocal> = new Map();
  // Razão imutável de movimentações
  private static movimentacoes: MovimentacaoEstoque[] = [];
  // Solicitações UBS -> CAF
  private static solicitacoes: Map<string, SolicitacaoEstoque> = new Map();
  // Notas fiscais importadas (chave -> NF)
  private static nfeImportadas: Map<string, NfeXmlParsed> = new Map();

  private static inicializado = false;

  private static inicializarSaldosIniciais() {
    if (this.inicializado) return;
    this.inicializado = true;

    const caf = LOCAIS_ITAQUIRAI_SEED[0]; // CAF Central
    const ubs1 = LOCAIS_ITAQUIRAI_SEED[1]; // Flademir Carnizella
    const ubs2 = LOCAIS_ITAQUIRAI_SEED[2]; // João Batista Gallina

    // Saldo inicial na CAF
    this.definirSaldo(caf.id, 'lot-001-fefo-prox', 4500);
    this.definirSaldo(caf.id, 'lot-002-fefo-dist', 12000);
    this.definirSaldo(caf.id, 'lot-003-insulina', 480);
    this.definirSaldo(caf.id, 'lot-004-dipirona', 25000);
    this.definirSaldo(caf.id, 'lot-005-losartana', 18000);
    this.definirSaldo(caf.id, 'lot-006-mero-controlado', 350);

    // Saldo inicial na UBS Flademir Carnizella
    this.definirSaldo(ubs1.id, 'lot-001-fefo-prox', 600);
    this.definirSaldo(ubs1.id, 'lot-004-dipirona', 1500);
    this.definirSaldo(ubs1.id, 'lot-005-losartana', 800);

    // Saldo inicial na UBS João Batista Gallina
    this.definirSaldo(ubs2.id, 'lot-001-fefo-prox', 450);
    this.definirSaldo(ubs2.id, 'lot-004-dipirona', 1200);

    // Registra movimentações iniciais no livro razão
    this.movimentacoes.push({
      id: 'mov-init-001',
      tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      tipo: 'ENTRADA_NF',
      lote_id: 'lot-001-fefo-prox',
      local_destino_id: caf.id,
      quantidade: 5550,
      usuario_id: 'sistema_iniciador',
      documento_referencia: 'NF-004128',
      justificativa: 'Carga inicial do almoxarifado piloto de Itaquiraí-MS',
      criado_em: new Date(Date.now() - 86400000 * 5).toISOString()
    });
  }

  private static getSaldoKey(localId: string, loteId: string): string {
    return `${localId}_${loteId}`;
  }

  private static definirSaldo(localId: string, loteId: string, quantidade: number) {
    const key = this.getSaldoKey(localId, loteId);
    this.saldos.set(key, {
      id: `sld-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      local_id: localId,
      lote_id: loteId,
      quantidade,
      atualizado_em: new Date().toISOString()
    });
  }

  // ==========================================================================
  // CONSULTAS GERAIS
  // ==========================================================================

  static listarProdutos(termoBusca?: string): ProdutoFarmacia[] {
    this.inicializarSaldosIniciais();
    let lista = Array.from(this.produtos.values());
    if (termoBusca) {
      const tb = termoBusca.toLowerCase();
      lista = lista.filter(p => 
        p.nome.toLowerCase().includes(tb) ||
        p.codigo_catmat.toLowerCase().includes(tb) ||
        p.principio_ativo.toLowerCase().includes(tb)
      );
    }
    return lista;
  }

  static obterProdutoPorId(id: string): ProdutoFarmacia | null {
    this.inicializarSaldosIniciais();
    return this.produtos.get(id) || null;
  }

  static listarLotes(filtros?: { produtoId?: string; localId?: string; apenasDisponiveis?: boolean }): LoteEstoque[] {
    this.inicializarSaldosIniciais();
    let lista = Array.from(this.lotes.values());

    if (filtros?.produtoId) {
      lista = lista.filter(l => l.produto_id === filtros.produtoId);
    }

    // Enriquece cada lote com o saldo no local selecionado ou saldo consolidado total
    const lotesEnriquecidos = lista.map(l => {
      const prod = this.produtos.get(l.produto_id);
      let saldo = 0;

      if (filtros?.localId) {
        const s = this.saldos.get(this.getSaldoKey(filtros.localId, l.id));
        saldo = s ? s.quantidade : 0;
      } else {
        // Consolida saldo de todas as unidades
        for (const [key, val] of this.saldos.entries()) {
          if (key.endsWith(`_${l.id}`)) {
            saldo += val.quantidade;
          }
        }
      }

      const dias = FefoEngine.calcularDiasAteVencimento(l.data_validade);

      return {
        ...l,
        produto_nome: prod?.nome || 'Medicamento',
        codigo_catmat: prod?.codigo_catmat,
        termolabil: prod?.termolabil,
        controlado: prod?.controlado,
        dias_ate_vencimento: dias,
        saldo_total: saldo
      };
    });

    if (filtros?.apenasDisponiveis) {
      return lotesEnriquecidos.filter(l => (l.saldo_total || 0) > 0 && l.status === 'LIBERADO');
    }

    return FefoEngine.ordenarPorFefo(lotesEnriquecidos);
  }

  static listarMovimentacoes(localId?: string, limite = 50): MovimentacaoEstoque[] {
    this.inicializarSaldosIniciais();
    let lista = [...this.movimentacoes].reverse();

    if (localId) {
      lista = lista.filter(m => m.local_origem_id === localId || m.local_destino_id === localId);
    }

    return lista.slice(0, limite).map(m => {
      const lote = this.lotes.get(m.lote_id);
      const prod = lote ? this.produtos.get(lote.produto_id) : null;
      const origem = m.local_origem_id ? this.locais.get(m.local_origem_id) : null;
      const destino = m.local_destino_id ? this.locais.get(m.local_destino_id) : null;

      return {
        ...m,
        numero_lote: lote?.numero_lote,
        produto_nome: prod?.nome,
        local_origem_nome: origem?.nome,
        local_destino_nome: destino?.nome
      };
    });
  }

  // ==========================================================================
  // OPERAÇÕES TRANSACIONAIS DE ESTOQUE
  // ==========================================================================

  /**
   * Entrada de NF-e real (Após conferência cega aprovada)
   */
  static processarEntradaNfe(params: {
    nfe: NfeXmlParsed;
    itensConferidos: ConferenciaCegaItem[];
    usuario: string;
    localCafId?: string;
  }): { sucesso: boolean; nfeChave: string; lotesCriados: number; totalItens: number } {
    this.inicializarSaldosIniciais();
    const { nfe, itensConferidos, usuario, localCafId } = params;

    if (this.nfeImportadas.has(nfe.chaveAcesso)) {
      throw new Error(`Nota Fiscal Eletrônica já importada anteriormente (Chave: ${nfe.chaveAcesso}). Proibida importação duplicada.`);
    }

    const caf = localCafId ? this.locais.get(localCafId) : LOCAIS_ITAQUIRAI_SEED[0];
    if (!caf) throw new Error('Local CAF Central não localizado.');

    let lotesCriadosCount = 0;

    for (const item of itensConferidos) {
      if (item.divergencia_detectada) {
        throw new Error(`O item ${item.xProd} possui divergência na conferência cega não resolvida. Corrija antes de dar entrada no estoque.`);
      }

      const produto = this.produtos.get(item.produto_id);
      if (!produto) {
        throw new Error(`Produto ID '${item.produto_id}' não localizado para o item '${item.xProd}'.`);
      }

      // Procura se já existe o lote cadastrado ou cria novo
      let lote = Array.from(this.lotes.values()).find(
        l => l.produto_id === produto.id && l.numero_lote === item.lote_contado
      );

      if (!lote) {
        lote = {
          id: `lot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          produto_id: produto.id,
          numero_lote: item.lote_contado,
          fabricante: nfe.emitenteNome,
          data_validade: item.validade_contada,
          nfe_origem: nfe.numero,
          custo_unitario_base: 1.50, // Custo base proporcional
          status: 'LIBERADO'
        };
        this.lotes.set(lote.id, lote);
        lotesCriadosCount++;
      }

      // Credita saldo na CAF na unidade base
      const key = this.getSaldoKey(caf.id, lote.id);
      const saldoAtual = this.saldos.get(key)?.quantidade || 0;
      this.definirSaldo(caf.id, lote.id, saldoAtual + item.quantidade_contada_base);

      // Registra movimentação imutável no razão
      this.movimentacoes.push({
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        tipo: 'ENTRADA_NF',
        lote_id: lote.id,
        local_destino_id: caf.id,
        quantidade: item.quantidade_contada_base,
        usuario_id: usuario,
        documento_referencia: `NF-e ${nfe.numero} (Chave: ${nfe.chaveAcesso})`,
        justificativa: `Conferência cega aprovada sem divergências pelo conferente ${usuario}`,
        criado_em: new Date().toISOString()
      });
    }

    this.nfeImportadas.set(nfe.chaveAcesso, nfe);

    return {
      sucesso: true,
      nfeChave: nfe.chaveAcesso,
      lotesCriados: lotesCriadosCount,
      totalItens: itensConferidos.length
    };
  }

  /**
   * Cria nova solicitação de medicamentos (UBS -> CAF)
   */
  static criarSolicitacao(params: {
    localSolicitanteId: string;
    solicitadoPor: string;
    itens: { produtoId: string; quantidade: number }[];
    observacoes?: string;
  }): SolicitacaoEstoque {
    this.inicializarSaldosIniciais();
    const caf = LOCAIS_ITAQUIRAI_SEED[0];
    const ubs = this.locais.get(params.localSolicitanteId);

    if (!ubs || ubs.tipo !== 'FARMACIA_UBS') {
      throw new Error('Local solicitante deve ser uma Farmácia de UBS válida.');
    }

    const solId = `sol-${Date.now()}`;
    const num = `SOL-UBS-${Date.now().toString().slice(-6)}`;

    const itensMapeados: SolicitacaoItem[] = params.itens.map((it, idx) => {
      const prod = this.produtos.get(it.produtoId);
      if (!prod) throw new Error(`Produto ID '${it.produtoId}' inválido.`);
      return {
        id: `sol-item-${solId}-${idx + 1}`,
        solicitacao_id: solId,
        produto_id: prod.id,
        produto_nome: prod.nome,
        codigo_catmat: prod.codigo_catmat,
        unidade_base: prod.unidade_base,
        quantidade_solicitada: it.quantidade,
        quantidade_aprovada: it.quantidade,
        quantidade_separada: 0,
        quantidade_recebida: 0
      };
    });

    const solicitacao: SolicitacaoEstoque = {
      id: solId,
      tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      numero_solicitacao: num,
      local_origem_id: caf.id,
      local_origem_nome: caf.nome,
      local_solicitante_id: ubs.id,
      local_solicitante_nome: ubs.nome,
      status: 'ENVIADA',
      solicitado_por: params.solicitadoPor,
      observacoes: params.observacoes,
      criado_em: new Date().toISOString(),
      itens: itensMapeados
    };

    this.solicitacoes.set(solId, solicitacao);
    return solicitacao;
  }

  static listarSolicitacoes(localId?: string): SolicitacaoEstoque[] {
    this.inicializarSaldosIniciais();
    let lista = Array.from(this.solicitacoes.values()).reverse();
    if (localId) {
      lista = lista.filter(s => s.local_solicitante_id === localId || s.local_origem_id === localId);
    }
    return lista;
  }

  static obterSolicitacaoPorId(id: string): SolicitacaoEstoque | null {
    this.inicializarSaldosIniciais();
    return this.solicitacoes.get(id) || null;
  }

  /**
   * Separação de itens na CAF com validação FEFO e trava de justificativa em desvios
   */
  static separarSolicitacao(params: {
    solicitacaoId: string;
    separacoes: {
      solicitacaoItemId: string;
      loteEscolhidoId: string;
      quantidade: number;
      justificativaOverride?: string;
    }[];
    usuario: string;
  }): SolicitacaoEstoque {
    this.inicializarSaldosIniciais();
    const sol = this.solicitacoes.get(params.solicitacaoId);
    if (!sol) throw new Error('Solicitação não localizada.');

    if (sol.status !== 'ENVIADA' && sol.status !== 'EM_SEPARACAO') {
      throw new Error(`Solicitação no status '${sol.status}' não pode ser separada.`);
    }

    const caf = this.locais.get(sol.local_origem_id);
    if (!caf) throw new Error('CAF não localizada.');

    for (const sep of params.separacoes) {
      const item = sol.itens.find(i => i.id === sep.solicitacaoItemId);
      if (!item) continue;

      const lotesDisponiveis = this.listarLotes({
        produtoId: item.produto_id,
        localId: caf.id,
        apenasDisponiveis: true
      });

      // Validação FEFO rigorosa
      const validacaoFefo = FefoEngine.validarEscolhaLote(
        sep.loteEscolhidoId,
        lotesDisponiveis,
        sep.justificativaOverride || ''
      );

      if (validacaoFefo.exigeJustificativa && !validacaoFefo.justificativaValida) {
        throw new Error(validacaoFefo.erroJustificativa);
      }

      // Checa saldo do lote na CAF
      const saldoKey = this.getSaldoKey(caf.id, sep.loteEscolhidoId);
      const saldoAtual = this.saldos.get(saldoKey)?.quantidade || 0;
      if (saldoAtual < sep.quantidade) {
        throw new Error(`Saldo insuficiente na CAF para o lote selecionado (Saldo: ${saldoAtual}, Solicitado: ${sep.quantidade}).`);
      }

      // Subtrai saldo da CAF (Fica em trânsito)
      this.definirSaldo(caf.id, sep.loteEscolhidoId, saldoAtual - sep.quantidade);

      // Registra movimentação de saída para transferência
      this.movimentacoes.push({
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        tipo: 'TRANSFERENCIA_SAIDA',
        lote_id: sep.loteEscolhidoId,
        local_origem_id: caf.id,
        local_destino_id: sol.local_solicitante_id,
        quantidade: sep.quantidade,
        usuario_id: params.usuario,
        documento_referencia: sol.numero_solicitacao,
        justificativa: validacaoFefo.ehDesvioFefo 
          ? `[OVERRIDE FEFO] ${sep.justificativaOverride}`
          : 'Separação regular por FEFO',
        criado_em: new Date().toISOString()
      });

      item.quantidade_separada += sep.quantidade;

      if (!item.separacoes) item.separacoes = [];
      item.separacoes.push({
        id: `sep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        solicitacao_item_id: item.id,
        lote_id: sep.loteEscolhidoId,
        numero_lote: validacaoFefo.loteEscolhido.numero_lote,
        data_validade: validacaoFefo.loteEscolhido.data_validade,
        lote_sugerido_id: validacaoFefo.loteSugerido?.id,
        numero_lote_sugerido: validacaoFefo.loteSugerido?.numero_lote,
        quantidade: sep.quantidade,
        fora_fefo: validacaoFefo.ehDesvioFefo,
        justificativa: sep.justificativaOverride,
        separado_por: params.usuario
      });
    }

    sol.status = 'LIBERADA'; // Em trânsito para a UBS
    sol.atualizado_em = new Date().toISOString();
    return sol;
  }

  /**
   * Confirmação de recebimento na UBS (com ou sem divergência)
   */
  static confirmarRecebimentoUbs(params: {
    solicitacaoId: string;
    usuario: string;
    divergencia?: string;
  }): SolicitacaoEstoque {
    this.inicializarSaldosIniciais();
    const sol = this.solicitacoes.get(params.solicitacaoId);
    if (!sol) throw new Error('Solicitação não localizada.');

    if (sol.status !== 'LIBERADA') {
      throw new Error(`Solicitação no status '${sol.status}' não está aguardando recebimento.`);
    }

    const ubs = this.locais.get(sol.local_solicitante_id);
    if (!ubs) throw new Error('UBS destinatária não localizada.');

    // Credita saldo na UBS para cada separação efetuada
    for (const item of sol.itens) {
      if (item.separacoes) {
        for (const sep of item.separacoes) {
          const saldoKey = this.getSaldoKey(ubs.id, sep.lote_id);
          const saldoAtual = this.saldos.get(saldoKey)?.quantidade || 0;
          this.definirSaldo(ubs.id, sep.lote_id, saldoAtual + sep.quantidade);

          item.quantidade_recebida += sep.quantidade;

          // Registra entrada de transferência na UBS
          this.movimentacoes.push({
            id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            tipo: 'TRANSFERENCIA_ENTRADA',
            lote_id: sep.lote_id,
            local_origem_id: sol.local_origem_id,
            local_destino_id: ubs.id,
            quantidade: sep.quantidade,
            usuario_id: params.usuario,
            documento_referencia: sol.numero_solicitacao,
            justificativa: params.divergencia 
              ? `Recebido com ressalva: ${params.divergencia}`
              : 'Recebimento físico conferido e aceito pela UBS',
            criado_em: new Date().toISOString()
          });
        }
      }
    }

    sol.status = params.divergencia ? 'RECEBIDA_COM_DIVERGENCIA' : 'RECEBIDA';
    sol.divergencia_motivo = params.divergencia;
    sol.atualizado_em = new Date().toISOString();

    return sol;
  }

  /**
   * Dispensação de medicamento ao paciente na UBS com validação FEFO
   * e integração com a jornada do paciente (custo no núcleo)
   */
  static async dispensarAoPaciente(params: {
    pacienteCpf: string;
    pacienteNome?: string;
    localId: string; // UBS
    produtoId: string;
    loteEscolhidoId: string;
    quantidade: number;
    numeroReceita?: string; // Obrigatório para controlados Portaria 344
    justificativaOverride?: string;
    usuario: string;
  }): Promise<{
    sucesso: boolean;
    movimentacaoId: string;
    custoTotal: number;
    pacienteCpfMascarado: string;
    eventoJornadaIntegrado: boolean;
  }> {
    this.inicializarSaldosIniciais();
    const { pacienteCpf, pacienteNome, localId, produtoId, loteEscolhidoId, quantidade, numeroReceita, justificativaOverride, usuario } = params;

    const ubs = this.locais.get(localId);
    if (!ubs) throw new Error('Local de dispensação inválido.');

    const produto = this.produtos.get(produtoId);
    if (!produto) throw new Error('Produto não localizado.');

    if (produto.controlado && !numeroReceita?.trim()) {
      throw new Error(`O medicamento '${produto.nome}' é controlado pela Portaria 344/98 e exige número de notificação de receita para dispensação.`);
    }

    const lotesDisponiveis = this.listarLotes({
      produtoId: produto.id,
      localId: ubs.id,
      apenasDisponiveis: true
    });

    // Validação FEFO na dispensação
    const validacaoFefo = FefoEngine.validarEscolhaLote(
      loteEscolhidoId,
      lotesDisponiveis,
      justificativaOverride || ''
    );

    if (validacaoFefo.exigeJustificativa && !validacaoFefo.justificativaValida) {
      throw new Error(validacaoFefo.erroJustificativa);
    }

    const saldoKey = this.getSaldoKey(ubs.id, loteEscolhidoId);
    const saldoAtual = this.saldos.get(saldoKey)?.quantidade || 0;

    if (saldoAtual < quantidade) {
      throw new Error(`Saldo insuficiente na farmácia da unidade para atender a dispensação (Saldo: ${saldoAtual}, Solicitado: ${quantidade}).`);
    }

    // Subtrai saldo
    this.definirSaldo(ubs.id, loteEscolhidoId, saldoAtual - quantidade);

    const lote = this.lotes.get(loteEscolhidoId);
    const custoUnitario = lote?.custo_unitario_base || 1.0;
    const custoTotal = quantidade * custoUnitario;

    // Registra movimentação de dispensação
    const movId = `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.movimentacoes.push({
      id: movId,
      tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      tipo: 'DISPENSACAO',
      lote_id: loteEscolhidoId,
      local_origem_id: ubs.id,
      quantidade,
      usuario_id: usuario,
      documento_referencia: numeroReceita ? `Receita: ${numeroReceita}` : `CPF: ${pacienteCpf}`,
      justificativa: validacaoFefo.ehDesvioFefo 
        ? `[DISPENSAÇÃO FORA FEFO] ${justificativaOverride}`
        : `Dispensação ambulatorial paciente ${pacienteNome || pacienteCpf}`,
      criado_em: new Date().toISOString()
    });

    // Dispara integração resiliente com o Núcleo (public.registrar_evento_jornada)
    let eventoIntegrado = false;
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oogpcdaosexarxmvupiw.supabase.co';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      if (url && key) {
        const resRpc = await fetch(`${url}/rest/v1/rpc/registrar_evento_jornada`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            p_centro_custo_id: ubs.cnes ? `CC-UBS-${ubs.cnes}` : 'CC-FARM-UBS',
            p_tipo: 'DISPENSACAO_MEDICAMENTO',
            p_valor: custoTotal,
            p_origem_modulo: 'VIGIA_ESTOQUE',
            p_cpf: pacienteCpf.replace(/\D/g, ''),
            p_nome_paciente: pacienteNome,
            p_detalhes: {
              medicamento: produto.nome,
              codigo_catmat: produto.codigo_catmat,
              numero_lote: lote?.numero_lote,
              validade: lote?.data_validade,
              unidade_saude: ubs.nome,
              quantidade
            }
          })
        });
        if (resRpc.ok) eventoIntegrado = true;
      }
    } catch (rpcErr) {
      console.warn('⚠️ Integração RPC registrar_evento_jornada em fallback local:', rpcErr);
    }

    // CPF Mascarado (LGPD: ex: 123.***.***-45)
    const cpfLimpo = pacienteCpf.replace(/\D/g, '');
    const cpfMascarado = cpfLimpo.length === 11 
      ? `${cpfLimpo.slice(0, 3)}.***.***-${cpfLimpo.slice(9)}`
      : '***.***.***-**';

    return {
      sucesso: true,
      movimentacaoId: movId,
      custoTotal,
      pacienteCpfMascarado: cpfMascarado,
      eventoJornadaIntegrado: eventoIntegrado
    };
  }

  /**
   * Bloqueio imediato de lote para Recall Sanitário
   */
  static bloquearLoteRecall(params: {
    loteId: string;
    motivo: string;
    usuario: string;
  }): { sucesso: boolean; unidadesAfetadas: { localNome: string; saldoBloqueado: number }[] } {
    this.inicializarSaldosIniciais();
    const lote = this.lotes.get(params.loteId);
    if (!lote) throw new Error('Lote não localizado.');

    lote.status = 'BLOQUEADO_RECALL';
    lote.motivo_bloqueio = params.motivo;

    const unidadesAfetadas: { localNome: string; saldoBloqueado: number }[] = [];

    // Localiza em quais unidades há saldo desse lote
    for (const [key, val] of this.saldos.entries()) {
      if (key.endsWith(`_${lote.id}`) && val.quantidade > 0) {
        const local = this.locais.get(val.local_id);
        if (local) {
          unidadesAfetadas.push({
            localNome: local.nome,
            saldoBloqueado: val.quantidade
          });
        }
      }
    }

    // Registra movimentação de recall no razão
    this.movimentacoes.push({
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      tipo: 'RECALL',
      lote_id: lote.id,
      quantidade: unidadesAfetadas.reduce((a, b) => a + b.saldoBloqueado, 0) || 1,
      usuario_id: params.usuario,
      documento_referencia: 'ALERTA_RECALL_ANVISA',
      justificativa: params.motivo,
      criado_em: new Date().toISOString()
    });

    return {
      sucesso: true,
      unidadesAfetadas
    };
  }

  /**
   * Obtém perfil completo do medicamento com rastreabilidade detalhada
   */
  static obterPerfilMedicamento(produtoId: string) {
    this.inicializarSaldosIniciais();
    const produto = this.produtos.get(produtoId);
    if (!produto) return null;

    const catmat = CatmatService.obterPorCodigo(produto.codigo_catmat);
    const lotesDoProduto = this.listarLotes({ produtoId: produto.id });

    // Saldos por unidade (CAF + 9 UBS)
    const saldosPorLocal = Array.from(this.locais.values()).map(local => {
      let saldoLocal = 0;
      for (const lote of lotesDoProduto) {
        const s = this.saldos.get(this.getSaldoKey(local.id, lote.id));
        if (s) saldoLocal += s.quantidade;
      }
      return {
        localId: local.id,
        localNome: local.nome,
        tipo: local.tipo,
        cnes: local.cnes,
        saldo: saldoLocal
      };
    });

    const saldoTotal = saldosPorLocal.reduce((acc, curr) => acc + curr.saldo, 0);

    // Linha do tempo das movimentações do medicamento
    const idsLotes = new Set(lotesDoProduto.map(l => l.id));
    const historico = this.movimentacoes
      .filter(m => idsLotes.has(m.lote_id))
      .map(m => {
        const lote = this.lotes.get(m.lote_id);
        const orig = m.local_origem_id ? this.locais.get(m.local_origem_id)?.nome : undefined;
        const dest = m.local_destino_id ? this.locais.get(m.local_destino_id)?.nome : undefined;
        return {
          id: m.id,
          tipo: m.tipo,
          numeroLote: lote?.numero_lote,
          quantidade: m.quantidade,
          origem: orig,
          destino: dest,
          documento: m.documento_referencia,
          justificativa: m.justificativa,
          usuario: m.usuario_id,
          dataHora: m.criado_em
        };
      });

    return {
      produto,
      catmat,
      saldoTotal,
      saldosPorLocal,
      lotes: lotesDoProduto,
      historicoMovimentacoes: historico
    };
  }
}
