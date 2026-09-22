import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

// Insumos Cirúrgicos e OPME adjudicados por Atas de Registro de Preços
const itensComprasAtasDB = [
  {
    id: 'DSP-CMP-501',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    codigoAta: 'ARP-2026-048',
    itemCodigo: 'OPME-TIT-901',
    descricaoItem: 'Kit de Placas e Parafusos de Titânio Bloqueados para Osteossíntese',
    fornecedorVencedor: 'Ortomédica Implantes Biológicos Ltda',
    loteFabricante: 'LOT-TIT-881',
    anvisaRegistro: '10294810022',
    quantidade: 1,
    valorUnitarioAta: 3420.00,
    valorTotal: 3420.00,
    dataAplicacaoCirurgica: '2026-09-21 14:00:00',
    centroCusto: 'CENTRO_CIRURGICO'
  },
  {
    id: 'DSP-CMP-502',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    codigoAta: 'ARP-2026-012',
    itemCodigo: 'MAT-HEMO-30',
    descricaoItem: 'Matriz Hemostática de Colágeno Reabsorvível 5x5cm',
    fornecedorVencedor: 'Biotecnomed Hospitalar Distribuidora',
    loteFabricante: 'LT-COL-940',
    anvisaRegistro: '80129380011',
    quantidade: 2,
    valorUnitarioAta: 285.00,
    valorTotal: 570.00,
    dataAplicacaoCirurgica: '2026-09-21 14:45:00',
    centroCusto: 'CENTRO_CIRURGICO'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const itens = itensComprasAtasDB.filter(i => i.cpf === cpf);
    const total = itens.reduce((acc, i) => acc + i.valorTotal, 0);

    return NextResponse.json({
      success: true,
      modulo: 'COMPRAS_PUBLICAS',
      paciente_cpf: cpf,
      total_opme_insumos: itens.length,
      valor_total_imputado: total,
      itens_adjudicados: itens,
      status_rastreabilidade: 'ANVISA_100_CONFORME'
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

    const itens = itensComprasAtasDB.filter(i => i.cpf === cpf);

    if (itens.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum insumo de compra pública/OPME pendente para este paciente.' },
        { status: 404 }
      );
    }

    const payloadDespesas = itens.map(i => ({
      id_transacao: i.id,
      paciente_cpf: i.cpf,
      paciente_nome: i.nome,
      prontuario_episodio: i.episodio,
      centro_custo: i.centroCusto,
      item_codigo: i.itemCodigo,
      item_descricao: `${i.descricaoItem} (Ata ${i.codigoAta})`,
      lote_fabricante: i.loteFabricante,
      quantidade: i.quantidade,
      unidade_medida: 'Kit Cirúrgico / Unidade',
      valor_unitario_medio: i.valorUnitarioAta,
      valor_total_imputado: i.valorTotal,
      data_consumo: i.dataAplicacaoCirurgica,
      origem_modulo: 'COMPRAS_PUBLICAS',
      estacao_jornada: 3,
      metadados: {
        codigo_ata: i.codigoAta,
        fornecedor: i.fornecedorVencedor,
        anvisa_registro: i.anvisaRegistro
      }
    }));

    const resultado = HubDespesasService.ingerirLote({
      origem_modulo: 'COMPRAS_PUBLICAS',
      data_geracao: new Date().toISOString(),
      despesas: payloadDespesas
    });

    return NextResponse.json({
      success: true,
      modulo_emissor: 'COMPRAS_PUBLICAS',
      protocolo_hub: resultado.protocolo,
      itens_exportados: resultado.itensAdicionados.length,
      valor_total_exportado: resultado.valorTotal,
      mensagem: 'Custos de OPME e atas de registro de preços integrados no Hub 360 com rastreabilidade ANVISA.'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
