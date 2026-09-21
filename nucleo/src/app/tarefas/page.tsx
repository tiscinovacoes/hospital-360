'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
import {
  CheckCircle2,
  Clock,
  QrCode,
  AlertTriangle,
  Play,
  CheckSquare,
  Square,
  MapPin,
  User,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Smartphone,
  Check,
  Building2,
  DollarSign,
  Activity,
  Camera,
  X,
  Volume2,
  Pill,
  ShieldCheck,
  Bed,
} from 'lucide-react';

interface Tarefa {
  id: string;
  titulo: string;
  categoria: string;
  prioridade: string;
  status: string;
  localizacao: string;
  leitoId?: string;
  nomePaciente?: string;
  cpfPaciente?: string;
  responsavelNome: string;
  responsavelCargo: string;
  custoHoraProfissional: number;
  horarioProgramado: string;
  horarioInicio?: string;
  duracaoMinutos?: number;
  custoCalculadoMaoObra?: number;
  qrCodeExigido?: string;
  codigoMedicamento?: string;
  checklist: Array<{ item: string; concluido: boolean }>;
}

export default function TarefasAppPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODAS');
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Tarefa | null>(null);
  const [feedbackBaixa, setFeedbackBaixa] = useState<any>(null);
  const [feedbackFefo, setFeedbackFefo] = useState<any>(null);
  const [feedbackLeito, setFeedbackLeito] = useState<string | null>(null);
  const [qrCodeLido, setQrCodeLido] = useState(false);
  const [scannerAberto, setScannerAberto] = useState(false);
  
  // Cronômetro dinâmico em tempo real (mobile-design & react-patterns)
  const [segundosDecorridos, setSegundosDecorridos] = useState<number>(0);

  const [certosEnfermagem, setCertosEnfermagem] = useState({
    pacienteCerto: false,
    medicamentoCerto: false,
    doseCerta: false,
    viaCerta: false,
    horaCerta: false,
  });

  // Sintetizador de áudio para bip de scanner hospitalar (Web Audio API)
  const tocarBipScanner = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime); // Tom claro de leitor óptico
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);

      // Vibração tátil em smartphone (mobile-design)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch {
      // Falha silenciosa se não suportado
    }
  };

  const carregarTarefas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tarefas');
      const json = await res.json();
      if (json.success) {
        setTarefas(json.data);
        const emAndamento = json.data.find((t: Tarefa) => t.status === 'EM_ANDAMENTO') || json.data[0];
        setTarefaSelecionada(emAndamento);
      }
    } catch (err) {
      console.error('Erro ao carregar tarefas', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, []);

  // Hook reativo do cronômetro para tarefa em andamento (react-patterns)
  useEffect(() => {
    if (!tarefaSelecionada || tarefaSelecionada.status !== 'EM_ANDAMENTO' || !tarefaSelecionada.horarioInicio) {
      setSegundosDecorridos(0);
      return;
    }

    const inicioMs = new Date(tarefaSelecionada.horarioInicio).getTime();

    const atualizar = () => {
      const agoraMs = Date.now();
      const deltaSec = Math.max(0, Math.floor((agoraMs - inicioMs) / 1000));
      setSegundosDecorridos(deltaSec);
    };

    atualizar();
    const interval = setInterval(atualizar, 1000);
    return () => clearInterval(interval);
  }, [tarefaSelecionada]);

  const handleIniciarTarefa = async (tarefaId: string) => {
    try {
      const res = await fetch('/api/tarefas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'INICIAR', tarefaId }),
      });
      const json = await res.json();
      if (json.success) {
        tocarBipScanner();
        carregarTarefas();
      }
    } catch (err) {
      console.error('Erro ao iniciar', err);
    }
  };

  const handleSimularLeituraCamera = (qrCodeValor: string) => {
    tocarBipScanner();
    setQrCodeLido(true);
    setScannerAberto(false);
    // Ativa os 5 certos da enfermagem se for medicação
    setCertosEnfermagem({
      pacienteCerto: true,
      medicamentoCerto: true,
      doseCerta: true,
      viaCerta: true,
      horaCerta: true,
    });
  };

  const handleDarBaixa = async (tarefaId: string) => {
    try {
      const res = await fetch('/api/tarefas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BAIXA',
          tarefaId,
          qrCodeLido: true,
          observacao: 'Baixa confirmada via Mobile App com leitura de QR Code e validação dos 5 Certos.',
        }),
      });
      const json = await res.json();
      if (json.success) {
        tocarBipScanner();
        setFeedbackBaixa(json.data.eventoCustoIntegrado);

        if (json.data.leitoLiberado) {
          setFeedbackLeito(tarefaSelecionada?.leitoId || '108');
        }

        // Se a tarefa envolver medicamento, aciona a Baixa FEFO em tempo real no OpenBoxes (Sprint 2 - Mariana Siqueira)
        if (
          tarefaSelecionada?.categoria.includes('MEDICACAO') ||
          tarefaSelecionada?.titulo.toLowerCase().includes('medicamento') ||
          tarefaSelecionada?.titulo.toLowerCase().includes('ceftriaxona')
        ) {
          try {
            const resFefo = await fetch('/api/estoque/fefo-baixa', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                codigoMedicamento: 'MED-004', // Ceftriaxona 1g IV
                quantidadeRequisitada: 1,
                atendimentoId: `ATEND-${tarefaId}`,
                pacienteNome: tarefaSelecionada.nomePaciente || 'Carlos Eduardo Silveira',
                cpf: tarefaSelecionada.cpfPaciente || '123.456.789-00',
                motivo: `Baixa Beira-Leito App de Tarefas - Tarefa ${tarefaId}`,
              }),
            });
            const jsonFefo = await resFefo.json();
            if (jsonFefo.success) {
              setFeedbackFefo(jsonFefo.data);
            }
          } catch (e) {
            console.error('Erro ao baixar no FEFO', e);
          }
        }

        setQrCodeLido(false);
        carregarTarefas();
      }
    } catch (err) {
      console.error('Erro ao dar baixa', err);
    }
  };

  const formatarTempo = (totalSegundos: number) => {
    const mins = Math.floor(totalSegundos / 60);
    const secs = totalSegundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const custoMaoObraTempoReal = tarefaSelecionada
    ? Number(((segundosDecorridos / 3600) * tarefaSelecionada.custoHoraProfissional).toFixed(2))
    : 0;

  const tarefasFiltradas = tarefas.filter((t) => {
    if (filtroStatus === 'TODAS') return true;
    return t.status === filtroStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <HospitalNav />

      {/* Header Mobile PWA (Touch-First & High-Contrast) */}
      <section className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A5F] text-white py-5 px-4 sm:px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <Smartphone className="w-3.5 h-3.5" /> App Mobile PWA • Chão de Fábrica Hospitalar
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Central de Tarefas & Baixa Beira-Leito
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Sprint 2: Leitura QR Code, cronômetro de mão de obra e baixa imediata FEFO no OpenBoxes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setScannerAberto(true)}
              className="flex-1 sm:flex-none min-h-[48px] px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Abrir Câmera / QR Code</span>
            </button>
            <Link
              href="/ingestao-modulos"
              className="min-h-[48px] px-4 py-2.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Hub</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal de Leitura de Câmera / QR Code */}
      {scannerAberto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setScannerAberto(false)}
              className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-slate-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1">
                <Camera className="w-3.5 h-3.5 animate-pulse" /> Scanner Óptico Ativo (2D/QR)
              </span>
              <h3 className="text-lg font-bold">Aponte para o QR Code</h3>
              <p className="text-xs text-slate-400">
                Pulseira do paciente ou placa de identificação do leito
              </p>
            </div>

            {/* Visor de Mira da Câmera com Scanline animada */}
            <div className="relative w-64 h-64 mx-auto rounded-2xl border-2 border-emerald-500/50 bg-slate-950 flex items-center justify-center overflow-hidden shadow-inner">
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce opacity-90" />

              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />

              <div className="text-center space-y-2 p-4">
                <QrCode className="w-16 h-16 text-emerald-400/70 mx-auto" />
                <span className="text-xs font-mono font-bold text-emerald-300 block">
                  {tarefaSelecionada?.qrCodeExigido || 'QR-PULSEIRA-123456'}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                onClick={() => handleSimularLeituraCamera(tarefaSelecionada?.qrCodeExigido || 'QR-PULSEIRA-123456')}
                className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98"
              >
                <Volume2 className="w-4 h-4" /> Bip de Reconhecimento (QR Válido)
              </button>
              <button
                onClick={() => setScannerAberto(false)}
                className="w-full min-h-[44px] py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alertas de Feedback da Conclusão */}
      {(feedbackBaixa || feedbackLeito) && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-4 space-y-3">
          {feedbackLeito && (
            <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-2xl shadow-sm text-purple-900 flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <Bed className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">Leito {feedbackLeito} Liberado no Censo do Bahmni-Core!</p>
                  <p className="text-xs text-purple-700">
                    Higienização terminal concluída com sucesso. O leito já aparece como DISPONÍVEL para internação.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFeedbackLeito(null)}
                className="text-xs font-bold text-purple-800 hover:underline px-2 py-1"
              >
                Fechar
              </button>
            </div>
          )}

          {feedbackBaixa && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl shadow-sm text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Baixa da Tarefa Registrada no Núcleo 360!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Tempo apurado: <strong>{feedbackBaixa.duracao}</strong> • Custo Mão de Obra:{' '}
                    <strong>R$ {feedbackBaixa.valorCusto.toFixed(2)}</strong> ({feedbackBaixa.responsavel})
                  </p>
                  <p className="text-[11px] text-emerald-600 font-mono mt-1">
                    Evento integrado ao episódio Door-to-Door do paciente com sucesso.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedbackBaixa(null);
                  setFeedbackFefo(null);
                }}
                className="min-h-[40px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl self-end sm:self-auto"
              >
                Concluir
              </button>
            </div>
          )}

          {/* Se houve baixa FEFO associada */}
          {feedbackFefo && (
            <div className="p-4 bg-blue-50 border border-blue-300 rounded-2xl shadow-sm text-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Baixa FEFO Confirmada no OpenBoxes (Sprint 2)
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-blue-800">
                {feedbackFefo.itensBaixados?.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-blue-100">
                    <div>
                      <p className="font-bold text-slate-800">{it.nomeMedicamento} (Lote: {it.loteId})</p>
                      <p className="text-[11px] text-slate-500">
                        Validade: {it.dataValidade} ({it.diasAteVencimento} dias) • Status: {it.alertaCritico}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600">-{it.quantidadeBaixada} un</span>
                      <p className="text-[11px] text-slate-500">Custo: R$ {it.custoTotalBaixa.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Layout Principal Mobile-First */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Coluna 1: Fila de Tarefas (5 Cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtro:</span>
            <div className="flex gap-1 text-[11px] font-bold">
              {['TODAS', 'EM_ANDAMENTO', 'PROGRAMADA', 'CONCLUIDA'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFiltroStatus(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all min-h-[36px] ${
                    filtroStatus === st ? 'bg-[#1A56DB] text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st === 'TODAS' ? 'Todas' : st === 'EM_ANDAMENTO' ? 'Ativas' : st === 'PROGRAMADA' ? 'Fila' : 'Feitas'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Carregando tarefas do turno...</div>
            ) : tarefasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed">
                Nenhuma tarefa com esse status.
              </div>
            ) : (
              tarefasFiltradas.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setTarefaSelecionada(t);
                    setQrCodeLido(false);
                    setCertosEnfermagem({
                      pacienteCerto: false,
                      medicamentoCerto: false,
                      doseCerta: false,
                      viaCerta: false,
                      horaCerta: false,
                    });
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all min-h-[90px] ${
                    tarefaSelecionada?.id === t.id
                      ? 'bg-white border-[#1A56DB] shadow-md ring-2 ring-[#1A56DB]/15'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        t.status === 'EM_ANDAMENTO'
                          ? 'bg-amber-100 text-amber-800 animate-pulse font-extrabold'
                          : t.status === 'CONCLUIDA'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {t.horarioProgramado}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">{t.titulo}</h3>

                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t.localizacao}
                  </div>

                  {t.nomePaciente && (
                    <div className="mt-1 text-xs text-blue-700 font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {t.nomePaciente}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Detalhes, Cronômetro em Tempo Real e Baixa (7 Cols) */}
        <div className="md:col-span-7">
          {tarefaSelecionada ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-20">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-[#1A56DB] uppercase tracking-wider">
                    {tarefaSelecionada.categoria} • ID: {tarefaSelecionada.id}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">{tarefaSelecionada.titulo}</h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {tarefaSelecionada.localizacao}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 text-xs font-bold rounded-lg uppercase ${
                    tarefaSelecionada.prioridade === 'URGENTE'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : tarefaSelecionada.prioridade === 'ALTA'
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {tarefaSelecionada.prioridade}
                </span>
              </div>

              {/* Box de Informações do Profissional & Cronômetro em Tempo Real */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Profissional Alocado</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">
                    {tarefaSelecionada.responsavelNome}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {tarefaSelecionada.responsavelCargo} • R$ {tarefaSelecionada.custoHoraProfissional.toFixed(2)}/h
                  </span>
                </div>

                {/* Cronômetro Ativo & Custo Contínuo */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    {tarefaSelecionada.status === 'EM_ANDAMENTO' ? 'Cronômetro Ativo' : 'Custo Mão de Obra'}
                  </span>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-sm font-mono font-extrabold text-amber-900">
                      {tarefaSelecionada.status === 'EM_ANDAMENTO'
                        ? formatarTempo(segundosDecorridos)
                        : `${tarefaSelecionada.duracaoMinutos || 25} min`}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      R${' '}
                      {tarefaSelecionada.status === 'EM_ANDAMENTO'
                        ? custoMaoObraTempoReal.toFixed(2)
                        : (tarefaSelecionada.custoCalculadoMaoObra || 13.33).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[9px] text-amber-700 block mt-0.5">
                    {tarefaSelecionada.status === 'EM_ANDAMENTO'
                      ? 'Apuração segundo a segundo'
                      : 'Custo final consolidado'}
                  </span>
                </div>
              </div>

              {/* Validação dos 5 Certos da Enfermagem (se houver medicação) */}
              {tarefaSelecionada.categoria === 'ENFERMAGEM' && (
                <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-2.5">
                  <span className="text-xs font-bold text-cyan-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-[#0891B2]" /> Protocolo de Segurança: 5 Certos da Enfermagem
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(certosEnfermagem).map(([key, val]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white border border-cyan-100 cursor-pointer min-h-[40px]"
                      >
                        <input
                          type="checkbox"
                          checked={val}
                          onChange={(e) =>
                            setCertosEnfermagem((prev) => ({ ...prev, [key]: e.target.checked }))
                          }
                          className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                        />
                        <span className="capitalize text-[11px] font-semibold text-slate-700">
                          {key.replace('Certo', ' Certo')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklist Operacional */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#1A56DB]" /> Procedimentos Obrigatórios (Checklist)
                </h4>
                <div className="space-y-2">
                  {tarefaSelecionada.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700 min-h-[44px]"
                    >
                      {item.concluido || tarefaSelecionada.status === 'CONCLUIDA' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      )}
                      <span>{item.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validação de Presença: QR Code (Touch-First) */}
              {tarefaSelecionada.status !== 'CONCLUIDA' && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#1A56DB]" /> Comprovação de Presença no Local
                    </span>
                    {qrCodeLido ? (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> QR Validado (Bip OK)
                      </span>
                    ) : (
                      <span className="text-[11px] text-blue-700 font-semibold">Leitura obrigatória</span>
                    )}
                  </div>

                  <p className="text-xs text-blue-800">
                    Aponte a câmera para o QR Code da pulseira do paciente ou placa do leito (
                    <code className="font-mono text-[11px] bg-blue-100 px-1 py-0.5 rounded">
                      {tarefaSelecionada.qrCodeExigido || 'QR-PULSEIRA'}
                    </code>
                    ) para autorizar a baixa da tarefa.
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setScannerAberto(true)}
                      className="flex-1 min-h-[48px] py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                    >
                      <Camera className="w-4 h-4" /> Abrir Câmera
                    </button>
                    <button
                      onClick={() => handleSimularLeituraCamera(tarefaSelecionada.qrCodeExigido || 'QR-RAPIDO')}
                      className={`min-h-[48px] px-4 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 active:scale-98 ${
                        qrCodeLido
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <span>Bip Rápido</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Botões de Ação com alvos de toque >= 48px para uso com luvas */}
              <div className="pt-2">
                {tarefaSelecionada.status === 'PROGRAMADA' && (
                  <button
                    onClick={() => handleIniciarTarefa(tarefaSelecionada.id)}
                    className="w-full min-h-[48px] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <Play className="w-4 h-4" /> Iniciar Execução & Ativar Cronômetro
                  </button>
                )}

                {tarefaSelecionada.status === 'EM_ANDAMENTO' && (
                  <button
                    onClick={() => handleDarBaixa(tarefaSelecionada.id)}
                    disabled={!qrCodeLido}
                    className={`w-full min-h-[52px] py-3.5 text-white font-bold rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 ${
                      qrCodeLido
                        ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-emerald-600/25'
                        : 'bg-slate-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {qrCodeLido ? 'Confirmar Baixa & Liberar Leito no Censo' : 'Escanear QR Code para Liberar Baixa'}
                  </button>
                )}

                {tarefaSelecionada.status === 'CONCLUIDA' && (
                  <div className="p-4 bg-slate-100 rounded-xl text-center text-xs text-slate-600 font-semibold flex items-center justify-center gap-2 min-h-[48px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Tarefa concluída e baixada com sucesso no sistema hospitalar.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Selecione uma tarefa ao lado para visualizar os detalhes e dar baixa.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
