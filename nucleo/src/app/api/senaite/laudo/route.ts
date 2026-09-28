import { NextRequest, NextResponse } from 'next/server';

export interface EmitirLaudoInputPayload {
  workorderId: string;
  pacienteCpf: string;
  pacienteNome: string;
  codigoLoinc: string;
  nomeExame: string;
  resultadosParametros: Array<{
    parametroNome: string;
    valorEncontrado: number | string;
    unidade: string;
    valorReferencia: string;
    alterado?: boolean;
  }>;
  biomedicoResponsavel: string;
  crbmBiomedico: string;
  tempoBancadaEfetivoMinutos?: number;
  custoReagentesEfetivo?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmitirLaudoInputPayload = await request.json();

    if (!body.workorderId || !body.pacienteCpf || !body.codigoLoinc || !Array.isArray(body.resultadosParametros)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payload incompleto. workorderId, pacienteCpf, codigoLoinc e resultadosParametros são obrigatórios.',
        },
        { status: 400 }
      );
    }

    // Task 3.1: Fórmula de Custeio Laboratorial Contábil de Precisão
    const horaTecnicaBiomedico = 60.00; // R$ 60,00 por hora técnica de bancada
    const tempoMinutos = body.tempoBancadaEfetivoMinutos || 20;
    const custoReagentes = body.custoReagentesEfetivo || 35.00;
    
    const custoMaoDeObra = (tempoMinutos / 60) * horaTecnicaBiomedico;
    const custoTotalRealExame = parseFloat((custoReagentes + custoMaoDeObra).toFixed(2));

    const laudoId = `LAUDO-SENAITE-${Date.now().toString().slice(-6)}`;
    const timestampConclusao = new Date().toISOString();

    // Task 3.2: Layout e Simulação de Assinatura Digital ICP-Brasil / PKCS#7
    const urlLaudoPdf = `https://hospital360.local/laudos/pdf/${laudoId}.pdf`;
    const hashSha256Laudo = `sha256_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    const laudoEmitido = {
      laudoId,
      workorderId: body.workorderId,
      paciente: {
        cpf: body.pacienteCpf,
        nome: body.pacienteNome,
      },
      exame: {
        codigoLoinc: body.codigoLoinc,
        nome: body.nomeExame,
        resultados: body.resultadosParametros,
      },
      custeioApurado: {
        custoReagentesInsumos: custoReagentes,
        custoMaoDeObraBancada: parseFloat(custoMaoDeObra.toFixed(2)),
        tempoBancadaMinutos: tempoMinutos,
        custoTotalRealExame,
      },
      assinaturaDigital: {
        biomedico: body.biomedicoResponsavel || 'Dra. Patricia Lima',
        registroProfissional: body.crbmBiomedico || 'CRBM/SP 4410',
        tipoAssinatura: 'ICP-BRASIL_PKCS7_DIGITAL_SIGNATURE',
        hashSha256: hashSha256Laudo,
        carimboTempo: timestampConclusao,
      },
      urlDocumentoPdf: urlLaudoPdf,
      status: 'LAUDO_ASSINADO_DISPONIVEL',
    };

    return NextResponse.json(
      {
        success: true,
        data: laudoEmitido,
        error: null,
        meta: {
          timestamp: timestampConclusao,
          squad: 'Squad 3 - SENAITE LIMS',
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao emitir laudo no SENAITE.';
    return NextResponse.json({ success: false, data: null, error: msg }, { status: 500 });
  }
}
