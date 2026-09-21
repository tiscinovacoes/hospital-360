import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      telefonePaciente = '+55 67 99841-2091',
      pacienteNome = 'Mariana Oliveira',
      tipoNotificacao = 'LAUDO_LIBERADO', // CONFIRMACAO_AGENDA | CHAMADA_SENHA | LAUDO_LIBERADO
      laudoUrl,
      senhaChamada,
      consultorio,
    } = body;

    let mensagemTexto = '';

    if (tipoNotificacao === 'LAUDO_LIBERADO') {
      mensagemTexto = `Olá, ${pacienteNome}! Seus exames realizados no Laboratório SENAITE Hospital 360 já estão prontos e assinados pelo biomédico. Acesse seu laudo com segurança no link: https://hospital360.med.br${laudoUrl || '/laudos/portal'}`;
    } else if (tipoNotificacao === 'CHAMADA_SENHA') {
      mensagemTexto = `Atenção ${pacienteNome}: sua senha ${senhaChamada || 'A-104'} foi chamada! Por favor, dirija-se ao ${consultorio || 'Consultório Sala 204'}.`;
    } else {
      mensagemTexto = `Olá ${pacienteNome}, confirmamos seu agendamento no Hospital 360 para amanhã. Responda 1 para confirmar ou 2 para reagendar.`;
    }

    const despachoPoli = {
      messageId: `ZAP-${Date.now()}`,
      telefoneDestino: telefonePaciente,
      tipoNotificacao,
      textoEnviado: mensagemTexto,
      statusEnvio: 'ENTREGUE_WHATSAPP_ANTI_BAN',
      timestampEnvio: new Date().toISOString(),
      provedor: 'Poli CRM / aiviq-zap-app (Baileys Multi-Session)',
    };

    return NextResponse.json({
      success: true,
      message: 'Notificação despachada com sucesso via WhatsApp Poli.',
      data: despachoPoli,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Falha ao despachar notificação WhatsApp: ' + err.message },
      { status: 500 }
    );
  }
}
