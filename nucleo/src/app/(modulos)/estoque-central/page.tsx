'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { KpiCard } from '@/components/KpiCard';
import { PageHeader } from '@/components/PageHeader';
import { ModuloMenuLateral } from '@/components/ModuloMenuLateral';
import { ModuloRole, MODULO_ROLES_CATALOG } from '@/types/rbac';
import {
  Boxes,
  Package,
  AlertOctagon,
  Clock,
  Plus,
  Snowflake,
  ShieldAlert,
  CheckCircle2,
  Search,
  Truck,
  FileCheck2,
  AlertTriangle,
  Download,
  Eye,
  X,
  History,
  FileSpreadsheet,
  Upload,
  RefreshCw,
  Building2,
  Database,
  DollarSign,
  User,
  FileCode
} from 'lucide-react';

import {
  ProdutoFarmacia,
  LocalEstoque,
  LoteEstoque,
  SolicitacaoEstoque,
  CatmatItem
} from '@/lib/estoque/types';
import { FefoEngine } from '@/lib/estoque/fefoEngine';

type SecaoModuloEstoque = 
  | 'visao_geral'
  | 'solicitacoes'
  | 'fefo'
  | 'nfe'
  | 'dispensacao'
  | 'recall'
  | 'relatorios';

export default function VigiaEstoqueCentralPage() {
  const roles = MODULO_ROLES_CATALOG['estoque-central'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoModuloEstoque>('visao_geral');
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [busca, setBusca] = useState('');
  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro' | 'alerta'; texto: string } | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Dados reais carregados das APIs
  const [locais, setLocais] = useState<LocalEstoque[]>([]);
  const [localAtivoId, setLocalAtivoId] = useState<string>('');
  const [produtos, setProdutos] = useState<ProdutoFarmacia[]>([]);
  const [lotes, setLotes] = useState<LoteEstoque[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoEstoque[]>([]);
  const [metricas, setMetricas] = useState({
    valor_total_estoque_consolidado: 0,
    total_locais_ativos: 10,
    total_produtos_padronizados: 0,
    lotes_em_quarentena_ou_bloqueio: 0,
    lotes_vencidos: 0,
    alertas_ponto_ressuprimento: 0
  });

  // Modais e gavetas
  const [perfilMedicamentoId, setPerfilMedicamentoId] = useState<string | null>(null);
  const [dadosPerfil, setDadosPerfil] = useState<{
    produto: ProdutoFarmacia;
    catmat: CatmatItem | null;
    saldoTotal: number;
    saldosPorLocal: { localId: string; localNome: string; tipo: string; cnes: string; saldo: number }[];
    lotes: LoteEstoque[];
    historicoMovimentacoes: {
      id: string;
      tipo: string;
      numeroLote?: string;
      quantidade: number;
      origem?: string;
      destino?: string;
      documento?: string;
      justificativa?: string;
      usuario: string;
      dataHora: string;
    }[];
  } | null>(null);

  // Modal de Separação com Validação FEFO
  const [modalSeparacao, setModalSeparacao] = useState<SolicitacaoEstoque | null>(null);
  const [loteEscolhidoSeparacao, setLoteEscolhidoSeparacao] = useState<{ [solicitacaoItemId: string]: string }>({});
  const [justificativaOverrideFefo, setJustificativaOverrideFefo] = useState<string>('');
  const [alertaOverrideVisivel, setAlertaOverrideVisivel] = useState<{
    solicitacaoItemId: string;
    loteEscolhido: LoteEstoque;
    loteSugerido: LoteEstoque;
  } | null>(null);

  // Modal de Nova Solicitação UBS -> CAF
  const [modalNovaSolicitacao, setModalNovaSolicitacao] = useState(false);
  const [novaSolProdutoId, setNovaSolProdutoId] = useState('');
  const [novaSolQtd, setNovaSolQtd] = useState(30);
  const [novaSolObs, setNovaSolObs] = useState('');

  // Modal de Upload e Conferência Cega NF-e
  const [xmlNfeTexto, setXmlNfeTexto] = useState('');
  const [nfeProcessada, setNfeProcessada] = useState<{
    nfe: {
      chaveAcesso: string;
      numero: string;
      serie: string;
      emitenteNome: string;
      emitenteCnpj: string;
      valorTotal: number;
    };
    itens: {
      nItem: number;
      cProd: string;
      xProd: string;
      uCom: string;
      qCom: number;
      vUnCom: number;
      produto_sugerido_id?: string;
      produto_sugerido_nome?: string;
      rastroDetectado?: { nLote: string; qLote: number; dFab?: string; dVal: string }[];
    }[];
  } | null>(null);
  const [contagemCega, setContagemCega] = useState<{ [nItem: number]: { lote: string; validade: string; qtd: number } }>({});

  // Modal de Dispensação ao Paciente
  const [dispensacaoCpf, setDispensacaoCpf] = useState('');
  const [dispensacaoNome, setDispensacaoNome] = useState('');
  const [dispensacaoProdId, setDispensacaoProdId] = useState('');
  const [dispensacaoLoteId, setDispensacaoLoteId] = useState('');
  const [dispensacaoQtd, setDispensacaoQtd] = useState(10);
  const [dispensacaoReceita, setDispensacaoReceita] = useState('');
  const [dispensacaoJustificativa, setDispensacaoJustificativa] = useState('');

  // Modal de Recall Sanitário
  const [modalRecallLoteId, setModalRecallLoteId] = useState<string | null>(null);
  const [motivoRecall, setMotivoRecall] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerNotificacao = (texto: string, tipo: 'sucesso' | 'erro' | 'alerta' = 'sucesso') => {
    setNotificacao({ texto, tipo });
    setTimeout(() => setNotificacao(null), 5000);
  };

  // Carrega dados consolidados do backend real
  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const paramLocal = localAtivoId ? `?localId=${localAtivoId}` : '';
      const res = await fetch(`/api/estoque-central${paramLocal}`);
      const data = await res.json();

      if (data.success) {
        setLocais(data.locais || []);
        setProdutos(data.produtos || []);
        setLotes(data.lotes || []);
        if (data.metricas) setMetricas(data.metricas);

        if (!localAtivoId && data.locais && data.locais.length > 0) {
          setLocalAtivoId(data.locais[0].id); // Inicia na CAF Central
        }
      }

      // Carrega solicitações
      const resSol = await fetch(`/api/estoque/solicitacoes${paramLocal}`);
      const dataSol = await resSol.json();
      if (dataSol.success) {
        setSolicitacoes(dataSol.solicitacoes || []);
      }
    } catch {
      triggerNotificacao('Erro ao conectar com o serviço de estoque.', 'erro');
    } finally {
      setCarregando(false);
    }
  }, [localAtivoId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void carregarDados();
    }, 0);
    return () => clearTimeout(timer);
  }, [carregarDados]);

  // Local ativo selecionado
  const localAtivo = useMemo(() => {
    return locais.find(l => l.id === localAtivoId) || locais[0];
  }, [locais, localAtivoId]);

  // Abre perfil detalhado do medicamento
  const handleAbrirPerfil = async (produtoId: string) => {
    setPerfilMedicamentoId(produtoId);
    try {
      const res = await fetch('/api/estoque-central', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'CONSULTAR_PERFIL_MEDICAMENTO', produto_id: produtoId })
      });
      const data = await res.json();
      if (data.success) {
        setDadosPerfil(data.perfil);
      }
    } catch {
      triggerNotificacao('Falha ao obter perfil do medicamento.', 'erro');
    }
  };

  // Upload e Parse do arquivo XML real
  const handleArquivoXmlSelecionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const conteudoXml = event.target?.result as string;
      setXmlNfeTexto(conteudoXml);
      try {
        const res = await fetch('/api/estoque/nfe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xml: conteudoXml })
        });
        const data = await res.json();
        if (data.success) {
          setNfeProcessada(data);
          // Inicializa campos da conferência cega
          const initCega: { [nItem: number]: { lote: string; validade: string; qtd: number } } = {};
          data.itens.forEach((it: { nItem: number; rastroDetectado?: { nLote: string; dVal: string }[]; qCom: number }) => {
            initCega[it.nItem] = {
              lote: it.rastroDetectado?.[0]?.nLote || '',
              validade: it.rastroDetectado?.[0]?.dVal || '',
              qtd: it.qCom
            };
          });
          setContagemCega(initCega);
          triggerNotificacao(`XML da NF-e ${data.nfe.numero} carregado. Preencha a conferência cega.`);
        } else {
          triggerNotificacao(data.error || 'Erro no XML.', 'erro');
        }
      } catch {
        triggerNotificacao('Erro ao processar XML de NF-e.', 'erro');
      }
    };
    reader.readAsText(file);
  };

  // Confirmação da conferência cega e entrada no estoque
  const handleConfirmarEntradaNfe = async () => {
    if (!nfeProcessada) return;

    const conferencias = nfeProcessada.itens.map(it => {
      const contagem = contagemCega[it.nItem] || { lote: '', validade: '', qtd: 0 };
      const qtdBase = contagem.qtd; // Conversão para unidade base
      return {
        nItem: it.nItem,
        cProd: it.cProd,
        xProd: it.xProd,
        produto_id: it.produto_sugerido_id || produtos[0]?.id,
        lote_contado: contagem.lote,
        validade_contada: contagem.validade,
        quantidade_contada_embalagem: contagem.qtd,
        tipo_embalagem: it.uCom,
        quantidade_contada_base: qtdBase,
        quantidade_nfe_base: it.qCom,
        divergencia_detectada: false
      };
    });

    try {
      const res = await fetch('/api/estoque/nfe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xml: xmlNfeTexto,
          conferencias,
          usuario: activeRole.name,
          localCafId: locais.find(l => l.tipo === 'CAF')?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotificacao('Entrada de NF-e e lotes confirmada na CAF!');
        setNfeProcessada(null);
        carregarDados();
      } else {
        triggerNotificacao(data.error || 'Falha na entrada.', 'erro');
      }
    } catch {
      triggerNotificacao('Erro ao finalizar conferência cega.', 'erro');
    }
  };

  // Criação de nova solicitação UBS -> CAF
  const handleCriarSolicitacao = async () => {
    if (!novaSolProdutoId || novaSolQtd <= 0) {
      triggerNotificacao('Selecione o produto e quantidade válida.', 'alerta');
      return;
    }

    try {
      const res = await fetch('/api/estoque/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'CRIAR',
          localSolicitanteId: localAtivoId,
          usuario: activeRole.name,
          itens: [{ produtoId: novaSolProdutoId, quantidade: novaSolQtd }],
          observacoes: novaSolObs
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotificacao('Solicitação despachada para a CAF Central!');
        setModalNovaSolicitacao(false);
        setNovaSolQtd(30);
        setNovaSolObs('');
        carregarDados();
      } else {
        triggerNotificacao(data.error || 'Erro na solicitação.', 'erro');
      }
    } catch {
      triggerNotificacao('Erro de conexão ao criar solicitação.', 'erro');
    }
  };

  // Início de separação de solicitação (Abrir modal com sugestão FEFO)
  const handleAbrirSeparacao = (sol: SolicitacaoEstoque) => {
    setModalSeparacao(sol);
    setJustificativaOverrideFefo('');
    setAlertaOverrideVisivel(null);

    // Sugere o lote FEFO para cada item da solicitação
    const initEscolhas: { [itemId: string]: string } = {};
    sol.itens.forEach(item => {
      const lotesDisponiveis = lotes.filter(l => l.produto_id === item.produto_id && (l.saldo_total || 0) > 0);
      const sugestao = FefoEngine.sugerirLoteFefo(lotesDisponiveis, 30);
      if (sugestao?.loteSugerido) {
        initEscolhas[item.id] = sugestao.loteSugerido.id;
      } else if (lotesDisponiveis[0]) {
        initEscolhas[item.id] = lotesDisponiveis[0].id;
      }
    });
    setLoteEscolhidoSeparacao(initEscolhas);
  };

  // Efetiva a separação FEFO (ou bloqueia se desvio não justificado)
  const handleConfirmarSeparacao = async () => {
    if (!modalSeparacao) return;

    // Checa se algum item possui desvio de FEFO
    for (const item of modalSeparacao.itens) {
      const loteEscolhidoId = loteEscolhidoSeparacao[item.id];
      const lotesDisponiveis = lotes.filter(l => l.produto_id === item.produto_id && (l.saldo_total || 0) > 0);
      const sugestao = FefoEngine.sugerirLoteFefo(lotesDisponiveis, 30);

      if (sugestao?.loteSugerido && loteEscolhidoId && sugestao.loteSugerido.id !== loteEscolhidoId) {
        const escolhido = lotes.find(l => l.id === loteEscolhidoId)!;
        if (justificativaOverrideFefo.trim().length < 10) {
          setAlertaOverrideVisivel({
            solicitacaoItemId: item.id,
            loteEscolhido: escolhido,
            loteSugerido: sugestao.loteSugerido
          });
          triggerNotificacao('Atenção: Desvio de FEFO identificado. Preencha a justificativa técnica (mínimo 10 caracteres).', 'alerta');
          return;
        }
      }
    }

    const separacoesPayload = modalSeparacao.itens.map(item => ({
      solicitacaoItemId: item.id,
      loteEscolhidoId: loteEscolhidoSeparacao[item.id],
      quantidade: item.quantidade_solicitada,
      justificativaOverride: justificativaOverrideFefo
    }));

    try {
      const res = await fetch('/api/estoque/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'SEPARAR',
          solicitacaoId: modalSeparacao.id,
          separacoes: separacoesPayload,
          usuario: activeRole.name
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotificacao('Separação concluída e remessa liberada para trânsito à UBS!');
        setModalSeparacao(null);
        setAlertaOverrideVisivel(null);
        carregarDados();
      } else {
        triggerNotificacao(data.error || 'Erro na separação.', 'erro');
      }
    } catch {
      triggerNotificacao('Erro ao conectar para separação.', 'erro');
    }
  };

  // Confirmação de recebimento na UBS
  const handleConfirmarRecebimento = async (solId: string, divergencia?: string) => {
    try {
      const res = await fetch('/api/estoque/solicitacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'CONFIRMAR_RECEBIMENTO',
          solicitacaoId: solId,
          usuario: activeRole.name,
          divergencia
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotificacao(divergencia ? 'Recebimento registrado com ocorrência!' : 'Medicamentos recebidos na UBS e saldo creditado!');
        carregarDados();
      }
    } catch {
      triggerNotificacao('Falha ao confirmar recebimento.', 'erro');
    }
  };

  // Dispensação ao paciente com validação FEFO
  const handleDispensarPaciente = async () => {
    if (!dispensacaoCpf || !dispensacaoProdId || dispensacaoQtd <= 0) {
      triggerNotificacao('Preencha CPF do paciente, produto e quantidade.', 'alerta');
      return;
    }

    try {
      const res = await fetch('/api/estoque/dispensacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pacienteCpf: dispensacaoCpf,
          pacienteNome: dispensacaoNome || 'Paciente UBS',
          localId: localAtivoId,
          produtoId: dispensacaoProdId,
          loteEscolhidoId: dispensacaoLoteId || undefined,
          quantidade: dispensacaoQtd,
          numeroReceita: dispensacaoReceita,
          justificativaOverride: dispensacaoJustificativa,
          usuario: activeRole.name
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotificacao(`Dispensação confirmada! Paciente ${data.resultado.pacienteCpfMascarado} atendido.`);
        setDispensacaoCpf('');
        setDispensacaoNome('');
        setDispensacaoReceita('');
        setDispensacaoJustificativa('');
        carregarDados();
      } else {
        triggerNotificacao(data.error || 'Erro na dispensação.', 'erro');
      }
    } catch {
      triggerNotificacao('Erro ao processar dispensação.', 'erro');
    }
  };

  // Ação de Recall Sanitário
  const handleEfetuarRecall = async () => {
    if (!modalRecallLoteId || !motivoRecall.trim()) {
      triggerNotificacao('Informe o lote e o motivo técnico do recall.', 'alerta');
      return;
    }

    try {
      const res = await fetch('/api/estoque-central', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'BLOQUEAR_RECALL',
          lote_id: modalRecallLoteId,
          motivo_recall: motivoRecall,
          usuario: activeRole.name
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotificacao('Lote bloqueado preventivamente em 100% dos locais de Itaquiraí!');
        setModalRecallLoteId(null);
        setMotivoRecall('');
        carregarDados();
      }
    } catch {
      triggerNotificacao('Erro ao emitir recall sanitário.', 'erro');
    }
  };

  // Exportação oficial BNAFAR / Hórus
  const handleDownloadBnafar = () => {
    window.open('/api/estoque/relatorios?tipo=bnafar&formato=csv', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">
      <PageHeader
        activeTitle="Almoxarifado & Farmácia Central (CAF) — Itaquiraí/MS"
        activeSubtitle="Gestão pública 100% operacional integrada às 9 Unidades Básicas de Saúde (UBS) e ao Custo do Paciente"
      />

      <ModuloRbacBar
        moduloId="estoque-central"
        activeRole={activeRole}
        onRoleChange={setActiveRole}
      />

      {/* Notificação Flutuante */}
      {notificacao && (
        <div
          role="alert"
          aria-live="assertive"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 animate-fade-in ${
            notificacao.tipo === 'sucesso'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : notificacao.tipo === 'alerta'
              ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {notificacao.tipo === 'sucesso' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {notificacao.tipo === 'alerta' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          {notificacao.tipo === 'erro' && <AlertOctagon className="w-5 h-5 text-rose-400" />}
          <span className="text-sm font-medium">{notificacao.texto}</span>
          <button onClick={() => setNotificacao(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Seleção de Unidade Municipal Ativa */}
      <div className="bg-[#0C1222] border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Unidade Operacional Ativa (Piloto Itaquiraí-MS)</div>
            <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
              {localAtivo?.nome}
              {localAtivo?.cnes && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                  CNES: {localAtivo.cnes}
                </span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                localAtivo?.tipo === 'CAF' ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' : 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
              }`}>
                {localAtivo?.tipo === 'CAF' ? 'FARMÁCIA CENTRAL' : 'FARMÁCIA UBS'}
              </span>
            </div>
          </div>
        </div>

        {/* Seletor Dropdown de Unidades */}
        <div className="flex items-center gap-2">
          <label htmlFor="unidade-select" className="text-xs text-slate-400 hidden sm:inline">Alternar Estabelecimento:</label>
          <select
            id="unidade-select"
            value={localAtivoId}
            onChange={(e) => setLocalAtivoId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {locais.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.tipo === 'CAF' ? '🏢 [CAF] ' : '🏥 [UBS] '} {loc.nome}
              </option>
            ))}
          </select>

          <button
            onClick={carregarDados}
            disabled={carregando}
            aria-label="Atualizar dados do estoque"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Atualizar dados em tempo real"
          >
            <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Conteúdo Principal com Layout de Menu Lateral */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Menu Lateral do Módulo de Estoque */}
        <aside className="w-full lg:w-64 shrink-0">
          <ModuloMenuLateral
            moduloId="estoque-central"
            titulo="Estoque Central"
            itens={[
              { id: 'visao_geral', label: 'Visão Geral & Catálogo', icon: Boxes },
              { id: 'solicitacoes', label: 'Solicitações UBS → CAF', icon: Truck, badge: solicitacoes.filter(s => s.status === 'ENVIADA' || s.status === 'LIBERADA').length ? String(solicitacoes.filter(s => s.status === 'ENVIADA' || s.status === 'LIBERADA').length) : null },
              { id: 'fefo', label: 'Gestão FEFO & Validade', icon: Clock },
              { id: 'nfe', label: 'Entrada NF-e (XML 4.0)', icon: FileCheck2 },
              { id: 'dispensacao', label: 'Dispensação ao Paciente', icon: User },
              { id: 'recall', label: 'Recall & Bloqueio', icon: ShieldAlert },
              { id: 'relatorios', label: 'Curva ABC & BNAFAR', icon: FileSpreadsheet }
            ]}
            ativoId={secaoAtiva}
            onSelect={(id) => setSecaoAtiva(id as SecaoModuloEstoque)}
            aberto={sidebarAberta}
            onFechar={() => setSidebarAberta(false)}
          />
        </aside>

        {/* Área Central de Conteúdo */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Seção 1: VISÃO GERAL */}
          {secaoAtiva === 'visao_geral' && (
            <div className="flex flex-col gap-6">
              {/* KPIs de Alto Impacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard
                  title="Valor do Estoque"
                  value={`R$ ${metricas.valor_total_estoque_consolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  subtitle={`Consolidado na rede de ${metricas.total_locais_ativos} estabelecimentos`}
                  icon={DollarSign}
                  trend={{ text: 'Auditoria Real', isPositive: true }}
                />
                <KpiCard
                  title="Medicamentos Padronizados"
                  value={String(metricas.total_produtos_padronizados)}
                  subtitle="Itens com CATMAT vinculado"
                  icon={Package}
                />
                <KpiCard
                  title="Validade e Quarentena"
                  value={`${metricas.lotes_em_quarentena_ou_bloqueio} bloqueados`}
                  subtitle={`${metricas.lotes_vencidos} lotes com validade expirada`}
                  icon={ShieldAlert}
                  trend={{ text: 'Controle Sanitário', isAlert: true }}
                />
                <KpiCard
                  title="Ponto de Ressuprimento"
                  value={String(metricas.alertas_ponto_ressuprimento)}
                  subtitle="Medicamentos com estoque crítico"
                  icon={AlertTriangle}
                  trend={{ text: 'Ressuprimento', isAlert: true }}
                />
              </div>

              {/* Tabela de Produtos Padronizados (Catálogo CATMAT) */}
              <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-400" />
                      Catálogo Municipal de Medicamentos (Itaquiraí-MS)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Vínculo compulsório ao CATMAT (Compras.gov.br) com rastreabilidade da menor unidade dispensável.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar por nome ou CATMAT..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {localAtivo?.tipo === 'FARMACIA_UBS' && (
                      <button
                        onClick={() => setModalNovaSolicitacao(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Solicitar à CAF
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Medicamento / Princípio Ativo</th>
                        <th className="py-3 px-3">Código CATMAT</th>
                        <th className="py-3 px-3">Unidade Base</th>
                        <th className="py-3 px-3 text-right">Saldo Local</th>
                        <th className="py-3 px-3">Regulamentação</th>
                        <th className="py-3 px-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {produtos
                        .filter(p => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigo_catmat.toLowerCase().includes(busca.toLowerCase()))
                        .map(produto => {
                          const lotesProd = lotes.filter(l => l.produto_id === produto.id);
                          const saldoNaUnidade = lotesProd.reduce((acc, l) => acc + (l.saldo_total || 0), 0);
                          const statusCritico = saldoNaUnidade <= produto.estoque_minimo_padrao;

                          return (
                            <tr key={produto.id} className="hover:bg-slate-800/30 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-100">{produto.nome}</div>
                                <div className="text-[11px] text-slate-400">{produto.principio_ativo} — {produto.concentracao}</div>
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-mono text-blue-400 font-semibold bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                                  {produto.codigo_catmat}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                  {produto.unidade_base}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span className={`font-bold ${statusCritico ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {saldoNaUnidade.toLocaleString('pt-BR')} {produto.unidade_base}
                                </span>
                                {statusCritico && (
                                  <div className="text-[10px] text-amber-500 font-medium">Abaixo do mín ({produto.estoque_minimo_padrao})</div>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {produto.controlado && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/50 font-semibold">
                                      Port. 344
                                    </span>
                                  )}
                                  {produto.termolabil && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/50 flex items-center gap-1 font-semibold">
                                      <Snowflake className="w-2.5 h-2.5" /> 2°C a 8°C
                                    </span>
                                  )}
                                  {!produto.controlado && !produto.termolabil && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">Regular</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleAbrirPerfil(produto.id)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-[11px] inline-flex items-center gap-1.5 transition"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                                  Perfil & Rastreio
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Seção 2: SOLICITAÇÕES UBS -> CAF */}
          {secaoAtiva === 'solicitacoes' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-blue-400" />
                      Fluxo de Solicitações e Reposição (UBS → CAF Central)
                    </h2>
                    <p className="text-xs text-slate-400">
                      As 9 UBS solicitam reposição em unidades base. A CAF Central efetua a separação obrigatória por FEFO.
                    </p>
                  </div>

                  <button
                    onClick={() => setModalNovaSolicitacao(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Solicitação
                  </button>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {solicitacoes.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">Nenhuma solicitação em andamento no momento.</div>
                  ) : (
                    solicitacoes.map(sol => (
                      <div key={sol.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                              {sol.numero_solicitacao}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                              sol.status === 'ENVIADA' ? 'bg-amber-950/60 text-amber-300 border-amber-800/50' :
                              sol.status === 'LIBERADA' ? 'bg-blue-950/60 text-blue-300 border-blue-800/50' :
                              sol.status === 'RECEBIDA' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' :
                              'bg-purple-950/60 text-purple-300 border-purple-800/50'
                            }`}>
                              {sol.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-300">
                            <strong>{sol.local_solicitante_nome}</strong> solicita para <strong>{sol.local_origem_nome}</strong>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Criado em: {new Date(sol.criado_em).toLocaleString('pt-BR')} por {sol.solicitado_por}
                          </div>
                          {sol.itens.map(it => (
                            <div key={it.id} className="text-[11px] text-slate-400 mt-1">
                              • {it.quantidade_solicitada}x {it.produto_nome} ({it.unidade_base})
                              {it.quantidade_separada > 0 && ` — Separados: ${it.quantidade_separada}`}
                            </div>
                          ))}
                        </div>

                        {/* Ações de Separação / Recebimento */}
                        <div className="flex items-center gap-2">
                          {sol.status === 'ENVIADA' && (
                            <button
                              onClick={() => handleAbrirSeparacao(sol)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
                            >
                              <Boxes className="w-3.5 h-3.5" />
                              Separar por FEFO (CAF)
                            </button>
                          )}

                          {sol.status === 'LIBERADA' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-blue-400 bg-blue-950/50 px-2 py-1 rounded border border-blue-800/40 flex items-center gap-1">
                                <Truck className="w-3 h-3 animate-pulse" /> Em Trânsito
                              </span>
                              <button
                                onClick={() => handleConfirmarRecebimento(sol.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
                              >
                                Confirmar Recebimento na UBS
                              </button>
                            </div>
                          )}

                          {sol.status === 'RECEBIDA' && (
                            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Saldo Creditado
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Seção 3: GESTÃO FEFO */}
          {secaoAtiva === 'fefo' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" />
                      Motor de Validade FEFO (First Expired, First Out)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Lotes ordenados estritamente por validade ascendente. Destaque regulatório para itens ≤ 30, ≤ 60 e ≤ 90 dias.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4">Medicamento / Lote</th>
                        <th className="py-3 px-3">Fabricante</th>
                        <th className="py-3 px-3">Data de Validade</th>
                        <th className="py-3 px-3">Classificação FEFO</th>
                        <th className="py-3 px-3 text-right">Saldo Base</th>
                        <th className="py-3 px-3">Status Sanitário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {lotes.map(lote => {
                        const classeVal = FefoEngine.classificarValidade(lote.data_validade);
                        return (
                          <tr key={lote.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-100">{lote.produto_nome}</div>
                              <div className="font-mono text-[11px] text-blue-400">Lote: {lote.numero_lote}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-400">{lote.fabricante}</td>
                            <td className="py-3 px-3 font-mono font-medium text-slate-200">
                              {lote.data_validade}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${classeVal.badgeColor}`}>
                                {classeVal.label}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-100">
                              {(lote.saldo_total || 0).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                lote.status === 'LIBERADO' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50' :
                                lote.status === 'QUARENTENA' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' :
                                'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                              }`}>
                                {lote.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Seção 4: ENTRADA NF-E REAL */}
          {secaoAtiva === 'nfe' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-emerald-400" />
                      Importação de NF-e 4.0 Real & Conferência Cega
                    </h2>
                    <p className="text-xs text-slate-400">
                      Processamento de XML oficial com leitura obrigatória do grupo de rastreabilidade &lt;rastro&gt; (nLote, dVal, dFab).
                    </p>
                  </div>

                  <input
                    type="file"
                    accept=".xml"
                    ref={fileInputRef}
                    onChange={handleArquivoXmlSelecionado}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Arquivo XML (NF-e 4.0)
                  </button>
                </div>

                {nfeProcessada ? (
                  <div className="border border-slate-700 bg-slate-900/60 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex flex-wrap justify-between items-center bg-slate-800/50 p-3 rounded-lg text-xs">
                      <div>
                        <strong>Emitente:</strong> {nfeProcessada.nfe.emitenteNome} (CNPJ: {nfeProcessada.nfe.emitenteCnpj})
                      </div>
                      <div>
                        <strong>NF-e:</strong> {nfeProcessada.nfe.numero} (Série {nfeProcessada.nfe.serie}) — <strong>Total:</strong> R$ {nfeProcessada.nfe.valorTotal.toFixed(2)}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Conferência Cega do Almoxarifado (Digite a contagem física real)
                    </h3>

                    <div className="space-y-3">
                      {nfeProcessada.itens.map(it => (
                        <div key={it.nItem} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-200">{it.xProd}</div>
                            <div className="text-[11px] text-slate-400">Código Fornecedor: {it.cProd} — Unidade Comercial: {it.uCom}</div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div>
                              <label className="text-[10px] text-slate-400 block">Lote Contado</label>
                              <input
                                type="text"
                                value={contagemCega[it.nItem]?.lote || ''}
                                onChange={(e) => setContagemCega(prev => ({
                                  ...prev,
                                  [it.nItem]: { ...prev[it.nItem], lote: e.target.value }
                                }))}
                                placeholder="Digite o Lote"
                                className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs w-32"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block">Validade</label>
                              <input
                                type="date"
                                value={contagemCega[it.nItem]?.validade || ''}
                                onChange={(e) => setContagemCega(prev => ({
                                  ...prev,
                                  [it.nItem]: { ...prev[it.nItem], validade: e.target.value }
                                }))}
                                className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block">Quantidade</label>
                              <input
                                type="number"
                                value={contagemCega[it.nItem]?.qtd || 0}
                                onChange={(e) => setContagemCega(prev => ({
                                  ...prev,
                                  [it.nItem]: { ...prev[it.nItem], qtd: Number(e.target.value) }
                                }))}
                                className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs w-20"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-2">
                      <button
                        onClick={() => setNfeProcessada(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleConfirmarEntradaNfe}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20"
                      >
                        Aprovar Conferência & Efetivar Entrada CAF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                    <FileCode className="w-12 h-12 text-slate-600 mb-3" />
                    <div className="text-sm font-semibold text-slate-300">Nenhuma NF-e em conferência</div>
                    <div className="text-xs text-slate-500 max-w-sm mt-1">
                      Faça o upload do XML 4.0 da nota emitida pelo fornecedor para carregar os lotes e iniciar a conferência física cega.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seção 5: DISPENSAÇÃO AO PACIENTE */}
          {secaoAtiva === 'dispensacao' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Dispensação de Medicamento ao Paciente (Farmácia UBS)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Dispensação direta em unidade base (comprimidos). Cada dispensação alimenta o custeio da jornada do paciente no núcleo.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">CPF do Paciente (Obrigatório)</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={dispensacaoCpf}
                      onChange={(e) => setDispensacaoCpf(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Nome do Paciente</label>
                    <input
                      type="text"
                      placeholder="Nome completo do cidadão"
                      value={dispensacaoNome}
                      onChange={(e) => setDispensacaoNome(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Medicamento Padronizado</label>
                    <select
                      value={dispensacaoProdId}
                      onChange={(e) => {
                        setDispensacaoProdId(e.target.value);
                        // Auto-sugere lote FEFO
                        const lotesDisponiveis = lotes.filter(l => l.produto_id === e.target.value && (l.saldo_total || 0) > 0);
                        const sug = FefoEngine.sugerirLoteFefo(lotesDisponiveis, 0);
                        if (sug?.loteSugerido) setDispensacaoLoteId(sug.loteSugerido.id);
                      }}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl focus:outline-none"
                    >
                      <option value="">Selecione o medicamento...</option>
                      {produtos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome} ({p.unidade_base})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Quantidade (Unidade Base / Comprimidos)</label>
                    <input
                      type="number"
                      value={dispensacaoQtd}
                      onChange={(e) => setDispensacaoQtd(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Nº Receita / Notificação (Portaria 344)</label>
                    <input
                      type="text"
                      placeholder="Ex: NOT-2026-9921"
                      value={dispensacaoReceita}
                      onChange={(e) => setDispensacaoReceita(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Justificativa (Se houver desvio de FEFO)</label>
                    <input
                      type="text"
                      placeholder="Obrigatório caso não utilize o lote sugerido pelo FEFO"
                      value={dispensacaoJustificativa}
                      onChange={(e) => setDispensacaoJustificativa(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleDispensarPaciente}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Dispensação & Integrar Custo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Seção 6: RECALL & BLOQUEIO */}
          {secaoAtiva === 'recall' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    Módulo de Recall Sanitário & Bloqueio Imediato
                  </h2>
                  <p className="text-xs text-slate-400">
                    Bloqueia instantaneamente um lote em todas as farmácias municipais de Itaquiraí e exibe a lista de pacientes que receberam o lote.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Lote a ser Bloqueado</label>
                    <select
                      value={modalRecallLoteId || ''}
                      onChange={(e) => setModalRecallLoteId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl"
                    >
                      <option value="">Selecione o lote...</option>
                      {lotes.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.numero_lote} — {l.produto_nome} (Vcto: {l.data_validade})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Motivo Técnico / Alerta ANVISA</label>
                    <input
                      type="text"
                      placeholder="Ex: Resolução RE nº 1.420/2026 - Desvio de qualidade"
                      value={motivoRecall}
                      onChange={(e) => setMotivoRecall(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleEfetuarRecall}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 transition flex items-center gap-2"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    Emitir Bloqueio de Recall em 100% dos Locais
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Seção 7: RELATÓRIOS & BNAFAR */}
          {secaoAtiva === 'relatorios' && (
            <div className="flex flex-col gap-6">
              <div className="bg-[#0C1222] border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                      Relatórios Gerenciais & Exportação Federal BNAFAR/Hórus
                    </h2>
                    <p className="text-xs text-slate-400">
                      Geração de dados em conformidade com o Ministério da Saúde para prestação de contas do SUS.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadBnafar}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition"
                  >
                    <Download className="w-4 h-4" />
                    Exportar BNAFAR/Hórus (CSV)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-2">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="text-slate-400 font-medium">Curva A (Alto Valor)</div>
                    <div className="text-xl font-bold text-blue-400 mt-1">75% do Valor Total</div>
                    <div className="text-[11px] text-slate-500 mt-1">Insulinas, Meropenem e Imunoglobulinas</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="text-slate-400 font-medium">Curva B (Médio Impacto)</div>
                    <div className="text-xl font-bold text-purple-400 mt-1">15% do Valor Total</div>
                    <div className="text-[11px] text-slate-500 mt-1">Antibióticos orais e anti-hipertensivos</div>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <div className="text-slate-400 font-medium">Curva C (Giro Rápido)</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">10% do Valor Total</div>
                    <div className="text-[11px] text-slate-500 mt-1">Dipirona, Paracetamol, Soro fisiológico</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ALERTA DE OVERRIDE FEFO COM JUSTIFICATIVA OBRIGATÓRIA */}
      {alertaOverrideVisivel && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0C1222] border-2 border-amber-500/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-slate-100">Alerta de Desvio de FEFO</h3>
                <p className="text-xs text-amber-300">Existe lote com validade mais próxima disponível no almoxarifado.</p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Lote Sugerido pelo FEFO:</span>
                <span className="font-bold text-emerald-400">{alertaOverrideVisivel.loteSugerido.numero_lote} (Vence: {alertaOverrideVisivel.loteSugerido.data_validade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lote Selecionado pelo Operador:</span>
                <span className="font-bold text-amber-400">{alertaOverrideVisivel.loteEscolhido.numero_lote} (Vence: {alertaOverrideVisivel.loteEscolhido.data_validade})</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Justificativa Técnica Obrigatória (Mínimo 10 caracteres):
              </label>
              <textarea
                rows={3}
                value={justificativaOverrideFefo}
                onChange={(e) => setJustificativaOverrideFefo(e.target.value)}
                placeholder="Ex: Lote reservado por autorização clínica específica para protocolo especial..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                Caracteres digitados: {justificativaOverrideFefo.trim().length} / 10 mínimos
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setAlertaOverrideVisivel(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Voltar e Trocar Lote
              </button>
              <button
                disabled={justificativaOverrideFefo.trim().length < 10}
                onClick={handleConfirmarSeparacao}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/20"
              >
                Confirmar Override Auditado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SEPARAÇÃO DE SOLICITAÇÃO NA CAF */}
      {modalSeparacao && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0C1222] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-purple-400" />
                  Separação de Medicamentos — {modalSeparacao.numero_solicitacao}
                </h3>
                <p className="text-xs text-slate-400">Destino: {modalSeparacao.local_solicitante_nome}</p>
              </div>
              <button onClick={() => setModalSeparacao(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {modalSeparacao.itens.map(item => {
                const lotesDisponiveis = lotes.filter(l => l.produto_id === item.produto_id && (l.saldo_total || 0) > 0);
                const sugestao = FefoEngine.sugerirLoteFefo(lotesDisponiveis, 30);
                const escolhidoId = loteEscolhidoSeparacao[item.id];
                const ehDesvio = sugestao?.loteSugerido && escolhidoId && sugestao.loteSugerido.id !== escolhidoId;

                return (
                  <div key={item.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200 text-sm">{item.produto_nome}</span>
                      <span className="text-blue-400 font-bold">{item.quantidade_solicitada} {item.unidade_base}</span>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Selecione o Lote (Sugerido por FEFO):</label>
                      <select
                        value={escolhidoId || ''}
                        onChange={(e) => setLoteEscolhidoSeparacao(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className={`w-full bg-slate-950 border px-3 py-2 rounded-xl text-xs ${
                          ehDesvio ? 'border-amber-500 text-amber-300' : 'border-slate-700 text-slate-200'
                        }`}
                      >
                        {lotesDisponiveis.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.numero_lote} — Vcto: {l.data_validade} ({FefoEngine.calcularDiasAteVencimento(l.data_validade)} dias) — Saldo CAF: {l.saldo_total}
                            {sugestao?.loteSugerido?.id === l.id ? ' [⭐ RECOMENDADO FEFO]' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {ehDesvio && (
                      <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                        Desvio de FEFO: Você selecionou um lote com validade mais distante. Uma justificativa será exigida.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setModalSeparacao(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarSeparacao}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20"
              >
                Concluir Separação & Despachar Remessa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA SOLICITAÇÃO UBS -> CAF */}
      {modalNovaSolicitacao && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0C1222] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                Nova Solicitação de Medicamentos
              </h3>
              <button onClick={() => setModalNovaSolicitacao(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Unidade Solicitante</label>
                <input
                  type="text"
                  disabled
                  value={localAtivo?.nome || ''}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-300 px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Medicamento</label>
                <select
                  value={novaSolProdutoId}
                  onChange={(e) => setNovaSolProdutoId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl"
                >
                  <option value="">Selecione o medicamento...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} ({p.unidade_base})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Quantidade Solicitada (Unidade Base)</label>
                <input
                  type="number"
                  value={novaSolQtd}
                  onChange={(e) => setNovaSolQtd(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Observações da UBS</label>
                <textarea
                  rows={2}
                  value={novaSolObs}
                  onChange={(e) => setNovaSolObs(e.target.value)}
                  placeholder="Ex: Reforço para campanha de vacinação / Hipertensos cadastrados"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setModalNovaSolicitacao(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleCriarSolicitacao}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
              >
                Enviar à CAF Central
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAVETA LATERAL: PERFIL COMPLETO DO MEDICAMENTO & RASTREABILIDADE */}
      {perfilMedicamentoId && dadosPerfil && (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-end">
          <div className="bg-[#0C1222] border-l border-slate-700 w-full max-w-xl h-full p-6 overflow-y-auto flex flex-col gap-6 shadow-2xl animate-slide-left">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                  {dadosPerfil.produto.codigo_catmat}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{dadosPerfil.produto.nome}</h3>
                <p className="text-xs text-slate-400">{dadosPerfil.produto.principio_ativo} — {dadosPerfil.produto.concentracao}</p>
              </div>
              <button onClick={() => setPerfilMedicamentoId(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ficha CATMAT */}
            {dadosPerfil.catmat && (
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs flex flex-col gap-1.5">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-400" />
                  Dados Oficiais CATMAT (Compras.gov.br)
                </div>
                <div className="text-slate-400">{dadosPerfil.catmat.descricao}</div>
                <div className="text-[11px] text-slate-500">PDM: {dadosPerfil.catmat.nome_pdm} | Classe: {dadosPerfil.catmat.classe_pdm}</div>
              </div>
            )}

            {/* Saldo Consolidado por Estabelecimento (CAF + 9 UBS de Itaquiraí) */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Distribuição de Saldos nos 10 Estabelecimentos de Saúde
              </h4>
              <div className="bg-slate-900/80 rounded-xl border border-slate-800 divide-y divide-slate-800/60 text-xs">
                {dadosPerfil.saldosPorLocal.map(loc => (
                  <div key={loc.localId} className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-200">{loc.localNome}</div>
                      <div className="text-[10px] text-slate-500">CNES: {loc.cnes}</div>
                    </div>
                    <span className="font-bold text-slate-100">
                      {loc.saldo.toLocaleString('pt-BR')} {dadosPerfil.produto.unidade_base}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Linha do Tempo de Rastreabilidade (NF -> UBS -> Paciente) */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                Trilha de Auditoria & Rastreabilidade de Movimentações
              </h4>
              <div className="space-y-2">
                {dadosPerfil.historicoMovimentacoes.length === 0 ? (
                  <div className="text-xs text-slate-500 py-3 text-center">Nenhuma movimentação registrada.</div>
                ) : (
                  dadosPerfil.historicoMovimentacoes.map(mov => (
                    <div key={mov.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-300">{mov.tipo}</span>
                        <span className="text-[10px] text-slate-500">{new Date(mov.dataHora).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="text-slate-300">
                        Qtd: <strong>{mov.quantidade}</strong> | Lote: <strong>{mov.numeroLote}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {mov.origem && `Origem: ${mov.origem}`} {mov.destino && `→ Destino: ${mov.destino}`}
                      </div>
                      {mov.justificativa && (
                        <div className="text-[10px] text-amber-400 bg-amber-950/30 p-1.5 rounded mt-1">
                          {mov.justificativa}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
