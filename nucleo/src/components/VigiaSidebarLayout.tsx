'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Building2,
  DollarSign
} from 'lucide-react';
import { ModuloId, MODULO_THEMES, ModuloThemeConfig } from './ModuloLayoutShell';

interface NavItem {
  id: ModuloId | 'home';
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  category?: string;
}

export const MODULOS_SISTEMA: NavItem[] = [
  {
    id: 'home',
    name: 'Hub de Módulos',
    href: '/',
    icon: Layers,
    category: 'Geral'
  },
  {
    id: 'dashboard-executivo',
    name: 'Custo do Paciente (Core 360)',
    href: '/dashboard-executivo',
    icon: LayoutDashboard,
    badge: 'Unificador',
    category: 'Inteligência de Custos'
  },
  {
    id: 'compras-publicas',
    name: 'Compras Públicas & Atas ARP',
    href: '/compras-publicas',
    icon: ShoppingCart,
    badge: 'Lei 14.133',
    category: 'Suprimentos & Contratos'
  },
  {
    id: 'estoque-central',
    name: 'Estoque Central & CD Vigia',
    href: '/estoque-central',
    icon: Boxes,
    badge: 'FEFO',
    category: 'Suprimentos & Contratos'
  },
  {
    id: 'farmacia-estoque',
    name: 'Farmácia Satélite & Dispensação',
    href: '/farmacia-estoque',
    icon: Pill,
    badge: 'Portaria 344',
    category: 'Assistencial'
  },
  {
    id: 'escala-medica',
    name: 'Escala Médica & Ponto GPS',
    href: '/escala-medica',
    icon: UserCheck,
    badge: '<100m',
    category: 'Gestão de Pessoas'
  },
  {
    id: 'gestao-clinica',
    name: 'Consultório & Clínica (OpenEMR)',
    href: '/gestao-clinica',
    icon: Stethoscope,
    badge: 'PEP',
    category: 'Assistencial'
  },
  {
    id: 'laboratorio',
    name: 'Laboratório & Análises (LIMS)',
    href: '/laboratorio',
    icon: FlaskConical,
    badge: 'LIS',
    category: 'Assistencial'
  },
  {
    id: 'leitos-censo',
    name: 'Censo Hospitalar & Leitos',
    href: '/leitos-censo',
    icon: BedDouble,
    badge: 'NIR',
    category: 'Assistencial'
  },
  {
    id: 'financeiro-split',
    name: 'Fintech Split & Contábil',
    href: '/financeiro-split',
    icon: CreditCard,
    badge: 'NFSe',
    category: 'Financeiro'
  },
  {
    id: 'automacao-mensageria',
    name: 'Central n8n & WhatsApp Poli',
    href: '/automacao-mensageria',
    icon: MessageSquare,
    badge: 'Omni',
    category: 'Automações'
  },
  {
    id: 'ingestao-modulos',
    name: 'Hub de Ingestão & CSV',
    href: '/ingestao-modulos',
    icon: FileSpreadsheet,
    badge: 'HL7/FHIR',
    category: 'Geral'
  },
  {
    id: 'arquitetura-seguranca',
    name: 'Blindagem & Auditoria RN-IND',
    href: '/arquitetura-seguranca',
    icon: ShieldCheck,
    badge: 'CISO',
    category: 'Governança'
  }
];

interface VigiaSidebarLayoutProps {
  children: React.ReactNode;
  moduloId?: ModuloId;
  activeTitle?: string;
  activeSubtitle?: string;
  actions?: React.ReactNode;
}

export function VigiaSidebarLayout({
  children,
  moduloId,
  activeTitle,
  activeSubtitle,
  actions
}: VigiaSidebarLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Fecha o menu mobile ao trocar de página
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Determina o tema do módulo atual (por prop ou pathname)
  const resolvedModuloId: ModuloId = React.useMemo(() => {
    if (moduloId && MODULO_THEMES[moduloId]) return moduloId;
    if (pathname) {
      const match = (Object.keys(MODULO_THEMES) as ModuloId[]).find(
        (id) => pathname === `/${id}` || pathname.startsWith(`/${id}/`)
      );
      if (match) return match;
    }
    return 'compras-publicas';
  }, [moduloId, pathname]);

  const currentTheme = MODULO_THEMES[resolvedModuloId] || MODULO_THEMES['compras-publicas'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 antialiased font-sans">
      {/* Backdrop suave para mobile (sem tons escuros opacos) */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-label="Fechar menu de navegação"
        />
      )}

      {/* SIDEBAR LATERAL DO VIGIA SAÚDE COLORIDA COM A COR DO MÓDULO */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 ${currentTheme.lightBg}/50 border-r ${currentTheme.lightBorder} flex flex-col transition-all duration-300 ease-in-out backdrop-blur-xs ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Topo da Sidebar: Brand & Botão de Colapso */}
        <div className={`h-16 px-4 flex items-center justify-between border-b ${currentTheme.lightBorder} ${currentTheme.lightBg}/80 flex-shrink-0`}>
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            {/* Escudo Vigia Saúde com a cor do módulo atual */}
            <div
              className={`w-10 h-10 flex-shrink-0 ${currentTheme.primaryBg} rounded-xl flex items-center justify-center text-white shadow-sm transition-colors`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v4h4v2h-4v4h-2v-4H7v-2h4V7z" />
              </svg>
            </div>

            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    Vigia <span className={currentTheme.primaryText}>Saúde</span>
                  </span>
                </div>
                <span className={`text-[11px] font-bold ${currentTheme.primaryText}`}>
                  {currentTheme.corNome}
                </span>
              </div>
            )}
          </Link>

          {/* Botão de fechar no mobile (touch target >= 44px) */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-colors"
            aria-label="Fechar gaveta"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Botão de colapsar sidebar no desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
            title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Lista de Navegação com scroll suave */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {!collapsed && (
            <div className={`px-3 pb-1 text-[10px] font-extrabold ${currentTheme.primaryText} uppercase tracking-wider`}>
              Módulos Especializados
            </div>
          )}

          {MODULOS_SISTEMA.map((item) => {
            const isActive =
              item.id === 'home'
                ? pathname === '/'
                : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            const itemTheme = item.id !== 'home' ? MODULO_THEMES[item.id] : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                  isActive
                    ? itemTheme
                      ? `${itemTheme.primaryBg} text-white shadow-sm`
                      : 'bg-[#1A56DB] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white/90 hover:text-slate-900 border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                    isActive
                      ? 'text-white'
                      : itemTheme
                      ? itemTheme.primaryText
                      : 'text-slate-500'
                  }`}
                />

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : itemTheme
                            ? `${itemTheme.lightBg} ${itemTheme.primaryText} border ${itemTheme.lightBorder}`
                            : 'bg-white text-slate-600 border border-[#E0E0E0]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Rodapé da Sidebar: Perfil & Sair */}
        <div className={`p-3 border-t ${currentTheme.lightBorder} flex-shrink-0 ${currentTheme.lightBg}/70`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2 py-1.5'}`}>
            <div
              className={`w-8 h-8 rounded-full ${currentTheme.primaryBg} text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs`}
            >
              CD
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Diretoria Clínica / CD</p>
                <p className={`text-[10px] ${currentTheme.primaryText} font-semibold truncate`}>Hospital Central 360</p>
              </div>
            )}
            {!collapsed && (
              <Link
                href="/login"
                className="text-slate-400 hover:text-rose-600 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Trocar de Usuário / Sair"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL COM CABEÇALHO SUPERIOR */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* TOPBAR / HEADER SUPERIOR COM IDENTIDADE VISUAL DO MÓDULO */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#E0E0E0] sticky top-0 z-30 px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hambúrguer temático para abrir sidebar no mobile (Touch target >= 44px) */}
            <button
              onClick={() => setMobileOpen(true)}
              className={`lg:hidden min-w-[44px] min-h-[44px] p-2 rounded-xl border flex items-center justify-center transition-colors ${currentTheme.lightBg} ${currentTheme.primaryText} ${currentTheme.lightBorder}`}
              aria-label="Abrir menu lateral"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Título Ativo */}
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                  Vigia Saúde 360
                </span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <h1 className="text-xs sm:text-base font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-none">
                  {activeTitle || currentTheme.nome}
                </h1>
                {currentTheme.tagRegulatoria && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border hidden md:inline-flex ${currentTheme.lightBg} ${currentTheme.primaryText} ${currentTheme.lightBorder}`}
                  >
                    {currentTheme.tagRegulatoria}
                  </span>
                )}
              </div>
              {activeSubtitle && (
                <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block truncate max-w-xl">
                  {activeSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Ações do Header (Notificações, Perfil, Ações Rápidas) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {actions}

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-[#E0E0E0] transition-all"
            >
              <Layers className={`w-4 h-4 ${currentTheme.primaryText}`} />
              <span>Ver Módulos</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            {/* Sino de Notificações com touch target 44px */}
            <div className="relative">
              <button
                className="w-10 h-10 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-xl bg-white hover:bg-slate-50 border border-[#E0E0E0] text-slate-600 flex items-center justify-center transition-colors"
                title="Notificações Operacionais"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              </button>
            </div>

            {/* Avatar do Usuário Conectado */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2">
              <div
                className={`w-9 h-9 min-w-[36px] min-h-[36px] sm:w-10 sm:h-10 rounded-xl ${currentTheme.primaryBg} text-white font-black text-xs flex items-center justify-center shadow-sm`}
              >
                JS
              </div>
              <div className="hidden xl:block text-left leading-tight">
                <span className="text-xs font-bold text-slate-800 block">João Silva</span>
                <span className="text-[10px] text-slate-500 block">Gestor Hospitalar</span>
              </div>
            </div>
          </div>
        </header>

        {/* CORPO DO CONTEÚDO */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
