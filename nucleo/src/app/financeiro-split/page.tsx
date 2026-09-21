'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
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
    patientName: 'Carlos Eduardo Nogueira',
    clinicRoom: 'Sala 302',
    doctorName: 'Dr. Fernando Dias (Ortopedia)',
    service: 'Consulta com Infiltração Articular',
    totalAmount: 850.00,
    doctorShare: 722.50,
    hospitalCondoShare: 127.50,
    paymentMethod: 'PIX D+0',
    status: 'Liquidado Instantâneo',
    nfseNumber: 'NFS-2026-8814',
    createdAt: 'Hoje às 09:30',
  },
];

export default function FinanceiroSplitPage() {
  const [transactions, setTransactions] = useState<TransactionSplit[]>(mockTransactions);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSimulateSplitPayment = () => {
    const newTx: TransactionSplit = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: 'Marcos Vinicius Tavares',
      clinicRoom: 'Sala 204',
      doctorName: 'Dr. Ricardo Mendes (Cardiologia)',
      service: 'Consulta Retorno + Avaliação de Risco',
      totalAmount: 350.00,
      doctorShare: 297.50,
      hospitalCondoShare: 52.50,
      paymentMethod: 'PIX D+0',
      status: 'Liquidado Instantâneo',
      nfseNumber: `NFS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'Agora mesmo',
    };
    setTransactions([newTx, ...transactions]);
    setSuccessNotice(`Pagamento de R$ 350,00 liquidado via Hyperswitch! R$ 297,50 (85%) creditado na conta do Dr. Ricardo e R$ 52,50 (15%) na conta do condomínio hospitalar com NFS-e emitida no HealVista.`);
    setTimeout(() => setSuccessNotice(null), 7000);
  };

  const totalProcessed = transactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalDoctorShare = transactions.reduce((acc, curr) => acc + curr.doctorShare, 0);
  const totalHospitalShare = transactions.reduce((acc, curr) => acc + curr.hospitalCondoShare, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HospitalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da Tela com Assinatura da UX Master */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full w-fit mb-2 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Protótipo Oficial UX Master: Beatriz Brandão • Squad 6 (André Castilho)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-indigo-600" />
              Fintech Hospital 360 &amp; Split Automático de Pagamentos
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Divisão instantânea de recebíveis entre médicos cooperados (85%) e condomínio hospitalar (15%) com motor Hyperswitch e emissão de NFS-e municipal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ingestao-modulos"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Hub 360
            </Link>
            <button
              onClick={handleSimulateSplitPayment}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20"
            >
              <Split className="w-4 h-4" />
              Simular Consulta com Split 85/15
            </button>
          </div>
        </div>

        {/* Feedback de Notificação */}
        {successNotice && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3 text-indigo-950 text-sm font-medium animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Cards de Métricas do Split Financeiro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Volume Total Liquidado</span>
            <div className="text-2xl font-black text-slate-900 mt-2">
              R$ {totalProcessed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">100% conciliado via Hyperswitch (Rust)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Repasse Médicos (85%)</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2">
              R$ {totalDoctorShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">PIX D+0 instantâneo para cooperados</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Taxa Condomínio (15%)</span>
              <Building2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-indigo-700 mt-2">
              R$ {totalHospitalShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">Cobre aluguel, luz, TI e enfermagem</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notas Fiscais Emitidas</span>
              <Receipt className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{transactions.length} NFS-e</div>
            <p className="text-xs text-slate-500 mt-1">Escrituração automática no HealVista</p>
          </div>
        </div>

        {/* Tabela de Transações e Split em Tempo Real */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Extrato de Liquidações com Split Bancário</h3>
              <p className="text-xs text-slate-500">Cada consulta realizada no OpenEMR passa pelo motor de split sem retenção indevida</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
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
                  <th className="px-4 py-3 text-emerald-700">Repasse Médico (85%)</th>
                  <th className="px-4 py-3 text-indigo-700">Condomínio (15%)</th>
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
                      <div className="text-[11px] text-slate-500">{tx.service}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{tx.doctorName}</div>
                      <div className="text-[11px] text-slate-400">{tx.clinicRoom}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      R$ {tx.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 font-black text-emerald-700">
                      R$ {tx.doctorShare.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 font-black text-indigo-700">
                      R$ {tx.hospitalCondoShare.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {tx.nfseNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
