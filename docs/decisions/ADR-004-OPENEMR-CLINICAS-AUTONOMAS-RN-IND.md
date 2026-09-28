# ADR-004: Módulo de Clínicas Médicas Autônomas (OpenEMR v7.0) & Blindagem RN-IND

## Status
Aceito (Accepted)

## Data
2026-09-28

## Contexto
A Squad 2 é responsável pelo módulo de **Clínicas Médicas Autônomas** (`01-modulo-clinicas/`), utilizando o OpenEMR v7.0 como motor de prontuário eletrônico. Cada consultório parceiro deve operar com autonomia total, mantendo a conformidade com a norma RN-IND (blindagem do condomínio contra visualização de prontuários de terceiros).

## Decisão
1. **Containerização PHP 8.2 + Nginx + MariaDB 10.11**:
   - O OpenEMR habita a pasta isolada `01-modulo-clinicas/` rodando sob supervisord e PHP-FPM.
2. **Esquemas Isolados no MariaDB (`openemr_tenant_*`)**:
   - Cada clínica parceira possui seu banco de dados/esquema dedicado.
   - O usuário auditor do condomínio predial possui privilégios de `SELECT` exclusivamente na view `v_faturamento_condominio` (para cálculo de taxa de uso de infraestrutura).
   - O privilégio `SELECT` nas tabelas `patient_data`, `form_encounter` e `prescriptions` é revogado expressamente (`REVOKE ALL PRIVILEGES`).
3. **Disparo Automatizado de Eventos para a Esteira**:
   - Ao salvar um atendimento médico, o OpenEMR despacha eventos para o barramento n8n e para o Hub de Custos: `openemr.prescricao_emitida` e `openemr.solicitacao_exame`.

## Consequências
- A clínica parceira pode adquirir e usar o módulo de prontuário OpenEMR de forma 100% independente.
- Garantia regulatória contra vazamentos de informações sensíveis do paciente para administradores prediais.
