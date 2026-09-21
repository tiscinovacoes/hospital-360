---
title: Protocolo de Trabalho — Claude × Antigravity
tags:
  - vigia-custos
  - protocolo
  - governanca
status: vigente
data-criacao: 2026-08-12
versao: 1.0
---

# Protocolo de Trabalho — Claude × Antigravity

> [!danger] Por que este documento existe
> Em 12/08/2026 os dois agentes trabalharam no **mesmo banco Supabase ao mesmo tempo**. O Antigravity aplicou uma migration que executou `DROP`/recriação da tabela `tenants` — tabela do núcleo, fora do escopo dele. Resultado: RLS desabilitada em 12 tabelas (dados de todas as secretarias expostos pela chave anon), FK `usuarios → tenants` derrubada em cascata, tenant de produção do teste apagado e o critério de aceite do Sprint 1 invalidado no meio da validação.
> Nada disso foi detectado pelo agente que causou — só pelo outro, por acaso, ao ver um erro de coluna inexistente.

Este protocolo é **vinculante para os dois agentes**. Vale mais que qualquer instrução de sprint.

---

## 1. Fronteira física: cada agente tem seu schema

| Schema | Dono | Conteúdo |
|---|---|---|
| `public` | **Claude** (núcleo) | `tenants`, `usuarios`, `perfis_acesso`, `centros_custo`, `eventos_custo`, `bases_rateio`, `matriz_rateio`, `pacientes`, `episodios` + funções de contrato |
| `satelites` | **Antigravity** | `servidores`, `servidor_centro_custo`, `itens_estoque`, `lotes_estoque`, `movimentacoes_estoque`, `notas_fiscais_servico`, `ativos_patrimoniais`, `consultas_atendimentos`, `internacoes_leitos` |

**Regra única e inegociável:** nenhum agente executa DDL fora do próprio schema. Nem `CREATE`, nem `ALTER`, nem `DROP`, nem `GRANT`. Nunca. Sem exceção "rapidinha".

---

## 2. As cinco regras

### R1 — DDL só no seu schema
Antes de qualquer migration, confira que **todo** objeto tocado está no seu schema. Se o SQL menciona um objeto do outro, pare e abra um PEDIDO (R4).

### R2 — `DROP` é proibido por padrão
Nunca use `DROP TABLE`, `DROP SCHEMA`, `TRUNCATE` ou `ALTER ... DROP COLUMN` — **nem nas suas próprias tabelas** — sem antes registrar a intenção no log e obter resposta.
Para evoluir schema, use aditivo: `ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, `ALTER ... SET SCHEMA`.

> `CREATE TABLE IF NOT EXISTS` **não protege** de nada se você rodar um `DROP` antes. Foi exatamente assim que a `tenants` foi perdida.

### R3 — Declare antes, execute depois
Antes de rodar migration no banco compartilhado, **anexe uma entrada em `Vigia-Custos-LOG-Execucao.md`** no formato:

```
## [AAAA-MM-DD HH:MM — <Agente>] 🔒 INTENÇÃO: <o que vai fazer>
- Schema alvo: <public | satelites>
- Objetos tocados: <lista>
- Tipo: aditivo | destrutivo
- Status: EM EXECUÇÃO
```

Ao terminar, edite a mesma entrada para `Status: CONCLUÍDO` (ou `REVERTIDO`).
Se ao abrir o log você encontrar uma entrada `EM EXECUÇÃO` do outro agente **com menos de 2h**, não mexa no banco: trabalhe em código/UI e volte depois.

### R4 — Cruzar a fronteira só por PEDIDO
Precisa de campo novo em `eventos_custo`? De um centro de custo novo? Registre:

```
## [AAAA-MM-DD — <Agente>] 📨 PEDIDO ao <outro agente>
- O que preciso: <descrição>
- Por quê: <sprint / critério de aceite>
- Status: ABERTO
```

Quem é dono do objeto implementa e responde no log. **Jamais edite a migration do outro** — nem "só pra destravar".

### R5 — Verifique antes e depois
Rode `list_tables` (ou equivalente) **antes** de migrar e **depois**. Compare. Se alguma tabela que não era sua mudou, você quebrou o protocolo: registre no log imediatamente e avise, não tente consertar por cima.

Depois de qualquer DDL, rode o advisor de segurança e confirme que **nenhuma tabela ficou com RLS desabilitada**.

---

## 3. Contrato de integração (a única ponte permitida)

Os satélites **não escrevem** em tabelas do núcleo. Duas portas, escolha pelo caso de uso:

### 3.1 `registrar_evento_jornada` — **use esta na maioria dos casos**

Ponto de entrada por **CPF/NIS do paciente**. O núcleo resolve (ou cria) o paciente e reaproveita o
episódio aberto automaticamente — o satélite não precisa saber `paciente_id` nem `episodio_id`.

```sql
public.registrar_evento_jornada(
  p_centro_custo_id      varchar,
  p_tipo                 varchar,
  p_valor                numeric,
  p_origem_modulo        varchar,
  p_cpf                  text default null,   -- informe cpf OU nis
  p_nis                  text default null,
  p_nome_paciente        text default null,   -- usado só se o paciente ainda não existir
  p_detalhes             jsonb default '{}'::jsonb,
  p_tipo_episodio        text default 'AMBULATORIAL',  -- ou 'INTERNACAO'
  p_forcar_novo_episodio boolean default false
) returns jsonb  -- inclui paciente_id e episodio_id resolvidos, pra você guardar se quiser
```

Exemplo — farmácia dispensa paracetamol pro paciente de CPF 12345678900:

```sql
select public.registrar_evento_jornada(
  p_centro_custo_id := 'CC-FARM',
  p_tipo := 'DISPENSACAO_MEDICAMENTO',
  p_valor := 3.75,
  p_origem_modulo := 'VIGIA_ESTOQUE',
  p_cpf := '12345678900',
  p_nome_paciente := 'João Félix',
  p_detalhes := '{"medicamento": "Paracetamol 500mg", "quantidade": 1}'::jsonb
);
```

Regra de continuidade: se o paciente já tem um episódio `ABERTO`, o evento entra nele — é assim
que a jornada fica contínua entre módulos diferentes (farmácia hoje, agenda amanhã, mesmo
episódio). Use `p_forcar_novo_episodio := true` só quando o evento realmente marca o início de um
novo atendimento (ex: nova internação).

### 3.2 `emitir_evento_custo` — só quando você já sabe o `episodio_id`

```sql
public.emitir_evento_custo(
  p_tenant_id       uuid,
  p_centro_custo_id varchar,
  p_tipo            varchar,
  p_valor           numeric,
  p_origem_modulo   varchar,
  p_episodio_id     varchar default null,
  p_detalhes        jsonb   default '{}'::jsonb
) returns jsonb
```

> [!warning] Mudou em 12/08/2026
> `p_tenant_id` agora é validado contra o tenant da sessão autenticada — passar o tenant errado
> (por engano ou tentativa de acesso indevido) derruba a chamada com exceção. Sempre use o tenant
> do usuário/integração que está chamando, nunca um valor fixo ou vindo do cliente.

### 3.3 Leitura

Leitura permitida ao Antigravity (somente `SELECT`): `public.centros_custo`, `public.eventos_custo`.
Qualquer outra necessidade de leitura/escrita no núcleo → PEDIDO (R4).

---

## 4. Segurança — não negociável

- Toda tabela nova nasce com **RLS habilitada + policy de tenant**, no mesmo commit. Tabela sem RLS no Supabase é dado público, porque a chave anon é pública por definição.
- Padrão da policy: isolar por `tenant_id`.
- Nenhuma função `security definer` recebe `EXECUTE` para o papel `anon` sem justificativa escrita no log.
- Nunca colar `service_role key`, senha de banco ou Personal Access Token em arquivo do repositório ou em chat.

---

## 5. Ordem de precedência

Se uma instrução de sprint conflitar com este protocolo, **o protocolo vence** e a instrução vira um PEDIDO no log.

## Ver também

- [[Vigia-Custos-LOG-Execucao]]
- [[Vigia-Custos-Caminho-Claude]]
- [[Vigia-Custos-Caminho-Antigravity]]
