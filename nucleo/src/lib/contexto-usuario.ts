import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function exigirContextoUsuario() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, nome_completo, tenant_id, perfis_acesso(codigo, nome)')
    .eq('id', user.id)
    .maybeSingle();

  if (!usuario) {
    redirect('/completar-cadastro');
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, nome, slug')
    .eq('id', usuario.tenant_id)
    .single();

  const perfil = Array.isArray(usuario.perfis_acesso)
    ? usuario.perfis_acesso[0]
    : usuario.perfis_acesso;

  return { supabase, usuario, tenant, perfil };
}
