import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { concluirCadastro } from './actions';

export default async function CompletarCadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const metadata = user.user_metadata as {
    nome_completo?: string;
    tenant_nome?: string;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Quase lá</h1>
        <p className="mt-1 text-sm text-slate-500">
          Confirme os dados pra vincular seu acesso à secretaria.
        </p>

        {erro && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>
        )}

        <form action={concluirCadastro} className="mt-6 space-y-4">
          <div>
            <label htmlFor="tenant_nome" className="block text-sm font-medium text-slate-700">
              Nome da secretaria/município
            </label>
            <input
              id="tenant_nome"
              name="tenant_nome"
              type="text"
              required
              defaultValue={metadata.tenant_nome ?? ''}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="nome_completo" className="block text-sm font-medium text-slate-700">
              Seu nome completo
            </label>
            <input
              id="nome_completo"
              name="nome_completo"
              type="text"
              required
              defaultValue={metadata.nome_completo ?? ''}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Concluir cadastro
          </button>
        </form>
      </div>
    </main>
  );
}
