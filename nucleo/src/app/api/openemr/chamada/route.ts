import { NextRequest, NextResponse } from 'next/server';

export interface ChamadaPacientePayload {
  pacienteCpf: string;
  pacienteNome: string;
  telefoneCelular?: string; // Para envio do WhatsApp via Poli
  salaConsultorio: string; // Ex: Sala 204
  nomeMedico: string; // Ex: Dr. Ricardo Mendes
  tenantId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChamadaPacientePayload = await request.json();

    if (!body.pacienteCpf || !body.salaConsultorio || !body.nomeMedico) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payload incompleto. pacienteCpf, salaConsultorio e nomeMedico são obrigatórios.',
        },
        { status: 400 }
      );
    }

    const protocoloChamada = `CHAMADA-${Date.now().toString().slice(-6)}`;
    const mensagemWhatsApp = `Olá, ${body.pacienteNome || 'Paciente'}! É a sua vez: favor se dirigir à ${body.salaConsultorio} para atendimento com ${body.nomeMedico}. Hospital 360.`;

    const eventoChamada = {
      protocolo: protocoloChamada,
      tenantId: body.tenantId || 'tenant-cardiovida',
      pacienteCpf: body.pacienteCpf,
      pacienteNome: body.pacienteNome || 'Paciente',
      salaConsultorio: body.salaConsultorio,
      nomeMedico: body.nomeMedico,
      horarioChamada: new Date().toISOString(),
      painelSinalizacao: {
        textoPainelTV: `${body.pacienteNome?.toUpperCase()} ➔ ${body.salaConsultorio.toUpperCase()}`,
        sinalSonoro: 'BEEP_CHAMADA_DUPLO',
      },
      notificacaoPoliWhatsApp: {
        enviado: !!body.telefoneCelular,
        telefoneDestino: body.telefoneCelular || 'N/A',
        mensagem: mensagemWhatsApp,
        statusDisparo: 'ENVIADO_BARRAMENTO_POLI',
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: eventoChamada,
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          squad: 'Squad 2 & Squad 7 Integration',
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao processar chamada de paciente.';
    return NextResponse.json({ success: false, data: null, error: msg }, { status: 500 });
  }
}
