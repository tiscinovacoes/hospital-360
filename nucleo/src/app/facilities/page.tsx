'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ArrowLeft,
  ShieldCheck,
  Building,
  CheckSquare,
  Square,
  Plus,
  X,
  FileCheck,
  Send,
  Zap,
} from 'lucide-react';

interface Task {
  id: string;
  location: string;
  type: 'Terminal' | 'Concorrente' | 'Preventiva';
  priority: 'Crítica' | 'Alta' | 'Normal';
  status: 'Pendente' | 'Em Andamento' | 'Concluída';
  origin: string;
  elapsedSeconds: number;
}

const initialTasks: Task[] = [
  {
    id: 'f-1',
    location: 'Leito 103 (1º Andar - Clínica)',
    type: 'Terminal',
    priority: 'Crítica',
    status: 'Em Andamento',
    origin: 'Alta médica confirmada pela Enfermagem (RN08)',
    elapsedSeconds: 840,
  },
  {
    id: 'f-2',
    location: 'Centro Cirúrgico 03 (3º Andar)',
    type: 'Terminal',
    priority: 'Crítica',
    status: 'Pendente',
    origin: 'Término de cirurgia ortopédica',
    elapsedSeconds: 0,
  },
  {
    id: 'f-3',
    location: 'Sala 204 (Cardiologia - CardioVida)',
    type: 'Concorrente',
    priority: 'Alta',
    status: 'Pendente',
    origin: 'Solicitado pelo médico no intervalo de consultas',
    elapsedSeconds: 0,
  },
  {
    id: 'f-4',
    location: 'Corredor Ala B (2º Andar)',
    type: 'Preventiva',
    priority: 'Normal',
    status: 'Concluída',
    origin: 'Rotina periódica de sanitização',
    elapsedSeconds: 1200,
  },
];

const checklistItems = [
  'Uso obrigatório de EPI completo (luvas, avental impermeável, máscara, óculos de proteção)',
  'Descarte correto de resíduos infectantes no recipiente apropriado com pedal (Grupo A)',
  'Descarte de perfurocortantes em caixa rígida descarpack lacrada',
  'Higienização de maçanetas, interruptores e superfícies de alto toque',
  'Limpeza e desinfecção terminal do colchão e cabeceira com quaternário de amônio',
  'Desinfecção de suporte de soro, monitor multiparamétrico e régua de gases medicinais',
  'Higienização profunda e desinfecção do piso com água e sabão neutro + hipoclorito',
  'Reposição de sabonete líquido antibacteriano, álcool em gel 70% e papel toalha',
  'Troca completa do enxoval por roupas de cama esterilizadas e ensacadas',
  'Sinalização de piso molhado retirada após secagem total e leito lacrado',
];

export default function FacilitiesAppPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTaskId, setActiveTaskId] = useState<string>('f-1');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Form de Nova Tarefa
  const [newLocation, setNewLocation] = useState('Leito 203 (2º Andar)');
  const [newType, setNewType] = useState<'Terminal' | 'Concorrente' | 'Preventiva'>('Terminal');
  const [newPriority, setNewPriority] = useState<'Crítica' | 'Alta' | 'Normal'>('Crítica');
  const [newOrigin, setNewOrigin] = useState('Alta de paciente com precaução de contato');

  // Cronômetro ao vivo
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTaskId && t.status === 'Em Andamento'
            ? { ...t, elapsedSeconds: t.elapsedSeconds + 1 }
            : t
        )
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, activeTaskId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];
  const totalChecked = Object.values(checkedItems).filter(Boolean).length;
  const is100Percent = totalChecked === checklistItems.length;

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleStartTask = (task: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'Em Andamento' } : t))
    );
    setActiveTaskId(task.id);
    setIsRunning(true);
    showToast(`Cronômetro iniciado para ${task.location}. SLA alvo: 30 minutos.`);
  };

  const handleCompleteTask = () => {
    if (!is100Percent) {
      showToast('Regra ANVISA: Todos os 10 itens do checklist devem estar verificados!');
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === activeTask.id ? { ...t, status: 'Concluída' } : t))
    );
    showToast(
      `Higienização de ${activeTask.location} concluída com 100% de conformidade! Leito liberado como "Vago" no Posto de Enfermagem.`
    );
  };

  const handleCreateNewTask = () => {
    const created: Task = {
      id: `f-${Date.now()}`,
      location: newLocation,
      type: newType,
      priority: newPriority,
      status: 'Pendente',
      origin: newOrigin,
      elapsedSeconds: 0,
    };
    setTasks((prev) => [created, ...prev]);
    setShowNewTaskModal(false);
    showToast(`Nova Ordem de Higienização criada para ${newLocation}!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0C111D] text-slate-100 font-sans">
      <HospitalNav />

      {/* Toast Flutuante Dark */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1E3A5F] text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-400 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-300 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Facilities (Mobile-First Laranja / Dark) */}
      <div className="bg-[#161F38] border-b border-slate-800 py-5 px-4 sm:px-6 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 mb-2 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="inline-flex items-center min-h-[24px]">Voltar para Seleção de Módulos</span>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-600/20 rounded-xl border border-orange-500/40">
                <Sparkles className="w-6 h-6 text-[#EA580C]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Facilities, Hotelaria &amp; Governança Hospitalar
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Operação Centralizada de Limpeza Terminal &amp; Concorrente (Protocolo RN08)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova OS de Limpeza
            </button>
          </div>
        </div>
      </div>

      {/* Layout Principal Mobile-First */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna Esquerda: Fila de Tarefas (5 colunas em lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-orange-400" />
              Fila de Chamados Ativos ({tasks.filter((t) => t.status !== 'Concluída').length})
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
              SLA Alvo: 30 min
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const isSelected = activeTaskId === task.id;
              const isOverdue = task.elapsedSeconds > 1800;

              return (
                <div
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E294B] border-orange-500 shadow-lg ring-1 ring-orange-500/40'
                      : 'bg-[#111728] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-white">
                      {task.location}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.status === 'Em Andamento'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          : task.status === 'Concluída'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-2">{task.origin}</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                    <span className="font-mono text-[11px] text-orange-400 font-semibold">
                      Tipo: {task.type}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className={isOverdue ? 'text-red-400 font-bold animate-pulse' : 'text-slate-300'}>
                        {formatTimer(task.elapsedSeconds)}
                      </span>
                    </div>
                  </div>

                  {task.status === 'Pendente' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTask(task);
                      }}
                      className="mt-3 w-full py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Iniciar Higienização
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita: Checklist ANVISA & Painel de Execução (7 colunas em lg) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card de Execução da Tarefa Ativa */}
          <div className="bg-[#111728] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 border border-orange-900 px-2 py-0.5 rounded-full">
                  Higienização {activeTask.type}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  {activeTask.location}
                </h2>
                <p className="text-xs text-slate-400">{activeTask.origin}</p>
              </div>

              {/* Cronômetro Gigante */}
              <div className="bg-[#0C111D] border border-slate-700 p-3 rounded-2xl text-center min-w-[140px]">
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-orange-400" /> Tempo Decorrido
                </div>
                <div className="text-2xl font-mono font-extrabold text-white mt-1">
                  {formatTimer(activeTask.elapsedSeconds)}
                </div>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="p-1 min-h-[24px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 px-2"
                  >
                    {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {isRunning ? 'Pausar' : 'Continuar'}
                  </button>
                </div>
              </div>
            </div>

            {/* Barra de Progresso do Checklist */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Conformidade Sanitária (ANVISA RDC 50)
                </span>
                <span className="font-mono font-bold text-orange-400">
                  {totalChecked} de {checklistItems.length} ({Math.round((totalChecked / checklistItems.length) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${(totalChecked / checklistItems.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Lista dos 10 Itens do Checklist */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Checklist Obrigatório de Higienização:
              </p>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {checklistItems.map((item, idx) => {
                  const isChecked = !!checkedItems[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`p-3 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer text-xs ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        aria-label={item}
                        className="mt-0.5 w-6 h-6 shrink-0 rounded text-emerald-500 accent-emerald-500"
                      />
                      <span className="flex-1 leading-relaxed">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ação de Finalização com Bloqueio se não estiver 100% */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                {!is100Percent ? 'Complete os 10 itens para habilitar a liberação.' : 'Leito pronto para entrega estéril.'}
              </span>

              <button
                disabled={!is100Percent}
                onClick={handleCompleteTask}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0E9F6E] hover:bg-emerald-600 disabled:opacity-40 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                Liberar Leito no Censo do Posto (RN08)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          MODAL: NOVA ORDEM DE SERVIÇO DE LIMPEZA
         ========================================================================= */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#111728] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-400" />
                Nova OS de Facilities &amp; Higienização
              </h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Local / Unidade:</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                  placeholder="Ex: Leito 201, Sala 204, etc."
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Tipo de Limpeza:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'Terminal' | 'Concorrente' | 'Preventiva')}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                >
                  <option value="Terminal">Terminal (Desinfecção Profunda / Pós-Alta)</option>
                  <option value="Concorrente">Concorrente (Higienização Rápida no Turno)</option>
                  <option value="Preventiva">Preventiva (Rotina de Áreas Comuns)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Prioridade:</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as 'Crítica' | 'Alta' | 'Normal')}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                >
                  <option value="Crítica">Crítica (SLA 15 min)</option>
                  <option value="Alta">Alta (SLA 30 min)</option>
                  <option value="Normal">Normal (SLA 60 min)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Motivo / Origem:</label>
                <textarea
                  rows={2}
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="px-4 py-2 border border-slate-700 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewTask}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-sm"
              >
                Criar Chamado
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
