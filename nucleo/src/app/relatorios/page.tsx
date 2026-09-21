import { NavHeader } from '@/components/NavHeader';
import { exigirContextoUsuario } from '@/lib/contexto-usuario';

function formatBRL(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type LinhaRelatorio = {
  episodio_id: string;
  paciente_nome: string;
  paciente_pid: string;
  cid: string | null;
  tipo: string;
  data_abertura: string;
  custo_direto: number;
  custo_rateado: number;
  custo_total: number;
};

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string }>;
}) {
  const { supabase, tenant } = await exigirContextoUsuario();
  const { inicio, fim } = await searchParams;

  const periodoInicio = inicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
  const periodoFim = fim || new Date().toISOString().slice(0, 10);

  const { data: linhas } = await supabase.rpc('relatorio_custos_episodios', {
    p_periodo_inicio: periodoInicio,
    p_periodo_fim: periodoFim,
  });

  const episodios = (linhas ?? []) as LinhaRelatorio[];

  const totalGeral = episodios.reduce((acc, e) => acc + Number(e.custo_total), 0);
  const mediaGeral = episodios.length > 0 ? totalGeral / episodios.length : 0;

  const porCid = episodios.reduce<Record<string, { qtd: number; total: number }>>((acc, e) => {
    const chave = e.cid || 'Sem CID';
    if (!acc[chave]) acc[chave] = { qtd: 0, total: 0 };
    acc[chave].qtd += 1;
    acc[chave].total += Number(e.custo_total);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-slate-50">
      <NavHeader tenantNome={tenant?.nome ?? ''} active="/relatorios" />

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8 print:max-w-full">
        <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Relatórios e apuração</h1>
            <p className="mt-1 text-sm text-slate-500">
              Custo por paciente, CID e período — direto + rateado, calculado pelo motor de
              absorção.
            </p>
          </div>
          <div className="flex items-end gap-2">
            <form className="flex items-end gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600">Início</label>
                <input
                  type="date"
                  name="inicio"
                  defaultValue={periodoInicio}
                  className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Fim</label>
                <input
                  type="date"
                  name="fim"
                  defaultValue={periodoFim}
                  className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Filtrar
              </button>
            </form>
            <a
              href={`/relatorios/exportar?inicio=${periodoInicio}&fim=${periodoFim}`}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Exportar CSV
            </a>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              data-print
            >
              Imprimir / PDF
            </button>
          </div>
        </div>

        <div className="print:block hidden">
          <h1 className="text-lg font-semibold">
            Relatório de custos — {tenant?.nome} — {periodoInicio} a {periodoFim}
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Episódios no período</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{episodios.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Custo total apurado</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{formatBRL(totalGeral)}</p>
          </div>
          <div className="rounded-lg border-2 border-slate-900 bg-white p-4">
            <p className="text-xs text-slate-500">Custo médio por episódio/internação</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{formatBRL(mediaGeral)}</p>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-medium text-slate-700">Por CID</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">CID</th>
                  <th className="px-4 py-2">Episódios</th>
                  <th className="px-4 py-2">Custo total</th>
                  <th className="px-4 py-2">Custo médio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(porCid).map(([cid, agg]) => (
                  <tr key={cid}>
                    <td className="px-4 py-2 font-medium text-slate-900">{cid}</td>
                    <td className="px-4 py-2">{agg.qtd}</td>
                    <td className="px-4 py-2">{formatBRL(agg.total)}</td>
                    <td className="px-4 py-2">{formatBRL(agg.total / agg.qtd)}</td>
                  </tr>
                ))}
                {Object.keys(porCid).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      Nenhum episódio no período selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-slate-700">Por paciente / episódio</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Paciente</th>
                  <th className="px-4 py-2">CID</th>
                  <th className="px-4 py-2">Abertura</th>
                  <th className="px-4 py-2">Direto</th>
                  <th className="px-4 py-2">Rateado</th>
                  <th className="px-4 py-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {episodios.map((e) => (
                  <tr key={e.episodio_id}>
                    <td className="px-4 py-2">
                      {e.paciente_nome} <span className="text-slate-400">({e.paciente_pid})</span>
                    </td>
                    <td className="px-4 py-2 text-slate-500">{e.cid ?? '—'}</td>
                    <td className="px-4 py-2 text-slate-500">
                      {new Date(e.data_abertura).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-2">{formatBRL(Number(e.custo_direto))}</td>
                    <td className="px-4 py-2">{formatBRL(Number(e.custo_rateado))}</td>
                    <td className="px-4 py-2 font-medium">{formatBRL(Number(e.custo_total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `document.querySelector('[data-print]')?.addEventListener('click', () => window.print());`,
        }}
      />
    </main>
  );
}
