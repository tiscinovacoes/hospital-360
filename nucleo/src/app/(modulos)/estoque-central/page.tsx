'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { KpiCard } from '@/components/KpiCard';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
import {
  Boxes,
  Package,
  TrendingUp,
  AlertOctagon,
  Clock,
  ArrowLeft,
  Plus,
  Snowflake,
  ShieldAlert,
  Send,
  Lock,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  FileText,
  Truck,
  FileCheck2,
  ArrowRightLeft,
  AlertTriangle,
  QrCode,
  Download,
  Eye,
  Check,
  X,
  History,
  Info,
  Menu,
  ChevronRight,
  FileSpreadsheet,
  Upload,
  RefreshCw,
  Building2,
  Database,
  ExternalLink,
  DollarSign
} from 'lucide-react';

type SecaoModuloEstoque = 
  | 'visao_geral'
  | 'fefo'
  | 'nfe'
  | 'transferencias'
  | 'recall'
  | 'despesas_hub'
  | 'perfis_rbac';

interface ItemEstoque {
  id: string;
  codigoAnvisa: string;
  nome: string;
  apresentacao: string;
  categoria: 'A' | 'B' | 'C';
  curvaAbc: string;
  saldoDisponivel: number;
  saldoComprometido: number;
  saldoTotal: number;
  pontoReposicao: number;
  endereco: string;
  termolabil: boolean;
  temperatura?: string;
  status: 'NORMAL' | 'ATENCAO' | 'RUPTURA_IMINENTE';
  valorUnitario: number;
}

const ITENS_ESTOQUE_MOCK: ItemEstoque[] = [
  {
    id: 'MED-001',
    codigoAnvisa: '1004300780012',
    nome: 'Amoxicilina + Clavulanato 500/125mg',
    apresentacao: 'Comprimido Revestido',
    categoria: 'A',
    curvaAbc: 'Curva A (Alto Valor)',
    saldoDisponivel: 14500,
    saldoComprometido: 1200,
    saldoTotal: 15700,
    pontoReposicao: 4000,
    endereco: 'Rua A - Prateleira 04 - Nível 2',
    termolabil: false,
    status: 'NORMAL',
    valorUnitario: 3.45
  },
  {
    id: 'MED-002',
    codigoAnvisa: '1018001560031',
    nome: 'Insulina Humana NPH 100 UI/ml',
    apresentacao: 'Suspensão Injetável Frasco-Ampola 10ml',
    categoria: 'A',
    curvaAbc: 'Curva A (Crítico)',
    saldoDisponivel: 820,
    saldoComprometido: 340,
    saldoTotal: 1160,
    pontoReposicao: 1000,
    endereco: 'Câmara Fria 02 - Gaveta 08',
    termolabil: true,
    temperatura: '4.2°C (Faixa 2°C - 8°C)',
    status: 'ATENCAO',
    valorUnitario: 42.80
  },
  {
    id: 'MED-003',
    codigoAnvisa: '1023504120021',
    nome: 'Dipirona Sódica 500mg/ml',
    apresentacao: 'Solução Injetável Ampola 2ml',
    categoria: 'B',
    curvaAbc: 'Curva B (Giro Alto)',
    saldoDisponivel: 45000,
    saldoComprometido: 6200,
    saldoTotal: 51200,
    pontoReposicao: 15000,
    endereco: 'Rua B - Prateleira 01 - Nível 1',
    termolabil: false,
    status: 'NORMAL',
    valorUnitario: 0.85
  },
  {
    id: 'MED-004',
    codigoAnvisa: '1057303240019',
    nome: 'Meropenem 1g',
    apresentacao: 'Pó Liofilizado para Injeção Frasco',
    categoria: 'A',
    curvaAbc: 'Curva A (Crítico)',
    saldoDisponivel: 180,
    saldoComprometido: 220,
    saldoTotal: 400,
    pontoReposicao: 500,
    endereco: 'Cofre de Antimicrobianos - Prateleira C',
    termolabil: false,
    status: 'RUPTURA_IMINENTE',
    valorUnitario: 48.50
  },
  {
    id: 'MED-005',
    codigoAnvisa: '1130002510041',
    nome: 'Ceftriaxona Dissódica 1g',
    apresentacao: 'Pó para Solução Injetável IV',
    categoria: 'B',
    curvaAbc: 'Curva B (Alto Giro)',
    saldoDisponivel: 6200,
    saldoComprometido: 1100,
    saldoTotal: 7300,
    pontoReposicao: 2500,
    endereco: 'Rua A - Prateleira 08 - Nível 3',
    termolabil: false,
    status: 'NORMAL',
    valorUnitario: 14.20
  },
  {
    id: 'MED-006',
    codigoAnvisa: '1064601190014',
    nome: 'Imunoglobulina Humana 5g 100ml',
    apresentacao: 'Frasco Solução para Infusão',
    categoria: 'A',
    curvaAbc: 'Curva A (Alto Custo)',
    saldoDisponivel: 45,
    saldoComprometido: 20,
    saldoTotal: 65,
    pontoReposicao: 30,
    endereco: 'Câmara Fria 01 - Gaveta 03',
    termolabil: true,
    temperatura: '3.8°C (Faixa 2°C - 8°C)',
    status: 'NORMAL',
    valorUnitario: 1250.00
  },
  {
    id: 'MED-007',
    codigoAnvisa: '1037004110022',
    nome: 'Paracetamol 500mg',
    apresentacao: 'Comprimido Simples',
    categoria: 'C',
    curvaAbc: 'Curva C (Giro Baixo/Médio)',
    saldoDisponivel: 80000,
    saldoComprometido: 4500,
    saldoTotal: 84500,
    pontoReposicao: 20000,
    endereco: 'Rua C - Prateleira 02 - Nível 1',
    termolabil: false,
    status: 'NORMAL',
    valorUnitario: 0.18
  },
  {
    id: 'MED-008',
    codigoAnvisa: '1006800450011',
    nome: 'Cloreto de Sódio 0,9% 500ml',
    apresentacao: 'Bolsa Sistema Fechado',
    categoria: 'B',
    curvaAbc: 'Curva B (Volume Físico)',
    saldoDisponivel: 18500,
    saldoComprometido: 2200,
    saldoTotal: 20700,
    pontoReposicao: 6000,
    endereco: 'Paleteira Central - Posição 12-B',
    termolabil: false,
    status: 'NORMAL',
    valorUnitario: 4.10
  }
];

interface LoteFefo {
  batchId: string;
  medicamento: string;
  fabricante: string;
  validade: string;
  diasParaVencer: number;
  quantidadeDisponivel: number;
  statusLote: 'VALIDO' | 'ALERTA_60D' | 'ALERTA_30D' | 'VENCIDO' | 'BLOQUEADO';
  temperaturaExigida: string;
}

const LOTES_FEFO_MOCK: LoteFefo[] = [
  {
    batchId: 'VG-LOT-2025-0081',
    medicamento: 'Insulina Humana NPH 100 UI/ml',
    fabricante: 'Novo Nordisk S/A',
    validade: '2026-10-15',
    diasParaVencer: 24,
    quantidadeDisponivel: 190,
    statusLote: 'ALERTA_30D',
    temperaturaExigida: '2°C a 8°C (Câmara Fria)'
  },
  {
    batchId: 'VG-LOT-2025-0104',
    medicamento: 'Meropenem 1g Injetável',
    fabricante: 'Eurofarma Lab.',
    validade: '2026-11-20',
    diasParaVencer: 60,
    quantidadeDisponivel: 120,
    statusLote: 'ALERTA_60D',
    temperaturaExigida: '15°C a 30°C'
  },
  {
    batchId: 'VG-LOT-2026-0012',
    medicamento: 'Amoxicilina + Clavulanato 500/125mg',
    fabricante: 'EMS S/A',
    validade: '2027-04-30',
    diasParaVencer: 221,
    quantidadeDisponivel: 8400,
    statusLote: 'VALIDO',
    temperaturaExigida: 'Ambiente controlado'
  },
  {
    batchId: 'VG-LOT-2026-0044',
    medicamento: 'Dipirona Sódica 500mg/ml',
    fabricante: 'Teuto Brasileiro',
    validade: '2027-08-15',
    diasParaVencer: 328,
    quantidadeDisponivel: 25000,
    statusLote: 'VALIDO',
    temperaturaExigida: 'Ambiente controlado'
  }
];

interface TransferenciaCD {
  id: string;
  rastreio: string;
  destino: string;
  itensQtd: number;
  status: 'PENDENTE' | 'SEPARACAO' | 'TRANSITO' | 'RECEBIDO';
  prioridade: 'NORMAL' | 'URGENTE';
  solicitante: string;
  dataHora: string;
}

const TRANSFERENCIAS_MOCK: TransferenciaCD[] = [
  {
    id: 'TR-2026-0091',
    rastreio: 'RAS-2026-0091-HSP01',
    destino: 'Hospital Central - Farmácia Satélite UTI',
    itensQtd: 14,
    status: 'PENDENTE',
    prioridade: 'URGENTE',
    solicitante: 'Enfª Renata Duarte (UTI Geral)',
    dataHora: '21/09/2026 21:40'
  },
  {
    id: 'TR-2026-0092',
    rastreio: 'RAS-2026-0092-UBS04',
    destino: 'Farmácia Básica Municipal - Polo Sul',
    itensQtd: 38,
    status: 'TRANSITO',
    prioridade: 'NORMAL',
    solicitante: 'Farm. Carlos Eduardo',
    dataHora: '21/09/2026 18:20'
  },
  {
    id: 'TR-2026-0089',
    rastreio: 'RAS-2026-0089-MAT02',
    destino: 'Hospital Materno Infantil - Centro Cirúrgico',
    itensQtd: 22,
    status: 'RECEBIDO',
    prioridade: 'NORMAL',
    solicitante: 'Dra. Vanessa Meireles',
    dataHora: '21/09/2026 14:15'
  }
];

// Registro analítico de despesas do estoque por paciente/centro de custo (Alimenta o Custo do Paciente no Hub)
interface DespesaEstoqueItem {
  id: string;
  dataHora: string;
  pacienteNome: string;
  pacienteCpf: string;
  prontuario: string;
  centroCusto: 'UTI_GERAL' | 'CENTRO_CIRURGICO' | 'ENFERMARIA_2' | 'PRONTO_SOCORRO';
  leito: string;
  medicamento: string;
  lote: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  statusHub: 'SINCRONIZADO' | 'PENDENTE_EXPORTACAO';
}

const DESPESAS_ESTOQUE_SEED: DespesaEstoqueItem[] = [
  {
    id: 'DSP-EST-001',
    dataHora: '22/09/2026 07:15',
    pacienteNome: 'Carlos Eduardo Silveira',
    pacienteCpf: '123.456.789-00',
    prontuario: 'EPIS-2026-8841',
    centroCusto: 'UTI_GERAL',
    leito: 'Leito 204 UTI',
    medicamento: 'Meropenem 1g Injetável',
    lote: 'LT-2026-MERO-01',
    quantidade: 6,
    valorUnitario: 48.50,
    valorTotal: 291.00,
    statusHub: 'SINCRONIZADO'
  },
  {
    id: 'DSP-EST-002',
    dataHora: '22/09/2026 07:20',
    pacienteNome: 'Carlos Eduardo Silveira',
    pacienteCpf: '123.456.789-00',
    prontuario: 'EPIS-2026-8841',
    centroCusto: 'UTI_GERAL',
    leito: 'Leito 204 UTI',
    medicamento: 'Noradrenalina 2mg/mL Ampola 4mL',
    lote: 'LT-2026-NORA-04',
    quantidade: 10,
    valorUnitario: 12.80,
    valorTotal: 128.00,
    statusHub: 'SINCRONIZADO'
  },
  {
    id: 'DSP-EST-003',
    dataHora: '22/09/2026 06:45',
    pacienteNome: 'Mariana Duarte Souza',
    pacienteCpf: '234.567.890-11',
    prontuario: 'EPIS-2026-8910',
    centroCusto: 'CENTRO_CIRURGICO',
    leito: 'Sala Cirúrgica 02',
    medicamento: 'Enoxaparina Sódica 40mg Seringa',
    lote: 'LT-2026-ENOX-99',
    quantidade: 4,
    valorUnitario: 23.40,
    valorTotal: 93.60,
    statusHub: 'PENDENTE_EXPORTACAO'
  },
  {
    id: 'DSP-EST-004',
    dataHora: '22/09/2026 05:30',
    pacienteNome: 'Roberto F. Alencar',
    pacienteCpf: '345.678.901-22',
    prontuario: 'EPIS-2026-8955',
    centroCusto: 'ENFERMARIA_2',
    leito: 'Leito 312 Clin.',
    medicamento: 'Amoxicilina + Clavulanato 500/125mg',
    lote: 'VG-LOT-2026-0012',
    quantidade: 21,
    valorUnitario: 3.45,
    valorTotal: 72.45,
    statusHub: 'PENDENTE_EXPORTACAO'
  },
  {
    id: 'DSP-EST-005',
    dataHora: '21/09/2026 23:10',
    pacienteNome: 'Carlos Eduardo Silveira',
    pacienteCpf: '123.456.789-00',
    prontuario: 'EPIS-2026-8841',
    centroCusto: 'UTI_GERAL',
    leito: 'Leito 204 UTI',
    medicamento: 'Imunoglobulina Humana 5g 100mL',
    lote: 'LT-2026-IMUNO-88',
    quantidade: 1,
    valorUnitario: 1250.00,
    valorTotal: 1250.00,
    statusHub: 'SINCRONIZADO'
  }
];

export default function VigiaEstoqueCentralPage() {
  const roles = MODULO_ROLES_CATALOG['estoque-central'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoModuloEstoque>('visao_geral');
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalAjuste, setModalAjuste] = useState<ItemEstoque | null>(null);
  const [transferencias, setTransferencias] = useState<TransferenciaCD[]>(TRANSFERENCIAS_MOCK);
  const [despesasEstoque, setDespesasEstoque] = useState<DespesaEstoqueItem[]>(DESPESAS_ESTOQUE_SEED);
  const [filtroCentroCusto, setFiltroCentroCusto] = useState<string>('TODOS');
  const [notificacao, setNotificacao] = useState<string | null>(null);
  const [sincronizandoHub, setSincronizandoHub] = useState(false);

  // Alerta de feedback
  const triggerNotificacao = (msg: string) => {
    setNotificacao(msg);
    setTimeout(() => setNotificacao(null), 4500);
  };

  const handleAprovarTransferencia = (trId: string) => {
    if (!hasPermission(activeRole, 'APPROVE')) {
      triggerNotificacao('Atenção: Seu perfil não possui permissão para aprovar saídas do CD.');
      return;
    }
    setTransferencias(prev =>
      prev.map(t => (t.id === trId ? { ...t, status: 'TRANSITO' as const } : t))
    );
    triggerNotificacao(`Transferência ${trId} aprovada e liberada para rota de entrega!`);
  };

  // Exportar arquivo JSON estruturado de despesas para o Hub
  const handleExportarJsonDespesas = () => {
    const payload = {
      origem_modulo: 'ESTOQUE_CENTRAL',
      cliente_id: 'HOSPITAL_360_MATRIZ',
      lote_exportacao_id: `EXP-EST-${Date.now()}`,
      data_geracao: new Date().toISOString(),
      despesas: despesasEstoque.map(d => ({
        id_transacao: d.id,
        paciente_cpf: d.pacienteCpf,
        paciente_nome: d.pacienteNome,
        prontuario_episodio: d.prontuario,
        centro_custo: d.centroCusto,
        leito_identificador: d.leito,
        item_codigo: d.lote,
        item_descricao: d.medicamento,
        lote_fabricante: d.lote,
        quantidade: d.quantidade,
        unidade_medida: 'UN',
        valor_unitario_medio: d.valorUnitario,
        valor_total_imputado: d.valorTotal,
        data_consumo: d.dataHora
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `despesas_estoque_hospital360_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    triggerNotificacao('Arquivo JSON de despesas gerado com sucesso para consolidação no Hub!');
  };

  // Exportar CSV de despesas
  const handleExportarCsvDespesas = () => {
    const header = "ID;Data/Hora;Paciente;CPF;Prontuario;CentroCusto;Leito;Medicamento;Lote;Qtd;ValorUnit;ValorTotal\n";
    const rows = despesasEstoque.map(d => 
      `${d.id};${d.dataHora};${d.pacienteNome};${d.pacienteCpf};${d.prontuario};${d.centroCusto};${d.leito};${d.medicamento};${d.lote};${d.quantidade};${d.valorUnitario.toFixed(2)};${d.valorTotal.toFixed(2)}`
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `despesas_estoque_centro_custo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    triggerNotificacao('Planilha CSV de despesas gerada com sucesso.');
  };

  // Sincronização direta via API com o Hub Centralizador (/api/hub/despesas/ingestao)
  const handleSincronizarHubApi = async () => {
    try {
      setSincronizandoHub(true);
      const pendentes = despesasEstoque.filter(d => d.statusHub === 'PENDENTE_EXPORTACAO');
      const itensParaEnvio = pendentes.length > 0 ? pendentes : despesasEstoque;

      const payload = {
        origem_modulo: 'ESTOQUE_CENTRAL',
        cliente_id: 'HOSPITAL_360_MATRIZ',
        lote_exportacao_id: `API-SYNC-EST-${Date.now()}`,
        data_geracao: new Date().toISOString(),
        despesas: itensParaEnvio.map(d => ({
          id_transacao: d.id,
          paciente_cpf: d.pacienteCpf,
          paciente_nome: d.pacienteNome,
          prontuario_episodio: d.prontuario,
          centro_custo: d.centroCusto,
          leito_identificador: d.leito,
          item_codigo: d.lote,
          item_descricao: d.medicamento,
          lote_fabricante: d.lote,
          quantidade: d.quantidade,
          unidade_medida: 'UN',
          valor_unitario_medio: d.valorUnitario,
          valor_total_imputado: d.valorTotal,
          data_consumo: d.dataHora
        }))
      };

      const res = await fetch('/api/hub/despesas/ingestao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setDespesasEstoque(prev => prev.map(d => ({ ...d, statusHub: 'SINCRONIZADO' })));
        triggerNotificacao(`Sincronização concluída com o Hub! Protocolo: ${data.protocolo} (${data.resumo.itens_processados} itens processados)`);
      } else {
        triggerNotificacao(`Erro na sincronização: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      triggerNotificacao('Falha na comunicação com o Hub Centralizador.');
    } finally {
      setSincronizandoHub(false);
    }
  };

  const menuItens = [
    {
      id: 'visao_geral',
      label: 'Visão Geral & Posição',
      icon: Boxes,
      badge: '1.248 itens',
      badgeCor: 'bg-[#0E5C4C]/[0.12] text-[#0E5C4C] border border-[#0E5C4C]/20'
    },
    {
      id: 'fefo',
      label: 'Controle FEFO & Validade',
      icon: Clock,
      badge: '18 alertas',
      badgeCor: 'bg-rose-100 text-rose-900 border border-rose-200'
    },
    {
      id: 'nfe',
      label: 'Entrada de NF-e (XML/SEFAZ)',
      icon: FileCheck2,
      badge: '2 pendentes',
      badgeCor: 'bg-blue-100 text-blue-800 border border-blue-200'
    },
    {
      id: 'transferencias',
      label: 'Transferências CD ↔ Hospital',
      icon: ArrowRightLeft,
      badge: `${transferencias.filter(t => t.status === 'PENDENTE').length} pendentes`,
      badgeCor: 'bg-[#0E5C4C]/[0.12] text-[#0E5C4C] border border-[#0E5C4C]/20'
    },
    {
      id: 'recall',
      label: 'Recall Sanitário ANVISA',
      icon: ShieldAlert,
      badge: 'Ativo',
      badgeCor: 'bg-rose-50 text-rose-700 border border-rose-200'
    },
    {
      id: 'despesas_hub',
      label: 'Despesas & Centro de Custo',
      icon: FileSpreadsheet,
      badge: 'Hub 360',
      badgeCor: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    },
    {
      id: 'perfis_rbac',
      label: 'Trilha de Auditoria & RBAC',
      icon: Lock,
      badge: null
    }
  ];

  const pendentesCount = despesasEstoque.filter(d => d.statusHub === 'PENDENTE_EXPORTACAO').length;
  const totalDespesasValor = despesasEstoque.reduce((acc, d) => acc + d.valorTotal, 0);

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
              onClick={() => setSecaoAtiva('nfe')}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#0E5C4C] text-white hover:bg-[#0A4A3D] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Importar NF-e (XML)</span>
            </button>

            <button
              onClick={() => setSecaoAtiva('transferencias')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-all shadow-xs cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Nova Transferência</span>
            </button>

            <button
              onClick={() => setSecaoAtiva('despesas_hub')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Despesas Hub</span>
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
      {/* 2. CORPO PRINCIPAL COM SIDEBAR EXCLUSIVA DO PRODUTO */}
      {/* ========================================================================= */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Menu Lateral Colorido com a Cor do Módulo (Laranja Âmbar Logístico) */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-30
            ${sidebarAberta ? 'translate-x-0 w-72 lg:w-64 shadow-xl lg:shadow-none' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:hidden'}
            shrink-0 bg-[#0E5C4C]/[0.06] border-r border-[#0E5C4C]/20 flex flex-col justify-between transition-all duration-200 ease-in-out
          `}
        >
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold text-[#0E5C4C] uppercase tracking-wider">
              Menu de Estoque Central &amp; CD
            </div>
            {menuItens.map((item) => {
              const Icone = item.icon;
              const ativo = secaoAtiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSecaoAtiva(item.id as SecaoModuloEstoque);
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setSidebarAberta(false);
                    }
                  }}
                  className={`w-full min-h-[44px] sm:min-h-[38px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer focus:ring-2 focus:ring-[#0E5C4C] focus:outline-none ${
                    ativo
                      ? 'bg-[#0E5C4C] text-white font-bold border border-[#0E5C4C] shadow-sm shadow-[#0E5C4C]/25'
                      : 'text-slate-700 hover:bg-white/90 hover:text-[#0E5C4C] hover:shadow-2xs border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icone
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        ativo ? 'text-white' : 'text-[#0E5C4C]/80 group-hover:text-[#0E5C4C]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                        ativo
                          ? 'bg-white/20 text-white'
                          : item.badgeCor || 'bg-[#0E5C4C]/[0.12] text-[#0E5C4C] border border-[#0E5C4C]/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Rodapé do Menu Exclusivo: Saída para o Hub Geral */}
          <div className="p-3 border-t border-[#0E5C4C]/90 bg-[#0E5C4C]/90 space-y-2">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-[#0E5C4C]/20 bg-white text-[#0E5C4C] hover:text-[#0E5C4C] hover:bg-[#0A4A3D]/[0.08] text-xs font-bold transition-all shadow-2xs"
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
            <span>Almoxarifado CD</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-slate-900">
              {menuItens.find((m) => m.id === secaoAtiva)?.label || 'Painel'}
            </span>
          </div>

          {/* Toast Notification Flutuante */}
          {notificacao && (
            <div className="p-3.5 bg-[#0E5C4C]/[0.08] border border-[#0E5C4C]/30 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0E5C4C]">
                <Info className="w-4 h-4 text-[#0E5C4C] shrink-0" />
                <span>{notificacao}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setNotificacao(null)}
                className="text-[#0E5C4C] hover:text-[#0E5C4C] p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PERFIS & MATRIZ RBAC — só aparece na seção "Trilha de Auditoria & RBAC" do menu lateral */}
          {secaoAtiva === 'perfis_rbac' && (
            <ModuloRbacBar
              moduloId="estoque-central"
              activeRole={activeRole}
              onRoleChange={setActiveRole}
              accentColor="#0E5C4C"
              lightBg="bg-[#0E5C4C]/[0.08]"
              lightBorder="border-[#0E5C4C]/20"
            />
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 1: VISÃO GERAL & POSIÇÃO DE ESTOQUE (CURVA ABC) */}
          {/* ========================================================================= */}
          {secaoAtiva === 'visao_geral' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Posição de Estoque &amp; Curva ABC</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitoramento contínuo de inventário físico, criticidade e ponto de ressuprimento
                </p>
              </div>

              {/* KPIS GLOBAIS DE ESTOQUE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  title="Itens no CD Central"
                  value="1.248"
                  subtitle="Itens monitorados"
                  icon={<Boxes className="w-5 h-5 text-[#0E5C4C]" />}
                  trend={{ text: "+12 itens novos", isPositive: true }}
                />
                <KpiCard
                  title="Valor Total em Estoque"
                  value="R$ 4.890.412"
                  subtitle="Custo médio apurado"
                  icon={<TrendingUp className="w-5 h-5 text-[#0E5C4C]" />}
                  trend={{ text: "Auditoria TCU Ativa", isPositive: true }}
                />
                <KpiCard
                  title="Lotes com Alerta FEFO"
                  value="18 lotes"
                  subtitle="Validade ≤ 60 dias"
                  icon={<Clock className="w-5 h-5 text-[#0E5C4C]" />}
                  trend={{ text: "Prioridade de saída", isAlert: true }}
                />
                <KpiCard
                  title="Risco de Ruptura"
                  value="4 itens"
                  subtitle="Abaixo do ponto de pedido"
                  icon={<AlertOctagon className="w-5 h-5 text-[#0E5C4C]" />}
                  trend={{ text: "Disparado alerta compras", isAlert: true }}
                />
              </div>

              {/* TABELA DE POSIÇÃO DE ESTOQUE */}
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por medicamento, código ANVISA ou endereço..."
                      value={busca}
                      onChange={e => setBusca(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-[#E0E0E0] rounded-xl text-xs focus:outline-none focus:border-[#0E5C4C] transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={!hasPermission(activeRole, 'EXPORT')}
                      onClick={() => triggerNotificacao('Relatório de Saldo Físico exportado em planilha auditada.')}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border min-h-[44px] sm:min-h-0 touch-manipulation transition-all ${
                        hasPermission(activeRole, 'EXPORT')
                          ? 'border-[#E0E0E0] text-slate-700 hover:bg-slate-50'
                          : 'opacity-50 cursor-not-allowed border-slate-200 text-slate-400'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar Posição</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/50">
                        <th className="p-3 font-bold">Medicamento / Apresentação</th>
                        <th className="p-3 font-bold">Curva ABC</th>
                        <th className="p-3 font-bold text-right">Disponível</th>
                        <th className="p-3 font-bold text-right">Comprometido</th>
                        <th className="p-3 font-bold text-right">Total Físico</th>
                        <th className="p-3 font-bold">Endereço no CD</th>
                        <th className="p-3 font-bold text-center">Status</th>
                        <th className="p-3 font-bold text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ITENS_ESTOQUE_MOCK.filter(i => 
                        i.nome.toLowerCase().includes(busca.toLowerCase()) ||
                        i.codigoAnvisa.includes(busca)
                      ).map(item => (
                        <tr key={item.id} className="hover:bg-[#0A4A3D]/20 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{item.nome}</div>
                            <div className="text-[11px] text-slate-500">
                              ANVISA: {item.codigoAnvisa} • {item.apresentacao}
                            </div>
                            {item.termolabil && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 border border-blue-200">
                                <Snowflake className="w-3 h-3" />
                                {item.temperatura}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              item.categoria === 'A'
                                ? 'bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border-[#0E5C4C]/20'
                                : item.categoria === 'B'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {item.curvaAbc}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            {item.saldoDisponivel.toLocaleString()} un
                          </td>
                          <td className="p-3 text-right font-mono text-slate-500">
                            {item.saldoComprometido.toLocaleString()} un
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            {item.saldoTotal.toLocaleString()} un
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">
                            {item.endereco}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              item.status === 'NORMAL'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : item.status === 'ATENCAO'
                                ? 'bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border-[#0E5C4C]/20'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {item.status === 'NORMAL' ? 'Estoque Normal' : item.status === 'ATENCAO' ? 'Ponto de Atenção' : 'Ruptura Iminente'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => setModalAjuste(item)}
                              title="Ajuste de Inventário Físico"
                              className="p-1.5 rounded-lg border border-[#E0E0E0] text-slate-600 hover:text-[#0E5C4C] hover:border-[#0E5C4C]/40 transition-colors"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
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
          {/* SEÇÃO 2: CONTROLE FEFO & VALIDADE */}
          {/* ========================================================================= */}
          {secaoAtiva === 'fefo' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Controle FEFO &amp; Validade de Lotes</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Priorização de saída pelo First Expire, First Out (RDC 430/2020 ANVISA) para eliminação de perdas
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Alertas Vermelhos (≤ 30 dias)</div>
                  <div className="text-2xl font-bold text-rose-600">3 Lotes</div>
                  <div className="text-[11px] text-slate-500 mt-1">Disparada transferência obrigatória</div>
                </div>
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Alertas Amarelos (≤ 60 dias)</div>
                  <div className="text-2xl font-bold text-[#0E5C4C]">15 Lotes</div>
                  <div className="text-[11px] text-slate-500 mt-1">Sugerido consumo prioritário em UTI</div>
                </div>
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Lotes Válidos (&gt; 90 dias)</div>
                  <div className="text-2xl font-bold text-emerald-600">1.230 Lotes</div>
                  <div className="text-[11px] text-slate-500 mt-1">Conformidade plena com plano terapêutico</div>
                </div>
              </div>

              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/50">
                      <th className="p-3 font-bold">Lote / Batch ID</th>
                      <th className="p-3 font-bold">Medicamento &amp; Fabricante</th>
                      <th className="p-3 font-bold">Data de Validade</th>
                      <th className="p-3 font-bold text-center">Dias Restantes</th>
                      <th className="p-3 font-bold text-right">Saldo do Lote</th>
                      <th className="p-3 font-bold">Condição Térmica</th>
                      <th className="p-3 font-bold text-center">Ação FEFO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {LOTES_FEFO_MOCK.map(lote => (
                      <tr key={lote.batchId} className="hover:bg-[#0A4A3D]/20 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{lote.batchId}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{lote.medicamento}</div>
                          <div className="text-[11px] text-slate-500">{lote.fabricante}</div>
                        </td>
                        <td className="p-3 font-mono">{lote.validade}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            lote.diasParaVencer <= 30
                              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                              : lote.diasParaVencer <= 60
                              ? 'bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border-[#0E5C4C]/20'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {lote.diasParaVencer} dias
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">
                          {lote.quantidadeDisponivel.toLocaleString()} un
                        </td>
                        <td className="p-3 text-[11px] text-slate-600">{lote.temperaturaExigida}</td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => triggerNotificacao(`Lote ${lote.batchId} colocado como prioridade máxima no roteiro de dispensação!`)}
                            className="px-2.5 py-1 rounded-lg bg-[#0E5C4C]/[0.08] hover:bg-[#0A4A3D]/[0.12] text-[#0E5C4C] border border-[#0E5C4C]/20 text-[11px] font-bold transition-colors"
                          >
                            Priorizar Saída
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 3: ENTRADA DE NF-E (XML/SEFAZ) */}
          {/* ========================================================================= */}
          {secaoAtiva === 'nfe' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Entrada de NF-e (XML/SEFAZ)</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Importação automatizada de DANFE/XML com conferência cega e vinculação de lotes ao estoque
                </p>
              </div>

              <div className="bg-white border-2 border-dashed border-[#0E5C4C]/30 rounded-3xl p-8 text-center bg-[#0E5C4C]/20">
                <div className="w-12 h-12 rounded-2xl bg-[#0E5C4C]/[0.12] text-[#0E5C4C] mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Arraste o arquivo XML da NF-e aqui ou clique para selecionar
                </h3>
                <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
                  Compatível com layout padrão NF-e 4.0 SEFAZ e emissões de distribuidores farmacêuticos homologados
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => triggerNotificacao('Arquivo XML NF-e 004.891.201 carregado! 3 itens e 3 lotes identificados para conferência cega.')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white shadow-xs transition-colors"
                  >
                    Simular Upload de NF-e (Distribuidora Nacional)
                  </button>
                </div>
              </div>

              {/* Lista de Notas Fiscais Recebidas Recentes */}
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Notas Fiscais em Processo de Conferência</h3>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">NF-e 004.891.201 - Distribuidora Farmacêutica Nacional S/A</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Chave: 3526 0912 3456 7800 0190 5500 1004 8912 0110 4918 2741 • Valor: R$ 97.000,00
                      </div>
                      <div className="text-[11px] text-[#0E5C4C] font-semibold mt-1">
                        Vinculado ao Pedido de Compra: PdC-2026-0001 (Empenho EMP-2026/894120)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0E5C4C]/[0.12] text-[#0E5C4C] border border-[#0E5C4C]/20">
                        Aguardando Conferência Cega
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerNotificacao('Conferência cega iniciada. Formulário de contagem liberado para o conferente.')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                      >
                        Conferir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 4: TRANSFERÊNCIAS CD ↔ HOSPITAL */}
          {/* ========================================================================= */}
          {secaoAtiva === 'transferencias' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Transferências CD ↔ Farmácias Satélites</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Envio de suprimentos do Centro de Distribuição para as unidades hospitalares e satélites
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => triggerNotificacao('Formulário de Nova Transferência aberto. Selecione o destino e os lotes.')}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white shadow-xs transition-colors"
                >
                  + Nova Transferência
                </button>
              </div>

              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/50">
                      <th className="p-3 font-bold">Código / Rastreio</th>
                      <th className="p-3 font-bold">Destino Hospitalar</th>
                      <th className="p-3 font-bold text-center">Itens</th>
                      <th className="p-3 font-bold">Solicitante</th>
                      <th className="p-3 font-bold">Data/Hora</th>
                      <th className="p-3 font-bold text-center">Status</th>
                      <th className="p-3 font-bold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transferencias.map(tr => (
                      <tr key={tr.id} className="hover:bg-[#0A4A3D]/20 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{tr.rastreio}</td>
                        <td className="p-3 font-bold text-slate-800">{tr.destino}</td>
                        <td className="p-3 text-center font-mono">{tr.itensQtd} itens</td>
                        <td className="p-3 text-slate-600">{tr.solicitante}</td>
                        <td className="p-3 font-mono text-slate-500">{tr.dataHora}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            tr.status === 'RECEBIDO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : tr.status === 'TRANSITO'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border-[#0E5C4C]/20'
                          }`}>
                            {tr.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {tr.status === 'PENDENTE' && (
                            <button
                              type="button"
                              onClick={() => handleAprovarTransferencia(tr.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
                            >
                              Aprovar Saída
                            </button>
                          )}
                          {tr.status !== 'PENDENTE' && (
                            <span className="text-[11px] text-slate-400 font-mono">Despachado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 5: RECALL SANITÁRIO ANVISA */}
          {/* ========================================================================= */}
          {secaoAtiva === 'recall' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Recall Sanitário &amp; Bloqueio Cautelar ANVISA</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interrupção emergencial de dispensação por desvio de qualidade ou resolução RE sanitária
                </p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Procedimento Operacional Padrão de Quarentena Sanitária (POP-CD-09)</span>
                </div>
                <p>
                  Ao registrar um recall, o lote é marcado como <strong>BLOQUEADO</strong> no banco de dados. 
                  Nenhuma farmácia, enfermaria ou centro cirúrgico conseguirá bipar ou dispensar este item.
                </p>
              </div>

              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Disparo de Bloqueio Emergencial de Lote</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Número do BatchID ou Lote do Fabricante
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: VG-LOT-2025-0081 ou LOTE-FAB-9921"
                      className="w-full text-xs p-2.5 border border-[#E0E0E0] rounded-xl focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Número da Resolução RE / ANVISA
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Resolução RE nº 3.481/2026"
                      className="w-full text-xs p-2.5 border border-[#E0E0E0] rounded-xl focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Motivo Técnico do Recall / Desvio de Qualidade
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Descreva a suspeita de desvio de qualidade, alteração físico-química ou contaminação..."
                    className="w-full text-xs p-2.5 border border-[#E0E0E0] rounded-xl focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={!hasPermission(activeRole, 'APPROVE')}
                    onClick={() => triggerNotificacao('Alerta de Recall executado! Lote bloqueado em 100% da rede hospitalar.')}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                      hasPermission(activeRole, 'APPROVE')
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    Disparar Bloqueio Imediato em Rede
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 6: RELATÓRIO DE DESPESAS & CENTRO DE CUSTO (CUSTO DO PACIENTE) */}
          {/* ========================================================================= */}
          {secaoAtiva === 'despesas_hub' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Relatório de Despesas &amp; Injeção no Hub</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Geração de despesas do estoque por centro de custo e paciente para apuração do Custo Door-to-Door no Hub
                  </p>
                </div>

                {/* Ações de Exportação e Sincronização */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportarJsonDespesas}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-[#E0E0E0] hover:bg-slate-50 shadow-2xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0E5C4C]" />
                    <span>Exportar JSON (Hub Contract)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportarCsvDespesas}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-[#E0E0E0] hover:bg-slate-50 shadow-2xs transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Exportar Planilha CSV</span>
                  </button>

                  <button
                    type="button"
                    disabled={sincronizandoHub}
                    onClick={handleSincronizarHubApi}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${sincronizandoHub ? 'animate-spin' : ''}`} />
                    <span>{sincronizandoHub ? 'Sincronizando...' : 'Sincronizar com Hub 360'}</span>
                  </button>
                </div>
              </div>

              {/* Cards de Resumo das Despesas Geradas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Total Imputado no Mês</div>
                  <div className="text-2xl font-bold text-slate-900">
                    R$ {totalDespesasValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                    100% rastreado com lote FEFO
                  </div>
                </div>

                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Centro de Custo Líder</div>
                  <div className="text-2xl font-bold text-[#0E5C4C]">UTI Adulto</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    R$ 1.669,00 (87% dos itens críticos)
                  </div>
                </div>

                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Média por Paciente</div>
                  <div className="text-2xl font-bold text-blue-600">R$ 562,35</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Em conformidade com tabela SIGTAP
                  </div>
                </div>

                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Status no Hub 360</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {pendentesCount > 0 ? `${pendentesCount} Pendentes` : '100% Sincronizado'}
                  </div>
                  <div className={`text-[11px] font-semibold mt-1 ${pendentesCount > 0 ? 'text-[#0E5C4C]' : 'text-emerald-600'}`}>
                    {pendentesCount > 0 ? 'Aguardando exportação para o Hub' : 'Alimentando Custo do Paciente'}
                  </div>
                </div>
              </div>

              {/* Tabela de Despesas Detalhadas com Filtros */}
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Filtrar Centro de Custo:</span>
                    <select
                      value={filtroCentroCusto}
                      onChange={(e) => setFiltroCentroCusto(e.target.value)}
                      className="text-xs p-2 border border-[#E0E0E0] rounded-xl bg-slate-50 font-medium text-slate-800"
                    >
                      <option value="TODOS">Todos os Centros de Custo</option>
                      <option value="UTI_GERAL">UTI Geral / Coronária</option>
                      <option value="CENTRO_CIRURGICO">Centro Cirúrgico</option>
                      <option value="ENFERMARIA_2">Enfermaria 2º Andar</option>
                      <option value="PRONTO_SOCORRO">Pronto-Socorro</option>
                    </select>
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    Mostrando {despesasEstoque.filter(d => filtroCentroCusto === 'TODOS' || d.centroCusto === filtroCentroCusto).length} despesas
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/50">
                        <th className="p-3 font-bold">ID Transação</th>
                        <th className="p-3 font-bold">Data/Hora</th>
                        <th className="p-3 font-bold">Paciente &amp; Prontuário</th>
                        <th className="p-3 font-bold">Centro de Custo</th>
                        <th className="p-3 font-bold">Medicamento &amp; Lote FEFO</th>
                        <th className="p-3 font-bold text-center">Qtd</th>
                        <th className="p-3 font-bold text-right">Valor Unitário</th>
                        <th className="p-3 font-bold text-right">Total Imputado</th>
                        <th className="p-3 font-bold text-center">Status Hub</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {despesasEstoque
                        .filter(d => filtroCentroCusto === 'TODOS' || d.centroCusto === filtroCentroCusto)
                        .map(item => (
                          <tr key={item.id} className="hover:bg-[#0A4A3D]/20 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-900">{item.id}</td>
                            <td className="p-3 font-mono text-slate-500">{item.dataHora}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{item.pacienteNome}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                CPF: {item.pacienteCpf} • {item.prontuario} ({item.leito})
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {item.centroCusto}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{item.medicamento}</div>
                              <div className="text-[11px] text-[#0E5C4C] font-mono">Lote: {item.lote}</div>
                            </td>
                            <td className="p-3 text-center font-mono font-bold">{item.quantidade} un</td>
                            <td className="p-3 text-right font-mono text-slate-600">
                              R$ {item.valorUnitario.toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              R$ {item.valorTotal.toFixed(2)}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.statusHub === 'SINCRONIZADO'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border-[#0E5C4C]/20 animate-pulse'
                              }`}>
                                {item.statusHub === 'SINCRONIZADO' ? 'Ingerido no Hub' : 'Pendente'}
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
          {/* SEÇÃO 7: TRILHA DE AUDITORIA & RBAC DO ESTOQUE */}
          {/* ========================================================================= */}
          {secaoAtiva === 'perfis_rbac' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Perfis de Acesso &amp; Matriz RBAC do Estoque</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gestão isolada de papéis, permissões de almoxarifado e segregação de funções (SoD)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map(role => (
                  <div key={role.id} className="p-5 rounded-2xl border border-[#E0E0E0] bg-white shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border border-[#0E5C4C]/20">
                        {role.level}
                      </span>
                      {role.id === activeRole.id && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Perfil Ativo
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{role.name}</h4>
                    <p className="text-xs text-slate-600 mb-3">{role.description}</p>
                    
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      Responsável Padrão: <strong>{role.responsavelPadrao}</strong>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                      {role.permissions.map(p => (
                        <span key={p} className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAIS OPERACIONAIS */}
      {/* ========================================================================= */}

      {/* MODAL AJUSTE DE INVENTÁRIO */}
      {modalAjuste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Ajuste de Inventário Físico
              </h3>
              <button
                type="button"
                onClick={() => setModalAjuste(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>Medicamento: <strong>{modalAjuste.nome}</strong></div>
              <div>Endereço Atual: <span className="font-mono">{modalAjuste.endereco}</span></div>
              <div>Saldo Atual: <strong>{modalAjuste.saldoTotal} unidades</strong></div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantidade Real Contada</label>
                <input
                  type="number"
                  defaultValue={modalAjuste.saldoTotal}
                  className="w-full p-2.5 border border-[#E0E0E0] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Justificativa de Divergência</label>
                <textarea
                  rows={2}
                  placeholder="Motivo da divergência (quebra de frasco, inventário cego ou erro de contagem)..."
                  className="w-full p-2.5 border border-[#E0E0E0] rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalAjuste(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerNotificacao('Ajuste de inventário registrado com trilha de auditoria.');
                  setModalAjuste(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white min-h-[44px]"
              >
                Salvar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
