/**
 * Vigia Custos — Conector Supabase Real (OS-01 / PROTOCOLO-AGENTES §3)
 * Projeto: oogpcdaosexarxmvupiw
 */

export const SUPABASE_CONFIG = {
  projectId: process.env.SUPABASE_PROJECT_ID || 'oogpcdaosexarxmvupiw',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oogpcdaosexarxmvupiw.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  defaultTenantId: process.env.DEFAULT_TENANT_ID || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' // Tenant Piloto do Núcleo
};

export class SupabaseCustoContract {
  constructor(config = SUPABASE_CONFIG) {
    this.config = config;
  }

  /**
   * Ponto de entrada de ingestão de jornada por CPF/NIS do paciente (PROTOCOLO-AGENTES §3.1)
   */
  async registrarEventoJornada({
    centro_custo_id,
    tipo,
    valor,
    origem_modulo,
    cpf = null,
    nis = null,
    nome_paciente = null,
    detalhes = {},
    tipo_episodio = 'AMBULATORIAL',
    forcar_novo_episodio = false
  }) {
    const endpoint = `${this.config.supabaseUrl}/rest/v1/rpc/registrar_evento_jornada`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.anonKey,
          'Authorization': `Bearer ${this.config.anonKey}`
        },
        body: JSON.stringify({
          p_centro_custo_id: centro_custo_id,
          p_tipo: tipo,
          p_valor: valor,
          p_origem_modulo: origem_modulo,
          p_cpf: cpf,
          p_nis: nis,
          p_nome_paciente: nome_paciente,
          p_detalhes: detalhes,
          p_tipo_episodio: tipo_episodio,
          p_forcar_novo_episodio: forcar_novo_episodio
        })
      });

      if (!response.ok) {
        throw new Error(`Erro RPC Supabase ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('⚠️ Fallback local durante registro de evento por CPF/NIS:', err.message);
      return {
        status: 'FALLBACK_LOCAL',
        centro_custo_id,
        tipo,
        valor,
        origem_modulo,
        cpf,
        nis,
        nome_paciente,
        detalhes
      };
    }
  }

  /**
   * Invoca a RPC public.emitir_evento_custo quando o episodio_id já é conhecido (PROTOCOLO-AGENTES §3.2)
   */
  async emitirEventoCusto({
    tenant_id = this.config.defaultTenantId,
    centro_custo_id,
    tipo,
    valor,
    origem_modulo,
    episodio_id = null,
    detalhes = {}
  }) {
    const endpoint = `${this.config.supabaseUrl}/rest/v1/rpc/emitir_evento_custo`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.anonKey,
          'Authorization': `Bearer ${this.config.anonKey}`
        },
        body: JSON.stringify({
          p_tenant_id: tenant_id,
          p_centro_custo_id: centro_custo_id,
          p_tipo: tipo,
          p_valor: valor,
          p_origem_modulo: origem_modulo,
          p_episodio_id: episodio_id,
          p_detalhes: detalhes
        })
      });

      if (!response.ok) {
        throw new Error(`Erro RPC Supabase ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('⚠️ Fallback local durante emissão de custo:', err.message);
      return {
        id: `EVT-${Date.now()}`,
        tenant_id,
        centro_custo_id,
        tipo,
        valor,
        origem_modulo,
        episodio_id,
        detalhes,
        timestamp: new Date().toISOString(),
        status: 'FALLBACK_LOCAL'
      };
    }
  }

  /**
   * Leitura de centros de custo do núcleo (public.centros_custo)
   */
  async getCentrosCusto(tenant_id = this.config.defaultTenantId) {
    const endpoint = `${this.config.supabaseUrl}/rest/v1/centros_custo?tenant_id=eq.${tenant_id}&select=*`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          'apikey': this.config.anonKey,
          'Authorization': `Bearer ${this.config.anonKey}`
        }
      });
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch (err) {
      console.warn('⚠️ Erro ao consultar centros de custo:', err.message);
      return null;
    }
  }
}

export const supabaseCustoContract = new SupabaseCustoContract();
