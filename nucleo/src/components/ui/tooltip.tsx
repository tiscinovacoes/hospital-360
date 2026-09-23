'use client';

import React, { useId, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  /** Texto do balão. */
  label: string;
  children: React.ReactElement<{ 'aria-describedby'?: string }>;
  className?: string;
}

/**
 * Tooltip acessível: abre no hover E no foco de teclado (Tab), fecha no blur/mouseleave/Esc.
 * O elemento filho recebe aria-describedby apontando para o balão, para leitores de tela.
 */
export function Tooltip({ label, children, className }: TooltipProps) {
  const [visivel, setVisivel] = useState(false);
  const id = useId();

  function mostrar() {
    setVisivel(true);
  }
  function esconder() {
    setVisivel(false);
  }

  const child = React.cloneElement(children, { 'aria-describedby': id });

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={mostrar}
      onMouseLeave={esconder}
      onFocus={mostrar}
      onBlur={esconder}
      onKeyDown={(e) => e.key === 'Escape' && esconder()}
    >
      {child}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap',
          'px-2.5 py-1 rounded-md bg-[#1B1F1C] text-white text-[11px] font-semibold',
          'transition-all duration-150 z-50 shadow-lg',
          visivel ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          className
        )}
      >
        {label}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1B1F1C]" />
      </span>
    </span>
  );
}
