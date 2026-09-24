'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { KpiCard } from '@/components/KpiCard';
import { PageHeader } from '@/components/PageHeader';
import { ModuloMenuLateral, MenuLateralItem } from '@/components/ModuloMenuLateral';
import { CATEGORIA_COR } from '@/components/ModuloLayoutShell';
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
  FileCode,
  Menu,
  ChevronRight
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
  | 'relatorios'
  | 'perfis_rbac';

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

  const qtdSolicitacoesAbertas = solicitacoes.filter(s => s.status === 'ENVIADA' || s.status === 'LIBERADA').length;

  const menuItens: MenuLateralItem[] = [
    { id: 'visao_geral', label: 'Visão Geral & Catálogo', icon: Boxes },
    { id: 'solicitacoes', label: 'Solicitações UBS → CAF', icon: Truck, badge: qtdSolicitacoesAbertas ? String(qtdSolicitacoesAbertas) : null },
    { id: 'fefo', label: 'Gestão FEFO & Validade', icon: Clock },
    { id: 'nfe', label: 'Entrada NF-e (XML 4.0)', icon: FileCheck2 },
    { id: 'dispensacao', label: 'Dispensação ao Paciente', icon: User },
    { id: 'recall', label: 'Recall & Bloqueio', icon: ShieldAlert },
    { id: 'relatorios', label: 'Curva ABC & BNAFAR', icon: FileSpreadsheet },
    { id: 'perfis_rbac', label: 'Trilha de Auditoria & RBAC', icon: History },
  ];

  return (
    <>
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl text-[#1B1F1C]/70 hover:bg-[#1B1F1C]/[0.06] transition-all cursor-pointer flex items-center justify-center"
              title={sidebarAberta ? 'Recolher menu' : 'Expandir menu'}
              aria-label={sidebarAberta ? 'Recolher menu' : 'Expandir menu'}
              aria-expanded={sidebarAberta}
            >
              {sidebarAberta ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <button
              type="button"
              aria-label="Importar NF-e (XML)"
              title="Importar NF-e (XML)"
              onClick={() => setSecaoAtiva('nfe')}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#0E5C4C] text-white hover:bg-[#0A4A3D] transition-all shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Importar NF-e (XML)</span>
            </button>

            <button
              type="button"
              aria-label="Nova Solicitação à CAF"
              title="Nova Solicitação à CAF"
              onClick={() => setModalNovaSolicitacao(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-marca hover:bg-marca-hover text-white transition-all shadow-xs cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Nova Solicitação</span>
            </button>

            <button
              type="button"
              aria-label="Exportar BNAFAR/Hórus (CSV)"
              title="Exportar BNAFAR/Hórus (CSV)"
              onClick={handleDownloadBnafar}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-white border border-[#1B1F1C]/12 text-[#1B1F1C] hover:bg-[#1B1F1C]/[0.06] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Exportar BNAFAR</span>
            </button>
          </div>
        }
      />

      {/* Notificação flutuante */}
      {notificacao && (
        <div
          role="alert"
          aria-live="assertive"
          className={`fixed top-20 right-4 left-4 sm:left-auto sm:max-w-md z-50 px-4 py-3 rounded-xl border bg-white shadow-[0_8px_24px_rgba(27,31,28,0.10),0_2px_8px_rgba(27,31,28,0.05)] flex items-center gap-3 ${
            notificacao.tipo === 'sucesso'
              ? 'border-[#0E5C4C]/30 text-[#0E5C4C]'
              : notificacao.tipo === 'alerta'
              ? 'border-[#8A6A16]/30 text-[#8A6A16]'
              : 'border-[#9C3B2E]/30 text-[#9C3B2E]'
          }`}
        >
          {notificacao.tipo === 'sucesso' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {notificacao.tipo === 'alerta' && <AlertTriangle className="w-5 h-5 shrink-0" />}
          {notificacao.tipo === 'erro' && <AlertOctagon className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-bold flex-1">{notificacao.texto}</span>
          <button
            type="button"
            onClick={() => setNotificacao(null)}
            aria-label="Fechar notificação"
            className="w-11 h-11 -my-2 -mr-2 inline-flex items-center justify-center rounded-lg hover:bg-[#1B1F1C]/[0.06] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-1 relative overflow-x-clip">
        <ModuloMenuLateral
          moduloId="estoque-central"
          titulo="Estoque Central & CD"
          itens={menuItens}
          ativoId={secaoAtiva}
          onSelect={(id) => setSecaoAtiva(id as SecaoModuloEstoque)}
          aberto={sidebarAberta}
          onFechar={() => setSidebarAberta(false)}
        />

        <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#1B1F1C]/65 font-medium pb-2 border-b border-[#1B1F1C]/[0.08]">
            <span>Vigia Saúde</span>
            <ChevronRight className="w-3 h-3 text-[#1B1F1C]/40" />
            <span>Almoxarifado &amp; CAF Itaquiraí</span>
            <ChevronRight className="w-3 h-3 text-[#1B1F1C]/40" />
            <span className="font-bold text-[#1B1F1C] truncate">
              {menuItens.find((m) => m.id === secaoAtiva)?.label}
            </span>
          </div>

          {/* Unidade operacional ativa (CAF + 9 farmácias de UBS) */}
          <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(27,31,28,0.05)]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#1B1F1C]/[0.05] text-[#1B1F1C]/70 flex items-center justify-center border border-[#1B1F1C]/[0.08] shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#1B1F1C]/65">
                  Unidade operacional ativa · Piloto Itaquiraí-MS
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="font-display text-base font-semibold text-[#1B1F1C]">{localAtivo?.nome || 'Carregando unidades…'}</span>
                  {localAtivo?.cnes && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#1B1F1C]/[0.05] text-[#1B1F1C]/80 border border-[#1B1F1C]/12">
                      CNES {localAtivo.cnes}
                    </span>
                  )}
                  {localAtivo && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold border text-[#1B1F1C]/75"
                      style={
                        localAtivo.tipo === 'CAF'
                          ? { backgroundColor: `${CATEGORIA_COR.SUPRIMENTOS}1F`, borderColor: `${CATEGORIA_COR.SUPRIMENTOS}59` }
                          : { backgroundColor: 'rgba(27,31,28,0.05)', borderColor: 'rgba(27,31,28,0.12)' }
                      }
                    >
                      {localAtivo.tipo === 'CAF' ? 'Farmácia Central' : 'Farmácia UBS'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto min-w-0">
              <label htmlFor="unidade-select" className="text-xs font-semibold text-[#1B1F1C]/70 hidden xl:inline">
                Alternar estabelecimento
              </label>
              <select
                id="unidade-select"
                value={localAtivoId}
                onChange={(e) => setLocalAtivoId(e.target.value)}
                className="min-w-0 w-full md:w-80 min-h-[44px] bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] text-xs font-semibold rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-[#0E5C4C]/20 focus:border-[#0E5C4C]"
              >
                {locais.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.tipo === 'CAF' ? '[CAF] ' : '[UBS] '}{loc.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={carregarDados}
                disabled={carregando}
                aria-label="Atualizar dados do estoque"
                title="Atualizar dados do estoque"
                className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white hover:bg-[#1B1F1C]/[0.06] text-[#1B1F1C]/70 border border-[#1B1F1C]/12 transition shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Perfis & matriz RBAC — só na seção "Trilha de Auditoria & RBAC" (IDENTIDADE_VISUAL § 4) */}
          {secaoAtiva === 'perfis_rbac' && (
            <div className="space-y-4">
              <ModuloRbacBar
                moduloId="estoque-central"
                activeRole={activeRole}
                onRoleChange={setActiveRole}
              />
              <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl p-5 text-xs text-[#1B1F1C]/80 leading-relaxed">
                <h2 className="font-display text-lg font-semibold text-[#1B1F1C] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#1B1F1C]/55" />
                  Trilha de auditoria por medicamento
                </h2>
                <p className="mt-2">
                  Toda entrada de NF-e, separação FEFO, recebimento na UBS, dispensação e recall fica registrada com usuário,
                  data e justificativa. Abra <strong>Perfil &amp; Rastreio</strong> no catálogo para ver a linha do tempo completa
                  de cada medicamento, da nota fiscal ao paciente.
                </p>
                <p className="mt-2 text-[#1B1F1C]/70">
                  Perfil ativo nas ações desta tela: <strong className="text-[#1B1F1C]">{activeRole.name}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Seção 1: VISÃO GERAL */}
          {secaoAtiva === 'visao_geral' && (
            <div className="flex flex-col gap-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard
                  title="Valor do Estoque"
                  value={`R$ ${metricas.valor_total_estoque_consolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  subtitle={`Consolidado em ${metricas.total_locais_ativos} estabelecimentos`}
                  icon={<DollarSign className="w-5 h-5 text-[#0E5C4C]" />}
                  trend={{ text: 'Auditoria real', isPositive: true }}
                />
                <KpiCard
                  title="Medicamentos Padronizados"
                  value={String(metricas.total_produtos_padronizados)}
                  subtitle="Itens com CATMAT vinculado"
                  icon={<Package className="w-5 h-5 text-[#0E5C4C]" />}
                />
                <KpiCard
                  title="Lotes Bloqueados"
                  value={String(metricas.lotes_em_quarentena_ou_bloqueio)}
                  subtitle={`Quarentena ou recall · ${metricas.lotes_vencidos} vencidos`}
                  icon={<ShieldAlert className="w-5 h-5 text-[#0E5C4C]" />}
                  trend={{ text: 'Controle sanitário', isAlert: metricas.lotes_em_quarentena_ou_bloqueio > 0 }}
                />
                <KpiCard
                  title="Ponto de Ressuprimento"
                  value={String(metricas.alertas_ponto_ressuprimento)}
                  subtitle="Medicamentos com estoque crítico"
                  icon={<AlertTriangle className="w-5 h-5 text-[#0E5C4C]" />}
                  trend={{ text: 'Ressuprimento', isAlert: metricas.alertas_ponto_ressuprimento > 0 }}
                />
              </div>

              {/* Tabela de Produtos Padronizados (Catálogo CATMAT) */}
              <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl p-5 shadow-[0_1px_2px_rgba(27,31,28,0.05)] flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[#1B1F1C] flex items-center gap-2">
                      <Database className="w-5 h-5 text-[#1B1F1C]/55" />
                      Catálogo Municipal de Medicamentos (Itaquiraí-MS)
                    </h2>
                    <p className="text-xs text-[#1B1F1C]/70">
                      Vínculo compulsório ao CATMAT (Compras.gov.br) com rastreabilidade da menor unidade dispensável.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <Search className="w-4 h-4 text-[#1B1F1C]/70 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar por nome ou CATMAT..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] text-xs rounded-xl pl-9 pr-4 min-h-[40px] w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#0E5C4C]/20 focus:border-[#0E5C4C]"
                      />
                    </div>

                    {localAtivo?.tipo === 'FARMACIA_UBS' && (
                      <button
                        onClick={() => setModalNovaSolicitacao(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white rounded-xl text-xs font-semibold transition"
                      >
                        <Plus className="w-4 h-4" />
                        Solicitar à CAF
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[#1B1F1C]/65 border-b border-[#1B1F1C]/[0.08] font-bold uppercase tracking-wider text-[10.5px]">
                      <tr>
                        <th className="py-3 px-4">Medicamento / Princípio Ativo</th>
                        <th className="py-3 px-3">Código CATMAT</th>
                        <th className="py-3 px-3">Unidade Base</th>
                        <th className="py-3 px-3 text-right">Saldo Local</th>
                        <th className="py-3 px-3">Regulamentação</th>
                        <th className="py-3 px-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1B1F1C]/[0.08] text-[#1B1F1C]/80">
                      {produtos
                        .filter(p => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()) || p.codigo_catmat.toLowerCase().includes(busca.toLowerCase()))
                        .map(produto => {
                          const lotesProd = lotes.filter(l => l.produto_id === produto.id);
                          const saldoNaUnidade = lotesProd.reduce((acc, l) => acc + (l.saldo_total || 0), 0);
                          const statusCritico = saldoNaUnidade <= produto.estoque_minimo_padrao;

                          return (
                            <tr key={produto.id} className="hover:bg-[#F6F3EC]/70 transition">
                              <td className="py-3 px-4">
                                <div className="font-bold text-[#1B1F1C]">{produto.nome}</div>
                                <div className="text-[11px] text-[#1B1F1C]/70">{produto.principio_ativo} — {produto.concentracao}</div>
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-mono text-[#1B1F1C] font-semibold bg-[#1B1F1C]/[0.05] px-2 py-0.5 rounded border border-[#1B1F1C]/12">
                                  {produto.codigo_catmat}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded bg-[#1B1F1C]/[0.06] text-[#1B1F1C]/80 font-semibold whitespace-nowrap">
                                  {produto.unidade_base}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span className={`font-bold ${statusCritico ? 'text-[#8A6A16]' : 'text-[#0E5C4C]'}`}>
                                  {saldoNaUnidade.toLocaleString('pt-BR')} {produto.unidade_base}
                                </span>
                                {statusCritico && (
                                  <div className="text-[10px] text-[#8A6A16] font-semibold">Abaixo do mín ({produto.estoque_minimo_padrao})</div>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {produto.controlado && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8A6A16]/10 text-[#8A6A16] border border-[#8A6A16]/25 font-semibold">
                                      Port. 344
                                    </span>
                                  )}
                                  {produto.termolabil && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1B1F1C]/[0.06] text-[#1B1F1C]/80 border border-[#1B1F1C]/12 flex items-center gap-1 font-semibold">
                                      <Snowflake className="w-2.5 h-2.5" /> 2°C a 8°C
                                    </span>
                                  )}
                                  {!produto.controlado && !produto.termolabil && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1B1F1C]/[0.06] text-[#1B1F1C]/70">Regular</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleAbrirPerfil(produto.id)}
                                  className="px-3 py-1.5 min-h-[36px] rounded-lg bg-white hover:bg-[#1B1F1C]/[0.06] text-[#1B1F1C] border border-[#1B1F1C]/12 font-bold text-[11px] inline-flex items-center gap-1.5 whitespace-nowrap transition"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#0E5C4C]" />
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
              <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl p-5 shadow-[0_1px_2px_rgba(27,31,28,0.05)] flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[#1B1F1C] flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#1B1F1C]/55" />
                      Fluxo de Solicitações e Reposição (UBS → CAF Central)
                    </h2>
                    <p className="text-xs text-[#1B1F1C]/70">
                      As 9 UBS solicitam reposição em unidades base. A CAF Central efetua a separação obrigatória por FEFO.
                    </p>
                  </div>

                  <button
                    onClick={() => setModalNovaSolicitacao(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white rounded-xl text-xs font-semibold transition"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Solicitação
                  </button>
                </div>

                <div className="divide-y divide-[#1B1F1C]/[0.08]">
                  {solicitacoes.length === 0 ? (
                    <div className="py-8 text-center text-[#1B1F1C]/65 text-xs">Nenhuma solicitação em andamento no momento.</div>
                  ) : (
                    solicitacoes.map(sol => (
                      <div key={sol.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#1B1F1C] bg-[#1B1F1C]/[0.05] px-2 py-0.5 rounded border border-[#1B1F1C]/12">
                              {sol.numero_solicitacao}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                              sol.status === 'ENVIADA' ? 'bg-[#8A6A16]/10 text-[#8A6A16] border-[#8A6A16]/25' :
                              sol.status === 'LIBERADA' ? 'bg-[#1B1F1C]/[0.06] text-[#1B1F1C]/80 border-[#1B1F1C]/15' :
                              sol.status === 'RECEBIDA' ? 'bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border-[#0E5C4C]/25' :
                              'bg-[#1B1F1C]/[0.06] text-[#1B1F1C]/70 border-[#1B1F1C]/15'
                            }`}>
                              {sol.status}
                            </span>
                          </div>
                          <div className="text-xs text-[#1B1F1C]/80">
                            <strong>{sol.local_solicitante_nome}</strong> solicita para <strong>{sol.local_origem_nome}</strong>
                          </div>
                          <div className="text-[11px] text-[#1B1F1C]/65">
                            Criado em: {new Date(sol.criado_em).toLocaleString('pt-BR')} por {sol.solicitado_por}
                          </div>
                          {sol.itens.map(it => (
                            <div key={it.id} className="text-[11px] text-[#1B1F1C]/70 mt-1">
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
                              className="px-3 py-1.5 bg-marca hover:bg-marca-hover text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                            >
                              <Boxes className="w-3.5 h-3.5" />
                              Separar por FEFO (CAF)
                            </button>
                          )}

                          {sol.status === 'LIBERADA' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-[#1B1F1C]/80 bg-[#1B1F1C]/[0.06] px-2 py-1 rounded-full border border-[#1B1F1C]/12 flex items-center gap-1">
                                <Truck className="w-3 h-3 animate-pulse" /> Em Trânsito
                              </span>
                              <button
                                onClick={() => handleConfirmarRecebimento(sol.id)}
                                className="px-3 py-1.5 bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white rounded-xl text-xs font-semibold transition"
                              >
                                Confirmar Recebimento na UBS
                              </button>
                            </div>
                          )}

                          {sol.status === 'RECEBIDA' && (
                            <span className="text-xs text-[#0E5C4C] font-bold flex items-center gap-1">
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
              <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl p-5 shadow-[0_1px_2px_rgba(27,31,28,0.05)] flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[#1B1F1C] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#1B1F1C]/55" />
                      Motor de Validade FEFO (First Expired, First Out)
                    </h2>
                    <p className="text-xs text-[#1B1F1C]/70">
                      Lotes ordenados estritamente por validade ascendente. Destaque regulatório para itens ≤ 30, ≤ 60 e ≤ 90 dias.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[#1B1F1C]/65 border-b border-[#1B1F1C]/[0.08] font-bold uppercase tracking-wider text-[10.5px]">
                      <tr>
                        <th className="py-3 px-4">Medicamento / Lote</th>
                        <th className="py-3 px-3">Fabricante</th>
                        <th className="py-3 px-3">Data de Validade</th>
                        <th className="py-3 px-3">Classificação FEFO</th>
                        <th className="py-3 px-3 text-right">Saldo Base</th>
                        <th className="py-3 px-3">Status Sanitário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1B1F1C]/[0.08] text-[#1B1F1C]/80">
                      {lotes.map(lote => {
                        const classeVal = FefoEngine.classificarValidade(lote.data_validade);
                        return (
                          <tr key={lote.id} className="hover:bg-[#F6F3EC]/70 transition">
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#1B1F1C]">{lote.produto_nome}</div>
                              <div className="font-mono text-[11px] text-[#1B1F1C]/70">Lote: {lote.numero_lote}</div>
                            </td>
                            <td className="py-3 px-3 text-[#1B1F1C]/70">{lote.fabricante}</td>
                            <td className="py-3 px-3 font-mono font-medium text-[#1B1F1C]">
                              {lote.data_validade}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${classeVal.badgeColor}`}>
                                {classeVal.label}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-[#1B1F1C]">
                              {(lote.saldo_total || 0).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                lote.status === 'LIBERADO' ? 'bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border border-[#0E5C4C]/25' :
                                lote.status === 'QUARENTENA' ? 'bg-[#8A6A16]/10 text-[#8A6A16] border border-[#8A6A16]/25' :
                                'bg-[#9C3B2E]/[0.08] text-[#9C3B2E] border border-[#9C3B2E]/25'
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
              <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl p-5 shadow-[0_1px_2px_rgba(27,31,28,0.05)] flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[#1B1F1C] flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-[#1B1F1C]/55" />
                      Importação de NF-e 4.0 Real & Conferência Cega
                    </h2>
                    <p className="text-xs text-[#1B1F1C]/70">
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
                    className="flex items-center gap-2 px-4 py-2 bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white rounded-xl text-xs font-semibold transition"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Arquivo XML (NF-e 4.0)
                  </button>
                </div>

                {nfeProcessada ? (
                  <div className="border border-[#1B1F1C]/12 bg-[#F6F3EC]/60 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex flex-wrap justify-between items-center bg-white border border-[#1B1F1C]/[0.08] p-3 rounded-lg text-xs text-[#1B1F1C]/80">
                      <div>
                        <strong>Emitente:</strong> {nfeProcessada.nfe.emitenteNome} (CNPJ: {nfeProcessada.nfe.emitenteCnpj})
                      </div>
                      <div>
                        <strong>NF-e:</strong> {nfeProcessada.nfe.numero} (Série {nfeProcessada.nfe.serie}) — <strong>Total:</strong> R$ {nfeProcessada.nfe.valorTotal.toFixed(2)}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-[#8A6A16] flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Conferência Cega do Almoxarifado (Digite a contagem física real)
                    </h3>

                    <div className="space-y-3">
                      {nfeProcessada.itens.map(it => (
                        <div key={it.nItem} className="bg-white p-3 rounded-lg border border-[#1B1F1C]/12 text-xs flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-[#1B1F1C]">{it.xProd}</div>
                            <div className="text-[11px] text-[#1B1F1C]/70">Código Fornecedor: {it.cProd} — Unidade Comercial: {it.uCom}</div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div>
                              <label className="text-[10px] text-[#1B1F1C]/70 block">Lote Contado</label>
                              <input
                                type="text"
                                value={contagemCega[it.nItem]?.lote || ''}
                                onChange={(e) => setContagemCega(prev => ({
                                  ...prev,
                                  [it.nItem]: { ...prev[it.nItem], lote: e.target.value }
                                }))}
                                placeholder="Digite o Lote"
                                className="bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-2 py-1 rounded text-xs w-32"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-[#1B1F1C]/70 block">Validade</label>
                              <input
                                type="date"
                                value={contagemCega[it.nItem]?.validade || ''}
                                onChange={(e) => setContagemCega(prev => ({
                                  ...prev,
                                  [it.nItem]: { ...prev[it.nItem], validade: e.target.value }
                                }))}
                                className="bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-2 py-1 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-[#1B1F1C]/70 block">Quantidade</label>
                              <input
                                type="number"
                                value={contagemCega[it.nItem]?.qtd || 0}
                                onChange={(e) => setContagemCega(prev => ({
                                  ...prev,
                                  [it.nItem]: { ...prev[it.nItem], qtd: Number(e.target.value) }
                                }))}
                                className="bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-2 py-1 rounded text-xs w-20"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-2">
                      <button
                        onClick={() => setNfeProcessada(null)}
                        className="px-4 py-2 min-h-[40px] bg-white hover:bg-[#1B1F1C]/[0.06] text-[#1B1F1C] border border-[#1B1F1C]/12 rounded-xl text-xs font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleConfirmarEntradaNfe}
                        className="px-4 py-2 bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white rounded-xl text-xs font-bold"
                      >
                        Aprovar Conferência & Efetivar Entrada CAF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 border-2 border-dashed border-[#1B1F1C]/15 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                    <FileCode className="w-12 h-12 text-[#1B1F1C]/35 mb-3" />
                    <div className="text-sm font-semibold text-[#1B1F1C]/80">Nenhuma NF-e em conferência</div>
                    <div className="text-xs text-[#1B1F1C]/65 max-w-sm mt-1">
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
              <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl p-5 shadow-[0_1px_2px_rgba(27,31,28,0.05)] flex flex-col gap-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#1B1F1C] flex items-center gap-2">
                    <User className="w-5 h-5 text-[#1B1F1C]/55" />
                    Dispensação de Medicamento ao Paciente (Farmácia UBS)
                  </h2>
                  <p className="text-xs text-[#1B1F1C]/70">
                    Dispensação direta em unidade base (comprimidos). Cada dispensação alimenta o custeio da jornada do paciente no núcleo.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[#1B1F1C]/70 block mb-1">CPF do Paciente (Obrigatório)</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={dispensacaoCpf}
                      onChange={(e) => setDispensacaoCpf(e.target.value)}
                      className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E5C4C]/20 focus:border-[#0E5C4C]"
                    />
                  </div>
                  <div>
                    <label className="text-[#1B1F1C]/70 block mb-1">Nome do Paciente</label>
                    <input
                      type="text"
                      placeholder="Nome completo do cidadão"
                      value={dispensacaoNome}
                      onChange={(e) => setDispensacaoNome(e.target.value)}
                      className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E5C4C]/20 focus:border-[#0E5C4C]"
                    />
                  </div>
                  <div>
                    <label className="text-[#1B1F1C]/70 block mb-1">Medicamento Padronizado</label>
                    <select
                      value={dispensacaoProdId}
                      onChange={(e) => {
                        setDispensacaoProdId(e.target.value);
                        // Auto-sugere lote FEFO
                        const lotesDisponiveis = lotes.filter(l => l.produto_id === e.target.value && (l.saldo_total || 0) > 0);
                        const sug = FefoEngine.sugerirLoteFefo(lotesDisponiveis, 0);
                        if (sug?.loteSugerido) setDispensacaoLoteId(sug.loteSugerido.id);
                      }}
                      className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl focus:outline-none"
                    >
                      <option value="">Selecione o medicamento...</option>
                      {produtos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome} ({p.unidade_base})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[#1B1F1C]/70 block mb-1">Quantidade (Unidade Base / Comprimidos)</label>
                    <input
                      type="number"
                      value={dispensacaoQtd}
                      onChange={(e) => setDispensacaoQtd(Number(e.target.value))}
                      className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[#1B1F1C]/70 block mb-1">Nº Receita / Notificação (Portaria 344)</label>
                    <input
                      type="text"
                      placeholder="Ex: NOT-2026-9921"
                      value={dispensacaoReceita}
                      onChange={(e) => setDispensacaoReceita(e.target.value)}
                      className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[#1B1F1C]/70 block mb-1">Justificativa (Se houver desvio de FEFO)</label>
                    <input
                      type="text"
                      placeholder="Obrigatório caso não utilize o lote sugerido pelo FEFO"
                      value={dispensacaoJustificativa}
                      onChange={(e) => setDispensacaoJustificativa(e.target.value)}
                      className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleDispensarPaciente}
                    className="px-5 py-2.5 bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
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
              <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl p-5 shadow-[0_1px_2px_rgba(27,31,28,0.05)] flex flex-col gap-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-[#1B1F1C] flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#1B1F1C]/55" />
                    Módulo de Recall Sanitário & Bloqueio Imediato
                  </h2>
                  <p className="text-xs text-[#1B1F1C]/70">
                    Bloqueia instantaneamente um lote em todas as farmácias municipais de Itaquiraí e exibe a lista de pacientes que receberam o lote.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[#1B1F1C]/70 block mb-1">Lote a ser Bloqueado</label>
                    <select
                      value={modalRecallLoteId || ''}
                      onChange={(e) => setModalRecallLoteId(e.target.value)}
                      className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl"
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
                    <label className="text-[#1B1F1C]/70 block mb-1">Motivo Técnico / Alerta ANVISA</label>
                    <input
                      type="text"
                      placeholder="Ex: Resolução RE nº 1.420/2026 - Desvio de qualidade"
                      value={motivoRecall}
                      onChange={(e) => setMotivoRecall(e.target.value)}
                      className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleEfetuarRecall}
                    className="px-5 py-2.5 bg-[#9C3B2E] hover:bg-[#7E2F24] text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
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
              <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl p-5 shadow-[0_1px_2px_rgba(27,31,28,0.05)] flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[#1B1F1C] flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-[#1B1F1C]/55" />
                      Relatórios Gerenciais & Exportação Federal BNAFAR/Hórus
                    </h2>
                    <p className="text-xs text-[#1B1F1C]/70">
                      Geração de dados em conformidade com o Ministério da Saúde para prestação de contas do SUS.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadBnafar}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white rounded-xl text-xs font-semibold transition"
                  >
                    <Download className="w-4 h-4" />
                    Exportar BNAFAR/Hórus (CSV)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-2">
                  <div className="bg-[#F6F3EC]/60 p-4 rounded-xl border border-[#1B1F1C]/[0.08]">
                    <div className="text-[#1B1F1C]/70 font-medium">Curva A (Alto Valor)</div>
                    <div className="font-display text-xl font-semibold text-[#1B1F1C] mt-1">75% do Valor Total</div>
                    <div className="text-[11px] text-[#1B1F1C]/65 mt-1">Insulinas, Meropenem e Imunoglobulinas</div>
                  </div>
                  <div className="bg-[#F6F3EC]/60 p-4 rounded-xl border border-[#1B1F1C]/[0.08]">
                    <div className="text-[#1B1F1C]/70 font-medium">Curva B (Médio Impacto)</div>
                    <div className="font-display text-xl font-semibold text-[#1B1F1C] mt-1">15% do Valor Total</div>
                    <div className="text-[11px] text-[#1B1F1C]/65 mt-1">Antibióticos orais e anti-hipertensivos</div>
                  </div>
                  <div className="bg-[#F6F3EC]/60 p-4 rounded-xl border border-[#1B1F1C]/[0.08]">
                    <div className="text-[#1B1F1C]/70 font-medium">Curva C (Giro Rápido)</div>
                    <div className="font-display text-xl font-semibold text-[#1B1F1C] mt-1">10% do Valor Total</div>
                    <div className="text-[11px] text-[#1B1F1C]/65 mt-1">Dipirona, Paracetamol, Soro fisiológico</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ALERTA DE OVERRIDE FEFO COM JUSTIFICATIVA OBRIGATÓRIA */}
      {alertaOverrideVisivel && (
        <div className="fixed inset-0 z-50 bg-[#1B1F1C]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#8A6A16]/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_8px_24px_rgba(27,31,28,0.10),0_2px_8px_rgba(27,31,28,0.05)] flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[#8A6A16]">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-[#1B1F1C]">Alerta de Desvio de FEFO</h3>
                <p className="text-xs text-[#8A6A16]">Existe lote com validade mais próxima disponível no almoxarifado.</p>
              </div>
            </div>

            <div className="bg-[#F6F3EC]/60 p-3 rounded-xl border border-[#1B1F1C]/[0.08] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#1B1F1C]/70">Lote Sugerido pelo FEFO:</span>
                <span className="font-bold text-[#0E5C4C]">{alertaOverrideVisivel.loteSugerido.numero_lote} (Vence: {alertaOverrideVisivel.loteSugerido.data_validade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#1B1F1C]/70">Lote Selecionado pelo Operador:</span>
                <span className="font-bold text-[#8A6A16]">{alertaOverrideVisivel.loteEscolhido.numero_lote} (Vence: {alertaOverrideVisivel.loteEscolhido.data_validade})</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1B1F1C]/80 block mb-1">
                Justificativa Técnica Obrigatória (Mínimo 10 caracteres):
              </label>
              <textarea
                rows={3}
                value={justificativaOverrideFefo}
                onChange={(e) => setJustificativaOverrideFefo(e.target.value)}
                placeholder="Ex: Lote reservado por autorização clínica específica para protocolo especial..."
                className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] text-xs p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8A6A16]/20 focus:border-[#8A6A16]"
              />
              <div className="text-[11px] text-[#1B1F1C]/65 mt-1">
                Caracteres digitados: {justificativaOverrideFefo.trim().length} / 10 mínimos
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setAlertaOverrideVisivel(null)}
                className="px-4 py-2 min-h-[40px] bg-white hover:bg-[#1B1F1C]/[0.06] text-[#1B1F1C] border border-[#1B1F1C]/12 rounded-xl text-xs font-bold"
              >
                Voltar e Trocar Lote
              </button>
              <button
                disabled={justificativaOverrideFefo.trim().length < 10}
                onClick={handleConfirmarSeparacao}
                className="px-4 py-2 bg-[#8A6A16] hover:bg-[#6E5511] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition"
              >
                Confirmar Override Auditado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SEPARAÇÃO DE SOLICITAÇÃO NA CAF */}
      {modalSeparacao && (
        <div className="fixed inset-0 z-50 bg-[#1B1F1C]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl max-w-2xl w-full p-6 shadow-[0_8px_24px_rgba(27,31,28,0.10),0_2px_8px_rgba(27,31,28,0.05)] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#1B1F1C] flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-[#1B1F1C]/55" />
                  Separação de Medicamentos — {modalSeparacao.numero_solicitacao}
                </h3>
                <p className="text-xs text-[#1B1F1C]/70">Destino: {modalSeparacao.local_solicitante_nome}</p>
              </div>
              <button onClick={() => setModalSeparacao(null)} className="w-11 h-11 -mr-2 -mt-2 inline-flex items-center justify-center rounded-lg text-[#1B1F1C]/60 hover:text-[#1B1F1C] hover:bg-[#1B1F1C]/[0.06]" aria-label="Fechar">
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
                  <div key={item.id} className="bg-[#F6F3EC]/60 p-4 rounded-xl border border-[#1B1F1C]/[0.08] text-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#1B1F1C] text-sm">{item.produto_nome}</span>
                      <span className="text-[#1B1F1C] font-bold">{item.quantidade_solicitada} {item.unidade_base}</span>
                    </div>

                    <div>
                      <label className="text-[#1B1F1C]/70 block mb-1">Selecione o Lote (Sugerido por FEFO):</label>
                      <select
                        value={escolhidoId || ''}
                        onChange={(e) => setLoteEscolhidoSeparacao(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className={`w-full bg-white border px-3 py-2 min-h-[40px] rounded-xl text-xs ${
                          ehDesvio ? 'border-[#8A6A16] text-[#8A6A16]' : 'border-[#1B1F1C]/20 text-[#1B1F1C]'
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
                      <div className="p-2.5 rounded-lg bg-[#8A6A16]/[0.08] border border-[#8A6A16]/25 text-[11px] text-[#8A6A16] font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-[#8A6A16]" />
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
                className="px-4 py-2 min-h-[40px] bg-white hover:bg-[#1B1F1C]/[0.06] text-[#1B1F1C] border border-[#1B1F1C]/12 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarSeparacao}
                className="px-5 py-2.5 bg-marca hover:bg-marca-hover text-white rounded-xl text-xs font-bold"
              >
                Concluir Separação & Despachar Remessa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA SOLICITAÇÃO UBS -> CAF */}
      {modalNovaSolicitacao && (
        <div className="fixed inset-0 z-50 bg-[#1B1F1C]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#1B1F1C]/12 rounded-2xl max-w-md w-full p-6 shadow-[0_8px_24px_rgba(27,31,28,0.10),0_2px_8px_rgba(27,31,28,0.05)] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg font-semibold text-[#1B1F1C] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#1B1F1C]/55" />
                Nova Solicitação de Medicamentos
              </h3>
              <button onClick={() => setModalNovaSolicitacao(false)} className="w-11 h-11 -mr-2 -mt-2 inline-flex items-center justify-center rounded-lg text-[#1B1F1C]/60 hover:text-[#1B1F1C] hover:bg-[#1B1F1C]/[0.06]" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#1B1F1C]/70 block mb-1">Unidade Solicitante</label>
                <input
                  type="text"
                  disabled
                  value={localAtivo?.nome || ''}
                  className="w-full bg-[#F6F3EC] border border-[#1B1F1C]/12 text-[#1B1F1C]/70 px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[#1B1F1C]/70 block mb-1">Medicamento</label>
                <select
                  value={novaSolProdutoId}
                  onChange={(e) => setNovaSolProdutoId(e.target.value)}
                  className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl"
                >
                  <option value="">Selecione o medicamento...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} ({p.unidade_base})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#1B1F1C]/70 block mb-1">Quantidade Solicitada (Unidade Base)</label>
                <input
                  type="number"
                  value={novaSolQtd}
                  onChange={(e) => setNovaSolQtd(Number(e.target.value))}
                  className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[#1B1F1C]/70 block mb-1">Observações da UBS</label>
                <textarea
                  rows={2}
                  value={novaSolObs}
                  onChange={(e) => setNovaSolObs(e.target.value)}
                  placeholder="Ex: Reforço para campanha de vacinação / Hipertensos cadastrados"
                  className="w-full bg-white border border-[#1B1F1C]/20 text-[#1B1F1C] px-3 py-2 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setModalNovaSolicitacao(false)}
                className="px-4 py-2 min-h-[40px] bg-white hover:bg-[#1B1F1C]/[0.06] text-[#1B1F1C] border border-[#1B1F1C]/12 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCriarSolicitacao}
                className="px-4 py-2 bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white rounded-xl text-xs font-bold"
              >
                Enviar à CAF Central
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAVETA LATERAL: PERFIL COMPLETO DO MEDICAMENTO & RASTREABILIDADE */}
      {perfilMedicamentoId && dadosPerfil && (
        <div className="fixed inset-0 z-50 bg-[#1B1F1C]/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white border-l border-[#1B1F1C]/12 w-full max-w-xl h-full p-6 overflow-y-auto flex flex-col gap-6 shadow-[0_8px_24px_rgba(27,31,28,0.10),0_2px_8px_rgba(27,31,28,0.05)] animate-slide-left">
            <div className="flex justify-between items-start border-b border-[#1B1F1C]/[0.08] pb-4">
              <div>
                <span className="text-[11px] font-mono text-[#1B1F1C] bg-[#1B1F1C]/[0.05] px-2 py-0.5 rounded border border-[#1B1F1C]/12">
                  {dadosPerfil.produto.codigo_catmat}
                </span>
                <h3 className="font-display text-lg font-semibold text-[#1B1F1C] mt-1">{dadosPerfil.produto.nome}</h3>
                <p className="text-xs text-[#1B1F1C]/70">{dadosPerfil.produto.principio_ativo} — {dadosPerfil.produto.concentracao}</p>
              </div>
              <button onClick={() => setPerfilMedicamentoId(null)} className="w-11 h-11 -mr-2 -mt-2 inline-flex items-center justify-center rounded-lg text-[#1B1F1C]/60 hover:text-[#1B1F1C] hover:bg-[#1B1F1C]/[0.06]" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ficha CATMAT */}
            {dadosPerfil.catmat && (
              <div className="bg-[#F6F3EC]/60 p-4 rounded-xl border border-[#1B1F1C]/[0.08] text-xs flex flex-col gap-1.5">
                <div className="font-bold text-[#1B1F1C]/80 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#1B1F1C]/55" />
                  Dados Oficiais CATMAT (Compras.gov.br)
                </div>
                <div className="text-[#1B1F1C]/70">{dadosPerfil.catmat.descricao}</div>
                <div className="text-[11px] text-[#1B1F1C]/65">PDM: {dadosPerfil.catmat.nome_pdm} | Classe: {dadosPerfil.catmat.classe_pdm}</div>
              </div>
            )}

            {/* Saldo Consolidado por Estabelecimento (CAF + 9 UBS de Itaquiraí) */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-[#1B1F1C] uppercase tracking-wider">
                Distribuição de Saldos nos 10 Estabelecimentos de Saúde
              </h4>
              <div className="bg-white rounded-xl border border-[#1B1F1C]/12 divide-y divide-[#1B1F1C]/[0.08] text-xs">
                {dadosPerfil.saldosPorLocal.map(loc => (
                  <div key={loc.localId} className="p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-[#1B1F1C]">{loc.localNome}</div>
                      <div className="text-[10px] text-[#1B1F1C]/65">CNES: {loc.cnes}</div>
                    </div>
                    <span className="font-bold text-[#1B1F1C]">
                      {loc.saldo.toLocaleString('pt-BR')} {dadosPerfil.produto.unidade_base}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Linha do Tempo de Rastreabilidade (NF -> UBS -> Paciente) */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-[#1B1F1C] uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-[#1B1F1C]/55" />
                Trilha de Auditoria & Rastreabilidade de Movimentações
              </h4>
              <div className="space-y-2">
                {dadosPerfil.historicoMovimentacoes.length === 0 ? (
                  <div className="text-xs text-[#1B1F1C]/65 py-3 text-center">Nenhuma movimentação registrada.</div>
                ) : (
                  dadosPerfil.historicoMovimentacoes.map(mov => (
                    <div key={mov.id} className="p-3 bg-[#F6F3EC]/60 border border-[#1B1F1C]/[0.08] rounded-xl text-xs flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#1B1F1C]">{mov.tipo}</span>
                        <span className="text-[10px] text-[#1B1F1C]/65">{new Date(mov.dataHora).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="text-[#1B1F1C]/80">
                        Qtd: <strong>{mov.quantidade}</strong> | Lote: <strong>{mov.numeroLote}</strong>
                      </div>
                      <div className="text-[11px] text-[#1B1F1C]/70">
                        {mov.origem && `Origem: ${mov.origem}`} {mov.destino && `→ Destino: ${mov.destino}`}
                      </div>
                      {mov.justificativa && (
                        <div className="text-[10px] text-[#8A6A16] bg-[#8A6A16]/[0.08] p-1.5 rounded mt-1">
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
    </>
  );
}
