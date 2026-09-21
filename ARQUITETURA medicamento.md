# Vigia Saúde — Arquitetura do Projeto

## Visão Geral

**Vigia Saúde** é um sistema de gestão de medicamentos para a rede municipal de saúde. O protótipo é uma Single-Page Application (SPA) React sem backend, com toda a lógica de navegação e estado gerenciada no cliente via `useState`.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vigia Saúde SPA                          │
│                                                                 │
│  ┌─────────────┐   ┌──────────────────────┐   ┌─────────────┐  │
│  │  Landing    │   │  Ambiente Interno     │   │   Portal    │  │
│  │  Page       │──▶│  (Vigia Core)         │   │  Público   │  │
│  │             │   │  CD Manager /         │   │  (Cidadão) │  │
│  └─────────────┘   │  Gerente Farmácia     │   └─────────────┘  │
│                    └──────────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework UI | React | 18.3.1 |
| Linguagem | TypeScript | — |
| Build Tool | Vite | 6.3.5 |
| Estilização | Tailwind CSS | 4.1.12 |
| Componentes base | Radix UI | vários |
| Ícones | Lucide React | 0.487.0 |
| Gráficos | Recharts | 2.15.2 |
| Animações | Motion (motion/react) | 12.23.24 |
| Toasts | Sonner | 2.0.3 |
| Formulários | React Hook Form | 7.55.0 |
| Datas | date-fns | 3.6.0 |
| Gerenciador de pacotes | pnpm | — |

---

## Estrutura de Diretórios

```
code/
├── src/
│   ├── app/
│   │   ├── App.tsx                        # Raiz da aplicação — roteamento e estado global
│   │   └── components/
│   │       ├── dashboard/                 # Widgets do dashboard
│   │       │   ├── alerts-panel.tsx       # Painel de alertas críticos
│   │       │   ├── expiry-chart.tsx       # Gráfico de vencimentos
│   │       │   ├── kpi-card.tsx           # Card de indicador (KPI)
│   │       │   └── pending-approvals.tsx  # Fila de aprovações pendentes
│   │       ├── inventory/
│   │       │   └── stock-table.tsx        # Tabela master-detail FEFO
│   │       ├── invoice/                   # Fluxo de importação de NF
│   │       │   ├── file-upload-zone.tsx   # Zona de upload drag-and-drop
│   │       │   └── invoice-review-table.tsx # Revisão e confirmação de itens
│   │       ├── landing/
│   │       │   └── landing-page.tsx       # Tela de entrada / seleção de perfil
│   │       ├── layout/
│   │       │   └── sidebar.tsx            # Sidebar contextual (CD / Farmácia)
│   │       ├── modals/                    # Modais de fluxos interativos
│   │       │   ├── confirm-collect-modal.tsx
│   │       │   ├── create-order-modal.tsx
│   │       │   ├── dispense-result-modal.tsx
│   │       │   ├── invite-user-modal.tsx
│   │       │   ├── order-detail-modal.tsx
│   │       │   ├── patient-delivery-modal.tsx
│   │       │   ├── quick-order-modal.tsx
│   │       │   ├── register-recall-modal.tsx
│   │       │   ├── transfer-medication-modal.tsx
│   │       │   └── transfer-modal.tsx
│   │       ├── orders/                    # Fluxo de pedidos descentralizados
│   │       │   ├── new-order-form.tsx
│   │       │   └── order-review-modal.tsx
│   │       ├── pages/                     # Páginas completas da aplicação
│   │       │   ├── advanced-receive-page.tsx  # Recebimento avançado (CD)
│   │       │   ├── audit-page.tsx             # Auditoria
│   │       │   ├── dashboard-cd.tsx            # Dashboard CD Manager
│   │       │   ├── dashboard-pharmacy.tsx      # Dashboard Gerente de Farmácia
│   │       │   ├── delivery-page.tsx           # Entregas de Reposição
│   │       │   ├── dispense-items.tsx          # Dispensação de itens
│   │       │   ├── inventory-page.tsx          # Gestão de Estoque
│   │       │   ├── medication-detail.tsx        # Detalhes do Medicamento
│   │       │   ├── notifications-page.tsx       # Notificações
│   │       │   ├── orders-cd-page.tsx           # Pedidos de Reposição (CD)
│   │       │   ├── orders-pharmacy-page.tsx     # Pedidos de Reposição (Farmácia)
│   │       │   ├── pharmacy-map-page.tsx        # Mapa de Farmácias
│   │       │   ├── pharmacy-profile-page.tsx    # Perfil da Farmácia
│   │       │   ├── recalls-page.tsx             # Recalls
│   │       │   ├── receive-items.tsx            # Recebimento de itens
│   │       │   ├── reports-page.tsx             # Relatórios
│   │       │   ├── settings-page.tsx            # Configurações
│   │       │   ├── traceability-page.tsx        # Rastreabilidade
│   │       │   └── users-page.tsx               # Usuários
│   │       ├── public/                    # Portal Público (Cidadão)
│   │       │   ├── empty-state.tsx
│   │       │   ├── pharmacy-card.tsx
│   │       │   ├── public-header.tsx
│   │       │   ├── public-portal.tsx      # Container do portal cidadão
│   │       │   ├── results-list.tsx
│   │       │   ├── search-hero.tsx
│   │       │   └── share-buttons.tsx
│   │       └── ui/                        # Design System — primitivos Radix UI / shadcn
│   │           ├── accordion.tsx
│   │           ├── alert-dialog.tsx
│   │           ├── alert.tsx
│   │           ├── avatar.tsx
│   │           ├── badge.tsx
│   │           ├── breadcrumb.tsx
│   │           ├── button.tsx
│   │           ├── card.tsx
│   │           ├── checkbox.tsx
│   │           ├── dialog.tsx
│   │           ├── dropdown-menu.tsx
│   │           ├── form.tsx
│   │           ├── input.tsx
│   │           ├── label.tsx
│   │           ├── pagination.tsx
│   │           ├── popover.tsx
│   │           ├── progress.tsx
│   │           ├── radio-group.tsx
│   │           ├── scroll-area.tsx
│   │           ├── select.tsx
│   │           ├── separator.tsx
│   │           ├── sidebar.tsx
│   │           ├── skeleton.tsx
│   │           ├── sonner.tsx
│   │           ├── switch.tsx
│   │           ├── table.tsx
│   │           ├── tabs.tsx
│   │           ├── textarea.tsx
│   │           ├── tooltip.tsx
│   │           └── utils.ts               # cn() helper (clsx + tailwind-merge)
│   ├── imports/                           # Assets de importação Figma
│   │   ├── image.png
│   │   └── image-1.png
│   └── styles/
│       ├── fonts.css                      # Importações Google Fonts
│       ├── globals.css                    # Reset e estilos globais
│       ├── index.css                      # Ponto de entrada CSS (Tailwind + tokens)
│       ├── tailwind.css                   # Diretivas Tailwind
│       └── theme.css                      # Tokens CSS (@theme inline)
├── guidelines/                            # Diretrizes de design (Make Kit)
├── ARQUITETURA.md                         # Este documento
├── IDENTIDADE_VISUAL.md
├── COMPONENTES_CODIGO.md
├── PALETA_CORES.md
├── QUICK_REFERENCE.md
├── README_IDENTIDADE.md
├── DETALHES_MEDICAMENTO.md
├── FLUXOS_INTERATIVOS.md
├── GESTAO_ESTOQUE.md
├── package.json
├── vite.config.ts
└── postcss.config.mjs
```

---

## Arquitetura de Estado (App.tsx)

Toda a lógica de roteamento e estado global vive em `App.tsx` usando `useState`. Não há biblioteca de estado global (Redux, Zustand, etc.).

### Tipos Centrais

```typescript
type AppMode  = "landing" | "admin" | "public";
type UserType = "cd" | "pharmacy";
type PageType =
  | "dashboard" | "importacao" | "pedidos" | "configuracoes"
  | "recebimento" | "recebimento-cd" | "recalls" | "rastreabilidade"
  | "auditoria" | "relatorios" | "usuarios" | "notificacoes"
  | "mapa-farmacias" | "dispensacao" | "estoque"
  | "medicamento-detalhe" | "farmacia-perfil" | "entregas";
```

### Estados Principais

| Estado | Tipo | Responsabilidade |
|--------|------|-----------------|
| `appMode` | `AppMode` | Modo atual da aplicação (landing / admin / público) |
| `userType` | `UserType` | Perfil ativo: CD Manager ou Gerente de Farmácia |
| `currentPage` | `PageType` | Página atual dentro do ambiente interno |
| `uploadedFile` | `File \| null` | Arquivo de NF em processamento |
| `showInvoiceReview` | `boolean` | Controla etapa de revisão da NF |
| `isInvoiceConfirmed` | `boolean` | Confirma entrada no estoque |
| `showNewOrderForm` | `boolean` | Exibe formulário de novo pedido |
| `reviewingOrderId` | `string \| null` | ID do pedido em revisão |
| `showCreateOrderModal` | `boolean` | Modal de criação de pedido |
| `showQuickOrderModal` | `boolean` | Modal de pedido rápido |
| `showTransferModal` | `boolean` | Modal de transferência entre unidades |
| `showOrderDetail` | `boolean` | Modal de detalhes do pedido |
| `orderDetail` | `OrderDetailState \| null` | Dados do pedido em detalhe |
| `dispenseResult` | `DispenseResult \| null` | Resultado da dispensação |
| `selectedMedicationId` | `string \| null` | Medicamento selecionado para detalhe |
| `viewingFarmaciaId` | `string` | ID da farmácia em visualização |

---

## Roteamento

O roteamento é **simulado** via `useState` — não usa React Router nem URL. A função `handleNavigate(page)` troca o estado `currentPage` e reseta fluxos em andamento.

```
AppMode: "landing"
    └── LandingPage → seleciona perfil → AppMode: "admin" ou "public"

AppMode: "admin"
    ├── Sidebar (contextual por UserType)
    └── renderPage() → switch(currentPage) → componente da página

AppMode: "public"
    └── PublicPortal (mobile-first, independente da sidebar)
```

### Mapa de Navegação — Ambiente Interno

#### CD Manager (`userType === "cd"`)
| Rota (`PageType`) | Componente | Descrição |
|-------------------|-----------|-----------|
| `dashboard` | `DashboardCD` | KPIs, alertas, aprovações pendentes |
| `importacao` | `FileUploadZone` / `InvoiceReviewTable` | Importação de Notas Fiscais |
| `pedidos` | `OrdersCDPage` | Gestão de Pedidos de Reposição (aprovação) |
| `recebimento-cd` | `AdvancedReceivePage` | Recebimento avançado de medicamentos |
| `estoque` | `InventoryPage` | Estoque com tabela FEFO |
| `medicamento-detalhe` | `MedicationDetail` | Detalhes e lotes de medicamento |
| `recalls` | `RecallsPage` | Gestão de recalls |
| `rastreabilidade` | `TraceabilityPage` | Rastreio de lotes |
| `auditoria` | `AuditPage` | Log de auditoria |
| `relatorios` | `ReportsPage` | Relatórios gerenciais |
| `mapa-farmacias` | `PharmacyMapPage` | Mapa de farmácias da rede |
| `farmacia-perfil` | `PharmacyProfilePage` | Perfil de farmácia específica |
| `entregas` | `DeliveryPage` | Entregas de Reposição |
| `usuarios` | `UsersPage` | Gerenciamento de usuários |
| `notificacoes` | `NotificationsPage` | Central de notificações |
| `configuracoes` | `SettingsPage` | Configurações do sistema |

#### Gerente de Farmácia (`userType === "pharmacy"`)
| Rota (`PageType`) | Componente | Descrição |
|-------------------|-----------|-----------|
| `dashboard` | `DashboardPharmacy` | KPIs da farmácia, estoque crítico |
| `pedidos` | `OrdersPharmacyPage` | Pedidos de Reposição ao CD |
| `estoque` | `InventoryPage` | Estoque local |
| `medicamento-detalhe` | `MedicationDetail` | Detalhes de medicamento |
| `recebimento` | `ReceiveItems` | Recebimento de entregas do CD |
| `dispensacao` | `DispenseItems` | Dispensação para pacientes |
| `recalls` | `RecallsPage` | Recalls ativos |
| `rastreabilidade` | `TraceabilityPage` | Rastreio de lotes |
| `entregas` | `DeliveryPage` | Entregas de Reposição recebidas |
| `notificacoes` | `NotificationsPage` | Notificações |
| `configuracoes` | `SettingsPage` | Configurações |

---

## Fluxos Interativos

### Fluxo A — Importação de Nota Fiscal (CD Manager)
```
[Upload de arquivo] → FileUploadZone
    └── onFileSelect → showInvoiceReview: true
        └── InvoiceReviewTable
            ├── Confirmar → isInvoiceConfirmed: true → toast de sucesso
            └── Cancelar → volta ao estado inicial
```

### Fluxo B — Pedido de Reposição (Farmácia → CD)
```
[Novo Pedido] → CreateOrderModal
    └── Submeter → toast de confirmação
[Pedido existente] → OrderDetailModal
    └── CD aprova → TransferModal → confirmação
```

### Fluxo C — Pedido Rápido
```
[Estoque crítico] → QuickOrderModal (medicamento pré-selecionado)
    └── Confirmar quantidade → toast de envio
```

### Fluxo D — Dispensação
```
DispenseItems → selecionar paciente + itens
    └── Confirmar → DispenseResultModal (resumo com FEFO)
```

### Fluxo E — Recebimento (Farmácia)
```
ReceiveItems → conferir itens da entrega
    └── Concluir → currentPage: "dashboard" → toast
```

---

## Design System

### Identidade Visual
- **Primário:** `#0066CC` (azul Health Tech)
- **Normal/OK:** verde semântico
- **Atenção:** amarelo semântico
- **Crítico/Ruptura:** vermelho semântico
- **Tipografia:** sans-serif (Google Fonts), sem serifa
- **Acessibilidade:** WCAG 2.1 AA

### Tokens CSS (`src/styles/theme.css`)
Os tokens seguem o contrato `@theme inline` do Tailwind 4, mapeando variáveis CSS para classes utilitárias:
- `--background` → `bg-background`
- `--foreground` → `text-foreground`
- `--border` → `border-border`
- `--primary` / `--primary-foreground`
- `--destructive` / `--muted` / `--accent` / `--card` / `--popover`

### Componentes UI (`src/app/components/ui/`)
Todos os primitivos usam **`React.forwardRef`** e seguem o padrão shadcn/ui sobre Radix UI. Utilitário `cn()` em `utils.ts` combina `clsx` + `tailwind-merge` para composição de classes.

---

## Portal Público (Cidadão)

Interface **mobile-first** independente, acessível via `appMode === "public"`.

```
PublicPortal
├── PublicHeader         # Cabeçalho com identidade municipal
├── SearchHero           # Busca de medicamentos por nome/princípio ativo
├── ResultsList          # Lista de farmácias com disponibilidade
│   └── PharmacyCard     # Card individual: endereço, estoque, horário
├── EmptyState           # Estado vazio de busca
└── ShareButtons         # Compartilhamento de resultado / notificação de retorno
```

---

## Dados Mock

Todos os dados são estáticos, definidos diretamente em `App.tsx` e nos componentes de página. Não há chamadas a APIs externas ou localStorage.

| Constante | Uso |
|-----------|-----|
| `mockInvoiceData` | Itens da Nota Fiscal para revisão |
| `mockOrderReviewData` | Itens de pedido para aprovação do CD |
| `MOCK_ORDER_ITEMS_CD` | Detalhes de pedido — visão CD |
| `MOCK_ORDER_ITEMS_PHARMACY` | Detalhes de pedido — visão Farmácia |

---

## Convenções de Código

- **Componentes:** PascalCase, um por arquivo, `export` nomeado (exceto `App.tsx` que é `default`)
- **Props:** interface `TypeProps` local ao arquivo
- **Handlers:** prefixo `handle` no pai, `on` na interface do filho
- **Estilos:** exclusivamente Tailwind CSS; sem CSS Modules ou styled-components
- **Ícones:** exclusivamente `lucide-react`, importados individualmente
- **Toasts:** `sonner` via `toast.success()` / `toast.error()` para feedback de ação
- **Acessibilidade:** componentes Radix UI com atributos ARIA nativos; `React.forwardRef` em todos os primitivos UI

---

## Pontos de Extensão Futuros

| Área | O que adicionar |
|------|----------------|
| Autenticação | Substituir toggle de perfil por login real (JWT / OAuth) |
| Estado global | Zustand ou React Context para compartilhar estado entre páginas |
| Roteamento | React Router com URLs reais e deep linking |
| Backend | REST API ou Supabase para persistência de estoque e pedidos |
| Notificações em tempo real | WebSocket ou SSE para alertas críticos |
| Internacionalização | i18next para suporte a múltiplos idiomas |
| Testes | Vitest + Testing Library para componentes e fluxos |
