'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ModuloCategoria } from './ModuloLayoutShell';

export interface MenuLateralItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  /** Classes Tailwind completas para o badge (bg + texto + borda). Se omitido, usa o tom neutro padrão. */
  badgeCor?: string;
}

const CATEGORIA_COR: Record<ModuloCategoria, string> = {
  SUPRIMENTOS: '#4E9B8A',
  ASSISTENCIAL: '#5B84B1',
  OPERACAO: '#C99A4A',
  FINANCEIRO: '#7C93A3',
};

export interface ModuloMenuLateralProps {
  /** Ex.: "Compras & Atas" — vira "MENU DE COMPRAS & ATAS". */
  titulo: string;
  categoria: ModuloCategoria;
  itens: MenuLateralItem[];
  ativoId: string;
  onSelect: (id: string) => void;
  /** Estado do drawer no mobile. */
  aberto: boolean;
  onFechar: () => void;
}

/**
 * Menu lateral interno de módulo — padrão v2.1 (ver IDENTIDADE_VISUAL (1).md § 2.1 e § 8).
 * Substitui as implementações ad-hoc duplicadas em cada page.tsx (que causaram o bug de
 * degradê encontrado no rollout). Fundo sólido com tom de categoria em baixa opacidade
 * (nunca degradê); item ativo em tinta sólida (não na cor de categoria, que fica reservada
 * pra identidade — dot/label/badge), consistente com o VigiaSidebarLayout global.
 */
export function ModuloMenuLateral({
  titulo,
  categoria,
  itens,
  ativoId,
  onSelect,
  aberto,
  onFechar,
}: ModuloMenuLateralProps) {
  const cor = CATEGORIA_COR[categoria];

  return (
    <>
      {aberto && (
        <div
          onClick={onFechar}
          className="fixed inset-0 bg-[#1B1F1C]/20 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-30
          ${aberto ? 'translate-x-0 w-72 lg:w-64 shadow-xl lg:shadow-none' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:hidden'}
          shrink-0 border-r flex flex-col justify-between transition-all duration-200 ease-in-out
        `}
        style={{ backgroundColor: `${cor}0F`, borderColor: `${cor}59` }}
      >
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div
            className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider"
            style={{ color: cor }}
          >
            Menu de {titulo}
          </div>

          {itens.map((item) => {
            const Icone = item.icon;
            const ativo = ativoId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) onFechar();
                }}
                className={`w-full min-h-[44px] sm:min-h-[38px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0E5C4C] ${
                  ativo
                    ? 'bg-[#1B1F1C] text-white font-bold shadow-sm'
                    : 'text-[#1B1F1C]/75 hover:bg-white/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icone className={`w-4 h-4 shrink-0 transition-colors ${ativo ? 'text-white' : 'text-[#1B1F1C]/60'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                      ativo ? 'bg-white/20 text-white' : item.badgeCor || 'bg-[#1B1F1C]/[0.06] text-[#1B1F1C]/70 border border-[#1B1F1C]/12'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-2" style={{ borderColor: `${cor}30` }}>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-[#1B1F1C]/12 bg-white text-[#1B1F1C]/75 hover:text-[#1B1F1C] hover:bg-[#F6F3EC] text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Hub de Módulos</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
