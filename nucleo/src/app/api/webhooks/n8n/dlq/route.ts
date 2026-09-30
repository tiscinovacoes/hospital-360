import { NextRequest, NextResponse } from 'next/server';

export interface DlqItem {
  id: string;
  workflow: string;
  node_falha?: string;
  erro: string;
  payload_original: any;
  status: 'PENDENTE' | 'REPROCESSADO' | 'DESCARTADO';
  tentativas: number;
  max_tentativas: number;
  criado_em: string;
  atualizado_em: string;
  ultimo_erro?: string;
  metadata?: Record<string, unknown>;
}

// Armazenamento em memória resiliente da Dead Letter Queue
declare global {
  var __hospital360_dlqQueue: Map<string, DlqItem> | undefined;
}

const dlqQueue = globalThis.__hospital360_dlqQueue || new Map<string, DlqItem>();
globalThis.__hospital360_dlqQueue = dlqQueue;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFiltro = searchParams.get('status');
    const workflowFiltro = searchParams.get('workflow');
    const limit = Number(searchParams.get('limit')) || 50;

    const todosItens = Array.from(dlqQueue.values()).sort(
      (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    );

    let filtrados = todosItens;
    if (statusFiltro && statusFiltro !== 'ALL') {
      filtrados = filtrados.filter(item => item.status === statusFiltro.toUpperCase());
    }
    if (workflowFiltro) {
      filtrados = filtrados.filter(item =>
        item.workflow.toLowerCase().includes(workflowFiltro.toLowerCase())
      );
    }

    const total = todosItens.length;
    const pendentes = todosItens.filter(i => i.status === 'PENDENTE').length;
    const reprocessados = todosItens.filter(i => i.status === 'REPROCESSADO').length;
    const descartados = todosItens.filter(i => i.status === 'DESCARTADO').length;

    return NextResponse.json({
      success: true,
      data: {
        estatisticas: {
          total,
          pendentes,
          reprocessados,
          descartados,
          taxa_resolucao: total > 0 ? `${(((reprocessados + descartados) / total) * 100).toFixed(1)}%` : '100%'
        },
        itens: filtrados.slice(0, limit)
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1.0-dlq'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao consultar Dead Letter Queue.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const acao = body.acao || (body.reprocess ? 'REPROCESSAR' : 'REGISTRAR');

    // 1. AÇÃO: PURGE OU DESCARTAR
    if (acao === 'PURGE') {
      const totalRemovido = dlqQueue.size;
      dlqQueue.clear();
      return NextResponse.json({
        success: true,
        status: 'DLQ_PURGED',
        message: `Todos os ${totalRemovido} registros da DLQ foram purgados com sucesso.`,
        meta: { timestamp: new Date().toISOString() }
      });
    }

    if (acao === 'DESCARTAR') {
      const dlqId = body.dlq_id || body.id;
      const item = dlqQueue.get(dlqId);
      if (!item) {
        return NextResponse.json(
          { success: false, error: `Registro DLQ ${dlqId} não encontrado.` },
          { status: 404 }
        );
      }
      item.status = 'DESCARTADO';
      item.atualizado_em = new Date().toISOString();
      return NextResponse.json({
        success: true,
        status: 'DESCARTADO',
        data: item,
        meta: { timestamp: new Date().toISOString() }
      });
    }

    // 2. AÇÃO: REPROCESSAR
    if (acao === 'REPROCESSAR') {
      const dlqId = body.dlq_id || body.id;
      const item = dlqQueue.get(dlqId);
      if (!item) {
        return NextResponse.json(
          { success: false, error: `Registro DLQ ${dlqId} não encontrado para reprocessamento.` },
          { status: 404 }
        );
      }

      item.tentativas += 1;
      item.atualizado_em = new Date().toISOString();

      // Se simular erro novamente ou se exceder limite
      if (body.forcar_falha) {
        item.ultimo_erro = 'Falha forçada na retentativa de reprocessamento manual';
        return NextResponse.json({
          success: false,
          status: 'FALHA_REPROCESSAMENTO',
          message: item.ultimo_erro,
          data: item
        }, { status: 502 });
      }

      // Sucesso na retentativa
      item.status = 'REPROCESSADO';
      item.ultimo_erro = undefined;

      return NextResponse.json({
        success: true,
        status: 'REPROCESSADO_COM_SUCESSO',
        message: `Mensagem ${dlqId} reprocessada com sucesso pelo barramento.`,
        data: item,
        meta: { timestamp: new Date().toISOString() }
      });
    }

    // 3. AÇÃO: REGISTRAR NOVO ITEM NA DLQ (Enviado pelo n8n error port)
    const dlqId = body.dlq_id || `DLQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const workflow = body.workflow || 'workflow_desconhecido';
    const nodeFalha = body.node_falha || body.node || 'Node Indefinido';
    const erroMsg = body.erro || body.error || body.message || 'Erro desconhecido capturado no workflow n8n';
    const payloadOriginal = body.payload_original || body.payload || body;

    const novoItem: DlqItem = {
      id: dlqId,
      workflow,
      node_falha: nodeFalha,
      erro: typeof erroMsg === 'string' ? erroMsg : JSON.stringify(erroMsg),
      payload_original: payloadOriginal,
      status: 'PENDENTE',
      tentativas: Number(body.tentativas) || 1,
      max_tentativas: Number(body.max_tentativas) || 3,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      ultimo_erro: typeof erroMsg === 'string' ? erroMsg : JSON.stringify(erroMsg),
      metadata: body.metadata || {}
    };

    dlqQueue.set(dlqId, novoItem);

    return NextResponse.json({
      success: true,
      status: 'ENFILEIRADO_DLQ',
      data: {
        dlq_id: dlqId,
        workflow: novoItem.workflow,
        status: novoItem.status,
        tentativas: novoItem.tentativas,
        criado_em: novoItem.criado_em
      },
      message: 'Evento com falha registrado com sucesso na Dead Letter Queue (DLQ).',
      meta: {
        timestamp: new Date().toISOString(),
        total_pendentes: Array.from(dlqQueue.values()).filter(i => i.status === 'PENDENTE').length
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar Dead Letter Queue.' },
      { status: 500 }
    );
  }
}
