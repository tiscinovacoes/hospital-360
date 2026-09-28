# 01-MODULO-CLINICAS — OpenEMR v7.0 (Clínicas Médicas Autônomas)

> **Módulo:** 01-modulo-clinicas  
> **Squad:** Squad 2 (Clínicas Médicas Autônomas & Prontuário OpenEMR)  
> **Stack:** PHP 8.2+, MariaDB 10.11, Docker, Nginx, Next.js (`/gestao-clinica`).  
> **Responsabilidade:** Prontuário eletrônico de pacientes, anamnese, prescrição digital, triagem Manchester, chamada de consultório e disparo de webhooks de prescições/exames.

---

## 🚀 Como Rodar Localmente (Docker)

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env.local

# 2. Subir o container isolado (PHP-FPM + Nginx + MariaDB Multi-Tenant)
docker compose up -d --build

# 3. Verificar saúde do serviço
docker compose ps
```

O painel OpenEMR estará disponível em `http://localhost:8081` e a tela web em `http://localhost:3000/gestao-clinica`.

---

## 🔒 Conformidade Regulatória RN-IND & LGPD

O banco de dados MariaDB utiliza **Esquemas Isolados por Tenant (`openemr_tenant_*`)**.
Usuários administradores do condomínio hospitalar **NÃO possuem permissão SELECT** no esquema de prontuários médicos, garantindo blindagem contra vazamento de informações sigilosas.
