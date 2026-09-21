# Vigia Saúde — Identidade Visual
> Sistema Governamental de Compras Públicas de Medicamentos com IA  
> Design System v1.0.0

---

## Sumário

1. [Logotipo](#1-logotipo)
2. [Paleta de Cores](#2-paleta-de-cores)
3. [Tipografia](#3-tipografia)
4. [Componentes](#4-componentes)
5. [Ícones](#5-ícones)
6. [Tokens de Design](#6-tokens-de-design)
7. [Espaçamento e Raio](#7-espaçamento-e-raio)

---

## 1. Logotipo

### Composição

O logotipo é composto por dois elementos indissociáveis:

- **Ícone** — escudo com cruz da saúde e ponto verde de IA no canto superior direito
- **Wordmark** — "Vigia" em peso 800 + "Saúde" na cor primária azul `#1A56DB`

### Variações

| Variação | Fundo | Uso |
|---|---|---|
| **Principal** | Branco / cinza claro | Documentos, interfaces, telas de conteúdo |
| **Negativa** | Azul escuro `#1E3A5F` | Sidebar, cabeçalhos, splash screen |
| **Monocromática** | Qualquer | Impressão, carimbos, escala de cinza |

### Ícone SVG

```svg
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Escudo -->
  <path d="M20 3L5 9v11c0 8.3 6.4 16.1 15 18 8.6-1.9 15-9.7 15-18V9L20 3z" fill="#1A56DB"/>
  <!-- Cruz da saúde -->
  <rect x="17" y="12" width="6" height="16" rx="1" fill="white"/>
  <rect x="12" y="17" width="16" height="6" rx="1" fill="white"/>
  <!-- Ponto IA -->
  <circle cx="29" cy="11" r="4" fill="#0E9F6E"/>
  <path d="M28 11h2M29 10v2" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
</svg>
```

### Espaço de Proteção

Manter área livre equivalente à **altura do ícone (x)** em todos os lados do logotipo. Nenhum elemento pode invadir essa zona.

```
  ←─ x ─→
↑          ↑
x  [LOGO]  x
↓          ↓
  ←─ x ─→
```

### Regras de Uso

| | Regra |
|---|---|
| ✅ | Usar somente as variações aprovadas |
| ✅ | Manter o espaço de proteção sempre |
| ❌ | Distorcer as proporções do logotipo |
| ❌ | Alterar as cores da marca |
| ❌ | Aplicar sobre fundos com baixo contraste |
| ❌ | Adicionar sombras, contornos ou efeitos externos |
| ❌ | Recriar o ícone com outros elementos gráficos |

---

## 2. Paleta de Cores

### Azul Institucional — Primary

| Tom | Hex | Uso |
|---|---|---|
| **900 — Profundo** | `#1E3A5F` | Sidebar, headers escuros, fundo de destaque |
| **700 — Principal ★** | `#1A56DB` | Cor primária, CTAs, links, estados ativos |
| **500 — Médio** | `#2563EB` | Hover de elementos primários |
| **100 — Suave** | `#EBF0FB` | Backgrounds secundários, itens selecionados |
| **50 — Fundo** | `#F0F4FF` | Fundo de seções com ênfase azul |

### Verde Sucesso — Accent / Success

| Tom | Hex | Uso |
|---|---|---|
| **700 — Escuro** | `#057A55` | Hover, texto em contexto claro |
| **500 — Principal ★** | `#0E9F6E` | Sucesso, aprovação, IA, confirmação |
| **100 — Claro** | `#D1FAE5` | Background de alertas e badges de sucesso |

### Amarelo Atenção — Warning

| Tom | Hex | Uso |
|---|---|---|
| **700 — Escuro** | `#C27803` | Texto de aviso em fundo claro |
| **500 — Principal ★** | `#FACA15` | Atenção, pendente, prazo próximo |
| **100 — Claro** | `#FEF9C3` | Background de alertas de atenção |

### Vermelho Crítico — Danger

| Tom | Hex | Uso |
|---|---|---|
| **700 — Escuro** | `#C81E1E` | Texto de erro em fundo claro |
| **500 — Principal ★** | `#F05252` | Erro, rejeição, crítico, emergência |
| **100 — Claro** | `#FDE8E8` | Background de alertas críticos |

### Cinza Neutro — Neutral

| Tom | Hex | Uso |
|---|---|---|
| **900 — Texto** | `#111928` | Texto principal, títulos |
| **700 — Secundário** | `#374151` | Texto secundário, labels |
| **500 — Suave** | `#6B7280` | Placeholders, captions, ícones suaves |
| **200 — Borda** | `#E5E7EB` | Bordas de cards, divisores |
| **50 — Fundo de página** | `#F9FAFB` | Background da página |

### Semântica de Cores

| Cor | Hex | Significado | Exemplos |
|---|---|---|---|
| 🔵 Informação | `#1A56DB` | Ação primária, navegação | Links, botões CTA, aba ativa |
| 🟢 Sucesso | `#0E9F6E` | Conclusão positiva | ATA vigente, PdC aprovado, pago |
| 🟡 Atenção | `#FACA15` | Requer verificação | Em análise, prazo próximo, estoque baixo |
| 🔴 Crítico | `#F05252` | Falha ou urgência | Erro, rejeição, dispensa emergencial |

---

## 3. Tipografia

### Fontes

| Função | Família | Pesos | Importação |
|---|---|---|---|
| **Principal** | Inter | 300, 400, 500, 600, 700, 800 | Google Fonts |
| **Mono / Dados** | JetBrains Mono | 400, 500 | Google Fonts |

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=JetBrains+Mono:wght@400;500&display=swap');
```

**Fallback stack:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Escala Tipográfica

| Nível | Tamanho | Peso | CSS | Uso |
|---|---|---|---|---|
| Display | 36px | 800 | `text-4xl font-extrabold` | Títulos de páginas principais |
| H1 | 30px | 700 | `text-3xl font-bold` | Cabeçalho de tela |
| H2 | 24px | 600 | `text-2xl font-semibold` | Seção dentro da tela |
| H3 | 20px | 600 | `text-xl font-semibold` | Subseção, painel |
| H4 | 16px | 600 | `text-base font-semibold` | Label de grupo |
| Body Large | 16px | 400 | `text-base font-normal` | Texto corrido principal |
| Body Small | 14px | 400 | `text-sm font-normal` | Texto de apoio, tabelas |
| Caption | 12px | 500 | `text-xs font-medium` | Metadados, rótulos |
| Mono | 13px | 400 | `text-sm font-mono` | Códigos, IDs, valores R$ |

### Exemplos Reais

```
Display   Vigia Saúde
H1        Gestão de Compras Públicas
H2        Pedidos de Compra (PdC)
H3        Detalhes da ATA nº 2024-0042
H4        Número do Processo
Body      Informações do fornecedor e condições gerais de fornecimento.
Small     Prazo de validade: 31/12/2025 · Responsável: João Silva
Caption   CNPJ: 00.000.000/0001-00
Mono      ATA-2024-0042 · PdC-2024-0187 · R$ 1.234,56
```

---

## 4. Componentes

### Botões

#### Variantes

| Variante | Background | Texto | Hover | Uso |
|---|---|---|---|---|
| `primary` | `#1A56DB` | `#ffffff` | `#1E3A5F` | Ação principal da tela |
| `secondary` | `#EBF0FB` | `#1A56DB` | `#d9e4f8` | Ação secundária |
| `success` | `#0E9F6E` | `#ffffff` | `#057A55` | Aprovar, confirmar |
| `danger` | `#F05252` | `#ffffff` | `#C81E1E` | Rejeitar, excluir |
| `outline` | `transparent` | `#1A56DB` | `#EBF0FB` | Ação terciária com borda |
| `ghost` | `transparent` | `#374151` | `#E5E7EB` | Ação sutil, sem destaque |

#### Tamanhos

| Tamanho | Padding | Font | Border-radius |
|---|---|---|---|
| `sm` | `5px 12px` | 12px | 6px |
| `md` (padrão) | `8px 16px` | 14px | 8px |
| `lg` | `12px 24px` | 16px | 10px |

#### CSS Base

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: 'Inter', sans-serif;
}
.btn-primary   { background: #1A56DB; color: #fff; }
.btn-primary:hover { background: #1E3A5F; }
.btn-secondary { background: #EBF0FB; color: #1A56DB; }
.btn-success   { background: #0E9F6E; color: #fff; }
.btn-danger    { background: #F05252; color: #fff; }
.btn-outline   { background: transparent; border: 1.5px solid #1A56DB; color: #1A56DB; }
.btn-ghost     { background: transparent; color: #374151; }
```

---

### Badges / Status

#### Variantes (pill)

| Status | Background | Texto | Dot |
|---|---|---|---|
| Ativa | `#EBF0FB` | `#1A56DB` | `#1A56DB` |
| Em análise | `#FEF9C3` | `#92400E` | `#FACA15` |
| Aprovado | `#D1FAE5` | `#057A55` | `#0E9F6E` |
| Rejeitado | `#FDE8E8` | `#C81E1E` | `#F05252` |
| Expirada | `#E5E7EB` | `#374151` | `#9CA3AF` |
| Emergência | `#F5F3FF` | `#6D28D9` | `#7C3AED` |

#### CSS

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
```

---

### Alertas

| Tipo | Background | Borda esq. | Texto |
|---|---|---|---|
| Informação | `#EBF0FB` | `#1A56DB` | `#1E3A5F` |
| Sucesso | `#D1FAE5` | `#0E9F6E` | `#057A55` |
| Atenção | `#FEF9C3` | `#FACA15` | `#92400E` |
| Crítico | `#FDE8E8` | `#F05252` | `#C81E1E` |

#### CSS

```css
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid;
  font-size: 14px;
  line-height: 1.5;
}
```

---

### Cards de KPI

```
┌─────────────────────┐
│ [ícone 40px]        │
│                     │
│ 142                 │  ← valor: 24px bold
│ ATAs Ativas         │  ← label: 12px gray-500
│ +12 este mês        │  ← delta: 12px cor temática
└─────────────────────┘
```

Padding: `20px` · Border-radius: `12px` · Border: `1px solid #E5E7EB`

---

### Tabela de Dados

```
┌──────────┬──────────────────┬────────────────┬───────────┬────────────┬──────────────┐
│ Nº ATA   │ Fornecedor       │ Item           │ Valor     │ Validade   │ Status       │
├──────────┼──────────────────┼────────────────┼───────────┼────────────┼──────────────┤
│ 2024-42  │ FarmaDistrib.    │ Dipirona 500mg │ R$ 0,38  │ 31/12/2025 │ ● Ativa      │
│ 2024-31  │ MediSupply S.A.  │ Amoxicilina    │ R$ 1,12  │ 30/06/2025 │ ● Em análise │
│ 2024-19  │ Pharma BH Ltda   │ Enalapril 10mg │ R$ 0,24  │ 28/02/2025 │ ● Expirada   │
└──────────┴──────────────────┴────────────────┴───────────┴────────────┴──────────────┘
```

- Cabeçalho: `#F9FAFB`, texto `11px uppercase gray-500`
- Linhas: `hover → #F9FAFB`
- IDs/códigos: `font-mono text-blue-700`
- Valores monetários: `font-mono font-medium gray-900`

---

### Campos de Entrada

| Estado | Border | Background | Ring |
|---|---|---|---|
| Padrão | `#D1D5DB` | `#ffffff` | — |
| Focus | `#1A56DB` | `#ffffff` | `rgba(26,86,219,.15)` 3px |
| Erro | `#F05252` | `#FDE8E8` | — |

```css
input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #D1D5DB;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
input:focus {
  border-color: #1A56DB;
  box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.15);
}
input.error {
  border-color: #F05252;
  background: #FDE8E8;
}
```

---

## 5. Ícones

**Biblioteca:** [`lucide-react`](https://lucide.dev)  
**Stroke-width padrão:** `1.5px`

### Tamanhos Contextuais

| Tamanho | Uso |
|---|---|
| `12px` | Badges, chips, elementos inline pequenos |
| `16px` | Texto inline, labels, inputs |
| `20px` | Cards, botões com ícone |
| `24px` | Cabeçalhos de seção, sidebar |
| `32px` | Hero, telas de estado vazio |

### Ícones do Sistema

| Ícone | Nome Lucide | Contexto |
|---|---|---|
| `Shield` | `shield` | Auditoria, segurança |
| `Activity` | `activity` | Dashboard, monitoramento |
| `FileText` | `file-text` | Pedidos de Compra (PdC) |
| `AlertTriangle` | `alert-triangle` | Dispensa emergencial, alertas |
| `Users` | `users` | Gestão de fornecedores |
| `Package` | `package` | ATAs, estoques |
| `Pill` | `pill` | Medicamentos |
| `Building2` | `building-2` | Órgão público |
| `BarChart3` | `bar-chart-3` | Relatórios, analytics |
| `Lock` | `lock` | Permissões, acesso |
| `Bell` | `bell` | Notificações |
| `Search` | `search` | Busca global |
| `Download` | `download` | Exportar dados |
| `Eye` | `eye` | Visualizar detalhe |
| `TrendingUp` | `trending-up` | Tendências, economia |
| `Zap` | `zap` | IA, automação |

---

## 6. Tokens de Design

### Variáveis CSS (`--vs-*`)

```css
:root {
  /* ── Azul Institucional ── */
  --vs-blue-900: #1E3A5F;   /* Sidebar, headers escuros */
  --vs-blue-700: #1A56DB;   /* Cor primária, CTAs, links */
  --vs-blue-500: #2563EB;   /* Hover de elementos primários */
  --vs-blue-100: #EBF0FB;   /* Backgrounds secundários */
  --vs-blue-50:  #F0F4FF;   /* Fundo de seções com ênfase */

  /* ── Verde Sucesso ── */
  --vs-green:    #0E9F6E;   /* Sucesso, aprovação, IA */
  --vs-green-dk: #057A55;   /* Hover, texto em fundo claro */
  --vs-green-lt: #D1FAE5;   /* Background de badges/alertas */

  /* ── Amarelo Atenção ── */
  --vs-yellow:    #FACA15;  /* Atenção, pendente */
  --vs-yellow-dk: #C27803;  /* Texto de aviso */
  --vs-yellow-lt: #FEF9C3;  /* Background de alertas */

  /* ── Vermelho Crítico ── */
  --vs-red:    #F05252;     /* Erro, rejeição, emergência */
  --vs-red-dk: #C81E1E;     /* Texto de erro */
  --vs-red-lt: #FDE8E8;     /* Background de alertas */

  /* ── Cinza Neutro ── */
  --vs-gray-900: #111928;   /* Texto principal */
  --vs-gray-700: #374151;   /* Texto secundário */
  --vs-gray-500: #6B7280;   /* Placeholders, captions */
  --vs-gray-300: #D1D5DB;   /* Bordas de inputs */
  --vs-gray-200: #E5E7EB;   /* Bordas de cards */
  --vs-gray-100: #F3F4F6;   /* Fundo de inputs, thead */
  --vs-gray-50:  #F9FAFB;   /* Background da página */

  /* ── Estrutura ── */
  --vs-radius: 8px;
  --vs-shadow-sm: 0 1px 2px rgba(0,0,0,.06);
  --vs-shadow:    0 1px 4px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.06);
}
```

### Mapeamento Tailwind → Token

| Classe Tailwind | Token equivalente |
|---|---|
| `bg-background` | `--vs-gray-50` |
| `text-foreground` | `--vs-gray-900` |
| `bg-primary` | `--vs-blue-700` |
| `text-primary-foreground` | `#ffffff` |
| `bg-accent` | `--vs-green` |
| `bg-destructive` | `--vs-red` |
| `border-border` | `--vs-gray-200` |
| `bg-muted` | `--vs-gray-200` |
| `text-muted-foreground` | `--vs-gray-500` |

---

## 7. Espaçamento e Raio

### Escala de Espaçamento

| Token Tailwind | px | rem | Uso típico |
|---|---|---|---|
| `space-1` | 4px | 0.25rem | Gap entre ícone e texto |
| `space-2` | 8px | 0.5rem | Padding de badges |
| `space-3` | 12px | 0.75rem | Gap entre campos |
| `space-4` | 16px | 1rem | Padding de botões, gap padrão |
| `space-5` | 20px | 1.25rem | Padding interno de cards |
| `space-6` | 24px | 1.5rem | Padding de seções |
| `space-8` | 32px | 2rem | Gap entre componentes |
| `space-10` | 40px | 2.5rem | Margem de seção |
| `space-12` | 48px | 3rem | Padding de hero interno |
| `space-16` | 64px | 4rem | Padding de seção de página |

### Raios de Borda

| Classe Tailwind | Valor | Uso |
|---|---|---|
| `rounded-sm` | 2px | Tags muito pequenas |
| `rounded` | 4px | Elementos inline |
| `rounded-md` | 6px | Botões `sm`, inputs pequenos |
| `rounded-lg` | 8px | Botões `md`, inputs, cards pequenos |
| `rounded-xl` | 12px | Cards de conteúdo |
| `rounded-2xl` | 16px | Cards de destaque, modais |
| `rounded-full` | 9999px | Badges pill, avatares |

### Sombras

```css
/* Elevação baixa — cards, inputs */
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);

/* Elevação média — dropdowns, tooltips */
box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.06);

/* Elevação alta — modais, overlays */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
```

---

## Referência Rápida

```
AZUL PRINCIPAL  #1A56DB   ████  Botões, links, ativo
AZUL ESCURO     #1E3A5F   ████  Sidebar, cabeçalho
VERDE           #0E9F6E   ████  Sucesso, IA
AMARELO         #FACA15   ████  Atenção, pendente
VERMELHO        #F05252   ████  Erro, emergência
TEXTO           #111928   ████  Padrão
FUNDO           #F9FAFB   ████  Página

FONTE           Inter 14–32 · JetBrains Mono (dados)
RAIO            8px padrão · 12px cards · pill badges
ÍCONES          lucide-react · stroke 1.5px
```

---

*Vigia Saúde Design System v1.0.0 — Governo Federal do Brasil*
