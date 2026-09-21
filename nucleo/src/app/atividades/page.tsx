import { NavHeader } from '@/components/NavHeader';
import { exigirContextoUsuario } from '@/lib/contexto-usuario';
import { criarAtividade } from './actions';

export default async function AtividadesPage() {
  const { supabase, tenant } = await exigirContextoUsuario();

  const { data: centrosCriticos } = await supabase
    .from('centros_custo')
    .select('id, nome')
    .eq('tipo', 'critico')
    .order('nome');

  const { data: atividades } = await supabase
    .from('atividades_criticas')
    .select('id, nome, direcionador, unidade_medida, centro_custo_id')
    .order('nome');

  return (
    <main className="min-h-screen bg-slate-50">
      <NavHeader tenantNome={tenant?.nome ?? ''} active="/atividades" />

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Atividades — ABC nos centros críticos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Direcionadores específicos (hora de ventilador, hora de sala cirúrgica...) que
            substituem o rateio simples nos centros do tipo <code>critico</code>.
          </p>
        </div>

        {(centrosCriticos ?? []).length === 0 && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Nenhum centro do tipo <code>critico</code> cadastrado ainda. Cadastre um em{' '}
            <a href="/centros-custo" className="underline">
              Centros de custo
            </a>{' '}
            (ex: UTI, Centro Cirúrgico) antes de definir atividades.
          </p>
        )}

        {(centrosCriticos ?? []).length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-medium text-slate-700">Nova atividade</h2>
            <form action={criarAtividade} className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Centro crítico</label>
                <select
                  name="centro_custo_id"
                  required
                  className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {(centrosCriticos ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Nome</label>
                <input
                  name="nome"
                  required
                  placeholder="Ex: Hora de ventilador"
                  className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Direcionador</label>
                <input
                  name="direcionador"
                  required
                  placeholder="Ex: HORA_VENTILADOR"
                  className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Unidade</label>
                <input
                  name="unidade_medida"
                  required
                  placeholder="hora"
                  className="mt-1 w-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Adicionar
              </button>
            </form>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Atividade</th>
                <th className="px-4 py-2">Centro</th>
                <th className="px-4 py-2">Direcionador</th>
                <th className="px-4 py-2">Unidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(atividades ?? []).map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 font-medium text-slate-900">{a.nome}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {(centrosCriticos ?? []).find((c) => c.id === a.centro_custo_id)?.nome ??
                      a.centro_custo_id}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{a.direcionador}</td>
                  <td className="px-4 py-2 text-slate-500">{a.unidade_medida}</td>
                </tr>
              ))}
              {(atividades ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Nenhuma atividade cadastrada ainda.
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
