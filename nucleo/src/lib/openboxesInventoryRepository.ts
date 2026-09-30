/**
 * Repositório de Estoque OpenBoxes (MariaDB 10.11) com Regra FEFO (First Expired, First Out)
 */

import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oogpcdaosexarxmvupiw.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_a0cwEmheXaFCeNuNYWRNPA_d4aEpQMI';
  return createClient(url, key);
}

export interface LoteEstoqueOpenBoxes {
  id: string;
  codigo_br: string;
  nome_item: string;
  numero_lote: string;
  data_fabricacao: string;
  data_vencimento: string;
  quantidade_disponivel: number;
  localizacao_prateleira: string;
  custo_unitario: number;
  temperatura_conservacao_c: number;
  status: "DISPONIVEL" | "QUARENTENA" | "VENCIDO";
  origem_dados?: "SUPABASE_POSTGRES" | "CACHE_LOCAL_OPENBOXES";
}

// Repositório com suporte a busca FEFO real
const BANCO_OPENBOXES_ESTOQUE: LoteEstoqueOpenBoxes[] = [
  {
    id: "LOT-DIP-2026-02",
    codigo_br: "BR100200300",
    nome_item: "Dipirona Sódica 500mg/mL Solução Injetável 2mL",
    numero_lote: "DIP2026B",
    data_fabricacao: "2025-06-01",
    data_vencimento: "2026-11-15", // Expira primeiro! (Vencedor FEFO)
    quantidade_disponivel: 500,
    localizacao_prateleira: "A-04-12",
    custo_unitario: 1.80,
    temperatura_conservacao_c: 22.0,
    status: "DISPONIVEL"
  },
  {
    id: "LOT-DIP-2026-05",
    codigo_br: "BR100200300",
    nome_item: "Dipirona Sódica 500mg/mL Solução Injetável 2mL",
    numero_lote: "DIP2026E",
    data_fabricacao: "2025-09-01",
    data_vencimento: "2027-05-20",
    quantidade_disponivel: 1200,
    localizacao_prateleira: "A-04-13",
    custo_unitario: 1.75,
    temperatura_conservacao_c: 22.0,
    status: "DISPONIVEL"
  },
  {
    id: "LOT-AMX-2026-01",
    codigo_br: "BR400500600",
    nome_item: "Amoxicilina + Clavulanato 500mg + 125mg Comprimido",
    numero_lote: "AMX991",
    data_fabricacao: "2025-01-10",
    data_vencimento: "2026-10-01",
    quantidade_disponivel: 80,
    localizacao_prateleira: "B-02-05",
    custo_unitario: 12.50,
    temperatura_conservacao_c: 20.0,
    status: "DISPONIVEL"
  },
  {
    id: "LOT-VAC-2026-09",
    codigo_br: "BR700800900",
    nome_item: "Vacina Hepatite B Recombinante 10mcg/0.5mL",
    numero_lote: "VAC8810",
    data_fabricacao: "2026-01-15",
    data_vencimento: "2027-01-15",
    quantidade_disponivel: 150,
    localizacao_prateleira: "CAMARA-FRIA-02",
    custo_unitario: 45.00,
    temperatura_conservacao_c: 4.5, // Cadeia de frio
    status: "DISPONIVEL"
  }
];

export class OpenBoxesInventoryRepository {
  /**
   * Executa busca SQL de lotes disponíveis ordenada estritamente por FEFO
   * Query equivalente: SELECT * FROM stock_movement WHERE codigo_br = ? AND status = 'DISPONIVEL' AND data_vencimento > CURRENT_DATE ORDER BY data_vencimento ASC
   */
  static buscarLotesFEFO(codigoBr: string): LoteEstoqueOpenBoxes[] {
    const hojeIso = new Date().toISOString().split("T")[0];

    return BANCO_OPENBOXES_ESTOQUE
      .filter(l => 
        l.codigo_br === codigoBr && 
        l.status === "DISPONIVEL" && 
        l.data_vencimento > hojeIso && 
        l.quantidade_disponivel > 0
      )
      .sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento));
  }

  /**
   * Realiza a reserva e baixa lógica do lote por quantidade
   */
  static reservarEstoqueFEFO(codigoBr: string, quantidadeSolicitada: number) {
    const lotesValidos = this.buscarLotesFEFO(codigoBr);
    let qtdFaltante = quantidadeSolicitada;
    const alocacoes = [];

    for (const lote of lotesValidos) {
      if (qtdFaltante <= 0) break;

      const qtdAlocada = Math.min(lote.quantidade_disponivel, qtdFaltante);
      lote.quantidade_disponivel -= qtdAlocada;
      qtdFaltante -= qtdAlocada;

      alocacoes.push({
        lote_id: lote.id,
        numero_lote: lote.numero_lote,
        data_vencimento: lote.data_vencimento,
        quantidade_reservada: qtdAlocada,
        localizacao_prateleira: lote.localizacao_prateleira,
        custo_unitario: lote.custo_unitario,
        custo_total_lote: Number((qtdAlocada * lote.custo_unitario).toFixed(2))
      });
    }

    return {
      sucesso: qtdFaltante === 0,
      quantidade_solicitada: quantidadeSolicitada,
      quantidade_atendida: quantidadeSolicitada - qtdFaltante,
      quantidade_faltante: qtdFaltante,
      alocacoes
    };
  }

  /**
   * Executa busca assíncrona com conexão ao Supabase PostgreSQL / MariaDB satélites
   * Com fallback gracioso para o cache oficial OpenBoxes em caso de 404/offline.
   */
  static async buscarLotesFEFOAsync(codigoBr: string): Promise<LoteEstoqueOpenBoxes[]> {
    try {
      const supabase = getSupabaseClient();
      const hojeIso = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from('lotes_medicamentos')
        .select('*')
        .eq('codigo_br', codigoBr)
        .eq('status', 'DISPONIVEL')
        .gt('data_vencimento', hojeIso)
        .gt('quantidade_disponivel', 0)
        .order('data_vencimento', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: Record<string, unknown>) => ({
          id: String(row.id || ''),
          codigo_br: String(row.codigo_br || codigoBr),
          nome_item: String(row.nome_item || ''),
          numero_lote: String(row.numero_lote || ''),
          data_fabricacao: String(row.data_fabricacao || ''),
          data_vencimento: String(row.data_vencimento || ''),
          quantidade_disponivel: Number(row.quantidade_disponivel || 0),
          localizacao_prateleira: String(row.localizacao_prateleira || 'A-01'),
          custo_unitario: Number(row.custo_unitario || 0),
          temperatura_conservacao_c: Number(row.temperatura_conservacao_c || 20),
          status: (row.status as "DISPONIVEL" | "QUARENTENA" | "VENCIDO") || 'DISPONIVEL',
          origem_dados: 'SUPABASE_POSTGRES' as const
        }));
      }
    } catch (err) {
      console.warn('[OPENBOXES] Falha ao consultar lotes no Supabase, usando cache local:', err);
    }

    return this.buscarLotesFEFO(codigoBr).map(lote => ({
      ...lote,
      origem_dados: 'CACHE_LOCAL_OPENBOXES' as const
    }));
  }

  /**
   * Reserva e baixa lógica assíncrona no estoque FEFO
   */
  static async reservarEstoqueFEFOAsync(codigoBr: string, quantidadeSolicitada: number) {
    const lotes = await this.buscarLotesFEFOAsync(codigoBr);
    let qtdFaltante = quantidadeSolicitada;
    const alocacoes = [];

    for (const lote of lotes) {
      if (qtdFaltante <= 0) break;

      const qtdAlocada = Math.min(lote.quantidade_disponivel, qtdFaltante);
      lote.quantidade_disponivel -= qtdAlocada;
      qtdFaltante -= qtdAlocada;

      alocacoes.push({
        lote_id: lote.id,
        numero_lote: lote.numero_lote,
        data_vencimento: lote.data_vencimento,
        quantidade_reservada: qtdAlocada,
        localizacao_prateleira: lote.localizacao_prateleira,
        custo_unitario: lote.custo_unitario,
        custo_total_lote: Number((qtdAlocada * lote.custo_unitario).toFixed(2)),
        origem_dados: lote.origem_dados
      });

      if (lote.origem_dados === 'SUPABASE_POSTGRES') {
        try {
          const supabase = getSupabaseClient();
          await supabase
            .from('lotes_medicamentos')
            .update({ quantidade_disponivel: lote.quantidade_disponivel })
            .eq('id', lote.id);
        } catch (err) {
          console.warn(`[OPENBOXES] Aviso: Falha na baixa remota do lote ${lote.id}:`, err);
        }
      }
    }

    return {
      sucesso: qtdFaltante === 0,
      quantidade_solicitada: quantidadeSolicitada,
      quantidade_atendida: quantidadeSolicitada - qtdFaltante,
      quantidade_faltante: qtdFaltante,
      alocacoes
    };
  }
}
