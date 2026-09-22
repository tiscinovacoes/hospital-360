'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import { ModuloRbacBar } from '../../components/ModuloRbacBar';
import { KpiCard } from '../../components/KpiCard';
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
  Info
} from 'lucide-react';

type AbaEstoque = 
  | 'posicao'
  | 'fefo'
  | 'nfe'
  | 'transferencias'
  | 'recall'
  | 'perfis';

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
    pontoReposicao: 900,
    endereco: 'Câmara Fria 02 - Gaveta 08',
    termolabil: true,
    temperatura: '4.2°C (Faixa 2°C - 8°C)',
    status: 'ATENCAO',
    valorUnitario: 28.90
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
    pontoReposicao: 12000,
    endereco: 'Rua B - Prateleira 01 - Nível 1',
    termolabil: false,
    status: 'NORMAL',
    valorUnitario: 0.85
  },
  {
    id: 'MED-004',
    codigoAnvisa: '1057300140019',
    nome: 'Meropenem 1g Injetável',
    apresentacao: 'Pó para Solução Injetável',
    categoria: 'A',
    curvaAbc: 'Curva A (Antibiótico Restrito)',
    saldoDisponivel: 320,
    saldoComprometido: 280,
    saldoTotal: 600,
    pontoReposicao: 500,
    endereco: 'Cofre Especial - Prateleira C1',
    termolabil: false,
    status: 'RUPTURA_IMINENTE',
    valorUnitario: 52.00
  },
  {
    id: 'MED-005',
    codigoAnvisa: '1006800340023',
    nome: 'Soro Fisiológico 0,9% 500ml',
    apresentacao: 'Bolsa Plástica Sistema Fechado',
    categoria: 'C',
    curvaAbc: 'Curva C (Alto Volume)',
    saldoDisponivel: 18400,
    saldoComprometido: 2300,
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

export default function VigiaEstoqueCentralPage() {
  const roles = MODULO_ROLES_CATALOG['estoque-central'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [abaAtiva, setAbaAtiva] = useState<AbaEstoque>('posicao');
  const [busca, setBusca] = useState('');
  const [modalAjuste, setModalAjuste] = useState<ItemEstoque | null>(null);
  const [transferencias, setTransferencias] = useState<TransferenciaCD[]>(TRANSFERENCIAS_MOCK);
  const [notificacao, setNotificacao] = useState<string | null>(null);

  // Alerta de feedback
  const triggerNotificacao = (msg: string) => {
    setNotificacao(msg);
    setTimeout(() => setNotificacao(null), 4000);
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

  return (
    <VigiaSidebarLayout
      moduloId="estoque-central"
      activeTitle="Estoque Central & Almoxarifado"
      activeSubtitle="Gestão e balanceamento de almoxarifados hospitalares, lotes FEFO e centro de distribuição"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 border border-[#E0E0E0] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hub 360</span>
          </Link>

          <button 
            type="button"
            onClick={() => setAbaAtiva('nfe')}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-[#D97706] hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors touch-manipulation"
          >
            <Plus className="w-4 h-4" />
            <span>Importar NF-e (XML)</span>
          </button>
        </div>
      }
    >
      {/* Toast Notification */}
      {notificacao && (
        <div className="mb-4 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{notificacao}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotificacao(null)}
            className="text-amber-600 hover:text-amber-800 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BARRA DE RBAC & CONTROLE DE PERFIS DO MÓDULO */}
      <ModuloRbacBar
        moduloId="estoque-central"
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        accentColor="#D97706"
        lightBg="bg-amber-50"
        lightBorder="border-amber-200"
      />

      {/* KPIS GLOBAIS DE ESTOQUE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Itens no CD Central"
          value="1.248"
          subtitle="Itens monitorados"
          icon={<Boxes className="w-5 h-5 text-amber-600" />}
          trend={{ text: "+12 itens novos", isPositive: true }}
        />
        <KpiCard
          title="Valor Total em Estoque"
          value="R$ 4.890.412"
          subtitle="Custo médio apurado"
          icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
          trend={{ text: "Auditoria TCU Ativa", isPositive: true }}
        />
        <KpiCard
          title="Lotes com Alerta FEFO"
          value="18 lotes"
          subtitle="Validade ≤ 60 dias"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          trend={{ text: "Prioridade de saída", isAlert: true }}
        />
        <KpiCard
          title="Risco de Ruptura"
          value="4 itens"
          subtitle="Abaixo do ponto de pedido"
          icon={<AlertOctagon className="w-5 h-5 text-amber-600" />}
          trend={{ text: "Disparado alerta compras", isAlert: true }}
        />
      </div>

      {/* SUB-NAVEGAÇÃO EM ABAS (ESTILO COMPRAS PÚBLICAS) */}
      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-1.5 mb-6 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'posicao', label: '1. Posição de Estoque & Curva ABC', icon: Boxes },
          { id: 'fefo', label: '2. Controle FEFO & Validade', icon: Clock },
          { id: 'nfe', label: '3. Entrada de NF-e (XML/SEFAZ)', icon: FileCheck2 },
          { id: 'transferencias', label: '4. Transferências CD ↔ Hospital', icon: ArrowRightLeft },
          { id: 'recall', label: '5. Recall Sanitário ANVISA', icon: ShieldAlert },
          { id: 'perfis', label: '6. Perfis & Matriz RBAC', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = abaAtiva === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAbaAtiva(tab.id as AbaEstoque)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px] touch-manipulation ${
                isActive
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DAS TELAS */}

      {/* ABA 1: POSIÇÃO DE ESTOQUE */}
      {abaAtiva === 'posicao' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por medicamento, código ANVISA ou endereço..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#E0E0E0] rounded-xl text-xs focus:outline-none focus:border-amber-500 transition-colors"
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

            {/* TABELA DE POSIÇÃO DE ESTOQUE */}
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
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
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
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : item.categoria === 'B'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {item.curvaAbc}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        {item.saldoDisponivel.toLocaleString('pt-BR')} un
                      </td>
                      <td className="p-3 text-right text-slate-500">
                        {item.saldoComprometido.toLocaleString('pt-BR')} un
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {item.saldoTotal.toLocaleString('pt-BR')} un
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                          {item.endereco}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          item.status === 'NORMAL'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'ATENCAO'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {item.status === 'NORMAL' && 'Estoque Normal'}
                          {item.status === 'ATENCAO' && 'Ponto de Atenção'}
                          {item.status === 'RUPTURA_IMINENTE' && 'Ruptura Iminente'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setModalAjuste(item)}
                          disabled={!hasPermission(activeRole, 'UPDATE')}
                          className={`p-2 rounded-xl text-xs font-semibold border min-h-[44px] min-w-[44px] inline-flex items-center justify-center transition-all ${
                            hasPermission(activeRole, 'UPDATE')
                              ? 'border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100'
                              : 'border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed'
                          }`}
                          title={hasPermission(activeRole, 'UPDATE') ? 'Ajustar Inventário' : 'Sem permissão de alteração'}
                        >
                          <History className="w-4 h-4" />
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

      {/* ABA 2: CONTROLE FEFO & VALIDADE */}
      {abaAtiva === 'fefo' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Fila Prioritária FEFO (First-Expired, First-Out)
                </h3>
                <p className="text-xs text-slate-500">
                  Medicamentos ordenados rigidamente pela data de validade mais próxima para evitar perdas hospitalares.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Índice de perda: 0,02% (Dentro da meta ONA)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LOTES_FEFO_MOCK.map(lote => (
                <div key={lote.batchId} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white hover:border-amber-300 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {lote.batchId}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      lote.statusLote === 'ALERTA_30D'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : lote.statusLote === 'ALERTA_60D'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      Vence em {lote.diasParaVencer} dias
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">{lote.medicamento}</h4>
                  <p className="text-xs text-slate-500 mb-2">Fabricante: {lote.fabricante}</p>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 mb-3">
                    <div className="flex justify-between text-slate-600">
                      <span>Validade Final:</span>
                      <strong className="text-slate-900">{lote.validade}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Quantidade Restante:</span>
                      <strong className="text-slate-900">{lote.quantidadeDisponivel.toLocaleString('pt-BR')} un</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Armazenamento:</span>
                      <span className="text-blue-700 font-semibold">{lote.temperaturaExigida}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={!hasPermission(activeRole, 'APPROVE')}
                      onClick={() => triggerNotificacao(`Lote ${lote.batchId} priorizado para dispensação imediata!`)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border min-h-[44px] md:min-h-0 touch-manipulation transition-all ${
                        hasPermission(activeRole, 'APPROVE')
                          ? 'bg-[#D97706] text-white hover:bg-amber-700 border-amber-600'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      Priorizar Saída
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: ENTRADA DE NF-E */}
      {abaAtiva === 'nfe' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Importação Automática de NF-e (XML SEFAZ Padrão)
                </h3>
                <p className="text-xs text-slate-500">
                  Lê chave de acesso, extrai lotes, fabricante e confere batimento com o Empenho do Módulo 1.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Chave de Acesso da NF-e (44 dígitos)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue="3526 0912 8491 0001 5500 1000 0491 8219 2039 1823"
                    className="w-full font-mono text-xs p-2.5 border border-[#E0E0E0] rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => triggerNotificacao('Consulta SEFAZ realizada com sucesso! Dados validados.')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shrink-0 min-h-[44px]"
                  >
                    Consultar SEFAZ
                  </button>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
                <h4 className="text-xs font-bold text-amber-900 mb-2">
                  Dados Identificados do XML:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div>Emitente: <strong>Eurofarma Laboratórios S/A</strong></div>
                  <div>CNPJ: <strong>61.190.096/0001-92</strong></div>
                  <div>Número NF: <strong>491.821 (Série 1)</strong></div>
                  <div>Valor Total: <strong>R$ 145.600,00</strong></div>
                  <div>Empenho Vinculado: <strong className="text-blue-700">EMP-2026-0491</strong></div>
                  <div>Status de Conferência: <strong className="text-emerald-700">Conferência Cega 100% Ok</strong></div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={!hasPermission(activeRole, 'CREATE')}
                  onClick={() => triggerNotificacao('Entrada de Nota Fiscal concluída com sucesso! Lotes incorporados ao estoque.')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                    hasPermission(activeRole, 'CREATE')
                      ? 'bg-[#D97706] hover:bg-amber-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  Confirmar Entrada no Estoque CD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: TRANSFERÊNCIAS CD ↔ HOSPITAL */}
      {abaAtiva === 'transferencias' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Transferências Internas e Expedição para Farmácias
                </h3>
                <p className="text-xs text-slate-500">
                  Rastreabilidade ponto a ponto com código de entrega e conferência eletrônica.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {transferencias.map(tr => (
                <div key={tr.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-amber-300 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900">{tr.id}</span>
                      <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {tr.rastreio}
                      </span>
                      {tr.prioridade === 'URGENTE' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          URGENTE
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{tr.destino}</div>
                    <div className="text-xs text-slate-500">
                      Solicitado por: {tr.solicitante} • {tr.dataHora} • {tr.itensQtd} itens no pacote
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      tr.status === 'PENDENTE'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : tr.status === 'TRANSITO'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {tr.status}
                    </span>

                    {tr.status === 'PENDENTE' && (
                      <button
                        type="button"
                        onClick={() => handleAprovarTransferencia(tr.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D97706] hover:bg-amber-700 text-white transition-colors min-h-[44px] touch-manipulation"
                      >
                        Liberar Expedição
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: RECALL SANITÁRIO ANVISA */}
      {abaAtiva === 'recall' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recall Sanitário & Bloqueio Imediato ANVISA
                </h3>
                <p className="text-xs text-slate-500">
                  Emite ordem de bloqueio cautelar que congela o lote em todos os hospitais e farmácias instantaneamente.
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2 mb-4">
              <strong>Procedimento de Emergência Sanitária:</strong>
              <p>
                Ao registrar um recall, o lote é marcado como <strong>BLOQUEADO</strong> no banco de dados. 
                Nenhuma farmácia, enfermaria ou centro cirúrgico conseguirá bipar ou dispensar este item.
              </p>
            </div>

            <div className="space-y-3">
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
                  Motivo do Recall Sanitário / Resolução ANVISA
                </label>
                <textarea
                  rows={3}
                  placeholder="Informe a resolução RE/ANVISA, suspeita de desvio de qualidade ou queixa técnica..."
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
                  Disparar Bloqueio Imediato
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 6: PERFIS & MATRIZ RBAC */}
      {abaAtiva === 'perfis' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Perfis de Acesso do Módulo Estoque Central & CD
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Definição de papéis operacionais, de supervisão e auditoria com segregação estrita de funções (SoD).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map(role => (
                <div key={role.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D97706] hover:bg-amber-700 text-white min-h-[44px]"
              >
                Salvar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}
    </VigiaSidebarLayout>
  );
}
