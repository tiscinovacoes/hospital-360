'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
import {
  Bed,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  Search,
  Filter,
  Users,
  AlertCircle,
  Activity,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface HospitalBed {
  id: string;
  roomNumber: string;
  wing: 'UTI Geral' | 'Enfermaria Cirúrgica' | 'Maternidade' | 'Isolamento COVID/Infecto';
  type: 'UTI Adulto' | 'Leito Clínico' | 'Apartamento' | 'Isolamento Pressão Negativa';
  status: 'Ocupado' | 'Vago e Higienizado' | 'Em Higienização' | 'Manutenção Bloqueado';
  currentPatient?: {
    name: string;
    admissionDate: string;
    diagnosis: string;
    doctor: string;
  };
  lastCleanedAt: string;
  dailyCost: number;
}

const mockBeds: HospitalBed[] = [
  {
    id: 'bed-101',
    roomNumber: 'Leito 101',
    wing: 'UTI Geral',
    type: 'UTI Adulto',
    status: 'Ocupado',
    currentPatient: {
      name: 'Severino Silva Cavalcanti',
      admissionDate: '19/09/2026',
      diagnosis: 'Insuficiência Respiratória Aguda',
      doctor: 'Dra. Camila Nogueira',
    },
    lastCleanedAt: '19/09/2026 às 06:30',
    dailyCost: 1450.00,
  },
  {
    id: 'bed-102',
    roomNumber: 'Leito 102',
    wing: 'UTI Geral',
    type: 'UTI Adulto',
    status: 'Em Higienização',
    lastCleanedAt: 'Em andamento por Maria Souza (App Tarefas)',
    dailyCost: 1450.00,
  },
  {
    id: 'bed-103',
    roomNumber: 'Leito 103',
    wing: 'UTI Geral',
    type: 'UTI Adulto',
    status: 'Vago e Higienizado',
    lastCleanedAt: '21/09/2026 às 08:15',
    dailyCost: 1450.00,
  },
  {
    id: 'bed-201',
    roomNumber: 'Apto 201',
    wing: 'Enfermaria Cirúrgica',
    type: 'Apartamento',
    status: 'Ocupado',
    currentPatient: {
      name: 'Maria Helena Bastos',
      admissionDate: '20/09/2026',
      diagnosis: 'Pós-Operatório Colecistectomia',
      doctor: 'Dr. Ricardo Mendes',
    },
    lastCleanedAt: '20/09/2026 às 14:00',
    dailyCost: 520.00,
  },
  {
    id: 'bed-202',
    roomNumber: 'Apto 202',
    wing: 'Enfermaria Cirúrgica',
    type: 'Apartamento',
    status: 'Vago e Higienizado',
    lastCleanedAt: '21/09/2026 às 09:00',
    dailyCost: 520.00,
  },
  {
    id: 'bed-301',
    roomNumber: 'Isolamento 301',
    wing: 'Isolamento COVID/Infecto',
    type: 'Isolamento Pressão Negativa',
    status: 'Manutenção Bloqueado',
    lastCleanedAt: 'Chamado #MAN-89 Aberto',
    dailyCost: 980.00,
  },
];

export default function LeitosCensoPage() {
  const [selectedWing, setSelectedWing] = useState<string>('Todas');
  const [selectedBed, setSelectedBed] = useState<HospitalBed | null>(mockBeds[0]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const filteredBeds = mockBeds.filter((bed) => {
    return selectedWing === 'Todas' || bed.wing === selectedWing;
  });

  const totalBeds = mockBeds.length;
  const occupiedBeds = mockBeds.filter((b) => b.status === 'Ocupado').length;
  const vacantBeds = mockBeds.filter((b) => b.status === 'Vago e Higienizado').length;
  const cleaningBeds = mockBeds.filter((b) => b.status === 'Em Higienização').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const handleSimulateCleaningCall = (bed: HospitalBed) => {
    setFeedbackMessage(`Ordem de Serviço enviada para o App de Tarefas (/tarefas)! A equipe de higienização recebeu a notificação no celular para ler o QR Code do ${bed.roomNumber}.`);
    setTimeout(() => setFeedbackMessage(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HospitalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da Tela com Assinatura da UX Master */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full w-fit mb-2 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Protótipo Oficial UX Master: Beatriz Brandão • Squad 5 (Thiago Pires)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Bed className="w-8 h-8 text-blue-600" />
              Censo Hospitalar, Mapa de Leitos &amp; Internação
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Visualização em tempo real da ocupação hospitalar integrada ao Bahmni-Core e acionamento de higienização via QR Code no App móvel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tarefas"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              <QrCode className="w-4 h-4" />
              Abrir App de Tarefas
            </Link>
          </div>
        </div>

        {/* Feedback de Notificação */}
        {feedbackMessage && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-blue-900 text-sm font-medium animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Cards de Métricas do Censo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Taxa de Ocupação</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900">{occupancyRate}%</span>
              <span className="text-xs text-slate-500">({occupiedBeds}/{totalBeds} leitos)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Leitos Vagos Imediatos</span>
            <div className="text-3xl font-black text-emerald-700 mt-2">{vacantBeds}</div>
            <p className="text-xs text-slate-500 mt-1">Higienizados e prontos para internação</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Em Higienização (Giro)</span>
            <div className="text-3xl font-black text-amber-700 mt-2">{cleaningBeds}</div>
            <p className="text-xs text-slate-500 mt-1">Tempo médio de giro: 22 minutos</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Diária Média Integrada</span>
            <div className="text-3xl font-black text-slate-900 mt-2">R$ 875,00</div>
            <p className="text-xs text-slate-500 mt-1">Alimentando a matriz Door-to-Door</p>
          </div>
        </div>

        {/* Filtro por Ala */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {['Todas', 'UTI Geral', 'Enfermaria Cirúrgica', 'Isolamento COVID/Infecto'].map((wing) => (
            <button
              key={wing}
              onClick={() => setSelectedWing(wing)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedWing === wing
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {wing}
            </button>
          ))}
        </div>

        {/* Grid Visual de Leitos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredBeds.map((bed) => {
              const isSelected = selectedBed?.id === bed.id;
              let statusBadge = (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Vago
                </span>
              );
              let borderClass = 'border-slate-200';

              if (bed.status === 'Ocupado') {
                statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    Ocupado
                  </span>
                );
                borderClass = 'border-blue-200';
              } else if (bed.status === 'Em Higienização') {
                statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                    Higienizando
                  </span>
                );
                borderClass = 'border-amber-200';
              } else if (bed.status === 'Manutenção Bloqueado') {
                statusBadge = (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    Bloqueado
                  </span>
                );
                borderClass = 'border-rose-200';
              }

              return (
                <div
                  key={bed.id}
                  onClick={() => setSelectedBed(bed)}
                  className={`bg-white p-5 rounded-2xl border ${borderClass} shadow-sm hover:shadow-md cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Bed className="w-5 h-5 text-blue-600" />
                      {bed.roomNumber}
                    </span>
                    {statusBadge}
                  </div>

                  <div className="text-xs text-slate-500 font-medium mb-3">{bed.wing} • {bed.type}</div>

                  {bed.currentPatient ? (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-slate-800 truncate">{bed.currentPatient.name}</div>
                      <div className="text-[11px] text-slate-500">{bed.currentPatient.diagnosis}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">{bed.currentPatient.doctor}</div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50/50 rounded-xl text-xs text-slate-400 text-center">
                      Leito disponível sem paciente internado
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Diária: R$ {bed.dailyCost.toFixed(2)}</span>
                    <span className="font-bold text-blue-600 flex items-center gap-1 hover:underline">
                      Ver Ficha <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Painel Lateral de Detalhe e Ações de Leito */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            {selectedBed ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ficha do Leito
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {selectedBed.type}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900">{selectedBed.roomNumber}</h3>
                <p className="text-xs text-slate-500 mb-6">{selectedBed.wing}</p>

                {selectedBed.currentPatient ? (
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 mb-6 space-y-2 text-xs">
                    <div className="text-[11px] font-bold text-blue-700 uppercase">Paciente Internado</div>
                    <div className="text-sm font-bold text-slate-900">{selectedBed.currentPatient.name}</div>
                    <div className="text-slate-600">Internação: {selectedBed.currentPatient.admissionDate}</div>
                    <div className="text-slate-600">Diagnóstico: {selectedBed.currentPatient.diagnosis}</div>
                    <div className="text-slate-600">Médico Responsável: {selectedBed.currentPatient.doctor}</div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 mb-6">
                    Nenhum paciente alocado no momento. Leito pronto para admissão de emergência.
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Higienização</span>
                    <span className="font-medium text-slate-700 text-right">{selectedBed.lastCleanedAt}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Custo da Diária Hospitalar</span>
                    <span className="font-black text-blue-600">R$ {selectedBed.dailyCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">Selecione um leito ao lado</div>
            )}

            <div className="space-y-3 mt-6">
              <button
                onClick={() => selectedBed && handleSimulateCleaningCall(selectedBed)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Chamar Higienização Terminal (App Tarefas)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
