'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  UserCheck,
  Building,
  Layers
} from 'lucide-react';

export type ModuloId =
  | 'compras-publicas'
  | 'estoque-central'
  | 'escala-medica'
  | 'farmacia-estoque'
  | 'gestao-clinica'
  | 'laboratorio'
  | 'leitos-censo'
  | 'financeiro-split'
  | 'automacao-mensageria'
  | 'ingestao-modulos'
  | 'arquitetura-seguranca'
  | 'dashboard-executivo'
  | 'regulacao-vagas';

export interface ModuloThemeConfig {
  id: ModuloId;
  nome: string;
  subtitulo: string;
  tagRegulatoria: string;
  corNome: string;
  // Classes Tailwind Semânticas
  primaryBg: string;
  primaryHoverBg: string;
  primaryText: string;
  lightBg: string;
  lightBorder: string;
  ringColor: string;
}

export const MODULO_THEMES: Record<ModuloId, ModuloThemeConfig> = {
  'compras-publicas': {
    id: 'compras-publicas',
    nome: 'Compras Públicas & Gestão de Atas',
    subtitulo: 'Ata de Registro de Preços (ARP) → Contrato (50%) → Empenho → PdC → NF-e',
    tagRegulatoria: 'Lei 14.133/21',
    corNome: 'Azul Cobalto Real',
    primaryBg: 'bg-[#1A56DB]',
    primaryHoverBg: 'hover:bg-blue-700',
    primaryText: 'text-[#1A56DB]',
    lightBg: 'bg-blue-50',
    lightBorder: 'border-blue-200',
    ringColor: 'focus:ring-blue-500'
  },
  'estoque-central': {
    id: 'estoque-central',
    nome: 'Estoque Central & CD Vigia',
    subtitulo: 'Centro de Distribuição, Almoxarifado Central, FEFO e Rastreabilidade de Lotes',
    tagRegulatoria: 'RDC 430 FEFO',
    corNome: 'Laranja Âmbar Logístico',
    primaryBg: 'bg-[#D97706]',
    primaryHoverBg: 'hover:bg-amber-700',
    primaryText: 'text-[#D97706]',
    lightBg: 'bg-amber-50',
    lightBorder: 'border-amber-200',
    ringColor: 'focus:ring-amber-500'
  },
  'escala-medica': {
    id: 'escala-medica',
    nome: 'Escala Médica & Plantonistas',
    subtitulo: 'Corpo Clínico, Ponto GPS <100m, CRM/ATLS, Trocas de Plantão e PIX D+0',
    tagRegulatoria: 'Res. CFM 2.147',
    corNome: 'Roxo Índigo Clínico',
    primaryBg: 'bg-[#4F46E5]',
    primaryHoverBg: 'hover:bg-indigo-700',
    primaryText: 'text-[#4F46E5]',
    lightBg: 'bg-indigo-50',
    lightBorder: 'border-indigo-200',
    ringColor: 'focus:ring-indigo-500'
  },
  'farmacia-estoque': {
    id: 'farmacia-estoque',
    nome: 'Farmácia Satélite & Dispensação',
    subtitulo: 'Dispensação Beira-Leito, Dose Unitária, Farmacovigilância e Portaria 344/98',
    tagRegulatoria: 'Portaria 344/98',
    corNome: 'Verde Esmeralda Clínico',
    primaryBg: 'bg-[#0E9F6E]',
    primaryHoverBg: 'hover:bg-emerald-700',
    primaryText: 'text-[#0E9F6E]',
    lightBg: 'bg-emerald-50',
    lightBorder: 'border-emerald-200',
    ringColor: 'focus:ring-emerald-500'
  },
  'gestao-clinica': {
    id: 'gestao-clinica',
    nome: 'Gestão Clínica & PEP',
    subtitulo: 'Prontuário Eletrônico (OpenEMR), Anamnese, Evolução Multiprofissional e Prescrição',
    tagRegulatoria: 'SBIS / CFM',
    corNome: 'Azul Turquesa Assistencial',
    primaryBg: 'bg-[#0891B2]',
    primaryHoverBg: 'hover:bg-cyan-700',
    primaryText: 'text-[#0891B2]',
    lightBg: 'bg-cyan-50',
    lightBorder: 'border-cyan-200',
    ringColor: 'focus:ring-cyan-500'
  },
  'laboratorio': {
    id: 'laboratorio',
    nome: 'Laboratório & Diagnóstico LIS',
    subtitulo: 'Interfaceamento de Analisadores, Triagem de Amostras, Laudos e Assinatura Digital',
    tagRegulatoria: 'RDC 302/2005',
    corNome: 'Azul Petróleo / Teal',
    primaryBg: 'bg-[#0D9488]',
    primaryHoverBg: 'hover:bg-teal-700',
    primaryText: 'text-[#0D9488]',
    lightBg: 'bg-teal-50',
    lightBorder: 'border-teal-200',
    ringColor: 'focus:ring-teal-500'
  },
  'leitos-censo': {
    id: 'leitos-censo',
    nome: 'Censo Hospitalar, Leitos & NIR',
    subtitulo: 'Núcleo Interno de Regulação, Gestão de Vagas, Taxa de Ocupação e Higienização',
    tagRegulatoria: 'Portaria MS 354',
    corNome: 'Azul Céu / Sky',
    primaryBg: 'bg-[#0284C7]',
    primaryHoverBg: 'hover:bg-sky-700',
    primaryText: 'text-[#0284C7]',
    lightBg: 'bg-sky-50',
    lightBorder: 'border-sky-200',
    ringColor: 'focus:ring-sky-500'
  },
  'financeiro-split': {
    id: 'financeiro-split',
    nome: 'Fintech Split & Contábil',
    subtitulo: 'Faturamento SUS/Convênios, Split de Pagamento D+0, Conciliação e NFS-e',
    tagRegulatoria: 'Split D+0 / BACEN',
    corNome: 'Verde Florestal Monetário',
    primaryBg: 'bg-[#16A34A]',
    primaryHoverBg: 'hover:bg-green-700',
    primaryText: 'text-[#16A34A]',
    lightBg: 'bg-green-50',
    lightBorder: 'border-green-200',
    ringColor: 'focus:ring-green-500'
  },
  'automacao-mensageria': {
    id: 'automacao-mensageria',
    nome: 'Automação & Mensageria WhatsApp',
    subtitulo: 'Inteligência Artificial Poli, Workflows n8n, Confirmação de Consultas e Avisos',
    tagRegulatoria: 'n8n / Meta API',
    corNome: 'Verde Mensageria',
    primaryBg: 'bg-[#059669]',
    primaryHoverBg: 'hover:bg-emerald-700',
    primaryText: 'text-[#059669]',
    lightBg: 'bg-emerald-50',
    lightBorder: 'border-emerald-200',
    ringColor: 'focus:ring-emerald-500'
  },
  'ingestao-modulos': {
    id: 'ingestao-modulos',
    nome: 'Ingestão & Conectores HL7/FHIR',
    subtitulo: 'ETL em Lote, Importação de CSV/XLSX, Barramento de Integração e Interoperabilidade',
    tagRegulatoria: 'HL7 v2.5 / FHIR',
    corNome: 'Laranja Coral Integração',
    primaryBg: 'bg-[#EA580C]',
    primaryHoverBg: 'hover:bg-orange-700',
    primaryText: 'text-[#EA580C]',
    lightBg: 'bg-orange-50',
    lightBorder: 'border-orange-200',
    ringColor: 'focus:ring-orange-500'
  },
  'arquitetura-seguranca': {
    id: 'arquitetura-seguranca',
    nome: 'Blindagem LGPD & CISO Governança',
    subtitulo: 'Segurança Operacional, Trilha de Auditoria Imutável WORM e Criptografia em Trânsito',
    tagRegulatoria: 'LGPD Art. 46 / WORM',
    corNome: 'Violeta Governança CISO',
    primaryBg: 'bg-[#7C3AED]',
    primaryHoverBg: 'hover:bg-violet-700',
    primaryText: 'text-[#7C3AED]',
    lightBg: 'bg-violet-50',
    lightBorder: 'border-violet-200',
    ringColor: 'focus:ring-violet-500'
  },
  'dashboard-executivo': {
    id: 'dashboard-executivo',
    nome: 'Custo do Paciente 360 (Executivo)',
    subtitulo: 'Unificação dos 13 Satélites, Rateio Absorção/ABC, Custo por Episódio e Margens',
    tagRegulatoria: 'Core Hospital 360',
    corNome: 'Azul Marinho Hospitalar',
    primaryBg: 'bg-[#2563EB]',
    primaryHoverBg: 'hover:bg-blue-700',
    primaryText: 'text-[#2563EB]',
    lightBg: 'bg-blue-50',
    lightBorder: 'border-blue-200',
    ringColor: 'focus:ring-blue-500'
  },
  'regulacao-vagas': {
    id: 'regulacao-vagas',
    nome: 'Regulação de Vagas & TFD',
    subtitulo: 'Complexo Regulador SUS, Protocolo de Manchester, Ambulâncias e Transferências',
    tagRegulatoria: 'Complexo Regulador SUS',
    corNome: 'Bordeaux / Magenta Clínico',
    primaryBg: 'bg-[#BE185D]',
    primaryHoverBg: 'hover:bg-pink-800',
    primaryText: 'text-[#BE185D]',
    lightBg: 'bg-pink-50',
    lightBorder: 'border-pink-200',
    ringColor: 'focus:ring-pink-500'
  }
};

export interface MenuItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  badgeCor?: string;
}

interface ModuloLayoutShellProps {
  moduloId: ModuloId;
  icon: React.ComponentType<{ className?: string }>;
  menuItens: MenuItemConfig[];
  secaoAtiva: string;
  onSelectSecao: (id: string) => void;
  // Ações do Topo
  botaoAcaoPrincipal?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  botaoAcaoSecundaria?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  perfilAtivo?: string;
  perfisDisponiveis?: { value: string; label: string }[];
  onSelectPerfil?: (perfil: string) => void;
  userInitials?: string;
  children: React.ReactNode;
}

export function ModuloLayoutShell({
  moduloId,
  icon: ModuloIcon,
  menuItens,
  secaoAtiva,
  onSelectSecao,
  botaoAcaoPrincipal,
  botaoAcaoSecundaria,
  perfilAtivo = 'operador',
  perfisDisponiveis = [
    { value: 'operador', label: 'Operador Técnico' },
    { value: 'auditor', label: 'Auditor de Conformidade' },
    { value: 'admin', label: 'Administrador Geral' }
  ],
  onSelectPerfil,
  userInitials = '360',
  children
}: ModuloLayoutShellProps) {
  const theme = MODULO_THEMES[moduloId] || MODULO_THEMES['compras-publicas'];
  const [sidebarAberta, setSidebarAberta] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detecção de viewport mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarAberta(false);
      else setSidebarAberta(true);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleItemClick = (id: string) => {
    onSelectSecao(id);
    if (isMobile) {
      setSidebarAberta(false);
    }
  };

  const secaoLabel = menuItens.find(m => m.id === secaoAtiva)?.label || 'Painel Principal';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* ========================================================================= */}
      {/* 1. CABEÇALHO UNIFICADO DO PRODUTO (COMPATÍVEL COM MÓDULO 1) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E0E0E0] px-3 sm:px-6 h-16 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Botão Hambúrguer Touch-Friendly (44x44px no mobile) */}
          <button
            onClick={() => setSidebarAberta(!sidebarAberta)}
            className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-[#F5F5F5] hover:text-slate-900 transition-all cursor-pointer focus:outline-none focus:ring-2 ${theme.ringColor}`}
            title={sidebarAberta ? 'Recolher Menu' : 'Expandir Menu'}
            aria-label="Alternar Menu de Navegação"
          >
            {sidebarAberta ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>

          {/* Ícone Temático e Nome do Módulo */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${theme.primaryBg} flex items-center justify-center text-white shadow-xs shrink-0`}>
              <ModuloIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
                  Vigia Saúde
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">|</span>
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline truncate">
                  {theme.nome}
                </span>
                <span className={`text-[10px] font-mono font-bold ${theme.lightBg} ${theme.primaryText} px-2 py-0.5 rounded-full border ${theme.lightBorder}`}>
                  {theme.tagRegulatoria}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block truncate">
                {theme.subtitulo}
              </p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Ações Rápidas + Seletor de Perfil + Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {botaoAcaoSecundaria && (
            <button
              onClick={botaoAcaoSecundaria.onClick}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-[#E0E0E0] transition-all shadow-xs cursor-pointer min-h-[36px]"
            >
              {botaoAcaoSecundaria.icon && React.createElement(botaoAcaoSecundaria.icon, { className: 'w-3.5 h-3.5' })}
              <span>{botaoAcaoSecundaria.label}</span>
            </button>
          )}

          {botaoAcaoPrincipal && (
            <button
              onClick={botaoAcaoPrincipal.onClick}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold ${theme.primaryBg} ${theme.primaryHoverBg} text-white transition-all shadow-xs cursor-pointer min-h-[36px] focus:outline-none focus:ring-2 ${theme.ringColor}`}
            >
              {botaoAcaoPrincipal.icon && React.createElement(botaoAcaoPrincipal.icon, { className: 'w-3.5 h-3.5' })}
              <span className="hidden xs:inline">{botaoAcaoPrincipal.label}</span>
            </button>
          )}

          {perfisDisponiveis && (
            <div className="hidden sm:flex items-center gap-1.5 bg-[#F5F5F5] px-2.5 py-1.5 rounded-xl border border-[#E0E0E0] text-xs">
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <select
                value={perfilAtivo}
                onChange={(e) => onSelectPerfil && onSelectPerfil(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                {perfisDisponiveis.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className={`w-8 h-8 rounded-xl ${theme.primaryBg} text-white flex items-center justify-center text-xs font-bold shadow-xs`}>
            {userInitials}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CORPO PRINCIPAL COM SIDEBAR RETRÁTIL & MOBILE DRAWER */}
      {/* ========================================================================= */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop Translúcido para Telas Mobile (Apple HIG) */}
        {isMobile && sidebarAberta && (
          <div
            onClick={() => setSidebarAberta(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
            aria-hidden="true"
          />
        )}

        {/* Menu Lateral (Desktop Retrátil / Mobile Drawer Flutuante) */}
        <aside
          className={`
            ${isMobile ? 'fixed inset-y-0 left-0 z-50 shadow-xl' : 'static z-30'}
            ${sidebarAberta ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:hidden'}
            shrink-0 bg-white border-r border-[#E0E0E0] flex flex-col justify-between transition-all duration-200 ease-in-out
          `}
        >
          {/* Navegação Interna */}
          <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
            {menuItens.map((item) => {
              const Icone = item.icon;
              const ativo = secaoAtiva === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full min-h-[44px] sm:min-h-[38px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer focus:outline-none focus:ring-2 ${theme.ringColor} ${
                    ativo
                      ? `${theme.lightBg} ${theme.primaryText} font-bold border border-[#E0E0E0] shadow-2xs`
                      : 'text-slate-700 hover:bg-[#F5F5F5] hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icone
                      className={`w-4 h-4 shrink-0 ${
                        ativo ? theme.primaryText : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                        item.badgeCor || 'bg-[#F5F5F5] text-slate-700 border border-[#E0E0E0]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Rodapé: Retorno ao Hub de Módulos */}
          <div className="p-3.5 border-t border-[#E0E0E0] bg-[#F8FAFC] space-y-2">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full min-h-[44px] sm:min-h-[38px] py-2 px-3 rounded-xl border border-[#E0E0E0] bg-white text-slate-700 hover:text-slate-900 hover:bg-[#F5F5F5] text-xs font-bold transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Hub de Módulos</span>
            </Link>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 3. ÁREA DE CONTEÚDO PRINCIPAL COM SCROLL SUAVE */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-full">
          {/* Breadcrumbs Dinâmicos com Identidade Visual */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pb-2 border-b border-[#E0E0E0] flex-wrap">
            <Link href="/" className="hover:text-slate-800 transition-colors">
              Hospital 360
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className={`font-semibold ${theme.primaryText} truncate`}>
              {theme.nome}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-900 truncate">
              {secaoLabel}
            </span>
          </div>

          {/* Renderização do Conteúdo do Módulo */}
          {children}
        </main>
      </div>
    </div>
  );
}
