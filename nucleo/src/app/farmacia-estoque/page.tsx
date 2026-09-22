'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import { ModuloRbacBar } from '../../components/ModuloRbacBar';
import { KpiCard } from '../../components/KpiCard';
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
  ShieldCheck
} from 'lucide-react';

type AbaFarmacia =
  | 'dispensacao'
  | 'psicotropicos'
  | 'fracionamento'
  | 'interacoes'
  | 'devolucoes'
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

export default function VigiaFarmaciaEstoquePage() {
  const roles = MODULO_ROLES_CATALOG['farmacia-estoque'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [abaAtiva, setAbaAtiva] = useState<AbaFarmacia>('dispensacao');
  const [prescricoes, setPrescricoes] = useState<PrescricaoDispensacao[]>(PRESCRICOES_MOCK);
  const [notificacao, setNotificacao] = useState<string | null>(null);

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

  return (
    <VigiaSidebarLayout
      moduloId="farmacia-estoque"
      activeTitle="Farmácia Hospitalar & Estoque Clínico"
      activeSubtitle="Dispensação beira-leito, dose unitária com DataMatrix e livro de psicotrópicos (Portaria 344)"
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
            onClick={() => triggerNotificacao('Leitor de Código de Barras DataMatrix conectado e pronto para bipagem.')}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-[#0E9F6E] hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors touch-manipulation"
          >
            <QrCode className="w-4 h-4" />
            <span>Bipar Dose Unitária</span>
          </button>
        </div>
      }
    >
      {/* Toast Notification */}
      {notificacao && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notificacao}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotificacao(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BARRA DE RBAC & CONTROLE DE PERFIS DO MÓDULO */}
      <ModuloRbacBar
        moduloId="farmacia-estoque"
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        accentColor="#0E9F6E"
        lightBg="bg-emerald-50"
        lightBorder="border-emerald-200"
      />

      {/* KPIS GLOBAIS DA FARMÁCIA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Prescrições do Dia"
          value="482"
          subtitle="Atendidas beira-leito"
          icon={<Pill className="w-5 h-5 text-emerald-600" />}
          trend={{ text: "100% Aprazadas", isPositive: true }}
        />
        <KpiCard
          title="Controle Portaria 344"
          value="538 ampolas"
          subtitle="Saldo A1/A2/B1 conferido"
          icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
          trend={{ text: "Livro SNGPC Fechado", isPositive: true }}
        />
        <KpiCard
          title="Doses Unitizadas"
          value="1.820"
          subtitle="Etiquetadas com DataMatrix"
          icon={<Package className="w-5 h-5 text-emerald-600" />}
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

      {/* SUB-NAVEGAÇÃO POR ABAS */}
      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-1.5 mb-6 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'dispensacao', label: '1. Dispensação Beira-Leito', icon: Pill },
          { id: 'psicotropicos', label: '2. Livro Psicotrópicos (Portaria 344)', icon: ShieldAlert },
          { id: 'fracionamento', label: '3. Fracionamento & Dose Unitária', icon: Package },
          { id: 'interacoes', label: '4. Interações & Farmacovigilância', icon: AlertTriangle },
          { id: 'devolucoes', label: '5. Devoluções & Sobras', icon: RefreshCw },
          { id: 'perfis', label: '6. Perfis & Matriz RBAC', icon: Lock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = abaAtiva === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAbaAtiva(tab.id as AbaFarmacia)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px] touch-manipulation ${
                isActive
                  ? 'bg-[#0E9F6E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ABA 1: DISPENSAÇÃO BEIRA-LEITO */}
      {abaAtiva === 'dispensacao' && (
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
                <div key={p.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white hover:border-emerald-300 transition-all">
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
                      <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                        {p.leito} • Prescrito por: {p.medicoPrescritor}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDispensarPrescricao(p.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0E9F6E] hover:bg-emerald-700 text-white transition-colors min-h-[44px] touch-manipulation"
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
                                ? 'bg-emerald-100 text-emerald-800'
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

      {/* ABA 2: LIVRO DE PSICOTRÓPICOS */}
      {abaAtiva === 'psicotropicos' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
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
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E0E0E0] text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                Gerar Relatório Trimestral BSPO (ANVISA)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: FRACIONAMENTO & DOSE UNITÁRIA */}
      {abaAtiva === 'fracionamento' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Central de Fracionamento & Unitização de Doses
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Cada comprimido ou ampola recebe código DataMatrix individual com validade redefinida conforme RDC 67/2007.
            </p>

            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900 mb-4">
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
                  className="w-full text-xs p-2.5 border border-[#E0E0E0] rounded-xl focus:border-emerald-500 focus:outline-none"
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
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0E9F6E] hover:bg-emerald-700 text-white min-h-[44px]"
                >
                  Imprimir 500 Etiquetas DataMatrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: INTERAÇÕES MEDICAMENTOSAS */}
      {abaAtiva === 'interacoes' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Motor de Farmacovigilância & Anti-Interação Medicamentosa
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
                    className="px-3 py-1.5 bg-[#0E9F6E] text-white rounded-lg font-bold text-xs"
                  >
                    Emitir Alerta ao Médico Prescritor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: DEVOLUÇÕES & SOBRAS */}
      {abaAtiva === 'devolucoes' && (
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
                className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold"
              >
                Reintegrar ao Estoque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 6: PERFIS & MATRIZ RBAC */}
      {abaAtiva === 'perfis' && (
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
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
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
    </VigiaSidebarLayout>
  );
}
