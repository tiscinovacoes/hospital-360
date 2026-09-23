'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { MODULO_THEMES, ModuloId } from '@/components/ModuloLayoutShell';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
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
  Search,
  CheckCircle2
} from 'lucide-react';

interface ModuloCard {
  id: string;
  moduloId: ModuloId;
  titulo: string;
  subtitulo: string;
  descricao: string;
  href: string;
  icone: React.ComponentType<{ className?: string }>;
  categoria: 'SUPRIMENTOS' | 'ASSISTENCIAL' | 'OPERACAO' | 'FINANCEIRO';
  tag: string;
  destaque?: boolean;
  metricas?: string;
}

const MODULOS_CATALOGO: ModuloCard[] = [
  {
    id: 'custo-paciente',
    moduloId: 'dashboard-executivo',
    titulo: 'Custo do Paciente (Core Door-to-Door)',
    subtitulo: 'Motor de Absorção & Consolidação Multissistemas',
    descricao: 'A junção unificada de tudo o que oferecemos: consolida consultas, exames, medicamentos FEFO, diárias e honorários comparando com as tabelas SIGTAP e TUSS.',
    href: '/dashboard-executivo',
    icone: LayoutDashboard,
    categoria: 'FINANCEIRO',
    tag: 'JUNÇÃO DE TODOS OS MÓDULOS',
    destaque: true,
    metricas: '5 Estações Integradas'
  },
  {
    id: 'compras-atas',
    moduloId: 'compras-publicas',
    titulo: 'Compras Públicas & Gestão de Atas (ARP)',
    subtitulo: 'Em Conformidade Estrita com a Lei 14.133/21',
    descricao: 'Gestão de Atas de Registro de Preços, limite legal carona (50%), empenho digital e trava preventiva contra sobrepreço baseada em CMED e BPS.',
    href: '/compras-publicas',
    icone: ShoppingCart,
    categoria: 'SUPRIMENTOS',
    tag: 'LEI 14.133/21',
    metricas: 'Trava CMED & BPS Ativa'
  },
  {
    id: 'estoque-central',
    moduloId: 'estoque-central',
    titulo: 'Estoque Central & Centro de Distribuição',
    subtitulo: 'Vigia Saúde • Armazenagem & Climatização RDC 430',
    descricao: 'Monitoramento contínuo de temperatura e umidade para CD Central e câmaras frias (2ºC a 8ºC), ordenação FEFO e laudo de quarentena sanitária.',
    href: '/estoque-central',
    icone: Boxes,
    categoria: 'SUPRIMENTOS',
    tag: 'FEFO • RDC 430',
    metricas: '4 Locais Monitorados'
  },
  {
    id: 'escala-medica',
    moduloId: 'escala-medica',
    titulo: 'Escala Médica, Ponto GPS & PIX D+0',
    subtitulo: 'Ponto Eletrônico por Geofencing (<100m) e Biometria',
    descricao: 'Validação de presença em raio de 100m do hospital, cofre de certificados CRM/ATLS/PALS, substituições sem furos e antecipação instantânea PIX.',
    href: '/escala-medica',
    icone: UserCheck,
    categoria: 'OPERACAO',
    tag: 'GEOFENCE <100M',
    metricas: '100% Cobertura de Postos'
  },
  {
    id: 'farmacia-satelite',
    moduloId: 'farmacia-estoque',
    titulo: 'Farmácia Satélite & Dispensação Beira-Leito',
    subtitulo: 'OpenBoxes Integration com Baixa Atômica',
    descricao: 'Dispensação segura de medicamentos por leitura de código de barras, conferência de dose unitária e baixa automática de estoque por lote FEFO.',
    href: '/farmacia-estoque',
    icone: Pill,
    categoria: 'SUPRIMENTOS',
    tag: 'BEIRA-LEITO',
    metricas: 'Alerta de Lotes Vencendo'
  },
  {
    id: 'gestao-clinica',
    moduloId: 'gestao-clinica',
    titulo: 'Consultório & Clínica Médica (OpenEMR)',
    subtitulo: 'Prontuário Eletrônico do Paciente (PEP)',
    descricao: 'Atendimento ambulatorial, anamnese, prescrição eletrônica estruturada e emissão automática de eventos de jornada clínica para o Custo do Paciente.',
    href: '/gestao-clinica',
    icone: Stethoscope,
    categoria: 'ASSISTENCIAL',
    tag: 'PEP AMBULATORIAL',
    metricas: 'Fila e Prontuário Rápido'
  },
  {
    id: 'laboratorio-lims',
    moduloId: 'laboratorio',
    titulo: 'Laboratório & Análises Clínicas (LIMS)',
    subtitulo: 'Conector Senaite & Equipamentos Automatizados',
    descricao: 'Gestão de amostras biológicas, interfaceamento com analisadores bioquímicos e liberação de laudos com assinatura digital e rastreio de reagentes.',
    href: '/laboratorio',
    icone: FlaskConical,
    categoria: 'ASSISTENCIAL',
    tag: 'LIMS SENAITE',
    metricas: 'Tempo Porta-Resultado'
  },
  {
    id: 'leitos-censo',
    moduloId: 'leitos-censo',
    titulo: 'Censo Hospitalar & Gestão de Leitos',
    subtitulo: 'Mapa de Ocupação em Tempo Real (UTI e Enfermarias)',
    descricao: 'Controle de internação, alta, transferência, higienização de leitos e tempo médio de permanência (TMP) com apuração de custo diária.',
    href: '/leitos-censo',
    icone: BedDouble,
    categoria: 'ASSISTENCIAL',
    tag: 'CENSO DE LEITOS',
    metricas: 'Taxa de Ocupação Ativa'
  },
  {
    id: 'fintech-split',
    moduloId: 'financeiro-split',
    titulo: 'Fintech Split de Pagamentos & NFS-e',
    subtitulo: 'Hyperswitch Engine & Serviço Fiscal .NET C#',
    descricao: 'Divisão imediata de receitas entre o condomínio hospitalar e os médicos parceiros, com emissão automática de notas fiscais de serviço.',
    href: '/financeiro-split',
    icone: CreditCard,
    categoria: 'FINANCEIRO',
    tag: 'SPLIT DE REPASSE',
    metricas: 'Roteamento Multi-Adquirente'
  },
  {
    id: 'automacao-n8n',
    moduloId: 'automacao-mensageria',
    titulo: 'Central n8n & Mensageria WhatsApp Poli',
    subtitulo: 'Barramento de Interoperabilidade e IA Conversacional',
    descricao: 'Disparo de lembretes de consultas no WhatsApp, triagem automatizada com IA e integração entre sistemas via webhooks e fila resiliente.',
    href: '/automacao-mensageria',
    icone: MessageSquare,
    categoria: 'OPERACAO',
    tag: 'N8N & WHATSAPP',
    metricas: 'Atendimento Omnichannel'
  },
  {
    id: 'ingestao-dados',
    moduloId: 'ingestao-modulos',
    titulo: 'Hub de Ingestão de Dados & Conectores CSV',
    subtitulo: 'Importador Universal para Sistemas Legados',
    descricao: 'Importe prontuários, estoques legados e escalas por arquivos CSV ou integração REST direta sem retrabalho manual de digitação.',
    href: '/ingestao-modulos',
    icone: FileSpreadsheet,
    categoria: 'OPERACAO',
    tag: 'IMPORTADOR CSV',
    metricas: 'Validação de Schemas'
  },
  {
    id: 'blindagem-seguranca',
    moduloId: 'arquitetura-seguranca',
    titulo: 'Blindagem RN-IND & Auditoria CRED-OMEGA',
    subtitulo: 'Conformidade LGPD, RLS e Rotação de Segredos',
    descricao: 'Painel de segurança da informação com trilha de auditoria completa, isolamento de inquilinos (tenants) e métricas Prometheus de barramento.',
    href: '/arquitetura-seguranca',
    icone: ShieldCheck,
    categoria: 'FINANCEIRO',
    tag: 'SEGURANÇA & RLS',
    metricas: 'Segurança Militar'
  }
];

export default function HubModulosPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('TODAS');
  const [busca, setBusca] = useState<string>('');

  // "Custo do Paciente" já aparece no painel de destaque acima da grade — não duplicar o card.
  const modulosFiltrados = MODULOS_CATALOGO.filter(m => {
    if (m.id === 'custo-paciente') return false;
    const matchCat = categoriaAtiva === 'TODAS' || m.categoria === categoriaAtiva;
    const matchBusca =
      m.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      m.subtitulo.toLowerCase().includes(busca.toLowerCase()) ||
      m.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      m.tag.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  return (
    <>
      <PageHeader
        activeTitle="Hub de Módulos & Catálogo de Soluções"
        activeSubtitle="Acesso centralizado a todas as capacidades do ecossistema hospitalar"
      />

      {/* PAINEL DE DESTAQUE: O CUSTO DO PACIENTE (A JUNÇÃO DE TUDO) — ÚNICO ELEMENTO "ALTO" DA TELA */}
      <div className="bg-[#1B1F1C] rounded-2xl p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#C1622D]">
              Módulo central unificador
            </span>

            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#F6F3EC] leading-tight mt-2">
              Custo do Paciente (Core 360)
            </h2>

            <p className="mt-3 text-sm text-[#F6F3EC]/75 leading-relaxed">
              O coração analítico da nossa plataforma. Ele é a <strong className="text-[#F6F3EC] font-bold">junção de tudo o que oferecemos</strong>: absorve automaticamente os dados de prontuários (OpenEMR), dispensação de farmácia (FEFO), laudos de laboratório (LIMS), compras e contratos de atas, escalas médicas e faturamento, confrontando o custo real apurado com as tabelas <strong className="text-[#F6F3EC] font-bold">SIGTAP (SUS)</strong> e <strong className="text-[#F6F3EC] font-bold">TUSS</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-5 mt-5 text-xs font-semibold text-[#F6F3EC]/85">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E5C4C]" /> 5 Estações de Custo
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E5C4C]" /> Confronto SIGTAP Automático
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0E5C4C]" /> Importação de Sistemas Legados
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
            <Link
              href="/dashboard-executivo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C1622D] hover:bg-[#A8531F] text-white font-bold text-sm transition-all shadow-sm"
              title="Abrir Custo do Paciente em nova aba"
            >
              <span>Abrir Custo do Paciente</span>
              <ArrowRight className="w-4 h-4 -rotate-45" />
            </Link>

            <Link
              href="/admin/perfis-acessos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#F6F3EC]/25 text-[#F6F3EC] font-semibold text-xs hover:bg-white/10 transition-all"
              title="Abrir Gestão de Perfis em nova aba"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Gestão de Perfis &amp; Acessos (RBAC)</span>
            </Link>

            <Link
              href="/ingestao-modulos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#F6F3EC]/15 text-[#F6F3EC]/70 font-semibold text-xs hover:bg-white/10 transition-all"
              title="Abrir Importação em nova aba"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Importar Dados Externos (CSV)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS & PESQUISA DE MÓDULOS — ABAS EM SUBLINHADO, NÃO EM PÍLULA CHEIA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#1B1F1C]/12 pb-0">
        <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar">
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
              className={`pb-3 min-h-[44px] text-xs font-bold transition-all whitespace-nowrap border-b-2 -mb-px ${
                categoriaAtiva === cat.id
                  ? 'border-[#0E5C4C] text-[#1B1F1C]'
                  : 'border-transparent text-[#1B1F1C]/45 hover:text-[#1B1F1C]/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Campo de Busca com touch target HIG >= 44px */}
        <div className="relative w-full md:w-64 mb-2">
          <label htmlFor="busca-modulos" className="sr-only">Filtrar módulos</label>
          <Search className="w-4 h-4 text-[#1B1F1C]/35 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="busca-modulos"
            type="text"
            placeholder="Filtrar módulos..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 min-h-[44px] text-xs bg-white border border-[#1B1F1C]/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0E5C4C]/30 focus:border-[#0E5C4C] font-medium"
          />
        </div>
      </div>

      {/* GRID DE MÓDULOS — MONOCROMÁTICO; A CATEGORIA É UM PONTO DE 9PX, NÃO UM BLOCO COLORIDO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modulosFiltrados.map((modulo) => {
          const theme = MODULO_THEMES[modulo.moduloId] || MODULO_THEMES['compras-publicas'];

          return (
            <Link
              key={modulo.id}
              href={modulo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl border border-[#1B1F1C]/12 p-5 hover:border-[#1B1F1C]/30 hover:shadow-sm transition-all flex flex-col justify-between"
              title={`Abrir ${modulo.titulo} em uma nova aba independente`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className={`w-[9px] h-[9px] rounded-full flex-shrink-0 ${theme.primaryBg}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B1F1C]/45">
                      {modulo.categoria === 'SUPRIMENTOS' && 'Suprimentos'}
                      {modulo.categoria === 'ASSISTENCIAL' && 'Assistencial'}
                      {modulo.categoria === 'OPERACAO' && 'Operação'}
                      {modulo.categoria === 'FINANCEIRO' && 'Financeiro'}
                    </span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#1B1F1C]/35 group-hover:text-[#0E5C4C] transition-colors">
                      Nova Aba
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#1B1F1C]/25 group-hover:text-[#0E5C4C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all -rotate-45" />
                  </div>
                </div>

                <h3 className="font-display font-semibold text-[17px] text-[#1B1F1C] mt-3.5 leading-snug group-hover:text-[#0E5C4C] transition-colors">
                  {modulo.titulo}
                </h3>
                <p className="text-xs font-semibold text-[#1B1F1C]/45 mt-0.5">
                  {modulo.subtitulo}
                </p>
                <p className="text-xs text-[#1B1F1C]/70 mt-2.5 leading-relaxed">
                  {modulo.descricao}
                </p>
              </div>

              {/* Footer do Card */}
              <div className="mt-4 pt-3.5 border-t border-[#1B1F1C]/08 flex items-center justify-between text-xs">
                {modulo.metricas ? (
                  <span className={`text-[11px] font-bold ${theme.primaryText}`}>
                    {modulo.metricas}
                  </span>
                ) : (
                  <span />
                )}

                <span className="inline-flex items-center gap-1.5 font-bold text-[#1B1F1C] group-hover:text-[#0E5C4C] min-h-[44px] transition-colors">
                  <span>Abrir Módulo</span>
                  <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* RODAPÉ DO HUB COM TOTALIZADORES */}
      <div className="mt-10 pt-5 border-t border-[#1B1F1C]/12 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#1B1F1C]/45">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0E5C4C]" />
          <span>Plataforma homologada — RLS ativo em todos os módulos, via Supabase.</span>
        </div>
        <span className="font-semibold">Vigia Saúde 360 &middot; Release 2026.09</span>
      </div>
    </>
  );
}
