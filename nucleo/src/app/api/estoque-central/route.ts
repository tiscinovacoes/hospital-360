import { NextResponse } from 'next/server';

export interface LocalEstoque {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'CD_CENTRAL' | 'FARMACIA_SATELITE_UTI' | 'FARMACIA_SATELITE_PS' | 'CAMARA_FRIA';
  temperatura_atual: number;
  temperatura_min: number;
  temperatura_max: number;
  umidade_atual_pct: number;
  status_climatizacao: 'CONFORME' | 'ALERTA_TERMICO' | 'CRITICO';
  responsavel_crf: string;
}

export interface LoteEstoqueCD {
  id: string;
  lote: string;
  codigo_medicamento: string;
  nome_medicamento: string;
  principio_ativo: string;
  local_atual_id: string;
  local_atual_nome: string;
  data_validade: string;
  quantidade: number;
  ponto_ressuprimento_minimo: number;
  custo_medio_unitario: number;
  status: 'DISPONIVEL' | 'QUARENTENA' | 'RECOLHIMENTO_ANVISA' | 'ESGOTADO';
  termo_sensivel: boolean;
}

const locaisDB: LocalEstoque[] = [
  {
    id: 'loc-01',
    codigo: 'CD-01',
    nome: 'Centro de Distribuição Principal 360',
    tipo: 'CD_CENTRAL',
    temperatura_atual: 21.2,
    temperatura_min: 15.0,
    temperatura_max: 25.0,
    umidade_atual_pct: 48.5,
    status_climatizacao: 'CONFORME',
    responsavel_crf: 'CRF-SP 42.190'
  },
  {
    id: 'loc-02',
    codigo: 'CF-01',
    nome: 'Câmara Fria Termolábeis (2ºC a 8ºC)',
    tipo: 'CAMARA_FRIA',
    temperatura_atual: 4.8,
    temperatura_min: 2.0,
    temperatura_max: 8.0,
    umidade_atual_pct: 42.0,
    status_climatizacao: 'CONFORME',
    responsavel_crf: 'CRF-SP 42.190'
  },
  {
    id: 'loc-03',
    codigo: 'FS-UTI',
    nome: 'Farmácia Satélite - UTI Adulto / Coronária',
    tipo: 'FARMACIA_SATELITE_UTI',
    temperatura_atual: 22.0,
    temperatura_min: 18.0,
    temperatura_max: 24.0,
    umidade_atual_pct: 50.1,
    status_climatizacao: 'CONFORME',
    responsavel_crf: 'CRF-SP 55.431'
  },
  {
    id: 'loc-04',
    codigo: 'FS-PS',
    nome: 'Farmácia Satélite - Pronto-Socorro & Trauma',
    tipo: 'FARMACIA_SATELITE_PS',
    temperatura_atual: 22.5,
    temperatura_min: 18.0,
    temperatura_max: 24.0,
    umidade_atual_pct: 52.0,
    status_climatizacao: 'CONFORME',
    responsavel_crf: 'CRF-SP 61.202'
  }
];

const lotesEstoqueDB: LoteEstoqueCD[] = [
  {
    id: 'lote-101',
    lote: 'LT-2026-MERO-01',
    codigo_medicamento: 'MED-001',
    nome_medicamento: 'Meropenem 1g Injetável',
    principio_ativo: 'Meropenem',
    local_atual_id: 'loc-01',
    local_atual_nome: 'Centro de Distribuição Principal 360',
    data_validade: '2026-12-30',
    quantidade: 13500,
    ponto_ressuprimento_minimo: 3000,
    custo_medio_unitario: 48.50,
    status: 'DISPONIVEL',
    termo_sensivel: false
  },
  {
    id: 'lote-102',
    lote: 'LT-2026-NORA-04',
    codigo_medicamento: 'MED-002',
    nome_medicamento: 'Noradrenalina 2mg/mL Ampola 4mL',
    principio_ativo: 'Hemitartarato de Norepinefrina',
    local_atual_id: 'loc-03',
    local_atual_nome: 'Farmácia Satélite - UTI Adulto / Coronária',
    data_validade: '2026-11-15',
    quantidade: 1800,
    ponto_ressuprimento_minimo: 800,
    custo_medio_unitario: 12.80,
    status: 'DISPONIVEL',
    termo_sensivel: false
  },
  {
    id: 'lote-103',
    lote: 'LT-2026-IMUNO-88',
    codigo_medicamento: 'MED-005',
    nome_medicamento: 'Imunoglobulina Humana 5g 100mL',
    principio_ativo: 'Imunoglobulina Endovenosa',
    local_atual_id: 'loc-02',
    local_atual_nome: 'Câmara Fria Termolábeis (2ºC a 8ºC)',
    data_validade: '2027-04-20',
    quantidade: 220,
    ponto_ressuprimento_minimo: 50,
    custo_medio_unitario: 1250.00,
    status: 'DISPONIVEL',
    termo_sensivel: true
  },
  {
    id: 'lote-104',
    lote: 'LT-2026-ENOX-99',
    codigo_medicamento: 'MED-004',
    nome_medicamento: 'Enoxaparina Sódica 40mg Seringa',
    principio_ativo: 'Enoxaparina Sódica',
    local_atual_id: 'loc-01',
    local_atual_nome: 'Centro de Distribuição Principal 360',
    data_validade: '2026-10-10',
    quantidade: 450,
    ponto_ressuprimento_minimo: 1000,
    custo_medio_unitario: 23.40,
    status: 'QUARENTENA',
    termo_sensivel: false
  }
];

export async function GET() {
  const valorTotalCD = lotesEstoqueDB.reduce((acc, l) => acc + (l.quantidade * l.custo_medio_unitario), 0);
  const lotesQuarentena = lotesEstoqueDB.filter(l => l.status === 'QUARENTENA');
  const lotesAbaixoMinimo = lotesEstoqueDB.filter(l => l.quantidade <= l.ponto_ressuprimento_minimo);

  return NextResponse.json({
    success: true,
    metricas: {
      valor_total_estoque_consolidado: valorTotalCD,
      total_locais_ativos: locaisDB.length,
      lotes_em_quarentena: lotesQuarentena.length,
      alertas_ponto_ressuprimento: lotesAbaixoMinimo.length,
      status_cadeia_frio: '100% OPERACIONAL CONFORME RDC 430/2020'
    },
    locais: locaisDB,
    lotes: lotesEstoqueDB
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { acao, lote_id, local_destino_id, quantidade, motivo_quarentena, laudo_tecnico } = body;

    if (acao === 'TRANSFERIR_SATELITE') {
      const lote = lotesEstoqueDB.find(l => l.id === lote_id);
      if (!lote) {
        return NextResponse.json({ success: false, error: 'Lote não encontrado no CD.' }, { status: 404 });
      }

      const destino = locaisDB.find(loc => loc.id === local_destino_id);
      if (!destino) {
        return NextResponse.json({ success: false, error: 'Local de destino não localizado.' }, { status: 404 });
      }

      if (lote.status !== 'DISPONIVEL') {
        return NextResponse.json(
          { success: false, error: `Lote está com status ${lote.status}. Proibida movimentação para satélites sem liberação prévia.` },
          { status: 422 }
        );
      }

      const qtdTransferir = Number(quantidade);
      if (qtdTransferir <= 0 || qtdTransferir > lote.quantidade) {
        return NextResponse.json(
          { success: false, error: `Quantidade solicitada (${qtdTransferir}) superior ao saldo do lote (${lote.quantidade}).` },
          { status: 422 }
        );
      }

      // Validação Termossensíveis RDC 430/2020
      if (lote.termo_sensivel && destino.tipo !== 'CAMARA_FRIA' && destino.temperatura_atual > 8.0) {
        return NextResponse.json(
          {
            success: false,
            error: `BLOQUEIO CADEIA DE FRIO: Medicamento termolábil (${lote.nome_medicamento}) exige destino refrigerado (2ºC a 8ºC). Destino ${destino.nome} opera a ${destino.temperatura_atual}ºC.`
          },
          { status: 422 }
        );
      }

      lote.quantidade -= qtdTransferir;

      const remessaCodigo = `TRF-CD-${Date.now().toString().slice(-6)}`;

      return NextResponse.json({
        success: true,
        mensagem: 'Transferência entre CD e Farmácia Satélite despachada com sucesso.',
        transferencia: {
          codigo_remessa: remessaCodigo,
          lote: lote.lote,
          medicamento: lote.nome_medicamento,
          quantidade: qtdTransferir,
          origem: lote.local_atual_nome,
          destino: destino.nome,
          temperatura_origem: 'Monitorada / Conforme',
          saldo_restante_origem: lote.quantidade,
          timestamp: new Date().toISOString()
        }
      });
    }

    if (acao === 'ISOLAR_QUARENTENA') {
      const lote = lotesEstoqueDB.find(l => l.id === lote_id);
      if (!lote) {
        return NextResponse.json({ success: false, error: 'Lote não encontrado.' }, { status: 404 });
      }

      lote.status = 'QUARENTENA';

      return NextResponse.json({
        success: true,
        mensagem: 'Lote bloqueado preventivamente e transferido para Quarentena Sanitária.',
        quarentena: {
          lote: lote.lote,
          medicamento: lote.nome_medicamento,
          motivo: motivo_quarentena || 'Desvio identificado na conferência física ou térmica',
          laudo_tecnico: laudo_tecnico || 'Aguardando parecer final do Farmacêutico Auditor Responsável',
          status: 'BLOQUEIO_OPERACIONAL',
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Ação não suportada.' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
