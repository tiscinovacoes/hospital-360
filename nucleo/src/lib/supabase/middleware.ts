import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ROTAS_AUTENTICACAO = ['/login', '/cadastro'];
const ROTAS_PUBLICAS = [
  '/',
  '/admin',
  '/medico',
  '/recepcao',
  '/facilities',
  '/internacao',
  '/gestao-clinica',
  '/dashboard-executivo',
  '/arquitetura-seguranca',
  '/ingestao-modulos',
  '/compras-publicas',
  '/estoque-central',
  '/escala-medica',
  '/farmacia-estoque',
  '/laboratorio',
  '/leitos-censo',
  '/financeiro-split',
  '/automacao-mensageria',
  '/tarefas',
  '/prototipo-identidade',
  '/api',
  ...ROTAS_AUTENTICACAO
];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = ROTAS_AUTENTICACAO.some((rota) => pathname.startsWith(rota));
  const isPublicRoute = ROTAS_PUBLICAS.some((rota) => rota === '/' ? pathname === '/' : pathname.startsWith(rota));

  // Redireciona usuários já logados que tentam acessar login/cadastro
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Se rota requer login no núcleo antigo e usuário não está logado
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
