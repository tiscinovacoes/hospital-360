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
  Bell,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Building2,
  DollarSign
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  category?: string;
}

export const MODULOS_SISTEMA: NavItem[] = [
  {
    name: 'Hub de Módulos',
    href: '/',
    icon: Layers,
    category: 'Geral'
  },
  {
    name: 'Custo do Paciente (Core 360)',
    href: '/dashboard-executivo',
    icon: LayoutDashboard,
    badge: 'Unificador',
    badgeColor: 'bg-blue-50 text-[#1A56DB] border border-blue-200',
    category: 'Inteligência de Custos'
  },
  {
    name: 'Compras Públicas & Atas ARP',
    href: '/compras-publicas',
    icon: ShoppingCart,
    badge: 'Lei 14.133',
    badgeColor: 'bg-blue-50 text-[#1A56DB] border border-blue-200',
    category: 'Suprimentos & Contratos'
  },
  {
    name: 'Estoque Central & CD Vigia',
    href: '/estoque-central',
    icon: Boxes,
    badge: 'FEFO',
    badgeColor: 'bg-blue-50 text-[#1A56DB] border border-blue-200',
    category: 'Suprimentos & Contratos'
  },
  {
    name: 'Farmácia Satélite & Dispensação',
    href: '/farmacia-estoque',
    icon: Pill,
    category: 'Assistencial'
  },
  {
    name: 'Escala Médica & Ponto GPS',
    href: '/escala-medica',
    icon: UserCheck,
    badge: '<100m',
    badgeColor: 'bg-blue-50 text-[#1A56DB] border border-blue-200',
    category: 'Gestão de Pessoas'
  },
  {
    name: 'Consultório & Clínica (OpenEMR)',
    href: '/gestao-clinica',
    icon: Stethoscope,
    category: 'Assistencial'
  },
  {
    name: 'Laboratório & Análises (LIMS)',
    href: '/laboratorio',
    icon: FlaskConical,
    category: 'Assistencial'
  },
  {
    name: 'Censo Hospitalar & Leitos',
    href: '/leitos-censo',
    icon: BedDouble,
    category: 'Assistencial'
  },
  {
    name: 'Fintech Split & Contábil',
    href: '/financeiro-split',
    icon: CreditCard,
    badge: 'NFSe',
    badgeColor: 'bg-blue-50 text-[#1A56DB] border border-blue-200',
    category: 'Financeiro'
  },
  {
    name: 'Central n8n & WhatsApp Poli',
    href: '/automacao-mensageria',
    icon: MessageSquare,
    category: 'Automações'
  },
  {
    name: 'Hub de Ingestão & CSV',
    href: '/ingestao-modulos',
    icon: FileSpreadsheet,
    category: 'Geral'
  },
  {
    name: 'Blindagem & Auditoria RN-IND',
    href: '/arquitetura-seguranca',
    icon: ShieldCheck,
    category: 'Governança'
  }
];

interface VigiaSidebarLayoutProps {
  children: React.ReactNode;
  activeTitle?: string;
  activeSubtitle?: string;
  actions?: React.ReactNode;
}

export function VigiaSidebarLayout({
  children,
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 antialiased font-sans">
      {/* Backdrop para mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR LATERAL DO VIGIA SAÚDE */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Topo da Sidebar: Brand & Botão de Colapso */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            {/* Escudo Vigia Saúde */}
            <div className="w-10 h-10 flex-shrink-0 bg-[#1A56DB] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v4h4v2h-4v4h-2v-4H7v-2h4V7z" />
              </svg>
            </div>

            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    Vigia <span className="text-[#1A56DB]">Saúde</span>
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  Ecossistema Hospital 360
                </span>
              </div>
            )}
          </Link>

          {/* Botão de colapsar sidebar no desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Lista de Navegação com scroll suave */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Módulos do Ecossistema
            </div>
          )}

          {MODULOS_SISTEMA.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1A56DB] text-white shadow-sm shadow-blue-600/25'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#1A56DB]'
                  }`}
                />

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
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
        <div className="p-3 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-2 py-1.5'}`}>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-blue-200">
              CD
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Diretoria Clínica / CD</p>
                <p className="text-[10px] text-slate-400 truncate">Hospital Central 360</p>
              </div>
            )}
            {!collapsed && (
              <Link
                href="/login"
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
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
        {/* TOPBAR / HEADER SUPERIOR DO VIGIA */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hambúrguer para abrir sidebar no mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Título Ativo */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                  Vigia Saúde 360
                </span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {activeTitle || 'Hub Central de Gestão Hospitalar'}
                </h1>
              </div>
              {activeSubtitle && (
                <p className="text-[11px] text-slate-500 hidden md:block">
                  {activeSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Ações do Header (Notificações, Perfil, Ações Rápidas) */}
          <div className="flex items-center gap-3">
            {actions}

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Ver Todos os Módulos</span>
            </Link>

            <div className="h-5 w-px bg-slate-200" />

            {/* Sino de Notificações */}
            <div className="relative">
              <button
                className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                title="Notificações Operacionais"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              </button>
            </div>

            {/* Avatar do Usuário Conectado */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-9 h-9 rounded-xl bg-[#1A56DB] text-white font-black text-xs flex items-center justify-center shadow-sm">
                JS
              </div>
              <div className="hidden xl:block text-left leading-tight">
                <span className="text-xs font-bold text-slate-800 block">João Silva</span>
                <span className="text-[10px] text-slate-400 block">Gestor Hospitalar</span>
              </div>
            </div>
          </div>
        </header>

        {/* CORPO DO CONTEÚDO */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
