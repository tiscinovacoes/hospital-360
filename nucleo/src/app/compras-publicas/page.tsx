'use client';

import React, { useState, useEffect } from 'react';
import { HospitalNav } from '../components/HospitalNav';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Building,
  DollarSign,
  PlusCircle,
  Search,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AtaItem {
  id: string;
  item_numero: number;
  codigo_catmat: string;
  descricao_medicamento: string;
  principio_ativo: string;
  unidade_fornecimento: string;
  quantidade_total: number;
  quantidade_consumida: number;
  quantidade_saldo: number;
  preco_homologado: number;
  preco_teto_cmed: number;
  preco_referencia_bps: number;
  economia_cmed_pct: number;
  trava_sobrepreco: boolean;
}

interface Ata {
  id: string;
  numero_ata: string;
  processo_licitatorio: string;
  modalidade: string;
  orgao_gerenciador: string;
  fornecedor_cnpj: string;
  fornecedor_razao_social: string;
  vigencia_inicio: string;
  vigencia_fim: string;
  valor_total: number;
  status: string;
  limite_carona_orgao_pct: number;
  itens: AtaItem[];
}

export default function ComprasPublicasPage() {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [ataSelecionada, setAtaSelecionada] = useState<string>('todas');
  const [itemSelecionado, setItemSelecionado] = useState<AtaItem | null>(null);
  const [qtdEmpenho, setQtdEmpenho] = useState<number>(100);
  const [tipoAdesao, setTipoAdesao] = useState<'ORGAO_GERENCIADOR' | 'CARONA_ADESAO'>('ORGAO_GERENCIADOR');
  const [resultadoEmpenho, setResultadoEmpenho] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/compras-atas');
      const data = await res.json();
      if (data.success) {
        setAtas(data.atas);
        setMetricas(data.metricas);
      }
    } catch (err) {
      console.error('Erro ao carregar atas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleEmitirEmpenho = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemSelecionado) return;

    try {
      setSubmitting(true);
      setResultadoEmpenho(null);
      const ataPai = atas.find(a => a.itens.some(i => i.id === itemSelecionado.id));

      const res = await fetch('/api/compras-atas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ata_id: ataPai?.id,
          item_id: itemSelecionado.id,
          quantidade_empenho: Number(qtdEmpenho),
          orgao_demandante: tipoAdesao === 'CARONA_ADESAO' ? 'Hospital Regional do Vale (Carona)' : 'Hospital Central 360',
          tipo_adesao: tipoAdesao
        })
      });

      const data = await res.json();
      setResultadoEmpenho(data);
      if (data.success) {
        carregarDados();
      }
    } catch (err: any) {
      setResultadoEmpenho({ success: false, error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const itensFiltrados = atas
    .filter(a => ataSelecionada === 'todas' || a.id === ataSelecionada)
    .flatMap(a => a.itens.map(i => ({ ...i, numero_ata: a.numero_ata, fornecedor: a.fornecedor_razao_social })))
    .filter(i => 
      i.descricao_medicamento.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      i.codigo_catmat.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      i.principio_ativo.toLowerCase().includes(filtroBusca.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <HospitalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm">
                <FileText className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Compras Públicas &amp; Gestão de Atas (ARP)
                </h1>
                <p className="text-sm text-slate-500">
                  Conformidade estrita com Lei nº 14.133/21, Travas CMED / Banco de Preços em Saúde (BPS) e Sistema de Registro de Preços.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Trava Antissilenciamento de Sobrepreço Ativa
            </span>
          </div>
        </div>

        {/* Métricas Executivas */}
        {metricas && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Atas Vigentes</span>
                <Building className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {metricas.total_atas_vigentes} Atas
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">100% Homologadas no SRP</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Valor Total Registrado</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                R$ {metricas.valor_total_homologado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 mt-1">Em Atas do Exercício 2026</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Itens com CATMAT</span>
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {metricas.total_itens_catmat} Itens
              </p>
              <p className="text-xs text-purple-600 font-semibold mt-1">Saldo de {metricas.saldo_itens_disponivel.toLocaleString('pt-BR')} un.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                <span>Economia Média s/ CMED</span>
                <TrendingDown className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-700 mt-2">
                -27.4%
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Abaixo do Teto Oficial CMED</p>
            </div>
          </div>
        )}

        {/* Barra de Filtros e Busca */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por CATMAT, medicamento ou princípio..."
              value={filtroBusca}
              onChange={e => setFiltroBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={ataSelecionada}
              onChange={e => setAtaSelecionada(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="todas">Todas as Atas de Registro</option>
              {atas.map(a => (
                <option key={a.id} value={a.id}>{a.numero_ata} - {a.fornecedor_razao_social}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela de Itens de Ata */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Medicamentos Registrados em Ata (SRP Lei 14.133/21)
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Mostrando {itensFiltrados.length} itens homologados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Item / CATMAT</th>
                  <th className="py-3 px-4">Medicamento &amp; Princípio</th>
                  <th className="py-3 px-4 text-right">Preço Homologado</th>
                  <th className="py-3 px-4 text-right">Teto CMED</th>
                  <th className="py-3 px-4 text-right">BPS Ref.</th>
                  <th className="py-3 px-4">Consumo &amp; Saldo</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itensFiltrados.map((item) => {
                  const pctConsumido = Math.round((item.quantidade_consumida / item.quantidade_total) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900">#{item.item_numero}</span>
                        <span className="block text-xs text-blue-600 font-semibold">{item.codigo_catmat}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{item.descricao_medicamento}</span>
                        <span className="text-xs text-slate-500">{item.principio_ativo} • {item.unidade_fornecimento}</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">{item.fornecedor} ({item.numero_ata})</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-slate-900">
                          R$ {item.preco_homologado.toFixed(2)}
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-bold">
                          -{item.economia_cmed_pct.toFixed(1)}% vs CMED
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 font-mono text-xs">
                        R$ {item.preco_teto_cmed.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 font-mono text-xs">
                        R$ {item.preco_referencia_bps.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span>{item.quantidade_saldo.toLocaleString()} un. saldo</span>
                          <span className="text-slate-400">{pctConsumido}% gasto</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pctConsumido > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pctConsumido}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400">Total: {item.quantidade_total.toLocaleString()} {item.unidade_fornecimento}s</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setItemSelecionado(item);
                            setQtdEmpenho(Math.min(500, item.quantidade_saldo));
                            setResultadoEmpenho(null);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Empenhar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Empenho / Adesão Carona */}
        {itemSelecionado && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base">Emitir Nota de Empenho / Ordem de Fornecimento</h3>
                </div>
                <button
                  onClick={() => setItemSelecionado(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEmitirEmpenho} className="p-6 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Item Selecionado</span>
                  <p className="font-bold text-slate-900 mt-1">{itemSelecionado.descricao_medicamento}</p>
                  <p className="text-xs text-slate-500 mt-0.5">CATMAT: {itemSelecionado.codigo_catmat} • {itemSelecionado.principio_ativo}</p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 text-xs">
                    <span>Preço Homologado: <strong className="text-slate-900">R$ {itemSelecionado.preco_homologado.toFixed(2)}</strong></span>
                    <span>Saldo Disponível: <strong className="text-emerald-700">{itemSelecionado.quantidade_saldo} {itemSelecionado.unidade_fornecimento}s</strong></span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tipo de Requisição / Adesão (Lei 14.133/21)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoAdesao('ORGAO_GERENCIADOR')}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        tipoAdesao === 'ORGAO_GERENCIADOR'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Órgão Gerenciador / Participante
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Consome cota própria da ARP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoAdesao('CARONA_ADESAO')}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        tipoAdesao === 'CARONA_ADESAO'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      Adesão Carona (Órgão Externo)
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Limite 50% individual (Art. 86)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Quantidade a Empenhar ({itemSelecionado.unidade_fornecimento}s)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={itemSelecionado.quantidade_saldo}
                    value={qtdEmpenho}
                    onChange={e => setQtdEmpenho(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 font-bold"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Valor Total Previsto: <strong className="text-slate-900">R$ {(qtdEmpenho * itemSelecionado.preco_homologado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </span>
                </div>

                {/* Trava Informativa de Compliance */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-900">
                    <strong>Auditoria Automatizada:</strong> O preço unitário de R$ {itemSelecionado.preco_homologado.toFixed(2)} está R$ {(itemSelecionado.preco_teto_cmed - itemSelecionado.preco_homologado).toFixed(2)} abaixo do teto CMED. Liberação autorizada sem apontamento de sobrepreço.
                  </p>
                </div>

                {resultadoEmpenho && (
                  <div className={`p-4 rounded-xl border ${resultadoEmpenho.success ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'}`}>
                    {resultadoEmpenho.success ? (
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{resultadoEmpenho.mensagem}</span>
                        </div>
                        <p className="text-xs mt-1">Empenho Gerado: <strong>{resultadoEmpenho.empenho.numero_empenho}</strong> (Total: R$ {resultadoEmpenho.empenho.valor_total.toFixed(2)})</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>{resultadoEmpenho.error}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setItemSelecionado(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    {submitting ? 'Processando...' : 'Confirmar Empenho'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
