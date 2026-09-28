import { NextRequest, NextResponse } from 'next/server';

export type IngestionSourceFormat = 
  | 'MV_FINANCEIRO_CSV'
  | 'MV_FARMACIA_CSV'
  | 'TASY_CUSTOS_JSON'
  | 'TASY_MATMED_CSV'
  | 'PHILIPS_FATURAMENTO_JSON'
  | 'PADRAO_360_JSON'
  | 'PADRAO_360_CSV';

export interface IngestionItemInput {
  cpfPaciente?: string;
  nomePaciente?: string;
  centroCustoId: string;
  descricao: string;
  valor: number | string;
  quantidade?: number | string;
  lote?: string;
  validade?: string;
  dataRegistro?: string;
  detalhes?: Record<string, unknown>;
}

export interface IngestionPayloadInput {
  formato: IngestionSourceFormat;
  tenantId?: string;
  registros: IngestionItemInput[];
}

export interface NormalizedCostEvent {
  id: string;
  tenantId: string;
  formatoOrigem: IngestionSourceFormat;
  centroCustoId: string;
  cpfPaciente: string | null;
  nomePaciente: string;
  descricao: string;
  valor: number;
  quantidade: number;
  lote: string | null;
  validade: string | null;
  dataRegistro: string;
  status: 'PROCESSADO' | 'ERRO_VALIDACAO';
  errosValidacao?: string[];
}

function parseCSVToJSON(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let payload: IngestionPayloadInput;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const formato = (formData.get('formato') as IngestionSourceFormat) || 'PADRAO_360_CSV';
      const tenantId = (formData.get('tenantId') as string) || 'tenant-condominio-default';

      if (!file) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: 'Nenhum arquivo enviado no formulário multipart/form-data (campo "file").',
            meta: { timestamp: new Date().toISOString(), version: 'v1.0-modular' },
          },
          { status: 400 }
        );
      }

      const fileText = await file.text();

      if (formato.endsWith('_JSON') || file.name.endsWith('.json')) {
        const parsedJson = JSON.parse(fileText);
        payload = {
          formato,
          tenantId,
          registros: Array.isArray(parsedJson) ? parsedJson : parsedJson.registros || [],
        };
      } else {
        const csvRows = parseCSVToJSON(fileText);
        payload = {
          formato,
          tenantId,
          registros: csvRows.map(r => ({
            cpfPaciente: r.cpf || r.cpf_paciente || r.cpfPaciente,
            nomePaciente: r.nome || r.nome_paciente || r.nomePaciente,
            centroCustoId: r.centro_custo || r.centroCustoId || r.cc_id || 'CC-GERAL',
            descricao: r.descricao || r.item || r.procedimento || 'Item de Custo Importado',
            valor: parseFloat(r.valor || r.preco_total || '0'),
            quantidade: parseInt(r.quantidade || r.qtd || '1', 10),
            lote: r.lote,
            validade: r.validade,
            dataRegistro: r.data || r.data_registro || new Date().toISOString(),
          })),
        };
      }
    } else {
      payload = await request.json();
    }

    if (!payload.formato || !Array.isArray(payload.registros) || payload.registros.length === 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Payload inválido: formato e um array não-vazio de registros são obrigatórios.',
          meta: { timestamp: new Date().toISOString(), version: 'v1.0-modular' },
        },
        { status: 400 }
      );
    }

    const tenantId = payload.tenantId || 'tenant-condominio-default';
    const eventosNormalizados: NormalizedCostEvent[] = [];
    const errosGerais: Array<{ linha: number; erros: string[] }> = [];

    let valorTotalAceito = 0;
    let totalProcessadosComSucesso = 0;

    payload.registros.forEach((reg, index) => {
      const linhaNum = index + 1;
      const errosLinha: string[] = [];

      const valorNum = typeof reg.valor === 'number' ? reg.valor : parseFloat(String(reg.valor || '0'));
      const qtdNum = typeof reg.quantidade === 'number' ? reg.quantidade : parseInt(String(reg.quantidade || '1'), 10);

      if (isNaN(valorNum) || valorNum <= 0) {
        errosLinha.push('Valor do registro deve ser um número positivo maior que 0.');
      }
      if (!reg.centroCustoId || reg.centroCustoId.trim() === '') {
        errosLinha.push('Identificador de Centro de Custo (centroCustoId) é obrigatório.');
      }
      if (!reg.descricao || reg.descricao.trim() === '') {
        errosLinha.push('Descrição do item de custo é obrigatória.');
      }

      if (errosLinha.length > 0) {
        errosGerais.push({ linha: linhaNum, erros: errosLinha });
        eventosNormalizados.push({
          id: `evt-err-${Date.now()}-${linhaNum}`,
          tenantId,
          formatoOrigem: payload.formato,
          centroCustoId: reg.centroCustoId || 'CC-ERRO',
          cpfPaciente: reg.cpfPaciente || null,
          nomePaciente: reg.nomePaciente || 'N/A',
          descricao: reg.descricao || 'Item Inválido',
          valor: isNaN(valorNum) ? 0 : valorNum,
          quantidade: isNaN(qtdNum) ? 1 : qtdNum,
          lote: reg.lote || null,
          validade: reg.validade || null,
          dataRegistro: reg.dataRegistro || new Date().toISOString(),
          status: 'ERRO_VALIDACAO',
          errosValidacao: errosLinha,
        });
      } else {
        totalProcessadosComSucesso++;
        valorTotalAceito += valorNum * qtdNum;

        eventosNormalizados.push({
          id: `evt-ingest-${payload.formato.toLowerCase()}-${Date.now()}-${linhaNum}`,
          tenantId,
          formatoOrigem: payload.formato,
          centroCustoId: reg.centroCustoId,
          cpfPaciente: reg.cpfPaciente || null,
          nomePaciente: reg.nomePaciente || 'Paciente Não Identificado',
          descricao: reg.descricao,
          valor: valorNum,
          quantidade: qtdNum,
          lote: reg.lote || null,
          validade: reg.validade || null,
          dataRegistro: reg.dataRegistro || new Date().toISOString(),
          status: 'PROCESSADO',
        });
      }
    });

    return NextResponse.json(
      {
        success: errosGerais.length === 0,
        data: {
          formatoOrigem: payload.formato,
          tenantId,
          totalRegistrosRecebidos: payload.registros.length,
          totalRegistrosProcessados: totalProcessadosComSucesso,
          totalRegistrosRejeitados: errosGerais.length,
          valorTotalConsolidado: valorTotalAceito,
          eventos: eventosNormalizados,
          errosDetalhados: errosGerais.length > 0 ? errosGerais : null,
          mensagem: errosGerais.length === 0 
            ? `Ingestão ${payload.formato} realizada com sucesso. ${totalProcessadosComSucesso} eventos integrados ao motor Door-to-Door 360.`
            : `Ingestão parcial: ${totalProcessadosComSucesso} aceitos, ${errosGerais.length} rejeitados por falha de validação.`,
        },
        error: errosGerais.length > 0 ? 'Existem erros de validação em alguns registros.' : null,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1.0-modular',
          squad: 'Squad 1 - Core 360',
        },
      },
      { status: errosGerais.length === payload.registros.length ? 422 : 201 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro interno no barramento de ingestão modular.';
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: errorMsg,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1.0-modular',
        },
      },
      { status: 500 }
    );
  }
}
