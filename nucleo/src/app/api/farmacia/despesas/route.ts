import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService, DespesaItem } from '@/lib/hubDespesasStore';

// Base de dispensações simuladas de farmácia beira-leito
const dispensacoesFarmaciaDB = [
  {
    id: 'DSP-FAR-101',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    leito: 'Leito 204-B (UTI)',
    codigo: 'MED-771',
    descricao: 'Polimixina B 500.000 UI Frasco-Ampola',
    lote: 'LT-POLI-2026-09',
    quantidade: 2,
    unidade: 'Frasco-Ampola',
    valorUnitario: 115.00,
    valorTotal: 230.00,
    data: '2026-09-22 06:00:00',
    farmaceutico: 'Dra. Vanessa Lins (CRF/SP 44.901)'
  },
  {
    id: 'DSP-FAR-102',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    leito: 'Leito 204-B (UTI)',
    codigo: 'MED-772',
    descricao: 'Fentanila 50mcg/mL Ampola 10mL (Portaria 344/98)',
    lote: 'LT-FENT-2026-11',
    quantidade: 5,
    unidade: 'Ampola',
    valorUnitario: 18.20,
    valorTotal: 91.00,
    data: '2026-09-22 07:30:00',
    farmaceutico: 'Dra. Vanessa Lins (CRF/SP 44.901)'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const dispensacoes = dispensacoesFarmaciaDB.filter(d => d.cpf === cpf);
    const totalApurado = dispensacoes.reduce((acc, d) => acc + d.valorTotal, 0);

    return NextResponse.json({
      success: true,
      modulo: 'FARMACIA_HOSPITALAR',
      paciente_cpf: cpf,
      total_dispensacoes: dispensacoes.length,
      valor_total_apurado: totalApurado,
      itens_dispensados: dispensacoes,
      status_fechamento: 'PENDENTE_SINCRONIZACAO_HUB'
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

    const dispensacoes = dispensacoesFarmaciaDB.filter(d => d.cpf === cpf);

    if (dispensacoes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma dispensação de farmácia pendente para exportação.' },
        { status: 404 }
      );
    }

    const payloadDespesas = dispensacoes.map(d => ({
      id_transacao: d.id,
      paciente_cpf: d.cpf,
      paciente_nome: d.nome,
      prontuario_episodio: d.episodio,
      centro_custo: 'UTI_ADULTO',
      leito_identificador: d.leito,
      item_codigo: d.codigo,
      item_descricao: d.descricao,
      lote_fabricante: d.lote,
      quantidade: d.quantidade,
      unidade_medida: d.unidade,
      valor_unitario_medio: d.valorUnitario,
      valor_total_imputado: d.valorTotal,
      data_consumo: d.data,
      origem_modulo: 'FARMACIA_HOSPITALAR',
      estacao_jornada: 4
    }));

    const resultado = HubDespesasService.ingerirLote({
      origem_modulo: 'FARMACIA_HOSPITALAR',
      data_geracao: new Date().toISOString(),
      despesas: payloadDespesas
    });

    return NextResponse.json({
      success: true,
      modulo_emissor: 'FARMACIA_HOSPITALAR',
      protocolo_hub: resultado.protocolo,
      itens_exportados: resultado.itensAdicionados.length,
      valor_total_exportado: resultado.valorTotal,
      mensagem: 'Dispensações beira-leito sincronizadas com sucesso no Hub Central 360.'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
