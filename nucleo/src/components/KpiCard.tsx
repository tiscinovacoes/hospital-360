'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

export type IconVariant = 'blue' | 'emerald' | 'amber' | 'indigo' | 'teal' | 'rose' | 'slate';

const VARIANT_MAP: Record<IconVariant, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-[#0E5C4C]/[0.08]', text: 'text-[#0E5C4C]', border: 'border-[#E0E0E0]' },
  emerald: { bg: 'bg-emerald-50', text: 'text-[#0E9F6E]', border: 'border-[#E0E0E0]' },
  amber: { bg: 'bg-amber-50', text: 'text-[#D97706]', border: 'border-[#E0E0E0]' },
  indigo: { bg: 'bg-indigo-50', text: 'text-[#4F46E5]', border: 'border-[#E0E0E0]' },
  teal: { bg: 'bg-teal-50', text: 'text-[#0D9488]', border: 'border-[#E0E0E0]' },
  rose: { bg: 'bg-rose-50', text: 'text-[#E02424]', border: 'border-[#E0E0E0]' },
  slate: { bg: 'bg-[#F5F5F5]', text: 'text-slate-700', border: 'border-[#E0E0E0]' },
};

/**
 * Padrão Unificado de Ícones para o Hospital 360:
 * Container quadrado com cantos arredondados, borda no limite #E0E0E0,
 * ícone centralizado com traço stroke-[1.8] e semântica de cores hospitalar.
 */
export function IconBadge({
  icon: Icon,
  variant = 'blue',
  customBg,
  customColor,
  size = 'md',
  className = '',
}: {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  variant?: IconVariant;
  customBg?: string;
  customColor?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (!Icon) return null;

  const style = VARIANT_MAP[variant] || VARIANT_MAP.blue;
  const bgClass = customBg || style.bg;
  const colorClass = customColor || style.text;
  const borderClass = style.border;

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
  }[size];

  const iconSizeClass = {
    sm: 'w-4 h-4 stroke-[1.8]',
    md: 'w-5 h-5 stroke-[1.8]',
    lg: 'w-6 h-6 stroke-[1.8]',
  }[size];

  return (
    <div
      className={`${sizeClasses} ${bgClass} ${colorClass} border ${borderClass} flex items-center justify-center shrink-0 shadow-2xs ${className}`}
    >
      {typeof Icon === 'function' ? (
        <Icon className={iconSizeClass} />
      ) : React.isValidElement(Icon) ? (
        Icon
      ) : null}
    </div>
  );
}

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  variant?: IconVariant;
  iconColor?: string;
  iconBg?: string;
  tooltipInfo?: string;
  trend?: {
    text: string;
    isPositive?: boolean;
    isAlert?: boolean;
  };
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'blue',
  iconColor,
  iconBg,
  tooltipInfo,
  trend,
}: KpiCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative bg-white rounded-2xl border border-[#E0E0E0] p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      {/* Linha 1: Título e Ícone Padronizado / Tooltip */}
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 flex-1 text-xs font-bold text-slate-500 uppercase tracking-wide truncate" title={title}>
          {title}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {tooltipInfo && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1 rounded-lg hover:bg-slate-100"
                aria-label={`Informações sobre ${title}`}
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              {/* Tooltip clean em escala de cinza suave (sem preto, max #E0E0E0) */}
              {showTooltip && (
                <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-white text-slate-800 text-[11px] leading-relaxed rounded-xl border border-[#E0E0E0] shadow-lg z-50 animate-fadeIn pointer-events-none">
                  <div className="font-bold text-slate-900 mb-0.5">{title}</div>
                  <div className="text-slate-600">{tooltipInfo}</div>
                  <div className="absolute top-full right-3 w-2 h-2 bg-white border-r border-b border-[#E0E0E0] rotate-45 -translate-y-1" />
                </div>
              )}
            </div>
          )}

          {/* Container Padronizado de Ícones de KPI */}
          {icon && (
            <IconBadge
              icon={icon}
              variant={variant}
              customBg={iconBg}
              customColor={iconColor}
              size="md"
            />
          )}
        </div>
      </div>

      {/* Linha 2: Valor Principal Numérico (Destaque Minimalista) */}
      <div className="mt-3">
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-none">
          {value}
        </span>
      </div>

      {/* Linha 3: Micro-subtítulo ou Trend (Máximo de 3 linhas visíveis) */}
      <div className="mt-2 text-[11px] font-semibold truncate">
        {trend ? (
          <span
            className={
              trend.isAlert
                ? 'text-rose-600 font-bold'
                : trend.isPositive
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500'
            }
          >
            {trend.text}
          </span>
        ) : subtitle ? (
          <span className="text-slate-500">{subtitle}</span>
        ) : null}
      </div>
    </div>
  );
}
