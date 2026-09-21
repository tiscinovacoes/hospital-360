'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Shield, CheckCircle2, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 text-slate-800 antialiased font-sans">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-xl shadow-blue-500/5">
        {/* Barra de destaque superior */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1A56DB]" />

        <div className="flex flex-col items-center text-center">
          {/* Logo Vigia Saúde */}
          <div className="w-14 h-14 bg-[#1A56DB] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v4h4v2h-4v4h-2v-4H7v-2h4V7z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Vigia <span className="text-[#1A56DB]">Saúde</span>
          </h1>

          <p className="mt-1 text-xs font-extrabold uppercase tracking-widest text-[#1A56DB]">
            Ecossistema Hospital 360
          </p>

          <p className="mt-2 text-xs text-slate-500 max-w-xs">
            Acesso desimpedido à plataforma de gestão clínica, suprimentos e custos
          </p>
        </div>

        {/* Notificação de Acesso Livre */}
        <div className="mt-6 p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-slate-700">
          <CheckCircle2 className="w-4 h-4 text-[#1A56DB] flex-shrink-0" />
          <span>Acesso liberado: basta clicar no botão abaixo para entrar direto.</span>
        </div>

        {/* Formulário com Acesso em 1 Clique */}
        <form onSubmit={handleQuickLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
              E-mail corporativo (opcional)
            </label>
            <input
              id="email"
              name="email"
              type="text"
              placeholder="admin@hospital360.com.br"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">
              Senha de acesso (opcional)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#1A56DB] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
          </div>

          {/* Botão Principal de Entrada Imediata */}
          <button
            type="submit"
            className="w-full mt-2 rounded-2xl bg-[#1A56DB] hover:bg-blue-700 px-5 py-3.5 text-sm font-black text-white shadow-md shadow-blue-600/25 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Entrar no Sistema</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Link de Atalho Direto */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-400">
          <Link
            href="/"
            className="font-bold text-[#1A56DB] hover:underline flex items-center gap-1"
          >
            <span>Ir direto para o Hub de Módulos</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </main>
  );
}
