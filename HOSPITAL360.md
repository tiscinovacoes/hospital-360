# Hospital 360 — Documentação do Projeto

## Visão Geral

**Hospital 360** é um protótipo funcional em React que simula um **ecossistema de gestão para um condomínio hospitalar** — um modelo de negócio onde médicos e clínicas alugam ou compram salas dentro de um prédio hospitalar compartilhado. O sistema cobre todos os atores do ecossistema: da administração do prédio ao médico proprietário, da recepcionista ao técnico de facilities, do enfermeiro ao gestor executivo.

O projeto é construído como uma **SPA (Single Page Application)** com React Router, contendo múltiplos módulos com identidade visual própria por perfil de usuário, contextos globais de estado, sistema de permissões multi-perfil e simulação de fluxos de negócio completos.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Roteamento | React Router (`createBrowserRouter`) |
| Estilização | Tailwind CSS |
| Componentes base | shadcn/ui (Radix UI) |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Animações | Motion (`motion/react`) |
| Notificações | Sonner |
| Utilitários | clsx, tailwind-merge, date-fns |

---

## Arquitetura de Contextos Globais

O estado global é gerenciado por três contextos React que envolvem toda a aplicação:

```
UserProvider
  NotificationProvider
    ThemeProvider
      RouterProvider
```

### `UserContext`

Gerencia o usuário logado e o sistema de permissões.

- **`UserRole`**: union type com 8 perfis — `admin`, `medico`, `laboratorio`, `facilities`, `recepcao`, `internacao`, `gestao-clinica`, `dashboard-executivo`
- **`mockUsers`**: 4 usuários de demonstração (`master`, `medico`, `facilities`, `recepcao`)
- O usuário `master` possui `isMaster: true` e todos os papéis simultaneamente
- **`hasAccess(role)`**: verifica se o usuário atual pode acessar determinado módulo
- **`UserSwitcher`**: componente de demonstração que permite trocar de usuário em tempo real sem logout

### `NotificationContext`

Gerencia contadores de notificações por módulo.

- Contadores iniciais por papel: `admin:2`, `medico:4`, `laboratorio:3`, `facilities:5`, `recepcao:7`, `internacao:2`, `gestao-clinica:3`, `dashboard-executivo:4`
- **Simulação em tempo real**: a cada 5 segundos, o contador de `facilities` oscila aleatoriamente (70% chance de incremento, 30% de decremento)
- **`getUrgentCount(role)`**: calcula notificações urgentes com multiplicador por papel (ex: `facilities` = 60% do total)
- Exibidos como badges na tela de seleção de perfil

### `ThemeContext`

Define a identidade visual de cada módulo.

| Módulo | Cor Principal | Hex |
|---|---|---|
| Administrador | Azul marinho | `#0A2540` |
| Médico / PEP | Verde esmeralda | `#059669` |
| Laboratório | Violeta | `#7c3aed` |
| Facilities | Laranja | `#ea580c` |
| Recepção / Totem | Azul céu | `#0ea5e9` |
| Internação / Enfermagem | Teal | `#14b8a6` |
| Gestão de Clínica | Ciano | `#0891b2` |
| Dashboard Executivo | Teal escuro | `#0f766e` |

---

## Módulos do Sistema

### 1. Seleção de Perfil (`/`) — `RoleSelection.tsx`

Tela de entrada da aplicação. Exibe todos os perfis disponíveis como cards navegáveis.

**Funcionalidades:**
- Exibe nome do usuário logado com badge de "Master" quando aplicável
- Filtra perfis com base nas permissões do `UserContext` (`hasAccess`)
- Cada card mostra contador de notificações totais e urgentes do `NotificationContext`
- Define o tema do módulo selecionado via `ThemeContext` antes de navegar
- Link para a tela de Arquitetura & Segurança
- Componente `UserSwitcher` no canto superior direito para troca de perfil
- Componente `RealTimeNotification` exibindo toasts de status cross-módulo

---

### 2. Dashboard Administrativo (`/admin`) — `AdminDashboard.tsx`

**Identidade visual:** Azul marinho profundo (`#0A2540`)

Painel de controle do **administrador do prédio hospitalar**. Gerencia ocupação, contratos, repasses financeiros e monitoramento operacional.

**Navegação lateral:**
- **Dashboard** — visão consolidada (padrão)
- **Gestão de Contratos** — em desenvolvimento
- **Repasses (Split)** — extrato de repasses financeiros para as clínicas
- **Ocupação de Salas** — mapa de status das salas em tempo real
- **Facilities** — em desenvolvimento
- **Financeiro Global** — em desenvolvimento
- **Fluxo Integrado 360°** — visualização animada da jornada do paciente

**Seção Dashboard:**
- 4 KPI cards: Faturamento Total Bruto (R$ 2,4M, +12,5%), Taxa de Ocupação (87,5%), Alertas de Manutenção (8, sendo 3 críticos), Saldo de Repasse a Pagar (R$ 260K)
- Gráfico de linha (Recharts) — fluxo de pacientes ao longo de 24h no prédio
- Tabela de status de pagamento de 6 clínicas locatárias com badges (Pago / Pendente / Atrasado)

**Sub-módulos renderizados:**
- `SplitExtrato` — extrato detalhado de split de pagamento
- `RoomStatusBoard` — mapa de ocupação das salas
- `IntegratedFlow` — demonstração animada do fluxo 360°

---

### 3. Prontuário Eletrônico / PEP (`/medico`) — `MedicalEHR.tsx`

**Identidade visual:** Verde esmeralda

Sistema de **Prontuário Eletrônico do Paciente** para o médico consultor.

**Layout em 3 colunas:**

**Coluna esquerda — Agenda do Dia:**
- 7 pacientes listados com horário, idade, queixa principal e status (Finalizado / Em Atendimento / Na Espera)
- Seleção de paciente ativa o workspace central

**Coluna central — Workspace do Paciente:**
- Cabeçalho com nome, idade, sexo, tipo sanguíneo e status
- Faixa de sinais vitais: PA, temperatura, frequência cardíaca, peso
- Histórico de atendimentos anteriores
- Campo de evolução médica com salvar/limpar
- Campo de prescrição médica com enviar/imprimir

**Coluna direita — Ações Rápidas:**
- Solicitar Exame (integrado ao laboratório do hub)
- Emitir Atestado
- Emitir Receita Controlada
- Agendar Retorno
- Encaminhar Especialista
- Dados do convênio, número da carteirinha, alergias e comorbidades

**Destaques:** Banner de resultado de exame disponível (dispensável); alergias (Penicilina, Dipirona) destacadas visualmente.

---

### 4. Totem de Autoatendimento / Recepção (`/recepcao`) — `KioskReception.tsx`

**Identidade visual:** Azul céu

Interface de **autoatendimento touchscreen** para pacientes na recepção do prédio.

**Máquina de estados de telas:**

1. **Home** — 3 opções principais:
   - Tenho um Agendamento (azul)
   - Retirar Senha (verde)
   - Localizar Sala/Médico (violeta)
   - Botão de ajuda: Falar com Atendente

2. **Agendamento** — leitura de QR Code (mockup com ícone pulsante) + entrada manual de protocolo

3. **Senha / Fila** — 4 tipos de atendimento: Urgência (vermelho), Consulta Rápida (azul), Exames (roxo), Informações (verde)

4. **Localizar** — campo de busca livre + filtros por categoria (Médicos, Salas, Especialidades, Serviços)

5. **Sucesso** — exibe senha gerada ("A247"), tipo de atendimento, tempo estimado de espera (15–20 min), com animação de check e retorno automático ao início após 5 segundos

**Destaques:** Relógio em tempo real no cabeçalho; UI dimensionada para uso em telas touch.

---

### 5. App de Facilities (`/facilities`) — `FacilitiesApp.tsx`

**Identidade visual:** Dark mode com laranja (`#ea580c`)

Aplicativo **mobile-first** para a equipe de limpeza e manutenção do prédio.

**Views:**

**Lista de Tarefas:**
- Header com 3 contadores: Pendentes, Críticas (com animação pulse), Concluídas
- Barra de progresso do turno
- Cards de tarefas ordenados por status e prioridade (Urgente / Alta / Normal)
- Tipos de limpeza: Terminal, Concorrente, Preventiva
- Cronômetro ao vivo para tarefas em andamento (atualiza a cada 1 segundo)

**Checklist de Execução (por tarefa):**
- 10 itens de verificação de segurança: EPIs, sinalização, resíduos, superfícies, pisos, equipamentos, insumos
- Barra de progresso do checklist
- **Regra de negócio**: tarefa só pode ser concluída com 100% dos itens verificados
- Ações: Pausar / Concluir

**Mock de tarefas:** 6 tarefas cobrindo Sala 204, Leito 12, Centro Cirúrgico 3, Corredor Ala B, UTI Leito 8, Recepção Principal — algumas originadas por alta médica de outros módulos.

---

### 6. Posto de Enfermagem / Internação (`/internacao`) — `NursingStation.tsx`

**Identidade visual:** Teal / ciano

Painel de **controle da internação** com mapa de leitos e gerenciamento de tarefas de enfermagem.

**Header — 5 KPIs:**
Ocupados, Vagos, Aguardando Limpeza, Taxa de Ocupação (%), Tempo Parado médio (turnover)

**Mapa de Leitos (12 leitos em 3 andares):**

| Status | Visual | Informações exibidas |
|---|---|---|
| Vago | Borda verde | Pronto para uso |
| Ocupado | Borda azul | Paciente, médico responsável, alertas (queda, alergia, isolamento, dieta) |
| Aguardando Limpeza | Borda âmbar | Tipo de limpeza, cronômetro, badge URGENTE se >30 min |

**Sidebar — Tarefas de Enfermagem:**
- 5 tarefas com prioridade, horário e toggle de conclusão
- Validação de medicação (10% de chance aleatória de lote vencido + checagem de alergias)
- Monitor de leitos aguardando limpeza com elapsed time

**Fluxo de Alta (H3 + RN08):**
1. Clique no leito abre modal de detalhes do paciente
2. Botão "Realizar Alta" abre seletor de tipo de limpeza:
   - Concorrente: 15–20 min (para internações simples)
   - Terminal: 45–60 min (para casos de isolamento/cirurgia)
3. Confirmação muda status do leito para "Aguardando Limpeza" e dispara notificação simulada ao Facilities

**Regras de negócio:** RN07 (prontuário expira 24h após alta), RN08 (alta aciona limpeza), RN09 (validação de medicação).

---

### 7. Gestão de Clínica Autônoma (`/gestao-clinica`) — `ClinicManagement.tsx`

**Identidade visual:** Ciano / azul

O **módulo mais completo do sistema** (~2.600 linhas). É o "Sistema Operacional de Negócios" do médico proprietário — agenda, prontuário inteligente, gestão financeira autônoma e integração com todos os serviços do hub.

**Navegação lateral com 4 seções principais + painéis de serviços:**

#### Painel (Dashboard)

- 3 cards financeiros com breakdown detalhado:
  - Honorários Líquidos: receita bruta → taxas do prédio → despesas → líquido
  - Pendências TISS por convênio (Unimed / Bradesco)
  - Fintech 360: antecipação de recebíveis disponível (R$ 21,7k)
- Lista de pacientes do dia com status de localização no prédio em tempo real
- NPS do médico (média 9,7) e taxa de confirmação por WhatsApp (94%)
- Controle de glosas: R$ 1.850 pendentes + botão de recurso
- Portal do Paciente: 247 acessos
- Gráfico de linha (Recharts): tendência de receita dos últimos 4 meses (bruta / deduções / líquida)

#### Agenda (H4, RN15, RN16)

- Alternância dia/semana com 5 contadores de status
- Cards de consulta com convênio, status e localização do paciente no hub
- Botão "Agendar no Hub" → modal de cross-selling para laboratório/centro cirúrgico (H4)
- Ícone de solicitação de facilities por slot
- Banner de predição de no-show por IA (RN16): "risco de 15% no slot das 16h"
- Painel lateral: "Pacientes no Prédio" com localização em tempo real (Laboratório / Aguardando Sala)

#### Prontuários / PEP Inteligente (H5, RN18, RN19, RN20)

- Banner de valor crítico: alerta para Glicemia 320 mg/dL (Ana Carolina) — RN20
- Card de paciente com QR Code de identificação, badge VIP, mini-mapa de localização no prédio
- Abas: Geral, Convênios, Histórico Interno (Sala), **Histórico do Hub** (H5 — integração com exames do laboratório)
- Lista de exames do hub com log de acesso LGPD por exame, indicadores de urgência, PDF/download
- Consentimento digital LGPD (RN18), prompt de compartilhamento com convênio (RN19)

#### Gestão Financeira Autônoma (H7, H8, RN-FIN01–03)

- 4 KPI cards: Saldo Disponível D+1, Previsão de Recebíveis de Convênios, Ticket Médio, Antecipação Fintech
- Gráfico de barras (Recharts): fluxo de caixa mensal (receitas vs despesas, 4 meses)
- Tabela de transações com split automático (status: Liberado D+1 / Processando / Concluído) — H8
- Faturamento TISS por convênio: Unimed, Bradesco, Amil, Particular
- Controle de glosas com IA: taxa de aprovação 96,8%, R$ 4.200 economizados
- DRE mensal: receita, deduções, resultado operacional, despesas itemizadas
- **RN-FIN01**: aviso de que o administrador do prédio não tem acesso a dados financeiros individuais

**Modais disponíveis:**
| Modal | Conteúdo |
|---|---|
| Agendar no Hub | Exames disponíveis no laboratório do hub com datas e horários (FHIR ServiceRequest) |
| Marketplace de Insumos | 4 produtos com preço de mercado vs preço do hub (economia) |
| Solicitar Facilities | 4 serviços disponíveis (limpeza, descarte, manutenção, café) |
| Áreas Nobres | 4 espaços pay-per-use (salas cirúrgicas, equipamentos) com disponibilidade |
| Evolução Médica (H6) | Tela full-screen com anamnese, prescrição, exames solicitados, dados financeiros do atendimento + painel de sinais vitais e alertas de alergia |

---

### 8. Dashboard Executivo (`/dashboard-executivo`) — `ExecutiveDashboard.tsx`

**Identidade visual:** Dark slate com teal/ciano, glassmorphism no header

Painel executivo **premium** — resumo de alto nível do desempenho da clínica e acesso rápido a serviços do hospital.

**Seções:**

**Minha Clínica:**
- Receita Líquida do Mês: R$ 38.500 (+12%)
- Próximos Pacientes: 4 consultas hoje com horário e status de confirmação
- Status de Glosas: 3 itens com valor e status (Pendente / Resolvido / Negado)

**Serviços do Hospital (ações rápidas):**
- Solicitar Limpeza (laranja — Facilities)
- Reservar Sala Cirúrgica (violeta)
- Comprar Suprimentos (azul/ciano)

**Atalhos:**
- Iniciar Consulta (emerald)
- Telemedicina (azul/índigo)
- Financeiro (âmbar)

**Centro de Notificações (coluna direita):**
- 4 notificações: 2 resultados urgentes de exames, 1 glosa resolvida, 1 facilities concluída
- Badge com contagem de não lidas no ícone de sino
- Marcar notificação individual como lida

---

### 9. Arquitetura & Segurança (`/arquitetura-seguranca`) — `ArchitectureSecurity.tsx`

**Identidade visual:** Dark slate/azul profundo

Tela de referência técnica e conceitual do ecossistema. Não usa `ThemeContext`.

**3 abas:**

**Arquitetura de Dados (RN-IND):**
- Princípio central: cada clínica tem banco de dados PostgreSQL isolado; o administrador vê apenas métricas operacionais, **nunca valores financeiros individuais**
- Diagrama lado a lado:
  - Banco da Clínica: tabelas `faturamento_mensal`, `convenios`, `pacientes_crm`
  - Banco do Administrador: tabelas `ocupacao_salas`, `repasses` — com campos `receita_medica` e `valores_individuais` marcados como **BLOQUEADO**
- Pilares: Bancos Separados, Criptografia Individual (AES-256), Apenas Métricas

**Segurança 360°:**
- Criptografia AES-256: em repouso (TDE, rotação de chaves a cada 90 dias), em trânsito (TLS 1.3, PFS), nível de aplicação (por campo)
- MFA em 3 fatores: Senha (política de 12 caracteres), TOTP-SHA256 (janela de 30s), FIDO2 WebAuthn biometria (opcional)
- Compliance: LGPD, CFM 1.821/2007, Audit Log, Backup 3-2-1

**Interoperabilidade:**
- Fluxo FHIR R4: Médico → POST `/fhir/ServiceRequest` → Hub → GET Lab → DiagnosticReport → notificação automática
- 3 recursos FHIR mapeados: Patient, ServiceRequest, DiagnosticReport
- Mensagens HL7 v2.x: ADT^A01 (admissão), ORM^O01 (pedido de exame) com segmentos de exemplo
- Benefícios: Zero Retrabalho, Sem Duplicação, Notificação Instantânea, Auditoria Completa

---

## Sub-Componentes Compartilhados

### `IntegratedFlow.tsx`

Visualização animada do **Fluxo 360° do Paciente** (embutida no AdminDashboard).

- Stepper de 4 etapas que avança automaticamente a cada 3 segundos:
  1. Check-in no Totem (QR Code)
  2. Chamada na Recepção
  3. Atendimento Médico
  4. Laboratório/Exame
- Linha de progresso proporcional, ícone da etapa ativa pulsa, etapas concluídas exibem checkmark
- Timeline detalhada com timestamps (08:45 → 09:16)
- Benefícios: 3x mais rápido vs fluxo manual

### `RoomStatusBoard.tsx`

Mapa de **ocupação das salas** (embutido no AdminDashboard).

- 4 KPI cards: Total (8), Livres (2), Ocupadas (3), Aguardando Limpeza (3)
- Barra de taxa de ocupação (38%)
- Grade de 8 salas em 3 andares: Consultórios (101–103), Salas de Exames (204–206), Centros Cirúrgicos (301–302)
- Status codificado por cor: verde (livre), vermelho (ocupado), âmbar (aguardando limpeza)

### `SplitExtrato.tsx`

Extrato de **split de pagamento automático** (embutido no AdminDashboard).

- 4 cards de totais: Receita Bruta, Taxa Sublocação, Custo Insumos, Receita Líquida
- Breakdown visual por clínica mostrando a fórmula:
  `Consultas × Valor Médio − Taxa de Sublocação − Custo Insumos = Valor Líquido`
- 3 clínicas: CardioVida, OrthoCenter, NeuroExcelência
- Rodapé de totais consolidados

### `ModuleHeader.tsx`

Componente de cabeçalho padronizado reutilizado nos módulos.

### `ProfileCard.tsx`

Card de perfil exibido na tela de seleção, com ícone, nome, contadores de notificação e badge de urgência.

### `UserSwitcher.tsx`

Dropdown de troca de usuário para demonstração. Exibe usuários do `mockUsers`, checkmark no usuário ativo, rotação do chevron ao abrir.

### `RealTimeNotification.tsx`

Componente de toasts de notificação cross-módulo exibido na tela de seleção.

### `ImageWithFallback.tsx`

Utilitário para imagens com fallback em caso de erro de carregamento.

---

## Histórias de Usuário Implementadas

| ID | Descrição |
|---|---|
| H1 | Acesso baseado em papel — cada usuário vê apenas os módulos permitidos |
| H2 | Seleção de perfil com identidade visual por papel |
| H3 | Fluxo de alta médica (Enfermagem → Facilities) com tipo de limpeza |
| H4 | Cross-selling de serviços do hub (agenda → laboratório / sala cirúrgica) |
| H5 | Histórico integrado de exames do hub no PEP do médico |
| H6 | Evolução médica com dados financeiros do atendimento embutidos |
| H7 | Gestão financeira autônoma com DRE e extrato |
| H8 | Tabela de transações com split automático e status D+1 |

---

## Regras de Negócio Implementadas

### Operacionais

| Código | Descrição |
|---|---|
| RN07 | Prontuário do paciente expira 24h após a alta |
| RN08 | Alta médica dispara automaticamente solicitação de limpeza para Facilities |
| RN09 | Validação de medicação: alerta para lote vencido e checagem de alergias |
| RN15 | Status do paciente no agendamento reflete localização real-time no prédio |
| RN16 | IA de predição de no-show: alerta de risco no slot de agendamento |
| RN18 | Consentimento digital LGPD para acesso ao prontuário |
| RN19 | Prompt de autorização para compartilhamento de dados com convênio |
| RN20 | Alerta de valor crítico em exame laboratorial (ex.: Glicemia 320 mg/dL) |
| RN-IND | Banco de dados isolado por clínica — administrador não acessa financeiro individual |

### Financeiras

| Código | Descrição |
|---|---|
| RN-FIN01 | Administrador do prédio não tem visibilidade dos dados financeiros de cada clínica |
| RN-FIN02 | Split automático de pagamento: consulta − taxa de sublocação − insumos = líquido |
| RN-FIN03 | Antecipação de recebíveis via Fintech 360 disponível para o médico proprietário |

---

## Integrações Cross-Módulo

```
KioskReception (check-in)
    └─► ClinicManagement Agenda
            └─► "Paciente No Prédio" / "Em Exame no Hub" (RN15)

MedicalEHR / ClinicManagement (finalização de consulta)
    └─► RoomStatusBoard
            └─► Status da sala muda para "Aguardando Limpeza"

NursingStation (alta médica)
    └─► FacilitiesApp
            └─► Nova tarefa de limpeza (Concorrente ou Terminal) com cronômetro

ClinicManagement Agenda (H4)
    └─► Laboratório do Hub
            └─► Modal de agendamento de exame (FHIR ServiceRequest)

MedicalEHR (solicitar exame)
    └─► FacilitiesApp
            └─► Solicitação de limpeza de sala pós-consulta

ClinicManagement Financeiro
    └─► SplitExtrato (visão do administrador)
            └─► Breakdown de repasse por clínica

Todos os módulos
    └─► RoleSelection (/)
            └─► Navegação de retorno + atualização de tema e notificações
```

---

## Conformidade e Segurança

- **LGPD**: consentimento digital por acesso ao prontuário, log de acesso por exame, expiração de dados 24h após alta
- **CFM 1.821/2007**: regulamentação de prontuário eletrônico respeitada no design do PEP
- **AES-256**: criptografia em repouso (TDE) e por campo
- **TLS 1.3 + PFS**: criptografia em trânsito
- **MFA**: senha + TOTP-SHA256 + FIDO2 WebAuthn
- **FHIR R4**: interoperabilidade para pedidos de exame e resultados (ServiceRequest, DiagnosticReport)
- **HL7 v2.x**: compatibilidade com sistemas legados (ADT, ORM)
- **Backup 3-2-1** e audit log imutável

---

## Estrutura de Arquivos

```
src/
├── app/
│   ├── App.tsx                    # Raiz — empilha providers + RouterProvider
│   ├── routes.tsx                 # Definição de todas as rotas
│   ├── contexts/
│   │   ├── UserContext.tsx        # Usuário, papéis, permissões
│   │   ├── NotificationContext.tsx # Contadores de notificação por módulo
│   │   └── ThemeContext.tsx       # Identidade visual por papel
│   └── components/
│       ├── AdminDashboard.tsx     # Módulo: Administrador do Prédio
│       ├── MedicalEHR.tsx         # Módulo: Prontuário Eletrônico
│       ├── KioskReception.tsx     # Módulo: Totem / Recepção
│       ├── FacilitiesApp.tsx      # Módulo: App de Facilities
│       ├── NursingStation.tsx     # Módulo: Posto de Enfermagem
│       ├── ClinicManagement.tsx   # Módulo: Gestão de Clínica Autônoma
│       ├── ExecutiveDashboard.tsx # Módulo: Dashboard Executivo
│       ├── ArchitectureSecurity.tsx # Módulo: Arquitetura & Segurança
│       ├── RoleSelection.tsx      # Tela inicial: seleção de perfil
│       ├── IntegratedFlow.tsx     # Sub: fluxo 360° animado
│       ├── RoomStatusBoard.tsx    # Sub: mapa de salas
│       ├── SplitExtrato.tsx       # Sub: extrato de split
│       ├── ModuleHeader.tsx       # Cabeçalho padronizado
│       ├── ProfileCard.tsx        # Card de perfil na seleção
│       ├── UserSwitcher.tsx       # Troca de usuário (demo)
│       ├── RealTimeNotification.tsx # Toasts cross-módulo
│       ├── ComingSoon.tsx         # Placeholder para módulos futuros
│       ├── figma/
│       │   └── ImageWithFallback.tsx
│       └── ui/                    # 38 primitivos shadcn/ui (Radix UI)
│           └── ...
└── styles/
    ├── fonts.css                  # Importações Google Fonts
    ├── theme.css                  # Tokens de design (Tailwind)
    ├── globals.css
    ├── index.css
    └── tailwind.css
```

---

## Módulos Planejados (Em Desenvolvimento)

| Rota | Módulo |
|---|---|
| `/laboratorio` | Laboratório / Imagem — laudos, resultados FHIR |
| Sidebar Admin: Gestão de Contratos | Contratos de locação e sublocação |
| Sidebar Admin: Facilities | Painel de facilities no admin |
| Sidebar Admin: Financeiro Global | Visão financeira consolidada do prédio |

---

## Como Rodar

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
```

A aplicação inicia na rota `/` (seleção de perfil). Para navegar entre módulos, selecione um perfil ou use o `UserSwitcher` para alternar entre usuários de demonstração.
