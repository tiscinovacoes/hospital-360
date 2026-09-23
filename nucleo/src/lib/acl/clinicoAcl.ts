/**
 * Anti-Corruption Layer (ACL) — Bounded Context: Assistencial / OpenEMR -> Core Hub 360
 * 
 * Responsável por:
 * 1. Traduzir eventos clínicos do OpenEMR para o formato canônico de despesas (Estação 1).
 * 2. Aplicar a blindagem regulatória RN-IND (Art. 5º da Resolução Normativa):
 *    - Remove hipóteses diagnósticas íntimas, anotações de anamnese e termos médicos sensíveis.
 *    - Preserva estritamente dados para apuração de custos, rastreabilidade TUSS/SIGTAP e faturamento.
 */

import { IngestaoDespesasPayload, DespesaItem } from '@/lib/hubDespesasStore';

export interface OpenEmrAtendimentoRaw {
  eventoId?: string;
  atendimentoId: string;
  timestamp: string;
  paciente: {
    id?: string;
    nome: string;
    cpf: string;
  };
  profissional: {
    id?: string;
    nome: string;
    registroProfissional: string;
  };
  clinica: {
    id?: string;
    nome: string;
    sala: string;
    especialidade: string;
  };
  procedimento: {
    codigoSigtap?: string;
    descricao?: string;
    valorTuss?: number;
    valorRepasseSus?: number;
  };
  prescricoes?: Array<{
    codigoMedicamento?: string;
    nomeMedicamento?: string;
    quantidade?: number;
  }>;
}

export function translateOpenEmrToEstacao1(evento: OpenEmrAtendimentoRaw): IngestaoDespesasPayload {
  const timestamp = evento.timestamp || new Date().toISOString();
  const cpfLimpo = (evento.paciente.cpf || '').replace(/\D/g, '');
  const prontuarioEpisodio = `EPISODIO-${cpfLimpo.slice(0, 6)}-${evento.atendimentoId.slice(-6)}`;
  const centroCusto = `SALA_${evento.clinica.sala || '204'}_AMBULATORIO`;

  const despesaConsulta: DespesaItem = {
    id_transacao: `TRX-${evento.atendimentoId}-CONSULTA`,
    paciente_cpf: evento.paciente.cpf,
    paciente_nome: evento.paciente.nome,
    prontuario_episodio: prontuarioEpisodio,
    centro_custo: centroCusto,
    item_codigo: evento.procedimento.codigoSigtap || '0301010072',
    item_descricao: evento.procedimento.descricao || 'Consulta Médica em Atenção Especializada',
    quantidade: 1,
    unidade_medida: 'ATENDIMENTO',
    valor_unitario_medio: evento.procedimento.valorTuss || 180.0,
    valor_total_imputado: evento.procedimento.valorTuss || 180.0,
    data_consumo: timestamp,
    origem_modulo: 'GESTAO_CLINICA',
    estacao_jornada: 1, // Estação 1: Acolhimento & Triagem / Ambulatório
    metadados: {
      medico_nome: evento.profissional.nome,
      medico_crm: evento.profissional.registroProfissional,
      especialidade: evento.clinica.especialidade,
      blindagem_rn_ind: true,
      valor_repasse_sus: evento.procedimento.valorRepasseSus || 10.0,
    }
  };

  return {
    origem_modulo: 'GESTAO_CLINICA',
    cliente_id: evento.clinica.id || 'clinica_sala204',
    lote_exportacao_id: `LOTE-OPENEMR-${Date.now()}`,
    data_geracao: timestamp,
    despesas: [despesaConsulta]
  };
}
