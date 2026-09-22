'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { KpiCard, IconBadge } from '../../components/KpiCard';
import {
  FileText,
  ShoppingCart,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Search,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  BookOpen,
  History,
  Check,
  XCircle,
  Scale,
  RefreshCw,
  UserCheck,
  Menu,
  X,
  LayoutDashboard,
  Settings,
  ChevronRight,
  ArrowLeft,
  PackageCheck,
  Truck,
  Thermometer,
  Calendar,
  AlertTriangle,
  ClipboardCheck,
  FileCheck2,
  ExternalLink,
  Copy,
  BadgeAlert,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Printer,
  FileSpreadsheet,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';

type PerfilCompras = 'compras_operador' | 'compras_auditor_cmed' | 'compras_admin';
type SecaoModulo = 'visao_geral' | 'atas' | 'validador_cmed' | 'comparativo_lote' | 'empenhos' | 'confirmar_entrega' | 'chamados' | 'ocorrencias' | 'logs' | 'parametros';

const SEED_PDC_PADRAO = {
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
};

export default function VigiaComprasPage() {
  // Controle de Navegação do Produto Único
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoModulo>('visao_geral');
  const [perfilAtivo, setPerfilAtivo] = useState<PerfilCompras>('compras_auditor_cmed');

  // Estados de Dados da API
  const [atas, setAtas] = useState<any[]>([]);
  const [pedidosCompra, setPedidosCompra] = useState<any[]>([SEED_PDC_PADRAO]);
  const [metricas, setMetricas] = useState<any>(null);
  const [chamados, setChamados] = useState<any[]>([]);
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState('');

  // Estados de Empenho
  const [itemSelecionado, setItemSelecionado] = useState<any | null>(null);
  const [qtdEmpenho, setQtdEmpenho] = useState<number>(100);
  const [tipoAdesao, setTipoAdesao] = useState<'ORGAO_GERENCIADOR' | 'CARONA_ADESAO'>('ORGAO_GERENCIADOR');
  const [resultadoEmpenho, setResultadoEmpenho] = useState<any | null>(null);
  const [submittingEmpenho, setSubmittingEmpenho] = useState(false);

  // Estados do Validador CMED/BPS/CATMAT (Skill Oficial)
  const [catmatInput, setCatmatInput] = useState('BR0284729');
  const [nomeMedInput, setNomeMedInput] = useState('Meropenem 1g Pó Liofilizado Injetável');
  const [precoPropostoInput, setPrecoPropostoInput] = useState('48.50');
  const [resultadoValidacao, setResultadoValidacao] = useState<any | null>(null);
  const [validandoPreco, setValidandoPreco] = useState(false);

  // Estados do Comparativo em Larga Escala (Módulo 01 Multi-Medicamentos)
  const [cestaLote, setCestaLote] = useState<any>(null);
  const [cotacoesDisponiveis, setCotacoesDisponiveis] = useState<any[]>([]);
  const [cotacaoSelecionadaId, setCotacaoSelecionadaId] = useState<string>('COT-2026-089');
  const [filtroSemaforoLote, setFiltroSemaforoLote] = useState<'TODOS' | 'EXCELENTE' | 'ATENÇÃO' | 'IRREGULAR'>('TODOS');
  const [buscaLote, setBuscaLote] = useState<string>('');
  const [itemLoteExpandidoId, setItemLoteExpandidoId] = useState<string | null>(null);
  const [loadingLote, setLoadingLote] = useState<boolean>(false);
  const [modalImportarLoteAberto, setModalImportarLoteAberto] = useState<boolean>(false);
  const [modalParecerTcuAberto, setModalParecerTcuAberto] = useState<boolean>(false);
  const [textoCsvImportacao, setTextoCsvImportacao] = useState<string>('');
  const [hashCopiado, setHashCopiado] = useState<boolean>(false);

  // Estados de Confirmação de Entrega (PdC)
  const [pdcSelecionadoId, setPdcSelecionadoId] = useState<string>('pdc-001');
  const [confirmandoEntrega, setConfirmandoEntrega] = useState(false);
  const [feedbackEntrega, setFeedbackEntrega] = useState<any | null>(null);
  const [showModalTermoRecebimento, setShowModalTermoRecebimento] = useState(false);
  const [fiscalNome, setFiscalNome] = useState('Dra. Amanda Nogueira (CRF-SP 48.912)');
  const [fiscalCargo, setFiscalCargo] = useState('Fiscal Técnico do Contrato / Farmacêutica');
  const [observacoesRecebimento, setObservacoesRecebimento] = useState('Carga conferida com 100% de integridade física. Temperatura e lacres em estrita conformidade.');
  const [copiadoChave, setCopiadoChave] = useState(false);

  // Checklist de Conferência do PdC
  const [checklist, setChecklist] = useState({
    danfe_conferida: true,
    embalagem_integra: true,
    lote_validade_ok: true,
    temperatura_conforme: true,
    laudo_fabricante_anexo: true
  });

  // Estados de Modais
  const [showModalChamado, setShowModalChamado] = useState(false);
  const [novoChamadoTitulo, setNovoChamadoTitulo] = useState('');
  const [novoChamadoDescricao, setNovoChamadoDescricao] = useState('');
  const [novoChamadoPrioridade, setNovoChamadoPrioridade] = useState<'baixa' | 'media' | 'alta' | 'critica_bloqueante'>('media');
  const [salvandoChamado, setSalvandoChamado] = useState(false);

  const [showModalOcorrencia, setShowModalOcorrencia] = useState(false);
  const [novaOcorrenciaRelato, setNovaOcorrenciaRelato] = useState('');
  const [novaOcorrenciaProvidencias, setNovaOcorrenciaProvidencias] = useState('');
  const [novaOcorrenciaTurno, setNovaOcorrenciaTurno] = useState('manha');
  const [novaOcorrenciaGravidade, setNovaOcorrenciaGravidade] = useState<'informativa' | 'atencao' | 'grave' | 'critica_emergencial'>('atencao');
  const [salvandoOcorrencia, setSalvandoOcorrencia] = useState(false);

  // Carregamento inicial de dados da API
  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/compras-atas');
      const data = await res.json();
      if (data.success) {
        setAtas(data.atas || []);
        if (data.pedidos_compra && data.pedidos_compra.length > 0) {
          setPedidosCompra(data.pedidos_compra);
        }
        setMetricas(data.metricas || null);
        setChamados(data.chamados_recentes || []);
        setOcorrencias(data.ocorrencias_recentes || []);
        setLogs(data.logs_recentes || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de compras:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
    carregarComparativoLote('COT-2026-089');
  }, []);

  // Carregamento do Comparativo em Larga Escala
  const carregarComparativoLote = async (cotacaoId?: string) => {
    try {
      setLoadingLote(true);
      const id = cotacaoId || cotacaoSelecionadaId || 'COT-2026-089';
      const res = await fetch(`/api/compras-atas?tipo=comparativo_lote&cotacao_id=${id}`);
      const data = await res.json();
      if (data.success) {
        setCestaLote(data.cesta);
        setCotacoesDisponiveis(data.cotacoes_disponiveis || []);
        if (cotacaoId) setCotacaoSelecionadaId(cotacaoId);
      }
    } catch (err) {
      console.error('Erro ao carregar comparativo de lote:', err);
    } finally {
      setLoadingLote(false);
    }
  };

  const handleImportarLoteCsv = async () => {
    try {
      setLoadingLote(true);
      const linhas = textoCsvImportacao.trim().split('\n').filter(l => l.trim().length > 0);
      let itensParaEnviar: any[] = [];

      if (linhas.length > 0) {
        itensParaEnviar = linhas.map((linha, idx) => {
          const partes = linha.split(/[,;\t]/).map(p => p.trim());
          return {
            descricao_medicamento: partes[0] || `Medicamento Lote Especial ${idx + 1}`,
            codigo_catmat: partes[1] || `BR0${Math.floor(100000 + Math.random() * 900000)}`,
            quantidade: Number(partes[2]) || 5000,
            menor_preco: Number(partes[3]) || 18.50,
            fornecedor_lider: partes[4] || 'Proponente Principal S/A',
            preco_cmed_teto: Number(partes[5]) || ((Number(partes[3]) || 18.50) * 1.35),
            preco_bps_mediana: Number(partes[6]) || ((Number(partes[3]) || 18.50) * 1.08),
          };
        });
      } else {
        itensParaEnviar = [
          { descricao_medicamento: 'Levofloxacino 500mg Injetável 100mL', codigo_catmat: 'BR0319802', quantidade: 8000, menor_preco: 14.20, fornecedor_lider: 'Eurofarma Laboratórios S.A.', preco_cmed_teto: 22.00, preco_bps_mediana: 16.50 },
          { descricao_medicamento: 'Sulfato de Atropina 0,5mg/mL Ampola 1mL', codigo_catmat: 'BR0284102', quantidade: 20000, menor_preco: 1.85, fornecedor_lider: 'Cristália Químicos Farmacêuticos', preco_cmed_teto: 2.90, preco_bps_mediana: 2.10 },
          { descricao_medicamento: 'Cloridrato de Dobutamina 12,5mg/mL 20mL', codigo_catmat: 'BR0291180', quantidade: 6000, menor_preco: 21.50, fornecedor_lider: 'União Química Farmacêutica', preco_cmed_teto: 29.80, preco_bps_mediana: 23.40 },
          { descricao_medicamento: 'Albumina Humana 20% Frasco 50mL', codigo_catmat: 'BR0348911', quantidade: 2500, menor_preco: 285.00, fornecedor_lider: 'BioGenética Hospitalar Ltda', preco_cmed_teto: 340.00, preco_bps_mediana: 305.00 },
          { descricao_medicamento: 'Acetato de Caspofungina 50mg Frasco', codigo_catmat: 'BR0351299', quantidade: 1200, menor_preco: 420.00, fornecedor_lider: 'Medicor Hospitalar Distribuição', preco_cmed_teto: 490.00, preco_bps_mediana: 445.00 }
        ];
      }

      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'comparativo_lote_importar',
          titulo: 'Lote Importado: Cesta Hospitalar Especial de Injetáveis',
          orgao_demandante: 'Hospital Central 360 / Almoxarifado Central',
          usuario_email: 'auditor.cmed@hospital360.com.br',
          perfil_ativo: perfilAtivo,
          itens: itensParaEnviar
        })
      });

      const data = await res.json();
      if (data.success && data.cesta) {
        setCestaLote(data.cesta);
        setCotacaoSelecionadaId(data.cesta.codigo_cotacao);
        setModalImportarLoteAberto(false);
        setTextoCsvImportacao('');
      }
    } catch (err) {
      console.error('Erro ao importar lote:', err);
    } finally {
      setLoadingLote(false);
    }
  };

  // Executar Validação CMED
  const handleValidarPreco = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setValidandoPreco(true);
      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'validar_preco',
          codigo_catmat: catmatInput,
          nome_medicamento: nomeMedInput,
          preco_proposto: Number(precoPropostoInput),
          fornecedor_cnpj: '12.345.678/0001-90',
          fornecedor_razao_social: 'Distribuidora Farmacêutica Nacional',
          perfil_ativo: perfilAtivo
        })
      });
      const data = await res.json();
      if (data.success) {
        setResultadoValidacao(data.resultado);
      }
    } catch (err) {
      console.error('Erro ao validar preço CMED:', err);
    } finally {
      setValidandoPreco(false);
    }
  };

  // Emitir Empenho
  const handleEmitirEmpenho = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemSelecionado) return;

    try {
      setSubmittingEmpenho(true);
      setResultadoEmpenho(null);
      const ataPai = atas.find(a => a.itens.some((i: any) => i.id === itemSelecionado.id));

      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'emitir_empenho',
          ata_id: ataPai?.id,
          item_id: itemSelecionado.id,
          quantidade_empenho: Number(qtdEmpenho),
          orgao_demandante: tipoAdesao === 'CARONA_ADESAO' ? 'Hospital Regional (Carona)' : 'Hospital Central 360',
          tipo_adesao: tipoAdesao,
          perfil_ativo: perfilAtivo
        })
      });

      const data = await res.json();
      setResultadoEmpenho(data);
      if (data.success) {
        carregarDados();
      }
    } catch (err: any) {
      setResultadoEmpenho({ success: false, error: err.message });
    } finally {
      setSubmittingEmpenho(false);
    }
  };

  // Confirmar Entrega do Pedido de Compra (PdC)
  const handleConfirmarEntregaPdC = async () => {
    try {
      setConfirmandoEntrega(true);
      setFeedbackEntrega(null);

      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'confirmar_entrega_pdc',
          pdc_id: pdcSelecionadoId,
          fiscal_nome: fiscalNome,
          fiscal_cargo: fiscalCargo,
          tipo_recebimento: 'provisorio',
          observacoes: observacoesRecebimento,
          perfil_ativo: perfilAtivo
        })
      });

      const data = await res.json();
      setFeedbackEntrega(data);
      if (data.success) {
        setShowModalTermoRecebimento(false);
        carregarDados();
      }
    } catch (err: any) {
      setFeedbackEntrega({ success: false, error: err.message });
    } finally {
      setConfirmandoEntrega(false);
    }
  };

  // Salvar Novo Chamado
  const handleSalvarChamado = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvandoChamado(true);
      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'abrir_chamado',
          titulo: novoChamadoTitulo,
          descricao: novoChamadoDescricao,
          prioridade: novoChamadoPrioridade,
          setor: 'Setor de Compras e Atas',
          autor_nome: perfilAtivo === 'compras_admin' ? 'Administrador de Compras' : perfilAtivo === 'compras_auditor_cmed' ? 'Auditor Regulatório CMED' : 'Operador de Compras',
          autor_perfil: perfilAtivo
        })
      });
      const data = await res.json();
      if (data.success) {
        setNovoChamadoTitulo('');
        setNovoChamadoDescricao('');
        setShowModalChamado(false);
        carregarDados();
      }
    } catch (err) {
      console.error('Erro ao salvar chamado:', err);
    } finally {
      setSalvandoChamado(false);
    }
  };

  // Salvar Nova Ocorrência
  const handleSalvarOcorrencia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvandoOcorrencia(true);
      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'registrar_ocorrencia',
          relato: novaOcorrenciaRelato,
          providencias: novaOcorrenciaProvidencias,
          turno: novaOcorrenciaTurno,
          gravidade: novaOcorrenciaGravidade,
          autor_nome: perfilAtivo === 'compras_admin' ? 'Coordenador de Compras' : 'Operador / Auditor',
          autor_perfil: perfilAtivo
        })
      });
      const data = await res.json();
      if (data.success) {
        setNovaOcorrenciaRelato('');
        setNovaOcorrenciaProvidencias('');
        setShowModalOcorrencia(false);
        carregarDados();
      }
    } catch (err) {
      console.error('Erro ao salvar ocorrência:', err);
    } finally {
      setSalvandoOcorrencia(false);
    }
  };

  const copiarChaveDanfe = (chave: string) => {
    navigator.clipboard.writeText(chave.replace(/\s+/g, ''));
    setCopiadoChave(true);
    setTimeout(() => setCopiadoChave(false), 2000);
  };

  const todosItens = atas.flatMap(a => a.itens.map((i: any) => ({
    ...i,
    numero_ata: a.numero_ata,
    fornecedor: a.fornecedor_razao_social
  }))).filter((i: any) =>
    i.descricao_medicamento.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    i.codigo_catmat.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    i.principio_ativo.toLowerCase().includes(filtroBusca.toLowerCase())
  );

  const pdcAtivo = (pedidosCompra && pedidosCompra.length > 0)
    ? (pedidosCompra.find(p => p.id === pdcSelecionadoId || p.numero_pdc === pdcSelecionadoId) || pedidosCompra[0])
    : SEED_PDC_PADRAO;

  // Menu do Produto Único com Cores Vivas e Significados da Saúde
  const menuItens = [
    {
      id: 'visao_geral',
      label: 'Visão Geral & Métricas',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'confirmar_entrega',
      label: 'Confirmar Entrega (PdC)',
      icon: PackageCheck,
      badge: pedidosCompra.filter(p => p.status === 'AGUARDANDO_RECEBIMENTO').length > 0 ? '1 Pendente' : null,
      badgeCor: 'bg-emerald-600 text-white shadow-xs'
    },
    {
      id: 'atas',
      label: 'Atas SRP & Itens Homologados',
      icon: FileText,
      badge: atas.length > 0 ? `${atas.length}` : null,
      badgeCor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'validador_cmed',
      label: 'Validador CMED / BPS / CATMAT',
      icon: Scale,
      badge: 'Skill IA',
      badgeCor: 'bg-amber-500 text-white font-bold'
    },
    {
      id: 'comparativo_lote',
      label: 'Comparativo em Larga Escala',
      icon: Layers,
      badge: 'Lote IA',
      badgeCor: 'bg-[#1A56DB] text-white font-bold shadow-xs'
    },
    {
      id: 'empenhos',
      label: 'Emissão de Empenhos & Caronas',
      icon: ShoppingCart,
      badge: 'Lei 14.133',
      badgeCor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'chamados',
      label: 'Central de Chamados & OS',
      icon: HelpCircle,
      badge: chamados.length > 0 ? `${chamados.length}` : null,
      badgeCor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'ocorrencias',
      label: 'Livro de Ocorrências Digital',
      icon: BookOpen,
      badge: ocorrencias.length > 0 ? `${ocorrencias.length}` : null,
      badgeCor: 'bg-amber-100 text-amber-900'
    },
    {
      id: 'logs',
      label: 'Trilha de Auditoria (Logs WORM)',
      icon: History,
      badge: null
    },
    {
      id: 'parametros',
      label: 'Parâmetros & Regras Legais',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* 1. CABEÇALHO DO PRODUTO ÚNICO */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 px-4 lg:px-6 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {/* Botão Hamburger para alternar o Menu do Módulo */}
          <button
            onClick={() => setSidebarAberta(!sidebarAberta)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer focus:ring-2 focus:ring-blue-600 focus:outline-none"
            title={sidebarAberta ? 'Recolher Menu do Módulo' : 'Expandir Menu do Módulo'}
            aria-label="Alternar Menu do Módulo"
          >
            {sidebarAberta ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>

          {/* Identidade do Produto Único */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1A56DB] flex items-center justify-center text-white shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 tracking-tight">Vigia Compras & Atas SRP</span>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#1A56DB] px-2 py-0.5 rounded-full border border-blue-200/80">
                  Lei 14.133/21
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-[#0E9F6E] animate-pulse"></span>
                  Supabase Oficial
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Gestão de Atas, Travas CMED e Confirmação de Entrega (PdC)
              </p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas + Seletor de Perfil do Módulo */}
        <div className="flex items-center gap-2.5">
          {/* Ação de Destaque: Confirmar Entrega */}
          <button
            onClick={() => setSecaoAtiva('confirmar_entrega')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Confirmar Entrega</span>
            <span className="md:hidden">Entrega</span>
          </button>

          <button
            onClick={() => setSecaoAtiva('validador_cmed')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1A56DB] text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Validar Preço CMED</span>
          </button>

          {/* Seletor de Perfil do Módulo (Escala cinza refinada, sem preto) */}
          <div className="flex items-center gap-1.5 bg-[#F5F5F5] px-2.5 py-1.5 rounded-xl border border-[#E0E0E0] text-xs">
            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
            <select
              value={perfilAtivo}
              onChange={(e) => setPerfilAtivo(e.target.value as PerfilCompras)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="compras_auditor_cmed">Auditor CMED / BPS</option>
              <option value="compras_operador">Operador de Compras</option>
              <option value="compras_admin">Administrador do Módulo</option>
            </select>
          </div>

          {/* Avatar Operacional (Azul Institucional em vez de preto) */}
          <div className="w-8 h-8 rounded-xl bg-[#1A56DB] text-white flex items-center justify-center text-xs font-bold shadow-xs border border-blue-600/30">
            VC
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CORPO PRINCIPAL COM SIDEBAR PRÓPRIA DO MÓDULO */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR DO PRODUTO ÚNICO */}
        <aside
          className={`${
            sidebarAberta ? 'w-72' : 'w-0 -translate-x-full lg:w-0 lg:-translate-x-full'
          } transition-all duration-300 ease-in-out bg-white border-r border-[#E0E0E0] flex flex-col z-30 overflow-y-auto shrink-0 shadow-xs`}
        >
          {/* Cabeçalho do Menu */}
          <div className="p-4 border-b border-[#E0E0E0] bg-[#F8FAFC]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Navegação do Módulo
            </div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              Compras & Recebimento Físico
            </div>
          </div>

          {/* Lista de Funcionalidades do Módulo com Escala Cinza Refinada */}
          <nav className="p-3 space-y-1.5 flex-1" aria-label="Menu Principal do Vigia Compras">
            {menuItens.map((item) => {
              const Icone = item.icon;
              const ativo = secaoAtiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSecaoAtiva(item.id as SecaoModulo)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                    ativo
                      ? 'bg-[#F0F4FF] text-[#1A56DB] font-bold border border-[#E0E0E0] shadow-2xs'
                      : 'text-slate-700 hover:bg-[#F5F5F5] hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icone
                      className={`w-4 h-4 shrink-0 ${
                        ativo
                          ? 'text-[#1A56DB]'
                          : item.id === 'confirmar_entrega'
                          ? 'text-[#0E9F6E]'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                        item.badgeCor || (ativo ? 'bg-[#1A56DB] text-white' : 'bg-[#F5F5F5] text-slate-700 border border-[#E0E0E0]')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Rodapé da Sidebar: Status Regulatório & Retorno ao Hub */}
          <div className="p-4 border-t border-[#E0E0E0] bg-[#F8FAFC] space-y-3">
            <div className="p-3 bg-white rounded-xl border border-[#E0E0E0] space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span>Perfil Ativo:</span>
                <span className="font-bold text-slate-900 uppercase">{perfilAtivo.replace('compras_', '')}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span>Base CMED:</span>
                <span className="font-bold text-[#0E9F6E]">Fev/2026 Vigente</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span>Trava Carona:</span>
                <span className="font-bold text-[#1A56DB]">50% por item</span>
              </div>
            </div>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-[#E0E0E0] bg-white text-slate-700 hover:text-slate-900 hover:bg-[#F5F5F5] text-xs font-bold transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Hub de Módulos</span>
            </Link>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 3. ÁREA DE CONTEÚDO PRINCIPAL (DEDICADA AO PRODUTO ÚNICO) */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Breadcrumb e Indicador da Seção Ativa */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Vigia Compras</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900">
                {menuItens.find((m) => m.id === secaoAtiva)?.label || 'Painel'}
              </span>
            </div>

            {/* Banner Informativo do Perfil Atual com Contraste */}
            <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200 font-medium shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#1A56DB] shrink-0" />
              <span>
                {perfilAtivo === 'compras_admin' && 'Administrador: Homologação de atas, autorização de carona e atesto de recebimento.'}
                {perfilAtivo === 'compras_auditor_cmed' && 'Auditor: Confronto triplo de preços CMED/BPS e conformidade regulatória.'}
                {perfilAtivo === 'compras_operador' && 'Operador: Emissão de empenhos, cotações e conferência de entregas.'}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEÇÃO 0: CONFIRMAR ENTREGA DO PEDIDO DE COMPRA (PdC-2026-0001 - FIGMA) */}
          {/* ========================================================================= */}
          {secaoAtiva === 'confirmar_entrega' && (
            <div className="space-y-6">
              {/* Feedback de Confirmação */}
              {feedbackEntrega && (
                <div
                  className={`p-4 rounded-2xl border text-xs shadow-xs ${
                    feedbackEntrega.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2 text-sm">
                    {feedbackEntrega.success ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0E9F6E]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[#E02424]" />
                    )}
                    <span>{feedbackEntrega.success ? 'Recebimento Provisório Homologado!' : 'Falha na Confirmação'}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-700">{feedbackEntrega.mensagem || feedbackEntrega.error}</p>
                </div>
              )}

              {/* 4 KPIs Padronizados da Entrega Física (PdC) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  title="Status de Recebimento"
                  value={pdcAtivo?.status === 'RECEBIDO_PROVISORIO' ? 'Homologado' : 'Aguardando'}
                  subtitle={pdcAtivo?.status === 'RECEBIDO_PROVISORIO' ? 'Enviado à Quarentena WMS' : 'Carga conferida no portão'}
                  icon={PackageCheck}
                  variant={pdcAtivo?.status === 'RECEBIDO_PROVISORIO' ? 'emerald' : 'amber'}
                  tooltipInfo="Status de conformidade do Pedido de Compra nos termos do Art. 140 da Lei 14.133/21."
                />
                <KpiCard
                  title="Valor da Carga (NF)"
                  value={`R$ ${(pdcAtivo?.valor_total || 97000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  subtitle="100% amparado em Empenho"
                  icon={TrendingUp}
                  variant="blue"
                  tooltipInfo="Valor líquido total da Nota Fiscal faturada pelo fornecedor contratado."
                />
                <KpiCard
                  title="Controle Térmico"
                  value={pdcAtivo?.itens?.[0]?.temperatura_aferida || '21.4ºC'}
                  subtitle="Faixa: 15ºC a 30ºC (Conforme)"
                  icon={Thermometer}
                  variant="teal"
                  tooltipInfo="Temperatura aferida no ato de abertura do caminhão refrigerado pelo fiscal do contrato."
                />
                <KpiCard
                  title="Conformidade Legal"
                  value="Art. 140 TRP"
                  subtitle="Lei Federal 14.133/2021"
                  icon={ClipboardCheck}
                  variant="indigo"
                  tooltipInfo="Atesto provisório com prazo de até 15 dias úteis para emissão do Termo Definitivo."
                />
              </div>

              {/* Cabeçalho do Pedido de Compra Ativo */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E0E0E0] pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-black text-slate-900 font-mono tracking-tight">
                        {pdcAtivo?.numero_pdc || 'PdC-2026-0001'}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                          pdcAtivo?.status === 'AGUARDANDO_RECEBIMENTO'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : pdcAtivo?.status === 'RECEBIDO_PROVISORIO'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-blue-50 text-blue-800 border-blue-300'
                        }`}
                      >
                        {pdcAtivo?.status === 'AGUARDANDO_RECEBIMENTO'
                          ? '● Aguardando Recebimento'
                          : pdcAtivo?.status === 'RECEBIDO_PROVISORIO'
                          ? '✓ Recebido Provisório'
                          : pdcAtivo?.status || 'Aguardando'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Vinculado à Ata: <strong className="text-slate-800">{pdcAtivo?.numero_ata || 'ARP-2026/042-SMS'}</strong> • Empenho: <strong className="font-mono text-[#1A56DB]">{pdcAtivo?.numero_empenho || 'EMP-2026/894120'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowModalTermoRecebimento(true)}
                      disabled={pdcAtivo?.status === 'RECEBIDO_PROVISORIO'}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Recebimento Provisório</span>
                    </button>
                  </div>
                </div>

                {/* Grid com Dados Fiscais da Nota (DANFE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                    <div className="text-[11px] text-slate-500 font-medium">Fornecedor Contratado</div>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">{pdcAtivo?.fornecedor_razao_social || 'Distribuidora Farmacêutica Nacional'}</div>
                    <div className="text-[10px] text-slate-500 font-mono">CNPJ: {pdcAtivo?.fornecedor_cnpj || '12.345.678/0001-90'}</div>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                    <div className="text-[11px] text-slate-500 font-medium">Nota Fiscal (DANFE)</div>
                    <div className="font-bold text-slate-900 mt-0.5">Nº {pdcAtivo?.nota_fiscal?.numero || '004.891.201'} • Série {pdcAtivo?.nota_fiscal?.serie || '1'}</div>
                    <div className="text-[10px] text-slate-500">Emitida em: {pdcAtivo?.nota_fiscal?.data_emissao || '2026-09-20'}</div>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                    <div className="text-[11px] text-slate-500 font-medium">Valor Total Faturado</div>
                    <div className="font-black text-slate-900 text-sm mt-0.5">
                      R$ {(pdcAtivo?.valor_total || 97000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold">100% Empenhado</div>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                    <div className="text-[11px] text-slate-500 font-medium">Prazo de Entrega</div>
                    <div className="font-bold text-slate-900 mt-0.5">{pdcAtivo?.prazo_entrega || '2026-09-23'}</div>
                    <div className="text-[10px] text-blue-700 font-semibold">Dentro do Prazo Legal</div>
                  </div>
                </div>

                {/* Chave de Acesso DANFE com botão de cópia */}
                <div className="p-3 bg-[#F0F4FF] rounded-xl border border-[#E0E0E0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#1A56DB] shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">Chave de Acesso XML DANFE: </span>
                      <span className="font-mono text-slate-700 font-semibold">{pdcAtivo?.nota_fiscal?.chave_acesso || '3526 0912 3456 7800 0190 5500 1004 8912 0110 4918 2741'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => copiarChaveDanfe(pdcAtivo?.nota_fiscal?.chave_acesso || '35260912345678000190550010048912011049182741')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E0E0E0] text-[#1A56DB] rounded-lg font-bold hover:bg-[#F5F5F5] transition-all text-[11px] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiadoChave ? 'Copiado!' : 'Copiar Chave'}</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Itens Entregues para Conferência Físico-Química */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Conferência de Medicamentos do Lote</h2>
                    <p className="text-xs text-slate-500">Confronto da carga física com os dados da Nota Fiscal e Termo de Referência</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                    Art. 140 da Lei 14.133/21
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E0E0E0] text-slate-700 font-bold bg-[#F5F5F5]">
                        <th className="py-2.5 px-3">Item / CATMAT</th>
                        <th className="py-2.5 px-3">Qtd. Entregue</th>
                        <th className="py-2.5 px-3">Lote do Fabricante</th>
                        <th className="py-2.5 px-3">Validade</th>
                        <th className="py-2.5 px-3">Temperatura Aferida</th>
                        <th className="py-2.5 px-3">Laudo Analítico</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                      {(pdcAtivo?.itens || []).map((item: any) => (
                        <tr key={item.item_id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{item.descricao}</div>
                            <div className="text-[11px] font-mono font-bold text-[#1A56DB]">{item.catmat}</div>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {item.quantidade_entregue.toLocaleString('pt-BR')} {item.unidade}s
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {item.lote}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{item.validade}</div>
                            <div className="text-[10px] text-emerald-700 font-bold">&gt; 18 meses (Conforme)</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1 font-bold text-slate-900">
                              <Thermometer className="w-3.5 h-3.5 text-[#0E9F6E]" />
                              <span>{item.temperatura_aferida || '21.4ºC'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">{item.temperatura_exigida}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              <FileCheck2 className="w-3 h-3 text-[#1A56DB]" />
                              Anexo Aprovado
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-[#0E9F6E]" />
                              CONFORME
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Checklist Regulatório e Atesto do Fiscal */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <IconBadge icon={ClipboardCheck} variant="blue" size="sm" />
                    Checklist Obrigatório de Recebimento Provisório
                  </h3>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    <label className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={checklist.danfe_conferida}
                        onChange={(e) => setChecklist({ ...checklist, danfe_conferida: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1A56DB] focus:ring-blue-600 cursor-pointer"
                      />
                      <span>Conferência de DANFE e Chave SEFAZ válida e autorizada.</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={checklist.embalagem_integra}
                        onChange={(e) => setChecklist({ ...checklist, embalagem_integra: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1A56DB] focus:ring-blue-600 cursor-pointer"
                      />
                      <span>Embalagens secundárias e primárias íntegras e sem sinais de violação.</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={checklist.lote_validade_ok}
                        onChange={(e) => setChecklist({ ...checklist, lote_validade_ok: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1A56DB] focus:ring-blue-600 cursor-pointer"
                      />
                      <span>Lote e validade conferidos fisicamente contra a nota fiscal.</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={checklist.temperatura_conforme}
                        onChange={(e) => setChecklist({ ...checklist, temperatura_conforme: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1A56DB] focus:ring-blue-600 cursor-pointer"
                      />
                      <span>Temperatura de transporte mantida dentro dos limites exigidos pelo fabricante.</span>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 rounded-xl border border-[#E0E0E0] hover:bg-[#F5F5F5] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={checklist.laudo_fabricante_anexo}
                        onChange={(e) => setChecklist({ ...checklist, laudo_fabricante_anexo: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1A56DB] focus:ring-blue-600 cursor-pointer"
                      />
                      <span>Laudo de análise físico-química e microbiológica do fabricante anexado.</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <IconBadge icon={Truck} variant="emerald" size="sm" />
                    Fluxo Automático para o Módulo 02 (Estoque Central WMS)
                  </h3>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-emerald-900 space-y-1.5 leading-relaxed">
                    <strong className="block text-emerald-950 font-bold">Encaminhamento Imediato:</strong>
                    Assim que o Recebimento Provisório for confirmado pelo fiscal, o lote é automaticamente enviado para a tela de <strong>Quarentena Técnica do Farmacêutico RT no Estoque Central WMS</strong>, gerando o número de palete e endereço provisório de conferência.
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1">
                    <strong className="block font-bold">Prazo Legal (Art. 140, § 2º):</strong>
                    O recebimento definitivo será emitido em até <strong>15 (quinze) dias úteis</strong> após a análise de qualidade do Responsável Técnico.
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setShowModalTermoRecebimento(true)}
                      disabled={pdcAtivo.status === 'RECEBIDO_PROVISORIO'}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Emitir Termo de Recebimento Provisório (TRP)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 1: VISÃO GERAL & MÉTRICAS (PAINEL EXECUTIVO) */}
          {/* ========================================================================= */}
          {secaoAtiva === 'visao_geral' && (
            <div className="space-y-6">
              {/* Cards de KPIs com Padrão de Ícones e Escala Cinza Refinada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiCard
                  title="Atas Vigentes SRP"
                  value={metricas?.total_atas_vigentes || 2}
                  subtitle="Processos homologados"
                  icon={FileText}
                  variant="blue"
                  tooltipInfo="Atas de Registro de Preços homologadas pelo órgão gerenciador prontas para fornecimento."
                />

                <KpiCard
                  title="Economia vs CMED"
                  value={`R$ ${(metricas?.economia_gerada_cmed_reais || 348200).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                  subtitle={`${metricas?.economia_media_cmed_pct || 28.5}% abaixo do teto`}
                  icon={TrendingUp}
                  variant="emerald"
                  trend={{ text: `${metricas?.economia_media_cmed_pct || 28.5}%`, isPositive: true }}
                  tooltipInfo="Diferença acumulada entre o Preço Máximo ao Governo (CMED) e os preços homologados nas atas."
                />

                <KpiCard
                  title="Itens sob Trava CMED"
                  value={metricas?.total_itens_registrados || 5}
                  subtitle="100% com semáforo ativo"
                  icon={ShieldCheck}
                  variant="amber"
                  tooltipInfo="Itens com bloqueio preventivo automático que impede emissão de empenho caso haja sobrepreço."
                />

                <KpiCard
                  title="Saldo Disponível"
                  value={`R$ ${((metricas?.valor_total_atas || 13050000) - (metricas?.valor_executado_empenhos || 3820000)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                  subtitle="Capacidade p/ empenhos"
                  icon={ShoppingCart}
                  variant="indigo"
                  tooltipInfo="Saldo financeiro residual disponível para emissão de ordens de fornecimento."
                />

                <KpiCard
                  title="Entregas Físicas (PdC)"
                  value={pedidosCompra.filter(p => p.status === 'AGUARDANDO_RECEBIMENTO').length > 0 ? '1 Pendente' : '0 Pendente'}
                  subtitle="100% no prazo legal"
                  icon={Truck}
                  variant="teal"
                  tooltipInfo="Pedidos de Compra emitidos aguardando conferência física de recebimento provisório na doca do hospital."
                />
              </div>

              {/* Destaque das Atas & Entregas Pendentes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Processos de Registro de Preços Vigentes</h2>
                      <p className="text-xs text-slate-500">Atas ativas em conformidade com o Art. 82 da Lei 14.133/21</p>
                    </div>
                    <button
                      onClick={() => setSecaoAtiva('atas')}
                      className="text-xs font-bold text-[#1A56DB] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver todas as atas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {atas.map((ata) => {
                      const totalItens = ata.itens.length;
                      const valorTotal = ata.valor_total;
                      return (
                        <div
                          key={ata.id}
                          className="p-4 rounded-xl border border-[#E0E0E0] bg-[#F8FAFC] hover:bg-[#F5F5F5] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{ata.numero_ata}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                                {ata.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mt-1">{ata.fornecedor_razao_social}</p>
                            <p className="text-[11px] text-slate-500">
                              CNPJ: {ata.fornecedor_cnpj} • Vigência até {ata.vigencia_fim}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <div className="text-xs text-slate-500">Valor Homologado</div>
                              <div className="text-sm font-bold text-slate-900">
                                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSecaoAtiva('atas');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white border border-[#E0E0E0] text-xs font-bold text-[#1A56DB] hover:bg-[#F0F4FF] transition-all shadow-2xs cursor-pointer"
                            >
                              Ver Itens ({totalItens})
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Lateral: Entregas Pendentes & Ações Rápidas */}
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Entregas & Recebimento Físico</h3>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                      Art. 140
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-300 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-emerald-950">
                      <span>{pdcAtivo?.numero_pdc || 'PdC-2026-0001'}</span>
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Carga no Portão
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      {pdcAtivo?.itens?.[0]?.descricao || 'Meropenem 1g Pó Liofilizado Injetável'} ({pdcAtivo?.itens?.[0]?.quantidade_pedida || 2000} unidades).
                    </p>
                    <button
                      onClick={() => setSecaoAtiva('confirmar_entrega')}
                      className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Abrir Conferência de Entrega</span>
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-3 rounded-xl bg-[#F0F4FF] border border-[#E0E0E0] text-xs space-y-1">
                      <div className="font-bold text-[#1A56DB] flex items-center justify-between">
                        <span>Chamados do Setor</span>
                        <span className="text-[#1A56DB] font-mono">{chamados.length}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] truncate">
                        {chamados[0]?.titulo || 'Nenhum chamado pendente no momento'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-300 text-xs space-y-1">
                      <div className="font-bold text-amber-950 flex items-center justify-between">
                        <span>Livro de Ocorrências</span>
                        <span className="text-amber-800 font-mono">{ocorrencias.length}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] truncate">
                        {ocorrencias[0]?.relato || 'Sem registros no turno'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 2: ATAS SRP & ITENS HOMOLOGADOS */}
          {/* ========================================================================= */}
          {secaoAtiva === 'atas' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Itens em Ata de Registro de Preços</h2>
                      <p className="text-xs text-slate-500">Selecione um item para emitir empenho ou analisar o semáforo CMED</p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filtrar por CATMAT, nome ou princípio..."
                        value={filtroBusca}
                        onChange={(e) => setFiltroBusca(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB]"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E0E0E0] text-slate-700 font-bold bg-[#F5F5F5]">
                          <th className="py-2.5 px-3">CATMAT / Medicamento</th>
                          <th className="py-2.5 px-3">Ata / Fornecedor</th>
                          <th className="py-2.5 px-3">Preço Homologado</th>
                          <th className="py-2.5 px-3">Semáforo CMED</th>
                          <th className="py-2.5 px-3">Saldo Disponível</th>
                          <th className="py-2.5 px-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0E0E0]">
                        {todosItens.map((item: any) => (
                          <tr
                            key={item.id}
                            onClick={() => setItemSelecionado(item)}
                            className={`cursor-pointer transition-colors ${
                              itemSelecionado?.id === item.id
                                ? 'bg-[#F0F4FF] border-l-4 border-l-[#1A56DB] font-medium'
                                : 'hover:bg-[#F5F5F5]'
                            }`}
                          >
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{item.descricao_medicamento}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <span className="font-mono font-bold text-[#1A56DB]">{item.codigo_catmat}</span>
                                <span>• {item.principio_ativo}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{item.numero_ata}</div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[130px]">{item.fornecedor}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">R$ {item.preco_homologado.toFixed(2)}</div>
                              <div className="text-[10px] text-emerald-700 font-bold">
                                -{item.economia_cmed_pct}% vs CMED
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-[#0E9F6E]" />
                                CONFORME (OK)
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{item.quantidade_saldo.toLocaleString('pt-BR')}</div>
                              <div className="text-[10px] text-slate-500">
                                de {item.quantidade_total.toLocaleString('pt-BR')} {item.unidade_fornecimento}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemSelecionado(item);
                                  setSecaoAtiva('empenhos');
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-[#1A56DB] hover:bg-[#EBF0FB] rounded-lg transition-colors cursor-pointer"
                              >
                                Empenhar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Detalhe Rápido do Item Selecionado */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Item Selecionado</h3>
                  <p className="text-xs text-slate-500 mb-4">Informações regulatórias e saldo para fornecimento</p>

                  {itemSelecionado ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] space-y-1.5">
                        <span className="font-mono text-xs font-bold text-[#1A56DB]">{itemSelecionado.codigo_catmat}</span>
                        <div className="text-xs font-bold text-slate-900">{itemSelecionado.descricao_medicamento}</div>
                        <div className="text-xs text-slate-600">Princípio Ativo: {itemSelecionado.principio_ativo}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                          <div className="text-[10px] text-slate-500">Preço Registrado</div>
                          <div className="text-sm font-bold text-slate-900">R$ {itemSelecionado.preco_homologado.toFixed(2)}</div>
                        </div>
                        <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                          <div className="text-[10px] text-slate-500">Teto CMED</div>
                          <div className="text-sm font-bold text-slate-900">R$ {itemSelecionado.preco_teto_cmed.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-emerald-900 font-medium">
                        <strong>Economia Gerada:</strong> R${' '}
                        {(itemSelecionado.preco_teto_cmed - itemSelecionado.preco_homologado).toFixed(2)} por unidade ({itemSelecionado.economia_cmed_pct}% de desconto legal).
                      </div>

                      <button
                        onClick={() => setSecaoAtiva('empenhos')}
                        className="w-full py-2.5 rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Prosseguir para Emissão de Empenho</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Clique em qualquer item da tabela para visualizar os detalhes técnicos.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 3: VALIDADOR CMED / BPS / CATMAT (SKILL OFICIAL) */}
          {/* ========================================================================= */}
          {secaoAtiva === 'validador_cmed' && (
            <div className="space-y-6">
              {/* 4 KPIs Padronizados do Validador CMED */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  title="Teto CMED (PMVG)"
                  value={resultadoValidacao ? `R$ ${resultadoValidacao.prices.cmed_ceiling_price.toFixed(2)}` : 'R$ 78.40'}
                  subtitle="Preço Máximo de Venda ao Governo"
                  icon={Scale}
                  variant="blue"
                  tooltipInfo="Teto regulatório obrigatório definido pela Câmara de Regulação do Mercado de Medicamentos."
                />
                <KpiCard
                  title="Média BPS (SUS)"
                  value={resultadoValidacao ? `R$ ${resultadoValidacao.prices.bps_reference_price.toFixed(2)}` : 'R$ 51.20'}
                  subtitle="Banco de Preços em Saúde"
                  icon={TrendingUp}
                  variant="emerald"
                  tooltipInfo="Preço médio ponderado praticado em compras públicas hospitalares no Brasil."
                />
                <KpiCard
                  title="Trava Automática"
                  value="100% Ativa"
                  subtitle="Bloqueio em caso de sobrepreço"
                  icon={ShieldCheck}
                  variant="amber"
                  tooltipInfo="Mecanismo preventivo que impede emissão de autorização de fornecimento acima do teto regulatório."
                />
                <KpiCard
                  title="Conformidade Art. 23"
                  value="Lei 14.133"
                  subtitle="Pesquisa de preços oficial"
                  icon={FileCheck2}
                  variant="indigo"
                  tooltipInfo="Atendimento rigoroso ao Artigo 23, § 1º da Lei Federal de Licitações e Contratos."
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulário do Validador */}
                <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <IconBadge icon={Scale} variant="blue" size="sm" />
                      Validador Oficial CMED / BPS / CATMAT
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Confronto triplo de propostas de fornecedores frente ao Teto CMED (PMVG) e Média BPS (SUS)
                    </p>
                  </div>

                  <form onSubmit={handleValidarPreco} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Código CATMAT (Padrão BR)</label>
                      <input
                        type="text"
                        value={catmatInput}
                        onChange={(e) => setCatmatInput(e.target.value)}
                        placeholder="Ex: BR0284729"
                        className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] font-mono font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nome / Descrição do Medicamento</label>
                      <input
                        type="text"
                        value={nomeMedInput}
                        onChange={(e) => setNomeMedInput(e.target.value)}
                        placeholder="Ex: Meropenem 1g Pó Liofilizado"
                        className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Preço Proposto pelo Fornecedor (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={precoPropostoInput}
                        onChange={(e) => setPrecoPropostoInput(e.target.value)}
                        placeholder="48.50"
                        className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] font-bold text-slate-900"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={validandoPreco}
                        className="w-full py-2.5 rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        {validandoPreco ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Consultando Bases Oficiais...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Executar Confronto CMED + BPS + CATMAT</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-900">Parâmetros Oficiais de Confronto:</div>
                    <p className="text-[11px] text-slate-600">
                      Art. 23, § 1º da Lei 14.133/21: O preço de referência deve confrontar obrigatoriamente a base da CMED (Preço Máximo de Venda ao Governo) e o Banco de Preços em Saúde (BPS).
                    </p>
                  </div>
                </div>

                {/* Resultado do Laudo e Parecer da Skill */}
                <div className="space-y-4">
                  {resultadoValidacao ? (
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">Parecer Técnico e Conformidade</h3>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            resultadoValidacao.validation.status === 'OK'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : resultadoValidacao.validation.status === 'WARNING'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          STATUS: {resultadoValidacao.validation.status}
                        </span>
                      </div>

                      {/* Comparativo de Preços */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                          <div className="text-[10px] text-slate-500">Proposta Fornecedor</div>
                          <div className="text-sm font-bold text-slate-900">
                            R$ {resultadoValidacao.prices.supplier_price.toFixed(2)}
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                          <div className="text-[10px] text-slate-500">Média BPS (SUS)</div>
                          <div className="text-sm font-bold text-slate-900">
                            R$ {resultadoValidacao.prices.bps_reference_price.toFixed(2)}
                          </div>
                          <div
                            className={`text-[10px] font-bold ${
                              resultadoValidacao.validation.divergence_vs_bps_percent > 0
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {resultadoValidacao.validation.divergence_vs_bps_percent > 0 ? '+' : ''}
                            {resultadoValidacao.validation.divergence_vs_bps_percent}%
                          </div>
                        </div>

                        <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                          <div className="text-[10px] text-slate-500">Teto CMED (PMVG)</div>
                          <div className="text-sm font-bold text-slate-900">
                            R$ {resultadoValidacao.prices.cmed_ceiling_price.toFixed(2)}
                          </div>
                          <div className="text-[10px] font-bold text-emerald-700">
                            {resultadoValidacao.validation.divergence_vs_cmed_percent}%
                          </div>
                        </div>
                      </div>

                      {/* Parecer Técnico Estruturado */}
                      <div className="p-3 bg-[#F0F4FF] rounded-xl border border-[#E0E0E0] text-xs space-y-1">
                        <div className="font-bold text-[#1A56DB]">Parecer Técnico de Auditoria:</div>
                        <p className="text-slate-800 leading-relaxed">{resultadoValidacao.validation.parecer_tecnico}</p>
                        <div className="text-[11px] text-slate-600 mt-2">
                          <strong>Recomendação:</strong> {resultadoValidacao.validation.recommendation}
                        </div>
                      </div>

                      {/* Metadados de Imutabilidade e Hash WORM */}
                      <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] text-[10px] space-y-1 font-mono">
                        <div className="text-slate-600">Audit Log ID: {resultadoValidacao.audit_log_id}</div>
                        <div className="text-slate-600 truncate">Hash SHA-256: {resultadoValidacao.audit_hash}</div>
                        <div className="text-slate-500">Versão CMED: {resultadoValidacao.versions_used.cmed_version}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-8 text-center shadow-xs">
                      <Scale className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">
                        Preencha os dados do medicamento ao lado e clique em "Executar Confronto" para ver o laudo regulatório completo.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 3.5: COMPARATIVO EM LARGA ESCALA DE MEDICAMENTOS (CMED & BPS) */}
          {/* ========================================================================= */}
          {secaoAtiva === 'comparativo_lote' && (
            <div className="space-y-6">
              {/* Header da Sub-aba com Controles de Lote */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <IconBadge icon={Layers} variant="blue" size="md" />
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        Comparativo em Larga Escala de Medicamentos
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                          Multi-Item & Disputa
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Confronto algorítmico simultâneo de cestas hospitalares contra o Banco de Preços em Saúde (BPS/MS) e Teto Regulatório ANVISA (CMED)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Seletor de Cotação em Lote */}
                  <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E0E0E0]">
                    <span className="text-[11px] font-bold text-slate-600">Lote:</span>
                    <select
                      value={cotacaoSelecionadaId}
                      onChange={(e) => carregarComparativoLote(e.target.value)}
                      className="text-xs font-bold text-[#1A56DB] bg-transparent focus:outline-none cursor-pointer"
                    >
                      {cotacoesDisponiveis.map((c) => (
                        <option key={c.codigo} value={c.codigo}>
                          {c.codigo} — {c.titulo} ({c.total_itens} itens)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botão de Importar Planilha */}
                  <button
                    onClick={() => setModalImportarLoteAberto(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E0E0E0] text-xs font-bold text-slate-700 hover:bg-[#F5F5F5] hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#1A56DB]" />
                    Importar Planilha (CSV)
                  </button>

                  {/* Botão de Exportar Parecer TCU */}
                  <button
                    onClick={() => setModalParecerTcuAberto(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1A56DB] text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-white" />
                    Relatório TCU / TCE
                  </button>
                </div>
              </div>

              {/* Grade de 5 KPIs Canônicos de Larga Escala */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiCard
                  title="Medicamentos no Lote"
                  value={cestaLote?.metricas?.total_itens || 0}
                  subtitle={`${cestaLote?.codigo_cotacao || 'COT-2026-089'} • Multipolar`}
                  icon={PackageCheck}
                  variant="blue"
                  trend={{ text: `${cestaLote?.itens?.length || 0} itens`, isPositive: true }}
                />
                <KpiCard
                  title="Taxa de Conformidade"
                  value={`${cestaLote?.metricas?.taxa_conformidade_pct || 0}%`}
                  subtitle={`${cestaLote?.metricas?.itens_conformes_bps || 0} de ${cestaLote?.metricas?.total_itens || 0} regulares`}
                  icon={ShieldCheck}
                  variant="emerald"
                  trend={{ text: 'Auditado BPS/SUS', isPositive: true }}
                />
                <KpiCard
                  title="Economia vs BPS"
                  value={`R$ ${(cestaLote?.metricas?.economia_global_bps_reais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  subtitle="Desconto sobre mediana SUS"
                  icon={TrendingUp}
                  variant="emerald"
                  trend={{ text: 'Vantajosidade', isPositive: true }}
                />
                <KpiCard
                  title="Sobrepreço Evitado"
                  value={`R$ ${(cestaLote?.metricas?.sobrepreco_evitado_cmed_reais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  subtitle="Retenção Lei 10.742/03"
                  icon={BadgeAlert}
                  variant="rose"
                  trend={{ text: 'Proteção ao Erário', isPositive: true }}
                />
                <KpiCard
                  title="Travas Ativas (Art. 23)"
                  value={cestaLote?.metricas?.travas_ativas_total || 0}
                  subtitle={`${cestaLote?.metricas?.itens_bloqueados_cmed || 0} itens retidos`}
                  icon={AlertTriangle}
                  variant="amber"
                  trend={{ text: (cestaLote?.metricas?.travas_ativas_total || 0) > 0 ? 'Exige bloqueio' : '0 infrações', isPositive: (cestaLote?.metricas?.travas_ativas_total || 0) === 0 }}
                />
              </div>

              {/* Filtros Dinâmicos por Semáforo e Busca Instantânea */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Abas Rápidas de Semáforo */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setFiltroSemaforoLote('TODOS')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        filtroSemaforoLote === 'TODOS'
                          ? 'bg-[#F0F4FF] text-[#1A56DB] border border-[#E0E0E0]'
                          : 'bg-[#F8FAFC] text-slate-600 hover:bg-[#F5F5F5] border border-transparent'
                      }`}
                    >
                      Todos ({cestaLote?.itens?.length || 0})
                    </button>

                    <button
                      onClick={() => setFiltroSemaforoLote('EXCELENTE')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        filtroSemaforoLote === 'EXCELENTE'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-[#F8FAFC] text-emerald-700 hover:bg-emerald-50/50 border border-transparent'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Conforme BPS ({cestaLote?.itens?.filter((i: any) => i.status_ia === 'EXCELENTE' || i.status_ia === 'ADEQUADO').length || 0})
                    </button>

                    <button
                      onClick={() => setFiltroSemaforoLote('ATENÇÃO')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        filtroSemaforoLote === 'ATENÇÃO'
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'bg-[#F8FAFC] text-amber-700 hover:bg-amber-50/50 border border-transparent'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Atenção Mercado ({cestaLote?.itens?.filter((i: any) => i.status_ia === 'ATENÇÃO').length || 0})
                    </button>

                    <button
                      onClick={() => setFiltroSemaforoLote('IRREGULAR')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        filtroSemaforoLote === 'IRREGULAR'
                          ? 'bg-rose-50 text-rose-800 border border-rose-300'
                          : 'bg-[#F8FAFC] text-rose-700 hover:bg-rose-50/50 border border-transparent'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Bloqueado / Sobrepreço ({cestaLote?.itens?.filter((i: any) => i.status_ia === 'CRÍTICO' || i.status_ia === 'IRREGULAR').length || 0})
                    </button>
                  </div>

                  {/* Campo de Busca Rápida */}
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={buscaLote}
                      onChange={(e) => setBuscaLote(e.target.value)}
                      placeholder="Buscar por nome, CATMAT ou princípio..."
                      className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-[#1A56DB]"
                    />
                  </div>
                </div>

                {/* Tabela de Medicamentos Auditados no Lote */}
                <div className="border border-[#E0E0E0] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-slate-700 font-bold">
                          <th className="py-2.5 px-3 w-12 text-center">#</th>
                          <th className="py-2.5 px-3 w-28 text-center">Semáforo IA</th>
                          <th className="py-2.5 px-3">Medicamento & Princípio Ativo</th>
                          <th className="py-2.5 px-3 text-right">Qtd.</th>
                          <th className="py-2.5 px-3 text-right text-[#1A56DB]">Menor Preço 🏆</th>
                          <th className="py-2.5 px-3">Fornecedor Líder</th>
                          <th className="py-2.5 px-3 text-right">Teto CMED</th>
                          <th className="py-2.5 px-3 text-right">Mediana BPS</th>
                          <th className="py-2.5 px-3 text-center">Desvio BPS</th>
                          <th className="py-2.5 px-3 text-center w-28">Disputa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0E0E0] bg-white">
                        {(() => {
                          const itensFiltrados = (cestaLote?.itens || []).filter((item: any) => {
                            if (filtroSemaforoLote === 'EXCELENTE') {
                              if (item.status_ia !== 'EXCELENTE' && item.status_ia !== 'ADEQUADO') return false;
                            } else if (filtroSemaforoLote === 'ATENÇÃO') {
                              if (item.status_ia !== 'ATENÇÃO') return false;
                            } else if (filtroSemaforoLote === 'IRREGULAR') {
                              if (item.status_ia !== 'CRÍTICO' && item.status_ia !== 'IRREGULAR') return false;
                            }

                            if (buscaLote.trim()) {
                              const b = buscaLote.toLowerCase();
                              return (
                                item.descricao_medicamento?.toLowerCase().includes(b) ||
                                item.codigo_catmat?.toLowerCase().includes(b) ||
                                item.principio_ativo?.toLowerCase().includes(b) ||
                                item.fornecedor_lider?.toLowerCase().includes(b)
                              );
                            }
                            return true;
                          });

                          if (itensFiltrados.length === 0) {
                            return (
                              <tr>
                                <td colSpan={10} className="py-8 text-center text-slate-500">
                                  Nenhum medicamento encontrado para os filtros selecionados.
                                </td>
                              </tr>
                            );
                          }

                          return itensFiltrados.map((item: any) => {
                            const isExpandido = itemLoteExpandidoId === item.id;
                            const isBloqueado = item.status_ia === 'IRREGULAR' || item.status_ia === 'CRÍTICO';

                            return (
                              <React.Fragment key={item.id}>
                                <tr
                                  className={`hover:bg-[#F8FAFC] transition-colors ${
                                    isBloqueado ? 'bg-rose-50/20' : ''
                                  } ${isExpandido ? 'bg-[#F0F4FF]/50 border-l-4 border-l-[#1A56DB]' : ''}`}
                                >
                                  <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                                    {item.numero_item}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {item.status_ia === 'EXCELENTE' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        EXCELENTE
                                      </span>
                                    )}
                                    {item.status_ia === 'ADEQUADO' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                        ADEQUADO
                                      </span>
                                    )}
                                    {item.status_ia === 'ATENÇÃO' && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                        ATENÇÃO
                                      </span>
                                    )}
                                    {item.status_ia === 'IRREGULAR' && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                                        <AlertTriangle className="w-2.5 h-2.5" /> BLOQUEADO
                                      </span>
                                    )}
                                    {item.status_ia === 'CRÍTICO' && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                        CRÍTICO
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-slate-900">{item.descricao_medicamento}</div>
                                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                      <span className="font-mono text-[#1A56DB]">{item.codigo_catmat}</span>
                                      <span>•</span>
                                      <span>{item.principio_ativo}</span>
                                      <span>•</span>
                                      <span className="bg-[#F5F5F5] px-1.5 py-0.5 rounded text-[10px] border border-[#E0E0E0]">{item.apresentacao}</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                                    {item.quantidade.toLocaleString('pt-BR')} <span className="text-[10px] text-slate-500">{item.unidade_fornecimento}</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-[#1A56DB]">
                                    R$ {item.menor_preco.toFixed(2)}
                                  </td>
                                  <td className="py-2.5 px-3 font-medium text-slate-800 truncate max-w-[180px]" title={item.fornecedor_lider}>
                                    {item.fornecedor_lider}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                                    R$ {item.preco_cmed_teto.toFixed(2)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                                    R$ {item.preco_bps_mediana.toFixed(2)}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-bold">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                                        item.divergencia_lider_bps_pct <= 0
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : item.divergencia_lider_bps_pct <= 15
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {item.divergencia_lider_bps_pct > 0 ? '+' : ''}
                                      {item.divergencia_lider_bps_pct.toFixed(1)}%
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      onClick={() => setItemLoteExpandidoId(isExpandido ? null : item.id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E0E0E0] text-[11px] font-bold text-slate-700 hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                                    >
                                      {isExpandido ? 'Ocultar' : `Disputa (${item.propostas?.length || 1})`}
                                      {isExpandido ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                  </td>
                                </tr>

                                {/* Linha Expansível com Detalhamento de Propostas e Parecer */}
                                {isExpandido && (
                                  <tr className="bg-[#F8FAFC]">
                                    <td colSpan={10} className="p-4 border-b border-[#E0E0E0]">
                                      <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E0E0E0] shadow-2xs">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E0E0E0] pb-2 gap-2">
                                          <div>
                                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                              <Scale className="w-3.5 h-3.5 text-[#1A56DB]" />
                                              Disputa de Fornecedores Concorrentes — {item.descricao_medicamento}
                                            </h4>
                                            <p className="text-[11px] text-slate-500">
                                              Comparativo de todas as propostas cotadas frente às tabelas oficiais da ANVISA e Ministério da Saúde
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs">
                                            <span className="text-slate-600">
                                              Teto CMED (PF): <strong className="text-slate-900">R$ {item.preco_cmed_teto.toFixed(2)}</strong>
                                            </span>
                                            <span className="text-slate-600">
                                              Mediana BPS: <strong className="text-slate-900">R$ {item.preco_bps_mediana.toFixed(2)}</strong>
                                            </span>
                                          </div>
                                        </div>

                                        {/* Tabela de Concorrentes */}
                                        <div className="border border-[#E0E0E0] rounded-lg overflow-hidden">
                                          <table className="w-full text-xs text-left">
                                            <thead className="bg-[#F5F5F5] text-slate-700 font-bold border-b border-[#E0E0E0]">
                                              <tr>
                                                <th className="py-2 px-3">Fornecedor Proponente</th>
                                                <th className="py-2 px-3">CNPJ</th>
                                                <th className="py-2 px-3 text-right">Preço Unitário</th>
                                                <th className="py-2 px-3 text-right">Valor Total Lote</th>
                                                <th className="py-2 px-3 text-center">Desvio vs BPS</th>
                                                <th className="py-2 px-3 text-center">Desvio vs CMED</th>
                                                <th className="py-2 px-3 text-center">Status Parecer</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#E0E0E0]">
                                              {item.propostas.map((prop: any, pIdx: number) => (
                                                <tr
                                                  key={pIdx}
                                                  className={`${prop.is_vencedor ? 'bg-emerald-50/40 font-semibold' : 'bg-white'}`}
                                                >
                                                  <td className="py-2 px-3 text-slate-900 flex items-center gap-1.5">
                                                    {prop.is_vencedor && <span title="Menor Preço Classificado">🏆</span>}
                                                    {prop.razao_social}
                                                  </td>
                                                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                                                    {prop.cnpj}
                                                  </td>
                                                  <td className={`py-2 px-3 text-right font-bold ${prop.is_vencedor ? 'text-emerald-700' : 'text-slate-800'}`}>
                                                    R$ {prop.preco_unitario.toFixed(2)}
                                                  </td>
                                                  <td className="py-2 px-3 text-right font-mono text-slate-700">
                                                    R$ {prop.preco_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                  </td>
                                                  <td className="py-2 px-3 text-center">
                                                    <span className={`text-[10px] font-bold ${prop.divergencia_bps_pct <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                                      {prop.divergencia_bps_pct > 0 ? '+' : ''}{prop.divergencia_bps_pct.toFixed(1)}%
                                                    </span>
                                                  </td>
                                                  <td className="py-2 px-3 text-center">
                                                    <span className={`text-[10px] font-bold ${prop.divergencia_cmed_pct <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                      {prop.divergencia_cmed_pct > 0 ? '+' : ''}{prop.divergencia_cmed_pct.toFixed(1)}%
                                                    </span>
                                                  </td>
                                                  <td className="py-2 px-3 text-center">
                                                    <span
                                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        prop.cor_ia === 'verde'
                                                          ? 'bg-emerald-100 text-emerald-800'
                                                          : prop.cor_ia === 'amarelo'
                                                          ? 'bg-amber-100 text-amber-800'
                                                          : 'bg-rose-100 text-rose-800'
                                                      }`}
                                                    >
                                                      {prop.classificacao_ia}
                                                    </span>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>

                                        {/* Parecer Conclusivo da IA */}
                                        <div
                                          className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                                            isBloqueado
                                              ? 'bg-rose-50 border-rose-200 text-rose-900'
                                              : 'bg-[#F0F4FF] border-[#E0E0E0] text-slate-800'
                                          }`}
                                        >
                                          {isBloqueado ? (
                                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                          ) : (
                                            <CheckCircle2 className="w-4 h-4 text-[#1A56DB] shrink-0 mt-0.5" />
                                          )}
                                          <div>
                                            <span className="font-bold">
                                              {isBloqueado ? 'Intervenção de Auditoria Automática: ' : 'Parecer do Algoritmo de Conformidade: '}
                                            </span>
                                            <span>{item.parecer_conclusivo}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 4: EMISSÃO DE EMPENHOS & TRAVA CARONA 50% */}
          {/* ========================================================================= */}
          {secaoAtiva === 'empenhos' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <IconBadge icon={ShoppingCart} variant="blue" size="sm" />
                    Emissão de Empenho Digital
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Art. 86 da Lei 14.133/21 com abatimento atômico de saldo e trava de órgão não-participante (50%)
                  </p>
                </div>

                {itemSelecionado ? (
                  <form onSubmit={handleEmitirEmpenho} className="space-y-4">
                    <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] space-y-1.5">
                      <div className="text-[10px] font-mono text-[#1A56DB] font-bold">{itemSelecionado.codigo_catmat}</div>
                      <div className="text-xs font-bold text-slate-900">{itemSelecionado.descricao_medicamento}</div>
                      <div className="text-xs text-slate-600">
                        Preço Homologado: <strong className="text-slate-900">R$ {itemSelecionado.preco_homologado.toFixed(2)}</strong> / {itemSelecionado.unidade_fornecimento}
                      </div>
                      <div className="text-xs text-slate-600">
                        Saldo em Ata: <strong className="text-slate-900">{itemSelecionado.quantidade_saldo.toLocaleString('pt-BR')}</strong> {itemSelecionado.unidade_fornecimento}s
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Modalidade de Adesão</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTipoAdesao('ORGAO_GERENCIADOR')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            tipoAdesao === 'ORGAO_GERENCIADOR'
                              ? 'bg-[#F0F4FF] border-2 border-[#1A56DB] shadow-xs'
                              : 'bg-[#F8FAFC] border-[#E0E0E0] hover:bg-[#F5F5F5] text-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900">Órgão Gerenciador</div>
                          <div className="text-[11px] text-slate-500">Hospital Central 360 (Titular)</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoAdesao('CARONA_ADESAO')}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            tipoAdesao === 'CARONA_ADESAO'
                              ? 'bg-[#F0F4FF] border-2 border-[#1A56DB] shadow-xs'
                              : 'bg-[#F8FAFC] border-[#E0E0E0] hover:bg-[#F5F5F5] text-slate-700'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900">Órgão Carona</div>
                          <div className="text-[11px] text-slate-500">Não-participante (Trava 50%)</div>
                        </button>
                      </div>
                      {tipoAdesao === 'CARONA_ADESAO' && (
                        <p className="text-[10px] text-amber-800 mt-1.5 font-bold bg-amber-50 p-2 rounded-lg border border-amber-200">
                          ⚠️ Trava Legal de Carona: Máximo permitido de {Math.floor(itemSelecionado.quantidade_total * 0.50).toLocaleString('pt-BR')} unidades.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade para Empenho</label>
                      <input
                        type="number"
                        min="1"
                        max={itemSelecionado.quantidade_saldo}
                        value={qtdEmpenho}
                        onChange={(e) => setQtdEmpenho(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] font-bold text-slate-900"
                      />
                    </div>

                    <div className="pt-2 border-t border-[#E0E0E0] flex items-center justify-between text-xs">
                      <span className="text-slate-500">Valor Total da Nota de Empenho:</span>
                      <span className="text-sm font-black text-slate-900">
                        R$ {(qtdEmpenho * itemSelecionado.preco_homologado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingEmpenho}
                      className="w-full py-2.5 rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {submittingEmpenho ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Emitindo Empenho...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Autorizar & Emitir Empenho</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-[#E0E0E0] rounded-xl">
                    <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">
                      Nenhum item selecionado. Vá na aba "Atas SRP" e clique em "Empenhar" para carregar os parâmetros.
                    </p>
                    <button
                      onClick={() => setSecaoAtiva('atas')}
                      className="mt-3 px-3 py-1.5 rounded-xl bg-[#F5F5F5] border border-[#E0E0E0] text-slate-700 text-xs font-bold hover:bg-[#EBF0FB] hover:text-[#1A56DB] transition-all cursor-pointer"
                    >
                      Ver Lista de Itens
                    </button>
                  </div>
                )}

                {/* Feedback da Emissão */}
                {resultadoEmpenho && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      resultadoEmpenho.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    {resultadoEmpenho.success ? (
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" />
                          {resultadoEmpenho.numero_empenho} Emitido com Sucesso!
                        </div>
                        <p className="mt-1 text-[11px] text-emerald-800">{resultadoEmpenho.mensagem}</p>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-[#E02424]" />
                          Bloqueio Preventivo Acionado
                        </div>
                        <p className="mt-1 text-[11px] text-rose-800">{resultadoEmpenho.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Informações da Regra de Trava Carona */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <IconBadge icon={ShieldCheck} variant="blue" size="sm" />
                  Regras de Conformidade da Lei Federal 14.133/21
                </h3>

                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                    <strong className="text-slate-900 block mb-1">Limite Individual de Adesão (Art. 86, § 4º):</strong>
                    As aquisições adicionais por órgão carona não podem exceder a <strong>50% (cinquenta por cento)</strong> dos quantitativos dos itens registrados na ata.
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                    <strong className="text-slate-900 block mb-1">Limite Global de Caronas (Art. 86, § 5º):</strong>
                    O somatório de todas as adesões não poderá exceder, na totalidade, ao <strong>dobro (2x)</strong> do quantitativo de cada item registrado.
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-900">
                    <strong className="block mb-1 font-bold">Conexão com Confirmação de Entrega (PdC):</strong>
                    Cada empenho emitido gera um Pedido de Compra que aguarda a chegada do fornecedor para conferência física de lote, temperatura e validade no módulo <strong>Confirmar Entrega</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 5: CENTRAL DE CHAMADOS DO MÓDULO */}
          {/* ========================================================================= */}
          {secaoAtiva === 'chamados' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Central de Chamados de Compras & Suprimentos</h2>
                  <p className="text-xs text-slate-500">Abertura de chamados técnicos, dúvidas de atas e solicitações de compra urgente</p>
                </div>

                <button
                  onClick={() => setShowModalChamado(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1A56DB] hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Novo Chamado</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chamados.map((c: any) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#1A56DB]">{c.protocolo}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.prioridade === 'alta'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {c.prioridade.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900">{c.titulo}</h3>
                    <p className="text-xs text-slate-600">{c.descricao}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Aberto por: <strong>{c.autor_nome}</strong></span>
                      <span>{c.criado_em}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 6: LIVRO DE OCORRÊNCIAS DIGITAL */}
          {/* ========================================================================= */}
          {secaoAtiva === 'ocorrencias' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Livro de Ocorrências Digital de Compras</h2>
                  <p className="text-xs text-slate-500">Diário de bordo inalterável para registro de intercorrências, atrasos e trocas de turno</p>
                </div>

                <button
                  onClick={() => setShowModalOcorrencia(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1A56DB] hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Registrar Ocorrência</span>
                </button>
              </div>

              <div className="space-y-3">
                {ocorrencias.map((o: any) => (
                  <div key={o.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {o.gravidade.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-800">Turno: {o.turno.toUpperCase()}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{o.data}</span>
                    </div>

                    <p className="text-xs text-slate-900">{o.relato}</p>

                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700">
                      <strong>Providências Tomadas:</strong> {o.providencias}
                    </div>

                    <div className="text-[10px] text-slate-500">
                      Registrado por: <strong>{o.autor_nome}</strong> ({o.autor_perfil})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 7: TRILHA DE AUDITORIA & LOGS WORM */}
          {/* ========================================================================= */}
          {secaoAtiva === 'logs' && (
            <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <IconBadge icon={History} variant="blue" size="sm" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Trilha de Auditoria Imutável (WORM)</h2>
                  <p className="text-xs text-slate-500">Registro cronológico de todas as interações e operações executadas no módulo</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E0E0E0] text-slate-700 font-bold bg-[#F5F5F5]">
                      <th className="py-2.5 px-3">Data/Hora</th>
                      <th className="py-2.5 px-3">Perfil Utilizado</th>
                      <th className="py-2.5 px-3">Ação Executada</th>
                      <th className="py-2.5 px-3">Entidade</th>
                      <th className="py-2.5 px-3">Descrição Detalhada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {logs.map((l: any) => (
                      <tr key={l.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{l.data_hora}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-800 text-[11px] bg-[#F5F5F5] border border-[#E0E0E0] px-2 py-0.5 rounded-md">
                            {l.perfil_ativo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#1A56DB]">{l.acao}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{l.entidade}</td>
                        <td className="py-2.5 px-3 text-slate-800">{l.descricao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 8: PARÂMETROS & REGRAS LEGAIS */}
          {/* ========================================================================= */}
          {secaoAtiva === 'parametros' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <IconBadge icon={Settings} variant="blue" size="sm" />
                  <h2 className="text-sm font-bold text-slate-900">Parâmetros de Conformidade da Lei 14.133/21</h2>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">Limite Individual Carona (Não-Participante)</div>
                      <div className="text-[11px] text-slate-500">Art. 86, § 4º da Nova Lei de Licitações</div>
                    </div>
                    <span className="font-black text-[#1A56DB] text-sm">50%</span>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">Limite Global de Adesões Carona</div>
                      <div className="text-[11px] text-slate-500">Art. 86, § 5º da Nova Lei de Licitações</div>
                    </div>
                    <span className="font-black text-[#1A56DB] text-sm">2x (200%)</span>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">Vigência Máxima da Ata SRP</div>
                      <div className="text-[11px] text-slate-500">Art. 84 (1 ano + prorrogação por igual período)</div>
                    </div>
                    <span className="font-black text-slate-900 text-sm">Até 2 Anos</span>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">Recebimento Provisório e Definitivo</div>
                      <div className="text-[11px] text-slate-500">Art. 140 da Lei 14.133/21</div>
                    </div>
                    <span className="font-bold text-[#0E9F6E] text-xs">Termo Formal</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <IconBadge icon={UserCheck} variant="indigo" size="sm" />
                  <h2 className="text-sm font-bold text-slate-900">Perfis Operacionais do Módulo de Compras</h2>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-[#F0F4FF] rounded-xl border border-[#E0E0E0]">
                    <div className="font-bold text-[#1A56DB]">compras_auditor_cmed</div>
                    <p className="text-slate-700 text-[11px] mt-0.5">
                      Executa laudos de conformidade, confronta preços contra a tabela CMED e BPS, e emite pareceres formais de licitação.
                    </p>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                    <div className="font-bold text-slate-900">compras_operador</div>
                    <p className="text-slate-700 text-[11px] mt-0.5">
                      Pregoeiro ou comprador hospitalar. Solicita ordens de empenho e cotações sob supervisão das travas legais.
                    </p>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                    <div className="font-bold text-slate-900">compras_admin</div>
                    <p className="text-slate-700 text-[11px] mt-0.5">
                      Diretor de Suprimentos. Homologa novas atas, autoriza caronas e gerencia parâmetros do setor e atestos fiscais.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAIS DO PRODUTO ÚNICO (Backdrop sem preto, max #E0E0E0, design hospitalar clean) */}
      {/* ========================================================================= */}

      {/* MODAL: TERMO DE RECEBIMENTO PROVISÓRIO (Art. 140 Lei 14.133/21) */}
      {showModalTermoRecebimento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#E0E0E0]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 max-w-lg w-full shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IconBadge icon={FileCheck2} variant="emerald" size="sm" />
                Atesto de Recebimento Provisório (TRP)
              </h3>
              <button
                onClick={() => setShowModalTermoRecebimento(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-[#F5F5F5] transition-colors"
                aria-label="Fechar Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-emerald-950 space-y-1">
              <div className="font-bold">Art. 140, I, 'a' da Lei Federal 14.133/2021:</div>
              <p>
                O objeto será recebido provisoriamente, de forma sumária, pelo responsável por seu acompanhamento e fiscalização, mediante termo detalhado, quando verificado o cumprimento das exigências de caráter técnico.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Fiscal Responsável</label>
                <input
                  type="text"
                  value={fiscalNome}
                  onChange={(e) => setFiscalNome(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cargo / Especialidade</label>
                <input
                  type="text"
                  value={fiscalCargo}
                  onChange={(e) => setFiscalCargo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações do Recebimento e Laudo</label>
                <textarea
                  rows={3}
                  value={observacoesRecebimento}
                  onChange={(e) => setObservacoesRecebimento(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E0E0E0]">
              <button
                type="button"
                onClick={() => setShowModalTermoRecebimento(false)}
                className="px-4 py-2 rounded-xl border border-[#E0E0E0] text-slate-700 font-bold hover:bg-[#F5F5F5] cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirmandoEntrega}
                onClick={handleConfirmarEntregaPdC}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {confirmandoEntrega ? 'Homologando...' : 'Assinar Termo & Liberar ao WMS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ABERTURA DE CHAMADO */}
      {showModalChamado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#E0E0E0]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 max-w-md w-full shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IconBadge icon={HelpCircle} variant="blue" size="sm" />
                Novo Chamado — Setor de Compras
              </h3>
              <button
                onClick={() => setShowModalChamado(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-[#F5F5F5] transition-colors"
                aria-label="Fechar Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarChamado} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Chamado</label>
                <input
                  type="text"
                  required
                  value={novoChamadoTitulo}
                  onChange={(e) => setNovoChamadoTitulo(e.target.value)}
                  placeholder="Ex: Falha no cálculo de carona para antibiótico"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  required
                  value={novoChamadoDescricao}
                  onChange={(e) => setNovoChamadoDescricao(e.target.value)}
                  placeholder="Descreva o incidente ou solicitação de suporte..."
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prioridade</label>
                <select
                  value={novoChamadoPrioridade}
                  onChange={(e) => setNovoChamadoPrioridade(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] font-medium text-slate-800"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica_bloqueante">Crítica / Bloqueante</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowModalChamado(false)}
                  className="px-4 py-2 rounded-xl border border-[#E0E0E0] text-slate-700 font-bold hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoChamado}
                  className="px-4 py-2 rounded-xl bg-[#1A56DB] text-white font-bold hover:bg-blue-700 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {salvandoChamado ? 'Registrando...' : 'Registrar Chamado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIVRO DE OCORRÊNCIAS */}
      {showModalOcorrencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#E0E0E0]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 max-w-md w-full shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IconBadge icon={BookOpen} variant="amber" size="sm" />
                Registrar Ocorrência no Livro de Turno
              </h3>
              <button
                onClick={() => setShowModalOcorrencia(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-[#F5F5F5] transition-colors"
                aria-label="Fechar Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarOcorrencia} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Turno</label>
                  <select
                    value={novaOcorrenciaTurno}
                    onChange={(e) => setNovaOcorrenciaTurno(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] font-medium text-slate-800"
                  >
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                    <option value="plantao_24h">Plantão 24h</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gravidade</label>
                  <select
                    value={novaOcorrenciaGravidade}
                    onChange={(e) => setNovaOcorrenciaGravidade(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] font-medium text-slate-800"
                  >
                    <option value="informativa">Informativa</option>
                    <option value="atencao">Atenção</option>
                    <option value="grave">Grave</option>
                    <option value="critica_emergencial">Crítica / Emergencial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Relato dos Fatos</label>
                <textarea
                  rows={3}
                  required
                  value={novaOcorrenciaRelato}
                  onChange={(e) => setNovaOcorrenciaRelato(e.target.value)}
                  placeholder="Descreva a ocorrência operacional ou desvio ocorrido durante o expediente..."
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Providências Imediatas Tomadas</label>
                <textarea
                  rows={2}
                  required
                  value={novaOcorrenciaProvidencias}
                  onChange={(e) => setNovaOcorrenciaProvidencias(e.target.value)}
                  placeholder="Ações adotadas para mitigação..."
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] text-slate-800"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowModalOcorrencia(false)}
                  className="px-4 py-2 rounded-xl border border-[#E0E0E0] text-slate-700 font-bold hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoOcorrencia}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {salvandoOcorrencia ? 'Registrando...' : 'Registrar no Livro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORTAR PLANILHA DE MEDICAMENTOS EM LOTE */}
      {modalImportarLoteAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#E0E0E0]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 max-w-lg w-full shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IconBadge icon={Upload} variant="blue" size="sm" />
                Importar Planilha em Lote (CSV / Cotação)
              </h3>
              <button
                onClick={() => setModalImportarLoteAberto(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-[#F5F5F5] transition-colors"
                aria-label="Fechar Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Cole linhas de planilha CSV (separadas por vírgula, ponto-e-vírgula ou tabulação) ou clique para carregar o modelo de teste hospitalar.
              </p>

              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] text-[11px] text-slate-600 font-mono">
                Formato: Medicamento, CATMAT, Quantidade, Preço Ofertado, Fornecedor, Teto CMED, Mediana BPS
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dados da Planilha</label>
                <textarea
                  rows={5}
                  value={textoCsvImportacao}
                  onChange={(e) => setTextoCsvImportacao(e.target.value)}
                  placeholder="Ex: Levofloxacino 500mg, BR0319802, 8000, 14.20, Eurofarma, 22.00, 16.50"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1A56DB] text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleImportarLoteCsv()}
                  className="text-xs font-bold text-[#1A56DB] hover:underline cursor-pointer"
                >
                  ⚡ Usar Template de Demonstração (5 Itens Críticos)
                </button>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setModalImportarLoteAberto(false)}
                  className="px-4 py-2 rounded-xl border border-[#E0E0E0] text-slate-700 font-bold hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={loadingLote}
                  onClick={() => handleImportarLoteCsv()}
                  className="px-4 py-2 rounded-xl bg-[#1A56DB] text-white font-bold hover:bg-blue-700 shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loadingLote ? 'Auditando Lote...' : 'Auditar e Confrontar Lote'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RELATÓRIO E PARECER DE AUDITORIA TCU / TCE */}
      {modalParecerTcuAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#E0E0E0]/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-[#E0E0E0] p-6 max-w-2xl w-full shadow-xl space-y-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#1A56DB] tracking-wider">
                  Controle Governamental de Preços & Probidade Pública
                </div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <IconBadge icon={FileCheck2} variant="emerald" size="sm" />
                  Parecer Técnico de Auditoria em Lote — {cestaLote?.codigo_cotacao}
                </h3>
              </div>
              <button
                onClick={() => setModalParecerTcuAberto(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-[#F5F5F5] transition-colors"
                aria-label="Fechar Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Metadados do Lote */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[#F8FAFC] rounded-2xl border border-[#E0E0E0]">
                <div>
                  <span className="text-[10px] text-slate-500 block">Órgão Demandante</span>
                  <span className="font-bold text-slate-900">{cestaLote?.orgao_demandante || 'Hospital Central 360'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Modalidade</span>
                  <span className="font-bold text-slate-900">{cestaLote?.modalidade || 'Lei 14.133/21'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Data de Apuração</span>
                  <span className="font-bold text-slate-900">{cestaLote?.data_apuracao || '2026-09-21'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Responsável Técnico</span>
                  <span className="font-bold text-slate-900">{cestaLote?.responsavel_auditoria || 'Dra. Marina Santos'}</span>
                </div>
              </div>

              {/* Síntese Numérica da Auditoria */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#F0F4FF] rounded-2xl border border-[#E0E0E0] text-center">
                <div>
                  <span className="text-[10px] text-slate-600 block">Índice de Conformidade Legal</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {cestaLote?.metricas?.taxa_conformidade_pct}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 block">Economia Global vs BPS</span>
                  <span className="text-base font-extrabold text-[#1A56DB]">
                    R$ {(cestaLote?.metricas?.economia_global_bps_reais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 block">Sobrepreço Retido (CMED)</span>
                  <span className="text-base font-extrabold text-rose-700">
                    R$ {(cestaLote?.metricas?.sobrepreco_evitado_cmed_reais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Fundamentação Legal */}
              <div className="p-3 bg-white rounded-2xl border border-[#E0E0E0] space-y-2">
                <div className="font-bold text-slate-900">Fundamentação e Dispositivos Regulatórios:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  <li><strong>Lei Federal nº 10.742/2003 (Art. 23)</strong>: Vedação estrita de aquisição acima do Preço Fábrica / PMVG estipulado pela Câmara de Regulação do Mercado de Medicamentos (CMED/ANVISA).</li>
                  <li><strong>Lei Federal nº 14.133/2021 (Art. 23, § 1º)</strong>: Obrigatoriedade de pesquisa de preços no Banco de Preços em Saúde (BPS) como parâmetro de economicidade.</li>
                  <li><strong>Acórdão TCU nº 2.618/2021</strong>: Determinação de glosa e desclassificação de itens cotados acima do teto regulatório legal.</li>
                </ul>
              </div>

              {/* Hash Criptográfico WORM de Auditoria */}
              <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E0E0E0] space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-bold">Assinatura Digital do Lote (SHA-256):</span>
                  <button
                    onClick={() => {
                      if (cestaLote?.metricas?.hash_auditoria_sha256) {
                        navigator.clipboard.writeText(cestaLote.metricas.hash_auditoria_sha256);
                        setHashCopiado(true);
                        setTimeout(() => setHashCopiado(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1 text-[#1A56DB] hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    {hashCopiado ? 'Copiado!' : 'Copiar Hash'}
                  </button>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#E0E0E0] break-all text-slate-800 font-bold text-[10px]">
                  {cestaLote?.metricas?.hash_auditoria_sha256 || 'SHA-256-PENDING'}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setModalParecerTcuAberto(false)}
                  className="px-4 py-2 rounded-xl border border-[#E0E0E0] text-slate-700 font-bold hover:bg-[#F5F5F5] cursor-pointer transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#1A56DB] text-white font-bold hover:bg-blue-700 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Parecer Oficial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
