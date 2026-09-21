import Link from 'next/link';
import { logout } from '@/app/actions';

const LINKS = [
  { href: '/', label: 'Início' },
  { href: '/centros-custo', label: 'Centros de custo' },
  { href: '/rateio', label: 'Rateio' },
  { href: '/pacientes', label: 'Pacientes' },
  { href: '/relatorios', label: 'Relatórios' },
  { href: '/atividades', label: 'ABC' },
];

export function NavHeader({ tenantNome, active }: { tenantNome: string; active: string }) {
  return (
    <header className="border-b border-slate-800 bg-[#0C111D]/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo AIVIQ Icon */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-red-500 p-0.5 shadow-md">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0C111D]">
              <div className="h-3 w-3 rounded-full bg-white shadow-inner"></div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-wider text-white font-sans">AIVIQ</span>
              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">SAÚDE</span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">{tenantNome || 'Inteligência em Gestão Pública'}</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                active === link.href
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <form action={logout}>
            <button
              type="submit"
              className="ml-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            >
              Sair
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
