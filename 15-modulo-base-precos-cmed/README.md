# Módulo 15 — Base de Preços CMED, BPS e CATMAT (`cmed-bps-catmat-validator`)

## Visão Geral
Microserviço especializado no cruzamento e validação de preços de medicamentos em cotações públicas e hospitalares contra as tabelas oficiais do Governo Brasileiro:
- **CATMAT**: Normalização e padronização por Código BR de medicamentos.
- **BPS (Banco de Preços em Saúde)**: Preço de referência praticado no Sistema Único de Saúde (SUS).
- **CMED (Câmara de Regulação do Mercado de Medicamentos / ANVISA)**: Teto máximo permitido de preço de fábrica e consumidor.

## API Response Schema
```json
{
  "status": "OK" | "WARNING" | "ILLEGAL" | "NOT_FOUND",
  "supplier_price": 2.50,
  "bps_price": 2.00,
  "cmed_price": 3.00,
  "divergence_vs_bps_percent": 25.0,
  "divergence_vs_cmed_percent": -16.67,
  "reason": "Preço dentro do teto CMED mas acima da referência BPS",
  "recommendation": "FLAG for review",
  "audit_log_id": "val_abc123"
}
```
