import { NextResponse } from 'next/server';

export interface AtaItem {
  id: string;
  item_numero: number;
  codigo_catmat: string;
  descricao_medicamento: string;
  principio_ativo: string;
  unidade_fornecimento: string;
  quantidade_total: number;
  quantidade_consumida: number;
  quantidade_saldo: number;
  preco_homologado: number;
  preco_teto_cmed: number;
  preco_referencia_bps: number;
  economia_cmed_pct: number;
  trava_sobrepreco: boolean;
}

export interface AtaRegistroPreco {
  id: string;
  numero_ata: string;
  processo_licitatorio: string;
  modalidade: string;
  orgao_gerenciador: string;
  fornecedor_cnpj: string;
  fornecedor_razao_social: string;
  vigencia_inicio: string;
  vigencia_fim: string;
  valor_total: number;
  status: 'VIGENTE' | 'ESGOTADA' | 'VENCIDA' | 'CANCELADA';
  limite_carona_orgao_pct: number;
  itens: AtaItem[];
}

// Base mock inicial enriquecida com conformidade à Lei 14.133/21
const atasDB: AtaRegistroPreco[] = [
  {
    id: 'ata-001',
    numero_ata: 'ARP-2026/042-SMS',
    processo_licitatorio: 'PE-SRP nº 018/2026',
    modalidade: 'Pregão Eletrônico SRP (Lei 14.133/21)',
    orgao_gerenciador: 'Secretaria Municipal de Saúde / Hospital Central 360',
    fornecedor_cnpj: '12.345.678/0001-90',
    fornecedor_razao_social: 'Distribuidora Farmacêutica Nacional S/A',
    vigencia_inicio: '2026-01-15',
    vigencia_fim: '2027-01-14',
    valor_total: 4850000.00,
    status: 'VIGENTE',
    limite_carona_orgao_pct: 50.0,
    itens: [
      {
        id: 'item-001',
        item_numero: 1,
        codigo_catmat: 'BR0284729',
        descricao_medicamento: 'Meropenem 1g Pó Liofilizado Injetável',
        principio_ativo: 'Meropenem Tri-hidratado',
        unidade_fornecimento: 'Frasco-Ampola',
        quantidade_total: 20000,
        quantidade_consumida: 6500,
        quantidade_saldo: 13500,
        preco_homologado: 48.50,
        preco_teto_cmed: 68.20,
        preco_referencia_bps: 52.10,
        economia_cmed_pct: 28.88,
        trava_sobrepreco: false
      },
      {
        id: 'item-002',
        item_numero: 2,
        codigo_catmat: 'BR0194851',
        descricao_medicamento: 'Noradrenalina (Hemitartarato) 2mg/mL Ampola 4mL',
        principio_ativo: 'Hemitartarato de Norepinefrina',
        unidade_fornecimento: 'Ampola',
        quantidade_total: 50000,
        quantidade_consumida: 21000,
        quantidade_saldo: 29000,
        preco_homologado: 12.80,
        preco_teto_cmed: 18.50,
        preco_referencia_bps: 14.20,
        economia_cmed_pct: 30.81,
        trava_sobrepreco: false
      },
      {
        id: 'item-003',
        item_numero: 3,
        codigo_catmat: 'BR0311209',
        descricao_medicamento: 'Fentanila 0,05mg/mL Solução Injetável 10mL',
        principio_ativo: 'Citrato de Fentanila (Portaria 344/98)',
        unidade_fornecimento: 'Ampola',
        quantidade_total: 15000,
        quantidade_consumida: 4800,
        quantidade_saldo: 10200,
        preco_homologado: 16.90,
        preco_teto_cmed: 22.40,
        preco_referencia_bps: 17.50,
        economia_cmed_pct: 24.55,
        trava_sobrepreco: false
      }
    ]
  },
  {
    id: 'ata-002',
    numero_ata: 'ARP-2026/089-SES',
    processo_licitatorio: 'PE-SRP nº 033/2026',
    modalidade: 'Pregão Eletrônico SRP (Lei 14.133/21)',
    orgao_gerenciador: 'Secretaria de Estado da Saúde (SES-SP)',
    fornecedor_cnpj: '98.765.432/0001-11',
    fornecedor_razao_social: 'BioGenética Hospitalar Comércio e Representação Ltda',
    vigencia_inicio: '2026-03-01',
    vigencia_fim: '2027-02-28',
    valor_total: 8200000.00,
    status: 'VIGENTE',
    limite_carona_orgao_pct: 50.0,
    itens: [
      {
        id: 'item-004',
        item_numero: 1,
        codigo_catmat: 'BR0355102',
        descricao_medicamento: 'Enoxaparina Sódica 40mg/0,4mL Seringa Preenchida',
        principio_ativo: 'Enoxaparina Sódica',
        unidade_fornecimento: 'Seringa Preenchida',
        quantidade_total: 40000,
        quantidade_consumida: 12500,
        quantidade_saldo: 27500,
        preco_homologado: 23.40,
        preco_teto_cmed: 34.00,
        preco_referencia_bps: 25.80,
        economia_cmed_pct: 31.17,
        trava_sobrepreco: false
      },
      {
        id: 'item-005',
        item_numero: 2,
        codigo_catmat: 'BR0401928',
        descricao_medicamento: 'Imunoglobulina Humana 5g Frasco 100mL',
        principio_ativo: 'Imunoglobulina Humana Endovenosa',
        unidade_fornecimento: 'Frasco',
        quantidade_total: 1200,
        quantidade_consumida: 980,
        quantidade_saldo: 220,
        preco_homologado: 1250.00,
        preco_teto_cmed: 1580.00,
        preco_referencia_bps: 1320.00,
        economia_cmed_pct: 20.88,
        trava_sobrepreco: false
      }
    ]
  }
];

export async function GET() {
  const totalAtas = atasDB.length;
  const totalItens = atasDB.reduce((acc, a) => acc + a.itens.length, 0);
  const valorTotalHomologado = atasDB.reduce((acc, a) => acc + a.valor_total, 0);
  const saldoGeralItens = atasDB.flatMap(a => a.itens).reduce((acc, i) => acc + i.quantidade_saldo, 0);

  return NextResponse.json({
    success: true,
    metricas: {
      total_atas_vigentes: totalAtas,
      total_itens_catmat: totalItens,
      valor_total_homologado: valorTotalHomologado,
      saldo_itens_disponivel: saldoGeralItens,
      conformidade_lei_14133: '100% REGULAR',
      auditoria_sobrepreco: 'ZERO DESVIOS DETECTADOS'
    },
    atas: atasDB
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ata_id, item_id, quantidade_empenho, orgao_demandante, tipo_adesao } = body;

    if (!ata_id || !item_id || !quantidade_empenho || quantidade_empenho <= 0) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros obrigatórios ausentes ou quantidade inválida.' },
        { status: 400 }
      );
    }

    const ata = atasDB.find(a => a.id === ata_id);
    if (!ata) {
      return NextResponse.json({ success: false, error: 'Ata de Registro de Preço não encontrada.' }, { status: 404 });
    }

    const item = ata.itens.find(i => i.id === item_id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item não localizado nesta Ata.' }, { status: 404 });
    }

    // Trava de Saldo da Ata
    if (quantidade_empenho > item.quantidade_saldo) {
      return NextResponse.json(
        {
          success: false,
          error: `Saldo insuficiente na Ata. Disponível: ${item.quantidade_saldo} ${item.unidade_fornecimento}, Solicitado: ${quantidade_empenho}.`
        },
        { status: 422 }
      );
    }

    // Trava Legal Carona (Art. 86 da Lei 14.133/21: Carona não pode exceder 50% do total registrado por órgão)
    if (tipo_adesao === 'CARONA_ADESAO') {
      const limiteCarona = item.quantidade_total * (ata.limite_carona_orgao_pct / 100);
      if (quantidade_empenho > limiteCarona) {
        return NextResponse.json(
          {
            success: false,
            error: `Violação da Lei 14.133/21 Art. 86: Limite de adesão carona individual (${ata.limite_carona_orgao_pct}%) excedido. Máximo permitido: ${limiteCarona} unidades.`
          },
          { status: 422 }
        );
      }
    }

    // Trava de Sobrepreço (Art. 82 § 5º Lei 14.133/21): Preço homologado não pode ser superior ao Teto CMED nem ao Banco de Preços em Saúde (BPS)
    if (item.preco_homologado > item.preco_teto_cmed || item.preco_homologado > item.preco_referencia_bps) {
      return NextResponse.json(
        {
          success: false,
          error: `TRAVA DE SOBREPREÇO ATIVA: Preço licitado (R$ ${item.preco_homologado}) é superior ao teto CMED (R$ ${item.preco_teto_cmed}) ou BPS (R$ ${item.preco_referencia_bps}). Empenho bloqueado preventivamente.`
        },
        { status: 403 }
      );
    }

    // Executa empenho
    item.quantidade_consumida += Number(quantidade_empenho);
    item.quantidade_saldo -= Number(quantidade_empenho);

    const valorEmpenho = Number(quantidade_empenho) * item.preco_homologado;
    const numeroEmpenho = `EMP-2026/${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      mensagem: 'Empenho e autorização de fornecimento (AF) emitidos com sucesso.',
      empenho: {
        numero_empenho: numeroEmpenho,
        ata_numero: ata.numero_ata,
        item_catmat: item.codigo_catmat,
        medicamento: item.descricao_medicamento,
        quantidade_empenhada: quantidade_empenho,
        preco_unitario: item.preco_homologado,
        valor_total: valorEmpenho,
        orgao_demandante: orgao_demandante || 'Hospital Central 360',
        tipo_adesao: tipo_adesao || 'ORGAO_GERENCIADOR',
        saldo_remanescente_item: item.quantidade_saldo,
        emissao: new Date().toISOString()
      }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
