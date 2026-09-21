-- =====================================================================
-- HOSPITAL 360 - MIGRAÇÃO MÓDULOS EXPANDIDOS
-- 1. Compras Públicas & Gestão de Atas (ARP - Lei 14.133/21)
-- 2. Estoque Central & Centro de Distribuição (Vigia Saúde)
-- 3. Escala Médica & Plantonistas (GPS <100m, CRM/ATLS, Trocas, PIX D+0 & CNAB)
-- Schema: satelites
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS satelites;

-- =====================================================================
-- SEÇÃO 1: COMPRAS PÚBLICAS & GESTÃO DE ATAS (ARP)
-- =====================================================================

CREATE TABLE IF NOT EXISTS satelites.atas_registro_preco (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    numero_ata VARCHAR(60) NOT NULL,
    processo_licitatorio VARCHAR(60) NOT NULL,
    modalidade VARCHAR(40) DEFAULT 'PREGAO_SRP', -- PREGAO_SRP, DISPENSA_EMERGENCIAL, INEXIGIBILIDADE
    orgao_gerenciador VARCHAR(200) NOT NULL,
    fornecedor_cnpj VARCHAR(18) NOT NULL,
    fornecedor_razao_social VARCHAR(255) NOT NULL,
    data_assinatura DATE NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE NOT NULL,
    valor_total_homologado NUMERIC(15, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'VIGENTE' CHECK (status IN ('VIGENTE', 'ESGOTADA', 'VENCIDA', 'CANCELADA')),
    limite_carona_orgao_pct NUMERIC(5, 2) DEFAULT 50.00, -- Lei 14.133 limite individual
    limite_carona_global_pct NUMERIC(5, 2) DEFAULT 100.00, -- Limite total caronas
    criado_em TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_tenant_numero_ata UNIQUE (tenant_id, numero_ata)
);

CREATE TABLE IF NOT EXISTS satelites.itens_ata_registro_preco (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    ata_id UUID NOT NULL REFERENCES satelites.atas_registro_preco(id) ON DELETE CASCADE,
    item_numero INT NOT NULL,
    codigo_catmat VARCHAR(30) NOT NULL,
    descricao_medicamento VARCHAR(255) NOT NULL,
    principio_ativo VARCHAR(255) NOT NULL,
    concentracao VARCHAR(100),
    forma_farmaceutica VARCHAR(100),
    unidade_fornecimento VARCHAR(30) NOT NULL,
    quantidade_total_registrada NUMERIC(12, 3) NOT NULL CHECK (quantidade_total_registrada > 0),
    quantidade_consumida NUMERIC(12, 3) DEFAULT 0 CHECK (quantidade_consumida >= 0),
    preco_unitario_homologado NUMERIC(12, 4) NOT NULL CHECK (preco_unitario_homologado > 0),
    preco_teto_cmed NUMERIC(12, 4) NOT NULL,
    preco_referencia_bps NUMERIC(12, 4) NOT NULL,
    bloqueio_sobrepreco BOOLEAN DEFAULT false,
    criado_em TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_ata_item UNIQUE (ata_id, item_numero)
);

CREATE TABLE IF NOT EXISTS satelites.pedidos_empenho_ata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    ata_id UUID NOT NULL REFERENCES satelites.atas_registro_preco(id),
    item_id UUID NOT NULL REFERENCES satelites.itens_ata_registro_preco(id),
    numero_empenho VARCHAR(50) NOT NULL,
    orgao_demandante VARCHAR(200) NOT NULL,
    tipo_adesao VARCHAR(30) NOT NULL CHECK (tipo_adesao IN ('ORGAO_GERENCIADOR', 'ORGAO_PARTICIPANTE', 'CARONA_ADESAO')),
    quantidade_solicitada NUMERIC(12, 3) NOT NULL CHECK (quantidade_solicitada > 0),
    valor_total_empenho NUMERIC(15, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'EMPENHADO' CHECK (status IN ('SOLICITADO', 'EMPENHADO', 'ENTREGUE_ALMOXARIFADO', 'LIQUIDADO', 'CANCELADO')),
    data_solicitacao TIMESTAMPTZ DEFAULT now(),
    data_entrega_prevista DATE
);

-- =====================================================================
-- SEÇÃO 2: ESTOQUE CENTRAL & CENTRO DE DISTRIBUIÇÃO (CD)
-- =====================================================================

CREATE TABLE IF NOT EXISTS satelites.locais_armazenamento_cd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    codigo_local VARCHAR(30) NOT NULL,
    nome_local VARCHAR(120) NOT NULL,
    tipo_local VARCHAR(50) NOT NULL, -- CD_CENTRAL, FARMACIA_SATELITE_UTI, FARMACIA_SATELITE_PS, CAMARA_FRIA
    temperatura_min_celsius NUMERIC(4, 1) DEFAULT 15.0,
    temperatura_max_celsius NUMERIC(4, 1) DEFAULT 25.0,
    umidade_max_pct NUMERIC(4, 1) DEFAULT 60.0,
    responsavel_farmaceutico VARCHAR(150),
    crf_responsavel VARCHAR(30),
    ativo BOOLEAN DEFAULT true,
    CONSTRAINT uq_tenant_codigo_local UNIQUE (tenant_id, codigo_local)
);

CREATE TABLE IF NOT EXISTS satelites.movimentacoes_transferencias_cd (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    codigo_transferencia VARCHAR(50) NOT NULL,
    local_origem_id UUID NOT NULL REFERENCES satelites.locais_armazenamento_cd(id),
    local_destino_id UUID NOT NULL REFERENCES satelites.locais_armazenamento_cd(id),
    codigo_medicamento VARCHAR(50) NOT NULL,
    nome_medicamento VARCHAR(255) NOT NULL,
    lote_id VARCHAR(50) NOT NULL,
    data_validade DATE NOT NULL,
    quantidade_transferida NUMERIC(12, 3) NOT NULL CHECK (quantidade_transferida > 0),
    temperatura_transporte_ok BOOLEAN DEFAULT true,
    status VARCHAR(30) DEFAULT 'EM_TRANSITO' CHECK (status IN ('EM_TRANSITO', 'RECEBIDO_SATELITE', 'RETORNADO_QUARENTENA', 'AVARIA_EXTRAVIO')),
    solicitante_nome VARCHAR(100),
    recebedor_nome VARCHAR(100),
    data_despacho TIMESTAMPTZ DEFAULT now(),
    data_recebimento TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS satelites.quarentena_inspecoes_lote (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    lote_id VARCHAR(50) NOT NULL,
    codigo_medicamento VARCHAR(50) NOT NULL,
    motivo_quarentena VARCHAR(255) NOT NULL, -- DESVIO_TEMPERATURA, RECOLHIMENTO_ANVISA, AVARIA_EMBALAGEM, DIVERGENCIA_NF
    quantidade_bloqueada NUMERIC(12, 3) NOT NULL,
    farmaceutico_auditor VARCHAR(150) NOT NULL,
    crf_auditor VARCHAR(30) NOT NULL,
    laudo_tecnico TEXT,
    decisao_final VARCHAR(30) DEFAULT 'EM_ANALISE' CHECK (decisao_final IN ('EM_ANALISE', 'LIBERADO_USO', 'DEVOLVIDO_FORNECEDOR', 'INCINERACAO')),
    criado_em TIMESTAMPTZ DEFAULT now(),
    concluido_em TIMESTAMPTZ
);

-- =====================================================================
-- SEÇÃO 3: ESCALA MÉDICA, CHECK-IN GPS/BIOMETRIA & ANTECIPAÇÃO FINANCEIRA
-- =====================================================================

CREATE TABLE IF NOT EXISTS satelites.medicos_corpo_clinico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    nome_completo VARCHAR(200) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    crm VARCHAR(20) NOT NULL,
    uf_crm VARCHAR(2) NOT NULL,
    especialidade_principal VARCHAR(100) NOT NULL,
    rqe VARCHAR(30),
    email VARCHAR(150) NOT NULL,
    telefone_whatsapp VARCHAR(30) NOT NULL,
    status_crm_cfm VARCHAR(20) DEFAULT 'REGULAR', -- REGULAR, SUSPENSO, CANCELADO
    validade_atls DATE,
    validade_acls DATE,
    validade_pals DATE,
    apolice_seguro_rc VARCHAR(60),
    chave_pix VARCHAR(100),
    tipo_chave_pix VARCHAR(20) DEFAULT 'CPF',
    dados_bancarios_cnab JSONB DEFAULT '{}'::JSONB,
    ativo BOOLEAN DEFAULT true,
    CONSTRAINT uq_tenant_medico_cpf UNIQUE (tenant_id, cpf),
    CONSTRAINT uq_tenant_medico_crm UNIQUE (tenant_id, crm, uf_crm)
);

CREATE TABLE IF NOT EXISTS satelites.escalas_plantoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    setor VARCHAR(80) NOT NULL,
    data_plantao DATE NOT NULL,
    turno VARCHAR(30) NOT NULL CHECK (turno IN ('DIURNO_07_19', 'NOTURNO_19_07', 'CORUJÃO_12H', 'PLANTÃO_24H')),
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    medico_titular_id UUID NOT NULL REFERENCES satelites.medicos_corpo_clinico(id),
    medico_efetivo_id UUID REFERENCES satelites.medicos_corpo_clinico(id),
    valor_bruto_plantao NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'CONFIRMADO' CHECK (status IN ('CONFIRMADO', 'SUBSTITUIDO', 'EM_ANDAMENTO', 'CONCLUIDO_OK', 'FALTA_SEM_SUBSTITUTO')),
    criado_em TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS satelites.checkins_plantao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    escala_id UUID NOT NULL REFERENCES satelites.escalas_plantoes(id),
    medico_id UUID NOT NULL REFERENCES satelites.medicos_corpo_clinico(id),
    tipo_evento VARCHAR(20) NOT NULL CHECK (tipo_evento IN ('ENTRADA', 'SAIDA')),
    timestamp_evento TIMESTAMPTZ DEFAULT now(),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    distancia_geofence_metros NUMERIC(8, 2) NOT NULL,
    precisao_gps_metros NUMERIC(6, 2) NOT NULL,
    metodo_validacao VARCHAR(30) DEFAULT 'GPS_BIOMETRIA_FACIAL' CHECK (metodo_validacao IN ('GPS_BIOMETRIA_FACIAL', 'QR_CODE_TOTEM', 'GEOLOCALIZACAO_APP')),
    biometria_score NUMERIC(5, 2) DEFAULT 98.50,
    validado_no_raio_permitido BOOLEAN DEFAULT true,
    observacao TEXT
);

CREATE TABLE IF NOT EXISTS satelites.solicitacoes_troca_plantao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    escala_id UUID NOT NULL REFERENCES satelites.escalas_plantoes(id),
    medico_solicitante_id UUID NOT NULL REFERENCES satelites.medicos_corpo_clinico(id),
    medico_substituto_id UUID NOT NULL REFERENCES satelites.medicos_corpo_clinico(id),
    motivo TEXT NOT NULL,
    crm_valido_substituto BOOLEAN DEFAULT true,
    atls_acls_valido_substituto BOOLEAN DEFAULT true,
    status VARCHAR(30) DEFAULT 'PENDENTE_COORDENACAO' CHECK (status IN ('PENDENTE_ACEITE_SUBSTITUTO', 'PENDENTE_COORDENACAO', 'APROVADA', 'REJEITADA')),
    aprovado_por_coordenador VARCHAR(150),
    data_solicitacao TIMESTAMPTZ DEFAULT now(),
    data_resposta TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS satelites.pagamentos_antecipacao_plantao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    escala_id UUID NOT NULL REFERENCES satelites.escalas_plantoes(id),
    medico_id UUID NOT NULL REFERENCES satelites.medicos_corpo_clinico(id),
    valor_bruto NUMERIC(10, 2) NOT NULL,
    taxa_desagio_pct NUMERIC(5, 2) DEFAULT 3.50,
    valor_liquido NUMERIC(10, 2) NOT NULL,
    metodo_liquidacao VARCHAR(30) NOT NULL CHECK (metodo_liquidacao IN ('PIX_INSTANTANEO_D0', 'REMESSA_BANCARIA_CNAB240', 'FOLHA_MENSAL')),
    chave_pix_utilizada VARCHAR(100),
    lote_cnab_numero VARCHAR(30),
    status VARCHAR(30) DEFAULT 'PROCESSANDO' CHECK (status IN ('SOLICITADO', 'PROCESSANDO', 'PAGO_PIX_SUCESSO', 'INCLUIDO_LOTE_CNAB', 'FALHA')),
    comprovante_id VARCHAR(100),
    data_solicitacao TIMESTAMPTZ DEFAULT now(),
    data_liquidacao TIMESTAMPTZ
);

-- =====================================================================
-- SEÇÃO 4: ÍNDICES DE PERFORMANCE E INTEGRIDADE
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_atas_vigencia ON satelites.atas_registro_preco (vigencia_fim, status);
CREATE INDEX IF NOT EXISTS idx_itens_ata_catmat ON satelites.itens_ata_registro_preco (codigo_catmat);
CREATE INDEX IF NOT EXISTS idx_escalas_data_setor ON satelites.escalas_plantoes (data_plantao, setor, status);
CREATE INDEX IF NOT EXISTS idx_checkins_escala ON satelites.checkins_plantao (escala_id, medico_id);
CREATE INDEX IF NOT EXISTS idx_medicos_validade_cert ON satelites.medicos_corpo_clinico (validade_atls, validade_acls, validade_pals);
CREATE INDEX IF NOT EXISTS idx_mov_cd_lote ON satelites.movimentacoes_transferencias_cd (lote_id, status);

-- RLS Básico
ALTER TABLE satelites.atas_registro_preco ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.itens_ata_registro_preco ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.pedidos_empenho_ata ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.locais_armazenamento_cd ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.movimentacoes_transferencias_cd ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.quarentena_inspecoes_lote ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.medicos_corpo_clinico ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.escalas_plantoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.checkins_plantao ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.solicitacoes_troca_plantao ENABLE ROW LEVEL SECURITY;
ALTER TABLE satelites.pagamentos_antecipacao_plantao ENABLE ROW LEVEL SECURITY;
