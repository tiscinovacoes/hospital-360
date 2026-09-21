/**
 * Vigia RH — Conector de Importação de Planilhas/CSV de Folha de Pagamento
 * 
 * Permite importar dados de RH existentes quando a secretaria já possui folha própria.
 * Realiza sanitização, validação de regras de negócio e mapeamento automático para Centros de Custo.
 */

import { Servidor } from './rhModel.js';

export class RHImporter {
  /**
   * Converte texto CSV em linhas e colunas estruturadas
   * Suporta separadores ',' e ';'
   */
  static parseCSV(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];
    
    const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    // Detecta delimitador (, ou ;)
    const firstLine = lines[0];
    const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';

    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]/g, '_'));

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      if (!currentLine) continue;

      const values = currentLine.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] !== undefined ? values[index] : '';
      });
      rows.push({ lineNumber: i + 1, data: row, raw: currentLine });
    }

    return rows;
  }

  /**
   * Valida e gera pré-visualização da importação
   */
  static preview(csvText, centrosCustoValidos = []) {
    const rows = this.parseCSV(csvText);
    const validos = [];
    const erros = [];

    const idsCentrosExistentes = centrosCustoValidos.map(c => c.id.toUpperCase());

    rows.forEach(item => {
      const d = item.data;
      const linha = item.lineNumber;
      const mensagensErro = [];

      // Mapeamento flexível de colunas
      const nome = d.nome || d.servidor || d.funcionario || d.nome_servidor;
      const cpf = d.cpf || d.documento || '';
      const matricula = d.matricula || d.matr || d.codigo || `MAT-${linha}`;
      const cargo = d.cargo || d.funcao || 'Agente de Saúde';
      const vinculo = (d.vinculo || d.tipo_vinculo || 'EFETIVO').toUpperCase();
      const cargaHoraria = parseFloat(d.carga_horaria || d.ch || d.horas_semanais || 40);
      const salarioBase = parseFloat(d.salario_base || d.salario || d.vencimento || 0);
      const encargos = parseFloat(d.encargos || d.encargos_percentual || 22);
      const beneficios = parseFloat(d.beneficios || d.gratificacoes || 0);
      const centroCustoId = (d.centro_custo_id || d.centro_custo || d.cc || 'CC-04').trim().toUpperCase();

      if (!nome) {
        mensagensErro.push('Nome do servidor é obrigatório');
      }

      if (isNaN(salarioBase) || salarioBase < 0) {
        mensagensErro.push('Salário base inválido');
      }

      if (isNaN(cargaHoraria) || cargaHoraria <= 0) {
        mensagensErro.push('Carga horária semanal deve ser maior que zero');
      }

      if (centrosCustoValidos.length > 0 && !idsCentrosExistentes.includes(centroCustoId)) {
        mensagensErro.push(`Centro de custo '${centroCustoId}' não cadastrado no sistema`);
      }

      if (mensagensErro.length > 0) {
        erros.push({
          linha,
          mensagens: mensagensErro,
          dados: item.data
        });
      } else {
        const servidor = new Servidor({
          nome,
          cpf,
          matricula,
          cargo,
          vinculo,
          carga_horaria_semanal: cargaHoraria,
          salario_base: salarioBase,
          encargos_percentual: encargos,
          beneficios_valor: beneficios,
          alocacoes_centros_custo: [
            { centro_custo_id: centroCustoId, percentual: 100 }
          ]
        });
        validos.push(servidor);
      }
    });

    const custoTotalImportado = validos.reduce((acc, s) => acc + s.getCustoTotalMensal(), 0);
    const custoHoraMedio = validos.length > 0
      ? validos.reduce((acc, s) => acc + s.getCustoHora(), 0) / validos.length
      : 0;

    return {
      totalLinhas: rows.length,
      validos,
      erros,
      resumo: {
        qtdValidos: validos.length,
        qtdErros: erros.length,
        custoTotalImportado: Math.round(custoTotalImportado * 100) / 100,
        custoHoraMedio: Math.round(custoHoraMedio * 100) / 100
      }
    };
  }

  /**
   * Gera um modelo CSV de exemplo para download
   */
  static getModeloCSV() {
    return `nome,cpf,matricula,cargo,vinculo,carga_horaria,salario_base,encargos,beneficios,centro_custo_id
Dr. Carlos Eduardo,12345678901,MAT-1001,Médico Clínico,EFETIVO,40,12500.00,22,1200.00,CC-04
Dra. Ana Paula Silva,98765432100,MAT-1002,Pediatra,CONTRATADO,30,9800.00,20,800.00,CC-05
Enf. Mariana Oliveira,45678912300,MAT-1003,Enfermeira Chefe,EFETIVO,40,5400.00,22,600.00,CC-06
João Pedro Santos,78912345600,MAT-1004,Técnico de Enfermagem,EFETIVO,40,3200.00,22,400.00,CC-04
Roberto Souza,32165498700,MAT-1005,Auxiliar de Almoxarifado,TERCEIRIZADO,44,2400.00,18,300.00,CC-02`;
  }
}
