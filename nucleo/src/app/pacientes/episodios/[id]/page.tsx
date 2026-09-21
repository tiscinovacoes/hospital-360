import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';
import { exigirContextoUsuario } from '@/lib/contexto-usuario';
import { fecharEpisodio, lancarEventoManual } from '../../actions';
import { registrarConsumo } from '@/app/atividades/actions';

function formatBRL(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function EpisodioDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, tenant } = await exigirContextoUsuario();

  const { data: episodio } = await supabase
    .from('episodios')
    .select('id, tipo, cid, status, data_abertura, data_fechamento, pacientes(id, nome, pid)')
    .eq('id', id)
    .maybeSingle();

  if (!episodio) notFound();

  const paciente = Array.isArray(episodio.pacientes) ? episodio.pacientes[0] : episodio.pacientes;

  const { data: eventos } = await supabase
    .from('eventos_custo')
    .select('id, tipo, valor, origem_modulo, centro_custo_id, timestamp')
    .eq('episodio_id', id)
    .order('timestamp');

  const { data: centros } = await supabase.from('centros_custo').select('id, nome');

  const { data: custoResult } = await supabase.rpc('custo_total_episodio', {
    p_episodio_id: id,
  });
  const custo = Array.isArray(custoResult) ? custoResult[0] : custoResult;

  const { data: atividadesDisponiveis } = await supabase
    .from('atividades_criticas')
    .select('id, nome, unidade_medida, centro_custo_id')
    .order('nome');

  const { data: consumosAtuais } = await supabase
    .from('atividade_consumos')
    .select('id, quantidade, atividades_criticas(nome, unidade_medida)')
    .eq('episodio_id', id);

  const { data: comparacaoAbc } = await supabase.rpc('comparar_abc_absorcao', {
    p_episodio_id: id,
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <NavHeader tenantNome={tenant?.nome ?? ''} active="/pacientes" />

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div>
          <Link href={`/pacientes/${paciente?.id}`} className="text-sm text-slate-500 underline">
            ← {paciente?.nome}
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">
            Episódio {episodio.tipo} {episodio.cid && `· ${episodio.cid}`}
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Custo direto</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatBRL(Number(custo?.custo_direto ?? 0))}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Custo rateado</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatBRL(Number(custo?.custo_rateado ?? 0))}
            </p>
          </div>
          <div className="rounded-lg border-2 border-slate-900 bg-white p-4">
            <p className="text-xs text-slate-500">Custo total</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {formatBRL(Number(custo?.custo_total ?? 0))}
            </p>
          </div>
        </div>

        {episodio.status === 'ABERTO' && (
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-medium text-slate-700">Lançar evento de custo</h2>
            <form action={lancarEventoManual} className="mt-3 flex flex-wrap items-end gap-3">
              <input type="hidden" name="episodio_id" value={episodio.id} />
              <div>
                <label className="block text-xs font-medium text-slate-600">Centro de custo</label>
                <select
                  name="centro_custo_id"
                  required
                  className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {(centros ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Tipo</label>
                <input
                  name="tipo"
                  required
                  placeholder="Ex: CONSULTA, EXAME, MEDICAMENTO"
                  className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="valor"
                  required
                  className="mt-1 w-28 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Lançar
              </button>
            </form>

            <form action={fecharEpisodio} className="mt-4">
              <input type="hidden" name="episodio_id" value={episodio.id} />
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Fechar episódio
              </button>
            </form>
          </div>
        )}

        <section>
          <h2 className="text-sm font-medium text-slate-700">
            Eventos de custo ({(eventos ?? []).length})
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Centro</th>
                  <th className="px-4 py-2">Origem</th>
                  <th className="px-4 py-2">Valor</th>
                  <th className="px-4 py-2">Quando</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(eventos ?? []).map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2">{e.tipo}</td>
                    <td className="px-4 py-2 text-slate-500">
                      {(centros ?? []).find((c) => c.id === e.centro_custo_id)?.nome ??
                        e.centro_custo_id}
                    </td>
                    <td className="px-4 py-2 text-slate-500">{e.origem_modulo}</td>
                    <td className="px-4 py-2 font-medium">{formatBRL(Number(e.valor))}</td>
                    <td className="px-4 py-2 text-slate-500">
                      {new Date(e.timestamp).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {(eventos ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      Nenhum evento lançado ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {(atividadesDisponiveis ?? []).length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-slate-700">
              ABC — atividades em centros críticos
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Compara o custo por absorção simples (fração igual do centro entre os episódios)
              com o custo direcionado pela atividade consumida.
            </p>

            {episodio.status === 'ABERTO' && (
              <form action={registrarConsumo} className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <input type="hidden" name="episodio_id" value={episodio.id} />
                <div>
                  <label className="block text-xs font-medium text-slate-600">Atividade</label>
                  <select
                    name="atividade_id"
                    required
                    className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    {(atividadesDisponiveis ?? []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome} ({a.unidade_medida})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">Quantidade</label>
                  <input
                    type="number"
                    step="0.01"
                    name="quantidade"
                    required
                    className="mt-1 w-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  Registrar consumo
                </button>
              </form>
            )}

            {(consumosAtuais ?? []).length > 0 && (
              <ul className="mt-3 text-sm text-slate-600">
                {(consumosAtuais ?? []).map((c) => {
                  const a = Array.isArray(c.atividades_criticas)
                    ? c.atividades_criticas[0]
                    : c.atividades_criticas;
                  return (
                    <li key={c.id}>
                      {a?.nome}: {c.quantidade} {a?.unidade_medida}
                    </li>
                  );
                })}
              </ul>
            )}

            {(comparacaoAbc ?? []).length > 0 && (
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Atividade</th>
                      <th className="px-4 py-2">Qtd. consumida</th>
                      <th className="px-4 py-2">Custo/unidade (ABC)</th>
                      <th className="px-4 py-2">Custo ABC</th>
                      <th className="px-4 py-2">Absorção simples</th>
                      <th className="px-4 py-2">Diferença</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(comparacaoAbc ?? []).map(
                      (
                        r: {
                          atividade_nome: string;
                          quantidade_consumida: number;
                          custo_por_unidade_abc: number;
                          custo_abc: number;
                          custo_absorcao_simples_centro: number;
                          diferenca: number;
                        },
                        i: number
                      ) => (
                        <tr key={i}>
                          <td className="px-4 py-2 font-medium text-slate-900">
                            {r.atividade_nome}
                          </td>
                          <td className="px-4 py-2">{r.quantidade_consumida}</td>
                          <td className="px-4 py-2">{formatBRL(Number(r.custo_por_unidade_abc))}</td>
                          <td className="px-4 py-2 font-medium">{formatBRL(Number(r.custo_abc))}</td>
                          <td className="px-4 py-2">
                            {formatBRL(Number(r.custo_absorcao_simples_centro))}
                          </td>
                          <td
                            className={`px-4 py-2 font-medium ${
                              Number(r.diferenca) >= 0 ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {Number(r.diferenca) >= 0 ? '+' : ''}
                            {formatBRL(Number(r.diferenca))}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
