'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function criarBaseRateio(formData: FormData) {
  const supabase = await createClient();
  const nome = formData.get('nome') as string;
  const unidade_medida = formData.get('unidade_medida') as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('tenant_id')
    .eq('id', user!.id)
    .single();

  const { error } = await supabase
    .from('bases_rateio')
    .insert({ tenant_id: usuario!.tenant_id, nome, unidade_medida });

  if (error) throw new Error(error.message);
  revalidatePath('/centros-custo');
}

export async function criarCentroCusto(formData: FormData) {
  const supabase = await createClient();
  const id = (formData.get('id') as string).trim().toUpperCase();
  const nome = formData.get('nome') as string;
  const tipo = formData.get('tipo') as string;
  const baseRateioId = formData.get('base_rateio_distribuicao_id') as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('tenant_id')
    .eq('id', user!.id)
    .single();

  const { error } = await supabase.from('centros_custo').insert({
    id,
    tenant_id: usuario!.tenant_id,
    nome,
    tipo,
    base_rateio_distribuicao_id: tipo === 'auxiliar' && baseRateioId ? baseRateioId : null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/centros-custo');
}

export async function definirQuantidadeDriver(formData: FormData) {
  const supabase = await createClient();
  const centro_custo_id = formData.get('centro_custo_id') as string;
  const base_rateio_id = formData.get('base_rateio_id') as string;
  const quantidade = Number(formData.get('quantidade'));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('tenant_id')
    .eq('id', user!.id)
    .single();

  const { error } = await supabase
    .from('matriz_rateio')
    .upsert(
      { tenant_id: usuario!.tenant_id, centro_custo_id, base_rateio_id, quantidade },
      { onConflict: 'centro_custo_id,base_rateio_id' }
    );

  if (error) throw new Error(error.message);
  revalidatePath('/centros-custo');
}
