# Vigia Saúde 360 — Identidade Visual
> Sistema Governamental de Custeio, Compras Públicas e Gestão Hospitalar
> Design System v2.2.0 — logo por módulo, menu lateral e cabeçalho padrão (cores da v2.1.0 inalteradas)

---

## Nota de versão

A v1.0.0 (`#1A56DB`, Inter, cards multicoloridos por módulo) foi avaliada e descartada por parecer genérica — "SaaS azul de template". A v2.0.0 reduziu para 4 cores de categoria saturadas (que coincidiam numericamente com as cores de ação/status) a partir do esboço em [https://claude.ai/artifact/Rk8UxQdFTS2HQy8zwn3znH](https://claude.ai/artifact/Rk8UxQdFTS2HQy8zwn3znH) (Hub de Módulos + Compras &amp; Atas).

**v2.1.0 (atual)** — as 4 cores de categoria ficam mais leves/menos saturadas e uma delas volta a ser azul (clínico, `#5B84B1`), a pedido explícito, para reforçar a leitura "saúde hospitalar" nos módulos assistenciais. Isso **revisa** a regra da v2.0 de "nunca reintroduzir azul": o que ficou proibido foi o azul institucional saturado `#1A56DB` da v1 dominando a tela inteira, não um tom de categoria pontual e suave. Cores de **ação** (`#0E5C4C` teal, `#C1622D` terracota) e de **status** (`#8A6A16` ocre, `#9C3B2E` tijolo) permanecem exatamente iguais — só a identidade de categoria (dot, tarja, tag regulatória, item de menu) mudou. Ver § 2.1 para a paleta completa e § 8 para o status do rollout nos 13 módulos (concluído).

**v2.2.0** — padroniza a moldura de todo módulo, a partir da barra lateral da Escala Médica (a preferida), ajustada às regras deste guia. Três componentes novos em § 4: **Logo de Módulo** (uma marca por módulo, na família da logo Vigia), **Cabeçalho** (centralizado no hub, com a logo do módulo nos módulos) e **Menu lateral de módulo** (painel arredondado único para os 12 módulos). Nenhuma cor muda. Modelo no Figma para os próximos módulos: [Vigia Saúde 360 — Padrão de Módulos](https://www.figma.com/design/oNgeLR3Td97EmqdHqdkTuU).

Princípios da mudança:
- **Menos cor, mais hierarquia.** Um único acento de ação (teal) e um único acento de destaque (terracota), em vez de uma cor própria por módulo espalhada em ícones, fundos e bordas.
- **Tipografia com identidade.** Serifada (Fraunces) nos títulos para fugir do sans-serif genérico (Inter/Roboto/Arial) que qualquer produto usa.
- **Papel, não branco puro.** Fundo levemente creme (`#F6F3EC`), texto quase-preto quente (`#1B1F1C`), no lugar do cinza-azulado `slate`.
- **Categoria como sinal discreto** (um ponto de 9px), não como bloco colorido de card inteiro.
- A geometria dos componentes (raio, grid, alturas de toque ≥44px) **não muda** — só a pele. Isso barateia a execução: é recolorir/retipografar, não redesenhar.

---

## Sumário

1. [Logotipo](#1-logotipo)
2. [Paleta de Cores](#2-paleta-de-cores)
3. [Tipografia](#3-tipografia)
4. [Componentes](#4-componentes)
5. [Ícones](#5-ícones)
6. [Tokens de Design](#6-tokens-de-design)
7. [Espaçamento e Raio](#7-espaçamento-e-raio)
8. [Como Executar nos Módulos](#8-como-executar-nos-módulos)

---

## 1. Logotipo

### Composição

Mesma geometria de escudo já usada no código (`VigiaSidebarLayout.tsx`) — só a pele muda. Dois elementos indissociáveis:

- **Ícone** — escudo com cruz da saúde vazada, cor única (tinta, não mais azul sobre fundo colorido por módulo)
- **Wordmark** — "Vigia" em Fraunces 600 (serifada) + "Saúde" em Public Sans 600 na cor teal — "360" como sufixo pequeno, versalete, cor neutra

### Variações

| Variação | Fundo | Uso |
|---|---|---|
| **Principal** | Papel `#F6F3EC` | Documentos, telas de conteúdo |
| **Negativa** | Tinta `#1B1F1C` | Sidebar (topo), hero de destaque, splash |
| **Monocromática** | Qualquer | Impressão, carimbos, escala de cinza |

### Ícone SVG

Mesmo `path` do escudo atual (`VigiaSidebarLayout.tsx:222`), recolorido:

```svg
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v4h4v2h-4v4h-2v-4H7v-2h4V7z"
        fill="#1B1F1C"/>
</svg>
```

Sobre fundo escuro (sidebar/hero), inverter para `fill="#F6F3EC"`. Nunca reintroduzir o preenchimento azul (`#1A56DB`) ou o ponto verde de "IA" da v1 — o acento de IA/automação passa a ser textual ("IA" em caixa alta, cor teal), não um elemento gráfico extra no ícone.

### Espaço de Proteção

Inalterado: área livre equivalente à altura do ícone (`x`) em todos os lados.

### Regras de Uso

| | Regra |
|---|---|
| ✅ | Usar somente as variações aprovadas |
| ✅ | Manter o espaço de proteção sempre |
| ❌ | Distorcer as proporções do logotipo |
| ❌ | Reintroduzir azul `#1A56DB` (institucional v1) ou verde `#0E9F6E` no **ícone do logo** — regra específica do escudo; não se aplica ao azul clínico de categoria (§ 2.1), que é tom diferente e uso diferente |
| ❌ | Aplicar sobre fundos com baixo contraste |
| ❌ | Adicionar sombras, gradientes ou contornos externos |
| ❌ | Recriar o escudo com outros elementos gráficos |

---

## 2. Paleta de Cores

### Tinta & Papel — Base Neutra

| Tom | Hex | Uso |
|---|---|---|
| **Tinta ★** | `#1B1F1C` | Texto principal, títulos, hero escuro, sidebar (variação escura) |
| **Tinta 70%** | `rgba(27,31,28,.70)` | Texto secundário, descrições |
| **Tinta 45%** | `rgba(27,31,28,.45)` | Labels, captions, placeholders |
| **Tinta 12%** | `rgba(27,31,28,.12)` | Bordas de cards, divisores |
| **Tinta 8%** | `rgba(27,31,28,.08)` | Divisores internos sutis (footer de card, linha de tabela) |
| **Papel ★** | `#F6F3EC` | Background de página (substitui o `#F9FAFB` cinza-azulado) |
| **Papel 2** | `#EFEAE0` | Sidebar, painéis secundários, rail lateral |
| **Branco** | `#FFFFFF` | Cards, inputs, superfícies elevadas sobre o papel |

### Teal Institucional — Primary / Ação

| Tom | Hex | Uso |
|---|---|---|
| **Escuro** | `#0A4A3D` | Hover de botões/links primários |
| **Principal ★** | `#0E5C4C` | Cor de ação: CTAs secundários, links, estado ativo, "sucesso" |
| **8% (fundo)** | `rgba(14,92,76,.08)` | Background de badge/pill "ativo" |

### Terracota — Accent / Destaque

| Tom | Hex | Uso |
|---|---|---|
| **Principal ★** | `#C1622D` | CTA primário (a única cor "quente" de destaque na tela), banner central |
| **8% (fundo)** | `rgba(193,98,45,.08)` | Background de badge de destaque, hover sutil |

Substitui o azul `#1A56DB` como cor de ação primária — o teal assume o papel de "ação/confiança", o terracota assume o papel de "chamada à atenção pontual" (era o que o azul fazia demais, em tudo).

### Ocre — Atenção

| Tom | Hex | Uso |
|---|---|---|
| **Principal ★** | `#8A6A16` | Atenção, pendente, prazo próximo (substitui o amarelo `#FACA15`) |
| **8% (fundo)** | `rgba(138,106,22,.10)` | Background de badge/alerta de atenção |

### Tijolo — Crítico

| Tom | Hex | Uso |
|---|---|---|
| **Principal ★** | `#9C3B2E` | Erro, rejeição, esgotado, crítico (substitui o vermelho `#F05252`) |
| **8% (fundo)** | `rgba(156,59,46,.08)` | Background de badge/alerta crítico |

Os tons de atenção e crítico ficam **dessaturados** de propósito — nada de amarelo/vermelho neon de dashboard genérico; devem parecer tinta sobre papel, não luz de alerta.

### Semântica de Cores

| Cor | Hex | Significado | Exemplos |
|---|---|---|---|
| 🟢 Teal | `#0E5C4C` | Ação, confiança, ativo/sucesso | Links, CTA secundário, ATA vigente, sem divergência |
| 🟠 Terracota | `#C1622D` | Destaque, chamada à ação primária | Botão principal, módulo central em destaque |
| 🟡 Ocre | `#8A6A16` | Requer verificação | Em análise, saldo em 80%+, renovação pendente |
| 🔴 Tijolo | `#9C3B2E` | Falha ou urgência | Ata esgotada, rejeição, dispensa emergencial |
| ⚫ Tinta | `#1B1F1C` | Categoria "Financeiro/Governança" (neutra) | Dot de categoria, texto padrão |

### 2.1 Cor por categoria de módulo v2.1 (dot de 9px, não card colorido)

Tons suavizados/dessaturados em relação à v2.0 — mesma família de matiz onde aplicável, mais um azul clínico novo. **Nunca usar degradê** — sempre cor sólida. Estes tons são exclusivos de identidade de categoria (dot, tarja de 3px no topo do card, tag regulatória, dot de item de menu); não usar em botões, badges de status ou qualquer elemento de ação.

| Categoria | Cor do dot v2.1 | Cor v2.0 (substituída) | Fundo sutil (12–14%) |
|---|---|---|---|
| Suprimentos & Atas | Verde-menta `#4E9B8A` | ~~Teal `#0E5C4C`~~ | `rgba(78,155,138,.12)` |
| Clínico & Assistencial | Azul clínico `#5B84B1` | ~~Terracota `#C1622D`~~ | `rgba(91,132,177,.12)` |
| Pessoas & Operação | Dourado `#C99A4A` | ~~Ocre `#8A6A16`~~ | `rgba(201,154,74,.14)` |
| Financeiro & Governança | Azul-acinzentado `#7C93A3` | ~~Tinta 70%~~ | `rgba(124,147,163,.12)` |

Tons de referência extra (uso pontual em gráficos/ilustrações, não são cor de categoria fixa): Cyan Clínico `#4FA3AE`, Verde-Menta `#5FA88C`, Azul Sereno `#6E92C9`, Lavanda Suave `#8B87BE`.

---

## 3. Tipografia

### Fontes

| Função | Família | Pesos | Importação |
|---|---|---|---|
| **Display / Títulos** | Fraunces | 500, 600, 700 | Google Fonts |
| **Corpo / UI** | Public Sans | 400, 500, 600, 700 | Google Fonts |
| **Mono / Dados** | JetBrains Mono | 400, 500 | Google Fonts (mantido da v1) |

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

**Fallback stack:**
```css
--font-display: 'Fraunces', Georgia, serif;
--font-body: 'Public Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Substituem **Inter** como fonte principal — Inter/Roboto/Arial ficam reservadas para nunca mais aparecer na UI de conteúdo (são a marca registrada do "template genérico de IA" que motivou a troca).

### Regra de uso: quando serifada, quando sans

- **Fraunces (serifada):** `H1`/`Display`/`H2` de página e de card em destaque (título de módulo, número de KPI, título de hero). Nunca em textos correntes, labels ou tabelas.
- **Public Sans:** todo o resto — corpo, labels, botões, inputs, navegação, tabelas.

### Escala Tipográfica

| Nível | Tamanho | Peso | Fonte | Uso |
|---|---|---|---|---|
| Display | 34px | 600 | Fraunces | Hero do módulo central, título de tela cheia |
| H1 | 25–26px | 600 | Fraunces | Cabeçalho de tela |
| H2 | 15–17px | 600 | Fraunces | Título de card/seção em destaque |
| H3 | 14px | 700 | Public Sans | Cabeçalho de tabela/painel (sans, não serifado) |
| Body Large | 14px | 400 | Public Sans | Texto corrido principal |
| Body Small | 12.5px | 400 | Public Sans | Texto de apoio, descrição de card |
| Caption / Overline | 10–11px | 700, versalete, `letter-spacing: .5–1.5px` | Public Sans | Categoria, labels de KPI, tags |
| Mono | 12.5px | 400–500 | JetBrains Mono | Códigos, IDs, CATMAT, valores R$ em tabela |

### Exemplos Reais

```
Display   Custo do Paciente          (Fraunces 600, 34px, tinta ou papel sobre hero)
H1        Atas, Contratos & Empenhos  (Fraunces 600, 26px)
H2        Compras Públicas & Gestão de Atas  (Fraunces 600, 17px, título de card)
H3        ATAS DE REGISTRO DE PREÇOS  (Public Sans 700, 14px)
Overline  SUPRIMENTOS · LEI 14.133/21 (Public Sans 700, 10px, versalete)
Body      Conformidade com a Lei 14.133/21 — trava preventiva CMED/BPS ativa.
Mono      ARP-2026/042-SMS · R$ 812.400,00
```

---

## 4. Componentes

### Botões

| Variante | Background | Texto | Hover | Uso |
|---|---|---|---|---|
| `primary` | `#C1622D` (terracota) | `#FFFFFF` | `#A8531F` | **Única** ação de destaque por tela (ex.: "Novo Pedido de Compra") |
| `secondary` | `rgba(14,92,76,.08)` | `#0E5C4C` (teal) | `rgba(14,92,76,.14)` | Ação recorrente, não-destrutiva |
| `outline` | transparente | `#1B1F1C` | `rgba(27,31,28,.06)` | Ação terciária ("Voltar ao Hub", "Ver documentação") |
| `ghost` | transparente | `rgba(27,31,28,.7)` | `rgba(27,31,28,.06)` | Tabs, ação sutil dentro de lista |
| `danger` | `#9C3B2E` | `#FFFFFF` | `#7E2F24` | Excluir, rejeitar, ação destrutiva |

Regra dura: **no máximo um botão `primary` (terracota) visível por tela.** É o que substitui o "tudo é azul" da v1 — se duas ações competem, a segunda é `secondary` ou `outline`.

```css
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 8px;
  font-family: 'Public Sans', sans-serif; font-size: 13px; font-weight: 700;
  border: none; cursor: pointer; transition: background .15s, color .15s;
}
.btn-primary   { background: #C1622D; color: #fff; }
.btn-primary:hover { background: #A8531F; }
.btn-secondary { background: rgba(14,92,76,.08); color: #0E5C4C; }
.btn-outline   { background: transparent; border: 1px solid rgba(27,31,28,.12); color: #1B1F1C; }
.btn-ghost     { background: transparent; color: rgba(27,31,28,.7); }
.btn-danger    { background: #9C3B2E; color: #fff; }
```

---

### Badges / Status (pill)

| Status | Background | Texto |
|---|---|---|
| Ativo / Sucesso | `rgba(14,92,76,.08)` | `#0E5C4C` |
| Atenção / Em análise | `rgba(138,106,22,.10)` | `#8A6A16` |
| Crítico / Esgotado | `rgba(156,59,46,.08)` | `#9C3B2E` |
| Neutro / Expirado | `rgba(27,31,28,.06)` | `rgba(27,31,28,.6)` |

Marcador: um `●` (caractere, não `<div>` de bolinha) na cor do texto, antes do label — mais leve que o dot separado da v1.

```css
.pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 20px;
  font-family: 'Public Sans', sans-serif; font-size: 11px; font-weight: 700;
}
```

---

### Cards de Módulo (grid do Hub)

Substituem os cards com ícone colorido em bloco da v1. Estrutura:

```
┌──────────────────────────────┐
│ ● Suprimentos            ↗   │  ← dot 9px + overline + seta (tinta 30%)
│                               │
│ Compras Públicas & Atas       │  ← H2 Fraunces 17px
│ Conformidade — Lei 14.133/21  │  ← caption, tinta 45%
│ Descrição em duas linhas...   │  ← body small, tinta 70%
│ ─────────────────────────────│
│ Trava CMED & BPS ativa   Acessar → │  ← métrica (cor da categoria) + link
└──────────────────────────────┘
```

Fundo branco, borda `1px solid rgba(27,31,28,.12)`, raio `12px`, padding `22px`. **Nenhum ícone de card colorido de fundo** — a única cor viva no card é o dot de categoria e a métrica no footer.

**v2.2:** o dot solto dá lugar à **Logo de Módulo** (md, 36px) ao lado do overline — o dot de categoria continua lá, no canto da logo. A logo é tinta, como a logo Vigia, então a regra acima vale: nada de bloco na cor do módulo.

---

### Painel de Destaque (hero de módulo central)

Fundo `#1B1F1C` (tinta), texto papel, raio `16px`, padding `40px 48px`. Overline em terracota, H1 em Fraunces papel, CTA primário terracota + CTA outline papel. Usar **no máximo um por tela** — é o elemento que "grita", tudo mais no hub deve ficar quieto ao redor dele.

---

### Logo de Módulo (v2.2)

Cada módulo tem uma marca própria, da **mesma família da logo Vigia Saúde 360**: quadrado em tinta `#1B1F1C` com o símbolo lucide em papel (traço `1.75`) e o **dot de categoria de 9px no canto** (anel branco de 2px). A cor de categoria continua restrita ao dot, como em § 2.1 — o quadrado nunca é pintado com a cor do módulo.

| Tamanho | Lado / raio | Uso |
|---|---|---|
| `sm` | 28px / 8px | Cabeçalho do módulo |
| `md` | 36px / 12px | Cartão de identidade do menu lateral, cards do hub |
| `lg` | 40px / 12px | Destaques |

Sobre fundo tinta (hero do hub) usa o tom **papel**: quadrado papel, símbolo tinta. Código: `nucleo/src/components/ModuloLogo.tsx` — `MODULO_LOGO_ICONE` é a fonte única módulo → símbolo; cabeçalho, menu lateral e hub leem dali.

---

### Cabeçalho (v2.2)

- **Hub:** o conteúdo do cabeçalho acompanha a coluna central da página (`max-w-7xl`, respiro `16/24/32px`), então a marca começa no mesmo x do conteúdo.
- **Módulo:** `marca Vigia Saúde 360 | Logo de Módulo sm + título + tag regulatória`, alinhado à borda do menu lateral (16px). A tag usa fundo 12% e borda 35% da categoria com **texto em tinta 75%** (a cor de categoria como texto não passa no contraste AA).
- **Ações da página:** ícone + rótulo a partir de 1024px; abaixo, só o ícone, com `aria-label`. A faixa de ações encolhe e rola; o bloco de identidade tem largura mínima, então o título nunca vai a zero.
- **Celular:** a Logo de Módulo ocupa o lugar da marca; "Ver Módulos" some, porque o rodapé do menu lateral já leva ao hub.

---

### Menu lateral de módulo (v2.2)

Painel único para todos os módulos (`nucleo/src/components/ModuloMenuLateral.tsx`), com a estrutura da barra da Escala Médica ajustada a este guia:

- **Painel:** branco, borda tinta 12%, raio `16px` (teto de § 7 — a Escala usava 24px), sombra baixa.
- **Desktop:** 256px, fixo abaixo do cabeçalho (`top: 80px`, altura `100dvh − 96px`), sempre visível.
- **Celular:** gaveta flutuante de 288px, **fechada ao abrir a página**, véu tinta 25%, sombra alta, botão fechar; escolher um item fecha a gaveta.
- **Topo:** cartão de identidade em papel com a Logo de Módulo `md`, o nome em Fraunces e a tag regulatória.
- **Item:** raio `12px`, 40px (desktop) / 44px (celular); **ativo em tinta com texto branco** (§ 5 — não na cor do módulo, como fazia a Escala); rótulo quebra em até 2 linhas em vez de cortar.
- **Rodapé:** cartão de status opcional (prop `rodape`) + "Voltar ao Hub de Módulos".

**Novo módulo — checklist:** (1) registrar o id em `ModuloId`/`MODULO_THEMES`; (2) escolher o símbolo em `MODULO_LOGO_ICONE`; (3) usar `<ModuloMenuLateral moduloId … />`; (4) contêiner `flex flex-1 relative overflow-x-clip` e `main` `flex-1 min-w-0 p-4 lg:p-6`; (5) estado do menu começa `false` e o botão de menu leva `aria-expanded`. O mesmo passo a passo, com os componentes prontos, está no [Figma](https://www.figma.com/design/oNgeLR3Td97EmqdHqdkTuU).

---

### Alertas

| Tipo | Background | Borda esq. | Texto |
|---|---|---|---|
| Ativo/Sucesso | `rgba(14,92,76,.06)` | `#0E5C4C` | `#0E5C4C` |
| Atenção | `rgba(138,106,22,.08)` | `#8A6A16` | `#8A6A16` |
| Crítico | `rgba(156,59,46,.06)` | `#9C3B2E` | `#9C3B2E` |

```css
.alert {
  display: flex; gap: 12px; padding: 10px 14px;
  border-radius: 6px; border-left: 3px solid;
  font-family: 'Public Sans', sans-serif; font-size: 12px; line-height: 1.5;
}
```

---

### Cards de KPI

```
┌─────────────────────┐
│ ATAS ATIVAS         │  ← overline 10px, tinta 45%, versalete
│                     │
│ 12                  │  ← valor: Fraunces 26px 600
│ +2 este mês         │  ← delta: 11px, cor semântica
└─────────────────────┘
```

Padding `16px 18px` · Borda `1px solid rgba(27,31,28,.12)` · Raio `10px` · Fundo branco. Sem ícone — o valor grande em serifada já carrega a hierarquia.

---

### Tabela de Dados

- Cabeçalho: fundo branco (não cinza), texto `10.5px` versalete tinta 45%, borda inferior `1px solid rgba(27,31,28,.08)`
- Linhas separadas por `1px solid rgba(27,31,28,.08)`, sem hover-fundo agressivo
- Códigos/IDs: `font-mono`, tinta 100% (não mais azul — o mono já é o sinal de "isto é um código")
- Valores monetários: `font-mono font-weight:600`
- Status: badge pill (seção 4)

---

### Campos de Entrada

| Estado | Border | Background | Ring |
|---|---|---|---|
| Padrão | `rgba(27,31,28,.12)` | `#FFFFFF` | — |
| Focus | `#0E5C4C` | `#FFFFFF` | `rgba(14,92,76,.15)` 2px |
| Erro | `#9C3B2E` | `rgba(156,59,46,.05)` | — |

```css
input {
  padding: 9px 12px; border-radius: 8px;
  border: 1px solid rgba(27,31,28,.12);
  font-family: 'Public Sans', sans-serif; font-size: 12.5px;
  outline: none; transition: border-color .15s, box-shadow .15s;
}
input:focus { border-color: #0E5C4C; box-shadow: 0 0 0 2px rgba(14,92,76,.15); }
input.error { border-color: #9C3B2E; background: rgba(156,59,46,.05); }
```

---

## 5. Ícones

**Biblioteca:** [`lucide-react`](https://lucide.dev) — mantida da v1, sem mudança de dependência.
**Stroke-width padrão:** `1.5px`.

### Mudança de uso (não de biblioteca)

Na v1, cada módulo tinha um ícone grande dentro de um bloco colorido (`w-12 h-12 rounded-2xl bg-{cor}`). Na v2:

- Ícone de navegação/sidebar: `stroke: rgba(27,31,28,.7)`, sem bloco de fundo colorido — só o próprio traço.
- Estado ativo: ícone em `#FFFFFF` sobre fundo `#1B1F1C` (não mais a cor do módulo).
- Categoria é sinalizada pelo **dot de 9px** ao lado do label/overline, não pela cor do ícone.
- Ícones seguem monocromáticos (tinta) em 95% dos casos; cor só aparece em badges/pills e no dot de categoria.
- **Exceção v2.2 — Logo de Módulo:** o símbolo do módulo vai dentro de um quadrado em **tinta** (nunca na cor do módulo), como a logo Vigia. Vale só para a logo; ícones de navegação continuam sem bloco de fundo.

### Tamanhos Contextuais (inalterado da v1)

| Tamanho | Uso |
|---|---|
| `12px` | Badges, chips |
| `15–16px` | Navegação, inputs, labels |
| `20px` | Botões com ícone |
| `24–26px` | Cabeçalhos de seção |
| `32px` | Estados vazios |

---

## 6. Tokens de Design

### Variáveis CSS (`--vs2-*`)

Novo prefixo `--vs2-*` para não colidir com o `--vs-*` da v1 durante a migração incremental (permite os dois coexistirem enquanto módulos são migrados um a um).

```css
:root {
  /* ── Tinta & Papel ── */
  --vs2-ink:      #1B1F1C;
  --vs2-ink-70:   rgba(27,31,28,.70);
  --vs2-ink-45:   rgba(27,31,28,.45);
  --vs2-ink-30:   rgba(27,31,28,.30);
  --vs2-ink-12:   rgba(27,31,28,.12);
  --vs2-ink-08:   rgba(27,31,28,.08);
  --vs2-paper:    #F6F3EC;
  --vs2-paper-2:  #EFEAE0;

  /* ── Teal — ação/confiança ── */
  --vs2-teal:      #0E5C4C;
  --vs2-teal-dark: #0A4A3D;
  --vs2-teal-08:   rgba(14,92,76,.08);

  /* ── Terracota — destaque ── */
  --vs2-terracotta:    #C1622D;
  --vs2-terracotta-dk: #A8531F;
  --vs2-terracotta-08: rgba(193,98,45,.08);

  /* ── Ocre — atenção ── */
  --vs2-ochre:    #8A6A16;
  --vs2-ochre-08: rgba(138,106,22,.10);

  /* ── Tijolo — crítico ── */
  --vs2-brick:    #9C3B2E;
  --vs2-brick-08: rgba(156,59,46,.08);

  /* ── Categorias v2.1 — identidade de módulo (dot/tarja/tag), não usar em ação/status ── */
  --vs2-cat-suprimentos:          #4E9B8A;
  --vs2-cat-suprimentos-subtle:   rgba(78,155,138,.12);
  --vs2-cat-assistencial:         #5B84B1;
  --vs2-cat-assistencial-subtle:  rgba(91,132,177,.12);
  --vs2-cat-operacao:             #C99A4A;
  --vs2-cat-operacao-subtle:      rgba(201,154,74,.14);
  --vs2-cat-financeiro:           #7C93A3;
  --vs2-cat-financeiro-subtle:    rgba(124,147,163,.12);

  /* ── Tipografia ── */
  --vs2-font-display: 'Fraunces', Georgia, serif;
  --vs2-font-body:    'Public Sans', -apple-system, sans-serif;
  --vs2-font-mono:    'JetBrains Mono', monospace;

  /* ── Estrutura (herdada da v1, sem mudança) ── */
  --vs2-radius: 8px;
  --vs2-shadow-sm: 0 1px 2px rgba(27,31,28,.05);
  --vs2-shadow:    0 1px 4px rgba(27,31,28,.06), 0 4px 12px rgba(27,31,28,.05);
}
```

### Mapeamento Tailwind → Token (v2)

| Classe Tailwind | Token v2 | Token v1 substituído |
|---|---|---|
| `bg-background` | `--vs2-paper` | `--vs-gray-50` (`#F9FAFB`) |
| `text-foreground` | `--vs2-ink` | `--vs-gray-900` (`#111928`) |
| `bg-primary` | `--vs2-terracotta` | `--vs-blue-700` (`#1A56DB`) |
| `bg-secondary` / ação recorrente | `--vs2-teal` | — (não existia; era tudo azul) |
| `bg-accent` | `--vs2-terracotta` | `--vs-green` (`#0E9F6E`) |
| `bg-destructive` | `--vs2-brick` | `--vs-red` (`#F05252`) |
| `bg-warning` | `--vs2-ochre` | `--vs-yellow` (`#FACA15`) |
| `border-border` | `--vs2-ink-12` | `--vs-gray-200` (`#E5E7EB`) |
| `text-muted-foreground` | `--vs2-ink-45` | `--vs-gray-500` (`#6B7280`) |

---

## 7. Espaçamento e Raio

Escala de espaçamento **inalterada** da v1 (`space-1` a `space-16`) — a mudança é só de cor e tipografia, não de grid.

### Raios de Borda — uma correção

| Classe Tailwind | Valor | Uso | Mudança vs. v1 |
|---|---|---|---|
| `rounded-md` | 6px | Botões `sm`, inputs pequenos | inalterado |
| `rounded-lg` | 8px | Botões, inputs, cards pequenos | inalterado |
| `rounded-xl` | 12px | Cards de conteúdo | inalterado |
| `rounded-2xl` | 16px | Painel de destaque (hero), modais | **teto máximo** — não usar raio maior |
| `rounded-full` | 9999px | Badges pill, avatares | inalterado |

A v1 usava `rounded-3xl` (24px) no banner do hub — na v2 isso fica em `rounded-2xl` (16px) no máximo. Cantos muito arredondados reforçam o efeito "template fofo"; a v2 é levemente mais reta.

### Sombras

Mesmas três elevações da v1, só com a cor da sombra trocada de preto puro para tinta (`rgba(27,31,28,…)` em vez de `rgba(0,0,0,…)`) — sombra mais quente, coerente com o papel:

```css
/* Elevação baixa — cards, inputs */
box-shadow: 0 1px 2px rgba(27,31,28,.05);

/* Elevação média — dropdowns, tooltips */
box-shadow: 0 1px 4px rgba(27,31,28,.06), 0 4px 12px rgba(27,31,28,.05);

/* Elevação alta — modais, overlays */
box-shadow: 0 8px 24px rgba(27,31,28,.10), 0 2px 8px rgba(27,31,28,.05);
```

---

## 8. Como Executar nos Módulos

**Status v2.0 → v2.1: concluído.** Os passos 1–3 abaixo foram aplicados em `CATEGORIA_THEME`
(`ModuloLayoutShell.tsx`), `ModuleCard` (`src/components/ui/module-card.tsx`) e no Hub —
os 13 módulos herdam a cor de categoria v2.1 automaticamente por consumirem `MODULO_THEMES`,
sem precisar editar cada `page.tsx`. O que **não** mudou: botões primário/secundário (terracota/teal)
e badges de status (sucesso/atenção/crítico) dentro de cada módulo — esses continuam usando
`#0E5C4C`/`#C1622D`/`#8A6A16`/`#9C3B2E` diretamente, porque são cor de AÇÃO/STATUS, não de categoria.

Ordem original (referência histórica) — do centro (que todo módulo herda) para as pontas, para não migrar tela por tela do zero:

1. **`MODULO_THEMES` (`nucleo/src/components/ModuloLayoutShell.tsx`)** — hoje dá uma cor própria (azul, verde, âmbar, roxo...) a cada `moduloId`. Reduzir para: todo módulo herda o mesmo par tinta/papel; o único campo que varia por módulo passa a ser o **dot de categoria** (teal/terracota/ocre/tinta), não mais um `primaryBg`/`lightBg` inteiro por módulo.
2. **`VigiaSidebarLayout.tsx`** — recolorir escudo, wordmark (Fraunces + teal), fundo da sidebar (`paper-2`), estado ativo do item de navegação (fundo tinta, não mais `currentTheme.primaryBg`).
3. **`(modulos)/page.tsx` (Hub)** — já prototipado no esboço; aplicar hero escuro + grid monocromático com dot.
4. **Demais 11 módulos**, um a um, reaproveitando os componentes já re-skinados nos passos 1–3 (botões, badges, tabela, KPI card) — a maior parte do trabalho por módulo é achar `#1A56DB`/`bg-blue-*`/`rounded-3xl`/`font-sans` e trocar pelo token v2 correspondente da tabela da seção 6, não redesenhar a tela.
5. **Tipografia global** — importar Fraunces + Public Sans em `layout.tsx` root e trocar a classe base de `font-sans` (Inter) para `font-body` (Public Sans), reservando `font-display` (Fraunces) só para `h1`/`h2` de destaque via classe utilitária.

Este documento é a referência para essa execução — qualquer PR de reskin de módulo deve apontar para a seção correspondente aqui, não inventar tom de cor novo.

---

## Referência Rápida

```
TERRACOTA (ação)   #C1622D   ████  Botão primário, destaque único por tela
TEAL (confiança)    #0E5C4C   ████  Links, ativo, sucesso
OCRE (atenção)      #8A6A16   ████  Pendente, em análise
TIJOLO (crítico)    #9C3B2E   ████  Erro, esgotado, emergencial
TINTA               #1B1F1C   ████  Texto, hero escuro, sidebar
PAPEL               #F6F3EC   ████  Fundo de página

CATEGORIA v2.1 (dot/tarja/tag — nunca em botão/status):
  SUPRIMENTOS      #4E9B8A   ████  Verde-menta
  ASSISTENCIAL     #5B84B1   ████  Azul clínico
  OPERACAO         #C99A4A   ████  Dourado
  FINANCEIRO       #7C93A3   ████  Azul-acinzentado

FONTE DISPLAY   Fraunces (serifada) — só títulos H1/H2 de destaque
FONTE CORPO     Public Sans — todo o resto (substitui Inter)
FONTE MONO      JetBrains Mono — códigos, IDs, valores (mantida)
RAIO            8px padrão · 12px cards · 16px teto (hero/modal) · pill badges
ÍCONES          lucide-react · stroke 1.5px · monocromático (cor só em badge/dot)
```

---

*Vigia Saúde 360 Design System v2.1.0 — Rede Pública de Saúde*
