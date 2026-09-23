'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Clock,
  DoorClosed,
  ChevronRight,
  Layers,
  FileText,
  Calendar,
  Sparkles,
  PieChart,
  Activity,
  ArrowUpRight,
  Filter,
  Download,
  Eye,
  X,
  RefreshCw,
  Search,
} from 'lucide-react';

type AdminSection =
  | 'dashboard'
  | 'contratos'
  | 'split'
  | 'salas'
  | 'facilities'
  | 'financeiro'
  | 'fluxo360';

interface RoomData {
  id: string;
  name: string;
  type: 'Consultório' | 'Exames' | 'Centro Cirúrgico' | 'UTI';
  floor: string;
  status: 'livre' | 'ocupado' | 'limpeza';
  doctor?: string;
  specialty?: string;
  currentPatient?: string;
  timeInfo?: string;
  lastCleaned?: string;
}

const mockRooms: RoomData[] = [
  { id: '101', name: 'Consultório 101', type: 'Consultório', floor: '1º Andar', status: 'livre', lastCleaned: '07:30' },
  { id: '102', name: 'Consultório 102 (Neurologia)', type: 'Consultório', floor: '1º Andar', status: 'ocupado', doctor: 'Dra. Camila Nogueira', specialty: 'Neurologia', currentPatient: 'Mariana Duarte', timeInfo: 'Em consulta há 25 min' },
  { id: '103', name: 'Consultório 103 (Pediatria)', type: 'Consultório', floor: '1º Andar', status: 'limpeza', timeInfo: 'Higienização Concorrente', lastCleaned: 'Em andamento (há 8 min)' },
  { id: '204', name: 'Sala 204 (Cardiologia)', type: 'Consultório', floor: '2º Andar', status: 'ocupado', doctor: 'Dr. Ricardo Mendes', specialty: 'Cardiologia', currentPatient: 'Ana Carolina Souza', timeInfo: 'Em consulta há 15 min' },
  { id: '205', name: 'Sala 205 (Ortopedia)', type: 'Consultório', floor: '2º Andar', status: 'ocupado', doctor: 'Dr. Thiago Vasconcelos', specialty: 'Ortopedia', currentPatient: 'Carlos Eduardo Lima', timeInfo: 'Procedimento menor' },
  { id: '206', name: 'Sala 206 (Ecocardiograma)', type: 'Exames', floor: '2º Andar', status: 'limpeza', timeInfo: 'Limpeza Terminal (RN08)', lastCleaned: 'Aguardando equipe' },
  { id: '301', name: 'Centro Cirúrgico 1 (Alta Complexidade)', type: 'Centro Cirúrgico', floor: '3º Andar', status: 'livre', lastCleaned: '06:00' },
  { id: '302', name: 'Centro Cirúrgico 2 (Ambulatorial)', type: 'Centro Cirúrgico', floor: '3º Andar', status: 'limpeza', timeInfo: 'Desinfecção Terminal pós-artroscopia', lastCleaned: 'Em andamento (há 32 min)' },
];

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [selectedFloor, setSelectedFloor] = useState<string>('todos');
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [flowStep, setFlowStep] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Stepper automático para o Fluxo 360° (avança a cada 3.5s se a aba estiver ativa)
  useEffect(() => {
    if (activeSection !== 'fluxo360') return;
    const interval = setInterval(() => {
      setFlowStep((prev) => (prev >= 4 ? 1 : prev + 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [activeSection]);

  const filteredRooms = mockRooms.filter((r) => {
    if (selectedFloor === 'todos') return true;
    return r.floor === selectedFloor;
  });

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Relatório consolidado gerado com sucesso em formato PDF e planilha auditável.');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <HospitalNav />

      {/* Header do Administrador */}
      <div className="bg-[#0A2540] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#93C5FD] hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="inline-flex items-center min-h-[24px]">Voltar para Seleção de Perfis</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A5F] text-[#93C5FD] flex items-center justify-center shadow-inner">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Administração do Condomínio Hospitalar</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    Sede Central
                  </span>
                </h1>
                <p className="text-xs text-[#93C5FD]">
                  Gestão Operacional, Ocupação em Tempo Real &amp; Split de Repasses (RN-IND)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn btn-secondary btn-sm text-xs flex items-center gap-1.5"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Gerando Relatório...' : 'Exportar Extrato'}</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1E3A5F] border border-blue-800 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-[#0E9F6E] animate-pulse"></span>
              Operação Normal • 38 Salas
            </span>
          </div>
        </div>
      </div>

      {/* Grid Principal com Sidebar e Área de Conteúdo */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Lateral de Navegação (3 colunas) */}
        <aside className="lg:col-span-3 space-y-1">
          <div className="bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] px-3 py-2">
              Navegação Administrativa
            </p>

            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === 'dashboard'
                  ? 'bg-[#EBF0FB] text-[#1A56DB] shadow-sm'
                  : 'text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-[#1A56DB]" />
                <span>Visão Geral do Prédio</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>

            <button
              onClick={() => setActiveSection('salas')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === 'salas'
                  ? 'bg-[#EBF0FB] text-[#1A56DB] shadow-sm'
                  : 'text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DoorClosed className="w-4 h-4 text-[#0E9F6E]" />
                <span>Ocupação de Salas</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#D1FAE5] text-[#057A55] font-bold">
                87%
              </span>
            </button>

            <button
              onClick={() => setActiveSection('split')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === 'split'
                  ? 'bg-[#EBF0FB] text-[#1A56DB] shadow-sm'
                  : 'text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-[#0E9F6E]" />
                <span>Extrato de Repasses (Split)</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#EBF0FB] text-[#1A56DB]">
                D+1
              </span>
            </button>

            <button
              onClick={() => setActiveSection('fluxo360')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === 'fluxo360'
                  ? 'bg-[#EBF0FB] text-[#1A56DB] shadow-sm'
                  : 'text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span>Jornada do Paciente 360°</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-ping"></span>
            </button>

            <button
              onClick={() => setActiveSection('contratos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === 'contratos'
                  ? 'bg-[#EBF0FB] text-[#1A56DB] shadow-sm'
                  : 'text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#6B7280]" />
                <span>Gestão de Contratos</span>
              </div>
              <span className="text-[10px] text-[#6B7280]">6 ativos</span>
            </button>

            <button
              onClick={() => setActiveSection('facilities')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === 'facilities'
                  ? 'bg-[#EBF0FB] text-[#1A56DB] shadow-sm'
                  : 'text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#C27803]" />
                <span>Controle de Facilities</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#FEF9C3] text-[#92400E] font-bold">
                3 crit.
              </span>
            </button>

            <button
              onClick={() => setActiveSection('financeiro')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeSection === 'financeiro'
                  ? 'bg-[#EBF0FB] text-[#1A56DB] shadow-sm'
                  : 'text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PieChart className="w-4 h-4 text-[#0891B2]" />
                <span>Financeiro Global do Prédio</span>
              </div>
            </button>
          </div>

          {/* Card Resumo de Regra de Negócio (RN-IND) */}
          <div className="p-4 bg-[#EBF0FB] rounded-2xl border border-[#BFDBFE] text-xs text-[#1E3A5F]">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <span className="text-[#1A56DB]">🔒 Regra RN-IND:</span>
            </div>
            <p className="leading-relaxed text-[11px] text-[#374151]">
              O Administrador do condomínio monitora apenas <strong>ocupação, horas de uso e taxa predial</strong>.
              A receita interna de cada clínica permanece restrita ao respectivo médico.
            </p>
          </div>
        </aside>

        {/* Workspace Central Dinâmico (9 colunas) */}
        <section className="lg:col-span-9 space-y-6">
          {/* 1. SEÇÃO DASHBOARD (VISÃO GERAL) */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 4 KPIs com Delta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="kpi-card">
                  <div className="kpi-icon bg-[#EBF0FB] text-[#1A56DB]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="kpi-val font-mono">R$ 2,4M</div>
                  <div className="kpi-label">Faturamento Bruto do Hub</div>
                  <div className="kpi-delta text-[#0E9F6E] flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" /> +12,5% vs. pregão
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-[#D1FAE5] text-[#057A55]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="kpi-val font-mono">87,5%</div>
                  <div className="kpi-label">Taxa Média de Ocupação</div>
                  <div className="kpi-delta text-[#1A56DB] flex items-center gap-1 font-semibold">
                    <span>35 salas ativas hoje</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-[#FEF9C3] text-[#C27803]">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="kpi-val font-mono">8 Alertas</div>
                  <div className="kpi-label">Manutenção &amp; Higiene</div>
                  <div className="kpi-delta text-[#C81E1E] font-semibold">
                    3 chamados em andamento
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon bg-[#F5F3FF] text-[#7C3AED]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="kpi-val font-mono">R$ 260K</div>
                  <div className="kpi-label">Saldo de Repasse a Pagar</div>
                  <div className="kpi-delta text-[#7C3AED] font-semibold">
                    Split automático em D+1
                  </div>
                </div>
              </div>

              {/* Gráfico 24h Visual de Fluxo de Pacientes no Prédio */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#111928] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#1A56DB]" />
                      <span>Fluxo Médio de Pacientes no Prédio ao Longo de 24h</span>
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Contagem consolidada por sensores dos totens de recepção e consultórios
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0E9F6E]">
                    Pico: 14h às 16h (340 pacientes)
                  </span>
                </div>

                {/* Gráfico SVG customizado de alta fidelidade */}
                <div className="h-44 w-full relative flex items-end gap-2 pt-6 pb-2 px-2 border-b border-[#E5E7EB]">
                  {[
                    { h: '06h', v: 25 },
                    { h: '08h', v: 140 },
                    { h: '10h', v: 280 },
                    { h: '12h', v: 190 },
                    { h: '14h', v: 340 },
                    { h: '16h', v: 310 },
                    { h: '18h', v: 180 },
                    { h: '20h', v: 60 },
                    { h: '22h', v: 20 },
                  ].map((pt, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div
                        className="w-full max-w-[42px] rounded-t-lg bg-gradient-to-t from-[#1A56DB] to-[#3B82F6] group-hover:from-[#0E9F6E] group-hover:to-[#34D399] transition-all duration-200 relative"
                        style={{ height: `${(pt.v / 360) * 100}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold bg-[#111928] text-white px-1.5 py-0.5 rounded pointer-events-none transition-opacity">
                          {pt.v}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#6B7280]">{pt.h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabela de Status de Pagamento das Clínicas Locatárias */}
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#111928]">
                      Status Financeiro das Clínicas Locatárias
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Contratos de sublocação predial e taxas condominiais do mês vigente
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection('contratos')}
                    className="text-xs font-bold text-[#1A56DB] hover:underline"
                  >
                    <span className="inline-flex items-center min-h-[24px]">Ver todos os contratos →</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#E5E7EB]">
                      <tr>
                        <th className="py-3 px-4">Clínica / Locatário</th>
                        <th className="py-3 px-4">Sala</th>
                        <th className="py-3 px-4">Taxa Fixa</th>
                        <th className="py-3 px-4">Consumo Facilities</th>
                        <th className="py-3 px-4">Vencimento</th>
                        <th className="py-3 px-4">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6] text-[#374151]">
                      {[
                        { name: 'CardioVida Especialidades', room: 'Sala 204', fixed: 'R$ 8.000,00', fac: 'R$ 380,00', due: '10/09/2026', status: 'Pago', color: 'bg-[#D1FAE5] text-[#057A55]' },
                        { name: 'OrthoCenter Traumatologia', room: 'Sala 205', fixed: 'R$ 8.000,00', fac: 'R$ 540,00', due: '10/09/2026', status: 'Pago', color: 'bg-[#D1FAE5] text-[#057A55]' },
                        { name: 'NeuroExcelência Clínica', room: 'Sala 102', fixed: 'R$ 8.000,00', fac: 'R$ 220,00', due: '10/09/2026', status: 'Pago', color: 'bg-[#D1FAE5] text-[#057A55]' },
                        { name: 'Clínica Dermatológica Derma360', room: 'Sala 103', fixed: 'R$ 7.500,00', fac: 'R$ 150,00', due: '20/09/2026', status: 'Pendente', color: 'bg-[#FEF9C3] text-[#92400E]' },
                        { name: 'Centro de Otorrino e Audição', room: 'Sala 101', fixed: 'R$ 7.500,00', fac: 'R$ 90,00', due: '15/09/2026', status: 'Atrasado', color: 'bg-[#FDE8E8] text-[#C81E1E]' },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3 px-4 font-bold text-[#111928]">{item.name}</td>
                          <td className="py-3 px-4 font-mono">{item.room}</td>
                          <td className="py-3 px-4 font-mono font-semibold">{item.fixed}</td>
                          <td className="py-3 px-4 font-mono">{item.fac}</td>
                          <td className="py-3 px-4 font-mono text-[#6B7280]">{item.due}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>
                              {item.status}
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

          {/* 2. SEÇÃO OCUPAÇÃO DE SALAS (ROOM STATUS BOARD COM FILTRO E DETALHES) */}
          {activeSection === 'salas' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-[#111928] flex items-center gap-2">
                      <DoorClosed className="w-5 h-5 text-[#1A56DB]" />
                      <span>Grade de Ocupação das Salas (RoomStatusBoard)</span>
                    </h2>
                    <p className="text-xs text-[#6B7280]">
                      Clique sobre qualquer sala para visualizar o histórico de turnover e acionar serviços de apoio
                    </p>
                  </div>

                  {/* Filtro por Andar */}
                  <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-xl text-xs font-semibold">
                    {['todos', '1º Andar', '2º Andar', '3º Andar'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setSelectedFloor(f)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          selectedFloor === f
                            ? 'bg-white text-[#1A56DB] shadow-sm'
                            : 'text-[#6B7280] hover:text-[#111928]'
                        }`}
                      >
                        {f === 'todos' ? 'Todos os Andares' : f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grade de Salas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredRooms.map((room) => {
                    let borderClass = 'border-[#0E9F6E] bg-[#F0FDF4]';
                    let badge = <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#057A55]">Livre</span>;

                    if (room.status === 'ocupado') {
                      borderClass = 'border-[#1A56DB] bg-white';
                      badge = <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF0FB] text-[#1A56DB]">Em Atendimento</span>;
                    } else if (room.status === 'limpeza') {
                      borderClass = 'border-[#FACA15] bg-[#FEFCE8]';
                      badge = <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[#92400E]">Higienização</span>;
                    }

                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md flex flex-col justify-between min-h-[140px] ${borderClass}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm font-bold text-[#111928]">
                              Sala {room.id}
                            </span>
                            {badge}
                          </div>
                          <h4 className="text-xs font-bold text-[#111928] truncate">{room.name}</h4>
                          <p className="text-[11px] text-[#6B7280] mt-0.5">{room.floor}</p>

                          {room.doctor && (
                            <p className="text-xs font-medium text-[#1A56DB] mt-2 truncate">
                              🩺 {room.doctor}
                            </p>
                          )}
                          {room.timeInfo && (
                            <p className="text-[11px] font-medium text-[#C27803] mt-2 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {room.timeInfo}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#6B7280]">
                          <span>Última limpeza: {room.lastCleaned}</span>
                          <Eye className="w-3.5 h-3.5 text-[#1A56DB]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal de Detalhes da Sala */}
              {selectedRoom && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#111928]">
                          Sala {selectedRoom.id} • {selectedRoom.name}
                        </h3>
                        <p className="text-xs text-[#6B7280]">{selectedRoom.floor} • {selectedRoom.type}</p>
                      </div>
                      <button
                        onClick={() => setSelectedRoom(null)}
                        className="p-1 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs text-[#374151] mb-6">
                      <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                        <span className="text-[#6B7280] block text-[11px]">Status Operacional:</span>
                        <span className="font-bold text-sm text-[#111928] uppercase tracking-wide">
                          {selectedRoom.status === 'livre' ? 'Disponível para Uso' : selectedRoom.status === 'ocupado' ? 'Em Consulta Médica' : 'Em Procedimento de Higiene'}
                        </span>
                      </div>

                      {selectedRoom.doctor && (
                        <div className="p-3 bg-[#EBF0FB] rounded-xl border border-[#BFDBFE]">
                          <span className="text-[#1A56DB] block text-[11px] font-semibold">Médico Responsável:</span>
                          <span className="font-bold text-[#111928]">{selectedRoom.doctor}</span>
                          <p className="text-[11px] text-[#6B7280]">Especialidade: {selectedRoom.specialty}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-1 border-b border-[#F3F4F6]">
                        <span className="text-[#6B7280]">Higienização Anterior:</span>
                        <span className="font-mono font-semibold">{selectedRoom.lastCleaned}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          alert(`Chamado de limpeza prioritária aberto para a Sala ${selectedRoom.id}!`);
                          setSelectedRoom(null);
                        }}
                        className="btn btn-warning btn-sm text-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Solicitar Higienização
                      </button>
                      <button
                        onClick={() => setSelectedRoom(null)}
                        className="btn btn-primary btn-sm text-xs"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. SEÇÃO SPLIT DE REPASSES (SPLIT EXTRATO) */}
          {activeSection === 'split' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#111928] flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#0E9F6E]" />
                      <span>Extrato de Split Automático de Repasses (H8 + RN-FIN02)</span>
                    </h2>
                    <p className="text-xs text-[#6B7280]">
                      Fórmula de Repasse: Consultas × Valor Médio − Taxa Predial Fixa − Consumo Insumos = Valor Líquido D+1
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#D1FAE5] text-[#057A55]">
                    Processamento D+1 Ativo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-center">
                    <span className="text-xs text-[#6B7280]">Total Bruto Faturado</span>
                    <p className="text-xl font-mono font-bold text-[#111928] mt-0.5">R$ 178.500,00</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-center">
                    <span className="text-xs text-[#6B7280]">Retenção Condomínio</span>
                    <p className="text-xl font-mono font-bold text-red-600 mt-0.5">- R$ 24.000,00</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-center">
                    <span className="text-xs text-[#6B7280]">Insumos Consumidos</span>
                    <p className="text-xl font-mono font-bold text-red-600 mt-0.5">- R$ 1.140,00</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-center">
                    <span className="text-xs text-[#057A55] font-semibold">Líquido Repassado</span>
                    <p className="text-xl font-mono font-bold text-[#057A55] mt-0.5">R$ 153.360,00</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#E5E7EB]">
                      <tr>
                        <th className="py-3 px-4">Clínica Parceira</th>
                        <th className="py-3 px-4">Consultas</th>
                        <th className="py-3 px-4">Valor Bruto</th>
                        <th className="py-3 px-4">Taxa Sala</th>
                        <th className="py-3 px-4">Facilities</th>
                        <th className="py-3 px-4">Valor Líquido</th>
                        <th className="py-3 px-4 text-right">Comprovante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6] text-[#374151]">
                      {[
                        { name: 'CardioVida Especialidades', room: 'Sala 204', calls: '130', gross: 'R$ 58.000,00', fix: '- R$ 8.000,00', fac: '- R$ 380,00', net: 'R$ 49.620,00' },
                        { name: 'OrthoCenter Traumatologia', room: 'Sala 205', calls: '95', gross: 'R$ 45.000,00', fix: '- R$ 8.000,00', fac: '- R$ 540,00', net: 'R$ 36.460,00' },
                        { name: 'NeuroExcelência Clínica', room: 'Sala 102', calls: '110', gross: 'R$ 51.000,00', fix: '- R$ 8.000,00', fac: '- R$ 220,00', net: 'R$ 42.780,00' },
                        { name: 'Derma360 Estética & Saúde', room: 'Sala 103', calls: '55', gross: 'R$ 24.500,00', fix: '- R$ 7.500,00', fac: '- R$ 150,00', net: 'R$ 16.850,00' },
                      ].map((c, i) => (
                        <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#111928]">
                            <div>{c.name}</div>
                            <span className="text-[10px] font-mono text-[#6B7280]">{c.room}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono">{c.calls} atendimentos</td>
                          <td className="py-3.5 px-4 font-mono font-semibold">{c.gross}</td>
                          <td className="py-3.5 px-4 font-mono text-red-600">{c.fix}</td>
                          <td className="py-3.5 px-4 font-mono text-red-600">{c.fac}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#0E9F6E]">{c.net}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => alert(`Visualizando comprovante de split bancário para ${c.name}`)}
                              className="btn btn-outline btn-sm text-[11px]"
                            >
                              Ver Split D+1
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. SEÇÃO JORNADA 360° (INTEGRATED FLOW ANIMADO) */}
          {activeSection === 'fluxo360' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-[#111928] flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                      <span>Jornada do Paciente 360° (IntegratedFlow em Tempo Real)</span>
                    </h2>
                    <p className="text-xs text-[#6B7280]">
                      Visualização animada da integração entre Totem, Recepção, Consultório e Laboratório do Hub
                    </p>
                  </div>
                  <button
                    onClick={() => setFlowStep((prev) => (prev >= 4 ? 1 : prev + 1))}
                    className="btn btn-outline btn-sm text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Avançar Etapa
                  </button>
                </div>

                {/* Stepper de 4 Etapas com Linha de Conexão */}
                <div className="relative flex items-center justify-between mb-8 px-4">
                  <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-[#E5E7EB] z-0" />
                  <div
                    className="absolute left-10 top-1/2 -translate-y-1/2 h-1 bg-[#1A56DB] transition-all duration-500 z-0"
                    style={{ width: `${((flowStep - 1) / 3) * 85}%` }}
                  />

                  {[
                    { step: 1, title: 'Totem', desc: 'Check-in QR Code', time: '08:45' },
                    { step: 2, title: 'Recepção', desc: 'Triagem & Guia', time: '08:52' },
                    { step: 3, title: 'Consultório', desc: 'Atendimento PEP', time: '09:05' },
                    { step: 4, title: 'Laboratório', desc: 'Exames FHIR R4', time: '09:16' },
                  ].map((s) => {
                    const isPassed = flowStep >= s.step;
                    const isCurrent = flowStep === s.step;

                    return (
                      <div
                        key={s.step}
                        onClick={() => setFlowStep(s.step)}
                        className="relative z-10 flex flex-col items-center cursor-pointer group"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                            isCurrent
                              ? 'bg-[#1A56DB] text-white shadow-lg ring-4 ring-[#BFDBFE] scale-110'
                              : isPassed
                              ? 'bg-[#0E9F6E] text-white'
                              : 'bg-[#F3F4F6] text-[#6B7280] border border-[#D1D5DB]'
                          }`}
                        >
                          {isPassed && !isCurrent ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                        </div>
                        <span className="text-xs font-bold text-[#111928] mt-2 group-hover:text-[#1A56DB]">
                          {s.title}
                        </span>
                        <span className="text-[10px] text-[#6B7280]">{s.desc}</span>
                        <span className="text-[10px] font-mono text-[#1A56DB]">{s.time}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Timeline Detalhada da Etapa Ativa */}
                <div className="p-6 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
                  {flowStep === 1 && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1A56DB]">
                        Etapa 1: Check-in no Totem de Autoatendimento
                      </span>
                      <h4 className="text-base font-bold text-[#111928] mt-1">
                        Paciente Ana Carolina realizou leitura do QR Code na Recepção
                      </h4>
                      <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
                        • Senha gerada automaticamente: <strong>A247</strong> • Destino: Consultório 204 (Cardiologia).
                        <br />• O sistema notificou a agenda do Dr. Ricardo Mendes marcando o paciente com a flag <strong>&quot;No Prédio&quot; (RN15)</strong>.
                      </p>
                    </div>
                  )}

                  {flowStep === 2 && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1A56DB]">
                        Etapa 2: Chamada &amp; Triagem na Recepção
                      </span>
                      <h4 className="text-base font-bold text-[#111928] mt-1">
                        Validação de Convênio e Confirmação de Elegibilidade TISS
                      </h4>
                      <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
                        • Autorização de consulta emitida instantaneamente sem fila física.
                        <br />• Paciente orientada a se dirigir ao 2º andar pelo elevador social B.
                      </p>
                    </div>
                  )}

                  {flowStep === 3 && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#057A55]">
                        Etapa 3: Consulta no Prontuário Eletrônico (PEP)
                      </span>
                      <h4 className="text-base font-bold text-[#111928] mt-1">
                        Atendimento Clínico — Dr. Ricardo Mendes (Sala 204)
                      </h4>
                      <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
                        • Anamnese e aferição de sinais vitais gravados no prontuário.
                        <br />• Médico solicitou Hemograma Completo com <strong>pedido digital FHIR ServiceRequest</strong> diretamente para o laboratório do prédio.
                        <br />• Ao término da consulta, a Sala 204 é sinalizada como <strong>&quot;Aguardando Limpeza&quot;</strong> no mapa do administrador.
                      </p>
                    </div>
                  )}

                  {flowStep === 4 && (
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                        Etapa 4: Coleta &amp; Laudo Integrado no Hub
                      </span>
                      <h4 className="text-base font-bold text-[#111928] mt-1">
                        Laboratório Central — Resultado Disponível em Tempo Recorde
                      </h4>
                      <p className="text-xs text-[#4B5563] mt-2 leading-relaxed">
                        • Paciente desce ao térreo para coleta sem necessidade de nova guia ou cadastro.
                        <br />• Laudo assinado com certificado digital e sincronizado no PEP do médico em formato FHIR DiagnosticReport (H5).
                        <br />• <strong>Economia de tempo:</strong> Ciclo completo 3x mais ágil comparado a clínicas tradicionais externas.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. SEÇÕES COMPLEMENTARES (CONTRATOS, FACILITIES, FINANCEIRO GLOBAL) */}
          {activeSection === 'contratos' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm animate-in fade-in">
              <h2 className="text-lg font-bold text-[#111928] mb-2">Gestão de Contratos de Sublocação Predial</h2>
              <p className="text-xs text-[#6B7280] mb-4">6 contratos vigentes de clínicas e centros especializados no edifício</p>
              <div className="space-y-3">
                {[
                  { clinic: 'CardioVida Especialidades Médicas', room: 'Sala 204', lease: 'R$ 8.000/mês', term: '01/01/2026 a 31/12/2027', status: 'Ativo' },
                  { clinic: 'OrthoCenter Traumatologia', room: 'Sala 205', lease: 'R$ 8.000/mês', term: '15/03/2025 a 14/03/2027', status: 'Ativo' },
                  { clinic: 'NeuroExcelência Clínica', room: 'Sala 102', lease: 'R$ 8.000/mês', term: '01/06/2025 a 31/05/2027', status: 'Ativo' },
                ].map((c, i) => (
                  <div key={i} className="p-4 rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-[#111928]">{c.clinic}</h4>
                      <p className="text-[#6B7280]">{c.room} • Vigência: {c.term}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#1A56DB]">{c.lease}</span>
                      <span className="text-[10px] block text-emerald-600 font-bold">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'facilities' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#111928]">Painel de Monitoramento de Facilities</h2>
                <Link href="/facilities" className="btn btn-outline btn-sm text-xs">Abrir App Mobile →</Link>
              </div>
              <p className="text-xs text-[#6B7280] mb-4">Chamados abertos e tempos de higienização por setor</p>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-red-950">Leito 12 — Alta Médica Disparada (RN08)</h4>
                    <p className="text-red-700 text-[11px]">Tipo: Higienização Terminal • Aguardando equipe há 14 min</p>
                  </div>
                  <span className="badge" style={{ background: '#FDE8E8', color: '#C81E1E' }}>Crítico</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-amber-950">Centro Cirúrgico 2 — Limpeza Pós-Procedimento</h4>
                    <p className="text-amber-700 text-[11px]">Em execução pela equipe de Facilities há 28 min</p>
                  </div>
                  <span className="badge" style={{ background: '#FEF9C3', color: '#92400E' }}>Em Andamento</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'financeiro' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm animate-in fade-in">
              <h2 className="text-lg font-bold text-[#111928] mb-2">Financeiro Global do Condomínio Hospitalar</h2>
              <p className="text-xs text-[#6B7280] mb-4">Consolidação de receitas de aluguel, condomínio e rateio de utilities</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-center">
                  <span className="text-xs text-[#6B7280]">Receita Fixa Locações</span>
                  <p className="text-xl font-mono font-bold text-[#111928] mt-1">R$ 304.000,00</p>
                </div>
                <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] text-center">
                  <span className="text-xs text-[#6B7280]">Despesas Operacionais Prédio</span>
                  <p className="text-xl font-mono font-bold text-red-600 mt-1">R$ 112.400,00</p>
                </div>
                <div className="p-4 bg-[#D1FAE5] rounded-xl border border-[#A7F3D0] text-center">
                  <span className="text-xs text-[#057A55] font-semibold">Superávit do Hub</span>
                  <p className="text-xl font-mono font-bold text-[#057A55] mt-1">R$ 191.600,00</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
