---
title: Ordem de Serviço 02 — Antigravity — Continuidade Pós-Pausa
tags:
  - vigia-custos
  - antigravity
  - ordem-servico
status: emitida
data-criacao: 2026-08-19
emitido-por: Claude
---

# Ordem de Serviço 02 — Continuidade do Caminho Antigravity

> [!warning] Leia antes de tocar em qualquer coisa
> **[[PROTOCOLO-AGENTES]]** continua vigente e vale mais que esta ordem. Antes de rodar qualquer DDL: confira o log por uma entrada `🔒 INTENÇÃO ... EM EXECUÇÃO` com menos de 2h — se existir, não mexa no banco agora.

## Contexto — por que esta ordem existe

Passou uma semana desde a última atividade registrada (12/08 → hoje, 19/08/2026). Fiz uma auditoria completa do estado real do repositório (não só do log) pra você retomar sem perder contexto e sem repetir o incidente do dia 12/08 (queda da tabela `tenants`, RLS desabilitada em 12 tabelas — descrito em detalhe em [[PROTOCOLO-AGENTES]]).

**Achado principal, e o motivo desta ordem existir:** o log registra "100% concluído" pros dois caminhos, mas a auditoria de código encontrou 3 lacunas reais que o log não reflete. Nenhuma é culpa de má-fé — são coisas que ficam invisíveis quando o critério de aceite é "os testes passam", sem checar o resultado no repositório inteiro. Elas viram as tarefas 1 a 3 abaixo.

## Estado real do sistema (auditoria de 19/08, não é opinião — é o que está no disco)

| Item | Log diz | Auditoria encontrou |
|---|---|---|
| Satélites usam `registrar_evento_jornada` | Não menciona diretamente | Ainda usam `emitir_evento_custo` (o contrato antigo, que exige `episodio_id`). O pedido que fiz às 21:10 do dia 12/08 pra migrar pra `registrar_evento_jornada` (CPF/NIS) segue **pendente**. |
| Repositório sob controle de versão | Não menciona | **A raiz do projeto não é um repositório git.** Só `nucleo/.git` e os clones em `references/*/.git` existem. `src/modules/`, `tests/`, `supabase/migrations/`, `index.html`, `styles.css` e todos os `.md` de planejamento **não têm histórico de versão nenhum** — não há como reverter uma alteração ruim nem recuperar se algo for apagado por acidente. |
| Segurança de segredos | Não menciona | `.env` e `SUPABASE_TOKENS.md` estão na raiz **sem `.gitignore` de raiz** (porque não existe raiz git ainda — mas o dia que existir, sem `.gitignore` pronto, os dois entram no primeiro commit). Já criei um `.gitignore` de raiz preventivo (ver Tarefa 2) — mas os arquivos em si continuam ali, sem proteção adicional até alguém agir. |
| Migration do schema `satelites` fiel ao banco | "Ordem de Serviço 01 concluída" | Provavelmente sim (você reescreveu o arquivo na OS-01), mas houve pelo menos uma rodada de mudança depois disso (RLS, policies). Vale confirmar que `supabase/migrations/20260812000000_vigia_custos_schema.sql` ainda bate 1:1 com `list_tables`/policies reais antes de seguir — ver Tarefa 3. |
| UI real dos módulos Grupo C (Agenda/Leitos/Faturamento) | "Sprint 9/10/11 concluídos" | Existem só como modelo JS + teste Node (`agendaModel.js`, `leitosModel.js`, `faturamentoModel.js`), sem rota nenhuma dentro do Next.js. Pode ser intencional (ver Tarefa 4) — mas não está documentado como decisão, então fica ambíguo se falta UI ou se é assim mesmo por design. |
| Nome do projeto | Docs dizem "Vigia Custos/Vigia Saúde" | Código diz "AIVIQ Saúde" (rebranding de 12/08 23:00) — os dois nomes convivem hoje sem nenhum documento marcando qual é o oficial. |

---

## Tarefa 1 — Migrar as chamadas dos satélites pra `registrar_evento_jornada`

Pedido que já estava registrado no log de 12/08 21:10 e segue pendente. Motivo: `emitir_evento_custo` exige que o satélite já saiba o `episodio_id` — na prática nenhum satélite tem isso, então hoje (se ainda estiver assim) cada evento pode estar abrindo episódio novo em vez de continuar a jornada do mesmo paciente entre módulos.

Troque em `src/modules/*/` e em `src/contracts/supabaseCustoContract.js` as chamadas de:

```js
supabase.rpc('emitir_evento_custo', { p_tenant_id, p_centro_custo_id, p_tipo, p_valor, p_origem_modulo, p_episodio_id, p_detalhes })
```

por:

```js
supabase.rpc('registrar_evento_jornada', {
  p_centro_custo_id, p_tipo, p_valor, p_origem_modulo,
  p_cpf,               // ou p_nis
  p_nome_paciente,      // só usado se o paciente ainda não existir
  p_detalhes,
  p_tipo_episodio,      // 'AMBULATORIAL' (padrão) ou 'INTERNACAO'
  p_forcar_novo_episodio // true só quando o evento realmente abre um novo atendimento (ex: nova internação em Vigia Leitos)
})
```

Detalhe da assinatura completa em [[PROTOCOLO-AGENTES]] §3.1. Cada módulo satélite precisa ter/coletar CPF ou NIS do paciente pra chamar isso — se algum módulo (ex: Compras/Patrimônio, que não tem paciente associado) não se encaixa nesse contrato, ele continua em `emitir_evento_custo` normalmente (esse contrato é só pra eventos ligados a jornada de paciente: RH pode não se aplicar, Estoque/Agenda/Leitos/Faturamento sim).

**Critério de aceite:** rodar `tests/runAllTests.js` e conferir, via `SELECT` em `public.episodios`, que um mesmo paciente atendido por dois módulos diferentes no mesmo dia (ex: farmácia + agenda) cai no mesmo episódio — não em dois.

---

## Tarefa 2 — Higiene de segredos (já criei a rede de segurança, falta o resto)

Já criei `F:\Projetos\360\.gitignore` (raiz) cobrindo `.env`, `.env.*` (exceto `.env.example`), `SUPABASE_TOKENS.md`, `node_modules/`, `.next/`, `*.tsbuildinfo`, `supabase/.temp/`. Isso é só a rede de segurança pro dia em que existir um `git init` na raiz — não resolve o problema de fundo.

O que falta, pra você (ou Luca) decidir e executar:
1. Confirmar que `SUPABASE_TOKENS.md` nunca foi colado em nenhum commit dentro de `nucleo/.git` (rode `git -C nucleo log -p --all -- '*TOKEN*' 2>&1 | head` ou equivalente — se aparecer algo, o token precisa ser **rotacionado no dashboard do Supabase**, não só removido do arquivo).
2. Criar `.env.example` na raiz com as chaves necessárias **sem valores reais** (só nomes de variável), pra qualquer pessoa nova (ou um terceiro agente) saber o que precisa configurar sem expor segredo.
3. Se `SUPABASE_TOKENS.md` guarda só documentação de onde pegar token (não o token em si), pode ficar — só confirme que não tem valor colado ali.

**Critério de aceite:** nenhum segredo real em texto plano fora de `.env`/`.env.local` (que já estão no `.gitignore`), e existência de `.env.example` documentando as variáveis.

---

## Tarefa 3 — Confirmar que a migration do schema `satelites` está fiel ao banco real

Depois da OS-01 (RLS + policies) pode ter havido ajuste que não voltou pro arquivo. Rode `list_tables` (schema `satelites`) e compare campo a campo com `supabase/migrations/20260812000000_vigia_custos_schema.sql`. Se divergir, gere uma migration nova (aditiva, `IF NOT EXISTS`) que feche a diferença — não edite a migration antiga por cima pra "corrigir retroativamente".

**Critério de aceite:** `supabase db diff` (ou `list_tables` + `get_advisors`) não mostra diferença entre o que o arquivo declara e o que está em produção pro schema `satelites`.

---

## Tarefa 4 — Decidir e documentar: `index.html` é a UI real dos satélites, ou é só demo?

Hoje `agendaModel.js`, `leitosModel.js` e `faturamentoModel.js` só têm teste Node, sem UI (nem em `index.html`, nem no Next.js). Não sei se isso é porque a UI ainda não foi feita, ou porque a intenção é esses três ficarem "invisíveis" (chamados só via API por sistema externo da secretaria, conforme a ideia original de "satélite plugável" do documento de MVP).

Preciso que você registre a decisão em [[Vigia-Custos-Caminho-Antigravity]] (uma frase já resolve): ou "estes 3 módulos são API-only por design, sem UI própria no MVP" ou "falta UI, entra como sprint extra". Sem isso, toda vez que alguém for conferir "Grupo C está pronto?" a resposta vai continuar ambígua.

---

## Tarefa 5 — Não decidir sozinho: PK composta de `centros_custo`

Dívida técnica registrada por mim em 12/08 21:20 (`centros_custo.id` é PK global, deveria ser composta com `tenant_id`) segue pendente. **Não mexa nisso sozinho** — a FK é referenciada pelas suas 9 tabelas em `satelites`. Se quiser priorizar, abra um `📨 PEDIDO` no log seguindo o formato do protocolo (R4) e eu (Claude) entro numa janela coordenada com você pra migrar as duas pontas juntas.

---

## Tarefa 6 (opcional, baixo risco) — Alinhar o nome do projeto na documentação

Você renomeou a aplicação pra "AIVIQ Saúde" no código (12/08 23:00) mas os `.md` de planejamento continuam com "Vigia Custos/Vigia Saúde". Não é DDL, não tem risco técnico — só decida com o Luca qual nome é o oficial e atualize os documentos que você já é dono (`Vigia-Custos-Caminho-Antigravity.md`) ou registre um `📨 PEDIDO` se quiser que eu atualize os meus (`Vigia-Custos-Caminho-Claude.md`, `Vigia-Custos-MVP-Sprints.md`).

---

## O que não muda

- Sprint 14 (piloto real) continua bloqueado por decisão institucional/LGPD do Luca — não é tarefa de código, não entra nesta ordem.
- Todas as regras de [[PROTOCOLO-AGENTES]] (DDL só no seu schema, sem `DROP`, declarar antes de executar, `list_tables` antes/depois, RLS obrigatória) continuam valendo integralmente.

## Ao terminar

Registre em [[Vigia-Custos-LOG-Execucao]] seguindo o formato R3, uma entrada por tarefa concluída (não precisa esperar terminar todas as 6 pra registrar a primeira).

## Ver também

- [[PROTOCOLO-AGENTES]]
- [[ORDEM-Antigravity-01-Migracao-Satelites]]
- [[Vigia-Custos-Caminho-Antigravity]]
- [[Vigia-Custos-LOG-Execucao]]
