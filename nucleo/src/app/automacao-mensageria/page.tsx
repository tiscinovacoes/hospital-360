'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import { KpiCard } from '../../components/KpiCard';
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
    latencyMs: 51,
    payloadPreview: '{"exame": "Hemograma Completo", "loinc": "58410-2", "tubo": "EDTA"}',
  },
  {
    id: 'EVT-8824',
    topic: 'laboratorio.laudo_assinado',
    source: 'SENAITE LIMS (Bancada)',
    target: 'OpenEMR (PEP)',
    timestamp: 'Hoje às 08:44:12',
    status: 'Entregue',
    latencyMs: 44,
    payloadPreview: '{"status": "final", "loinc": "58410-2", "conclusao": "Normal"}',
  },
  {
    id: 'EVT-8825',
    topic: 'financeiro.split_liquidado',
    source: 'Hyperswitch (Rust Engine)',
    target: 'Contábil HealVista (NFS-e)',
    timestamp: 'Hoje às 08:15:00',
    status: 'Processado',
    latencyMs: 29,
    payloadPreview: '{"split_medico": 382.50, "split_condominio": 67.50, "nfse": "Emitida"}',
  },
];

export default function AutomacaoMensageriaPage() {
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>(mockWebhooks);
  const [whatsappSent, setWhatsappSent] = useState<string | null>(null);

  const handleSimulateWhatsAppNotification = (tipo: string) => {
    setWhatsappSent(`Disparo WhatsApp "${tipo}" enviado com sucesso via Evolution API! Status: Entregue e Lido com confirmação azul dupla.`);
    setTimeout(() => setWhatsappSent(null), 5000);
  };

  return (
    <VigiaSidebarLayout
      activeTitle="Central n8n & Mensageria WhatsApp Poli"
      activeSubtitle="Barramento de interoperabilidade, mensageria assíncrona e notificações ao paciente"
      actions={
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hub Central</span>
          </Link>
        </div>
      }
    >
      {/* Feedback de Notificação */}
      {whatsappSent && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-slate-800 text-sm font-medium animate-fadeIn">
          <CheckCheck className="w-5 h-5 text-[#1A56DB] flex-shrink-0" />
          <span>{whatsappSent}</span>
        </div>
      )}

      {/* Cards de Métricas do Barramento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Status do Barramento"
          value="100% Online"
          subtitle="n8n Cluster + Redis"
          icon={Radio}
          tooltipInfo="Disponibilidade contínua dos workers do motor de orquestração n8n e fila de mensageria Redis em alta resiliência."
          trend={{ text: "Fila Ativa e Saudável", isPositive: true }}
        />

        <KpiCard
          title="Latência Média"
          value="48 ms"
          subtitle="Entre Microsserviços"
          icon={Zap}
          tooltipInfo="Tempo médio de trânsito de payloads JSON entre os módulos de prontuário, estoque, LIMS e financeiro."
          trend={{ text: "Alta Performance", isPositive: true }}
        />

        <KpiCard
          title="Fila Dead Letter (DLQ)"
          value="0 Falhas"
          subtitle="Nenhum Evento Perdido"
          icon={Workflow}
          tooltipInfo="Contador de mensagens rejeitadas com retenção em Dead Letter Queue para reprocessamento garantido."
          trend={{ text: "Zero Perdas", isPositive: true }}
        />

        <KpiCard
          title="Disparos WhatsApp"
          value="1.420 msgs"
          subtitle="Taxa Entrega: 99.4%"
          icon={MessageSquare}
          tooltipInfo="Volume total de confirmações de consultas, chamadas de painel e laudos encaminhados pelo robô conversacional."
          trend={{ text: "99.4% Entregues", isPositive: true }}
        />
      </div>

      {/* Layout Dividido: Tabela de Webhooks e Simulador Poli WhatsApp */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Eventos n8n */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Workflow className="w-5 h-5 text-[#1A56DB]" />
                Tráfego de Webhooks em Tempo Real (n8n Event Bus)
              </h3>
              <p className="text-xs text-slate-400">Comunicação assíncrona entre OpenEMR, OpenBoxes, LIMS e Hyperswitch</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
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
                    <td className="px-4 py-3.5 font-bold text-slate-900 font-sans">{evt.topic}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-sans">{evt.source} &rarr; {evt.target}</td>
                    <td className="px-4 py-3.5 text-[#1A56DB] font-bold">{evt.latencyMs}ms</td>
                    <td className="px-4 py-3.5 text-slate-400 truncate max-w-[180px]" title={evt.payloadPreview}>
                      {evt.payloadPreview}
                    </td>
                    <td className="px-4 py-3.5 text-right font-sans">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Simulador Poli WhatsApp
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1A56DB] border border-blue-100">
                aiviq-zap-app
              </span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900">Notificações ao Paciente</h3>
            <p className="text-xs text-slate-500 mb-5">
              Disparos automáticos acionados pelos webhooks do n8n sem intervenção humana.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-slate-900 mb-1">1. Lembrete de Consulta (24h Antes)</div>
                <p className="text-[11px] text-slate-600 mb-3">
                  &quot;Olá, Severino! Sua consulta com Dr. Ricardo Mendes na Sala 204 está confirmada para amanhã às 10:30h.&quot;
                </p>
                <button
                  onClick={() => handleSimulateWhatsAppNotification('Lembrete de Consulta')}
                  className="w-full py-2 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Simular Envio
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-slate-900 mb-1">2. Chamada de Painel / Recepção</div>
                <p className="text-[11px] text-slate-600 mb-3">
                  &quot;Severino, é a sua vez! Por favor, dirija-se ao Consultório 204 - 2º Andar.&quot;
                </p>
                <button
                  onClick={() => handleSimulateWhatsAppNotification('Chamada no Painel')}
                  className="w-full py-2 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Simular Envio
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-slate-900 mb-1">3. Laudo de Exame LIMS Liberado</div>
                <p className="text-[11px] text-slate-600 mb-3">
                  &quot;Seu resultado de Hemograma já está pronto e assinado pelo laboratório. Clique para baixar o PDF.&quot;
                </p>
                <button
                  onClick={() => handleSimulateWhatsAppNotification('Entrega de Laudo')}
                  className="w-full py-2 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
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
    </VigiaSidebarLayout>
  );
}
