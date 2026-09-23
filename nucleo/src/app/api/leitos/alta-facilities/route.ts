import { NextRequest, NextResponse } from 'next/server';
import { HubDespesasService } from '@/lib/hubDespesasStore';

export interface AltaFacilitiesPayload {
  leitoId: string;
  leitoNome?: string;
  ala?: string;
  tipoLeito?: string;
  pacienteNome: string;
  pacienteCpf: string;
  prontuarioEpisodio: string;
  motivoAlta?: 'ALTA_CLINICA' | 'TRANSFERENCIA' | 'OBITO' | 'ALTA_A_PEDIDO';
  tipoLimpeza?: 'TERMINAL' | 'CONCORRENTE';
  tempoPermanenciaDias?: number;
  valorDiaria?: number;
  enfermeiroResponsavel?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AltaFacilitiesPayload = await request.json();
    const {
      leitoId,
      leitoNome = 'Leito Hospitalar',
      ala = 'UTI Geral',
      tipoLeito = 'UTI Adulto',
      pacienteNome,
      pacienteCpf,
      prontuarioEpisodio,
      motivoAlta = 'ALTA_CLINICA',
      tipoLimpeza = 'TERMINAL',
      tempoPermanenciaDias = 3,
      valorDiaria = 1450.0,
      enfermeiroResponsavel = 'Enf. Thiago Pires (COREN/SP 289.410)',
    } = body;

    if (!leitoId || !pacienteNome || !pacienteCpf) {
      return NextResponse.json(
        {
          success: false,
          error: 'leitoId, pacienteNome e pacienteCpf são campos estritamente obrigatórios.',
        },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const dias = Number(tempoPermanenciaDias) || 1;
    const diaria = Number(valorDiaria) || 1450.0;
    const custoTotalDiarias = Number((dias * diaria).toFixed(2));

    // 1. Ingestão Automática no Hub de Custos: Estação 5 (Internação UTI & Hotelaria)
    const resultadoIngestaoHub = HubDespesasService.ingerirLote({
      origem_modulo: 'LEITOS_CENSO_NIR',
      cliente_id: 'leitos_nir_central',
      lote_exportacao_id: `LOTE-LEI-${Date.now()}`,
      data_geracao: timestamp,
      despesas: [
        {
          id_transacao: `DSP-LEI-${Date.now()}-DIARIA`,
          paciente_cpf: pacienteCpf,
          paciente_nome: pacienteNome,
          prontuario_episodio: prontuarioEpisodio || `EPIS-${Date.now()}`,
          centro_custo: ala.toUpperCase().replace(/\s+/g, '_'),
          leito_identificador: `${leitoId} (${leitoNome})`,
          item_codigo: `DIAR-${tipoLeito.toUpperCase().slice(0, 4)}`,
          item_descricao: `Diárias Hospitalares de ${tipoLeito} (${dias} dias) com Enfermagem e Hotelaria`,
          quantidade: dias,
          unidade_medida: 'Diária',
          valor_unitario_medio: diaria,
          valor_total_imputado: custoTotalDiarias,
          data_consumo: timestamp,
          origem_modulo: 'LEITOS_CENSO_NIR',
          estacao_jornada: 5, // Estação 5: Internação UTI & Honorários
          metadados: {
            motivo_alta: motivoAlta,
            ala,
            enfermeiro_responsavel: enfermeiroResponsavel,
          },
        },
      ],
    });

    // 2. Abertura do Chamado Automático em Facilities (Desinfecção Terminal)
    const chamadoId = `FAC-${Date.now().toString().slice(-6)}`;
    const isUtiOuIsolamento = ala.toUpperCase().includes('UTI') || ala.toUpperCase().includes('ISOLAMENTO');
    const slaMinutos = isUtiOuIsolamento ? 45 : 30; // 45min UTI (com UV/peróxido), 30min enfermaria

    const chamadoFacilities = {
      chamadoId,
      leitoId,
      leitoNome,
      ala,
      tipoLimpeza,
      prioridade: isUtiOuIsolamento ? 'ALTA_CRITICA' : 'MEDIA',
      status: 'EM_FILA_HIGIENIZACAO',
      slaMinutos,
      cronometroIniciadoEm: timestamp,
      tempoEstimadoConclusao: new Date(Date.now() + slaMinutos * 60 * 1000).toISOString(),
      responsavelAbertura: enfermeiroResponsavel,
      instrucoesHigienizacao: isUtiOuIsolamento
        ? 'Desinfecção terminal obrigatória com Quaternário de Amônio 5ª Geração + UV Terminal.'
        : 'Desinfecção terminal padrão de colchão, superfícies de contato e troca completa de enxoval.',
    };

    return NextResponse.json({
      success: true,
      message: `Alta do paciente ${pacienteNome} registrada com sucesso. Leito alterado para 'HIGIENIZACAO_PENDENTE' e custos lançados na Estação 5.`,
      leito: {
        id: leitoId,
        nome: leitoNome,
        statusAnterior: 'Ocupado',
        statusAtual: 'HIGIENIZACAO_PENDENTE',
      },
      chamadoFacilities,
      hubCustos: {
        protocolo: resultadoIngestaoHub.protocolo,
        estacao: 5,
        estacaoNome: 'Estação 5: Internação UTI & Honorários',
        valorImputado: resultadoIngestaoHub.valorTotal,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: 'Falha ao processar alta e acionamento de facilities: ' + msg },
      { status: 500 }
    );
  }
}
