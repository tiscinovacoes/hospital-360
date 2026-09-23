'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { ModuloMenuLateral, MenuLateralItem } from '@/components/ModuloMenuLateral';
import { KpiCard } from '@/components/KpiCard';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
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
  FileText,
  Lock,
  Layers,
  Upload,
  RefreshCw,
  Menu
} from 'lucide-react';

type AbaExecutiva = 
  | 'jornada'
  | 'desfechos'
  | 'compras'
  | 'simulador'
  | 'perfis'
  | 'conectores_hub';

export default function ExecutiveDashboardPage() {
  const roles = MODULO_ROLES_CATALOG['dashboard-executivo'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [abaAtiva, setAbaAtiva] = useState<AbaExecutiva>('jornada');
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const menuItens: MenuLateralItem[] = [
    { id: 'jornada', label: 'Custo Door-to-Door & Jornada 360°', icon: Activity },
    { id: 'desfechos', label: 'Desfechos Clínicos & ONA', icon: Stethoscope },
    { id: 'compras', label: 'Eficiência em Compras vs CMED', icon: TrendingUp },
    { id: 'simulador', label: 'Simulador Estratégico', icon: Sliders },
    { id: 'conectores_hub', label: 'Ingestor & Conectores de Módulos', icon: FileSpreadsheet },
    { id: 'perfis', label: 'Perfis & Matriz RBAC', icon: Lock },
  ];
  const [showModalImportarDespesas, setShowModalImportarDespesas] = useState(false);
  const [arquivoUploadNome, setArquivoUploadNome] = useState<string | null>(null);
  const [importando, setImportando] = useState(false);
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
    <>
      <PageHeader
        activeTitle="Custo do Paciente (Core Door-to-Door)"
        activeSubtitle="Junção e consolidação unificada de todos os módulos assistenciais, suprimentos e escalas"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
              title={sidebarAberta ? 'Recolher menu' : 'Expandir menu'}
            >
              {sidebarAberta ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowModalImportarDespesas(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 lg:px-3.5 py-2 min-h-[44px] min-w-[44px] shrink-0 rounded-xl bg-[#0E5C4C] hover:bg-[#0A4A3D] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              title="Importar Despesas (Hub Ingestor)"
              aria-label="Importar Despesas (Hub Ingestor)"
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Importar Despesas (Hub Ingestor)</span>
            </button>

            <button
              onClick={() => setShowSimModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 lg:px-4 py-2 min-h-[44px] min-w-[44px] shrink-0 rounded-xl bg-[#1B1F1C] hover:bg-[#33382F] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              title="Simulador de Leitos"
              aria-label="Simulador de Leitos"
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Simulador de Leitos</span>
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden relative">
        <ModuloMenuLateral
          titulo="Custo do Paciente"
          categoria="FINANCEIRO"
          itens={menuItens}
          ativoId={abaAtiva}
          onSelect={(id) => setAbaAtiva(id as AbaExecutiva)}
          aberto={sidebarAberta}
          onFechar={() => setSidebarAberta(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
      {/* Toast Flutuante Asséptico (Sem preto) */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-800 px-5 py-3.5 rounded-xl shadow-xl border border-[#1B1F1C]/30 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 ml-2 min-w-[36px] min-h-[36px] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PERFIS & MATRIZ RBAC — só aparece na seção "Perfis" do menu lateral, não em todas as telas */}
      {abaAtiva === 'perfis' && (
        <ModuloRbacBar
          moduloId="dashboard-executivo"
          activeRole={activeRole}
          onRoleChange={setActiveRole}
          accentColor="#1B1F1C"
          lightBg="bg-[#1B1F1C]/[0.08]"
          lightBorder="border-[#1B1F1C]/20"
        />
      )}

      {/* ABA PERFIS */}
      {abaAtiva === 'perfis' && (
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs mb-6">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Perfis de Acesso do Dashboard Executivo 360°
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Visão gerencial de alto nível para Superintendentes, Diretores Médicos e Secretários de Saúde.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#1B1F1C]/[0.08] text-[#1B1F1C] border border-[#1B1F1C]/20">
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
      )}

      {/* ABA CONECTORES & INGESTOR DE DESPESAS */}
      {abaAtiva === 'conectores_hub' && (
        <div className="space-y-6 mb-6">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Ingestor Central de Despesas de Módulos Descentralizados
                </h3>
                <p className="text-xs text-slate-500">
                  Consolidação frouxamente acoplada: cada módulo opera de forma autônoma e injeta despesas via REST API ou upload manual de arquivos padronizados.
                </p>
              </div>

              <button
                onClick={() => setShowModalImportarDespesas(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload de Arquivo (JSON/CSV)</span>
              </button>
            </div>

            {/* Status dos Módulos Especializados */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    Estoque Central
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-lg font-bold text-slate-900">R$ 1.669,00</div>
                <div className="text-[11px] text-slate-600 mt-1">34 saídas FEFO computadas</div>
                <div className="text-[10px] text-amber-700 font-semibold mt-2">API: /api/hub/despesas/ingestao</div>
              </div>

              <div className="p-4 rounded-2xl border border-[#1B1F1C]/20 bg-[#1B1F1C]/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B1F1C]/[0.12] text-[#1B1F1C] border border-[#1B1F1C]/20">
                    Compras &amp; Atas
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-lg font-bold text-slate-900">R$ 161.000,00</div>
                <div className="text-[11px] text-slate-600 mt-1">2 empenhos liquidados</div>
                <div className="text-[10px] text-[#1B1F1C] font-semibold mt-2">API: Webhook de Homologação</div>
              </div>

              <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                    Laboratório (LIS)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-lg font-bold text-slate-900">R$ 420,00</div>
                <div className="text-[11px] text-slate-600 mt-1">12 exames via FHIR R4</div>
                <div className="text-[10px] text-purple-700 font-semibold mt-2">API: DiagnosticReport</div>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Leitos &amp; Hotelaria
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-lg font-bold text-slate-900">R$ 690,00</div>
                <div className="text-[11px] text-slate-600 mt-1">3 diárias e higienização</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-2">API: Evento Censo NIR</div>
              </div>
            </div>

            {/* Tabela de Despesas Ingeridas Recentemente */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">Despesas Consolidadas em Tempo Real no Hub</span>
                <span className="text-slate-500 font-mono">Total de Pacientes: 1 (Carlos Eduardo Silveira)</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-white">
                    <th className="p-3">Origem</th>
                    <th className="p-3">Item / Insumo</th>
                    <th className="p-3">Centro de Custo</th>
                    <th className="p-3">Paciente / Prontuário</th>
                    <th className="p-3 text-right">Valor Total</th>
                    <th className="p-3 text-center">Status Hub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-amber-700">ESTOQUE FEFO</td>
                    <td className="p-3 text-slate-900 font-medium">Meropenem 1g Injetável (6 un - Lote LT-2026-MERO-01)</td>
                    <td className="p-3 text-slate-600">UTI Adulto (Leito 204)</td>
                    <td className="p-3 text-slate-700 font-mono">Carlos Eduardo Silveira (#8841)</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">R$ 291,00</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Consolidado</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-amber-700">ESTOQUE FEFO</td>
                    <td className="p-3 text-slate-900 font-medium">Noradrenalina 2mg/mL Ampola 4mL (10 un - Lote LT-2026-NORA-04)</td>
                    <td className="p-3 text-slate-600">UTI Adulto (Leito 204)</td>
                    <td className="p-3 text-slate-700 font-mono">Carlos Eduardo Silveira (#8841)</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">R$ 128,00</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Consolidado</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-[#1B1F1C]">COMPRAS &amp; ATAS</td>
                    <td className="p-3 text-slate-900 font-medium">Kit Prótese Fixação Ortopédica Titânio (1 kit)</td>
                    <td className="p-3 text-slate-600">Centro Cirúrgico</td>
                    <td className="p-3 text-slate-700 font-mono">Carlos Eduardo Silveira (#8841)</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">R$ 3.420,00</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Consolidado</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 1. BANNER MINIMALISTA: O CUSTO DO PACIENTE COMO O GRANDE CONSOLIDADOR */}
      <div className="bg-white rounded-2xl border border-[#1B1F1C]/80 p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#1B1F1C]/[0.08] text-[#1B1F1C] border border-[#1B1F1C]/20 px-2 py-0.5 rounded-md">
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1B1F1C]/[0.08] text-[#1B1F1C] border border-[#1B1F1C]/20">
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
                  className="p-3.5 rounded-xl border border-slate-200/90 hover:border-[#1B1F1C]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#1B1F1C]/80 text-[#1B1F1C] font-black text-xs flex items-center justify-center flex-shrink-0">
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
                        <span className="bg-[#1B1F1C]/[0.08] text-[#1B1F1C] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#1B1F1C]/20">
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
                <Bell className="w-4 h-4 text-[#1B1F1C]" />
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
                    n.unread ? 'bg-[#1B1F1C]/50 border-[#1B1F1C]/90' : 'bg-slate-50/50 border-slate-200/70'
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
                      className="text-[10px] font-bold text-[#1B1F1C] hover:underline mt-2 inline-block"
                    >
                      <span className="inline-flex items-center min-h-[24px]">Marcar como ciente</span>
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
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-xl border border-[#E0E0E0] overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-[#1B1F1C] text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">Simulador de Expansão de Leitos</h3>
              <button onClick={() => setShowSimModal(false)} className="min-w-[44px] min-h-[44px] flex items-center justify-center font-bold text-white/80 hover:text-white">✕</button>
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
                  className="w-full accent-[#1B1F1C]"
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
                  className="w-full accent-[#1B1F1C]"
                />
                <span className="text-right block font-mono font-bold text-sm text-slate-900">{occupancyAssumption}%</span>
              </div>

              <div className="p-4 bg-[#1B1F1C]/50 rounded-2xl border border-[#1B1F1C]/60 space-y-2">
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
                  className="px-5 py-2.5 min-h-[44px] bg-[#1B1F1C] hover:bg-[#33382F] text-white rounded-xl font-bold shadow-sm transition-colors"
                >
                  Concluir Simulação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importação Manual de Despesas de Módulos Descentralizados */}
      {showModalImportarDespesas && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-[#E0E0E0] overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Ingestor Hub 360 — Importar Despesas</h3>
              </div>
              <button onClick={() => setShowModalImportarDespesas(false)} className="min-w-[44px] min-h-[44px] flex items-center justify-center font-bold text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Faça o upload do arquivo gerado pelo seu módulo avulso (<strong>Estoque Central</strong>, <strong>Compras Públicas</strong> ou <strong>Sistemas Legados</strong>) no padrão de dados do Hub.
              </p>

              <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-emerald-50/20">
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold text-slate-800 mb-1">Selecione o arquivo de despesas (.json ou .csv)</div>
                <div className="text-[11px] text-slate-500 mb-3">Formatos aceitos: Contrato JSON Hub 360 ou Planilha CSV ponto-e-vírgula</div>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    type="button"
                    onClick={async () => {
                      setImportando(true);
                      setArquivoUploadNome('despesas_estoque_hospital360_2026-09-22.json');
                      try {
                        const res = await fetch('/api/hub/despesas/ingestao', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            origem_modulo: 'ESTOQUE_CENTRAL',
                            cliente_id: 'HOSPITAL_360_MATRIZ',
                            despesas: [
                              {
                                id_transacao: 'DSP-EST-AUTO-01',
                                paciente_cpf: '123.456.789-00',
                                paciente_nome: 'Carlos Eduardo Silveira',
                                prontuario_episodio: 'EPIS-2026-8841',
                                centro_custo: 'UTI_ADULTO',
                                leito_identificador: 'Leito 204',
                                item_codigo: 'MED-001',
                                item_descricao: 'Meropenem 1g Injetável',
                                lote_fabricante: 'LT-2026-MERO-01',
                                quantidade: 6,
                                unidade_medida: 'Frasco-Ampola',
                                valor_unitario_medio: 48.50,
                                valor_total_imputado: 291.00,
                                data_consumo: '2026-09-22 10:30:00'
                              }
                            ]
                          })
                        });
                        const data = await res.json();
                        if (data.success) {
                          showToast(`Lote de despesas do Estoque processado com sucesso! Protocolo: ${data.protocolo}`);
                          setShowModalImportarDespesas(false);
                        }
                      } catch (e) {
                        showToast('Erro ao processar arquivo de despesas.');
                      } finally {
                        setImportando(false);
                      }
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {importando ? 'Processando Lote...' : 'Simular Ingestão de Estoque (.json)'}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setImportando(true);
                      setArquivoUploadNome('despesas_compras_hospital360_2026-09-22.json');
                      try {
                        const res = await fetch('/api/hub/despesas/ingestao', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            origem_modulo: 'COMPRAS_PUBLICAS',
                            cliente_id: 'HOSPITAL_360_MATRIZ',
                            despesas: [
                              {
                                id_transacao: 'DSP-CMP-AUTO-01',
                                paciente_cpf: '123.456.789-00',
                                paciente_nome: 'Carlos Eduardo Silveira',
                                prontuario_episodio: 'EPIS-2026-8841',
                                centro_custo: 'CENTRO_CIRURGICO',
                                leito_identificador: 'Leito 204',
                                item_codigo: 'OPME-901',
                                item_descricao: 'Kit Prótese Fixação Ortopédica Titânio',
                                lote_fabricante: 'LOT-TIT-881',
                                quantidade: 1,
                                unidade_medida: 'Kit Estéril',
                                valor_unitario_medio: 3420.00,
                                valor_total_imputado: 3420.00,
                                data_consumo: '2026-09-21 14:00:00'
                              }
                            ]
                          })
                        });
                        const data = await res.json();
                        if (data.success) {
                          showToast(`Lote de despesas de Compras processado com sucesso! Protocolo: ${data.protocolo}`);
                          setShowModalImportarDespesas(false);
                        }
                      } catch (e) {
                        showToast('Erro ao processar arquivo de despesas.');
                      } finally {
                        setImportando(false);
                      }
                    }}
                    className="px-3 py-2 bg-[#1B1F1C] hover:bg-[#33382F] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {importando ? 'Processando Lote...' : 'Simular Ingestão de Compras (.json)'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalImportarDespesas(false)}
                  className="px-4 py-2 border border-[#E0E0E0] text-slate-700 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </>
  );
}
