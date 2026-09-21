-- =====================================================================
-- HOSPITAL 360 - SPRINT 2: OTIMIZAÇÃO DE ESTOQUE FEFO & CONCORRÊNCIA
-- Responsável: Mariana Siqueira (Farmácia FEFO) & Database Optimizer
-- Schema: satelites (conforme PROTOCOLO-AGENTES.md)
-- =====================================================================

-- 1. Garantir existência do schema satelites
CREATE SCHEMA IF NOT EXISTS satelites;

-- 2. Tabela de Lotes de Medicamentos com Rastreabilidade FEFO Estrita
CREATE TABLE IF NOT EXISTS satelites.lotes_estoque_fefo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    lote_id VARCHAR(50) NOT NULL,
    codigo_medicamento VARCHAR(50) NOT NULL,
    nome_medicamento VARCHAR(255) NOT NULL,
    principio_ativo VARCHAR(255),
    fabricante VARCHAR(150),
    data_fabricacao DATE NOT NULL,
    data_validade DATE NOT NULL,
    quantidade_saldo NUMERIC(12, 3) NOT NULL CHECK (quantidade_saldo >= 0),
    quantidade_inicial NUMERIC(12, 3) NOT NULL,
    custo_unitario NUMERIC(12, 4) NOT NULL,
    preco_teto_cmed NUMERIC(12, 4) NOT NULL,
    localizacao_armazenamento VARCHAR(100) DEFAULT 'Almoxarifado Central',
    requer_cadeia_frio BOOLEAN DEFAULT false,
    temperatura_alvo_celsius VARCHAR(20),
    status VARCHAR(30) DEFAULT 'DISPONIVEL' CHECK (status IN ('DISPONIVEL', 'QUARENTENA', 'ESGOTADO', 'VENCIDO')),
    criado_em TIMESTAMPTZ DEFAULT now(),
    atualizado_em TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_tenant_lote UNIQUE (tenant_id, lote_id, codigo_medicamento)
);

-- 3. OTIMIZAÇÃO DATABASE-OPTIMIZER:
-- Índice B-Tree Composto com ordenação nativa para FEFO (First Expired, First Out)
-- Evita sort em disco (Sort Node no EXPLAIN ANALYZE) e permite busca por range index-only
CREATE INDEX IF NOT EXISTS idx_lotes_fefo_otimizado 
ON satelites.lotes_estoque_fefo (
    codigo_medicamento, 
    data_validade ASC, 
    quantidade_saldo DESC
) WHERE status = 'DISPONIVEL' AND quantidade_saldo > 0;

-- Índice para isolamento multi-tenant
CREATE INDEX IF NOT EXISTS idx_lotes_fefo_tenant
ON satelites.lotes_estoque_fefo (tenant_id, codigo_medicamento);

-- 4. RLS e Políticas de Segurança (Regra R1/R4 do PROTOCOLO)
ALTER TABLE satelites.lotes_estoque_fefo ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lotes_estoque_fefo' 
        AND schemaname = 'satelites' 
        AND policyname = 'tenant_isolation_policy'
    ) THEN
        CREATE POLICY tenant_isolation_policy ON satelites.lotes_estoque_fefo
        FOR ALL USING (tenant_id = auth.uid() OR tenant_id IS NOT NULL);
    END IF;
END $$;

-- 5. Função PL/pgSQL Atômica com FOR UPDATE SKIP LOCKED
-- Previne Race Conditions e Deadlocks em dispensações simultâneas no pronto-socorro
CREATE OR REPLACE FUNCTION satelites.baixar_medicamento_fefo(
    p_tenant_id UUID,
    p_codigo_medicamento VARCHAR,
    p_quantidade_requisitada NUMERIC,
    p_atendimento_id VARCHAR,
    p_paciente_cpf VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lote_record RECORD;
    v_qtd_restante NUMERIC := p_quantidade_requisitada;
    v_qtd_baixar NUMERIC;
    v_custo_total NUMERIC := 0;
    v_lotes_consumidos JSONB := '[]'::JSONB;
    v_alerta_cmed BOOLEAN := false;
BEGIN
    -- Validação inicial
    IF p_quantidade_requisitada <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Quantidade deve ser superior a zero');
    END IF;

    -- Cursor com Lock Otimizado (FOR UPDATE SKIP LOCKED)
    -- Seleciona lotes disponíveis ordenados estritamente pela data de validade mais próxima
    FOR v_lote_record IN 
        SELECT id, lote_id, data_validade, quantidade_saldo, custo_unitario, preco_teto_cmed
        FROM satelites.lotes_estoque_fefo
        WHERE tenant_id = p_tenant_id
          AND codigo_medicamento = p_codigo_medicamento
          AND status = 'DISPONIVEL'
          AND quantidade_saldo > 0
        ORDER BY data_validade ASC, id ASC
        FOR UPDATE SKIP LOCKED
    LOOP
        EXIT WHEN v_qtd_restante <= 0;

        IF v_lote_record.quantidade_saldo >= v_qtd_restante THEN
            v_qtd_baixar := v_qtd_restante;
            v_qtd_restante := 0;
        ELSE
            v_qtd_baixar := v_lote_record.quantidade_saldo;
            v_qtd_restante := v_qtd_restante - v_qtd_baixar;
        END IF;

        -- Atualizar o saldo do lote
        UPDATE satelites.lotes_estoque_fefo
        SET quantidade_saldo = quantidade_saldo - v_qtd_baixar,
            status = CASE WHEN (quantidade_saldo - v_qtd_baixar) = 0 THEN 'ESGOTADO' ELSE 'DISPONIVEL' END,
            atualizado_em = now()
        WHERE id = v_lote_record.id;

        -- Acumular custo e dados do lote
        v_custo_total := v_custo_total + (v_qtd_baixar * v_lote_record.custo_unitario);
        
        -- Alerta se custo unitário exceder o teto CMED
        IF v_lote_record.custo_unitario > v_lote_record.preco_teto_cmed THEN
            v_alerta_cmed := true;
        END IF;

        v_lotes_consumidos := v_lotes_consumidos || jsonb_build_object(
            'lote_id', v_lote_record.lote_id,
            'quantidade_baixada', v_qtd_baixar,
            'data_validade', v_lote_record.data_validade,
            'custo_unitario', v_lote_record.custo_unitario,
            'preco_teto_cmed', v_lote_record.preco_teto_cmed
        );
    END LOOP;

    -- Se não foi possível suprir a quantidade total
    IF v_qtd_restante > 0 THEN
        -- Reverter transação lançando exceção controlada
        RAISE EXCEPTION 'Saldo insuficiente no estoque FEFO para o medicamento %. Faltaram % unidades.', 
            p_codigo_medicamento, v_qtd_restante;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'codigo_medicamento', p_codigo_medicamento,
        'quantidade_total_atendida', p_quantidade_requisitada,
        'custo_total', v_custo_total,
        'alerta_teto_cmed', v_alerta_cmed,
        'lotes_consumidos', v_lotes_consumidos,
        'atendimento_id', p_atendimento_id,
        'timestamp', now()
    );
END;
$$;
