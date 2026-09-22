import { NextRequest, NextResponse } from 'next/server';

export interface DespesaItemPayload {
  id_transacao: string;
  paciente_cpf: string;
  paciente_nome: string;
  prontuario_episodio: string;
  centro_custo: string;
  leito_identificador?: string;
  item_codigo: string;
  item_descricao: string;
  lote_fabricante?: string;
  quantidade: number;
  unidade_medida: string;
  valor_unitario_medio: number;
  valor_total_imputado: number;
  data_consumo: string;
}

export interface IngestaoDespesasPayload {
  origem_modulo: 'ESTOQUE_CENTRAL' | 'COMPRAS_PUBLICAS' | 'LABORATORIO' | 'LEITOS' | 'CLINICA';
  cliente_id?: string;
  lote_exportacao_id?: string;
  data_geracao?: string;
  despesas: DespesaItemPayload[];
}

// Armazenamento em memória para demonstração da ingestão em tempo real no Hub
let despesasIngeridasMemoria: DespesaItemPayload[] = [
  {
    id_transacao: 'DSP-EST-001',
    paciente_cpf: '123.456.789-00',
    paciente_nome: 'Carlos Eduardo Silveira',
    prontuario_episodio: 'EPIS-2026-8841',
    centro_custo: 'UTI_ADULTO',
    leito_identificador: 'Leito 204',
    item_codigo: 'MED-001',
    item_descricao: 'Meropenem 1g Injetável',
    lote_fabricante: 'LT-2026-MERO-01',
    quantidade: 6,
    unidade_medida: 'Frasco-Ampola',
    valor_unitario_medio: 48.50,
    valor_total_imputado: 291.00,
    data_consumo: '2026-09-22 10:30:00'
  },
  {
    id_transacao: 'DSP-EST-002',
    paciente_cpf: '123.456.789-00',
    paciente_nome: 'Carlos Eduardo Silveira',
    prontuario_episodio: 'EPIS-2026-8841',
    centro_custo: 'UTI_ADULTO',
    leito_identificador: 'Leito 204',
    item_codigo: 'MED-002',
    item_descricao: 'Noradrenalina 2mg/mL Ampola 4mL',
    lote_fabricante: 'LT-2026-NORA-04',
    quantidade: 10,
    unidade_medida: 'Ampola',
    valor_unitario_medio: 12.80,
    valor_total_imputado: 128.00,
    data_consumo: '2026-09-22 11:15:00'
  },
  {
    id_transacao: 'DSP-CMP-001',
    paciente_cpf: '123.456.789-00',
    paciente_nome: 'Carlos Eduardo Silveira',
    prontuario_episodio: 'EPIS-2026-8841',
    centro_custo: 'CENTRO_CIRURGICO',
    leito_identificador: 'Leito 204',
    item_codigo: 'OPME-901',
    item_descricao: 'Kit Prótese Fixação Ortopédica Titânio',
    lote_fabricante: 'LOT-TIT-881',
    quantidade: 1,
    unidade_medida: 'Kit Estéril',
    valor_unitario_medio: 3420.00,
    valor_total_imputado: 3420.00,
    data_consumo: '2026-09-21 14:00:00'
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get('cpf');

  const despesasFiltradas = cpf
    ? despesasIngeridasMemoria.filter(d => d.paciente_cpf === cpf)
    : despesasIngeridasMemoria;

  const totalConsolidado = despesasFiltradas.reduce((acc, d) => acc + d.valor_total_imputado, 0);

  return NextResponse.json({
    success: true,
    total_registros: despesasFiltradas.length,
    valor_total_acumulado: totalConsolidado,
    despesas: despesasFiltradas,
    modulos_emissores: ['ESTOQUE_CENTRAL', 'COMPRAS_PUBLICAS'],
    status_hub: 'OPERACIONAL'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestaoDespesasPayload = await request.json();

    if (!body.origem_modulo || !Array.isArray(body.despesas)) {
      return NextResponse.json(
        { success: false, error: 'Payload inválido. "origem_modulo" e array de "despesas" são obrigatórios.' },
        { status: 400 }
      );
    }

    if (body.despesas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'O lote de despesas não contém itens.' },
        { status: 400 }
      );
    }

    // Ingestão e validação
    const novosItens: DespesaItemPayload[] = body.despesas.map((item, idx) => ({
      id_transacao: item.id_transacao || `DSP-${body.origem_modulo.slice(0, 3)}-${Date.now()}-${idx}`,
      paciente_cpf: item.paciente_cpf || '000.000.000-00',
      paciente_nome: item.paciente_nome || 'Paciente Não Identificado',
      prontuario_episodio: item.prontuario_episodio || 'SEM-EPISODIO',
      centro_custo: item.centro_custo || 'GERAL',
      leito_identificador: item.leito_identificador || undefined,
      item_codigo: item.item_codigo || 'SEM-COD',
      item_descricao: item.item_descricao || 'Item sem descrição',
      lote_fabricante: item.lote_fabricante || undefined,
      quantidade: Number(item.quantidade) || 1,
      unidade_medida: item.unidade_medida || 'UN',
      valor_unitario_medio: Number(item.valor_unitario_medio) || 0,
      valor_total_imputado: Number(item.valor_total_imputado) || (Number(item.quantidade) * Number(item.valor_unitario_medio)),
      data_consumo: item.data_consumo || new Date().toISOString()
    }));

    despesasIngeridasMemoria = [...novosItens, ...despesasIngeridasMemoria];

    const valorTotalLote = novosItens.reduce((acc, it) => acc + it.valor_total_imputado, 0);
    const cpfsImpactados = Array.from(new Set(novosItens.map(it => it.paciente_cpf)));
    const protocoloIngestao = `ING-HUB-${Date.now().toString().slice(-6)}`;

    return NextResponse.json({
      success: true,
      protocolo: protocoloIngestao,
      mensagem: `Lote de ${novosItens.length} despesa(s) do módulo ${body.origem_modulo} ingerido com sucesso no Hub 360.`,
      resumo: {
        origem: body.origem_modulo,
        itens_processados: novosItens.length,
        valor_total: valorTotalLote,
        pacientes_impactados: cpfsImpactados.length,
        timestamp_processamento: new Date().toISOString()
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
