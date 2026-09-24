// ============================================================================
// NfeParser: Parser de XML NF-e 4.0 com Leitura de Rastreabilidade <rastro>
// ============================================================================

import { NfeXmlParsed, ItemNfeParsed, ItemNfeRastro } from './types';

export class NfeParser {
  /**
   * Extrai o valor de uma tag simples de uma string XML
   */
  private static extrairTag(xml: string, tag: string): string {
    const regex = new RegExp(`<(?:[a-zA-Z0-9_-]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extrai todos os blocos de uma tag específica
   */
  private static extrairBlocos(xml: string, tag: string): string[] {
    const regex = new RegExp(`<(?:[a-zA-Z0-9_-]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?${tag}>`, 'gi');
    const blocos: string[] = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      blocos.push(match[1]);
    }
    return blocos;
  }

  /**
   * Realiza o parse completo de um XML de NF-e 4.0
   */
  static parseNfeXml(xmlConteudo: string): NfeXmlParsed {
    if (!xmlConteudo || typeof xmlConteudo !== 'string') {
      throw new Error('Conteúdo XML inválido ou vazio.');
    }

    // Validação básica se é uma NF-e
    if (!xmlConteudo.includes('infNFe') && !xmlConteudo.includes('NFe')) {
      throw new Error('Arquivo não reconhecido como XML de Nota Fiscal Eletrônica (NF-e).');
    }

    // 1. Chave de Acesso (44 dígitos extraídos do atributo Id de infNFe ou da tag chNFe)
    let chaveAcesso = this.extrairTag(xmlConteudo, 'chNFe');
    if (!chaveAcesso) {
      const matchId = xmlConteudo.match(/Id=["']NFe([0-9]{44})["']/i);
      if (matchId) {
        chaveAcesso = matchId[1];
      }
    }

    if (!chaveAcesso || chaveAcesso.length !== 44) {
      // Fallback: busca qualquer sequência de 44 dígitos no cabeçalho
      const matchSeq = xmlConteudo.match(/\b([0-9]{44})\b/);
      if (matchSeq) {
        chaveAcesso = matchSeq[1];
      } else {
        throw new Error('Chave de acesso de 44 dígitos da NF-e não localizada no XML.');
      }
    }

    // 2. Dados de Identificação (ide)
    const ideBloco = this.extrairTag(xmlConteudo, 'ide');
    const numero = this.extrairTag(ideBloco, 'nNF') || '000000';
    const serie = this.extrairTag(ideBloco, 'serie') || '1';
    const dataEmissao = this.extrairTag(ideBloco, 'dhEmi') || this.extrairTag(ideBloco, 'dEmi') || new Date().toISOString();

    // 3. Dados do Emitente (emit)
    const emitBloco = this.extrairTag(xmlConteudo, 'emit');
    const emitenteCnpj = this.extrairTag(emitBloco, 'CNPJ') || '00000000000000';
    const emitenteNome = this.extrairTag(emitBloco, 'xNome') || 'Fornecedor Farmacêutico Desconhecido';

    // 4. Dados do Destinatário (dest)
    const destBloco = this.extrairTag(xmlConteudo, 'dest');
    const destinatarioCnpj = this.extrairTag(destBloco, 'CNPJ') || '';
    const destinatarioNome = this.extrairTag(destBloco, 'xNome') || '';

    // 5. Total da Nota
    const totalBloco = this.extrairTag(xmlConteudo, 'ICMSTot');
    const valorTotal = parseFloat(this.extrairTag(totalBloco, 'vNF') || '0');

    // 6. Itens / Produtos (det)
    const blocosDet = this.extrairBlocos(xmlConteudo, 'det');
    const itens: ItemNfeParsed[] = [];

    blocosDet.forEach((detXml, index) => {
      const prodBloco = this.extrairTag(detXml, 'prod');
      if (!prodBloco) return;

      const cProd = this.extrairTag(prodBloco, 'cProd') || `ITEM-${index + 1}`;
      const xProd = this.extrairTag(prodBloco, 'xProd') || 'Produto sem descrição';
      const ncm = this.extrairTag(prodBloco, 'NCM') || undefined;
      const uCom = this.extrairTag(prodBloco, 'uCom') || 'UN';
      const qCom = parseFloat(this.extrairTag(prodBloco, 'qCom') || '0');
      const vUnCom = parseFloat(this.extrairTag(prodBloco, 'vUnCom') || '0');
      const vProd = parseFloat(this.extrairTag(prodBloco, 'vProd') || '0');

      // Leitura do grupo obrigatório <rastro> para medicamentos (Anvisa / NT 2016.002)
      const blocosRastro = this.extrairBlocos(detXml, 'rastro');
      const rastros: ItemNfeRastro[] = [];

      for (const rastroXml of blocosRastro) {
        const nLote = this.extrairTag(rastroXml, 'nLote');
        const qLote = parseFloat(this.extrairTag(rastroXml, 'qLote') || String(qCom));
        const dFab = this.extrairTag(rastroXml, 'dFab') || undefined;
        const dVal = this.extrairTag(rastroXml, 'dVal');

        if (nLote && dVal) {
          rastros.push({
            nLote,
            qLote: isNaN(qLote) ? qCom : qLote,
            dFab,
            dVal
          });
        }
      }

      // Se não houver bloco <rastro> explícito, tenta capturar tags de lote legado no bloco med
      if (rastros.length === 0) {
        const medBloco = this.extrairTag(detXml, 'med');
        if (medBloco) {
          const nLote = this.extrairTag(medBloco, 'nLote');
          const dVal = this.extrairTag(medBloco, 'dVal');
          const dFab = this.extrairTag(medBloco, 'dFab') || undefined;
          if (nLote && dVal) {
            rastros.push({ nLote, qLote: qCom, dFab, dVal });
          }
        }
      }

      itens.push({
        nItem: index + 1,
        cProd,
        xProd,
        NCM: ncm,
        uCom,
        qCom,
        vUnCom,
        vProd,
        rastro: rastros
      });
    });

    return {
      chaveAcesso,
      numero,
      serie,
      dataEmissao,
      emitenteCnpj,
      emitenteNome,
      destinatarioCnpj,
      destinatarioNome,
      valorTotal,
      itens
    };
  }
}
