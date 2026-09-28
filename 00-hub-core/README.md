# 00-HUB-CORE — Hospital 360 (Núcleo de Ingestão & Custeio Door-to-Door)

> **Módulo:** 00-hub-core  
> **Squad:** Squad 1 (Core 360, Hub de Ingestão & Motor de Custeio)  
> **Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, FastAPI, Supabase RLS, Docker.  
> **Responsabilidade:** Cockpit C-Level, Ingestão de relatórios de ERPs legados (MV, Tasy, Philips), Motor de Custeio Door-to-Door e consolidação contábil.

---

## 🚀 Como Rodar Localmente (Docker)

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env.local

# 2. Subir container isolado com Docker Compose
docker compose up -d --build

# 3. Verificar saúde do container
docker compose ps
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 📡 Endpoints de Ingestão (Sprint 1)

*   `POST /api/ingestao-modulos` - Ingestão de arquivos CSV/JSON de ERPs legados (MV, Tasy, Philips).
*   `GET /api/health` - Check de saúde do container e conectividade Supabase/PostgreSQL.

---

## 🔒 Segurança & Multi-Tenancy (RN-IND)

Todas as tabelas do Supabase possuem políticas RLS (Row Level Security) ativas em `supabase/migrations/`.
O condomínio hospitalar possui isolamento estrito: administradores prediais só visualizam faturamento consolidado e rateios de áreas comuns, sem acesso a dados de prontuário clínico.
