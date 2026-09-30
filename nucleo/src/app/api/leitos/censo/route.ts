import { NextRequest, NextResponse } from "next/server";
import { LeitosDatabaseRepository } from "@/lib/leitosDatabaseRepository";
import { HubDespesasService, DespesaItem } from "@/lib/hubDespesasStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenant_id") || "hospital_360_default";

  const censoData = await LeitosDatabaseRepository.obterCensoHospitalarAsync(tenantId);

  return NextResponse.json({
    status: "SUCESSO",
    fonte: `PostgreSQL Leitos & NIR Database (${censoData.origem || 'SUPABASE_POSTGRES'})`,
    censo: {
      total_leitos: censoData.total_leitos,
      ocupados: censoData.ocupados,
      livres: censoData.livres,
      higienizacao: censoData.higienizacao,
      manutencao: censoData.manutencao,
      taxa_ocupacao_pct: censoData.taxa_ocupacao_pct
    },
    leitos: censoData.leitos,
    timestamp: new Date().toISOString()
  }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { acao, leito_id, paciente_cpf, paciente_nome, tenant_id } = body;

    if (acao === "ALTA_SOLICITAR_HIGIENIZACAO") {
      const leitoAtualizado = await LeitosDatabaseRepository.registrarAltaESolicitarHigienizacaoAsync(leito_id);

      if (!leitoAtualizado) {
        return NextResponse.json({ erro: `Leito ${leito_id} não encontrado no banco PostgreSQL` }, { status: 404 });
      }

      const timestamp = new Date().toISOString();
      const despesasDiarias: DespesaItem[] = [{
        id_transacao: `DSP-LET-${leitoAtualizado.codigo_leito}-${Date.now()}`,
        paciente_cpf: paciente_cpf || "123.456.789-00",
        paciente_nome: paciente_nome || "Paciente em Alta",
        prontuario_episodio: `EPIS-${leitoAtualizado.codigo_leito}`,
        centro_custo: leitoAtualizado.unidade_ala,
        leito_identificador: leitoAtualizado.codigo_leito,
        item_codigo: "DIARIA-HOSPITALAR",
        item_descricao: `Diária Hospitalar (${leitoAtualizado.tipo})`,
        quantidade: 1,
        unidade_medida: "Diária",
        valor_unitario_medio: leitoAtualizado.diaria_valor_base,
        valor_total_imputado: leitoAtualizado.diaria_valor_base,
        data_consumo: timestamp,
        origem_modulo: "LEITOS_CENSO_NIR",
        estacao_jornada: 5
      }];

      // Imputar diária hospitalar na Estação 5 do Hub Core
      const loteIngerido = HubDespesasService.ingerirLote({
        origem_modulo: "LEITOS_CENSO_NIR",
        cliente_id: "leitos_nir_censo",
        lote_exportacao_id: `LOTE-LEI-${leitoAtualizado.id}`,
        data_geracao: timestamp,
        despesas: despesasDiarias
      });

      // Persistir no Supabase
      await HubDespesasService.persistirLoteNoSupabase({
        protocolo: loteIngerido.protocolo,
        origem_modulo: "LEITOS_CENSO_NIR",
        cliente_id: "leitos_nir_censo",
        idempotency_key: `ALTA-CENSO-${leitoAtualizado.id}-${Date.now()}`,
        itens: despesasDiarias
      });

      return NextResponse.json({
        status: "HIGIENIZACAO_SOLICITADA",
        mensagem: `Leito ${leitoAtualizado.codigo_leito} liberado para higienização no banco PostgreSQL. Diária de R$ ${leitoAtualizado.diaria_valor_base.toFixed(2)} imputada no Hub Core.`,
        leito: leitoAtualizado,
        hub_protocolo: loteIngerido.protocolo,
        ordem_facilities_trigger: {
          leito_id: leitoAtualizado.id,
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
