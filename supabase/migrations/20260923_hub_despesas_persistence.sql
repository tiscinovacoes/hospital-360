-- ==============================================================================
-- HOSPITAL 360 — MIGRATION: PERSISTÊNCIA DO HUB DE DESPESAS DOOR-TO-DOOR
-- Migration: 20260923_hub_despesas_persistence.sql
-- Escopo: Schema satelites, Idempotência de Ingestão, 5 Estações Clínicas e RLS
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS satelites;

-- 1. TABELA DE LOTES DE INGESTÃO (PROTOCOLO CANÔNICO)
CREATE TABLE IF NOT EXISTS satelites.hub_lotes_ingestao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo VARCHAR(64) NOT NULL UNIQUE,
  tenant_id UUID NOT NULL,
  origem_modulo VARCHAR(64) NOT NULL,
  cliente_id VARCHAR(64),
  idempotency_key VARCHAR(128) UNIQUE,
  total_despesas INTEGER NOT NULL DEFAULT 0,
  valor_total_bruto NUMERIC(14,2) NOT NULL DEFAULT 0,
  data_geracao TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(32) NOT NULL DEFAULT 'PROCESSADO' CHECK (status IN ('PROCESSADO', 'EM_PROCESSAMENTO', 'ERRO', 'AUDITORIA_PENDENTE')),
  metadados JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DAS DESPESAS DAS 5 ESTAÇÕES CLÍNICAS DOOR-TO-DOOR
CREATE TABLE IF NOT EXISTS satelites.hub_despesas_estacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  lote_id UUID REFERENCES satelites.hub_lotes_ingestao(id) ON DELETE CASCADE,
  protocolo_lote VARCHAR(64) NOT NULL,
  id_transacao VARCHAR(128) NOT NULL,
  paciente_cpf VARCHAR(20) NOT NULL,
  paciente_nome VARCHAR(255) NOT NULL,
  prontuario_episodio VARCHAR(64) NOT NULL,
  centro_custo VARCHAR(128) NOT NULL,
  leito_identificador VARCHAR(64),
  item_codigo VARCHAR(64) NOT NULL,
  item_descricao VARCHAR(255) NOT NULL,
  lote_fabricante VARCHAR(64),
  quantidade NUMERIC(10,3) NOT NULL,
  unidade_medida VARCHAR(32) NOT NULL,
  valor_unitario_medio NUMERIC(12,4) NOT NULL,
  valor_total_imputado NUMERIC(14,2) NOT NULL,
  data_consumo TIMESTAMPTZ NOT NULL,
  origem_modulo VARCHAR(64) NOT NULL,
  estacao_jornada SMALLINT NOT NULL CHECK (estacao_jornada BETWEEN 1 AND 5),
  status_auditoria VARCHAR(32) NOT NULL DEFAULT 'APROVADO_PREVENTIVO' CHECK (status_auditoria IN ('APROVADO_PREVENTIVO', 'ALERTA_CMED', 'ALERTA_BPS', 'GLOSA_PROVAVEL', 'CONCILIADO')),
  glosa_estimada NUMERIC(14,2) DEFAULT 0,
  metadados JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ÍNDICES DE ALTA PERFORMANCE (QUERY POR PACIENTE, EPISÓDIO E ESTAÇÕES)
CREATE INDEX IF NOT EXISTS idx_hub_despesas_paciente ON satelites.hub_despesas_estacoes(tenant_id, paciente_cpf, estacao_jornada);
CREATE INDEX IF NOT EXISTS idx_hub_despesas_episodio ON satelites.hub_despesas_estacoes(tenant_id, prontuario_episodio);
CREATE INDEX IF NOT EXISTS idx_hub_despesas_estacao_data ON satelites.hub_despesas_estacoes(tenant_id, estacao_jornada, data_consumo DESC);
CREATE INDEX IF NOT EXISTS idx_hub_despesas_origem ON satelites.hub_despesas_estacoes(tenant_id, origem_modulo);
CREATE INDEX IF NOT EXISTS idx_hub_lotes_idempotency ON satelites.hub_lotes_ingestao(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_hub_lotes_protocolo ON satelites.hub_lotes_ingestao(protocolo);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE satelites.hub_lotes_ingestao ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.hub_despesas_estacoes ENABLE ROW LEVEL SECURITY;

-- Política de Leitura: Usuários autenticados acessam apenas despesas do seu próprio tenant
CREATE POLICY hub_lotes_ingestao_select_policy ON satelites.hub_lotes_ingestao
  FOR SELECT
  TO authenticated
  USING (tenant_id = (SELECT auth.uid()));

CREATE POLICY hub_despesas_estacoes_select_policy ON satelites.hub_despesas_estacoes
  FOR SELECT
  TO authenticated
  USING (tenant_id = (SELECT auth.uid()));

-- Política de Escrita: Ingestão de despesas autorizada para tenant e service_role
CREATE POLICY hub_lotes_ingestao_insert_policy ON satelites.hub_lotes_ingestao
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

CREATE POLICY hub_despesas_estacoes_insert_policy ON satelites.hub_despesas_estacoes
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

-- Permissões gerais para service_role (rotas de background/n8n/API interna)
GRANT ALL ON TABLE satelites.hub_lotes_ingestao TO service_role;
GRANT ALL ON TABLE satelites.hub_despesas_estacoes TO service_role;
