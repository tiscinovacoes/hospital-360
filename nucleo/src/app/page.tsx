'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../components/VigiaSidebarLayout';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  FileText,
  UserCheck,
  Stethoscope,
  Pill,
  FlaskConical,
  BedDouble,
  CreditCard,
  MessageSquare,
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Shield,
  Sparkles,
  Zap,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ModuloCard {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  href: string;
  icone: React.ComponentType<{ className?: string }>;
  categoria: 'SUPRIMENTOS' | 'ASSISTENCIAL' | 'OPERACAO' | 'FINANCEIRO';
  tag: string;
  tagColor: string;
  destaque?: boolean;
  metricas?: string;
}

const MODULOS_CATALOGO: ModuloCard[] = [
  {
    id: 'custo-paciente',
    titulo: 'Custo do Paciente (Core Door-to-Door)',
    subtitulo: 'Motor de Absorção & Consolidação Multissistemas',
    descricao: 'A junção unificada de tudo o que oferecemos: consolida consultas, exames, medicamentos FEFO, diárias e honorários comparando com as tabelas SIGTAP e TUSS.',
    href: '/dashboard-executivo',
    icone: LayoutDashboard,
    categoria: 'FINANCEIRO',
    tag: 'JUNÇÃO DE TODOS OS MÓDULOS',
    tagColor: 'bg-blue-600 text-white',
    destaque: true,
    metricas: '5 Estações de Custo Integradas'
  },
  {
    id: 'compras-atas',
    titulo: 'Compras Públicas & Gestão de Atas (ARP)',
    subtitulo: 'Em Conformidade Estrita com a Lei 14.133/21',
    descricao: 'Gestão de Atas de Registro de Preços, limite legal carona (50%), empenho digital e trava preventiva contra sobrepreço baseada em CMED e BPS.',
    href: '/compras-publicas',
    icone: ShoppingCart,
    categoria: 'SUPRIMENTOS',
    tag: 'NOVA LEI LICITAÇÕES',
    tagColor: 'bg-emerald-600 text-white',
    metricas: 'Trava CMED & BPS Ativa'
  },
  {
    id: 'estoque-central',
    titulo: 'Estoque Central & Centro de Distribuição',
    subtitulo: 'Vigia Saúde • Armazenagem & Climatização RDC 430',
    descricao: 'Monitoramento contínuo de temperatura e umidade para CD Central e câmaras frias (2ºC a 8ºC), ordenação FEFO e laudo de quarentena sanitária.',
    href: '/estoque-central',
    icone: Boxes,
    categoria: 'SUPRIMENTOS',
    tag: 'FEFO E CADEIA DO FRIO',
    tagColor: 'bg-cyan-600 text-white',
    metricas: '4 Locais Monitorados'
  },
  {
    id: 'escala-medica',
    titulo: 'Escala Médica, Ponto GPS & PIX D+0',
    subtitulo: 'Ponto Eletrônico por Geofencing (<100m) e Biometria',
    descricao: 'Validação de presença em raio de 100m do hospital, cofre de certificados CRM/ATLS/PALS, substituições sem furos e antecipação instantânea PIX.',
    href: '/escala-medica',
    icone: UserCheck,
    categoria: 'OPERACAO',
    tag: 'GEOFENCE & CFM',
    tagColor: 'bg-indigo-600 text-white',
    metricas: '100% Cobertura de Postos'
  },
  {
    id: 'farmacia-satelite',
    titulo: 'Farmácia Satélite & Dispensação Beira-Leito',
    subtitulo: 'OpenBoxes Integration com Baixa Atômica',
    descricao: 'Dispensação segura de medicamentos por leitura de código de barras, conferência de dose unitária e baixa automática de estoque por lote FEFO.',
    href: '/farmacia-estoque',
    icone: Pill,
    categoria: 'SUPRIMENTOS',
    tag: 'BEIRA-LEITO',
    tagColor: 'bg-teal-600 text-white',
    metricas: 'Alerta de Lotes Vencendo'
  },
  {
    id: 'gestao-clinica',
    titulo: 'Consultório & Clínica Médica (OpenEMR)',
    subtitulo: 'Prontuário Eletrônico do Paciente (PEP)',
    descricao: 'Atendimento ambulatorial, anamnese, prescrição eletrônica estruturada e emissão automática de eventos de jornada clínica para o Custo do Paciente.',
    href: '/gestao-clinica',
    icone: Stethoscope,
    categoria: 'ASSISTENCIAL',
    tag: 'PEP MULTIPERFIL',
    tagColor: 'bg-blue-700 text-white',
    metricas: 'Fila e Prontuário Rápido'
  },
  {
    id: 'laboratorio-lims',
    titulo: 'Laboratório & Análises Clínicas (LIMS)',
    subtitulo: 'Conector Senaite & Equipamentos Automatizados',
    descricao: 'Gestão de amostras biológicas, interfaceamento com analisadores bioquímicos e liberação de laudos com assinatura digital e rastreio de reagentes.',
    href: '/laboratorio',
    icone: FlaskConical,
    categoria: 'ASSISTENCIAL',
    tag: 'LIMS SENAITE',
    tagColor: 'bg-purple-600 text-white',
    metricas: 'Tempo Porta-Resultado'
  },
  {
    id: 'leitos-censo',
    titulo: 'Censo Hospitalar & Gestão de Leitos',
    subtitulo: 'Mapa de Ocupação em Tempo Real (UTI e Enfermarias)',
    descricao: 'Controle de internação, alta, transferência, higienização de leitos e tempo médio de permanência (TMP) com apuração de custo diária.',
    href: '/leitos-censo',
    icone: BedDouble,
    categoria: 'ASSISTENCIAL',
    tag: 'MAPA DE LEITOS',
    tagColor: 'bg-sky-600 text-white',
    metricas: 'Taxa de Ocupação Ativa'
  },
  {
    id: 'fintech-split',
    titulo: 'Fintech Split de Pagamentos & NFS-e',
    subtitulo: 'Hyperswitch Engine & Serviço Fiscal .NET C#',
    descricao: 'Divisão imediata de receitas entre o condomínio hospitalar e os médicos parceiros, com emissão automática de notas fiscais de serviço.',
    href: '/financeiro-split',
    icone: CreditCard,
    categoria: 'FINANCEIRO',
    tag: 'SPLIT AUTOMÁTICO',
    tagColor: 'bg-amber-600 text-white',
    metricas: 'Roteamento Multi-Adquirente'
  },
  {
    id: 'automacao-n8n',
    titulo: 'Central n8n & Mensageria WhatsApp Poli',
    subtitulo: 'Barramento de Interoperabilidade e IA Conversacional',
    descricao: 'Disparo de lembretes de consultas no WhatsApp, triagem automatizada com IA e integração entre sistemas via webhooks e fila resiliente.',
    href: '/automacao-mensageria',
    icone: MessageSquare,
    categoria: 'OPERACAO',
    tag: 'N8N WORKFLOWS',
    tagColor: 'bg-rose-600 text-white',
    metricas: 'Atendimento Omnichannel'
  },
  {
    id: 'ingestao-dados',
    titulo: 'Hub de Ingestão de Dados & Conectores CSV',
    subtitulo: 'Importador Universal para Sistemas Legados',
    descricao: 'Importe prontuários, estoques legados e escalas por arquivos CSV ou integração REST direta sem retrabalho manual de digitação.',
    href: '/ingestao-modulos',
    icone: FileSpreadsheet,
    categoria: 'OPERACAO',
    tag: 'IMPORTAÇÃO RÁPIDA',
    tagColor: 'bg-slate-700 text-white',
    metricas: 'Validação de Schemas'
  },
  {
    id: 'blindagem-seguranca',
    titulo: 'Blindagem RN-IND & Auditoria CRED-OMEGA',
    subtitulo: 'Conformidade LGPD, RLS e Rotação de Segredos',
    descricao: 'Painel de segurança da informação com trilha de auditoria completa, isolamento de inquilinos (tenants) e métricas Prometheus de barramento.',
    href: '/arquitetura-seguranca',
    icone: ShieldCheck,
    categoria: 'FINANCEIRO',
    tag: 'ZERO TRUST',
    tagColor: 'bg-emerald-700 text-white',
    metricas: 'Segurança Militar'
  }
];

export default function HubModulosPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('TODAS');
  const [busca, setBusca] = useState<string>('');

  const modulosFiltrados = MODULOS_CATALOGO.filter(m => {
    const matchCat = categoriaAtiva === 'TODAS' || m.categoria === categoriaAtiva;
    const matchBusca =
      m.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      m.subtitulo.toLowerCase().includes(busca.toLowerCase()) ||
      m.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      m.tag.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const moduloCentral = MODULOS_CATALOGO.find(m => m.id === 'custo-paciente')!;

  return (
    <VigiaSidebarLayout
      activeTitle="Hub de Módulos & Catálogo de Soluções"
      activeSubtitle="Acesso centralizado a todas as capacidades do ecossistema hospitalar"
    >
      {/* BANNER CENTRAL EXECUTIVO: O CUSTO DO PACIENTE (A JUNÇÃO DE TUDO) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#1A56DB] to-[#2563EB] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 border border-blue-500/30 mb-8">
        {/* Padrão decorativo sutil */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/15 border border-white/25 text-white mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>MÓDULO CENTRAL UNIFICADOR</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Custo do Paciente (Core 360)
            </h2>

            <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
              O coração analítico da nossa plataforma. Ele é a <strong>junção de tudo o que oferecemos</strong>: absorve automaticamente os dados de prontuários (OpenEMR), dispensação de farmácia (FEFO), laudos de laboratório (LIMS), compras e contratos de atas, escalas médicas e faturamento, confrontando o custo real apurado com as tabelas <strong>SIGTAP (SUS)</strong> e <strong>TUSS</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold text-blue-100">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 5 Estações de Custo
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confronto SIGTAP Automático
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Importação de Sistemas Legados
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
            <Link
              href="/dashboard-executivo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#1A56DB] hover:bg-blue-50 font-black text-sm shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Abrir Custo do Paciente</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/ingestao-modulos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-700/50 hover:bg-blue-700 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Importar Dados Externos (CSV)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS & PESQUISA DE MÓDULOS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Abas de Categorias (estilo pill) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: 'TODAS', label: 'Todos os Módulos' },
            { id: 'SUPRIMENTOS', label: 'Suprimentos & Atas' },
            { id: 'ASSISTENCIAL', label: 'Clínico & Assistencial' },
            { id: 'OPERACAO', label: 'Pessoas & Operação' },
            { id: 'FINANCEIRO', label: 'Financeiro & Governança' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                categoriaAtiva === cat.id
                  ? 'bg-[#1A56DB] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Campo de Busca */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar módulos..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB] font-medium"
          />
        </div>
      </div>

      {/* GRID DE MÓDULOS DO ECOSSISTEMA (ESTILO AIVO / VIGIA SAÚDE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modulosFiltrados.map((modulo) => {
          const Icone = modulo.icone;

          return (
            <Link
              key={modulo.id}
              href={modulo.href}
              className="group bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {/* Barra superior de acentuação no hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-[#1A56DB] transition-colors" />

              <div>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-[#1A56DB] text-[#1A56DB] group-hover:text-white flex items-center justify-center transition-all flex-shrink-0 shadow-sm">
                    <Icone className="w-6 h-6" />
                  </div>

                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${modulo.tagColor}`}>
                    {modulo.tag}
                  </span>
                </div>

                {/* Conteúdo */}
                <h3 className="font-extrabold text-base text-slate-900 mt-3 group-hover:text-[#1A56DB] transition-colors">
                  {modulo.titulo}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {modulo.subtitulo}
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {modulo.descricao}
                </p>
              </div>

              {/* Footer do Card */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {modulo.metricas ? (
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-600" />
                    {modulo.metricas}
                  </span>
                ) : (
                  <span />
                )}

                <span className="inline-flex items-center gap-1 font-extrabold text-[#1A56DB] group-hover:translate-x-0.5 transition-transform">
                  <span>Acessar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* RODAPÉ DO HUB COM TOTALIZADORES */}
      <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Plataforma 100% Homologada &amp; Operante</p>
            <p className="text-[11px] text-slate-400">Todos os módulos integrados via Supabase RLS no projeto oficial.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-semibold">Versão 360 Enterprise • Release 2026.09</span>
        </div>
      </div>
    </VigiaSidebarLayout>
  );
}
