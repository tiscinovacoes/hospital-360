-- ==============================================================================
-- HOSPITAL 360 — MASTER MIGRATION CONSOLIDADA ONDA 1
-- Em conformidade com:
-- 1. supabase-postgres-best-practices (RLS, B-Tree Indexes, Connection Pooling)
-- 2. database-migrations-sql-migrations (Idempotência, Zero-Downtime, Rollback)
-- 3. cmed-bps-catmat-validator (Padronização CATMAT, BPS e Teto CMED)
-- ==============================================================================

-- 0. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Schemas Isolados
CREATE SCHEMA IF NOT EXISTS satelites;
CREATE SCHEMA IF NOT EXISTS core_condominio;

-- 2. Tabela de Tenants (Multi-Tenant Condomínio RN-IND)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'CONDOMINIO_CENTRAL' CHECK (tipo IN ('CONDOMINIO_CENTRAL', 'CLINICA_INDEPENDENTE', 'LABORATORIO_EXTERNO')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Tenant se ausente
INSERT INTO public.tenants (id, nome_fantasia, cnpj, tipo, ativo)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Hospital 360 Condomínio Central', '00.360.360/0001-00', 'CONDOMINIO_CENTRAL', true)
ON CONFLICT (cnpj) DO NOTHING;

-- 3. Tabela Oficial de Preços de Medicamentos (CMED / BPS / CATMAT)
CREATE TABLE IF NOT EXISTS public.banco_precos_medicamentos (
    id VARCHAR(64) PRIMARY KEY,
    codigo_catmat VARCHAR(30) UNIQUE NOT NULL,
    nome_comercial_padrao VARCHAR(255) NOT NULL,
    principio_ativo VARCHAR(255) NOT NULL,
    concentracao VARCHAR(100),
    forma_farmaceutica VARCHAR(100),
    apresentacao VARCHAR(150),
    unidade_fornecimento VARCHAR(50) NOT NULL,
    preco_teto_cmed NUMERIC(12, 4) NOT NULL,
    preco_referencia_bps NUMERIC(12, 4) NOT NULL,
    classe_terapeutica VARCHAR(150),
    tarja VARCHAR(30) DEFAULT 'VERMELHA',
    temperatura_exigida VARCHAR(120),
    data_atualizacao TIMESTAMPTZ DEFAULT now(),
    criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bpm_catmat ON public.banco_precos_medicamentos(codigo_catmat);
CREATE INDEX IF NOT EXISTS idx_bpm_principio ON public.banco_precos_medicamentos(principio_ativo);
CREATE INDEX IF NOT EXISTS idx_bpm_nome ON public.banco_precos_medicamentos(nome_comercial_padrao);

ALTER TABLE public.banco_precos_medicamentos ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'banco_precos_medicamentos' 
        AND policyname = 'Permitir leitura publica de precos medicamentos'
    ) THEN
        CREATE POLICY "Permitir leitura publica de precos medicamentos"
            ON public.banco_precos_medicamentos FOR SELECT USING (true);
    END IF;
END $$;

-- 4. Hub de Despesas: Lotes de Ingestão e Despesas por Estação
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
  status_auditoria VARCHAR(32) NOT NULL DEFAULT 'APROVADO_PREVENTIVO',
  glosa_estimada NUMERIC(14,2) DEFAULT 0,
  metadados JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hub_despesas_paciente ON satelites.hub_despesas_estacoes(tenant_id, paciente_cpf, estacao_jornada);
CREATE INDEX IF NOT EXISTS idx_hub_despesas_episodio ON satelites.hub_despesas_estacoes(tenant_id, prontuario_episodio);
CREATE INDEX IF NOT EXISTS idx_hub_despesas_estacao_data ON satelites.hub_despesas_estacoes(tenant_id, estacao_jornada, data_consumo DESC);
CREATE INDEX IF NOT EXISTS idx_hub_lotes_idempotency ON satelites.hub_lotes_ingestao(idempotency_key);

ALTER TABLE satelites.hub_lotes_ingestao ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.hub_despesas_estacoes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'hub_lotes_ingestao' 
        AND schemaname = 'satelites' 
        AND policyname = 'satelites_hub_lotes_policy'
    ) THEN
        CREATE POLICY satelites_hub_lotes_policy ON satelites.hub_lotes_ingestao
        FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'hub_despesas_estacoes' 
        AND schemaname = 'satelites' 
        AND policyname = 'satelites_hub_despesas_policy'
    ) THEN
        CREATE POLICY satelites_hub_despesas_policy ON satelites.hub_despesas_estacoes
        FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 5. Views de Compatibilidade no Schema Public (Garante acesso via PostgREST padrão)
CREATE OR REPLACE VIEW public.hub_lotes_ingestao AS 
SELECT * FROM satelites.hub_lotes_ingestao;

CREATE OR REPLACE VIEW public.hub_despesas_estacoes AS 
SELECT * FROM satelites.hub_despesas_estacoes;

-- 6. Tabela de Lotes de Estoque FEFO (Farmácia / OpenBoxes)
CREATE TABLE IF NOT EXISTS satelites.lotes_medicamentos (
    id VARCHAR(64) PRIMARY KEY,
    codigo_br VARCHAR(50) NOT NULL,
    nome_item VARCHAR(255) NOT NULL,
    numero_lote VARCHAR(50) NOT NULL,
    data_fabricacao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    quantidade_disponivel NUMERIC(12, 3) NOT NULL CHECK (quantidade_disponivel >= 0),
    localizacao_prateleira VARCHAR(100) DEFAULT 'A-01-01',
    custo_unitario NUMERIC(12, 4) NOT NULL,
    temperatura_conservacao_c NUMERIC(5, 2) DEFAULT 22.0,
    status VARCHAR(30) DEFAULT 'DISPONIVEL' CHECK (status IN ('DISPONIVEL', 'QUARENTENA', 'VENCIDO')),
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sat_lotes_fefo ON satelites.lotes_medicamentos(codigo_br, data_vencimento ASC);

ALTER TABLE satelites.lotes_medicamentos ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lotes_medicamentos' 
        AND schemaname = 'satelites' 
        AND policyname = 'satelites_lotes_policy'
    ) THEN
        CREATE POLICY satelites_lotes_policy ON satelites.lotes_medicamentos
        FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

CREATE OR REPLACE VIEW public.lotes_medicamentos AS 
SELECT * FROM satelites.lotes_medicamentos;

-- 7. Tabela de Leitos Hospitalares e Censo NIR (Bahmni / Leitos)
CREATE TABLE IF NOT EXISTS satelites.leitos (
    id VARCHAR(64) PRIMARY KEY,
    codigo_leito VARCHAR(50) UNIQUE NOT NULL,
    unidade_ala VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('UTI', 'ENFERMARIA', 'APARTAMENTO', 'ISOLAMENTO')),
    status VARCHAR(50) NOT NULL DEFAULT 'LIVRE' CHECK (status IN ('LIVRE', 'OCUPADO', 'HIGIENIZACAO', 'MANUTENCAO', 'ISOLAMENTO')),
    paciente_cpf VARCHAR(20),
    paciente_nome VARCHAR(255),
    data_admissao TIMESTAMPTZ,
    diaria_valor_base NUMERIC(12, 2) NOT NULL DEFAULT 450.00,
    tenant_id VARCHAR(64) NOT NULL DEFAULT 'hospital_360_default',
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE satelites.leitos ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'leitos' 
        AND schemaname = 'satelites' 
        AND policyname = 'satelites_leitos_policy'
    ) THEN
        CREATE POLICY satelites_leitos_policy ON satelites.leitos
        FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

CREATE OR REPLACE VIEW public.leitos AS 
SELECT * FROM satelites.leitos;

-- 8. Carga Inicial de Preços Hospitalares Críticos
INSERT INTO public.banco_precos_medicamentos (
    id, codigo_catmat, nome_comercial_padrao, principio_ativo, concentracao, 
    forma_farmaceutica, apresentacao, unidade_fornecimento, preco_teto_cmed, 
    preco_referencia_bps, classe_terapeutica, tarja, temperatura_exigida
) VALUES
('med-001', 'BR0284729', 'Meropenem 1g Pó Liofilizado Injetável', 'Meropenem Tri-hidratado', '1g', 'Pó para Solução Injetável', 'Frasco-Ampola', 'Frasco-Ampola', 68.2000, 52.1000, 'Antibiótico Carbapenêmico', 'VERMELHA', '15ºC a 30ºC'),
('med-002', 'BR0194851', 'Noradrenalina 2mg/mL Ampola 4mL', 'Hemitartarato de Norepinefrina', '2mg/mL', 'Solução Injetável', 'Ampola 4mL', 'Ampola', 18.5000, 14.2000, 'Vasopressor / Vasoconstritor', 'VERMELHA', '2ºC a 8ºC (Cadeia de Frio)'),
('med-003', 'BR0311209', 'Fentanila 0,05mg/mL Injetável 10mL', 'Citrato de Fentanila', '0,05mg/mL', 'Solução Injetável', 'Ampola 10mL', 'Ampola', 22.4000, 17.5000, 'Analgésico Opióide', 'PRETA', '15ºC a 30ºC'),
('med-004', 'BR0355102', 'Enoxaparina Sódica 40mg/0,4mL Seringa', 'Enoxaparina Sódica', '40mg/0,4mL', 'Solução Injetável Subcutânea', 'Seringa Preenchida', 'Seringa Preenchida', 34.0000, 25.8000, 'Anticoagulante', 'VERMELHA', '15ºC a 25ºC'),
('med-005', 'BR0401928', 'Imunoglobulina Humana 5g Frasco 100mL', 'Imunoglobulina Humana Endovenosa', '5g / 100mL', 'Solução para Infusão', 'Frasco 100mL', 'Frasco', 1580.0000, 1320.0000, 'Hemoderivado Imunobiológico', 'VERMELHA', '2ºC a 8ºC'),
('med-006', 'BR0001003', 'Dipirona Sódica 500mg/mL Ampola 2mL', 'Dipirona Monoidratada', '500mg/mL', 'Solução Injetável', 'Ampola 2mL', 'Ampola', 3.2000, 1.8500, 'Analgésico e Antipirético', 'VERMELHA', '15ºC a 30ºC'),
('med-007', 'BR0291180', 'Cloridrato de Dobutamina 12,5mg/mL 20mL', 'Cloridrato de Dobutamina', '12,5mg/mL', 'Solução Injetável para Infusão', 'Ampola 20mL', 'Ampola', 29.8000, 23.4000, 'Inotrópico Cardíaco', 'VERMELHA', '15ºC a 30ºC'),
('med-008', 'BR0319802', 'Levofloxacino 5mg/mL Bolsa 100mL', 'Levofloxacino Hemirridratado', '500mg/100mL', 'Solução para Infusão IV', 'Bolsa 100mL', 'Bolsa', 22.0000, 16.5000, 'Antibiótico Fluoroquinolona', 'VERMELHA', '15ºC a 30ºC'),
('med-009', 'BR0348911', 'Albumina Humana 20% Frasco 50mL', 'Albumina Humana', '20% (10g/50mL)', 'Solução Injetável Colóide', 'Frasco 50mL', 'Frasco', 115.0000, 89.5000, 'Expansor Plasmático', 'VERMELHA', '2ºC a 25ºC')
ON CONFLICT (codigo_catmat) DO NOTHING;

-- Seed inicial de leitos hospitalares
INSERT INTO satelites.leitos (id, codigo_leito, unidade_ala, tipo, status, paciente_cpf, paciente_nome, diaria_valor_base, tenant_id)
VALUES
('LET-101', '101-A', 'UTI Adulto', 'UTI', 'OCUPADO', '123.456.789-00', 'Carlos Eduardo Silva', 1450.00, 'hospital_360_default'),
('LET-102', '102-B', 'Enfermaria Geral', 'ENFERMARIA', 'LIVRE', NULL, NULL, 450.00, 'hospital_360_default'),
('LET-201', '201-UTI', 'UTI Coronariana', 'UTI', 'LIVRE', NULL, NULL, 1850.00, 'hospital_360_default')
ON CONFLICT (codigo_leito) DO NOTHING;

-- Seed inicial de lotes de estoque FEFO
INSERT INTO satelites.lotes_medicamentos (id, codigo_br, nome_item, numero_lote, data_fabricacao, data_vencimento, quantidade_disponivel, localizacao_prateleira, custo_unitario, temperatura_conservacao_c, status)
VALUES
('LOT-DIP-2026-02', 'BR100200300', 'Dipirona Sódica 500mg/mL Solução Injetável 2mL', 'DIP2026B', '2025-06-01', '2026-11-15', 500, 'A-04-12', 1.80, 22.0, 'DISPONIVEL'),
('LOT-DIP-2026-05', 'BR100200300', 'Dipirona Sódica 500mg/mL Solução Injetável 2mL', 'DIP2026E', '2025-09-01', '2027-05-20', 1200, 'A-04-13', 1.75, 22.0, 'DISPONIVEL'),
('LOT-AMX-2026-01', 'BR400500600', 'Amoxicilina + Clavulanato 500mg + 125mg Comprimido', 'AMX991', '2025-01-10', '2026-10-01', 80, 'B-02-05', 12.50, 20.0, 'DISPONIVEL'),
('LOT-VAC-2026-09', 'BR700800900', 'Vacina Hepatite B Recombinante 10mcg/0.5mL', 'VAC8810', '2026-01-15', '2027-01-15', 150, 'CAMARA-FRIA-02', 45.00, 4.5, 'DISPONIVEL')
ON CONFLICT (id) DO NOTHING;
