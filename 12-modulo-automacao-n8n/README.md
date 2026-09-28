# Módulo 12 — Automação de Workflows (n8n)

## Visão Geral
O módulo `12-modulo-automacao-n8n/` é o motor de orquestração de processos do **Hospital 360**. Conecta todos os 15 módulos através de fluxos visuais assíncronos no n8n.

## Workflows Nativos
1. **Lembrete de Consulta & Confirmação por WhatsApp**: Integração com Módulo 01 e 14.
2. **Alertas Críticos de Exames (LIMS)**: Notificação imediata ao médico assistente quando o SENAITE (Módulo 02) gera resultado em faixa crítica.
3. **Dispensação & Recomposição de Estoque**: Disparo de cotação no ERPNext (Módulo 06) ao atingir estoque mínimo no OpenBoxes (Módulo 04).

## Execução Local
```bash
docker-compose up -d
```
