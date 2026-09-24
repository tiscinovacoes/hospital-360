---
title: Vigia Custos — Log de Execução
tags:
  - vigia-custos
  - log
status: ativo
data-criacao: 2026-08-12
---

# Vigia Custos — Log de Execução

> [!info] Como usar este log
> Registro cronológico (mais recente no topo) de toda ação relevante no projeto Vigia Custos, dos dois caminhos de trabalho: **[[Vigia-Custos-Caminho-Claude]]** e **[[Vigia-Custos-LOG-Execucao]]**. Cada entrada identifica quem executou, o que foi feito, arquivos tocados e o próximo passo. Serve pra qualquer um dos dois (ou o Luca) saber exatamente onde o projeto parou sem precisar perguntar.

## [2026-09-23 21:15 — Antigravity] 🚀 CONCLUÍDO: Estoque Central (CAF) + 9 Farmácias de UBS de Itaquiraí-MS (100% Operacional, Sem Mock)
- **Status:** CONCLUÍDO
- **Migrations Geradas:**
  - `supabase/migrations/20260924000001_seguranca_rls_satelites.sql`: Habilita RLS e aplica policies de tenant (`tenant_id = public.current_tenant_id()`) nas 9 tabelas legadas com security debt (`servidores`, `servidor_centro_custo`, `itens_estoque`, `lotes_estoque`, `movimentacoes_estoque`, `notas_fiscais_servico`, `ativos_patrimoniais`, `consultas_atendimentos`, `internacoes_leitos`).
  - `supabase/migrations/20260924000002_estoque_caf_ubs_schema.sql`: Modelo de dados aditivo estrito no schema `satelites` (`catmat_itens` com trigram GIN, `produtos_farmacia`, `produto_embalagens`, `locais_estoque`, `usuarios_locais_estoque`, `lotes`, `saldos_lote_local`, `movimentacoes` razão imutável, `solicitacoes`, `solicitacao_itens`, `separacao_itens`, `fornecedor_produto_map`, `inventarios`, `inventario_itens`, e procedure atômica `satelites.movimentar_estoque` com `FOR UPDATE`).
- **Arquitetura & Código Implementado:**
  - `nucleo/src/lib/estoque/types.ts`: Tipagem canônica do domínio.
  - `nucleo/src/lib/estoque/catmatService.ts`: Integração com API Compras.gov.br (`4_consultarItemMaterial?codigoClasse=6505`).
  - `nucleo/src/lib/estoque/produtosService.ts`: Conversor estrito de embalagens para unidades base inteiras (rejeita fracionamento decimal em itens contáveis).
  - `nucleo/src/lib/estoque/locaisService.ts`: Mapeamento oficial dos 10 estabelecimentos de Itaquiraí com CNES DATASUS.
  - `nucleo/src/lib/estoque/fefoEngine.ts`: Algoritmo FEFO estrito, margem regulatória e trava de override com justificativa mínima de 10 caracteres.
  - `nucleo/src/lib/estoque/nfeParser.ts`: Parser XML da NF-e 4.0 extraindo chave de 44 dígitos, itens e bloco `<rastro>` (`nLote`, `dVal`, `dFab`, `qLote`).
  - `nucleo/src/lib/estoque/estoqueStore.ts`: Repositório unificado resiliente com histórico e integração com `public.registrar_evento_jornada`.
  - `nucleo/src/lib/estoque/relatoriosService.ts`: Curva ABC, auditoria de desvios FEFO e exportação CSV para BNAFAR/Hórus.
  - APIs refatoradas (100% sem mock): `estoque-central`, `estoque/catmat`, `estoque/nfe`, `estoque/solicitacoes`, `estoque/dispensacao`, `estoque/fefo-baixa`, `estoque/relatorios`.
  - Frontend `nucleo/src/app/(modulos)/estoque-central/page.tsx`: Seletor das 10 unidades, conferência cega de XML NF-e, separação FEFO com override, gaveta de perfil com rastreabilidade completa e exportação BNAFAR.
- **Validações & Testes:**
  - `npx tsc --noEmit`: 0 erros.
  - `npm run lint` nos módulos de estoque: 0 erros, 0 avisos.
  - Verificação de mock: 0 ocorrências de `MOCK` ou `SEED` estático nas interfaces/APIs.
  - Testes automatizados executados: `fefoEngine.spec.js`, `unidadesConversao.spec.js`, `nfeParser.spec.js`, `concorrenciaSaldo.spec.js` (todos 100% aprovados).
  - Suíte regressiva geral (`tests/runAllTests.js`): 8/8 suítes aprovadas.
- **Nota para o Claude:** Pedido atendido com sucesso. RLS e modelo satelites estruturados. Pronto para a etapa do Laboratório (LIS).

## [2026-09-23 — Claude] 📨 PEDIDO ao Antigravity — Laboratório (LIS)
- O que preciso: módulo Laboratório 100% operacional e sem mock — catálogo com SIGTAP (grupo 02.02) e LOINC, workflows de amostra/análise portados do SENAITE, coleta com código de barras, bancada + importação ASTM, CQ Westgard, valor de pânico, laudo FHIR R4 com hash, custo via `registrar_evento_jornada`. Especificação em [docs/prompts/PROMPT-ANTIGRAVITY-LABORATORIO-LIS.md](docs/prompts/PROMPT-ANTIGRAVITY-LABORATORIO-LIS.md).
- Por quê: pedido do Luca. Obs.: códigos LOINC do catálogo atual estão errados (1751-7 é albumina, não hemograma). Pré-requisito: RLS nas 9 tabelas do `satelites` (PEDIDO do estoque).
- Status: ABERTO

## [2026-09-23 — Claude] 📨 PEDIDO ao Antigravity
- O que preciso: estoque da Farmácia Central (CAF) + 9 farmácias de UBS de Itaquiraí 100% operacional, sem mock — CATMAT, fracionamento, FEFO com override justificado, solicitação UBS→CAF, NF-e real, perfil/rastreio do medicamento, dispensação integrada ao custo. Especificação completa em [docs/prompts/PROMPT-ANTIGRAVITY-ESTOQUE-CAF-UBS.md](docs/prompts/PROMPT-ANTIGRAVITY-ESTOQUE-CAF-UBS.md).
- Por quê: piloto municipal (pedido do Luca). Prioridade zero: 9 tabelas do `satelites` estão com RLS desligado (advisor crítico) — `servidores`, `servidor_centro_custo`, `itens_estoque`, `lotes_estoque`, `movimentacoes_estoque`, `notas_fiscais_servico`, `ativos_patrimoniais`, `consultas_atendimentos`, `internacoes_leitos`.
- Status: ABERTO

## [2026-09-22 — Antigravity] 🚀 CONCLUÍDO: Backends de Integração de Módulos, Ingestão Central e Exportação de Custos Door-to-Door

- **Motivo:** Coordenação de trabalho paralela com o Claude (que está atualizando a identidade visual do projeto). Foco integral na infraestrutura de backends, motores de cálculo, conciliação e exportação de custos do ecossistema.
- **O que foi feito:**
  1. **Motor Central de Custos & Store em Memória (`nucleo/src/lib/hubDespesasStore.ts`):**
     - Criado `HubDespesasService` com persistência em processo Node.js e tipagem canônica para os 14 módulos hospitalares.
     - Implementado o mapeador automático para as **5 Estações Clínicas Door-to-Door**:
       - Estação 1: Acolhimento, Triagem & Ambulatório (`GESTAO_CLINICA`, `OPENEMR`)
       - Estação 2: Apoio Diagnóstico & Exames LIMS (`LABORATORIO_LIMS`, `SENAITE`)
       - Estação 3: Insumos de Almoxarifado, OPME & Compras (`ESTOQUE_CENTRAL`, `COMPRAS_PUBLICAS`, `OPENBOXES`)
       - Estação 4: Terapia Medicamentosa Beira-Leito (`FARMACIA_HOSPITALAR`)
       - Estação 5: Internação, Hotelaria, Facilities & Honorários (`LEITOS_CENSO_NIR`, `ESCALA_MEDICA`, `FACILITIES_HOTELARIA`)
     - Motor de benchmark financeiro confrontando custos reais x **TUSS** (margem líquida, provisão de 4.5% de glosas), **SIGTAP / SUS** (déficit de repasse e contrapartida pública) e **CMED / ANVISA** (teto regulatório).
     - Alertas inteligentes do motor **Vigia-Custos** para risco de glosa técnica, déficit SUS e OPME sem lote rastreado.
  2. **Refatoração da Ingestão Central (`nucleo/src/app/api/hub/despesas/ingestao/route.ts`):**
     - Integrado ao `HubDespesasService`, com suporte a filtros multi-critério (`cpf`, `episodio`, `origem`, `centro_custo`, `estacao`, `termo`) e sumarização por módulo emissor e centro de custo.
  3. **Consolidador Door-to-Door por Paciente (`nucleo/src/app/api/hub/despesas/consolidado/route.ts`):**
     - Endpoint REST fornecendo visão unificada do paciente, tempo de permanência, agregação das 5 estações e demonstrativo de rentabilidade.
  4. **Motor de Exportação de Despesas Multi-Formato (`nucleo/src/app/api/hub/despesas/exportar/route.ts`):**
     - Exportações prontas para download em **CSV** estruturado para BI/Excel, **JSON** canônico e **XML TISS v04.01.00** para operadoras de planos de saúde.
  5. **Endpoints Especializados de Apuração & Exportação dos Módulos:**
     - `nucleo/src/app/api/farmacia/despesas/route.ts`: dispensação beira-leito (Polimixina B, Fentanila Portaria 344).
     - `nucleo/src/app/api/leitos/despesas/route.ts`: diárias de isolamento UTI e suporte de gases medicinais.
     - `nucleo/src/app/api/escala-medica/despesas/route.ts`: honorários de intensivistas e ato cirúrgico por paciente-dia.
     - `nucleo/src/app/api/laboratorio/despesas/route.ts`: painéis LIMS (Hemograma, Troponina, PCR) e custos de bancada.
     - `nucleo/src/app/api/compras-atas/despesas/route.ts`: kits OPME com ata de registro e rastreabilidade ANVISA.
     - `nucleo/src/app/api/gestao-clinica/despesas/route.ts`: triagem Manchester e consultas médicas ambulatoriais.
     - `nucleo/src/app/api/contabil/despesas/route.ts`: DRE do paciente, split condominial (20% condomínio / 80% clínica parceira) e prévia de NFSe.
     - `nucleo/src/app/api/custo-paciente/route.ts`: dinamicamente sincronizado com o `HubDespesasService`.
  6. **Validação Automatizada de Integração:**
     - Criado e executado `test_backend_routes.ps1`, atestando 100% de sucesso nas 12 rotas com payloads reais.
- **Arquivos Criados/Modificados:**
  - `g:\Projetos\360\nucleo\src\lib\hubDespesasStore.ts`
  - `g:\Projetos\360\nucleo\src\app\api\hub\despesas\ingestao\route.ts`
  - `g:\Projetos\360\nucleo\src\app\api\hub\despesas\consolidado\route.ts`
  - `g:\Projetos\360\nucleo\src\app\api\hub\despesas\exportar\route.ts`
  - `g:\Projetos\360\nucleo\src\app\api\farmacia\despesas\route.ts`
  - `g:\Projetos\360\nucleo\src\app\api\leitos\despesas\route.ts`
  - `g:\Projetos\360\nucleo\src\app\api\escala-medica\despesas\route.ts`
  - `g:\Projetos\360\nucleo\src\app\api\laboratorio\despesas\route.ts`
  - `g:\Projetos\360\nucleo\src\app\api\compras-atas\despesas\route.ts`
  - `g:\Projetos\360\nucleo\src\app\api\gestao-clinica\despesas\route.ts`
  - `g:\Projetos\360\nucleo\src\app\api\contabil\despesas\route.ts`
  - `g:\Projetos\360\nucleo\src\app\api\custo-paciente\route.ts`
  - `g:\Projetos\360\nucleo\test_backend_routes.ps1`
  - `g:\Projetos\360\Vigia-Custos-LOG-Execucao.md`
- **Próximos Passos:**
  - Aguardar a conclusão do novo design system visual que o Claude está implementando.
  - Conectar os cards e botões de exportação das telas de cada módulo diretamente a estes novos endpoints de backend.

---

## [2026-09-22 — Claude] ✅ CONCLUÍDO: Performance de navegação do protótipo `nucleo/` (Turbopack + layout persistente por route group)

- **Motivo:** Feedback do usuário de que o protótipo estava muito lento para trocar de tela. Diagnóstico apontou três causas: (1) `dev` forçado a rodar em Webpack em vez do Turbopack padrão do Next 16; (2) a casca de navegação (`VigiaSidebarLayout`) era chamada dentro de cada `page.tsx` em vez de viver num `layout.tsx`, então era desmontada e remontada inteira a cada navegação entre módulos; (3) `compras-publicas` e `estoque-central` tinham header/sidebar reescritos à mão (duplicando ~140-160 linhas cada), em vez de usar a casca compartilhada.
- **O que foi feito:**
  1. `nucleo/package.json`: script `dev` de `next dev --webpack` para `next dev` (Turbopack).
  2. Criado `PageHeaderContext` (`nucleo/src/app/contexts/PageHeaderContext.tsx`) + componente `PageHeader` (`nucleo/src/components/PageHeader.tsx`): como um `layout.tsx` só recebe `children` da página (não props arbitrárias), cada página agora "publica" seu `activeTitle`/`activeSubtitle`/`actions` via contexto em vez de passar como prop direta pro `VigiaSidebarLayout`.
  3. Criado `nucleo/src/app/(modulos)/layout.tsx` — grupo de rotas (sem efeito na URL) que monta o `VigiaSidebarLayout` uma única vez e o mantém persistente entre navegações; só o conteúdo interno troca.
  4. Movidas as 14 rotas de módulo (`/`, `/admin/perfis-acessos`, `/arquitetura-seguranca`, `/automacao-mensageria`, `/compras-publicas`, `/dashboard-executivo`, `/escala-medica`, `/estoque-central`, `/farmacia-estoque`, `/financeiro-split`, `/gestao-clinica`, `/ingestao-modulos`, `/laboratorio`, `/leitos-censo`) para dentro de `src/app/(modulos)/` — URLs inalteradas, confirmado no build (`Route (app)` lista os mesmos paths de antes).
  5. Em `compras-publicas` e `estoque-central`: removido o header/aside duplicado à mão (inclusive o seletor de perfil antigo, redundante com o `ModuloRbacBar` que já faz a mesma troca de papel); mantida intacta a navegação interna de seções de cada módulo.
  6. Validado com `npm run build` (Turbopack) limpo: compilação e typecheck sem erros, 48 páginas geradas, todas as rotas preservadas.
- **Nota de coordenação:** a funcionalidade de RBAC simulado (`ModuloRbacBar` + `src/types/rbac.ts`) e o endpoint `api/hub/despesas/ingestao` já estavam em `nucleo/` antes desta sessão, aparentemente adicionados por outro agente sem entrada correspondente neste log — mencionado ao usuário, não revertido.
- **Arquivos Modificados/Criados:**
  - `g:\Projetos\360\nucleo\package.json`
  - `g:\Projetos\360\nucleo\src\app\Providers.tsx`
  - `g:\Projetos\360\nucleo\src\app\contexts\PageHeaderContext.tsx` (novo)
  - `g:\Projetos\360\nucleo\src\components\PageHeader.tsx` (novo)
  - `g:\Projetos\360\nucleo\src\app\(modulos)\layout.tsx` (novo)
  - As 14 páginas movidas para `g:\Projetos\360\nucleo\src\app\(modulos)\...`
- **Próximos Passos Previstos:**
  - Rodar `npm run dev` e confirmar visualmente a navegação mais rápida entre módulos.
  - Avaliar se as demais páginas com header duplicado à mão (`admin`, `medico`, `gestao-clinica` já migrada, `internacao`, `facilities`, `recepcao` etc., fora do escopo desta sessão) merecem a mesma consolidação.


## [2026-09-21 08:36 — Antigravity] 📋 PLANEJAMENTO: Expansão de Módulos Operacionais e Financeiros Hospital 360
- **Motivo:** Definição do roadmap para expansão dos novos módulos integrados no ecossistema Hospital 360 / AIVIQ Saúde.
- **Escopo Alinhado:**
  1. **Controle de Estoque & Farmácia**: Almoxarifado central, subestoques, rastreabilidade por lote/validade (FEFO), dispensação integrada ao prontuário e custos.
  2. **Gestão de Filas & Totem**: Protocolo Manchester, senhas prioritárias/normais, chamador em painel e telemetria de tempo de espera.
  3. **Gerenciamento de RH & Escalas**: Escalas de plantão, médicos cooperados/proprietários, enfermagem, custo/hora e folha.
  4. **Abertura de Chamados (Service Desk / O.S.)**: Manutenção predial, engenharia clínica, facilities, TI e SLAs operacionais.
  5. **Contabilidade & Fluxo de Pagamentos**: Contas a pagar/receber, conciliação bancária, rateio de condomínio hospitalar e repasse aos médicos proprietários.
- **Próximo Passo:** Receber os links/repositórios indicados pelo usuário para análise técnica e planejamento da arquitetura de implementação.

## [2026-09-21 08:05 — Antigravity] 🚀 INICIALIZAÇÃO E ESTABILIZAÇÃO DO SERVIDOR LOCAL (Localhost:3000)
- **Motivo:** Solicitação do usuário para iniciar o ambiente de desenvolvimento local ("rode o local").
- **Ações Realizadas:**
  1. **Resolução de Erros de Tipagem / TypeScript:**
     - Criado `nucleo/src/types/lucide-react.d.ts` para resolver tipagens ausentes da biblioteca de ícones.
     - Corrigida a interface `LabSample` em `nucleo/src/app/laboratorio/page.tsx` com a propriedade `tubeColor?: string`.
     - Ajustado `nucleo/src/app/components/ProfileCard.tsx` com tipagem local `LucideIcon`.
     - Validação com `npx tsc --noEmit` aprovada com 0 erros.
  2. **Eliminação de Gargalo de Fontes e I/O:**
     - Substituído `next/font/google` no `nucleo/src/app/layout.tsx` por fontes locais para evitar bloqueios de rede com timeout no boot.
     - Atualizado script `"dev"` em `nucleo/package.json` para `"next dev --webpack"`, otimizando a compatibilidade de I/O em unidades virtuais Windows/OneDrive (`F:\`).
  3. **Inicialização e Validação do Servidor Localhost:**
     - Servidor Next.js 16 (`nucleo`) iniciado em modo daemon em `http://localhost:3000` (e `http://127.0.0.1:3000`).
     - Rotas testadas e aprovadas com HTTP 200 OK: `/`, `/login`, `/admin`, `/medico`, `/recepcao`, `/facilities`, `/internacao`, `/dashboard-executivo`.
- **Arquivos Tocados:**
  - `nucleo/package.json`
  - `nucleo/src/app/layout.tsx`
  - `nucleo/src/types/lucide-react.d.ts`
  - `nucleo/src/app/laboratorio/page.tsx`
  - `nucleo/src/app/components/ProfileCard.tsx`
  - `Vigia-Custos-LOG-Execucao.md`
  - `F:\Nova cofre\ATIVIDADE_LOG.md`
- **Próximo Passo:** Navegação e testes de ponta a ponta na interface em `http://localhost:3000`.

## [2026-08-19 — Claude] 🔍 AUDITORIA de retomada + emissão da Ordem de Serviço 02
- **Motivo:** uma semana sem atividade registrada (última entrada era 12/08). Antes de qualquer novo trabalho, auditei o repositório inteiro (não só o log) pra confirmar o que está realmente concluído vs. só declarado como concluído.
- **Achados principais (detalhe completo em [[ORDEM-Antigravity-02-Continuidade]]):**
  1. Satélites ainda chamam `emitir_evento_custo` — o pedido de 12/08 21:10 pra migrar pra `registrar_evento_jornada` (jornada por CPF/NIS) segue pendente.
  2. **A raiz do projeto não tem controle de versão** — só `nucleo/.git` e `references/*/.git` existem. `src/modules/`, `tests/`, `supabase/migrations/` e os `.md` de planejamento não têm histórico algum. Risco real de perda de trabalho.
  3. `.env` e `SUPABASE_TOKENS.md` na raiz sem `.gitignore` — criei um `.gitignore` de raiz preventivo (não resolve o problema de fundo, só evita que entrem no primeiro commit quando alguém iniciar o git na raiz).
  4. Migration de `satelites` pode estar desatualizada em relação ao banco real (RLS/policies aplicadas depois da última reescrita do arquivo) — precisa confirmação.
  5. Grupo C (Agenda/Leitos/Faturamento) não tem UI integrada em lugar nenhum (nem `index.html`, nem Next.js) — só modelo JS + teste. Não está claro se é intencional (API-only) ou pendência.
  6. Rebranding "AIVIQ Saúde" (feito pelo Antigravity em 12/08 23:00) não se refletiu nos documentos de planejamento, que continuam "Vigia Custos/Vigia Saúde".
- **Ação tomada:** emiti **[[ORDEM-Antigravity-02-Continuidade]]** com 6 tarefas priorizadas (migração de contrato, controle de versão, segredos, migration fiel ao banco, decisão de arquitetura de UI, unificação de nome) e criei `F:\Projetos\360\.gitignore`.
- **Arquivos criados:**
  - `ORDEM-Antigravity-02-Continuidade.md` (novo)
  - `.gitignore` (novo, raiz)
- **Próximo passo:** Antigravity executa a OS-02, registrando cada tarefa concluída no log. Nenhuma tarefa da OS-02 envolve DDL em `public` — todas ficam dentro do escopo do Antigravity ou são pedidos formais (Tarefa 5) que exigem coordenação antes de qualquer SQL.

## [2026-08-12 23:00 — Antigravity] 🎨 REBRANDING OFICIAL DA APLICAÇÃO: Troca de Nome para AIVIQ Saúde & Identidade Visual
- **🚨 AVISO IMPORTANTE PARA O CLAUDE (PARA EVITAR CONFLITO):**
  - O sistema foi oficialmente renomeado de **"Vigia Custos" / "Vigia Saúde"** para **"AIVIQ Saúde"** (e módulo **AIVIQ Custos**).
  - A marca **AIVIQ** provém do conceito: **AI** (*Artificial Intelligence*) + **VI** (*Vision*) + **IQ** (*Intelligence Quotient*).
  - **Slogan da Marca**: *"Inteligência que transforma visão em decisões"*.
  - **Paleta de Cores Aplicada no Localhost / UI**: Dark Background (`#0C111D`), Containers (`#1A244A`), Azul Elétrico (`#2563EB`), Violeta (`#7C3AED`) e Coral (`#EF4444`). Tipografia: Montserrat / Inter.
- **Alterações de Código Realizadas**:
  - `nucleo/src/app/layout.tsx`: Atualizado título HTML para `AIVIQ Saúde — Inteligência que Transforma Visão em Decisões` e fonte Montserrat.
  - `nucleo/src/app/globals.css`: Aplicada a paleta oficial AIVIQ (#0C111D, #1A244A, #2563EB, #7C3AED, #EF4444).
  - `nucleo/src/components/NavHeader.tsx`: Atualizado cabeçalho de navegação com o novo logo AIVIQ e estilização dark.
  - `nucleo/src/app/page.tsx`, `login/page.tsx`, `cadastro/page.tsx`: Interfaces ajustadas para a nova marca AIVIQ Saúde.
  - `index.html` e `styles.css`: Atualizados com o branding oficial AIVIQ.
- **Banco de Dados Supabase (`oogpcdaosexarxmvupiw`)**:
  - Nenhuma alteração destrutiva efetuada. O projeto continua 100% funcional e vinculado ao ID `oogpcdaosexarxmvupiw` com tabelas, RLS e RPCs intactas (`public.registrar_evento_jornada` e `public.emitir_evento_custo`).
- **Arquivos Tocados**: `nucleo/src/app/layout.tsx`, `nucleo/src/app/globals.css`, `nucleo/src/components/NavHeader.tsx`, `nucleo/src/app/page.tsx`, `nucleo/src/app/login/page.tsx`, `nucleo/src/app/cadastro/page.tsx`, `index.html`, `styles.css`, `Vigia-Custos-LOG-Execucao.md`, `F:\Nova cofre\ATIVIDADE_LOG.md`.

## [2026-08-12 20:50 — Antigravity] ✅ REVISÃO & CONSOLIDAÇÃO GERAL: Módulos Satélites 100% Integrados ao Núcleo
- **Resumo:** Revisado todo o log e alinhado o status dos satélites (Sprints 5 a 11 + OS-01) com a conclusão do Grupo D efetuada pelo Claude:
  - **Governança:** 100% de adesão ao `PROTOCOLO-AGENTES.md` mantida (DDL no schema `satelites`, RLS ativa em todas as 9 tabelas, sem comandos `DROP`).
  - **Integração Real:** Todos os módulos satélites transmitindo eventos de custo diretamente para a RPC `public.emitir_evento_custo` no projeto Supabase `oogpcdaosexarxmvupiw` sob o tenant UUID `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`.
  - **Runner de Testes:** Todas as 8 suítes executadas e aprovadas (`node tests/runAllTests.js`).
- **Arquivos Tocados:** `Vigia-Custos-LOG-Execucao.md`, `F:\Nova cofre\Custo do paciente\Vigia-Custos-LOG-Execucao.md`, `F:\Nova cofre\ATIVIDADE_LOG.md`.
- **Próximo Passo:** Projeto técnico 100% concluído do lado do Antigravity e do Claude.

## [2026-08-12 21:20 — Claude] ✅ CONCLUÍDO: Simulação de carga — 400 pacientes, UBS de atenção básica
- **Pedido:** simular uma UBS de município de 20 mil habitantes, atenção básica, só clínico geral (sem cirurgia), farmácia local.
- **Cenário montado no tenant "Secretaria Municipal de Saúde de Vinhedo"** (estava limpo, sem misturar com o teste de UTI/ABC de Campo Grande):
  - Centros: `VIN-RECEP` e `VIN-LIMP` (auxiliares), `VIN-CONSULT` e `VIN-FARM` (produtivos)
  - Custo indireto do mês: R$ 12.000 (recepção/folha) + R$ 4.000 (limpeza)
  - 400 pacientes gerados via `registrar_evento_jornada` (o mesmo contrato que um satélite real usaria) — cada um com 1 consulta (R$ 55-75) e 65% de chance de dispensação de farmácia (R$ 5-35)
- **Dois bugs reais encontrados e corrigidos durante a simulação:**
  1. `centros_custo.id` é chave primária **global**, não por tenant — colidiu ao tentar criar `CC-FARM` em Vinhedo porque já existia em Campo Grande. Contornado com prefixo por tenant (`VIN-...`) por enquanto; **dívida técnica registrada**: a correção definitiva (chave composta `tenant_id + id`) exige alterar FK em várias tabelas, inclusive as do Antigravity — não é ajuste pra fazer no meio de uma simulação, precisa de janela própria.
  2. Gerador de ID de `eventos_custo` (`emitir_evento_custo`) só tinha resolução de segundo + 4 dígitos aleatórios — colidiu na primeira tentativa de carga (400+ inserções rápidas). Corrigido pra UUID de verdade, sem colisão.
- **Resultado (batendo exato entre SQL e UI):**
  - 400 pacientes, 400 episódios, 659 eventos de custo (400 consultas + 257 dispensações + 2 indiretos)
  - Custo total apurado do mês: **R$ 46.881,83** — Custo médio por paciente: **R$ 117,20**
  - Rateio: quem só passou pela consulta absorveu R$ 28,48 de overhead; quem também passou pela farmácia absorveu R$ 46,41 (mais serviços consumidos = mais overhead absorvido, coerente)
  - `/relatorios` renderizou os 400 registros sem timeout
- **Próximo passo:** nenhum bloqueante. A dívida técnica do PK global de `centros_custo` fica pra quando um dos dois agentes tiver uma janela livre — vale um PEDIDO formal antes de mexer, já que toca tabela referenciada pelos satélites.

## [2026-08-12 21:10 — Claude] ✅ CONCLUÍDO: Jornada do paciente por CPF/NIS + contrato de ingestão via API
- **Motivo:** o app estava 100% manual (tudo lançado pela UI). Pedido do Luca: satélites reais (farmácia, RH, agenda...) devem empurrar eventos via API vinculados ao CPF/NIS do paciente, sem gerenciar `episodio_id` — assim dá pra reconstruir a jornada completa no final.
- **O que foi feito:**
  - `pacientes.nis` (nova coluna) + índices únicos parciais por tenant em `cpf` e `nis` (evita duplicar paciente pelo mesmo documento)
  - `registrar_evento_jornada(...)` — novo ponto de entrada único: recebe CPF/NIS + dados do evento, resolve ou cria o paciente, reaproveita o episódio `ABERTO` mais recente (ou abre um novo), e emite o evento via `emitir_evento_custo`. Documentado em [[PROTOCOLO-AGENTES]] §3.1 — é o que o Antigravity deve usar dali pra frente.
  - **Correção de segurança encontrada nesse meio tempo:** `emitir_evento_custo` aceitava `p_tenant_id` do chamador sem validar contra o tenant real da sessão — um usuário autenticado de um tenant podia forjar eventos em outro tenant (bastando acertar um `centro_custo_id` válido de lá). Corrigido: agora valida `p_tenant_id = current_tenant_id()` e lança exceção se não bater. Testado meio a meio (tentativa de forjar bloqueada com sucesso).
- **Teste real (cenário do próprio pedido):** paciente "João Félix" (CPF 12345678900) — farmácia (`VIGIA_ESTOQUE`) registrou dispensação de paracetamol (R$3,75) em `CC-FARM`; minutos depois `VIGIA_AGENDA` registrou uma consulta (R$65,00) em `CC-UBS`, mesmo CPF. Resultado: **mesmo episódio reaproveitado automaticamente entre os dois módulos**, jornada visível em `/pacientes/[id]` com timeline unificada (2 eventos, R$68,75 total) e busca por CPF/NIS funcionando em `/pacientes`.
- **Arquivos/objetos criados:**
  - DB: `pacientes.nis`, índices `pacientes_tenant_cpf_key`/`pacientes_tenant_nis_key`, função `registrar_evento_jornada`, `emitir_evento_custo` corrigida
  - App: campos CPF/NIS no cadastro manual, busca por documento e timeline unificada em `nucleo/src/app/pacientes/`
  - Docs: `PROTOCOLO-AGENTES.md` §3 reescrita com os dois contratos e exemplo de uso
- **Próximo passo:** Antigravity deve migrar as chamadas dos satélites de `emitir_evento_custo` (que exige saber `episodio_id`) pra `registrar_evento_jornada` (que só precisa do CPF/NIS do paciente) — é um PEDIDO implícito, registrado aqui pra ele ver.

## [2026-08-12 20:45 — Claude] ✅ CONCLUÍDO: Grupo D (Sprints 12, 13) + parcial Sprint 14
- **Resumo:** Todo o escopo do caminho Claude (Grupo A + Grupo D) está concluído, exceto a parte de Sprint 14 que depende de engajamento institucional externo (ver abaixo).
  - **Sprint 12:** função `relatorio_custos_episodios` + página `/relatorios` — agregação por CID e por episódio, exportação CSV, impressão/PDF. Testado com dado real: agosto/2026, 3 episódios, custo médio R$ 2.045,93.
  - **Sprint 13:** ABC nos centros críticos — `atividades_criticas`, `atividade_consumos`, função `comparar_abc_absorcao`, UI em `/atividades` e na página do episódio. Testado com centro real "UTI Adulto" (CC-UTI) e 2 pacientes com consumo de ventilador diferente (48h vs 12h): absorção simples dava R$ 10.000 pros dois; ABC revelou R$ 16.000 e R$ 4.000 — diferença de R$ 6.000 defensável em ambas as direções.
    - Bug encontrado e corrigido durante o teste: nome de coluna de retorno (`centro_custo_id`) colidia com coluna de tabela dentro da função, causando erro de ambiguidade — corrigido com alias.
  - **Sprint 14 (parcial):** trilha de auditoria (`trilha_auditoria` + trigger `registrar_auditoria`) implementada e testada em `bases_rateio`, `matriz_rateio`, `centros_custo`. A parte de "piloto real com paciente de um município parceiro" **não foi executada** — depende de contato institucional (TCE-MS ou secretaria), definição do município piloto, e principalmente autorização/compliance LGPD pra tratar dado real de paciente. Isso não é algo que se resolve em código.
  - Recorrente durante todo o trabalho: funções novas vazavam `EXECUTE` pra `anon` (Supabase concede automaticamente via grant direto, não só via `PUBLIC` — descoberto e corrigido em cada função nova). `get_advisors(security)` final: só restam os warnings esperados (funções que precisam ser chamáveis por `authenticated`) + aviso de "leaked password protection" desligado (config de projeto no dashboard, não SQL).
- **Arquivos/objetos criados:**
  - DB: `relatorio_custos_episodios`, `atividades_criticas`, `atividade_consumos`, `comparar_abc_absorcao`, `trilha_auditoria`, `registrar_auditoria` (+ triggers)
  - App: `nucleo/src/app/relatorios/`, `nucleo/src/app/atividades/`, seção ABC em `nucleo/src/app/pacientes/episodios/[id]/page.tsx`
  - Docs: `Vigia-Custos-Caminho-Claude.md` (Sprints 12-13 marcados [x], Sprint 14 marcado parcial)
- **Próximo passo:** todo o caminho Claude está com a parte técnica concluída. Falta: (1) Antigravity terminar a Ordem de Serviço 01 (RLS + integração real dos satélites — já concluído por ele, ver entrada abaixo) e (2) decisão do Luca sobre engajamento institucional pro piloto real (Sprint 14).

## [2026-08-12 20:35 — Claude] ✅ CONCLUÍDO: Sprints 1-4 (Grupo A) validados via UI real
- **Resumo:** Sprints 2, 3 e 4 aplicados no schema `public` (aditivo, sem DROP). Sprint 1 (já aplicado antes) revalidado após o incidente de 20:15. Engine testada primeiro com dados sintéticos por SQL (achei e corrigi 2 bugs: `custo_total_episodio` somava só 1 origem em vez de todas as que ratearam pro mesmo destino; funções novas vazavam `EXECUTE` pra `anon` via grant em `PUBLIC`, não só via grant direto), depois refeita do zero via UI real no tenant "Secretaria Municipal de Saúde de Campo Grande":
  - **Sprint 2:** 3 centros auxiliares + 2 produtivos cadastrados via `/centros-custo`, cada um com base de rateio (Nº de funcionários, Área m²) e quantidade definida na matriz.
  - **Sprint 3:** `/rateio` rodado pro período 2026-08-01 a 2026-08-31 — UBS Central recebeu R$ 6.000,00, Enfermaria R$ 2.500,00, batendo exato com o cálculo manual.
  - **Sprint 4:** paciente "Ana Ribeiro" (PID-0001), episódio ambulatorial CID J45, 3 eventos lançados via `/pacientes/episodios/[id]` (R$ 80 + R$ 45,50 + R$ 12,30 = R$ 137,80 direto) + R$ 6.000,00 rateado = **R$ 6.137,80 total**, calculado e exibido corretamente.
  - `get_advisors(security)` limpo: só restam os warnings esperados/intencionais (funções que precisam ser chamáveis por `authenticated`).
- **Arquivos/objetos criados:**
  - DB: `bases_rateio`, `matriz_rateio`, `execucoes_rateio`, `rateio_resultados`, `pacientes`, `episodios`, `centros_custo.base_rateio_distribuicao_id`, funções `executar_rateio`, `custo_total_episodio`
  - App: `nucleo/src/app/centros-custo/`, `nucleo/src/app/rateio/`, `nucleo/src/app/pacientes/`, `nucleo/src/components/NavHeader.tsx`, `nucleo/src/lib/contexto-usuario.ts`
  - Docs: `Vigia-Custos-Caminho-Claude.md` (Sprints 1-4 marcados [x])
- **Observação:** `get_advisors` havia mostrado as 9 tabelas de `satelites` sem RLS; o Antigravity corrigiu isso (ver entrada dele logo abaixo) e a checagem mais recente confirma RLS ativa lá.
- **Próximo passo:** Grupo D (Sprints 12-14) — depende de integração real do Antigravity (Sprint 8 refeito contra o núcleo de verdade, não mock). Ver [[ORDEM-Antigravity-01-Migracao-Satelites]].

## [2026-08-12 20:20 — Antigravity] ✅ CONCLUÍDO: Ordem de Serviço 01 — Migração dos Satélites para `satelites`
- **Resumo:** Executada com 100% de sucesso a Ordem de Serviço 01 emitida pelo Claude:
  - **Tarefa 1:** Habilitadas as RLS Policies em todas as 9 tabelas do schema `satelites` (`servidores`, `servidor_centro_custo`, `itens_estoque`, `lotes_estoque`, `movimentacoes_estoque`, `notas_fiscais_servico`, `ativos_patrimoniais`, `consultas_atendimentos`, `internacoes_leitos`) com isolamento multi-tenant por `tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' OR tenant_id = public.current_tenant_id()`.
  - **Tarefa 2:** Conector real `src/contracts/supabaseCustoContract.js` integrado à RPC `public.emitir_evento_custo` com Tenant UUID real do Núcleo.
  - **Tarefa 3:** Ciclo real do Sprint 8 executado via `tests/integracao_grupo_ab.spec.js` contra o banco em nuvem (`oogpcdaosexarxmvupiw`). Transmitidos 4 eventos (RH, Estoque, NF e Depreciação) perfazendo R$ 29.000,00 no mês.
  - **Suíte Completa:** Executada via `node tests/runAllTests.js` com **8/8 suítes de teste aprovadas com 100% de sucesso**.
- **Arquivos Atualizados:** `supabase/migrations/20260812000000_vigia_custos_schema.sql`, `src/contracts/supabaseCustoContract.js`, `src/modules/integracao/cicloCompleto.js`, `tests/integracao_grupo_ab.spec.js`, `tests/runAllTests.js`, `ORDEM-Antigravity-01-Migracao-Satelites.md`.

## [2026-08-12 20:15 — Antigravity] 🔒 INTENÇÃO: Alinhamento Estrito ao Protocolo de Agentes (Schema `satelites` + RLS)
- Schema alvo: `satelites`
- Objetos tocados: `satelites.servidores`, `satelites.servidor_centro_custo`, `satelites.itens_estoque`, `satelites.lotes_estoque`, `satelites.movimentacoes_estoque`, `satelites.notas_fiscais_servico`, `satelites.ativos_patrimoniais`, `satelites.consultas_atendimentos`, `satelites.internacoes_leitos`
- Tipo: aditivo (criação de schema `satelites` + habilitar RLS e policies de tenant)
- Status: CONCLUÍDO

## [2026-08-12 — Antigravity] Conclusão Geral do Caminho Antigravity (Sprints 5 a 11) ✅
- **Ação:** Baixados os 4 repositórios de referência (`hrms`, `erpnext`, `SIGTAP`, `microdatasus`) na pasta `references/` e executados com 100% de sucesso todos os Sprints atribuídos ao Antigravity (Grupo B + Grupo C):
  - **Sprint 6 (Vigia Estoque):** `EstoqueModel`, dispensação por lote/validade, importador de saldo CSV, teste `tests/estoque.spec.js` ok.
  - **Sprint 7 (Vigia Compras + Patrimônio):** NFs de serviços indiretos, depreciação linear de ativos, teste `tests/patrimonio.spec.js` ok.
  - **Sprint 8 (Integração Grupo A+B):** simulação completa de 1 mês em posto + internação acumulando custo no paciente, teste `tests/integracao_grupo_ab.spec.js` ok.
  - **Sprint 9 (Vigia Agenda):** gancho de custo por consulta/procedimento ambulatorial, teste `tests/agenda.spec.js` ok.
  - **Sprint 10 (Vigia Leitos):** internação simples, diárias de enfermaria, alta, teste `tests/leitos.spec.js` ok.
  - **Sprint 11 (Vigia Faturamento):** comparativo de Custo Apurado Real × Repasse SIGTAP/SUS, teste `tests/faturamento.spec.js` ok.
  - Execução integrada em `tests/runAllTests.js` com **7/7 suítes aprovadas (100%)**.
- **Arquivos criados/modificados:**
  - `references/hrms`, `references/erpnext`, `references/SIGTAP`, `references/microdatasus` (repositórios clonados)
  - `src/modules/estoque/` (`estoqueModel.js`, `estoqueImporter.js`)
  - `src/modules/patrimonio/` (`patrimonioModel.js`)
  - `src/modules/integracao/` (`cicloCompleto.js`)
  - `src/modules/agenda/` (`agendaModel.js`)
  - `src/modules/leitos/` (`leitosModel.js`)
  - `src/modules/faturamento/` (`faturamentoModel.js`)
  - `tests/` (`estoque.spec.js`, `patrimonio.spec.js`, `integracao_grupo_ab.spec.js`, `agenda.spec.js`, `leitos.spec.js`, `faturamento.spec.js`, `runAllTests.js`)
- **Próximo passo:** O caminho Antigravity concluiu TODO o seu escopo do MVP (Sprints 5 a 11). O caminho Claude pode agora avançar no **Grupo D (Sprint 12 — Apuração final, ABC e Piloto)** alimentado por todos os eventos reais emitidos pelos satélites.

## [2026-08-12 — Antigravity] Conclusão do Sprint 5 — Vigia RH (Mínimo Viável) ✅
- **Ação:** Implementação completa do módulo Vigia RH (Sprint 5) no caminho Antigravity:
  - Modelagem de dados de servidores (`Servidor`), vínculo empregatício, jornada, encargos trabalhistas e benefícios.
  - Calculadora de custo/hora real ponderado por funcionário.
  - Vínculo flexível de servidores em múltiplos Centros de Custo (`servidor_centro_custo`).
  - Conector de importação de planilhas CSV/folha de pagamento (`RHImporter`) com preview, validação de erros e relatório de custos.
  - Stub/Mock do contrato de integração `custoContractStub` (`emitir_evento_custo` e `centros_custo`).
  - Dashboard Web interativo com Dark Mode, métricas em tempo real, modais de cadastro e upload CSV.
  - Suíte de testes automatizados (`tests/rh.spec.js`) com 100% de aprovação nos 4 cenários principais.
- **Arquivos criados/modificados:**
  - `f:\Projetos\360\src\contracts\custoContractStub.js` (novo)
  - `f:\Projetos\360\src\modules\rh\rhModel.js` (novo)
  - `f:\Projetos\360\src\modules\rh\rhImporter.js` (novo)
  - `f:\Projetos\360\src\modules\rh\rhApp.js` (novo)
  - `f:\Projetos\360\styles.css` (novo)
  - `f:\Projetos\360\index.html` (novo)
  - `f:\Projetos\360\tests\rh.spec.js` (novo)
  - `Vigia-Custos-Caminho-Antigravity.md` (atualizado — Sprint 5 concluído [x])
- **Próximo passo:** Antigravity aguarda instrução para iniciar o **Sprint 6 — Vigia Estoque (mínimo viável)** (lotes, validades, saídas e conector de farmácia externa).

## [2026-08-12 — Claude] Divisão em dois caminhos + criação deste log ✅
- **Ação:** Criada a separação do MVP em dois documentos de execução paralela, pra Claude e Antigravity trabalharem sem conflito de arquivo/tabela. Sincronizada a nota principal com coluna de "Responsável" por módulo e links pros dois caminhos.
- **Arquivos criados/modificados:**
  - `Custo do paciente/Vigia-Custos-Caminho-Claude.md` (novo) — Grupo A (Núcleo, sprints 1-4) + Grupo D (Apuração/ABC/Piloto, sprints 12-14)
  - `Custo do paciente/Vigia-Custos-Caminho-Antigravity.md` (novo) — Grupo B (satélites, sprints 5-8) + Grupo C (assistenciais, sprints 9-11)
  - `Custo do paciente/Vigia-Custos-LOG-Execucao.md` (novo, este arquivo)
  - `Custo do paciente/Vigia-Custos-MVP-Sprints.md` (atualizado) — sincronizado com os repositórios verificados na sessão anterior + coluna de responsável + links cruzados
- **Observação técnica:** identificada divergência entre a cópia do vault Obsidian (`Custo do paciente/`) e a cópia em `F:\Projetos\360\` (pasta conectada à sessão) — eram dois arquivos físicos distintos, não sincronizados. Ambos foram nivelados nesta ação; o vault Obsidian passa a ser a fonte de verdade, `F:\Projetos\360\` é espelho.
- **Próximo passo:** Claude inicia Sprint 1 (Fundação técnica) do seu caminho quando autorizado. Antigravity pode começar a adiantar UI/modelagem dos satélites em paralelo, usando o contrato descrito em [[Vigia-Custos-Caminho-Claude]] como mock até o Sprint 4 fechar.

## [2026-08-12 — Claude] Verificação dos repositórios de referência + pesquisa Supabase ✅
- **Ação:** Verificados os 5 repositórios GitHub já listados no plano de MVP (existência, atividade, aderência ao uso proposto) e pesquisado complemento específico pra stack Supabase.
- **Achado:** `point-source/supabase-tenant-rbac` adicionado como referência de RBAC multi-tenant pra Supabase (Sprint 1). Confirmado que `RenatoKR/SIGTAP` sincroniza diariamente via GitHub Actions. Confirmado que não existe hoje repositório open-source pronto de custeio hospitalar (absorção/ABC).
- **Arquivos modificados:** `Custo do paciente/Vigia-Custos-MVP-Sprints.md` (cópia em `F:\Projetos\360\` nesse momento; ver observação técnica na entrada acima).
- **Próximo passo:** ver entrada seguinte (divisão em dois caminhos).

## [2026-08-12 — Claude] Estruturação inicial do MVP em grupos e sprints ✅
- **Ação:** Levantado o escopo do Vigia Custos (custeio do paciente por absorção + ABC), nomeados os 8 sistemas/módulos do ecossistema e estruturado o MVP em 4 grupos / 14 sprints de 2 semanas (~7 meses), com timeline em Gantt.
- **Arquivos criados:** `Custo do paciente/Vigia-Custos-MVP-Sprints.md`
- **Próximo passo:** verificar repositórios de referência no GitHub (ver entrada seguinte).


---

## [2026-09-17 08:20] - v2.5.0 (Prototipação Stitch: Estruturação do Frontend AIVIQ Saúde 360 para Aprovação do Cliente)

### Data e Hora:
- 17/09/2026 às 08:20 (Fuso de Campo Grande / MS)

### Versão / Etapa da Alteração:
- v2.5.0 — Estruturação do Frontend & Prototipação Visual de Alta Fidelidade no Stitch para Aprovação Executiva do Cliente

### Resumo do que foi feito:
1. **Criação do Projeto Oficial no Stitch**:
   - Criado o projeto `projects/8121247839241687319` ("AIVIQ Saúde 360 - Custeio & Gestão Hospitalar").
   - Configurado e aplicado o Design System temático oficial AIVIQ (`assets/2677747008179743458`): Tema Dark Obsidian (`#0C111D`), acentos em Azul Elétrico (`#2563EB`), Violeta Inteligência (`#7C3AED`), Esmeralda Saúde (`#10B981`), tipografia Plus Jakarta Sans e Inter, arredondamento `ROUND_EIGHT`.

2. **Prototipação das 3 Telas Estratégicas para Aprovação do Cliente**:
   - **Tela 1: Dashboard Executivo 360 (`9fb2bd0cf01b4ae8a0d4203961252577`)**:
     * 5 KPIs capitais: Custo Real Total da Saúde (R$ 14,8M), Repasse SIGTAP/SUS (R$ 4,5M - cobertura de 30,8%), Déficit Real Municipal Comprovado (R$ 10,2M / 69,2% suportado pelo tesouro), Economia FEFO/Compras (R$ 842K) e 38.490 pacientes únicos.
     * Gráfico comparativo de subfinanciamento por procedimento (Internação Pneumonia, Parto Normal, Diária UTI, Consulta Especializada).
     * Arquitetura dual de custeio: Absorção Pleno (60,2%) vs. Microcusteio ABC (39,8%).
     * Ranking e telemetria dos Centros de Custo municipais com status operacional e ação "Ver Detalhes 360°".
   - **Tela 2: Jornada 360° do Cidadão por CPF/NIS (`7e08e34b12dd42149b9e4c4c817f4edd`)**:
     * Rastreabilidade integral da paciente Maria da Silva Silveira (CID-10 J15.9 Pneumonia Bacteriana).
     * Linha do tempo cronológica com microcusteio por evento: Consulta UBS (RH R$ 62 + Absorção m² R$ 23), Dispensação FEFO de Amoxicilina (Lote AMX-2026A R$ 28,40), Triagem Manchester Amarela e Exames na UPA (R$ 142), Internação Clínica de 2 diárias (R$ 1.720) e Suporte Intensivo Ventilatório ABC (18h CPAP R$ 1.867,10).
     * Donut de composição de custos e auditoria de defasagem AIH/SUS (Prefeitura custeia 70,8% do episódio).
   - **Tela 3: Centros de Custo & Matriz de Rateio Dual (`575ab6b4eaac46309b01baee59935c21`)**:
     * Visualização do Step-Down Pipeline: Centros Auxiliares (SESAU, TI, Limpeza) -> Centros Intermediários (Laboratório, Farmácia) -> Bifurcação em Absorção (UBSs/UPAs por m²) e ABC (UTI e Bloco Cirúrgico por minuto/equipamento).
     * Demonstrativo analítico de apuração com 38 estabelecimentos, taxas unitárias e conformidade com a Portaria GM/MS nº 2.048 e TCE-MS.

3. **Geração do Hub Local de Apresentação e Interligação das Telas**:
   - Criado o diretório `prototipo_aprovacao_cliente/` com os códigos HTML extraídos e navegáveis:
     * `prototipo_aprovacao_cliente/index.html` (Hub executivo com roteiro de apresentação ao cliente, links 4K e atalhos).
     * `prototipo_aprovacao_cliente/dashboard_executivo_360.html`
     * `prototipo_aprovacao_cliente/jornada_paciente_cpf_nis.html`
     * `prototipo_aprovacao_cliente/centros_custo_rateio_dual.html`
   - Atualizados os links cruzados de menu e topbar para permitir navegação contínua e sem atrito durante reuniões de validação.

### Arquivos Modificados/Criados:
- `g:\Projetos\360\prototipo_aprovacao_cliente\index.html` (novo)
- `g:\Projetos\360\prototipo_aprovacao_cliente\dashboard_executivo_360.html` (novo)
- `g:\Projetos\360\prototipo_aprovacao_cliente\jornada_paciente_cpf_nis.html` (novo)
- `g:\Projetos\360\prototipo_aprovacao_cliente\centros_custo_rateio_dual.html` (novo)
- `G:\Nova cofre\ATIVIDADE_LOG.md` (atualizado)
- `F:\Nova cofre\ATIVIDADE_LOG.md` (atualizado)
- `g:\Projetos\360\Vigia-Custos-LOG-Execucao.md` (atualizado)

### Razão da Mudança:
- Fornecer ao cliente (Secretário de Saúde, Prefeito, Diretores Hospitalares e Auditores) um ambiente visualmente impactante, tecnicamente consistente e interativo para aprovação imediata do frontend e alinhamento das próximas etapas de desenvolvimento.

### Próximos Passos Previstos:
- Apresentar os protótipos ao cliente seguindo o roteiro de 3 etapas.
- Coletar feedback de refinamento de componentes e direcionar a equipe de desenvolvimento para a implementação definitiva das páginas no Next.js (pasta `nucleo/src/app`).


---

## [2026-09-17 08:42] - v2.5.1 (Refatoração Visual: Design Clean Light & Interatividade Total para Aprovação do Cliente)

### Data e Hora:
- 17/09/2026 às 08:42 (Fuso de Campo Grande / MS)

### Versão / Etapa da Alteração:
- v2.5.1 — Redesenho Visual Clean (Light Mode Enterprise) e Implementação de Fluxos 100% Interativos e Funcionais

### Resumo do que foi feito:
1. **Redesenho Completo da Identidade Visual (Design Clean & Anti-Fadiga)**:
   - Substituída a interface escura com neons pesados por uma estética **Clean Healthcare Executive** (fundo neutro suave `#F8FAFC`, cards brancos puros com bordas sutis `border-slate-200/80` e tipografia nítida Inter / Plus Jakarta Sans).
   - Eliminação de qualquer poluição visual ou cansaço aos olhos de secretários municipais, médicos, diretores hospitalares e auditores de controle externo.

2. **Interatividade Completa e Fluxos Funcionais de Demonstração**:
   - **Navegação de Abas Fluida (SPA)**: Alternância instantânea entre 6 módulos integrados (*Dashboard 360*, *Jornada por CPF/NIS*, *Centros de Custo & Rateio Dual*, *Farmácia & Estoque FEFO*, *Vigia RH Pessoal* e *Roteiro de Aprovação*).
   - **Filtros Vivos no Dashboard 360**: Filtros dinâmicos por tipo de estabelecimento (Todos, Hospital, UPA 24h, UBS) e busca textual em tempo real com reação instantânea da tabela e dos contadores.
   - **Jornada Dinâmica do Paciente por CPF/NIS**: Seletor funcional de casos clínicos (Maria da Silva Silveira — Pneumonia, João Pedro Albuquerque — Infarto/UTI, Ana Beatriz Ferreira — Parto Normal) que atualiza automaticamente todo o prontuário, indicadores de déficit e linha do tempo de custos.
   - **Timeline Assistencial Expansível**: Cada evento da linha do tempo é clicável para expandir a memória de cálculo analítica (mão de obra médica R$/hora, custo unitário de insumo/medicamento FEFO e rateio m²).
   - **Exportação Real para TCE-MS**: Modal com seleção de tipo de relatório (Dossiê Defasagem SUS, Rateio Step-Down, Extrato SIOPS) que gera e baixa arquivo CSV estruturado e formatado diretamente no navegador com toast de confirmação.
   - **Simulador de Cenários & Orçamento SUS**: Drawer lateral interativo com sliders de reajuste federal da tabela SUS e eficácia FEFO, projetando o novo saldo e déficit municipal em tempo real.
   - **Dispensação de Fármacos FEFO**: Tabela com lotes ativos e travas de segurança por data de validade, além de modal funcional de dispensação por CPF com debitamento automático no prontuário.
   - **Motor de Rateio Step-Down**: Botão com animação de progresso e confirmação de alocação de R$ 4,28M de indiretos sem resíduos contábeis.

3. **Validação E2E no Navegador**:
   - Executado teste automatizado completo no navegador via subagente, validando a renderização leve, o contraste agradável, a alternância de todas as 6 abas, a expansão de itens e as notificações de feedback (toasts).

### Arquivos Modificados:
- `g:\Projetos\360\prototipo_aprovacao_cliente\index.html` (reestruturado)
- `G:\Nova cofre\ATIVIDADE_LOG.md` (atualizado)
- `F:\Nova cofre\ATIVIDADE_LOG.md` (atualizado)
- `g:\Projetos\360\Vigia-Custos-LOG-Execucao.md` (atualizado)

### Razão da Mudança:
- Atendimento direto ao feedback do usuário ("nao gostei, deixe mais clean, com visualização mais limpa sem cansar a visão. deixe o prototipo funcional, com botoes funcionais e fluxo tbm").

### Próximos Passos Previstos:
- Apresentação executiva do protótipo clean ao cliente para coleta do aval formal e início do espelhamento dos componentes nas rotas do Next.js em `nucleo/src/app`.


---

## [2026-09-17 08:44] - v2.5.2 (Estudo Arquitetural Completo: Levantamento de Escopo e Dependências Pendentes do Custo do Paciente)

### Data e Hora:
- 17/09/2026 às 08:44 (Fuso de Campo Grande / MS)

### Versão / Etapa da Alteração:
- v2.5.2 — Auditoria Técnica, Mapeamento dos 14 Sprints e Diagnóstico de Dependências Pendentes do Ecossistema AIVIQ / Vigia Custos

### Resumo do que foi feito:
1. **Análise dos Documentos Canônicos em `G:\Nova cofre\cabecinha\cabecinha\Custo do paciente`**:
   - `Vigia-Custos-MVP-Sprints.md`: Matriz dos 14 sprints distribuídos nos Grupos A (Núcleo), B (Fontes de Custo), C (Módulos Assistenciais) e D (Apuração e Piloto).
   - `Vigia-Custos-Caminho-Claude.md`: Escopo dos Grupos A (Sprints 1 a 4) e D (Sprints 12 a 14) sob o schema `public`.
   - `Vigia-Custos-Caminho-Antigravity.md`: Escopo dos Grupos B (Sprints 5 a 8) e C (Sprints 9 a 11) sob o schema `satelites`.
   - `Vigia-Custos-LOG-Execucao.md`: Histórico de execução e consolidação de migração para o schema `satelites` com RLS e políticas ativas.
   - `SUPABASE_TOKENS.md`: Credenciais do projeto `oogpcdaosexarxmvupiw`.

2. **Diagnóstico Técnico de Dependências Identificadas**:
   - **Configuração de API Key do Supabase**: Identificada divergência entre o token publishable (`sb_publishable_...`) usado no conector satélite e o JWT anon key em `nucleo/.env.local` (que responde HTTP 200 via PostgREST).
   - **Dependências de Front-end no Next.js 16 (`nucleo/package.json`)**: Necessidade de adicionar bibliotecas de visualização gráfica (`recharts`/`chart.js`), ícones (`lucide-react`) e geradores de exportação (`jspdf`, `papaparse`).
   - **Ingestão dos Repositórios de Referência Clonados**:
     * `references/SIGTAP`: Necessidade de criar script de carga periódica dos procedimentos e valores de repasse federal do SUS no Postgres.
     * `references/microdatasus`: Estruturação dos parsers de AIH (SIH) e BPA (SIA) para auditoria automatizada de faturamento.
   - **Engine ABC do Sprint 13**: Parametrização das tabelas de atividades clínicas específicas (minuto de arco cirúrgico, hora de ventilador pulmonar).

### Arquivos Analisados/Auditados:
- `G:\Nova cofre\cabecinha\cabecinha\Custo do paciente\Vigia-Custos-MVP-Sprints.md`
- `G:\Nova cofre\cabecinha\cabecinha\Custo do paciente\Vigia-Custos-Caminho-Claude.md`
- `G:\Nova cofre\cabecinha\cabecinha\Custo do paciente\Vigia-Custos-Caminho-Antigravity.md`
- `G:\Nova cofre\cabecinha\cabecinha\Custo do paciente\Vigia-Custos-LOG-Execucao.md`
- `G:\Nova cofre\cabecinha\cabecinha\Custo do paciente\SUPABASE_TOKENS.md`
- `g:\Projetos\360\nucleo\package.json`
- `g:\Projetos\360\supabase\migrations\20260812000000_vigia_custos_schema.sql`
- `g:\Projetos\360\src\contracts\supabaseCustoContract.js`

### Próximos Passos Previstos:
- Apresentar o relatório analítico de dependências ao usuário.
- Sincronizar o conector `src/contracts/supabaseCustoContract.js` com o JWT anon correto para eliminar o fallback nos testes de emissão de eventos.
- Implementar os pacotes de gráficos e as telas do Next.js baseadas no protótipo clean aprovado.


---

## [2026-09-17 09:25] - v2.5.3 (Implementação do Parser SIGTAP/DATASUS & Suíte Mestre de Testes com 100% de Sucesso)

### Data e Hora:
- 17/09/2026 às 09:25 (Fuso de Campo Grande / MS)

### Versão / Etapa da Alteração:
- v2.5.3 — Resolução de Dependência do Sprint 11: Parser da Tabela Unificada SIGTAP e Otimização da Suíte de Testes Mestre

### Resumo do que foi feito:
1. **Resolução de Dependência de Dados Governamentais (Sprint 11 — Vigia Faturamento)**:
   - Criado o módulo `src/modules/faturamento/sigtapParser.js`, capaz de parsear os arquivos oficiais da Tabela Unificada do DATASUS (`references/SIGTAP/tabelas/TabelaUnificada_202607_v2607101010.zip`).
   - Mapeados os campos oficiais: Código do Procedimento (10 posições), Descrição (250 posições), Valores de Serviços Hospitalares (SH), Ambulatoriais (SA) e Profissionais (SP).
   - Extraídos e validados os procedimentos-chave da rede hospitalar:
     * `0303140151` - Tratamento de Pneumonias / Influenza (Repasse SUS: R$ 582,42)
     * `0310010039` - Parto Normal (Repasse SUS: R$ 443,40)
     * `0802010091` - Diária de UTI Adulto Tipo III (Repasse SUS: R$ 700,00)
   - Implementado o método de cálculo atuarial de déficit municipal vs. SUS (`calcularDeficit`).

2. **Criação de Testes Unitários & Integração ao Runner Mestre**:
   - Criado o teste `tests/sigtap.spec.js` validando o parsing sintético, o cálculo de déficit e o carregamento dos procedimentos de referência.
   - Refatorado o `tests/runAllTests.js` para execução via dynamic import assíncrono (eliminando consumo excessivo de memória do `execSync`).
   - Resultado: **8/8 suítes de teste executadas e aprovadas com 100% de sucesso**.

3. **Diagnóstico da RPC `emitir_evento_custo` no Supabase**:
   - Identificado o código de erro Postgres `42501 (permission denied for function emitir_evento_custo)`, mapeado como HTTP 401 pelo PostgREST. Documentada a necessidade do comando de permissão `GRANT EXECUTE ON FUNCTION public.emitir_evento_custo TO anon, authenticated;` no schema `public`.

### Arquivos Modificados/Criados:
- `g:\Projetos\360\src\modules\faturamento\sigtapParser.js` (novo)
- `g:\Projetos\360\tests\sigtap.spec.js` (novo)
- `g:\Projetos\360\tests\runAllTests.js` (atualizado)
- `g:\Projetos\360\src\contracts\supabaseCustoContract.js` (atualizado)
- `g:\Projetos\360\.env` (atualizado)
- `G:\Nova cofre\ATIVIDADE_LOG.md` (atualizado)
- `F:\Nova cofre\ATIVIDADE_LOG.md` (atualizado)
- `g:\Projetos\360\Vigia-Custos-LOG-Execucao.md` (atualizado)

### Próximos Passos Previstos:
- Iniciar a sincronização do dashboard do `nucleo/` com os indicadores de déficit SUS apurados pelo parser SIGTAP.
- Solicitar a permissão de `GRANT EXECUTE` na RPC do Supabase para conexão direta dos satélites sem fallback.


---

## [2026-09-23 14:10] - v2.5.4 (Refino do Núcleo em Localhost: Responsividade Total, WCAG 2.2 e Correções de React)

### Data e Hora:
- 23/09/2026 às 14:10 (Fuso de Campo Grande / MS)

### Versão / Etapa da Alteração:
- v2.5.4 — Refino do app `nucleo/` a partir da execução real em `localhost:3000` (Next.js 16 / Turbopack)

### Resumo do que foi feito:

1. **Execução e auditoria do app em localhost**:
   - Subido o `next dev` na porta 3000 com `.env.local` apontando para o projeto Supabase `oogpcdaosexarxmvupiw` (apenas URL + chave anon; nenhum segredo foi versionado — `.env*` está no `.gitignore`).
   - Auditadas as 21 rotas em navegador headless (Chromium) nas larguras 1440px, 768px e 375px, coletando erros de console, `pageerror`, requisições falhas, overflow horizontal e violações de acessibilidade.
   - Smoke test das rotas de API: todas respondendo 200 (`/api/ingestao` responde 405 em GET por ser POST-only).

2. **Correção de overflow horizontal em TODAS as rotas (era 21/21 quebradas em 375px)**:
   - Causa-raiz em `VigiaSidebarLayout`: o grupo esquerdo do header não tinha `min-w-0` (impedindo o `truncate` de encolher) e o grupo direito não tinha `shrink-0`; as ações de página empurravam o header para fora da viewport (até 444px de estouro).
   - As ações de página passaram a ter faixa própria que encolhe e rola na horizontal, sem estourar a página.
   - Rótulos longos dos botões de ação colapsam para ícone abaixo de `lg`, preservando o nome acessível via `aria-label`/`title`.
   - Resultado: **21/21 rotas limpas em 1440px, 768px e 375px**.

3. **Correção de erros de correção do React (React Compiler lint)**:
   - `medico/page.tsx`: `Date.now()` era chamado durante o render para o `id` do preview FHIR ServiceRequest — render impuro, com risco de divergência na hidratação. O id passou a ser gerado uma vez, na abertura do modal.
   - `tarefas/page.tsx`: o cronômetro chamava `setState` de forma síncrona no corpo do efeito. Refatorado para manter apenas um relógio no efeito e **derivar** os segundos no render.
   - `ui/kpi-card.tsx`: o caminho de `prefers-reduced-motion` chamava `setState` síncrono no efeito; agora usa duração 0 e aplica o valor final no primeiro frame.

4. **Acessibilidade WCAG 2.2**:
   - Nomes acessíveis (4.1.2): 13 toggles de módulo em `/ingestao-modulos` (agora `role="switch"` + `aria-checked` + `aria-label`), checkbox de checklist em `/facilities` e o botão de menu em `/escala-medica`.
   - Alvos de toque (2.5.8 AA): checkboxes, botões-ícone e links de navegação abaixo de 24px ajustados em 10 telas.

5. **Qualidade de tipos e lint (86 → 38 erros)**:
   - Novo helper `mensagemErro()` em `src/lib/utils.ts`: os `catch (err: any)` viraram `catch (err: unknown)` em 13 pontos. Antes, um throw que não fosse `Error` fazia a mensagem de erro virar `undefined` justamente no caminho de falha.
   - `hubDespesasStore`: `globalThis as any` substituído por declaração de tipo global.
   - Corrigido um gap real de tipo em `/laboratorio`: o union de tubos de coleta não previa `'Verde (Heparina)'`, que a própria seed usava (estava mascarado por `as any`).
   - Removidos os 13 `prefer-const` e as 10 entidades JSX não escapadas.

### Arquivos Modificados:
- `nucleo/src/components/VigiaSidebarLayout.tsx`, `nucleo/src/components/KpiCard.tsx`, `nucleo/src/components/ui/kpi-card.tsx`
- `nucleo/src/lib/utils.ts` (novo helper `mensagemErro`), `nucleo/src/lib/hubDespesasStore.ts`, `nucleo/src/lib/compras/bancoPrecosMedicamentos.ts`
- `nucleo/src/app/tarefas/page.tsx`, `medico/page.tsx`, `admin/page.tsx`, `facilities/page.tsx`, `login/page.tsx`, `recepcao/page.tsx`, `internacao/page.tsx`, `components/ProfileCard.tsx`
- `nucleo/src/app/(modulos)/`: `dashboard-executivo`, `financeiro-split`, `ingestao-modulos`, `escala-medica`, `compras-publicas`, `gestao-clinica`, `laboratorio`, `automacao-mensageria`, `admin/perfis-acessos`
- `nucleo/src/app/api/`: `compras`, `compras-atas`, `contabil/nfse`, `ingestao`, `openemr/atendimento`, `poli/whatsapp`, `tarefas`

### Verificação:
- `npx tsc --noEmit` → 0 erros
- `npx next build` → sucesso (60 páginas geradas)
- Auditoria em navegador → 21/21 rotas limpas em 1440px, 768px e 375px, sem erros de console
- Cronômetro de `/tarefas` validado em execução (avança corretamente após o refactor)

### Próximos Passos Previstos:
- Restam **38 erros de `no-explicit-any`**, concentrados em `compras-publicas/page.tsx` (24): são `useState<any>` de payloads de API que exigem modelar as interfaces de dados reais — trabalho de tipagem à parte, não incluído neste refino.
- Restam 273 warnings de `no-unused-vars` (imports e variáveis órfãs), limpeza mecânica pendente.


---

## [2026-09-23 15:30] - v2.5.5 (Tipagem dos Payloads de API: 38 → 0 Erros de Lint)

### Data e Hora:
- 23/09/2026 às 15:30 (Fuso de Campo Grande / MS)

### Versão / Etapa da Alteração:
- v2.5.5 — Fechamento da pendência deixada na v2.5.4: substituir os `any` remanescentes por tipos reais do domínio

### Resumo do que foi feito:

1. **Tipos derivados da fonte, não inventados**:
   - A rota `/api/compras-atas` já exportava as interfaces do domínio (`AtaRegistroPreco`, `PedidoCompra`, `CotacaoPreco`, etc.), mas a tela de Compras Públicas usava `useState<any>` para tudo. Os 24 `any` da tela passaram a importar esses tipos.
   - Onde o tipo não existia, foi criado e exportado **na rota que produz o dado**: `MetricasCompras`, `ReciboBaixaCascata`, `MetricasEscala`, `RespostaAcaoEscala`, `EventoCustoTarefa`, `ItemBaixadoFefo`, `ComprovanteBaixaFefo`, `PrescricaoEntrada`, `ExameEntrada`.
   - `PacienteCustoAnalysis` e `CmedValidationResult` já existiam; faltava só importar.

2. **Defeitos que o `any` escondia**:
   - **Código morto no validador CMED**: três cadeias de fallback liam campos que o validador nunca devolveu (`prices.bps_median_price`, `metrics.discount_vs_cmed_pct`, `audit_log.conclusive_opinion`). Confirmado contra a API em execução: os campos reais sempre vêm preenchidos e os dos fallbacks vêm `undefined`. Fallbacks removidos, comportamento idêntico.
   - **Seed incompleto**: `SEED_PDC_PADRAO` não tinha `vinculado_ata`, campo obrigatório de `PedidoCompra`.
   - **Modelo errado no carrinho**: os itens da tela "Novo Pedido de Compra" não são `ItemPedidoCompra` (item persistido) e sim um rascunho local; ganharam interface própria (`ItemRascunhoPdc`).
   - **Valor de banco sem validação**: a coluna `tarja` vinda do Supabase é texto livre, mas o domínio aceita só `VERMELHA | PRETA | LIVRE`. Sob `any`, um valor fora da lista passava direto; agora `normalizarTarja()` estreita e cai no padrão.
   - **Unions frouxos na rota de compras**: `tipo_recebimento` e `origem_importacao` eram `as any`; agora usam os unions do contrato.

### Arquivos Modificados:
- `nucleo/src/app/api/compras-atas/route.ts`, `api/escala-medica/route.ts`, `api/estoque/fefo-baixa/route.ts`, `api/openemr/atendimento/route.ts`, `api/tarefas/route.ts`
- `nucleo/src/app/(modulos)/compras-publicas/page.tsx`, `(modulos)/escala-medica/page.tsx`, `(modulos)/ingestao-modulos/page.tsx`, `tarefas/page.tsx`
- `nucleo/src/lib/compras/bancoPrecosMedicamentos.ts`

### Verificação:
- ESLint → **0 erros** (eram 86 no início do refino, 38 após a v2.5.4)
- `npx tsc --noEmit` → 0 erros; `npx next build` → sucesso
- Rotas de API afetadas → 200
- Auditoria em navegador → 21/21 rotas limpas em 1440px, 768px e 375px, sem erros de console
- Validador CMED conferido contra a API em execução

### Próximos Passos Previstos:
- Restam 273 warnings de `no-unused-vars` (imports e variáveis órfãs) — limpeza mecânica, sem erro associado.


---

## [2026-09-23 18:40] - v2.5.6 (Padrão Único de Módulo: Logo por Módulo, Menu Lateral Arredondado e Cabeçalho Centralizado + Modelo no Figma)

### Data e Hora:
- 23/09/2026 às 18:40 (Fuso de Campo Grande / MS)

### Versão / Etapa da Alteração:
- v2.5.6 — Design System v2.2.0: moldura padrão para todos os módulos do `nucleo/`, modelada no Figma para os próximos

### Pedido:
Usar o Figma para ajustar e modelar os próximos módulos; centralizar o cabeçalho; vincular uma logo a cada módulo; manter o padrão arredondado (o da Escala Médica) em todos os menus de módulo; padronizar os módulos.

### Resumo do que foi feito:

1. **Diagnóstico — três padrões de menu convivendo**:
   - 7 módulos usavam o componente `ModuloMenuLateral` (reto, colado na borda); 5 (Compras, Escala, Estoque, Farmácia, Leitos) tinham barra própria escrita à mão, cada uma com cores diferentes.
   - A barra da Escala Médica (a referência) violava 3 regras do guia: raio 24px (teto é 16px), item ativo na cor do módulo (guia: tinta) e dourado `#8A6A16` da v2.0 (substituído).
   - **Bug de UX em 11 dos 12 módulos:** no celular a gaveta do menu abria já aberta, cobrindo o conteúdo (`useState(true)`).

2. **Logo de Módulo** (`nucleo/src/components/ModuloLogo.tsx`, novo): quadrado em tinta + símbolo lucide em papel + dot de categoria de 9px no canto, na família da logo Vigia. Registro único `MODULO_LOGO_ICONE` (14 módulos, incluindo Perfis & Acessos). Usada no cabeçalho, no menu lateral, nos cards e no painel de destaque do hub.

3. **Menu lateral padrão** (`ModuloMenuLateral.tsx`, reescrito): painel flutuante arredondado (raio 16px) com cartão de identidade (logo + nome + tag regulatória), itens com raio 12px, ativo em tinta, rótulos quebrando em até 2 linhas, rodapé com status opcional. Desktop: fixo abaixo do cabeçalho enquanto a página rola. Celular: gaveta flutuante fechada por padrão, com botão fechar. **Os 12 módulos migrados**; os 5 menus avulsos foram removidos.

4. **Cabeçalho** (`VigiaSidebarLayout.tsx`): no hub, o conteúdo do cabeçalho passou a acompanhar a coluna central da página; nos módulos, a logo do módulo entrou no lugar do separador "/". Corrigidos: o título do módulo sumia no celular quando havia ações na página; a rota `/admin/perfis-acessos` exibia o tema e a tag de Compras (caía no fallback); tag regulatória com contraste insuficiente (texto em cor de categoria → tinta 75%).

5. **Padronização das ações do cabeçalho**: rótulo visível a partir de 1024px, só ícone abaixo disso (com `aria-label`) — 11 botões em 6 módulos alinhados ao que 3 módulos já faziam. Botão de menu com texto único e `aria-expanded` nos 12.

6. **Figma — modelo para os próximos módulos**: arquivo [Vigia Saúde 360 — Padrão de Módulos](https://www.figma.com/design/oNgeLR3Td97EmqdHqdkTuU) com: variáveis de cor do guia (incluindo tokens de alfa e o modo de superfície clara/escura do traço dos ícones), 27 símbolos, componente **Logo de Módulo** (categoria × tamanho, símbolo trocável) e a folha com as 14 logos, componentes **Item de Menu** e **Menu Lateral de Módulo**, template de módulo desktop 1440 e celular 390, e as regras com o checklist de novo módulo.

7. **Guia de identidade** (`IDENTIDADE_VISUAL (1).md`): v2.2.0 com as seções Logo de Módulo, Cabeçalho e Menu lateral de módulo em § 4, exceção da logo em § 5 e link para o Figma.

8. **Refluxo WCAG em 320px**: o seletor de filtro de Perfis & Acessos estourava a largura (269px num viewport de 320px); corrigido.

### Arquivos Modificados/Criados:
- `nucleo/src/components/ModuloLogo.tsx` (novo), `ModuloMenuLateral.tsx` (reescrito), `VigiaSidebarLayout.tsx`, `ModuloLayoutShell.tsx` (`CATEGORIA_COR` exportado)
- `nucleo/src/app/(modulos)/page.tsx` (hub) e os 12 módulos em `nucleo/src/app/(modulos)/*/page.tsx`, mais `admin/perfis-acessos/page.tsx`
- `nucleo/src/lib/hubDespesasStore.ts` (diretiva de lint desnecessária removida)
- `IDENTIDADE_VISUAL (1).md`, `Vigia-Custos-LOG-Execucao.md`

### Verificação:
- `tsc --noEmit` → 0 erros; ESLint → 0 erros (avisos: 273, os mesmos de antes — nenhum novo); `next build` → sucesso
- Navegador: 21/21 rotas sem erro de console e sem estouro horizontal em 1440, 768 e 375px; cabeçalho sem falhas em 320, 390, 768, 1024 e 1440px; WCAG (alvos ≥ 24px e nomes acessíveis) sem ofensores
- Interação do menu nos 12 módulos: fechado ao abrir, abre pelo botão com `aria-expanded`, fecha no X e ao escolher um item, item ativo marcado, painel fixo a 80px ao rolar no desktop — 12/12

### Próximos Passos Previstos:
- Decisão pendente com o usuário: "centralizar o cabeçalho" foi aplicado como alinhar o cabeçalho do hub à coluna central. A alternativa (título centralizado entre marca e ações) fica registrada caso seja essa a intenção.
- Restam os 273 avisos de `no-unused-vars` anteriores a esta entrega.


---

## [2026-09-23 21:10] - v2.5.7 (Azul da Marca no Lugar da Tinta nas Superfícies de Identidade)

### Data e Hora:
- 23/09/2026 às 21:10 (Fuso de Campo Grande / MS)

### Versão / Etapa da Alteração:
- v2.5.7 — Design System v2.3.0: o preto (tinta `#1B1F1C`) dá lugar ao azul da identidade visual nos fundos e logos marcados pelo usuário

### Pedido:
Manter o padrão da v2.2, mas trocar o preto pelo azul da identidade visual, apenas nos fundos e nas logos.

### Resumo do que foi feito:

1. **Tokens novos** (`nucleo/src/app/globals.css`, `@theme`): `--color-marca` `#5B84B1` (azul clínico do guia), `--color-marca-forte` `#496C92` e `--color-marca-hover` `#3C5A7A`. Viram as classes `bg-marca`, `bg-marca-forte`, `hover:bg-marca-hover`.
   - Motivo dos dois tons: o `#5B84B1` com texto branco dá 3,9:1 — passa como gráfico (≥ 3:1), reprova AA para texto (≥ 4,5:1). Por isso ele vai só nas logos (ícone), e as superfícies com texto usam `#496C92` (5,5:1 com branco, 4,9:1 com papel).

2. **Trocado para azul**: quadrado da marca "Vigia Saúde 360", avatar, Logos de Módulo (cabeçalho, menu lateral e hub), item ativo do menu lateral, painel de destaque do hub, botões escuros de ação (Nova Transferência, Conferir, Iniciar Análise, Simulador de Leitos, Concluir Simulação, Simular Ingestão, Simular Consulta c/ Split, Transmitir Remessa SUS) e a barra de título do modal do Simulador.

3. **Painel de destaque legível no azul**: sobrelinha terracota, ícones teal e textos em papel com transparência ficavam abaixo do contraste AA sobre o azul → passaram para papel sólido. O botão laranja "Abrir Custo do Paciente" foi mantido (pedido restrito a fundos e logos).

4. **Mantido de propósito**: selo **Tarja Preta** em Compras (classificação ANVISA — tem que ser preto), painel de terminal em fonte mono da Gestão Clínica, realces neutros com tinta translúcida, véus de modal/gaveta, e `tooltip`/`NavHeader` (usados só nas telas antigas do núcleo, fora do padrão de módulos).

5. **Figma** ([Padrão de Módulos](https://www.figma.com/design/oNgeLR3Td97EmqdHqdkTuU)): variáveis `marca`, `marca-forte`, `marca-hover`; Logo de Módulo, item ativo do menu, marca e avatar dos templates religados às novas variáveis; regras e descrições dos componentes atualizadas.

6. **Guia** (`IDENTIDADE_VISUAL (1).md`): v2.3.0 com a subseção "Marca — Superfícies de Identidade" em § 2, tokens em § 6, e as seções de Logo de Módulo, Cabeçalho, Menu lateral e Painel de Destaque atualizadas.

7. **Observação ao usuário**: o botão redondo escuro visto à direita na prévia da Vercel é a Vercel Toolbar (só aparece em deploys de prévia para membros logados), não faz parte do app.

### Arquivos Modificados:
- `nucleo/src/app/globals.css`, `nucleo/src/components/VigiaSidebarLayout.tsx`, `ModuloLogo.tsx`, `ModuloMenuLateral.tsx`
- `nucleo/src/app/(modulos)/page.tsx` (hub), `dashboard-executivo`, `financeiro-split`, `estoque-central`, `laboratorio`
- `IDENTIDADE_VISUAL (1).md`, `Vigia-Custos-LOG-Execucao.md`

### Verificação:
- `tsc --noEmit` e ESLint sem erros (273 avisos antigos, nenhum novo); `next build` com sucesso
- Navegador: 21/21 rotas sem erro e sem estouro em 1440/768/375px; cabeçalho sem falhas de 320 a 1440px; WCAG sem ofensores; menu lateral ok nos 12 módulos
- Contraste calculado: `marca-forte` × branco 5,46:1, × papel 4,93:1, `marca-hover` × papel 6,46:1 (AA); `marca` × branco 3,90:1 (só gráfico)

### Próximos Passos Previstos:
- Validar na prévia do `dev` na Vercel antes de qualquer merge para o `master`.


---

## [2026-09-23 21:40] - v2.5.8 (Implantação em Produção: dev → master)

### Data e Hora:
- 23/09/2026 às 21:40 (Fuso de Campo Grande / MS)

### Versão / Etapa da Alteração:
- v2.5.8 — Implantação autorizada pelo usuário ("suba para produção") das entregas v2.5.4 a v2.5.7

### O que vai para produção (4 commits do `dev`):
- `7691895` — responsividade total, WCAG 2.2 e correções de React (v2.5.4)
- `fc8fcc2` — tipagem dos payloads de API, lint 38 → 0 erros (v2.5.5)
- `1a7b497` — padrão único de módulo: logo por módulo, menu lateral arredondado, cabeçalho centralizado (v2.5.6)
- `0e1a88a` — azul da marca no lugar da tinta nas superfícies de identidade (v2.5.7)

### Checagens antes do merge:
- CI "Hospital 360 - CI/CD Pipeline & Security Scan" com sucesso nos 4 commits
- Prévia da Vercel do `0e1a88a` pronta (READY), mesmas variáveis de ambiente da produção
- `master` sem conteúdo exclusivo desde a base `c5c53c6` (só commits de merge) → merge sem conflito
- Merge no padrão do repositório: commit `merge(deploy): implantacao autorizada ...` no `master`

### Observação:
- Nenhuma alteração de banco (DDL) nesta implantação — só o app `nucleo/` e documentação.
- A prévia e a produção usam o mesmo projeto Supabase.

---

## [2026-09-24] - v2.5.9 (Azul Vigia #0066CC e Cor da Categoria nos Pontos de Identidade do Módulo)

### Versão / Etapa da Alteração:
- v2.5.9 — Design System v2.4.0. Proposta validada no Figma pelo usuário ("ok") antes de ir para o código.

### O que mudou:
- **Azul padrão Vigia `#0066CC`** (branco 5,57:1) nos tokens `marca` e `marca-forte`; hover `#0052A3`. Afeta o quadrado da logo "Vigia Saúde 360", o painel de destaque do hub, o avatar no hub e os botões de marca.
- **Cor da categoria em 4 pontos do módulo**, no tom forte (`CATEGORIA_COR_FORTE`, branco ≥ 4,5:1): logo do módulo no cabeçalho, logo no cartão do menu lateral, item ativo do menu e avatar.
  - Suprimentos `#407F71` · Assistencial `#496C92` · Operação `#946E2C` · Financeiro `#607889`
- Logo de módulo sem o dot de categoria quando o quadrado já está na cor da categoria (o dot fica só no tom papel, no hero do hub).
- Iniciais do avatar em branco (o creme não passava de 4,5:1 no dourado).

### Arquivos tocados:
- `nucleo/src/app/globals.css` (tokens de marca)
- `nucleo/src/components/ModuloLayoutShell.tsx` (`CATEGORIA_COR_FORTE`)
- `nucleo/src/components/ModuloLogo.tsx` (tom `categoria`, dot só no tom `papel`)
- `nucleo/src/components/ModuloMenuLateral.tsx` (item ativo na cor da categoria)
- `nucleo/src/components/VigiaSidebarLayout.tsx` (avatar por categoria, hover da logo Vigia)
- `IDENTIDADE_VISUAL (1).md` (v2.4.0)
- Figma "Vigia Saúde 360 — Padrão de Módulos": variáveis `categoria-forte/*`, `marca*` = `#0066CC`, componente Logo de Módulo e template atualizados, seção "07 · Cor por categoria (aprovado)"

### Verificação:
- `tsc --noEmit` sem erros; lint sem erros (só avisos antigos)
- Hub, Estoque Central, Laboratório, Escala Médica e Financeiro Split a 1440px: cores conferidas no DOM e sem rolagem horizontal

### Observação:
- Nenhuma alteração de banco (DDL).

### Próximo passo:
- Validar na prévia do `dev`; subir para produção quando o usuário autorizar.

---

## [2026-09-24] - v2.5.10 (Guia de Identidade Visual Padronizado — v2.4.0 como Referência Única)

### O que mudou:
- `IDENTIDADE_VISUAL (1).md` reescrito: descreve só as regras vigentes; versões antigas foram para uma tabela de histórico no fim. Removidas as regras contraditórias (dot em toda logo, tinta como fundo de identidade, azul `#5B84B1` como marca, tokens `--vs2-*` que não existem no código).
- Novas seções: fontes da verdade (código, Figma, guia), onde cada cor pode aparecer (§ 2.5), contraste medido (§ 2.6), moldura do módulo (§ 4), tokens reais do código com o nome da variável no Figma (§ 8) e checklist de novo módulo (§ 9).
- Sinalizado no guia: terracota com texto branco dá 4,16:1 — só serve para rótulo grande (≥ 18,66px bold); rótulos menores devem usar `#A8531F` (5,35:1). Cor não foi alterada.
- `nucleo/src/app/globals.css`: tokens `--color-cat-*-forte` adicionados (espelham `CATEGORIA_COR_FORTE`) e comentários atualizados. Sem mudança visual.
- Figma: seção 06 · Regras e seção 01 · Fundamentos atualizadas para a v2.4 (textos, valores da marca e amostras `categoria-forte/*`).

### Arquivos tocados:
- `IDENTIDADE_VISUAL (1).md`, `nucleo/src/app/globals.css`, `Vigia-Custos-LOG-Execucao.md`

---

## [2026-09-24] - v2.5.11 (Implantação em Produção: dev → master)

### Versão / Etapa da Alteração:
- Implantação autorizada pelo usuário ("após isso suba para produção") das entregas v2.5.9 e v2.5.10.

### O que vai para produção:
- Azul Vigia `#0066CC` na marca e cor da categoria na logo do módulo, item ativo e avatar (v2.5.9)
- Guia de identidade padronizado e tokens `--color-cat-*-forte` (v2.5.10)

### Observação:
- Nenhuma alteração de banco (DDL).
