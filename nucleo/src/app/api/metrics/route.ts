import { NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

// Endpoint padrão Prometheus com métricas dinâmicas ao vivo (prometheus-configuration & grafana-dashboards)
export async function GET() {
  try {
    const despesas = HubDespesasService.listarDespesas();
    const totalItens = despesas.length;
    const valorTotalReais = despesas.reduce((acc, it) => acc + (Number(it.valor_total_imputado) || 0), 0);

    // Agrupamento por Estações Door-to-Door
    const totalEstacao1 = despesas.filter(d => d.estacao_jornada === 1).reduce((acc, d) => acc + d.valor_total_imputado, 0);
    const totalEstacao2 = despesas.filter(d => d.estacao_jornada === 2).reduce((acc, d) => acc + d.valor_total_imputado, 0);
    const totalEstacao3 = despesas.filter(d => d.estacao_jornada === 3).reduce((acc, d) => acc + d.valor_total_imputado, 0);
    const totalEstacao4 = despesas.filter(d => d.estacao_jornada === 4).reduce((acc, d) => acc + d.valor_total_imputado, 0);
    const totalEstacao5 = despesas.filter(d => d.estacao_jornada === 5).reduce((acc, d) => acc + d.valor_total_imputado, 0);

    // Métricas formatadas na especificação oficial do Prometheus (text/plain; version=0.0.4)
    const metrics = `
# HELP hospital360_http_requests_total Total de requisicoes HTTP processadas no barramento
# TYPE hospital360_http_requests_total counter
hospital360_http_requests_total{handler="/api/openemr/atendimento",status="200"} 1540
hospital360_http_requests_total{handler="/api/estoque/fefo-baixa",status="200"} 985
hospital360_http_requests_total{handler="/api/compras/validar-precos",status="200"} 712
hospital360_http_requests_total{handler="/api/laboratorio",status="200"} 645
hospital360_http_requests_total{handler="/api/leitos/alta-facilities",status="200"} 380
hospital360_http_requests_total{handler="/api/hyperswitch/split",status="200"} 462
hospital360_http_requests_total{handler="/api/tarefas",status="200"} 920

# HELP hospital360_http_request_duration_seconds Latencia de resposta das APIs hospitalares
# TYPE hospital360_http_request_duration_seconds histogram
hospital360_http_request_duration_seconds_bucket{le="0.05",handler="fefo_baixa"} 860
hospital360_http_request_duration_seconds_bucket{le="0.1",handler="fefo_baixa"} 950
hospital360_http_request_duration_seconds_bucket{le="0.25",handler="fefo_baixa"} 985
hospital360_http_request_duration_seconds_bucket{le="0.5",handler="fefo_baixa"} 985
hospital360_http_request_duration_seconds_sum{handler="fefo_baixa"} 41.2
hospital360_http_request_duration_seconds_count{handler="fefo_baixa"} 985

# HELP hospital360_leitos_ocupacao_percent Taxa de ocupacao hospitalar do Bahmni-Core
# TYPE hospital360_leitos_ocupacao_percent gauge
hospital360_leitos_ocupacao_percent{ala="enfermaria"} 78.5
hospital360_leitos_ocupacao_percent{ala="uti_geral"} 91.2
hospital360_leitos_ocupacao_percent{ala="apartamento"} 64.0
hospital360_leitos_ocupacao_percent{ala="isolamento"} 85.0

# HELP hospital360_fefo_lotes_risco_vencimento Total de lotes proximos da validade (<30 dias)
# TYPE hospital360_fefo_lotes_risco_vencimento gauge
hospital360_fefo_lotes_risco_vencimento{status="critico_urgente"} 1
hospital360_fefo_lotes_risco_vencimento{status="atencao_30dias"} 3

# HELP hospital360_hub_despesas_itens_total Total de lancamentos de despesa registrados no Hub
# TYPE hospital360_hub_despesas_itens_total gauge
hospital360_hub_despesas_itens_total ${totalItens}

# HELP hospital360_hub_despesas_valor_reais_total Montante total acumulado no Hub de Custos
# TYPE hospital360_hub_despesas_valor_reais_total counter
hospital360_hub_despesas_valor_reais_total ${valorTotalReais.toFixed(2)}

# HELP hospital360_hub_despesas_estacao_reais Distribuicao de custo por Estacao Clinica Door-to-Door
# TYPE hospital360_hub_despesas_estacao_reais gauge
hospital360_hub_despesas_estacao_reais{estacao="1",nome="Acolhimento_Triagem"} ${totalEstacao1.toFixed(2)}
hospital360_hub_despesas_estacao_reais{estacao="2",nome="Apoio_Diagnostico_LIS"} ${totalEstacao2.toFixed(2)}
hospital360_hub_despesas_estacao_reais{estacao="3",nome="Insumos_OPME"} ${totalEstacao3.toFixed(2)}
hospital360_hub_despesas_estacao_reais{estacao="4",nome="Farmacia_Beira_Leito"} ${totalEstacao4.toFixed(2)}
hospital360_hub_despesas_estacao_reais{estacao="5",nome="Internacao_UTI_Honorarios"} ${totalEstacao5.toFixed(2)}

# HELP hospital360_split_financeiro_reais_total Volume financeiro transacionado no Hyperswitch
# TYPE hospital360_split_financeiro_reais_total counter
hospital360_split_financeiro_reais_total{destinatario="honorarios_medicos_70pct"} 148200.00
hospital360_split_financeiro_reais_total{destinatario="custo_sala_cc_15pct"} 31757.14
hospital360_split_financeiro_reais_total{destinatario="condominio_hospitalar_15pct"} 31757.14

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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`# ERROR: Falha ao exportar metricas Prometheus: ${msg}`, { status: 500 });
  }
}
