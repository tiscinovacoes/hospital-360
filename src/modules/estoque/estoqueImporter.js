/**
 * Vigia Estoque — Conector de Importação de Saldo de Farmácia / Almoxarifado (CSV)
 */

import { ItemEstoque, LoteEstoque } from './estoqueModel.js';

export class EstoqueImporter {
  static parseCSV(csvText) {
    if (!csvText || typeof csvText !== 'string') return [];
    const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';

    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]/g, '_'));

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] !== undefined ? values[index] : '';
      });
      rows.push({ lineNumber: i + 1, data: row });
    }
    return rows;
  }

  static preview(csvText) {
    const rows = this.parseCSV(csvText);
    const lotesValidos = [];
    const erros = [];

    rows.forEach(item => {
      const d = item.data;
      const linha = item.lineNumber;
      const mensagens = [];

      const codigo = d.codigo || d.cod || `MED-${linha}`;
      const descricao = d.descricao || d.medicamento || d.item;
      const loteNum = d.lote || d.numero_lote || `L-${linha}`;
      const validade = d.validade || d.data_validade || '2027-12-31';
      const quantidade = parseFloat(d.quantidade || d.qtd || d.saldo || 0);
      const valorUnitario = parseFloat(d.valor_unitario || d.preco_unitario || d.valor || 0);

      if (!descricao) mensagens.push('Descrição do medicamento/insumo é obrigatória');
      if (isNaN(quantidade) || quantidade <= 0) mensagens.push('Quantidade deve ser maior que zero');
      if (isNaN(valorUnitario) || valorUnitario <= 0) mensagens.push('Valor unitário deve ser maior que zero');

      if (mensagens.length > 0) {
        erros.push({ linha, mensagens, dados: d });
      } else {
        const itemEstoque = new ItemEstoque({
          codigo,
          descricao,
          categoria: 'MEDICAMENTO'
        });

        const lote = new LoteEstoque({
          item_id: itemEstoque.id,
          item_descricao: descricao,
          numero_lote: loteNum,
          data_validade: validade,
          quantidade_inicial: quantidade,
          quantidade_atual: quantidade,
          valor_unitario: valorUnitario
        });

        lotesValidos.push({ item: itemEstoque, lote });
      }
    });

    const valorTotalEstoque = lotesValidos.reduce((acc, l) => acc + l.lote.getValorTotalEstoque(), 0);

    return {
      totalLinhas: rows.length,
      lotesValidos,
      erros,
      resumo: {
        qtdValidos: lotesValidos.length,
        qtdErros: erros.length,
        valorTotalEstoque: Math.round(valorTotalEstoque * 100) / 100
      }
    };
  }

  static getModeloCSV() {
    return `codigo,descricao,lote,validade,quantidade,valor_unitario
MED-001,Dipirona Sódica 500mg/ml Ampola 2ml,LOTE-2026A,2027-06-30,500,1.20
MED-002,Amoxicilina 500mg Comprimido,LOTE-8812B,2027-10-15,1200,0.45
MED-003,Paracetamol 500mg Comprimido,LOTE-9943C,2026-12-31,2000,0.25
INS-001,Seringa Descartável 5ml c/ Agulha,LOTE-7721D,2028-04-20,1500,0.80`;
  }
}
