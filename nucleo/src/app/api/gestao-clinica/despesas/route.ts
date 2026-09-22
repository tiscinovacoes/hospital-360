import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

// Procedimentos e consultas clínicas ambulatoriais (OpenEMR / Recepção)
const consultasAmbulatorioDB = [
  {
    id: 'DSP-CLN-601',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    medico: 'Dr. Ricardo Mendes',
    crm: 'CRM/SP 98.411',
    especialidade: 'Cardiologia Clínica',
    codigoProcedimento: 'AMB-CONS-01',
    descricao: 'Consulta Médica Especializada com Anamnese, ECG 12 Derivações e Laudo',
    valorTotal: 180.00,
    dataAtendimento: '2026-09-20 08:30:00',
    centroCusto: 'AMBULATORIO_CARDIOLOGIA'
  },
  {
    id: 'DSP-CLN-602',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    medico: 'Enf. Juliana Silveira Prado',
    crm: 'COREN/SP 209.114',
    especialidade: 'Classificação de Risco',
    codigoProcedimento: 'TRI-MANCH-01',
    descricao: 'Classificação de Risco Protocolo Manchester (Fita Laranja - Muito Urgente)',
    valorTotal: 45.00,
    dataAtendimento: '2026-09-20 08:05:00',
    centroCusto: 'PRONTO_SOCORRO_TRIAGEM'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const consultas = consultasAmbulatorioDB.filter(c => c.cpf === cpf);
    const total = consultas.reduce((acc, c) => acc + c.valorTotal, 0);

    return NextResponse.json({
      success: true,
      modulo: 'GESTAO_CLINICA',
      paciente_cpf: cpf,
      total_consultas_procedimentos: consultas.length,
      valor_total_imputado: total,
      consultas: consultas,
      status_prontuario: 'ATENDIMENTOS_ENCERRADOS_COM_SUCESSO'
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

    const consultas = consultasAmbulatorioDB.filter(c => c.cpf === cpf);

    if (consultas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma consulta ou triagem clínica localizada para este paciente.' },
        { status: 404 }
      );
    }

    const payloadDespesas = consultas.map(c => ({
      id_transacao: c.id,
      paciente_cpf: c.cpf,
      paciente_nome: c.nome,
      prontuario_episodio: c.episodio,
      centro_custo: c.centroCusto,
      item_codigo: c.codigoProcedimento,
      item_descricao: `${c.descricao} (${c.medico})`,
      quantidade: 1,
      unidade_medida: 'Procedimento / Atendimento',
      valor_unitario_medio: c.valorTotal,
      valor_total_imputado: c.valorTotal,
      data_consumo: c.dataAtendimento,
      origem_modulo: 'GESTAO_CLINICA',
      estacao_jornada: 1
    }));

    const resultado = HubDespesasService.ingerirLote({
      origem_modulo: 'GESTAO_CLINICA',
      data_geracao: new Date().toISOString(),
      despesas: payloadDespesas
    });

    return NextResponse.json({
      success: true,
      modulo_emissor: 'GESTAO_CLINICA',
      protocolo_hub: resultado.protocolo,
      itens_exportados: resultado.itensAdicionados.length,
      valor_total_exportado: resultado.valorTotal,
      mensagem: 'Despesas de acolhimento, triagem e consultas clínicas integradas ao Hub 360.'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
