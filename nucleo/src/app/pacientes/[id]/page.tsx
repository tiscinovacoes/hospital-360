import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NavHeader } from '@/components/NavHeader';
import { exigirContextoUsuario } from '@/lib/contexto-usuario';
import { criarEpisodio } from '../actions';

function formatBRL(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function PacienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, tenant } = await exigirContextoUsuario();

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, pid, nome, cpf, nis, data_nascimento')
    .eq('id', id)
    .maybeSingle();

  if (!paciente) notFound();

  const { data: episodios } = await supabase
    .from('episodios')
    .select('id, tipo, cid, status, data_abertura, data_fechamento')
    .eq('paciente_id', id)
    .order('data_abertura', { ascending: false });

  const episodioIds = (episodios ?? []).map((e) => e.id);

  const { data: eventosJornada } = episodioIds.length
    ? await supabase
        .from('eventos_custo')
        .select('id, tipo, valor, origem_modulo, centro_custo_id, episodio_id, timestamp')
        .in('episodio_id', episodioIds)
        .order('timestamp')
    : { data: [] };

  const { data: centros } = await supabase.from('centros_custo').select('id, nome');

  const custoTotalJornada = (eventosJornada ?? []).reduce((acc, e) => acc + Number(e.valor), 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <NavHeader tenantNome={tenant?.nome ?? ''} active="/pacientes" />

      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div>
          <Link href="/pacientes" className="text-sm text-slate-500 underline">
            ← Pacientes
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{paciente.nome}</h1>
          <p className="text-sm text-slate-500">
            PID: {paciente.pid}
            {paciente.cpf && ` · CPF: ${paciente.cpf}`}
            {paciente.nis && ` · NIS: ${paciente.nis}`}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Episódios na jornada</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {(episodios ?? []).length}
            </p>
          </div>
          <div className="rounded-lg border-2 border-slate-900 bg-white p-4">
            <p className="text-xs text-slate-500">Custo direto acumulado (todos episódios)</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {formatBRL(custoTotalJornada)}
            </p>
            <p className="text-xs text-slate-400">
              não inclui rateio — ver custo total em cada episódio individualmente
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-medium text-slate-700">Novo episódio</h2>
          <form action={criarEpisodio} className="mt-3 flex flex-wrap items-end gap-3">
            <input type="hidden" name="paciente_id" value={paciente.id} />
            <div>
              <label className="block text-xs font-medium text-slate-600">Tipo</label>
              <select
                name="tipo"
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="AMBULATORIAL">Ambulatorial</option>
                <option value="INTERNACAO">Internação</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">CID</label>
              <input
                name="cid"
                placeholder="Ex: J45"
                className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Abrir episódio
            </button>
          </form>
        </div>

        <section>
          <h2 className="text-sm font-medium text-slate-700">
            Episódios ({(episodios ?? []).length})
          </h2>
          <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {(episodios ?? []).map((e) => (
              <li key={e.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {e.tipo} {e.cid && <span className="text-slate-400">· {e.cid}</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    Aberto em {new Date(e.data_abertura).toLocaleDateString('pt-BR')}
                    {e.data_fechamento &&
                      ` · Fechado em ${new Date(e.data_fechamento).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.status === 'ABERTO'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {e.status}
                  </span>
                  <Link
                    href={`/pacientes/episodios/${e.id}`}
                    className="text-sm font-medium text-slate-900 underline"
                  >
                    Ver custo
                  </Link>
                </div>
              </li>
            ))}
            {(episodios ?? []).length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-400">
                Nenhum episódio ainda.
              </li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-medium text-slate-700">
            Linha do tempo da jornada ({(eventosJornada ?? []).length} eventos)
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Todos os eventos de custo do paciente, de qualquer módulo (farmácia, agenda, leitos,
            RH...), em ordem cronológica — independente de qual episódio pertencem.
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2">Quando</th>
                  <th className="px-4 py-2">Centro</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Origem</th>
                  <th className="px-4 py-2">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(eventosJornada ?? []).map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2 text-slate-500">
                      {new Date(e.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-2">
                      {(centros ?? []).find((c) => c.id === e.centro_custo_id)?.nome ??
                        e.centro_custo_id}
                    </td>
                    <td className="px-4 py-2 text-slate-500">{e.tipo}</td>
                    <td className="px-4 py-2 text-slate-500">{e.origem_modulo}</td>
                    <td className="px-4 py-2 font-medium">{formatBRL(Number(e.valor))}</td>
                  </tr>
                ))}
                {(eventosJornada ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      Nenhum evento registrado ainda.
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
