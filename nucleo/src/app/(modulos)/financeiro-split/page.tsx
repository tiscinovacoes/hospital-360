'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { ModuloMenuLateral, MenuLateralItem } from '@/components/ModuloMenuLateral';
import { KpiCard } from '@/components/KpiCard';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
import {
  CreditCard,
  ArrowLeft,
  DollarSign,
  Split,
  FileCheck2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Receipt,
  Download,
  Building2,
  UserCheck,
  ShieldAlert,
  FileText,
  AlertCircle,
  Lock,
  X,
  Info,
  Check,
  Menu
} from 'lucide-react';

type AbaFinanceiro = 
  | 'split'
  | 'faturamento-sus'
  | 'glosas'
  | 'centro-custos'
  | 'conciliacao'
  | 'perfis';

interface TransactionSplit {
  id: string;
  patientName: string;
  clinicRoom: string;
  doctorName: string;
  service: string;
  totalAmount: number;
  doctorShare: number; // 85%
  hospitalCondoShare: number; // 15%
  paymentMethod: 'PIX D+0' | 'Cartão Crédito 1x' | 'Convênio TUSS';
  status: 'Liquidado Instantâneo' | 'Processando Split' | 'Aguardando Repasse';
  nfseNumber: string;
  createdAt: string;
}

const mockTransactions: TransactionSplit[] = [
  {
    id: 'TX-9021',
    patientName: 'Severino Silva Cavalcanti',
    clinicRoom: 'Sala 204',
    doctorName: 'Dr. Ricardo Mendes (Cardiologia)',
    service: 'Consulta Especialista + Eletrocardiograma',
    totalAmount: 450.00,
    doctorShare: 382.50,
    hospitalCondoShare: 67.50,
    paymentMethod: 'PIX D+0',
    status: 'Liquidado Instantâneo',
    nfseNumber: 'NFS-2026-8812',
    createdAt: 'Hoje às 11:42',
  },
  {
    id: 'TX-9022',
    patientName: 'Ana Carolina Souza',
    clinicRoom: 'Sala 108',
    doctorName: 'Dra. Patricia Lima (Dermatologia)',
    service: 'Procedimento Dermatológico Ambulatorial',
    totalAmount: 600.00,
    doctorShare: 510.00,
    hospitalCondoShare: 90.00,
    paymentMethod: 'Cartão Crédito 1x',
    status: 'Liquidado Instantâneo',
    nfseNumber: 'NFS-2026-8813',
    createdAt: 'Hoje às 10:15',
  },
  {
    id: 'TX-9023',
    patientName: 'Carlos Eduardo Lima',
    clinicRoom: 'Sala 204',
    doctorName: 'Dr. Ricardo Mendes (Cardiologia)',
    service: 'Consulta de Retorno com Ajuste Terapêutico',
    totalAmount: 300.00,
    doctorShare: 255.00,
    hospitalCondoShare: 45.00,
    paymentMethod: 'PIX D+0',
    status: 'Liquidado Instantâneo',
    nfseNumber: 'NFS-2026-8814',
    createdAt: 'Hoje às 09:20',
  },
  {
    id: 'TX-9024',
    patientName: 'Beatriz Vasconcelos',
    clinicRoom: 'Sala 305',
    doctorName: 'Dr. Lucas Silveira (Cirurgia Geral)',
    service: 'Avaliação Pré-Operatória Colecistectomia',
    totalAmount: 500.00,
    doctorShare: 425.00,
    hospitalCondoShare: 75.00,
    paymentMethod: 'PIX D+0',
    status: 'Liquidado Instantâneo',
    nfseNumber: 'NFS-2026-8815',
    createdAt: 'Hoje às 08:45',
  },
];

interface RemessaSUS {
  id: string;
  tipo: 'BPA (Ambulatorial)' | 'AIH (Internação)';
  competencia: string;
  totalProcedimentos: number;
  valorTotalApurado: number;
  status: 'VALIDADO_SIGTAP' | 'REMESSA_GERADA' | 'PAGO_FUNDO_MUNICIPAL';
}

const REMESSAS_SUS_MOCK: RemessaSUS[] = [
  {
    id: 'BPA-2026-09',
    tipo: 'BPA (Ambulatorial)',
    competencia: '09/2026',
    totalProcedimentos: 1420,
    valorTotalApurado: 68450.00,
    status: 'VALIDADO_SIGTAP'
  },
  {
    id: 'AIH-2026-09',
    tipo: 'AIH (Internação)',
    competencia: '09/2026',
    totalProcedimentos: 184,
    valorTotalApurado: 312890.00,
    status: 'REMESSA_GERADA'
  }
];

interface GlosaRecurso {
  id: string;
  operadoraOuSus: string;
  procedimento: string;
  valorGlosado: number;
  motivo: string;
  status: 'DEFESA_GERADA_IA' | 'RECURSO_ENVIADO' | 'REVERTIDO_DEFERIDO';
}

const GLOSAS_MOCK: GlosaRecurso[] = [
  {
    id: 'GLO-2026-112',
    operadoraOuSus: 'Bradesco Saúde',
    procedimento: 'Diária UTI Adulto + Monitorização Invasiva',
    valorGlosado: 2450.00,
    motivo: 'Ausência de relatório de evolução médica detalhada no D+2',
    status: 'DEFESA_GERADA_IA'
  },
  {
    id: 'GLO-2026-113',
    operadoraOuSus: 'SUS / SMS São Paulo',
    procedimento: 'Tomografia Computadorizada de Crânio',
    valorGlosado: 136.00,
    motivo: 'CID-10 incompatível com a tabela SIGTAP',
    status: 'REVERTIDO_DEFERIDO'
  }
];

export default function FinanceiroSplitPage() {
  const roles = MODULO_ROLES_CATALOG['financeiro-split'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [abaAtiva, setAbaAtiva] = useState<AbaFinanceiro>('split');
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const menuItens: MenuLateralItem[] = [
    { id: 'split', label: 'Split de Honorários (PIX D+0)', icon: Split },
    { id: 'faturamento-sus', label: 'Faturamento SUS (BPA / AIH)', icon: FileText },
    { id: 'glosas', label: 'Auditoria & Recursos de Glosas', icon: ShieldAlert },
    { id: 'centro-custos', label: 'Centro de Custos & Rateio', icon: DollarSign },
    { id: 'conciliacao', label: 'Conciliação Bancária (CNAB 240)', icon: CheckCircle2 },
    { id: 'perfis', label: 'Perfis & Matriz RBAC', icon: Lock },
  ];
  const [transactions, setTransactions] = useState<TransactionSplit[]>(mockTransactions);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const handleSimulateSplitPayment = () => {
    if (!hasPermission(activeRole, 'CREATE')) {
      triggerNotice('Atenção: Seu perfil não possui permissão para gerar faturamentos e liquidações.');
      return;
    }

    const newTx: TransactionSplit = {
      id: `TX-${Math.floor(9025 + Math.random() * 100)}`,
      patientName: 'Novo Paciente Particular',
      clinicRoom: 'Sala 204',
      doctorName: 'Dr. Ricardo Mendes (Cardiologia)',
      service: 'Consulta Ambulatorial de Urgência',
      totalAmount: 350.00,
      doctorShare: 297.50,
      hospitalCondoShare: 52.50,
      paymentMethod: 'PIX D+0',
      status: 'Liquidado Instantâneo',
      nfseNumber: `NFS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'Agora mesmo',
    };
    setTransactions([newTx, ...transactions]);
    triggerNotice(`Pagamento de R$ 350,00 liquidado via Hyperswitch! R$ 297,50 (85%) creditado ao médico e R$ 52,50 (15%) ao condomínio hospitalar com NFS-e emitida.`);
  };

  const totalProcessed = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalDoctorShare = transactions.reduce((acc, curr) => acc + curr.doctorShare, 0);
  const totalHospitalShare = transactions.reduce((acc, curr) => acc + curr.hospitalCondoShare, 0);

  return (
    <>
      <PageHeader
        activeTitle="Financeiro, Faturamento SUS & Split de Custos"
        activeSubtitle="Split instantâneo Hyperswitch (85/15%), faturamento BPA/AIH SIGTAP e gestão de glosas"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
              title={sidebarAberta ? 'Recolher menu' : 'Expandir menu'}
              aria-label={sidebarAberta ? 'Recolher menu' : 'Expandir menu'}
              aria-expanded={sidebarAberta}
            >
              {sidebarAberta ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] min-w-[44px] shrink-0 text-xs font-bold text-slate-700 bg-white border border-[#E0E0E0] rounded-xl hover:bg-slate-50 transition-all shadow-xs"
              title="Hub Central"
              aria-label="Hub Central"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:inline">Hub Central</span>
            </Link>
            <button
              onClick={handleSimulateSplitPayment}
              className="inline-flex items-center justify-center gap-1.5 px-3 lg:px-4 py-2 min-h-[44px] min-w-[44px] shrink-0 text-xs font-bold text-white bg-marca-forte hover:bg-marca-hover rounded-xl transition-all shadow-xs touch-manipulation"
              title="Simular Consulta c/ Split"
              aria-label="Simular Consulta c/ Split"
            >
              <Split className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Simular Consulta c/ Split</span>
            </button>
          </div>
        }
      />

      <div className="flex flex-1 relative overflow-x-clip">
        <ModuloMenuLateral
          titulo="Financeiro & Split"
          moduloId="financeiro-split"
          itens={menuItens}
          ativoId={abaAtiva}
          onSelect={(id) => setAbaAtiva(id as AbaFinanceiro)}
          aberto={sidebarAberta}
          onFechar={() => setSidebarAberta(false)}
        />
        <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-6">
      {/* Feedback de Notificação */}
      {successNotice && (
        <div className="mb-4 p-3.5 bg-[#1B1F1C]/[0.08] border border-[#1B1F1C]/30 rounded-2xl flex items-center justify-between text-xs text-[#33382F] shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1B1F1C] shrink-0" />
            <span className="font-bold">{successNotice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessNotice(null)}
            className="text-[#1B1F1C] hover:text-[#1B1F1C] p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PERFIS & MATRIZ RBAC — só aparece na seção "Perfis" do menu lateral, não em todas as telas */}
      {abaAtiva === 'perfis' && (
        <ModuloRbacBar
          moduloId="financeiro-split"
          activeRole={activeRole}
          onRoleChange={setActiveRole}
          accentColor="#1B1F1C"
          lightBg="bg-[#1B1F1C]/[0.08]"
          lightBorder="border-[#1B1F1C]/20"
        />
      )}

      {/* Cards de Métricas Padronizados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Volume Total Liquidado"
          value={`R$ ${totalProcessed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="100% Conciliado"
          icon={<DollarSign className="w-5 h-5 text-[#1B1F1C]" />}
          trend={{ text: "Hyperswitch Operante", isPositive: true }}
        />

        <KpiCard
          title="Repasse Médicos (85%)"
          value={`R$ ${totalDoctorShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Crédito Imediato D+0"
          icon={<UserCheck className="w-5 h-5 text-[#1B1F1C]" />}
          trend={{ text: "PIX D+0 Instantâneo", isPositive: true }}
        />

        <KpiCard
          title="Taxa Hospitalar (15%)"
          value={`R$ ${totalHospitalShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Custeio & Facilities"
          icon={<Building2 className="w-5 h-5 text-[#1B1F1C]" />}
          trend={{ text: "Cobre Custos Fixos", isPositive: true }}
        />

        <KpiCard
          title="Notas Fiscais (NFS-e)"
          value={`${transactions.length} NFS-e`}
          subtitle="Emissão Municipal"
          icon={<Receipt className="w-5 h-5 text-[#1B1F1C]" />}
          trend={{ text: "100% Escrituradas", isPositive: true }}
        />
      </div>

      {/* ABA 1: SPLIT DE HONORÁRIOS */}
      {abaAtiva === 'split' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Lançamentos Auditados &amp; Split em Tempo Real
              </h3>
              <p className="text-xs text-slate-500">
                Divisão atômica com repasse imediato via chave PIX e emissão da NFS-e.
              </p>
            </div>
            <button
              disabled={!hasPermission(activeRole, 'EXPORT')}
              onClick={() => triggerNotice('Relatório analítico de split exportado para conferência contábil.')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold min-h-[44px] sm:min-h-0 ${
                hasPermission(activeRole, 'EXPORT')
                  ? 'border-[#E0E0E0] text-slate-700 hover:bg-slate-50'
                  : 'border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Planilha</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/50">
                  <th className="p-3">ID / Data</th>
                  <th className="p-3">Paciente / Atendimento</th>
                  <th className="p-3">Médico Cooperado</th>
                  <th className="p-3 text-right">Valor Total</th>
                  <th className="p-3 text-right text-[#1B1F1C]">Médico (85%)</th>
                  <th className="p-3 text-right text-blue-700">Hospital (15%)</th>
                  <th className="p-3 text-center">Status Split</th>
                  <th className="p-3 text-center">NFS-e</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#33382F]/20 transition-colors">
                    <td className="p-3">
                      <strong className="text-slate-900 block font-mono">{tx.id}</strong>
                      <span className="text-[11px] text-slate-500">{tx.createdAt}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{tx.patientName}</span>
                      <span className="text-[11px] text-slate-500">{tx.service}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800 block">{tx.doctorName}</span>
                      <span className="text-[11px] text-slate-500">{tx.clinicRoom}</span>
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      R$ {tx.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold text-[#1B1F1C] font-mono">
                      R$ {tx.doctorShare.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-bold text-blue-700 font-mono">
                      R$ {tx.hospitalCondoShare.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-[11px] text-slate-600">
                      {tx.nfseNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: FATURAMENTO SUS */}
      {abaAtiva === 'faturamento-sus' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs max-w-4xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Faturamento SUS (BPA Ambulatorial &amp; AIH Internação)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Validação automática das regras de compatibilidade da tabela SIGTAP e geração de remessas ao DATASUS.
            </p>

            <div className="space-y-3">
              {REMESSAS_SUS_MOCK.map(rem => (
                <div key={rem.id} className="p-4 rounded-xl border border-[#E0E0E0] flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">{rem.id}</strong>
                      <span className="px-2 py-0.5 rounded-md font-bold bg-[#1B1F1C]/[0.08] text-[#1B1F1C] border border-[#1B1F1C]/20">
                        {rem.tipo}
                      </span>
                    </div>
                    <span className="text-slate-500 block mt-1">
                      Competência: {rem.competencia} • {rem.totalProcedimentos} procedimentos faturados
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 block">Total SUS Apurado:</span>
                    <strong className="text-base font-black text-slate-900">
                      R$ {rem.valorTotalApurado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                disabled={!hasPermission(activeRole, 'APPROVE')}
                onClick={() => triggerNotice('Arquivo Magnético BPA/AIH assinado digitalmente e transmitido ao Ministério da Saúde.')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                  hasPermission(activeRole, 'APPROVE')
                    ? 'bg-marca-forte hover:bg-marca-hover text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                Transmitir Remessa SUS Oficial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: GLOSAS */}
      {abaAtiva === 'glosas' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs max-w-4xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Auditoria de Contas &amp; Recursos de Glosas Hospitalares
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Motor de inteligência que detecta justificativas clínicas para reverter glosas com base no prontuário do paciente.
            </p>

            <div className="space-y-3 text-xs">
              {GLOSAS_MOCK.map(g => (
                <div key={g.id} className="p-4 rounded-xl border border-[#E0E0E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{g.id}</span>
                      <strong className="text-slate-900">{g.operadoraOuSus}</strong>
                      <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-800 border border-amber-200 text-[10px]">
                        {g.status}
                      </span>
                    </div>
                    <span className="text-slate-600 block mt-1">{g.procedimento}</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">Motivo: {g.motivo}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 block">Valor Contestação:</span>
                    <strong className="text-base font-black text-rose-700">
                      R$ {g.valorGlosado.toFixed(2)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: CENTRO DE CUSTOS */}
      {abaAtiva === 'centro-custos' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Centro de Custos &amp; Rateio por Paciente/Procedimento
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Apropriação contábil direta de medicamentos consumidos, horas de leito e honorários.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 block">Centro de Custo: UTI Geral</span>
                <strong className="text-base text-slate-900">R$ 142.800,00</strong>
                <span className="text-[10px] text-slate-500 block mt-1">42% insumos • 38% honorários • 20% hotelaria</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 block">Centro de Custo: Bloco Cirúrgico</span>
                <strong className="text-base text-slate-900">R$ 98.400,00</strong>
                <span className="text-[10px] text-slate-500 block mt-1">54% OPME • 30% honorários • 16% taxa de sala</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: CONCILIAÇÃO BANCÁRIA */}
      {abaAtiva === 'conciliacao' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Conciliação Bancária Automatizada (CNAB 240)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Batimento do extrato de liquidações bancárias com as baixas do sistema contábil.
            </p>

            <div className="p-4 bg-[#1B1F1C]/[0.08] border border-[#1B1F1C]/20 rounded-xl text-xs text-[#33382F] space-y-1">
              <strong className="block text-sm">Status da Conciliação D-0:</strong>
              <p>100% dos lançamentos do gateway Hyperswitch batidos com a conta corrente hospitalar. Nenhuma divergência pendente.</p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 6: PERFIS & MATRIZ RBAC */}
      {abaAtiva === 'perfis' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Perfis de Acesso do Módulo Financeiro, Faturamento SUS &amp; Split
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Controle de liberação de pagamentos, geração de remessas públicas e auditoria de glosas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1B1F1C]/[0.08] text-[#1B1F1C] border border-[#1B1F1C]/20">
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
                    Responsável: <strong>{role.responsavelPadrao}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </>
  );
}
