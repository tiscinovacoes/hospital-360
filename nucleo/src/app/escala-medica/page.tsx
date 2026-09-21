'use client';

import React, { useState, useEffect } from 'react';
import { HospitalNav } from '../components/HospitalNav';
import {
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Fingerprint,
  QrCode,
  ArrowLeftRight,
  Zap,
  FileBadge,
  DollarSign,
  Download,
  Building,
  User,
  ExternalLink
} from 'lucide-react';

interface CertificadoItem {
  validade: string;
  dias_restantes: number;
  status: 'VALIDO' | 'ALERTA_VENCENDO' | 'EXPIRADO';
}

interface MedicoPlantonista {
  id: string;
  nome: string;
  crm: string;
  uf_crm: string;
  especialidade: string;
  situacao_cfm: string;
  certificados: {
    atls: CertificadoItem;
    acls: CertificadoItem;
    pals: CertificadoItem;
  };
  chave_pix: string;
  dados_bancarios: { banco: string; agencia: string; conta: string };
}

interface Plantao {
  id: string;
  setor: string;
  data_plantao: string;
  turno: string;
  medico_id: string;
  medico_nome: string;
  crm: string;
  valor_plantao: number;
  status: string;
  checkin?: {
    hora: string;
    latitude: number;
    longitude: number;
    distancia_metros: number;
    metodo: string;
    biometria_score_pct: number;
    valido: boolean;
  };
  antecipacao_solicitada?: {
    valor_bruto: number;
    taxa_desagio_pct: number;
    valor_liquido: number;
    chave_pix: string;
    status: string;
    comprovante_autenticacao: string;
    timestamp: string;
  };
}

export default function EscalaMedicaPage() {
  const [plantoes, setPlantoes] = useState<Plantao[]>([]);
  const [corpoClinico, setCorpoClinico] = useState<MedicoPlantonista[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modais de Ação
  const [plantaoAtivo, setPlantaoAtivo] = useState<Plantao | null>(null);
  const [modalAcao, setModalAcao] = useState<'CHECKIN' | 'TROCA' | 'ANTECIPAR_PIX' | 'COFRE_DOCS' | null>(null);
  const [substitutoId, setSubstitutoId] = useState<string>('');
  const [distanciaSimulada, setDistanciaSimulada] = useState<number>(25); // metros do hospital
  const [resultadoAcao, setResultadoAcao] = useState<any>(null);
  const [processando, setProcessando] = useState(false);

  const carregarEscala = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/escala-medica');
      const data = await res.json();
      if (data.success) {
        setPlantoes(data.plantoes);
        setCorpoClinico(data.corpo_clinico);
        setMetricas(data.metricas);
        if (data.corpo_clinico.length > 1) {
          setSubstitutoId(data.corpo_clinico[1].id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar escala médica:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEscala();
  }, []);

  // Executar Check-in por GPS / Biometria
  const handleCheckinGPS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantaoAtivo) return;

    try {
      setProcessando(true);
      setResultadoAcao(null);

      // Simula latitude dentro ou fora dos 100m conforme slider
      const latBase = -23.550520;
      const offsetLat = (distanciaSimulada / 111000);

      const res = await fetch('/api/escala-medica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'CHECKIN_PRESENCIAL',
          plantao_id: plantaoAtivo.id,
          latitude: latBase + offsetLat,
          longitude: -46.633308,
          metodo: 'GPS_BIOMETRIA_FACIAL'
        })
      });

      const data = await res.json();
      setResultadoAcao(data);
      if (data.success) {
        carregarEscala();
      }
    } catch (err: any) {
      setResultadoAcao({ success: false, error: err.message });
    } finally {
      setProcessando(false);
    }
  };

  // Executar Troca de Plantão
  const handleTrocaPlantao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantaoAtivo) return;

    try {
      setProcessando(true);
      setResultadoAcao(null);

      const res = await fetch('/api/escala-medica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'SOLICITAR_TROCA',
          plantao_id: plantaoAtivo.id,
          substituto_id: substitutoId,
          motivo_troca: 'Troca consensual de plantão validada com diretoria clínica'
        })
      });

      const data = await res.json();
      setResultadoAcao(data);
      if (data.success) {
        carregarEscala();
      }
    } catch (err: any) {
      setResultadoAcao({ success: false, error: err.message });
    } finally {
      setProcessando(false);
    }
  };

  // Antecipação PIX D+0
  const handleAnteciparPIX = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantaoAtivo) return;

    try {
      setProcessando(true);
      setResultadoAcao(null);

      const res = await fetch('/api/escala-medica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'ANTECIPAR_PAGAMENTO_PIX',
          plantao_id: plantaoAtivo.id
        })
      });

      const data = await res.json();
      setResultadoAcao(data);
      if (data.success) {
        carregarEscala();
      }
    } catch (err: any) {
      setResultadoAcao({ success: false, error: err.message });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <HospitalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-sm">
              <UserCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Escala Médica, Ponto GPS &amp; Antecipação Financeira
              </h1>
              <p className="text-sm text-slate-500">
                Ponto biométrico por geofencing (&lt;100m), guarda de documentações (CRM/ATLS/PALS), trocas e antecipação PIX D+0 com CNAB 240.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setModalAcao('COFRE_DOCS'); setResultadoAcao(null); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              <FileBadge className="w-4 h-4 text-indigo-600" />
              Cofre de Documentos Médicos (CFM)
            </button>
          </div>
        </div>

        {/* Métricas Executivas */}
        {metricas && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Plantoes Hoje</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {metricas.total_plantoes_hoje} Ativos
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">100% Cobertos (Sem Furos)</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Presença GPS / Geofence</span>
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {metricas.taxa_presenca_geofence_pct}%
              </p>
              <p className="text-xs text-slate-500 mt-1">Validado no Raio &lt; 100m</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Alertas de Certificados</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">
                {metricas.medicos_com_certificados_a_vencer_30d} Médicos
              </p>
              <p className="text-xs text-amber-600 font-semibold mt-1">Vencendo nos Próximos 30d</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Remuneração do Dia</span>
                <DollarSign className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-indigo-700 mt-2">
                R$ {metricas.valor_total_escala_dia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-1">Compatível com PIX e CNAB 240</p>
            </div>
          </div>
        )}

        {/* Tabela de Plantões da Escala */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Grade de Escala de Plantonistas (UTI, PS, Cirúrgico)
              </h2>
              <p className="text-xs text-slate-500">
                Ponto eletrônico validado por biometria e localização por satélite.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Setor &amp; Turno</th>
                  <th className="py-3 px-4">Médico Plantonista</th>
                  <th className="py-3 px-4">Status &amp; Ponto GPS</th>
                  <th className="py-3 px-4 text-right">Valor Plantão</th>
                  <th className="py-3 px-4 text-center">Ações Operacionais</th>
                  <th className="py-3 px-4 text-center">Financeiro (PIX D+0)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plantoes.map((p) => {
                  const checkinFeito = p.status === 'CHECKIN_REALIZADO' || p.status === 'CONCLUIDO';
                  const antecipado = p.antecipacao_solicitada?.status === 'PAGO_PIX_D0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{p.setor.replace('_', ' ')}</span>
                        <span className="text-xs text-slate-500">{p.turno.replace('_', ' ')} • {p.data_plantao}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{p.medico_nome}</span>
                        <span className="text-xs text-indigo-600 font-semibold">{p.crm}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {checkinFeito && p.checkin ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Presente ({p.checkin.hora})
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5">
                              GPS: {p.checkin.distancia_metros}m do Hospital • Bio {p.checkin.biometria_score_pct}%
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Aguardando Check-in
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        R$ {p.valor_plantao.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setPlantaoAtivo(p);
                              setModalAcao('CHECKIN');
                              setResultadoAcao(null);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            <Fingerprint className="w-3 h-3" />
                            <span>Bater Ponto</span>
                          </button>
                          <button
                            onClick={() => {
                              setPlantaoAtivo(p);
                              setModalAcao('TROCA');
                              setResultadoAcao(null);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-300"
                          >
                            <ArrowLeftRight className="w-3 h-3 text-indigo-600" />
                            <span>Trocar</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {antecipado ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                            PIX D+0 Pago (R$ {p.antecipacao_solicitada?.valor_liquido.toFixed(2)})
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setPlantaoAtivo(p);
                              setModalAcao('ANTECIPAR_PIX');
                              setResultadoAcao(null);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Antecipar PIX</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Check-in por GPS & Biometria Facial */}
        {plantaoAtivo && modalAcao === 'CHECKIN' && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base">Check-in Presencial Seguro</h3>
                </div>
                <button
                  onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCheckinGPS} className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Plantonista</span>
                  <p className="font-bold text-slate-900">{plantaoAtivo.medico_nome}</p>
                  <p className="text-xs text-slate-500">{plantaoAtivo.crm} • Setor: {plantaoAtivo.setor}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Simulação Geofencing GPS (Distância do Hospital)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={distanciaSimulada}
                      onChange={e => setDistanciaSimulada(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <span className="text-xs font-mono font-bold w-16 text-right">
                      {distanciaSimulada}m
                    </span>
                  </div>
                  <span className={`text-[11px] block mt-1 font-semibold ${distanciaSimulada <= 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {distanciaSimulada <= 100 ? '✅ Dentro do raio hospitalar (<100m)' : '❌ Fora do perímetro permitido (>100m)'}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Reconhecimento facial biométrico pronto: Score 99.4%</span>
                </div>

                {resultadoAcao && (
                  <div className={`p-3 rounded-xl text-xs font-semibold border ${resultadoAcao.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                    {resultadoAcao.success ? resultadoAcao.mensagem : resultadoAcao.error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                    className="px-4 py-2 text-xs font-bold text-slate-600"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    disabled={processando}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Fingerprint className="w-3.5 h-3.5" />
                    {processando ? 'Validando...' : 'Confirmar Presença'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Troca de Plantão Sem Furos */}
        {plantaoAtivo && modalAcao === 'TROCA' && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base">Solicitar Troca de Plantão</h3>
                </div>
                <button
                  onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleTrocaPlantao} className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Titular Ofertante</span>
                  <p className="font-bold text-slate-900">{plantaoAtivo.medico_nome}</p>
                  <p className="text-xs text-slate-500">{plantaoAtivo.crm} • Setor: {plantaoAtivo.setor}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Médico Substituto Homologado
                  </label>
                  <select
                    value={substitutoId}
                    onChange={e => setSubstitutoId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  >
                    {corpoClinico.filter(m => m.id !== plantaoAtivo.medico_id).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nome} ({m.crm} - {m.especialidade})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold">
                  🛡️ <strong>Regra de Ouro:</strong> A substituição é confirmada imediatamente após conferência automática do CRM e certificados de trauma (ATLS/ACLS) no CFM.
                </div>

                {resultadoAcao && (
                  <div className={`p-3 rounded-xl text-xs font-semibold border ${resultadoAcao.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                    {resultadoAcao.success ? resultadoAcao.mensagem : resultadoAcao.error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                    className="px-4 py-2 text-xs font-bold text-slate-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={processando}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    {processando ? 'Aprovando...' : 'Homologar Troca'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Antecipação PIX D+0 & Remessa CNAB 240 */}
        {plantaoAtivo && modalAcao === 'ANTECIPAR_PIX' && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base">Antecipação Instantânea PIX (D+0)</h3>
                </div>
                <button
                  onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAnteciparPIX} className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Resumo da Operação</span>
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span>Valor Bruto do Plantão:</span>
                    <strong className="text-slate-900">R$ {plantaoAtivo.valor_plantao.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs text-rose-600">
                    <span>Taxa de Deságio (3.5%):</span>
                    <strong>- R$ {(plantaoAtivo.valor_plantao * 0.035).toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 font-bold text-sm text-emerald-700">
                    <span>Líquido a Receber no PIX:</span>
                    <span>R$ {(plantaoAtivo.valor_plantao * 0.965).toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                  ⚡ O valor será transferido na hora para a chave PIX cadastrada do médico e registrado no Lote CNAB 240 para conciliação contábil com o hospital.
                </div>

                {resultadoAcao && (
                  <div className={`p-3 rounded-xl text-xs font-semibold border ${resultadoAcao.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                    {resultadoAcao.success ? resultadoAcao.mensagem : resultadoAcao.error}
                    {resultadoAcao.antecipacao?.cnab_registro_preview && (
                      <div className="mt-2 pt-2 border-t border-emerald-200 font-mono text-[9px] text-slate-600 break-all">
                        CNAB 240: {resultadoAcao.antecipacao.cnab_registro_preview}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => { setPlantaoAtivo(null); setModalAcao(null); }}
                    className="px-4 py-2 text-xs font-bold text-slate-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={processando}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {processando ? 'Transferindo...' : 'Transferir no PIX Agora'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Cofre de Documentos Médicos & Certificações */}
        {modalAcao === 'COFRE_DOCS' && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileBadge className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base">Cofre em Nuvem de Documentações &amp; Vencimentos (CFM)</h3>
                </div>
                <button
                  onClick={() => setModalAcao(null)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {corpoClinico.map((med) => (
                  <div key={med.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{med.nome}</h4>
                        <p className="text-xs text-indigo-600 font-semibold">{med.crm} • {med.especialidade}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        CFM: {med.situacao_cfm}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-xs">
                      <div className={`p-2 rounded-xl border ${med.certificados.atls.status === 'ALERTA_VENCENDO' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] font-bold block">ATLS (Trauma)</span>
                        <strong className="text-xs">{med.certificados.atls.validade}</strong>
                        <span className="text-[9px] block text-slate-500">{med.certificados.atls.dias_restantes}d restantes</span>
                      </div>

                      <div className={`p-2 rounded-xl border ${med.certificados.acls.status === 'ALERTA_VENCENDO' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] font-bold block">ACLS (Cardíaco)</span>
                        <strong className="text-xs">{med.certificados.acls.validade}</strong>
                        <span className="text-[9px] block text-slate-500">{med.certificados.acls.dias_restantes}d restantes</span>
                      </div>

                      <div className={`p-2 rounded-xl border ${med.certificados.pals.status === 'ALERTA_VENCENDO' ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] font-bold block">PALS (Pediátrico)</span>
                        <strong className="text-xs">{med.certificados.pals.validade}</strong>
                        <span className="text-[9px] block text-slate-500">{med.certificados.pals.dias_restantes}d restantes</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                      <span>Chave PIX: <strong className="text-slate-800">{med.chave_pix}</strong></span>
                      <span>Banco: {med.dados_bancarios.banco} • Ag: {med.dados_bancarios.agencia}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setModalAcao(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Fechar Cofre
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
