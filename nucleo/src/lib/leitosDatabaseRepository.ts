/**
 * Repositório e Conector de Banco de Dados de Leitos Hospitalares e NIR (PostgreSQL)
 * Gerencia o censo em tempo real, estados do leito e ordens de higienização de facilities.
 */

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
}
