'use client';

import React from 'react';
import Link from 'next/link';
import { UserSwitcher } from './UserSwitcher';
import { Shield, Sparkles } from 'lucide-react';

export function HospitalNav() {
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Escudo Oficial conforme IDENTIDADE_VISUAL (1).md */}
          <div className="w-10 h-10 flex-shrink-0 transition-transform group-hover:scale-105">
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
              {/* Escudo */}
              <path
                d="M20 3L5 9v11c0 8.3 6.4 16.1 15 18 8.6-1.9 15-9.7 15-18V9L20 3z"
                fill="#1A56DB"
              />
              {/* Cruz da saúde */}
              <rect x="17" y="12" width="6" height="16" rx="1" fill="white" />
              <rect x="12" y="17" width="16" height="6" rx="1" fill="white" />
              {/* Ponto IA */}
              <circle cx="29" cy="11" r="4" fill="#0E9F6E" />
              <path
                d="M28 11h2M29 10v2"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-[#111928] group-hover:text-[#1A56DB] transition-colors">
                Hospital <span className="text-[#1A56DB]">360</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EBF0FB] text-[#1A56DB] border border-[#BFDBFE]">
                Vigia Saúde
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] hidden sm:block">
              Ecossistema de Gestão para Condomínio Hospitalar
            </p>
          </div>
        </Link>

        {/* Right Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Menu de Telas do Sistema (Beatriz Brandão UX Master) */}
          <div className="relative group">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-all shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Telas do Sistema 360</span>
            </button>

            {/* Dropdown Menu com todas as telas da UX Master */}
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 hidden group-hover:block z-50 animate-fadeIn">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Protótipos Oficiais (UX Master)
              </div>
              <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                <span>📊</span> Custo Door-to-Door (Dashboard)
              </Link>
              <Link href="/gestao-clinica" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                <span>🩺</span> Consultório &amp; Clínicas (OpenEMR)
              </Link>
              <Link href="/farmacia-estoque" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600">
                <span>💊</span> Farmácia &amp; Estoque FEFO
              </Link>
              <Link href="/laboratorio" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-600">
                <span>🧪</span> Laboratório de Análises (LIMS)
              </Link>
              <Link href="/leitos-censo" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                <span>🛏️</span> Censo Hospitalar &amp; Leitos
              </Link>
              <Link href="/tarefas" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600">
                <span>📱</span> App Móvel de Tarefas (QR Code)
              </Link>
              <Link href="/financeiro-split" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600">
                <span>💳</span> Fintech Split &amp; Faturamento
              </Link>
              <Link href="/automacao-mensageria" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600">
                <span>⚡</span> Central n8n &amp; WhatsApp Poli
              </Link>
              <Link href="/ingestao-modulos" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                <span>📥</span> Hub Ingestão &amp; Templates CSV
              </Link>
              <Link href="/compras-publicas" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 border-t border-slate-100">
                <span>🏛️</span> Compras Públicas &amp; Atas ARP
              </Link>
              <Link href="/estoque-central" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700">
                <span>🏢</span> Estoque Central &amp; CD Vigia
              </Link>
              <Link href="/escala-medica" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-700">
                <span>👨‍⚕️</span> Escala Médica &amp; Plantonistas
              </Link>
              <Link href="/arquitetura-seguranca" className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-t border-slate-100">
                <span>🛡️</span> Arquitetura &amp; Blindagem RN-IND
              </Link>
            </div>
          </div>

          <div className="h-6 w-px bg-[#E5E7EB]" />

          {/* Troca de usuário de demonstração */}
          <UserSwitcher />
        </div>
      </div>
    </nav>
  );
}
