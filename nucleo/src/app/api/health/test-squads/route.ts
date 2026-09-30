import { NextResponse } from 'next/server';
import { executarSuiteDeTestesSquad1 } from '@/lib/../__tests__/squad1_integration.test';
import { executarSuiteDeTestesSquad2 } from '@/lib/../__tests__/squad2_integration.test';
import { executarSuiteDeTestesSquad3 } from '@/lib/../__tests__/squad3_integration.test';
import { executarSuiteDeTestesSquad4 } from '@/lib/../__tests__/squad4_integration.test';
import { executarSuiteDeTestesSquad5 } from '@/lib/../__tests__/squad5_integration.test';
import { executarSuiteDeTestesSquad6 } from '@/lib/../__tests__/squad6_integration.test';
import { executarSuiteDeTestesSquad7 } from '@/lib/../__tests__/squad7_integration.test';

export async function GET() {
  const inicio = Date.now();

  const [s1, s2, s3, s4, s5, s6, s7] = await Promise.all([
    executarSuiteDeTestesSquad1(),
    executarSuiteDeTestesSquad2(),
    executarSuiteDeTestesSquad3(),
    executarSuiteDeTestesSquad4(),
    executarSuiteDeTestesSquad5(),
    executarSuiteDeTestesSquad6(),
    executarSuiteDeTestesSquad7()
  ]);

  const suites = [
    { squad: 'Squad 1: Core 360, Hub de Ingestão & Custeio', resultados: s1 },
    { squad: 'Squad 2: Clínicas Médicas & PEP OpenEMR', resultados: s2 },
    { squad: 'Squad 3: Laboratório LIMS & Diagnóstico (SENAITE)', resultados: s3 },
    { squad: 'Squad 4: Suprimentos, Farmácia FEFO & CMED/BPS', resultados: s4 },
    { squad: 'Squad 5: Leitos, Facilities & NIR', resultados: s5 },
    { squad: 'Squad 6: Fintech 360, Split & Contabilidade', resultados: s6 },
    { squad: 'Squad 7: Barramento de Eventos n8n & Mensageria', resultados: s7 },
  ];

  let totalTestes = 0;
  let totalPass = 0;
  let totalFail = 0;

  suites.forEach(s => {
    s.resultados.forEach(r => {
      totalTestes++;
      if (r.status === 'PASS') totalPass++;
      else totalFail++;
    });
  });

  const tempoExecucaoMs = Date.now() - inicio;

  return NextResponse.json({
    status: totalFail === 0 ? 'ALL_SQUADS_PASS' : 'SOME_TESTS_FAILED',
    resumo: {
      total_squads: 7,
      total_testes: totalTestes,
      aprovados: totalPass,
      falhas: totalFail,
      taxa_sucesso_pct: totalTestes > 0 ? Number(((totalPass / totalTestes) * 100).toFixed(1)) : 0,
      tempo_execucao_ms: tempoExecucaoMs,
      timestamp: new Date().toISOString()
    },
    detalhes_por_squad: suites
  });
}
