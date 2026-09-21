'use client';

import React, { useState, useEffect } from 'react';
import { HospitalNav } from '../components/HospitalNav';
import {
  Boxes,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  ShieldAlert,
  Calendar,
  Building2,
  DollarSign,
  Droplet,
  Snowflake,
  Send,
  Lock
} from 'lucide-react';

interface LocalEstoque {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  temperatura_atual: number;
  temperatura_min: number;
  temperatura_max: number;
  umidade_atual_pct: number;
  status_climatizacao: string;
  responsavel_crf: string;
}

interface LoteCD {
  id: string;
  lote: string;
  codigo_medicamento: string;
  nome_medicamento: string;
  principio_ativo: string;
  local_atual_id: string;
  local_atual_nome: string;
  data_validade: string;
  quantidade: number;
  ponto_ressuprimento_minimo: number;
  custo_medio_unitario: number;
  status: string;
  termo_sensivel: boolean;
}

export default function EstoqueCentralPage() {
  const [locais, setLocais] = useState<LocalEstoque[]>([]);
  const [lotes, setLotes] = useState<LoteCD[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loteSelecionado, setLoteSelecionado] = useState<LoteCD | null>(null);
  const [modalTipo, setModalTipo] = useState<'TRANSFERIR' | 'QUARENTENA' | null>(null);
  const [destinoId, setDestinoId] = useState<string>('');
  const [qtdAcao, setQtdAcao] = useState<number>(100);
  const [motivoQuarentena, setMotivoQuarentena] = useState<string>('DESVIO_TEMPERATURA');
  const [feedbackAcao, setFeedbackAcao] = useState<any>(null);
  const [executando, setExecutando] = useState(false);

  const carregarEstoque = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/estoque-central');
      const data = await res.json();
      if (data.success) {
        setLocais(data.locais);
        setLotes(data.lotes);
        setMetricas(data.metricas);
        if (data.locais.length > 1) {
          setDestinoId(data.locais[2].id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar estoque:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEstoque();
  }, []);

  const handleTransferir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loteSelecionado) return;

    try {
      setExecutando(true);
      setFeedbackAcao(null);
      const res = await fetch('/api/estoque-central', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'TRANSFERIR_SATELITE',
          lote_id: loteSelecionado.id,
          local_destino_id: destinoId,
          quantidade: Number(qtdAcao)
        })
      });

      const data = await res.json();
      setFeedbackAcao(data);
      if (data.success) {
        carregarEstoque();
      }
    } catch (err: any) {
      setFeedbackAcao({ success: false, error: err.message });
    } finally {
      setExecutando(false);
    }
  };

  const handleQuarentena = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loteSelecionado) return;

    try {
      setExecutando(true);
      setFeedbackAcao(null);
      const res = await fetch('/api/estoque-central', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao: 'ISOLAR_QUARENTENA',
          lote_id: loteSelecionado.id,
          motivo_quarentena: motivoQuarentena,
          laudo_tecnico: 'Bloqueio preventivo solicitado pelo Farmacêutico Auditor de Plantão conforme RDC 430/2020.'
        })
      });

      const data = await res.json();
      setFeedbackAcao(data);
      if (data.success) {
        carregarEstoque();
      }
    } catch (err: any) {
      setFeedbackAcao({ success: false, error: err.message });
    } finally {
      setExecutando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <HospitalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm">
              <Boxes className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Gestão Central de Estoque &amp; Centro de Distribuição (Vigia Saúde)
              </h1>
              <p className="text-sm text-slate-500">
                Cadeia de custódia RDC 430/2020, Rastreabilidade FEFO, Farmácias Satélites e Quarentena Sanitária.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              <Snowflake className="w-4 h-4 text-blue-600" />
              Cadeia de Frio Monitorada em Tempo Real
            </span>
          </div>
        </div>

        {/* Métricas Executivas */}
        {metricas && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Valor Consolidado CD</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                R$ {metricas.valor_total_estoque_consolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-1">Custo Médio Ponderado</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Locais Ativos</span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {metricas.total_locais_ativos} Unidades
              </p>
              <p className="text-xs text-blue-600 font-semibold mt-1">CD Central + 3 Satélites</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Quarentena Ativa</span>
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">
                {metricas.lotes_em_quarentena} Lote(s)
              </p>
              <p className="text-xs text-amber-600 font-semibold mt-1">Bloqueados para Análise</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Ponto de Ressuprimento</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-rose-600 mt-2">
                {metricas.alertas_ponto_ressuprimento} Item Crítico
              </p>
              <p className="text-xs text-rose-600 font-semibold mt-1">Abaixo do Estoque Mínimo</p>
            </div>
          </div>
        )}

        {/* Card de Locais e Sensores Térmicos */}
        <div className="mt-8">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-blue-600" />
            Status das Instalações &amp; Cadeia Térmica (RDC 430/2020)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {locais.map((loc) => (
              <div key={loc.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {loc.codigo}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {loc.status_climatizacao}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-2">{loc.nome}</h3>
                <p className="text-[11px] text-slate-500">{loc.responsavel_crf}</p>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Temperatura</span>
                    <strong className="text-blue-700 font-mono text-sm">{loc.temperatura_atual} ºC</strong>
                    <span className="text-[9px] text-slate-400 block">({loc.temperatura_min}ºC a {loc.temperatura_max}ºC)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Umidade Rel.</span>
                    <strong className="text-slate-800 font-mono text-sm">{loc.umidade_atual_pct} %</strong>
                    <span className="text-[9px] text-slate-400 block">(Máx: 60%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela de Lotes com FEFO */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Lotes no Centro de Distribuição &amp; Satélites (Ordenação FEFO)
              </h2>
              <p className="text-xs text-slate-500">
                Medicamentos organizados pela data de expiração mais próxima para consumo prioritário.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Lote &amp; Status</th>
                  <th className="py-3 px-4">Medicamento / Princípio Ativo</th>
                  <th className="py-3 px-4">Localização Atual</th>
                  <th className="py-3 px-4">Validade (FEFO)</th>
                  <th className="py-3 px-4 text-right">Saldo Físico</th>
                  <th className="py-3 px-4 text-right">Custo Médio</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lotes.map((lote) => {
                  const dataExp = new Date(lote.data_validade);
                  const diasRestantes = Math.ceil((dataExp.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isQuarentena = lote.status === 'QUARENTENA';

                  return (
                    <tr key={lote.id} className={`hover:bg-slate-50/80 transition-colors ${isQuarentena ? 'bg-amber-50/40' : ''}`}>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900 block">{lote.lote}</span>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                          isQuarentena
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {lote.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{lote.nome_medicamento}</span>
                          {lote.termo_sensivel && (
                            <span title="Medicamento Termolábil (2ºC a 8ºC)">
                              <Snowflake className="w-3.5 h-3.5 text-blue-500" />
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{lote.principio_ativo}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold text-slate-700 block">{lote.local_atual_nome}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lote.data_validade}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${diasRestantes < 60 ? 'text-rose-600' : 'text-slate-500'}`}>
                          {diasRestantes} dias restantes
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-slate-900 font-mono">
                          {lote.quantidade.toLocaleString()} un.
                        </span>
                        {lote.quantidade <= lote.ponto_ressuprimento_minimo && (
                          <span className="block text-[10px] text-rose-600 font-bold">
                            ⚠️ Ponto Mín: {lote.ponto_ressuprimento_minimo}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        R$ {lote.custo_medio_unitario.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => {
                              setLoteSelecionado(lote);
                              setModalTipo('TRANSFERIR');
                              setQtdAcao(Math.min(200, lote.quantidade));
                              setFeedbackAcao(null);
                            }}
                            disabled={isQuarentena}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            title="Despachar para Farmácia Satélite"
                          >
                            <Send className="w-3 h-3" />
                            <span>Transferir</span>
                          </button>
                          <button
                            onClick={() => {
                              setLoteSelecionado(lote);
                              setModalTipo('QUARENTENA');
                              setFeedbackAcao(null);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            title="Bloquear e Isolar em Quarentena"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Quarentena</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Ação (Transferência ou Quarentena) */}
        {loteSelecionado && modalTipo && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {modalTipo === 'TRANSFERIR' ? (
                    <>
                      <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                      <h3 className="font-bold text-base">Despachar Transferência para Satélite</h3>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      <h3 className="font-bold text-base">Bloqueio Preventivo em Quarentena</h3>
                    </>
                  )}
                </div>
                <button
                  onClick={() => { setLoteSelecionado(null); setModalTipo(null); }}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Lote em Operação</span>
                  <p className="font-bold text-slate-900">{loteSelecionado.nome_medicamento}</p>
                  <p className="text-xs text-slate-500 font-mono">Lote: {loteSelecionado.lote} • Saldo: {loteSelecionado.quantidade} un.</p>
                </div>

                {modalTipo === 'TRANSFERIR' ? (
                  <form onSubmit={handleTransferir} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Local de Destino (Farmácia Satélite)
                      </label>
                      <select
                        value={destinoId}
                        onChange={e => setDestinoId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      >
                        {locais.filter(l => l.id !== loteSelecionado.local_atual_id).map(l => (
                          <option key={l.id} value={l.id}>
                            {l.nome} ({l.temperatura_atual}ºC)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Quantidade a Transferir
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={loteSelecionado.quantidade}
                        value={qtdAcao}
                        onChange={e => setQtdAcao(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {feedbackAcao && (
                      <div className={`p-3 rounded-xl text-xs font-semibold border ${feedbackAcao.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                        {feedbackAcao.success ? feedbackAcao.mensagem : feedbackAcao.error}
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => { setLoteSelecionado(null); setModalTipo(null); }}
                        className="px-4 py-2 text-xs font-bold text-slate-600"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={executando}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
                      >
                        {executando ? 'Despachando...' : 'Confirmar Envio'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleQuarentena} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Motivo da Notificação Sanitária
                      </label>
                      <select
                        value={motivoQuarentena}
                        onChange={e => setMotivoQuarentena(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="DESVIO_TEMPERATURA">Desvio Térmico no Transporte / Termolábil</option>
                        <option value="RECOLHIMENTO_ANVISA">Alerta Sanitário / Recolhimento ANVISA</option>
                        <option value="AVARIA_EMBALAGEM">Avaria na Embalagem Primária / Lacre</option>
                        <option value="DIVERGENCIA_NF">Divergência de Fabricante ou NF de Entrada</option>
                      </select>
                    </div>

                    {feedbackAcao && (
                      <div className={`p-3 rounded-xl text-xs font-semibold border ${feedbackAcao.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                        {feedbackAcao.success ? feedbackAcao.mensagem : feedbackAcao.error}
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => { setLoteSelecionado(null); setModalTipo(null); }}
                        className="px-4 py-2 text-xs font-bold text-slate-600"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={executando}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md"
                      >
                        {executando ? 'Bloqueando...' : 'Confirmar Bloqueio'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
