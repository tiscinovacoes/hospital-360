'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
import {
  Stethoscope,
  Clock,
  User,
  AlertCircle,
  FileText,
  FlaskConical,
  Printer,
  Save,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Heart,
  Thermometer,
  Activity,
  Weight,
  Send,
  X,
  Search,
  ShieldCheck,
  QrCode,
  Pill,
  Sparkles,
  AlertTriangle,
  History,
  Eye,
  Check,
  ChevronRight,
  Download,
  Share2,
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  time: string;
  complaint: string;
  status: 'Finalizado' | 'Em Atendimento' | 'Na Espera';
  bloodType: string;
  allergies: string[];
  vitals: { pa: string; temp: string; fc: string; peso: string; spo2: string };
  history: { date: string; title: string; doctor: string; summary: string }[];
}

const mockPatients: Patient[] = [
  {
    id: 'p-1',
    name: 'Ana Carolina Souza',
    age: 34,
    time: '08:30',
    complaint: 'Palpitações e dor torácica atípica',
    status: 'Em Atendimento',
    bloodType: 'O+',
    allergies: ['Penicilina', 'Dipirona'],
    vitals: { pa: '120/80 mmHg', temp: '36.5 °C', fc: '78 bpm', peso: '64 kg', spo2: '99%' },
    history: [
      {
        date: '12/08/2026',
        title: 'Consulta Cardiológica Inicial',
        doctor: 'Dr. Ricardo Mendes (CRM 45892/SP)',
        summary: 'Paciente relatou episódios esporádicos de taquicardia em repouso. ECG inicial com ritmo sinusal sem alterações isquêmicas.',
      },
      {
        date: '28/05/2026',
        title: 'Exame Laboratorial de Rotina',
        doctor: 'Laboratório Central Hub 360',
        summary: 'Colesterol Total: 190 mg/dL, HDL: 52 mg/dL, Triglicérides: 135 mg/dL. Parâmetros normais.',
      },
    ],
  },
  {
    id: 'p-2',
    name: 'Carlos Eduardo Lima',
    age: 52,
    time: '09:15',
    complaint: 'Acompanhamento de hipertensão arterial',
    status: 'Na Espera',
    bloodType: 'A+',
    allergies: ['Nenhuma relatada'],
    vitals: { pa: '142/92 mmHg', temp: '36.7 °C', fc: '84 bpm', peso: '82 kg', spo2: '97%' },
    history: [
      {
        date: '10/06/2026',
        title: 'Ajuste de Anti-hipertensivo',
        doctor: 'Dr. Ricardo Mendes',
        summary: 'Aumentada dose de Losartana para 50mg 1x ao dia. Monitoramento domiciliar de PA solicitado.',
      },
    ],
  },
  {
    id: 'p-3',
    name: 'Mariana Duarte',
    age: 28,
    time: '10:00',
    complaint: 'Check-up preventivo pré-maratona',
    status: 'Na Espera',
    bloodType: 'B+',
    allergies: ['Sulfa'],
    vitals: { pa: '110/70 mmHg', temp: '36.4 °C', fc: '62 bpm', peso: '58 kg', spo2: '99%' },
    history: [
      {
        date: '15/01/2026',
        title: 'Avaliação Ergométrica',
        doctor: 'Dr. Ricardo Mendes',
        summary: 'Teste ergométrico em esteira com excelente capacidade cardiorrespiratória (14 METs). Apta a treinos.',
      },
    ],
  },
  {
    id: 'p-4',
    name: 'José Roberto Ferreira',
    age: 67,
    time: '08:00',
    complaint: 'Pós-operatório de revascularização miocárdica',
    status: 'Finalizado',
    bloodType: 'O-',
    allergies: ['Contraste iodado'],
    vitals: { pa: '130/80 mmHg', temp: '36.6 °C', fc: '68 bpm', peso: '76 kg', spo2: '96%' },
    history: [
      {
        date: '02/09/2026',
        title: 'Retorno Pós-Cirúrgico 30 dias',
        doctor: 'Dr. Ricardo Mendes',
        summary: 'Cicatrização esternotômica excelente. Paciente em reabilitação cardiopulmonar fase II.',
      },
    ],
  },
];

const availableExams = [
  { id: 'loinc-1', code: '58410-2', name: 'Hemograma Completo com Plaquetas', cat: 'Hematologia', urgent: false },
  { id: 'loinc-2', code: '2345-7', name: 'Glicemia de Jejum', cat: 'Bioquímica', urgent: false },
  { id: 'loinc-3', code: '2093-3', name: 'Colesterol Total e Frações (Lipidograma)', cat: 'Bioquímica', urgent: false },
  { id: 'loinc-4', code: '49563-0', name: 'Troponina I Ultrassensível', cat: 'Cardiologia', urgent: true },
  { id: 'loinc-5', code: '30522-7', name: 'Proteína C-Reativa (PCR) Ultrassensível', cat: 'Imunologia', urgent: false },
  { id: 'loinc-6', code: '11524-6', name: 'Eletrocardiograma de 12 Derivações (ECG)', cat: 'Cardiologia', urgent: true },
  { id: 'loinc-7', code: '24601-7', name: 'Ecocardiograma Transtorácico com Doppler', cat: 'Imagem', urgent: false },
  { id: 'loinc-8', code: '718-7', name: 'Hemoglobina Glicada (HbA1c)', cat: 'Bioquímica', urgent: false },
];

const availableMedications = [
  { id: 'med-1', name: 'Atenolol 50mg', presentation: 'Comprimido oral', posology: 'Tomar 1 comp pela manhã em jejum por 30 dias' },
  { id: 'med-2', name: 'Losartana Potássica 50mg', presentation: 'Comprimido oral', posology: 'Tomar 1 comp 1x ao dia (pela manhã)' },
  { id: 'med-3', name: 'AAS Infantil 100mg', presentation: 'Comprimido mastigável', posology: 'Tomar 1 comp após o almoço' },
  { id: 'med-4', name: 'Rosuvastatina 10mg', presentation: 'Comprimido revestido', posology: 'Tomar 1 comp à noite ao deitar' },
  { id: 'med-5', name: 'Dipirona Sódica 500mg', presentation: 'Comprimido oral', posology: 'Tomar 1 comp até de 6/6h em caso de dor ou febre' },
  { id: 'med-6', name: 'Amoxicilina 500mg', presentation: 'Cápsula oral', posology: 'Tomar 1 cápsula de 8/8h por 7 dias' },
];

export default function MedicalEHRPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient>(mockPatients[0]);
  const [evolution, setEvolution] = useState(
    'Paciente refere alívio das queixas de palpitações após início de atenolol. Nega dispneia paroxística noturna ou ortopneia. Ao exame físico: BEG, corada, hidratada, acianótica. AC: RCR em 2T, bulhas normofonéticas sem sopros audíveis. AP: MV presente bilateralmente sem ruídos adventícios. Conduta: mantida prescrição, solicitado ECG de controle e lipidograma no LIS do hub.'
  );
  const [prescription, setPrescription] = useState(
    '1. Atenolol 50mg — Tomar 1 comprimido pela manhã em jejum por 30 dias.\n2. AAS 100mg — Tomar 1 comprimido após o almoço continuadamente.'
  );

  // Estados de Toast e Salvar
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Modais de UX Senior
  const [showExamModal, setShowExamModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showLabResultModal, setShowLabResultModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Estados do Modal de Exames FHIR
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>(['loinc-1', 'loinc-4']);
  const [examSearch, setExamSearch] = useState('');
  const [examClinicalIndication, setExamClinicalIndication] = useState('Investigação de arritmia supraventricular e rastreio de síndrome coronariana aguda.');
  const [examUrgency, setExamUrgency] = useState<'routine' | 'urgent'>('routine');
  const [examJsonTab, setExamJsonTab] = useState(false);

  // Estados do Modal de Atestado
  const [certType, setCertType] = useState<'afastamento' | 'comparecimento' | 'aptidao'>('afastamento');
  const [certDays, setCertDays] = useState(3);
  const [certCid, setCertCid] = useState('R07.2 - Dor precordial');
  const [certObservations, setCertObservations] = useState('Paciente necessita de repouso domiciliar e realização de exames complementares.');
  const [certSigned, setCertSigned] = useState(false);

  // Estados do Modal de Prescrição com Verificação de Alergia
  const [selectedMedId, setSelectedMedId] = useState('');
  const [allergyAlert, setAllergyAlert] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveEvolution = () => {
    setIsSaved(true);
    showToast('Evolução clínica SOAP gravada no prontuário eletrônico com hash de auditoria.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const toggleExam = (id: string) => {
    setSelectedExamIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendFHIRExams = () => {
    setShowExamModal(false);
    showToast(
      `FHIR ServiceRequest transmitido ao Laboratório Hub! ${selectedExamIds.length} exames gerados com sucesso.`
    );
  };

  const handleSelectMedication = (medId: string) => {
    setSelectedMedId(medId);
    const med = availableMedications.find((m) => m.id === medId);
    if (!med) return;

    // Checagem de alergia
    if (med.name.toLowerCase().includes('dipirona') && selectedPatient.allergies.includes('Dipirona')) {
      setAllergyAlert('ALERTA CRÍTICO DE SEGURANÇA (RN09): Paciente possui alergia documentada a DIPIRONA!');
    } else if (med.name.toLowerCase().includes('amoxicilina') && selectedPatient.allergies.includes('Penicilina')) {
      setAllergyAlert('ALERTA CRÍTICO DE SEGURANÇA (RN09): Amoxicilina possui reação cruzada com alergia a PENICILINA!');
    } else {
      setAllergyAlert(null);
    }
  };

  const handleAddMedicationToPrescription = () => {
    const med = availableMedications.find((m) => m.id === selectedMedId);
    if (!med) return;

    if (allergyAlert) {
      if (!confirm('ATENÇÃO: Risco alérgico detectado. Deseja realmente sobrepor o alerta de segurança do protocolo RN09?')) {
        return;
      }
    }

    setPrescription((prev) => `${prev}\n• ${med.name} — ${med.posology}`);
    setShowPrescriptionModal(false);
    showToast(`Medicamento "${med.name}" adicionado à prescrição com assinatura digital.`);
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

      {/* Header PEP Médico com padrão visual hospitalar */}
      <div className="bg-[#059669] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-emerald-700 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-100 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Seleção de Módulos</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-800/80 rounded-xl border border-emerald-600">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Prontuário Eletrônico do Paciente (PEP 360°)
                </h1>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Consultório Cardiológico • Dr. Ricardo Mendes (CRM 45892/SP) — Sala 204
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800/90 border border-emerald-600 text-white flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              Atendimento em Andamento
            </span>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#059669] hover:bg-emerald-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <History className="w-3.5 h-3.5" />
              Histórico do Paciente
            </button>
          </div>
        </div>
      </div>

      {/* Banner de Resultado de Exame Disponível no Hub */}
      <div className="bg-[#D1FAE5] border-b border-[#A7F3D0] px-4 py-2.5 text-xs text-[#057A55]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#0E9F6E] flex-shrink-0 animate-bounce" />
            <span className="font-bold">Resultado de Exame Liberado no Hub:</span>
            <span>Hemograma e Lipidograma da paciente Ana Carolina acabaram de ser validados pelo Laboratório Central (FHIR R4).</span>
          </div>
          <button
            onClick={() => setShowLabResultModal(true)}
            className="font-bold underline hover:text-[#065F46] text-left sm:text-right flex items-center gap-1"
          >
            <span>Visualizar Laudo no Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layout Principal de 3 Colunas com UX Ergonômica */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna 1: Fila de Pacientes do Dia (3 colunas em lg) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F3F4F6]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#1A56DB]" /> Fila de Espera
              </h3>
              <span className="text-[11px] font-mono text-[#1A56DB] font-bold bg-[#EBF0FB] px-2 py-0.5 rounded-full">
                {mockPatients.length} consultas
              </span>
            </div>

            <div className="space-y-2.5">
              {mockPatients.map((p) => {
                const isSelected = selectedPatient.id === p.id;
                let statusBadge = 'bg-[#EBF0FB] text-[#1A56DB]';
                if (p.status === 'Finalizado') statusBadge = 'bg-[#E5E7EB] text-[#374151]';
                if (p.status === 'Em Atendimento') statusBadge = 'bg-[#D1FAE5] text-[#057A55] font-bold ring-1 ring-emerald-400';

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-[#059669] bg-[#F0FDF4] shadow-md ring-1 ring-[#059669]'
                        : 'border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                      <span className="text-[#6B7280] flex items-center gap-1 font-bold">
                        <Clock className="w-3 h-3 text-[#1A56DB]" /> {p.time}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusBadge}`}>
                        {p.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#111928]">{p.name}</h4>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-1">{p.complaint}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#9CA3AF] border-t border-slate-100 pt-1">
                      <span>{p.age} anos</span>
                      <span className="font-mono font-bold text-[#1A56DB]">{p.bloodType}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Hub Status */}
          <div className="bg-[#1E3A5F] text-white p-4 rounded-2xl shadow-sm text-xs">
            <div className="flex items-center gap-2 mb-2 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Integração Hub 360 Ativa</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Os pedidos de exame e medicações são sincronizados via FHIR R4 diretamente com o LIS do laboratório e farmácia central.
            </p>
          </div>
        </div>

        {/* Coluna 2: Prontuário & Atendimento Clínico (6 colunas em lg) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Ficha Rápida do Paciente & Painel de Sinais Vitais */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b border-[#F3F4F6] gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#111928]">
                    {selectedPatient.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-[#EBF0FB] text-[#1A56DB]">
                    {selectedPatient.bloodType}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {selectedPatient.age} anos • Convênio Unimed Nacional Especial • Matrícula: 9812401-02
                </p>
                <p className="text-xs text-[#1E3A5F] mt-1 font-medium">
                  <strong>Queixa Principal:</strong> {selectedPatient.complaint}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#057A55] border border-emerald-200">
                  {selectedPatient.status}
                </span>
              </div>
            </div>

            {/* Grid de Sinais Vitais Coletados na Triagem */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4 text-center">
              <div className="p-2.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-rose-300 transition-colors">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[#6B7280]">
                  <Activity className="w-3.5 h-3.5 text-rose-500" /> PA
                </div>
                <p className="font-mono text-xs font-bold text-[#111928] mt-1">
                  {selectedPatient.vitals.pa}
                </p>
              </div>

              <div className="p-2.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-amber-300 transition-colors">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[#6B7280]">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp.
                </div>
                <p className="font-mono text-xs font-bold text-[#111928] mt-1">
                  {selectedPatient.vitals.temp}
                </p>
              </div>

              <div className="p-2.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-red-300 transition-colors">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[#6B7280]">
                  <Heart className="w-3.5 h-3.5 text-red-500" /> FC
                </div>
                <p className="font-mono text-xs font-bold text-[#111928] mt-1">
                  {selectedPatient.vitals.fc}
                </p>
              </div>

              <div className="p-2.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[#6B7280]">
                  <Weight className="w-3.5 h-3.5 text-blue-500" /> Peso
                </div>
                <p className="font-mono text-xs font-bold text-[#111928] mt-1">
                  {selectedPatient.vitals.peso}
                </p>
              </div>

              <div className="p-2.5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] hover:border-emerald-300 transition-colors col-span-2 sm:col-span-1">
                <div className="flex items-center justify-center gap-1 text-[11px] text-[#6B7280]">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" /> SpO2
                </div>
                <p className="font-mono text-xs font-bold text-[#111928] mt-1">
                  {selectedPatient.vitals.spo2}
                </p>
              </div>
            </div>
          </div>

          {/* Evolução Clínica SOAP (Estrutura Médica de Excelência) */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#111928] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#059669]" /> Evolução Clínica (SOAP)
              </h3>
              {isSaved && (
                <span className="text-xs font-semibold text-[#0E9F6E] flex items-center gap-1 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Salvo com sucesso
                </span>
              )}
            </div>
            
            <textarea
              rows={6}
              value={evolution}
              onChange={(e) => setEvolution(e.target.value)}
              className="w-full p-3.5 text-xs text-[#111928] border border-[#D1D5DB] rounded-xl focus:border-[#059669] focus:ring-2 focus:ring-[#D1FAE5] outline-none font-sans leading-relaxed shadow-inner"
              placeholder="Descreva a anamnese, hipótese diagnóstica e conduta..."
            />
            
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F3F4F6]">
              <span className="text-[11px] text-[#6B7280]">
                Última alteração: Hoje às 08:44 • Assinatura A3 vinculada
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEvolution('')}
                  className="px-3 py-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold text-[#6B7280] transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={handleSaveEvolution}
                  className="px-4 py-1.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar no PEP
                </button>
              </div>
            </div>
          </div>

          {/* Prescrição Médica Ativa */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#111928] flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-[#1A56DB]" /> Receituário Digital &amp; Posologia
              </h3>
              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="text-xs text-[#1A56DB] hover:text-[#1E40AF] font-bold flex items-center gap-1"
              >
                <Pill className="w-3.5 h-3.5" />
                + Adicionar Medicamento
              </button>
            </div>

            <textarea
              rows={3}
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              className="w-full p-3 font-mono text-xs text-[#111928] border border-[#D1D5DB] rounded-xl focus:border-[#1A56DB] focus:ring-2 focus:ring-[#EBF0FB] outline-none leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-[#F3F4F6]">
              <span className="text-[11px] text-[#6B7280] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Assinatura digital ICP-Brasil certificada
              </span>
              <button
                onClick={() => {
                  showToast('Receituário assinado com certificado A3 e disparado via SMS/WhatsApp para o paciente.');
                }}
                className="px-4 py-1.5 rounded-lg bg-[#1A56DB] hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Emitir &amp; Assinar Digitalmente
              </button>
            </div>
          </div>
        </div>

        {/* Coluna 3: Alertas, Ações do Hub & Inteligência Clínica (3 colunas em lg) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card de Alergias Críticas (RN09 - Segurança do Paciente) */}
          <div className="bg-[#FDE8E8] border border-[#FCA5A5] p-4 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C81E1E] flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-4 h-4 text-[#C81E1E]" /> Alergias Documentadas (RN09)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedPatient.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-[#C81E1E] border border-[#F87171] shadow-xs flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  {allergy}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-red-800 mt-2 leading-tight">
              O motor de prescrição bloqueia automaticamente medicamentos incompatíveis.
            </p>
          </div>

          {/* Central de Ações Rápidas do Hub Hospitalar */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">
              Serviços Integrados do Hub
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => setShowExamModal(true)}
                className="w-full p-3 rounded-xl border border-[#E5E7EB] hover:border-[#1A56DB] hover:bg-[#EBF0FB] text-left text-xs font-semibold text-[#111928] flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-[#1A56DB] group-hover:bg-[#1A56DB] group-hover:text-white transition-colors">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Solicitar Exames (Hub)</span>
                    <span className="text-[10px] text-[#6B7280]">Integração LOINC &amp; FHIR</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-[#1A56DB] font-bold">
                  FHIR R4
                </span>
              </button>

              <button
                onClick={() => setShowCertificateModal(true)}
                className="w-full p-3 rounded-xl border border-[#E5E7EB] hover:border-[#0E9F6E] hover:bg-[#D1FAE5] text-left text-xs font-semibold text-[#111928] flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-[#0E9F6E] group-hover:bg-[#0E9F6E] group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Emitir Atestado Médico</span>
                    <span className="text-[10px] text-[#6B7280]">QR Code de validação CFM</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-[#057A55] font-bold">
                  ICP-Brasil
                </span>
              </button>

              <button
                onClick={() => setShowLabResultModal(true)}
                className="w-full p-3 rounded-xl border border-[#E5E7EB] hover:border-purple-500 hover:bg-purple-50 text-left text-xs font-semibold text-[#111928] flex items-center justify-between transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Laudo de Exames</span>
                    <span className="text-[10px] text-[#6B7280]">Hemograma liberado hoje</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                  Ver Laudo
                </span>
              </button>
            </div>
          </div>

          {/* Card de Faturamento e Honorário da Consulta */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-4 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold text-[#057A55] uppercase tracking-wider mb-2">
              Split da Consulta (D+1)
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#374151]">
                <span>Valor Bruto (Unimed):</span>
                <span className="font-mono font-bold">R$ 280,00</span>
              </div>
              <div className="flex justify-between text-[#6B7280] text-[11px]">
                <span>Taxa de Sala do Hub (15%):</span>
                <span className="font-mono text-red-600">- R$ 42,00</span>
              </div>
              <div className="flex justify-between text-[#057A55] font-bold pt-1.5 border-t border-[#86EFAC]">
                <span>Honorário Líquido Médico:</span>
                <span className="font-mono">R$ 238,00</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          MODAL 1: SOLICITAÇÃO DE EXAMES FHIR R4 (CATÁLOGO LOINC)
         ========================================================================= */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#1A56DB] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-blue-200" />
                  Solicitação de Exames no Laboratório do Hub (FHIR R4)
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Paciente: <strong>{selectedPatient.name}</strong> • Conexão direta com LIS Central
                </p>
              </div>
              <button
                onClick={() => setShowExamModal(false)}
                className="p-1 rounded-lg hover:bg-blue-700 text-blue-100 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Formulário vs JSON FHIR */}
            <div className="flex border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 pt-3 gap-2">
              <button
                onClick={() => setExamJsonTab(false)}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                  !examJsonTab ? 'border-[#1A56DB] text-[#1A56DB]' : 'border-transparent text-[#6B7280] hover:text-[#111928]'
                }`}
              >
                Catálogo de Exames (LOINC)
              </button>
              <button
                onClick={() => setExamJsonTab(true)}
                className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors font-mono ${
                  examJsonTab ? 'border-[#1A56DB] text-[#1A56DB]' : 'border-transparent text-[#6B7280] hover:text-[#111928]'
                }`}
              >
                Payload FHIR ServiceRequest
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {!examJsonTab ? (
                <>
                  {/* Busca */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Pesquisar por nome ou código LOINC..."
                      value={examSearch}
                      onChange={(e) => setExamSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[#D1D5DB] rounded-xl text-xs outline-none focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB]"
                    />
                  </div>

                  {/* Urgência & Indicação Clínica */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-bold text-[#374151] block mb-1">
                        Prioridade Clínica:
                      </label>
                      <select
                        value={examUrgency}
                        onChange={(e) => setExamUrgency(e.target.value as 'routine' | 'urgent')}
                        className="w-full p-2 border border-[#D1D5DB] rounded-xl text-xs outline-none font-semibold text-[#111928]"
                      >
                        <option value="routine">Rotina (Ambulatório)</option>
                        <option value="urgent">Urgente / Emergência</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-[#374151] block mb-1">
                        Indicação / Hipótese Diagnóstica:
                      </label>
                      <input
                        type="text"
                        value={examClinicalIndication}
                        onChange={(e) => setExamClinicalIndication(e.target.value)}
                        className="w-full p-2 border border-[#D1D5DB] rounded-xl text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Lista de Exames */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#374151] block">
                      Selecione os Procedimentos ({selectedExamIds.length} selecionados):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableExams
                        .filter((ex) => ex.name.toLowerCase().includes(examSearch.toLowerCase()) || ex.code.includes(examSearch))
                        .map((exam) => {
                          const isChecked = selectedExamIds.includes(exam.id);
                          return (
                            <div
                              key={exam.id}
                              onClick={() => toggleExam(exam.id)}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition-colors flex items-start gap-2.5 ${
                                isChecked
                                  ? 'bg-[#EBF0FB] border-[#1A56DB]'
                                  : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-0.5 rounded text-[#1A56DB]"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#111928] truncate">
                                    {exam.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-mono text-[#1A56DB] bg-blue-50 px-1.5 py-0.2 rounded">
                                    LOINC {exam.code}
                                  </span>
                                  <span className="text-[10px] text-[#6B7280]">
                                    {exam.cat}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </>
              ) : (
                /* Aba JSON FHIR R4 */
                <div className="bg-[#111928] text-emerald-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[350px]">
                  <pre>
{JSON.stringify(
  {
    resourceType: 'ServiceRequest',
    id: `req-${Date.now()}`,
    status: 'active',
    intent: 'order',
    priority: examUrgency,
    code: {
      coding: selectedExamIds.map((id) => {
        const item = availableExams.find((e) => e.id === id);
        return {
          system: 'http://loinc.org',
          code: item?.code,
          display: item?.name,
        };
      }),
    },
    subject: {
      reference: `Patient/${selectedPatient.id}`,
      display: selectedPatient.name,
    },
    requester: {
      reference: 'Practitioner/dr-ricardo-mendes',
      display: 'Dr. Ricardo Mendes - CRM 45892/SP',
    },
    reasonCode: [
      {
        text: examClinicalIndication,
      },
    ],
  },
  null,
  2
)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">
                {selectedExamIds.length} exames prontos para transmissão
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExamModal(false)}
                  className="px-4 py-2 border border-[#D1D5DB] rounded-xl text-xs font-semibold text-[#374151] hover:bg-white"
                >
                  Cancelar
                </button>
                <button
                  disabled={selectedExamIds.length === 0}
                  onClick={handleSendFHIRExams}
                  className="px-5 py-2 bg-[#1A56DB] hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Transmitir ao LIS Hub
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EMISSÃO DE ATESTADO MÉDICO DIGITAL COM QR CODE & ICP-BRASIL
         ========================================================================= */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#059669] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-200" />
                  Emissão de Atestado / Declaração Médica Digital
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Assinatura Digital ICP-Brasil e Validação Pública CFM
                </p>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-100 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Opções de Atestado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#374151] block mb-1">Tipo de Documento:</label>
                  <select
                    value={certType}
                    onChange={(e) => setCertType(e.target.value as any)}
                    className="w-full p-2 border border-[#D1D5DB] rounded-xl outline-none font-semibold text-[#111928]"
                  >
                    <option value="afastamento">Atestado de Afastamento</option>
                    <option value="comparecimento">Declaração de Comparecimento</option>
                    <option value="aptidao">Atestado de Aptidão Física</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#374151] block mb-1">Dias de Afastamento:</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={certDays}
                    onChange={(e) => setCertDays(Number(e.target.value))}
                    disabled={certType === 'comparecimento'}
                    className="w-full p-2 border border-[#D1D5DB] rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#374151] block mb-1">CID-10 (Opcional):</label>
                  <input
                    type="text"
                    value={certCid}
                    onChange={(e) => setCertCid(e.target.value)}
                    className="w-full p-2 border border-[#D1D5DB] rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#374151] block mb-1">Observações Médicas:</label>
                <textarea
                  rows={2}
                  value={certObservations}
                  onChange={(e) => setCertObservations(e.target.value)}
                  className="w-full p-2.5 border border-[#D1D5DB] rounded-xl outline-none"
                />
              </div>

              {/* Pré-visualização da Folha Timbrada Oficial */}
              <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl relative space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white font-bold text-sm">
                      360
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1E3A5F]">HOSPITAL 360° — VIGIA SAÚDE</h4>
                      <p className="text-[10px] text-slate-500">Unidade Integrada de Saúde Especializada</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-slate-500">Código de Autenticação:</p>
                    <p className="font-mono text-xs font-bold text-[#1A56DB]">V360-AT-98421</p>
                  </div>
                </div>

                <div className="text-center py-2">
                  <h3 className="text-base font-extrabold tracking-wider text-[#111928] uppercase">
                    {certType === 'afastamento' ? 'ATESTADO MÉDICO' : certType === 'comparecimento' ? 'DECLARAÇÃO DE COMPARECIMENTO' : 'ATESTADO DE APTIDÃO'}
                  </h3>
                </div>

                <p className="text-xs text-[#111928] leading-relaxed">
                  Atesto para os devidos fins que o(a) paciente <strong>{selectedPatient.name}</strong>, inscrito(a) sob meus cuidados profissionais na data de hoje, necessita de <strong>{certDays} dia(s)</strong> de repouso por motivo de saúde, a contar a partir de hoje.
                </p>

                {certCid && (
                  <p className="text-xs text-[#374151]">
                    <strong>Diagnóstico / CID-10:</strong> {certCid} (Autorizado pelo paciente nos termos da Resolução CFM 1.658/2002).
                  </p>
                )}

                <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-[#111928]">Dr. Ricardo Mendes</p>
                    <p className="text-[10px] text-slate-500">Médico Cardiologista • CRM 45892/SP</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      <ShieldCheck className="w-3 h-3" /> Assinado Digitalmente (ICP-Brasil)
                    </span>
                  </div>

                  <div className="p-2 bg-white border border-slate-300 rounded-lg text-center shadow-xs">
                    <QrCode className="w-12 h-12 text-[#1E3A5F] mx-auto" />
                    <span className="text-[8px] font-mono text-slate-500 block mt-0.5">Validar no CFM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">
                Disponível para impressão ou envio direto ao WhatsApp do paciente
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 border border-[#D1D5DB] rounded-xl text-xs font-semibold text-[#374151] hover:bg-white"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setShowCertificateModal(false);
                    showToast('Atestado Médico assinado digitalmente e transmitido ao celular do paciente.');
                  }}
                  className="px-5 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Assinar &amp; Enviar Paciente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADICIONAR MEDICAMENTO COM CHECK DE ALERGIA (RN09)
         ========================================================================= */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#1E3A5F] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-300" />
                  Adicionar Fármaco à Prescrição
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Verificação cruzada com prontuário e alergias (Protocolo RN09)
                </p>
              </div>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#374151] block mb-1">
                  Selecione o Medicamento da Farmácia Hub:
                </label>
                <select
                  value={selectedMedId}
                  onChange={(e) => handleSelectMedication(e.target.value)}
                  className="w-full p-2.5 border border-[#D1D5DB] rounded-xl outline-none font-semibold text-[#111928]"
                >
                  <option value="">-- Escolha um medicamento --</option>
                  {availableMedications.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.presentation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Alerta de Alergia RN09 */}
              {allergyAlert && (
                <div className="p-4 bg-red-100 border-2 border-red-500 rounded-xl text-red-900 animate-bounce">
                  <div className="flex items-center gap-2 font-bold text-xs text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    {allergyAlert}
                  </div>
                  <p className="text-[11px] mt-1 text-red-700">
                    Recomendação: Escolha uma alternativa terapêutica sem compostos de Dipirona ou derivados de Penicilina.
                  </p>
                </div>
              )}

              {selectedMedId && !allergyAlert && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Nenhuma contraindicação alérgica encontrada no prontuário.</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="px-4 py-2 border border-[#D1D5DB] rounded-xl text-xs font-semibold text-[#374151]"
              >
                Cancelar
              </button>
              <button
                disabled={!selectedMedId}
                onClick={handleAddMedicationToPrescription}
                className="px-5 py-2 bg-[#1A56DB] hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Inserir na Prescrição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: VISUALIZADOR DE LAUDO LABORATORIAL DO HUB (FHIR DIAGNOSTICREPORT)
         ========================================================================= */}
      {showLabResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1E3A5F] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-emerald-400" />
                  Laboratório Central — Laudo de Análises Clínicas
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Paciente: <strong>{selectedPatient.name}</strong> • Protocolo LAB-2026-99124
                </p>
              </div>
              <button
                onClick={() => setShowLabResultModal(false)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center justify-between">
                <div>
                  <p className="font-bold">Coleta Realizada: 18/09/2026 às 07:15</p>
                  <p className="text-[11px] text-blue-700">Liberação Técnica: Dr. Marcos Paulo (CRBM 12450)</p>
                </div>
                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  LAUDO CONCLUÍDO
                </span>
              </div>

              {/* Tabela do Hemograma */}
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FAFB] text-[#6B7280] text-[11px] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="p-3">Parâmetro</th>
                      <th className="p-3">Resultado</th>
                      <th className="p-3">Valor de Referência</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    <tr>
                      <td className="p-3 font-semibold">Hemoglobina</td>
                      <td className="p-3 font-mono font-bold text-[#111928]">13,8 g/dL</td>
                      <td className="p-3 font-mono text-[#6B7280]">12,0 a 16,0 g/dL</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Normal
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Leucócitos Totais</td>
                      <td className="p-3 font-mono font-bold text-[#111928]">6.400 /mm³</td>
                      <td className="p-3 font-mono text-[#6B7280]">4.000 a 11.000 /mm³</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Normal
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Plaquetas</td>
                      <td className="p-3 font-mono font-bold text-[#111928]">245.000 /mm³</td>
                      <td className="p-3 font-mono text-[#6B7280]">150.000 a 450.000 /mm³</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Normal
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold">Colesterol Total</td>
                      <td className="p-3 font-mono font-bold text-amber-700">208 mg/dL</td>
                      <td className="p-3 font-mono text-[#6B7280]">&lt; 190 mg/dL</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Limítrofe
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLabResultModal(false)}
                className="px-4 py-2 bg-[#1A56DB] text-white rounded-xl text-xs font-bold"
              >
                Fechar Laudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: TIMELINE DE HISTÓRICO CLÍNICO DO PACIENTE
         ========================================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1E3A5F] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-300" />
                  Linha do Tempo Clínica — {selectedPatient.name}
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Histórico unificado de atendimentos, laudos e internações no Hub Hospitalar
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
              <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6">
                {selectedPatient.history.map((hist, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-[#1A56DB] border-2 border-white ring-2 ring-blue-100"></div>
                    <div className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm text-[#111928]">{hist.title}</h4>
                        <span className="font-mono text-[10px] text-slate-500">{hist.date}</span>
                      </div>
                      <p className="text-[11px] text-[#1A56DB] font-semibold mb-2">{hist.doctor}</p>
                      <p className="text-slate-600 leading-relaxed">{hist.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Fechar Histórico
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
