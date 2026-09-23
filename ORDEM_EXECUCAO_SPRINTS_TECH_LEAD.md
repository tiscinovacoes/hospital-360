# HOSPITAL 360 — ORDEM DE EXECUÇÃO DAS SPRINTS (TECH LEAD SÊNIOR)
> **Documento Oficial de Engenharia, Governança, Arquitetura & Go-to-Market**  
> **Líder Técnico Sênior (Tech Lead):** Lucas Reis  
> **Data de Emissão:** 22 de Setembro de 2026  
> **Ciclo de Execução:** Sprints 4 a 7 (8 Semanas / 60 Dias para Go-Live)  
> **Repositório Central:** `d:\Projetos\360` (`hospital-360`)

---

## 1. Mandato do Líder Técnico & Diretrizes Estratégicas

Como Líder Técnico Sênior do ecossistema **Hospital 360**, estabeleço as diretrizes inegociáveis para esta fase de consolidação:

1. **Arquitetura Modular Monolítica com Bounded Contexts Isolados (DDD)**:
   - O repositório `360/nucleo` atua como o Núcleo Integrador.
   - Qualquer comunicação com os satélites (`D:\Projetos\...`) deve ocorrer obrigatoriamente através de **Anti-Corruption Layers (ACLs)** e o protocolo canônico `LoteDespesaHub`.
2. **Identidade Visual v2.0 Obrigatória (`IDENTIDADE_VISUAL (1).md`)**:
   - Fim da estética genérica de SaaS azul.
   - Adoção estrita da base **Tinta (`#1B1F1C`) / Papel (`#F6F3EC`)**, acento de ação **Teal Institucional (`#0E5C4C`)**, destaque pontual **Terracota (`#C1622D`)** e tipografia **Fraunces + Public Sans + JetBrains Mono**.
3. **Protocolo CRED-OMEGA & Blindagem Regulatória RN-IND**:
   - Tolerância zero para chaves e credenciais no git.
   - Segregação criptográfica estrita entre dados médicos do consultório e dados de rateio condominial do hospital.
4. **Observabilidade e Métricas de Ouro**:
   - Todo endpoint de ingestão deve emitir métricas para Prometheus e ser monitorado no cockpit Grafana (Latência p95 < 150ms, Erro < 0.1%).

---

## 2. Quadro de Liderança, Squads & Delegações Nominais

| Squad / Especialidade | Líder / Responsável Nominal | Papel & Expertise | Ativos Reutilizados de `D:\Projetos` |
| :--- | :--- | :--- | :--- |
| **Squad 1: Core 360 & Custeio** | **Gabriel Martins** | Fullstack Sênior / Arquiteto | `360/nucleo`, APIs Next.js 16, Supabase |
| **Squad 2: Clínicas Médicas & PEP** | **Rodrigo Albuquerque** | Backend Saúde / Especialista PEP | `gerenciamento clinica` (`openemr`) |
| **Squad 3: Laboratório & LIMS** | **Felipe Vasconcelos** | Engenheiro Python / ASTM | `getenciamento de laboratorio` (`senaite.core`) |
| **Squad 4: Farmácia FEFO & Suprimentos**| **Mariana Siqueira** | Engenheira Backend / Logística | `FeFo` (`P-MACS`), `Estoque` (`openboxes`), `IA preços medicamentos` |
| **Squad 5: Leitos, Facilities & NIR** | **Thiago Pires** | Frontend Mobile PWA / IoT | `gerenciamento de leitos` (`bahmni`), `gerenciamento de tarefas` |
| **Squad 6: Fintech & Split Condominial** | **André Castilho** | Engenheiro Rust / Sistemas de Pagamento | `Fluxo de pagamento` (`hyperswitch`), `contabil` (`HealVista`) |
| **Squad 7: Mensageria & Automação** | **Camila Medeiros** | Engenheira DevOps / n8n / LangGraph | `automação` (`langgraph`), `Poli` (`aiviq-zap-app`), `Vigia saude` |
| **Squad Transversal: Design System** | **Beatriz Brandão** | Lead Product Designer / Ergonomia | `IDENTIDADE_VISUAL (1).md`, WCAG 2.2 AA |

---

## 3. Equipe de Agentes Autônomos de IA (CrewAI & Automação)

Para acelerar tarefas analíticas e operacionais, ativamos 4 agentes especializados baseados no framework **CrewAI**:

```
                  ┌─────────────────────────────────────────┐
                  │        Tech Lead (Lucas Reis)           │
                  └────────────────────┬────────────────────┘
                                       │
         ┌──────────────────┬──────────┴──────────┬──────────────────┐
         ▼                  ▼                     ▼                  ▼
┌─────────────────┐┌─────────────────┐┌─────────────────┐┌─────────────────┐
│ Agent CMED/BPS  ││ Agent Escala    ││ Agent Hunter    ││ Agent Price &   │
│ Auditor de      ││ Validador Ponto ││ Apify Leads     ││ Psicologia de   │
│ Preços Máximos  ││ GPS e Plantão   ││ Hospitais / SMS ││ Conversão Copy  │
└─────────────────┘└─────────────────┘└─────────────────┘└─────────────────┘
```

1. **`Agent_CMED_Auditor` (Auditor de Preços Máximos e Atas)**:
   - **Persona:** Procurador de Contas e Farmacêutico Regulatório Sênior.
   - **Função:** Confrontar lotes de compras e cotações contra tabelas BPS e teto CMED Anvisa, emitindo parecer de superfaturamento ou glosa preventiva.
2. **`Agent_Escala_Dispatcher` (Validador de Ponto e Escala Médica)**:
   - **Persona:** Diretor Clínico e Gestor de Recursos Humanos Hospitalares.
   - **Função:** Auditar check-ins GPS de intensivistas, checar conformidade no CFM e provisionar honorários para o Hub de Custos.
3. **`Agent_Lead_Hunter` (Prospecção via Apify & CNES)**:
   - **Persona:** Especialista em Inteligência de Mercado e Licitações de Saúde Pública.
   - **Função:** Extrair dados públicos de Secretarias Municipais de Saúde (SMS), Consórcios Intermunicipais e Diretores de Hospitais Filantrópicos/Privados.
4. **`Agent_Pricing_Strategist` (Psicologia de Preço & Copywriting)**:
   - **Persona:** Economista Comportamental e Copywriter B2B de Saúde.
   - **Função:** Desenvolver o framing de valor das propostas comerciais ancorando o ROI no desperdício evitado de glosas e desabastecimento.

---

## 4. Cronograma Detalhado das Sprints (Sprints 4 a 7)

---

### 🚀 SPRINT 4 (Dias 01 a 14) — Persistência Supabase, ACLs Canônicas & Design System v2.0
**Objetivo da Sprint:** Substituir o armazenamento em memória por tabelas PostgreSQL no Supabase, criar os contratos formais das Anti-Corruption Layers (ACLs) e aplicar a pele visual v2.0 nos módulos centrais.

#### Tarefas Delegadas Nominais:
- **Gabriel Martins (Squad 1)**:
  - [ ] Migrar `HubDespesasStore.ts` de array em memória para a tabela PostgreSQL `despesas_estacoes` no Supabase com suporte a `idempotency_key`.
  - [ ] Criar migration `20260923_hub_despesas_persistence.sql` com RLS por `tenant_id`.
  - [ ] *Estimativa:* 13 SP.
- **Beatriz Brandão (Design)** & **Gabriel Martins**:
  - [ ] Aplicar o Design System v2.0 em `/dashboard-executivo` e `/ingestao-modulos`: Fundo Papel (`#F6F3EC`), títulos em Fraunces e botões de ação em Teal (`#0E5C4C`).
  - [ ] *Estimativa:* 8 SP.
- **Mariana Siqueira (Squad 4)**:
  - [ ] Portar o validador de preços de `IA preços medicamentos\backend\app\services\preco_validator.py` para `nucleo/src/lib/compras/cmedValidator.ts`.
  - [ ] Criar endpoint `POST /api/compras/validar-precos` com conformidade Catmat/BPS.
  - [ ] *Estimativa:* 8 SP.
- **Rodrigo Albuquerque (Squad 2)**:
  - [ ] Criar a ACL de atendimento médico: transformar alta ambulatorial do OpenEMR em payload canônico da Estação 1 (`POST /api/hub/despesas/ingestao`).
  - [ ] *Estimativa:* 8 SP.
- **Camila Medeiros (Squad 7)**:
  - [ ] Integrar testes de contrato das ACLs no pipeline GitHub Actions (`.github/workflows/ci-hospital360.yml`).
  - [ ] *Estimativa:* 5 SP.

**Critério de Aceite (DoD):** Ingestão de despesas persistida no Supabase via curl/Postman com protocolo `ING-HUB-...` gerado no banco e telas principais renderizando com fontes Fraunces/Public Sans.

---

### 💊 SPRINT 5 (Dias 15 a 28) — Esteira FEFO, Censo de Leitos & Split Condominial
**Objetivo da Sprint:** Integrar a baixa de medicamentos por data de validade (FEFO), conectar o censo de leitos ao chamado de higienização Facilities e rodar o split financeiro condominial.

#### Tarefas Delegadas Nominais:
- **Mariana Siqueira (Squad 4)**:
  - [ ] Implementar a lógica FEFO de `D:\Projetos\FeFo` (`P-MACS`) na rota `/api/estoque/fefo-baixa`.
  - [ ] Impedir dispensação de medicamentos vencidos e disparar alerta de lote com <30 dias de validade.
  - [ ] *Estimativa:* 13 SP.
- **Thiago Pires (Squad 5)**:
  - [ ] Conectar o mapa de leitos (`/leitos-censo`) ao módulo `/facilities`: alta do paciente altera status do leito para "Higienização Pendente" e inicia cronômetro.
  - [ ] *Estimativa:* 8 SP.
- **André Castilho (Squad 6)**:
  - [ ] Integrar o motor de split de recebíveis de `D:\Projetos\Fluxo de pagamento` (`hyperswitch`) na rota `/api/hyperswitch/split`.
  - [ ] Separar na mesma transação: taxa condominial do hospital, custo de sala e honorário líquido do médico.
  - [ ] *Estimativa:* 13 SP.
- **Felipe Vasconcelos (Squad 3)**:
  - [ ] Implementar conector LIS: laudo liberado no laboratório lança automaticamente o custo na Estação 2 do paciente.
  - [ ] *Estimativa:* 8 SP.

**Critério de Aceite (DoD):** Prescrição médica dispensada dá baixa automática no lote com data de validade mais próxima (FEFO) e o custo é lançado imediatamente na Estação 4 do Hub.

---

### 📊 SPRINT 6 (Dias 29 a 42) — Observabilidade Enterprise, Service Mesh & n8n DLQ
**Objetivo da Sprint:** Implementar cockpit Grafana com as 4 Métricas de Ouro, configurar tolerância a falhas com Dead Letter Queue no n8n e instrumentar métricas no Next.js.

#### Tarefas Delegadas Nominais:
- **Camila Medeiros (Squad 7)**:
  - [ ] Subir o Prometheus (`observabilidade/prometheus.yml`) e o dashboard Grafana (`observabilidade/grafana_dashboard_hospital360.json`).
  - [ ] Configurar barramento n8n com tópicos `paciente.triagem`, `estoque.baixa_fefo` e fila de retentativa DLQ em Redis.
  - [ ] *Estimativa:* 13 SP.
- **Gabriel Martins (Squad 1)**:
  - [ ] Expor métricas Prometheus em `/api/metrics` com contadores de ocupação de leitos, faturamento glosado e requisições/s.
  - [ ] *Estimativa:* 8 SP.
- **Beatriz Brandão (Design)**:
  - [ ] Auditar acessibilidade WCAG 2.2 AA em todos os 14 módulos, garantindo contraste mínimo de 4.5:1 sobre o fundo Papel.
  - [ ] *Estimativa:* 8 SP.

**Critério de Aceite (DoD):** Painel do Grafana exibindo em tempo real a taxa de ocupação, o déficit assistencial TUSS x SUS e o alerta de lotes a vencer.

---

### 🏆 SPRINT 7 (Dias 43 a 60) — Homologação E2E, Go-to-Market & Prospecção Apify
**Objetivo da Sprint:** Auditoria final de segurança CRED-OMEGA, homologação de carga, lançamento da estratégia de precificação psicológica e prospecção ativa de clientes.

#### Tarefas Delegadas Nominais:
- **Camila Medeiros & Equipe de Segurança**:
  - [ ] Rodar varredura completa SAST e pen-test simulado em todas as rotas com token JWT.
  - [ ] Emitir Certificado CRED-OMEGA de Zero Segredos Expostos.
  - [ ] *Estimativa:* 8 SP.
- **Mariana, Gabriel, Rodrigo & Thiago**:
  - [ ] Executar teste de fumaça (Smoke Test) Door-to-Door completo: Check-in ➔ Triagem ➔ Exame LIS ➔ OPME ➔ Farmácia FEFO ➔ UTI ➔ Faturamento Split.
  - [ ] *Estimativa:* 13 SP.
- **CrewAI & Lead Hunter (Apify)**:
  - [ ] Executar scraper Apify para mapear 500 Secretarias Municipais de Saúde e 200 Hospitais Privados com tomadores de decisão.
  - [ ] Disparar régua de copywriting fundamentada na dor de glosas e desabastecimento.
  - [ ] *Estimativa:* 8 SP.

**Critério de Aceite (DoD):** Sistema homologado sem bugs bloqueantes, esteira de deploy automático ativa e prospecção comercial em andamento.

---

## 5. Estrutura do Fluxo de Execução Ponta a Ponta

### Fluxo de Dados Door-to-Door & Custeio:

```
[Chegada do Paciente]
       │
       ▼
[Estação 1: Acolhimento / Triagem Manchester] ────► Gera Custo E1
       │
       ▼
[Estação 2: Diagnóstico LIS / Exames ASTM] ───────► Gera Custo E2
       │
       ▼
[Estação 3: Insumos Cirúrgicos & OPME] ───────────► Valida CMED ➔ Gera Custo E3
       │
       ▼
[Estação 4: Farmácia FEFO Beira-Leito] ───────────► Baixa Menor Validade ➔ Gera Custo E4
       │
       ▼
[Estação 5: Internação UTI & Honorários GPS] ─────► Valida Ponto CFM ➔ Gera Custo E5
       │
       ├───────────────────────────────────────────────┐
       ▼                                               ▼
[POST /api/hub/despesas/ingestao]           [POST /api/hyperswitch/split]
       │                                               │
       ▼                                               ▼
[Confronto TUSS x SIGTAP / SUS]             [Split: Condomínio + CC + Médico]
       │                                               │
       ▼                                               ▼
[Dashboard Executivo BI 360]                [NFS-e & Fechamento Financeiro]
```

---

## 6. Estratégia de Psicologia de Preços & Copywriting (Go-to-Market)

Para maximizar a conversão de hospitais, clínicas e consórcios municipais, adotamos as seguintes técnicas de economia comportamental:

### A. Ancoragem de Valor pelo "Custo do Desperdício Evitado"
- Em vez de vender "software de gestão", vendemos **"Estancamento de Glosas e Fraudes em Compras"**.
- *Cálculo de Ancoragem:* Um hospital médio de 100 leitos perde entre **R$ 180.000 e R$ 450.000/mês** com glosas técnicas e medicamentos vencidos no estoque. O Hospital 360 custa uma fração desse prejuízo, tornando a decisão um investimento de retorno imediato.

### B. Decoy Effect (Efeito Chamariz) nos Tiers Comerciais

| Plano | Público-Alvo | Preço Sugerido | Posicionamento Psicológico |
| :--- | :--- | :--- | :--- |
| **Módulo Satélite Avulso** | Pequena clínica ou farmácia | R$ 1.900/mês | **O Chamariz:** Resolve apenas uma dor pontual (ex: só FEFO ou só Escala). |
| **Condomínio Clínico Standard** | Prédio médico compartilhado | R$ 6.800/mês | **Melhor Custo-Benefício:** Cobre Recepção, Split Bancário, Facilities e Censo. |
| **Hospital 360 Enterprise Full** | Hospitais 50+ leitos e Consórcios SUS | R$ 14.500/mês + Setup | **O Plano Alvo:** Cobre as 5 Estações Door-to-Door, BPS/CMED, LIMS, PEP e Cockpit BI. |

### C. Copywriting Institucional & Fuga do "SaaS Genérico"
- **Termos Banidos:** "Revolucionário", "Plataforma inovadora com IA mágica", "Interface amigável".
- **Linguagem Oficial Aprovada:** "Conformidade estrita com a Lei 14.133/21", "Apuração fidedigna de custo por paciente-dia", "Blindagem regulatória contra glosas TUSS", "Auditoria de preço máximo CMED/Anvisa".

---

## 7. Instruções de Verificação Técnica pelo Tech Lead

Para validar o ambiente local e rodar a esteira de integridade:

```bash
# 1. Navegar até o núcleo da aplicação
cd d:\Projetos\360\nucleo

# 2. Executar checagem estrita de tipos TypeScript
npx tsc --noEmit

# 3. Executar o linter oficial Next.js
npm run lint

# 4. Executar verificação CRED-OMEGA de credenciais expostas
git diff --staged | grep -E "AKIA[0-9A-Z]{16}|eyJh[a-zA-Z0-9_-]+" || echo "Zero credenciais expostas."

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```

---
*Ordem de Execução emitida e homologada para distribuição imediata às Squads e Agentes de IA.*
