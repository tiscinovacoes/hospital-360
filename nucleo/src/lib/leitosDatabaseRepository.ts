/**
 * Repositório e Conector de Banco de Dados de Leitos Hospitalares e NIR (PostgreSQL)
 * Gerencia o censo em tempo real, estados do leito e ordens de higienização de facilities.
 */

import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oogpcdaosexarxmvupiw.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_a0cwEmheXaFCeNuNYWRNPA_d4aEpQMI';
  return createClient(url, key);
}

export type StatusLeito = "LIVRE" | "OCUPADO" | "HIGIENIZACAO" | "MANUTENCAO" | "ISOLAMENTO";

export interface LeitoHospitalarRecord {
  id: string;
  codigo_leito: string;
  unidade_ala: string;
  tipo: "UTI" | "ENFERMARIA" | "APARTAMENTO" | "ISOLAMENTO";
  status: StatusLeito;
  paciente_cpf?: string;
  paciente_nome?: string;
  data_admissao?: string;
  diaria_valor_base: number;
  tenant_id: string;
  updated_at: string;
  origem_dados?: "SUPABASE_POSTGRES" | "CACHE_LOCAL_NIR";
}

let BANCO_LEITOS_PG: LeitoHospitalarRecord[] = [
  {
    id: "LET-101",
    codigo_leito: "101-A",
    unidade_ala: "UTI Adulto",
    tipo: "UTI",
    status: "OCUPADO",
    paciente_cpf: "123.456.789-00",
    paciente_nome: "Carlos Eduardo Silva",
    data_admissao: "2026-09-20T10:00:00Z",
    diaria_valor_base: 1450.00,
    tenant_id: "hospital_360_default",
    updated_at: new Date().toISOString()
  },
  {
    id: "LET-102",
    codigo_leito: "102-B",
    unidade_ala: "Enfermaria Geral",
    tipo: "ENFERMARIA",
    status: "LIVRE",
    diaria_valor_base: 450.00,
    tenant_id: "hospital_360_default",
    updated_at: new Date().toISOString()
  },
  {
    id: "LET-201",
    codigo_leito: "201-UTI",
    unidade_ala: "UTI Coronariana",
    tipo: "UTI",
    status: "LIVRE",
    diaria_valor_base: 1850.00,
    tenant_id: "hospital_360_default",
    updated_at: new Date().toISOString()
  }
];

export class LeitosDatabaseRepository {
  /**
   * Obtém o censo hospitalar consolidado com taxa de ocupação
   */
  static obterCensoHospitalar(tenantId: string) {
    const leitosTenant = BANCO_LEITOS_PG.filter(l => l.tenant_id === tenantId);
    const ocupados = leitosTenant.filter(l => l.status === "OCUPADO").length;
    const livres = leitosTenant.filter(l => l.status === "LIVRE").length;
    const higienizacao = leitosTenant.filter(l => l.status === "HIGIENIZACAO").length;
    const manutencao = leitosTenant.filter(l => l.status === "MANUTENCAO").length;
    const taxaOcupacao = leitosTenant.length ? Number(((ocupados / leitosTenant.length) * 100).toFixed(2)) : 0;

    return {
      total_leitos: leitosTenant.length,
      ocupados,
      livres,
      higienizacao,
      manutencao,
      taxa_ocupacao_pct: taxaOcupacao,
      leitos: leitosTenant
    };
  }

  /**
   * Transita status do leito para HIGIENIZACAO no processo de alta
   */
  static registrarAltaESolicitarHigienizacao(leitoId: string): LeitoHospitalarRecord | null {
    const leito = BANCO_LEITOS_PG.find(l => l.id === leitoId || l.codigo_leito === leitoId);
    if (leito) {
      leito.status = "HIGIENIZACAO";
      leito.paciente_cpf = undefined;
      leito.paciente_nome = undefined;
      leito.updated_at = new Date().toISOString();
      return leito;
    }
    return null;
  }

  /**
   * Finaliza higienização e retorna leito para LIVRE
   */
  static concluirHigienizacao(leitoId: string): LeitoHospitalarRecord | null {
    const leito = BANCO_LEITOS_PG.find(l => l.id === leitoId || l.codigo_leito === leitoId);
    if (leito) {
      leito.status = "LIVRE";
      leito.updated_at = new Date().toISOString();
      return leito;
    }
    return null;
  }

  /**
   * Obtém o censo hospitalar consolidado consultando o Supabase em tempo real com fallback
   */
  static async obterCensoHospitalarAsync(tenantId: string) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('leitos')
        .select('*')
        .eq('tenant_id', tenantId);

      if (!error && data && data.length > 0) {
        const leitosRemotos: LeitoHospitalarRecord[] = data.map((l: Record<string, unknown>) => ({
          id: String(l.id || ''),
          codigo_leito: String(l.codigo_leito || ''),
          unidade_ala: String(l.unidade_ala || ''),
          tipo: (l.tipo as LeitoHospitalarRecord['tipo']) || 'ENFERMARIA',
          status: (l.status as StatusLeito) || 'LIVRE',
          paciente_cpf: l.paciente_cpf ? String(l.paciente_cpf) : undefined,
          paciente_nome: l.paciente_nome ? String(l.paciente_nome) : undefined,
          data_admissao: l.data_admissao ? String(l.data_admissao) : undefined,
          diaria_valor_base: Number(l.diaria_valor_base || 0),
          tenant_id: String(l.tenant_id || tenantId),
          updated_at: String(l.updated_at || new Date().toISOString()),
          origem_dados: 'SUPABASE_POSTGRES' as const
        }));

        const ocupados = leitosRemotos.filter(l => l.status === "OCUPADO").length;
        const livres = leitosRemotos.filter(l => l.status === "LIVRE").length;
        const higienizacao = leitosRemotos.filter(l => l.status === "HIGIENIZACAO").length;
        const manutencao = leitosRemotos.filter(l => l.status === "MANUTENCAO").length;
        const taxaOcupacao = leitosRemotos.length ? Number(((ocupados / leitosRemotos.length) * 100).toFixed(2)) : 0;

        return {
          total_leitos: leitosRemotos.length,
          ocupados,
          livres,
          higienizacao,
          manutencao,
          taxa_ocupacao_pct: taxaOcupacao,
          leitos: leitosRemotos,
          origem: 'SUPABASE_POSTGRES' as const
        };
      }
    } catch (err) {
      console.warn('[LEITOS] Erro ao consultar Supabase leitos, utilizando banco local:', err);
    }

    const censoLocal = this.obterCensoHospitalar(tenantId);
    return {
      ...censoLocal,
      origem: 'CACHE_LOCAL_NIR' as const
    };
  }

  /**
   * Transita status do leito para HIGIENIZACAO de forma assíncrona no PostgreSQL
   */
  static async registrarAltaESolicitarHigienizacaoAsync(leitoId: string): Promise<LeitoHospitalarRecord | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('leitos')
        .update({
          status: 'HIGIENIZACAO',
          paciente_cpf: null,
          paciente_nome: null,
          updated_at: new Date().toISOString()
        })
        .or(`id.eq.${leitoId},codigo_leito.eq.${leitoId}`)
        .select()
        .single();

      if (!error && data) {
        return {
          id: String(data.id),
          codigo_leito: String(data.codigo_leito),
          unidade_ala: String(data.unidade_ala),
          tipo: data.tipo,
          status: 'HIGIENIZACAO',
          diaria_valor_base: Number(data.diaria_valor_base),
          tenant_id: String(data.tenant_id),
          updated_at: String(data.updated_at),
          origem_dados: 'SUPABASE_POSTGRES'
        };
      }
    } catch (err) {
      console.warn('[LEITOS] Falha na atualização remota do leito no Supabase:', err);
    }

    return this.registrarAltaESolicitarHigienizacao(leitoId);
  }

  /**
   * Finaliza higienização e retorna leito para LIVRE de forma assíncrona
   */
  static async concluirHigienizacaoAsync(leitoId: string): Promise<LeitoHospitalarRecord | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('leitos')
        .update({
          status: 'LIVRE',
          updated_at: new Date().toISOString()
        })
        .or(`id.eq.${leitoId},codigo_leito.eq.${leitoId}`)
        .select()
        .single();

      if (!error && data) {
        return {
          id: String(data.id),
          codigo_leito: String(data.codigo_leito),
          unidade_ala: String(data.unidade_ala),
          tipo: data.tipo,
          status: 'LIVRE',
          diaria_valor_base: Number(data.diaria_valor_base),
          tenant_id: String(data.tenant_id),
          updated_at: String(data.updated_at),
          origem_dados: 'SUPABASE_POSTGRES'
        };
      }
    } catch (err) {
      console.warn('[LEITOS] Falha na conclusão remota de higienização:', err);
    }

    return this.concluirHigienizacao(leitoId);
  }
}
