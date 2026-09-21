'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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

export async function criarPaciente(formData: FormData) {
  const supabase = await createClient();
  const pid = formData.get('pid') as string;
  const nome = formData.get('nome') as string;
  const data_nascimento = (formData.get('data_nascimento') as string) || null;
  const cpf = (formData.get('cpf') as string) || null;
  const nis = (formData.get('nis') as string) || null;

  const tenant_id = await tenantAtual(supabase);

  const { error } = await supabase
    .from('pacientes')
    .insert({ tenant_id, pid, nome, data_nascimento, cpf, nis });

  if (error) throw new Error(error.message);
  revalidatePath('/pacientes');
}

export async function buscarPacientePorDocumento(formData: FormData) {
  const supabase = await createClient();
  const documento = (formData.get('documento') as string).replace(/\D/g, '');

  const { data } = await supabase
    .from('pacientes')
    .select('id')
    .or(`cpf.eq.${documento},nis.eq.${documento}`)
    .maybeSingle();

  if (data) {
    redirect(`/pacientes/${data.id}`);
  }
  redirect(`/pacientes?erro=${encodeURIComponent('Nenhum paciente encontrado com esse CPF/NIS')}`);
}

export async function criarEpisodio(formData: FormData) {
  const supabase = await createClient();
  const paciente_id = formData.get('paciente_id') as string;
  const tipo = formData.get('tipo') as string;
  const cid = (formData.get('cid') as string) || null;

  const tenant_id = await tenantAtual(supabase);

  const { data, error } = await supabase
    .from('episodios')
    .insert({ tenant_id, paciente_id, tipo, cid })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  redirect(`/pacientes/episodios/${data.id}`);
}

export async function fecharEpisodio(formData: FormData) {
  const supabase = await createClient();
  const episodio_id = formData.get('episodio_id') as string;

  const { error } = await supabase
    .from('episodios')
    .update({ status: 'FECHADO', data_fechamento: new Date().toISOString() })
    .eq('id', episodio_id);

  if (error) throw new Error(error.message);
  revalidatePath(`/pacientes/episodios/${episodio_id}`);
}

export async function lancarEventoManual(formData: FormData) {
  const supabase = await createClient();
  const episodio_id = formData.get('episodio_id') as string;
  const centro_custo_id = formData.get('centro_custo_id') as string;
  const tipo = formData.get('tipo') as string;
  const valor = Number(formData.get('valor'));

  const tenant_id = await tenantAtual(supabase);

  const { error } = await supabase.rpc('emitir_evento_custo', {
    p_tenant_id: tenant_id,
    p_centro_custo_id: centro_custo_id,
    p_tipo: tipo,
    p_valor: valor,
    p_origem_modulo: 'NUCLEO_UI_MANUAL',
    p_episodio_id: episodio_id,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/pacientes/episodios/${episodio_id}`);
}
