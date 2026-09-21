import { NextRequest, NextResponse } from 'next/server';

export interface EstacaoJornada {
  ordem: number;
  estacao: string;
  moduloResponsavel: string;
  horarioEntrada: string;
  horarioSaida: string;
  duracaoMinutos: number;
  custoGerado: number;
  descricao: string;
  detalhesIntegracao: string;
  status: 'CONCLUIDO' | 'EM_ANDAMENTO' | 'AGUARDANDO';
}

export interface JornadaDoorToDoor {
  cpf: string;
  nomePaciente: string;
  convenio: string;
  clinicaResponsavel: string; // Ex: Clínica CardioVida - Dr. Ricardo Mendes
  dataAtendimento: string;
  estacoes: EstacaoJornada[];
  custoTotalAcumulado: number;
  faturamentoEsperado: number;
  margemFinal: number;
  repasseSusSigtap: number;
  deficitSus: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get('cpf') || '123.456.789-00';

  const mockJornada: JornadaDoorToDoor = {
    cpf,
    nomePaciente: 'Carlos Eduardo Silveira',
    convenio: 'Unimed Pleno (TUSS)',
    clinicaResponsavel: 'Clínica CardioVida (Sala 204 — Dr. Ricardo Mendes)',
    dataAtendimento: '2026-09-21',
    estacoes: [
      {
        ordem: 1,
        estacao: '1. Porta de Entrada (Check-in & Triagem)',
        moduloResponsavel: 'Recepção 360 / Protocolo Manchester',
        horarioEntrada: '08:00',
        horarioSaida: '08:15',
        duracaoMinutos: 15,
        custoGerado: 38.50,
        descricao: 'Emissão de pulseira térmica QR Code e triagem de sinais vitais.',
        detalhesIntegracao: 'Abertura de episódio clínico via RPC registrar_evento_jornada.',
        status: 'CONCLUIDO',
      },
      {
        ordem: 2,
        estacao: '2. Consulta Clínica Especializada',
        moduloResponsavel: 'OpenEMR (G:\\Projetos\\gerenciamento clinica)',
        horarioEntrada: '08:20',
        horarioSaida: '08:50',
        duracaoMinutos: 30,
        custoGerado: 60.00, // 0.5h x R$ 120/h (Médico Cardiologista)
        descricao: 'Evolução clínica, eletrocardiograma e prescrição médica.',
        detalhesIntegracao: 'OpenEMR dispara webhook consulta_finalizada via n8n.',
        status: 'CONCLUIDO',
      },
      {
        ordem: 3,
        estacao: '3. Farmácia Hospitalar & Insumos',
        moduloResponsavel: 'OpenBoxes (G:\\Projetos\\Estoque - FEFO)',
        horarioEntrada: '08:52',
        horarioSaida: '08:55',
        duracaoMinutos: 3,
        custoGerado: 125.50,
        descricao: 'Baixa de Ceftriaxona 1g IV (Lote L-9941) e Kit Insumos Descartáveis.',
        detalhesIntegracao: 'n8n baixa automaticamente do estoque FEFO deduzindo lote e validade.',
        status: 'CONCLUIDO',
      },
      {
        ordem: 4,
        estacao: '4. Laboratório Central LIMS',
        moduloResponsavel: 'SENAITE.core (G:\\Projetos\\getenciamento de laboratorio)',
        horarioEntrada: '09:00',
        horarioSaida: '09:40',
        duracaoMinutos: 40,
        custoGerado: 145.00,
        descricao: 'Coleta de sangue venoso, hemograma automatizado e troponina ultrassensível.',
        detalhesIntegracao: 'SENAITE gera laudo assinado e devolve DiagnosticReport FHIR R4.',
        status: 'CONCLUIDO',
      },
      {
        ordem: 5,
        estacao: '5. Porta de Saída (Faturamento & Split)',
        moduloResponsavel: 'Hyperswitch (G:\\Projetos\\Fluxo de pagamento) & Contábil',
        horarioEntrada: '09:45',
        horarioSaida: '10:00',
        duracaoMinutos: 15,
        custoGerado: 42.00, // Rateio de hotelaria/limpeza e facilities
        descricao: 'Cobrança da consulta e exames com split: 80% clínica, 20% taxa condomínio.',
        detalhesIntegracao: 'Hyperswitch liquida recebimento e integra nota no sistema contábil.',
        status: 'CONCLUIDO',
      },
    ],
    custoTotalAcumulado: 411.00,
    faturamentoEsperado: 750.00,
    margemFinal: 339.00,
    repasseSusSigtap: 135.00,
    deficitSus: -276.00,
  };

  return NextResponse.json({
    success: true,
    data: mockJornada,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      metodologia: 'CUSTEIO_DOOR_TO_DOOR_360',
    },
  });
}
