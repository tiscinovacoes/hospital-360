# Resenha Executiva — AIVIQ Saúde & Custeio do Paciente
## *Inteligência que Transforma Visão em Decisões*

---

## 🚀 1. A Marca AIVIQ e o Propósito Institucional

A **AIVIQ** nasce da união perfeita entre três pilares fundamentais:
* **AI** (*Artificial Intelligence*): A vanguarda em Inteligência Artificial aplicada ao setor público.
* **VI** (*Vision*): A visão estratégica para enxergar além dos números e antecipar o futuro.
* **IQ** (*Intelligence Quotient*): O quociente de inteligência analítica que transforma volumes massivos de dados em decisões assertivas.

> **Slogan**: *"Inteligência que transforma visão em decisões."*

### 💎 Nossos Valores Fundamentais:
1. **Confiança**: Segurança de dados (RLS multi-tenant) e transparência auditável em cada informação.
2. **Visão**: Capacidade analítica para enxergar gargalos operacionais e antecipar o futuro da saúde pública.
3. **Inteligência**: Transformação de dados operacionais brutos em conhecimento acionável e economia real.
4. **Evolução**: Inovação contínua para gerar impacto positivo na vida do cidadão e nos cofres públicos.

---

## 📌 2. Visão Geral do Sistema AIVIQ

O **AIVIQ Saúde (módulo Vigia Custos)** não é um mero sistema contábil estático ou uma planilha congelada de rateio. Trata-se de um **ecossistema de inteligência e governança pública** desenhado para a realidade dos municípios brasileiros.

A plataforma atua em duas frentes integradas:
1. **Gestão Operacional na Ponta (Módulos Satélites AIVIQ)**: Resolve os desafios cotidianos das secretarias — controle de estoque de medicamentos por lote e validade (FEFO), gestão de folha e alocação de servidores, contratos de terceirização, ativos patrimoniais com depreciação linear, agendamentos de consultas e gestão de leitos hospitalares.
2. **Jornada Unificada do Cidadão por CPF/NIS (Núcleo AIVIQ)**: Ingere os dados operacionais desses módulos em tempo real vinculados ao **CPF ou NIS do paciente**, reconstruindo a jornada completa de atendimento e calculando o **custo real exato** despendido pelo município para cada cidadão.

---

## 🧩 3. Arquitetura Modular do Ecossistema AIVIQ

Para apurar o custo real de um atendimento na rede pública, não basta somar o preço do medicamento. A AIVIQ estrutura a gestão pública através de módulos operacionais plugáveis:

```
                          ┌────────────────────────────────┐
                          │     CPF / NIS do Paciente      │
                          └───────────────┬────────────────┘
                                          │
    ┌───────────────────┬─────────────────┼─────────────────┬───────────────────┐
    ▼                   ▼                 ▼                 ▼                   ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│  AIVIQ RH    │ │AIVIQ Estoque │ │AIVIQ Compras │ │ AIVIQ Agenda │ │  AIVIQ Leitos    │
│ Servidores & │ │ Farmácia &   │ │  & Patrimônio│ │Consultas &   │ │ Internação &     │
│  Custo/Hora  │ │ Insumos FEFO │ │ Terceirizados│ │Atendimentos  │ │ Enfermaria / UTI │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘
       │                │                │                │                  │
       └────────────────┴───────┬────────┴────────────────┴──────────────────┘
                                │ (RPC / Ingestão por CPF)
                                ▼
                   ┌──────────────────────────┐
                   │   AIVIQ CUSTOS (Núcleo)  │
                   │ Motor Absorção + ABC +   │
                   │  Comparativo SIGTAP/SUS  │
                   └──────────────────────────┘
```

### 📋 Módulos Operacionais Integrados:
* **AIVIQ RH (Recursos Humanos & Escalas)**: Cadastra servidores públicos e terceirizados, gerencia vínculos trabalhistas (efetivos, comissionados, contratados), calcula o custo/hora exato (salário base + encargos + benefícios) e aloca a força de trabalho entre os Centros de Custo.
* **AIVIQ Estoque (Farmácia & Almoxarifado)**: Controla medicamentos e insumos médicos por lote e data de validade (estratégia FEFO - *First Expire, First Out*). Cada dispensação na farmácia é automaticamente debitada do estoque e associada à jornada do cidadão.
* **AIVIQ Compras & Patrimônio**: Gerencia notas fiscais de serviços indiretos (limpeza, vigilância, lavanderia, manutenção) e realiza a depreciação linear automática de equipamentos hospitalares e instalações físicas.
* **AIVIQ Agenda (Atenção Básica & Ambulatorial)**: Registra agendamentos e consultas médicas, convertendo o tempo de atendimento do profissional em evento de custo direto.
* **AIVIQ Leitos (Atenção Hospitalar)**: Gerencia admissões, diárias de leito em enfermaria/UTI, transferências e altas hospitalares.
* **AIVIQ Faturamento / SUS (Inteligência Financeira)**: Importa e cruza a Tabela SIGTAP/DATASUS do Ministério da Saúde com os custos apurados pelo município, revelando o déficit real de repasse do SUS.

---

## 🏛️ 4. Onde a AIVIQ Transforma a Gestão Pública

### A. Transparência e Prestação de Contas Auditável (TCE / CGU / Ministério Público)
- **Trilha de Auditoria Nativa**: Cada alteração em matrizes de rateio, cadastros de centros de custo ou regras de cálculo é gravada com carimbo de data, hora e responsável.
- **Rigor de Governança**: Proteção de dados multi-tenant por Row Level Security (RLS), garantindo isolamento total entre municípios e cumprimento estrito da LGPD.

### B. Evidência Científica do Déficit da Tabela SUS
- **Custo Real vs. Repasse Federal**: O sistema demonstra com dados matemáticos incontestáveis a defasagem dos repasses do SUS.
- *Exemplo Prático*: Uma internação por pneumonia que custa **R$ 992,50** ao município tem um repasse SIGTAP de apenas **R$ 305,50**. A AIVIQ prova que o SUS cobre apenas **30,8%** do custo real, justificando com precisão o aporte do tesouro municipal.

### C. Eficiência Orçamentária e Combate ao Desperdício
- **Prevenção de Perdas de Medicamentos**: A gestão FEFO evita que lotes vençam nas prateleiras dos postos de saúde.
- **Detecção de Ociosidade e Gargalos**: Evidencia postos de saúde com sobrecarga ou subutilização de pessoal e equipamentos.
- **Padronização de Custos por Procedimento**: Permite comparar o custo médio de uma mesma consulta ou procedimento entre diferentes UBSs do próprio município.

### D. Metodologia de Custeio Dual (Absorção + ABC)
- **Custeio por Absorção**: Utilizado para a rede geral (UBSs, postos de saúde, enfermarias), distribuindo custos indiretos (limpeza, recepção, energia) via direcionadores configuráveis (área m², nº de funcionários, consumo).
- **Custeio Baseado em Atividades (ABC)**: Aplicado em setores críticos de altíssimo custo (UTIs e Centros Cirúrgicos), medindo direcionadores específicos como horas de ventilador pulmonar, tempo de sala cirúrgica e porte de equipe.

---

## 🎨 5. Especificações Técnicas de Marca & Identidade Visual

| Elemento | Especificação | Aplicação no Sistema / Apresentação |
|---|---|---|
| **Marca** | **AIVIQ** | Nome oficial da solução e empresa |
| **Slogan** | *Inteligência que transforma visão em decisões* | Header de relatórios, dashboards e apresentações |
| **Fundo Escuro** | `#0C111D` | Modos escuro da UI, cards executivos e capas de apresentações |
| **Azul Marinho** | `#1A244A` | Superfícies secundárias, containers de módulos e cabeçalhos |
| **Azul Elétrico** | `#2563EB` | Botões primários, links ativos, indicadores de Inteligência (AI) |
| **Roxo/Violeta** | `#7C3AED` | Indicadores de Visão (VI) e métricas analíticas avançadas |
| **Coral Vermelho** | `#EF4444` | Destaques de alertas, déficits do SUS e indicadores de ação (IQ/Decisão) |
| **Tipografia** | **Montserrat** | Fonte padrão para títulos, numéricos de métricas e corpo de texto |

---

## 💡 6. Conclusão para Apresentação Executiva (NotebookLM)

A **AIVIQ** representa um divisor de águas na administração pública municipal. Ela rompe com a gestão baseada em estimativas e entrega aos prefeitos, secretários de saúde e órgãos de controle (TCE-MS, CGU) uma **plataforma de inteligência estratégica**.

Ao unir **módulos operacionais na ponta** com um **motor de custeio inteligente por CPF/NIS**, a AIVIQ não apenas responde *"quanto custa a saúde do município"*, mas indica exatamente **onde investir, onde economizar e como transformar visão em decisões que geram impacto real na vida do cidadão**.
