import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

// Censo e Diárias Apuradas pelo NIR
const diariasLeitoDB = [
  {
    id: 'DSP-LEI-201',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    leito: 'Leito 204-B (UTI Adulto - Isolamento Respiratório)',
    tipoLeito: 'UTI_ISOLAMENTO',
    centroCusto: 'UTI_ADULTO',
    codigoItem: 'DIAR-UTI-ISO',
    descricaoItem: 'Diária UTI Isolamento com Suporte Ventilatório Invasivo e Enfermagem 1:2',
    quantidadeDias: 2,
    valorDiaria: 1650.00,
    valorTotal: 3300.00,
    dataCheckin: '2026-09-20 18:00:00',
    reguladorNIR: 'Dr. Leonardo Mattos (CRM/SP 131.002)'
  },
  {
    id: 'DSP-LEI-202',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    leito: 'Leito 204-B (UTI Adulto)',
    tipoLeito: 'FACILITIES_GASES',
    centroCusto: 'FACILITIES_ENGENHARIA',
    codigoItem: 'GAS-O2-CONT',
    descricaoItem: 'Consumo Ponderado de Oxigênio Medicinal e Ar Comprimido Hospitalar',
    quantidadeDias: 2,
    valorDiaria: 190.00,
    valorTotal: 380.00,
    dataCheckin: '2026-09-20 18:00:00',
    reguladorNIR: 'Eng. Roberto Farias (CREA/SP 49120)'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const diarias = diariasLeitoDB.filter(d => d.cpf === cpf);
    const totalApurado = diarias.reduce((acc, d) => acc + d.valorTotal, 0);

    return NextResponse.json({
      success: true,
      modulo: 'LEITOS_CENSO_NIR',
      paciente_cpf: cpf,
      total_diarias: diarias.length,
      valor_total_apurado: totalApurado,
      diarias_apuradas: diarias,
      status_censo: 'ALTA_IMINENTE_CALCULO_ATIVO'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const cpf = body.cpf || '123.456.789-00';

    const diarias = diariasLeitoDB.filter(d => d.cpf === cpf);

    if (diarias.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma diária de internação pendente para exportação.' },
        { status: 404 }
      );
    }

    const payloadDespesas = diarias.map(d => ({
      id_transacao: d.id,
      paciente_cpf: d.cpf,
      paciente_nome: d.nome,
      prontuario_episodio: d.episodio,
      centro_custo: d.centroCusto,
      leito_identificador: d.leito,
      item_codigo: d.codigoItem,
      item_descricao: d.descricaoItem,
      quantidade: d.quantidadeDias,
      unidade_medida: 'Diária Hospitalar',
      valor_unitario_medio: d.valorDiaria,
      valor_total_imputado: d.valorTotal,
      data_consumo: d.dataCheckin,
      origem_modulo: 'LEITOS_CENSO_NIR',
      estacao_jornada: 5
    }));

    const resultado = HubDespesasService.ingerirLote({
      origem_modulo: 'LEITOS_CENSO_NIR',
      data_geracao: new Date().toISOString(),
      despesas: payloadDespesas
    });

    return NextResponse.json({
      success: true,
      modulo_emissor: 'LEITOS_CENSO_NIR',
      protocolo_hub: resultado.protocolo,
      itens_exportados: resultado.itensAdicionados.length,
      valor_total_exportado: resultado.valorTotal,
      mensagem: 'Diárias de internação e censo NIR sincronizados no Hub Central 360.'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
