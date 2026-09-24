# Prompt para o Antigravity — Módulo Laboratório (LIS), 100% operacional e sem mock

> Cole este documento inteiro como instrução ao Antigravity.
> Autorizado por: Luca (dono do produto), 2026-09-23.
> Arquitetura de referência: `docs/arquitetura/ARQUITETURA_06_LABORATORIO_LIS.md`
> Repositório de referência: `D:\Projetos\getenciamento de laboratorio\senaite.core` (SENAITE LIMS)

---

## 0. Regras vinculantes (antes de qualquer coisa)

1. Leia `PROTOCOLO-AGENTES.md` e `CLAUDE.md`. O protocolo vence este prompt em qualquer conflito.
2. Abra `Vigia-Custos-LOG-Execucao.md`. Entrada `EM EXECUÇÃO` do Claude com menos de 2h → **não mexa no banco**.
3. **DDL somente no schema `satelites`.** Nada em `public`. Precisou de algo do núcleo → **PEDIDO ao Claude** no log.
4. `🔒 INTENÇÃO ... Status: EM EXECUÇÃO` no log antes de cada migration; feche como `CONCLUÍDO`.
5. `list_tables` antes e depois; `get_advisors(security)` depois de cada DDL. **Toda tabela nova nasce com RLS + policy de tenant no mesmo commit.**
   Toda função nova: `SECURITY DEFINER` só quando necessário, `search_path` fixo, `REVOKE EXECUTE ... FROM anon` (o Supabase concede a `anon` por grant direto — revogue explicitamente).
6. Sem `DROP`/`TRUNCATE`/`DROP COLUMN` sem intenção registrada. Evolução aditiva.
7. **Escopo de código autorizado:** `src/modules/`, `tests/`, `nucleo/src/app/(modulos)/laboratorio/**`, `nucleo/src/app/api/laboratorio/**`
   e criação de `nucleo/src/lib/laboratorio/**`. Outros arquivos do `nucleo/` só com PEDIDO no log.
8. Se o trabalho do estoque (`docs/prompts/PROMPT-ANTIGRAVITY-ESTOQUE-CAF-UBS.md`) estiver em andamento, **termine a fase corrente dele antes** e registre a ordem no log.
   A **fase 1 do estoque (RLS nas 9 tabelas do `satelites`) é pré-requisito** deste trabalho.

---

## 1. Diagnóstico do estado atual (o que precisa sumir)

- `nucleo/src/app/(modulos)/laboratorio/page.tsx` (669 linhas): amostras vêm de `initialSamples` fixo em `useState`; ações só mudam estado local; nenhuma chamada ao banco.
- `nucleo/src/app/api/laboratorio/route.ts`: catálogo `CATALOGO_LIMS` hardcoded e ingestão via `HubDespesasService` em memória.
- **Códigos LOINC errados no catálogo atual** (corrigir — não reaproveitar):
  - `1751-7` é **Albumina**, não Hemograma. Hemograma completo = painel **58410-2** (CBC com diferencial, ver também 57021-8).
  - `6598-7` é Troponina T; Troponina I ultrassensível = **89579-7** (conferir no LOINC para o método do equipamento).
  - Não prefixar o código com `LOINC-`; guarde o código puro e o sistema `http://loinc.org` à parte.
- No banco **não existe nenhuma tabela de laboratório** — as do documento de arquitetura nunca foram aplicadas.

**Meta:** zero dado fictício em tela ou API; todo botão com efeito real persistido; fluxo ponta a ponta auditável.

---

## 2. Como usar o SENAITE (decisão de arquitetura)

O SENAITE (`senaite.core`) é **referência de domínio**, não dependência de runtime nesta fase:

- **Porte os conceitos e as máquinas de estado**, não o código: o SENAITE é **GPL-2.0** e o núcleo é TypeScript/Postgres.
  Não copie trechos de código Python para o repo; reimplemente a partir do comportamento. Registre isso no log.
- Onde olhar no repositório de referência:
  - Máquina de estados da **amostra**: `src/senaite/core/profiles/default/workflows/senaite_sample_workflow/definition.xml`
    (`sample_registered → to_be_sampled/scheduled_sampling → sample_due → sample_received → to_be_verified → verified → published`,
    mais `rejected`, `invalid`, `cancelled`, `dispatched`, `disposed`, `to_be_preserved`).
  - Máquina de estados da **análise**: `.../senaite_analysis_workflow/definition.xml`
    (`registered → unassigned → assigned → to_be_verified → verified → published`, mais `retracted`, `rejected`, `cancelled`, `locked`).
  - Rejeição, duplicatas e amostras de referência (controle de qualidade): `senaite_rejectanalysis_workflow`, `senaite_duplicateanalysis_workflow`,
    `senaite_referenceanalysis_workflow`, `senaite_referencesample_workflow`.
  - Mapas de trabalho (bancada): `senaite_worksheet_workflow`.
  - Entidades: `src/bika/lims/content/` — `analysisservice.py`, `analysiscategory.py`, `analysisprofile.py`, `analysisspec.py` / `dynamic_analysisspec.py`
    (faixas de referência), `sampletype`, `container.py`, `preservation.py`, `method.py`, `calculation.py` (analitos calculados),
    `instrument*.py` (calibração, certificação, manutenção), `referencesample.py`, `reflexrule.py`, `rejectanalysis.py`.
  - Interface com analisadores: `src/senaite/core/astm/` (`consumer.py`, `importer.py`) — modelo para o importador ASTM/HL7.
- Regras de negócio importantes do SENAITE a reproduzir:
  - **Retratação (`retract`)** de resultado já submetido cria **nova análise** (reteste) e preserva a original — nunca sobrescrever resultado.
  - **Verificação por usuário diferente** de quem submeteu (quatro olhos), com configuração de exceção auditada.
  - Amostra só vira `verified`/`published` quando **todas** as análises não canceladas estiverem verificadas.
  - Faixas de referência por **sexo e idade**, com faixa de alerta ("warn") e faixa crítica (pânico).

Integração com um SENAITE real rodando (Docker + JSON API) fica **fora deste escopo**; deixe a camada de persistência atrás de uma
interface (`nucleo/src/lib/laboratorio/`) para que isso seja possível depois. Registre no log como fase futura.

---

## 3. Bases de dados de referência a vincular

| Base | Uso | Fonte |
|---|---|---|
| **SIGTAP** (SUS) | Código de procedimento e valor SUS de cada exame (grupo **02.02 — Diagnóstico em laboratório clínico**). Base para faturamento BPA/AIH e custo. | Local: `references/SIGTAP/tabelas/TabelaUnificada_*.zip` — use a competência mais recente (hoje `202607`). Importar `tb_procedimento` e relacionadas; importador idempotente por competência. |
| **LOINC** | Código do analito/painel em cada resultado e no FHIR (`Observation.code`, `DiagnosticReport.code`). | loinc.org (exige conta gratuita e aceitação de licença — **peça ao Luca para baixar**; não aceite termos em nome dele). Enquanto não houver o arquivo, cadastre manualmente só os códigos dos exames do catálogo inicial, conferidos um a um. |
| **TUSS** | Código para convênios/saúde suplementar (opcional no piloto SUS). | ANS — deixe a coluna preparada. |
| **Pacientes/episódios** | Identidade do paciente e episódio de cuidado. | **Somente leitura** do núcleo; se precisar de `SELECT` em `public.pacientes`/`public.episodios` além do já liberado, abra PEDIDO ao Claude. |

Mapeamento exame ↔ SIGTAP ↔ LOINC fica em tabela própria (`satelites.lab_servicos_codigos`), N:N, com vigência.

---

## 4. Modelo de dados (schema `satelites`, todas com `tenant_id` + RLS)

Use a arquitetura 06 como ponto de partida, **corrigida** para o modelo do SENAITE:

- **Catálogo**
  - `lab_categorias` (Bioquímica, Hematologia, Imunologia, Microbiologia, Urinálise, Parasitologia…)
  - `lab_tipos_amostra` (sangue total, soro, plasma, urina, fezes, LCR, swab) + `lab_recipientes` (cor de tampa, aditivo: EDTA, citrato, gel/seco, fluoreto, volume)
  - `lab_metodos`, `lab_equipamentos` (+ calibrações, manutenções, validade de certificação; equipamento vencido **não** pode liberar resultado)
  - `lab_servicos` (= *AnalysisService*: nome, categoria, tipo de amostra, recipiente, método, unidade, casas decimais, prazo em minutos,
    custo de reagente e de bancada por teste, se é calculado + fórmula)
  - `lab_perfis` (= *AnalysisProfile*: painéis, ex. Lipidograma = CT + HDL + LDL calc + TG) e `lab_perfil_servicos`
  - `lab_faixas_referencia` (= *AnalysisSpec*: por serviço, sexo, idade mín/máx em dias, faixa normal, faixa de alerta, **limiar de pânico** inferior/superior, texto)
  - `lab_regras_reflexas` (ex.: TSH alterado → incluir T4 livre), opcional nesta fase
- **Operação**
  - `lab_pedidos` (paciente, episódio, solicitante + CRM/UF, unidade solicitante, prioridade rotina/urgente, indicação clínica, CID, status)
  - `lab_pedido_itens` (serviço ou perfil solicitado)
  - `lab_amostras` (código de barras único, tipo, recipiente, coletor, data/hora da coleta, recebida por, data/hora do recebimento, estado conforme workflow SENAITE, motivo de rejeição)
  - `lab_analises` (1 por serviço × amostra: estado do workflow, equipamento, método, analista, resultado bruto, resultado numérico, unidade,
    flag `normal|alerta|panico|fora_faixa`, `reteste_de` para retratações, submetido_por/em, verificado_por/em)
  - `lab_mapas_trabalho` (= *Worksheet*) e posições (amostras, brancos, controles, duplicatas)
  - `lab_controles_qualidade` (amostras de referência, lote do controle, valor esperado, DP) + resultados para **Levey-Jennings e regras de Westgard** (1-2s alerta, 1-3s e 2-2s rejeição)
  - `lab_notificacoes_panico` (análise, médico notificado, meio, data/hora, quem notificou, **confirmação de leitura** — RDC exige registro)
  - `lab_laudos` (pedido, versão, JSON **FHIR R4 `DiagnosticReport` + `Observation`s**, PDF, hash SHA-256 do conteúdo, liberado por + registro no conselho (CRF/CRBM/CRM), data/hora; **laudo retificado gera nova versão**, nunca edita)
  - `lab_eventos` — trilha imutável de toda transição de estado (quem, quando, de→para, motivo)
- **Transições de estado só por funções no banco** (uma por transição: `lab_receber_amostra`, `lab_submeter_resultado`, `lab_verificar_analise`,
  `lab_retratar_analise`, `lab_rejeitar_amostra`, `lab_liberar_laudo`…) que validam o estado atual, o papel do usuário e gravam `lab_eventos`.
  O front nunca faz `UPDATE` direto de estado.

---

## 5. Fluxo funcional ponta a ponta

1. **Pedido** — criado no módulo Gestão Clínica/PEP **ou** na recepção do laboratório (pedido em papel digitado). Seleção por serviço ou perfil,
   busca por nome, SIGTAP ou LOINC. Mostra preparo do paciente (jejum etc.).
2. **Coleta** — `lab_coletor_amostras` confere identidade (2 identificadores: nome + data de nascimento/CNS), sistema gera **uma amostra por
   tipo de recipiente necessário** (agrupando serviços compatíveis), imprime **etiqueta com código de barras** (Code128; página de impressão
   com layout de etiqueta de tubo), registra data/hora e coletor.
3. **Recebimento/triagem** — leitura do código de barras (campo com foco e suporte a leitor USB tipo teclado), checagem de integridade;
   rejeição com motivo padronizado (hemolisada, lipêmica, coagulada, volume insuficiente, identificação incorreta, tubo errado) → nova coleta.
4. **Bancada** — montagem de mapa de trabalho por equipamento/setor, inclusão de controles. Resultados por:
   - digitação manual (urina, parasitológico, microbiologia), com teclado otimizado;
   - **importação de arquivo do analisador** (CSV/ASTM E1394 — inspire-se em `senaite/core/astm/importer.py`; comece com um parser ASTM
     para resultados `R|` com testes unitários e um CSV genérico mapeável por equipamento).
   - analitos calculados (ex.: LDL por Friedewald/Martin, TFG por CKD-EPI 2021) calculados automaticamente.
5. **Validação técnica** — flags automáticos por faixa (sexo/idade), **delta-check** contra o último resultado do paciente (limite por serviço),
   interferentes; controle de qualidade do dia fora de Westgard **bloqueia** a liberação dos resultados daquela corrida.
6. **Valor de pânico** — ao submeter, se crítico: cria `lab_notificacoes_panico`, alerta em tempo real (Supabase Realtime) na tela do
   laboratório e do PEP; a liberação do laudo exige registrar **para quem, como e quando** foi comunicado.
7. **Verificação e liberação** — `lab_bioquimico_liberador` (usuário ≠ quem submeteu) verifica; liberação gera laudo PDF + FHIR R4 com hash;
   laudo parcial permitido para urgências (status `laudado_parcial`).
8. **Entrega** — laudo aparece no PEP do paciente; evento `laboratorio.laudo_liberado` para o módulo de mensageria (envio de link seguro,
   **nunca** o PDF aberto por WhatsApp); consulta de laudo por QR code com verificação do hash.
9. **Custo e faturamento** — a cada análise **verificada**, emitir custo ao núcleo via `public.registrar_evento_jornada(...)`
   (`origem_modulo = 'VIGIA_LAB'`, valor = reagente + bancada do serviço, centro de custo do laboratório, `detalhes` com SIGTAP, LOINC,
   pedido, amostra, equipamento). Nunca escrever em tabela do núcleo. Idempotente (reteste não duplica custo; retratação estorna se aplicável).
   Faltou centro de custo `CC-LAB` em `public.centros_custo` → PEDIDO ao Claude. Gerar também a produção SIGTAP do mês (base para BPA).
10. **Gestão** — painel com TAT (tempo coleta→laudo) por exame e por prioridade, fila por estado, rejeições por motivo, pânicos e tempo de
    comunicação, CQ (gráfico Levey-Jennings por controle/analito), produção SIGTAP e custo por exame.

---

## 6. Perfis e RLS

Os quatro papéis da arquitetura 06 (`lab_coletor_amostras`, `lab_tecnico_analista`, `lab_bioquimico_liberador`, `lab_gestor_admin`)
aplicados **no banco** (RLS e checagem nas funções de transição), não só escondendo botão. Médico solicitante lê apenas laudos dos
próprios pacientes/episódios. Paciente nunca acessa por esta tela. Todo acesso a laudo é registrado (LGPD — dado sensível de saúde).

---

## 7. Entrega em fases (um commit + uma entrada de log por fase)

1. **Catálogo e referências** — tabelas de catálogo, importador SIGTAP (grupo 02.02) a partir dos zips locais, cadastro dos exames iniciais
   (hemograma, glicose, ureia, creatinina, TGO, TGP, colesterol total e frações, triglicerídeos, TSH, T4L, PCR, troponina I, potássio, sódio,
   urina tipo 1, parasitológico de fezes, beta-hCG) com **LOINC conferido**, faixas de referência por sexo/idade e limiares de pânico.
2. **Pedido → coleta → etiqueta → recebimento/rejeição**, com workflow de amostra.
3. **Bancada**: mapas de trabalho, digitação, analitos calculados, importador ASTM/CSV.
4. **Validação**: faixas, delta-check, CQ com Westgard, verificação quatro-olhos, retratação/reteste.
5. **Pânico** com notificação em tempo real e registro de comunicação.
6. **Laudo** PDF + FHIR R4 validado, versão/retificação, hash, QR de verificação, exibição no PEP.
7. **Custo e produção**: `registrar_evento_jornada`, produção SIGTAP mensal, painel de gestão.
8. **Remoção total dos mocks** da página e das APIs; menu lateral apontando para telas reais.

---

## 8. Critérios de aceite (evidência no log)

- [ ] Advisor sem `rls_disabled`; nenhuma função nova executável por `anon`.
- [ ] `initialSamples`, `CATALOGO_LIMS` e qualquer array fixo de dados removidos; todos os botões com efeito persistido.
- [ ] Nenhum código `LOINC-` prefixado; LOINC de cada exame conferido (tabela de conferência colada no log).
- [ ] Procedimentos SIGTAP do grupo 02.02 importados da competência mais recente, com contagem colada no log.
- [ ] Teste ponta a ponta com dado de teste: pedido de hemograma + potássio + lipidograma → 2 tubos (roxo e amarelo) gerados com etiquetas →
      um tubo rejeitado por hemólise e recoletado → potássio 7,0 mEq/L dispara pânico e bloqueia liberação até registrar a comunicação →
      técnico A submete, técnico A **não** consegue verificar, bioquímico B verifica → laudo liberado com FHIR R4 válido e hash →
      laudo visível no PEP → custo do exame aparece na jornada do paciente no núcleo.
- [ ] Retratar um resultado verificado cria reteste e mantém o original no histórico; laudo retificado vira versão 2.
- [ ] CQ fora de Westgard 1-3s bloqueia liberação da corrida.
- [ ] Parser ASTM e cálculos (LDL, TFG) com testes em `tests/`.
- [ ] `npm run lint` e `npx tsc --noEmit` em `nucleo/` sem erros.

## 9. Ao terminar cada fase

Entrada no log com o que foi feito, arquivos tocados, migrations aplicadas, resultado do advisor, evidências e próximo passo.
Qualquer necessidade no schema `public` → **PEDIDO ao Claude** no log, nunca DDL direto.
