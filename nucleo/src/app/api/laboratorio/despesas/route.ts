import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

// Exames LIMS e reagentes processados
const examesLaboratorioDB = [
  {
    id: 'DSP-LAB-401',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    codigoLoinc: 'LOINC-1751-7',
    descricao: 'Hemograma Completo com Contagem de Plaquetas (Bancada Automatizada Sysmex)',
    setor: 'HEMATOLOGIA',
    custoReagentes: 14.50,
    custoBancada: 18.00,
    valorTotal: 32.50,
    dataLiberacao: '2026-09-20 09:45:00',
    biomedico: 'Dr. Felipe Vasconcelos (CRBM/SP 4812)'
  },
  {
    id: 'DSP-LAB-402',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    codigoLoinc: 'LOINC-6598-7',
    descricao: 'Troponina I Cardíaca Ultrassensível Curva 0h/3h (Quimioluminescência Abbott)',
    setor: 'BIOQUIMICA_URGENCIA',
    custoReagentes: 76.00,
    custoBancada: 44.00,
    valorTotal: 120.00,
    dataLiberacao: '2026-09-20 10:15:00',
    biomedico: 'Dr. Felipe Vasconcelos (CRBM/SP 4812)'
  },
  {
    id: 'DSP-LAB-403',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    codigoLoinc: 'LOINC-1988-5',
    descricao: 'Proteína C-Reativa Ultrassensível (PCR Turbidimetria)',
    setor: 'BIOQUIMICA_URGENCIA',
    custoReagentes: 11.20,
    custoBancada: 12.00,
    valorTotal: 23.20,
    dataLiberacao: '2026-09-20 10:15:00',
    biomedico: 'Dr. Felipe Vasconcelos (CRBM/SP 4812)'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const exames = examesLaboratorioDB.filter(e => e.cpf === cpf);
    const total = exames.reduce((acc, e) => acc + e.valorTotal, 0);

    return NextResponse.json({
      success: true,
      modulo: 'LABORATORIO_LIMS',
      paciente_cpf: cpf,
      total_exames: exames.length,
      valor_total_apurado: Number(total.toFixed(2)),
      exames_apurados: exames,
      status_lims: 'LAUDOS_ASSINADOS_DIGITALMENTE'
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

    const exames = examesLaboratorioDB.filter(e => e.cpf === cpf);

    if (exames.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum exame LIMS pendente para este paciente.' },
        { status: 404 }
      );
    }

    const payloadDespesas = exames.map(e => ({
      id_transacao: e.id,
      paciente_cpf: e.cpf,
      paciente_nome: e.nome,
      prontuario_episodio: e.episodio,
      centro_custo: 'LABORATORIO_CENTRAL',
      item_codigo: e.codigoLoinc,
      item_descricao: e.descricao,
      quantidade: 1,
      unidade_medida: 'Exame Diagnóstico',
      valor_unitario_medio: e.valorTotal,
      valor_total_imputado: e.valorTotal,
      data_consumo: e.dataLiberacao,
      origem_modulo: 'LABORATORIO_LIMS',
      estacao_jornada: 2
    }));

    const resultado = HubDespesasService.ingerirLote({
      origem_modulo: 'LABORATORIO_LIMS',
      data_geracao: new Date().toISOString(),
      despesas: payloadDespesas
    });

    return NextResponse.json({
      success: true,
      modulo_emissor: 'LABORATORIO_LIMS',
      protocolo_hub: resultado.protocolo,
      itens_exportados: resultado.itensAdicionados.length,
      valor_total_exportado: resultado.valorTotal,
      mensagem: 'Custos de bancada e reagentes LIMS integrados com sucesso no Hub 360.'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
