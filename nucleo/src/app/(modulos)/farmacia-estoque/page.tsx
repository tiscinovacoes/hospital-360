'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { KpiCard } from '@/components/KpiCard';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
import {
  Pill,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  BarChart3,
  RefreshCw,
  QrCode,
  DollarSign,
  FileText,
  Lock,
  UserCheck,
  Check,
  X,
  Info,
  Download,
  AlertCircle,
  Stethoscope,
  Plus,
  ShieldCheck,
  Menu,
  ChevronRight,
  FileSpreadsheet,
  Building2,
  Database
} from 'lucide-react';

type SecaoFarmacia =
  | 'dispensacao'
  | 'psicotropicos'
  | 'fracionamento'
  | 'interacoes'
  | 'devolucoes'
  | 'despesas_hub'
  | 'perfis';

interface PrescricaoDispensacao {
  id: string;
  paciente: string;
  prontuario: string;
  leito: string;
  medicoPrescritor: string;
  medicamentos: {
    item: string;
    dose: string;
    via: string;
    horario: string;
    status: 'SEPARADO' | 'PENDENTE' | 'DISPENSADO';
  }[];
  alertaAlergia?: string;
  prioridade: 'NORMAL' | 'URGENTE' | 'STAT';
}

const PRESCRICOES_MOCK: PrescricaoDispensacao[] = [
  {
    id: 'PRESC-2026-891',
    paciente: 'Maria Silva Santos',
    prontuario: 'PRONT-44910',
    leito: 'UTI Geral - Leito 04',
    medicoPrescritor: 'Dr. Lucas Tavares (CRM 177.892)',
    alertaAlergia: 'Alergia severa a Penicilinas (Cefalosporinas sob cautela)',
    prioridade: 'STAT',
    medicamentos: [
      { item: 'Meropenem 1g Injetável', dose: '1g EV a cada 8h', via: 'Endovenosa', horario: '22:00', status: 'PENDENTE' },
      { item: 'Fentanila 50mcg/ml 10ml', dose: '2ml/h BIC', via: 'Endovenosa contínua', horario: 'Contínuo', status: 'PENDENTE' },
      { item: 'Omeprazol 40mg Injetável', dose: '40mg EV 1x ao dia', via: 'Endovenosa', horario: '22:00', status: 'SEPARADO' }
    ]
  },
  {
    id: 'PRESC-2026-892',
    paciente: 'José Carlos de Almeida',
    prontuario: 'PRONT-31902',
    leito: 'Enfermaria Cirúrgica - Leito 12-B',
    medicoPrescritor: 'Dra. Camila Nogueira (CRM 188.420)',
    prioridade: 'NORMAL',
    medicamentos: [
      { item: 'Dipirona Sódica 500mg/ml', dose: '1 ampola EV se dor', via: 'Endovenosa', horario: 'Se necessário', status: 'SEPARADO' },
      { item: 'Enoxaparina Sódica 40mg', dose: '40mg SC 1x ao dia', via: 'Subcutânea', horario: '08:00', status: 'DISPENSADO' }
    ]
  }
];

interface ItemPortaria344 {
  id: string;
  nome: string;
  substancia: string;
  lista: 'A1 (Entorpecentes)' | 'A2 (Entorpecentes Perm.)' | 'B1 (Psicotrópicos)' | 'C1 (Outras Subst.)';
  saldoEscriturado: number;
  unidade: string;
  ultimoMovimento: string;
  responsavelAssinatura: string;
}

const ITENS_PORTARIA_344: ItemPortaria344[] = [
  {
    id: 'PSI-001',
    nome: 'Cloridrato de Fentanila 50mcg/ml 10ml',
    substancia: 'Fentanila',
    lista: 'A1 (Entorpecentes)',
    saldoEscriturado: 142,
    unidade: 'Ampolas',
    ultimoMovimento: '21/09/2026 20:15 (-2 amp. UTI Leito 04)',
    responsavelAssinatura: 'Dr. Thiago Medeiros (CRF 44.910)'
  },
  {
    id: 'PSI-002',
    nome: 'Morfina Sulfato 10mg/ml 1ml',
    substancia: 'Morfina',
    lista: 'A1 (Entorpecentes)',
    saldoEscriturado: 86,
    unidade: 'Ampolas',
    ultimoMovimento: '21/09/2026 17:30 (-1 amp. Centro Cirúrgico)',
    responsavelAssinatura: 'Dr. Thiago Medeiros (CRF 44.910)'
  },
  {
    id: 'PSI-003',
    nome: 'Midazolam 15mg/3ml',
    substancia: 'Midazolam',
    lista: 'B1 (Psicotrópicos)',
    saldoEscriturado: 310,
    unidade: 'Ampolas',
    ultimoMovimento: '21/09/2026 19:40 (-4 amp. Bloco Operatório)',
    responsavelAssinatura: 'Dra. Paula Guimarães (CRF 51.204)'
  }
];

const DESPESAS_FARMACIA_SEED = [
  {
    id_transacao: 'DSP-FAR-001',
    paciente_cpf: '234.567.890-11',
    paciente_nome: 'Maria Silva Santos',
    prontuario_episodio: 'PRONT-44910',
    centro_custo: 'UTI_GERAL',
    leito_identificador: 'Leito 04 UTI',
    item_codigo: 'MED-FAR-01',
    item_descricao: 'Meropenem 1g Injetável Frasco-Ampola',
    lote_fabricante: 'LT-FAR-2026-MERO-08',
    quantidade: 6,
    unidade_medida: 'Frasco-Ampola',
    valor_unitario_medio: 48.50,
    valor_total_imputado: 291.00,
    data_consumo: '2026-09-22 10:45:00'
  },
  {
    id_transacao: 'DSP-FAR-002',
    paciente_cpf: '234.567.890-11',
    paciente_nome: 'Maria Silva Santos',
    prontuario_episodio: 'PRONT-44910',
    centro_custo: 'UTI_GERAL',
    leito_identificador: 'Leito 04 UTI',
    item_codigo: 'PSI-001',
    item_descricao: 'Cloridrato de Fentanila 50mcg/ml 10ml',
    lote_fabricante: 'LT-FAR-2026-FENT-03',
    quantidade: 2,
    unidade_medida: 'Ampola',
    valor_unitario_medio: 18.20,
    valor_total_imputado: 36.40,
    data_consumo: '2026-09-22 11:20:00'
  },
  {
    id_transacao: 'DSP-FAR-003',
    paciente_cpf: '123.456.789-00',
    paciente_nome: 'Carlos Eduardo Silveira',
    prontuario_episodio: 'EPIS-2026-8841',
    centro_custo: 'UTI_ADULTO',
    leito_identificador: 'Leito 204 UTI',
    item_codigo: 'MED-002',
    item_descricao: 'Noradrenalina 2mg/mL Ampola 4mL',
    lote_fabricante: 'LT-2026-NORA-04',
    quantidade: 10,
    unidade_medida: 'Ampola',
    valor_unitario_medio: 12.80,
    valor_total_imputado: 128.00,
    data_consumo: '2026-09-22 11:15:00'
  },
  {
    id_transacao: 'DSP-FAR-004',
    paciente_cpf: '345.678.901-22',
    paciente_nome: 'José Carlos de Almeida',
    prontuario_episodio: 'PRONT-31902',
    centro_custo: 'ENFERMARIA_CIRURGICA',
    leito_identificador: 'Leito 12-B',
    item_codigo: 'MED-FAR-04',
    item_descricao: 'Enoxaparina Sódica 40mg/0.4mL Seringa',
    lote_fabricante: 'LT-FAR-2026-ENOX-09',
    quantidade: 1,
    unidade_medida: 'Seringa Pré-enchida',
    valor_unitario_medio: 34.00,
    valor_total_imputado: 34.00,
    data_consumo: '2026-09-22 08:00:00'
  }
];

export default function VigiaFarmaciaEstoquePage() {
  const roles = MODULO_ROLES_CATALOG['farmacia-estoque'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoFarmacia>('dispensacao');
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [prescricoes, setPrescricoes] = useState<PrescricaoDispensacao[]>(PRESCRICOES_MOCK);
  const [notificacao, setNotificacao] = useState<string | null>(null);
  const [farmaciaSelecionada, setFarmaciaSelecionada] = useState('Central - Bloco A');

  const triggerNotificacao = (msg: string) => {
    setNotificacao(msg);
    setTimeout(() => setNotificacao(null), 4000);
  };

  const handleDispensarPrescricao = (prescId: string) => {
    if (!hasPermission(activeRole, 'APPROVE')) {
      triggerNotificacao('Atenção: Apenas Farmacêutico RT ou Clínico pode validar e liberar a dispensação.');
      return;
    }

    setPrescricoes(prev =>
      prev.map(p => {
        if (p.id === prescId) {
          return {
            ...p,
            medicamentos: p.medicamentos.map(m => ({ ...m, status: 'DISPENSADO' as const }))
          };
        }
        return p;
      })
    );
    triggerNotificacao(`Prescrição ${prescId} validada com sucesso! Kit beira-leito liberado com rastreabilidade.`);
  };

  const menuItens = [
    {
      id: 'dispensacao',
      label: 'Dispensação Beira-Leito',
      icon: Pill,
      badge: '5 Certos',
      badgeCor: 'bg-[#0E5C4C] text-white shadow-xs'
    },
    {
      id: 'psicotropicos',
      label: 'Livro Psicotrópicos (Portaria 344)',
      icon: ShieldAlert,
      badge: 'SNGPC',
      badgeCor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'fracionamento',
      label: 'Fracionamento & Unitização',
      icon: Package,
      badge: 'DataMatrix',
      badgeCor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'interacoes',
      label: 'Interações & Farmacovigilância',
      icon: AlertTriangle,
      badge: 'Alerta QT',
      badgeCor: 'bg-amber-100 text-amber-800 font-bold'
    },
    {
      id: 'devolucoes',
      label: 'Devoluções & Quarentena',
      icon: RefreshCw,
      badge: null,
      badgeCor: ''
    },
    {
      id: 'despesas_hub',
      label: 'Exportar Despesas ao Hub',
      icon: FileSpreadsheet,
      badge: 'Hub 360',
      badgeCor: 'bg-[#0E5C4C]/[0.12] text-[#0E5C4C] border border-[#0E5C4C]/20'
    },
    {
      id: 'perfis',
      label: 'Perfis & Matriz RBAC',
      icon: Lock,
      badge: 'CRF',
      badgeCor: 'bg-slate-100 text-slate-700'
    }
  ];

  return (
    <>
      <PageHeader
        activeTitle="Farmácia Hospitalar & Satélites Clínicos"
        activeSubtitle="Dispensação beira-leito, dose unitária com DataMatrix, rastreabilidade e livro Portaria 344/98"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
              title={sidebarAberta ? 'Recolher menu da farmácia' : 'Expandir menu da farmácia'}
            >
              {sidebarAberta ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-[#0E5C4C]" />
              <span>Unidade:</span>
              <select
                value={farmaciaSelecionada}
                onChange={(e) => setFarmaciaSelecionada(e.target.value)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="Central - Bloco A">Farmácia Central (Bloco A)</option>
                <option value="Satélite UTI Adulto">Satélite UTI Adulto (2º Andar)</option>
                <option value="Satélite Centro Cirúrgico">Satélite Centro Cirúrgico (3º Andar)</option>
                <option value="Satélite Pronto-Socorro">Satélite Pronto-Socorro (Térreo)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setSecaoAtiva('despesas_hub')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Despesas Hub</span>
            </button>

            <button
              type="button"
              onClick={() => triggerNotificacao('Leitor de Código de Barras DataMatrix conectado e pronto para bipagem.')}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white text-xs font-bold shadow-xs transition-colors touch-manipulation cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Bipar Dose</span>
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
      {/* CORPO PRINCIPAL COM SIDEBAR EXCLUSIVA DO PRODUTO FARMÁCIA */}
      {/* ========================================================================= */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Menu Lateral Colorido com a Cor do Módulo (Verde Esmeralda Clínico) */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-30
            ${sidebarAberta ? 'translate-x-0 w-72 lg:w-64 shadow-xl lg:shadow-none' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:hidden'}
            shrink-0 bg-[#0E5C4C]/[0.06] border-r border-[#0E5C4C]/20 flex flex-col justify-between transition-all duration-200 ease-in-out
          `}
        >
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-bold text-[#0E5C4C] uppercase tracking-wider">
              Menu Farmácia &amp; Dispensação
            </div>
            {menuItens.map((item) => {
              const Icone = item.icon;
              const ativo = secaoAtiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSecaoAtiva(item.id as SecaoFarmacia);
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
                        ativo ? 'text-white' : 'text-[#0E5C4C] group-hover:text-[#0E5C4C]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ml-1 font-semibold ${
                        item.badgeCor || (ativo ? 'bg-white/20 text-white' : 'bg-[#0E5C4C]/[0.12] text-[#0E5C4C]')
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
          <div className="p-3 border-t border-[#0E5C4C]/80 bg-white/70">
            <Link
              href="/"
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0E5C4C] hover:bg-[#0A4A3D]/60 transition-all border border-[#0E5C4C]/70"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-3.5 h-3.5 text-[#0E5C4C]" />
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
          {/* Toast Notification */}
          {notificacao && (
            <div className="p-3.5 bg-[#0E5C4C]/[0.08] border border-[#0E5C4C]/30 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0E5C4C]">
                <Info className="w-4 h-4 text-[#0E5C4C] shrink-0" />
                <span>{notificacao}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setNotificacao(null)}
                className="text-[#0E5C4C] hover:text-[#0E5C4C] p-1 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PERFIS & MATRIZ RBAC — só aparece na seção "Perfis" do menu lateral, não em todas as telas */}
          {secaoAtiva === 'perfis' && (
            <ModuloRbacBar
              moduloId="farmacia-estoque"
              activeRole={activeRole}
              onRoleChange={setActiveRole}
              accentColor="#0E5C4C"
              lightBg="bg-[#0E5C4C]/[0.08]"
              lightBorder="border-[#0E5C4C]/20"
            />
          )}

          {/* KPIS GLOBAIS DA FARMÁCIA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Prescrições do Dia"
              value="482"
              subtitle="Atendidas beira-leito"
              icon={<Pill className="w-5 h-5 text-[#0E5C4C]" />}
              trend={{ text: "100% Aprazadas", isPositive: true }}
            />
            <KpiCard
              title="Controle Portaria 344"
              value="538 ampolas"
              subtitle="Saldo A1/A2/B1 conferido"
              icon={<ShieldCheck className="w-5 h-5 text-[#0E5C4C]" />}
              trend={{ text: "Livro SNGPC Fechado", isPositive: true }}
            />
            <KpiCard
              title="Doses Unitizadas"
              value="1.820"
              subtitle="Etiquetadas com DataMatrix"
              icon={<Package className="w-5 h-5 text-[#0E5C4C]" />}
              trend={{ text: "Zero erro de rotulagem", isPositive: true }}
            />
            <KpiCard
              title="Alertas de Interação"
              value="3 bloqueios"
              subtitle="Intervenção farmacêutica"
              icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
              trend={{ text: "Evitou evento adverso", isPositive: true }}
            />
          </div>

          {/* SEÇÃO 1: DISPENSAÇÃO BEIRA-LEITO */}
          {secaoAtiva === 'dispensacao' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Fila de Prescrições Hospitalares para Separação e Dispensação
                    </h3>
                    <p className="text-xs text-slate-500">
                      Conferência dos 5 certos: Paciente Certo, Medicamento Certo, Via Certa, Dose Certa e Horário Certo.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {prescricoes.map(p => (
                    <div key={p.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white hover:border-[#0E5C4C]/30 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">{p.id}</span>
                            <span className="font-bold text-slate-900">{p.paciente}</span>
                            <span className="text-xs text-slate-500">({p.prontuario})</span>
                            {p.prioridade === 'STAT' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                PRIORIDADE STAT (IMEDIATA)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#0E5C4C] font-semibold mt-0.5">
                            {p.leito} • Prescrito por: {p.medicoPrescritor}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDispensarPrescricao(p.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white transition-colors min-h-[44px] touch-manipulation cursor-pointer"
                        >
                          Liberar Kit de Medicamentos
                        </button>
                      </div>

                      {p.alertaAlergia && (
                        <div className="my-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{p.alertaAlergia}</span>
                        </div>
                      )}

                      <div className="mt-3 space-y-2">
                        <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                          Itens Prescritos para Aprazamento:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {p.medicamentos.map((m, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                              <div className="font-bold text-slate-900">{m.item}</div>
                              <div className="text-slate-600 text-[11px]">{m.dose} • {m.via}</div>
                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200 text-[10px]">
                                <span className="text-slate-500">Horário: {m.horario}</span>
                                <span className={`font-bold px-1.5 py-0.5 rounded ${
                                  m.status === 'DISPENSADO'
                                    ? 'bg-[#0E5C4C]/[0.12] text-[#0E5C4C]'
                                    : m.status === 'SEPARADO'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {m.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 2: LIVRO DE PSICOTRÓPICOS */}
          {secaoAtiva === 'psicotropicos' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0E5C4C]/[0.08] border border-[#0E5C4C]/20 flex items-center justify-center text-[#0E5C4C]">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Livro Registro de Psicotrópicos e Entorpecentes (Portaria SVS/MS 344/98)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Escrituração eletrônica imutável conectada ao SNGPC / ANVISA e termo de guarda em cofre.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {ITENS_PORTARIA_344.map(item => (
                    <div key={item.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{item.nome}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                            {item.lista}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Última movimentação: <strong>{item.ultimoMovimento}</strong>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Responsável Técnico: {item.responsavelAssinatura}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Saldo em Cofre:</span>
                        <strong className="text-lg font-black text-slate-900">{item.saldoEscriturado} {item.unidade}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                  <button
                    type="button"
                    disabled={!hasPermission(activeRole, 'EXPORT')}
                    onClick={() => triggerNotificacao('Balanço Trimestral BSPO (Portaria 344) emitido para envio à Vigilância Sanitária.')}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E0E0E0] text-slate-700 hover:bg-slate-50 min-h-[44px] cursor-pointer"
                  >
                    Gerar Relatório Trimestral BSPO (ANVISA)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 3: FRACIONAMENTO & DOSE UNITÁRIA */}
          {secaoAtiva === 'fracionamento' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-3xl">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Central de Fracionamento &amp; Unitização de Doses
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Cada comprimido ou ampola recebe código DataMatrix individual com validade redefinida conforme RDC 67/2007.
                </p>

                <div className="p-4 bg-[#0E5C4C]/50 border border-[#0E5C4C]/20 rounded-xl space-y-2 text-xs text-[#0E5C4C] mb-4">
                  <strong>Garantia de Rastreabilidade Total:</strong>
                  <p>
                    A dose unitária impede trocas no momento da administração, garante que medicamentos fracionados não fiquem expostos a umidade e identifica exatamente qual lote foi consumido por qual leito.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Medicamento para Unitização
                    </label>
                    <input
                      type="text"
                      defaultValue="Omeprazol 20mg Cápsula (Caixa c/ 500 comprimidos)"
                      className="w-full text-xs p-2.5 border border-[#E0E0E0] rounded-xl focus:border-[#0E5C4C] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Quantidade Fracionada</label>
                      <input
                        type="number"
                        defaultValue={500}
                        className="w-full text-xs p-2.5 border border-[#E0E0E0] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Validade Pós-Fracionamento</label>
                      <input
                        type="text"
                        defaultValue="180 dias (21/03/2027)"
                        className="w-full text-xs p-2.5 border border-[#E0E0E0] rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={!hasPermission(activeRole, 'CREATE')}
                      onClick={() => triggerNotificacao('Etiquetas DataMatrix geradas e enviadas para impressora térmica de dose unitária.')}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white min-h-[44px] cursor-pointer"
                    >
                      Imprimir 500 Etiquetas DataMatrix
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 4: INTERAÇÕES MEDICAMENTOSAS */}
          {secaoAtiva === 'interacoes' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-3xl">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Motor de Farmacovigilância &amp; Anti-Interação Medicamentosa
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Inteligência clínica cruzando prescrições ativas com a base Micromedex / UpToDate.
                </p>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm">Interação Grave Detectada:</strong>
                    <p className="mt-0.5">
                      Associação de <strong>Ciprofloxacino</strong> + <strong>Amiodarona</strong> no leito 08 (UTI). 
                      Risco de prolongamento do intervalo QT e arritmia ventricular grave.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => triggerNotificacao('Intervenção Farmacêutica enviada diretamente ao prontuário do médico assistente.')}
                        className="px-3 py-1.5 bg-[#0E5C4C] text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Emitir Alerta ao Médico Prescritor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 5: DEVOLUÇÕES & SOBRAS */}
          {secaoAtiva === 'devolucoes' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-3xl">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Recebimento de Devoluções de Enfermagem
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Medicamentos devolvidos após alta, óbito ou alteração posológica com checagem de integridade de lacre.
                </p>

                <div className="p-4 border border-[#E0E0E0] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 block">Enoxaparina 40mg (2 ampolas)</strong>
                    <span className="text-slate-500">Devolvido de: Leito 12-B • Motivo: Suspensão pré-cirúrgica</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerNotificacao('Lacre validado. Medicamento reintegrado com segurança ao estoque da farmácia.')}
                    className="px-3 py-2 bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border border-[#0E5C4C]/20 rounded-xl font-bold cursor-pointer"
                  >
                    Reintegrar ao Estoque
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO 6: EXPORTAR DESPESAS AO HUB 360 (CUSTO DO PACIENTE) */}
          {secaoAtiva === 'despesas_hub' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Exportação de Despesas de Medicamentos ao Hub Central
                  </h2>
                  <p className="text-xs text-slate-500">
                    Alimentação direta da matriz de Custo Door-to-Door por paciente, prescrição e leito.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const jsonStr = JSON.stringify({
                        origem_modulo: 'FARMACIA_HOSPITALAR',
                        cliente_id: 'HOSPITAL_360_MATRIZ',
                        data_extracao: new Date().toISOString(),
                        despesas: DESPESAS_FARMACIA_SEED
                      }, null, 2);
                      const blob = new Blob([jsonStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `despesas_farmacia_${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      triggerNotificacao('Arquivo JSON de despesas exportado com sucesso no padrão do Hub.');
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
                          origem_modulo: 'FARMACIA_HOSPITALAR',
                          cliente_id: 'HOSPITAL_360_MATRIZ',
                          lote_exportacao_id: `API-SYNC-FAR-${Date.now()}`,
                          data_geracao: new Date().toISOString(),
                          despesas: DESPESAS_FARMACIA_SEED
                        };
                        const res = await fetch('/api/hub/despesas/ingestao', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload)
                        });
                        const data = await res.json();
                        if (data.success) {
                          triggerNotificacao(`Sucesso! Despesas da Farmácia sincronizadas com o Hub (Protocolo ${data.protocolo}). Total: R$ ${data.valor_total.toFixed(2)}.`);
                        }
                      } catch (e) {
                        triggerNotificacao('Erro ao sincronizar despesas com o Hub.');
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white shadow-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sincronizar com Hub 360</span>
                  </button>
                </div>
              </div>

              {/* Cards de Resumo de Custos Farmacêuticos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Medicamentos Dispensados no Mês</div>
                  <div className="text-2xl font-bold text-slate-900">R$ 84.320,00</div>
                  <div className="text-[11px] text-[#0E5C4C] font-semibold mt-1">4 Prescrições em Lote Ativo</div>
                </div>
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Doses Unitizadas Imputadas</div>
                  <div className="text-2xl font-bold text-[#0E5C4C]">19 Doses / Kits</div>
                  <div className="text-[11px] text-slate-500 mt-1">Vinculadas a CPF e Leito</div>
                </div>
                <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-bold text-slate-500 mb-1">Conexão com Hub 360</div>
                  <div className="text-2xl font-bold text-[#0E5C4C]">Ativa (REST/Event)</div>
                  <div className="text-[11px] text-slate-500 mt-1">Alimentando Custo Door-to-Door</div>
                </div>
              </div>

              {/* Tabela de Itens Dispensados vinculados aos Pacientes */}
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Medicamentos Dispensados Beira-Leito para Imputação de Custo</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/50">
                        <th className="p-3 font-bold">ID / Protocolo</th>
                        <th className="p-3 font-bold">Paciente / Episódio</th>
                        <th className="p-3 font-bold">Medicamento / Lote</th>
                        <th className="p-3 font-bold">Leito / Centro Custo</th>
                        <th className="p-3 font-bold text-center">Qtd</th>
                        <th className="p-3 font-bold text-right">Valor Unitário</th>
                        <th className="p-3 font-bold text-right">Total Imputado</th>
                        <th className="p-3 font-bold text-center">Status Hub</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {DESPESAS_FARMACIA_SEED.map((dsp) => (
                        <tr key={dsp.id_transacao} className="hover:bg-[#0A4A3D]/20">
                          <td className="p-3 font-mono font-bold text-[#0E5C4C]">{dsp.id_transacao}</td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{dsp.paciente_nome}</div>
                            <div className="text-[11px] text-slate-500">CPF: {dsp.paciente_cpf} • {dsp.prontuario_episodio}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{dsp.item_descricao}</div>
                            <div className="text-[11px] text-slate-500 font-mono">Lote: {dsp.lote_fabricante}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border border-[#0E5C4C]/20">
                              {dsp.leito_identificador}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">{dsp.quantidade}</td>
                          <td className="p-3 text-right font-mono text-slate-700">R$ {dsp.valor_unitario_medio.toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">R$ {dsp.valor_total_imputado.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border border-[#0E5C4C]/20">
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

          {/* SEÇÃO 7: PERFIS & MATRIZ RBAC */}
          {secaoAtiva === 'perfis' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Perfis de Acesso do Módulo Farmácia Hospitalar
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Responsabilidade sanitária, controle de psicotrópicos e triagem beira-leito.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.map(role => (
                    <div key={role.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0E5C4C]/[0.08] text-[#0E5C4C] border border-[#0E5C4C]/20">
                          {role.level}
                        </span>
                        {role.id === activeRole.id && (
                          <span className="text-[10px] font-bold text-[#0E5C4C] bg-[#0E5C4C]/[0.08] px-2 py-0.5 rounded-md border border-[#0E5C4C]/20">
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
