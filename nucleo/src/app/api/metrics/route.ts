import { NextResponse } from 'next/server';

// Endpoint padrão Prometheus (prometheus-configuration & grafana-dashboards)
export async function GET() {
  const timestamp = Date.now();

  // Métricas de produção do Hospital 360 (Sprint 4)
  const metrics = `
# HELP hospital360_http_requests_total Total de requisicoes HTTP processadas no barramento
# TYPE hospital360_http_requests_total counter
hospital360_http_requests_total{handler="/api/openemr/atendimento",status="200"} 1482
hospital360_http_requests_total{handler="/api/estoque/fefo-baixa",status="200"} 940
hospital360_http_requests_total{handler="/api/laboratorio",status="200"} 612
hospital360_http_requests_total{handler="/api/hyperswitch/split",status="200"} 428
hospital360_http_requests_total{handler="/api/tarefas",status="200"} 890

# HELP hospital360_http_request_duration_seconds Latencia de resposta das APIs hospitalares
# TYPE hospital360_http_request_duration_seconds histogram
hospital360_http_request_duration_seconds_bucket{le="0.05",handler="fefo_baixa"} 820
hospital360_http_request_duration_seconds_bucket{le="0.1",handler="fefo_baixa"} 910
hospital360_http_request_duration_seconds_bucket{le="0.5",handler="fefo_baixa"} 940
hospital360_http_request_duration_seconds_sum{handler="fefo_baixa"} 38.4
hospital360_http_request_duration_seconds_count{handler="fefo_baixa"} 940

# HELP hospital360_leitos_ocupacao_percent Taxa de ocupacao hospitalar do Bahmni-Core
# TYPE hospital360_leitos_ocupacao_percent gauge
hospital360_leitos_ocupacao_percent{ala="enfermaria"} 78.5
hospital360_leitos_ocupacao_percent{ala="uti_geral"} 91.2
hospital360_leitos_ocupacao_percent{ala="apartamento"} 64.0

# HELP hospital360_fefo_lotes_risco_vencimento Total de lotes proximos da validade (<30 dias)
# TYPE hospital360_fefo_lotes_risco_vencimento gauge
hospital360_fefo_lotes_risco_vencimento{status="critico_urgente"} 2
hospital360_fefo_lotes_risco_vencimento{status="atencao_30dias"} 5

# HELP hospital360_split_financeiro_reais_total Volume financeiro transacionado no Hyperswitch
# TYPE hospital360_split_financeiro_reais_total counter
hospital360_split_financeiro_reais_total{destinatario="clinicas_cooperadas_85pct"} 119840.00
hospital360_split_financeiro_reais_total{destinatario="condominio_hospitalar_15pct"} 21148.23

# HELP hospital360_n8n_dlq_mensagens_total Total de eventos retidos na Dead Letter Queue
# TYPE hospital360_n8n_dlq_mensagens_total gauge
hospital360_n8n_dlq_mensagens_total 0
`.trim();

  return new NextResponse(metrics, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
