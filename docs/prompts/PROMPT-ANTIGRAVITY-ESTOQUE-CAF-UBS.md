# Prompt para o Antigravity — Estoque Central (CAF) + 9 Farmácias de UBS, 100% operacional

> Cole este documento inteiro como instrução ao Antigravity.
> Autorizado por: Luca (dono do produto), 2026-09-23.

---

## 0. Antes de qualquer coisa (vinculante)

1. Leia `PROTOCOLO-AGENTES.md` e `CLAUDE.md`. O protocolo vence este prompt em caso de conflito.
2. Abra `Vigia-Custos-LOG-Execucao.md`. Se houver entrada `EM EXECUÇÃO` do Claude com menos de 2h, **não mexa no banco** — trabalhe em código e volte depois.
3. Todo DDL deste trabalho vai **somente no schema `satelites`**. Nada de DDL em `public`.
4. Registre `🔒 INTENÇÃO ... Status: EM EXECUÇÃO` no log antes de cada migration e feche como `CONCLUÍDO`.
5. Rode `list_tables` antes e depois de cada migration e `get_advisors(security)` depois. **Nenhuma tabela pode ficar sem RLS.**
6. Proibido `DROP` / `TRUNCATE` / `DROP COLUMN` sem registrar intenção antes. Evolua de forma aditiva.
7. **Escopo de código autorizado para este trabalho:** além de `src/modules/` e `tests/`, você está autorizado a editar
   `nucleo/src/app/(modulos)/estoque-central/**`, `nucleo/src/app/api/estoque/**`, `nucleo/src/app/api/estoque-central/**`
   e criar `nucleo/src/lib/estoque/**`. Não altere outros arquivos do `nucleo/` sem PEDIDO no log
   (exceção: registrar a rota nova no menu lateral do módulo, se necessário).

---

## 1. Passo zero — dívida de segurança (fazer primeiro)

O advisor do Supabase acusa **9 tabelas do `satelites` com RLS DESLIGADO** (expostas a qualquer um com a chave anon):

`servidores`, `servidor_centro_custo`, `itens_estoque`, `lotes_estoque`, `movimentacoes_estoque`,
`notas_fiscais_servico`, `ativos_patrimoniais`, `consultas_atendimentos`, `internacoes_leitos`.

Para cada uma: `ENABLE ROW LEVEL SECURITY` **e** policy de tenant (`tenant_id = public.current_tenant_id()`) no mesmo commit.
Só ligar RLS sem policy bloqueia tudo. Critério de aceite: advisor sem `rls_disabled`.

Observação: as migrations `20260921_otimizacao_fefo_lotes.sql` e `20260921_banco_precos_medicamentos.sql`
**nunca foram aplicadas** no banco. `banco_precos_medicamentos` está em `public` (núcleo) — **não aplique**; se precisar, abra PEDIDO ao Claude.
Decida se `lotes_estoque_fefo` é substituída pelo modelo abaixo (recomendado) e registre no log.

---

## 2. Contexto de negócio

- Piloto: **município de Itaquiraí-MS** — 1 Farmácia Central (**CAF**) + **9 UBS, cada uma com sua farmácia**.
  Fonte das unidades: https://www.itaquirai.ms.gov.br/secretarias/saude — cadastre as 9 UBS com nome e **CNES**
  (consulte o CNES no DATASUS/cnes.datasus.gov.br; se não encontrar algum, deixe `cnes` nulo e liste no log para o Luca confirmar).
- As UBS **solicitam** medicamento à CAF; a CAF **separa e libera**; a UBS **confirma o recebimento**; a UBS **dispensa** ao paciente.
- Hoje o módulo é quase todo mock: `estoque-central/page.tsx` usa `TRANSFERENCIAS_MOCK`/`DESPESAS_ESTOQUE_SEED`,
  e as APIs `api/estoque-central` e `api/estoque/fefo-baixa` guardam dados em arrays em memória. **Tudo isso deve passar a ler/gravar no Supabase.**
  Nenhum botão pode ficar sem ação real. Nenhum dado de tela pode vir de constante mock.

---

## 3. Modelo de dados (schema `satelites`, todas com `tenant_id` + RLS)

### 3.1 Catálogo CATMAT
- `satelites.catmat_itens` — catálogo oficial (código CATMAT, descrição, unidade de fornecimento, classe/PDM, ativo/sustentável, `atualizado_em`).
- Fonte: API de dados abertos do Compras.gov.br (`https://dadosabertos.compras.gov.br`, módulo **Material** — consultar item de material).
  Filtre medicamentos (grupo/classe de **Drogas e Medicamentos, classe 6505** — confirme o código na própria API antes de filtrar).
- Implementar **importador** (script/rota de sincronização, paginado, idempotente via `ON CONFLICT (codigo_catmat)`) + rotina de atualização periódica.
  **Não** consultar a API externa a cada tela: a tela busca na tabela local (índice trigram em descrição para busca por nome).
- Catálogo é global (leitura para qualquer autenticado); escrita só pelo importador.

### 3.2 Produto e fracionamento
- `satelites.produtos_farmacia` — medicamento padronizado do município: `codigo_catmat` (obrigatório, FK lógica para `catmat_itens`),
  nome, princípio ativo, concentração, forma farmacêutica, **unidade base** (a menor unidade dispensável: comprimido, cápsula, ampola, frasco, mL),
  `controlado` (Portaria 344), `termolabil`, estoque mínimo padrão.
- `satelites.produto_embalagens` — hierarquia de apresentação com fator para a unidade base.
  Ex.: `CAIXA = 100`, `CARTELA/BLISTER = 10`, `COMPRIMIDO = 1`.
- **Regra de ouro: todo saldo e toda movimentação são gravados na unidade base (inteiro quando a unidade é contável).**
  Entrada pode ser digitada em caixa, solicitação em cartela, dispensação em comprimido — a conversão é do sistema.
  Proibido saldo fracionário de embalagem ("0,3 caixa").

### 3.3 Locais
- `satelites.locais_estoque` — `tipo` (`CAF` | `FARMACIA_UBS`), nome, CNES, endereço, ativo.
  Seed: 1 CAF + 9 farmácias de UBS de Itaquiraí.
- Vínculo usuário ↔ local (ex.: `satelites.usuarios_locais_estoque`). **RLS por local**: farmacêutico de UBS só vê/movimenta a própria farmácia;
  estoquista CAF vê CAF + solicitações; gestor vê tudo do tenant.

### 3.4 Lote, saldo e razão (ledger)
- `satelites.lotes` — produto, número do lote, fabricante, data de fabricação, **data de validade**, NF-e de origem, custo unitário (base), status (`LIBERADO`, `QUARENTENA`, `BLOQUEADO_RECALL`, `VENCIDO`).
- `satelites.saldos_lote_local` — saldo por (lote × local), `CHECK (quantidade >= 0)`.
- `satelites.movimentacoes` — **razão imutável** (sem UPDATE/DELETE via policy): tipo (`ENTRADA_NF`, `TRANSFERENCIA_SAIDA`, `TRANSFERENCIA_ENTRADA`,
  `DISPENSACAO`, `AJUSTE_INVENTARIO`, `PERDA`, `VENCIMENTO`, `RECALL`, `DEVOLUCAO`), lote, local origem/destino, quantidade (base),
  usuário, documento de referência (NF, solicitação, dispensação), `justificativa`, `criado_em`.
- **Saldo só muda por função transacional** (`SECURITY DEFINER`, `search_path` fixo, `EXECUTE` revogado de `anon`) que grava a movimentação
  e atualiza `saldos_lote_local` na mesma transação, com `SELECT ... FOR UPDATE` no saldo. Nunca atualizar saldo direto do front.

### 3.5 Solicitação UBS → CAF
- `satelites.solicitacoes` + `satelites.solicitacao_itens` (quantidade solicitada / aprovada / separada / recebida, na unidade base).
- Status: `RASCUNHO → ENVIADA → EM_SEPARACAO → LIBERADA → RECEBIDA` (+ `RECEBIDA_COM_DIVERGENCIA`, `CANCELADA`, atendimento parcial).
- `satelites.separacao_itens` — lote escolhido por item, **lote sugerido pelo sistema**, `fora_fefo boolean`, `justificativa`.

---

## 4. Regras funcionais obrigatórias

### 4.1 FEFO com sugestão do sistema e override justificado
- Na separação, o sistema **sugere** os lotes por FEFO: validade mais próxima primeiro, ignorando lotes `QUARENTENA`/`BLOQUEADO_RECALL`/vencidos,
  e respeitando validade mínima remanescente configurável (ex.: não enviar à UBS lote com < 30 dias).
- O estoquista **pode** trocar o lote. Se escolher um lote que **não** é o de validade mais próxima disponível:
  - abrir **popup de alerta** informando o lote com validade mais próxima (número, validade, dias restantes, saldo);
  - **não obriga** a trocar, mas **exige justificativa** (texto mínimo, ex. 10 caracteres) para confirmar;
  - gravar `fora_fefo = true` + justificativa + usuário + lote sugerido; aparece na trilha de auditoria.
- A mesma regra vale na dispensação da UBS.
- Em todas as listagens de lote: **ordenar por validade ascendente** e destacar vencidos / ≤ 30 / ≤ 60 / ≤ 90 dias.

### 4.2 Entrada por NF-e real
- Substituir "Simular Upload de NF-e" por **upload real de XML NF-e 4.0**: ler emitente (CNPJ), número, série, chave de acesso,
  itens (`cProd`, `xProd`, `qCom`, `uCom`, `vUnCom`) e o grupo **`<rastro>`** (`nLote`, `qLote`, `dFab`, `dVal`) de cada item de medicamento.
- Vincular cada item da NF a um `produto_farmacia` (por CATMAT; se não houver vínculo, pedir para o usuário mapear e **lembrar o mapeamento**
  fornecedor+cProd → produto para as próximas notas).
- Converter `uCom` para a unidade base via `produto_embalagens`.
- **Conferência cega**: o conferente digita quantidade/lote/validade contados **sem ver** o que a NF diz; divergência gera ocorrência.
- Rejeitar XML duplicado (mesma chave). Lotes entram em `QUARENTENA` até a conferência ser aprovada; então `ENTRADA_NF` na CAF.

### 4.3 Recebimento na UBS
- UBS confirma item a item o que chegou; divergência → `RECEBIDA_COM_DIVERGENCIA` com ocorrência para a CAF.
- A `TRANSFERENCIA_ENTRADA` só credita o saldo da UBS no recebimento (em trânsito até lá — mostrar "em trânsito").

### 4.4 Dispensação ao paciente (UBS)
- Dispensação por paciente (CPF/CNS), em unidade base (comprimidos), com FEFO da 4.1.
- **Integração com o núcleo (custo do paciente):** cada dispensação chama `public.registrar_evento_jornada(...)`
  (ponto de entrada documentado no `PROTOCOLO-AGENTES.md` §3.1 — **não** escrever em tabela do núcleo), com
  `origem_modulo = 'VIGIA_ESTOQUE'`, valor = quantidade × custo unitário do lote, centro de custo da farmácia da UBS
  e `detalhes` com CATMAT, lote, validade e local. Se faltar centro de custo para alguma UBS em `public.centros_custo`, abra **PEDIDO ao Claude**.

### 4.5 Perfil do medicamento (rastreabilidade)
- Clicar em qualquer medicamento abre o **perfil**: dados CATMAT, embalagens, saldo total e por local (CAF + 9 UBS),
  lotes com validade (ordenados), consumo médio mensal por UBS, e a **linha do tempo** das movimentações:
  de qual NF entrou → para qual UBS foi (qual solicitação) → para qual paciente foi dispensado (mascarar CPF — LGPD).
- Clicar num lote mostra o rastreio completo daquele lote (útil para recall).

### 4.6 O restante para ficar 100%
- **Inventário/contagem** por local (cega), gerando `AJUSTE_INVENTARIO` com justificativa e aprovação de gestor.
- **Estoque mínimo / ponto de pedido** por produto × UBS, com sugestão de quantidade na nova solicitação (consumo médio × cobertura).
- **Alertas de validade** 30/60/90 dias e **baixa de vencidos** (`VENCIMENTO`/`PERDA`, com motivo).
- **Recall**: bloquear um lote em **todos** os locais de uma vez e listar onde há saldo e quem recebeu.
- **Controlados (Portaria 344)**: sinalizar e exigir receita/número na dispensação (livro de registro pode ficar para fase seguinte — registrar no log).
- **Relatórios**: consumo por UBS, curva ABC, perdas por vencimento, divergências de recebimento, dispensações fora de FEFO.
- **BNAFAR/Hórus**: preparar exportação das movimentações no formato exigido pelo Ministério da Saúde (se a especificação não estiver
  acessível, deixe a estrutura de dados pronta e registre a pendência no log).
- Perfis: estoquista CAF, conferente, farmacêutico UBS, gestor municipal.

---

## 5. Entrega em fases (um commit e uma entrada de log por fase)

1. **Segurança** — RLS + policies nas 9 tabelas (seção 1).
2. **Base** — CATMAT (tabela + importador), produtos + embalagens, locais (CAF + 9 UBS), lotes, saldos, razão e funções transacionais. RLS por tenant e por local.
3. **Entrada NF-e** — upload XML real, mapeamento, conferência cega, quarentena → liberação.
4. **Solicitação → separação FEFO (popup + justificativa) → liberação → recebimento na UBS.**
5. **Perfil do medicamento e rastreio de lote.**
6. **Dispensação** + integração `registrar_evento_jornada`.
7. **Inventário, mínimos, alertas, vencidos, recall, relatórios, exportação BNAFAR.**
8. **Remover todos os mocks** do módulo e das APIs de estoque.

## 6. Critérios de aceite (verificar e colar a evidência no log)

- [ ] Advisor de segurança sem `rls_disabled`; nenhuma função nova executável por `anon`.
- [ ] `grep -n "MOCK\|SEED" nucleo/src/app/(modulos)/estoque-central` e APIs de estoque sem dados fictícios; todos os botões com ação real.
- [ ] Busca de medicamento por nome ou código CATMAT retornando itens reais importados.
- [ ] XML real de NF-e 4.0 importado com lote/validade lidos do `<rastro>`; caixa convertida em unidades base.
- [ ] Fluxo ponta a ponta testado: NF entra na CAF → UBS solicita 30 comprimidos → CAF separa (lote sugerido FEFO) →
      escolhe outro lote → popup aparece → sem justificativa não confirma → com justificativa confirma e fica auditado →
      UBS recebe → dispensa 10 comprimidos a um paciente → evento aparece na jornada do paciente no núcleo.
- [ ] Usuário de UBS A não enxerga saldo/solicitações da UBS B (testado com dois usuários reais, via RLS).
- [ ] Saldo nunca negativo; concorrência: duas separações simultâneas do mesmo lote não geram saldo negativo.
- [ ] Perfil do medicamento mostra saldo por local e a trilha NF → UBS → paciente.
- [ ] `npm run lint` e `npx tsc --noEmit` em `nucleo/` sem erros; testes em `tests/` para FEFO, conversão de unidades e parser NF-e.

## 7. Ao terminar cada fase

Entrada no log com: o que foi feito, arquivos tocados, migrations aplicadas, resultado do advisor, evidências do teste e próximo passo.
Qualquer necessidade no schema `public` → **PEDIDO ao Claude** no log, nunca DDL direto.
