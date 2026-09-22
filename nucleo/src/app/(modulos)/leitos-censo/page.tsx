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
  Check,
  Menu,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Building2
} from 'lucide-react';

type SecaoLeitos = 
  | 'mapa'
  | 'regulacao'
  | 'higienizacao'
  | 'indicadores'
  | 'despesas_hub'
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

const DESPESAS_LEITOS_SEED = [
  {
    id_transacao: 'DSP-LEI-001',
    paciente_cpf: '456.789.012-33',
    paciente_nome: 'Severino Silva Cavalcanti',
    prontuario_episodio: 'PRONT-88210',
    centro_custo: 'UTI_GERAL',
    leito_identificador: 'Leito 101 UTI',
    item_codigo: 'DIARIA-UTI-01',
    item_descricao: 'Diária de Internação em UTI Adulto com Monitoramento Contínuo',
    lote_fabricante: 'DIARIA-2026-09-19',
    quantidade: 3,
    unidade_medida: 'Diária Hospitalar',
    valor_unitario_medio: 1450.00,
    valor_total_imputado: 4350.00,
    data_consumo: '2026-09-22 00:00:00'
  },
  {
    id_transacao: 'DSP-LEI-002',
    paciente_cpf: '567.890.123-44',
    paciente_nome: 'Maria Eduarda Peixoto',
    prontuario_episodio: 'PRONT-77412',
    centro_custo: 'ENFERMARIA_CIRURGICA',
    leito_identificador: 'Leito 201 Enf Cirúrgica',
    item_codigo: 'DIARIA-ENF-01',
    item_descricao: 'Diária de Internação em Enfermaria Cirúrgica Especializada',
    lote_fabricante: 'DIARIA-2026-09-18',
    quantidade: 4,
    unidade_medida: 'Diária Hospitalar',
    valor_unitario_medio: 620.00,
    valor_total_imputado: 2480.00,
    data_consumo: '2026-09-22 00:00:00'
  },
  {
    id_transacao: 'DSP-LEI-003',
    paciente_cpf: '123.456.789-00',
    paciente_nome: 'Carlos Eduardo Silveira',
    prontuario_episodio: 'EPIS-2026-8841',
    centro_custo: 'UTI_ADULTO',
    leito_identificador: 'Leito 204 UTI',
    item_codigo: 'DIARIA-UTI-01',
    item_descricao: 'Diária de Internação em UTI Adulto com Monitoramento Contínuo',
    lote_fabricante: 'DIARIA-2026-09-20',
    quantidade: 2,
    unidade_medida: 'Diária Hospitalar',
    valor_unitario_medio: 1450.00,
    valor_total_imputado: 2900.00,
    data_consumo: '2026-09-22 00:00:00'
  },
  {
    id_transacao: 'DSP-LEI-004',
    paciente_cpf: '234.567.890-11',
    paciente_nome: 'Maria Silva Santos',
    prontuario_episodio: 'PRONT-44910',
    centro_custo: 'UTI_GERAL',
    leito_identificador: 'Leito 04 UTI',
    item_codigo: 'DIARIA-UTI-01',
    item_descricao: 'Diária de Internação em UTI Geral com Suporte Ventilatório',
    lote_fabricante: 'DIARIA-2026-09-21',
    quantidade: 2,
    unidade_medida: 'Diária Hospitalar',
    valor_unitario_medio: 1450.00,
    valor_total_imputado: 2900.00,
    data_consumo: '2026-09-22 00:00:00'
  }
];

export default function LeitosCensoPage() {
  const roles = MODULO_ROLES_CATALOG['leitos-censo'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoLeitos>('mapa');
  const [sidebarAberta, setSidebarAberta] = useState(true);
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

  const menuItens = [
    {
      id: 'mapa',
      label: 'Mapa Visual de Leitos',
      icon: Bed,
      badge: `${occupancyRate}%`,
      badgeCor: 'bg-[#C1622D] text-white shadow-xs font-bold'
    },
    {
      id: 'regulacao',
      label: 'Regulação NIR & Vagas',
      icon: ArrowRightLeft,
      badge: `${solicitacoesNir.filter(s => s.status === 'AGUARDANDO_LEITO').length} Fila`,
      badgeCor: 'bg-rose-100 text-rose-800 font-bold'
    },
    {
      id: 'higienizacao',
      label: 'Giro de Leito & Hotelaria',
      icon: Clock,
      badge: '22 min',
      badgeCor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'indicadores',
      label: 'Indicadores TMP & Estadia',
      icon: Activity,
      badge: null,
      badgeCor: ''
    },
    {
      id: 'despesas_hub',
      label: 'Exportar Despesas ao Hub',
      icon: FileSpreadsheet,
      badge: 'Hub 360',
      badgeCor: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    },
    {
      id: 'perfis',
      label: 'Perfis & Matriz RBAC',
      icon: Lock,
      badge: 'NIR',
      badgeCor: 'bg-slate-100 text-slate-700'
    }
  ];

  return (
    <>
      <PageHeader
        activeTitle="Censo Hospitalar, Mapa de Leitos & Regulação NIR"
        activeSubtitle="Ocupação em tempo real, regulação de vagas hospitalares, giro de leitos e apuração de diárias"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
              title={sidebarAberta ? 'Recolher menu do censo' : 'Expandir menu do censo'}
            >
              {sidebarAberta ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setSecaoAtiva('despesas_hub')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Despesas Hub</span>
            </button>

            <Link
              href="/tarefas"
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-xs font-bold text-white bg-[#C1622D] hover:bg-[#A8531F] rounded-xl transition-all shadow-xs touch-manipulation cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>App de Tarefas (Hotelaria)</span>
            </Link>
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
      {/* CORPO PRINCIPAL COM SIDEBAR EXCLUSIVA DO PRODUTO CENSO & LEITOS */}
      {/* ========================================================================= */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Menu Lateral Colorido com a Cor do Módulo (Azul Céu / Sky #C1622D) */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-30
            ${sidebarAberta ? 'translate-x-0 w-72 lg:w-64 shadow-xl lg:shadow-none' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:hidden'}
            shrink-0 bg-gradient-to-b from-[#C1622D]/95 via-white to-[#C1622D]/80 border-r border-[#C1622D]/90 flex flex-col justify-between transition-all duration-200 ease-in-out
          `}
        >
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold text-[#C1622D] uppercase tracking-wider">
              Menu Censo Hospitalar &amp; NIR
            </div>
            {menuItens.map((item) => {
              const Icone = item.icon;
              const ativo = secaoAtiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSecaoAtiva(item.id as SecaoLeitos);
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      setSidebarAberta(false);
                    }
                  }}
                  className={`w-full min-h-[44px] sm:min-h-[38px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer focus:ring-2 focus:ring-[#C1622D] focus:outline-none ${
                    ativo
                      ? 'bg-[#C1622D] text-white font-bold border border-[#C1622D] shadow-sm shadow-[#C1622D]/25'
                      : 'text-slate-700 hover:bg-white/90 hover:text-[#C1622D] hover:shadow-2xs border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icone
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        ativo ? 'text-white' : 'text-[#C1622D] group-hover:text-[#C1622D]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ml-1 font-semibold ${
                        item.badgeCor || (ativo ? 'bg-white/20 text-white' : 'bg-[#C1622D]/[0.12] text-[#C1622D]')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Rodapé da Sidebar: Retorno ao Hub */}
          <div className="p-3 border-t border-[#C1622D]/80 bg-white/70">
            <Link
              href="/"
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#C1622D] hover:bg-[#A8531F]/60 transition-all border border-[#C1622D]/70"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5 text-[#C1622D]" />
                <span>Voltar ao Hub de Módulos</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </Link>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* ÁREA DE CONTEÚDO PRINCIPAL DO MÓDULO */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Toast Feedback */}
          {feedbackMessage && (
            <div className="p-3.5 bg-[#C1622D]/[0.08] border border-[#C1622D]/30 rounded-2xl flex items-center justify-between text-xs text-[#A8531F] shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C1622D] shrink-0" />
                <span className="font-bold">{feedbackMessage}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setFeedbackMessage(null)}
                className="text-[#C1622D] hover:text-[#C1622D] p-1 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PERFIS & MATRIZ RBAC — só aparece na seção "Perfis" do menu lateral, não em todas as telas */}
          {secaoAtiva === 'perfis' && (
            <ModuloRbacBar
              moduloId="leitos-censo"
              activeRole={activeRole}
              onRoleChange={setActiveRole}
              accentColor="#C1622D"
              lightBg="bg-[#C1622D]/[0.08]"
              lightBorder="border-[#C1622D]/20"
            />
          )}

          {/* CARDS DE MÉTRICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Taxa de Ocupação"
              value={`${occupancyRate}%`}
              subtitle={`${occupiedBeds} de ${totalBeds} leitos ativos`}
              icon={<Activity className="w-5 h-5 text-[#C1622D]" />}
              trend={{ text: `${occupiedBeds} Leitos Ocupados`, isPositive: true }}
            />

            <KpiCard
              title="Leitos Vagos Imediatos"
              value={vacantBeds}
              subtitle="Prontos para Internação"
              icon={<Bed className="w-5 h-5 text-[#C1622D]" />}
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
              icon={<ShieldCheck className="w-5 h-5 text-[#C1622D]" />}
              trend={{ text: "Confronto SIGTAP OK", isPositive: true }}
            />
          </div>

          {/* SEÇÃO 1: MAPA VISUAL DE LEITOS */}
          {secaoAtiva === 'mapa' && (
            <div className="space-y-6">
              {/* Filtro por Ala */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['Todas', 'UTI Geral', 'Enfermaria Cirúrgica', 'Isolamento COVID/Infecto'].map((wing) => (
                  <button
                    key={wing}
                    onClick={() => setSelectedWing(wing)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px] cursor-pointer ${
                      selectedWing === wing
                        ? 'bg-[#C1622D] text-white shadow-xs'
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
                            ? 'border-[#C1622D] ring-2 ring-[#C1622D]/[0.12] shadow-md'
                            : 'border-[#E0E0E0] hover:border-[#C1622D]/30 shadow-xs'
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
                              <span className="text-[10px] text-[#C1622D] font-semibold block">{bed.currentPatient.doctor}</span>
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
                          <strong className="text-[#C1622D]">{selectedBed.currentPatient.doctor}</strong>
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
                        className="w-full py-2.5 px-3 rounded-xl bg-[#C1622D]/[0.08] text-[#C1622D] hover:bg-[#A8531F]/[0.12] font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-[#C1622D]/20 min-h-[44px] touch-manipulation cursor-pointer"
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

          {/* SEÇÃO 2: REGULAÇÃO NIR */}
          {secaoAtiva === 'regulacao' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#C1622D]/[0.08] border border-[#C1622D]/20 flex items-center justify-center text-[#C1622D]">
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
                            className="px-4 py-2 bg-[#C1622D] hover:bg-[#A8531F] text-white rounded-xl text-xs font-bold shadow-xs min-h-[44px] cursor-pointer"
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

          {/* SEÇÃO 3: HIGIENIZAÇÃO */}
          {secaoAtiva === 'higienizacao' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-3xl">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Giro de Leito &amp; Painel de Hotelaria Hospitalar
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Controle do tempo de turnaround entre a alta médica e a liberação física do leito higienizado.
                </p>

                <div className="p-4 bg-[#C1622D]/[0.08] border border-[#C1622D]/20 rounded-xl space-y-2 text-xs text-[#A8531F] mb-4">
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

          {/* SEÇÃO 4: INDICADORES TMP */}
          {secaoAtiva === 'indicadores' && (
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

          {/* SEÇÃO 5: EXPORTAR DESPESAS AO HUB 360 (CUSTO DE DIÁRIAS DO PACIENTE) */}
          {secaoAtiva === 'despesas_hub' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Exportação de Diárias e Hotelaria Hospitalar ao Hub Central
                  </h2>
                  <p className="text-xs text-slate-500">
                    Apuração e imputação direta do custo de permanência por leito, ala e prontuário no Custo Door-to-Door.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const jsonStr = JSON.stringify({
                        origem_modulo: 'LEITOS_CENSO_NIR',
                        cliente_id: 'HOSPITAL_360_MATRIZ',
                        data_extracao: new Date().toISOString(),
                        despesas: DESPESAS_LEITOS_SEED
                      }, null, 2);
                      const blob = new Blob([jsonStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `despesas_leitos_diarias_${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      triggerFeedback('Arquivo JSON de diárias exportado com sucesso no padrão do Hub.');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-[#E0E0E0] text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar JSON (Hub Contract)</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const payload = {
                          origem_modulo: 'LEITOS_CENSO_NIR',
                          cliente_id: 'HOSPITAL_360_MATRIZ',
                          lote_exportacao_id: `API-SYNC-LEI-${Date.now()}`,
                          data_geracao: new Date().toISOString(),
                          despesas: DESPESAS_LEITOS_SEED
                        };
                        const res = await fetch('/api/hub/despesas/ingestao', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                        });
                        const data = await res.json();
                        if (data.success) {
                          triggerFeedback(`Sucesso! Diárias de leito sincronizadas com o Hub (Protocolo ${data.protocolo}). Total: R$ ${data.valor_total.toFixed(2)}.`);
                        }
                      } catch (e) {
                        triggerFeedback('Erro ao sincronizar diárias com o Hub.');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#C1622D] hover:bg-[#A8531F] text-white shadow-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sincronizar com Hub 360</span>
                  </button>
                </div>
              </div>

              {/* Cards de Resumo de Diárias */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Custo de Diárias Faturadas no Mês</div>
                  <div className="text-2xl font-bold text-slate-900">R$ 138.450,00</div>
                  <div className="text-[11px] text-[#C1622D] font-semibold mt-1">11 Diárias em Lote Ativo</div>
                </div>
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Pacientes com Diárias Imputadas</div>
                  <div className="text-2xl font-bold text-[#C1622D]">4 Pacientes</div>
                  <div className="text-[11px] text-slate-500 mt-1">UTI Geral, Adulto e Enf. Cirúrgica</div>
                </div>
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Conexão com Hub 360</div>
                  <div className="text-2xl font-bold text-emerald-600">Ativa (REST/Event)</div>
                  <div className="text-[11px] text-slate-500 mt-1">Alimentando Custo Door-to-Door</div>
                </div>
              </div>

              {/* Tabela de Diárias Vinculadas aos Prontuários */}
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Diárias de Internação Apuradas para Imputação no Custo do Paciente</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/50">
                        <th className="p-3 font-bold">ID / Protocolo</th>
                        <th className="p-3 font-bold">Paciente / Episódio</th>
                        <th className="p-3 font-bold">Leito / Acomodação</th>
                        <th className="p-3 font-bold">Centro de Custo</th>
                        <th className="p-3 font-bold text-center">Diárias</th>
                        <th className="p-3 font-bold text-right">Valor Diária</th>
                        <th className="p-3 font-bold text-right">Total Imputado</th>
                        <th className="p-3 font-bold text-center">Status Hub</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {DESPESAS_LEITOS_SEED.map((dsp) => (
                        <tr key={dsp.id_transacao} className="hover:bg-[#A8531F]/20">
                          <td className="p-3 font-mono font-bold text-[#C1622D]">{dsp.id_transacao}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{dsp.paciente_nome}</div>
                            <div className="text-[11px] text-slate-500">CPF: {dsp.paciente_cpf} • {dsp.prontuario_episodio}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{dsp.leito_identificador}</div>
                            <div className="text-[11px] text-slate-500">{dsp.item_descricao}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C1622D]/[0.08] text-[#C1622D] border border-[#C1622D]/20">
                              {dsp.centro_custo}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">{dsp.quantidade}d</td>
                          <td className="p-3 text-right font-mono text-slate-700">R$ {dsp.valor_unitario_medio.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">R$ {dsp.valor_total_imputado.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Sincronizado Hub
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

          {/* SEÇÃO 6: PERFIS & MATRIZ RBAC */}
          {secaoAtiva === 'perfis' && (
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
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#C1622D]/[0.08] text-[#C1622D] border border-[#C1622D]/20">
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
