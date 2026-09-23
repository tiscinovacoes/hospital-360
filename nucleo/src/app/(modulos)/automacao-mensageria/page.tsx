'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { ModuloMenuLateral, MenuLateralItem } from '@/components/ModuloMenuLateral';
import { KpiCard } from '@/components/KpiCard';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
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
  CheckCheck,
  QrCode,
  Smartphone,
  Check,
  X,
  Info,
  Lock,
  Layers,
  ShieldCheck,
  Menu
} from 'lucide-react';

type AbaMensageria =
  | 'disparos'
  | 'confirmacao'
  | 'webhooks'
  | 'instancias'
  | 'perfis';

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

interface DisparoPaciente {
  id: string;
  paciente: string;
  telefone: string;
  tipoMensagem: 'Boletim Médico UTI' | 'Aviso de Alta' | 'Preparo de Exame' | 'Alerta Plantão';
  status: 'Entregue e Lido' | 'Enviado' | 'Falha';
  horario: string;
}

const DISPAROS_MOCK: DisparoPaciente[] = [
  {
    id: 'DISP-901',
    paciente: 'Severino Silva Cavalcanti (Familiar: Carlos)',
    telefone: '(11) 98821-4401',
    tipoMensagem: 'Boletim Médico UTI',
    status: 'Entregue e Lido',
    horario: '11:45'
  },
  {
    id: 'DISP-902',
    paciente: 'Maria Eduarda Peixoto',
    telefone: '(11) 97412-3390',
    tipoMensagem: 'Aviso de Alta',
    status: 'Entregue e Lido',
    horario: '10:30'
  },
  {
    id: 'DISP-903',
    paciente: 'Paulo Henrique Rossi',
    telefone: '(11) 99182-0044',
    tipoMensagem: 'Preparo de Exame',
    status: 'Enviado',
    horario: '09:15'
  }
];

export default function AutomacaoMensageriaPage() {
  const roles = MODULO_ROLES_CATALOG['automacao-mensageria'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [abaAtiva, setAbaAtiva] = useState<AbaMensageria>('disparos');
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const menuItens: MenuLateralItem[] = [
    { id: 'disparos', label: 'Disparos ao Paciente (WhatsApp)', icon: MessageSquare },
    { id: 'confirmacao', label: 'Confirmação & Anti-NoShow', icon: CheckCircle2 },
    { id: 'webhooks', label: 'Barramento n8n & Webhooks', icon: Workflow },
    { id: 'instancias', label: 'Conexões QR Code (Evolution)', icon: Smartphone },
    { id: 'perfis', label: 'Perfis & Matriz RBAC', icon: Lock },
  ];
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>(mockWebhooks);
  const [whatsappSent, setWhatsappSent] = useState<string | null>(null);

  const triggerSent = (msg: string) => {
    setWhatsappSent(msg);
    setTimeout(() => setWhatsappSent(null), 5000);
  };

  const handleSimulateWhatsAppNotification = (tipo: string) => {
    if (!hasPermission(activeRole, 'CREATE')) {
      triggerSent('Atenção: Seu perfil não possui permissão para disparar mensagens ativas.');
      return;
    }
    triggerSent(`Disparo WhatsApp "${tipo}" enviado com sucesso via Evolution API! Status: Entregue e Lido com dupla checagem azul.`);
  };

  return (
    <>
      <PageHeader
        activeTitle="Automação, Mensageria & Notificações"
        activeSubtitle="Disparos humanizados via WhatsApp / SMS, barramento n8n e comunicação com paciente"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className="lg:hidden p-2 min-h-[44px] min-w-[44px] rounded-xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
              title={sidebarAberta ? 'Recolher menu' : 'Expandir menu'}
            >
              {sidebarAberta ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-bold text-slate-700 bg-white border border-[#E0E0E0] rounded-xl hover:bg-slate-50 transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Hub Central</span>
            </Link>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden relative">
        <ModuloMenuLateral
          titulo="Automação & Mensageria"
          categoria="OPERACAO"
          itens={menuItens}
          ativoId={abaAtiva}
          onSelect={(id) => setAbaAtiva(id as AbaMensageria)}
          aberto={sidebarAberta}
          onFechar={() => setSidebarAberta(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
      {/* Feedback de Notificação */}
      {whatsappSent && (
        <div className="mb-4 p-3.5 bg-[#8A6A16]/[0.08] border border-[#8A6A16]/20 rounded-2xl flex items-center justify-between text-xs text-[#6E5511] shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-[#8A6A16] flex-shrink-0" />
            <span className="font-bold">{whatsappSent}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setWhatsappSent(null)}
            className="text-[#8A6A16] hover:text-[#8A6A16] p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PERFIS & MATRIZ RBAC — só aparece na seção "Perfis" do menu lateral, não em todas as telas */}
      {abaAtiva === 'perfis' && (
        <ModuloRbacBar
          moduloId="automacao-mensageria"
          activeRole={activeRole}
          onRoleChange={setActiveRole}
          accentColor="#8A6A16"
          lightBg="bg-[#8A6A16]/[0.08]"
          lightBorder="border-[#8A6A16]/20"
        />
      )}

      {/* Cards de Métricas do Barramento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Status do Barramento"
          value="100% Online"
          subtitle="n8n Cluster + Redis"
          icon={<Radio className="w-5 h-5 text-[#8A6A16]" />}
          trend={{ text: "Fila Ativa e Saudável", isPositive: true }}
        />

        <KpiCard
          title="Latência Média"
          value="48 ms"
          subtitle="Entre Microsserviços"
          icon={<Zap className="w-5 h-5 text-[#8A6A16]" />}
          trend={{ text: "Alta Performance", isPositive: true }}
        />

        <KpiCard
          title="Fila Dead Letter (DLQ)"
          value="0 Falhas"
          subtitle="Nenhum Evento Perdido"
          icon={<Workflow className="w-5 h-5 text-[#8A6A16]" />}
          trend={{ text: "Zero Perdas", isPositive: true }}
        />

        <KpiCard
          title="Disparos WhatsApp"
          value="1.420 msgs"
          subtitle="Taxa Entrega: 99.4%"
          icon={<MessageSquare className="w-5 h-5 text-[#8A6A16]" />}
          trend={{ text: "99.4% Entregues", isPositive: true }}
        />
      </div>

      {/* ABA 1: DISPAROS AO PACIENTE */}
      {abaAtiva === 'disparos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                Histórico Recente de Notificações Humanizadas
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comunicação segura com pacientes e familiares com trilha de entrega e leitura auditada.
              </p>

              <div className="space-y-3 text-xs">
                {DISPAROS_MOCK.map(disp => (
                  <div key={disp.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{disp.id}</span>
                        <strong className="text-slate-900">{disp.paciente}</strong>
                        <span className="text-slate-500 font-mono text-[11px]">{disp.telefone}</span>
                      </div>
                      <span className="text-[#8A6A16] font-semibold block mt-1">{disp.tipoMensagem}</span>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#8A6A16]/[0.08] text-[#8A6A16] border border-[#8A6A16]/20 block">
                        {disp.status}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">{disp.horario}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulador de Disparos Rápidos */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Gatilhos Rápidos de Mensageria</h4>
              <p className="text-xs text-slate-500">
                Dispare avisos pré-formatados com aprovação hospitalar:
              </p>

              <button
                type="button"
                onClick={() => handleSimulateWhatsAppNotification('Boletim Diário UTI')}
                className="w-full p-2.5 rounded-xl border border-[#8A6A16]/20 bg-[#8A6A16]/50 hover:bg-[#6E5511]/[0.12] text-[#8A6A16] text-xs font-bold text-left min-h-[44px]"
              >
                1. Boletim Clínico para Familiares
              </button>
              <button
                type="button"
                onClick={() => handleSimulateWhatsAppNotification('Aviso de Alta')}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold text-left min-h-[44px]"
              >
                2. Instruções de Alta Hospitalar
              </button>
              <button
                type="button"
                onClick={() => handleSimulateWhatsAppNotification('Preparo Cirúrgico / Jejum')}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold text-left min-h-[44px]"
              >
                3. Orientações de Jejum &amp; Exames
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: CONFIRMAÇÃO ANTI-NOSHOW */}
      {abaAtiva === 'confirmacao' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Motor Anti-NoShow Preditivo (Redução de Absenteísmo)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Disparo inteligente 48h e 24h antes da consulta com reencaixe automático da fila de espera.
            </p>

            <div className="p-4 bg-[#8A6A16]/[0.08] border border-[#8A6A16]/20 rounded-xl text-xs text-[#6E5511] space-y-1 mb-4">
              <strong>Resultado Comprovado no Hospital 360:</strong>
              <p>O índice de faltas (no-show) caiu de <strong>28,4% para 4,1%</strong> com as confirmações ativas via WhatsApp.</p>
            </div>

            <div className="p-4 border border-[#E0E0E0] rounded-xl text-xs space-y-2">
              <strong className="text-slate-900 block">Template Ativo Homologado:</strong>
              <p className="font-mono text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                &quot;Olá [Nome]! Confirmamos sua consulta amanhã às [Horário] com o Dr. [Médico] no Hospital 360. 
                Responda 1 para CONFIRMAR ou 2 para REMARCAR.&quot;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: WEBHOOKS */}
      {abaAtiva === 'webhooks' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Workflow className="w-5 h-5 text-[#8A6A16]" />
                Tráfego de Webhooks em Tempo Real (n8n Event Bus)
              </h3>
              <p className="text-xs text-slate-500">Comunicação assíncrona entre OpenEMR, OpenBoxes, LIMS e Hyperswitch</p>
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
                    <td className="px-4 py-3.5 text-[#8A6A16] font-bold">{evt.latencyMs}ms</td>
                    <td className="px-4 py-3.5 text-slate-400 truncate max-w-[180px]" title={evt.payloadPreview}>
                      {evt.payloadPreview}
                    </td>
                    <td className="px-4 py-3.5 text-right font-sans">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8A6A16]/[0.08] text-[#8A6A16] border border-[#8A6A16]/20">
                        {evt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: INSTÂNCIAS QR CODE */}
      {abaAtiva === 'instancias' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Instâncias de Conexão WhatsApp (Evolution API / Aiviq-Zap)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sessões ativas com autenticação multi-device e failover automático.
            </p>

            <div className="p-4 border border-[#E0E0E0] rounded-xl flex items-center justify-between text-xs">
              <div>
                <strong className="text-slate-900 block text-sm">Instância Principal: hospital-360-central</strong>
                <span className="text-slate-500">Status: Conectado • Bateria Celular: 98% • Uptime: 42 dias</span>
              </div>
              <span className="px-3 py-1 bg-[#8A6A16]/[0.08] text-[#8A6A16] border border-[#8A6A16]/20 rounded-xl font-bold">
                Online &amp; Sincronizado
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: PERFIS & MATRIZ RBAC */}
      {abaAtiva === 'perfis' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Perfis de Acesso do Módulo Automação &amp; Mensageria
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Permissões para envio de mensagens ativas, alteração de bots e gerenciamento de webhooks.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#8A6A16]/[0.08] text-[#8A6A16] border border-[#8A6A16]/20">
                      {role.level}
                    </span>
                    {role.id === activeRole.id && (
                      <span className="text-[10px] font-bold text-[#8A6A16] bg-[#8A6A16]/[0.08] px-2 py-0.5 rounded-md border border-[#8A6A16]/20">
                        Perfil Ativo
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{role.name}</h4>
                  <p className="text-xs text-slate-600 mb-3">{role.description}</p>
                  
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    Responsável: <strong>{role.responsavelPadrao}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </>
  );
}
