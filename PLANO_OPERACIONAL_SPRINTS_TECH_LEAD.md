# HOSPITAL 360 — PLANO OPERACIONAL DO LÍDER TÉCNICO
## Delegação Nominal de Tarefas, Matriz de Responsabilidades & Backlog por Sprints

> **Líder Técnico Sênior (Tech Lead):** Lucas Reis  
> **Data de Emissão:** 21 de Setembro de 2026  
> **Ciclo de Desenvolvimento:** 4 Sprints (8 Semanas) — 60 Dias para o Go-Live  
> **Objetivo:** Orquestrar e delegar a implementação prática dos 17 repositórios integrados ao ecossistema **Hospital 360**, garantindo o custeio do paciente **Door-to-Door**, a venda fracionada por módulos e o isolamento operacional de cada serviço.

---

## 1. Quadro de Colaboradores & Alocação de Squads

Como Líder Técnico Sênior, nomeio e aloco nominalmente a equipe técnica nas seguintes posições de responsabilidade direta:

| Colaborador(a) | Papel Técnico | Squad de Atuação | Repositórios sob sua Responsabilidade |
| :--- | :--- | :--- | :--- |
| **Gabriel Martins** | Desenvolvedor Fullstack Sênior | **Squad 1**: Core 360 & Custeio Door-to-Door | `360` (`nucleo/`), APIs FastAPI e Supabase |
| **Rodrigo Albuquerque** | Especialista Backend & Saúde | **Squad 2**: Clínicas Médicas & Prontuário | `gerenciamento clinica` (`openemr`) |
| **Felipe Vasconcelos** | Engenheiro Python / LIMS | **Squad 3**: Laboratório Clínico & Diagnóstico | `getenciamento de laboratorio` (`senaite.core`) |
| **Mariana Siqueira** | Engenheira Backend Java / Logística | **Squad 4**: Farmácia FEFO & Suprimentos | `Estoque` (`openboxes`), `almoxarifado`, `compras`, `IA preços medicamentos` |
| **Thiago Pires** | Desenvolvedor Frontend / Mobile PWA | **Squad 5**: Leitos, Facilities & App de Tarefas | `gerenciamento de leitos` (`bahmni`), `Sabia`, `gerenciamento de tarefas` |
| **André Castilho** | Engenheiro Backend Rust / Fintech | **Squad 6**: Fintech 360 & Contabilidade | `Fluxo de pagamento` (`hyperswitch`), `contabil` (`HealVista` + C#) |
| **Camila Medeiros** | Engenheira de Automação & DevOps | **Squad 7**: Barramento n8n, IA & Mensageria | `automação` (`n8n` + `langgraph`), `Poli` (`aiviq-zap-app`), `Vigia saude` |
| **Beatriz Brandão** | UX Master & Lead Product Designer | **Transversal**: Design System & Ergonomia Hospitalar | Design System 360, Acessibilidade WCAG 2.2, Ergonomia PWA e Dashboards |

---

## 2. Divisão e Backlog Operacional por Sprints

---

### 🚀 SPRINT 1 (Dias 01 a 14) — Fundação de Infraestrutura, Multi-Tenancy & Barramento n8n
**Meta da Sprint:** Subir os ambientes isolados em Docker, configurar os bancos multi-tenant e estabelecer o barramento de webhooks do n8n com certificados e filas de retentativa.

#### Tarefas Delegadas:

1. **Camila Medeiros (DevOps / n8n)**:
   - [ ] Criar `docker-compose.infra.yml` unificando PostgreSQL, Redis e n8n.
   - [ ] Configurar os tópicos de eventos no n8n: `paciente.checkin`, `paciente.triagem`, `paciente.prescricao`, `paciente.solicitacao_exame`, `paciente.checkout`.
   - [ ] Implementar fila de retentativa (Dead Letter Queue - DLQ) para tolerância a falhas em caso de queda de serviços secundários.
   - *Estimativa: 13 Story Points*

2. **Rodrigo Albuquerque (Clínicas / OpenEMR)**:
   - [ ] Subir container do OpenEMR v7.0 apontando para o PostgreSQL/MySQL isolado da Sala 204.
   - [ ] Configurar esquema multi-tenancy e blindagem de acesso regulatório **RN-IND** (zero acesso do condomínio hospitalar aos dados médicos restritos).
   - [ ] Implementar endpoint de webhook de saída no OpenEMR para disparar eventos ao salvar consultas.
   - *Estimativa: 13 Story Points*

3. **Mariana Siqueira (Estoque / OpenBoxes)**:
   - [ ] Subir o OpenBoxes no ambiente local de desenvolvimento.
   - [ ] Cadastrar catálogo de medicamentos essenciais e lotes com datas de validade para teste do algoritmo FEFO.
   - [ ] Expor API REST do OpenBoxes para dar baixa automática em itens via requisição externa.
   - *Estimativa: 8 Story Points*

4. **Gabriel Martins (Core 360 & Ingestão)**:
   - [ ] Validar rotas `/api/ingestao` e `/api/jornada-doortodoor` no Next.js 16.
   - [ ] Implementar parser dos templates CSV para clientes que não contratarem módulos específicos (importação de estoque e leitos legados).
   - *Estimativa: 8 Story Points*

5. **Thiago Pires (Leitos & App Tarefas)**:
   - [ ] Estruturar a base do PWA `/tarefas` com leitor de câmera para QR Code nativo (Html5-QRCode).
   - [ ] Modelar a tabela de tipos de tarefas (Higienização Concorrente, Higienização Terminal, Manutenção de Equipamento, Troca de Curativo).
   - *Estimativa: 5 Story Points*

6. **Felipe Vasconcelos (Laboratório LIMS)**:
   - [ ] Inicializar o build do SENAITE LIMS e testar a API REST nativa (`senaite.api`).
   - [ ] Mapear os campos da ordem de serviço: `client_id`, `patient_id`, `analyses_requested`, `urgency_level`.
   - *Estimativa: 8 Story Points*

7. **André Castilho (Fintech & Contabilidade)**:
   - [ ] Compilar e subir o servidor do Hyperswitch em Rust.
   - [ ] Configurar credenciais do sandbox do Banco Central para PIX D+0 e adquirente de cartão de crédito.
   - *Estimativa: 8 Story Points*

---

### 🏥 SPRINT 2 (Dias 15 a 28) — Esteira Assistencial: OpenEMR, Baixa FEFO & App de Tarefas
**Meta da Sprint:** Integrar a consulta do paciente no OpenEMR com a baixa imediata no estoque do OpenBoxes via n8n e colocar o App Mobile de tarefas em teste com a equipe de campo.

#### Tarefas Delegadas:

1. **Rodrigo Albuquerque (OpenEMR) + Camila Medeiros (n8n)**:
   - [ ] Conectar a chamada da fila de espera do consultório com a tela de atendimento.
   - [ ] Ao prescrever medicamentos no OpenEMR, disparar webhook `openemr.prescricao_emitida` contendo o código do item e a quantidade.
   - [ ] n8n intercepta o webhook e valida a autenticidade da assinatura HMAC.
   - *Estimativa: 13 Story Points*

2. **Mariana Siqueira (OpenBoxes & Suprimentos)**:
   - [ ] Implementar a rotina que recebe a mensagem do n8n e seleciona o lote mais próximo do vencimento (**FEFO**) no almoxarifado.
   - [ ] Deduzir a quantidade do estoque e retornar à esteira o número do lote consumido e o valor do custo unitário para a matriz Door-to-Door.
   - [ ] Conectar compras no ERPNext com os tetos da tabela CMED/BPS para alertar compras acima do preço oficial.
   - *Estimativa: 13 Story Points*

3. **Thiago Pires (App Tarefas & Facilities)**:
   - [ ] Testar a leitura de QR Code dos leitos pelo smartphone dos colaboradores de higienização e manutenção.
   - [ ] Implementar o cronômetro de execução da tarefa e o cálculo automático de custo da mão de obra (tempo gasto $\times$ taxa/hora do colaborador).
   - [ ] Enviar evento de conclusão da tarefa para o módulo de internação do Bahmni-Core liberando o leito no censo.
   - *Estimativa: 8 Story Points*

4. **Gabriel Martins (Core 360 & Jornada Door-to-Door)**:
   - [ ] Integrar os eventos de prescrição e baixa de insumos na Linha do Tempo do Paciente.
   - [ ] Apurar os custos das estações 1 (Portaria/Triagem), 2 (Consultório) e 3 (Insumos Farmacêuticos).
   - *Estimativa: 8 Story Points*

---

### 🧪 SPRINT 3 (Dias 29 a 42) — Diagnóstico LIMS, Split Financeiro & Faturamento Contábil
**Meta da Sprint:** Ligar a esteira de pedidos de exames ao SENAITE LIMS e executar o faturamento com split no Hyperswitch e emissão de NFS-e no HealVista.

#### Tarefas Delegadas:

1. **Felipe Vasconcelos (SENAITE LIMS) + Camila Medeiros (n8n)**:
   - [ ] Ao solicitar exame no OpenEMR (ex: Troponina, ECG, Hemograma), o n8n cria automaticamente a WorkOrder no SENAITE LIMS.
   - [ ] Gerar etiqueta com código de barras da amostra para identificação no laboratório.
   - [ ] Quando o laudo for emitido e validado pelo biomédico, enviar webhook `lims.laudo_liberado` contendo os resultados e o custo operacional do exame.
   - *Estimativa: 13 Story Points*

2. **André Castilho (Hyperswitch & Contábil)**:
   - [ ] Implementar regra de split financeiro automatizado no Hyperswitch:
     * **85%** creditado instantaneamente na conta bancária do médico/clínica cooperada.
     * **15%** retido como taxa condominial e aluguel da estrutura hospitalar.
   - [ ] Conectar a liquidação do pagamento com o sistema contábil HealVista para emissão automática da NFS-e municipal.
   - *Estimativa: 13 Story Points*

3. **Camila Medeiros (Poli WhatsApp CRM)**:
   - [ ] Integrar envio de notificação via WhatsApp para o paciente:
     * Confirmação de agendamento 24h antes.
     * Aviso de chamada no painel de senhas.
     * Link para download do laudo de exames emitido pelo SENAITE.
   - *Estimativa: 8 Story Points*

4. **Gabriel Martins (Core 360)**:
   - [ ] Adicionar custos de exames laboratoriais e split financeiro na rota `/api/custo-paciente`.
   - [ ] Validar a conciliação bancária contra o faturamento do condomínio hospitalar.
   - *Estimativa: 5 Story Points*

---

### 🎯 SPRINT 4 (Dias 43 a 60) — Fechamento Door-to-Door, Homologação & Go-Live
**Meta da Sprint:** Testar a jornada completa de ponta a ponta (da catraca à alta), validar o gerador de relatórios para clientes sem módulos contratados e implantar o piloto em produção.

#### Tarefas Delegadas:

1. **Gabriel Martins (Fullstack Core 360)**:
   - [ ] Confrontar em tempo real os custos acumulados de cada paciente com as tabelas de referência:
     * **Privado**: Tabela TUSS e pacotes de planos de saúde.
     * **Público**: Tabela SIGTAP do SUS para secretarias de saúde municipais/estaduais.
   - [ ] Gerar relatório consolidado para gestores em PDF e Excel evidenciando pacientes deficitários vs superavitários.
   - *Estimativa: 13 Story Points*

2. **Mariana Siqueira + Rodrigo Albuquerque + Felipe Vasconcelos + André Castilho**:
   - [ ] Testes de carga e integridade entre os sistemas (`OpenEMR` $\leftrightarrow$ `OpenBoxes` $\leftrightarrow$ `SENAITE` $\leftrightarrow$ `Hyperswitch`).
   - [ ] Garantir que em clientes que contrataram apenas **1 módulo**, o sistema opera normalmente sem travas nem dependências quebradas.
   - *Estimativa: 13 Story Points*

3. **Thiago Pires (Frontend/Mobile)**:
   - [ ] Realizar teste de usabilidade em smartphones com técnicos de enfermagem e equipe de higienização do hospital parceiro.
   - [ ] Ajustar contraste, responsividade e modo offline para o app PWA `/tarefas`.
   - *Estimativa: 8 Story Points*

4. **Camila Medeiros (DevOps / Infraestrutura)**:
   - [ ] Pipeline CI/CD no GitHub Actions com testes automatizados de lint e build.
   - [ ] Configuração de backup diário com snapshot criptografado dos bancos de dados.
   - [ ] Monitoramento com Prometheus e Grafana alertando latência acima de 200ms nos webhooks.
   - *Estimativa: 8 Story Points*

---

## 3. Matriz RACI de Governança

* **R (Responsible):** Quem executa a tarefa.  
* **A (Accountable):** Quem responde pelo resultado final (Tech Lead).  
* **C (Consulted):** Especialista consultado.  
* **I (Informed):** Notificado sobre o status.  

| Entrega / Domínio | Gabriel M. (Core) | Rodrigo A. (Clínica) | Felipe V. (LIMS) | Mariana S. (Estoque) | Thiago P. (Leitos) | André C. (Fintech) | Camila M. (DevOps) | Lucas Reis (Tech Lead) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Arquitetura & Contratos de API** | C | C | C | C | C | C | C | **A** |
| **Hub de Ingestão & Custo Door-to-Door** | **R** | I | I | I | I | I | C | **A** |
| **Prontuário & Fila OpenEMR** | I | **R** | C | C | I | C | C | **A** |
| **Laboratório SENAITE LIMS** | I | C | **R** | I | I | I | C | **A** |
| **Farmácia FEFO & Suprimentos** | I | C | I | **R** | I | I | C | **A** |
| **App PWA de Tarefas & Facilities** | I | I | I | I | **R** | I | C | **A** |
| **Split Hyperswitch & Faturamento** | C | C | I | I | I | **R** | C | **A** |
| **Barramento n8n & Mensageria WhatsApp**| C | C | C | C | C | C | **R** | **A** |

---

## 4. Cerimônias e Ritos da Equipe

1. **Daily Standup (Diária - 15 min)**:
   - Horário: 09:00 às 09:15 (Google Meet).
   - Pauta objetiva: O que entreguei ontem? O que vou entregar hoje? Algum impedimento na integração?
2. **Sprint Planning (Quinzenal - 2h)**:
   - Planejamento e refinamento dos Story Points de cada colaborador.
3. **Sprint Review & Demo Técnica (Quinzenal - 1h)**:
   - Demonstração funcional no navegador e testes de ponta a ponta.
4. **Retrospectiva (Quinzenal - 45 min)**:
   - Ajustes de processo, qualidade de código e melhorias contínuas.

---

## 5. Regras de Ouro Inegociáveis para os Colaboradores

1. **Compilação Estrita**: Nenhum Pull Request será aceito se falhar no `tsc --noEmit` ou nos linters.
2. **Rastreabilidade Obrigatória**: Nenhuma consulta, baixa de medicamento ou exame pode ser salvo sem registrar o `paciente_id` e o `custo_acumulado`.
3. **Desacoplamento Absoluto**: Se o laboratório SENAITE estiver temporariamente indisponível, o médico deve continuar atendendo normalmente no OpenEMR; a fila do n8n reterá o evento para processamento posterior.
4. **Isolamento de Dados (RN-IND)**: O banco de cada clínica é privativo. Violação de privacidade de prontuário médico acarreta bloqueio imediato do deploy.

---
*Plano homologado e aprovado para execução imediata.*  
**Lucas Reis — Líder Técnico Sênior (Tech Lead)**
