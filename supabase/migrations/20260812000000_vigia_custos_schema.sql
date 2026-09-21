-- Migration Supabase (Antigravity): Schema satelites + RLS Policies (OS-01)
-- EXCLUSIVO para o schema satelites. Sem DDL no public, sem DROP.

CREATE SCHEMA IF NOT EXISTS satelites;

-- 1. TABELAS DO VIGIA RH
CREATE TABLE IF NOT EXISTS satelites.servidores (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(20),
  matricula VARCHAR(64) NOT NULL,
  cargo VARCHAR(255) NOT NULL,
  vinculo VARCHAR(32) NOT NULL CHECK (vinculo IN ('EFETIVO', 'COMISSIONADO', 'CONTRATADO', 'TERCEIRIZADO')),
  carga_horaria_semanal NUMERIC(5,2) DEFAULT 40,
  salario_base NUMERIC(12,2) DEFAULT 0,
  encargos_percentual NUMERIC(5,2) DEFAULT 22,
  beneficios_valor NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(32) DEFAULT 'ATIVO',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS satelites.servidor_centro_custo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  servidor_id VARCHAR(64) REFERENCES satelites.servidores(id) ON DELETE CASCADE,
  centro_custo_id VARCHAR(64) NOT NULL,
  percentual_dedicacao NUMERIC(5,2) DEFAULT 100,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELAS DO VIGIA ESTOQUE
CREATE TABLE IF NOT EXISTS satelites.itens_estoque (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL,
  codigo VARCHAR(64) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(64) DEFAULT 'MEDICAMENTO',
  unidade_medida VARCHAR(32) DEFAULT 'UNIDADE',
  curva_abc CHAR(1) DEFAULT 'A',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS satelites.lotes_estoque (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL,
  item_id VARCHAR(64) REFERENCES satelites.itens_estoque(id) ON DELETE CASCADE,
  numero_lote VARCHAR(64) NOT NULL,
  data_validade DATE NOT NULL,
  quantidade_inicial NUMERIC(12,2) NOT NULL,
  quantidade_atual NUMERIC(12,2) NOT NULL,
  valor_unitario NUMERIC(12,2) NOT NULL,
  fornecedor VARCHAR(255),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS satelites.movimentacoes_estoque (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL,
  lote_id VARCHAR(64) REFERENCES satelites.lotes_estoque(id) ON DELETE CASCADE,
  tipo VARCHAR(64) NOT NULL,
  quantidade NUMERIC(12,2) NOT NULL,
  valor_unitario NUMERIC(12,2) NOT NULL,
  valor_total NUMERIC(12,2) NOT NULL,
  centro_custo_id VARCHAR(64) NOT NULL,
  episodio_id VARCHAR(64),
  paciente_nome VARCHAR(255),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMPRAS & PATRIMÔNIO
CREATE TABLE IF NOT EXISTS satelites.notas_fiscais_servico (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL,
  numero_nf VARCHAR(64) NOT NULL,
  fornecedor VARCHAR(255) NOT NULL,
  cnpj_fornecedor VARCHAR(20),
  descricao_servico TEXT,
  valor_total NUMERIC(12,2) NOT NULL,
  centro_custo_id VARCHAR(64) NOT NULL,
  data_emissao DATE NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS satelites.ativos_patrimoniais (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL,
  codigo_tombamento VARCHAR(64) UNIQUE NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(64) NOT NULL,
  valor_aquisicao NUMERIC(12,2) NOT NULL,
  vida_util_meses INT DEFAULT 60,
  valor_residual NUMERIC(12,2) DEFAULT 0,
  centro_custo_id VARCHAR(64) NOT NULL,
  data_aquisicao DATE NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AGENDA & LEITOS
CREATE TABLE IF NOT EXISTS satelites.consultas_atendimentos (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL,
  episodio_id VARCHAR(64) NOT NULL,
  paciente_id VARCHAR(64),
  paciente_nome VARCHAR(255) NOT NULL,
  profissional_nome VARCHAR(255) NOT NULL,
  especialidade VARCHAR(128),
  tipo_atendimento VARCHAR(64),
  duracao_minutos INT DEFAULT 20,
  centro_custo_id VARCHAR(64) NOT NULL,
  data_hora TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS satelites.internacoes_leitos (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL,
  episodio_id VARCHAR(64) NOT NULL,
  paciente_id VARCHAR(64),
  paciente_nome VARCHAR(255) NOT NULL,
  numero_leito VARCHAR(32) NOT NULL,
  tipo_leito VARCHAR(32) DEFAULT 'ENFERMARIA',
  custo_diaria_base NUMERIC(12,2) DEFAULT 250.00,
  centro_custo_id VARCHAR(64) NOT NULL,
  diarias_cumpridas INT DEFAULT 0,
  data_admissao TIMESTAMPTZ DEFAULT NOW(),
  data_alta TIMESTAMPTZ
);

-- 5. HABILITAR RLS NAS 9 TABELAS DO SCHEMA SATELITES
ALTER TABLE satelites.servidores ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.servidor_centro_custo ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.itens_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.lotes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.notas_fiscais_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.ativos_patrimoniais ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.consultas_atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.internacoes_leitos ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES DE ISOLAMENTO MULTI-TENANT CONFORME ORDEM DE SERVIÇO 01
DO $$
BEGIN
  -- servidores
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'satelites' AND tablename = 'servidores' AND policyname = 'servidores_tenant_isolation') THEN
    CREATE POLICY servidores_tenant_isolation ON satelites.servidores
      FOR ALL TO authenticated, anon
      USING (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id());
  END IF;

  -- servidor_centro_custo
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'satelites' AND tablename = 'servidor_centro_custo' AND policyname = 'servidor_centro_custo_tenant_isolation') THEN
    CREATE POLICY servidor_centro_custo_tenant_isolation ON satelites.servidor_centro_custo
      FOR ALL TO authenticated, anon
      USING (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id());
  END IF;

  -- itens_estoque
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'satelites' AND tablename = 'itens_estoque' AND policyname = 'itens_estoque_tenant_isolation') THEN
    CREATE POLICY itens_estoque_tenant_isolation ON satelites.itens_estoque
      FOR ALL TO authenticated, anon
      USING (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id());
  END IF;

  -- lotes_estoque
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'satelites' AND tablename = 'lotes_estoque' AND policyname = 'lotes_estoque_tenant_isolation') THEN
    CREATE POLICY lotes_estoque_tenant_isolation ON satelites.lotes_estoque
      FOR ALL TO authenticated, anon
      USING (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id());
  END IF;

  -- movimentacoes_estoque
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'satelites' AND tablename = 'movimentacoes_estoque' AND policyname = 'movimentacoes_estoque_tenant_isolation') THEN
    CREATE POLICY movimentacoes_estoque_tenant_isolation ON satelites.movimentacoes_estoque
      FOR ALL TO authenticated, anon
      USING (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id());
  END IF;

  -- notas_fiscais_servico
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'satelites' AND tablename = 'notas_fiscais_servico' AND policyname = 'notas_fiscais_servico_tenant_isolation') THEN
    CREATE POLICY notas_fiscais_servico_tenant_isolation ON satelites.notas_fiscais_servico
      FOR ALL TO authenticated, anon
      USING (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id());
  END IF;

  -- ativos_patrimoniais
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'satelites' AND tablename = 'ativos_patrimoniais' AND policyname = 'ativos_patrimoniais_tenant_isolation') THEN
    CREATE POLICY ativos_patrimoniais_tenant_isolation ON satelites.ativos_patrimoniais
      FOR ALL TO authenticated, anon
      USING (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id());
  END IF;

  -- consultas_atendimentos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'satelites' AND tablename = 'consultas_atendimentos' AND policyname = 'consultas_atendimentos_tenant_isolation') THEN
    CREATE POLICY consultas_atendimentos_tenant_isolation ON satelites.consultas_atendimentos
      FOR ALL TO authenticated, anon
      USING (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id());
  END IF;

  -- internacoes_leitos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'satelites' AND tablename = 'internacoes_leitos' AND policyname = 'internacoes_leitos_tenant_isolation') THEN
    CREATE POLICY internacoes_leitos_tenant_isolation ON satelites.internacoes_leitos
      FOR ALL TO authenticated, anon
      USING (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id())
      WITH CHECK (tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid OR tenant_id = public.current_tenant_id());
  END IF;
END $$;
