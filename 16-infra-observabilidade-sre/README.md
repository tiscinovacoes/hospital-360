# Módulo 16 — Infraestrutura de Observabilidade SRE (Prometheus + Grafana + Loki)

## Visão Geral
O módulo `16-infra-observabilidade-sre/` fornece telemetria em tempo real para todo o ecossistema **Hospital 360**. Monitora métricas RED (*Rate, Errors, Duration*) e USE (*Utilization, Saturation, Errors*) de todos os 15 módulos.

## Componentes da Stack
- **Prometheus** (`:9090`): Coleta de métricas e alertas de SLA.
- **Grafana** (`:3001`): Dashboards executivos de saúde do hospital e tempo de resposta p99.
- **Loki** (`:3100`): Agregador centralizado de logs estruturados em JSON.
- **Promtail**: Coletor de logs dos containers Docker.

## Execução Local
```bash
docker-compose up -d
```
