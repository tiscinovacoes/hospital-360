/**
 * Vigia Custos — Runner Mestre Integrado (Sprints 5 a 11 / OS-01 Real)
 */

console.log('🚀 EXECUÇÃO INTEGRADA DE TODAS AS SUÍTES DE TESTE (OS-01 REAL)\n');
console.log('========================================================================================\n');

async function run() {
  const suites = [
    { name: 'Vigia RH (Sprint 5)', file: './rh.spec.js' },
    { name: 'Vigia Estoque (Sprint 6)', file: './estoque.spec.js' },
    { name: 'Vigia Compras & Patrimônio (Sprint 7)', file: './patrimonio.spec.js' },
    { name: 'Integração Grupo A+B (Sprint 8)', file: './integracao_grupo_ab.spec.js' },
    { name: 'Vigia Agenda (Sprint 9)', file: './agenda.spec.js' },
    { name: 'Vigia Leitos (Sprint 10)', file: './leitos.spec.js' },
    { name: 'Vigia Faturamento (Sprint 11)', file: './faturamento.spec.js' },
    { name: 'Parser SIGTAP / DATASUS (Sprint 11)', file: './sigtap.spec.js' }
  ];

  let passCount = 0;

  for (const suite of suites) {
    try {
      await import(suite.file);
      passCount++;
    } catch (err) {
      console.error(`❌ ERRO NA SUÍTE: ${suite.name} (${suite.file})`);
      console.error(err);
      process.exit(1);
    }
  }

  console.log('========================================================================================');
  console.log(`✨ SUCESSO TOTAL! ${passCount}/${suites.length} SUÍTES DE TESTE PASSARAM COM 100% DE APROVAÇÃO.`);
  console.log('========================================================================================\n');
}

run();
