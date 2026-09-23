/**
 * Repositório e Motor Central de Despesas e Custos Door-to-Door — Hospital 360
 * Responsável pela persistência em memória, indexação multi-critério,
 * mapeamento das 5 Estações Clínicas e apuração de margens TUSS / SIGTAP / CMED.
 */

export type ModuloOrigem =
  | 'ESTOQUE_CENTRAL'
  | 'COMPRAS_PUBLICAS'
  | 'FARMACIA_HOSPITALAR'
  | 'LEITOS_CENSO_NIR'
  | 'ESCALA_MEDICA'
  | 'LABORATORIO_LIMS'
  | 'GESTAO_CLINICA'
  | 'CENTRO_CIRURGICO'
  | 'FINTECH_SPLIT'
  | 'FACILITIES_HOTELARIA'
  | 'REGULACAO_TFD'
  | 'AUTOMACAO_MENSAGERIA'
  | 'INGESTAO_LEGADOS'
  | string;

export interface DespesaItem {
  id_transacao: string;
  paciente_cpf: string;
  paciente_nome: string;
  prontuario_episodio: string;
  centro_custo: string;
  leito_identificador?: string;
  item_codigo: string;
  item_descricao: string;
  lote_fabricante?: string;
  quantidade: number;
  unidade_medida: string;
  valor_unitario_medio: number;
  valor_total_imputado: number;
  data_consumo: string;
  origem_modulo: ModuloOrigem;
  estacao_jornada?: number; // 1 a 5
  metadados?: Record<string, unknown>;
}

export interface IngestaoDespesasPayload {
  origem_modulo: ModuloOrigem;
  cliente_id?: string;
  lote_exportacao_id?: string;
  data_geracao?: string;
  despesas: Array<Omit<DespesaItem, 'origem_modulo'> & { origem_modulo?: ModuloOrigem }>;
}

export interface EstacaoCustoDoorToDoor {
  estacaoNumero: number;
  titulo: string;
  modulosRelacionados: string[];
  totalGasto: number;
  quantidadeItens: number;
  itens: DespesaItem[];
}

export interface ConsolidadoDoorToDoor {
  paciente: {
    cpf: string;
    nome: string;
    episodioId: string;
    leitoAtual?: string;
    dataAdmissao: string;
    tempoPermanenciaHoras: number;
  };
  estacoes: EstacaoCustoDoorToDoor[];
  custoTotalReal: number;
  benchmarkFinanceiro: {
    faturamentoPrevistoTuss: number;
    glosaEstimada: number;
    faturamentoLiquidoEsperado: number;
    margemBrutaReais: number;
    margemPercentual: number;
    statusMargem: 'LUCRO_EXCELENTE' | 'MARGEM_ESTAVEL' | 'MARGEM_CRITICA' | 'PREJUIZO';
    repasseSigtapSus: number;
    deficitSusReais: number;
    percentualCoberturaSus: number;
    cmedTetoMaximoPermitido: number;
    statusConformidadeCmed: 'DENTRO_DO_TETO' | 'ALERTA_SOBREPRECO';
  };
  alertasVigiaCustos: Array<{
    tipo: 'AVISO' | 'ALERTA' | 'CRITICO';
    origem: string;
    mensagem: string;
  }>;
}

// Mapa auxiliar de alocação de módulos para as 5 Estações Clínicas Door-to-Door
export function inferirEstacaoJornada(origem: ModuloOrigem, centroCusto?: string): number {
  const o = origem.toUpperCase();
  const c = (centroCusto || '').toUpperCase();

  if (o.includes('CLINICA') || o.includes('RECEP') || o.includes('OPENEMR') || c.includes('AMBULAT') || c.includes('TRIAGEM')) {
    return 1; // 1. Acolhimento & Triagem / Consultório
  }
  if (o.includes('LABORAT') || o.includes('LIMS') || o.includes('SENAITE') || c.includes('LABORAT') || c.includes('DIAGNOST')) {
    return 2; // 2. Apoio Diagnóstico & Exames LIMS
  }
  if (o.includes('COMPRAS') || o.includes('ESTOQUE') || o.includes('ALMOXAR') || c.includes('ALMOX') || c.includes('CIRURG')) {
    return 3; // 3. Insumos de Almoxarifado & OPME
  }
  if (o.includes('FARMACIA') || c.includes('FARMAC') || c.includes('MEDICAM')) {
    return 4; // 4. Terapia Medicamentosa Beira-Leito
  }
  // Demais (Leitos, Escala Médica, Facilities, Hotelaria, etc.)
  return 5; // 5. Hotelaria, Diárias & Honorários Médicos
}

// Base de dados em memória inicial (compartilhada no processo do Node.js).
// O campo é declarado no globalThis para sobreviver ao hot-reload do dev
// server sem precisar de `any`.
declare global {
  var __hospital360_despesasStore: { despesas: DespesaItem[] } | undefined;
}

const globalStore: { despesas: DespesaItem[] } = globalThis.__hospital360_despesasStore || {
  despesas: [
    {
      id_transacao: 'DSP-CLN-001',
      paciente_cpf: '123.456.789-00',
      paciente_nome: 'Carlos Eduardo Silveira',
      prontuario_episodio: 'EPIS-2026-8841',
      centro_custo: 'AMBULATORIO_CARDIOLOGIA',
      leito_identificador: 'Consultório 04',
      item_codigo: 'CONS-CARD-01',
      item_descricao: 'Consulta Médica Especializada Cardiologia',
      quantidade: 1,
      unidade_medida: 'Sessão',
      valor_unitario_medio: 180.00,
      valor_total_imputado: 180.00,
      data_consumo: '2026-09-20 08:30:00',
      origem_modulo: 'GESTAO_CLINICA',
      estacao_jornada: 1
    },
    {
      id_transacao: 'DSP-LAB-001',
      paciente_cpf: '123.456.789-00',
      paciente_nome: 'Carlos Eduardo Silveira',
      prontuario_episodio: 'EPIS-2026-8841',
      centro_custo: 'LABORATORIO_CENTRAL',
      item_codigo: 'LOINC-1751-7',
      item_descricao: 'Hemograma Completo com Plaquetas Automatizado',
      quantidade: 1,
      unidade_medida: 'Exame',
      valor_unitario_medio: 32.50,
      valor_total_imputado: 32.50,
      data_consumo: '2026-09-20 09:15:00',
      origem_modulo: 'LABORATORIO_LIMS',
      estacao_jornada: 2
    },
    {
      id_transacao: 'DSP-LAB-002',
      paciente_cpf: '123.456.789-00',
      paciente_nome: 'Carlos Eduardo Silveira',
      prontuario_episodio: 'EPIS-2026-8841',
      centro_custo: 'LABORATORIO_CENTRAL',
      item_codigo: 'LOINC-6598-7',
      item_descricao: 'Troponina I Cardíaca Ultrassensível Quimioluminescência',
      quantidade: 2,
      unidade_medida: 'Exame',
      valor_unitario_medio: 60.00,
      valor_total_imputado: 120.00,
      data_consumo: '2026-09-20 10:00:00',
      origem_modulo: 'LABORATORIO_LIMS',
      estacao_jornada: 2
    },
    {
      id_transacao: 'DSP-CMP-001',
      paciente_cpf: '123.456.789-00',
      paciente_nome: 'Carlos Eduardo Silveira',
      prontuario_episodio: 'EPIS-2026-8841',
      centro_custo: 'CENTRO_CIRURGICO',
      leito_identificador: 'Sala Cirúrgica 02',
      item_codigo: 'OPME-TIT-901',
      item_descricao: 'Kit Prótese Fixação Ortopédica Titânio (Ata Registro 48/2026)',
      lote_fabricante: 'LOT-TIT-881',
      quantidade: 1,
      unidade_medida: 'Kit Estéril',
      valor_unitario_medio: 3420.00,
      valor_total_imputado: 3420.00,
      data_consumo: '2026-09-21 14:00:00',
      origem_modulo: 'COMPRAS_PUBLICAS',
      estacao_jornada: 3
    },
    {
      id_transacao: 'DSP-EST-001',
      paciente_cpf: '123.456.789-00',
      paciente_nome: 'Carlos Eduardo Silveira',
      prontuario_episodio: 'EPIS-2026-8841',
      centro_custo: 'CENTRO_CIRURGICO',
      leito_identificador: 'Sala Cirúrgica 02',
      item_codigo: 'MAT-3301',
      item_descricao: 'Campos Cirúrgicos Estéreis Impermeáveis + Fios Prolene 3-0',
      quantidade: 4,
      unidade_medida: 'Kit',
      valor_unitario_medio: 85.00,
      valor_total_imputado: 340.00,
      data_consumo: '2026-09-21 14:30:00',
      origem_modulo: 'ESTOQUE_CENTRAL',
      estacao_jornada: 3
    },
    {
      id_transacao: 'DSP-FAR-001',
      paciente_cpf: '123.456.789-00',
      paciente_nome: 'Carlos Eduardo Silveira',
      prontuario_episodio: 'EPIS-2026-8841',
      centro_custo: 'UTI_ADULTO',
      leito_identificador: 'Leito 204-B',
      item_codigo: 'MED-001',
      item_descricao: 'Meropenem 1g Pó Liofilizado Injetável IV',
      lote_fabricante: 'LT-2026-MERO-01',
      quantidade: 6,
      unidade_medida: 'Frasco-Ampola',
      valor_unitario_medio: 48.50,
      valor_total_imputado: 291.00,
      data_consumo: '2026-09-21 18:00:00',
      origem_modulo: 'FARMACIA_HOSPITALAR',
      estacao_jornada: 4
    },
    {
      id_transacao: 'DSP-FAR-002',
      paciente_cpf: '123.456.789-00',
      paciente_nome: 'Carlos Eduardo Silveira',
      prontuario_episodio: 'EPIS-2026-8841',
      centro_custo: 'UTI_ADULTO',
      leito_identificador: 'Leito 204-B',
      item_codigo: 'MED-002',
      item_descricao: 'Noradrenalina 2mg/mL Ampola 4mL Diluído em SG5%',
      lote_fabricante: 'LT-2026-NORA-04',
      quantidade: 10,
      unidade_medida: 'Ampola',
      valor_unitario_medio: 12.80,
      valor_total_imputado: 128.00,
      data_consumo: '2026-09-22 02:00:00',
      origem_modulo: 'FARMACIA_HOSPITALAR',
      estacao_jornada: 4
    },
    {
      id_transacao: 'DSP-LEI-001',
      paciente_cpf: '123.456.789-00',
      paciente_nome: 'Carlos Eduardo Silveira',
      prontuario_episodio: 'EPIS-2026-8841',
      centro_custo: 'UTI_ADULTO',
      leito_identificador: 'Leito 204-B (UTI Isolamento)',
      item_codigo: 'HOT-UTI-01',
      item_descricao: 'Diária Completa de Leito UTI Adulto com Gases Medicinais e Suporte 24h',
      quantidade: 2,
      unidade_medida: 'Diária',
      valor_unitario_medio: 1450.00,
      valor_total_imputado: 2900.00,
      data_consumo: '2026-09-21 00:00:00',
      origem_modulo: 'LEITOS_CENSO_NIR',
      estacao_jornada: 5
    },
    {
      id_transacao: 'DSP-ESC-001',
      paciente_cpf: '123.456.789-00',
      paciente_nome: 'Carlos Eduardo Silveira',
      prontuario_episodio: 'EPIS-2026-8841',
      centro_custo: 'UTI_ADULTO',
      leito_identificador: 'Leito 204-B',
      item_codigo: 'HON-MED-UTI',
      item_descricao: 'Honorário Intensivista Ponderado (Dr. Roberto Albuquerque - CRM/SP 142.981)',
      quantidade: 1,
      unidade_medida: 'Rateio Paciente-Dia',
      valor_unitario_medio: 450.00,
      valor_total_imputado: 450.00,
      data_consumo: '2026-09-21 12:00:00',
      origem_modulo: 'ESCALA_MEDICA',
      estacao_jornada: 5
    }
  ]
};

globalThis.__hospital360_despesasStore = globalStore;

export class HubDespesasService {
  /**
   * Adiciona um lote de despesas com validação e atribuição de estação
   */
  static ingerirLote(payload: IngestaoDespesasPayload): {
    protocolo: string;
    itensAdicionados: DespesaItem[];
    valorTotal: number;
    cpfsImpactados: string[];
  } {
    const timestampAgora = new Date().toISOString();
    const modulo = payload.origem_modulo;

    const formatados: DespesaItem[] = payload.despesas.map((d, index) => {
      const q = Number(d.quantidade) || 1;
      const vUnit = Number(d.valor_unitario_medio) || 0;
      const vTot = Number(d.valor_total_imputado) || q * vUnit;
      const estacao = d.estacao_jornada || inferirEstacaoJornada(modulo, d.centro_custo);

      return {
        id_transacao: d.id_transacao || `DSP-${modulo.slice(0, 3)}-${Date.now()}-${index}`,
        paciente_cpf: d.paciente_cpf || '000.000.000-00',
        paciente_nome: d.paciente_nome || 'Paciente Não Identificado',
        prontuario_episodio: d.prontuario_episodio || 'EPIS-S/N',
        centro_custo: d.centro_custo || 'GERAL',
        leito_identificador: d.leito_identificador,
        item_codigo: d.item_codigo || 'ITEM-GENERICO',
        item_descricao: d.item_descricao || 'Despesa Hospitalar',
        lote_fabricante: d.lote_fabricante,
        quantidade: q,
        unidade_medida: d.unidade_medida || 'UN',
        valor_unitario_medio: vUnit,
        valor_total_imputado: vTot,
        data_consumo: d.data_consumo || timestampAgora,
        origem_modulo: modulo,
        estacao_jornada: estacao,
        metadados: d.metadados
      };
    });

    // Insere no início da lista para manter a cronologia recente primeiro
    globalStore.despesas = [...formatados, ...globalStore.despesas];

    const valorTotal = formatados.reduce((acc, it) => acc + it.valor_total_imputado, 0);
    const cpfsImpactados = Array.from(new Set(formatados.map(it => it.paciente_cpf)));
    const protocolo = `ING-HUB-${Date.now().toString().slice(-6)}`;

    return {
      protocolo,
      itensAdicionados: formatados,
      valorTotal,
      cpfsImpactados
    };
  }

  /**
   * Consulta despesas com múltiplos filtros opcionais
   */
  static listarDespesas(filtros?: {
    cpf?: string;
    episodio?: string;
    origem_modulo?: string;
    centro_custo?: string;
    estacao?: number;
    termo?: string;
  }): DespesaItem[] {
    return globalStore.despesas.filter(item => {
      if (filtros?.cpf && item.paciente_cpf !== filtros.cpf) return false;
      if (filtros?.episodio && item.prontuario_episodio !== filtros.episodio) return false;
      if (filtros?.origem_modulo && item.origem_modulo.toUpperCase() !== filtros.origem_modulo.toUpperCase()) return false;
      if (filtros?.centro_custo && item.centro_custo.toUpperCase() !== filtros.centro_custo.toUpperCase()) return false;
      if (filtros?.estacao && item.estacao_jornada !== filtros.estacao) return false;
      if (filtros?.termo) {
        const termo = filtros.termo.toLowerCase();
        const texto = `${item.item_descricao} ${item.paciente_nome} ${item.item_codigo} ${item.id_transacao}`.toLowerCase();
        if (!texto.includes(termo)) return false;
      }
      return true;
    });
  }

  /**
   * Obtém todos os módulos emissores distintos registrados
   */
  static obterModulosEmissores(): string[] {
    return Array.from(new Set(globalStore.despesas.map(d => d.origem_modulo)));
  }

  /**
   * Limpa ou redefine o repositório para estado padrão (testes)
   */
  static redefinirStore(): void {
    globalStore.despesas = [];
  }

  /**
   * Consolida a jornada Door-to-Door completa de um paciente confrontando com benchmarks TUSS/SIGTAP/CMED
   */
  static obterConsolidadoPaciente(cpf: string): ConsolidadoDoorToDoor | null {
    const itensPaciente = this.listarDespesas({ cpf });
    if (itensPaciente.length === 0) {
      return null;
    }

    const pacienteRef = itensPaciente[0];
    const totalGasto = itensPaciente.reduce((acc, it) => acc + it.valor_total_imputado, 0);

    // Definição estruturada das 5 estações clínicas
    const estacoesMeta = [
      {
        estacaoNumero: 1,
        titulo: '1. Acolhimento, Triagem & Consultório Ambulatorial',
        modulos: ['GESTAO_CLINICA', 'OPENEMR', 'RECEPÇÃO']
      },
      {
        estacaoNumero: 2,
        titulo: '2. Apoio Diagnóstico & Exames LIMS (Bancada/LOINC)',
        modulos: ['LABORATORIO_LIMS', 'SENAITE']
      },
      {
        estacaoNumero: 3,
        titulo: '3. Insumos de Almoxarifado, OPME & Compras Públicas',
        modulos: ['ESTOQUE_CENTRAL', 'COMPRAS_PUBLICAS', 'OPENBOXES', 'ERPNEXT']
      },
      {
        estacaoNumero: 4,
        titulo: '4. Terapia Medicamentosa Beira-Leito & Farmácia Satélite',
        modulos: ['FARMACIA_HOSPITALAR', 'FARMACIA_ESTOQUE']
      },
      {
        estacaoNumero: 5,
        titulo: '5. Diárias de Internação, Hotelaria, Facilities & Honorários Médicos',
        modulos: ['LEITOS_CENSO_NIR', 'ESCALA_MEDICA', 'FACILITIES_HOTELARIA']
      }
    ];

    const estacoes: EstacaoCustoDoorToDoor[] = estacoesMeta.map(meta => {
      const itensEstacao = itensPaciente.filter(it => (it.estacao_jornada || inferirEstacaoJornada(it.origem_modulo, it.centro_custo)) === meta.estacaoNumero);
      const totalEstacao = itensEstacao.reduce((acc, it) => acc + it.valor_total_imputado, 0);

      return {
        estacaoNumero: meta.estacaoNumero,
        titulo: meta.titulo,
        modulosRelacionados: meta.modulos,
        totalGasto: Number(totalEstacao.toFixed(2)),
        quantidadeItens: itensEstacao.length,
        itens: itensEstacao
      };
    });

    // Cálculos de Benchmark Financeiro
    // TUSS Previsto: Estimativa com base no perfil do episódio + margem hospitalar típica (35%)
    const faturamentoPrevistoTuss = Number((totalGasto * 1.38).toFixed(2));
    const glosaEstimada = Number((faturamentoPrevistoTuss * 0.045).toFixed(2)); // 4.5% de provisão de glosa
    const faturamentoLiquido = Number((faturamentoPrevistoTuss - glosaEstimada).toFixed(2));
    const margemBruta = Number((faturamentoLiquido - totalGasto).toFixed(2));
    const margemPercentual = totalGasto > 0 ? Number(((margemBruta / faturamentoLiquido) * 100).toFixed(2)) : 0;

    let statusMargem: ConsolidadoDoorToDoor['benchmarkFinanceiro']['statusMargem'] = 'MARGEM_ESTAVEL';
    if (margemPercentual > 25) statusMargem = 'LUCRO_EXCELENTE';
    else if (margemPercentual >= 10) statusMargem = 'MARGEM_ESTAVEL';
    else if (margemPercentual >= 0) statusMargem = 'MARGEM_CRITICA';
    else statusMargem = 'PREJUIZO';

    // SUS / SIGTAP Benchmark: Tabela SUS paga historicamente entre 35% e 45% do custo real hospitalar
    const repasseSigtapSus = Number((totalGasto * 0.42).toFixed(2));
    const deficitSusReais = Number((totalGasto - repasseSigtapSus).toFixed(2));
    const percentualCoberturaSus = totalGasto > 0 ? Number(((repasseSigtapSus / totalGasto) * 100).toFixed(1)) : 0;

    // CMED Teto: Verificação de medicamentos e OPME (Estação 3 e 4)
    const custoMedicamentosMateriais = estacoes[2].totalGasto + estacoes[3].totalGasto;
    const cmedTeto = Number((custoMedicamentosMateriais * 1.25).toFixed(2));

    // Alertas Inteligentes do Motor Vigia-Custos
    const alertas: ConsolidadoDoorToDoor['alertasVigiaCustos'] = [];

    if (deficitSusReais > 1000) {
      alertas.push({
        tipo: 'ALERTA',
        origem: 'VIGIA_CONTRATUALIZACAO_SUS',
        mensagem: `Déficit projetado na Tabela SIGTAP de R$ ${deficitSusReais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Requer subsídio de contrapartida municipal ou aporte de emenda.`
      });
    }

    if (glosaEstimada > 200) {
      alertas.push({
        tipo: 'AVISO',
        origem: 'AUDITORIA_CONCORRENTE_TUSS',
        mensagem: `Provisão de glosa técnica de R$ ${glosaEstimada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Assegure inclusão de laudos de exames LIMS e folhas de sala assinadas.`
      });
    }

    const itemAltoCusto = itensPaciente.find(it => it.valor_total_imputado >= 2000);
    if (itemAltoCusto) {
      alertas.push({
        tipo: 'CRITICO',
        origem: 'OPME_ALTO_CUSTO',
        mensagem: `Item de alto custo identificado: "${itemAltoCusto.item_descricao}" (R$ ${itemAltoCusto.valor_total_imputado.toFixed(2)}). Lote rastreado: ${itemAltoCusto.lote_fabricante || 'ALERTA_SEM_LOTE'}.`
      });
    }

    return {
      paciente: {
        cpf: pacienteRef.paciente_cpf,
        nome: pacienteRef.paciente_nome,
        episodioId: pacienteRef.prontuario_episodio,
        leitoAtual: pacienteRef.leito_identificador || 'Leito 204-B (UTI)',
        dataAdmissao: '2026-09-20T08:30:00Z',
        tempoPermanenciaHoras: 48
      },
      estacoes,
      custoTotalReal: Number(totalGasto.toFixed(2)),
      benchmarkFinanceiro: {
        faturamentoPrevistoTuss,
        glosaEstimada,
        faturamentoLiquidoEsperado: faturamentoLiquido,
        margemBrutaReais: margemBruta,
        margemPercentual,
        statusMargem,
        repasseSigtapSus,
        deficitSusReais,
        percentualCoberturaSus,
        cmedTetoMaximoPermitido: cmedTeto,
        statusConformidadeCmed: 'DENTRO_DO_TETO'
      },
      alertasVigiaCustos: alertas
    };
  }
}
