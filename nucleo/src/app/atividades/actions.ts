'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function tenantAtual(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('tenant_id')
    .eq('id', user!.id)
    .single();
  return usuario!.tenant_id;
}

export async function criarAtividade(formData: FormData) {
  const supabase = await createClient();
  const centro_custo_id = formData.get('centro_custo_id') as string;
  const nome = formData.get('nome') as string;
  const direcionador = formData.get('direcionador') as string;
  const unidade_medida = formData.get('unidade_medida') as string;

  const tenant_id = await tenantAtual(supabase);

  const { error } = await supabase
    .from('atividades_criticas')
    .insert({ tenant_id, centro_custo_id, nome, direcionador, unidade_medida });

  if (error) throw new Error(error.message);
  revalidatePath('/atividades');
}

export async function registrarConsumo(formData: FormData) {
  const supabase = await createClient();
  const atividade_id = formData.get('atividade_id') as string;
  const episodio_id = formData.get('episodio_id') as string;
  const quantidade = Number(formData.get('quantidade'));

  const tenant_id = await tenantAtual(supabase);

  const { error } = await supabase
    .from('atividade_consumos')
    .insert({ tenant_id, atividade_id, episodio_id, quantidade });

  if (error) throw new Error(error.message);
  revalidatePath(`/pacientes/episodios/${episodio_id}`);
}
