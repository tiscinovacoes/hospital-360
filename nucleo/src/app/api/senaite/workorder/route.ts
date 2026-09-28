import { NextRequest, NextResponse } from 'next/server';
import { CATALOGO_EXAMES_SENAITE } from '../catalogo/route';

export interface SolicitacaoExameInput {
  codigoLoinc: string;
  nomeExame?: string;
  prioridade?: 'ROTINA' | 'URGENTE' | 'EMERGENCIA';
}

export interface WorkOrderInputPayload {
  pacienteCpf: string;
  pacienteNome: string;
  prontuarioId?: string;
  medicoSolicitante: string;
  crmMedico: string;
  origemModulo?: string; // Ex: OpenEMR / ProntoSocorro
  exames: SolicitacaoExameInput[];
  tenantId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WorkOrderInputPayload = await request.json();

    if (!body.pacienteCpf || !body.medicoSolicitante || !Array.isArray(body.exames) || body.exames.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payload inválido: pacienteCpf, medicoSolicitante e ao menos um exame são obrigatórios.',
        },
        { status: 400 }
      );
    }

    const workorderId = `WO-SENAITE-${Date.now().toString().slice(-8)}`;
    const amostraId = `SAM-${Date.now().toString().slice(-6)}`;
    const dataCriacao = new Date().toISOString();

    // Etiqueta com Código de Barras ZPL & QR Code SVG
    const codigoBarrasZPL = `^XA^FO50,50^BY3^BCN,100,Y,N,N^FD${amostraId}^FS^FO50,180^A0N,25,25^FD${body.pacienteNome.slice(0, 20)}^FS^XZ`;
    const qrCodeSvgData = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${amostraId}`;

    let custoTotalReagentes = 0;
    let tempoTotalBancada = 0;

    const examesProcessados = body.exames.map((item, idx) => {
      const infoCatalogo = CATALOGO_EXAMES_SENAITE.find(e => e.codigoLoinc === item.codigoLoinc || e.codigoInterno === item.codigoLoinc);
      
      const custoReagente = infoCatalogo ? infoCatalogo.custoReagenteBase + infoCatalogo.insumosDescartaveisCusto : 25.00;
      const tempoBancada = infoCatalogo ? infoCatalogo.tempoBancadaMinutos : 15;

      custoTotalReagentes += custoReagente;
      tempoTotalBancada += tempoBancada;

      return {
        itemIndex: idx + 1,
        codigoLoinc: item.codigoLoinc,
        nomeExame: infoCatalogo?.nome || item.nomeExame || 'Exame de Análises Clínicas',
        categoria: infoCatalogo?.categoria || 'BIOQUIMICA',
        prioridade: item.prioridade || 'ROTINA',
        custoReagente,
        tempoBancadaMinutos: tempoBancada,
        statusBancada: 'AGUARDANDO_COLETA',
        bancadaDesignada: `Bancada de ${infoCatalogo?.categoria || 'BIOQUIMICA'}`,
      };
    });

    const workorderCriada = {
      workorderId,
      amostraId,
      tenantId: body.tenantId || 'tenant-cardiovida',
      paciente: {
        cpf: body.pacienteCpf,
        nome: body.pacienteNome,
        prontuario: body.prontuarioId || 'PRON-001',
      },
      medico: {
        nome: body.medicoSolicitante,
        crm: body.crmMedico,
      },
      etiquetaAmostra: {
        amostraId,
        formatoZPL: codigoBarrasZPL,
        qrCodeUrl: qrCodeSvgData,
      },
      resumoOperacional: {
        totalExames: examesProcessados.length,
        custoTotalEstimadoReagentes: custoTotalReagentes,
        tempoTotalEstimadoBancadaMinutos: tempoTotalBancada,
        dataEntrada: dataCriacao,
      },
      exames: examesProcessados,
      statusGeral: 'WORKORDER_CRIADA_NA_FILA',
    };

    return NextResponse.json(
      {
        success: true,
        data: workorderCriada,
        error: null,
        meta: {
          timestamp: dataCriacao,
          squad: 'Squad 3 - SENAITE LIMS',
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro ao criar WorkOrder no SENAITE.';
    return NextResponse.json({ success: false, data: null, error: msg }, { status: 500 });
  }
}
