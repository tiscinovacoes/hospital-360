'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  LogOut,
  Layers,
  UserCog
} from 'lucide-react';
import { CATEGORIA_COR, CATEGORIA_COR_FORTE, ModuloId, MODULO_THEMES } from './ModuloLayoutShell';
import { ModuloLogo, ModuloLogoId, categoriaDoModulo } from './ModuloLogo';

interface NavItem {
  id: ModuloId | 'home' | 'admin-perfis';
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
  },
  {
    id: 'admin-perfis',
    name: 'Perfis & Acessos (RBAC)',
    href: '/admin/perfis-acessos',
    icon: UserCog,
    badge: 'LGPD/RBAC',
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
  const isHomePage = pathname === '/';

  // Módulo atual: pela prop ou pelo href do registro. Casar pelo href (e não
  // pelo id) cobre rotas aninhadas como /admin/perfis-acessos. Antes, rota sem
  // correspondência caía em "compras-publicas" e mostrava a tag errada.
  const moduloAtual = React.useMemo(() => {
    if (moduloId) return MODULOS_SISTEMA.find((m) => m.id === moduloId);
    return MODULOS_SISTEMA.find(
      (m) => m.href !== '/' && (pathname === m.href || pathname?.startsWith(`${m.href}/`))
    );
  }, [moduloId, pathname]);

  const logoId = moduloAtual && moduloAtual.id !== 'home' ? (moduloAtual.id as ModuloLogoId) : null;
  const tema = logoId && logoId in MODULO_THEMES ? MODULO_THEMES[logoId as keyof typeof MODULO_THEMES] : null;
  const tagModulo = tema?.tagRegulatoria ?? (logoId === 'admin-perfis' ? 'LGPD / RBAC' : undefined);
  const corCategoria = logoId ? CATEGORIA_COR[categoriaDoModulo(logoId)] : null;
  // Avatar: tom forte da categoria dentro do módulo, azul da marca no hub.
  const corAvatar = logoId ? CATEGORIA_COR_FORTE[categoriaDoModulo(logoId)] : undefined;
  const tituloAtual =
    activeTitle || tema?.nome || moduloAtual?.name || 'Hub de Módulos & Catálogo de Soluções';

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex flex-col text-[#1B1F1C] antialiased font-sans">
      {/* HEADER SUPERIOR UNIFICADO DE PONTA A PONTA */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#1B1F1C]/12 sticky top-0 z-30 flex-shrink-0">
        <div
          className={`h-full flex items-center justify-between gap-2 sm:gap-3 ${
            isHomePage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'px-3 sm:px-4'
          }`}
        >
          <div
            className={`flex items-center gap-2 sm:gap-3 flex-1 ${
              logoId ? 'min-w-[8.5rem] sm:min-w-[13rem] lg:min-w-[20rem]' : 'min-w-0'
            }`}
          >
            {/* Brand Vigia Saúde 360 */}
            <Link
              href="/"
              className={`items-center gap-2.5 group cursor-pointer shrink-0 ${logoId ? 'hidden sm:flex' : 'flex'}`}
              title="Ir para o Hub de Módulos"
            >
              <div className="w-9 h-9 flex-shrink-0 bg-marca rounded-xl flex items-center justify-center text-[#F6F3EC] shadow-sm group-hover:bg-marca-hover transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v4h4v2h-4v4h-2v-4H7v-2h4V7z" />
                </svg>
              </div>
              <div className={`${logoId ? 'hidden lg:flex' : 'hidden sm:flex'} flex-col leading-tight`}>
                <span className="font-display font-bold text-sm tracking-tight text-[#1B1F1C]">
                  Vigia <span className="text-[#0E5C4C]">Saúde 360</span>
                </span>
              </div>
            </Link>

            {/* Separador + identidade do módulo: logo, título e tag regulatória */}
            <span className="hidden sm:block h-6 w-px bg-[#1B1F1C]/12 shrink-0" aria-hidden="true" />

            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              {logoId && <ModuloLogo moduloId={logoId} tamanho="sm" />}

              <h1 className="text-xs sm:text-sm font-bold text-[#1B1F1C] truncate">{tituloAtual}</h1>

              {tagModulo && corCategoria && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border hidden xl:inline-flex shrink-0 text-[#1B1F1C]/75"
                  style={{ backgroundColor: `${corCategoria}1F`, borderColor: `${corCategoria}59` }}
                >
                  {tagModulo}
                </span>
              )}

              {isHomePage && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 hidden sm:inline-flex shrink-0">
                  Módulos Independentes
                </span>
              )}
            </div>
          </div>

          {/* Ações da página: faixa própria que encolhe e rola na horizontal.
              Sem isto, botões de ação longos empurram o header para além da
              viewport e provocam scroll horizontal na página inteira no mobile. */}
          {actions && (
            <div className="flex items-center gap-2 min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {actions}
            </div>
          )}

          {/* Ações fixas do produto (Hub, Notificações, Perfil) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!isHomePage && (
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-2.5 lg:px-3 py-2 min-h-[44px] min-w-[44px] rounded-xl bg-white hover:bg-[#F6F3EC] text-[#1B1F1C]/75 hover:text-[#1B1F1C] text-xs font-bold border border-[#1B1F1C]/12 transition-all shadow-2xs shrink-0"
                title="Abrir o Hub de Módulos em nova aba"
                aria-label="Abrir o Hub de Módulos em nova aba"
              >
                <Layers className="w-4 h-4 text-[#0E5C4C] shrink-0" />
                <span className="hidden lg:inline">Ver Módulos</span>
              </Link>
            )}

            <div className="h-5 w-px bg-[#1B1F1C]/12 hidden sm:block" />

            {/* Sino de Notificações com touch target 44px */}
            <div className="relative">
              <button
                className="w-10 h-10 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-xl bg-white hover:bg-[#F6F3EC] border border-[#1B1F1C]/12 text-[#1B1F1C]/70 flex items-center justify-center transition-colors cursor-pointer"
                title="Notificações Operacionais"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#9C3B2E] ring-2 ring-white animate-pulse" />
              </button>
            </div>

            {/* Avatar do Usuário Conectado */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2">
              <div className="w-9 h-9 min-w-[36px] min-h-[36px] sm:w-10 sm:h-10 rounded-xl bg-marca-forte text-white font-black text-xs flex items-center justify-center shadow-sm"
                style={corAvatar ? { backgroundColor: corAvatar } : undefined}
              >
                JS
              </div>
              <div className="hidden xl:block text-left leading-tight">
                <span className="text-xs font-bold text-[#1B1F1C] block">João Silva</span>
                <span className="text-[10px] text-[#1B1F1C]/45 block">Gestor Hospitalar</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO PRINCIPAL — LARGURA TOTAL PARA OS MÓDULOS TEREM SEU MENU LATERAL ÚNICO */}
      <main className={`flex-1 flex flex-col min-w-0 ${isHomePage ? 'max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8' : 'w-full'}`}>
        {children}
      </main>
    </div>
  );
}
