---
title: Vigia Custos — Caminho Antigravity
tags:
  - vigia-custos
  - caminho-antigravity
  - mvp
status: em-execucao
data-criacao: 2026-08-12
aliases:
  - Caminho Antigravity
---

# Vigia Custos — Caminho Antigravity

> [!info] O que é este documento
> Fatia do MVP do [[Vigia-Custos-MVP-Sprints|Vigia Custos]] atribuída ao **Antigravity**, separada do [[Vigia-Custos-Caminho-Claude|caminho do Claude]] pra evitar os dois agentes mexerem nos mesmos arquivos/tabelas ao mesmo tempo. Toda ação concluída aqui deve ser registrada em **[[Vigia-Custos-LOG-Execucao]]**.

## Escopo

- **Grupo B — Fontes de custo / satélites** (Sprints 5 a 8): Vigia RH, Vigia Estoque, Vigia Compras + Patrimônio, integração ponta a ponta
- **Grupo C — Módulos assistenciais** (Sprints 9 a 11): Vigia Agenda (gancho de custo), Vigia Leitos, Vigia Faturamento

Motivo do agrupamento: são módulos "satélite" — cada um cadastra e emite evento de custo pro núcleo, mas não define o modelo de custeio em si. São mais paralelizáveis entre si e mais próximos de CRUD + integração do que de modelagem de motor de cálculo.

## O que NÃO mexer

- Tabelas/lógica do núcleo: `centros_custo`, `bases_rateio`, `matriz_rateio`, motor de rateio/absorção, motor ABC, `pacientes`, `episodios` — são do Claude.
- Se faltar um campo em `eventos_custo` ou uma função do núcleo não cobrir um caso de uso do satélite, registrar o pedido em [[Vigia-Custos-LOG-Execucao|log]] em vez de editar direto a migration do núcleo.

## Dependência do caminho Claude

Os satélites emitem custo através do contrato definido no [[Vigia-Custos-Caminho-Claude|caminho Claude]] (tabela `eventos_custo` + função `emitir_evento_custo`), estável a partir do fim do Sprint 4 de lá. Antes disso:
- Pode adiantar: cadastros, UI, modelagem interna de cada satélite (schema de `servidores`, `itens_estoque`, `notas_fiscais`, `ativos`, internação/`leitos`)
- Não pode fechar de verdade: o "critério de aceite" de cada sprint que depende de ver o valor entrar no custo do episódio (ex.: Sprint 6, 7) — isso só valida quando o núcleo estiver de pé

## Sprints

### Grupo B — Fontes de custo (satélites)
> [!note] Ordem de prioridade
> RH e Estoque primeiro — são os que mais pesam no custo direto e indireto. Compras/Patrimônio entram depois porque o volume de dado é menor e pode ser lançado manualmente no MVP.

- [x] **Sprint 5 — Vigia RH (mínimo viável)**
  - Cadastro de servidor, vínculo, carga horária, custo/hora (referência de schema: `frappe/hrms`)
  - Vínculo servidor ↔ centro de custo
  - Conector de importação (CSV/planilha) pra quando a secretaria já tem RH próprio
  - Critério de aceite: importar uma planilha de servidores e ver o custo/hora aparecer nos centros de custo certos

- [x] **Sprint 6 — Vigia Estoque (mínimo viável)**
  - Cadastro de item, lote, validade, saída vinculada a evento de custo
  - Conector de importação pra farmácia/almoxarifado externo
  - Critério de aceite: dar baixa de um medicamento num evento de paciente e ver o valor entrar no custo do episódio

- [x] **Sprint 7 — Vigia Compras + Patrimônio (mínimo viável)**
  - Lançamento de nota fiscal de serviço/insumo indireto (limpeza, manutenção) vinculado a centro de custo auxiliar
  - Cadastro simplificado de ativo fixo com depreciação linear (referência: `frappe/erpnext` módulo Asset)
  - Critério de aceite: lançar uma nota de material de limpeza e ver ela entrar no rateio do Grupo A

- [x] **Sprint 8 — Integração ponta a ponta Grupo A + B**
  - Rodar o ciclo completo: RH + Estoque + Compras alimentando os centros de custo, rateio rodando, jornada acumulando
  - Critério de aceite: simular um mês completo de um posto fictício e conferir o custo final de um paciente-teste à mão
  - **Marco:** integração real com o núcleo — é aqui que o mock vira produção

### Grupo C — Módulos assistenciais
> [!tip] Reaproveitamento
> Vigia Agenda já existe como protótipo (Módulo Clínico). O trabalho aqui é majoritariamente **integração** (emitir evento de custo), não construção do zero.

- [x] **Sprint 9 — Vigia Agenda → gancho de custo**
  - Adaptar o Módulo Clínico existente para emitir `evento_custo` a cada consulta/procedimento simples
  - Critério de aceite: uma consulta feita na UBS aparece automaticamente na jornada do paciente com custo calculated

- [x] **Sprint 10 — Vigia Leitos (internação simples)**
  - Modelo de internação: entrada, diária, transferência, alta — sem UTI/centro cirúrgico ainda
  - Cada diária gera evento de custo vinculado ao centro produtivo "enfermaria"
  - Critério de aceite: internar um paciente-teste por 3 dias e ver 3 eventos de diária com custo rateado corretamente

- [x] **Sprint 11 — Vigia Faturamento (comparação com SUS)**
  - Importar tabela SIGTAP (usar `RenatoKR/SIGTAP` como fonte)
  - Comparar custo apurado × repasse SIGTAP/TUSS por procedimento
  - Critério de aceite: para o paciente-teste do Sprint 10, mostrar custo real vs. repasse SUS recebido
  - **Marco:** ao fechar este sprint, o caminho Claude pode iniciar o Grupo D (Sprint 12)

## Repositórios de referência (deste caminho)

- [frappe/erpnext](https://github.com/frappe/erpnext) — schema de Ativo Fixo/depreciação (Sprint 7) e referência geral de estoque
- [frappe/hrms](https://github.com/frappe/hrms) — schema de RH/folha/escalas (Sprint 5)
- [Bahmni](https://github.com/Bahmni) — referência de fronteira módulo clínico × administrativo (Sprint 9/10)
- [RenatoKR/SIGTAP](https://github.com/RenatoKR/SIGTAP) — fonte de tabela SIGTAP (Sprint 11)
- [rfsaldanha/microdatasus](https://github.com/rfsaldanha/microdatasus) — layout de campos SIH/SIA (Sprint 10/11)

## Ver também

- [[Vigia-Custos-MVP-Sprints]]
- [[Vigia-Custos-Caminho-Claude]]
- [[Vigia-Custos-LOG-Execucao]]
