# Módulo 06 — Compras & Suprimentos (ERPNext / Frappe)

## Visão Geral
O módulo `06-modulo-compras-suprimentos/` é baseado no ERPNext (Python / Frappe Framework) para gestão de cotações, ordem de compra de insumos hospitalares e validação de preços governamentais.

## Integração com CMED / BPS / CATMAT (`15-modulo-base-precos-cmed/`)
Antes da aprovação de qualquer Ordem de Compra ou Cotação de Fornecedor, o ERPNext consulta o validador de preços:
- **Status ILLEGAL**: Preço acima do teto de mercado CMED/ANVISA (Compra bloqueada).
- **Status WARNING**: Preço acima do preço de referência SUS BPS (Alerta de negociação).
- **Status OK**: Preço dentro das tabelas governamentais.
