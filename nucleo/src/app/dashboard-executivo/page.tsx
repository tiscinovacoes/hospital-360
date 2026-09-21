'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import { KpiCard } from '../../components/KpiCard';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ArrowLeft,
  Bell,
  Sparkles,
  DollarSign,
  Calendar,
  Building2,
  Package,
  Video,
  CheckCircle2,
  Stethoscope,
  Users,
  Percent,
  Sliders,
  X,
  Send,
  Zap,
  ShieldCheck,
  Activity,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function ExecutiveDashboardPage() {
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Laudo Crítico no LIS', desc: 'Troponina I da paciente Ana Carolina concluída.', unread: true, time: 'Há 4 min' },
    { id: '2', title: 'Recurso de Glosa Aprovado', desc: 'IA de auditoria reverteu R$ 1.850,00 da Unimed.', unread: true, time: 'Há 18 min' },
    { id: '3', title: 'Leito 103 Higienizado', desc: 'Equipe de Facilities liberou o leito no censo.', unread: false, time: 'Há 35 min' },
    { id: '4', title: 'Split D+1 Liquidado', desc: 'Repasse financeiro transferido para a CardioVida.', unread: false, time: 'Hoje 06:00' },
  ]);

  const [showSimModal, setShowSimModal] = useState(false);
  const [showTelemedModal, setShowTelemedModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados do Simulador C-Level
  const [extraBeds, setExtraBeds] = useState(2);
  const [occupancyAssumption, setOccupancyAssumption] = useState(85);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    showToast('Notificação arquivada.');
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Cálculos do Simulador
  const dailyRatePerBed = 1200; // R$ 1.200/dia
  const monthlyRevenuePerBed = dailyRatePerBed * 30 * (occupancyAssumption / 100);
  const totalExtraRevenue = monthlyRevenuePerBed * extraBeds;
  const hubMargin = totalExtraRevenue * 0.22;

  return (
    <VigiaSidebarLayout
      activeTitle="Custo do Paciente (Core Door-to-Door)"
      activeSubtitle="Junção e consolidação unificada de todos os módulos assistenciais, suprimentos e escalas"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSimModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulador de Leitos</span>
          </button>
        </div>
      }
    >
      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-400 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. BANNER MINIMALISTA: O CUSTO DO PACIENTE COMO O GRANDE CONSOLIDADOR */}
      <div className="bg-white rounded-2xl border border-blue-200/80 p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#1A56DB] border border-blue-200 px-2 py-0.5 rounded-md">
              MÓDULO UNIFICADOR CENTRAL
            </span>
            <span className="text-xs font-bold text-slate-400">Apuração Real vs SIGTAP (SUS) & TUSS</span>
          </div>
          <h2 className="text-base font-extrabold text-slate-900 mt-1.5">
            Consolidação Automática da Jornada Hospitalar Ponta a Ponta
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Este módulo integra e consolida os custos de todas as frentes: prescrições do <strong>OpenEMR</strong>, dispensações do <strong>Estoque FEFO</strong>, exames do <strong>LIMS Senaite</strong>, diárias de <strong>Leitos</strong>, compras nas <strong>Atas ARP</strong> e plantões da <strong>Escala Médica</strong>. Também recebe importações via CSV de outros sistemas hospitalares legados.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/ingestao-modulos"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Importar CSV Legado</span>
          </Link>
        </div>
      </div>

      {/* 2. OS 4 CARDS DE KPIS MINIMALISTAS (Máximo 3 linhas + Tooltip informativo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Faturamento Bruto Hub"
          value="R$ 384.200"
          subtitle="Receita Consolidada"
          icon={DollarSign}
          tooltipInfo="Volume total faturado no mês corrente agregando consultas ambulatoriais, internações cirúrgicas, SADT e repasses com o desconto de split da fintech."
          trend={{ text: "+16,8% vs mês anterior", isPositive: true }}
        />

        <KpiCard
          title="Taxa de Ocupação Geral"
          value="83,3%"
          subtitle="10 de 12 Leitos Ocupados"
          icon={Building2}
          tooltipInfo="Índice de aproveitamento dos leitos operacionais das enfermarias e UTI. Calculado diariamente às 00h pelo censo hospitalar automatizado."
          trend={{ text: "Giro Médio: 38 min", isPositive: true }}
        />

        <KpiCard
          title="Confronto SIGTAP (SUS)"
          value="R$ 1.840,50"
          subtitle="Custo Médio Paciente"
          icon={Activity}
          tooltipInfo="Custo real médio apurado por episódio clínico pelo método de absorção e ABC, confrontado com a tabela oficial de ressarcimento do SUS (SIGTAP)."
          trend={{ text: "-8,2% abaixo do teto SUS", isPositive: true }}
        />

        <KpiCard
          title="Economia Atas & FEFO"
          value="R$ 48.950"
          subtitle="Prevenção de Perdas"
          icon={TrendingUp}
          tooltipInfo="Economia gerada pela trava de sobrepreço nas Atas de Registro de Preços (ARP Lei 14.133) somada à eliminação de descartes por validade com o FEFO estrito."
          trend={{ text: "Zero Perdas por Vencimento", isPositive: true }}
        />
      </div>

      {/* 3. GRID PRINCIPAL: JORNADA 5 ESTAÇÕES DOOR-TO-DOOR & FEED DE AUDITORIA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Coluna Esquerda: As 5 Estações de Custo Door-to-Door (8 colunas) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  As 5 Estações de Custeio Door-to-Door
                </h3>
                <p className="text-xs text-slate-400">
                  Rastreabilidade integral da admissão à alta com confronto SIGTAP / TUSS
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Modelo Absorção + ABC
              </span>
            </div>

            {/* As 5 Estações em Cards Minimalistas */}
            <div className="space-y-3">
              {[
                {
                  num: '01',
                  nome: 'Recepção & Triagem Manchester',
                  modulo: 'Acolhimento & Cadastro CNS',
                  custo: 'R$ 42,80',
                  sigtapRef: 'R$ 50,00 (Tabela SUS)',
                  status: 'Dentro do Teto',
                  statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
                },
                {
                  num: '02',
                  nome: 'Consultório & Clínica Médica',
                  modulo: 'OpenEMR • Anamnese & Prescrição',
                  custo: 'R$ 180,00',
                  sigtapRef: 'R$ 210,00 (TUSS Especialidade)',
                  status: 'Margem Positiva',
                  statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
                },
                {
                  num: '03',
                  nome: 'Laboratório & Diagnóstico',
                  modulo: 'LIMS Senaite • Troponina I & Hemograma',
                  custo: 'R$ 94,50',
                  sigtapRef: 'R$ 125,00 (Exame Automatizado)',
                  status: 'Otimizado',
                  statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
                },
                {
                  num: '04',
                  nome: 'Farmácia Satélite & Insumos',
                  modulo: 'OpenBoxes • Dispensação FEFO Lote',
                  custo: 'R$ 310,20',
                  sigtapRef: 'R$ 420,00 (Teto CMED Oficial)',
                  status: 'Economia FEFO 26%',
                  statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
                },
                {
                  num: '05',
                  nome: 'Diária de Internação & Leito',
                  modulo: 'Censo • Quarto 204 com Facilities',
                  custo: 'R$ 1.213,00',
                  sigtapRef: 'R$ 1.200,00 (Diária SUS c/ AIH)',
                  status: 'Alerta Leve (+1%)',
                  statusColor: 'text-amber-700 bg-amber-50 border-amber-200'
                }
              ].map(estacao => (
                <div
                  key={estacao.num}
                  className="p-3.5 rounded-xl border border-slate-200/90 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-100/80 text-[#1A56DB] font-black text-xs flex items-center justify-center flex-shrink-0">
                      {estacao.num}
                    </span>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">{estacao.nome}</strong>
                      <span className="text-[11px] text-slate-500">{estacao.modulo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{estacao.custo}</span>
                      <span className="text-[10px] text-slate-400 block">{estacao.sigtapRef}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${estacao.statusColor}`}>
                      {estacao.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabela de Episódios Clínicos em Apuração */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Pacientes em Jornada Ativa (Amostragem C-Level)
                </h3>
                <p className="text-xs text-slate-400">
                  Episódios alimentados automaticamente pelos módulos do hospital
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3">Paciente / CPF</th>
                    <th className="pb-3">Clínica / Procedimento</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Custo Apurado</th>
                    <th className="pb-3 text-right">Teto SUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { nome: 'Ana Carolina Souza', cpf: '044.***.***-27', clinica: 'Cardiologia • Angioplastia', status: 'Em Leito UTI', custo: 'R$ 2.450,00', teto: 'R$ 2.800,00' },
                    { nome: 'Benedita Almeida Rocha', cpf: '032.***.***-41', clinica: 'Ortopedia • Artroscopia', status: 'Em Recuperação', custo: 'R$ 1.820,00', teto: 'R$ 1.950,00' },
                    { nome: 'Sandra Regina Castro', cpf: '087.***.***-90', clinica: 'Trauma • Drenagem de Tórax', status: 'Dispensação FEFO', custo: 'R$ 890,00', teto: 'R$ 1.100,00' }
                  ].map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3">
                        <strong className="text-slate-900 block">{p.nome}</strong>
                        <span className="text-slate-400 text-[10px]">{p.cpf}</span>
                      </td>
                      <td className="py-3 text-slate-700">{p.clinica}</td>
                      <td className="py-3">
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900">{p.custo}</td>
                      <td className="py-3 text-right font-mono text-slate-500">{p.teto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Auditoria & Alertas Operacionais (4 colunas) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1A56DB]" />
                <h3 className="font-extrabold text-sm text-slate-900">Feed de Eventos Integrados</h3>
              </div>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                  {unreadCount} novos
                </span>
              )}
            </div>

            <div className="space-y-3">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    n.unread ? 'bg-blue-50/50 border-blue-200/90' : 'bg-slate-50/50 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-slate-900 font-bold">{n.title}</strong>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{n.desc}</p>
                  {n.unread && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-[10px] font-bold text-[#1A56DB] hover:underline mt-2 inline-block"
                    >
                      Marcar como ciente
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card de Resumo de Governança */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conformidade &amp; Governança</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              O banco de dados oficial <strong>oogpcdaosexarxmvupiw</strong> opera com Row Level Security (RLS) e isolamento estrito de inquilinos em todos os módulos.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Auditoria LGPD/CFM:</span>
              <strong className="text-emerald-700 font-bold">100% Regular</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Simulador de Leitos */}
      {showSimModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-[#1A56DB] text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">Simulador de Expansão de Leitos</h3>
              <button onClick={() => setShowSimModal(false)} className="font-bold text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Leitos Adicionais</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={extraBeds}
                  onChange={e => setExtraBeds(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="text-right block font-mono font-bold text-sm text-slate-900">{extraBeds} leitos</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Taxa de Ocupação Estimada</label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={occupancyAssumption}
                  onChange={e => setOccupancyAssumption(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="text-right block font-mono font-bold text-sm text-slate-900">{occupancyAssumption}%</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span>Receita Adicional Estimada:</span>
                  <strong className="text-slate-900 font-bold">R$ {totalExtraRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</strong>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Margem de Contribuição (22%):</span>
                  <span>R$ {hubMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowSimModal(false)}
                  className="px-5 py-2.5 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Concluir Simulação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </VigiaSidebarLayout>
  );
}
