'use client';

import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  PieChart,
  ArrowUpRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';

export interface AlaHospitalar {
  id: string;
  nome: string;
  tipo: 'UTI' | 'ENFERMARIA' | 'CIRURGICO' | 'EMERGENCIA';
  leitosTotais: number;
  leitosOcupados: number;
  leitosHigienizacao: number;
  leitosManutencao: number;
  taxaOcupacaoPercentual: number;
  tempoMedioHigienizacaoMinutos: number;
}

export interface ProcedimentoMargemEbitda {
  codigo: string;
  nome: string;
  clinicaParceira: string;
  volumeAtendimentos: number;
  custoMedioReal: number;
  faturamentoMedioTuss: number;
  repasseMedioSigtap: number;
  margemEbitdaPercentual: number;
  statusEbitda: 'EXCELENTE' | 'ESTAVEL' | 'CRITICO';
}

const ALAS_MOCK: AlaHospitalar[] = [
  {
    id: 'ala-uti-01',
    nome: 'UTI Adulto Central',
    tipo: 'UTI',
    leitosTotais: 10,
    leitosOcupados: 9,
    leitosHigienizacao: 1,
    leitosManutencao: 0,
    taxaOcupacaoPercentual: 90.0,
    tempoMedioHigienizacaoMinutos: 42,
  },
  {
    id: 'ala-enf-02',
    nome: 'Enfermaria Geral (Ala Norte)',
    tipo: 'ENFERMARIA',
    leitosTotais: 20,
    leitosOcupados: 16,
    leitosHigienizacao: 2,
    leitosManutencao: 2,
    taxaOcupacaoPercentual: 80.0,
    tempoMedioHigienizacaoMinutos: 35,
  },
  {
    id: 'ala-cir-03',
    nome: 'Centro Cirúrgico (Salas 1 a 4)',
    tipo: 'CIRURGICO',
    leitosTotais: 6,
    leitosOcupados: 5,
    leitosHigienizacao: 1,
    leitosManutencao: 0,
    taxaOcupacaoPercentual: 83.3,
    tempoMedioHigienizacaoMinutos: 28,
  },
  {
    id: 'ala-emerg-04',
    nome: 'Pronto Atendimento & Triagem',
    tipo: 'EMERGENCIA',
    leitosTotais: 12,
    leitosOcupados: 9,
    leitosHigienizacao: 2,
    leitosManutencao: 1,
    taxaOcupacaoPercentual: 75.0,
    tempoMedioHigienizacaoMinutos: 22,
  },
];

const MARGENS_EBITDA_MOCK: ProcedimentoMargemEbitda[] = [
  {
    codigo: 'CARD-ANGIO-01',
    nome: 'Angioplastia Coronariana c/ Stent Pharmacológico',
    clinicaParceira: 'Clínica CardioVida (Dr. Ricardo Mendes)',
    volumeAtendimentos: 18,
    custoMedioReal: 7460.00,
    faturamentoMedioTuss: 12500.00,
    repasseMedioSigtap: 2850.00,
    margemEbitdaPercentual: 40.3,
    statusEbitda: 'EXCELENTE',
  },
  {
    codigo: 'ORT-ARTRO-02',
    nome: 'Artroscopia de Joelho c/ Reconstrução Ligamentar',
    clinicaParceira: 'OrtoMaster (Dra. Juliana Paes)',
    volumeAtendimentos: 24,
    custoMedioReal: 4120.00,
    faturamentoMedioTuss: 6800.00,
    repasseMedioSigtap: 1650.00,
    margemEbitdaPercentual: 39.4,
    statusEbitda: 'EXCELENTE',
  },
  {
    codigo: 'CIR-COLEC-03',
    nome: 'Colecistectomia Videolaparoscópica',
    clinicaParceira: 'Cirurgia Geral Parceira',
    volumeAtendimentos: 31,
    custoMedioReal: 2890.00,
    faturamentoMedioTuss: 4200.00,
    repasseMedioSigtap: 1200.00,
    margemEbitdaPercentual: 31.2,
    statusEbitda: 'ESTAVEL',
  },
  {
    codigo: 'TRAU-DREN-04',
    nome: 'Drenagem de Tórax Fechada em Selo d’Água',
    clinicaParceira: 'Emergência & Trauma 24h',
    volumeAtendimentos: 12,
    custoMedioReal: 1850.00,
    faturamentoMedioTuss: 1950.00,
    repasseMedioSigtap: 890.00,
    margemEbitdaPercentual: 5.1,
    statusEbitda: 'CRITICO',
  },
];

export function CockpitCensoEbitda() {
  const totalLeitos = ALAS_MOCK.reduce((acc, a) => acc + a.leitosTotais, 0);
  const totalOcupados = ALAS_MOCK.reduce((acc, a) => acc + a.leitosOcupados, 0);
  const totalHigienizacao = ALAS_MOCK.reduce((acc, a) => acc + a.leitosHigienizacao, 0);
  const totalManutencao = ALAS_MOCK.reduce((acc, a) => acc + a.leitosManutencao, 0);
  const totalLivres = totalLeitos - (totalOcupados + totalHigienizacao + totalManutencao);
  const taxaOcupacaoGeral = ((totalOcupados / totalLeitos) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* SECTION 1: DATA STORYTELLING BANNER */}
      <div className="bg-[#0E5C4C] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                Data Storytelling C-Level (Sprint 3)
              </span>
              <span className="text-xs text-emerald-200 font-semibold">• Censo em Tempo Real</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Eficiência Operacional: Ocupação em {taxaOcupacaoGeral}% e Giro Médio de 32 minutos
            </h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              O motor de custeio Door-to-Door identificou que cada diária economizada por giro rápido de leito gera um incremento médio de <strong>R$ 1.250,00 na Margem EBITDA</strong> por leito/mês, reduzindo em 28% o subsídio municipal necessário para cobrir o déficit da Tabela SUS (SIGTAP).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Giro Médio Leito</span>
              <span className="text-lg font-extrabold font-mono text-white">32.4 min</span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">Facilities QR Code</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">Margem EBITDA Média</span>
              <span className="text-lg font-extrabold font-mono text-emerald-300">34.8%</span>
              <span className="text-[10px] text-emerald-200 block mt-0.5">Convenios TUSS</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MAPA DE CENSO HOSPITALAR EM TEMPO REAL POR ALA (TASK 3.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0E5C4C]" />
              <span>Censo Hospitalar em Tempo Real por Ala</span>
            </h3>
            <p className="text-xs text-slate-500">
              Taxa de ocupação dinâmica alimentada continuamente pelo barramento n8n e pelo App Mobile PWA de Leitos.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> Ocupados ({totalOcupados})
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-amber-400" /> Higienização ({totalHigienizacao})
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-slate-300" /> Livres ({totalLivres})
            </span>
          </div>
        </div>

        {/* CARDS DAS ALAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALAS_MOCK.map((ala) => {
            const pct = ala.taxaOcupacaoPercentual;
            const progressColor = pct >= 85 ? 'bg-rose-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <div key={ala.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {ala.tipo}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {ala.leitosOcupados}/{ala.leitosTotais} Leitos
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{ala.nome}</h4>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                    <span>Taxa de Ocupação</span>
                    <strong className="font-mono text-slate-900 font-extrabold">{pct}%</strong>
                  </div>
                  {/* BARRA DE PROGRESSO */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className={`h-full ${progressColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" /> Limpeza: {ala.tempoMedioHigienizacaoMinutos}m
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Status OK
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: GIRO DE LEITOS & PERMANÊNCIA VS CUSTO ACUMULADO (TASK 3.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GIRO DE LEITOS E TEMPO MÉDIO DE PERMANÊNCIA (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Giro de Leitos & Tempo Médio de Permanência (LOS)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Relação entre o tempo que o paciente ocupa o leito e o acúmulo de custo assistencial.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { dia: 'Dia 01 (Entrada & Triagem)', custo: 'R$ 650,00', comp: 'Consultório + Exames Iniciais (LIMS SENAITE)', pctWidth: '25%' },
              { dia: 'Dia 02 (Procedimento Cirúrgico)', custo: 'R$ 4.230,00', comp: 'OPME Titânio + Honorário Médico + Centro Cirúrgico', pctWidth: '85%' },
              { dia: 'Dia 03 (UTI / Recuperação)', custo: 'R$ 1.870,00', comp: 'Medicamentos FEFO + Diária UTI + Facilities QR Code', pctWidth: '60%' },
              { dia: 'Dia 04 (Alta & Split)', custo: 'R$ 711,50', comp: 'Checkout + Faturamento Split Hyperswitch + NFS-e', pctWidth: '35%' },
            ].map((d, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <strong className="font-bold text-slate-900">{d.dia}</strong>
                  <span className="font-mono font-bold text-slate-900">{d.custo}</span>
                </div>
                <p className="text-[11px] text-slate-500">{d.comp}</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#0E5C4C] h-full" style={{ width: d.pctWidth }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MARGEM EBITDA E CONFRONTOS SIGTAP / TUSS / CMED (TASK 3.3) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Margem EBITDA por Procedimento & Clínica</span>
              </h3>
              <p className="text-xs text-slate-500">
                Comparativo direto entre o Custo Real Door-to-Door, Faturamento TUSS e Repasse SIGTAP.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {MARGENS_EBITDA_MOCK.map((m) => (
              <div key={m.codigo} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.nome}</h4>
                    <span className="text-[10px] text-slate-500 block">{m.clinicaParceira}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    m.statusEbitda === 'EXCELENTE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    m.statusEbitda === 'ESTAVEL' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {m.margemEbitdaPercentual}% EBITDA
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Custo Real:</span>
                    <strong className="font-mono text-slate-800">R$ {m.custoMedioReal.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">TUSS Previsto:</span>
                    <strong className="font-mono text-emerald-700">R$ {m.faturamentoMedioTuss.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Repasse SIGTAP:</span>
                    <strong className="font-mono text-slate-600">R$ {m.repasseMedioSigtap.toLocaleString('pt-BR')}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
