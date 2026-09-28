import { NextRequest, NextResponse } from "next/server";
import { HubDespesasService } from "@/lib/hubDespesasStore";

export type StatusLeito = "LIVRE" | "OCUPADO" | "HIGIENIZACAO" | "MANUTENCAO" | "ISOLAMENTO";

export interface LeitoCadastro {
  leito_id: string;
  codigo_leito: string;
  unidade_ala: string; // ex: "UTI Adulto - Bloco A"
  tipo: "UTI" | "ENFERMARIA" | "APARTAMENTO" | "ISOLAMENTO";
  status: StatusLeito;
  paciente_cpf?: string;
  paciente_nome?: string;
  data_admissao?: string;
  diaria_valor_base: number;
  tenant_id: string;
}

// Mock de Leitos em Memória
let LEITOS_STORE: LeitoCadastro[] = [
  {
    leito_id: "LET-101",
    codigo_leito: "101-A",
    unidade_ala: "UTI Adulto",
    tipo: "UTI",
    status: "OCUPADO",
    paciente_cpf: "123.456.789-00",
    paciente_nome: "Carlos Eduardo Silva",
    data_admissao: "2026-09-20T10:00:00Z",
    diaria_valor_base: 1450.00,
    tenant_id: "hospital_360_default"
  },
  {
    leito_id: "LET-102",
    codigo_leito: "102-B",
    unidade_ala: "Enfermaria Geral",
    tipo: "ENFERMARIA",
    status: "LIVRE",
    diaria_valor_base: 450.00,
    tenant_id: "hospital_360_default"
  }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenant_id") || "hospital_360_default";

  const leitosTenant = LEITOS_STORE.filter(l => l.tenant_id === tenantId);
  const ocupados = leitosTenant.filter(l => l.status === "OCUPADO").length;
  const livres = leitosTenant.filter(l => l.status === "LIVRE").length;
  const higienizacao = leitosTenant.filter(l => l.status === "HIGIENIZACAO").length;
  const manutencao = leitosTenant.filter(l => l.status === "MANUTENCAO").length;
  const taxaOcupacao = leitosTenant.length ? Number(((ocupados / leitosTenant.length) * 100).toFixed(2)) : 0;

  return NextResponse.json({
    status: "SUCESSO",
    censo: {
      total_leitos: leitosTenant.length,
      ocupados,
      livres,
      higienizacao,
      manutencao,
      taxa_ocupacao_pct: taxaOcupacao
    },
    leitos: leitosTenant,
    timestamp: new Date().toISOString()
  }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { acao, leito_id, paciente_cpf, paciente_nome, tenant_id } = body;

    const leitoIndex = LEITOS_STORE.findIndex(l => l.leito_id === leito_id);
    if (leitoIndex === -1) {
      return NextResponse.json({ erro: `Leito ${leito_id} não encontrado` }, { status: 404 });
    }

    const leito = LEITOS_STORE[leitoIndex];

    if (acao === "ALTA_SOLICITAR_HIGIENIZACAO") {
      // Paciente recebe alta -> leito passa para HIGIENIZACAO
      const diariaCobrada = leito.diaria_valor_base;
      leito.status = "HIGIENIZACAO";
      leito.paciente_cpf = undefined;
      leito.paciente_nome = undefined;

      // Reportar diária/custo fixo do leito para Estação 5 do Hub Core
      HubDespesasService.ingerirLote({
        origem_modulo: "LEITOS_CENSO_NIR",
        despesas: [{
          id_transacao: `DSP-LET-${leito.codigo_leito}-${Date.now()}`,
          paciente_cpf: paciente_cpf || "123.456.789-00",
          paciente_nome: paciente_nome || "Paciente em Alta",
          prontuario_episodio: `EPIS-${leito.codigo_leito}`,
          centro_custo: leito.unidade_ala,
          leito_identificador: leito.codigo_leito,
          item_codigo: "DIARIA-HOSPITALAR",
          item_descricao: `Diária Hospitalar (${leito.tipo})`,
          quantidade: 1,
          unidade_medida: "Diária",
          valor_unitario_medio: diariaCobrada,
          valor_total_imputado: diariaCobrada,
          data_consumo: new Date().toISOString(),
          estacao_jornada: 5 // 5. Hotelaria, Diárias & Honorários
        }]
      });

      return NextResponse.json({
        status: "HIGIENIZACAO_SOLICITADA",
        mensagem: `Leito ${leito.codigo_leito} liberado para higienização hospitalar. Diária imputada no Hub Core.`,
        leito,
        ordem_facilities_trigger: {
          leito_id: leito.leito_id,
          prioridade: "ALTA",
          tipo_limpeza: "DESINFECÇÃO_TERMINAL"
        }
      }, { status: 200 });
    }

    return NextResponse.json({ erro: "Ação não reconhecida" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}
