import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get('inicio') ?? new Date().toISOString().slice(0, 10);
  const fim = searchParams.get('fim') ?? new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase.rpc('relatorio_custos_episodios', {
    p_periodo_inicio: inicio,
    p_periodo_fim: fim,
  });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }

  const linhas = data ?? [];
  const cabecalho = [
    'paciente_pid',
    'paciente_nome',
    'cid',
    'tipo',
    'data_abertura',
    'data_fechamento',
    'custo_direto',
    'custo_rateado',
    'custo_total',
  ];

  const csv = [
    cabecalho.join(';'),
    ...linhas.map((l: Record<string, unknown>) =>
      cabecalho.map((campo) => String(l[campo] ?? '').replace(/;/g, ',')).join(';')
    ),
  ].join('\n');

  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="custos_${inicio}_a_${fim}.csv"`,
    },
  });
}
