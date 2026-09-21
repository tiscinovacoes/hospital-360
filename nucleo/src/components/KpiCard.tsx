'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
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
  icon: Icon,
  iconColor = 'text-[#1A56DB]',
  iconBg = 'bg-blue-50',
  tooltipInfo,
  trend,
}: KpiCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
      {/* Linha 1: Título e Ícone/Tooltip */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-500 truncate">{title}</span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {tooltipInfo && (
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-0.5"
                aria-label={`Informações sobre ${title}`}
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              {/* Tooltip flutuante minimalista */}
              {showTooltip && (
                <div className="absolute right-0 bottom-full mb-2 w-56 p-2.5 bg-slate-900 text-white text-[11px] leading-snug rounded-xl shadow-xl z-50 animate-fadeIn pointer-events-none">
                  {tooltipInfo}
                  <div className="absolute top-full right-2 border-4 border-transparent border-t-slate-900" />
                </div>
              )}
            </div>
          )}

          {Icon && (
            <span className={`w-8 h-8 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
              <Icon className="w-4 h-4" />
            </span>
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
                ? 'text-emerald-600 font-bold'
                : 'text-slate-500'
            }
          >
            {trend.text}
          </span>
        ) : subtitle ? (
          <span className="text-slate-400">{subtitle}</span>
        ) : null}
      </div>
    </div>
  );
}
