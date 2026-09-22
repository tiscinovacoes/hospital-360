# ADR-0004: Modularidade Estrita de Produtos Independentes, RBAC Isolado e Consolidação do Custo do Paciente no Hub 360

## Status
**ACEITO (Accepted)** — 22 de Setembro de 2026

## Contexto e Direcionadores de Decisão (Context & Decision Drivers)
O ecossistema **Hospital 360 / Vigia Saúde** foi concebido não apenas como uma suíte monolítica, mas como um portfólio de **produtos de software especializados que podem ser comercializados e contratados individualmente**:
- Um cliente "A" pode adquirir exclusivamente o produto **Estoque Central & CD Almoxarifado**.
- Um cliente "B" pode adquirir exclusivamente o produto **Compras Públicas & Gestão de Atas**.
- Um cliente "C" pode contratar múltiplos módulos ou a suíte completa com o **Hub Centralizador de Gestão**.

### Problema Identificado na UI/UX e Arquitetura Anterior:
1. **Divergência de UX**: Enquanto o módulo de *Compras Públicas* operava com layout de produto autônomo (cabeçalho próprio, menu lateral exclusivo e saída limpa via "Voltar ao Hub"), o módulo de *Estoque Central* estava preso ao layout global do Hub (`VigiaSidebarLayout`), utilizando abas horizontais internas e transmitindo a falsa percepção de ser apenas uma "página interna" do ecossistema.
2. **Acoplamento Conceitual**: Módulos independentes não podem depender de estruturas globais de navegação nem de um RBAC centralizado unificado. Cada produto deve ter sua própria hierarquia de permissões (ex: Almoxarife Chefe, Comprador, Auditor).
3. **Objetivo Central de Negócio (Custo do Paciente Door-to-Door)**: O fim último de todo o condomínio hospitalar e das redes públicas é apurar o **Custo Real do Paciente**. Como os sistemas operam autonomamente, cada módulo precisa gerar seu próprio fluxo de despesas e exportá-lo de forma desacoplada para que o Hub atue como **Consolidador/Unificador**.

---

## Decisão Tomada (Decision)

Decidimos adotar formalmente o padrão **"Standalone-First, Hub-Consolidated"** em toda a plataforma:

### 1. Padronização de UI/UX (Frontend Design & Layout)
- **Menu Lateral Exclusivo por Produto**: Todo módulo comercializável possui seu próprio layout autônomo com menu lateral retrátil exclusivo (`w-64` / drawer mobile), tema cromático semântico (Azul Cobalto para Compras, Laranja Âmbar para Estoque, Esmeralda para Faturamento, Roxo para LIS, etc.) e cabeçalho de produto independente.
- **Eliminação de Abas Horizontais Primárias**: A navegação primária entre áreas funcionais de um produto deve ser conduzida exclusivamente pelo menu lateral do módulo.
- **Saída Unificada para o Hub**: Todo menu lateral de módulo possui em seu rodapé o link claro `Voltar ao Hub de Módulos` (`<Link href="/">`), permitindo ao usuário alternar de produto quando contratado em suíte.

### 2. Arquitetura de Isolamento & RBAC Desacoplado
- **RBAC Independente**: Cada módulo gerencia seu próprio catálogo de papéis e permissões (SoD - Segregation of Duties). O Almoxarifado possui `almoxarife_chefe`, `conferente_recebimento`, `farmaceutico_rt_cd` e `auditor_inventario`, sem qualquer dependência dos perfis de compras, financeiro ou corpo clínico.
- **Comunicação por Eventos / Webhooks**: Quando múltiplos produtos são contratados simultaneamente, a integração entre eles dá-se de forma frouxamente acoplada (Loose Coupling) através do Barramento de Eventos (n8n / Webhooks REST). Exemplo:
  - *Compras* emite evento `compra_nf_homologada`.
  - *Estoque* consome o evento e gera pré-cadastro de lote FEFO para conferência física cega, sem dependência direta de banco compartilhado.

### 3. Modelo de Despesas & Motor de Custo do Paciente no Hub
- **Geração Descentralizada de Despesas**: Cada produto é responsável por apurar e gerar seu relatório analítico de despesas e centros de custo (ex: consumo de medicamentos por paciente/leito no Estoque; empenhos e insumos entregues em Compras; diárias em Leitos; laudos no LIS).
- **Contrato Padronizado de Despesas (JSON / CSV / REST API)**:
  - Cada módulo disponibiliza a ação de **Exportação Manual de Despesas** (arquivos padronizados JSON/CSV para clientes isolados).
  - Cada módulo disponibiliza a **Sincronização Direta via API** (`POST /api/hub/despesas/ingestao`) para clientes integrados em tempo real.
- **Papel do Hub (O Unificador Door-to-Door)**:
  - O Hub atua como o receptor central de todas as despesas (via webhook ou upload manual de arquivo).
  - O Hub consolida os centros de custo e aloca os custos diretos e indiretos (Método de Custeio ABC Hospitalar) por paciente/episódio, confrontando com as tabelas SIGTAP (SUS) e TUSS/CBHPM (Saúde Suplementar).

---

## Contrato de Dados para Ingestão de Despesas no Hub (`/api/hub/despesas/ingestao`)

```json
{
  "origem_modulo": "ESTOQUE_CENTRAL",
  "cliente_id": "HOSPITAL_360_MATRIZ",
  "lote_exportacao_id": "EXP-EST-2026-0922",
  "data_geracao": "2026-09-22T12:00:00Z",
  "despesas": [
    {
      "id_transacao": "DSP-EST-001",
      "paciente_cpf": "123.456.789-00",
      "paciente_nome": "Carlos Eduardo Silveira",
      "prontuario_episodio": "EPIS-2026-8841",
      "centro_custo": "UTI_ADULTO",
      "leito_identificador": "Leito 204",
      "item_codigo": "MED-001",
      "item_descricao": "Meropenem 1g Injetável",
      "lote_fabricante": "LT-2026-MERO-01",
      "quantidade": 6,
      "unidade_medida": "Frasco-Ampola",
      "valor_unitario_medio": 48.50,
      "valor_total_imputado": 291.00,
      "data_consumo": "2026-09-22 10:30:00"
    }
  ]
}
```

---

## Consequências (Consequences)

### Positivas:
- **Pronto para Comercialização Modular (Go-To-Market)**: Permite faturar e implantar produtos individuais em clientes que já possuem seus próprios ERPs legados (MV, Tasy, etc.), sem forçar a troca do ecossistema inteiro.
- **Experiência de Usuário Focada (UX Craft)**: O usuário do Almoxarifado opera em um ambiente 100% projetado para a rotina logística do CD, sem a poluição de menus de compras, censo médico ou faturamento.
- **Resiliência e Desacoplamento**: Falhas ou manutenções em um módulo não afetam a operação dos demais.
- **Consolidação Precisa no Hub**: O cálculo do Custo do Paciente atinge nível de excelência analítica, funcionando com alimentação automatizada (API) ou assíncrona (upload de despesas).
