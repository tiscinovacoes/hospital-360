import { Servidor } from './rhModel.js';
import { RHImporter } from './rhImporter.js';
import { custoContract, MOCK_CENTROS_CUSTO } from '../../contracts/custoContractStub.js';

export class RHAppController {
  constructor() {
    this.servidores = [];
    this.initDefaultData();
    this.initEventListeners();
    this.render();
  }

  initDefaultData() {
    // Carrega dados sintéticos iniciais
    const s1 = new Servidor({
      nome: 'Dr. Lucas Silveira',
      cpf: '123.456.789-01',
      matricula: 'MAT-101',
      cargo: 'Médico Clínico Geral',
      vinculo: 'EFETIVO',
      carga_horaria_semanal: 40,
      salario_base: 13500.00,
      encargos_percentual: 22,
      beneficios_valor: 1200.00,
      alocacoes_centros_custo: [{ centro_custo_id: 'CC-04', percentual: 100 }]
    });

    const s2 = new Servidor({
      nome: 'Dra. Beatriz Santos',
      cpf: '987.654.321-02',
      matricula: 'MAT-102',
      cargo: 'Pediatra',
      vinculo: 'CONTRATADO',
      carga_horaria_semanal: 30,
      salario_base: 9800.00,
      encargos_percentual: 20,
      beneficios_valor: 800.00,
      alocacoes_centros_custo: [{ centro_custo_id: 'CC-05', percentual: 100 }]
    });

    const s3 = new Servidor({
      nome: 'Enf. Ricardo Mendes',
      cpf: '456.789.123-03',
      matricula: 'MAT-103',
      cargo: 'Enfermeiro Chefe',
      vinculo: 'EFETIVO',
      carga_horaria_semanal: 40,
      salario_base: 5600.00,
      encargos_percentual: 22,
      beneficios_valor: 500.00,
      alocacoes_centros_custo: [
        { centro_custo_id: 'CC-04', percentual: 50 },
        { centro_custo_id: 'CC-06', percentual: 50 }
      ]
    });

    const s4 = new Servidor({
      nome: 'Camila Ferreira',
      cpf: '789.123.456-04',
      matricula: 'MAT-104',
      cargo: 'Auxiliar de Almoxarifado',
      vinculo: 'TERCEIRIZADO',
      carga_horaria_semanal: 44,
      salario_base: 2400.00,
      encargos_percentual: 18,
      beneficios_valor: 300.00,
      alocacoes_centros_custo: [{ centro_custo_id: 'CC-02', percentual: 100 }]
    });

    this.servidores = [s1, s2, s3, s4];
  }

  initEventListeners() {
    // Abrir Modal de Novo Servidor
    const btnNovo = document.getElementById('btn-novo-servidor');
    if (btnNovo) {
      btnNovo.addEventListener('click', () => this.openModal('modal-servidor'));
    }

    // Abrir Modal de Importação CSV
    const btnImportar = document.getElementById('btn-importar-csv');
    if (btnImportar) {
      btnImportar.addEventListener('click', () => this.openModal('modal-importar'));
    }

    // Fechar Modais
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
      });
    });

    // Form de Novo Servidor
    const formServidor = document.getElementById('form-servidor');
    if (formServidor) {
      formServidor.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleNovoServidorSubmit(formServidor);
      });
    }

    // File Input CSV
    const fileInput = document.getElementById('csv-file-input');
    const uploadArea = document.getElementById('upload-area');

    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', () => fileInput.click());
      
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      });

      uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
          this.processCSVFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.processCSVFile(e.target.files[0]);
        }
      });
    }

    // Download Modelo CSV
    const btnDownloadModelo = document.getElementById('btn-download-modelo');
    if (btnDownloadModelo) {
      btnDownloadModelo.addEventListener('click', () => {
        const content = RHImporter.getModeloCSV();
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modelo_importacao_rh_vigia.csv';
        a.click();
      });
    }

    // Disparar Eventos de Custo de RH no Stub
    const btnEmitirEventos = document.getElementById('btn-emitir-eventos-rh');
    if (btnEmitirEventos) {
      btnEmitirEventos.addEventListener('click', () => this.emitirTodosEventosCustoRH());
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

  handleNovoServidorSubmit(form) {
    const formData = new FormData(form);
    const servidor = new Servidor({
      nome: formData.get('nome'),
      cpf: formData.get('cpf'),
      matricula: formData.get('matricula'),
      cargo: formData.get('cargo'),
      vinculo: formData.get('vinculo'),
      carga_horaria_semanal: parseFloat(formData.get('carga_horaria_semanal')),
      salario_base: parseFloat(formData.get('salario_base')),
      encargos_percentual: parseFloat(formData.get('encargos_percentual')),
      beneficios_valor: parseFloat(formData.get('beneficios_valor')),
      alocacoes_centros_custo: [
        { centro_custo_id: formData.get('centro_custo_id'), percentual: 100 }
      ]
    });

    this.servidores.push(servidor);
    this.closeModal('modal-servidor');
    form.reset();
    this.render();
  }

  processCSVFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      const preview = RHImporter.preview(csvText, MOCK_CENTROS_CUSTO);

      if (preview.validos.length > 0) {
        this.servidores.push(...preview.validos);
        alert(`✅ Importação concluída! ${preview.resumo.qtdValidos} servidores cadastrados com sucesso. Total: R$ ${preview.resumo.custoTotalImportado.toLocaleString('pt-BR')}/mês`);
        this.closeModal('modal-importar');
        this.render();
      } else {
        alert(`⚠️ Inconsistências encontradas no arquivo. 0 servidores importados. Verifique se as colunas correspondem ao modelo.`);
      }
    };
    reader.readAsText(file);
  }

  emitirTodosEventosCustoRH() {
    let totalEventos = 0;
    let valorTotal = 0;

    this.servidores.forEach(srv => {
      const evts = srv.emitirEventosCustoRH(custoContract);
      totalEventos += evts.length;
      valorTotal += evts.reduce((acc, e) => acc + e.valor, 0);
    });

    this.renderEventosLog();
    alert(`⚡ ${totalEventos} eventos de custo de RH foram transmitidos para o Núcleo (Stub)! Valor total de folha emitido: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  }

  render() {
    this.renderMetrics();
    this.renderTable();
    this.renderEventosLog();
  }

  renderMetrics() {
    const qtdServidores = this.servidores.length;
    const custoTotalFolha = this.servidores.reduce((acc, s) => acc + s.getCustoTotalMensal(), 0);
    const custoHoraMedio = qtdServidores > 0
      ? this.servidores.reduce((acc, s) => acc + s.getCustoHora(), 0) / qtdServidores
      : 0;

    document.getElementById('metric-total-servidores').textContent = qtdServidores;
    document.getElementById('metric-custo-folha').textContent = `R$ ${custoTotalFolha.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('metric-custo-hora-medio').textContent = `R$ ${custoHoraMedio.toFixed(2)}/h`;
  }

  renderTable() {
    const tbody = document.getElementById('tbody-servidores');
    if (!tbody) return;

    if (this.servidores.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhum servidor cadastrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.servidores.map(s => {
      const aloc = s.alocacoes_centros_custo.map(a => {
        const cc = MOCK_CENTROS_CUSTO.find(c => c.id === a.centro_custo_id);
        return `${cc ? cc.nome : a.centro_custo_id} (${a.percentual}%)`;
      }).join(', ');

      return `
        <tr>
          <td>
            <strong>${s.nome}</strong><br>
            <small style="color: var(--text-muted);">${s.cpf} • ${s.matricula}</small>
          </td>
          <td>${s.cargo}</td>
          <td><span class="tag-vinculo ${s.vinculo.toLowerCase()}">${s.vinculo}</span></td>
          <td>${s.carga_horaria_semanal}h/sem (${s.getHorasMensais()}h/mês)</td>
          <td>
            <strong>R$ ${s.getCustoTotalMensal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong><br>
            <small style="color: var(--text-muted);">Base: R$ ${s.salario_base.toLocaleString('pt-BR')}</small>
          </td>
          <td><strong style="color: var(--accent-emerald);">R$ ${s.getCustoHora().toFixed(2)}</strong></td>
          <td><small style="color: #93c5fd;">${aloc}</small></td>
        </tr>
      `;
    }).join('');
  }

  renderEventosLog() {
    const tbody = document.getElementById('tbody-eventos');
    if (!tbody) return;

    const eventos = custoContract.getEventos();
    if (eventos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Nenhum evento emitido ainda. Clique em "⚡ Transmitir Eventos de Custo" para testar o contrato.</td></tr>`;
      return;
    }

    tbody.innerHTML = eventos.slice(0, 10).map(e => `
      <tr>
        <td><code style="color: var(--accent-teal);">${e.id}</code></td>
        <td>${e.centro_custo_nome}</td>
        <td><span style="color: #c4b5fd;">${e.detalhes.servidor_nome || 'N/A'}</span></td>
        <td><strong>R$ ${e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
        <td><small style="color: var(--text-muted);">${new Date(e.timestamp).toLocaleTimeString('pt-BR')}</small></td>
      </tr>
    `).join('');
  }
}
