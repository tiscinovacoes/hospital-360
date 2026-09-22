'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import {
  Shield,
  Lock,
  Layers,
  Database,
  Key,
  CheckCircle2,
  XCircle,
  FileCode,
  ArrowLeft,
  Server,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export default function ArchitectureSecurityPage() {
  const [activeTab, setActiveTab] = useState<'dados' | 'seguranca' | 'interop'>('dados');

  return (
    <VigiaSidebarLayout
      moduloId="arquitetura-seguranca"
      activeTitle="Blindagem RN-IND & Auditoria CRED-OMEGA"
      activeSubtitle="Especificação de engenharia para isolamento financeiro, segurança multicamadas e auditoria"
      actions={
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono font-medium bg-violet-50 border border-violet-200 text-[#7C3AED] flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED]" />
            TLS 1.3 • AES-256-GCM
          </span>
        </div>
      }
    >
      {/* Abas Padronizadas com Touch Target HIG >= 44px */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: 'dados', label: '1. Autonomia de Faturamento (RN-IND)', icon: Database },
          { id: 'seguranca', label: '2. Segurança 360° & MFA', icon: Lock },
          { id: 'interop', label: '3. Interoperabilidade (FHIR & HL7)', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-[#E0E0E0] hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo das Abas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ABA 1: AUTONOMIA DE DADOS (RN-IND) */}
        {activeTab === 'dados' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h2 className="text-lg font-bold text-[#111928] mb-2 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#1A56DB]" />
                <span>Regra RN-IND: Princípio do Isolamento Financeiro Estrito</span>
              </h2>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Cada médico proprietário possui um banco de dados e esquema segregado com chave criptográfica própria.
                O administrador do prédio do condomínio hospitalar gerencia ocupação e split de repasse fixo, mas
                <strong> é criptograficamente impossibilitado</strong> de acessar faturamento bruto, lucro ou convênios da clínica.
              </p>
            </div>

            {/* Comparativo de Bancos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Banco da Clínica */}
              <div className="bg-[#111928] text-white p-6 rounded-2xl border border-slate-700 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#0E9F6E]"></span>
                      <h3 className="font-mono text-sm font-bold text-[#6EE7B7]">
                        PostgreSQL — Clínica Sala 204 (Dr. Ricardo)
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-700/50 px-2 py-0.5 rounded">
                      PRIVADO
                    </span>
                  </div>

                  <div className="font-mono text-xs space-y-3 text-slate-300">
                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                      <p className="text-emerald-400 font-bold mb-1">
                        • tabela: faturamento_mensal
                      </p>
                      <p className="pl-4">receita_bruta: R$ 58.000,00</p>
                      <p className="pl-4">despesas_sala: R$ 20.000,00</p>
                      <p className="pl-4 font-bold text-white">lucro_liquido: R$ 38.000,00</p>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                      <p className="text-emerald-400 font-bold mb-1">• tabela: convenios</p>
                      <p className="pl-4">unimed_repasses: R$ 32.500,00</p>
                      <p className="pl-4">bradesco_repasses: R$ 21.000,00</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" /> AES-256-GCM
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Acesso exclusivo do médico
                  </span>
                </div>
              </div>

              {/* Banco do Administrador */}
              <div className="bg-[#1E3A5F] text-white p-6 rounded-2xl border border-blue-900 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-blue-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#38BDF8]"></span>
                      <h3 className="font-mono text-sm font-bold text-[#93C5FD]">
                        PostgreSQL — Administrador do Prédio
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded">
                      OPERACIONAL
                    </span>
                  </div>

                  <div className="font-mono text-xs space-y-3 text-blue-100">
                    <div className="p-3 bg-blue-950/80 rounded-lg border border-blue-900">
                      <p className="text-[#38BDF8] font-bold mb-1">• tabela: ocupacao_salas</p>
                      <p className="pl-4">sala_204_pacientes: 130 no mês</p>
                      <p className="pl-4">sala_204_horas_uso: 160h</p>
                      <p className="pl-4 text-emerald-300 font-bold">taxa_ocupacao: 92%</p>
                    </div>

                    <div className="p-3 bg-blue-950/80 rounded-lg border border-blue-900">
                      <p className="text-[#38BDF8] font-bold mb-1">• tabela: repasses_predio</p>
                      <p className="pl-4">taxa_sublocacao_fixa: R$ 8.000,00</p>
                      <p className="pl-4">facilities_consumido: R$ 380,00</p>
                      <p className="pl-4 text-red-400 font-bold flex items-center gap-1 mt-1">
                        <XCircle className="w-3.5 h-3.5" /> receita_medica: [BLOQUEADO]
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-blue-800 flex items-center justify-between text-xs text-blue-200">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Lock className="w-3.5 h-3.5" /> Sem acesso aos valores clínicos
                  </span>
                  <span className="text-sky-300 font-semibold">Métricas de Gestão</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: SEGURANÇA & MFA */}
        {activeTab === 'seguranca' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#EBF0FB] text-[#1A56DB] flex items-center justify-center mb-4">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#111928] mb-1">Fator 1: Senha Argon2id</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Mínimo 12 caracteres com complexidade estrita. Hash gerado com Argon2id, resistente a ataques de força bruta em GPU.
                </p>
                <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[11px] font-mono text-[#1A56DB]">
                  argon2id • memoryCost: 64MB
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] text-[#92400E] flex items-center justify-center mb-4">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#111928] mb-1">Fator 2: TOTP Dinâmico</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Autenticação baseada em tempo com janela de 30 segundos (Google Authenticator / Authy) e 10 códigos descartáveis de backup.
                </p>
                <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[11px] font-mono text-[#92400E]">
                  TOTP-SHA256 • 30s window
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] text-[#057A55] flex items-center justify-center mb-4">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#111928] mb-1">Fator 3: WebAuthn FIDO2</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Biometria por hardware (Touch ID, Face ID, Windows Hello) associada à chave privada do dispositivo físico do médico.
                </p>
                <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[11px] font-mono text-[#057A55]">
                  FIDO2 / WebAuthn Biometric
                </div>
              </div>
            </div>

            {/* Política de Backup 3-2-1 e Auditoria */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h3 className="text-base font-bold text-[#111928] mb-4">
                Auditoria Imutável &amp; Política de Backup (Regra 3-2-1)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#4B5563]">
                <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] font-mono">
                  <p className="font-bold text-[#1A56DB] mb-2">Estrutura do Backup 3-2-1:</p>
                  <p>• 3 cópias: Primário + Standby síncrono + S3 Glacier</p>
                  <p>• 2 mídias diferentes: NVMe Local + Object Storage</p>
                  <p>• 1 cópia off-site: Multi-region (sa-east-1 + us-east-1)</p>
                  <p className="mt-2 text-emerald-600 font-bold">RPO = 0 (Zero perda de dados clínicos)</p>
                </div>

                <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] font-mono">
                  <p className="font-bold text-[#1A56DB] mb-2">Conformidade Legal:</p>
                  <p>• CFM 1.821/2007: Retenção de prontuário por 20 anos</p>
                  <p>• LGPD Art. 7º: Termo de consentimento digital com IP</p>
                  <p>• Audit Log: Registro imutável de todas as consultas e laudos</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: INTEROPERABILIDADE FHIR & HL7 */}
        {activeTab === 'interop' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h2 className="text-lg font-bold text-[#111928] mb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#7C3AED]" />
                <span>Interoperabilidade Padrão Ouro: FHIR R4 &amp; HL7 v2</span>
              </h2>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                Integração direta entre o Prontuário Eletrônico do Médico e o Laboratório de Análises do Hub,
                eliminando redigitação de pedidos e atrasos na entrega de laudos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FHIR ServiceRequest */}
              <div className="bg-[#111928] text-white p-5 rounded-2xl border border-slate-700 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                  <span className="font-mono text-xs font-bold text-purple-400">
                    FHIR R4 — ServiceRequest (Pedido Médico)
                  </span>
                  <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded">
                    POST /fhir/ServiceRequest
                  </span>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-3 bg-slate-900 rounded-lg">
{`{
  "resourceType": "ServiceRequest",
  "id": "lab-req-12345",
  "status": "active",
  "intent": "order",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "58410-2",
      "display": "Hemograma Completo"
    }]
  },
  "subject": {
    "reference": "Patient/ana-carolina-souza"
  },
  "requester": {
    "reference": "Practitioner/dr-ricardo-mendes"
  }
}`}
                </pre>
              </div>

              {/* FHIR DiagnosticReport */}
              <div className="bg-[#111928] text-white p-5 rounded-2xl border border-slate-700 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    FHIR R4 — DiagnosticReport (Resultado Lab)
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">
                    Retorno Hub → Médico
                  </span>
                </div>
                <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-3 bg-slate-900 rounded-lg">
{`{
  "resourceType": "DiagnosticReport",
  "id": "hemograma-ana-12345",
  "status": "final",
  "code": {
    "display": "Hemograma Completo"
  },
  "result": [{
    "display": "Hemoglobina: 14.2 g/dL"
  }],
  "conclusion": "Padrão normal. Sem alterações."
}`}
                </pre>
              </div>
            </div>

            {/* HL7 v2 Sample */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <h3 className="text-sm font-bold text-[#111928] mb-2 font-mono">
                Mensagem Legada HL7 v2.x (ADT^A01 — Admissão Hospitalar)
              </h3>
              <pre className="font-mono text-[11px] bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB] text-[#1E3A5F] overflow-x-auto">
{`MSH|^~\\&|HOSP360|SALA204|LAB|3ANDAR|20260421143000||ADT^A01|MSG00001|P|2.5
EVN|A01|20260421143000
PID|1||123456789^^^HOSP360^MR||SOUZA^ANA CAROLINA||19900315|F|||RUA DAS FLORES 123^^SAO PAULO^SP^01234567^BR
PV1|1|O|SALA204^01^01^HOSP360||||DR.RICARDO MENDES^RICARDO^MENDES^^^DR.`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </VigiaSidebarLayout>
  );
}
