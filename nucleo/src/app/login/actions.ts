'use server';

import { redirect } from 'next/navigation';

export async function login(formData?: FormData) {
  // Acesso direto e desimpedido para desenvolvimento e testes
  redirect('/');
}
