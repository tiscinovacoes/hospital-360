'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function gerarSlug(nome: string) {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function concluirCadastro(formData: FormData) {
  const supabase = await createClient();

  const nomeCompleto = formData.get('nome_completo') as string;
  const tenantNome = formData.get('tenant_nome') as string;
  const tenantSlug = gerarSlug(tenantNome);

  const { error } = await supabase.rpc('completar_cadastro', {
    p_tenant_slug: tenantSlug,
    p_tenant_nome: tenantNome,
    p_nome_completo: nomeCompleto,
  });

  if (error) {
    redirect(`/completar-cadastro?erro=${encodeURIComponent(error.message)}`);
  }

  redirect('/');
}
