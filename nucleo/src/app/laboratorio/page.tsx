'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
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
  tube: 'Roxo (EDTA)' | 'Amarelo (Gel Separador)' | 'Azul (Citrato)' | 'Cinza (Fluoreto)';
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
    collectedAt: '18/09/2026 às 08:30',
    results: [
      { param: 'Glicemia de Jejum', value: '104', ref: '70 - 99', unit: 'mg/dL', abnormal: true },
      { param: 'Colesterol Total', value: '210', ref: '< 190', unit: 'mg/dL', abnormal: true },
      { param: 'Triglicérides', value: '142', ref: '< 150', unit: 'mg/dL', abnormal: false },
      { param: 'HDL Colesterol', value: '48', ref: '> 40', unit: 'mg/dL', abnormal: false },
    ],
  },
  {
    id: 'lab-103',
    patient: 'Fernando Dias Ramos',
    patientAge: 55,
    doctor: 'Dr. Roberto Brandão',
    clinicRoom: 'Leito 201 (Internação)',
    exam: 'Troponina I Ultrassensível & CPK-MB',
    loinc: '49563-0',
    tube: 'Amarelo (Gel Separador)',
    status: 'Pendente',
    tubeColor: '#EAB308',
  },
  {
    id: 'lab-104',
    patient: 'Lucia Helena Alvarenga',
    patientAge: 62,
    doctor: 'Dra. Beatriz Santos',
    clinicRoom: 'Leito 104 (Internação)',
    exam: 'Coagulograma Completo (TP/TTPA/INR)',
    loinc: '5902-2',
    tube: 'Azul (Citrato)',
    status: 'Pendente',
  },
];

export default function LaboratoryPage() {
  const [samples, setSamples] = useState<LabSample[]>(initialSamples);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendente' | 'Em Análise' | 'Liberado'>('Todos');
  const [selectedSample, setSelectedSample] = useState<LabSample | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFhirJsonModal, setShowFhirJsonModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredSamples = samples.filter((s) => {
    const matchesSearch =
      s.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.exam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.loinc.includes(searchTerm);
    const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenReport = (sample: LabSample) => {
    setSelectedSample(sample);
    setShowReportModal(true);
  };

  const handleStartAnalysis = (sample: LabSample) => {
    setSamples((prev) =>
      prev.map((s) =>
        s.id === sample.id
          ? {
              ...s,
              status: 'Em Análise',
              collectedAt: 'Hoje às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            }
          : s
      )
    );
    showToast(`Amostra ${sample.id} (${sample.tube}) colocada na centrífuga de análise.`);
  };

  const handleReleaseReport = () => {
    if (!selectedSample) return;
    setSamples((prev) =>
      prev.map((s) =>
        s.id === selectedSample.id
          ? {
              ...s,
              status: 'Liberado',
              results: s.results || [
                { param: 'Troponina I Ultrassensível', value: '0.012', ref: '< 0.014', unit: 'ng/mL', abnormal: false },
                { param: 'CPK-MB Massa', value: '2.4', ref: '< 5.0', unit: 'ng/mL', abnormal: false },
              ],
            }
          : s
      )
    );
    setShowReportModal(false);
    showToast(
      `Laudo do exame "${selectedSample.exam}" assinado e liberado! Notificação FHIR DiagnosticReport enviada ao Dr. ${selectedSample.doctor}.`
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#111928]">
      <HospitalNav />

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1E3A5F] text-white px-5 py-3 rounded-xl shadow-2xl border border-[#3B82F6] flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#0E9F6E]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-300 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Laboratório */}
      <div className="bg-[#7C3AED] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-purple-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-purple-200 hover:text-white mb-2 transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Seleção de Módulos</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-900/80 rounded-xl border border-purple-600">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Laboratório Central &amp; LIS do Hub (FHIR R4)
                </h1>
                <p className="text-xs text-purple-200 mt-0.5">
                  Bancada Técnica Automatizada • Protocolo HL7 / FHIR R4 • DiagnosticReport &amp; Observation
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-900/90 border border-purple-600 text-purple-100 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Interface LIS Conectada
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Banner de Interoperabilidade com Médicos */}
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5B21B6] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Sparkles className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <strong className="text-sm font-bold block">
                Interoperabilidade em Tempo Real com Consultórios &amp; Internação
              </strong>
              <p className="mt-0.5 text-purple-700">
                Assim que um laudo é liberado aqui, o médico visualiza instantaneamente os valores de referência e o PDF timbrado no prontuário do paciente.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFhirJsonModal(true)}
            className="px-3.5 py-1.5 bg-[#7C3AED] hover:bg-purple-800 text-white rounded-xl font-mono text-xs font-bold whitespace-nowrap shadow-xs"
          >
            Ver Payload FHIR R4
          </button>
        </div>

        {/* Fila de Exames com Filtros e Ações */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#F3F4F6] gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-[#111928]">
                Bancada de Triagem e Amostras Biológicas
              </h3>
              <p className="text-xs text-[#6B7280]">
                Acompanhe a chegada dos tubos, processamento bioquímico e liberação de laudos
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Filtro de Status */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['Todos', 'Pendente', 'Em Análise', 'Liberado'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      statusFilter === st
                        ? 'bg-white text-[#111928] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Input Busca */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar exame ou paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-[#D1D5DB] text-xs outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>
          </div>

          {/* Tabela de Amostras */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F9FAFB] text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-4">Paciente</th>
                  <th className="py-3 px-4">Procedimento / LOINC</th>
                  <th className="py-3 px-4">Tubo Coletado</th>
                  <th className="py-3 px-4">Médico / Origem</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ação Técnica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-[#374151]">
                {filteredSamples.map((sample) => (
                  <tr key={sample.id} className="hover:bg-[#F9FAFB]">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#111928] block">{sample.patient}</span>
                      <span className="text-[10px] text-slate-500">{sample.patientAge} anos</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#111928] block">{sample.exam}</span>
                      <span className="font-mono text-[10px] text-[#7C3AED] bg-purple-50 px-1.5 py-0.5 rounded">
                        LOINC {sample.loinc}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                        {sample.tube}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold block">{sample.doctor}</span>
                      <span className="text-[10px] text-slate-500">{sample.clinicRoom}</span>
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
                          className="px-3 py-1.5 rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 font-bold flex items-center gap-1 ml-auto shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver Laudo
                        </button>
                      ) : sample.status === 'Em Análise' ? (
                        <button
                          onClick={() => handleOpenReport(sample)}
                          className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-purple-800 text-white font-bold flex items-center gap-1 ml-auto shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" /> Digitar Laudo
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartAnalysis(sample)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1 ml-auto shadow-xs"
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
      </main>

      {/* =========================================================================
          MODAL: DIGITAÇÃO & VALIDAÇÃO DE LAUDO LABORATORIAL
         ========================================================================= */}
      {showReportModal && selectedSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#7C3AED] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-purple-200" />
                  Laudo Laboratorial — {selectedSample.exam}
                </h3>
                <p className="text-xs text-purple-100 mt-0.5">
                  Paciente: <strong>{selectedSample.patient}</strong> • Solicitante: {selectedSample.doctor}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg hover:bg-purple-800 text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#5B21B6]">Amostra Biológica: {selectedSample.tube}</p>
                  <p className="text-[11px] text-purple-700">Coletado: {selectedSample.collectedAt || 'Hoje às 08:30'}</p>
                </div>
                <span className="font-mono text-xs font-bold text-purple-800 bg-white px-2 py-0.5 rounded border border-purple-200">
                  LOINC {selectedSample.loinc}
                </span>
              </div>

              {/* Tabela de Parâmetros com Comparação aos Valores de Referência */}
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FAFB] text-[#6B7280] text-[11px] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="p-3">Parâmetro Bioquímico</th>
                      <th className="p-3">Resultado</th>
                      <th className="p-3">Valor de Referência</th>
                      <th className="p-3 text-center">Conclusão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {(selectedSample.results || [
                      { param: 'Troponina I Ultrassensível', value: '0.012', ref: '< 0.014', unit: 'ng/mL', abnormal: false },
                      { param: 'CPK-MB Massa', value: '2.4', ref: '< 5.0', unit: 'ng/mL', abnormal: false },
                    ]).map((r, i) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-[#111928]">{r.param}</td>
                        <td className="p-3 font-mono font-bold text-[#111928]">
                          {r.value} {r.unit}
                        </td>
                        <td className="p-3 font-mono text-[#6B7280]">{r.ref} {r.unit}</td>
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
                <label className="font-bold text-[#374151] block mb-1">
                  Parecer do Bioquímico / Patologista Clínico:
                </label>
                <textarea
                  rows={2}
                  defaultValue="Exame processado por quimioluminescência automatizada com controles normais validados."
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] text-slate-600">Responsável Técnico: Dra. Fernanda Vasconcelos (CRBM 14920/SP)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Hash: 8a9f...c4e1</span>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
              <span className="text-xs text-slate-500">
                A liberação dispara o evento FHIR DiagnosticReport automaticamente
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Voltar
                </button>
                <button
                  onClick={handleReleaseReport}
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Liberar &amp; Transmitir Laudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PAYLOAD FHIR R4 DIAGNOSTICREPORT
         ========================================================================= */}
      {showFhirJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#111928] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-mono font-bold text-emerald-400">
                  FHIR R4 — DiagnosticReport Resource
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Padrão internacional de mensageria em saúde (HL7 International)
                </p>
              </div>
              <button
                onClick={() => setShowFhirJsonModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-[#0C111D] text-emerald-400 font-mono text-[11px] overflow-y-auto max-h-[450px]">
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

            <div className="p-4 border-t border-slate-800 bg-[#111928] flex justify-end">
              <button
                onClick={() => setShowFhirJsonModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
