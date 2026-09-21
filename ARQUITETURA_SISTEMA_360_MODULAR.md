# Arquitetura do Sistema 360 — Plataforma Modular, Gestão de Clínicas & Custo Door-to-Door

## 1. Visão Executiva & O Modelo de Condomínio Hospitalar

O **Hospital 360** (AIVIQ Saúde / Vigia Saúde) opera como a infraestrutura tecnológica central de um condomínio hospitalar e de secretarias de saúde pública:
1. **Para Clínicas Médicas Proprietárias**:
   - Venda do módulo de gestão ambulatorial independente com base no **OpenEMR** (`G:\Projetos\gerenciamento clinica`).
   - Autonomia de prontuário, agenda, fila de triagem e faturamento segregado com criptografia AES-256 (RN-IND).
   - Acesso compartilhado ao laboratório central, farmácia FEFO, leitos de internação e facilities do condomínio.
2. **Para a Administração do Hospital / Condomínio**:
   - Gestão central de suprimentos, WMS, leitos, facilities prediais com SLA e cobrança unificada com **split financeiro** via Hyperswitch.
3. **Para Secretarias de Saúde Pública (SUS)**:
   - Apuração do **Custo Real do Paciente "Door-to-Door"** confrontado com os repasses da **Tabela SIGTAP/BPA/AIH**, revelando sobrecustos e eficiência dos serviços de saúde.

---

## 2. A Esteira de Integração Automatizada via n8n & Event Bus

Conectamos os módulos de ponta a ponta sem acoplamento de código, através de webhooks e fluxos no **n8n** (`G:\Projetos\automação`):

```
┌────────────────────────┐
│  CLÍNICA (OpenEMR)     │  1. Médico atende paciente, prescreve medicamento ou usa insumo
└───────────┬────────────┘
            │  (Webhook n8n: consulta_finalizada)
            ▼
┌────────────────────────┐
│   BARRAMENTO n8n       │  2. Orquestra a baixa imediata e faturamento
└───────────┬────────────┘
            │
            ├──────────────────────────────────────────────────┐
            ▼                                                  ▼
┌────────────────────────┐                        ┌────────────────────────┐
│ ESTOQUE FEFO           │                        │ HYPERSWITCH (RUST)     │
│ (OpenBoxes)            │                        │ Cobrança & Split       │
│ Baixa por lote/validade│                        │ Condomínio vs Médico   │
└───────────┬────────────┘                        └────────────┬───────────┘
            │                                                  │
            └───────────────────────┬──────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│              SISTEMA CONTÁBIL & MOTOR DE CUSTEIO DOOR-TO-DOOR            │
│  • Emissão de nota fiscal e conciliação bancária                         │
│  • Apuração de 100% dos custos desde a porta de entrada até a saída      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mapeamento Definitivo dos Repositórios em `G:\Projetos`

### 3.1 Repositórios Úteis Integrados ao Hospital 360
1. **`360`**: Core Orchestrator (Next.js 16 + Supabase RLS, Cockpit C-Level, FHIR R4, Ingestion Façade).
2. **`gerenciamento clinica`**: `openemr` (gestão clínica, agenda, prontuário ambulatorial e fila de espera para as clínicas proprietárias).
3. **`getenciamento de laboratorio`**: `senaite.core` (LIMS hospitalar, gestão de amostras, código de barras, analisadores e laudos).
4. **`gerenciamento de leitos`**: `bahmni-core` (censo hospitalar, mapa de ocupação, internação e transferências).
5. **`gerenciamento de tarefas`**: `openproject` + app mobile próprio (`/tarefas` com baixa por QR Code).
6. **`Estoque`**: `openboxes` (farmácia hospitalar crítica, FEFO, controle de lote e cadeia de frio).
7. **`Fluxo de pagamento`**: `hyperswitch` (orquestrador multi-gateway em Rust com split financeiro condomínio vs médico).
8. **`contabil`**: `HealVista` (faturamento ambulatorial e caixa) + `Hospital-Management-System` (C# ASP.NET contabilidade hospitalar e faturamento de internação).
9. **`RH`**: `OpenHRApp` (ponto biométrico/GPS, escalas e matriz de custo/hora de pessoal).
10. **`Sabia`**: Service desk, facilities, higienização de leitos e engenharia clínica com SLA.
11. **`almoxarifado`**: `org.openwms` (WMS intralogístico para armazenagem central por bins e picking de abastecimento).
12. **`compras`**: `erpnext` (suprimentos, requisições de compra, cotações RFQ e pedidos de compra).
13. **`gestão de despesas e auditoria`**: `paperless-ngx` (OCR ML de notas fiscais) + `metabase` (BI).
14. **`automação`**: `n8n` (orquestração de webhooks) + `langgraph` (agentes de IA de auditoria médica).
15. **`Poli`**: `aiviq-zap-app` (CRM WhatsApp anti-ban, confirmação de agendamentos e ouvidoria).
16. **`IA preços medicamentos`**: Bases oficiais CMED, BPS e CATMAT para auditoria de preços.
17. **`Vigia saude`**: Scripts de carga e conformidade do SUS.

### 3.2 Repositórios que NÃO Usaremos (Preservados no Disco)
- ❌ `formarbem` (sistema educacional anti-assédio).
- ❌ `Sistema Coleta` (gestão de limpeza urbana e lixo municipal).
- ❌ `vigia educa` (merenda e nutrição escolar PNAE).
- ❌ `Vigia social` (assistência social CRAS).
- ❌ `Ubi cargas copia` (transporte de cargas rodoviárias).
- ❌ `Instagram` (marketing de redes sociais avulso).
- ❌ `DGP` (pasta vazia).
- ❌ `CRM` (clones legados superados por `gerenciamento clinica` e `contabil`).
- ❌ `FeFo` (clone redundante superado pelo `openboxes` em `Estoque`).

---

## 4. O Cálculo do Custo do Paciente "Door-to-Door"

O cálculo cobre a jornada completa do paciente:

$$\text{Custo Total} = \text{Recepção/Triagem} + \text{Tempo Médico} + \text{Insumos FEFO} + \text{Exames SENAITE} + \text{Diárias Bahmni} + \text{Facilities Sabia} + \text{Rateio ABC}$$

1. **Entrada**: Check-in na recepção, abertura de episódio e triagem de Manchester.
2. **Atendimento Clínico**: Consulta na clínica médica com o OpenEMR ($\text{tempo} \times \text{custo/hora do especialista}$).
3. **Farmácia & Insumos**: Baixa automática no OpenBoxes com valor exato do lote consumido.
4. **Laboratório LIMS**: Exames solicitados processados no SENAITE com custo de reagentes e laudo.
5. **Saída**: Cobrança consolidada no balcão via Hyperswitch com split financeiro e confronto com a tabela SIGTAP/SUS.

---

## 5. Handoff para o Líder Técnico & Distribuição entre Colaboradores

Para a execução prática e divisão do trabalho entre as equipes de desenvolvimento, consulte o blueprint operacional detalhado em:
👉 **[HANDOFF_LIDER_TECNICO_SQUADS.md](file:///g:/Projetos/360/HANDOFF_LIDER_TECNICO_SQUADS.md)**

O documento estabelece:
- As **7 Squads de Desenvolvimento** (Core 360, Clínicas OpenEMR, Laboratório SENAITE, Suprimentos FEFO, Leitos/Facilities, Fintech Hyperswitch e Barramento n8n).
- Atribuição nominal dos 17 repositórios aos colaboradores.
- Contratos de API (JSON payloads e eventos n8n).
- Cronograma em 4 Sprints para o Tech Lead.
- Critérios globais de aceite (Definition of Done).

