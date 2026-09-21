'use client';

import React from 'react';
import Link from 'next/link';
import { HospitalNav } from './components/HospitalNav';
import { RealTimeNotification } from './components/RealTimeNotification';
import { ProfileCard } from './components/ProfileCard';
import { useUser } from './contexts/UserContext';
import {
  Building2,
  Stethoscope,
  TrendingUp,
  BedDouble,
  Sparkles,
  QrCode,
  BarChart3,
  FlaskConical,
  Shield,
  Layers,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function RoleSelectionPage() {
  const { currentUser } = useUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <HospitalNav />

      {/* Hero Section Institucional Vigia Saúde */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1E3A5F] via-[#1A56DB] to-[#2563EB] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-800/40">
        {/* Background Grid Accent */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-[#93C5FD] mb-4">
                <span className="w-2 h-2 rounded-full bg-[#0E9F6E] animate-pulse"></span>
                Hospital 360 • Plataforma Multi-Perfil Ativa
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Selecione seu perfil de acesso ao ecossistema
              </h1>

              <p className="mt-3 text-base sm:text-lg text-[#BFDBFE] leading-relaxed">
                Gestão completa de condomínio hospitalar com autonomia financeira para clínicas,
                interoperabilidade FHIR/HL7 e rastreabilidade ponta a ponta.
              </p>

              {/* Badges / Chips */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-white">
                  <Building2 className="w-3.5 h-3.5 text-[#93C5FD]" /> Condomínio Hospitalar
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#0E9F6E]/20 border border-[#0E9F6E]/40 text-[#6EE7B7]">
                  <Sparkles className="w-3.5 h-3.5" /> IA Integrada (No-Show &amp; Glosas)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-white">
                  <Lock className="w-3.5 h-3.5 text-[#FACA15]" /> RN-IND: Faturamento Isolado
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-white">
                  <Layers className="w-3.5 h-3.5 text-[#A78BFA]" /> FHIR R4 &amp; HL7 v2
                </span>
              </div>
            </div>

            {/* User status card inside hero */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 min-w-[280px] max-w-sm flex flex-col justify-between shadow-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#93C5FD]">
                  Usuário Autenticado
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-3xl">{currentUser.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">
                        {currentUser.name}
                      </span>
                      {currentUser.isMaster && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FACA15] text-[#111928]">
                          MASTER
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#BFDBFE] mt-0.5">
                      {currentUser.roleTitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-[#BFDBFE]">
                <span>
                  {currentUser.isMaster
                    ? '8 de 8 perfis liberados'
                    : `${currentUser.allowedRoles.length} perfis liberados`}
                </span>
                <span className="text-[11px] text-[#93C5FD]">Use o seletor no topo ↗</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Real-time Cross Module Events */}
        <RealTimeNotification />

        {/* Card Destaque: Hub Modular & Custo Real 360 */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-3 h-3 text-yellow-400" /> Nova Engenharia: Venda Modular &amp; Ingestion Façade
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Hospital 360 Modular: Apuração do Custo do Paciente com Qualquer Módulo
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Clientes que contratam apenas 1 módulo mantêm a rastreabilidade total do custo do paciente.
              Módulos externos ou legados são alimentados via templates de planilha, OCR do Paperless ou APIs REST.
            </p>
          </div>

          <Link
            href="/ingestao-modulos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all flex-shrink-0"
          >
            <Layers className="w-4 h-4" />
            <span>Acessar Hub Modular &amp; Custo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Section Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#111928] tracking-tight">
              Módulos Disponíveis
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Cada perfil possui identidade visual adaptada, permissões estritas e ferramentas especializadas.
            </p>
          </div>

          <Link
            href="/arquitetura-seguranca"
            className="text-xs font-semibold text-[#1A56DB] hover:text-[#1E3A5F] flex items-center gap-1"
          >
            <span>Ver especificações técnicas &amp; segurança</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Profiles Grid (8 Profiles) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Administrador do Prédio */}
          <ProfileCard
            role="admin"
            href="/admin"
            icon={Building2}
            title="Administrador do Prédio"
            description="Visão macro do condomínio: taxa de ocupação, split de pagamentos das salas, alertas de manutenção e contratos."
            badgeLabel="Gestão Predial"
          />

          {/* 2. Prontuário Eletrônico / PEP */}
          <ProfileCard
            role="medico"
            href="/medico"
            icon={Stethoscope}
            title="Prontuário Médico (PEP)"
            description="Workspace clínico em 3 colunas: agenda do dia, evolução médica, sinais vitais e pedidos de exames com laboratório."
            badgeLabel="Atendimento"
          />

          {/* 3. Gestão de Clínica Autônoma */}
          <ProfileCard
            role="gestao-clinica"
            href="/gestao-clinica"
            icon={TrendingUp}
            title="Gestão de Clínica"
            description="Sistema de negócios do médico proprietário: DRE, antecipação Fintech 360, agenda preditiva por IA e hub de insumos."
            badgeLabel="Autonomia Fin."
          />

          {/* 4. Posto de Enfermagem / Internação */}
          <ProfileCard
            role="internacao"
            href="/internacao"
            icon={BedDouble}
            title="Internação &amp; Enfermagem"
            description="Mapa interativo de 12 leitos em 3 andares, checagem de medicação e disparo de alta médica para higienização."
            badgeLabel="Enfermagem"
          />

          {/* 5. App de Facilities & Limpeza */}
          <ProfileCard
            role="facilities"
            href="/facilities"
            icon={Sparkles}
            title="App de Facilities"
            description="Mobile-first para a equipe de limpeza com checklist obrigatório de 10 itens de segurança e cronômetro ao vivo."
            badgeLabel="Higiene &amp; Manut."
          />

          {/* 6. Totem de Autoatendimento */}
          <ProfileCard
            role="recepcao"
            href="/recepcao"
            icon={QrCode}
            title="Totem &amp; Recepção"
            description="Interface touchscreen para o paciente: check-in por QR Code, retirada de senhas categorizadas e localização de salas."
            badgeLabel="Autoatendimento"
          />

          {/* 7. Dashboard Executivo 360° */}
          <ProfileCard
            role="dashboard-executivo"
            href="/dashboard-executivo"
            icon={BarChart3}
            title="Dashboard Executivo"
            description="Painel estratégico C-Level: faturamento consolidado, glosas, reserva de salas cirúrgicas e centro de notificações."
            badgeLabel="Estratégico"
          />

          {/* 8. Laboratório & Imagem */}
          <ProfileCard
            role="laboratorio"
            href="/laboratorio"
            icon={FlaskConical}
            title="Laboratório &amp; Imagem"
            description="Emissão de laudos diagnósticos e integração bidirecional com prontuários via protocolo FHIR R4 DiagnosticReport."
            badgeLabel="Interoperável"
          />
        </div>

        {/* Feature Highlights Section */}
        <div className="mt-14 pt-10 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="w-9 h-9 rounded-lg bg-[#EBF0FB] text-[#1A56DB] flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#111928] mb-1">
              RN-IND: Autonomia Financeira
            </h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              O administrador do prédio hospitalar nunca tem acesso ao faturamento das clínicas
              locatárias. Somente métricas operacionais são compartilhadas.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="w-9 h-9 rounded-lg bg-[#D1FAE5] text-[#057A55] flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#111928] mb-1">
              Padrões FHIR R4 &amp; HL7 v2
            </h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Eliminação de retrabalho com laudos estruturados, integração nativa entre médico e
              laboratório do hub sem duplicidade de dados.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-[#E5E7EB] bg-white">
            <div className="w-9 h-9 rounded-lg bg-[#FEF9C3] text-[#92400E] flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#111928] mb-1">
              Segurança Multicamadas
            </h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              MFA em 3 fatores (Senha + TOTP + Biometria FIDO2), criptografia AES-256-GCM, logs
              imutáveis de auditoria e conformidade com a LGPD e CFM.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Institucional conforme IDENTIDADE_VISUAL (1).md */}
      <footer className="mt-16 border-t border-[#E5E7EB] bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7">
              <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                <path
                  d="M20 3L5 9v11c0 8.3 6.4 16.1 15 18 8.6-1.9 15-9.7 15-18V9L20 3z"
                  fill="#1A56DB"
                />
                <rect x="17" y="12" width="6" height="16" rx="1" fill="white" />
                <rect x="12" y="17" width="16" height="6" rx="1" fill="white" />
                <circle cx="29" cy="11" r="4" fill="#0E9F6E" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-[#111928]">Hospital 360</p>
              <p className="text-[11px] text-[#6B7280]">
                Vigia Saúde Design System v1.0.0
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right text-xs text-[#6B7280]">
            <p>Inter + JetBrains Mono • CSS Custom Properties • Lucide React</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              Ecossistema Hospitalar Inteligente — Brasil
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
