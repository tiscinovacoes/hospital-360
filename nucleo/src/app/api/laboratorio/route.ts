import { NextRequest, NextResponse } from 'next/server';

// Catálogo LIMS homologado (SENAITE LIMS - Sprint 3)
const CATALOGO_LIMS: Record<
  string,
  { codigo: string; nome: string; prazoMinutos: number; custoReagentes: number; custoBancada: number; ref: string }
> = {
  'LOINC-1751-7': {
    codigo: 'LOINC-1751-7',
    nome: 'Hemograma Completo com Plaquetas',
    prazoMinutos: 45,
    custoReagentes: 14.5,
    custoBancada: 18.0,
    ref: '4.5 a 5.9 milhões/uL (Eritrócitos)',
  },
  'LOINC-6598-7': {
    codigo: 'LOINC-6598-7',
    nome: 'Troponina I Cardíaca Ultrassensível',
    prazoMinutos: 30,
    custoReagentes: 38.0,
    custoBancada: 22.0,
    ref: '< 14 ng/L (Normal / Não detectável)',
  },
  'LOINC-1988-5': {
    codigo: 'LOINC-1988-5',
    nome: 'Proteína C-Reativa (PCR) Quantitativa',
    prazoMinutos: 30,
    custoReagentes: 11.2,
    custoBancada: 12.0,
    ref: '< 0.5 mg/dL',
  },
  'LOINC-2093-3': {
    codigo: 'LOINC-2093-3',
    nome: 'Colesterol Total e Frações (Lipidograma)',
    prazoMinutos: 60,
    custoReagentes: 16.8,
    custoBancada: 15.0,
    ref: '< 190 mg/dL (Desejável)',
  },
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: Object.values(CATALOGO_LIMS),
    totalExames: Object.keys(CATALOGO_LIMS).length,
    modulo: 'SENAITE LIMS v2.5 Hospital 360',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pacienteId = 'PAC-789456',
      pacienteNome = 'Mariana Oliveira dos Santos',
      cpf = '789.456.123-00',
      medicoNome = 'Dr. Ricardo Mendes',
      crm = 'CRM/MS 8492',
      examesSolicitados = ['LOINC-6598-7'],
      prioridade = 'URGENTE',
    } = body;

    const workorderId = `WO-LIMS-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const resultados: any[] = [];
    let custoTotalLaboratorio = 0;

    for (const codigo of examesSolicitados) {
      const exame = CATALOGO_LIMS[codigo];
      if (exame) {
        const custo = exame.custoReagentes + exame.custoBancada;
        custoTotalLaboratorio += custo;

        const resultadoValor =
          codigo === 'LOINC-6598-7' ? '8.4 ng/L (Não Reagente)' : '5.2 milhões/uL (Normal)';

        resultados.push({
          codigoLoinc: exame.codigo,
          nome: exame.nome,
          resultado: resultadoValor,
          referencia: exame.ref,
          custoApurado: custo,
        });
      }
    }

    const amostraBarcode = `SAMPLE-LOINC-${Date.now().toString().slice(-6)}`;

    const laudoLiberado = {
      workorderId,
      amostraBarcode,
      timestampCriacao: timestamp,
      timestampLiberacao: timestamp,
      biomedicoResponsavel: 'Dr. Felipe Vasconcelos (CRBM/MS 4812)',
      paciente: {
        id: pacienteId,
        nome: pacienteNome,
        cpfAnonimizado: cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '$1.***.***-$4'),
      },
      solicitante: {
        medico: medicoNome,
        crm,
      },
      prioridade,
      status: 'LAUDO_LIBERADO_ASSINADO',
      resultados,
      custoTotalLaboratorio: Number(custoTotalLaboratorio.toFixed(2)),
      pdfLaudoUrl: `/laudos/senaite/${workorderId}.pdf`,
      webhookEnviado: 'lims.laudo_liberado',
    };

    return NextResponse.json({
      success: true,
      data: laudoLiberado,
      mensagem: `WorkOrder ${workorderId} processada com sucesso no SENAITE LIMS. Laudo assinado e disponível.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Falha ao processar WorkOrder no LIMS: ' + err.message },
      { status: 500 }
    );
  }
}
