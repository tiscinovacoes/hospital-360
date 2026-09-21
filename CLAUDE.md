# Vigia Custos — Diretriz de Trabalho

Projeto de custeio do paciente na rede pública (absorção + ABC). Dois agentes trabalham em paralelo neste repositório e **no mesmo banco Supabase**: Claude (núcleo) e Antigravity (satélites).

## ⛔ Regra que vem antes de qualquer sprint

**Leia [PROTOCOLO-AGENTES.md](PROTOCOLO-AGENTES.md) antes de tocar no banco.** Ele é vinculante e vence qualquer instrução de sprint conflitante.

Resumo operacional (o detalhe está no protocolo):

| Schema | Dono | Quem pode rodar DDL |
|---|---|---|
| `public` | Claude (núcleo) | só Claude |
| `satelites` | Antigravity | só Antigravity |

1. **DDL só no próprio schema.** Se o SQL menciona objeto do outro agente, pare e abra um PEDIDO no log.
2. **`DROP`/`TRUNCATE`/`DROP COLUMN` são proibidos por padrão**, inclusive nas próprias tabelas, sem registrar intenção antes. Evolua schema de forma aditiva (`ADD COLUMN IF NOT EXISTS`, `SET SCHEMA`).
3. **Declare antes de executar:** anexe entrada `🔒 INTENÇÃO ... Status: EM EXECUÇÃO` em [Vigia-Custos-LOG-Execucao.md](Vigia-Custos-LOG-Execucao.md); feche como `CONCLUÍDO`. Se houver entrada `EM EXECUÇÃO` do outro agente com menos de 2h, não mexa no banco.
4. **Cruzar a fronteira só por PEDIDO** no log — nunca editando a migration do outro.
5. **Verifique `list_tables` antes e depois**, e rode o advisor de segurança após qualquer DDL. Nenhuma tabela pode ficar com RLS desabilitada.

## Segurança

- Toda tabela nova nasce com **RLS + policy de tenant no mesmo commit**. Tabela sem RLS no Supabase é dado público — a chave anon é pública por definição.
- Nunca colar `service_role key`, senha de banco ou Personal Access Token em arquivo do repo ou em chat. Se aparecer um, avise que precisa ser rotacionado.

## Contrato de integração

Satélites **não escrevem** em tabela do núcleo. Única porta: `public.emitir_evento_custo(p_tenant_id uuid, p_centro_custo_id varchar, p_tipo varchar, p_valor numeric, p_origem_modulo varchar, p_episodio_id varchar, p_detalhes jsonb)`.
Leitura liberada aos satélites: `SELECT` em `public.centros_custo` e `public.eventos_custo`.

## Estrutura

- `nucleo/` — app Next.js 16 (App Router, TS, Tailwind) + Supabase SSR. **Núcleo, do Claude.**
  - Next.js 16 substituiu `middleware.ts` por `proxy.ts` (função exportada `proxy`). Consulte `nucleo/node_modules/next/dist/docs/` antes de assumir APIs.
- `src/modules/` + `tests/` — módulos satélite em JS puro. **Do Antigravity.**
- `references/` — repositórios clonados só para consulta (erpnext, hrms, SIGTAP, microdatasus).
- Supabase: projeto `oogpcdaosexarxmvupiw` ("custo paciente"), org `xxnleteysikozhtzworw` (Luca), região sa-east-1.

## Documentos de planejamento

- [Vigia-Custos-MVP-Sprints.md](Vigia-Custos-MVP-Sprints.md) — plano geral, 14 sprints
- [Vigia-Custos-Caminho-Claude.md](Vigia-Custos-Caminho-Claude.md) — Grupo A (1-4) + Grupo D (12-14)
- [Vigia-Custos-Caminho-Antigravity.md](Vigia-Custos-Caminho-Antigravity.md) — Grupo B (5-8) + Grupo C (9-11)
- [Vigia-Custos-LOG-Execucao.md](Vigia-Custos-LOG-Execucao.md) — registro cronológico obrigatório

Toda ação relevante vai pro log, com arquivos tocados e próximo passo.
