---
title: Ordem de Serviço 01 — Antigravity — Migração dos Satélites
tags:
  - vigia-custos
  - antigravity
  - ordem-servico
status: concluida
data-criacao: 2026-08-12
emitido-por: Claude
---

# Ordem de Serviço 01 — Migração dos Satélites para o schema `satelites`

> [!warning] Leia antes de tocar em qualquer coisa
> Leia **[[PROTOCOLO-AGENTES]]** inteiro primeiro. Ele existe por causa de um incidente causado no dia 12/08/2026, descrito lá. As regras dele valem mais que esta ordem de serviço.

## Contexto — o que mudou

O banco Supabase `oogpcdaosexarxmvupiw` agora é **compartilhado com fronteira**:

- `public` → núcleo (Claude). **Você não executa DDL aqui.**
- `satelites` → seu. Todas as suas 9 tabelas **já foram movidas pra lá**, com os dados preservados (`ALTER TABLE ... SET SCHEMA`, sem `DROP`).

Você não perdeu nada. Só mudou o endereço: `servidores` agora é `satelites.servidores`, e assim por diante.

## Estado atual das suas tabelas

| Tabela | Linhas | RLS |
|---|---|---|
| `satelites.servidores` | 0 | ❌ |
| `satelites.servidor_centro_custo` | 0 | ❌ |
| `satelites.itens_estoque` | 0 | ❌ |
| `satelites.lotes_estoque` | 0 | ❌ |
| `satelites.movimentacoes_estoque` | 0 | ❌ |
| `satelites.notas_fiscais_servico` | 0 | ❌ |
| `satelites.ativos_patrimoniais` | 0 | ❌ |
| `satelites.consultas_atendimentos` | 0 | ❌ |
| `satelites.internacoes_leitos` | 0 | ❌ |

---

## Tarefa 1 — Habilitar RLS nas suas 9 tabelas ⚠️ prioridade máxima

Suas tabelas estão **sem Row Level Security**. Hoje o risco está contido porque o schema `satelites` não é exposto pela API REST do Supabase (só `public` é), mas isso é uma proteção circunstancial: no instante em que o schema for exposto pra você consumir via `supabase-js`, todas as linhas ficam legíveis e graváveis por qualquer um com a chave anon — que é pública.

Aplique RLS **junto** com as policies, nunca só o `ENABLE` (habilitar sem policy bloqueia todo acesso e derruba seus módulos):

```sql
-- Para CADA uma das 9 tabelas:
alter table satelites.<tabela> enable row level security;

create policy <tabela>_tenant_isolation on satelites.<tabela>
  for all to authenticated
  using (tenant_id = public.current_tenant_id())
  with check (tenant_id = public.current_tenant_id());
```

A função `public.current_tenant_id()` já existe e retorna o tenant do usuário logado. Você tem `EXECUTE` nela.

**Critério de aceite:** `get_advisors(type: "security")` não retorna nenhuma tabela `satelites.*` com RLS desabilitada.

---

## Tarefa 2 — Trocar o mock pelo Supabase real

Seus módulos hoje usam `src/contracts/custoContractStub.js`, um mock em memória com centros de custo fixos (`CC-01`... `CC-07`) e `tenant-demo`. O núcleo agora é real.

O que muda:

1. **`tenant_id` agora é UUID**, não a string `'tenant-demo'`. Os centros de custo reais estão em `public.centros_custo`, todos sob o tenant `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` ("Secretaria Municipal de Saúde - Piloto"). Os IDs `CC-01`...`CC-07` foram preservados.
2. **Emissão de custo** deixa de ser `custoContract.emitirEventoCusto({...})` em memória e passa a ser RPC:

```js
const { data, error } = await supabase.rpc('emitir_evento_custo', {
  p_tenant_id: tenantId,          // uuid
  p_centro_custo_id: 'CC-04',
  p_tipo: 'SAIDA_ESTOQUE',
  p_valor: 42.50,
  p_origem_modulo: 'VIGIA_ESTOQUE',
  p_episodio_id: episodioId,      // opcional
  p_detalhes: { lote: 'L-123' }   // opcional
});
```

A função valida que o centro de custo pertence ao tenant e rejeita valor negativo. Se você receber erro, é dado inconsistente do seu lado — **não altere a função**, abra um PEDIDO (regra R4 do protocolo).

3. **Suas leituras** passam a usar o schema: `supabase.schema('satelites').from('servidores')`.
   Isso exige que `satelites` esteja na lista de *Exposed schemas* do projeto (Dashboard → Settings → API). **Peça ao Luca para habilitar** — é config de projeto, não DDL, e nenhum de nós dois deve mexer sozinho.

**Critério de aceite:** rodar `tests/runAllTests.js` com os módulos apontando pro Supabase real, não pro stub, e ver os eventos aparecerem em `public.eventos_custo`.

---

## Tarefa 3 — Rodar o ciclo real do Sprint 8

O Sprint 8 ("integração ponta a ponta") foi marcado como concluído, mas rodou **inteiramente contra o mock** — o núcleo não existia. Isso precisa ser refeito contra o banco real, senão o Sprint 12 (meu) parte de dado falso.

**Critério de aceite:** simular um mês de um posto e conferir, com `SELECT` em `public.eventos_custo`, que os eventos de RH + Estoque + Compras chegaram com `tenant_id`, `centro_custo_id` e `valor` corretos.

---

## O que você NÃO faz nesta ordem de serviço

- ❌ Nenhum DDL em `public` (é do núcleo)
- ❌ Não alterar `emitir_evento_custo`, `current_tenant_id`, `completar_cadastro`
- ❌ Não criar/alterar `centros_custo`, `eventos_custo`, `tenants`, `usuarios`, `perfis_acesso`
- ❌ Não rodar `supabase db push` com o arquivo antigo `supabase/migrations/20260812000000_vigia_custos_schema.sql` — **foi ele que causou o incidente**. Ele deve ser reescrito para conter só o schema `satelites`.

## Ao terminar

Registre em [[Vigia-Custos-LOG-Execucao]] seguindo o formato da regra R3, e avise o que ficou pendente.

## Ver também

- [[PROTOCOLO-AGENTES]]
- [[Vigia-Custos-Caminho-Antigravity]]
- [[Vigia-Custos-LOG-Execucao]]
