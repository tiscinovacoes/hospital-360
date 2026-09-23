'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { ModuloMenuLateral, MenuLateralItem } from '@/components/ModuloMenuLateral';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
import {
  FlaskConical,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Download,
  AlertCircle,
  Eye,
  Check,
  Send,
  X,
  Menu,
  Sparkles,
  QrCode,
  ShieldCheck,
  Filter,
  Play,
  Share2,
} from 'lucide-react';

interface LabSample {
  id: string;
  patient: string;
  patientAge: number;
  doctor: string;
  clinicRoom: string;
  exam: string;
  loinc: string;
  tube: 'Roxo (EDTA)' | 'Amarelo (Gel Separador)' | 'Azul (Citrato)' | 'Cinza (Fluoreto)' | 'Verde (Heparina)';
  status: 'Pendente' | 'Em Análise' | 'Liberado';
  tubeColor?: string;
  collectedAt?: string;
  results?: { param: string; value: string; ref: string; unit: string; abnormal: boolean }[];
}

const initialSamples: LabSample[] = [
  {
    id: 'lab-101',
    patient: 'Ana Carolina Souza',
    patientAge: 34,
    doctor: 'Dr. Ricardo Mendes',
    clinicRoom: 'Sala 204',
    exam: 'Hemograma Completo com Plaquetas',
    loinc: '58410-2',
    tube: 'Roxo (EDTA)',
    status: 'Liberado',
    collectedAt: '18/09/2026 às 07:15',
    results: [
      { param: 'Hemoglobina', value: '13.8', ref: '12.0 - 16.0', unit: 'g/dL', abnormal: false },
      { param: 'Hematócrito', value: '41.2', ref: '36.0 - 48.0', unit: '%', abnormal: false },
      { param: 'Leucócitos Totais', value: '6.400', ref: '4.000 - 11.000', unit: '/mm³', abnormal: false },
      { param: 'Plaquetas', value: '245.000', ref: '150.000 - 450.000', unit: '/mm³', abnormal: false },
    ],
  },
  {
    id: 'lab-102',
    patient: 'Carlos Eduardo Lima',
    patientAge: 52,
    doctor: 'Dr. Ricardo Mendes',
    clinicRoom: 'Sala 204',
    exam: 'Lipidograma Completo & Glicemia de Jejum',
    loinc: '24331-1',
    tube: 'Amarelo (Gel Separador)',
    status: 'Em Análise',
    collectedAt: '18/09/2026 às 07:30',
    results: [
      { param: 'Glicemia em Jejum', value: '142', ref: '70 - 99', unit: 'mg/dL', abnormal: true },
      { param: 'Colesterol Total', value: '230', ref: '< 190', unit: 'mg/dL', abnormal: true },
      { param: 'Triglicerídeos', value: '180', ref: '< 150', unit: 'mg/dL', abnormal: true },
      { param: 'HDL Colesterol', value: '38', ref: '> 40', unit: 'mg/dL', abnormal: true },
    ],
  },
  {
    id: 'lab-103',
    patient: 'Mariana Duarte Prado',
    patientAge: 28,
    doctor: 'Dra. Camila Ribeiro',
    clinicRoom: 'Sala 102',
    exam: 'Beta HCG Quantitativo Soro',
    loinc: '21198-7',
    tube: 'Amarelo (Gel Separador)',
    status: 'Pendente',
    collectedAt: '18/09/2026 às 08:10',
  },
  {
    id: 'lab-104',
    patient: 'João Batista Ferreira',
    patientAge: 67,
    doctor: 'Dra. Camila Ribeiro',
    clinicRoom: 'Sala 102',
    exam: 'Troponina I Ultrassensível & CPK-MB',
    loinc: '49563-0',
    tube: 'Verde (Heparina)',
    status: 'Em Análise',
    collectedAt: '18/09/2026 às 08:15',
    results: [
      { param: 'Troponina I', value: '0.045', ref: '< 0.014', unit: 'ng/mL', abnormal: true },
      { param: 'CPK-MB Massa', value: '7.8', ref: '< 5.0', unit: 'ng/mL', abnormal: true },
    ],
  },
  {
    id: 'lab-105',
    patient: 'Beatriz Vasconcelos',
    patientAge: 41,
    doctor: 'Dr. Lucas Silveira',
    clinicRoom: 'Sala 305',
    exam: 'Coagulograma Completo (TP, TTPA, Fibrinogênio)',
    loinc: '3187-2',
    tube: 'Azul (Citrato)',
    status: 'Pendente',
    collectedAt: '18/09/2026 às 08:40',
  },
];

export default function LabHubPage() {
  const roles = MODULO_ROLES_CATALOG['laboratorio'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [abaAtiva, setAbaAtiva] = useState<'bancada' | 'panico' | 'fhir' | 'perfis'>('bancada');
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const menuItens: MenuLateralItem[] = [
    { id: 'bancada', label: 'Bancada Técnica & Amostras', icon: FlaskConical },
    { id: 'panico', label: 'Valores de Pânico', icon: AlertCircle },
    { id: 'perfis', label: 'Perfis & Matriz RBAC', icon: ShieldCheck },
  ];
  const [samples, setSamples] = useState<LabSample[]>(initialSamples);
  const [selectedSample, setSelectedSample] = useState<LabSample | null>(null);
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendente' | 'Em Análise' | 'Liberado'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFhirJsonModal, setShowFhirJsonModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredSamples = samples.filter((s) => {
    const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
    const matchesSearch =
      s.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.exam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStartAnalysis = (sample: LabSample) => {
    setSamples((prev) =>
      prev.map((item) => (item.id === sample.id ? { ...item, status: 'Em Análise' } : item))
    );
    setActionSuccess(`Amostra de ${sample.patient} enviada para os analisadores bioquímicos.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleOpenReport = (sample: LabSample) => {
    setSelectedSample(sample);
    setShowReportModal(true);
  };

  const handleReleaseReport = () => {
    if (!selectedSample) return;
    if (!hasPermission(activeRole, 'APPROVE')) {
      setActionSuccess('Atenção: Seu perfil não possui permissão para assinar e liberar laudos laboratoriais.');
      setTimeout(() => setActionSuccess(null), 4000);
      return;
    }
    setSamples((prev) =>
      prev.map((item) => (item.id === selectedSample.id ? { ...item, status: 'Liberado' } : item))
    );
    setShowReportModal(false);
    setActionSuccess(`Laudo de ${selectedSample.patient} assinado digitalmente e transmitido via FHIR R4.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <>
      <PageHeader
        activeTitle="Laboratório Central & LIS do Hub (FHIR R4)"
        activeSubtitle="Bancada técnica automatizada com protocolo HL7 / FHIR R4 e DiagnosticReport"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
              title={sidebarAberta ? 'Recolher menu' : 'Expandir menu'}
              aria-label={sidebarAberta ? 'Recolher menu' : 'Expandir menu'}
              aria-expanded={sidebarAberta}
            >
              {sidebarAberta ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <button
              aria-label="Ver Payload FHIR R4"
              title="Ver Payload FHIR R4"
              onClick={() => setShowFhirJsonModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-xs font-bold text-slate-700 bg-white border border-[#E0E0E0] rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#C1622D]" />
              <span className="hidden lg:inline">Ver Payload FHIR R4</span>
            </button>
          </div>
        }
      />

      <div className="flex flex-1 relative overflow-x-clip">
        <ModuloMenuLateral
          titulo="Laboratório & LIS"
          moduloId="laboratorio"
          itens={menuItens}
          ativoId={abaAtiva}
          onSelect={(id) => setAbaAtiva(id as typeof abaAtiva)}
          aberto={sidebarAberta}
          onFechar={() => setSidebarAberta(false)}
        />

        <main className="flex-1 min-w-0 p-4 lg:p-6 space-y-6">
      {/* PERFIS & MATRIZ RBAC — só aparece na seção "Perfis" do menu lateral, não em todas as telas */}
      {abaAtiva === 'perfis' && (
        <ModuloRbacBar
          moduloId="laboratorio"
          activeRole={activeRole}
          onRoleChange={setActiveRole}
          accentColor="#C1622D"
          lightBg="bg-[#C1622D]/[0.08]"
          lightBorder="border-[#C1622D]/20"
        />
      )}

      {actionSuccess && (
        <div className="mb-6 p-4 bg-[#C1622D]/[0.08] border border-[#C1622D]/20 rounded-2xl flex items-center justify-between text-xs text-[#A8531F] animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C1622D]" />
            <span className="font-bold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-[#C1622D] hover:text-[#C1622D] min-w-[36px] min-h-[36px] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ABA PERFIS */}
      {abaAtiva === 'perfis' && (
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs mb-6">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Perfis de Acesso do Módulo Laboratório Clínico (LIS)
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Atribuições de coleta, liberação de laudos com assinatura digital e controle de qualidade SBPC/ML.
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
      )}

      {/* ABA VALORES DE PÂNICO */}
      {abaAtiva === 'panico' && (
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Protocolo Institucional de Valores de Pânico (Critical Panic Values)
              </h3>
              <p className="text-xs text-slate-500">
                Comunicação imediata à equipe assistencial em menos de 15 minutos com registro de recebimento.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl flex items-start justify-between">
              <div>
                <strong className="text-rose-900 block text-sm">Troponina I Ultrassensível: 4.820 ng/L (Ref &lt; 14 ng/L)</strong>
                <span className="text-slate-600 mt-1 block">Paciente: João Batista Ferreira (Leito 08 - UTI) • Médico: Dr. Ricardo Mendes</span>
              </div>
              <span className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg text-[10px]">
                Notificado UTI às 08:22
              </span>
            </div>
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start justify-between">
              <div>
                <strong className="text-amber-900 block text-sm">Potássio Sérico: 6.8 mEq/L (Ref 3.5 - 5.0 mEq/L)</strong>
                <span className="text-slate-600 mt-1 block">Paciente: Mariana Duarte Prado • Médica: Dra. Camila Ribeiro</span>
              </div>
              <span className="px-2.5 py-1 bg-amber-500 text-white font-bold rounded-lg text-[10px]">
                Notificado às 08:35
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Banner de Interoperabilidade com Médicos */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-700 shadow-sm mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#C1622D] flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-sm font-bold text-slate-900 block">
              Interoperabilidade em Tempo Real com Consultórios &amp; Internação
            </strong>
            <p className="mt-0.5 text-slate-500">
              Assim que um laudo é liberado aqui, o médico visualiza instantaneamente os valores de referência e o PDF timbrado no prontuário do paciente.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFhirJsonModal(true)}
          className="px-3.5 py-2 bg-[#C1622D] hover:bg-blue-700 text-white rounded-xl font-mono text-xs font-bold whitespace-nowrap shadow-sm transition-all"
        >
          Ver FHIR R4
        </button>
      </div>

      {/* Fila de Exames com Filtros e Ações */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Bancada de Triagem e Amostras Biológicas
            </h3>
            <p className="text-xs text-slate-400">
              Acompanhe a chegada dos tubos, processamento bioquímico e liberação de laudos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Filtro de Status */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['Todos', 'Pendente', 'Em Análise', 'Liberado'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Input Busca */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar exame ou paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-[#C1622D]"
              />
            </div>
          </div>
        </div>

        {/* Tabela de Amostras */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Paciente</th>
                <th className="py-3 px-4">Procedimento / LOINC</th>
                <th className="py-3 px-4">Tubo Coletado</th>
                <th className="py-3 px-4">Médico / Origem</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Ação Técnica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSamples.map((sample) => (
                <tr key={sample.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{sample.patient}</span>
                    <span className="text-[10px] text-slate-400">{sample.patientAge} anos</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{sample.exam}</span>
                    <span className="font-mono text-[10px] text-[#C1622D] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      LOINC {sample.loinc}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                      {sample.tube}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold block">{sample.doctor}</span>
                    <span className="text-[10px] text-slate-400">{sample.clinicRoom}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        sample.status === 'Liberado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sample.status === 'Em Análise'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {sample.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {sample.status === 'Liberado' ? (
                      <button
                        onClick={() => handleOpenReport(sample)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1 ml-auto shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C1622D]" /> Ver Laudo
                      </button>
                    ) : sample.status === 'Em Análise' ? (
                      <button
                        onClick={() => handleOpenReport(sample)}
                        className="px-3 py-1.5 rounded-xl bg-[#C1622D] hover:bg-blue-700 text-white font-bold flex items-center gap-1 ml-auto shadow-xs transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Digitar Laudo
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartAnalysis(sample)}
                        className="px-3 py-1.5 rounded-xl bg-marca-forte hover:bg-marca-hover text-white font-bold flex items-center gap-1 ml-auto shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" /> Iniciar Análise
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: DIGITAÇÃO & VALIDAÇÃO DE LAUDO LABORATORIAL */}
      {showReportModal && selectedSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#C1622D] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-blue-200" />
                  Laudo Laboratorial — {selectedSample.exam}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Paciente: <strong>{selectedSample.patient}</strong> • Solicitante: {selectedSample.doctor}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg hover:bg-blue-700 text-blue-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#C1622D]">Amostra Biológica: {selectedSample.tube}</p>
                  <p className="text-[11px] text-slate-600">Coletado: {selectedSample.collectedAt || 'Hoje às 08:30'}</p>
                </div>
                <span className="font-mono text-xs font-bold text-[#C1622D] bg-white px-2 py-0.5 rounded border border-blue-200">
                  LOINC {selectedSample.loinc}
                </span>
              </div>

              {/* Tabela de Parâmetros com Comparação aos Valores de Referência */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Parâmetro Bioquímico</th>
                      <th className="p-3">Resultado</th>
                      <th className="p-3">Valor de Referência</th>
                      <th className="p-3 text-center">Conclusão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedSample.results || [
                      { param: 'Troponina I Ultrassensível', value: '0.012', ref: '< 0.014', unit: 'ng/mL', abnormal: false },
                      { param: 'CPK-MB Massa', value: '2.4', ref: '< 5.0', unit: 'ng/mL', abnormal: false },
                    ]).map((r, i) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-slate-900">{r.param}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {r.value} {r.unit}
                        </td>
                        <td className="p-3 font-mono text-slate-500">{r.ref} {r.unit}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.abnormal ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {r.abnormal ? 'Alterado' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2">
                <label className="font-bold text-slate-800 block mb-1">
                  Parecer do Bioquímico / Patologista Clínico:
                </label>
                <textarea
                  rows={2}
                  defaultValue="Exame processado por quimioluminescência automatizada com controles normais validados."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#C1622D]"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] text-slate-600">Responsável Técnico: Dra. Fernanda Vasconcelos (CRBM 14920/SP)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Hash: 8a9f...c4e1</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                A liberação dispara o evento FHIR DiagnosticReport automaticamente
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white"
                >
                  Voltar
                </button>
                <button
                  onClick={handleReleaseReport}
                  className="px-5 py-2.5 min-h-[44px] bg-[#C1622D] hover:bg-[#A8531F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Liberar &amp; Transmitir Laudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAYLOAD FHIR R4 */}
      {showFhirJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E0E0E0] shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#C1622D] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-mono font-bold text-white">
                  FHIR R4 — DiagnosticReport Resource
                </h3>
                <p className="text-xs text-[#C1622D]/[0.12] mt-0.5">
                  Padrão internacional de mensageria em saúde (HL7 International)
                </p>
              </div>
              <button
                onClick={() => setShowFhirJsonModal(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-slate-50 text-slate-800 font-mono text-[11px] overflow-y-auto max-h-[450px] border-b border-[#E0E0E0]">
              <pre>
{JSON.stringify(
  {
    resourceType: 'DiagnosticReport',
    id: 'dr-2026-99124',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'LAB',
            display: 'Laboratory',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '58410-2',
          display: 'Hemograma Completo com Plaquetas',
        },
      ],
    },
    subject: {
      reference: 'Patient/p-1',
      display: 'Ana Carolina Souza',
    },
    effectiveDateTime: '2026-09-18T07:15:00-04:00',
    issued: '2026-09-18T08:44:12-04:00',
    performer: [
      {
        reference: 'Practitioner/crbm-14920',
        display: 'Dra. Fernanda Vasconcelos - CRBM 14920/SP',
      },
    ],
    result: [
      { reference: 'Observation/loinc-58410-hb', display: 'Hemoglobina: 13.8 g/dL' },
      { reference: 'Observation/loinc-58410-leuco', display: 'Leucócitos: 6.400 /mm³' },
      { reference: 'Observation/loinc-58410-plaq', display: 'Plaquetas: 245.000 /mm³' },
    ],
    conclusion: 'Série vermelha e contagem plaquetária dentro dos padrões normais de referência.',
  },
  null,
  2
)}
              </pre>
            </div>

            <div className="p-4 bg-white flex justify-end">
              <button
                onClick={() => setShowFhirJsonModal(false)}
                className="px-5 py-2.5 min-h-[44px] bg-[#C1622D] hover:bg-[#A8531F] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </>
  );
}
