# Módulo 04 — Estoque, Farmácia & Dispensação FEFO (OpenBoxes)

## Visão Geral
O módulo `04-modulo-estoque-farmacia/` é responsável pela gestão física e lógica de farmácias hospitalares, controle de estoque por lote e aplicação rigorosa da regra **FEFO** (*First Expired, First Out* — Primeiro que Vence, Primeiro que Sai).

## Arquitetura & Stack
- **Engine de Estoque**: OpenBoxes (Java / Grails / Spring Boot) + MariaDB 10.11 / MySQL.
- **Rastreabilidade**: Controle individual por Código BR / CATMAT, número de lote, data de fabricação, data de vencimento e temperatura de conservação.
- **Isolamento Multi-tenant**: Compatível com as diretrizes da **RN-IND** e LGPD via `tenant_id`.

## Regras de Negócio FEFO
1. Ao receber um evento `openemr.prescricao_emitida`, a reserva de estoque busca automaticamente o lote com a **menor data de validade** que possua saldo positivo.
2. Lotes vencidos ou em quarentena são bloqueados imediatamente para dispensação.
3. Notificação assíncrona ao módulo `05-modulo-wms-intralogistica/` para separação (*Pick & Pack*) e transporte ao leito/unidade solicitante.

## Execução Local
```bash
docker-compose up -d
```
