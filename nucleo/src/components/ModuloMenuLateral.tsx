'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIA_COR, MODULO_THEMES } from './ModuloLayoutShell';
import { ModuloLogo, ModuloLogoId, categoriaDoModulo } from './ModuloLogo';

export interface MenuLateralItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** `null` e ausente se equivalem: sem badge. */
  badge?: string | null;
  /** Classes Tailwind completas para o badge (bg + texto + borda). Se omitido, usa o tom neutro padrão. */
  badgeCor?: string;
}

export interface ModuloMenuLateralProps {
  /** Define logo, categoria e tag regulatória do cartão de identidade. */
  moduloId: ModuloLogoId;
  /** Nome curto exibido no cartão de identidade. Ex.: "Compras & Atas". */
  titulo: string;
  itens: MenuLateralItem[];
  ativoId: string;
  onSelect: (id: string) => void;
  /** Estado da gaveta no mobile. No desktop o painel fica sempre visível. */
  aberto: boolean;
  onFechar: () => void;
  /** Cartão opcional acima do "Voltar ao Hub" (status operacional do módulo). */
  rodape?: React.ReactNode;
}

/** `admin-perfis` não está no tema de módulos. */
const TAG_FORA_DO_TEMA: Partial<Record<ModuloLogoId, string>> = {
  'admin-perfis': 'LGPD / RBAC',
};

/**
 * Menu lateral de módulo — padrão único para todos os módulos
 * (IDENTIDADE_VISUAL (1).md § 4 "Menu lateral de módulo").
 *
 * Estrutura herdada da Escala Médica, ajustada ao guia v2.1:
 * - painel flutuante em cartão (raio 16px, teto do guia — não 24px);
 * - cartão de identidade no topo com a logo do módulo e a tag regulatória;
 * - item ativo em azul marca-forte #496C92 (a cor de categoria fica só na identidade);
 * - desktop: painel fixo abaixo do cabeçalho, sempre visível;
 * - mobile: gaveta flutuante, fechada por padrão.
 */
export function ModuloMenuLateral({
  moduloId,
  titulo,
  itens,
  ativoId,
  onSelect,
  aberto,
  onFechar,
  rodape,
}: ModuloMenuLateralProps) {
  const cor = CATEGORIA_COR[categoriaDoModulo(moduloId)];
  const tag = moduloId === 'admin-perfis' ? TAG_FORA_DO_TEMA[moduloId] : MODULO_THEMES[moduloId].tagRegulatoria;

  return (
    <>
      {aberto && (
        <div
          onClick={onFechar}
          className="fixed inset-0 z-40 bg-[#1B1F1C]/25 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label={`Menu de ${titulo}`}
        className={cn(
          'flex flex-col bg-white border border-[#1B1F1C]/12 rounded-2xl p-3',
          // Mobile: gaveta flutuante. `invisible` quando fechada tira os links
          // da ordem de tabulação, não só da tela.
          'fixed top-3 bottom-3 left-3 z-50 w-72 max-w-[calc(100vw-1.5rem)]',
          'shadow-[0_8px_24px_rgba(27,31,28,0.10),0_2px_8px_rgba(27,31,28,0.05)]',
          'transition-[transform,visibility] duration-200 ease-out',
          aberto ? 'visible translate-x-0' : 'invisible -translate-x-[calc(100%+1.5rem)]',
          // Desktop: painel fixo abaixo do cabeçalho (h-16 + 1rem de respiro).
          'lg:visible lg:translate-x-0 lg:sticky lg:top-20 lg:bottom-auto lg:left-auto lg:z-20',
          'lg:w-64 lg:h-[calc(100dvh-6rem)] lg:self-start lg:shrink-0 lg:ml-4 lg:mt-4',
          'lg:shadow-[0_1px_2px_rgba(27,31,28,0.05)]'
        )}
      >
        {/* Cartão de identidade do módulo */}
        <div className="relative flex items-center gap-3 p-3 rounded-xl bg-[#F6F3EC] border border-[#1B1F1C]/[0.08]">
          <ModuloLogo moduloId={moduloId} tamanho="md" />
          <div className="min-w-0 pr-8 lg:pr-0">
            <p className="font-display text-sm font-semibold text-[#1B1F1C] leading-tight truncate">{titulo}</p>
            {tag && (
              <span
                className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold text-[#1B1F1C]/75"
                style={{ backgroundColor: `${cor}1F`, borderColor: `${cor}59` }}
              >
                {tag}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar menu"
            className="lg:hidden absolute top-1.5 right-1.5 w-11 h-11 inline-flex items-center justify-center rounded-lg text-[#1B1F1C]/60 hover:text-[#1B1F1C] hover:bg-white/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Seções do módulo */}
        <nav className="mt-3 flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
          {itens.map((item) => {
            const Icone = item.icon;
            const ativo = ativoId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                aria-current={ativo ? 'page' : undefined}
                onClick={() => {
                  onSelect(item.id);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) onFechar();
                }}
                className={cn(
                  'w-full min-h-[44px] lg:min-h-[40px] flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C4C]',
                  ativo
                    ? 'bg-marca-forte text-white font-bold shadow-sm'
                    : 'text-[#1B1F1C]/75 font-semibold hover:bg-[#F6F3EC] hover:text-[#1B1F1C]'
                )}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icone
                    className={cn('w-4 h-4 shrink-0', ativo ? 'text-white' : 'text-[#1B1F1C]/55')}
                    strokeWidth={1.75}
                  />
                  <span className="line-clamp-2 leading-snug">{item.label}</span>
                </span>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0',
                      ativo
                        ? 'bg-white/20 text-white'
                        : item.badgeCor || 'bg-[#1B1F1C]/[0.06] text-[#1B1F1C]/70 border border-[#1B1F1C]/12'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Rodapé: status opcional + volta ao hub */}
        <div className="mt-3 pt-3 border-t border-[#1B1F1C]/[0.08] space-y-2">
          {rodape}
          <Link
            href="/"
            className="flex items-center gap-2 w-full min-h-[44px] lg:min-h-[40px] px-3 rounded-xl text-xs font-bold text-[#1B1F1C]/70 hover:text-[#1B1F1C] hover:bg-[#F6F3EC] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Voltar ao Hub de Módulos</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
