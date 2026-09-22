import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService, DespesaItem } from '@/lib/hubDespesasStore';

function converterParaCSV(itens: DespesaItem[]): string {
  const colunas = [
    'ID_TRANSACAO',
    'CPF_PACIENTE',
    'NOME_PACIENTE',
    'PRONTUARIO_EPISODIO',
    'MODULO_ORIGEM',
    'ESTACAO_JORNADA',
    'CENTRO_CUSTO',
    'LEITO',
    'CODIGO_ITEM',
    'DESCRICAO_ITEM',
    'LOTE_FABRICANTE',
    'QUANTIDADE',
    'UNIDADE_MEDIDA',
    'VALOR_UNITARIO',
    'VALOR_TOTAL',
    'DATA_CONSUMO'
  ];

  const linhas = itens.map(d => [
    `"${d.id_transacao}"`,
    `"${d.paciente_cpf}"`,
    `"${d.paciente_nome}"`,
    `"${d.prontuario_episodio}"`,
    `"${d.origem_modulo}"`,
    d.estacao_jornada || 0,
    `"${d.centro_custo}"`,
    `"${d.leito_identificador || ''}"`,
    `"${d.item_codigo}"`,
    `"${d.item_descricao.replace(/"/g, '""')}"`,
    `"${d.lote_fabricante || ''}"`,
    d.quantidade,
    `"${d.unidade_medida}"`,
    d.valor_unitario_medio.toFixed(2),
    d.valor_total_imputado.toFixed(2),
    `"${d.data_consumo}"`
  ].join(';'));

  return [colunas.join(';'), ...linhas].join('\r\n');
}

function gerarXMLTISS(itens: DespesaItem[], cpf: string): string {
  const pacienteRef = itens[0] || { paciente_cpf: cpf, paciente_nome: 'PACIENTE' };
  const total = itens.reduce((acc, it) => acc + it.valor_total_imputado, 0);

  const xmlItens = itens.map((it, idx) => `
    <ans:itemDespesa sequencial="${idx + 1}">
      <ans:codigoItem>${it.item_codigo}</ans:codigoItem>
      <ans:descricaoItem><![CDATA[${it.item_descricao}]]></ans:descricaoItem>
      <ans:origemModulo>${it.origem_modulo}</ans:origemModulo>
      <ans:centroCusto>${it.centro_custo}</ans:centro_custo>
      <ans:lote>${it.lote_fabricante || 'NAO_APLICAVEL'}</ans:lote>
      <ans:quantidade>${it.quantidade}</ans:quantidade>
      <ans:unidade>${it.unidade_medida}</ans:unidade>
      <ans:valorUnitario>${it.valor_unitario_medio.toFixed(2)}</ans:valorUnitario>
      <ans:valorTotal>${it.valor_total_imputado.toFixed(2)}</ans:valorTotal>
      <ans:dataExecucao>${it.data_consumo}</ans:dataExecucao>
    </ans:itemDespesa>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas" versao="04.01.00">
  <ans:cabecalho>
    <ans:identificacaoTransacao>
      <ans:tipoTransacao>ENVIO_LOTE_GUIAS_CUSTOS</ans:tipoTransacao>
      <ans:sequencialTransacao>${Date.now()}</ans:sequencialTransacao>
      <ans:dataRegistro>${new Date().toISOString()}</ans:dataRegistro>
    </ans:identificacaoTransacao>
    <ans:origem>
      <ans:codigoPrestadorNaOperadora>360-HOSP-CENTRAL</ans:codigoPrestadorNaOperadora>
      <ans:razaoSocial>HOSPITAL CONDOMINIO 360 GESTAO INTEGRADA LTDA</ans:razaoSocial>
      <ans:cnes>7128941</ans:cnes>
    </ans:origem>
  </ans:cabecalho>
  <ans:guiaResumoDespesas>
    <ans:dadosBeneficiario>
      <ans:cpf>${pacienteRef.paciente_cpf}</ans:cpf>
      <ans:nomeBeneficiario>${pacienteRef.paciente_nome}</ans:nomeBeneficiario>
      <ans:numeroAtendimento>${itens[0]?.prontuario_episodio || 'EPIS-360'}</ans:numeroAtendimento>
    </ans:dadosBeneficiario>
    <ans:demonstrativoCustos>
      <ans:valorTotalGasto>${total.toFixed(2)}</ans:valorTotalGasto>
      <ans:totalItens>${itens.length}</ans:totalItens>
      <ans:itens>${xmlItens}
      </ans:itens>
    </ans:demonstrativoCustos>
  </ans:guiaResumoDespesas>
</ans:mensagemTISS>`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formato = (searchParams.get('formato') || 'json').toLowerCase();
    const cpf = searchParams.get('cpf') || undefined;
    const episodio = searchParams.get('episodio') || undefined;
    const origem = searchParams.get('origem') || undefined;

    const itens = HubDespesasService.listarDespesas({
      cpf,
      episodio,
      origem_modulo: origem
    });

    if (formato === 'csv') {
      const csv = converterParaCSV(itens);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="despesas_hospital360_${Date.now()}.csv"`
        }
      });
    }

    if (formato === 'tiss' || formato === 'xml') {
      const xml = gerarXMLTISS(itens, cpf || 'CONSOLIDADO');
      return new NextResponse(xml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="guia_tiss_despesas_${Date.now()}.xml"`
        }
      });
    }

    // Padrão: JSON
    return NextResponse.json({
      success: true,
      exportado_em: new Date().toISOString(),
      formato: 'JSON_CANONICO_360',
      total_registros: itens.length,
      valor_total: Number(itens.reduce((a, b) => a + b.valor_total_imputado, 0).toFixed(2)),
      despesas: itens
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
