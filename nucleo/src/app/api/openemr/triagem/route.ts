import { NextRequest, NextResponse } from 'next/server';

export type ManchesterColor = 'VERMELHO' | 'LARANJA' | 'AMARELO' | 'VERDE' | 'AZUL';

export interface TriagemManchesterPayload {
  pacienteCpf: string;
  pacienteNome: string;
  pressaoArterial?: string;
  frequenciaCardiaca?: number;
  temperaturaCelsius?: number;
  saturacaoO2?: number;
  sintomasDescricao: string;
  corManchester: ManchesterColor;
  salaConsultorio?: string;
  tenantId?: string;
}

// Tabela de Tempo Máximo de Espera por Cor Manchester (Norma MS)
const TEMPO_ESPERA_MANCHESTER: Record<ManchesterColor, { minutosMax: number; prioridadeText: string }> = {
  VERMELHO: { minutosMax: 0, prioridadeText: 'Emergência (Atendimento Imediato)' },
  LARANJA: { minutosMax: 10, prioridadeText: 'Muito Urgente (Até 10 min)' },
  AMARELO: { minutosMax: 60, prioridadeText: 'Urgente (Até 60 min)' },
  VERDE: { minutosMax: 120, prioridadeText: 'Pouco Urgente (Até 120 min)' },
  AZUL: { minutosMax: 240, prioridadeText: 'Não Urgente (Até 240 min)' },
};

export async function POST(request: NextRequest) {
  try {
    const body: TriagemManchesterPayload = await request.json();

    if (!body.pacienteCpf || !body.corManchester || !body.sintomasDescricao) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payload incompleto. pacienteCpf, corManchester e sintomasDescricao são obrigatórios.',
        },
        { status: 400 }
      );
    }

    const regManchester = TEMPO_ESPERA_MANCHESTER[body.corManchester] || TEMPO_ESPERA_MANCHESTER['VERDE'];
    const protocoloTriagem = `TRIAG-${body.corManchester.slice(0, 3)}-${Date.now().toString().slice(-6)}`;

    const eventoTriagem = {
      protocolo: protocoloTriagem,
      tenantId: body.tenantId || 'tenant-cardiovida',
      pacienteCpf: body.pacienteCpf,
      pacienteNome: body.pacienteNome || 'Paciente Triado',
      sinaisVitais: {
        pa: body.pressaoArterial || '120/80 mmHg',
        fc: body.frequenciaCardiaca || 75,
        temp: body.temperaturaCelsius || 36.5,
        satO2: body.saturacaoO2 || 98,
      },
      classificacaoRisco: {
        cor: body.corManchester,
        descricaoPrioridade: regManchester.prioridadeText,
        tempoMaximoEsperaMinutos: regManchester.minutosMax,
      },
      salaConsultorioDesignada: body.salaConsultorio || 'Consultório 04 (Cardiologia)',
      horarioTriagem: new Date().toISOString(),
      statusFila: 'AGUARDANDO_CHAMADA',
    };

    return NextResponse.json(
      {
        success: true,
        data: eventoTriagem,
        error: null,
        meta: {
          timestamp: new Date().toISOString(),
          sistema: 'OpenEMR v7.0 Triagem Manchester',
          squad: 'Squad 2 - Clínicas Médicas',
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro na triagem Manchester.';
    return NextResponse.json({ success: false, data: null, error: msg }, { status: 500 });
  }
}
