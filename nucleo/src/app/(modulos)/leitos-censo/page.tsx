'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { KpiCard } from '@/components/KpiCard';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
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
  ShieldCheck,
  Building,
  ArrowRightLeft,
  Sparkle,
  Lock,
  X,
  Info,
  Calendar,
  Layers,
  Check
} from 'lucide-react';

type AbaLeitos = 
  | 'mapa'
  | 'regulacao'
  | 'higienizacao'
  | 'indicadores'
  | 'perfis';

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
    tempoPermanenciaDias: number;
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
      tempoPermanenciaDias: 3
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
    lastCleanedAt: '21/09/2026 às 07:10',
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
      tempoPermanenciaDias: 4
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
    lastCleanedAt: '21/09/2026 às 08:00',
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

interface SolicitacaoNIR {
  id: string;
  paciente: string;
  idade: number;
  origem: string;
  prioridade: 'VERMELHA (EMERGÊNCIA)' | 'AMARELA (URGÊNCIA)' | 'VERDE (ELETIVA)';
  especialidadeNecessaria: string;
  tempoEsperaMinutos: number;
  status: 'AGUARDANDO_LEITO' | 'LEITO_RESERVADO' | 'TRANSFERIDO';
}

const SOLICITACOES_NIR_MOCK: SolicitacaoNIR[] = [
  {
    id: 'NIR-2026-081',
    paciente: 'Carlos Alberto Fonseca',
    idade: 62,
    origem: 'Pronto-Socorro (Box de Emergência)',
    prioridade: 'VERMELHA (EMERGÊNCIA)',
    especialidadeNecessaria: 'UTI Adulto / Coronariana',
    tempoEsperaMinutos: 18,
    status: 'AGUARDANDO_LEITO'
  },
  {
    id: 'NIR-2026-082',
    paciente: 'Helena Miranda da Costa',
    idade: 45,
    origem: 'Centro Cirúrgico (RPA)',
    prioridade: 'AMARELA (URGÊNCIA)',
    especialidadeNecessaria: 'Enfermaria Cirúrgica',
    tempoEsperaMinutos: 42,
    status: 'LEITO_RESERVADO'
  }
];

export default function LeitosCensoPage() {
  const roles = MODULO_ROLES_CATALOG['leitos-censo'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [abaAtiva, setAbaAtiva] = useState<AbaLeitos>('mapa');
  const [selectedWing, setSelectedWing] = useState<string>('Todas');
  const [selectedBed, setSelectedBed] = useState<HospitalBed | null>(mockBeds[0]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [solicitacoesNir, setSolicitacoesNir] = useState<SolicitacaoNIR[]>(SOLICITACOES_NIR_MOCK);

  const filteredBeds = mockBeds.filter((bed) => {
    return selectedWing === 'Todas' || bed.wing === selectedWing;
  });

  const totalBeds = mockBeds.length;
  const occupiedBeds = mockBeds.filter((b) => b.status === 'Ocupado').length;
  const vacantBeds = mockBeds.filter((b) => b.status === 'Vago e Higienizado').length;
  const cleaningBeds = mockBeds.filter((b) => b.status === 'Em Higienização').length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const triggerFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleSimulateCleaningCall = (bed: HospitalBed) => {
    if (!hasPermission(activeRole, 'UPDATE')) {
      triggerFeedback('Atenção: Seu perfil não possui permissão para acionar ordens de hotelaria.');
      return;
    }
    triggerFeedback(`Ordem de Higienização Terminal aberta no App de Tarefas para o ${bed.roomNumber}! Tempo estimado: 22 min.`);
  };

  const handleAlocarLeitoNir = (nirId: string) => {
    if (!hasPermission(activeRole, 'APPROVE')) {
      triggerFeedback('Atenção: Apenas o Regulador NIR ou Diretoria possui permissão para autorizar alocação de leitos.');
      return;
    }
    setSolicitacoesNir(prev =>
      prev.map(s => s.id === nirId ? { ...s, status: 'LEITO_RESERVADO' as const } : s)
    );
    triggerFeedback(`Solicitação ${nirId} autorizada! Leito 103 reservado com sucesso no censo.`);
  };

  return (
    <>
      <PageHeader
        activeTitle="Censo Hospitalar, Mapa de Leitos & Regulação NIR"
        activeSubtitle="Ocupação em tempo real, regulação de vagas hospitalares e giro de leitos com hotelaria"
        actions={
          <div className="flex items-center gap-2.5">
            <Link
              href="/tarefas"
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-xs font-bold text-white bg-[#0284C7] hover:bg-sky-700 rounded-xl transition-all shadow-xs touch-manipulation"
            >
              <QrCode className="w-4 h-4" />
              <span>App de Tarefas (Hotelaria)</span>
            </Link>
          </div>
        }
      />
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="mb-4 p-3.5 bg-sky-50 border border-sky-300 rounded-2xl flex items-center justify-between text-xs text-sky-950 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0284C7] shrink-0" />
            <span className="font-bold">{feedbackMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFeedbackMessage(null)}
            className="text-sky-600 hover:text-sky-800 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BARRA DE RBAC & CONTROLE DE PERFIS DO MÓDULO */}
      <ModuloRbacBar
        moduloId="leitos-censo"
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        accentColor="#0284C7"
        lightBg="bg-sky-50"
        lightBorder="border-sky-200"
      />

      {/* CARDS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Taxa de Ocupação"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedBeds} de ${totalBeds} leitos ativos`}
          icon={<Activity className="w-5 h-5 text-sky-600" />}
          trend={{ text: `${occupiedBeds} Leitos Ocupados`, isPositive: true }}
        />

        <KpiCard
          title="Leitos Vagos Imediatos"
          value={vacantBeds}
          subtitle="Prontos para Internação"
          icon={<Bed className="w-5 h-5 text-sky-600" />}
          trend={{ text: "Disponibilidade Imediata", isPositive: true }}
        />

        <KpiCard
          title="Em Higienização"
          value={cleaningBeds}
          subtitle="Giro Médio: 22 min"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          trend={{ text: "Tempo Médio: 22m", isAlert: true }}
        />

        <KpiCard
          title="Diária Média Integrada"
          value="R$ 875,00"
          subtitle="Confronto SIGTAP / SUS"
          icon={<ShieldCheck className="w-5 h-5 text-sky-600" />}
          trend={{ text: "Confronto SIGTAP OK", isPositive: true }}
        />
      </div>

      {/* SUB-NAVEGAÇÃO POR ABAS */}
      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-1.5 mb-6 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'mapa', label: '1. Mapa Visual de Leitos & Censo', icon: Bed },
          { id: 'regulacao', label: '2. Regulação NIR & Fila de Vagas', icon: ArrowRightLeft },
          { id: 'higienizacao', label: '3. Higienização & Giro de Leito', icon: Clock },
          { id: 'indicadores', label: '4. Indicadores de TMP & Permanência', icon: Activity },
          { id: 'perfis', label: '5. Perfis & Matriz RBAC', icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = abaAtiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id as AbaLeitos)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px] touch-manipulation ${
                isActive
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ABA 1: MAPA VISUAL DE LEITOS */}
      {abaAtiva === 'mapa' && (
        <div className="space-y-6">
          {/* Filtro por Ala */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['Todas', 'UTI Geral', 'Enfermaria Cirúrgica', 'Isolamento COVID/Infecto'].map((wing) => (
              <button
                key={wing}
                onClick={() => setSelectedWing(wing)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px] ${
                  selectedWing === wing
                    ? 'bg-[#0284C7] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-[#E0E0E0] hover:bg-slate-50'
                }`}
              >
                {wing}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grade de Leitos */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredBeds.map((bed) => {
                const isSelected = selectedBed?.id === bed.id;
                return (
                  <div
                    key={bed.id}
                    onClick={() => setSelectedBed(bed)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#0284C7] ring-2 ring-sky-100 shadow-md'
                        : 'border-[#E0E0E0] hover:border-sky-300 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-slate-900">{bed.roomNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            bed.status === 'Ocupado'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : bed.status === 'Vago e Higienizado'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : bed.status === 'Em Higienização'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {bed.status}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-500 block mb-3">
                        {bed.wing} • {bed.type}
                      </span>

                      {bed.currentPatient ? (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-0.5">
                          <strong className="text-slate-900 block truncate">{bed.currentPatient.name}</strong>
                          <span className="text-[11px] text-slate-500 block truncate">{bed.currentPatient.diagnosis}</span>
                          <span className="text-[10px] text-sky-700 font-semibold block">{bed.currentPatient.doctor}</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50/50 rounded-xl text-center text-xs text-slate-400">
                          {bed.status === 'Em Higienização' ? 'Desinfecção em andamento' : 'Pronto para admissão'}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Diária: R$ {bed.dailyCost.toFixed(2)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Painel Lateral de Detalhes do Leito Selecionado */}
            {selectedBed && (
              <div className="bg-white p-5 rounded-2xl border border-[#E0E0E0] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{selectedBed.roomNumber}</h3>
                    <p className="text-xs text-slate-500">{selectedBed.wing} • {selectedBed.type}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      selectedBed.status === 'Ocupado'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : selectedBed.status === 'Vago e Higienizado'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {selectedBed.status}
                  </span>
                </div>

                {selectedBed.currentPatient ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Paciente Internado:</span>
                      <strong className="text-slate-900 text-sm">{selectedBed.currentPatient.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Data de Internação / TMP:</span>
                      <span className="text-slate-700 font-medium">
                        {selectedBed.currentPatient.admissionDate} ({selectedBed.currentPatient.tempoPermanenciaDias} dias de internação)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Diagnóstico Clínico:</span>
                      <span className="text-slate-700">{selectedBed.currentPatient.diagnosis}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Médico Assistente Responsável:</span>
                      <strong className="text-sky-700">{selectedBed.currentPatient.doctor}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                    Nenhum paciente ocupando este leito no momento.
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] text-slate-400 block">Status de Hotelaria:</span>
                  <div className="text-xs text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {selectedBed.lastCleanedAt}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSimulateCleaningCall(selectedBed)}
                    className="w-full py-2.5 px-3 rounded-xl bg-sky-50 text-[#0284C7] hover:bg-sky-100 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-sky-200 min-h-[44px] touch-manipulation"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Acionar Higienização Terminal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: REGULAÇÃO NIR */}
      {abaAtiva === 'regulacao' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7]">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Núcleo Interno de Regulação (NIR) &amp; Fila de Vagas
                </h3>
                <p className="text-xs text-slate-500">
                  Cruzamento de gravidade clínica, tempo de espera e disponibilidade em UTI e Enfermarias.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {solicitacoesNir.map(sol => (
                <div key={sol.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{sol.id}</span>
                      <strong className="text-sm text-slate-900">{sol.paciente} ({sol.idade} anos)</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sol.prioridade.includes('VERMELHA')
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {sol.prioridade}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Origem: {sol.origem} • Necessidade: <strong className="text-slate-800">{sol.especialidadeNecessaria}</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Tempo na fila: {sol.tempoEsperaMinutos} minutos
                    </div>
                  </div>

                  <div>
                    {sol.status === 'AGUARDANDO_LEITO' ? (
                      <button
                        type="button"
                        onClick={() => handleAlocarLeitoNir(sol.id)}
                        className="px-4 py-2 bg-[#0284C7] hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs min-h-[44px]"
                      >
                        Autorizar e Alocar Leito
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Leito Reservado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: HIGIENIZAÇÃO */}
      {abaAtiva === 'higienizacao' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Giro de Leito &amp; Painel de Hotelaria Hospitalar
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Controle do tempo de turnaround entre a alta médica e a liberação física do leito higienizado.
            </p>

            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-2 text-xs text-sky-950 mb-4">
              <strong>SLA de Higienização:</strong>
              <p>
                Meta institucional de giro: <strong>&le; 30 minutos</strong> para enfermaria e <strong>&le; 45 minutos</strong> para UTI.
                Tempo médio nas últimas 24h: <strong>22 minutos</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <div className="p-3 border border-[#E0E0E0] rounded-xl flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block">Leito 102 (UTI Geral)</strong>
                  <span className="text-slate-500">Iniciado às 21:50 por Maria Souza (App Tarefas)</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Em Andamento (14 min decorridos)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: INDICADORES TMP */}
      {abaAtiva === 'indicadores' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Indicadores de Tempo Médio de Permanência (TMP)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Vigilância ativa para redução de diárias desnecessárias e prevenção de infecção hospitalar.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 block">TMP UTI Geral:</span>
                <strong className="text-base text-slate-900">4,2 dias</strong>
                <span className="text-[10px] text-emerald-700 block mt-1">-0,6d vs mês anterior</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 block">TMP Enfermaria Cirúrgica:</span>
                <strong className="text-base text-slate-900">2,8 dias</strong>
                <span className="text-[10px] text-emerald-700 block mt-1">Dentro da meta ONA</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: PERFIS & MATRIZ RBAC */}
      {abaAtiva === 'perfis' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Perfis de Acesso do Módulo Censo Hospitalar &amp; Gestão de Leitos
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Regulação de vagas, governança assistencial e equipe de hotelaria hospitalar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
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
    </>
  );
}
