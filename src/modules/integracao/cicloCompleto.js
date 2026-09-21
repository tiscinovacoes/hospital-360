/**
 * Vigia Custos — Motor de Integração Ponta a Ponta (Sprint 8 / OS-01 Real)
 * 
 * Executa a simulação do ciclo completo contra o Supabase Cloud Real (RPC public.emitir_evento_custo)
 * utilizando o Tenant UUID a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11.
 */

import { Servidor } from '../rh/rhModel.js';
import { ItemEstoque, LoteEstoque, GestorEstoque } from '../estoque/estoqueModel.js';
import { NotaFiscalServico, AtivoPatrimonial } from '../patrimonio/patrimonioModel.js';
import { supabaseCustoContract } from '../../contracts/supabaseCustoContract.js';

export const DEMO_TENANT_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export class MotorIntegracaoCicloCompleto {
  constructor(custoContract = supabaseCustoContract) {
    this.custoContract = custoContract;
  }

  async simularMesCompletoPostoEInternacao() {
    const eventosEmitidos = [];

    // 1. FOLHA DE RH (Mês)
    const medico = new Servidor({
      tenant_id: DEMO_TENANT_UUID,
      nome: 'Dr. Fernando Mello',
      salario_base: 12000,
      encargos_percentual: 22,
      beneficios_valor: 1000,
      alocacoes_centros_custo: [{ centro_custo_id: 'CC-04', percentual: 100 }]
    });

    const enfermeiro = new Servidor({
      tenant_id: DEMO_TENANT_UUID,
      nome: 'Enf. Carla Souza',
      salario_base: 5500,
      encargos_percentual: 22,
      beneficios_valor: 500,
      alocacoes_centros_custo: [{ centro_custo_id: 'CC-06', percentual: 100 }]
    });

    const evtsMedico = await medico.emitirEventosCustoRH(this.custoContract);
    const evtsEnf = await enfermeiro.emitirEventosCustoRH(this.custoContract);
    eventosEmitidos.push(...evtsMedico, ...evtsEnf);

    // 2. DISPENSAÇÃO DE ESTOQUE PARA PACIENTE-TESTE (EPI-2026-01)
    const gestorEstoque = new GestorEstoque();
    const med1 = new ItemEstoque({ tenant_id: DEMO_TENANT_UUID, codigo: 'MED-10', descricao: 'Ceftriaxona 1g Injetável' });
    const lote1 = new LoteEstoque({
      tenant_id: DEMO_TENANT_UUID,
      item_id: med1.id,
      item_descricao: med1.descricao,
      numero_lote: 'L-9988A',
      quantidade_inicial: 50,
      quantidade_atual: 50,
      valor_unitario: 18.50
    });
    gestorEstoque.adicionarLote(lote1);

    const movEstoque = await gestorEstoque.darBaixaMedicamento({
      lote_id: lote1.id,
      quantidade: 5, // 5 x 18.50 = R$ 92,50
      centro_custo_id: 'CC-06', // Enfermaria
      episodio_id: 'EPI-2026-01',
      paciente_nome: 'Gabriel Arantes (Paciente Teste OS-01)',
      custoContract: this.custoContract
    });

    // 3. COMPRAS E MANUTENÇÃO (Insumos Indiretos)
    const nfLimpeza = new NotaFiscalServico({
      tenant_id: DEMO_TENANT_UUID,
      numero_nf: 'NF-10022',
      fornecedor: 'Saneamento & Higiene S/A',
      descricao_servico: 'Serviço de Limpeza e Desinfecção',
      valor_total: 6000.00,
      centro_custo_id: 'CC-03'
    });
    const evtNF = await nfLimpeza.emitirEventoCusto(this.custoContract);
    eventosEmitidos.push(evtNF);

    // 4. PATRIMÔNIO (Depreciação)
    const camaHospitalar = new AtivoPatrimonial({
      tenant_id: DEMO_TENANT_UUID,
      codigo_tombamento: 'TOMB-5001',
      descricao: 'Cama Hospitalar Elétrica 3 Movimentos',
      valor_aquisicao: 9000.00,
      vida_util_meses: 60, // R$ 150,00/mês
      centro_custo_id: 'CC-06'
    });
    const evtDepr = await camaHospitalar.emitirEventoDepreciacao(this.custoContract);
    eventosEmitidos.push(evtDepr);

    const custoTotal = eventosEmitidos.reduce((acc, e) => acc + (e.valor || 0), 0);

    return {
      totalEventosEmitidos: eventosEmitidos.length,
      custoTotalProcessado: custoTotal,
      eventosEmitidos,
      pacienteTeste: {
        episodio_id: 'EPI-2026-01',
        nome: 'Gabriel Arantes (Paciente Teste OS-01)',
        custoDiretoEstoque: movEstoque.valor_total
      }
    };
  }
}
