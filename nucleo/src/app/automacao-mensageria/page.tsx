'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HospitalNav } from '../components/HospitalNav';
import {
  Zap,
  ArrowLeft,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Send,
  Workflow,
  Server,
  Radio,
  CheckCheck
} from 'lucide-react';

interface WebhookEvent {
  id: string;
  topic: string;
  source: string;
  target: string;
  timestamp: string;
  status: 'Processado' | 'Em Fila DLQ' | 'Entregue';
  latencyMs: number;
  payloadPreview: string;
}

const mockWebhooks: WebhookEvent[] = [
  {
    id: 'EVT-8821',
    topic: 'paciente.prescricao_emitida',
    source: 'OpenEMR (Sala 204)',
    target: 'OpenBoxes (Estoque FEFO)',
    timestamp: 'Hoje às 11:42:05',
    status: 'Processado',
    latencyMs: 42,
    payloadPreview: '{"paciente_id": "P-101", "medicamento": "MED-AMX-500", "qtd": 1}',
  },
  {
    id: 'EVT-8822',
    topic: 'estoque.baixa_executada',
    source: 'OpenBoxes (Farmácia)',
    target: 'Core 360 (Door-to-Door)',
    timestamp: 'Hoje às 11:42:06',
    status: 'Processado',
    latencyMs: 38,
    payloadPreview: '{"lote": "LT-2026-09A", "custo_unitario": 18.50, "estacao": "Farmácia"}',
  },
  {
    id: 'EVT-8823',
    topic: 'paciente.solicitacao_exame',
    source: 'OpenEMR (Consultório)',
    target: 'SENAITE LIMS (Laboratório)',
    timestamp: 'Hoje às 10:15:30',
    status: 'Processado',
    latencyMs: 65,
    payloadPreview: '{"work_order": "WO-9912", "exames": ["Hemograma", "Troponina"]}',
  },
  {
    id: 'EVT-8824',
    topic: 'financeiro.split_liquidado',
    source: 'Hyperswitch (Rust)',
    target: 'HealVista (Contábil)',
    timestamp: 'Hoje às 09:30:12',
    status: 'Processado',
    latencyMs: 110,
    payloadPreview: '{"valor_total": 450.00, "split_medico": 382.50, "split_condominio": 67.50}',
  },
];

export default function AutomacaoMensageriaPage() {
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>(mockWebhooks);
  const [whatsappSent, setWhatsappSent] = useState<string | null>(null);

  const handleSimulateWhatsAppNotification = (tipo: string) => {
    setWhatsappSent(`Mensagem de ${tipo} disparada com sucesso via Poli (WhatsApp) com anti-ban ativo! Paciente notificado no celular.`);
    setTimeout(() => setWhatsappSent(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HospitalNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho da Tela com Assinatura da UX Master */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full w-fit mb-2 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Protótipo Oficial UX Master: Beatriz Brandão • Squad 7 (Camila Medeiros)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-500" />
              Central de Automação n8n &amp; Mensageria WhatsApp Poli
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Monitoramento em tempo real do barramento de eventos assíncronos, filas Dead Letter Queue (DLQ) e notificações humanizadas para o paciente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ingestao-modulos"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Hub 360
            </Link>
          </div>
        </div>

        {/* Feedback de Notificação */}
        {whatsappSent && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-sm font-medium animate-fadeIn">
            <CheckCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{whatsappSent}</span>
          </div>
        )}

        {/* Cards de Métricas do Barramento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status do Barramento</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">100% Online</div>
            <p className="text-xs text-slate-500 mt-1">n8n Cluster + Redis Fila Ativa</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Latência Média</span>
            <div className="text-2xl font-black text-slate-900 mt-2">48 ms</div>
            <p className="text-xs text-slate-500 mt-1">Tempo de resposta entre microsserviços</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Fila Dead Letter (DLQ)</span>
            <div className="text-2xl font-black text-slate-900 mt-2">0 Falhas</div>
            <p className="text-xs text-slate-500 mt-1">Nenhum evento perdido por oscilação</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Disparos WhatsApp Poli</span>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">1.420 msgs</div>
            <p className="text-xs text-slate-500 mt-1">Taxa de entrega: 99.4%</p>
          </div>
        </div>

        {/* Layout Dividido: Tabela de Webhooks e Simulador Poli WhatsApp */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tabela de Eventos n8n */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-amber-500" />
                  Tráfego de Webhooks em Tempo Real (n8n Event Bus)
                </h3>
                <p className="text-xs text-slate-500">Comunicação assíncrona entre OpenEMR, OpenBoxes, LIMS e Hyperswitch</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                HMAC-SHA256 Seguro
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tópico do Evento</th>
                    <th className="px-4 py-3">Origem &rarr; Destino</th>
                    <th className="px-4 py-3">Latência</th>
                    <th className="px-4 py-3">Payload</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {webhooks.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{evt.topic}</td>
                      <td className="px-4 py-3.5 text-slate-600">{evt.source} &rarr; {evt.target}</td>
                      <td className="px-4 py-3.5 text-emerald-600 font-bold">{evt.latencyMs}ms</td>
                      <td className="px-4 py-3.5 text-slate-500 truncate max-w-[180px]" title={evt.payloadPreview}>
                        {evt.payloadPreview}
                      </td>
                      <td className="px-4 py-3.5 text-right font-sans">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {evt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simulador de Mensagens do Robô Poli WhatsApp */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Simulador Poli WhatsApp
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  aiviq-zap-app
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900">Notificações ao Paciente</h3>
              <p className="text-xs text-slate-500 mb-6">
                Disparos automáticos acionados pelos webhooks do n8n sem intervenção humana.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-150 rounded-xl">
                  <div className="text-xs font-bold text-emerald-900 mb-1">1. Lembrete de Consulta (24h Antes)</div>
                  <p className="text-[11px] text-emerald-800 mb-3">
                    &quot;Olá, Severino! Sua consulta com Dr. Ricardo Mendes na Sala 204 está confirmada para amanhã às 10:30h.&quot;
                  </p>
                  <button
                    onClick={() => handleSimulateWhatsAppNotification('Lembrete de Consulta')}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simular Envio
                  </button>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-150 rounded-xl">
                  <div className="text-xs font-bold text-blue-900 mb-1">2. Chamada de Painel / Recepção</div>
                  <p className="text-[11px] text-blue-800 mb-3">
                    &quot;Severino, é a sua vez! Por favor, dirija-se ao Consultório 204 - 2º Andar.&quot;
                  </p>
                  <button
                    onClick={() => handleSimulateWhatsAppNotification('Chamada no Painel')}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simular Envio
                  </button>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-150 rounded-xl">
                  <div className="text-xs font-bold text-indigo-900 mb-1">3. Laudo de Exame LIMS Liberado</div>
                  <p className="text-[11px] text-indigo-800 mb-3">
                    &quot;Seu resultado de Hemograma já está pronto e assinado pelo laboratório. Clique para baixar o PDF.&quot;
                  </p>
                  <button
                    onClick={() => handleSimulateWhatsAppNotification('Entrega de Laudo')}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Simular Envio
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400">Proteção anti-ban com intervalo inteligente ativo</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
