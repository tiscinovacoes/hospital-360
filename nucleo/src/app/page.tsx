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
    tagColor: 'bg-blue-50 text-[#1A56DB] border border-blue-200',
    destaque: true,
    metricas: '5 Estações Integradas'
  },
  {
    id: 'compras-atas',
    titulo: 'Compras Públicas & Gestão de Atas (ARP)',
    subtitulo: 'Em Conformidade Estrita com a Lei 14.133/21',
    descricao: 'Gestão de Atas de Registro de Preços, limite legal carona (50%), empenho digital e trava preventiva contra sobrepreço baseada em CMED e BPS.',
    href: '/compras-publicas',
    icone: ShoppingCart,
    categoria: 'SUPRIMENTOS',
    tag: 'LEI 14.133/21',
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
    tag: 'FEFO • RDC 430',
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
    tag: 'GEOFENCE <100M',
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
    tag: 'PEP AMBULATORIAL',
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
    tag: 'CENSO DE LEITOS',
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
    tag: 'SPLIT DE REPASSE',
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
    tag: 'N8N & WHATSAPP',
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
    tag: 'IMPORTADOR CSV',
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
    tag: 'SEGURANÇA & RLS',
    tagColor: 'bg-slate-100 text-slate-700 border border-slate-200',
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
      {/* BANNER CENTRAL EXECUTIVO: O CUSTO DO PACIENTE (A JUNÇÃO DE TUDO) - DESIGN MINIMALISTA CLEAN */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-[#1A56DB] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#1A56DB]" />
              <span>MÓDULO CENTRAL UNIFICADOR</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Custo do Paciente (Core 360)
            </h2>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              O coração analítico da nossa plataforma. Ele é a <strong className="text-slate-900 font-bold">junção de tudo o que oferecemos</strong>: absorve automaticamente os dados de prontuários (OpenEMR), dispensação de farmácia (FEFO), laudos de laboratório (LIMS), compras e contratos de atas, escalas médicas e faturamento, confrontando o custo real apurado com as tabelas <strong className="text-slate-900 font-bold">SIGTAP (SUS)</strong> e <strong className="text-slate-900 font-bold">TUSS</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 5 Estações de Custo
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confronto SIGTAP Automático
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Importação de Sistemas Legados
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
            <Link
              href="/dashboard-executivo"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1A56DB] hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01]"
            >
              <span>Abrir Custo do Paciente</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/ingestao-modulos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
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
