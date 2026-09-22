# Índice Oficial das Arquiteturas Técnicas — Hospital 360 / Vigia Saúde

Este diretório contém a especificação técnica e o refinamento arquitetural completo de cada um dos **13 módulos** do ecossistema **Hospital 360 / Vigia Saúde**.

Cada módulo opera como um Bounded Context independente, com sua própria matriz de governança RBAC (perfis de operadores e administrador exclusivo do módulo), seu schema de banco de dados no **Supabase oficial (`oogpcdaosexarxmvupiw`)**, regras de negócio críticas e contratos de integração.

---

## Módulos do Sistema

| # | Módulo | Bounded Context / Repositório Base | Documento de Arquitetura |
| :-: | :--- | :--- | :--- |
| **01** | Compras Públicas & Atas SRP | Gestão de Atas, Travas CMED/BPS, Lei 14.133/21 | [ARQUITETURA_01_COMPRAS_PUBLICAS.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_01_COMPRAS_PUBLICAS.md) |
| **02** | Estoque Central WMS & Cadeia de Frio | Armazenagem RDC 430/20, Sensores 2-8ºC, FEFO (OpenBoxes) | [ARQUITETURA_02_ESTOQUE_CENTRAL_WMS.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_02_ESTOQUE_CENTRAL_WMS.md) |
| **03** | Escala Médica & Plantões Hospitalares | Escalas, Ponto GPS <100m, Trocas, Antecipação PIX (OpenHRApp) | [ARQUITETURA_03_ESCALA_MEDICA_RH.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_03_ESCALA_MEDICA_RH.md) |
| **04** | Farmácia Satélite & Dispensação | Checagem Beira-Leito (Pulseira + Medicamento), MAVs (P-MACS) | [ARQUITETURA_04_FARMACIA_DISPENSACAO.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_04_FARMACIA_DISPENSACAO.md) |
| **05** | Gestão Clínica & PEP | Acolhimento, Triagem Manchester, PEP, CID-10 (OpenEMR) | [ARQUITETURA_05_GESTAO_CLINICA_PEP.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_05_GESTAO_CLINICA_PEP.md) |
| **06** | Laboratório Clínico & LIS | Coleta Tubos, Analisadores HL7, Laudos FHIR R4 (Senaite LIS) | [ARQUITETURA_06_LABORATORIO_LIS.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_06_LABORATORIO_LIS.md) |
| **07** | Gestão de Leitos & Censo NIR | Mapa de Leitos, Regulação, Limpeza Terminal (Bahmni Core) | [ARQUITETURA_07_LEITOS_CENSO_NIR.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_07_LEITOS_CENSO_NIR.md) |
| **08** | Fintech & Split de Pagamento | Split 85% Médico / 15% Hospital, Glosas, TISS (Hyperswitch) | [ARQUITETURA_08_FINTECH_SPLIT.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_08_FINTECH_SPLIT.md) |
| **09** | Automação & Mensageria | WhatsApp Cloud API, Confirmação 1 Toque, NPS (Poli / n8n) | [ARQUITETURA_09_AUTOMACAO_MENSAGERIA.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_09_AUTOMACAO_MENSAGERIA.md) |
| **10** | Ingestão de Dados & Legados | ETL Planilhas CSV, Conectores MV/Tasy/SUS, Quarentena | [ARQUITETURA_10_INGESTAO_CONECTORES.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_10_INGESTAO_CONECTORES.md) |
| **11** | Blindagem de Segurança & Privacidade | Trilha WORM Imutável, Cofre de Segredos, DPO LGPD | [ARQUITETURA_11_BLINDAGEM_SEGURANCA.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_11_BLINDAGEM_SEGURANCA.md) |
| **12** | Dashboard Executivo & Custo 360 | Motor de Custeio Absorção ABC em 5 Estações, Margem Líquida | [ARQUITETURA_12_DASHBOARD_CUSTO_PACIENTE_360.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_12_DASHBOARD_CUSTO_PACIENTE_360.md) |
| **13** | Central de Regulação de Vagas & TFD | Fila Especialidades, Guias APAC, Frota e Roteirização TFD (AIVO) | [ARQUITETURA_13_REGULACAO_VAGAS_TFD.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_13_REGULACAO_VAGAS_TFD.md) |

---

## Recursos Transversais Obrigatórios (Presentes em Todos os Módulos)

Todos os 13 módulos do sistema contam com integração aos seguintes recursos de governança:
- **Abertura de Chamados (Helpdesk / OS)**
- **Livro de Ocorrências Digital (Passagem de Plantão)**
- **Trilha Imutável de Logs por Perfil (Auditoria WORM)**

📑 **Especificação Técnica Transversal:** [ARQUITETURA_TRANSVERSAL_CHAMADOS_OCORRENCIAS_LOGS.md](file:///d:/Projetos/360/docs/arquitetura/ARQUITETURA_TRANSVERSAL_CHAMADOS_OCORRENCIAS_LOGS.md)

