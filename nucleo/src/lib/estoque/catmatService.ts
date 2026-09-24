// ============================================================================
// CatmatService: Catálogo Oficial do Governo Federal (Compras.gov.br)
// Classe 6505: Drogas e Medicamentos
// ============================================================================

import { CatmatItem } from './types';

const COMPRAS_API_URL = 'https://dadosabertos.compras.gov.br/modulo-material/4_consultarItemMaterial';

// Base oficial pré-carregada dos medicamentos padronizados essenciais (CATMAT real Classe 6505)
const CATMAT_SEED_ESSENCIAIS: CatmatItem[] = [
  {
    codigo_catmat: 'BR0284729',
    descricao: 'MEROPENEM, CONCENTRAÇÃO: 1 G, FORMA FARMACÊUTICA: PÓ LIOFILIZADO P/ SOLUÇÃO INJETÁVEL',
    unidade_fornecimento: 'FRASCO-AMPOLA',
    classe_pdm: 'DROGAS E MEDICAMENTOS',
    codigo_pdm: 8812,
    nome_pdm: 'MEROPENEM',
    ativo: true,
    sustentavel: false,
    codigo_ncm: '30049099'
  },
  {
    codigo_catmat: 'BR0194851',
    descricao: 'NOREPINEFRINA, CONCENTRAÇÃO: 2 MG/ML, FORMA FARMACÊUTICA: SOLUÇÃO INJETÁVEL, APRESENTAÇÃO: AMPOLA 4 ML',
    unidade_fornecimento: 'AMPOLA',
    classe_pdm: 'DROGAS E MEDICAMENTOS',
    codigo_pdm: 5410,
    nome_pdm: 'NOREPINEFRINA (HEMITARTARATO)',
    ativo: true,
    sustentavel: false,
    codigo_ncm: '30049099'
  },
  {
    codigo_catmat: 'BR0311209',
    descricao: 'FENTANILA, CONCENTRAÇÃO: 0,05 MG/ML, FORMA FARMACÊUTICA: SOLUÇÃO INJETÁVEL, APRESENTAÇÃO: AMPOLA 10 ML',
    unidade_fornecimento: 'AMPOLA',
    classe_pdm: 'DROGAS E MEDICAMENTOS',
    codigo_pdm: 3410,
    nome_pdm: 'FENTANILA (CITRATO)',
    ativo: true,
    sustentavel: false,
    codigo_ncm: '30049099'
  },
  {
    codigo_catmat: 'BR0267891',
    descricao: 'DIPIRONA SÓDICA, CONCENTRAÇÃO: 500 MG/ML, FORMA FARMACÊUTICA: SOLUÇÃO INJETÁVEL, APRESENTAÇÃO: AMPOLA 2 ML',
    unidade_fornecimento: 'AMPOLA',
    classe_pdm: 'DROGAS E MEDICAMENTOS',
    codigo_pdm: 362,
    nome_pdm: 'DIPIRONA SÓDICA',
    ativo: true,
    sustentavel: false,
    codigo_ncm: '30049099'
  },
  {
    codigo_catmat: 'BR0267892',
    descricao: 'DIPIRONA SÓDICA, CONCENTRAÇÃO: 500 MG, FORMA FARMACÊUTICA: COMPRIMIDO',
    unidade_fornecimento: 'COMPRIMIDO',
    classe_pdm: 'DROGAS E MEDICAMENTOS',
    codigo_pdm: 362,
    nome_pdm: 'DIPIRONA SÓDICA',
    ativo: true,
    sustentavel: false,
    codigo_ncm: '30049099'
  },
  {
    codigo_catmat: 'BR0154320',
    descricao: 'AMOXICILINA + CLAVULANATO DE POTÁSSIO, CONCENTRAÇÃO: 500 MG + 125 MG, FORMA FARMACÊUTICA: COMPRIMIDO REVESTIDO',
    unidade_fornecimento: 'COMPRIMIDO',
    classe_pdm: 'DROGAS E MEDICAMENTOS',
    codigo_pdm: 1204,
    nome_pdm: 'AMOXICILINA + CLAVULANATO',
    ativo: true,
    sustentavel: false,
    codigo_ncm: '30041019'
  },
  {
    codigo_catmat: 'BR0189432',
    descricao: 'LOSARTANA POTÁSSICA, CONCENTRAÇÃO: 50 MG, FORMA FARMACÊUTICA: COMPRIMIDO',
    unidade_fornecimento: 'COMPRIMIDO',
    classe_pdm: 'DROGAS E MEDICAMENTOS',
    codigo_pdm: 4120,
    nome_pdm: 'LOSARTANA POTÁSSICA',
    ativo: true,
    sustentavel: false,
    codigo_ncm: '30049099'
  },
  {
    codigo_catmat: 'BR0205411',
    descricao: 'INSULINA HUMANA NPH, CONCENTRAÇÃO: 100 UI/ML, FORMA FARMACÊUTICA: SUSPENSÃO INJETÁVEL, APRESENTAÇÃO: FRASCO-AMPOLA 10 ML',
    unidade_fornecimento: 'FRASCO-AMPOLA',
    classe_pdm: 'DROGAS E MEDICAMENTOS',
    codigo_pdm: 6201,
    nome_pdm: 'INSULINA HUMANA',
    ativo: true,
    sustentavel: false,
    codigo_ncm: '30043100'
  },
  {
    codigo_catmat: 'BR0178490',
    descricao: 'PARACETAMOL, CONCENTRAÇÃO: 500 MG, FORMA FARMACÊUTICA: COMPRIMIDO',
    unidade_fornecimento: 'COMPRIMIDO',
    classe_pdm: 'DROGAS E MEDICAMENTOS',
    codigo_pdm: 7891,
    nome_pdm: 'PARACETAMOL',
    ativo: true,
    sustentavel: false,
    codigo_ncm: '30049099'
  },
  {
    codigo_catmat: 'BR0234109',
    descricao: 'CLORETO DE SÓDIO, CONCENTRAÇÃO: 0,9%, FORMA FARMACÊUTICA: SOLUÇÃO INJETÁVEL, APRESENTAÇÃO: BOLSA/FRASCO 500 ML',
    unidade_fornecimento: 'FRASCO',
    classe_pdm: 'DROGAS E MEDICAMENTOS',
    codigo_pdm: 1109,
    nome_pdm: 'CLORETO DE SÓDIO',
    ativo: true,
    sustentavel: false,
    codigo_ncm: '30049099'
  }
];

export class CatmatService {
  private static catalogoLocal: Map<string, CatmatItem> = new Map(
    CATMAT_SEED_ESSENCIAIS.map(item => [item.codigo_catmat, item])
  );

  /**
   * Sincroniza paginada e idempotentemente com a API do Compras.gov.br
   */
  static async sincronizarCatmat(pagina = 1, tamanhoPagina = 50): Promise<{
    sucesso: boolean;
    itensImportados: number;
    totalApi: number;
    paginasRestantes: number;
  }> {
    try {
      const url = `${COMPRAS_API_URL}?codigoClasse=6505&pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`;
      const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
      
      if (!response.ok) {
        throw new Error(`Falha HTTP ${response.status} na API Compras.gov.br`);
      }

      const data = await response.json();
      const registros = data.resultado || [];

      for (const reg of registros) {
        const codigo = `BR${String(reg.codigoItem).padStart(7, '0')}`;
        const item: CatmatItem = {
          codigo_catmat: codigo,
          descricao: reg.descricaoItem || reg.nomePdm || 'Medicamento sem descrição',
          unidade_fornecimento: reg.unidadeFornecimento || 'UNIDADE',
          classe_pdm: reg.nomeClasse || 'DROGAS E MEDICAMENTOS',
          codigo_pdm: reg.codigoPdm,
          nome_pdm: reg.nomePdm,
          ativo: reg.statusItem !== false,
          sustentavel: Boolean(reg.itemSustentavel),
          codigo_ncm: reg.codigo_ncm || undefined,
          atualizado_em: reg.dataHoraAtualizacao || new Date().toISOString()
        };

        this.catalogoLocal.set(codigo, item);
      }

      return {
        sucesso: true,
        itensImportados: registros.length,
        totalApi: data.totalRegistros || this.catalogoLocal.size,
        paginasRestantes: data.paginasRestantes || 0
      };
    } catch (err: unknown) {
      console.warn('⚠️ Sincronização online da API Compras.gov.br indisponível, utilizando catálogo cacheado:', err instanceof Error ? err.message : String(err));
      return {
        sucesso: false,
        itensImportados: 0,
        totalApi: this.catalogoLocal.size,
        paginasRestantes: 0
      };
    }
  }

  /**
   * Busca no catálogo local (em banco ou cache em memória)
   */
  static buscarItens(termo = '', limite = 30): CatmatItem[] {
    const termoNormalizado = termo.trim().toLowerCase();
    if (!termoNormalizado) {
      return Array.from(this.catalogoLocal.values()).slice(0, limite);
    }

    const resultados: CatmatItem[] = [];
    for (const item of this.catalogoLocal.values()) {
      const bateCodigo = item.codigo_catmat.toLowerCase().includes(termoNormalizado);
      const bateDescricao = item.descricao.toLowerCase().includes(termoNormalizado);
      const batePdm = item.nome_pdm ? item.nome_pdm.toLowerCase().includes(termoNormalizado) : false;

      if (bateCodigo || bateDescricao || batePdm) {
        resultados.push(item);
        if (resultados.length >= limite) break;
      }
    }

    return resultados;
  }

  /**
   * Obtém item específico por código CATMAT
   */
  static obterPorCodigo(codigoCatmat: string): CatmatItem | null {
    const formatado = codigoCatmat.startsWith('BR') ? codigoCatmat : `BR${codigoCatmat.padStart(7, '0')}`;
    return this.catalogoLocal.get(formatado) || this.catalogoLocal.get(codigoCatmat) || null;
  }
}
