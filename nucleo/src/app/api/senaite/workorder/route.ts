import { NextRequest, NextResponse } from "next/server";
import { SenaiteApiClient, ExameCatalogoLOINC } from "@/lib/senaiteApiClient";

export interface WorkOrderRequest {
  prescricao_id: string;
  paciente_cpf: string;
  paciente_nome: string;
  medico_crm: string;
  exames_codigo_loinc: string[];
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: WorkOrderRequest = await req.json();

    if (!payload.prescricao_id || !payload.exames_codigo_loinc?.length || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar prescricao_id, exames_codigo_loinc e tenant_id." },
        { status: 400 }
      );
    }

    const catalogo = SenaiteApiClient.obterCatalogoExamesLOINC();
    const examesValidados: ExameCatalogoLOINC[] = [];
    const examesNaoEncontrados: string[] = [];

    for (const code of payload.exames_codigo_loinc) {
      const achado = catalogo.find((e: ExameCatalogoLOINC) => e.codigo_loinc === code);
      if (achado) {
        examesValidados.push(achado);
      } else {
        examesNaoEncontrados.push(code);
      }
    }

    if (!examesValidados.length) {
      return NextResponse.json(
        { erro: "Nenhum exame do catálogo LOINC foi localizado.", exames_nao_encontrados: examesNaoEncontrados },
        { status: 422 }
      );
    }

    const workorderId = `WO-SEN-${Date.now()}`;
    const amostrasComEtiquetas = examesValidados.map((exame: ExameCatalogoLOINC, idx: number) => {
      const amostraId = `SMP-${workorderId}-${idx + 1}`;
      const qrCodePayload = JSON.stringify({
        amostra_id: amostraId,
        workorder_id: workorderId,
        loinc: exame.codigo_loinc,
        paciente: payload.paciente_nome,
        tenant_id: payload.tenant_id
      });

      // Comando ZPL para impressora térmica de etiquetas em tubos de ensaio
      const zplBarcode = `^XA^FO50,50^BY3^BCN,100,Y,N,N^FD${amostraId}^FS^FO50,180^A0N,25,25^FD${exame.nome_exame.slice(0, 25)}^FS^XZ`;

      return {
        amostra_id: amostraId,
        codigo_loinc: exame.codigo_loinc,
        nome_exame: exame.nome_exame,
        bancada_alocada: exame.categoria,
        zpl_etiqueta: zplBarcode,
        qr_code_data: qrCodePayload
      };
    });

    return NextResponse.json({
      status: "WORKORDER_CRIADA_SENAITE",
      workorder_id: workorderId,
      prescricao_id: payload.prescricao_id,
      tenant_id: payload.tenant_id,
      paciente: {
        cpf: payload.paciente_cpf,
        nome: payload.paciente_nome
      },
      amostras_geradas: amostrasComEtiquetas,
      exames_nao_encontrados: examesNaoEncontrados,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao criar WorkOrder no SENAITE LIMS", detalhes: error.message },
      { status: 500 }
    );
  }
}
