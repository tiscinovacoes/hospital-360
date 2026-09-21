---
title: Relatório de Revisão Diferencial de Segurança (Differential Security Review)
projeto: Hospital 360
sprints: 1 a 4 (Go-Live Ready)
status: APROVADO_COM_RESSALVAS_DOCUMENTADAS
classificacao_risco: BAIXO_RESIDUAL
tags:
  - differential-review
  - appsec
  - owasp
  - rn-ind
---

# Relatório de Revisão Diferencial de Segurança — Hospital 360

> [!info] Metodologia & Escopo da Revisão
> Análise aprofundada dos diffs de código, migrations e contratos de API implementados ao longo do desenvolvimento das Sprints 1 a 4. Avaliação estrita de vetores de ataque em **Autenticação, Criptografia, Transferência de Valores e Segregação Regulatória**.

---

## 1. Classificação de Áreas Críticas & Diff Analysis

### 1.1 Transferência de Valores & Split Financeiro (Hyperswitch / Rust)
* **Vetor de Risco**: Race condition, arredondamento de float, desvio de fundos.
* **Diff Evidenciado**: Implementação em Rust 1.75+ em [`hyperswitch_split_engine.rs`](file:///integracoes/hyperswitch_split_engine.rs) utilizando inteiros `u64` para centavos:
  ```rust
  let clinica_centavos = (req.valor_total_centavos * self.percentual_clinica) / 100;
  let condominio_centavos = req.valor_total_centavos - clinica_centavos;
  ```
* **Conclusão AppSec**: **SEGURO**. A soma das partes é garantidamente idêntica ao total de entrada. Zero possibilidade de perda residual de centavos.

### 1.2 Segregação de Dados Clínicos vs Faturamento (RN-IND)
* **Vetor de Risco**: Exposição de CID-10 e prontuário médico de consultórios particulares à administração condominial.
* **Diff Evidenciado**: Na emissão de NFS-e municipal [`HealVistaContabilService.cs`](file:///integracoes/HealVistaContabilService.cs) e na rota [`api/contabil/nfse/route.ts`](file:///nucleo/src/app/api/contabil/nfse/route.ts), apenas o valor da taxa de condomínio (15%) e o número da transação são trafegados. Dados clínicos permanecem isolados no banco do OpenEMR.
* **Conclusão AppSec**: **SEGURO**. Conformidade total com a norma RN-IND.

### 1.3 Concorrência de Estoque FEFO (OpenBoxes)
* **Vetor de Risco**: Baixa duplicada do mesmo lote em dispensações simultâneas de pronto-socorro.
* **Diff Evidenciado**: Migration SQL [`20260921_otimizacao_fefo_lotes.sql`](file:///supabase/migrations/20260921_otimizacao_fefo_lotes.sql) implementando cursor com `FOR UPDATE SKIP LOCKED`.
* **Conclusão AppSec**: **SEGURO**. Sessões concorrentes não bloqueiam umas às outras e não causam dispensação fantasma.

---

## 2. Recomendações Pré-Go-Live
1. Manter a verificação de assinatura HMAC obrigatória em todas as rotas públicas de webhook.
2. Garantir que as chaves de API sejam injetadas apenas via GitHub Secrets em ambiente de produção.
