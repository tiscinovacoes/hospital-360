'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import { ModuloRbacBar } from '../../components/ModuloRbacBar';
import { KpiCard } from '../../components/KpiCard';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
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
  FileBadge,
  AlertTriangle,
  Fingerprint,
  UserCheck,
  ShieldCheck,
  Check,
  X,
  Info,
  ShieldAlert,
  Download
} from 'lucide-react';

type AbaSeguranca = 
  | 'isolamento'
  | 'lgpd'
  | 'certificados'
  | 'sessoes'
  | 'perfis';

interface AuditLogEntry {
  id: string;
  dataHora: string;
  usuario: string;
  matricula: string;
  acao: string;
  prontuarioAcessado: string;
  justificativaClinica: string;
  ipOrigem: string;
  statusConformidade: 'CONFORME_LGPD' | 'ALERTA_SUSPEITO';
}

const AUDIT_LOGS_MOCK: AuditLogEntry[] = [
  {
    id: 'LOG-88192',
    dataHora: '21/09/2026 21:58:12',
    usuario: 'Dr. Lucas Tavares (CRM 177.892)',
    matricula: 'MED-1049',
    acao: 'Visualização de Prontuário Eletrônico (PEP)',
    prontuarioAcessado: 'PRONT-44910 (Maria Silva Santos)',
    justificativaClinica: 'Prescrição de antibióticoterapia em UTI',
    ipOrigem: '10.20.4.18 (VLAN Clínica Segura)',
    statusConformidade: 'CONFORME_LGPD'
  },
  {
    id: 'LOG-88193',
    dataHora: '21/09/2026 21:30:45',
    usuario: 'Dr. Thiago Medeiros (CRF 44.910)',
    matricula: 'FARM-082',
    acao: 'Validação de Livro Psicotrópico (Fentanila)',
    prontuarioAcessado: 'PRONT-44910 (Maria Silva Santos)',
    justificativaClinica: 'Dispensação Beira-Leito Portaria 344',
    ipOrigem: '10.20.8.22 (Terminal Farmácia)',
    statusConformidade: 'CONFORME_LGPD'
  },
  {
    id: 'LOG-88194',
    dataHora: '21/09/2026 19:12:00',
    usuario: 'Usuário Não-Clínico (Suporte Terceirizado)',
    matricula: 'SUP-9901',
    acao: 'Tentativa de Acesso a Dados Financeiros de Médico Cooperado',
    prontuarioAcessado: 'DRE Sala 204',
    justificativaClinica: 'Sem justificativa assistencial',
    ipOrigem: '192.168.1.104 (Bloqueado por RN-IND)',
    statusConformidade: 'ALERTA_SUSPEITO'
  }
];

interface CertificadoMedico {
  id: string;
  medico: string;
  crm: string;
  tipoCertificado: 'A3 (Token Físico)' | 'A1 (Nuvem ICP-Brasil)' | 'PKI Brasil Cloud';
  validade: string;
  status: 'ATIVO' | 'EXPIRANDO_30D' | 'REVOGADO';
}

const CERTIFICADOS_MOCK: CertificadoMedico[] = [
  {
    id: 'CERT-001',
    medico: 'Dr. Roberto Silveira',
    crm: 'CRM/SP 142.339',
    tipoCertificado: 'A3 (Token Físico)',
    validade: '14/11/2027',
    status: 'ATIVO'
  },
  {
    id: 'CERT-002',
    medico: 'Dra. Camila Nogueira',
    crm: 'CRM/SP 188.420',
    tipoCertificado: 'A1 (Nuvem ICP-Brasil)',
    validade: '15/10/2026',
    status: 'EXPIRANDO_30D'
  }
];

export default function ArchitectureSecurityPage() {
  const roles = MODULO_ROLES_CATALOG['arquitetura-seguranca'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [abaAtiva, setAbaAtiva] = useState<AbaSeguranca>('isolamento');
  const [notice, setNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 5000);
  };

  return (
    <VigiaSidebarLayout
      moduloId="arquitetura-seguranca"
      activeTitle="Governança, Arquitetura & Segurança (CISO)"
      activeSubtitle="Auditoria LGPD em prontuários, isolamento de dados RN-IND e certificados ICP-Brasil"
      actions={
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 min-h-[44px] rounded-xl text-xs font-mono font-medium bg-violet-50 border border-violet-200 text-[#7C3AED] flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED]" />
            TLS 1.3 • AES-256-GCM
          </span>
        </div>
      }
    >
      {/* Toast Notice */}
      {notice && (
        <div className="mb-4 p-3.5 bg-violet-50 border border-violet-200 rounded-2xl flex items-center justify-between text-xs text-violet-950 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
            <span className="font-bold">{notice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotice(null)}
            className="text-violet-700 hover:text-violet-900 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BARRA DE RBAC & CONTROLE DE PERFIS DO MÓDULO */}
      <ModuloRbacBar
        moduloId="arquitetura-seguranca"
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        accentColor="#7C3AED"
        lightBg="bg-violet-50"
        lightBorder="border-violet-200"
      />

      {/* CARDS DE MÉTRICAS CISO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Conformidade LGPD"
          value="100% Auditável"
          subtitle="Artigo 11 Dados Sensíveis"
          icon={<ShieldCheck className="w-5 h-5 text-violet-600" />}
          trend={{ text: "Trilha Imutável Ativa", isPositive: true }}
        />

        <KpiCard
          title="Isolamento RN-IND"
          value="Zero Vazamento"
          subtitle="Esquemas Segregados"
          icon={<Database className="w-5 h-5 text-violet-600" />}
          trend={{ text: "Chaves Cripto Exclusivas", isPositive: true }}
        />

        <KpiCard
          title="Certificados ICP-Brasil"
          value="48 Médicos"
          subtitle="Assinatura Digital CFM"
          icon={<FileBadge className="w-5 h-5 text-violet-600" />}
          trend={{ text: "1 Alerta Renovação", isAlert: true }}
        />

        <KpiCard
          title="Tentativas Bloqueadas"
          value="12 bloqueios"
          subtitle="Prevenção de Intrusão WAF"
          icon={<ShieldAlert className="w-5 h-5 text-rose-600" />}
          trend={{ text: "100% Neutralizadas", isPositive: true }}
        />
      </div>

      {/* SUB-NAVEGAÇÃO POR ABAS */}
      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-1.5 mb-6 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'isolamento', label: '1. Isolamento Financeiro (RN-IND)', icon: Database },
          { id: 'lgpd', label: '2. Trilhas de Auditoria LGPD', icon: ShieldCheck },
          { id: 'certificados', label: '3. Certificados ICP-Brasil', icon: FileBadge },
          { id: 'sessoes', label: '4. Monitoramento & WAF', icon: Lock },
          { id: 'perfis', label: '5. Perfis & Matriz RBAC', icon: Key }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = abaAtiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id as AbaSeguranca)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px] touch-manipulation ${
                isActive
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ABA 1: ISOLAMENTO RN-IND */}
      {abaAtiva === 'isolamento' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E0E0E0] shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#7C3AED]" />
              <span>Regra RN-IND: Princípio do Isolamento Financeiro e Clínico Estrito</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada clínica ou cooperado possui um banco de dados ou esquema segregado com chave criptográfica própria.
              A administração hospitalar gerencia ocupação e split de repasse fixo, mas
              <strong> é criptograficamente impedida</strong> de acessar faturamento bruto, lucro ou dados privados não compartilhados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banco da Clínica (Asséptico, sem preto escuro) */}
            <div className="bg-white p-6 rounded-2xl border border-violet-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <h3 className="text-sm font-bold text-slate-900">
                      PostgreSQL — Clínica Sala 204 (Cardiologia)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded">
                    ISOLADO PRIVADO
                  </span>
                </div>

                <div className="text-xs space-y-2 text-slate-700">
                  <div className="p-3 bg-violet-50/40 rounded-xl border border-violet-100">
                    <p className="text-violet-900 font-bold mb-1">• faturamento_mensal: R$ 49.620,00</p>
                    <p className="text-slate-500 text-[11px]">Acessível exclusivamente pelo Dr. Ricardo (Chave KMS individual)</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-800 font-bold mb-1">• prontuarios_clinicos: 130 registros</p>
                    <p className="text-slate-500 text-[11px]">Criptografia de repouso AES-256 no nível de coluna</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                <span>Status de Isolamento: Ativo</span>
                <span>Chave: KMS-RSA-4096</span>
              </div>
            </div>

            {/* Banco Hospital Condomínio */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <h3 className="text-sm font-bold text-slate-900">
                      PostgreSQL — Condomínio Hospitalar Geral
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                    COMPARTILHADO
                  </span>
                </div>

                <div className="text-xs space-y-2 text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-900 font-bold mb-1">• taxa_condominio: R$ 7.443,00 (15%)</p>
                    <p className="text-slate-500 text-[11px]">Apenas a parcela do split pactuada em contrato de gestão</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-900 font-bold mb-1">• ocupacao_salas: Sala 204 Ativa</p>
                    <p className="text-slate-500 text-[11px]">Controle predial de energia, ar-condicionado e hotelaria</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-700 font-semibold">
                <span>Auditoria Fiscal: Homologada</span>
                <span>NFS-e: Automática</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: LGPD */}
      {abaAtiva === 'lgpd' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Trilha Imutável de Auditoria LGPD (Artigo 11 — Dados Sensíveis de Saúde)
                </h3>
                <p className="text-xs text-slate-500">
                  Registro inviolável com carimbo de tempo (Timestamp ICP) de todo acesso, visualização ou impressão de prontuário.
                </p>
              </div>

              <button
                type="button"
                disabled={!hasPermission(activeRole, 'EXPORT')}
                onClick={() => triggerNotice('Relatório de Conformidade LGPD emitido para o DPO.')}
                className="px-4 py-2 border border-[#E0E0E0] rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                <Download className="w-3.5 h-3.5 inline mr-1" />
                Exportar Trilha DPO
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {AUDIT_LOGS_MOCK.map(log => (
                <div key={log.id} className="p-4 rounded-xl border border-[#E0E0E0] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{log.id}</span>
                      <strong className="text-slate-900">{log.usuario}</strong>
                      <span className="text-slate-400 font-mono">({log.matricula})</span>
                    </div>
                    <span className="text-violet-900 font-semibold block mt-1">{log.acao} &rarr; {log.prontuarioAcessado}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Justificativa: {log.justificativaClinica} • IP: {log.ipOrigem}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${
                      log.statusConformidade === 'CONFORME_LGPD'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {log.statusConformidade}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">{log.dataHora}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: CERTIFICADOS ICP-BRASIL */}
      {abaAtiva === 'certificados' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Gestão de Certificados Digitais ICP-Brasil para Corpo Clínico
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Assinatura digital válida perante o CFM, Farmácias e Vigilância Sanitária para laudos e prescrições.
            </p>

            <div className="space-y-3 text-xs">
              {CERTIFICADOS_MOCK.map(cert => (
                <div key={cert.id} className="p-4 border border-[#E0E0E0] rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block text-sm">{cert.medico}</strong>
                    <span className="text-slate-500">{cert.crm} • Tipo: {cert.tipoCertificado}</span>
                    <span className="text-violet-800 font-semibold block mt-1">Validade: {cert.validade}</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    cert.status === 'ATIVO'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: SESSÕES & WAF */}
      {abaAtiva === 'sessoes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 shadow-xs max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Monitoramento Ativo de Sessões &amp; Web Application Firewall (WAF)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Bloqueio automático de tentativas de brute-force, SQL injection e requisições não autorizadas.
            </p>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
              <strong>Status do WAF Hospitalar:</strong>
              <p>Tráfego 100% monitorado com TLS 1.3, rate limit ativo de 100 req/min por IP e detecção de anomalias.</p>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: PERFIS & MATRIZ RBAC */}
      {abaAtiva === 'perfis' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Perfis de Acesso do Módulo Governança, Arquitetura &amp; CISO
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Responsabilidade máxima pela integridade dos dados hospitalares, trilhas LGPD e segurança da informação.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-50 text-violet-800 border border-violet-200">
                      {role.level}
                    </span>
                    {role.id === activeRole.id && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
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
    </VigiaSidebarLayout>
  );
}
