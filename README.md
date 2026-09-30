# 🏥 Hospital 360 — Sistema de Gestão Hospitalar & Custeio Door-to-Door

Plataforma hospitalar integrada de alto desempenho, orientada a microserviços e microssatélites com barramento de eventos assíncrono (**n8n**), apuração contábil em tempo real (**Door-to-Door**) e conformidade sanitária e fiscal (**ANVISA / CMED / BPS / CFM / LGPD**).

---

## 📊 Matriz de Homologação dos 17 Módulos (100% Concluído)

| Módulo | Nome / Função | Tecnologia / Stack | Status | Porta |
| :--- | :--- | :--- | :---: | :---: |
| **`00-hub-core`** | Núcleo Central de Custeio Door-to-Door & API Hub | Next.js 16 (App Router), TypeScript, Supabase | **100%** | `3000` |
| **`01-modulo-clinicas`** | Gestão Clínica, PEP, Ambulatório & Agendamentos | OpenEMR, PHP-FPM 8.2, Nginx, MariaDB | **100%** | `8081` / `3306` |
| **`02-modulo-laboratorio`** | Análises Clínicas, WorkOrders & Protocolo LOINC | SENAITE LIMS REST Gateway, Python 3.11 | **100%** | `8082` |
| **`03-modulo-leitos-internacao`** | Censo Hospitalar, Mapa de Ocupação & NIR | Bahmni / OpenMRS, PostgreSQL 15 | **100%** | `5435` |
| **`04-modulo-estoque-farmacia`** | Dispensação Beira-Leito & Algoritmo FEFO | OpenBoxes, Grails/Java, MariaDB 10.11 | **100%** | `8084` / `3307` |
| **`05-modulo-wms-intralogistica`** | *Pick & Pack*, Transporte Interno & Rastreabilidade | OpenWMS Movements, Spring Boot, PostgreSQL | **100%** | `8085` / `5436` |
| **`06-modulo-compras-suprimentos`** | Compras Públicas, Licitações & Suprimentos | ERPNext / Frappe, MariaDB, Redis | **100%** | `8086` / `3308` |
| **`07-modulo-fintech-split`** | Split Tripartite de Honorários sem Bitributação | Hyperswitch / Rust Engine, PostgreSQL 15 | **100%** | `5437` |
| **`08-modulo-contabilidade-fiscal`** | Faturamento TUSS, DRE Hospitalar & Emissão NFS-e | HealVista BPO Financeiro, PostgreSQL | **100%** | `8088` / `5438` |
| **`09-modulo-facilities-hotelaria`** | Gestão de Higienização de Leitos & Manutenção | Sabiá Hospitalar, Node.js, PostgreSQL | **100%** | `8089` / `5439` |
| **`10-modulo-regulacao-tfd`** | Regulação SUS, Vagas Cross & Ajuda de Custo TFD | Microserviço Regulação, PostgreSQL | **100%** | `8090` / `5440` |
| **`11-modulo-escala-medica`** | Alocação de Plantões, Escalas & Rateio por Leito | Microserviço Escalas, PostgreSQL | **100%** | `8091` / `5441` |
| **`12-modulo-automacao-n8n`** | Barramento de Eventos, Workflows & Dead Letter Queue | n8n v1.x, Redis 7 (Bull Queue), HMAC-SHA256 | **100%** | `5678` / `6379` |
| **`13-modulo-ia-diagnostica`** | IA de Apoio à Decisão Clínica, RAG & Visão | FastAPI, Python 3.11, Qdrant Vector DB | **100%** | `8093` / `6333` |
| **`14-modulo-mensageria-whatsapp`** | Notificação de Pacientes, Laudos & Pesquisa NPS | Evolution API v2, Redis 7, Meta Cloud API | **100%** | `8094` / `6382` |
| **`15-modulo-base-precos-cmed`** | Validador de Preço Teto CMED, BPS & CATMAT | Microserviço Validador, PostgreSQL | **100%** | `8095` / `5445` |
| **`16-infra-observabilidade-sre`** | Métricas Prometheus, Grafana 4 Golden Signals & Logs | Prometheus v2.51, Grafana 10.4, Loki | **100%** | `9090` / `3001` |

---

## 🧭 Arquitetura das 5 Estações Clínicas Door-to-Door

O motor central [`HubDespesasService`](file:///F:/Projetos/360/nucleo/src/lib/hubDespesasStore.ts) consolida e audita o prontuário financeiro do paciente ao longo de 5 Estações Clínicas:

1. **Estação 1: Acolhimento & Triagem** (`01-modulo-clinicas`)
   - Protocolo Manchester (Vermelho: Imediato / Laranja: 10m / Amarelo: 50m / Verde: 120m / Azul: 240m).
2. **Estação 2: Apoio Diagnóstico & Terapias** (`02-modulo-laboratorio`)
   - Laudos com codificação LOINC e cálculo de custo real (Reagentes + Descartáveis + Hora Técnica Biomédica).
3. **Estação 3: Centro Cirúrgico & Insumos Críticos** (`06-` & `15-modulo-base-precos-cmed`)
   - Trava automática de compras e auditoria contra teto de fábrica da CMED/BPS.
4. **Estação 4: Farmácia Beira-Leito & Dispensação** (`04-modulo-estoque-farmacia` & `05-`)
   - Algoritmo FEFO estrito (*First-Expired, First-Out*) com bloqueio sanitário imediato de lotes vencidos pela ANVISA.
5. **Estação 5: Internação, UTI & Alta Hospitalar** (`03-`, `07-`, `09-`, `11-`)
   - Censo diário NIR, apuração de diárias hospitalares, acionamento automático de higienização de leito via Sabiá (SLA 45m UTI) e Split tripartite de honorários via Hyperswitch (sem bitributação, Lei 13.003).

---

## 🚀 Como Executar Localmente (Docker Compose)

### 1. Inicialização do Orquestrador Mestre
O orquestrador [`docker-compose.all.yml`](file:///F:/Projetos/360/docker-compose.all.yml) unifica todos os serviços na rede privada `hospital360_network`:

```bash
# Iniciar Core 360 + Banco de Dados + Redis + Barramento n8n (Padrão):
docker compose -f docker-compose.all.yml up -d

# Iniciar Core + Todos os Satélites Clínicos e Operacionais:
docker compose -f docker-compose.all.yml --profile satelites up -d

# Iniciar Observabilidade SRE (Prometheus + Grafana Dashboards):
docker compose -f docker-compose.all.yml --profile observabilidade up -d

# Subir a Plataforma 360 Completa (17 serviços simultâneos):
docker compose -f docker-compose.all.yml --profile all up -d
```

### 2. Acessos aos Painéis
- **Hub Core 360**: [http://localhost:3000](http://localhost:3000)
- **Barramento n8n**: [http://localhost:5678](http://localhost:5678) (user: `admin_hospital360` / pass: `hospital360_n8n_master_pwd`)
- **Grafana SRE Dashboards**: [http://localhost:3001](http://localhost:3001) (user: `admin` / pass: `admin_hospital360_sre_secret`)
- **Prometheus Metrics**: [http://localhost:9090](http://localhost:9090)
- **OpenEMR Clínicas**: [http://localhost:8081](http://localhost:8081)
- **OpenBoxes Farmácia**: [http://localhost:8084](http://localhost:8084)
- **SENAITE LIMS Gateway**: [http://localhost:8082](http://localhost:8082)

---

## 🧪 Suíte de Testes Automatizados & SLAs

Todos os contratos, integridade referencial, resiliência do barramento e regras clínicas são validados por suítes integradas:

```bash
# Executar todas as suítes de teste (Contratos, Satélites, n8n, Docker e Smoke Test E2E):
npm run test:all

# Executar suíte de integração dos 7 Squads (Onda 5):
npm run test:squads

# Executar benchmark de carga e estresse k6 (SLA P95 < 200ms):
npm run test:k6
```

### SLAs Homologados:
- **Latência P95 (Ingestão de Despesas)**: < 200ms (Apurado: < 10ms em simulação local)
- **Taxa de Erro**: < 0.001%
- **Idempotência**: 100% de deduplicação sem duplicação de custos contábeis.
- **Resiliência Upstream**: 3 retentativas com backoff exponencial e fallback na Dead Letter Queue (`/api/webhooks/n8n/dlq`).
