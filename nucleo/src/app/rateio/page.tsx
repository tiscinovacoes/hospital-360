import { NavHeader } from '@/components/NavHeader';
import { exigirContextoUsuario } from '@/lib/contexto-usuario';
import { rodarRateio } from './actions';

function formatBRL(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function RateioPage() {
  const { supabase, tenant } = await exigirContextoUsuario();

  const { data: ultimaExecucao } = await supabase
    .from('execucoes_rateio')
    .select('id, periodo_inicio, periodo_fim, executado_em')
    .order('executado_em', { ascending: false })
    .limit(1)
    .maybeSingle();

  let resultados: {
    centro_custo_origem_id: string;
    centro_custo_destino_id: string;
    custo_total_origem: number;
    proporcao: number;
    valor_rateado: number;
  }[] = [];

  if (ultimaExecucao) {
    const { data } = await supabase
      .from('rateio_resultados')
      .select(
        'centro_custo_origem_id, centro_custo_destino_id, custo_total_origem, proporcao, valor_rateado'
      )
      .eq('execucao_id', ultimaExecucao.id)
      .order('centro_custo_origem_id');
    resultados = data ?? [];
  }

  const { data: centros } = await supabase.from('centros_custo').select('id, nome');
  const nomeCentro = (id: string) => centros?.find((c) => c.id === id)?.nome ?? id;

  const totalPorDestino = resultados.reduce<Record<string, number>>((acc, r) => {
    acc[r.centro_custo_destino_id] = (acc[r.centro_custo_destino_id] ?? 0) + r.valor_rateado;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-slate-50">
      <NavHeader tenantNome={tenant?.nome ?? ''} active="/rateio" />

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Motor de absorção</h1>
          <p className="mt-1 text-sm text-slate-500">
            Soma o custo direto de cada centro auxiliar no período e distribui pros centros
            produtivos/críticos, proporcional ao driver configurado.
          </p>
        </div>

        <form action={rodarRateio} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-5">
          <div>
            <label className="block text-xs font-medium text-slate-600">Período — início</label>
            <input
              type="date"
              name="periodo_inicio"
              required
              className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Período — fim</label>
            <input
              type="date"
              name="periodo_fim"
              required
              className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Rodar rateio
          </button>
        </form>

        {ultimaExecucao && (
          <section>
            <h2 className="text-sm font-medium text-slate-700">
              Última execução: {ultimaExecucao.periodo_inicio} a {ultimaExecucao.periodo_fim}
            </h2>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {Object.entries(totalPorDestino).map(([destinoId, total]) => (
                <div key={destinoId} className="rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">{nomeCentro(destinoId)}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{formatBRL(total)}</p>
                  <p className="text-xs text-slate-400">recebido via rateio</p>
                </div>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Origem (auxiliar)</th>
                    <th className="px-4 py-2">Destino</th>
                    <th className="px-4 py-2">Custo total origem</th>
                    <th className="px-4 py-2">Proporção</th>
                    <th className="px-4 py-2">Valor rateado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {resultados.map((r, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">{nomeCentro(r.centro_custo_origem_id)}</td>
                      <td className="px-4 py-2">{nomeCentro(r.centro_custo_destino_id)}</td>
                      <td className="px-4 py-2">{formatBRL(r.custo_total_origem)}</td>
                      <td className="px-4 py-2">{(r.proporcao * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2 font-medium">{formatBRL(r.valor_rateado)}</td>
                    </tr>
                  ))}
                  {resultados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        Nenhum resultado — confira se os centros auxiliares têm custo direto e
                        driver configurado no período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
