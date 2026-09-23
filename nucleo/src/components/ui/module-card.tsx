import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModuleCategoria = 'SUPRIMENTOS' | 'ASSISTENCIAL' | 'OPERACAO' | 'FINANCEIRO';

/** Cores de categoria v2.1 — ver IDENTIDADE_VISUAL (1).md § 2.1. */
const CATEGORIA_COR: Record<ModuleCategoria, string> = {
  SUPRIMENTOS: '#4E9B8A',
  ASSISTENCIAL: '#5B84B1',
  OPERACAO: '#C99A4A',
  FINANCEIRO: '#7C93A3',
};

const CATEGORIA_LABEL: Record<ModuleCategoria, string> = {
  SUPRIMENTOS: 'Suprimentos & Atas',
  ASSISTENCIAL: 'Clínico & Assistencial',
  OPERACAO: 'Pessoas & Operação',
  FINANCEIRO: 'Financeiro & Governança',
};

export interface ModuleCardProps {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  categoria: ModuleCategoria;
  tag?: string;
  metricas?: string;
  href: string;
  icone?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function ModuleCard({
  titulo,
  subtitulo,
  descricao,
  categoria,
  metricas,
  href,
  icone: Icone,
  className,
}: ModuleCardProps) {
  const cor = CATEGORIA_COR[categoria];

  return (
    <Link
      href={href}
      className={cn(
        'group bg-white rounded-xl border border-[rgba(27,31,28,.12)] p-5 flex flex-col justify-between',
        'hover:border-[rgba(27,31,28,.30)] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C4C] focus-visible:ring-offset-2',
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2">
            <span className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ backgroundColor: cor }} aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[rgba(27,31,28,.45)]">
              {CATEGORIA_LABEL[categoria]}
            </span>
          </span>
          {Icone ? (
            <Icone className="w-4 h-4 text-[rgba(27,31,28,.25)] flex-shrink-0" />
          ) : (
            <ArrowUpRight className="w-3.5 h-3.5 text-[rgba(27,31,28,.25)] group-hover:text-[rgba(27,31,28,.5)] transition-colors flex-shrink-0" />
          )}
        </div>

        <h3 className="font-display font-semibold text-[17px] text-[#1B1F1C] mt-3.5 leading-snug text-pretty">
          {titulo}
        </h3>
        <p className="text-xs font-semibold text-[rgba(27,31,28,.45)] mt-0.5">{subtitulo}</p>
        <p className="text-xs text-[rgba(27,31,28,.70)] mt-2.5 leading-relaxed line-clamp-2">{descricao}</p>
      </div>

      <div className="mt-4 pt-3.5 border-t border-[rgba(27,31,28,.08)] flex items-center justify-between text-xs">
        {metricas ? (
          <span className="text-[11px] font-bold" style={{ color: cor }}>
            {metricas}
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 font-bold text-[#1B1F1C]">
          Acessar <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
