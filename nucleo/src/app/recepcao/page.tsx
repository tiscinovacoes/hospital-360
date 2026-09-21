'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
import {
  QrCode,
  Ticket,
  MapPin,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Search,
  AlertTriangle,
  Stethoscope,
  FlaskConical,
  PhoneCall,
  Camera,
  Tv,
  Printer,
  ShieldCheck,
  UserCheck,
  Volume2,
  Delete,
  X,
} from 'lucide-react';

type KioskScreen = 'home' | 'agendamento' | 'senha' | 'localizar' | 'sucesso' | 'painel_tv';

export default function KioskReceptionPage() {
  const [screen, setScreen] = useState<KioskScreen>('home');
  const [generatedTicket, setGeneratedTicket] = useState<{ number: string; type: string; wait: string; priorityColor: string; patient?: string }>({
    number: 'A247',
    type: 'Consulta Eletiva',
    wait: '15–20 min',
    priorityColor: '#0284C7',
    patient: 'Ana Carolina Souza',
  });
  const [currentTime, setCurrentTime] = useState<string>('');
  const [cpfInput, setCpfInput] = useState<string>('');
  const [cameraScanning, setCameraScanning] = useState<boolean>(false);

  // Painel de Chamada TV Simulado
  const [calledTickets, setCalledTickets] = useState([
    { ticket: 'U089', room: 'Consultório 101 - Emergência', doctor: 'Dr. Roberto Brandão', status: 'CHAMANDO' },
    { ticket: 'A244', room: 'Consultório 204 - Cardiologia', doctor: 'Dr. Ricardo Mendes', status: 'ATENDIMENTO' },
    { ticket: 'E312', room: 'Laboratório Central - Box 02', doctor: 'Bióloga Fernanda', status: 'AGUARDANDO' },
  ]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKeypadPress = (val: string) => {
    if (val === 'clear') {
      setCpfInput('');
    } else if (val === 'backspace') {
      setCpfInput((prev) => prev.slice(0, -1));
    } else {
      if (cpfInput.length < 11) {
        setCpfInput((prev) => prev + val);
      }
    }
  };

  const formatCpf = (raw: string) => {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleSimulateScanCamera = () => {
    setCameraScanning(true);
    setTimeout(() => {
      setCameraScanning(false);
      handleGenerateTicket('Check-in QR Code Confirmado', 'A', '#0284C7', 'Ana Carolina Souza');
    }, 2000);
  };

  const handleGenerateTicket = (type: string, prefix: string, priorityColor: string = '#0284C7', patient: string = 'Paciente Anônimo') => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const num = `${prefix}${randomNum}`;
    setGeneratedTicket({
      number: num,
      type,
      wait: prefix === 'U' ? 'Imediato (< 5 min)' : prefix === 'P' ? '10–15 min' : '20–30 min',
      priorityColor,
      patient,
    });
    setScreen('sucesso');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F9FF] text-[#111928]">
      <HospitalNav />

      {/* Header do Totem */}
      <div className="bg-[#0284C7] text-white py-5 px-4 sm:px-6 shadow-md border-b border-sky-700">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-sky-100 hover:text-white mb-1.5 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Seleção de Módulos</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-800/80 rounded-xl border border-sky-600">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Totem de Autoatendimento &amp; Recepção 360°
                </h1>
                <p className="text-xs text-sky-100">
                  Terminal Touchscreen de Entrada • Hall Central Térreo
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setScreen(screen === 'painel_tv' ? 'home' : 'painel_tv')}
              className="px-3.5 py-1.5 rounded-xl bg-sky-800/90 hover:bg-sky-900 border border-sky-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Tv className="w-4 h-4 text-amber-300" />
              {screen === 'painel_tv' ? 'Modo Totem Touch' : 'Painel TV Chamada'}
            </button>
            <div className="text-right font-mono text-sm bg-sky-950/50 px-3 py-1 rounded-xl border border-sky-800">
              <span className="font-bold text-white">{currentTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Interativo do Totem */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex items-center justify-center">
        
        {/* =========================================================================
            TELA 1: HOME TOUCHSCREEN
           ========================================================================= */}
        {screen === 'home' && (
          <div className="w-full space-y-6 animate-in fade-in duration-200">
            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-full bg-sky-100 text-[#0284C7] text-xs font-extrabold uppercase tracking-wider mb-2 inline-block">
                Autoatendimento Rápido
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0C4A6E]">
                Bem-vindo ao Hospital 360
              </h2>
              <p className="text-sm text-[#0369A1] mt-1 max-w-lg mx-auto">
                Toque na tela para fazer check-in de sua consulta, retirar senha de atendimento ou localizar seu médico
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <button
                onClick={() => setScreen('agendamento')}
                className="p-8 rounded-3xl bg-white border-2 border-[#38BDF8] hover:border-[#0284C7] shadow-lg hover:shadow-xl transition-all text-center flex flex-col items-center justify-center group active:scale-95 cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <QrCode className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-[#0C4A6E] mb-1">
                  Já Tenho Consulta
                </h3>
                <p className="text-xs text-[#0369A1]">
                  Check-in instantâneo via QR Code do WhatsApp ou digitação de CPF
                </p>
              </button>

              <button
                onClick={() => setScreen('senha')}
                className="p-8 rounded-3xl bg-white border-2 border-[#4ADE80] hover:border-[#16A34A] shadow-lg hover:shadow-xl transition-all text-center flex flex-col items-center justify-center group active:scale-95 cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Ticket className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-[#14532D] mb-1">
                  Retirar Nova Senha
                </h3>
                <p className="text-xs text-[#15803D]">
                  Urgência, Exames Laboratoriais ou Atendimento Preferencial
                </p>
              </button>

              <button
                onClick={() => setScreen('localizar')}
                className="p-8 rounded-3xl bg-white border-2 border-[#C084FC] hover:border-[#9333EA] shadow-lg hover:shadow-xl transition-all text-center flex flex-col items-center justify-center group active:scale-95 cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-[#581C87] mb-1">
                  Localizar Consultório
                </h3>
                <p className="text-xs text-[#7E22CE]">
                  Guia de andares, salas dos médicos especialistas e exames
                </p>
              </button>
            </div>

            <div className="text-center pt-6">
              <button
                onClick={() => alert('Atendente humano foi notificado para se dirigir ao Totem 01!')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-[#BAE6FD] text-[#0369A1] hover:bg-[#E0F2FE] transition-colors shadow-xs"
              >
                <PhoneCall className="w-4 h-4 text-[#0284C7]" />
                <span>Precisa de auxílio de acessibilidade? Chamar atendente humano</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            TELA 2: CHECK-IN COM TECLADO TOUCH VIRTUAL E SCANNER QR CODE
           ========================================================================= */}
        {screen === 'agendamento' && (
          <div className="w-full max-w-2xl bg-white p-8 rounded-3xl border border-[#BAE6FD] shadow-xl space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F9FF]">
              <button
                onClick={() => setScreen('home')}
                className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1"
              >
                ← Voltar ao Início
              </button>
              <h2 className="text-lg font-bold text-[#0C4A6E]">
                Identificação do Paciente para Check-in
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Leitor QR Code / Câmera */}
              <div className="p-6 bg-slate-50 border-2 border-dashed border-sky-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 text-[#0284C7] flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0C4A6E]">Aproxime o QR Code</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Posicione o código do WhatsApp em frente à câmera do totem</p>
                </div>
                <button
                  onClick={handleSimulateScanCamera}
                  disabled={cameraScanning}
                  className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {cameraScanning ? 'Lendo QR Code...' : 'Simular Leitura Óptica'}
                </button>
              </div>

              {/* Teclado Virtual Numérico na Tela */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Ou digite seu CPF no teclado:
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-center font-mono font-bold text-lg text-[#111928] min-h-[46px]">
                    {formatCpf(cpfInput) || <span className="text-slate-400">000.000.000-00</span>}
                  </div>
                </div>

                {/* Grid 3x4 de Teclas Touch */}
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleKeypadPress(num)}
                      className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-mono font-bold text-base shadow-xs active:bg-slate-300 transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => handleKeypadPress('clear')}
                    className="p-3.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold text-xs shadow-xs"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={() => handleKeypadPress('0')}
                    className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-mono font-bold text-base shadow-xs"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handleKeypadPress('backspace')}
                    className="p-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>

                <button
                  disabled={cpfInput.length < 11}
                  onClick={() => handleGenerateTicket('Consulta Agendada (Dr. Ricardo Mendes)', 'A', '#0284C7', 'Ana Carolina Souza')}
                  className="w-full py-3 bg-[#0E9F6E] hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Confirmar Check-in
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TELA 3: RETIRADA DE SENHA COM PROTOCOLO DE MANCHESTER
           ========================================================================= */}
        {screen === 'senha' && (
          <div className="w-full max-w-3xl bg-white p-8 rounded-3xl border border-[#BAE6FD] shadow-xl space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F9FF]">
              <button
                onClick={() => setScreen('home')}
                className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1"
              >
                ← Voltar ao Início
              </button>
              <h2 className="text-lg font-bold text-[#0C4A6E]">
                Classificação de Atendimento (Triagem)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleGenerateTicket('Urgência / Triagem Rápida', 'U', '#DC2626', 'Paciente Emergencial')}
                className="p-5 rounded-2xl border-2 border-red-300 bg-red-50 hover:bg-red-100 text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                    Protocolo Vermelho
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded-full">
                    SLA &lt; 5 min
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-red-950">Urgência Médica</h4>
                <p className="text-xs text-red-700 mt-1">Dor torácica, falta de ar severa ou febre alta persistente</p>
              </button>

              <button
                onClick={() => handleGenerateTicket('Atendimento Preferencial (Lei 10.048)', 'P', '#D97706', 'Paciente Preferencial')}
                className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                    Prioridade Legal
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    SLA &lt; 15 min
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-amber-950">Preferencial</h4>
                <p className="text-xs text-amber-700 mt-1">Idosos 60+, gestantes, lactantes e pessoas com deficiência</p>
              </button>

              <button
                onClick={() => handleGenerateTicket('Exames de Análises Clínicas', 'E', '#7C3AED', 'Paciente Laboratório')}
                className="p-5 rounded-2xl border-2 border-purple-300 bg-purple-50 hover:bg-purple-100 text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                    Laboratório Central
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                    SLA 15–20 min
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-purple-950">Coleta de Exames</h4>
                <p className="text-xs text-purple-700 mt-1">Sangue, urina, ECG, raio-X e diagnóstico</p>
              </button>

              <button
                onClick={() => handleGenerateTicket('Consulta Médica Geral', 'C', '#0284C7', 'Paciente Ambulatorial')}
                className="p-5 rounded-2xl border-2 border-sky-300 bg-sky-50 hover:bg-sky-100 text-left transition-all active:scale-95 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                    Clínicas Especializadas
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-sky-200 text-sky-900 px-2 py-0.5 rounded-full">
                    SLA 20–30 min
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-sky-950">Consulta Eletiva</h4>
                <p className="text-xs text-sky-700 mt-1">Atendimento de rotina e retorno clínico agendado</p>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            TELA 4: LOCALIZADOR DE SALAS
           ========================================================================= */}
        {screen === 'localizar' && (
          <div className="w-full max-w-2xl bg-white p-8 rounded-3xl border border-[#BAE6FD] shadow-xl space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F9FF]">
              <button
                onClick={() => setScreen('home')}
                className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1"
              >
                ← Voltar ao Início
              </button>
              <h2 className="text-lg font-bold text-[#0C4A6E]">Localizar Salas e Médicos</h2>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#0284C7] absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Buscar médico por nome ou especialidade..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#7DD3FC] text-xs outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {[
                { name: 'Dr. Ricardo Mendes', spec: 'Cardiologia & Ecocardiograma', room: 'Sala 204 (2º Andar)', floor: '2º Andar Ala Sul' },
                { name: 'Dra. Camila Nogueira', spec: 'Neurologia Clínica & Sono', room: 'Sala 102 (1º Andar)', floor: '1º Andar Ala Norte' },
                { name: 'Dr. Thiago Vasconcelos', spec: 'Ortopedia & Traumatologia', room: 'Sala 205 (2º Andar)', floor: '2º Andar Ala Sul' },
                { name: 'Laboratório Central do Hub', spec: 'Coleta de Sangue & Imagem', room: 'Ala Leste (Térreo)', floor: 'Térreo' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#E0F2FE] hover:bg-[#F0F9FF] flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-[#0C4A6E]">{item.name}</h4>
                    <p className="text-[11px] text-[#0369A1]">{item.spec}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.floor}</p>
                  </div>
                  <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E0F2FE] text-[#0284C7] border border-sky-200">
                    {item.room}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TELA 5: SUCESSO & IMPRESSÃO DE TICKET TÉRMICO
           ========================================================================= */}
        {screen === 'sucesso' && (
          <div className="w-full max-w-md bg-white p-8 rounded-3xl border-2 border-[#16A34A] shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#16A34A] mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Check-in Realizado com Sucesso
              </span>
              <p className="text-xs text-[#6B7280] mt-1">{generatedTicket.type}</p>
            </div>

            {/* Simulação de Ticket Térmico de Impressora Hospitalar */}
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-slate-800 space-y-3 font-mono">
              <div className="text-[10px] text-slate-500 border-b border-slate-200 pb-2">
                HOSPITAL 360 • RECEPTOR CENTRAL
                <br />
                DATA: 18/09/2026 — {currentTime}
              </div>

              <div>
                <span className="text-xs text-slate-500">SENHA DE CHAMADA:</span>
                <div
                  className="text-5xl font-extrabold tracking-wider my-2"
                  style={{ color: generatedTicket.priorityColor }}
                >
                  {generatedTicket.number}
                </div>
              </div>

              <div className="text-xs text-slate-600 border-t border-slate-200 pt-2">
                <p>Paciente: <strong>{generatedTicket.patient}</strong></p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Tempo Estimado: <strong>{generatedTicket.wait}</strong>
                </p>
              </div>

              <div className="pt-2 text-[9px] text-slate-400">
                Aguarde chamada no Painel de TV da Sala de Espera
              </div>
            </div>

            <button
              onClick={() => setScreen('home')}
              className="w-full py-3 bg-[#0284C7] hover:bg-sky-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors"
            >
              Concluir Atendimento
            </button>
          </div>
        )}

        {/* =========================================================================
            TELA 6: PAINEL DE TV DA SALA DE ESPERA (CALLING BOARD)
           ========================================================================= */}
        {screen === 'painel_tv' && (
          <div className="w-full max-w-4xl bg-[#0F172A] text-white p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Tv className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  Painel de Chamada Hospitalar — 2º Andar
                </h3>
              </div>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-bold animate-pulse">
                AO VIVO
              </span>
            </div>

            {/* Senha em Destaque Principal */}
            <div className="p-8 bg-gradient-to-r from-blue-900 to-indigo-950 border-2 border-blue-500 rounded-3xl text-center space-y-2 shadow-2xl">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest flex items-center justify-center gap-2">
                <Volume2 className="w-4 h-4 animate-bounce" /> CHAMADA ATUAL
              </span>
              <div className="text-7xl font-mono font-extrabold text-white tracking-widest my-2">
                {calledTickets[0].ticket}
              </div>
              <p className="text-lg font-bold text-sky-200">{calledTickets[0].room}</p>
              <p className="text-xs text-slate-300">{calledTickets[0].doctor}</p>
            </div>

            {/* Lista das Últimas Chamadas */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Histórico de Chamadas Recentes:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {calledTickets.slice(1).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-2xl font-mono font-bold text-white">{item.ticket}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{item.room}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setScreen('home')}
                className="text-xs text-sky-400 hover:underline"
              >
                ← Voltar para o Modo Totem
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
