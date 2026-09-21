'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function rodarRateio(formData: FormData) {
  const supabase = await createClient();
  const periodo_inicio = formData.get('periodo_inicio') as string;
  const periodo_fim = formData.get('periodo_fim') as string;

  const { error } = await supabase.rpc('executar_rateio', {
    p_periodo_inicio: periodo_inicio,
    p_periodo_fim: periodo_fim,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/rateio');
}
