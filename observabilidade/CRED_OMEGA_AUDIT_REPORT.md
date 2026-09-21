---
ciso: SAFE-CHECK / CRED-OMEGA Enterprise
data: 2026-09-21
status: HOMOLOGADO_SEGURO
escopo: Hospital 360 Repository & Integrations
tags:
  - cred-omega
  - secrets-management
  - zero-trust
  - ciso
---

# Relatório CISO Enterprise: Auditoria de Credenciais & Segredos (CRED-OMEGA)

> [!important] Veredito do CISO Operacional
> **STATUS: CONFORME (ZERO EXPOSIÇÃO DE SEGREDOS)**  
> Nenhuma chave de API de produção, `service_role_key` de banco, certificado mTLS ou token de mensageria foi encontrada exposta em arquivos rastreados pelo Git ou no front-end client-side.

---

## 1. Varredura dos 5 Pilares Inegociáveis

| Pilar | Status | Evidência & Implementação |
| :--- | :--- | :--- |
| **1. DESCOBRIR** | ✅ CONFORME | Mapeadas todas as variáveis sensíveis (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `N8N_HMAC_SECRET`, `HYPERSWITCH_API_KEY`). |
| **2. ELIMINAR EXPOSIÇÃO** | ✅ CONFORME | Arquivo `.env` inserido no `.gitignore`. Criação do template sanitizado [`.env.example`](file:///.env.example). |
| **3. REDUZIR BLAST RADIUS** | ✅ CONFORME | Front-end Next.js consome apenas chave pública (`anon-key`) protegida por Row Level Security (RLS). Ações administrativas executadas apenas no backend server-side. |
| **4. MODERNIZAR AUTENTICAÇÃO** | ✅ CONFORME | Webhooks usam assinatura digital HMAC-SHA256 (`x-signature-hmac-sha256`) com expiração de replay attack. |
| **5. IMPLANTAR GOVERNANCA** | ✅ CONFORME | Bloqueio automatizado de commit de credenciais no GitHub Actions CI (`ci-hospital360.yml`). |

---

## 2. Inventário de Variáveis & Recomendações de Rotação

- **Supabase**: Rotação semestral ou imediata em caso de commit involuntário.
- **Hyperswitch API**: Chaves segregadas por tenant (chave da Sala 204 isolada da Sala 301).
- **Poli WhatsApp (Baileys)**: Sessões criptografadas armazenadas em diretório protegido contra leitura externa.
