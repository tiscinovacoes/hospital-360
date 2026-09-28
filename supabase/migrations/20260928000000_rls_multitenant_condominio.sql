-- ============================================================================
-- HOSPITAL 360 — MIGRATION DE SEGURANÇA E RLS MULTI-TENANT (NORMA RN-IND)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('CONDOMINIO_CENTRAL', 'CLINICA_INDEPENDENTE', 'LABORATORIO_EXTERNO')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.despesas_door_to_door (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    id_transacao VARCHAR(100) NOT NULL UNIQUE,
    paciente_cpf VARCHAR(14) NOT NULL,
    paciente_nome VARCHAR(255) NOT NULL,
    prontuario_episodio VARCHAR(100) NOT NULL,
    centro_custo VARCHAR(100) NOT NULL,
    leito_identificador VARCHAR(100),
    item_codigo VARCHAR(100) NOT NULL,
    item_descricao VARCHAR(255) NOT NULL,
    lote_fabricante VARCHAR(100),
    quantidade NUMERIC(12, 4) NOT NULL DEFAULT 1,
    unidade_medida VARCHAR(20) NOT NULL DEFAULT 'UN',
    valor_unitario_medio NUMERIC(12, 4) NOT NULL DEFAULT 0.00,
    valor_total_imputado NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    data_consumo TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    origem_modulo VARCHAR(100) NOT NULL,
    estacao_jornada INT NOT NULL CHECK (estacao_jornada BETWEEN 1 AND 5),
    metadados JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ingestao_eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    formato_origem VARCHAR(50) NOT NULL,
    centro_custo_id VARCHAR(100) NOT NULL,
    cpf_paciente VARCHAR(14),
    nome_paciente VARCHAR(255),
    descricao TEXT NOT NULL,
    valor NUMERIC(12, 2) NOT NULL CHECK (valor >= 0),
    quantidade INT DEFAULT 1 CHECK (quantidade > 0),
    lote VARCHAR(100),
    validade DATE,
    data_registro TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'PROCESSADO' CHECK (status IN ('PROCESSADO', 'ERRO_VALIDACAO', 'CANCELADO')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jornada_doortodoor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    paciente_id VARCHAR(100) NOT NULL,
    estacao VARCHAR(50) NOT NULL CHECK (estacao IN ('TRIAGEM', 'CONSULTA', 'EXAME', 'FARMACIA_LEITO', 'CHECKOUT')),
    custo_acumulado NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    detalhes_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas_door_to_door ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestao_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_doortodoor ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'tenant_id')::uuid,
        (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role')::text,
        (current_setting('request.jwt.claims', true)::jsonb ->> 'role')::text,
        'ANONYMOUS'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

DROP POLICY IF EXISTS rls_despesas_tenant_isolation ON public.despesas_door_to_door;
CREATE POLICY rls_despesas_tenant_isolation ON public.despesas_door_to_door
    FOR ALL
    USING (
        tenant_id = public.get_current_tenant_id() OR 
        public.get_current_user_role() = 'SUPERADMIN'
    )
    WITH CHECK (
        tenant_id = public.get_current_tenant_id() OR 
        public.get_current_user_role() = 'SUPERADMIN'
    );

DROP POLICY IF EXISTS rls_ingestao_tenant_isolation ON public.ingestao_eventos;
CREATE POLICY rls_ingestao_tenant_isolation ON public.ingestao_eventos
    FOR ALL
    USING (
        tenant_id = public.get_current_tenant_id() OR 
        public.get_current_user_role() = 'SUPERADMIN'
    )
    WITH CHECK (
        tenant_id = public.get_current_tenant_id() OR 
        public.get_current_user_role() = 'SUPERADMIN'
    );

DROP POLICY IF EXISTS rls_jornada_tenant_isolation ON public.jornada_doortodoor;
CREATE POLICY rls_jornada_tenant_isolation ON public.jornada_doortodoor
    FOR ALL
    USING (
        tenant_id = public.get_current_tenant_id() OR 
        public.get_current_user_role() = 'SUPERADMIN'
    )
    WITH CHECK (
        tenant_id = public.get_current_tenant_id() OR 
        public.get_current_user_role() = 'SUPERADMIN'
    );

DROP POLICY IF EXISTS rls_tenants_read ON public.tenants;
CREATE POLICY rls_tenants_read ON public.tenants
    FOR SELECT
    USING (
        id = public.get_current_tenant_id() OR 
        public.get_current_user_role() IN ('CONDOMINIO_ADMIN', 'SUPERADMIN')
    );
