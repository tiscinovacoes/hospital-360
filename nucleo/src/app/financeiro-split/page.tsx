'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import { KpiCard } from '../../components/KpiCard';
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
  UserCheck
} from 'lucide-react';

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

export default function FinanceiroSplitPage() {
  const [transactions, setTransactions] = useState<TransactionSplit[]>(mockTransactions);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSimulateSplitPayment = () => {
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
    setSuccessNotice(`Pagamento de R$ 350,00 liquidado via Hyperswitch! R$ 297,50 (85%) creditado ao médico e R$ 52,50 (15%) ao condomínio hospitalar com NFS-e emitida.`);
    setTimeout(() => setSuccessNotice(null), 6000);
  };

  const totalProcessed = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalDoctorShare = transactions.reduce((acc, curr) => acc + curr.doctorShare, 0);
  const totalHospitalShare = transactions.reduce((acc, curr) => acc + curr.hospitalCondoShare, 0);

  return (
    <VigiaSidebarLayout
      activeTitle="Fintech Split de Pagamentos & NFS-e"
      activeSubtitle="Divisão instantânea de recebíveis entre cooperados (85%) e condomínio hospitalar (15%)"
      actions={
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hub Central</span>
          </Link>
          <button
            onClick={handleSimulateSplitPayment}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#1A56DB] hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Simular Consulta c/ Split</span>
          </button>
        </div>
      }
    >
      {/* Feedback de Notificação */}
      {successNotice && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-slate-800 text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#1A56DB] flex-shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Cards de Métricas Padronizados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Volume Total Liquidado"
          value={`R$ ${totalProcessed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="100% Conciliado"
          icon={DollarSign}
          tooltipInfo="Volume financeiro total processado pela esteira Hyperswitch (Rust) com separação atômica entre recebedores."
          trend={{ text: "Hyperswitch Operante", isPositive: true }}
        />

        <KpiCard
          title="Repasse Médicos (85%)"
          value={`R$ ${totalDoctorShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Crédito Imediato D+0"
          icon={UserCheck}
          tooltipInfo="Honorários médicos creditados instantaneamente na conta bancária do profissional via PIX sem carência de repasse."
          trend={{ text: "PIX D+0 Instantâneo", isPositive: true }}
        />

        <KpiCard
          title="Taxa Condomínio (15%)"
          value={`R$ ${totalHospitalShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Taxa de Administração"
          icon={Building2}
          tooltipInfo="Percentual retido automaticamente para custeio predial, hotelaria, enfermagem e infraestrutura de tecnologia."
          trend={{ text: "Cobre Custos Fixos", isPositive: true }}
        />

        <KpiCard
          title="Notas Fiscais (NFS-e)"
          value={`${transactions.length} NFS-e`}
          subtitle="Emissão Municipal"
          icon={Receipt}
          tooltipInfo="Documentos fiscais eletrônicos emitidos de forma automatizada pela esteira .NET C# integrada à prefeitura."
          trend={{ text: "100% Escrituradas", isPositive: true }}
        />
      </div>

      {/* Tabela de Transações e Split em Tempo Real */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Extrato de Liquidações com Split Bancário</h3>
            <p className="text-xs text-slate-400">Cada consulta realizada no OpenEMR passa pelo motor de split sem retenção indevida</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
            Regra Ativa: 85% / 15%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Transação</th>
                <th className="px-4 py-3">Paciente / Serviço</th>
                <th className="px-4 py-3">Médico Cooperado</th>
                <th className="px-4 py-3">Valor Total</th>
                <th className="px-4 py-3">Repasse Médico (85%)</th>
                <th className="px-4 py-3">Condomínio (15%)</th>
                <th className="px-4 py-3">NFS-e</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">{tx.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{tx.patientName}</div>
                    <div className="text-[11px] text-slate-400">{tx.service}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800">{tx.doctorName}</div>
                    <div className="text-[11px] text-slate-400">{tx.clinicRoom}</div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    R$ {tx.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    R$ {tx.doctorShare.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-600">
                    R$ {tx.hospitalCondoShare.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                      {tx.nfseNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </VigiaSidebarLayout>
  );
}
