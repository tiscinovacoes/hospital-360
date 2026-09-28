import { NextRequest, NextResponse } from "next/server";

export interface TelemetriaCadeiaFrio {
  sensor_id: string;
  localizacao: string; // ex: "Geladeira Vacinas Farmacia Central"
  temperatura_atual_c: number;
  temperatura_min_permitida_c: number;
  temperatura_max_permitida_c: number;
  umidade_relativa_pct: number;
  tenant_id: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload: TelemetriaCadeiaFrio = await req.json();

    if (!payload.sensor_id || payload.temperatura_atual_c === undefined || !payload.tenant_id) {
      return NextResponse.json(
        { erro: "Payload inválido. Informar sensor_id, temperatura_atual_c e tenant_id." },
        { status: 400 }
      );
    }

    const tempMin = payload.temperatura_min_permitida_c || 2.0;
    const tempMax = payload.temperatura_max_permitida_c || 8.0;
    const tempAtual = payload.temperatura_atual_c;

    const violacaoTemperatura = tempAtual < tempMin || tempAtual > tempMax;

    if (violacaoTemperatura) {
      const alertaCritico = {
        alerta_id: `ALT-TEMP-${Date.now()}`,
        nivel: "CRITICO_CADEIA_FRIO",
        sensor_id: payload.sensor_id,
        localizacao: payload.localizacao,
        temperatura_registrada_c: tempAtual,
        faixa_permitida: `${tempMin}°C a ${tempMax}°C`,
        acao_recomendada: "TRANSFERIR VACINAS/IMUNOBIOLOGICOS PARA GELADEIRA DE BACKUP IMEDIATAMENTE",
        timestamp: new Date().toISOString()
      };

      return NextResponse.json({
        status: "ALERTA_TEMPERATURA_DISPARADO",
        mensagem: "Desvio crítico de temperatura detectado na cadeia de frio!",
        alerta: alertaCritico
      }, { status: 422 });
    }

    return NextResponse.json({
      status: "EM_CONFORMIDADE",
      mensagem: "Temperatura da cadeia de frio dentro dos padrões estipulados pela ANVISA.",
      sensor_id: payload.sensor_id,
      temperatura_atual_c: tempAtual,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { erro: "Erro ao processar telemetria de cadeia de frio", detalhes: error.message },
      { status: 500 }
    );
  }
}
