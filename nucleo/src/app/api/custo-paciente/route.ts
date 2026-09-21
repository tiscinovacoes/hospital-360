import { NextRequest, NextResponse } from 'next/server';

export interface PacienteCustoAnalysis {
  cpf: string;
  nome: string;
  episodioId: string;
  tipoAtendimento: 'AMBULATORIAL' | 'INTERNACAO' | 'URGENCIA';
  dataEntrada: string;
  dataAlta?: string;
  diasInternacao: number;
  custosDiretos: {
    medicamentosMateriais: number; // Estoque FEFO ou Ingestão
    procedimentosExames: number;   // Laboratório / FHIR
    equipeAssistencial: number;    // RH / Custo-hora ou Ingestão
    totalDireto: number;
    itensDetalhados: Array<{
      descricao: string;
      origem: string;
      valor: number;
      lote?: string;
    }>;
  };
  custosIndiretosRateados: {
    diariaHotelaria: number;       // Leitos / Facilities Sabia
    higienizacaoFacilities: number; // Sabia Facilities
    depreciacaoEquipamentos: number; // Compras / Patrimônio
    apoioAdministrativoABC: number; // Rateio Geral
    totalIndireto: number;
  };
  custoTotalReal: number;
  benchmarkPrivado: {
    tabelaTussParticular: number;
    margemContribuicao: number;
    margemPercentual: number;
    statusMargem: 'LUCRO_SAUDAVEL' | 'MARGEM_APERTADA' | 'PREJUIZO';
  };
  benchmarkPublicoSus: {
    repasseTabelaSigtap: number;
    subsidioMunicipalNecessario: number;
    percentualCoberturaSus: number;
    deficitPorProcedimento: number;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get('cpf') || '123.456.789-00';

  // Simulação / Cálculo robusto consolidando eventos de jornada do paciente
  const mockAnalysis: PacienteCustoAnalysis = {
    cpf,
    nome: 'Carlos Eduardo Silveira',
    episodioId: 'EPIS-2026-8841',
    tipoAtendimento: 'INTERNACAO',
    dataEntrada: '2026-09-18T10:30:00Z',
    dataAlta: '2026-09-21T09:00:00Z',
    diasInternacao: 3,
    custosDiretos: {
      medicamentosMateriais: 845.50,
      procedimentosExames: 420.00,
      equipeAssistencial: 1250.00,
      totalDireto: 2515.50,
      itensDetalhados: [
        { descricao: 'Ceftriaxona 1g IV (Lote C-2026/09)', origem: 'Farmácia FEFO (OpenBoxes)', valor: 215.50, lote: 'L-9941' },
        { descricao: 'Kit Insumo Cirúrgico Estéril', origem: 'Farmácia FEFO / Almoxarifado', valor: 380.00, lote: 'K-302' },
        { descricao: 'Solução Fisiológica 0.9% 500ml (x6)', origem: 'Farmácia FEFO (OpenBoxes)', valor: 250.00, lote: 'SF-112' },
        { descricao: 'Hemograma Completo + PCR + Coagulograma', origem: 'Laboratório FHIR R4', valor: 420.00 },
        { descricao: 'Horas Médicas Especialista e Plantonista (10h)', origem: 'RH Escalas (OpenHRApp)', valor: 850.00 },
        { descricao: 'Assistência Enfermagem 24h Ponderada', origem: 'RH Escalas (OpenHRApp)', valor: 400.00 },
      ],
    },
    custosIndiretosRateados: {
      diariaHotelaria: 690.00,      // R$ 230/dia x 3
      higienizacaoFacilities: 185.00, // OS Sabia Leito 204B
      depreciacaoEquipamentos: 240.00, // Monitor multiparamétrico + bomba de infusão
      apoioAdministrativoABC: 320.00, // Rateio TI, governança, contabilidade
      totalIndireto: 1435.00,
    },
    custoTotalReal: 3950.50,
    benchmarkPrivado: {
      tabelaTussParticular: 5800.00,
      margemContribuicao: 1849.50,
      margemPercentual: 31.88,
      statusMargem: 'LUCRO_SAUDAVEL',
    },
    benchmarkPublicoSus: {
      repasseTabelaSigtap: 1420.00,
      subsidioMunicipalNecessario: 2530.50,
      percentualCoberturaSus: 35.94,
      deficitPorProcedimento: -2530.50,
    },
  };

  return NextResponse.json({
    success: true,
    data: mockAnalysis,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1.0-modular',
      motorCusteio: 'ABC_HOSPITALAR_360',
    },
  });
}
