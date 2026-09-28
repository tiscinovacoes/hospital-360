# 02-MODULO-LABORATORIO — SENAITE LIMS (Laboratório de Análises Clínicas)

> **Módulo:** 02-modulo-laboratorio  
> **Squad:** Squad 3 (Laboratório LIMS & Diagnóstico SENAITE)  
> **Stack:** Python 3.11+, SENAITE LIMS, Plone/Zope, PostgreSQL, Docker, Next.js (`/laboratorio`).  
> **Responsabilidade:** Gestão de amostras biológicas, ordens de serviço (WorkOrders), etiquetas com código de barras, bancadas analíticas, apuração de custo por reagente/tempo e emissão de laudos em PDF.

---

## 🚀 Como Rodar Localmente (Docker)

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env.local

# 2. Subir a infraestrutura LIMS (SENAITE + ZEO + PostgreSQL)
docker compose up -d --build

# 3. Checar a saúde do container
docker compose ps
```

A interface do SENAITE LIMS estará disponível em `http://localhost:8082` e a tela integrada em `http://localhost:3000/laboratorio`.

---

## 📡 Endpoints Públicos de Integração

*   `POST /api/senaite/workorder` — Recebe ordens de serviço de exames vindas do OpenEMR ou barramento n8n.
*   `GET /api/senaite/catalogo` — Retorna o catálogo de testes com parâmetros, valores de referência e custos de reagente.
*   `POST /api/senaite/laudo` — Emite laudo em PDF assinado digitalmente.
