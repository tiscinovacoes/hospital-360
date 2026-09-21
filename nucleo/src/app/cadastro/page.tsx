import Link from 'next/link';
import { cadastrar } from './actions';

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0C111D] px-4 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-[#1A244A]/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center">
          {/* Logo AIVIQ Icon */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-red-500 p-1 shadow-lg shadow-blue-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0C111D]">
              <div className="h-4 w-4 rounded-full bg-white shadow-inner"></div>
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-wider text-white">AIVIQ SAÚDE</h1>
          <p className="mt-1 text-xs font-medium text-blue-400 uppercase tracking-widest">
            Inteligência que transforma visão em decisões
          </p>
          <p className="mt-3 text-sm text-slate-300">Cadastrar Nova Secretaria de Saúde</p>
        </div>

        {erro && (
          <p className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">{erro}</p>
        )}

        <form action={cadastrar} className="mt-6 space-y-4">
          <div>
            <label htmlFor="tenant_nome" className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
              Nome da Secretaria / Município
            </label>
            <input
              id="tenant_nome"
              name="tenant_nome"
              type="text"
              required
              placeholder="Secretaria Municipal de Saúde de Vinhedo"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0C111D]/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Se já existir uma secretaria com este nome, você entra como novo operador dela.
            </p>
          </div>
          <div>
            <label htmlFor="nome_completo" className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
              Nome completo do operador
            </label>
            <input
              id="nome_completo"
              name="nome_completo"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0C111D]/80 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
              E-mail corporativo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0C111D]/80 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
              Senha de acesso
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-[#0C111D]/80 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-500 hover:to-purple-500"
          >
            Cadastrar Secretaria na AIVIQ
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Já tem acesso?{' '}
          <Link href="/login" className="font-semibold text-blue-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
