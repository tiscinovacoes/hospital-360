import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

// Base de honorários médicos apurados por paciente
const honorariosMedicosDB = [
  {
    id: 'DSP-ESC-301',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    medico: 'Dr. Roberto Albuquerque de Castro',
    crm: 'CRM/SP 142.981',
    especialidade: 'Medicina Intensiva & Emergencista',
    setor: 'UTI_GERAL',
    codigoItem: 'HON-INT-UTI',
    descricaoItem: 'Visita Diária Horizontal Intensivista & Prescrição Crítica',
    horasDedica: 4.5,
    valorHora: 160.00,
    valorTotal: 720.00,
    dataAtendimento: '2026-09-21 11:00:00'
  },
  {
    id: 'DSP-ESC-302',
    cpf: '123.456.789-00',
    nome: 'Carlos Eduardo Silveira',
    episodio: 'EPIS-2026-8841',
    medico: 'Dra. Camila Vasconcelos Ramos',
    crm: 'CRM/SP 188.420',
    especialidade: 'Cirurgia Geral & Trauma',
    setor: 'CENTRO_CIRURGICO',
    codigoItem: 'HON-CIR-PRIN',
    descricaoItem: 'Ato Cirúrgico Principal - Osteossíntese e Fixação Ortopédica',
    horasDedica: 3.0,
    valorHora: 350.00,
    valorTotal: 1050.00,
    dataAtendimento: '2026-09-21 15:30:00'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf') || '123.456.789-00';

    const honorarios = honorariosMedicosDB.filter(h => h.cpf === cpf);
    const total = honorarios.reduce((acc, h) => acc + h.valorTotal, 0);

    return NextResponse.json({
      success: true,
      modulo: 'ESCALA_MEDICA',
      paciente_cpf: cpf,
      total_honorarios: honorarios.length,
      valor_total_apurado: total,
      honorarios_apurados: honorarios,
      status_aprovacao: 'HOMOLOGADO_DIRETORIA_CLINICA'
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

    const honorarios = honorariosMedicosDB.filter(h => h.cpf === cpf);

    if (honorarios.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum honorário médico localizado para este paciente.' },
        { status: 404 }
      );
    }

    const payloadDespesas = honorarios.map(h => ({
      id_transacao: h.id,
      paciente_cpf: h.cpf,
      paciente_nome: h.nome,
      prontuario_episodio: h.episodio,
      centro_custo: h.setor,
      item_codigo: h.codigoItem,
      item_descricao: `${h.descricaoItem} — ${h.medico} (${h.crm})`,
      quantidade: h.horasDedica,
      unidade_medida: 'Horas Assistenciais',
      valor_unitario_medio: h.valorHora,
      valor_total_imputado: h.valorTotal,
      data_consumo: h.dataAtendimento,
      origem_modulo: 'ESCALA_MEDICA',
      estacao_jornada: 5
    }));

    const resultado = HubDespesasService.ingerirLote({
      origem_modulo: 'ESCALA_MEDICA',
      data_geracao: new Date().toISOString(),
      despesas: payloadDespesas
    });

    return NextResponse.json({
      success: true,
      modulo_emissor: 'ESCALA_MEDICA',
      protocolo_hub: resultado.protocolo,
      itens_exportados: resultado.itensAdicionados.length,
      valor_total_exportado: resultado.valorTotal,
      mensagem: 'Honorários médicos e plantões hospitalares exportados com sucesso ao Hub 360.'
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
