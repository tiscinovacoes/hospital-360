-- ==============================================================================
-- HOSPITAL 360 — SCRIPT DE INICIALIZAÇÃO MULTI-TENANT (SPRINT 1)
-- Responsáveis: Gabriel Martins (Core 360) & Mariana Siqueira (Estoque FEFO)
-- Aprovação: Lucas Reis (Líder Técnico Sênior)
-- ==============================================================================

-- 1. Extensões Obrigatórias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Schemas de Isolamento (RN-IND - Proteção Regulatória)
CREATE SCHEMA IF NOT EXISTS core_condominio;
CREATE SCHEMA IF NOT EXISTS clinica_sala204;

-- ==============================================================================
-- TABELAS DO CORE DO CONDOMÍNIO HOSPITALAR
-- ==============================================================================

-- Cadastro de Clínicas Cooperadas
CREATE TABLE IF NOT EXISTS core_condominio.clinicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_sala VARCHAR(20) UNIQUE NOT NULL, -- Ex: 'SALA_204'
    razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    medico_responsavel VARCHAR(150) NOT NULL,
    crm_uf VARCHAR(30) NOT NULL,
    percentual_repasse_medico NUMERIC(5,2) DEFAULT 85.00, -- 85% Médico
    percentual_taxa_condominio NUMERIC(5,2) DEFAULT 15.00, -- 15% Condomínio
    chave_pix_repasse VARCHAR(100) NOT NULL,
    schema_banco_isolado VARCHAR(50) NOT NULL, -- 'clinica_sala204'
    status VARCHAR(20) DEFAULT 'ATIVO',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cadastro e Mapa de Leitos Hospitalares (Bahmni / Censo)
CREATE TABLE IF NOT EXISTS core_condominio.leitos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_leito VARCHAR(20) UNIQUE NOT NULL, -- Ex: 'Leito 101'
    ala VARCHAR(50) NOT NULL, -- 'UTI Geral', 'Enfermaria Cirúrgica'
    tipo_leito VARCHAR(50) NOT NULL, -- 'UTI Adulto', 'Leito Clínico'
    status_ocupacao VARCHAR(30) DEFAULT 'VAGO_HIGIENIZADO', -- 'OCUPADO', 'HIGIENIZANDO', 'VAGO_HIGIENIZADO', 'MANUTENCAO'
    paciente_atual_id VARCHAR(100),
    paciente_nome VARCHAR(150),
    custo_diaria NUMERIC(10,2) NOT NULL DEFAULT 850.00,
    ultima_limpeza TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Catálogo de Medicamentos & Lotes FEFO (OpenBoxes)
CREATE TABLE IF NOT EXISTS core_condominio.estoque_lotes_fefo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_insumo VARCHAR(50) NOT NULL, -- Ex: 'MED-AMX-500'
    nome_comercial VARCHAR(150) NOT NULL,
    dosagem VARCHAR(50) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'Antibiótico', 'Analgésico', 'Insumo'
    numero_lote VARCHAR(50) NOT NULL,
    data_validade DATE NOT NULL,
    quantidade_disponivel INTEGER NOT NULL DEFAULT 0,
    unidade_medida VARCHAR(20) NOT NULL, -- 'Frasco', 'Ampola', 'Unidade'
    custo_aquisicao_unitario NUMERIC(10,2) NOT NULL,
    preco_teto_cmed NUMERIC(10,2) NOT NULL,
    localizacao_armazenamento VARCHAR(100) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice FEFO essencial: Ordenação instantânea pela data de validade mais próxima
CREATE INDEX IF NOT EXISTS idx_fefo_validade ON core_condominio.estoque_lotes_fefo (codigo_insumo, data_validade ASC);

-- Tabela de Transações e Split Financeiro (Hyperswitch / HealVista)
CREATE TABLE IF NOT EXISTS core_condominio.transacoes_split (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_transacao VARCHAR(50) UNIQUE NOT NULL,
    clinica_id UUID REFERENCES core_condominio.clinicas(id),
    paciente_nome VARCHAR(150) NOT NULL,
    descricao_servico VARCHAR(200) NOT NULL,
    valor_total NUMERIC(10,2) NOT NULL,
    valor_repasse_medico NUMERIC(10,2) NOT NULL,
    valor_taxa_condominio NUMERIC(10,2) NOT NULL,
    forma_pagamento VARCHAR(30) DEFAULT 'PIX_D0',
    status_liquidacao VARCHAR(30) DEFAULT 'LIQUIDADO_INSTANTANEO',
    numero_nfse VARCHAR(50),
    data_liquidacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INSERÇÃO DE DADOS MOCK INICIAIS (SEED SPRINT 1)
-- ==============================================================================

-- 1. Clínica Sala 204 (CardioVida)
INSERT INTO core_condominio.clinicas 
(codigo_sala, razao_social, nome_fantasia, cnpj, medico_responsavel, crm_uf, percentual_repasse_medico, percentual_taxa_condominio, chave_pix_repasse, schema_banco_isolado)
VALUES 
('SALA_204', 'CardioVida Especialidades Médicas LTDA', 'CardioVida Sala 204', '12.345.678/0001-90', 'Dr. Ricardo Mendes', 'CRM-SP 148920', 85.00, 15.00, 'financeiro@cardiovida.com.br', 'clinica_sala204')
ON CONFLICT (codigo_sala) DO NOTHING;

-- 2. Leitos Iniciais
INSERT INTO core_condominio.leitos (numero_leito, ala, tipo_leito, status_ocupacao, custo_diaria)
VALUES 
('Leito 101', 'UTI Geral', 'UTI Adulto', 'VAGO_HIGIENIZADO', 1450.00),
('Leito 102', 'UTI Geral', 'UTI Adulto', 'VAGO_HIGIENIZADO', 1450.00),
('Apto 201', 'Enfermaria Cirúrgica', 'Apartamento', 'VAGO_HIGIENIZADO', 520.00)
ON CONFLICT (numero_leito) DO NOTHING;

-- 3. Lotes de Medicamentos FEFO
INSERT INTO core_condominio.estoque_lotes_fefo 
(codigo_insumo, nome_comercial, dosagem, categoria, numero_lote, data_validade, quantidade_disponivel, unidade_medida, custo_aquisicao_unitario, preco_teto_cmed, localizacao_armazenamento)
VALUES 
('MED-AMX-500', 'Amoxicilina + Clavulanato', '500mg/125mg Frasco', 'Antibiótico', 'LT-2026-09A', '2026-10-15', 140, 'Frasco', 18.50, 32.40, 'Almoxarifado Central - Prateleira A-04'),
('MED-DIP-500', 'Dipirona Sódica Injetável', '500mg/mL Ampola 2mL', 'Analgésico', 'LT-2026-11B', '2026-11-30', 850, 'Ampola', 1.80, 3.20, 'Farmácia Satélite - Gaveteiro 02'),
('MED-ENO-040', 'Enoxaparina Sódica', '40mg/0.4mL Seringa', 'Cardiológico', 'LT-2026-10X', '2026-10-05', 65, 'Seringa Preenchida', 28.90, 48.00, 'Câmara Fria 02 (2°C a 8°C)');
