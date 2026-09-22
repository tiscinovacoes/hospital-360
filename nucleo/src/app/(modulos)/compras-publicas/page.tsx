'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { KpiCard, IconBadge } from '@/components/KpiCard';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
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
  Info,
  Trash2,
  Building,
  DollarSign,
  Database
} from 'lucide-react';

type PerfilCompras = 'compras_operador' | 'compras_auditor_cmed' | 'compras_admin';
type SecaoModulo =
  | 'visao_geral'
  | 'pedidos_compra'
  | 'atas'
  | 'confirmar_entrega'
  | 'comparativo_lote'
  | 'validador_cmed'
  | 'banco_precos'
  | 'chamados'
  | 'ocorrencias'
  | 'logs'
  | 'despesas_hub'
  | 'parametros';

const SEED_PDC_PADRAO = {
  id: 'pdc-001',
  numero_pdc: 'PdC-2026-0001',
  numero_empenho: 'EMP-2026/894120',
  numero_contrato: 'CONT-2026/042-A',
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
  const [perfilAtivo] = useState<PerfilCompras>('compras_operador');

  // Estados de Dados da API
  const [atas, setAtas] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [empenhos, setEmpenhos] = useState<any[]>([]);
  const [pedidosCompra, setPedidosCompra] = useState<any[]>([SEED_PDC_PADRAO]);
  const [bancoPrecos, setBancoPrecos] = useState<any[]>([]);
  const [origemBancoPrecos, setOrigemBancoPrecos] = useState<string>('CACHE_LOCAL_OFICIAL');
  const [filtroBancoPrecos, setFiltroBancoPrecos] = useState<string>('');
  const [sincronizandoBanco, setSincronizandoBanco] = useState(false);
  const [feedbackSincronizacao, setFeedbackSincronizacao] = useState<{ tipo: 'sucesso' | 'info' | 'erro'; texto: string } | null>(null);
  const [cotacoes, setCotacoes] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [chamados, setChamados] = useState<any[]>([]);
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState('');

  // -------------------------------------------------------------
  // ESTADOS DA TELA "NOVO PEDIDO DE COMPRA" (Idêntica à Imagem)
  // -------------------------------------------------------------
  const [novoPdcNumero, setNovoPdcNumero] = useState(`PdC-2026-${String(Math.floor(100 + Math.random() * 900))}`);
  const [novoPdcData, setNovoPdcData] = useState(new Date().toISOString().substring(0, 10));
  const [vinculadoAta, setVinculadoAta] = useState(true);
  const [ataSelecionadaId, setAtaSelecionadaId] = useState<string>('ata-001');
  const [contratoSelecionadoId, setContratoSelecionadoId] = useState<string>('cont-001');
  const [empenhoSelecionadoId, setEmpenhoSelecionadoId] = useState<string>('emp-001');
  const [dataEntregaPrevista, setDataEntregaPrevista] = useState('2026-09-28');
  
  // Detalhes do item a adicionar
  const [medicamentoSelecionadoId, setMedicamentoSelecionadoId] = useState<string>('item-001');
  const [itemQuantidade, setItemQuantidade] = useState<number>(1000);
  const [itensAdicionados, setItensAdicionados] = useState<any[]>([
    {
      id: 'it-add-1',
      catmat: 'BR0284729',
      descricao: 'Meropenem 1g Pó Liofilizado Injetável',
      quantidade: 1000,
      preco_unitario: 48.50,
      total: 48500.00
    }
  ]);

  // Governança de Exceção de Saldo
  const [showJustificativaModal, setShowJustificativaModal] = useState(false);
  const [justificativaTexto, setJustificativaTexto] = useState('');
  const [aprovadorNome, setAprovadorNome] = useState('Dr. Roberto Vasconcelos');
  const [aprovadorCargo, setAprovadorCargo] = useState('Ordenador de Despesas / Diretor Clínico');
  const [salvandoPedido, setSalvandoPedido] = useState(false);
  const [feedbackPedido, setFeedbackPedido] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // -------------------------------------------------------------
  // ESTADOS DE CONTRATOS & EMPENHOS (Aba Atas)
  // -------------------------------------------------------------
  const [showModalContrato, setShowModalContrato] = useState(false);
  const [contratoTipoFracionamento, setContratoTipoFracionamento] = useState<'FRACIONADO' | 'INTEGRAL'>('FRACIONADO');
  const [contratoPercentual, setContratoPercentual] = useState<number>(50.0); // Padrão: 50% da Ata
  const [salvandoContrato, setSalvandoContrato] = useState(false);

  const [showModalEmpenho, setShowModalEmpenho] = useState(false);
  const [empenhoQtdDesejada, setEmpenhoQtdDesejada] = useState<number>(2000);
  const [empenhoDotacao, setEmpenhoDotacao] = useState('10.302.0042.2045.339030 (Medicamentos e Insumos Hospitalares)');
  const [salvandoEmpenho, setSalvandoEmpenho] = useState(false);

  // -------------------------------------------------------------
  // ESTADOS DE ENTRADA DE NF-E E BAIXA EM CASCATA
  // -------------------------------------------------------------
  const [pdcSelecionadoId, setPdcSelecionadoId] = useState<string>('pdc-001');
  const [danfeNumero, setDanfeNumero] = useState('004.891.201');
  const [danfeSerie, setDanfeSerie] = useState('1');
  const [danfeChave, setDanfeChave] = useState('3526 0912 3456 7800 0190 5500 1004 8912 0110 4918 2741');
  const [fiscalNome, setFiscalNome] = useState('Dra. Amanda Nogueira (CRF-SP 48.912)');
  const [fiscalCargo, setFiscalCargo] = useState('Fiscal Técnico do Contrato / Farmacêutica RT');
  const [loteConferido, setLoteConferido] = useState('MP-2026/X08');
  const [validadeConferida, setValidadeConferida] = useState('2027-10-31');
  const [tempAferida, setTempAferida] = useState('21.4ºC');
  const [confirmandoEntrega, setConfirmandoEntrega] = useState(false);
  const [reciboCascata, setReciboCascata] = useState<any | null>(null);

  const rolesCompras = MODULO_ROLES_CATALOG['compras-publicas'];
  const [activeRoleCompras, setActiveRoleCompras] = useState<ModuloRole>(rolesCompras[0]);

  // Checklist de Conferência do PdC
  const [checklist, setChecklist] = useState({
    danfe_conferida: true,
    embalagem_integra: true,
    lote_validade_ok: true,
    temperatura_conforme: true,
    laudo_fabricante_anexo: true
  });

  // -------------------------------------------------------------
  // ESTADOS DA COTAÇÃO MULTIPOLAR & COMPARATIVO DE PREÇOS
  // -------------------------------------------------------------
  const [showModalNovaCotacao, setShowModalNovaCotacao] = useState(false);
  const [novaCotacaoTitulo, setNovaCotacaoTitulo] = useState('Cotação Mensal de Antimicrobianos');
  const [novaCotacaoOrigem, setNovaCotacaoOrigem] = useState<'MANUAL' | 'LOTE_PDF' | 'LOTE_CSV'>('MANUAL');
  const [novaCotacaoItensTexto, setNovaCotacaoItensTexto] = useState('');
  const [salvandoCotacao, setSalvandoCotacao] = useState(false);

  const [showModalPropostaFornecedor, setShowModalPropostaFornecedor] = useState(false);
  const [propFornecedorNome, setPropFornecedorNome] = useState('Blau Farmacêutica S.A.');
  const [propFornecedorCnpj, setPropFornecedorCnpj] = useState('58.430.828/0001-60');
  const [propPrecoUnit, setPropPrecoUnit] = useState('47.80');
  const [propLote, setPropLote] = useState('BL-2026-M04');
  const [propValidade, setPropValidade] = useState('2028-06-30');
  const [propFabricante, setPropFabricante] = useState('Blau Farmacêutica');
  const [propCotacaoId, setPropCotacaoId] = useState('COT-2026-089');
  const [propItemId, setPropItemId] = useState('coti-001');
  const [salvandoProposta, setSalvandoProposta] = useState(false);

  // -------------------------------------------------------------
  // ESTADOS DO VALIDADOR CMED UNITÁRIO
  // -------------------------------------------------------------
  const [catmatInput, setCatmatInput] = useState('BR0284729');
  const [nomeMedInput, setNomeMedInput] = useState('Meropenem 1g Pó Liofilizado Injetável');
  const [precoPropostoInput, setPrecoPropostoInput] = useState('48.50');
  const [resultadoValidacao, setResultadoValidacao] = useState<any | null>(null);
  const [validandoPreco, setValidandoPreco] = useState(false);

  // -------------------------------------------------------------
  // ESTADOS DE CHAMADOS & OCORRÊNCIAS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // CARREGAR DADOS INICIAIS DA API
  // -------------------------------------------------------------
  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/compras-atas');
      const data = await res.json();
      if (data.success) {
        setAtas(data.atas || []);
        setContratos(data.contratos || []);
        setEmpenhos(data.empenhos || []);
        if (data.pedidos_compra && data.pedidos_compra.length > 0) {
          setPedidosCompra(data.pedidos_compra);
        }
        setBancoPrecos(data.banco_precos || []);
        if (data.origem_banco_precos) {
          setOrigemBancoPrecos(data.origem_banco_precos);
        }
        setCotacoes(data.cotacoes || []);
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

  const handleSincronizarBancoPrecos = async () => {
    try {
      setSincronizandoBanco(true);
      setFeedbackSincronizacao(null);
      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'semear_banco_precos' })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackSincronizacao({
          tipo: 'sucesso',
          texto: `Banco de Dados Supabase sincronizado com sucesso! ${data.inseridos} medicamentos oficiais catalogados.`
        });
        await carregarDados();
      } else {
        setFeedbackSincronizacao({
          tipo: 'info',
          texto: data.mensagem || 'Conexão ativa com o catálogo oficial CMED/BPS.'
        });
      }
    } catch (err: any) {
      setFeedbackSincronizacao({
        tipo: 'erro',
        texto: `Falha na requisição de sincronização: ${err.message}`
      });
    } finally {
      setSincronizandoBanco(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Ata selecionada atual para o formulário de Pedido
  const ataAtiva = atas.find(a => a.id === ataSelecionadaId) || atas[0] || null;
  const contratoAtivo = contratos.find(c => c.id === contratoSelecionadoId) || contratos[0] || null;
  const empenhoAtivo = empenhos.find(e => e.id === empenhoSelecionadoId) || empenhos[0] || null;
  const medAtivo = ataAtiva?.itens?.find((i: any) => i.id === medicamentoSelecionadoId) || ataAtiva?.itens?.[0] || null;

  // Cálculos de Total Geral dos Itens Adicionados
  const totalGeralPedido = itensAdicionados.reduce((acc, it) => acc + it.total, 0);

  // Checagens de Saldo em Cascata
  const saldoAtaDisponivel = ataAtiva ? ataAtiva.saldo_disponivel : 0;
  const saldoContratoDisponivel = contratoAtivo ? contratoAtivo.saldo_contrato_remanescente : 0;
  const saldoEmpenhoDisponivel = empenhoAtivo ? empenhoAtivo.saldo_empenho_remanescente : 0;

  const faltaSaldoAta = totalGeralPedido > saldoAtaDisponivel;
  const faltaSaldoContrato = totalGeralPedido > saldoContratoDisponivel;
  const faltaSaldoEmpenho = totalGeralPedido > saldoEmpenhoDisponivel;

  const excessoAta = Math.max(0, totalGeralPedido - saldoAtaDisponivel);
  const excessoContrato = Math.max(0, totalGeralPedido - saldoContratoDisponivel);
  const excessoEmpenho = Math.max(0, totalGeralPedido - saldoEmpenhoDisponivel);

  // Adicionar medicamento à lista
  const handleAdicionarMedicamento = () => {
    if (!medAtivo) return;
    const totalItem = Number((itemQuantidade * medAtivo.preco_homologado).toFixed(2));
    const novoItem = {
      id: `it-add-${Date.now()}`,
      catmat: medAtivo.codigo_catmat,
      descricao: medAtivo.descricao_medicamento,
      quantidade: itemQuantidade,
      preco_unitario: medAtivo.preco_homologado,
      total: totalItem
    };
    setItensAdicionados([...itensAdicionados, novoItem]);
  };

  const handleRemoverItem = (id: string) => {
    setItensAdicionados(itensAdicionados.filter(i => i.id !== id));
  };

  // Submissão do Pedido de Compra
  const handleCriarPedidoCompra = async () => {
    if (faltaSaldoAta) {
      setFeedbackPedido({
        tipo: 'erro',
        texto: 'AVISO: Saldo insuficiente na ATA. Conforme o Art. 82 da Lei 14.133/21, o saldo da Ata não pode ser extrapolado. Emissão bloqueada.'
      });
      return;
    }

    if ((faltaSaldoEmpenho || faltaSaldoContrato) && (!justificativaTexto || !aprovadorNome)) {
      setShowJustificativaModal(true);
      return;
    }

    try {
      setSalvandoPedido(true);
      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'emitir_pedido_compra',
          empenho_id: empenhoAtivo?.id,
          data_entrega_prevista: dataEntregaPrevista,
          itens_pedido: itensAdicionados.map(it => ({
            catmat: it.catmat,
            descricao: it.descricao,
            quantidade: it.quantidade,
            preco_unitario: it.preco_unitario
          })),
          tem_justificativa: faltaSaldoEmpenho || faltaSaldoContrato,
          justificativa_texto: justificativaTexto,
          aprovador_nome: aprovadorNome,
          aprovador_cargo: aprovadorCargo
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackPedido({ tipo: 'sucesso', texto: data.mensagem });
        setNovoPdcNumero(`PdC-2026-${String(Math.floor(100 + Math.random() * 900))}`);
        setShowJustificativaModal(false);
        carregarDados();
      } else {
        setFeedbackPedido({ tipo: 'erro', texto: data.error || 'Falha ao emitir pedido de compra.' });
      }
    } catch (err) {
      console.error(err);
      setFeedbackPedido({ tipo: 'erro', texto: 'Erro de comunicação ao emitir pedido.' });
    } finally {
      setSalvandoPedido(false);
    }
  };

  // Gerar Contrato a partir da Ata (Padrão: 50%)
  const handleGerarContrato = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvandoContrato(true);
      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'gerar_contrato',
          ata_id: ataSelecionadaId,
          tipo_fracionamento: contratoTipoFracionamento,
          percentual_fracionamento: contratoPercentual
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModalContrato(false);
        carregarDados();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoContrato(false);
    }
  };

  // Emitir Empenho a partir do Contrato
  const handleEmitirEmpenho = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contratoAtivo) return;
    try {
      setSalvandoEmpenho(true);
      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'emitir_empenho',
          contrato_id: contratoAtivo.id,
          dotacao_orcamentaria: empenhoDotacao,
          orgao_demandante: 'Hospital Central 360',
          itens_empenho: [
            {
              contrato_item_id: contratoAtivo.itens?.[0]?.id,
              codigo_catmat: contratoAtivo.itens?.[0]?.codigo_catmat,
              quantidade: empenhoQtdDesejada
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModalEmpenho(false);
        carregarDados();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoEmpenho(false);
    }
  };

  // Entrada de NF-e e Baixa em Cascata
  const handleEntradaNfeCascata = async () => {
    const pdc = pedidosCompra.find(p => p.id === pdcSelecionadoId || p.numero_pdc === pdcSelecionadoId) || pedidosCompra[0];
    if (!pdc) return;

    try {
      setConfirmandoEntrega(true);
      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'dar_entrada_nfe_cascata',
          pdc_id: pdc.id,
          numero_danfe: danfeNumero,
          serie_danfe: danfeSerie,
          chave_acesso: danfeChave,
          fiscal_nome: fiscalNome,
          fiscal_cargo: fiscalCargo,
          itens_conferencia: pdc.itens.map((it: any) => ({
            catmat: it.catmat,
            preco_unitario: it.preco_unitario,
            quantidade_entregue: it.quantidade_pedida,
            lote: loteConferido,
            validade: validadeConferida,
            temperatura_aferida: tempAferida
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        setReciboCascata(data);
        carregarDados();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmandoEntrega(false);
    }
  };

  // Abertura de Nova Cotação
  const handleAbrirNovaCotacao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvandoCotacao(true);
      const linhas = novaCotacaoItensTexto.trim().split('\n').filter(l => l.trim().length > 0);
      const itensFormatados = linhas.map((linha, idx) => {
        const partes = linha.split(/[,;\t]/).map(p => p.trim());
        return {
          descricao_medicamento: partes[0] || `Medicamento Cotado ${idx + 1}`,
          codigo_catmat: partes[1] || `BR0${Math.floor(100000 + Math.random() * 900000)}`,
          quantidade: Number(partes[2]) || 5000,
          preco_cmed_teto: Number(partes[3]) || 50.0,
          preco_bps_mediana: Number(partes[4]) || 40.0
        };
      });

      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'abrir_cotacao_preco',
          titulo: novaCotacaoTitulo,
          origem_importacao: novaCotacaoOrigem,
          responsavel: perfilAtivo === 'compras_admin' ? 'Coordenador Geral de Licitações' : 'Comprador Técnico',
          itens: itensFormatados.length > 0 ? itensFormatados : [
            { descricao_medicamento: 'Meropenem 1g Pó Liofilizado', codigo_catmat: 'BR0284729', quantidade: 10000, preco_cmed_teto: 68.20, preco_bps_mediana: 52.10 },
            { descricao_medicamento: 'Noradrenalina 2mg/mL Ampola 4mL', codigo_catmat: 'BR0194851', quantidade: 20000, preco_cmed_teto: 18.50, preco_bps_mediana: 14.20 }
          ]
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowModalNovaCotacao(false);
        setNovaCotacaoItensTexto('');
        carregarDados();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoCotacao(false);
    }
  };

  // Registrar Proposta de Fornecedor
  const handleLancarProposta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvandoProposta(true);
      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'lancar_proposta_fornecedor',
          cotacao_id: propCotacaoId,
          cotacao_item_id: propItemId,
          razao_social: propFornecedorNome,
          cnpj: propFornecedorCnpj,
          preco_unitario: propPrecoUnit,
          lote_fabricante: propLote,
          data_validade: propValidade,
          fabricante_marca: propFabricante
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModalPropostaFornecedor(false);
        carregarDados();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoProposta(false);
    }
  };

  // Homologar Tabela Comparativa (Aceitar / Excluir)
  const handleHomologarProposta = async (cotacaoId: string, propostaId: string, acao: 'aceitar' | 'excluir') => {
    try {
      await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'homologar_comparativo_precos',
          cotacao_id: cotacaoId,
          acoes_propostas: [
            {
              proposta_id: propostaId,
              aceito: acao === 'aceitar',
              excluido: acao === 'excluir',
              motivo_descarte: acao === 'excluir' ? 'Proposta desclassificada por ultrapassar a média de mercado.' : undefined
            }
          ]
        })
      });
      carregarDados();
    } catch (err) {
      console.error(err);
    }
  };

  // Validar Preço CMED
  const handleValidarPreco = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setValidandoPreco(true);
      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'validar_preco',
          codigo_catmat: catmatInput,
          nome_medicamento: nomeMedInput,
          preco_proposto: precoPropostoInput,
          fornecedor_cnpj: '12.345.678/0001-90',
          fornecedor_razao_social: 'Distribuidora Farmacêutica Nacional S/A',
          quantidade_ofertada: 2000
        })
      });
      const data = await res.json();
      if (data.success) {
        setResultadoValidacao(data.resultado);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setValidandoPreco(false);
    }
  };

  // Salvar Chamado
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
          setor: 'Coordenação de Suprimentos',
          autor_nome: 'Carlos Eduardo',
          autor_perfil: perfilAtivo
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModalChamado(false);
        setNovoChamadoTitulo('');
        setNovoChamadoDescricao('');
        carregarDados();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoChamado(false);
    }
  };

  // Salvar Ocorrência
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
          autor_nome: 'Carlos Eduardo',
          autor_perfil: perfilAtivo
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModalOcorrencia(false);
        setNovaOcorrenciaRelato('');
        setNovaOcorrenciaProvidencias('');
        carregarDados();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSalvandoOcorrencia(false);
    }
  };

  // Menu Lateral Oficial do Produto
  const menuItens = [
    {
      id: 'visao_geral',
      label: 'Visão Geral & Métricas',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'pedidos_compra',
      label: 'Pedidos de Compra (PdC)',
      icon: ShoppingCart,
      badge: 'Novo',
      badgeCor: 'bg-[#1A56DB] text-white shadow-xs'
    },
    {
      id: 'atas',
      label: 'Atas, Contratos & Empenhos',
      icon: FileText,
      badge: `${atas.length} Atas`,
      badgeCor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'confirmar_entrega',
      label: 'Confirmar Entrega / Entrada NF-e',
      icon: PackageCheck,
      badge: pedidosCompra.filter(p => p.status === 'AGUARDANDO_RECEBIMENTO').length > 0 ? '1 Pendente' : null,
      badgeCor: 'bg-emerald-600 text-white shadow-xs'
    },
    {
      id: 'comparativo_lote',
      label: 'Comparativo de Preços & Cotação',
      icon: Layers,
      badge: 'Multipolar',
      badgeCor: 'bg-indigo-600 text-white font-bold'
    },
    {
      id: 'validador_cmed',
      label: 'Validador CMED / BPS',
      icon: Scale,
      badge: 'Lei 14.133',
      badgeCor: 'bg-amber-500 text-white font-bold'
    },
    {
      id: 'banco_precos',
      label: 'Banco de Preços (CMED/BPS)',
      icon: Database,
      badge: `${bancoPrecos.length || 15} itens`,
      badgeCor: 'bg-emerald-600 text-white font-bold'
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
      id: 'despesas_hub',
      label: 'Exportar Despesas ao Hub',
      icon: FileSpreadsheet,
      badge: 'Hub 360',
      badgeCor: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    }
  ];

  const pdcAtivo = pedidosCompra.find(p => p.id === pdcSelecionadoId || p.numero_pdc === pdcSelecionadoId) || pedidosCompra[0] || SEED_PDC_PADRAO;

  return (
    <>
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
              title={sidebarAberta ? 'Recolher menu de seções' : 'Expandir menu de seções'}
            >
              {sidebarAberta ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setSecaoAtiva('pedidos_compra')}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#1A56DB] text-white hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Novo Pedido (PdC)</span>
            </button>

            <button
              onClick={() => setSecaoAtiva('confirmar_entrega')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Confirmar Entrega</span>
            </button>
          </div>
        }
      />

      {/* Backdrop Mobile Transparente com Blur */}
      {sidebarAberta && (
        <div
          onClick={() => setSidebarAberta(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* ========================================================================= */}
      {/* 2. CORPO PRINCIPAL COM SIDEBAR RETRÁTIL & MOBILE DRAWER */}
      {/* ========================================================================= */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Menu Lateral Colorido com a Cor do Módulo (Azul Cobalto) */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-30
            ${sidebarAberta ? 'translate-x-0 w-72 lg:w-64 shadow-xl lg:shadow-none' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:hidden'}
            shrink-0 bg-gradient-to-b from-blue-50/95 via-white to-blue-50/80 border-r border-blue-200/90 flex flex-col justify-between transition-all duration-200 ease-in-out
          `}
        >
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Menu de Compras &amp; Atas
            </div>
            {menuItens.map((item) => {
              const Icone = item.icon;
              const ativo = secaoAtiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSecaoAtiva(item.id as SecaoModulo);
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setSidebarAberta(false);
                    }
                  }}
                  className={`w-full min-h-[44px] sm:min-h-[38px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                    ativo
                      ? 'bg-[#1A56DB] text-white font-bold border border-blue-600 shadow-sm shadow-blue-600/25'
                      : 'text-slate-700 hover:bg-white/90 hover:text-[#1A56DB] hover:shadow-2xs border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icone
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        ativo ? 'text-white' : 'text-blue-500/80 group-hover:text-[#1A56DB]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                        ativo
                          ? 'bg-white/20 text-white'
                          : item.badgeCor || 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-blue-200/90 bg-blue-50/90 space-y-2">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-blue-200 bg-white text-[#1A56DB] hover:text-blue-900 hover:bg-blue-50 text-xs font-bold transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Hub de Módulos</span>
            </Link>
          </div>
        </aside>

        {/* Área Central de Conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pb-2 border-b border-[#E0E0E0]">
            <span>Vigia Saúde</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span>Gerente de Compras</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-slate-900">
              {menuItens.find((m) => m.id === secaoAtiva)?.label || 'Painel'}
            </span>
          </div>

          {/* BARRA DE RBAC & CONTROLE DE PERFIS DO MÓDULO */}
          <ModuloRbacBar
            moduloId="compras-publicas"
            activeRole={activeRoleCompras}
            onRoleChange={setActiveRoleCompras}
            accentColor="#1A56DB"
            lightBg="bg-blue-50"
            lightBorder="border-blue-200"
          />

          {/* ========================================================================= */}
          {/* SEÇÃO 1: NOVO PEDIDO DE COMPRA (PdC) - FIEL À IMAGEM DO USUÁRIO */}
          {/* ========================================================================= */}
          {secaoAtiva === 'pedidos_compra' && (
            <div className="space-y-6">
              {/* Cabeçalho da Tela */}
              <div>
                <h1 className="text-xl font-bold text-slate-900">Novo Pedido de Compra</h1>
                <p className="text-xs text-slate-500 mt-0.5">Criar uma nova ordem de compra de medicamentos</p>
              </div>

              {/* Feedback de Emissão */}
              {feedbackPedido && (
                <div
                  className={`p-4 rounded-xl border text-xs shadow-xs ${
                    feedbackPedido.tipo === 'sucesso'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2 text-sm">
                    {feedbackPedido.tipo === 'sucesso' ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0E9F6E]" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[#E02424]" />
                    )}
                    <span>{feedbackPedido.tipo === 'sucesso' ? 'Sucesso!' : 'Atenção Regulamentar'}</span>
                  </div>
                  <p className="mt-1">{feedbackPedido.texto}</p>
                </div>
              )}

              {/* Card Branco Principal do Formulário */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 space-y-6 shadow-xs">
                {/* Linha 1: Número do PdC e Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número do PdC</label>
                    <input
                      type="text"
                      disabled
                      value={novoPdcNumero}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl text-xs font-mono font-bold text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Gerado automaticamente</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
                    <input
                      type="date"
                      value={novoPdcData}
                      onChange={(e) => setNovoPdcData(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Data da emissão</span>
                  </div>
                </div>

                {/* Linha 2: Vinculado à ATA? (Toggle NÃO / SIM) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Vinculado à ATA?</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVinculadoAta(false)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !vinculadoAta
                          ? 'bg-[#1A56DB] text-white shadow-xs'
                          : 'bg-[#F5F5F5] text-slate-700 border border-[#E0E0E0] hover:bg-[#EAEAEA]'
                      }`}
                    >
                      NÃO
                    </button>
                    <button
                      type="button"
                      onClick={() => setVinculadoAta(true)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        vinculadoAta
                          ? 'bg-[#1A56DB] text-white shadow-xs'
                          : 'bg-[#F5F5F5] text-slate-700 border border-[#E0E0E0] hover:bg-[#EAEAEA]'
                      }`}
                    >
                      SIM
                    </button>
                  </div>
                </div>

                {/* Linha 3: Selecione a ATA + Card de Status da ATA */}
                {vinculadoAta && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Selecione a ATA</label>
                      <select
                        value={ataSelecionadaId}
                        onChange={(e) => setAtaSelecionadaId(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                      >
                        {atas.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.numero_ata} - {a.fornecedor_razao_social}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Card de Detalhe da ATA (Fiel à imagem) */}
                    {ataAtiva && (
                      <div className="bg-[#F0F4FF] border border-[#E0E0E0] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <IconBadge icon={ShieldCheck} variant="blue" size="sm" />
                          <span className="font-bold text-slate-900">{ataAtiva.numero_ata}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Disponível:</span>
                            <span className="font-bold text-[#0E9F6E]">
                              R$ {saldoAtaDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Total:</span>
                            <span className="font-bold text-slate-800">
                              R$ {ataAtiva.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Vigência:</span>
                            <span className="font-medium text-slate-700">{ataAtiva.vigencia_fim}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Seletores da Hierarquia em Cascata: Contrato e Empenho */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contrato Administrativo Vinculado
                    </label>
                    <select
                      value={contratoSelecionadoId}
                      onChange={(e) => setContratoSelecionadoId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                    >
                      {contratos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.numero_contrato} (Saldo Contrato: R$ {c.saldo_contrato_remanescente?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Saldo disponível no Contrato: <strong className="text-slate-800">R$ {saldoContratoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nota de Empenho Vinculada
                    </label>
                    <select
                      value={empenhoSelecionadoId}
                      onChange={(e) => setEmpenhoSelecionadoId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                    >
                      {empenhos.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.numero_empenho} (Saldo Empenho: R$ {e.saldo_empenho_remanescente?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Saldo disponível no Empenho: <strong className="text-slate-800">R$ {saldoEmpenhoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </span>
                  </div>
                </div>

                {/* Linha 4: Fornecedor e Data de Entrega Prevista */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fornecedor</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={ataAtiva?.fornecedor_razao_social || 'Distribuidora Farmacêutica Nacional S/A'}
                        className="w-full px-3 py-2 pl-9 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800"
                      />
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Fornecedor definido pela ATA selecionada</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Data de Entrega Prevista</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dataEntregaPrevista}
                        onChange={(e) => setDataEntregaPrevista(e.target.value)}
                        className="w-full px-3 py-2 pl-9 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Seção: Detalhes do Item */}
                <div className="border-t border-[#E0E0E0] pt-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Detalhes do Item</h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Medicamento</label>
                    <select
                      value={medicamentoSelecionadoId}
                      onChange={(e) => setMedicamentoSelecionadoId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                    >
                      {ataAtiva?.itens?.map((it: any) => (
                        <option key={it.id} value={it.id}>
                          {it.descricao_medicamento} (CATMAT: {it.codigo_catmat}) - Preço ATA: R$ {it.preco_homologado?.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Filtrando apenas medicamentos pertencentes à ATA selecionada</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade</label>
                      <input
                        type="number"
                        min="1"
                        value={itemQuantidade}
                        onChange={(e) => setItemQuantidade(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Preço Unitário (R$)</label>
                      <input
                        type="text"
                        disabled
                        value={medAtivo ? `R$ ${medAtivo.preco_homologado?.toFixed(2)}` : 'R$ 0,00'}
                        className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl text-xs font-bold text-slate-800"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Preço preenchido automaticamente pela ATA</span>
                    </div>
                  </div>

                  {/* Confronto Oficial com Banco de Dados de Preços (CMED/BPS) */}
                  {medAtivo && (
                    <div className="p-3 bg-[#F0F4FF] rounded-xl border border-[#E0E0E0] text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-[#1A56DB]" />
                          <span>Banco Oficial de Preços de Medicamentos</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          Conferência CMED / BPS Ativa
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                        <div className="bg-white p-2 rounded-lg border border-[#E0E0E0]">
                          <span className="text-slate-500 block text-[10px]">Teto Regulatório CMED:</span>
                          <span className="font-bold text-slate-900">
                            R$ {(medAtivo.preco_teto_cmed || (medAtivo.preco_homologado * 1.35)).toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-[#E0E0E0]">
                          <span className="text-slate-500 block text-[10px]">Mediana SUS (BPS):</span>
                          <span className="font-bold text-slate-900">
                            R$ {(medAtivo.preco_referencia_bps || (medAtivo.preco_homologado * 1.08)).toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-[#E0E0E0]">
                          <span className="text-slate-500 block text-[10px]">Economia Gerada (CMED):</span>
                          <span className="font-bold text-[#0E9F6E]">
                            R$ {((medAtivo.preco_teto_cmed - medAtivo.preco_homologado) * itemQuantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 block">Total do Item:</span>
                    <span className="text-base font-bold text-slate-900">
                      R$ {medAtivo ? (itemQuantidade * medAtivo.preco_homologado).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdicionarMedicamento}
                    className="w-full py-2.5 px-4 border border-[#1A56DB] text-[#1A56DB] hover:bg-blue-50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer focus:ring-2 focus:ring-blue-500"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Adicionar outro medicamento</span>
                  </button>
                </div>

                {/* Seção: Itens Adicionados */}
                <div className="border-t border-[#E0E0E0] pt-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    Itens Adicionados ({itensAdicionados.length})
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-slate-700 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Medicamento</th>
                          <th className="py-2.5 px-3">CatMAT</th>
                          <th className="py-2.5 px-3 text-right">Quantidade</th>
                          <th className="py-2.5 px-3 text-right">Preço Unit.</th>
                          <th className="py-2.5 px-3 text-right">Total</th>
                          <th className="py-2.5 px-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0E0E0]">
                        {itensAdicionados.map((it) => (
                          <tr key={it.id} className="hover:bg-[#F8FAFC]">
                            <td className="py-2.5 px-3 font-medium text-slate-900">{it.descricao}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{it.catmat}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-800">{it.quantidade}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                              R$ {it.preco_unitario?.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              R$ {it.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => handleRemoverItem(it.id)}
                                className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                                title="Remover item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                    <span className="text-xs font-bold text-slate-700">Total Geral do Pedido:</span>
                    <span className="text-lg font-bold text-[#1A56DB]">
                      R$ {totalGeralPedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* BANNERS DE ALERTA EM CASCATA */}
                {/* ========================================================================= */}
                
                {/* BANNER 1: ALERTA DE SALDO DE EMPENHO INSUFICIENTE */}
                {faltaSaldoEmpenho && !faltaSaldoAta && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-sm text-amber-900">
                          ⚠️ AVISO: Saldo Insuficiente na Nota de Empenho
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[11px] text-amber-800">
                          <span>Disponível no Empenho: <strong>R$ {saldoEmpenhoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                          <span>Total da Compra: <strong>R$ {totalGeralPedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                          <span>Excesso: <strong className="text-rose-700">R$ {excessoEmpenho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                        </div>
                        <p className="mt-1 text-[10px] text-amber-700">
                          É necessário solicitar novo empenho ou prosseguir com Justificativa Formal e Aprovação do Ordenador de Despesa.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => setShowJustificativaModal(true)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                      >
                        {justificativaTexto ? 'Justificativa Anexada ✓' : 'Continuar com Justificativa'}
                      </button>
                    </div>
                  </div>
                )}

                {/* BANNER 2: ALERTA DE SALDO DE CONTRATO INSUFICIENTE */}
                {faltaSaldoContrato && !faltaSaldoAta && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-sm text-amber-900">
                          ⚠️ AVISO: Saldo Insuficiente no Contrato Administrativo
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[11px] text-amber-800">
                          <span>Disponível no Contrato: <strong>R$ {saldoContratoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                          <span>Total da Compra: <strong>R$ {totalGeralPedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                          <span>Excesso: <strong className="text-rose-700">R$ {excessoContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                        </div>
                        <p className="mt-1 text-[10px] text-amber-700">
                          É necessário formalizar novo contrato/aditivo ou prosseguir com Justificativa Formal e Aprovação da Gestão Contratual.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        onClick={() => setShowJustificativaModal(true)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                      >
                        {justificativaTexto ? 'Justificativa Anexada ✓' : 'Continuar com Justificativa'}
                      </button>
                    </div>
                  </div>
                )}

                {/* BANNER 3: ALERTA DE SALDO DE ATA INSUFICIENTE (IDÊNTICO À IMAGEM DO USUÁRIO COM BLOQUEIO TOTAL) */}
                {faltaSaldoAta && (
                  <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-xs text-rose-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-[#E02424] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-sm text-[#E02424]">
                          ⚠️ AVISO: Saldo Insuficiente na ATA
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[11px] text-rose-800">
                          <span>Disponível: <strong>R$ {saldoAtaDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                          <span>Total da Compra: <strong>R$ {totalGeralPedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                          <span>Excesso: <strong className="text-rose-950">R$ {excessoAta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                        </div>
                        <p className="mt-1 text-[11px] font-bold text-rose-900">
                          BLOQUEIO LEGAL INTRANSPONÍVEL (Lei 14.133/21, Art. 82): O saldo total da Ata de Registro de Preços está esgotado. Não é permitido emitir pedidos além do quantitativo registrado na Ata.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        disabled
                        className="px-3 py-1.5 bg-[#E0E0E0] text-slate-500 rounded-lg text-xs font-bold cursor-not-allowed shadow-2xs"
                        title="Bloqueio total intransponível da Lei 14.133/21"
                      >
                        Continuar Mesmo Assim (Bloqueado)
                      </button>
                    </div>
                  </div>
                )}

                {/* Botões do Rodapé */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
                  <button
                    type="button"
                    onClick={() => {
                      setItensAdicionados([]);
                      setFeedbackPedido(null);
                    }}
                    className="px-4 py-2 border border-[#E0E0E0] text-slate-700 hover:bg-[#F5F5F5] rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={faltaSaldoAta || salvandoPedido || itensAdicionados.length === 0}
                    onClick={handleCriarPedidoCompra}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center gap-2 ${
                      faltaSaldoAta || itensAdicionados.length === 0
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-[#1A56DB] hover:bg-blue-700 cursor-pointer focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    {salvandoPedido ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                    <span>Criar Pedido de Compra</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 2: ATAS, CONTRATOS & EMPENHOS (Hierarquia DDD de Saldos) */}
          {/* ========================================================================= */}
          {secaoAtiva === 'atas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Atas, Contratos & Empenhos</h1>
                  <p className="text-xs text-slate-500">Gestão das Atas de Registro de Preço, fracionamento em Contratos (50% default) e Notas de Empenho</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowModalContrato(true)}
                    className="px-3 py-1.5 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Gerar Contrato (50%)</span>
                  </button>
                  <button
                    onClick={() => setShowModalEmpenho(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Emitir Nota de Empenho</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Atas Registradas */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">1. Atas de Registro de Preços Vigentes (ARP)</h3>
                <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Número Ata</th>
                        <th className="py-2.5 px-3">Fornecedor</th>
                        <th className="py-2.5 px-3 text-right">Valor Total</th>
                        <th className="py-2.5 px-3 text-right">Saldo Ata Disponível</th>
                        <th className="py-2.5 px-3">Vigência</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                      {atas.map((a) => (
                        <tr key={a.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-bold text-[#1A56DB]">{a.numero_ata}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{a.fornecedor_razao_social}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                            R$ {a.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#0E9F6E]">
                            R$ {a.saldo_disponivel?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{a.vigencia_fim}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabela de Contratos Administrativos */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">2. Contratos Administrativos (Fracionados da Ata)</h3>
                <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Número Contrato</th>
                        <th className="py-2.5 px-3">Ata Vinculada</th>
                        <th className="py-2.5 px-3">Tipo Fracionamento</th>
                        <th className="py-2.5 px-3 text-right">Valor Contrato</th>
                        <th className="py-2.5 px-3 text-right">Saldo Contrato</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                      {contratos.map((c) => (
                        <tr key={c.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-bold text-indigo-700">{c.numero_contrato}</td>
                          <td className="py-2.5 px-3 text-slate-600">{c.numero_ata}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1A56DB] border border-blue-200">
                              {c.tipo_fracionamento} ({c.percentual_fracionamento}%)
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                            R$ {c.valor_total_contrato?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#0E9F6E]">
                            R$ {c.saldo_contrato_remanescente?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabela de Notas de Empenho */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">3. Notas de Empenho Emitidas (Reserva Orçamentária)</h3>
                <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Número Empenho</th>
                        <th className="py-2.5 px-3">Contrato</th>
                        <th className="py-2.5 px-3">Dotação</th>
                        <th className="py-2.5 px-3 text-right">Valor Empenhado</th>
                        <th className="py-2.5 px-3 text-right">Saldo Empenho</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                      {empenhos.map((e) => (
                        <tr key={e.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{e.numero_empenho}</td>
                          <td className="py-2.5 px-3 text-slate-600">{e.numero_contrato}</td>
                          <td className="py-2.5 px-3 text-slate-500 truncate max-w-xs">{e.dotacao_orcamentaria}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                            R$ {e.valor_total_empenhado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#0E9F6E]">
                            R$ {e.saldo_empenho_remanescente?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              {e.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 3: CONFIRMAR ENTREGA / ENTRADA DE NF-E COM BAIXA EM CASCATA */}
          {/* ========================================================================= */}
          {secaoAtiva === 'confirmar_entrega' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Confirmar Entrega & Entrada de NF-e</h1>
                <p className="text-xs text-slate-500">Conferência física, fiscal e baixa atômica em cascata: NF → Empenho → Contrato → Ata</p>
              </div>

              {/* Recibo com Saldos Recalculados */}
              {reciboCascata && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 space-y-3 text-xs text-emerald-950 shadow-xs">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-[#0E9F6E]" />
                    <span>Entrada de NF-e e Baixa em Cascata Realizada com Sucesso!</span>
                  </div>
                  <p className="text-slate-700">
                    Termo de Recebimento Provisório emitido: <strong>{reciboCascata.termo_recebimento}</strong>. Carga encaminhada à Quarentena WMS.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Novo Saldo do Empenho:</span>
                      <span className="font-bold text-sm text-slate-900">
                        R$ {reciboCascata.saldos_atualizados?.saldo_empenho?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Novo Saldo do Contrato:</span>
                      <span className="font-bold text-sm text-slate-900">
                        R$ {reciboCascata.saldos_atualizados?.saldo_contrato?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-slate-500 block">Novo Saldo da Ata:</span>
                      <span className="font-bold text-sm text-[#0E9F6E]">
                        R$ {reciboCascata.saldos_atualizados?.saldo_ata?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Formulário de Recebimento */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 space-y-6 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pedido de Compra (PdC)</label>
                    <select
                      value={pdcSelecionadoId}
                      onChange={(e) => setPdcSelecionadoId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                    >
                      {pedidosCompra.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.numero_pdc} - {p.fornecedor_razao_social} (R$ {p.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número DANFE</label>
                    <input
                      type="text"
                      value={danfeNumero}
                      onChange={(e) => setDanfeNumero(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chave de Acesso (44 dígitos)</label>
                    <input
                      type="text"
                      value={danfeChave}
                      onChange={(e) => setDanfeChave(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0]">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Lote Físico Aferido</label>
                    <input
                      type="text"
                      value={loteConferido}
                      onChange={(e) => setLoteConferido(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Data de Validade</label>
                    <input
                      type="date"
                      value={validadeConferida}
                      onChange={(e) => setValidadeConferida(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Temperatura na Doca</label>
                    <input
                      type="text"
                      value={tempAferida}
                      onChange={(e) => setTempAferida(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Checklist Regulatório */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">Checklist Obrigatório (Art. 140 da Lei 14.133/21):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.danfe_conferida}
                        onChange={(e) => setChecklist({ ...checklist, danfe_conferida: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium text-slate-800">DANFE e Chave SEFAZ conferidas sem divergências</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.embalagem_integra}
                        onChange={(e) => setChecklist({ ...checklist, embalagem_integra: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium text-slate-800">Embalagens íntegras, lacradas e invioladas</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.temperatura_conforme}
                        onChange={(e) => setChecklist({ ...checklist, temperatura_conforme: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium text-slate-800">Cadeia de frio / temperatura ambiente controlada OK</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.laudo_fabricante_anexo}
                        onChange={(e) => setChecklist({ ...checklist, laudo_fabricante_anexo: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-medium text-slate-800">Laudo analítico do fabricante anexado ao lote</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0E0E0]">
                  <button
                    type="button"
                    disabled={confirmandoEntrega}
                    onClick={handleEntradaNfeCascata}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer focus:ring-2 focus:ring-emerald-500"
                  >
                    {confirmandoEntrega ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                    <span>Dar Entrada na NF e Abater Saldos em Cascata</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 4: COMPARATIVO DE PREÇOS (COTAÇÃO MULTIPOLAR & HOMOLOGAÇÃO) */}
          {/* ========================================================================= */}
          {secaoAtiva === 'comparativo_lote' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Comparativo de Preços & Cotação Multipolar</h1>
                  <p className="text-xs text-slate-500">
                    Abertura de cotação (manual ou PDF/CSV), recebimento de propostas com lote/vencimento/fabricante, exclusão de itens acima da média e impressão oficial
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowModalNovaCotacao(true)}
                    className="px-3 py-1.5 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Abrir Cotação</span>
                  </button>
                  <button
                    onClick={() => setShowModalPropostaFornecedor(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Building className="w-4 h-4" />
                    <span>Lançar Proposta Fornecedor</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Tabela de Preços</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Cotações e Matriz de Preços */}
              {cotacoes.map((cot) => (
                <div key={cot.id} className="bg-white rounded-2xl border border-[#E0E0E0] p-5 space-y-4 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E0E0E0]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#1A56DB]">{cot.codigo_cotacao}</span>
                        <h3 className="font-bold text-sm text-slate-900">{cot.titulo}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1A56DB] border border-blue-200">
                          {cot.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Aberta em {cot.data_abertura} por {cot.responsavel_abertura} | Limite: {cot.data_limite_proposta}
                      </p>
                    </div>
                  </div>

                  {/* Itens e Propostas Recebidas */}
                  <div className="space-y-4">
                    {cot.itens.map((it: any) => (
                      <div key={it.id} className="border border-[#E0E0E0] rounded-xl p-4 bg-[#F8FAFC] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-xs text-slate-900">{it.descricao_medicamento}</span>
                            <span className="text-[11px] font-mono text-slate-500 ml-2">CATMAT: {it.codigo_catmat}</span>
                            <span className="text-[11px] text-slate-600 ml-3">Qtd: {it.quantidade} {it.unidade_fornecimento}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-slate-600">
                              Teto CMED: <strong>R$ {it.preco_cmed_teto?.toFixed(2)}</strong>
                            </span>
                            <span className="text-slate-600">
                              Mediana BPS: <strong>R$ {it.preco_bps_mediana?.toFixed(2)}</strong>
                            </span>
                            <span className="text-indigo-700 font-bold">
                              Média Propostas: R$ {it.preco_medio_calculado?.toFixed(2) || it.propostas?.[0]?.preco_unitario?.toFixed(2) || '0,00'}
                            </span>
                          </div>
                        </div>

                        {/* Grade de Propostas dos Fornecedores para este Item */}
                        <div className="overflow-x-auto rounded-xl border border-[#E0E0E0] bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-slate-700 font-bold">
                              <tr>
                                <th className="py-2 px-3">Fornecedor Proponente</th>
                                <th className="py-2 px-3">Lote (LT)</th>
                                <th className="py-2 px-3">Validade</th>
                                <th className="py-2 px-3">Fabricante / Marca</th>
                                <th className="py-2 px-3 text-right">Preço Unit.</th>
                                <th className="py-2 px-3 text-right">Total Ofertado</th>
                                <th className="py-2 px-3 text-center">Status / Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0]">
                              {it.propostas?.map((prop: any) => (
                                <tr
                                  key={prop.id}
                                  className={`hover:bg-[#F8FAFC] ${
                                    prop.aceito_responsavel
                                      ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                                      : prop.excluido_acima_media
                                      ? 'bg-rose-50/70 opacity-75'
                                      : ''
                                  }`}
                                >
                                  <td className="py-2 px-3 font-medium text-slate-900">{prop.razao_social}</td>
                                  <td className="py-2 px-3 font-mono font-bold text-slate-800">{prop.lote_fabricante}</td>
                                  <td className="py-2 px-3 text-slate-600">{prop.data_validade}</td>
                                  <td className="py-2 px-3 text-slate-700">{prop.fabricante_marca}</td>
                                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                                    R$ {prop.preco_unitario?.toFixed(2)}
                                  </td>
                                  <td className="py-2 px-3 text-right font-medium text-slate-700">
                                    R$ {prop.preco_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {prop.aceito_responsavel ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                          Vencedor Aceito ✓
                                        </span>
                                      ) : prop.excluido_acima_media ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                          Acima da Média (Excluído)
                                        </span>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => handleHomologarProposta(cot.id, prop.id, 'aceitar')}
                                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                            title="Aceitar este preço"
                                          >
                                            Aceitar
                                          </button>
                                          <button
                                            onClick={() => handleHomologarProposta(cot.id, prop.id, 'excluir')}
                                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                            title="Excluir proposta acima da média"
                                          >
                                            Excluir
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 5: VISÃO GERAL & MÉTRICAS EXECUTIVAS */}
          {/* ========================================================================= */}
          {secaoAtiva === 'visao_geral' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Visão Geral & Métricas Executivas</h1>
                <p className="text-xs text-slate-500">Métricas consolidadas do módulo de compras, atas e controle de saldos</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  title="Atas Vigentes (ARP)"
                  value={metricas?.total_atas_vigentes || atas.length}
                  subtitle="Contratos e caronas ativas"
                  icon={FileText}
                  variant="blue"
                  tooltipInfo="Total de Atas de Registro de Preços vigentes sob a Lei 14.133/21."
                />
                <KpiCard
                  title="Saldo Total em Atas"
                  value={`R$ ${(metricas?.saldo_disponivel_atas || 10625000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  subtitle="Disponível para contratação"
                  icon={Scale}
                  variant="emerald"
                  tooltipInfo="Saldo remanescente de atas apto a gerar contratos e termos aditivos."
                />
                <KpiCard
                  title="Contratos Ativos"
                  value={metricas?.total_contratos_ativos || contratos.length}
                  subtitle="Padrão fracionado 50%"
                  icon={ShieldCheck}
                  variant="indigo"
                  tooltipInfo="Contratos administrativos gerados a partir das atas."
                />
                <KpiCard
                  title="Entregas Físicas (PdC)"
                  value={metricas?.pedidos_aguardando_entrega || 2}
                  subtitle="Aguardando conferência NF"
                  icon={Truck}
                  variant="teal"
                  tooltipInfo="Pedidos de compra aguardando recebimento na doca do hospital."
                />
              </div>

              {/* Tabela de Pedidos Recentes */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Pedidos de Compra Recentes</h3>
                <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Número PdC</th>
                        <th className="py-2.5 px-3">Empenho</th>
                        <th className="py-2.5 px-3">Fornecedor</th>
                        <th className="py-2.5 px-3 text-right">Valor Total</th>
                        <th className="py-2.5 px-3">Prazo</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                      {pedidosCompra.map((p) => (
                        <tr key={p.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-3 font-bold text-[#1A56DB]">{p.numero_pdc}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{p.numero_empenho}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{p.fornecedor_razao_social}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            R$ {p.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{p.prazo_entrega}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 6: VALIDADOR CMED / BPS / CATMAT */}
          {/* ========================================================================= */}
          {secaoAtiva === 'validador_cmed' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Validador de Preços CMED / BPS</h1>
                <p className="text-xs text-slate-500">Auditoria preventiva e confronto com o Preço Máximo de Venda ao Governo (PMVG)</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 space-y-4 shadow-xs">
                {/* Seletor Rápido do Banco de Preços */}
                <div className="p-3 bg-[#F0F4FF] rounded-xl border border-[#E0E0E0]">
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#1A56DB]" />
                    <span>Selecionar Medicamento do Banco Oficial de Preços (CMED/BPS/CATMAT)</span>
                  </label>
                  <select
                    onChange={(e) => {
                      const med = bancoPrecos.find((m: any) => m.id === e.target.value);
                      if (med) {
                        setCatmatInput(med.codigo_catmat);
                        setNomeMedInput(med.nome_comercial_padrao);
                        setPrecoPropostoInput(med.preco_referencia_bps?.toFixed(2) || '40.00');
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 cursor-pointer focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">-- Escolha um medicamento para preenchimento automático --</option>
                    {bancoPrecos.map((m: any) => (
                      <option key={m.id} value={m.id}>
                        {m.nome_comercial_padrao} (CATMAT: {m.codigo_catmat}) - Teto CMED: R$ {m.preco_teto_cmed?.toFixed(2)} | BPS: R$ {m.preco_referencia_bps?.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleValidarPreco} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Código CATMAT</label>
                    <input
                      type="text"
                      value={catmatInput}
                      onChange={(e) => setCatmatInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Descrição do Medicamento</label>
                    <input
                      type="text"
                      value={nomeMedInput}
                      onChange={(e) => setNomeMedInput(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preço Proposto (R$)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={precoPropostoInput}
                        onChange={(e) => setPrecoPropostoInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={validandoPreco}
                        className="px-4 py-2 bg-[#1A56DB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                      >
                        {validandoPreco ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Auditar'}
                      </button>
                    </div>
                  </div>
                </form>

                {resultadoValidacao && (
                  <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] mt-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Resultado da Auditoria Regulatória:</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        resultadoValidacao.validation.status === 'OK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : resultadoValidacao.validation.status === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {resultadoValidacao.validation.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-[#E0E0E0]">
                        <span className="text-[10px] text-slate-500 block">Teto CMED (PMVG):</span>
                        <span className="font-bold text-slate-900">
                          R$ {resultadoValidacao?.prices?.cmed_ceiling_price?.toFixed(2) || '0,00'}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#E0E0E0]">
                        <span className="text-[10px] text-slate-500 block">Mediana BPS (SUS):</span>
                        <span className="font-bold text-slate-900">
                          R$ {(resultadoValidacao?.prices?.bps_reference_price ?? resultadoValidacao?.prices?.bps_median_price)?.toFixed(2) || '0,00'}
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-[#E0E0E0]">
                        <span className="text-[10px] text-slate-500 block">Divergência / Desconto:</span>
                        <span className="font-bold text-[#0E9F6E]">
                          {resultadoValidacao?.validation?.divergence_vs_cmed_percent ?? resultadoValidacao?.metrics?.discount_vs_cmed_pct ?? 0}%
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-700 mt-2 font-medium">
                      {resultadoValidacao?.validation?.parecer_tecnico ?? resultadoValidacao?.validation?.reason ?? resultadoValidacao?.audit_log?.conclusive_opinion ?? 'Parecer técnico em conformidade com o Art. 23 da Lei 14.133/21.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO: BANCO OFICIAL DE PREÇOS DE MEDICAMENTOS (CMED / BPS / CATMAT) */}
          {/* ========================================================================= */}
          {secaoAtiva === 'banco_precos' && (
            <div className="space-y-6">
              {/* Header do Banco de Dados */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900">Banco de Dados Oficial de Preços de Medicamentos</h1>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {origemBancoPrecos === 'SUPABASE_POSTGRES' ? 'Supabase Remoto Ativo' : 'Base Oficial CMED/BPS'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Catálogo de conformidade farmacêutica regulatória com teto legal PMVG/CMED e mediana de compras públicas do SUS (BPS)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSincronizarBancoPrecos}
                    disabled={sincronizandoBanco}
                    className="px-3.5 py-2 bg-white border border-[#E0E0E0] hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${sincronizandoBanco ? 'animate-spin text-[#1A56DB]' : 'text-slate-500'}`} />
                    <span>{sincronizandoBanco ? 'Sincronizando...' : 'Sincronizar Supabase'}</span>
                  </button>
                  <button
                    onClick={() => setSecaoAtiva('validador_cmed')}
                    className="px-3.5 py-2 bg-[#1A56DB] text-white hover:bg-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Auditar Proposta</span>
                  </button>
                </div>
              </div>

              {/* Feedback de Sincronização */}
              {feedbackSincronizacao && (
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  feedbackSincronizacao.tipo === 'sucesso'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : feedbackSincronizacao.tipo === 'info'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{feedbackSincronizacao.texto}</span>
                  </div>
                  <button onClick={() => setFeedbackSincronizacao(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* KPIs do Banco de Preços */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  title="Fármacos Catalogados"
                  value={bancoPrecos.length || 15}
                  icon={Database}
                  variant="blue"
                  subtitle="Medicamentos essenciais hospitalares"
                  tooltipInfo="Medicamentos essenciais hospitalares padronizados"
                />
                <KpiCard
                  title="Economia Média vs Teto"
                  value="31.4%"
                  icon={TrendingUp}
                  variant="emerald"
                  subtitle="Diferencial médio BPS vs CMED"
                  tooltipInfo="Diferencial médio entre teto PMVG e preços do SUS"
                />
                <KpiCard
                  title="Cadeia de Frio (2ºC-8ºC)"
                  value={bancoPrecos.filter((m: any) => m.temperatura_exigida?.includes('2ºC')).length || 4}
                  icon={Thermometer}
                  variant="teal"
                  subtitle="Termolábeis com controle térmico"
                  tooltipInfo="Exigem controle e laudo térmico na entrega"
                />
                <KpiCard
                  title="Conformidade Legal"
                  value="100%"
                  icon={ShieldCheck}
                  variant="emerald"
                  subtitle="Auditoria prévia compulsória"
                  tooltipInfo="Auditoria prévia compulsória de sobrepreço conforme Lei 14.133/21"
                />
              </div>

              {/* Barra de Busca e Filtros */}
              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-96">
                    <input
                      type="text"
                      placeholder="Buscar por medicamento, princípio ativo ou CATMAT..."
                      value={filtroBancoPrecos}
                      onChange={(e) => setFiltroBancoPrecos(e.target.value)}
                      className="w-full px-3 py-2 pl-9 bg-[#F8FAFC] border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    {filtroBancoPrecos && (
                      <button onClick={() => setFiltroBancoPrecos('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500">
                    <span>Exibindo: <strong className="text-slate-900">
                      {bancoPrecos.filter((m: any) => {
                        if (!filtroBancoPrecos) return true;
                        const f = filtroBancoPrecos.toLowerCase();
                        return (
                          m.nome_comercial_padrao?.toLowerCase().includes(f) ||
                          m.principio_ativo?.toLowerCase().includes(f) ||
                          m.codigo_catmat?.toLowerCase().includes(f) ||
                          m.classe_terapeutica?.toLowerCase().includes(f)
                        );
                      }).length}
                    </strong> de {bancoPrecos.length || 15} itens</span>
                  </div>
                </div>

                {/* Tabela de Medicamentos do Banco Oficial */}
                <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#F8FAFC] text-slate-700 font-bold border-b border-[#E0E0E0]">
                      <tr>
                        <th className="p-3">Código CATMAT</th>
                        <th className="p-3">Medicamento & Princípio Ativo</th>
                        <th className="p-3">Classe Terapêutica</th>
                        <th className="p-3 text-right">Teto CMED (PMVG)</th>
                        <th className="p-3 text-right">Mediana BPS (SUS)</th>
                        <th className="p-3 text-center">Tarja & Conservação</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                      {bancoPrecos
                        .filter((m: any) => {
                          if (!filtroBancoPrecos) return true;
                          const f = filtroBancoPrecos.toLowerCase();
                          return (
                            m.nome_comercial_padrao?.toLowerCase().includes(f) ||
                            m.principio_ativo?.toLowerCase().includes(f) ||
                            m.codigo_catmat?.toLowerCase().includes(f) ||
                            m.classe_terapeutica?.toLowerCase().includes(f)
                          );
                        })
                        .map((med: any) => {
                          const descontoPct = med.preco_teto_cmed > 0
                            ? (((med.preco_teto_cmed - med.preco_referencia_bps) / med.preco_teto_cmed) * 100).toFixed(1)
                            : '0';

                          return (
                            <tr key={med.id || med.codigo_catmat} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3">
                                <span className="font-mono font-bold text-xs text-[#1A56DB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                  {med.codigo_catmat}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">{med.nome_comercial_padrao}</span>
                                <span className="text-[11px] text-slate-500 block">
                                  {med.principio_ativo} • {med.concentracao} • {med.forma_farmaceutica} ({med.unidade_fornecimento})
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="text-slate-600 block">{med.classe_terapeutica || 'Medicamento Hospitalar'}</span>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-bold text-slate-900">
                                  R$ {Number(med.preco_teto_cmed).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-slate-400 block">Teto Governamental</span>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-bold text-[#0E9F6E]">
                                  R$ {Number(med.preco_referencia_bps).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-emerald-600 font-medium block">
                                  -{descontoPct}% vs CMED
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    med.tarja === 'PRETA'
                                      ? 'bg-slate-900 text-white'
                                      : med.tarja === 'VERMELHA'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    Tarja {med.tarja}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {med.temperatura_exigida?.includes('2ºC') ? '❄️ 2ºC a 8ºC' : '🌡️ Ambiente'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setCatmatInput(med.codigo_catmat);
                                      setNomeMedInput(med.nome_comercial_padrao);
                                      setPrecoPropostoInput(Number(med.preco_referencia_bps).toFixed(2));
                                      setSecaoAtiva('validador_cmed');
                                    }}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    title="Auditar no Validador CMED"
                                  >
                                    <Scale className="w-3.5 h-3.5 text-[#1A56DB]" />
                                    <span className="hidden xl:inline">Auditar</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSecaoAtiva('pedidos_compra');
                                    }}
                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#1A56DB] rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                                    title="Adicionar em Pedido de Compra"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span className="hidden xl:inline">Novo PdC</span>
                                  </button>
                                </div>
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

          {/* ========================================================================= */}
          {/* SEÇÃO 7, 8, 9: CHAMADOS, OCORRÊNCIAS & LOGS */}
          {/* ========================================================================= */}
          {secaoAtiva === 'chamados' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Central de Chamados & OS</h1>
                  <p className="text-xs text-slate-500">Registro e acompanhamento de chamados operacionais</p>
                </div>
                <button
                  onClick={() => setShowModalChamado(true)}
                  className="px-3 py-1.5 bg-[#1A56DB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Abrir Chamado
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 space-y-3 shadow-xs">
                {chamados.map((c) => (
                  <div key={c.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-[#1A56DB]">{c.protocolo}</span>
                      <h4 className="font-bold text-xs text-slate-900 mt-0.5">{c.titulo}</h4>
                      <p className="text-[11px] text-slate-600">{c.descricao}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {secaoAtiva === 'ocorrencias' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Livro de Ocorrências Digital</h1>
                  <p className="text-xs text-slate-500">Passagem de plantão e ocorrências de suprimentos</p>
                </div>
                <button
                  onClick={() => setShowModalOcorrencia(true)}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 cursor-pointer shadow-xs"
                >
                  Registrar Ocorrência
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 space-y-3 shadow-xs">
                {ocorrencias.map((o) => (
                  <div key={o.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{o.unidade_setor} - Turno: {o.turno}</span>
                      <span className="text-slate-500 text-[10px]">{o.data}</span>
                    </div>
                    <p className="text-slate-700">{o.relato}</p>
                    <p className="text-emerald-700 font-medium">Providências: {o.providencias}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {secaoAtiva === 'logs' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Trilha de Auditoria (Logs WORM)</h1>
                <p className="text-xs text-slate-500">Histórico imutável de todas as ações executadas no sistema</p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 space-y-2 shadow-xs font-mono text-xs">
                {logs.map((l) => (
                  <div key={l.id} className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] flex items-center justify-between">
                    <div>
                      <span className="text-[#1A56DB] font-bold">[{l.data_hora}]</span>{' '}
                      <span className="text-slate-800">{l.descricao}</span>
                    </div>
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {l.perfil_ativo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {secaoAtiva === 'despesas_hub' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Relatório de Despesas &amp; Injeção no Hub</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Exportação de empenhos liquidados, notas fiscais e insumos adquiridos para consolidação do Custo do Paciente no Hub 360
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const payload = {
                        origem_modulo: 'COMPRAS_PUBLICAS',
                        cliente_id: 'HOSPITAL_360_MATRIZ',
                        lote_exportacao_id: `EXP-CMP-${Date.now()}`,
                        data_geracao: new Date().toISOString(),
                        despesas: [
                          {
                            id_transacao: 'DSP-CMP-001',
                            paciente_cpf: '123.456.789-00',
                            paciente_nome: 'Carlos Eduardo Silveira',
                            prontuario_episodio: 'EPIS-2026-8841',
                            centro_custo: 'CENTRO_CIRURGICO',
                            leito_identificador: 'Leito 204 UTI',
                            item_codigo: 'OPME-901',
                            item_descricao: 'Kit Prótese Fixação Ortopédica Titânio',
                            lote_fabricante: 'LOT-TIT-881',
                            quantidade: 1,
                            unidade_medida: 'Kit Estéril',
                            valor_unitario_medio: 3420.00,
                            valor_total_imputado: 3420.00,
                            data_consumo: '2026-09-21 14:00:00'
                          }
                        ]
                      };
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
                      const a = document.createElement('a');
                      a.href = dataStr;
                      a.download = `despesas_compras_hospital360_${new Date().toISOString().slice(0, 10)}.json`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-[#E0E0E0] hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Exportar JSON (Hub Contract)</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const payload = {
                          origem_modulo: 'COMPRAS_PUBLICAS',
                          cliente_id: 'HOSPITAL_360_MATRIZ',
                          lote_exportacao_id: `API-SYNC-CMP-${Date.now()}`,
                          data_geracao: new Date().toISOString(),
                          despesas: [
                            {
                              id_transacao: 'DSP-CMP-001',
                              paciente_cpf: '123.456.789-00',
                              paciente_nome: 'Carlos Eduardo Silveira',
                              prontuario_episodio: 'EPIS-2026-8841',
                              centro_custo: 'CENTRO_CIRURGICO',
                              leito_identificador: 'Leito 204 UTI',
                              item_codigo: 'OPME-901',
                              item_descricao: 'Kit Prótese Fixação Ortopédica Titânio',
                              lote_fabricante: 'LOT-TIT-881',
                              quantidade: 1,
                              unidade_medida: 'Kit Estéril',
                              valor_unitario_medio: 3420.00,
                              valor_total_imputado: 3420.00,
                              data_consumo: '2026-09-21 14:00:00'
                            }
                          ]
                        };
                        const res = await fetch('/api/hub/despesas/ingestao', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert(`Sucesso! Despesas de Compras sincronizadas com o Hub (Protocolo ${data.protocolo}).`);
                        }
                      } catch (e) {
                        alert('Erro ao sincronizar com o Hub.');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sincronizar com Hub 360</span>
                  </button>
                </div>
              </div>

              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Empenhos Liquidados no Mês</div>
                  <div className="text-2xl font-bold text-slate-900">R$ 161.000,00</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">2 Pedidos de Compra Entregues</div>
                </div>
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Economia Apurada vs CMED Teto</div>
                  <div className="text-2xl font-bold text-[#1A56DB]">R$ 41.200,00</div>
                  <div className="text-[11px] text-slate-500 mt-1">Redução de custo imputado aos pacientes</div>
                </div>
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Conexão com Hub 360</div>
                  <div className="text-2xl font-bold text-emerald-600">Ativa (REST/Event)</div>
                  <div className="text-[11px] text-slate-500 mt-1">Alimentando Custo do Paciente Door-to-Door</div>
                </div>
              </div>

              {/* Tabela de Insumos e Empenhos vinculados */}
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Itens Adquiridos com Imputação a Pacientes e Centros de Custo</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/50">
                        <th className="p-3 font-bold">Documento / PdC</th>
                        <th className="p-3 font-bold">Insumo / Descrição</th>
                        <th className="p-3 font-bold">Fornecedor Homologado</th>
                        <th className="p-3 font-bold">Centro de Custo</th>
                        <th className="p-3 font-bold text-right">Valor Total</th>
                        <th className="p-3 font-bold text-center">Status Hub</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-blue-50/20">
                        <td className="p-3 font-mono font-bold text-[#1A56DB]">PdC-2026-0001</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">Meropenem 1g Pó Liofilizado Injetável (2.000 un)</div>
                          <div className="text-[11px] text-slate-500">CATMAT: BR0284729 • NF-e 004.891.201</div>
                        </td>
                        <td className="p-3 text-slate-700">Distribuidora Farmacêutica Nacional S/A</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            CD Almoxarifado / Farmácia FEFO
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">R$ 97.000,00</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Sincronizado Hub
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-blue-50/20">
                        <td className="p-3 font-mono font-bold text-[#1A56DB]">PdC-2026-0002</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">Kit Prótese Fixação Ortopédica Titânio (OPME)</div>
                          <div className="text-[11px] text-slate-500">Paciente: Carlos Eduardo Silveira • Prontuário #8841</div>
                        </td>
                        <td className="p-3 text-slate-700">Distribuidora Farmacêutica Nacional S/A</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            Centro Cirúrgico (Imputação Direta)
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">R$ 64.000,00</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Sincronizado Hub
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: JUSTIFICATIVA DE SALDO (EMPENHO / CONTRATO) */}
      {/* ========================================================================= */}
      {showJustificativaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#E0E0E0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Justificativa e Aprovação de Saldo</h3>
              </div>
              <button onClick={() => setShowJustificativaModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              O quantitativo excede o saldo disponível no empenho/contrato. Para prosseguir com a emissão do pedido de compra, informe a justificativa técnica e a autorização do ordenador de despesas.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Justificativa Formal</label>
                <textarea
                  rows={3}
                  value={justificativaTexto}
                  onChange={(e) => setJustificativaTexto(e.target.value)}
                  placeholder="Ex: Aquisição em caráter emergencial para suprir UTI Covid/Adulto. Empenho de reforço formalizado sob protocolo nº 2026/894."
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Aprovador / Ordenador</label>
                <input
                  type="text"
                  value={aprovadorNome}
                  onChange={(e) => setAprovadorNome(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cargo / Função do Aprovador</label>
                <input
                  type="text"
                  value={aprovadorCargo}
                  onChange={(e) => setAprovadorCargo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0]">
              <button
                type="button"
                onClick={() => setShowJustificativaModal(false)}
                className="px-4 py-2 border border-[#E0E0E0] text-slate-700 rounded-xl text-xs font-bold hover:bg-[#F5F5F5] cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleCriarPedidoCompra}
                className="px-4 py-2 bg-[#1A56DB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Confirmar e Emitir Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GERAR CONTRATO A PARTIR DA ATA (PADRÃO 50% DA ATA) */}
      {/* ========================================================================= */}
      {showModalContrato && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#E0E0E0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-sm text-slate-900">Gerar Contrato Administrativo</h3>
              <button onClick={() => setShowModalContrato(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGerarContrato} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ata de Registro de Preços</label>
                <select
                  value={ataSelecionadaId}
                  onChange={(e) => setAtaSelecionadaId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 cursor-pointer"
                >
                  {atas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.numero_ata} - Saldo Disponível: R$ {a.saldo_disponivel?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo de Fracionamento</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContratoTipoFracionamento('FRACIONADO');
                      setContratoPercentual(50.0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      contratoTipoFracionamento === 'FRACIONADO'
                        ? 'bg-[#1A56DB] text-white'
                        : 'bg-[#F5F5F5] text-slate-700 border border-[#E0E0E0]'
                    }`}
                  >
                    Fracionado (Padrão 50% Ata)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setContratoTipoFracionamento('INTEGRAL');
                      setContratoPercentual(100.0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      contratoTipoFracionamento === 'INTEGRAL'
                        ? 'bg-[#1A56DB] text-white'
                        : 'bg-[#F5F5F5] text-slate-700 border border-[#E0E0E0]'
                    }`}
                  >
                    Integral (100% Ata)
                  </button>
                </div>
              </div>

              {contratoTipoFracionamento === 'FRACIONADO' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Percentual Contratado (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={contratoPercentual}
                    onChange={(e) => setContratoPercentual(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Padrão pré-selecionado: 50% da Ata. O restante (50%) permanecerá como Saldo da Ata.
                  </span>
                </div>
              )}

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E0E0E0] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Valor Estimado do Contrato:</span>
                  <span className="font-bold text-slate-900">
                    R$ {((ataAtiva?.valor_total || 4850000) * (contratoPercentual / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Saldo Remanescente na Ata:</span>
                  <span className="font-bold text-[#0E9F6E]">
                    R$ {Math.max(0, (ataAtiva?.saldo_disponivel || 2425000) - ((ataAtiva?.valor_total || 4850000) * (contratoPercentual / 100))).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowModalContrato(false)}
                  className="px-4 py-2 border border-[#E0E0E0] text-slate-700 rounded-xl text-xs font-bold hover:bg-[#F5F5F5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoContrato}
                  className="px-4 py-2 bg-[#1A56DB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  {salvandoContrato ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Gerar Contrato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EMITIR NOTA DE EMPENHO */}
      {/* ========================================================================= */}
      {showModalEmpenho && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#E0E0E0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-sm text-slate-900">Emitir Nota de Empenho</h3>
              <button onClick={() => setShowModalEmpenho(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEmitirEmpenho} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contrato Administrativo</label>
                <select
                  value={contratoSelecionadoId}
                  onChange={(e) => setContratoSelecionadoId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800 cursor-pointer"
                >
                  {contratos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.numero_contrato} - Saldo: R$ {c.saldo_contrato_remanescente?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dotação Orçamentária</label>
                <input
                  type="text"
                  value={empenhoDotacao}
                  onChange={(e) => setEmpenhoDotacao(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade Desejada para o Empenho</label>
                <input
                  type="number"
                  min="1"
                  value={empenhoQtdDesejada}
                  onChange={(e) => setEmpenhoQtdDesejada(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-bold text-slate-800"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Abate diretamente do saldo disponível do contrato selecionado.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowModalEmpenho(false)}
                  className="px-4 py-2 border border-[#E0E0E0] text-slate-700 rounded-xl text-xs font-bold hover:bg-[#F5F5F5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoEmpenho}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  {salvandoEmpenho ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Emitir Empenho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ABERTURA DE COTAÇÃO MULTIPOLAR */}
      {/* ========================================================================= */}
      {showModalNovaCotacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#E0E0E0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-sm text-slate-900">Abrir Cotação de Preços</h3>
              <button onClick={() => setShowModalNovaCotacao(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAbrirNovaCotacao} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título da Cotação</label>
                <input
                  type="text"
                  value={novaCotacaoTitulo}
                  onChange={(e) => setNovaCotacaoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Forma de Inserção</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNovaCotacaoOrigem('MANUAL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      novaCotacaoOrigem === 'MANUAL' ? 'bg-[#1A56DB] text-white' : 'bg-[#F5F5F5] text-slate-700 border border-[#E0E0E0]'
                    }`}
                  >
                    Manual / Digitação
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovaCotacaoOrigem('LOTE_CSV')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      novaCotacaoOrigem === 'LOTE_CSV' ? 'bg-[#1A56DB] text-white' : 'bg-[#F5F5F5] text-slate-700 border border-[#E0E0E0]'
                    }`}
                  >
                    Lote CSV / Planilha
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Itens (Medicamento, CATMAT, Quantidade, Teto CMED, Mediana BPS)</label>
                <textarea
                  rows={4}
                  value={novaCotacaoItensTexto}
                  onChange={(e) => setNovaCotacaoItensTexto(e.target.value)}
                  placeholder="Ex: Meropenem 1g, BR0284729, 10000, 68.20, 52.10&#10;Noradrenalina 2mg, BR0194851, 20000, 18.50, 14.20"
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-mono text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowModalNovaCotacao(false)}
                  className="px-4 py-2 border border-[#E0E0E0] text-slate-700 rounded-xl text-xs font-bold hover:bg-[#F5F5F5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoCotacao}
                  className="px-4 py-2 bg-[#1A56DB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  {salvandoCotacao ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Disparar Cotação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RESPOSTA DO FORNECEDOR (PREÇO, LOTE, VALIDADE, FABRICANTE) */}
      {/* ========================================================================= */}
      {showModalPropostaFornecedor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#E0E0E0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-sm text-slate-900">Preenchimento de Proposta do Fornecedor</h3>
              <button onClick={() => setShowModalPropostaFornecedor(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLancarProposta} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fornecedor Proponente</label>
                  <input
                    type="text"
                    value={propFornecedorNome}
                    onChange={(e) => setPropFornecedorNome(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={propFornecedorCnpj}
                    onChange={(e) => setPropFornecedorCnpj(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preço Unitário Ofertado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={propPrecoUnit}
                    onChange={(e) => setPropPrecoUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número do Lote (LT)</label>
                  <input
                    type="text"
                    value={propLote}
                    onChange={(e) => setPropLote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data de Validade</label>
                  <input
                    type="date"
                    value={propValidade}
                    onChange={(e) => setPropValidade(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fabricante / Marca</label>
                  <input
                    type="text"
                    value={propFabricante}
                    onChange={(e) => setPropFabricante(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowModalPropostaFornecedor(false)}
                  className="px-4 py-2 border border-[#E0E0E0] text-slate-700 rounded-xl text-xs font-bold hover:bg-[#F5F5F5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoProposta}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs"
                >
                  {salvandoProposta ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Salvar Proposta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CENTRAL DE CHAMADOS & OS */}
      {/* ========================================================================= */}
      {showModalChamado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#E0E0E0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-sm text-slate-900">Abrir Chamado / OS</h3>
              <button onClick={() => setShowModalChamado(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSalvarChamado} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={novoChamadoTitulo}
                  onChange={(e) => setNovoChamadoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  required
                  value={novoChamadoDescricao}
                  onChange={(e) => setNovoChamadoDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowModalChamado(false)}
                  className="px-4 py-2 border border-[#E0E0E0] text-slate-700 rounded-xl text-xs font-bold hover:bg-[#F5F5F5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoChamado}
                  className="px-4 py-2 bg-[#1A56DB] text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  {salvandoChamado ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Abrir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: LIVRO DE OCORRÊNCIAS DIGITAL */}
      {/* ========================================================================= */}
      {showModalOcorrencia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#E0E0E0]/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E0E0]">
              <h3 className="font-bold text-sm text-slate-900">Registrar no Livro de Ocorrências</h3>
              <button onClick={() => setShowModalOcorrencia(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSalvarOcorrencia} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relato da Ocorrência</label>
                <textarea
                  rows={3}
                  required
                  value={novaOcorrenciaRelato}
                  onChange={(e) => setNovaOcorrenciaRelato(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Providências Tomadas</label>
                <textarea
                  rows={2}
                  required
                  value={novaOcorrenciaProvidencias}
                  onChange={(e) => setNovaOcorrenciaProvidencias(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E0E0E0] rounded-xl text-xs text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setShowModalOcorrencia(false)}
                  className="px-4 py-2 border border-[#E0E0E0] text-slate-700 rounded-xl text-xs font-bold hover:bg-[#F5F5F5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoOcorrencia}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 cursor-pointer shadow-xs"
                >
                  {salvandoOcorrencia ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
