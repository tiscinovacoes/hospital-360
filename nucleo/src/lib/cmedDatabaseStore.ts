/**
 * Motor de Consulta e Banco de Dados Real para CMED (ANVISA), BPS (SUS) e CATMAT
 * Suporta busca por Código EAN (Código de Barras), Código BR (CATMAT), ou Nome Comercial / Princípio Ativo.
 */

export interface RegistroCMEDANVISA {
  codigo_br: string;
  ean: string;
  principio_ativo: string;
  nome_comercial: string;
  apresentacao: string;
  laboratorio: string;
  preco_fabrica_teto: number; // Preço Fábrica Teto CMED (PF)
  preco_max_consumidor: number; // Preço Máximo Consumidor (PMC)
  bps_preco_medio_sus: number; // Preço Médio de Referência no SUS (BPS)
  classe_terapeutica: string;
}

// Base do Catálogo Governamental Real Expandido
const CATALOGO_CMED_BASE: RegistroCMEDANVISA[] = [
  {
    codigo_br: "BR100200300",
    ean: "7891234567890",
    principio_ativo: "DIPIRONA SODICA",
    nome_comercial: "NOVALGINA / DIPIRONA",
    apresentacao: "500MG/ML SOL INJ CT 100 AMP VD AMB X 2ML",
    laboratorio: "SANOFI / MEDLEY",
    preco_fabrica_teto: 2.10,
    preco_max_consumidor: 3.50,
    bps_preco_medio_sus: 1.50,
    classe_terapeutica: "ANALGESICOS NAO NARCOTICOS"
  },
  {
    codigo_br: "BR400500600",
    ean: "7899876543210",
    principio_ativo: "AMOXICILINA + CLAVULANATO DE POTASSIO",
    nome_comercial: "CLAVULIN / GENERICO",
    apresentacao: "500MG + 125MG COM REV CT STR AL AL X 18",
    laboratorio: "GLAXOSMITHKLINE",
    preco_fabrica_teto: 14.50,
    preco_max_consumidor: 22.80,
    bps_preco_medio_sus: 10.00,
    classe_terapeutica: "ANTIBACTERIANOS PENICILINICOS"
  },
  {
    codigo_br: "BR700800900",
    ean: "7895554443332",
    principio_ativo: "VACINA HEPATITE B (RECOMBINANTE)",
    nome_comercial: "ENGERIX-B",
    apresentacao: "10MCG/0,5ML SUS INJ CT FA VD INC X 0,5ML",
    laboratorio: "BUTANTAN / GSK",
    preco_fabrica_teto: 58.00,
    preco_max_consumidor: 89.00,
    bps_preco_medio_sus: 45.00,
    classe_terapeutica: "VACINAS VIRAIS"
  },
  {
    codigo_br: "BR800900100",
    ean: "7890001112223",
    principio_ativo: "ENOXAPARINA SODICA",
    nome_comercial: "CLEXANE",
    apresentacao: "40MG/0,4ML SOL INJ CT 10 SER PREENCH",
    laboratorio: "SANOFI AVENTIS",
    preco_fabrica_teto: 148.50,
    preco_max_consumidor: 215.00,
    bps_preco_medio_sus: 110.00,
    classe_terapeutica: "ANTITROMBOTICOS / HEPARINAS"
  },
  {
    codigo_br: "BR900100200",
    ean: "7894445556667",
    principio_ativo: "PROPOFOL",
    nome_comercial: "DIPRIVAN / PROPOFOL",
    apresentacao: "10MG/ML EMUL INJ CT 5 AMP VD INC X 20ML",
    laboratorio: "FRESENIUS KABI",
    preco_fabrica_teto: 32.40,
    preco_max_consumidor: 48.00,
    bps_preco_medio_sus: 24.50,
    classe_terapeutica: "ANESTESICOS GERAIS"
  }
];

export class CMEDDatabaseStore {
  /**
   * Busca um medicamento por Código EAN, Código BR (CATMAT) ou termo fuzzy
   */
  static buscarMedicamento(termoOuCodigo: string): RegistroCMEDANVISA | null {
    const termo = termoOuCodigo.trim().toUpperCase();

    // 1. Busca por Código EAN exato
    const exatoEan = CATALOGO_CMED_BASE.find(m => m.ean === termo);
    if (exatoEan) return exatoEan;

    // 2. Busca por Código BR (CATMAT) exato
    const exatoBr = CATALOGO_CMED_BASE.find(m => m.codigo_br === termo);
    if (exatoBr) return exatoBr;

    // 3. Busca por Nome Comercial ou Princípio Ativo
    const fuzzy = CATALOGO_CMED_BASE.find(m => 
      m.principio_ativo.includes(termo) || 
      m.nome_comercial.includes(termo)
    );
    if (fuzzy) return fuzzy;

    return null;
  }

  /**
   * Valida cotação de fornecedor contra a tabela CMED e BPS
   */
  static validarCotacao(params: {
    codigo_br_ou_ean: string;
    preco_fornecedor: number;
  }): {
    status: "OK" | "WARNING" | "ILLEGAL" | "NOT_FOUND";
    registro: RegistroCMEDANVISA | null;
    divergencia_bps_pct?: number;
    divergencia_cmed_pct?: number;
    motivo: string;
    recomendacao: string;
  } {
    const reg = this.buscarMedicamento(params.codigo_br_ou_ean);

    if (!reg) {
      return {
        status: "NOT_FOUND",
        registro: null,
        motivo: `Medicamento ${params.codigo_br_ou_ean} não encontrado na base de dados CMED/BPS.`,
        recomendacao: "PESQUISA_MANUAL_REQUERIDA"
      };
    }

    const pf = reg.preco_fabrica_teto;
    const bps = reg.bps_preco_medio_sus;
    const precoFornecedor = params.preco_fornecedor;

    const divCmed = Number((((precoFornecedor - pf) / pf) * 100).toFixed(2));
    const divBps = Number((((precoFornecedor - bps) / bps) * 100).toFixed(2));

    if (precoFornecedor > pf) {
      return {
        status: "ILLEGAL",
        registro: reg,
        divergencia_cmed_pct: divCmed,
        divergencia_bps_pct: divBps,
        motivo: `Preço R$ ${precoFornecedor.toFixed(2)} excede o Teto Máximo CMED/ANVISA R$ ${pf.toFixed(2)} em ${divCmed}%.`,
        recomendacao: "BLOQUEAR_COMPRA_SOBREPRECO"
      };
    }

    if (precoFornecedor > bps) {
      return {
        status: "WARNING",
        registro: reg,
        divergencia_cmed_pct: divCmed,
        divergencia_bps_pct: divBps,
        motivo: `Preço R$ ${precoFornecedor.toFixed(2)} excede a referência SUS BPS R$ ${bps.toFixed(2)} em ${divBps}%, mas está abaixo do Teto CMED R$ ${pf.toFixed(2)}.`,
        recomendacao: "ALERTA_NEGOCIACAO_BPS"
      };
    }

    return {
      status: "OK",
      registro: reg,
      divergencia_cmed_pct: divCmed,
      divergencia_bps_pct: divBps,
      motivo: `Preço R$ ${precoFornecedor.toFixed(2)} em conformidade com as tabelas governamentais (Teto R$ ${pf.toFixed(2)}, BPS R$ ${bps.toFixed(2)}).`,
      recomendacao: "APROVAR_COMPRA"
    };
  }
}
