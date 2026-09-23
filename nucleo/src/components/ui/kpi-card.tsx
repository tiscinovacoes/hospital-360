'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KpiCardProps {
  label: string;
  /** Valor a exibir. Se for um inteiro puro (ex: "12"), anima em contagem; caso
   *  contrário (ex: "87%", "R$ 812k") apenas revela suavemente (fade + slide). */
  valor: string;
  delta?: string;
  trend?: 'up' | 'down';
  /** Cor de acento opcional (tarja de 3px no topo — ex: cor da categoria). */
  accentColor?: string;
  className?: string;
}

function useCountUp(valorFinal: string, ativo: boolean) {
  const numero = Number(valorFinal);
  const isInteiroPuro = /^\d+$/.test(valorFinal);
  const [exibido, setExibido] = useState(isInteiroPuro ? 0 : null);

  useEffect(() => {
    if (!isInteiroPuro || !ativo) return;

    const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzMovimento) {
      setExibido(numero);
      return;
    }

    const duracao = 700;
    const inicio = performance.now();
    let frame: number;

    function tick(agora: number) {
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const easeOut = 1 - Math.pow(1 - progresso, 3);
      setExibido(Math.round(easeOut * numero));
      if (progresso < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, valorFinal]);

  if (!isInteiroPuro) return null;
  return exibido;
}

export function KpiCard({ label, valor, delta, trend = 'up', accentColor, className }: KpiCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisivel(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const contagem = useCountUp(valor, visivel);
  const valorExibido = contagem !== null ? contagem : valor;

  return (
    <div ref={ref} className={cn('bg-white rounded-xl border border-[color:var(--color-border)] overflow-hidden', className)}>
      {accentColor && <div className="h-[3px]" style={{ backgroundColor: accentColor }} aria-hidden="true" />}
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-foreground-subtle)]">{label}</p>
        <p
          className={cn(
            'font-display font-semibold text-2xl sm:text-3xl text-[color:var(--color-foreground)] mt-1 transition-opacity duration-300',
            visivel ? 'opacity-100' : 'opacity-0'
          )}
        >
          {valorExibido}
        </p>
        {delta && (
          <p
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-semibold mt-1',
              trend === 'up' ? 'text-[color:var(--color-action)]' : 'text-[color:var(--color-critical)]'
            )}
          >
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {delta}
          </p>
        )}
      </div>
    </div>
  );
}
