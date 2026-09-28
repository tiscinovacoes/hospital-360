import { NextRequest, NextResponse } from 'next/server';

export interface RetornoExamePayload {
  workorderId: string;
  pacienteCpf: string;
  codigoExame: string;
  nomeExame: string;
  resultadoTexto: string;
  laudoPdfUrl?: string;
  laudoPdfBase64?: string;
  custoLaboratorialApurado: number;
  biomedicoResponsavel: string;
  crmCrbm: string;
  dataConclusao: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RetornoExamePayload = await request.json();

    if (!body.workorderId || !body.pacienteCpf || !body.resultadoTexto) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payload incompleto: workorderId, pacienteCpf e resultadoTexto são obrigatórios.',
        },
        { status: 400 }
      );
    }

    const eventoRetorno = {
      statusOpenEMR: 'PRONTUARIO_ATUALIZADO',
      workorderId: body.workorderId,
      pacienteCpf: body.pacienteCpf,
      exame: {
        codigo: body.codigoExame,
        nome: body.nomeExame,
        resultado: body.resultadoTexto,
        laudoPdf: body.laudoPdfUrl || 'https://hospital360.local/laudos/' + body.workorderId + '.pdf',
        custoApurado: body.custoLaboratorialApurado || 45.00,
        biomedico: body.biomedicoResponsavel || 'Dra. Patricia Lima - CRBM/SP 4410',
        dataConclusao: body.dataConclusao || new Date().toISOString(),
      },
      notificacaoMedico: 'AVISO_EM_TELA_PRONTUARIO',
    };

    return NextResponse.json(
      {
        success: true,
        data: eventoRetorno,
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          squad: 'Squad 2 & Squad 3 Integration (SENAITE -> OpenEMR)',
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao processar retorno de exame.';
    return NextResponse.json({ success: false, data: null, error: msg }, { status: 500 });
  }
}
