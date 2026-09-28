-- ============================================================================
-- SQUAD 2: CLÍNICAS MÉDICAS — ISOLAMENTO MULTI-TENANT E NORMA RN-IND (MARIADB)
-- ============================================================================

-- 1. CRIAÇÃO DOS ESQUEMAS ISOLADOS POR CLÍNICA PARCEIRA
CREATE DATABASE IF NOT EXISTS `openemr_tenant_cardiovida` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `openemr_tenant_ortomaster` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. TABELA DE PRONTUÁRIOS (SENSÍVEL - REGRA RN-IND)
USE `openemr_tenant_cardiovida`;

CREATE TABLE IF NOT EXISTS `patient_data` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `pubpid` VARCHAR(100) NOT NULL UNIQUE,
    `fname` VARCHAR(255) NOT NULL,
    `lname` VARCHAR(255) NOT NULL,
    `ssn_cpf` VARCHAR(14) NOT NULL UNIQUE,
    `DOB` DATE NOT NULL,
    `sex` VARCHAR(20),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `form_encounter` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `date` DATETIME NOT NULL,
    `pid` BIGINT NOT NULL,
    `encounter` BIGINT NOT NULL,
    `facility` VARCHAR(255) NOT NULL,
    `triage_color` VARCHAR(20) DEFAULT 'VERDE' CHECK (`triage_color` IN ('VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL')),
    `reason` TEXT,
    FOREIGN KEY (`pid`) REFERENCES `patient_data`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. VISÃO CONSOLIDADA APENAS DE TAXAS DE CONDOMÍNIO (SEM DADOS CLÍNICOS)
CREATE OR REPLACE VIEW `v_faturamento_condominio` AS
SELECT 
    'openemr_tenant_cardiovida' AS tenant_id,
    COUNT(DISTINCT pid) AS total_pacientes_atendidos,
    COUNT(id) AS total_consultas_realizadas,
    (COUNT(id) * 25.00) AS taxa_condominio_devida -- R$ 25,00 por atendimento de taxa predial
FROM `form_encounter`;

-- 4. CRIAÇÃO DE USUÁRIO AUDITOR DO CONDOMÍNIO (ACESSO APENAS À VIEW DE FATURAMENTO)
CREATE USER IF NOT EXISTS 'condominio_auditor'@'%' IDENTIFIED BY 'senha_auditor_condominio_2026';

-- GARANTE ACESSO EXCLUSIVO À VIEW DE FATURAMENTO E NEGA SELECT NAS TABELAS CLÍNICAS
GRANT SELECT ON `openemr_tenant_cardiovida`.`v_faturamento_condominio` TO 'condominio_auditor'@'%';
REVOKE ALL PRIVILEGES ON `openemr_tenant_cardiovida`.`patient_data` FROM 'condominio_auditor'@'%';
REVOKE ALL PRIVILEGES ON `openemr_tenant_cardiovida`.`form_encounter` FROM 'condominio_auditor'@'%';

FLUSH PRIVILEGES;
