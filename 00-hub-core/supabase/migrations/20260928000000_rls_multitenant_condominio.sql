-- ============================================================================
-- HOSPITAL 360 — MIGRATION DE SEGURANÇA E RLS MULTI-TENANT (NORMA RN-IND)
-- ============================================================================

-- 1. HABILITAR EXTENSÃO UUID SE NECESSÁRIO
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE TENANTS (CONDOMÍNIO HOSPITALAR E CLÍNICAS PARCEIRAS)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('CONDOMINIO_CENTRAL', 'CLINICA_INDEPENDENTE', 'LABORATORIO_EXTERNO')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE EVENTOS DE INGESTÃO (INGESTION BUS)
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

-- 4. TABELA DE JORNADA DOOR-TO-DOOR (CUSTEIO PACIENTE)
CREATE TABLE IF NOT EXISTS public.jornada_doortodoor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    paciente_id VARCHAR(100) NOT NULL,
    estacao VARCHAR(50) NOT NULL CHECK (estacao IN ('TRIAGEM', 'CONSULTA', 'EXAME', 'FARMACIA_LEITO', 'CHECKOUT')),
    custo_acumulado NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    detalhes_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ============================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestao_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_doortodoor ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. POLÍTICAS DE ACESSO MULTI-TENANT (POLICIES)
-- ============================================================================

-- FUNÇÃO AUXILIAR PARA EXTRAIR TENANT_ID E ROLE DO JWT DO SUPABASE
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

-- POLÍTICAS PARA INGESTÃO DE EVENTOS:
-- Regra RN-IND: Clínica parceira enxerga APENAS os seus próprios eventos de ingestão
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

-- POLÍTICAS PARA JORNADA DOOR-TO-DOOR:
-- Condomínio Hospitalar Admin NÃO PODE VER dados médicos do paciente de clínicas parceiras.
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

-- POLÍTICAS PARA TENANTS:
DROP POLICY IF EXISTS rls_tenants_read ON public.tenants;
CREATE POLICY rls_tenants_read ON public.tenants
    FOR SELECT
    USING (
        id = public.get_current_tenant_id() OR 
        public.get_current_user_role() IN ('CONDOMINIO_ADMIN', 'SUPERADMIN')
    );

-- COMENTÁRIOS AUDITÁVEIS
COMMENT ON TABLE public.ingestao_eventos IS 'Eventos de ingestão de custos de ERPs legados isolados por Tenant RLS (RN-IND).';
COMMENT ON TABLE public.jornada_doortodoor IS 'Apuração do custo acumulado Door-to-Door isolado por tenant médico.';
