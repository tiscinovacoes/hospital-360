import { NextRequest, NextResponse } from 'next/server';
import { NfeParser } from '@/lib/estoque/nfeParser';
import { EstoqueStore } from '@/lib/estoque/estoqueStore';
import { ConferenciaCegaItem } from '@/lib/estoque/types';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    let xmlString = '';
    let conferencias: ConferenciaCegaItem[] | undefined;
    let usuario = 'conferente_almoxarifado';
    let localCafId: string | undefined;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      xmlString = body.xml || '';
      conferencias = body.conferencias;
      usuario = body.usuario || usuario;
      localCafId = body.localCafId;
    } else {
      xmlString = await req.text();
    }

    if (!xmlString.trim()) {
      return NextResponse.json(
        { success: false, error: 'Conteúdo XML da NF-e não fornecido.' },
        { status: 400 }
      );
    }

    // 1. Executa o parse completo da NF-e 4.0
    const nfeParsed = NfeParser.parseNfeXml(xmlString);

    // Se a requisição apenas enviou o XML (Etapa 1: Leitura e Preparação da Conferência Cega)
    if (!conferencias || conferencias.length === 0) {
      // Mapeia produtos conhecidos para auxílio do conferente
      const produtosCadastrados = EstoqueStore.listarProdutos();

      const itensParaConferencia = nfeParsed.itens.map(item => {
        // Tenta encontrar o produto cadastrado por aproximação de nome ou NCM
        const prodEncontrado = produtosCadastrados.find(p => 
          item.xProd.toLowerCase().includes(p.nome.toLowerCase().split(' ')[0]) ||
          p.nome.toLowerCase().includes(item.xProd.toLowerCase().split(' ')[0])
        ) || produtosCadastrados[0];

        return {
          nItem: item.nItem,
          cProd: item.cProd,
          xProd: item.xProd,
          uCom: item.uCom,
          qCom: item.qCom,
          vUnCom: item.vUnCom,
          produto_sugerido_id: prodEncontrado?.id,
          produto_sugerido_nome: prodEncontrado?.nome,
          unidade_base: prodEncontrado?.unidade_base,
          rastroDetectado: item.rastro
        };
      });

      return NextResponse.json({
        success: true,
        mensagem: 'XML de NF-e 4.0 validado e processado com sucesso. Aguardando conferência cega.',
        nfe: {
          chaveAcesso: nfeParsed.chaveAcesso,
          numero: nfeParsed.numero,
          serie: nfeParsed.serie,
          dataEmissao: nfeParsed.dataEmissao,
          emitenteCnpj: nfeParsed.emitenteCnpj,
          emitenteNome: nfeParsed.emitenteNome,
          valorTotal: nfeParsed.valorTotal,
          totalItens: nfeParsed.itens.length
        },
        itens: itensParaConferencia
      });
    }

    // Etapa 2: Confirmação da Conferência Cega e Efetivação da Entrada na CAF
    const resultadoEntrada = EstoqueStore.processarEntradaNfe({
      nfe: nfeParsed,
      itensConferidos: conferencias,
      usuario,
      localCafId
    });

    return NextResponse.json({
      success: true,
      mensagem: 'Conferência física cega aprovada e entrada de estoque efetuada na Farmácia Central (CAF).',
      resultado: resultadoEntrada
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 422 });
  }
}
