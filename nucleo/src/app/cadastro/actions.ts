'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const MARCAS_DIACRITICAS = /[̀-ͯ]/g;

function gerarSlug(nome: string) {
  return nome
    .normalize('NFD')
    .replace(MARCAS_DIACRITICAS, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function cadastrar(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nomeCompleto = formData.get('nome_completo') as string;
  const tenantNome = formData.get('tenant_nome') as string;
  const tenantSlug = gerarSlug(tenantNome);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome_completo: nomeCompleto, tenant_nome: tenantNome, tenant_slug: tenantSlug },
    },
  });

  if (signUpError) {
    redirect(`/cadastro?erro=${encodeURIComponent(signUpError.message)}`);
  }

  if (!signUpData.session) {
    redirect(
      `/login?info=${encodeURIComponent(
        'Cadastro criado. Confirme seu e-mail e depois faça login para concluir o vínculo com a secretaria.'
      )}`
    );
  }

  const { error: rpcError } = await supabase.rpc('completar_cadastro', {
    p_tenant_slug: tenantSlug,
    p_tenant_nome: tenantNome,
    p_nome_completo: nomeCompleto,
  });

  if (rpcError) {
    redirect(`/cadastro?erro=${encodeURIComponent(rpcError.message)}`);
  }

  redirect('/');
}
