'use client';

import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, X, AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RealTimeNotification() {
  const { recentToasts, dismissToast } = useNotifications();

  if (recentToasts.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mb-8 space-y-2.5 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex items-center justify-between px-1 text-xs font-semibold text-[#6B7280]">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A56DB] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A56DB]"></span>
          </span>
          <span className="uppercase tracking-wider">Eventos Cross-Módulo em Tempo Real</span>
        </div>
        <span className="text-[11px] text-[#9CA3AF]">Atualização contínua do Hub</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recentToasts.map((toast) => {
          let alertBorder = 'border-l-[#1A56DB] bg-[#EBF0FB] text-[#1E3A5F]';
          let icon = <Info className="w-4 h-4 text-[#1A56DB] flex-shrink-0 mt-0.5" />;

          if (toast.type === 'warning') {
            alertBorder = 'border-l-[#FACA15] bg-[#FEF9C3] text-[#92400E]';
            icon = <AlertTriangle className="w-4 h-4 text-[#C27803] flex-shrink-0 mt-0.5" />;
          } else if (toast.type === 'success') {
            alertBorder = 'border-l-[#0E9F6E] bg-[#D1FAE5] text-[#057A55]';
            icon = <CheckCircle2 className="w-4 h-4 text-[#0E9F6E] flex-shrink-0 mt-0.5" />;
          }

          return (
            <div
              key={toast.id}
              className={`p-3.5 rounded-lg border border-[#E5E7EB] border-l-4 shadow-sm flex items-start justify-between gap-3 relative transition-all hover:shadow-md ${alertBorder}`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {icon}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold leading-tight truncate">
                      {toast.title}
                    </h4>
                    <span className="text-[10px] opacity-75 whitespace-nowrap">
                      • {toast.time}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 opacity-90 line-clamp-2 leading-relaxed">
                    {toast.message}
                  </p>
                </div>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="opacity-50 hover:opacity-100 p-0.5 rounded transition-opacity"
                title="Dispensar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
