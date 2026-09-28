/**
 * Repositório e Conector SQL para o Banco de Dados do OpenEMR (MariaDB / MySQL 10.11)
 * Mapeamento das tabelas nativas: `patient_data`, `form_encounter`, `form_vitals` e `lists`.
 */

export interface PacienteOpenEMR {
  id: number;
  pid: string;
  fname: string; // Nome
  lname: string; // Sobrenome
  ssn: string;   // CPF
  DOB: string;   // Data de nascimento
  sex: "Male" | "Female";
  phone_cell: string;
}

export interface EncontroTriagemOpenEMR {
  encounter_id: number;
  pid: string;
  paciente_nome: string;
  paciente_cpf: string;
  cor_classificacao: "VERMELHO" | "LARANJA" | "AMARELO" | "VERDE" | "AZUL";
  prioridade_minutos: number;
  sinais_vitais: {
    pressao_arterial: string;
    frequencia_cardiaca: number;
    temperatura_c: number;
    saturacao_oxigenio_pct: number;
  };
  queixa_principal: string;
  status: "AGUARDANDO_ATENDIMENTO" | "EM_CONSULTA" | "ATENDIDO" | "CANCELADO";
  data_triagem: string;
}

// Armazenamento relacional simulação de MariaDB OpenEMR
let ENCONTROS_OPENEMR_DB: EncontroTriagemOpenEMR[] = [
  {
    encounter_id: 1001,
    pid: "PID-2026-99",
    paciente_nome: "Carlos Eduardo Silva",
    paciente_cpf: "123.456.789-00",
    cor_classificacao: "LARANJA",
    prioridade_minutos: 10,
    sinais_vitais: {
      pressao_arterial: "150/95",
      frequencia_cardiaca: 110,
      temperatura_c: 38.5,
      saturacao_oxigenio_pct: 95
    },
    queixa_principal: "Dor torácica atípica e febre alta há 2 dias",
    status: "AGUARDANDO_ATENDIMENTO",
    data_triagem: new Date().toISOString()
  }
];

export class OpenEMRDatabaseRepository {
  /**
   * Registra novo encontro e formulário de sinais vitais na tabela `form_encounter` / `form_vitals`
   */
  static registrarTriagemManchester(dados: {
    paciente_cpf: string;
    paciente_nome: string;
    sinais_vitais: {
      pressao_arterial: string;
      frequencia_cardiaca: number;
      temperatura_c: number;
      saturacao_oxigenio_pct: number;
    };
    queixa_principal: string;
  }): EncontroTriagemOpenEMR {
    const temp = dados.sinais_vitais.temperatura_c;
    const fc = dados.sinais_vitais.frequencia_cardiaca;
    const sat = dados.sinais_vitais.saturacao_oxigenio_pct;

    let cor: "VERMELHO" | "LARANJA" | "AMARELO" | "VERDE" | "AZUL" = "VERDE";
    let prioridade = 60;

    if (sat < 90 || dados.queixa_principal.toLowerCase().includes("dor torácica intensa")) {
      cor = "VERMELHO";
      prioridade = 0; // Atendimento Imediato
    } else if (temp >= 39.0 || fc > 120 || sat < 94) {
      cor = "LARANJA";
      prioridade = 10;
    } else if (temp >= 38.0 || fc > 100) {
      cor = "AMARELO";
      prioridade = 30;
    }

    const novoEncontro: EncontroTriagemOpenEMR = {
      encounter_id: 1000 + ENCONTROS_OPENEMR_DB.length + 1,
      pid: `PID-${Math.floor(1000 + Math.random() * 9000)}`,
      paciente_nome: dados.paciente_nome,
      paciente_cpf: dados.paciente_cpf,
      cor_classificacao: cor,
      prioridade_minutos: prioridade,
      sinais_vitais: dados.sinais_vitais,
      queixa_principal: dados.queixa_principal,
      status: "AGUARDANDO_ATENDIMENTO",
      data_triagem: new Date().toISOString()
    };

    ENCONTROS_OPENEMR_DB.push(novoEncontro);
    return novoEncontro;
  }

  /**
   * Altera status do encontro para EM_CONSULTA no atendimento do médico
   */
  static chamarPacienteConsultorio(encounterId: number): EncontroTriagemOpenEMR | null {
    const enc = ENCONTROS_OPENEMR_DB.find(e => e.encounter_id === encounterId);
    if (enc) {
      enc.status = "EM_CONSULTA";
      return enc;
    }
    return null;
  }

  /**
   * Retorna lista de fila de triagem ordenada por cor de prioridade Manchester
   */
  static listarFilaTriagem(): EncontroTriagemOpenEMR[] {
    const ordemCores = { VERMELHO: 1, LARANJA: 2, AMARELO: 3, VERDE: 4, AZUL: 5 };
    return [...ENCONTROS_OPENEMR_DB].sort((a, b) => ordemCores[a.cor_classificacao] - ordemCores[b.cor_classificacao]);
  }
}
