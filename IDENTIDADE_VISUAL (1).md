# Vigia Saúde 360 — Identidade Visual
> Sistema Governamental de Custeio, Compras Públicas e Gestão Hospitalar
> Design System **v2.4.0** — referência única e vigente

---

## Como usar este guia

Este documento descreve **só o que vale hoje**. O que mudou entre versões fica no [Histórico](#10-histórico-de-versões), no fim — nenhuma regra antiga continua valendo por estar escrita mais acima.

Três fontes precisam dizer a mesma coisa. Se divergirem, corrija as três no mesmo commit:

| Fonte | Onde | O que guarda |
|---|---|---|
| **Código** | `nucleo/src/app/globals.css` (`@theme`) e `nucleo/src/components/ModuloLayoutShell.tsx` | Tokens que viram classes Tailwind e as cores de categoria em TypeScript |
| **Figma** | [Vigia Saúde 360 — Padrão de Módulos](https://www.figma.com/design/oNgeLR3Td97EmqdHqdkTuU) | Variáveis de cor, componentes (Logo de Módulo, Item de Menu, Menu Lateral) e o template de módulo |
| **Este guia** | `IDENTIDADE_VISUAL (1).md` | As regras de uso e o porquê delas |

---

## Princípios

1. **Azul Vigia é a marca.** `#0066CC` identifica o produto: logo "Vigia Saúde 360", painel de destaque do hub, avatar no hub e botões de marca.
2. **A categoria identifica o módulo.** Dentro de um módulo, a logo do módulo, o item ativo do menu e o avatar usam o tom forte da categoria do módulo. Fora desses pontos, a categoria aparece só em detalhes suaves (tag, dot).
3. **Ação e status têm cor própria e fixa.** Teal para ação, terracota para o único destaque da tela, ocre para atenção, tijolo para crítico. Essas cores nunca identificam módulo.
4. **Papel e tinta, não branco e cinza.** Fundo creme `#F6F3EC`, texto quase-preto quente `#1B1F1C`.
5. **Tipografia com identidade.** Fraunces (serifada) nos títulos; Public Sans no resto.
6. **Contraste AA sempre.** Texto ≥ 4,5:1; ícone e elemento gráfico ≥ 3:1. Toda cor deste guia vem com o contraste já medido (§ 2.6).
7. **Cor sólida, nunca degradê.**

---

## Sumário

1. [Marca](#1-marca)
2. [Cores](#2-cores)
3. [Tipografia](#3-tipografia)
4. [Moldura do Módulo](#4-moldura-do-módulo)
5. [Componentes](#5-componentes)
6. [Ícones](#6-ícones)
7. [Espaçamento, Raio e Sombra](#7-espaçamento-raio-e-sombra)
8. [Tokens](#8-tokens)
9. [Novo Módulo — Checklist](#9-novo-módulo--checklist)
10. [Histórico de Versões](#10-histórico-de-versões)

---

## 1. Marca

### Composição

Dois elementos indissociáveis (código: `VigiaSidebarLayout.tsx`):

- **Símbolo** — escudo com cruz da saúde vazada, em papel `#F6F3EC`, dentro de um quadrado **azul Vigia `#0066CC`** de 36px, raio 12px. Hover do quadrado: `#0052A3`.
- **Wordmark** — "Vigia" em Fraunces 700 tinta + "Saúde 360" em Fraunces 700 **teal `#0E5C4C`**.

```svg
<!-- Quadrado 36px, raio 12px, fundo #0066CC; escudo 20px -->
<svg viewBox="0 0 24 24" width="20" height="20" fill="#F6F3EC">
  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v4h4v2h-4v4h-2v-4H7v-2h4V7z"/>
</svg>
```

### Variações

| Variação | Quadrado | Escudo | Wordmark | Uso |
|---|---|---|---|---|
| **Principal** | `#0066CC` | papel | tinta + teal | Cabeçalho, documentos, telas sobre papel ou branco |
| **Negativa** | papel | `#0066CC` | papel | Sobre o azul Vigia (painel de destaque, splash) |
| **Monocromática** | tinta | papel | tinta | Impressão, carimbos, escala de cinza |

### Regras

| | Regra |
|---|---|
| ✅ | Espaço de proteção igual à altura do quadrado em todos os lados |
| ✅ | Só as três variações acima |
| ❌ | Pintar o quadrado da marca com cor de categoria, de ação ou de status |
| ❌ | Distorcer, girar, contornar, sombrear ou aplicar degradê |
| ❌ | Recriar o escudo com outros elementos gráficos |

---

## 2. Cores

### 2.1 Base neutra — tinta e papel

| Nome | Valor | Uso |
|---|---|---|
| **Tinta** | `#1B1F1C` | Texto principal e títulos |
| Tinta 70% | `rgba(27,31,28,.70)` | Texto secundário, descrições |
| Tinta 45% | `rgba(27,31,28,.45)` | Labels, captions, placeholders |
| Tinta 12% | `rgba(27,31,28,.12)` | Bordas de card, divisores |
| Tinta 8% | `rgba(27,31,28,.08)` | Divisores internos (linha de tabela, rodapé de card) |
| **Papel** | `#F6F3EC` | Fundo de página; texto e ícone sobre azul Vigia |
| Papel 2 | `#EFEAE0` | Painéis secundários |
| **Branco** | `#FFFFFF` | Cards, inputs, menu lateral, cabeçalho |

### 2.2 Azul Vigia — marca

| Nome | Valor | Uso |
|---|---|---|
| **Marca** | `#0066CC` | Quadrado da logo Vigia, painel de destaque do hub, avatar no hub, botões de marca |
| Marca-hover | `#0052A3` | Hover de tudo que é `#0066CC` |

O azul Vigia não identifica módulo. Dentro do módulo, os pontos de identidade usam a categoria (§ 2.3).

### 2.3 Categorias de módulo

Todo módulo pertence a uma de quatro categorias. Cada categoria tem **dois tons** e dois derivados:

- **Forte** — superfície com texto ou ícone por cima. Usado em **exatamente três lugares**: logo do módulo, item ativo do menu lateral e avatar dentro do módulo.
- **Base** — detalhe gráfico, nunca fundo de texto. Usado no dot de categoria e como origem do fundo e da borda da tag.
- **Fundo da tag** — base a 12% (Operação 14%).
- **Borda da tag** — base a 35%.

| Categoria | Módulos | Forte | Base | Fundo da tag | Borda da tag |
|---|---|---|---|---|---|
| **Suprimentos** | Compras & Atas, Estoque Central, Farmácia | `#407F71` | `#4E9B8A` | `rgba(78,155,138,.12)` | `rgba(78,155,138,.35)` |
| **Assistencial** | Gestão Clínica, Laboratório, Censo & Leitos, Regulação | `#496C92` | `#5B84B1` | `rgba(91,132,177,.12)` | `rgba(91,132,177,.35)` |
| **Operação** | Escala Médica, Mensageria, Ingestão | `#946E2C` | `#C99A4A` | `rgba(201,154,74,.14)` | `rgba(201,154,74,.35)` |
| **Financeiro & Governança** | Custo do Paciente, Fintech Split, Segurança LGPD, Perfis & Acessos | `#607889` | `#7C93A3` | `rgba(124,147,163,.12)` | `rgba(124,147,163,.35)` |

A lista de módulos por categoria vem de `MODULO_THEMES` (`ModuloLayoutShell.tsx`); se ela mudar, este quadro muda junto.

### 2.4 Ação e status

| Nome | Valor | Hover | Fundo 8–10% | Significado |
|---|---|---|---|---|
| **Teal** | `#0E5C4C` | `#0A4A3D` | `rgba(14,92,76,.08)` | Ação recorrente, links, foco, sucesso, "ativo" |
| **Terracota** | `#C1622D` | `#A8531F` | `rgba(193,98,45,.08)` | O único destaque quente da tela (botão primário) |
| **Ocre** | `#8A6A16` | `#6E5511` | `rgba(138,106,22,.10)` | Atenção, pendente, em análise, prazo próximo |
| **Tijolo** | `#9C3B2E` | `#7E2F24` | `rgba(156,59,46,.08)` | Erro, crítico, esgotado, rejeição |

Atenção e crítico são dessaturados de propósito: tinta sobre papel, não luz de alerta.

### 2.5 Onde cada cor pode aparecer

| Superfície | Cor | Texto/ícone por cima |
|---|---|---|
| Quadrado da logo Vigia | Marca `#0066CC` | Papel |
| Painel de destaque do hub | Marca `#0066CC` | Papel sólido |
| Avatar — no hub | Marca `#0066CC` | Branco |
| Avatar — no módulo | Forte da categoria | Branco |
| Logo de Módulo | Forte da categoria | Papel |
| Item ativo do menu lateral | Forte da categoria | Branco |
| Tag regulatória | Fundo 12% + borda 35% da categoria | Tinta 75% |
| Dot de categoria (só na logo em tom papel) | Base da categoria | — |
| Botão primário | Terracota | Branco |
| Botão de ação recorrente | Teal 8% | Teal |
| Botão de marca (ação escura do módulo) | Marca `#0066CC` | Branco |
| Badge de status | Fundo 8–10% do status | Cor do status |

Tudo que não está nesta tabela é tinta, papel ou branco.

### 2.6 Contraste medido

| Combinação | Razão | Serve para |
|---|---|---|
| Branco sobre `#0066CC` | 5,57:1 | Texto (AA) |
| Papel sobre `#0066CC` | 5,02:1 | Texto (AA) |
| Branco sobre forte Suprimentos `#407F71` | 4,67:1 | Texto (AA) |
| Branco sobre forte Assistencial `#496C92` | 5,46:1 | Texto (AA) |
| Branco sobre forte Operação `#946E2C` | 4,64:1 | Texto (AA) |
| Branco sobre forte Financeiro `#607889` | 4,62:1 | Texto (AA) |
| Papel sobre os tons fortes | 4,17–4,93:1 | Ícone (≥ 3:1) |
| Tinta sobre papel | 15,05:1 | Texto (AAA) |
| Branco sobre teal | 7,91:1 | Texto (AAA) |
| Branco sobre tijolo | 6,82:1 | Texto (AA) |
| Branco sobre ocre | 5,06:1 | Texto (AA) |
| Branco sobre terracota | 4,16:1 | **Só texto grande** (≥ 18,66px bold) — ver § 5.1 |

Os tons **base** das categorias não passam para texto branco (2,6–3,9:1). Por isso nunca são fundo de texto.

---

## 3. Tipografia

| Função | Família | Pesos | Token |
|---|---|---|---|
| **Títulos** | Fraunces | 500, 600, 700 | `font-display` |
| **Corpo e interface** | Public Sans | 400, 500, 600, 700 | `font-sans` |
| **Dados** | JetBrains Mono | 400, 500 | `font-mono` |

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

- **Fraunces:** título de tela, título de card de destaque, nome do módulo no menu, número de KPI, título do painel de destaque. Nunca em texto corrido, label ou tabela.
- **Public Sans:** todo o resto.
- **JetBrains Mono:** códigos, IDs, CATMAT, lotes, valores em tabela.
- Inter, Roboto e Arial não aparecem na interface.

| Nível | Tamanho | Peso | Fonte | Exemplo |
|---|---|---|---|---|
| Display | 30–34px | 600 | Fraunces | Custo do Paciente (Core 360) |
| H1 | 25–26px | 600 | Fraunces | Relatório de Despesas & Injeção no Hub |
| H2 | 15–17px | 600 | Fraunces | Compras Públicas & Gestão de Atas |
| H3 | 14px | 700 | Public Sans | ATAS DE REGISTRO DE PREÇOS |
| Corpo | 14px | 400 | Public Sans | Texto corrido |
| Corpo pequeno | 12–12,5px | 400 | Public Sans | Descrição de card |
| Overline | 10–11px | 700, caixa alta, espaçamento .5–1.5px | Public Sans | SUPRIMENTOS · LEI 14.133/21 |
| Mono | 12–12,5px | 400–500 | JetBrains Mono | ARP-2026/042-SMS · R$ 812.400,00 |

---

## 4. Moldura do Módulo

Todo módulo tem a mesma moldura: **cabeçalho + menu lateral + conteúdo**. Modelo pronto no Figma, seção "05 · Template de módulo".

### 4.1 Logo de Módulo

Código: `ModuloLogo.tsx`. Figma: componente "Logo de Módulo" (propriedades `categoria`, `tamanho`, `Símbolo`).

- Quadrado no **tom forte da categoria**, símbolo lucide em papel, traço `1.75`.
- Um símbolo por módulo, registrado em `MODULO_LOGO_ICONE` — cabeçalho, menu e hub leem dali.
- É decorativa (`aria-hidden`): o nome do módulo sempre aparece ao lado.

| Tamanho | Lado / raio | Símbolo | Uso |
|---|---|---|---|
| `sm` | 28px / 8px | 16px | Cabeçalho do módulo |
| `md` | 36px / 12px | 20px | Cartão do menu lateral, cards do hub |
| `lg` | 40px / 12px | 20px | Destaques |

**Tom papel** (`tom="papel"`) — só sobre o azul Vigia (painel de destaque do hub): quadrado papel, símbolo tinta e **dot de categoria** de 9px no canto superior direito (cor base, anel de 2px `#0066CC`). É o único lugar onde o dot aparece.

### 4.2 Cabeçalho

Branco, 64px de altura, borda inferior tinta 8%.

- **Hub:** acompanha a coluna central (`max-w-7xl`, respiro 16/24/32px). Logo Vigia + "Hub de Módulos & Catálogo de Soluções" + tag.
- **Módulo:** `logo Vigia | Logo de Módulo sm + título + tag regulatória`, alinhado à borda do menu lateral (16px).
- **Tag regulatória:** pílula com fundo e borda da categoria (§ 2.3) e texto tinta 75%. Aparece a partir de 1280px.
- **Ações da página:** ícone + rótulo a partir de 1024px; abaixo disso, só o ícone, com `aria-label`. A faixa de ações encolhe e rola; o bloco de identidade tem largura mínima, então o título nunca some.
- **Avatar:** 36–40px, raio 12px, iniciais em branco; forte da categoria no módulo, azul Vigia no hub.
- **Celular:** a Logo de Módulo ocupa o lugar da logo Vigia; "Ver Módulos" some, porque o rodapé do menu lateral já leva ao hub.

### 4.3 Menu lateral

Código: `ModuloMenuLateral.tsx`. Figma: componente "Menu Lateral de Módulo".

- **Painel:** branco, borda tinta 12%, raio 16px, sombra baixa.
- **Desktop (≥ 1024px):** 256px, fixo abaixo do cabeçalho (`top: 80px`, altura `100dvh − 96px`), sempre visível.
- **Celular:** gaveta flutuante de 288px, **fechada ao abrir a página**, véu tinta 25%, sombra alta, botão fechar de 44px; escolher um item fecha a gaveta.
- **Cartão de identidade:** fundo papel, borda tinta 8%, Logo de Módulo `md`, nome em Fraunces 14px, tag regulatória.
- **Item:** raio 12px, altura 40px (desktop) / 44px (celular), ícone 16px + rótulo 12px; o rótulo quebra em até 2 linhas.
  - Padrão: texto tinta 75%, ícone tinta 55%, hover fundo papel.
  - **Ativo: fundo no forte da categoria, texto e ícone brancos**, `aria-current="page"`.
  - Badge: pílula tinta 6% com borda tinta 12%; no item ativo, branco 20%.
- **Rodapé:** cartão de status opcional (prop `rodape`) + "Voltar ao Hub de Módulos".

### 4.4 Área de conteúdo

Contêiner `flex flex-1 relative overflow-x-clip`; `main` com `flex-1 min-w-0 p-4 lg:p-6 space-y-6`. Breadcrumb → título (H1) e subtítulo → KPIs → conteúdo. Nenhuma tela pode ter rolagem horizontal, de 320px a 1440px.

---

## 5. Componentes

### 5.1 Botões

| Variante | Fundo | Texto | Hover | Uso |
|---|---|---|---|---|
| `primary` | Terracota `#C1622D` | Branco | `#A8531F` | **Uma** ação de destaque por tela |
| `marca` | Azul Vigia `#0066CC` | Branco | `#0052A3` | Ação principal do módulo quando não há terracota na tela |
| `action` | Teal `#0E5C4C` | Branco | `#0A4A3D` | Ação de fluxo (importar, sincronizar, exportar) |
| `secondary` | Teal 8% | Teal | Teal 14% | Ação recorrente, não destrutiva |
| `outline` | Branco, borda tinta 12% | Tinta | Tinta 6% | Ação terciária |
| `ghost` | Transparente | Tinta 70% | Tinta 6% | Tabs, ação dentro de lista |
| `danger` | Tijolo `#9C3B2E` | Branco | `#7E2F24` | Excluir, rejeitar |

- No máximo **um** botão `primary` visível por tela.
- Raio 8–12px, altura mínima 44px em toque, texto 12–13px bold, ícone 16px.
- **Terracota com texto branco dá 4,16:1**: use rótulo de 18,66px bold ou mais (como no painel de destaque), ou o hover `#A8531F` (5,35:1) como cor de repouso quando o rótulo for menor.
- Abaixo de 1024px, botões do cabeçalho mostram só o ícone e levam `aria-label`.

### 5.2 Badges de status

Pílula (`rounded-full`), 10–11px bold, padding 2–4px × 8–10px.

| Status | Fundo | Texto |
|---|---|---|
| Ativo / sucesso | Teal 8% | Teal |
| Atenção / em análise | Ocre 10% | Ocre |
| Crítico / esgotado | Tijolo 8% | Tijolo |
| Neutro / expirado | Tinta 6% | Tinta 60% |

Badges regulatórios com cor obrigatória por norma (ex.: **Tarja Preta** da ANVISA) mantêm a cor da norma.

### 5.3 Card de módulo (hub)

```
┌───────────────────────────────────┐
│ [logo] SUPRIMENTOS      Nova Aba ↗ │  ← Logo md + overline tinta 45%
│                                    │
│ Compras Públicas & Atas            │  ← Fraunces 17px
│ Lei 14.133/21                      │  ← 12px semibold, tinta 45%
│ Descrição em duas linhas...        │  ← 12px, tinta 70%
│ ────────────────────────────────── │
│ Métrica do módulo    Abrir Módulo ↗ │
└───────────────────────────────────┘
```

Branco, borda tinta 12%, raio 12px, padding 20px. Hover: borda tinta 30% e título em teal. A única cor de categoria no card é a logo.

### 5.4 Painel de destaque

Fundo **azul Vigia `#0066CC`**, raio 16px, padding 24px (32px a partir de 640px). Tudo que é texto ou ícone vai em **papel sólido** — papel com transparência, teal e terracota como texto ficam ilegíveis no azul. Logo de Módulo em tom papel. CTA primário terracota + CTAs outline papel. **No máximo um por tela.**

### 5.5 Card de KPI

Branco, borda tinta 12%, raio 10–12px, padding 16×18px. Overline 10px tinta 45% → valor 26px bold → nota 11px na cor semântica. Sem ícone decorativo.

### 5.6 Tabela

- Cabeçalho branco, 10,5–12px, tinta 45–70%, borda inferior tinta 8%.
- Linhas separadas por tinta 8%; hover discreto em papel.
- IDs e códigos em mono tinta; valores monetários em mono 600.
- Status em badge (§ 5.2); categorias de custo em pílula neutra.

### 5.7 Alertas

Fundo 6–8% do status, borda esquerda de 3px na cor do status, texto na cor do status, raio 6px, 12px.

### 5.8 Campos

| Estado | Borda | Fundo | Anel |
|---|---|---|---|
| Padrão | Tinta 18% | Branco | — |
| Foco | Teal | Branco | Teal 15%, 2px |
| Erro | Tijolo | Tijolo 5% | — |

Raio 8px, padding 9×12px, 12,5px. Foco visível sempre (`focus-visible:ring-2` teal).

---

## 6. Ícones

- Biblioteca: [`lucide-react`](https://lucide.dev).
- Traço `1.5` na interface; `1.75` dentro da Logo de Módulo.
- Monocromáticos: tinta 55–70% em navegação; branco no item ativo; papel sobre azul Vigia.
- Sem bloco de fundo colorido — **a única exceção é a Logo de Módulo** (§ 4.1).

| Tamanho | Uso |
|---|---|
| 12–14px | Badges, chips, breadcrumb |
| 16px | Navegação, botões, inputs |
| 20px | Logo de Módulo `md`/`lg` |
| 24px | Cabeçalho de seção |
| 32px | Estado vazio |

---

## 7. Espaçamento, Raio e Sombra

**Espaçamento:** escala do Tailwind (múltiplos de 4px). Respiro de página 16px no celular, 24px no desktop.

| Raio | Valor | Uso |
|---|---|---|
| `rounded-md` | 6px | Alertas, botões pequenos |
| `rounded-lg` | 8px | Botões, inputs, Logo de Módulo `sm` |
| `rounded-xl` | 12px | Cards, itens de menu, logo Vigia, Logo de Módulo `md`/`lg`, avatar |
| `rounded-2xl` | 16px | Menu lateral, painel de destaque, modais — **teto**, nada acima disso |
| `rounded-full` | — | Badges, tags, dots |

**Sombras** em tinta, nunca preto puro:

```css
/* baixa — cards, inputs, menu lateral no desktop */
box-shadow: 0 1px 2px rgba(27,31,28,.05);
/* média — dropdowns, tooltips */
box-shadow: 0 1px 4px rgba(27,31,28,.06), 0 4px 12px rgba(27,31,28,.05);
/* alta — modais, gaveta do menu no celular */
box-shadow: 0 8px 24px rgba(27,31,28,.10), 0 2px 8px rgba(27,31,28,.05);
```

---

## 8. Tokens

### 8.1 Código — `globals.css` (`@theme` do Tailwind v4)

Cada `--color-*` vira classe: `--color-marca` → `bg-marca`, `text-marca`, `ring-marca`…

| Token | Valor | Figma |
|---|---|---|
| `--color-surface` | `#F6F3EC` | `papel` |
| `--color-surface-subtle` | `#EFEAE0` | — |
| `--color-surface-elevated` | `#FFFFFF` | `branco` |
| `--color-foreground` | `#1B1F1C` | `tinta` |
| `--color-foreground-muted` | tinta 70% | — |
| `--color-foreground-subtle` | tinta 45% | — |
| `--color-border` | tinta 12% | `borda` |
| `--color-border-subtle` | tinta 8% | `tinta-alfa/8` |
| `--color-input-border` | tinta 18% | — |
| `--color-marca` / `--color-marca-forte` | `#0066CC` | `marca` / `marca-forte` |
| `--color-marca-hover` | `#0052A3` | `marca-hover` |
| `--color-action` / `-hover` / `-subtle` | `#0E5C4C` / `#0A4A3D` / 8% | `acao/teal` |
| `--color-primary` / `-hover` / `-subtle` | `#C1622D` / `#A8531F` / 8% | `acao/terracota` |
| `--color-warning` / `-hover` / `-subtle` | `#8A6A16` / `#6E5511` / 10% | — |
| `--color-critical` / `-hover` / `-subtle` | `#9C3B2E` / `#7E2F24` / 8% | `status/critico` |
| `--color-cat-{categoria}` | base (§ 2.3) | `categoria/{categoria}` |
| `--color-cat-{categoria}-forte` | forte (§ 2.3) | `categoria-forte/{categoria}` |
| `--color-cat-{categoria}-subtle` | fundo da tag | `categoria-fundo/{categoria}` |
| `--color-cat-{categoria}-border` | borda da tag | `categoria-borda/{categoria}` |
| `--font-display` / `--font-sans` | Fraunces / Public Sans | — |

`{categoria}` = `suprimentos`, `assistencial`, `operacao`, `financeiro`.

### 8.2 Código — TypeScript (`ModuloLayoutShell.tsx`)

Usado onde a cor depende do módulo em tempo de execução (logo, item ativo, avatar, tag):

```ts
CATEGORIA_COR        // base:  SUPRIMENTOS #4E9B8A · ASSISTENCIAL #5B84B1 · OPERACAO #C99A4A · FINANCEIRO #7C93A3
CATEGORIA_COR_FORTE  // forte: SUPRIMENTOS #407F71 · ASSISTENCIAL #496C92 · OPERACAO #946E2C · FINANCEIRO #607889
```

Os valores precisam bater com `--color-cat-*` e `--color-cat-*-forte`.

### 8.3 Figma

Coleção **"Vigia Saúde 360 · Cores"** com as variáveis da coluna Figma acima, e coleção **"Vigia Saúde 360 · Superfície"** (modos Clara/Escura) com `icone/traço` para o símbolo da logo.

---

## 9. Novo Módulo — Checklist

1. Registrar o id em `ModuloId` e em `MODULO_THEMES`, com nome, tag regulatória e **categoria**.
2. Escolher o símbolo lucide em `MODULO_LOGO_ICONE`.
3. Usar `<ModuloMenuLateral moduloId … />` com o título curto do módulo.
4. Contêiner `flex flex-1 relative overflow-x-clip`; `main` `flex-1 min-w-0 p-4 lg:p-6 space-y-6`.
5. Estado do menu começa `false`; o botão de menu leva `aria-expanded` e `aria-label` "Expandir/Recolher menu".
6. Botões do cabeçalho: rótulo `hidden lg:inline` + `aria-label`.
7. Nenhuma cor fora de § 2.5. Conferir contraste (§ 2.6) e ausência de rolagem horizontal de 320px a 1440px.
8. Se criar componente novo, criar também no Figma e registrar aqui.

---

## 10. Histórico de Versões

| Versão | O que mudou |
|---|---|
| **v2.4.0** (atual) | Azul Vigia `#0066CC` na marca (logo Vigia, painel de destaque, avatar no hub, botões de marca). Logo de módulo, item ativo e avatar no módulo passam ao tom forte da categoria; o dot sai da logo (fica só no tom papel). Guia reescrito como referência única. |
| v2.3.0 | A tinta deixa de ser fundo das superfícies de identidade e dá lugar a um azul `#5B84B1`/`#496C92` (substituído na v2.4). |
| v2.2.0 | Moldura única de módulo: Logo de Módulo, cabeçalho centralizado e menu lateral arredondado. Template no Figma. |
| v2.1.0 | Cores de categoria suavizadas; Assistencial passa a azul clínico `#5B84B1`. |
| v2.0.0 | Troca do visual "SaaS azul" da v1 por papel/tinta, Fraunces + Public Sans, teal/terracota e 4 categorias. |
| v1.0.0 | Azul `#1A56DB`, Inter e cards coloridos por módulo — descartada. |

---

## Referência Rápida

```
MARCA            #0066CC  hover #0052A3   Logo Vigia, destaque do hub, avatar no hub, botão de marca

CATEGORIA        forte     base      forte = logo do módulo, item ativo, avatar no módulo
  SUPRIMENTOS    #407F71   #4E9B8A   base  = dot (só na logo papel), fundo 12% e borda 35% da tag
  ASSISTENCIAL   #496C92   #5B84B1
  OPERACAO       #946E2C   #C99A4A
  FINANCEIRO     #607889   #7C93A3

AÇÃO / STATUS    TEAL #0E5C4C · TERRACOTA #C1622D (1 por tela) · OCRE #8A6A16 · TIJOLO #9C3B2E
BASE             TINTA #1B1F1C (texto) · PAPEL #F6F3EC (fundo) · BRANCO (cards)

FONTES           Fraunces (títulos) · Public Sans (resto) · JetBrains Mono (dados)
RAIO             8 botão · 12 card/item/logo · 16 teto (menu, hero, modal) · pill
ÍCONES           lucide-react · traço 1.5 (1.75 na logo) · monocromático
CONTRASTE        texto ≥ 4,5:1 · ícone ≥ 3:1
```

---

*Vigia Saúde 360 Design System v2.4.0 — Rede Pública de Saúde*
