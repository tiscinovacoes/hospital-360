'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import { KpiCard } from '../../components/KpiCard';
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
    lastCleanedAt: '19/09/2026 às 07:10',
    dailyCost: 1450.00,
  },
  {
    id: 'bed-201',
    roomNumber: 'Leito 201',
    wing: 'Enfermaria Cirúrgica',
    type: 'Leito Clínico',
    status: 'Ocupado',
    currentPatient: {
      name: 'Maria Eduarda Peixoto',
      admissionDate: '18/09/2026',
      diagnosis: 'Pós-Operatório Colecistectomia',
      doctor: 'Dr. Lucas Silveira',
    },
    lastCleanedAt: '18/09/2026 às 14:00',
    dailyCost: 620.00,
  },
  {
    id: 'bed-202',
    roomNumber: 'Leito 202',
    wing: 'Enfermaria Cirúrgica',
    type: 'Leito Clínico',
    status: 'Vago e Higienizado',
    lastCleanedAt: '19/09/2026 às 08:00',
    dailyCost: 620.00,
  },
  {
    id: 'bed-301',
    roomNumber: 'Leito 301',
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
    <VigiaSidebarLayout
      moduloId="leitos-censo"
      activeTitle="Censo Hospitalar, Mapa de Leitos & Internação"
      activeSubtitle="Visualização em tempo real da ocupação e acionamento de higienização via QR Code"
      actions={
        <div className="flex items-center gap-2.5">
          <Link
            href="/tarefas"
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 rounded-xl transition-all shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>App de Tarefas</span>
          </Link>
        </div>
      }
    >
      {/* Feedback de Notificação */}
      {feedbackMessage && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-slate-800 text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#1A56DB] flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Cards de Métricas Padronizados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Taxa de Ocupação"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedBeds} de ${totalBeds} leitos ativos`}
          icon={Activity}
          tooltipInfo="Índice de aproveitamento instantâneo de leitos operacionais nas unidades de UTI Geral, Enfermarias e Isolamento."
          trend={{ text: `${occupiedBeds} Leitos Ocupados`, isPositive: true }}
        />

        <KpiCard
          title="Leitos Vagos Imediatos"
          value={vacantBeds}
          subtitle="Prontos para Internação"
          icon={Bed}
          tooltipInfo="Total de leitos higienizados e liberados pela governança para recebimento imediato de pacientes da recepção ou centro cirúrgico."
          trend={{ text: "Disponibilidade Imediata", isPositive: true }}
        />

        <KpiCard
          title="Em Higienização"
          value={cleaningBeds}
          subtitle="Giro Médio: 22 min"
          icon={Clock}
          tooltipInfo="Leitos em processo de desinfecção e higienização terminal pela equipe de hotelaria hospitalar com ordem no App Tarefas."
          trend={{ text: "Tempo Médio: 22m", isPositive: false }}
        />

        <KpiCard
          title="Diária Média Integrada"
          value="R$ 875,00"
          subtitle="Alimentando Core 360"
          icon={ShieldCheck}
          tooltipInfo="Valor médio da diária apurado e confrontado automaticamente com a tabela SIGTAP do SUS para repasse no Custo do Paciente."
          trend={{ text: "Confronto SIGTAP OK", isPositive: true }}
        />
      </div>

      {/* Filtro por Ala */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {['Todas', 'UTI Geral', 'Enfermaria Cirúrgica', 'Isolamento COVID/Infecto'].map((wing) => (
          <button
            key={wing}
            onClick={() => setSelectedWing(wing)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedWing === wing
                ? 'bg-[#1A56DB] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {wing}
          </button>
        ))}
      </div>

      {/* Grid Visual de Leitos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredBeds.map((bed) => {
            const isSelected = selectedBed?.id === bed.id;
            let statusBadge = (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Vago
              </span>
            );
            let borderClass = 'border-slate-200/80';

            if (bed.status === 'Ocupado') {
              statusBadge = (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-[#1A56DB] border border-blue-200">
                  Ocupado
                </span>
              );
              borderClass = 'border-blue-200';
            } else if (bed.status === 'Em Higienização') {
              statusBadge = (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Higienizando
                </span>
              );
              borderClass = 'border-amber-200';
            } else if (bed.status === 'Manutenção Bloqueado') {
              statusBadge = (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
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
                  isSelected ? 'ring-2 ring-[#1A56DB]' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Bed className="w-5 h-5 text-[#1A56DB]" />
                    {bed.roomNumber}
                  </span>
                  {statusBadge}
                </div>

                <div className="text-xs text-slate-500 font-medium mb-3">{bed.wing} • {bed.type}</div>

                {bed.currentPatient ? (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-slate-800 truncate">{bed.currentPatient.name}</div>
                    <div className="text-[11px] text-slate-500">{bed.currentPatient.diagnosis}</div>
                    <div className="text-[10px] text-[#1A56DB] font-semibold">{bed.currentPatient.doctor}</div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50/50 rounded-xl text-xs text-slate-400 text-center">
                    Leito disponível sem paciente internado
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Diária: R$ {bed.dailyCost.toFixed(2)}</span>
                  <span className="font-bold text-[#1A56DB] flex items-center gap-1 hover:underline">
                    Ver Ficha <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Painel Lateral de Detalhe e Ações de Leito */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          {selectedBed ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ficha do Leito
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1A56DB] border border-blue-100">
                  {selectedBed.type}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900">{selectedBed.roomNumber}</h3>
              <p className="text-xs text-slate-500 mb-5">{selectedBed.wing}</p>

              {selectedBed.currentPatient ? (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-5 space-y-2 text-xs">
                  <div className="text-[10px] font-bold text-[#1A56DB] uppercase">Paciente Internado</div>
                  <div className="text-sm font-bold text-slate-900">{selectedBed.currentPatient.name}</div>
                  <div className="text-slate-600">Internação: {selectedBed.currentPatient.admissionDate}</div>
                  <div className="text-slate-600">Diagnóstico: {selectedBed.currentPatient.diagnosis}</div>
                  <div className="text-slate-600">Médico Responsável: {selectedBed.currentPatient.doctor}</div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 mb-5">
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
                  <span className="font-black text-slate-900">R$ {selectedBed.dailyCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">Selecione um leito ao lado</div>
          )}

          <div className="space-y-3 mt-6">
            <button
              onClick={() => selectedBed && handleSimulateCleaningCall(selectedBed)}
              className="w-full py-2.5 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Chamar Higienização Terminal (App Tarefas)
            </button>
          </div>
        </div>
      </div>
    </VigiaSidebarLayout>
  );
}
