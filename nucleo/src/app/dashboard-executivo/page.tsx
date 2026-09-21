'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
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
      activeTitle="Custo do Paciente (Core 360)"
      activeSubtitle="Junção e consolidação de todos os módulos assistenciais, suprimentos e escalas"
    >
      {/* Banner de Integração: O Custo do Paciente como Módulo Unificador */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-700/60 rounded-2xl p-5 mb-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/30 border border-blue-400/40 px-2 py-0.5 rounded text-blue-200">
              MÓDULO INTEGRADOR UNIVERSAL
            </span>
            <h2 className="text-lg font-black mt-1">Custo Door-to-Door • Apuração Real vs SIGTAP & TUSS</h2>
            <p className="text-xs text-blue-200 mt-1 leading-relaxed">
              Este módulo consolida automaticamente os dados gerados em todo o ecossistema: prescrições do <strong>OpenEMR</strong>, medicamentos do <strong>Estoque FEFO</strong>, exames do <strong>LIMS Senaite</strong>, diárias de <strong>Leitos</strong>, compras nas <strong>Atas ARP</strong> e plantões da <strong>Escala Médica</strong>. Também recebe importações diretas de sistemas externos via CSV.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/ingestao-modulos"
              className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 font-black text-xs rounded-xl shadow transition-all"
            >
              Importar Dados (CSV)
            </Link>
          </div>
        </div>
      </div>

      {/* Toast Flutuante Dark */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1E293B] text-white px-5 py-3 rounded-xl shadow-2xl border border-teal-400 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Executivo C-Level */}
      <div className="bg-[#0F766E] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-teal-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-teal-100 hover:text-white mb-2 transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Seleção de Módulos</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-900/80 rounded-xl border border-teal-600">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Cockpit Executivo &amp; Inteligência Estratégica 360°
                </h1>
                <p className="text-xs text-teal-100 mt-0.5">
                  Centro Integrado de Decisões C-Level • Governança, Financeiro &amp; Operações
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSimModal(true)}
              className="px-4 py-2 rounded-xl bg-teal-900/90 hover:bg-teal-950 border border-teal-600 text-teal-100 hover:text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              Simular Expansão de Leitos
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna Esquerda: Métricas C-Level & Gráficos (8 colunas) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 4 Cards de KPIs Globais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Faturamento Bruto Hub
              </span>
              <p className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
                R$ 384.200
              </p>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> +16,8% vs. mês anterior
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Taxa de Ocupação Geral
              </span>
              <p className="text-2xl font-mono font-extrabold text-sky-400 mt-1">
                83,3%
              </p>
              <p className="text-[11px] text-sky-400 mt-1">
                10 de 12 leitos ocupados
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Tempo Médio Giro (Leito)
              </span>
              <p className="text-2xl font-mono font-extrabold text-purple-400 mt-1">
                2,4 dias
              </p>
              <p className="text-[11px] text-purple-400 mt-1">
                Alta eficiência clínica
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-md">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                NPS dos Pacientes
              </span>
              <p className="text-2xl font-mono font-extrabold text-amber-400 mt-1">
                94 / 100
              </p>
              <p className="text-[11px] text-amber-400 mt-1">
                Zona de Excelência
              </p>
            </div>
          </div>

          {/* Gráfico Visual de Distribuição de Receitas do Hub */}
          <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Distribuição de Faturamento por Unidade de Negócio
                </h3>
                <p className="text-xs text-slate-400">
                  Consolidação de receitas de sublocação, exames, cirurgias e facilities
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
                Split D+1 100% Automatizado
              </span>
            </div>

            {/* Barra Visual Proporcional */}
            <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: '48%' }} className="bg-[#1A56DB] hover:opacity-90" title="Consultórios: 48%"></div>
              <div style={{ width: '26%' }} className="bg-[#7C3AED] hover:opacity-90" title="Centro Cirúrgico: 26%"></div>
              <div style={{ width: '16%' }} className="bg-[#0E9F6E] hover:opacity-90" title="Laboratório Hub: 16%"></div>
              <div style={{ width: '10%' }} className="bg-[#EA580C] hover:opacity-90" title="Facilities & Hotelaria: 10%"></div>
            </div>

            {/* Legenda do Gráfico */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1A56DB]"></span>
                <div>
                  <span className="text-slate-400 block text-[10px]">Consultórios (48%)</span>
                  <strong className="text-white font-mono">R$ 184.416</strong>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#7C3AED]"></span>
                <div>
                  <span className="text-slate-400 block text-[10px]">Centro Cirúrgico (26%)</span>
                  <strong className="text-white font-mono">R$ 99.892</strong>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0E9F6E]"></span>
                <div>
                  <span className="text-slate-400 block text-[10px]">Laboratório Central (16%)</span>
                  <strong className="text-white font-mono">R$ 61.472</strong>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EA580C]"></span>
                <div>
                  <span className="text-slate-400 block text-[10px]">Facilities &amp; Hotelaria (10%)</span>
                  <strong className="text-white font-mono">R$ 38.420</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SPRINT 4: Custeio do Paciente Door-to-Door & Confronto SIGTAP/SUS vs TUSS */}
          <section
            aria-label="Custeio do Paciente Door-to-Door e Confronto de Tabelas Oficiais"
            className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-[#131E32] to-slate-900 border border-slate-700 shadow-xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
                  <Activity className="w-3.5 h-3.5" /> Motor de Custeio Contínuo • Sprint 4 Go-Live
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Jornada Door-to-Door do Paciente &amp; Confronto de Margem
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paciente: <strong>Mariana Oliveira dos Santos</strong> (CPF: 789.***.***-00) • Episódio Integrado: <strong>EPIS-2026-8812</strong>
                </p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-700 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Custo Real Acumulado</span>
                <span className="text-xl font-mono font-extrabold text-cyan-400">R$ 265,73</span>
                <span className="text-[9px] text-slate-500 block">5 estações apuradas</span>
              </div>
            </div>

            {/* Linha do Tempo Visual das 5 Estações */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Composição do Custo Real por Estação Assistencial:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {/* Estação 1 */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Portaria &amp; Triagem</span>
                  <p className="text-xs font-semibold text-white mt-1">Manchester</p>
                  <p className="text-sm font-mono font-bold text-cyan-300 mt-0.5">R$ 35,00</p>
                </div>

                {/* Estação 2 */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Consulta OpenEMR</span>
                  <p className="text-xs font-semibold text-white mt-1">Cardiologia Sala 204</p>
                  <p className="text-sm font-mono font-bold text-cyan-300 mt-0.5">R$ 110,00</p>
                </div>

                {/* Estação 3 */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Farmácia FEFO</span>
                  <p className="text-xs font-semibold text-white mt-1">Dipirona + Soro</p>
                  <p className="text-sm font-mono font-bold text-cyan-300 mt-0.5">R$ 14,90</p>
                </div>

                {/* Estação 4 */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">4. SENAITE LIMS</span>
                  <p className="text-xs font-semibold text-white mt-1">Troponina + Hemog.</p>
                  <p className="text-sm font-mono font-bold text-cyan-300 mt-0.5">R$ 92,50</p>
                </div>

                {/* Estação 5 */}
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">5. Facilities &amp; Leito</span>
                  <p className="text-xs font-semibold text-white mt-1">Higienização Leito 108</p>
                  <p className="text-sm font-mono font-bold text-cyan-300 mt-0.5">R$ 13,33</p>
                </div>
              </div>
            </div>

            {/* Comparativo de Confronto com Tabelas Oficiais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Card 1: Tabela SUS (SIGTAP) - Revelando o Déficit */}
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                    SUS • Tabela Oficial SIGTAP (BPA/AIH)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Déficit do SUS
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Repasse Tabela SUS</span>
                    <span className="text-lg font-mono font-extrabold text-white">R$ 85,00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-rose-300 font-bold block">Subfinanciamento / Déficit</span>
                    <span className="text-xl font-mono font-extrabold text-rose-400">- R$ 180,73</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed border-t border-rose-900/40 pt-2">
                  O custo real apurado pela Suíte 360 comprova que o procedimento gera deficit de <strong>68,0%</strong> sobre o repasse público federal.
                </p>
              </div>

              {/* Card 2: Saúde Suplementar (TUSS) - Margem Ebitda */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    Saúde Suplementar • Tabela TUSS
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Margem Positiva
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Faturamento Convênio TUSS</span>
                    <span className="text-lg font-mono font-extrabold text-white">R$ 380,00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-emerald-300 font-bold block">Margem de Contribuição</span>
                    <span className="text-xl font-mono font-extrabold text-emerald-400">+ R$ 114,27 (+30,1%)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed border-t border-emerald-900/40 pt-2">
                  Retenção com Split Hyperswitch (85% cooperado / 15% condomínio) garante solvência e conciliação bancária automática.
                </p>
              </div>
            </div>
          </section>

          {/* Atalhos Estratégicos C-Level */}
          <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
              Acesso Rápido às Operações Hospitalares
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/admin"
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-teal-500 text-left transition-all group"
              >
                <Building2 className="w-5 h-5 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-white">Mapa de Salas &amp; Split</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Painel do Administrador Condominial</p>
              </Link>

              <button
                onClick={() => setShowTelemedModal(true)}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-sky-500 text-left transition-all group"
              >
                <Video className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-white">Telemedicina Integrada</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Consultas remotas com prontuário</p>
              </button>

              <Link
                href="/internacao"
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-purple-500 text-left transition-all group"
              >
                <Activity className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-white">Censo de Leitos &amp; Altas</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Posto Central de Enfermagem</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Central de Notificações C-Level (4 colunas) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#1E293B] border border-slate-800 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Notificações Críticas</h3>
              </div>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  {unreadCount} não lidas
                </span>
              )}
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    notif.unread
                      ? 'bg-[#141E33] border-amber-500/50 shadow-xs'
                      : 'bg-slate-900/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{notif.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed mb-2">{notif.desc}</p>
                  
                  {notif.unread && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-[10px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Marcar como Resolvido
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card de Auditoria e SLA */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/60 to-slate-900 border border-teal-800/60 text-xs space-y-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Conformidade Regulatória 360°</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Todos os registros cirúrgicos, laudos de exames e desinfecções de leito possuem logs criptográficos imutáveis para atendimento às normas CFM, COFEN e ANVISA.
            </p>
          </div>
        </div>

      </main>

      {/* =========================================================================
          MODAL: SIMULADOR ESTRATÉGICO DE EXPANSÃO DE LEITOS (C-LEVEL)
         ========================================================================= */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                  Simulador de Expansão de Leitos &amp; ROI
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Projeção de receita marginal para novas alas de internação
                </p>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-300">Novos Leitos a Adicionar:</span>
                  <span className="font-mono text-base font-bold text-teal-400">{extraBeds} leitos</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={extraBeds}
                  onChange={(e) => setExtraBeds(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-slate-300">Taxa Média de Ocupação Prevista:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">{occupancyAssumption}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={5}
                  value={occupancyAssumption}
                  onChange={(e) => setOccupancyAssumption(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Resultado Financeiro da Simulação */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Receita Bruta Adicional Estimada / mês:</span>
                  <span className="font-mono font-bold text-white">
                    R$ {totalExtraRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold text-sm pt-2 border-t border-slate-800">
                  <span>Margem de Contribuição Líquida (22%):</span>
                  <span className="font-mono">
                    R$ {hubMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowSimModal(false)}
                className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:text-white"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowSimModal(false);
                  showToast('Cenário de expansão gravado no plano de investimento 2027!');
                }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Salvar Cenário no Plano Anual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SALA VIRTUAL DE TELEMEDICINA 360
         ========================================================================= */}
      {showTelemedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#1E293B] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-extrabold text-white">
                  Sala de Telemedicina 360° (WebRTC Criptografado)
                </h3>
              </div>
              <button
                onClick={() => setShowTelemedModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulação de Janela de Vídeo */}
            <div className="relative aspect-video bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto animate-pulse">
                  <Video className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-white">Conexão Segura Estabelecida</p>
                <p className="text-[11px] text-slate-400">Paciente: Ana Carolina Souza • Fila Virtual</p>
              </div>
              <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-950/80 border border-emerald-800 rounded text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                HIPAA / LGPD Compliant
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTelemedModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Encerrar Chamada
              </button>
            </div>
          </div>
        </div>
      )}
    </VigiaSidebarLayout>
  );
}
