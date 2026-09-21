---
title: Vigia Custos — Caminho Claude
tags:
  - vigia-custos
  - caminho-claude
  - mvp
status: em-execucao
data-criacao: 2026-08-12
aliases:
  - Caminho Claude
---

# Vigia Custos — Caminho Claude

> [!info] O que é este documento
> Fatia do MVP do [[Vigia-Custos-MVP-Sprints|Vigia Custos]] atribuída ao **Claude**, separada do [[Vigia-Custos-Caminho-Antigravity|caminho do Antigravity]] pra evitar os dois agentes mexerem nos mesmos arquivos/tabelas ao mesmo tempo. Toda ação concluída aqui deve ser registrada em **[[Vigia-Custos-LOG-Execucao]]**.

## Escopo

- **Grupo A — Núcleo** (Sprints 1 a 4): fundação técnica, centros de custo, motor de absorção, jornada do paciente
- **Grupo D — Apuração** (Sprints 12 a 14): relatórios, ABC nos centros críticos, piloto real

Motivo do agrupamento: são as duas pontas que exigem entender o modelo de dados inteiro — quem define o núcleo (A) e quem fecha o ciclo consumindo tudo que os satélites alimentam (D). Ficam com quem já desenhou o esquema de custeio, evitando retrabalho de handoff.

## O que NÃO mexer

- Pastas/tabelas dos módulos satélite (`rh`, `estoque`, `compras`, `patrimonio`, `agenda`, `leitos`, `faturamento`) — são do Antigravity.
- Se um satélite precisar de um campo novo em `eventos_custo` ou `centros_custo`, o pedido entra como item no [[Vigia-Custos-LOG-Execucao|log]] em vez de editado direto — evita os dois agentes alterando a mesma migration.

## Contrato que este caminho entrega pro Antigravity

Até o fim do Sprint 4, o Antigravity precisa ter disponível (mesmo que ainda como stub/mock antes disso):

- Tabela `centros_custo` (id, tipo, nome, tenant_id)
- Tabela `eventos_custo` (id, episodio_id, centro_custo_id, tipo, valor, timestamp, origem_modulo)
- Função/endpoint `emitir_evento_custo(...)` — é isso que cada satélite chama quando gera um custo (baixa de estoque, hora de servidor, nota de compra, diária de leito)
- RLS já isolando por `tenant_id`, então os satélites só precisam respeitar o mesmo padrão de tenant nas suas próprias tabelas

Enquanto o Sprint 1-4 não fecha, o Antigravity pode adiantar UI e modelagem interna dos satélites usando esse contrato como mock — sem esperar parado.

## Sprints

### Grupo A — Núcleo (Vigia Custos)
> [!important] Por que primeiro
> Define o modelo de dados que todo o resto depende. Sem isso funcionando (mesmo com dados mockados), nenhum outro grupo tem pra onde emitir evento de custo.

- [x] **Sprint 1 — Fundação técnica** ✅ 2026-08-12
  - Next.js 16 App Router + TypeScript + Tailwind em `nucleo/`, Supabase Auth real (`@supabase/ssr`)
  - Multi-tenant: `tenants`/`usuarios`/`perfis_acesso` com RLS por `tenant_id`, auto-cadastro via RPC `completar_cadastro` (primeiro usuário do tenant = admin, seguintes = operador)
  - Critério de aceite: **atingido** — 2 secretarias reais testadas fim a fim no browser (login/cadastro/dashboard), cada uma só vê seus próprios usuários

- [x] **Sprint 2 — Centros de custo** ✅ 2026-08-12
  - Tabelas `bases_rateio`, `matriz_rateio` + coluna `base_rateio_distribuicao_id` em `centros_custo`, todas com RLS
  - Cadastro configurável de driver de rateio via UI (`/centros-custo`)
  - Critério de aceite: **atingido** — 3 centros auxiliares + 2 produtivos cadastrados via UI, cada um com base de rateio definida (tenant Vinhedo)

- [x] **Sprint 3 — Motor de absorção** ✅ 2026-08-12
  - Função `executar_rateio(periodo_inicio, periodo_fim)`: soma custo direto de cada auxiliar no período, distribui pros produtivos/críticos proporcional ao driver (`rateio_resultados`)
  - Testado com dados sintéticos por SQL e confirmado de novo via UI real (`/rateio`)
  - Critério de aceite: **atingido** — rateio de um mês fictício rodado e conferido à mão (UBS Central R$6.000, Enfermaria R$2.500 — bateu exato)

- [x] **Sprint 4 — Jornada do paciente** ✅ 2026-08-12
  - Tabelas `pacientes` (PID único), `episodios`, função `custo_total_episodio` (soma direto + fração rateada do centro, dividida pelos episódios que passaram por ele no período)
  - UI em `/pacientes`
  - Critério de aceite: **atingido** — episódio com 3 eventos (R$137,80 diretos) + rateio (R$6.000) = R$6.137,80, calculado corretamente e validado via UI
  - **Marco:** contrato pro Antigravity estável — ver [[PROTOCOLO-AGENTES]] e [[ORDEM-Antigravity-01-Migracao-Satelites]]

### Grupo D — Apuração, ABC crítico e piloto
> [!note] Pré-requisito
> Depende do Grupo B + C (Antigravity) estarem entregando `eventos_custo` de verdade — Sprint 12 só roda com integração ponta a ponta feita (Sprint 8 do caminho Antigravity).
> Executado com os dados reais disponíveis no momento (tenant "Secretaria Municipal de Saúde de Campo Grande"); reaplicável sem mudança quando o Antigravity terminar a Ordem de Serviço 01.

- [x] **Sprint 12 — Relatórios e apuração final** ✅ 2026-08-12
  - Função `relatorio_custos_episodios(periodo_inicio, periodo_fim)` + página `/relatorios`: custo por paciente, por CID, por período (agregação por unidade fica pronta pra uso assim que houver >1 unidade real nos dados)
  - Exportação CSV (`/relatorios/exportar`, abre no Excel) + impressão/PDF via `window.print()`
  - Critério de aceite: **atingido** — relatório de agosto/2026 gerado: 3 episódios, custo médio R$ 2.045,93, detalhado por CID e por paciente

- [x] **Sprint 13 — ABC nos centros críticos** ✅ 2026-08-12
  - Tabelas `atividades_criticas`, `atividade_consumos` + função `comparar_abc_absorcao`, UI em `/atividades` e na página do episódio
  - Testado com um centro crítico real (CC-UTI) e 2 episódios de internação com consumo de horas de ventilador diferente (48h e 12h)
  - Critério de aceite: **atingido** — absorção simples dava R$ 10.000,00 pros dois pacientes (divisão igual); ABC mostrou R$ 16.000,00 (48h) e R$ 4.000,00 (12h) — diferença de R$ 6.000,00 pra cada lado, visível e defensável (quem usou mais ventilador custa mais de verdade)

- [~] **Sprint 14 — Piloto real** ⚠️ parcial — 2026-08-12
  - [x] Trilha de auditoria: tabela `trilha_auditoria` + trigger `registrar_auditoria` em `bases_rateio`, `matriz_rateio`, `centros_custo` — testada e funcionando (log de usuário, ação, dados antigos/novos)
  - [ ] Rodar com dados reais de um posto + internação de um município parceiro — **bloqueado por engajamento institucional externo** (contato com secretaria/TCE-MS, definição do município piloto, e principalmente autorização/compliance LGPD pra tratar dado real de paciente). Isso não é algo que se resolve em código; entra como item de "Próximos passos" no plano geral.
  - Critério de aceite: parcialmente atingido — a infraestrutura de auditoria está pronta e testada; falta o dado real de um piloto de verdade

## Repositórios de referência (deste caminho)

- [Razikus/supabase-nextjs-template](https://github.com/Razikus/supabase-nextjs-template) — base de auth/RLS multi-tenant (Sprint 1)
- [point-source/supabase-tenant-rbac](https://github.com/point-source/supabase-tenant-rbac) — RBAC multi-tenant (Sprint 1)
- [RenatoKR/SIGTAP](https://github.com/RenatoKR/SIGTAP) — fonte de dados SIGTAP pro comparativo do Sprint 12/apuração

## Ver também

- [[Vigia-Custos-MVP-Sprints]]
- [[Vigia-Custos-Caminho-Antigravity]]
- [[Vigia-Custos-LOG-Execucao]]
