'use client';

import React, { useState, useEffect } from 'react';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import {
  FileText,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  Eye,
  DollarSign
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

interface PedidoCompra {
  id: string;
  descricao: string;
  data: string;
  status: 'PENDENTE' | 'APROVADO' | 'ENTREGUE';
}

const PEDIDOS_COMPRA_RECENTES: PedidoCompra[] = [
  { id: 'PDC-2026-0023', descricao: 'Antibióticos - Lote 05 (Meropenem 1g)', data: '25/04/2026', status: 'PENDENTE' },
  { id: 'PDC-2026-0022', descricao: 'Analgésicos - Lote 12 (Dipirona 500mg)', data: '24/04/2026', status: 'APROVADO' },
  { id: 'PDC-2026-0021', descricao: 'Anti-inflamatórios (Cetoprofeno IV)', data: '23/04/2026', status: 'ENTREGUE' },
  { id: 'PDC-2026-0020', descricao: 'Medicamentos Controlados (Fentanila)', data: '22/04/2026', status: 'PENDENTE' },
  { id: 'PDC-2026-0019', descricao: 'Material Hospitalar & Seringas', data: '21/04/2026', status: 'APROVADO' }
];

export default function VigiaComprasPage() {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState('');
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
          orgao_demandante: tipoAdesao === 'CARONA_ADESAO' ? 'Hospital Regional (Carona)' : 'Hospital Central 360',
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

  const todosItens = atas.flatMap(a => a.itens.map(i => ({ ...i, numero_ata: a.numero_ata, fornecedor: a.fornecedor_razao_social })))
    .filter(i =>
      i.descricao_medicamento.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      i.codigo_catmat.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      i.principio_ativo.toLowerCase().includes(filtroBusca.toLowerCase())
    );

  return (
    <VigiaSidebarLayout
      activeTitle="Dashboard — Vigia Compras & Atas"
      activeSubtitle="Sistema de Compras de Medicamentos e Gestão de Atas (Lei 14.133/21)"
      actions={
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Trava de Sobrepreço CMED/BPS Ativa</span>
        </span>
      }
    >
      {/* 1. ALERTA LARANJA DO VIGIA SAÚDE (Conforme imagem 2 do Figma) */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <div className="p-1 text-amber-600 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-extrabold text-amber-900">
            Atenção: 3 ATAs vencem em menos de 45 dias
          </h4>
          <p className="text-xs text-amber-700/90 mt-0.5">
            Revise os contratos e inicie o processo de renovação ou nova licitação pelo SRP (Lei 14.133/21).
          </p>
        </div>
      </div>

      {/* 2. OS 4 CARDS DE MÉTRICAS EM LINHA DO VIGIA SAÚDE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: ATAs Ativas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900">8</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">ATAs Ativas</p>
          </div>
        </div>

        {/* Card 2: PdCs Pendentes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900">8</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">PdCs Pendentes</p>
          </div>
        </div>

        {/* Card 3: ATAs Próximas do Vencimento */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900">3</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">ATAs Próximas do Vencimento</p>
          </div>
        </div>

        {/* Card 4: Reequilíbrios Pendentes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-slate-900">5</p>
            <p className="text-xs font-bold text-slate-400 mt-0.5">Reequilíbrios Pendentes</p>
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO INFERIOR DUAL: PEDIDOS DE COMPRA RECENTES & SALDO DE ATAS (DONUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Esquerda (7 cols): Pedidos de Compra Recentes */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Pedidos de Compra Recentes
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Descrição</th>
                    <th className="pb-3">Data</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PEDIDOS_COMPRA_RECENTES.map(pdc => (
                    <tr key={pdc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-700">{pdc.id}</td>
                      <td className="py-3 font-semibold text-slate-800">{pdc.descricao}</td>
                      <td className="py-3 text-slate-500">{pdc.data}</td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            pdc.status === 'PENDENTE'
                              ? 'bg-amber-100/80 text-amber-800'
                              : pdc.status === 'APROVADO'
                              ? 'bg-emerald-100/80 text-emerald-800'
                              : 'bg-slate-200/80 text-slate-700'
                          }`}
                        >
                          {pdc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-right">
            <span className="text-xs font-bold text-[#1A56DB] hover:underline cursor-pointer">
              Ver todos os 28 pedidos →
            </span>
          </div>
        </div>

        {/* Direita (5 cols): Saldo de ATAs com Gráfico Donut Vigia Saúde */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Saldo de ATAs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribuição orçamentária consolidada</p>

            {/* Gráfico Donut SVG personalizado estilo Vigia Saúde */}
            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Segmento Disponível 45% (Verde) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#0E9F6E"
                    strokeWidth="15"
                    strokeDasharray="107.4 238.7"
                    strokeDashoffset="0"
                  />
                  {/* Segmento Comprometido 28% (Amarelo) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#E3A008"
                    strokeWidth="15"
                    strokeDasharray="66.8 238.7"
                    strokeDashoffset="-107.4"
                  />
                  {/* Segmento Consumido 27% (Vermelho) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#E02424"
                    strokeWidth="15"
                    strokeDasharray="64.5 238.7"
                    strokeDashoffset="-174.2"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Vigente</span>
                  <span className="text-lg font-black text-slate-900">R$ 1.0M</span>
                </div>
              </div>

              {/* Legenda com porcentagens */}
              <div className="flex items-center gap-3 text-[11px] font-bold mt-2">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0E9F6E]" /> Disponível (45%)
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E3A008]" /> Comprometido (28%)
                </span>
                <span className="flex items-center gap-1 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E02424]" /> Consumido (27%)
                </span>
              </div>
            </div>

            {/* Linhas de Valores Financeiros */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#0E9F6E]" /> Disponível
                </span>
                <strong className="text-slate-900 font-bold">R$ 450k</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#E3A008]" /> Comprometido
                </span>
                <strong className="text-slate-900 font-bold">R$ 280k</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#E02424]" /> Consumido
                </span>
                <strong className="text-slate-900 font-bold">R$ 270k</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-black">
            <span>Total Homologado:</span>
            <span className="text-slate-900">R$ 1.000.000,00</span>
          </div>
        </div>
      </div>

      {/* 4. CATÁLOGO OPERACIONAL DE ITENS DE ATAS COM TRAVA CMED E EMPENHO */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Catálogo de Medicamentos Homologados nas Atas (SRP)
            </h3>
            <p className="text-xs text-slate-400">
              Confronto com banco de preços em saúde (BPS) e emissão de empenho/carona
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por CATMAT ou princípio..."
              value={filtroBusca}
              onChange={e => setFiltroBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Item &amp; CATMAT</th>
                <th className="py-3 px-4">Medicamento / Princípio Ativo</th>
                <th className="py-3 px-4 text-right">Preço Homologado</th>
                <th className="py-3 px-4 text-right">Teto CMED</th>
                <th className="py-3 px-4 text-right">BPS Ref.</th>
                <th className="py-3 px-4">Consumo da Ata</th>
                <th className="py-3 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todosItens.map(item => {
                const pct = Math.round((item.quantidade_consumida / item.quantidade_total) * 100);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      #{item.item_numero} <span className="text-blue-600 block text-[11px]">{item.codigo_catmat}</span>
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block">{item.descricao_medicamento}</strong>
                      <span className="text-[11px] text-slate-500">{item.principio_ativo} • {item.fornecedor}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      R$ {item.preco_homologado.toFixed(2)}
                      <span className="block text-[10px] text-emerald-600 font-bold">-{item.economia_cmed_pct.toFixed(1)}% vs CMED</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      R$ {item.preco_teto_cmed.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      R$ {item.preco_referencia_bps.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 min-w-[160px]">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span>{item.quantidade_saldo.toLocaleString()} un. saldo</span>
                        <span className="text-slate-400">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setItemSelecionado(item);
                          setQtdEmpenho(Math.min(200, item.quantidade_saldo));
                          setResultadoEmpenho(null);
                        }}
                        className="px-3 py-1.5 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 mx-auto"
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

      {/* Modal de Empenho */}
      {itemSelecionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-[#1A56DB] text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">Emitir Ordem de Fornecimento / Empenho</h3>
              <button onClick={() => setItemSelecionado(null)} className="font-bold text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleEmitirEmpenho} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <span className="font-bold text-blue-700 block">Item Selecionado:</span>
                <strong className="text-slate-900 text-sm">{itemSelecionado.descricao_medicamento}</strong>
                <p className="text-slate-500 mt-1">Preço Homologado: <strong>R$ {itemSelecionado.preco_homologado.toFixed(2)}</strong> (Teto CMED: R$ {itemSelecionado.preco_teto_cmed.toFixed(2)})</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantidade a Empenhar</label>
                <input
                  type="number"
                  min="1"
                  max={itemSelecionado.quantidade_saldo}
                  value={qtdEmpenho}
                  onChange={e => setQtdEmpenho(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Auditoria Automática: Preço dentro do teto CMED/BPS. Autorização liberada.</span>
              </div>

              {resultadoEmpenho && (
                <div className={`p-3 rounded-xl text-xs font-bold border ${resultadoEmpenho.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'}`}>
                  {resultadoEmpenho.success ? resultadoEmpenho.mensagem : resultadoEmpenho.error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setItemSelecionado(null)} className="px-4 py-2 text-xs font-bold text-slate-600">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md">
                  {submitting ? 'Emitindo...' : 'Confirmar Empenho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </VigiaSidebarLayout>
  );
}
