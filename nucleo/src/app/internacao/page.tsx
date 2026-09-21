'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
import {
  BedDouble,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  User,
  HeartPulse,
  Sparkles,
  ShieldAlert,
  QrCode,
  Scan,
  Pill,
  Activity,
  Droplets,
  Calendar,
  X,
  FileCheck,
  Check,
  Search,
  Filter,
  Eye,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface Bed {
  id: string;
  number: string;
  floor: string;
  status: 'Vago' | 'Ocupado' | 'Aguardando Limpeza';
  patientName?: string;
  patientAge?: number;
  doctor?: string;
  diagnosis?: string;
  admissionDate?: string;
  alerts?: string[];
  cleaningType?: 'Concorrente' | 'Terminal';
  cleaningElapsed?: string;
  vitals?: { pa: string; fc: string; spo2: string; temp: string };
  devices?: string[];
  medications?: { name: string; dose: string; time: string; status: 'Pendente' | 'Administrado' }[];
}

const initialBeds: Bed[] = [
  {
    id: 'b-1',
    number: '101',
    floor: '1º Andar',
    status: 'Ocupado',
    patientName: 'Marcos Vinicius Pereira',
    patientAge: 48,
    doctor: 'Dr. Roberto Brandão',
    diagnosis: 'Insuficiência Cardíaca Congestiva (NYHA III)',
    admissionDate: '16/09/2026',
    alerts: ['Risco Alto de Queda', 'Restrição Hídrica 1.000ml/dia'],
    vitals: { pa: '135/85 mmHg', fc: '76 bpm', spo2: '96%', temp: '36.6 °C' },
    devices: ['Acesso Venoso Periférico (MSD)', 'Monitor Cardíaco Contínuo'],
    medications: [
      { name: 'Furosemida 20mg IV', dose: '1 ampola', time: '08:00', status: 'Administrado' },
      { name: 'Carvedilol 12.5mg VO', dose: '1 comprimido', time: '12:00', status: 'Pendente' },
      { name: 'Espironolactona 25mg VO', dose: '1 comprimido', time: '18:00', status: 'Pendente' },
    ],
  },
  { id: 'b-2', number: '102', floor: '1º Andar', status: 'Vago' },
  { id: 'b-3', number: '103', floor: '1º Andar', status: 'Aguardando Limpeza', cleaningType: 'Concorrente', cleaningElapsed: '14 min' },
  {
    id: 'b-4',
    number: '104',
    floor: '1º Andar',
    status: 'Ocupado',
    patientName: 'Lucia Helena Alvarenga',
    patientAge: 62,
    doctor: 'Dra. Beatriz Santos',
    diagnosis: 'Pneumonia Comunitária Adquirida',
    admissionDate: '15/09/2026',
    alerts: ['Dieta Zero até 14h', 'Oxigênio sob Cateter Nasal 2L/min'],
    vitals: { pa: '120/75 mmHg', fc: '88 bpm', spo2: '94%', temp: '37.8 °C' },
    devices: ['Cateter Nasal O2 (2L/min)', 'Acesso Venoso Periférico (MSE)'],
    medications: [
      { name: 'Ceftriaxona 1g IV', dose: '1 frasco-ampola', time: '10:00', status: 'Pendente' },
      { name: 'Claritromicina 500mg IV', dose: '1 bolsa', time: '14:00', status: 'Pendente' },
    ],
  },
  {
    id: 'b-5',
    number: '201',
    floor: '2º Andar',
    status: 'Ocupado',
    patientName: 'Fernando Dias Ramos',
    patientAge: 55,
    doctor: 'Dr. Ricardo Mendes',
    diagnosis: 'Angina Instável sob Investigação',
    admissionDate: '17/09/2026',
    alerts: ['Alergia a Dipirona', 'Isolamento de Contato (KPC)'],
    vitals: { pa: '148/92 mmHg', fc: '82 bpm', spo2: '98%', temp: '36.5 °C' },
    devices: ['Monitoração Multiparamétrica', 'Cateter Triplo Lúmen'],
    medications: [
      { name: 'Enoxaparina 60mg SC', dose: '1 seringa preenchida', time: '08:00', status: 'Administrado' },
      { name: 'AAS 100mg VO', dose: '1 comprimido', time: '12:00', status: 'Pendente' },
    ],
  },
  { id: 'b-6', number: '202', floor: '2º Andar', status: 'Vago' },
  { id: 'b-7', number: '203', floor: '2º Andar', status: 'Aguardando Limpeza', cleaningType: 'Terminal', cleaningElapsed: '28 min' },
  {
    id: 'b-8',
    number: '204',
    floor: '2º Andar',
    status: 'Ocupado',
    patientName: 'Helena Carvalho Fontes',
    patientAge: 39,
    doctor: 'Dr. Ricardo Mendes',
    diagnosis: 'Pós-operatório de Colecistectomia Videolaparoscópica',
    admissionDate: '18/09/2026',
    alerts: ['Dieta Líquida Pastosa'],
    vitals: { pa: '115/70 mmHg', fc: '72 bpm', spo2: '99%', temp: '36.4 °C' },
    devices: ['Dreno de Sucção Portovac', 'Acesso Venoso Periférico'],
    medications: [
      { name: 'Cetoprofeno 100mg IV', dose: '1 frasco', time: '09:00', status: 'Administrado' },
      { name: 'Ondansetrona 8mg IV', dose: '1 ampola', time: '15:00', status: 'Pendente' },
    ],
  },
  {
    id: 'b-9',
    number: '301 (UTI)',
    floor: '3º Andar (UTI)',
    status: 'Ocupado',
    patientName: 'Geraldo Alencar Neves',
    patientAge: 71,
    doctor: 'Dr. Roberto Brandão',
    diagnosis: 'Choque Séptico de Foco Pulmonar',
    admissionDate: '14/09/2026',
    alerts: ['Ventilação Mecânica Invasiva', 'Droga Vasoativa Contínua'],
    vitals: { pa: '105/60 mmHg (c/ Noradrenalina)', fc: '94 bpm', spo2: '95%', temp: '38.1 °C' },
    devices: ['Tubo Orotraqueal (TOT 8.0)', 'Pressão Arterial Invasiva (PAI)', 'SVD'],
    medications: [
      { name: 'Noradrenalina 0.2mcg/kg/min BIC', dose: 'Bomba Contínua', time: '24h', status: 'Administrado' },
      { name: 'Meropenem 1g IV', dose: '1 frasco', time: '14:00', status: 'Pendente' },
    ],
  },
  {
    id: 'b-10',
    number: '302 (UTI)',
    floor: '3º Andar (UTI)',
    status: 'Ocupado',
    patientName: 'Sonia Maria Guimarães',
    patientAge: 64,
    doctor: 'Dr. Roberto Brandão',
    diagnosis: 'Pós-PCR Revertida • Protocolo de Hipotermia',
    admissionDate: '16/09/2026',
    alerts: ['Sedação Contínua', 'Neuromonitorização'],
    vitals: { pa: '125/80 mmHg', fc: '68 bpm', spo2: '97%', temp: '35.8 °C' },
    devices: ['Acesso Venoso Central', 'Monitor Bispectral (BIS)'],
    medications: [
      { name: 'Fentanil + Midazolam BIC', dose: 'Infusão Contínua', time: '24h', status: 'Administrado' },
    ],
  },
  { id: 'b-11', number: '303 (UTI)', floor: '3º Andar (UTI)', status: 'Aguardando Limpeza', cleaningType: 'Terminal', cleaningElapsed: '35 min' },
  { id: 'b-12', number: '304 (UTI)', floor: '3º Andar (UTI)', status: 'Vago' },
];

export default function NursingStationPage() {
  const [beds, setBeds] = useState<Bed[]>(initialBeds);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Ocupado' | 'Vago' | 'Aguardando Limpeza'>('Todos');
  const [filterFloor, setFilterFloor] = useState<string>('Todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modais de UX Senior
  const [showBedDetailModal, setShowBedDetailModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showBarcodeScannerModal, setShowBarcodeScannerModal] = useState(false);
  const [selectedCleaning, setSelectedCleaning] = useState<'Concorrente' | 'Terminal'>('Terminal');

  // Estados da Checagem Beira-Leito RN09
  const [scannerStep, setScannerStep] = useState<'wristband' | 'medication' | 'validated' | 'error'>('wristband');
  const [scannedWristband, setScannedWristband] = useState<string | null>(null);
  const [scannedMedication, setScannedMedication] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const occupiedCount = beds.filter((b) => b.status === 'Ocupado').length;
  const vacantCount = beds.filter((b) => b.status === 'Vago').length;
  const cleaningCount = beds.filter((b) => b.status === 'Aguardando Limpeza').length;
  const occupancyRate = Math.round((occupiedCount / beds.length) * 100);

  const filteredBeds = beds.filter((b) => {
    const matchesStatus = filterStatus === 'Todos' || b.status === filterStatus;
    const matchesFloor = filterFloor === 'Todos' || b.floor.includes(filterFloor);
    return matchesStatus && matchesFloor;
  });

  const handleOpenBedDetails = (bed: Bed) => {
    setSelectedBed(bed);
    setShowBedDetailModal(true);
  };

  const handleOpenDischarge = (bed: Bed) => {
    setSelectedBed(bed);
    setShowDischargeModal(true);
  };

  const handleConfirmDischarge = () => {
    if (!selectedBed) return;
    setBeds((prev) =>
      prev.map((b) =>
        b.id === selectedBed.id
          ? {
              ...b,
              status: 'Aguardando Limpeza',
              cleaningType: selectedCleaning,
              cleaningElapsed: '1 min',
              patientName: undefined,
              patientAge: undefined,
              alerts: undefined,
              diagnosis: undefined,
              vitals: undefined,
              devices: undefined,
              medications: undefined,
            }
          : b
      )
    );
    setShowDischargeModal(false);
    setShowBedDetailModal(false);
    showToast(
      `Alta hospitalar do Leito ${selectedBed.number} confirmada! Ordem de Limpeza ${selectedCleaning} disparada para a equipe de Facilities (Protocolo RN08).`
    );
  };

  const handleOpenScanner = (bed: Bed) => {
    setSelectedBed(bed);
    setScannerStep('wristband');
    setScannedWristband(null);
    setScannedMedication(null);
    setShowBarcodeScannerModal(true);
  };

  const handleScanWristband = () => {
    if (!selectedBed) return;
    setScannedWristband(`BRC-${selectedBed.number}-${selectedBed.patientName?.substring(0, 3).toUpperCase()}`);
    setScannerStep('medication');
  };

  const handleScanMedication = (isHazardous: boolean = false) => {
    if (isHazardous) {
      setScannerStep('error');
    } else {
      setScannedMedication('MED-CEFTRIAXONA-1G-LT8912');
      setScannerStep('validated');
    }
  };

  const handleCompleteMedicationAdministration = () => {
    setShowBarcodeScannerModal(false);
    showToast(
      `Administração checada com sucesso nos 5 Certos (RN09)! Registro gravado com carimbo COREN.`
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

      {/* Header Posto de Enfermagem */}
      <div className="bg-[#14B8A6] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-teal-700 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-teal-100 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Seleção de Módulos</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-800/80 rounded-xl border border-teal-600">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Posto de Enfermagem &amp; Censo de Leitos
                </h1>
                <p className="text-xs text-teal-100 mt-0.5">
                  Gestão Centralizada de Altas Médicas e Checagem Beira-Leito (RN08 &amp; RN09) • Plantonista: Enf. Camila Torres (COREN 24890)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-900/90 border border-teal-700 text-teal-100 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Censo em Tempo Real (12 Leitos)
            </span>
          </div>
        </div>
      </div>

      {/* 5 KPIs de Ocupação */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm text-center">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Ocupados</p>
            <p className="text-2xl font-mono font-extrabold text-[#1A56DB] mt-1">{occupiedCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{occupancyRate}% da capacidade</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm text-center">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Vagos Prontos</p>
            <p className="text-2xl font-mono font-extrabold text-[#0E9F6E] mt-1">{vacantCount}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Disponíveis no Hub</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm text-center">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Higienização</p>
            <p className="text-2xl font-mono font-extrabold text-[#C27803] mt-1">{cleaningCount}</p>
            <p className="text-[10px] text-amber-700 mt-0.5">App Facilities (RN08)</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm text-center">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Taxa Ocupação</p>
            <p className="text-2xl font-mono font-extrabold text-[#111928] mt-1">{occupancyRate}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Meta Ideal: &lt; 85%</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm text-center col-span-2 sm:col-span-1">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Tempo Médio Limpeza</p>
            <p className="text-2xl font-mono font-extrabold text-[#7C3AED] mt-1">22 min</p>
            <p className="text-[10px] text-purple-600 mt-0.5">Giro ágil de leito</p>
          </div>
        </div>
      </div>

      {/* Grid de Leitos com Filtros Interativos */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          
          {/* Barra de Filtros */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#F3F4F6] gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-[#111928] flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-[#14B8A6]" />
                <span>Mapa Geral de Leitos Hospitalares</span>
              </h2>
              <p className="text-xs text-[#6B7280]">
                Clique em um leito ocupado para abrir o prontuário de beira-leito, checar medicações ou realizar alta
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Filtro de Status */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['Todos', 'Ocupado', 'Vago', 'Aguardando Limpeza'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      filterStatus === st
                        ? 'bg-white text-[#111928] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Filtro de Andar */}
              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                className="p-1.5 border border-slate-300 rounded-xl font-semibold text-xs outline-none bg-white"
              >
                <option value="Todos">Todos os Andares</option>
                <option value="1º Andar">1º Andar (Clínica Médica)</option>
                <option value="2º Andar">2º Andar (Cirurgia)</option>
                <option value="3º Andar">3º Andar (UTI)</option>
              </select>
            </div>
          </div>

          {/* Cards de Leitos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBeds.map((bed) => {
              let statusBorder = 'border-[#0E9F6E] bg-[#F0FDF4]';
              let badge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#057A55]">
                  Vago
                </span>
              );

              if (bed.status === 'Ocupado') {
                statusBorder = 'border-[#1A56DB] bg-white cursor-pointer hover:shadow-lg hover:border-blue-600 ring-1 ring-blue-100';
                badge = (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF0FB] text-[#1A56DB]">
                    Ocupado
                  </span>
                );
              } else if (bed.status === 'Aguardando Limpeza') {
                statusBorder = 'border-[#FACA15] bg-[#FEFCE8]';
                badge = (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[#92400E]">
                    Higienização
                  </span>
                );
              }

              return (
                <div
                  key={bed.id}
                  onClick={() => bed.status === 'Ocupado' && handleOpenBedDetails(bed)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[160px] ${statusBorder}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-sm font-extrabold text-[#111928]">
                        Leito {bed.number}
                      </span>
                      {badge}
                    </div>
                    <p className="text-[11px] text-[#6B7280]">{bed.floor}</p>

                    {bed.patientName && (
                      <div className="mt-2.5">
                        <p className="text-xs font-bold text-[#111928] truncate">
                          {bed.patientName}
                        </p>
                        <p className="text-[11px] text-[#6B7280] truncate">
                          Médico: {bed.doctor}
                        </p>
                        {bed.vitals && (
                          <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                            <span>PA: {bed.vitals.pa}</span>
                            <span>•</span>
                            <span>FC: {bed.vitals.fc}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {bed.cleaningType && (
                      <div className="mt-3 text-[11px] text-[#92400E] bg-amber-100/60 p-2 rounded-xl border border-amber-200">
                        <p className="font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Limpeza {bed.cleaningType}
                        </p>
                        <p className="text-[#B45309] font-mono text-[10px]">
                          Tempo decorrido: {bed.cleaningElapsed}
                        </p>
                      </div>
                    )}
                  </div>

                  {bed.alerts && bed.alerts.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#F3F4F6] flex flex-wrap gap-1">
                      {bed.alerts.map((a, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200"
                        >
                          ⚠ {a}
                        </span>
                      ))}
                    </div>
                  )}

                  {bed.status === 'Ocupado' && (
                    <div className="mt-3 pt-2 border-t border-[#F3F4F6] text-[11px] font-bold text-[#1A56DB] flex items-center justify-between">
                      <span>Ver Prontuário</span>
                      <span>→</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* =========================================================================
          MODAL 1: DETALHES CLÍNICOS DO LEITO & PLANO DE CUIDADOS
         ========================================================================= */}
      {showBedDetailModal && selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1E3A5F] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-teal-300" />
                  Prontuário de Internação — Leito {selectedBed.number} ({selectedBed.floor})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Paciente: <strong>{selectedBed.patientName}</strong> • {selectedBed.patientAge} anos • Médico: {selectedBed.doctor}
                </p>
              </div>
              <button
                onClick={() => setShowBedDetailModal(false)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Diagnóstico e Alertas */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <p className="text-xs font-bold text-[#1E3A5F]">
                  Hipótese Diagnóstica: {selectedBed.diagnosis}
                </p>
                <p className="text-[11px] text-slate-600">
                  Data de Admissão: <strong>{selectedBed.admissionDate}</strong> • Plano: Internação Clínica
                </p>
              </div>

              {/* Sinais Vitais Atuais */}
              {selectedBed.vitals && (
                <div>
                  <h4 className="font-bold text-[#374151] mb-2 uppercase tracking-wider text-[11px]">
                    Sinais Vitais Recentes:
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">PA</span>
                      <span className="font-mono font-bold text-xs">{selectedBed.vitals.pa}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">FC</span>
                      <span className="font-mono font-bold text-xs">{selectedBed.vitals.fc}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">SpO2</span>
                      <span className="font-mono font-bold text-xs">{selectedBed.vitals.spo2}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">Temperatura</span>
                      <span className="font-mono font-bold text-xs">{selectedBed.vitals.temp}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dispositivos Invasivos */}
              {selectedBed.devices && (
                <div>
                  <h4 className="font-bold text-[#374151] mb-2 uppercase tracking-wider text-[11px]">
                    Dispositivos e Acessos Instalados:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBed.devices.map((dev, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-300 font-semibold text-slate-700"
                      >
                        ⚡ {dev}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Grade de Medicações do Horário */}
              {selectedBed.medications && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-[#374151] uppercase tracking-wider text-[11px]">
                      Prescrição Médica &amp; Aprazamento:
                    </h4>
                    <button
                      onClick={() => {
                        setShowBedDetailModal(false);
                        handleOpenScanner(selectedBed);
                      }}
                      className="px-3 py-1 bg-[#14B8A6] hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-sm"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      Checagem Beira-Leito (RN09)
                    </button>
                  </div>

                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#F9FAFB] text-[#6B7280] text-[10px] border-b border-[#E5E7EB]">
                        <tr>
                          <th className="p-2.5">Medicamento</th>
                          <th className="p-2.5">Dose / Via</th>
                          <th className="p-2.5 text-center">Horário</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        {selectedBed.medications.map((med, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold text-[#111928]">{med.name}</td>
                            <td className="p-2.5 font-mono text-slate-600">{med.dose}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-[#1A56DB]">{med.time}</td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  med.status === 'Administrado'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {med.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
              <button
                onClick={() => {
                  setShowBedDetailModal(false);
                  handleOpenDischarge(selectedBed);
                }}
                className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Processar Alta Médica (H3 + RN08)
              </button>

              <button
                onClick={() => setShowBedDetailModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ALTA MÉDICA (H3 + RN08) — NOTIFICAÇÃO FACILITIES
         ========================================================================= */}
      {showDischargeModal && selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB]">
            <h3 className="text-base font-bold text-[#111928] mb-1">
              Processo de Alta Médica — Leito {selectedBed.number}
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">
              Paciente: <strong>{selectedBed.patientName}</strong> • Médico Responsável: {selectedBed.doctor}
            </p>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-[#374151] block">
                Selecione o Tipo de Higienização Solicitada (RN08)
              </label>

              <div
                onClick={() => setSelectedCleaning('Concorrente')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedCleaning === 'Concorrente'
                    ? 'border-[#14B8A6] bg-teal-50 shadow-sm'
                    : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#111928]">
                  <span>Limpeza Concorrente</span>
                  <span className="font-mono text-[#0D9488]">15–20 min</span>
                </div>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Indicada para internações clínicas simples e rotatividade rápida.
                </p>
              </div>

              <div
                onClick={() => setSelectedCleaning('Terminal')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedCleaning === 'Terminal'
                    ? 'border-[#14B8A6] bg-teal-50 shadow-sm'
                    : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#111928]">
                  <span>Limpeza Terminal (Desinfecção Profunda)</span>
                  <span className="font-mono text-[#0D9488]">45–60 min</span>
                </div>
                <p className="text-[11px] text-[#6B7280] mt-1">
                  Obrigatória para casos de isolamento, cirurgias ou internações prolongadas.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDischargeModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDischarge}
                className="px-5 py-2 bg-[#14B8A6] hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirmar Alta &amp; Notificar Facilities
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CHECAGEM BEIRA-LEITO RN09 (SCANNER SIMULADO DE 5 CERTOS)
         ========================================================================= */}
      {showBarcodeScannerModal && selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#1E3A5F] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Scan className="w-5 h-5 text-teal-300" />
                  Checagem Beira-Leito RN09 (Os 5 Certos)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Leito {selectedBed.number} • Paciente: <strong>{selectedBed.patientName}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowBarcodeScannerModal(false)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-center">
              {/* Leitor Laser Animado */}
              <div className="relative p-6 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse"></div>
                <p className="font-mono text-[11px] text-emerald-400 mt-3">
                  {scannerStep === 'wristband' && 'Aguardando bip da pulseira do paciente...'}
                  {scannerStep === 'medication' && 'Pulseira OK! Bipando código de barras do medicamento...'}
                  {scannerStep === 'validated' && 'TODOS OS 5 CERTOS VALIDADOS COM SUCESSO!'}
                  {scannerStep === 'error' && 'BLOQUEIO DE SEGURANÇA: ALERGIA DETECTADA!'}
                </p>
              </div>

              {/* Passo 1: Bipar Pulseira */}
              {scannerStep === 'wristband' && (
                <div className="space-y-3">
                  <p className="text-slate-600">
                    Aponte o leitor para a pulseira com código de barras no punho do paciente:
                  </p>
                  <button
                    onClick={handleScanWristband}
                    className="w-full py-3 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    Simular Bip da Pulseira do Paciente
                  </button>
                </div>
              )}

              {/* Passo 2: Bipar Frasco */}
              {scannerStep === 'medication' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-left">
                    <p className="font-bold">✓ Pulseira Confirmada:</p>
                    <p className="font-mono text-[11px]">{selectedBed.patientName} (Prontuário {selectedBed.number})</p>
                  </div>

                  <p className="text-slate-600">
                    Agora bipe o rótulo do frasco / ampola a ser administrado:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleScanMedication(false)}
                      className="py-3 bg-[#14B8A6] hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      Bipar Ceftriaxona 1g (Correto)
                    </button>
                    <button
                      onClick={() => handleScanMedication(true)}
                      className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Simular Bip Dipirona (Alergia!)
                    </button>
                  </div>
                </div>
              )}

              {/* Passo 3: Sucesso */}
              {scannerStep === 'validated' && (
                <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-emerald-900">
                    5 CERTOS CONFORME PROTOCOLO ANVISA (RN09)
                  </h4>
                  <div className="text-[11px] text-emerald-800 text-left space-y-1 bg-white p-3 rounded-xl border border-emerald-200">
                    <p>✓ <strong>Paciente Certo:</strong> {selectedBed.patientName}</p>
                    <p>✓ <strong>Medicamento Certo:</strong> Ceftriaxona 1g IV</p>
                    <p>✓ <strong>Dose Certa:</strong> 1 Frasco-Ampola diluído em 100ml SF 0.9%</p>
                    <p>✓ <strong>Via Certa:</strong> Intravenosa (AVP em MSD)</p>
                    <p>✓ <strong>Hora Certa:</strong> Aprazamento 10:00 (Dentro da janela)</p>
                  </div>
                  <button
                    onClick={handleCompleteMedicationAdministration}
                    className="w-full py-3 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md"
                  >
                    Confirmar Infusão &amp; Assinar com COREN
                  </button>
                </div>
              )}

              {/* Passo 4: Erro Crítico Alergia */}
              {scannerStep === 'error' && (
                <div className="p-5 bg-red-50 border-2 border-red-500 rounded-2xl space-y-3 text-center animate-bounce">
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-sm text-red-900">
                    BLOQUEIO CRÍTICO DE SEGURANÇA!
                  </h4>
                  <p className="text-xs text-red-700">
                    O paciente possui <strong>alergia severa registrada a Dipirona</strong>. A administração foi interrompida pelo sistema.
                  </p>
                  <button
                    onClick={() => setScannerStep('medication')}
                    className="w-full py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs"
                  >
                    Voltar e Bipar Medicamento Correto
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end">
              <button
                onClick={() => setShowBarcodeScannerModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
