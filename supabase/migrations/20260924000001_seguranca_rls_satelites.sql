-- ============================================================================
-- Migration: 20260924000001_seguranca_rls_satelites.sql
-- Escopo Exclusivo: schema satelites (Antigravity)
-- Objetivo: Sanear divida critica de seguranca - Habilitar RLS e aplicar
--           policies de isolamento por tenant nas 9 tabelas do satelites.
-- ============================================================================

-- 1. Habilita RLS nas 9 tabelas do schema satelites
ALTER TABLE IF EXISTS satelites.servidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS satelites.servidor_centro_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS satelites.itens_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS satelites.lotes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS satelites.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS satelites.notas_fiscais_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS satelites.ativos_patrimoniais ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS satelites.consultas_atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS satelites.internacoes_leitos ENABLE ROW LEVEL SECURITY;

-- 2. Recria ou Assegura Policies de Isolamento Multi-Tenant estritas
--    Regra: tenant_id = public.current_tenant_id()

DO $$
BEGIN
  -- satelites.servidores
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'satelites' AND table_name = 'servidores') THEN
    DROP POLICY IF EXISTS servidores_tenant_isolation ON satelites.servidores;
    CREATE POLICY servidores_tenant_isolation ON satelites.servidores
      FOR ALL TO authenticated
      USING (tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = public.current_tenant_id());
  END IF;

  -- satelites.servidor_centro_custo
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'satelites' AND table_name = 'servidor_centro_custo') THEN
    DROP POLICY IF EXISTS servidor_centro_custo_tenant_isolation ON satelites.servidor_centro_custo;
    CREATE POLICY servidor_centro_custo_tenant_isolation ON satelites.servidor_centro_custo
      FOR ALL TO authenticated
      USING (tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = public.current_tenant_id());
  END IF;

  -- satelites.itens_estoque
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'satelites' AND table_name = 'itens_estoque') THEN
    DROP POLICY IF EXISTS itens_estoque_tenant_isolation ON satelites.itens_estoque;
    CREATE POLICY itens_estoque_tenant_isolation ON satelites.itens_estoque
      FOR ALL TO authenticated
      USING (tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = public.current_tenant_id());
  END IF;

  -- satelites.lotes_estoque
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'satelites' AND table_name = 'lotes_estoque') THEN
    DROP POLICY IF EXISTS lotes_estoque_tenant_isolation ON satelites.lotes_estoque;
    CREATE POLICY lotes_estoque_tenant_isolation ON satelites.lotes_estoque
      FOR ALL TO authenticated
      USING (tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = public.current_tenant_id());
  END IF;

  -- satelites.movimentacoes_estoque
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'satelites' AND table_name = 'movimentacoes_estoque') THEN
    DROP POLICY IF EXISTS movimentacoes_estoque_tenant_isolation ON satelites.movimentacoes_estoque;
    CREATE POLICY movimentacoes_estoque_tenant_isolation ON satelites.movimentacoes_estoque
      FOR ALL TO authenticated
      USING (tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = public.current_tenant_id());
  END IF;

  -- satelites.notas_fiscais_servico
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'satelites' AND table_name = 'notas_fiscais_servico') THEN
    DROP POLICY IF EXISTS notas_fiscais_servico_tenant_isolation ON satelites.notas_fiscais_servico;
    CREATE POLICY notas_fiscais_servico_tenant_isolation ON satelites.notas_fiscais_servico
      FOR ALL TO authenticated
      USING (tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = public.current_tenant_id());
  END IF;

  -- satelites.ativos_patrimoniais
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'satelites' AND table_name = 'ativos_patrimoniais') THEN
    DROP POLICY IF EXISTS ativos_patrimoniais_tenant_isolation ON satelites.ativos_patrimoniais;
    CREATE POLICY ativos_patrimoniais_tenant_isolation ON satelites.ativos_patrimoniais
      FOR ALL TO authenticated
      USING (tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = public.current_tenant_id());
  END IF;

  -- satelites.consultas_atendimentos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'satelites' AND table_name = 'consultas_atendimentos') THEN
    DROP POLICY IF EXISTS consultas_atendimentos_tenant_isolation ON satelites.consultas_atendimentos;
    CREATE POLICY consultas_atendimentos_tenant_isolation ON satelites.consultas_atendimentos
      FOR ALL TO authenticated
      USING (tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = public.current_tenant_id());
  END IF;

  -- satelites.internacoes_leitos
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'satelites' AND table_name = 'internacoes_leitos') THEN
    DROP POLICY IF EXISTS internacoes_leitos_tenant_isolation ON satelites.internacoes_leitos;
    CREATE POLICY internacoes_leitos_tenant_isolation ON satelites.internacoes_leitos
      FOR ALL TO authenticated
      USING (tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = public.current_tenant_id());
  END IF;
END $$;
