'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import { KpiCard } from '../../components/KpiCard';
import {
  Boxes,
  Package,
  DollarSign,
  TrendingUp,
  AlertOctagon,
  Clock,
  ArrowLeft,
  Plus,
  ExternalLink,
  Snowflake,
  ShieldAlert,
  Send,
  Lock,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface PedidoAprovacao {
  id: string;
  urgente: boolean;
  destino: string;
  itens_qtd: number;
  tempo_atraso: string;
  valor_total: number;
}

const PEDIDOS_PENDENTES: PedidoAprovacao[] = [
  { id: 'PED-001', urgente: true, destino: 'Farmácia Matriz - Centro', itens_qtd: 5, tempo_atraso: 'Há 2 horas', valor_total: 1250.80 },
  { id: 'PED-002', urgente: false, destino: 'Farmácia Filial 03 - Zona Sul', itens_qtd: 3, tempo_atraso: 'Há 4 horas', valor_total: 680.50 },
  { id: 'PED-003', urgente: true, destino: 'Farmácia Filial 01 - Zona Norte', itens_qtd: 8, tempo_atraso: 'Há 5 horas', valor_total: 2150.30 }
];

export default function VigiaEstoqueCDPage() {
  const [locais, setLocais] = useState<any[]>([]);
  const [lotes, setLotes] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pedidoRevisando, setPedidoRevisando] = useState<PedidoAprovacao | null>(null);
  const [aprovados, setAprovados] = useState<string[]>([]);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const res = await fetch('/api/estoque-central');
        const data = await res.json();
        if (data.success) {
          setLocais(data.locais);
          setLotes(data.lotes);
          setMetricas(data.metricas);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const handleAprovar = (id: string) => {
    setAprovados([...aprovados, id]);
    setPedidoRevisando(null);
  };

  return (
    <VigiaSidebarLayout
      moduloId="estoque-central"
      activeTitle="Dashboard — Visão Global CD"
      activeSubtitle="Monitoramento em tempo real do Centro de Distribuição e rede de farmácias"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 border border-[#E0E0E0] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Início</span>
          </Link>

          <button className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-[#D97706] hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nova Entrada / Importar NF</span>
          </button>
        </div>
      }
    >
      {/* 1. OS 4 CARDS DE MÉTRICAS MINIMALISTAS DO VIGIA ESTOQUE (Máximo 3 linhas + Tooltip) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Total Medicamentos"
          value="1.248"
          subtitle="Itens Cadastrados"
          icon={Package}
          tooltipInfo="Quantidade total de códigos farmacêuticos ativos no catálogo do Centro de Distribuição e rede de farmácias satélites com rastreabilidade por lote."
          trend={{ text: "+52 novos este mês", isPositive: true }}
        />

        <KpiCard
          title="Valor em Estoque"
          value="R$ 2.8M"
          subtitle="Custo Médio CD"
          icon={DollarSign}
          tooltipInfo="Avaliação patrimonial consolidada das posições de estoque calculada pelo custo médio ponderado de aquisição conforme normativas contábeis hospitalares."
          trend={{ text: "+12% vs mês anterior", isPositive: true }}
        />

        <KpiCard
          title="Entradas Hoje"
          value="12"
          subtitle="Remessas Recebidas"
          icon={TrendingUp}
          tooltipInfo="Notas Fiscais eletrônicas de distribuidores recepcionadas hoje no CD com conferência cega de lote, validade, integridade de lacre e temperatura."
          trend={{ text: "Conferência NF automatizada", isPositive: false }}
        />

        <KpiCard
          title="Taxa de Ruptura"
          value="2.3%"
          subtitle="Itens com Falta"
          icon={AlertOctagon}
          tooltipInfo="Percentual de itens da curva ABC com estoque inferior ao ponto de ressuprimento crítico nas farmácias satélites de UTI e Pronto-Socorro."
          trend={{ text: "-0.5% vs semana passada", isPositive: true }}
        />
      </div>

      {/* 2. SEÇÃO DUAL: ALERTAS CRÍTICOS & GRÁFICO FEFO DE VENCIMENTOS PRÓXIMOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Coluna Esquerda (6 cols): Alertas Críticos (Cards Vermelhos do Vigia Saúde) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 className="font-extrabold text-base text-slate-900 mb-4">Alertas Críticos</h3>

          <div className="space-y-3">
            {/* Alerta 1 */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">Farmácia Matriz - Centro</span>
                  <span className="bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    URGENTE
                  </span>
                </div>
                <strong className="text-xs text-rose-900 block mt-1">Amoxicilina 500mg</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">Estoque zerado há 2 dias • Alta demanda no pronto-atendimento</p>
              </div>
            </div>

            {/* Alerta 2 */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">Farmácia Filial 03 - Zona Sul</span>
                  <span className="bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    URGENTE
                  </span>
                </div>
                <strong className="text-xs text-rose-900 block mt-1">Paracetamol 500mg</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">Ruptura detectada • Pedido pendente há 6 horas</p>
              </div>
            </div>

            {/* Alerta 3 (Laranja/Atenção) */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">CD - Estoque Geral</span>
                  <span className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    ATENÇÃO
                  </span>
                </div>
                <strong className="text-xs text-amber-900 block mt-1">Ibuprofeno 600mg - Lote LOT20248456</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">Vence em 15 dias • 300 unidades em estoque no CD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita (6 cols): Histograma FEFO Vencimentos Próximos */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Vencimentos Próximos (FEFO)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Medicamentos que vencem nos próximos 6 meses</p>

            {/* Gráfico de Barras FEFO Estilizado */}
            <div className="mt-6 mb-2">
              <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-200 pb-2">
                {[
                  { mes: 'Mai/26', vencendo: 12, vencido: 2 },
                  { mes: 'Jun/26', vencendo: 18, vencido: 0 },
                  { mes: 'Jul/26', vencendo: 25, vencido: 0 },
                  { mes: 'Ago/26', vencendo: 15, vencido: 0 },
                  { mes: 'Set/26', vencendo: 30, vencido: 0 },
                  { mes: 'Out/26', vencendo: 22, vencido: 0 },
                ].map((col, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      {/* Barra Vencendo (Laranja) */}
                      <div
                        className="w-full max-w-[20px] bg-[#E3A008] rounded-t-md transition-all hover:opacity-80"
                        style={{ height: `${(col.vencendo / 32) * 100}%` }}
                        title={`${col.mes}: ${col.vencendo} lotes vencendo`}
                      />
                      {/* Barra Vencido (Vermelho) */}
                      {col.vencido > 0 && (
                        <div
                          className="w-full max-w-[8px] bg-[#E02424] rounded-t-sm"
                          style={{ height: `${(col.vencido / 32) * 100}%` }}
                          title={`${col.mes}: ${col.vencido} lotes vencidos`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{col.mes}</span>
                  </div>
                ))}
              </div>

              {/* Legenda do Histograma */}
              <div className="flex items-center justify-center gap-4 text-xs font-bold mt-3">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-3 h-3 rounded-sm bg-[#E3A008]" /> Vencendo
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-3 h-3 rounded-sm bg-[#E02424]" /> Vencidos
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rastreabilidade FEFO Automatizada</span>
            <span className="text-[#D97706] font-bold hover:underline cursor-pointer">Ver todos os lotes →</span>
          </div>
        </div>
      </div>

      {/* 3. PEDIDOS PENDENTES DE APROVAÇÃO (Conforme Imagem 5 do Vigia) */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm p-5 mb-8">
        <h3 className="font-extrabold text-base text-slate-900 mb-4">Pedidos Pendentes de Aprovação</h3>

        <div className="space-y-3">
          {PEDIDOS_PENDENTES.map(ped => {
            const isAprovado = aprovados.includes(ped.id);

            return (
              <div
                key={ped.id}
                className="p-4 rounded-2xl border border-[#E0E0E0] hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 font-mono">{ped.id}</span>
                    {ped.urgente && (
                      <span className="bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        URGENTE
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-700 mt-1">
                    {ped.destino} • <span className="font-normal text-slate-500">{ped.itens_qtd} medicamentos</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{ped.tempo_atraso}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Total</span>
                    <strong className="text-sm font-black text-slate-900">
                      R$ {ped.valor_total.toFixed(2)}
                    </strong>
                  </div>

                  {isAprovado ? (
                    <span className="inline-flex items-center gap-1 px-4 py-2 min-h-[44px] rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Aprovado
                    </span>
                  ) : (
                    <button
                      onClick={() => setPedidoRevisando(ped)}
                      className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#D97706] hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Revisar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Revisão e Despacho */}
      {pedidoRevisando && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-[#E0E0E0] overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 bg-[#D97706] text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">Revisar e Autorizar Reposição</h3>
              <button onClick={() => setPedidoRevisando(null)} className="min-w-[44px] min-h-[44px] flex items-center justify-center font-bold text-white/80 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Destino Solicitado</span>
                <strong className="text-slate-900 text-sm block mt-0.5">{pedidoRevisando.destino}</strong>
                <p className="text-slate-600 mt-1">Pedido: <strong>{pedidoRevisando.id}</strong> • Itens: {pedidoRevisando.itens_qtd}</p>
                <p className="text-slate-900 font-bold mt-1 text-sm">Valor: R$ {pedidoRevisando.valor_total.toFixed(2)}</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Cadeia de custódia térmica RDC 430/2020 validada no CD Central.</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E0E0E0]">
                <button type="button" onClick={() => setPedidoRevisando(null)} className="px-4 py-2.5 min-h-[44px] text-xs font-bold text-slate-600 hover:text-slate-900">Voltar</button>
                <button
                  type="button"
                  onClick={() => handleAprovar(pedidoRevisando.id)}
                  className="px-5 py-2.5 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Aprovar e Despachar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </VigiaSidebarLayout>
  );
}
