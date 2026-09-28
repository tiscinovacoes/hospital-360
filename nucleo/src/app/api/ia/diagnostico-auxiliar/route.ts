import { NextRequest, NextResponse } from "next/server";

export interface SugestaoDiagnosticaPayload {
  sintomas_relatados: string[];
  sinais_vitais: {
    pressao_arterial?: string;
    frequencia_cardiaca?: number;
    temperatura_c?: number;
    saturacao_oxigenio_pct?: number;
  };
  historico_previo?: string;
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: SugestaoDiagnosticaPayload = await req.json();

    if (!payload.sintomas_relatados?.length || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar sintomas_relatados e tenant_id." },
        { status: 400 }
      );
    }

    const temDorToracica = payload.sintomas_relatados.some(s => s.toLowerCase().includes("dor torácica") || s.toLowerCase().includes("peito"));
    const temFebre = (payload.sinais_vitais?.temperatura_c || 0) >= 38.0;

    let hipotesePrincipal = "Síndrome Gripal / Infecção das Vias Aéreas Superiores";
    let prioridadeSugesto = "VERDE";
    let examesSugeridos = ["Hemograma Completo", "PCR"];

    if (temDorToracica) {
      hipotesePrincipal = "Síndrome Coronariana Aguda / Infarto Agudo do Miocárdio";
      prioridadeSugesto = "VERMELHO";
      examesSugeridos = ["Troponina I de Alta Sensibilidade", "ECG 12 Derivações", "Ecocardiograma"];
    } else if (temFebre && (payload.sinais_vitais?.frequencia_cardiaca || 0) > 100) {
      hipotesePrincipal = "Suspeita de Síndrome Séptica / Foco Infeccioso a Esclarecer";
      prioridadeSugesto = "LARANJA";
      examesSugeridos = ["Hemocultura", "Hemograma", "Lactato Sérico", "Gasometria Arterial"];
    }

    return NextResponse.json({
      status: "ANALISE_IA_CONCLUIDA",
      tenant_id: payload.tenant_id,
      sugestao_clinica: {
        hipotese_principal: hipotesePrincipal,
        nivel_prioridade_sugerido: prioridadeSugesto,
        exames_complementares_sugeridos: examesSugeridos,
        aviso_legal: "Esta sugestão emitida por Inteligência Artificial Diagnóstica é estritamente de caráter auxiliar. O diagnóstico final e conduta são de responsabilidade exclusiva do médico assistente (CFM)."
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao gerar hipótese por IA diagnóstica", detalhes: error.message },
      { status: 500 }
    );
  }
}
