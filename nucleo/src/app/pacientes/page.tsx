import Link from 'next/link';
import { NavHeader } from '@/components/NavHeader';
import { exigirContextoUsuario } from '@/lib/contexto-usuario';
import { buscarPacientePorDocumento, criarPaciente } from './actions';

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { supabase, tenant } = await exigirContextoUsuario();
  const { erro } = await searchParams;

  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('id, pid, nome, cpf, nis, data_nascimento')
    .order('nome');

  return (
    <main className="min-h-screen bg-slate-50">
      <NavHeader tenantNome={tenant?.nome ?? ''} active="/pacientes" />

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Pacientes e episódios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Jornada do paciente identificada por CPF/NIS: cada evento de custo (farmácia, RH,
            agenda, leitos...) chega vinculado ao documento e acumula automaticamente no episódio
            aberto do paciente.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-medium text-slate-700">Buscar por CPF ou NIS</h2>
          {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
          <form action={buscarPacientePorDocumento} className="mt-3 flex items-end gap-3">
            <input
              name="documento"
              required
              placeholder="Só números"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Buscar jornada
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-medium text-slate-700">Novo paciente (cadastro manual)</h2>
          <p className="mt-1 text-xs text-slate-400">
            Normalmente o paciente é criado automaticamente quando um satélite envia o primeiro
            evento com CPF/NIS. Use isto só pra pré-cadastro.
          </p>
          <form action={criarPaciente} className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">PID</label>
              <input
                name="pid"
                required
                placeholder="PID-0001"
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Nome</label>
              <input
                name="nome"
                required
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">CPF</label>
              <input
                name="cpf"
                placeholder="Só números"
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">NIS</label>
              <input
                name="nis"
                placeholder="Só números"
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Data de nascimento</label>
              <input
                type="date"
                name="data_nascimento"
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Cadastrar
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">CPF</th>
                <th className="px-4 py-2">NIS</th>
                <th className="px-4 py-2">Nascimento</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(pacientes ?? []).map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {p.nome} <span className="text-slate-400">({p.pid})</span>
                  </td>
                  <td className="px-4 py-2 text-slate-500">{p.cpf ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-500">{p.nis ?? '—'}</td>
                  <td className="px-4 py-2 text-slate-500">{p.data_nascimento ?? '—'}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="text-sm font-medium text-slate-900 underline"
                    >
                      Ver jornada
                    </Link>
                  </td>
                </tr>
              ))}
              {(pacientes ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Nenhum paciente cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
