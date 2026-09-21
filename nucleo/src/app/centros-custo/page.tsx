import { NavHeader } from '@/components/NavHeader';
import { exigirContextoUsuario } from '@/lib/contexto-usuario';
import { criarBaseRateio, criarCentroCusto, definirQuantidadeDriver } from './actions';

const TIPOS = ['auxiliar', 'produtivo', 'critico'] as const;

export default async function CentrosCustoPage() {
  const { supabase, tenant } = await exigirContextoUsuario();

  const [{ data: bases }, { data: centros }, { data: matriz }] = await Promise.all([
    supabase.from('bases_rateio').select('id, nome, unidade_medida').order('nome'),
    supabase
      .from('centros_custo')
      .select('id, nome, tipo, base_rateio_distribuicao_id')
      .order('tipo')
      .order('nome'),
    supabase.from('matriz_rateio').select('centro_custo_id, base_rateio_id, quantidade'),
  ]);

  const matrizMap = new Map(
    (matriz ?? []).map((m) => [`${m.centro_custo_id}::${m.base_rateio_id}`, m.quantidade])
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <NavHeader tenantNome={tenant?.nome ?? ''} active="/centros-custo" />

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Centros de custo</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cadastre centros auxiliares e produtivos, defina bases de rateio (drivers) e a
            quantidade de cada driver por centro.
          </p>
        </div>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-medium text-slate-700">Nova base de rateio</h2>
            <form action={criarBaseRateio} className="mt-3 space-y-3">
              <input
                name="nome"
                required
                placeholder="Ex: Nº de funcionários"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="unidade_medida"
                required
                placeholder="Ex: funcionarios, m2, kwh, kg"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Adicionar base
              </button>
            </form>

            <ul className="mt-4 space-y-1 text-sm text-slate-600">
              {(bases ?? []).map((b) => (
                <li key={b.id}>
                  {b.nome} <span className="text-slate-400">({b.unidade_medida})</span>
                </li>
              ))}
              {(bases ?? []).length === 0 && (
                <li className="text-slate-400">Nenhuma base cadastrada ainda.</li>
              )}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-medium text-slate-700">Novo centro de custo</h2>
            <form action={criarCentroCusto} className="mt-3 space-y-3">
              <input
                name="id"
                required
                placeholder="Código (ex: CC-08)"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase"
              />
              <input
                name="nome"
                required
                placeholder="Nome do centro"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                name="tipo"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                name="base_rateio_distribuicao_id"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Driver de distribuição (só p/ auxiliar)</option>
                {(bases ?? []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nome}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Adicionar centro
              </button>
            </form>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-slate-700">
            Centros cadastrados ({(centros ?? []).length})
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Centro</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Driver próprio</th>
                  {(bases ?? []).map((b) => (
                    <th key={b.id} className="px-4 py-2">
                      {b.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(centros ?? []).map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {c.id} — {c.nome}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{c.tipo}</td>
                    <td className="px-4 py-2 text-slate-500">
                      {(bases ?? []).find((b) => b.id === c.base_rateio_distribuicao_id)?.nome ??
                        '—'}
                    </td>
                    {(bases ?? []).map((b) => (
                      <td key={b.id} className="px-4 py-2">
                        <form action={definirQuantidadeDriver} className="flex items-center gap-1">
                          <input type="hidden" name="centro_custo_id" value={c.id} />
                          <input type="hidden" name="base_rateio_id" value={b.id} />
                          <input
                            type="number"
                            step="0.01"
                            name="quantidade"
                            defaultValue={matrizMap.get(`${c.id}::${b.id}`) ?? ''}
                            placeholder="0"
                            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs"
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                          >
                            ✓
                          </button>
                        </form>
                      </td>
                    ))}
                  </tr>
                ))}
                {(centros ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3 + (bases ?? []).length} className="px-4 py-6 text-center text-slate-400">
                      Nenhum centro cadastrado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
