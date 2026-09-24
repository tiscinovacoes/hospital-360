-- ============================================================================
-- Migration: 20260924000002_estoque_caf_ubs_schema.sql
-- Escopo Exclusivo: schema satelites (Antigravity)
-- Objetivo: Estrutura Completa de Estoque Central (CAF) + 9 Farmácias UBS
--           de Itaquiraí-MS, com CATMAT, fracionamento, razão imutável,
--           saldos com trava pessimista, FEFO justificado e RLS em todas as tabelas.
-- ============================================================================

-- Habilita extensão para busca fonética/trigram se disponível
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA public;

-- 1. CATÁLOGO CATMAT OFICIAL (Global no Satélites)
CREATE TABLE IF NOT EXISTS satelites.catmat_itens (
  codigo_catmat VARCHAR(32) PRIMARY KEY,
  descricao TEXT NOT NULL,
  unidade_fornecimento VARCHAR(64),
  classe_pdm VARCHAR(128) DEFAULT 'DROGAS E MEDICAMENTOS',
  codigo_pdm INT,
  nome_pdm VARCHAR(255),
  ativo BOOLEAN DEFAULT TRUE,
  sustentavel BOOLEAN DEFAULT FALSE,
  codigo_ncm VARCHAR(32),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catmat_descricao_gin 
  ON satelites.catmat_itens USING gin (descricao public.gin_trgm_ops);

-- 2. MEDICAMENTO PADRONIZADO MUNICIPAL (POR TENANT)
CREATE TABLE IF NOT EXISTS satelites.produtos_farmacia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  codigo_catmat VARCHAR(32) NOT NULL REFERENCES satelites.catmat_itens(codigo_catmat),
  nome VARCHAR(255) NOT NULL,
  principio_ativo VARCHAR(255),
  concentracao VARCHAR(128),
  forma_farmaceutica VARCHAR(128),
  unidade_base VARCHAR(32) NOT NULL, -- Menor unidade dispensavel (comprimido, ampola, capsula, ml, frasco)
  controlado BOOLEAN DEFAULT FALSE,  -- Portaria 344
  termolabil BOOLEAN DEFAULT FALSE,  -- Cadeia de frio 2ºC a 8ºC
  estoque_minimo_padrao INT DEFAULT 100,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_produto_tenant_catmat UNIQUE (tenant_id, codigo_catmat)
);

-- 3. HIERARQUIA DE EMBALAGENS E FATOR DE FRACIONAMENTO
CREATE TABLE IF NOT EXISTS satelites.produto_embalagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  produto_id UUID NOT NULL REFERENCES satelites.produtos_farmacia(id) ON DELETE CASCADE,
  tipo_embalagem VARCHAR(64) NOT NULL, -- Ex: CAIXA, BLISTER, CARTELA, FRASCO, COMPRIMIDO
  fator_conversao_base INT NOT NULL CHECK (fator_conversao_base >= 1),
  codigo_barras VARCHAR(64),
  padrao_entrada BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_embalagem_produto_tipo UNIQUE (tenant_id, produto_id, tipo_embalagem)
);

-- 4. LOCAIS DE ESTOQUE (CAF + 9 UBS DE ITAQUIRAÍ-MS)
CREATE TABLE IF NOT EXISTS satelites.locais_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  tipo VARCHAR(32) NOT NULL CHECK (tipo IN ('CAF', 'FARMACIA_UBS')),
  nome VARCHAR(255) NOT NULL,
  cnes VARCHAR(16),
  endereco TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_local_tenant_nome UNIQUE (tenant_id, nome)
);

-- 5. VÍNCULO USUÁRIO x LOCAL (CONTROLE DE ACESSO POR LOCALIDADE)
CREATE TABLE IF NOT EXISTS satelites.usuarios_locais_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  local_id UUID NOT NULL REFERENCES satelites.locais_estoque(id) ON DELETE CASCADE,
  perfil VARCHAR(32) NOT NULL CHECK (perfil IN ('ESTOQUISTA_CAF', 'CONFERENTE', 'FARMACEUTICO_UBS', 'GESTOR_MUNICIPAL')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_usuario_local UNIQUE (tenant_id, usuario_id, local_id)
);

-- 6. LOTES DE MEDICAMENTOS
CREATE TABLE IF NOT EXISTS satelites.lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  produto_id UUID NOT NULL REFERENCES satelites.produtos_farmacia(id) ON DELETE CASCADE,
  numero_lote VARCHAR(64) NOT NULL,
  fabricante VARCHAR(255),
  data_fabricacao DATE,
  data_validade DATE NOT NULL,
  nfe_origem VARCHAR(64),
  custo_unitario_base NUMERIC(12,4) DEFAULT 0 CHECK (custo_unitario_base >= 0),
  status VARCHAR(32) NOT NULL DEFAULT 'LIBERADO' CHECK (status IN ('LIBERADO', 'QUARENTENA', 'BLOQUEADO_RECALL', 'VENCIDO')),
  motivo_bloqueio TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_lote_produto UNIQUE (tenant_id, produto_id, numero_lote)
);

CREATE INDEX IF NOT EXISTS idx_lotes_validade ON satelites.lotes(data_validade ASC);
CREATE INDEX IF NOT EXISTS idx_lotes_status ON satelites.lotes(status);

-- 7. SALDOS POR LOTE E LOCAL (INTEIROS NA UNIDADE BASE, >= 0)
CREATE TABLE IF NOT EXISTS satelites.saldos_lote_local (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  lote_id UUID NOT NULL REFERENCES satelites.lotes(id) ON DELETE CASCADE,
  local_id UUID NOT NULL REFERENCES satelites.locais_estoque(id) ON DELETE CASCADE,
  quantidade INT NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_saldo_lote_local UNIQUE (lote_id, local_id)
);

CREATE INDEX IF NOT EXISTS idx_saldos_local ON satelites.saldos_lote_local(local_id);
CREATE INDEX IF NOT EXISTS idx_saldos_lote ON satelites.saldos_lote_local(lote_id);

-- 8. RAZÃO IMUTÁVEL DE MOVIMENTAÇÕES (LEDGER)
CREATE TABLE IF NOT EXISTS satelites.movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  tipo VARCHAR(64) NOT NULL CHECK (tipo IN (
    'ENTRADA_NF', 'TRANSFERENCIA_SAIDA', 'TRANSFERENCIA_ENTRADA',
    'DISPENSACAO', 'AJUSTE_INVENTARIO', 'PERDA', 'VENCIMENTO', 'RECALL', 'DEVOLUCAO'
  )),
  lote_id UUID NOT NULL REFERENCES satelites.lotes(id),
  local_origem_id UUID REFERENCES satelites.locais_estoque(id),
  local_destino_id UUID REFERENCES satelites.locais_estoque(id),
  quantidade INT NOT NULL CHECK (quantidade > 0),
  usuario_id TEXT,
  documento_referencia TEXT,
  justificativa TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mov_lote ON satelites.movimentacoes(lote_id);
CREATE INDEX IF NOT EXISTS idx_mov_criado_em ON satelites.movimentacoes(criado_em DESC);

-- 9. SOLICITAÇÕES UBS -> CAF
CREATE TABLE IF NOT EXISTS satelites.solicitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  numero_solicitacao VARCHAR(32) NOT NULL,
  local_origem_id UUID NOT NULL REFERENCES satelites.locais_estoque(id), -- CAF
  local_solicitante_id UUID NOT NULL REFERENCES satelites.locais_estoque(id), -- UBS
  status VARCHAR(32) NOT NULL DEFAULT 'RASCUNHO' CHECK (status IN (
    'RASCUNHO', 'ENVIADA', 'EM_SEPARACAO', 'LIBERADA', 'RECEBIDA',
    'RECEBIDA_COM_DIVERGENCIA', 'CANCELADA'
  )),
  solicitado_por TEXT,
  observacoes TEXT,
  divergencia_motivo TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_solicitacao_numero UNIQUE (tenant_id, numero_solicitacao)
);

CREATE TABLE IF NOT EXISTS satelites.solicitacao_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  solicitacao_id UUID NOT NULL REFERENCES satelites.solicitacoes(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES satelites.produtos_farmacia(id),
  quantidade_solicitada INT NOT NULL CHECK (quantidade_solicitada > 0),
  quantidade_aprovada INT DEFAULT 0 CHECK (quantidade_aprovada >= 0),
  quantidade_separada INT DEFAULT 0 CHECK (quantidade_separada >= 0),
  quantidade_recebida INT DEFAULT 0 CHECK (quantidade_recebida >= 0),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ITENS DE SEPARAÇÃO COM AUDITORIA FEFO & OVERRIDE
CREATE TABLE IF NOT EXISTS satelites.separacao_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  solicitacao_item_id UUID NOT NULL REFERENCES satelites.solicitacao_itens(id) ON DELETE CASCADE,
  lote_id UUID NOT NULL REFERENCES satelites.lotes(id),
  lote_sugerido_id UUID REFERENCES satelites.lotes(id),
  quantidade INT NOT NULL CHECK (quantidade > 0),
  fora_fefo BOOLEAN DEFAULT FALSE,
  justificativa TEXT,
  separado_por TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MAPEAMENTO HISTÓRICO FORNECEDOR -> CATMAT / PRODUTO
CREATE TABLE IF NOT EXISTS satelites.fornecedor_produto_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  cnpj_fornecedor VARCHAR(20) NOT NULL,
  codigo_produto_fornecedor VARCHAR(64) NOT NULL,
  produto_id UUID NOT NULL REFERENCES satelites.produtos_farmacia(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_fornecedor_prod_map UNIQUE (tenant_id, cnpj_fornecedor, codigo_produto_fornecedor)
);

-- 12. INVENTÁRIO FÍSICO / CONTAGEM CEGA
CREATE TABLE IF NOT EXISTS satelites.inventarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  local_id UUID NOT NULL REFERENCES satelites.locais_estoque(id),
  status VARCHAR(32) NOT NULL DEFAULT 'EM_ANDAMENTO' CHECK (status IN (
    'EM_ANDAMENTO', 'FINALIZADO', 'APROVADO_GESTOR', 'CANCELADO'
  )),
  responsavel TEXT NOT NULL,
  data_inicio TIMESTAMPTZ DEFAULT NOW(),
  data_fim TIMESTAMPTZ,
  aprovado_por TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS satelites.inventario_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  inventario_id UUID NOT NULL REFERENCES satelites.inventarios(id) ON DELETE CASCADE,
  lote_id UUID NOT NULL REFERENCES satelites.lotes(id),
  quantidade_sistema_cega INT NOT NULL,
  quantidade_contada INT,
  divergencia INT,
  justificativa TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FUNÇÃO TRANSACIONAL PARA MOVIMENTAÇÃO DE ESTOQUE
--     Garante atomicidade, bloqueio pessimista (FOR UPDATE) e razão imutável.
CREATE OR REPLACE FUNCTION satelites.movimentar_estoque(
  p_tenant_id UUID,
  p_tipo VARCHAR,
  p_lote_id UUID,
  p_local_origem_id UUID,
  p_local_destino_id UUID,
  p_quantidade INT,
  p_usuario_id TEXT,
  p_documento_referencia TEXT DEFAULT NULL,
  p_justificativa TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = satelites, pg_temp
AS $$
DECLARE
  v_saldo_atual INT;
  v_movimentacao_id UUID;
  v_status_lote VARCHAR;
BEGIN
  IF p_quantidade <= 0 THEN
    RAISE EXCEPTION 'A quantidade movimentada deve ser maior que zero.';
  END IF;

  -- Verifica status do lote
  SELECT status INTO v_status_lote FROM satelites.lotes WHERE id = p_lote_id AND tenant_id = p_tenant_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lote % inexistente no tenant informado.', p_lote_id;
  END IF;

  IF v_status_lote IN ('BLOQUEADO_RECALL', 'VENCIDO') AND p_tipo NOT IN ('RECALL', 'VENCIMENTO', 'PERDA') THEN
    RAISE EXCEPTION 'Lote com status % bloqueado para operacao %.', v_status_lote, p_tipo;
  END IF;

  -- 1. Operações de Saída: Verifica e subtrai saldo da origem com lock
  IF p_local_origem_id IS NOT NULL THEN
    SELECT quantidade INTO v_saldo_atual
    FROM satelites.saldos_lote_local
    WHERE lote_id = p_lote_id AND local_id = p_local_origem_id AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF v_saldo_atual IS NULL OR v_saldo_atual < p_quantidade THEN
      RAISE EXCEPTION 'Saldo insuficiente no local de origem (Saldo: %, Solicitado: %).', COALESCE(v_saldo_atual, 0), p_quantidade;
    END IF;

    UPDATE satelites.saldos_lote_local
    SET quantidade = quantidade - p_quantidade,
        atualizado_em = NOW()
    WHERE lote_id = p_lote_id AND local_id = p_local_origem_id AND tenant_id = p_tenant_id;
  END IF;

  -- 2. Operações de Entrada: Credita saldo no destino
  IF p_local_destino_id IS NOT NULL THEN
    INSERT INTO satelites.saldos_lote_local (tenant_id, lote_id, local_id, quantidade, atualizado_em)
    VALUES (p_tenant_id, p_lote_id, p_local_destino_id, p_quantidade, NOW())
    ON CONFLICT (lote_id, local_id)
    DO UPDATE SET 
      quantidade = satelites.saldos_lote_local.quantidade + p_quantidade,
      atualizado_em = NOW();
  END IF;

  -- 3. Insere registro imutável no ledger
  INSERT INTO satelites.movimentacoes (
    tenant_id, tipo, lote_id, local_origem_id, local_destino_id,
    quantidade, usuario_id, documento_referencia, justificativa, criado_em
  ) VALUES (
    p_tenant_id, p_tipo, p_lote_id, p_local_origem_id, p_local_destino_id,
    p_quantidade, p_usuario_id, p_documento_referencia, p_justificativa, NOW()
  ) RETURNING id INTO v_movimentacao_id;

  RETURN jsonb_build_object(
    'status', 'SUCESSO',
    'movimentacao_id', v_movimentacao_id,
    'tipo', p_tipo,
    'quantidade', p_quantidade,
    'lote_id', p_lote_id,
    'origem_id', p_local_origem_id,
    'destino_id', p_local_destino_id
  );
END;
$$;

-- Revoga explicitamente permissão da role pública/anon para a procedure transacional
REVOKE EXECUTE ON FUNCTION satelites.movimentar_estoque FROM public, anon;
GRANT EXECUTE ON FUNCTION satelites.movimentar_estoque TO authenticated;

-- 14. HABILITAÇÃO DE RLS EM TODAS AS NOVAS TABELAS
ALTER TABLE satelites.catmat_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.produtos_farmacia ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.produto_embalagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.locais_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.usuarios_locais_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.saldos_lote_local ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.solicitacao_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.separacao_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.fornecedor_produto_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.inventarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.inventario_itens ENABLE ROW LEVEL SECURITY;

-- 15. POLICIES MULTI-TENANT E DE LOCALIDADE
-- Catmat é catálogo oficial do governo: leitura liberada a todos os autenticados
DROP POLICY IF EXISTS catmat_itens_read_all ON satelites.catmat_itens;
CREATE POLICY catmat_itens_read_all ON satelites.catmat_itens
  FOR SELECT TO authenticated USING (true);

-- Produtos Farmácia
DROP POLICY IF EXISTS produtos_farmacia_tenant_isolation ON satelites.produtos_farmacia;
CREATE POLICY produtos_farmacia_tenant_isolation ON satelites.produtos_farmacia
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Embalagens
DROP POLICY IF EXISTS produto_embalagens_tenant_isolation ON satelites.produto_embalagens;
CREATE POLICY produto_embalagens_tenant_isolation ON satelites.produto_embalagens
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Locais de Estoque
DROP POLICY IF EXISTS locais_estoque_tenant_isolation ON satelites.locais_estoque;
CREATE POLICY locais_estoque_tenant_isolation ON satelites.locais_estoque
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Lotes
DROP POLICY IF EXISTS lotes_tenant_isolation ON satelites.lotes;
CREATE POLICY lotes_tenant_isolation ON satelites.lotes
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Saldos por Lote/Local
DROP POLICY IF EXISTS saldos_tenant_isolation ON satelites.saldos_lote_local;
CREATE POLICY saldos_tenant_isolation ON satelites.saldos_lote_local
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Razão Imutável (Movimentações): Apenas SELECT e INSERT permitidos via policy
DROP POLICY IF EXISTS movimentacoes_tenant_read ON satelites.movimentacoes;
CREATE POLICY movimentacoes_tenant_read ON satelites.movimentacoes
  FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS movimentacoes_tenant_insert ON satelites.movimentacoes;
CREATE POLICY movimentacoes_tenant_insert ON satelites.movimentacoes
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Solicitações e Separações
DROP POLICY IF EXISTS solicitacoes_tenant_isolation ON satelites.solicitacoes;
CREATE POLICY solicitacoes_tenant_isolation ON satelites.solicitacoes
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS solicitacao_itens_tenant_isolation ON satelites.solicitacao_itens;
CREATE POLICY solicitacao_itens_tenant_isolation ON satelites.solicitacao_itens
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS separacao_itens_tenant_isolation ON satelites.separacao_itens;
CREATE POLICY separacao_itens_tenant_isolation ON satelites.separacao_itens
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Mapeamento e Inventário
DROP POLICY IF EXISTS fornecedor_map_tenant_isolation ON satelites.fornecedor_produto_map;
CREATE POLICY fornecedor_map_tenant_isolation ON satelites.fornecedor_produto_map
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS inventarios_tenant_isolation ON satelites.inventarios;
CREATE POLICY inventarios_tenant_isolation ON satelites.inventarios
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS inventario_itens_tenant_isolation ON satelites.inventario_itens;
CREATE POLICY inventario_itens_tenant_isolation ON satelites.inventario_itens
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- 16. SEED OFICIAL: 1 CAF + 9 UBS DE ITAQUIRAÍ-MS
-- Utiliza o Tenant Piloto do Núcleo 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
INSERT INTO satelites.locais_estoque (id, tenant_id, tipo, nome, cnes, endereco) VALUES
  ('11111111-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CAF', 'Farmácia Central (CAF) - Gerência de Saúde', '5540887', 'Rua Campo Grande, Centro - Itaquiraí/MS'),
  ('11111111-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FARMACIA_UBS', 'UBS Flademir Carnizella da Rosa', '2374358', 'Av. Industrial, Bairro Jardim Primavera - Itaquiraí/MS'),
  ('11111111-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FARMACIA_UBS', 'USF João Batista Gallina', '2676842', 'Rua Mato Grosso, Bairro Nova Itaquiraí - Itaquiraí/MS'),
  ('11111111-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FARMACIA_UBS', 'USF Sul Bonito', '2558653', 'Assentamento Sul Bonito - Zona Rural, Itaquiraí/MS'),
  ('11111111-0000-0000-0000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FARMACIA_UBS', 'USF Santa Rosa', '2558637', 'Assentamento Santa Rosa - Zona Rural, Itaquiraí/MS'),
  ('11111111-0000-0000-0000-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FARMACIA_UBS', 'USF Complexo Santo Antônio', '7009496', 'Assentamento Santo Antônio - Polo Agrícola, Itaquiraí/MS'),
  ('11111111-0000-0000-0000-000000000007', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FARMACIA_UBS', 'USF Itaquiraí', '2558645', 'Rua das Flores, Centro - Itaquiraí/MS'),
  ('11111111-0000-0000-0000-000000000008', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FARMACIA_UBS', 'USF Primavera', '2597187', 'Bairro Primavera - Itaquiraí/MS'),
  ('11111111-0000-0000-0000-000000000009', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FARMACIA_UBS', 'USF Santo Antônio', '4649834', 'Estrada Rural Santo Antônio, Gleba A - Itaquiraí/MS'),
  ('11111111-0000-0000-0000-000000000010', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FARMACIA_UBS', 'USF de Nova Esperança', '4886917', 'Comunidade Nova Esperança - Zona Rural, Itaquiraí/MS')
ON CONFLICT (tenant_id, nome) DO UPDATE SET 
  cnes = EXCLUDED.cnes,
  endereco = EXCLUDED.endereco;
