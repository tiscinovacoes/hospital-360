import { RequisicaoLimpeza } from './facilitiesModel.js';
import { custoContract, MOCK_CENTROS_CUSTO } from '../../contracts/custoContractStub.js';

export class FacilitiesAppController {
  constructor() {
    this.requisicoes = [];
    this.initDefaultData();
    this.initEventListeners();
    this.render();
  }

  initDefaultData() {
    const r1 = new RequisicaoLimpeza({
      local: 'Centro Cirúrgico - Sala 3',
      centro_custo_id: 'CC-04',
      tipo: 'TERMINAL',
      prioridade: 'ALTA'
    });
    
    const r2 = new RequisicaoLimpeza({
      local: 'Recepção Principal',
      centro_custo_id: 'CC-01',
      tipo: 'PREVENTIVA',
      prioridade: 'NORMAL'
    });

    const r3 = new RequisicaoLimpeza({
      local: 'Consultório 204',
      centro_custo_id: 'CC-04',
      tipo: 'CONCORRENTE',
      prioridade: 'URGENTE'
    });

    this.requisicoes = [r1, r2, r3];
  }

  initEventListeners() {
    const btnNova = document.getElementById('btn-nova-req');
    if (btnNova) {
      btnNova.addEventListener('click', () => this.openModal('modal-req'));
    }

    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
      });
    });

    const formReq = document.getElementById('form-req');
    if (formReq) {
      formReq.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleNovaReqSubmit(formReq);
      });
    }

    // Delegate events for complete buttons
    const reqList = document.getElementById('req-list');
    if (reqList) {
      reqList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-concluir') || e.target.closest('.btn-concluir')) {
          const btn = e.target.classList.contains('btn-concluir') ? e.target : e.target.closest('.btn-concluir');
          const reqId = btn.getAttribute('data-id');
          this.concluirRequisicao(reqId);
        }
      });
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  handleNovaReqSubmit(form) {
    const formData = new FormData(form);
    const req = new RequisicaoLimpeza({
      local: formData.get('local'),
      centro_custo_id: formData.get('centro_custo_id'),
      tipo: formData.get('tipo'),
      prioridade: formData.get('prioridade')
    });

    this.requisicoes.unshift(req); // Adiciona no início
    this.closeModal('modal-req');
    form.reset();
    this.render();
  }

  concluirRequisicao(reqId) {
    const req = this.requisicoes.find(r => r.id === reqId);
    if (req && req.status !== 'CONCLUIDA') {
      const evento = req.concluir(custoContract);
      if (evento) {
        alert(`✅ Limpeza concluída!\nCusto de R$ ${evento.valor.toFixed(2)} alocado no Vigia Custos.`);
      }
      this.render();
    }
  }

  render() {
    this.renderMetrics();
    this.renderList();
    this.renderEventosLog();
  }

  renderMetrics() {
    const pendentes = this.requisicoes.filter(r => r.status === 'PENDENTE');
    const concluidas = this.requisicoes.filter(r => r.status === 'CONCLUIDA');
    const urgentes = pendentes.filter(r => r.prioridade === 'URGENTE' || r.prioridade === 'ALTA');
    
    const eventosLimpeza = custoContract.getEventos().filter(e => e.tipo === 'LIMPEZA');
    const custoTotalLimpeza = eventosLimpeza.reduce((acc, ev) => acc + ev.valor, 0);

    document.getElementById('metric-fila').textContent = pendentes.length;
    document.getElementById('metric-urgentes').textContent = urgentes.length;
    document.getElementById('metric-concluidas').textContent = concluidas.length;
    document.getElementById('metric-custo-limpeza').textContent = `R$ ${custoTotalLimpeza.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  renderList() {
    const reqList = document.getElementById('req-list');
    if (!reqList) return;

    const pendentes = this.requisicoes.filter(r => r.status === 'PENDENTE');

    if (pendentes.length === 0) {
      reqList.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Não há solicitações de limpeza pendentes.</p>`;
      return;
    }

    // Ordenar: URGENTE > ALTA > NORMAL
    const priorityWeight = { 'URGENTE': 3, 'ALTA': 2, 'NORMAL': 1 };
    pendentes.sort((a, b) => priorityWeight[b.prioridade] - priorityWeight[a.prioridade]);

    reqList.innerHTML = pendentes.map(req => {
      const cc = MOCK_CENTROS_CUSTO.find(c => c.id === req.centro_custo_id);
      const ccNome = cc ? cc.nome : req.centro_custo_id;

      return `
        <div class="req-card">
          <div style="display: flex; align-items: center; gap: 15px;">
            <div class="priority-indicator priority-${req.prioridade.toLowerCase()}"></div>
            <div>
              <div class="req-info">
                <h3>${req.local} <span style="margin-left: 10px;" class="tag-tipo ${req.tipo.toLowerCase()}">${req.tipo}</span></h3>
                <p>${ccNome} • Custo Estimado: R$ ${req.valorCustoEstimado.toFixed(2)}</p>
                <small style="color: var(--text-muted);">Solicitado às ${new Date(req.data_hora).toLocaleTimeString('pt-BR')}</small>
              </div>
            </div>
          </div>
          <div class="req-actions">
            <button class="btn btn-emerald btn-concluir" data-id="${req.id}">✔️ Concluir (Alocar Custo)</button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderEventosLog() {
    const tbody = document.getElementById('tbody-eventos');
    if (!tbody) return;

    const eventos = custoContract.getEventos().filter(e => e.tipo === 'LIMPEZA');
    
    if (eventos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Nenhum evento de limpeza transmitido.</td></tr>`;
      return;
    }

    // Ordenar do mais recente
    eventos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    tbody.innerHTML = eventos.slice(0, 10).map(e => `
      <tr>
        <td><code style="color: var(--accent-teal);">${e.id}</code></td>
        <td>${e.centro_custo_nome}</td>
        <td><span style="color: #c4b5fd;">${e.detalhes.local} (${e.detalhes.tipo_limpeza})</span></td>
        <td><strong>R$ ${e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
        <td><small style="color: var(--text-muted);">${new Date(e.timestamp).toLocaleTimeString('pt-BR')}</small></td>
      </tr>
    `).join('');
  }
}
