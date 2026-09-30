const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oogpcdaosexarxmvupiw.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_a0cwEmheXaFCeNuNYWRNPA_d4aEpQMI';
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

async function runMigrations() {
  console.log('================================================================');
  console.log('🏥 HOSPITAL 360 — EXECUTOR DE MIGRATIONS ONDA 1 (POSTGRESQL)');
  console.log('================================================================');
  console.log(`Endpoint Supabase: ${supabaseUrl}`);

  const migrationFile = path.resolve(__dirname, '../supabase/migrations/CONSOLIDATED_ONDA1_MIGRATION.sql');
  const sql = fs.readFileSync(migrationFile, 'utf-8');
  console.log(`Arquivo de Migration carregado: ${migrationFile} (${sql.length} bytes)`);

  if (databaseUrl) {
    console.log('🔌 Conectando via DATABASE_URL direta...');
    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
      await client.connect();
      console.log('✅ Conexão estabelecida com sucesso! Executando SQL...');
      await client.query(sql);
      console.log('🎉 Migrations aplicadas com sucesso no PostgreSQL!');
      await client.end();
      return;
    } catch (err) {
      console.error('❌ Erro ao executar via pg:', err.message);
    }
  } else {
    console.log('ℹ️  Nenhuma DATABASE_URL direta configurada no .env.');
    console.log('ℹ️  A migração consolidada idempotente está salva e pronta em:');
    console.log(`    ${migrationFile}`);
    console.log('');
    console.log('📋 Para aplicar no painel Supabase:');
    console.log('    1. Acesse: https://supabase.com/dashboard/project/oogpcdaosexarxmvupiw/sql/new');
    console.log('    2. Cole o conteúdo de CONSOLIDATED_ONDA1_MIGRATION.sql e clique em RUN.');
  }

  // Verifica status das tabelas via API REST
  console.log('');
  console.log('🔍 Verificando status das tabelas no Supabase REST...');
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    realtime: { transport: class Dummy {} }
  });

  const tables = ['tenants', 'pacientes', 'episodios', 'banco_precos_medicamentos', 'lotes_medicamentos', 'leitos', 'hub_despesas_estacoes'];
  for (const t of tables) {
    try {
      const { data, error, status } = await supabase.from(t).select('*').limit(1);
      console.log(`  - Tabela '${t}': Status ${status} (${error ? 'Pendente: ' + error.message : 'OK (' + (data ? data.length : 0) + ' registros)'})`);
    } catch (e) {
      console.log(`  - Tabela '${t}': Erro de chamada (${e.message})`);
    }
  }

  console.log('================================================================');
}

runMigrations().catch(console.error);
