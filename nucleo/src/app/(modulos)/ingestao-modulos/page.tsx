'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
import {
  Layers,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Users,
  ShieldCheck,
  Cpu,
  Package,
  Boxes,
  Truck,
  FileText,
  CreditCard,
  MessageSquare,
  Wrench,
  DollarSign,
  PieChart,
  ArrowRight,
  RefreshCw,
  Sliders,
  Sparkles,
  Search,
  Activity,
} from 'lucide-react';

interface ModuleConfig {
  id: string;
  name: string;
  repo: string;
  category: 'FINANCEIRO' | 'LOGISTICA' | 'PESSOAL' | 'ATENDIMENTO' | 'AUDITORIA';
  description: string;
  enabled: boolean;
  ingestionMode: 'NATIVO' | 'PLANILHA' | 'WEBHOOK' | 'OCR_PAPERLESS';
  lastIngestion?: string;
  recordsCount?: number;
}

const INITIAL_MODULES: ModuleConfig[] = [
  {
    id: 'gerenciamento_clinica',
    name: 'Gestão de Clínicas Médicas',
    repo: 'G:\\Projetos\\gerenciamento clinica (OpenEMR)',
    category: 'ATENDIMENTO',
    description: 'Agenda, fila de pacientes, prontuário ambulatorial e prescrição das clínicas do condomínio.',
    enabled: true,
    ingestionMode: 'NATIVO',
    lastIngestion: 'Tempo Real (OpenEMR Sync)',
    recordsCount: 1850,
  },
  {
    id: 'laboratorio_senaite',
    name: 'Gestão de Laboratório (LIMS)',
    repo: 'G:\\Projetos\\getenciamento de laboratorio (SENAITE)',
    category: 'ATENDIMENTO',
    description: 'Gestão de amostras, código de barras, bancada de análises e laudos com assinatura digital.',
    enabled: true,
    ingestionMode: 'NATIVO',
    lastIngestion: 'Tempo Real (FHIR R4 DiagnosticReport)',
    recordsCount: 620,
  },
  {
    id: 'leitos_bahmni',
    name: 'Gestão de Leitos & Censo',
    repo: 'G:\\Projetos\\gerenciamento de leitos (Bahmni)',
    category: 'LOGISTICA',
    description: 'Admissão, censo hospitalar, mapa de calor de ocupação e transferências de enfermaria/UTI.',
    enabled: true,
    ingestionMode: 'NATIVO',
    lastIngestion: 'Tempo Real (Censo Ativo)',
    recordsCount: 140,
  },
  {
    id: 'tarefas_openproject',
    name: 'Tarefas & Cronogramas Corporativos',
    repo: 'G:\\Projetos\\gerenciamento de tarefas (OpenProject)',
    category: 'LOGISTICA',
    description: 'Projetos hospitalares, manutenção preventiva programada e cronogramas técnicos.',
    enabled: true,
    ingestionMode: 'NATIVO',
    lastIngestion: 'App Mobile Tarefas Conectado',
    recordsCount: 410,
  },
  {
    id: 'estoque_fefo',
    name: 'Farmácia Hospitalar & FEFO',
    repo: 'G:\\Projetos\\Estoque (OpenBoxes)',
    category: 'LOGISTICA',
    description: 'Validade de medicamentos, controle de lotes e cadeia de frio crítica.',
    enabled: true,
    ingestionMode: 'NATIVO',
    lastIngestion: 'Tempo Real (Sync RPC)',
    recordsCount: 1420,
  },
  {
    id: 'rh_ponto',
    name: 'RH & Ponto Biométrico',
    repo: 'G:\\Projetos\\RH (OpenHRApp)',
    category: 'PESSOAL',
    description: 'Escalas de médicos e enfermagem, ponto por biometria/GPS e custo/hora.',
    enabled: false,
    ingestionMode: 'PLANILHA',
    lastIngestion: 'Importação mensal via folha (CSV)',
    recordsCount: 85,
  },
  {
    id: 'sabia_facilities',
    name: 'Service Desk & Facilities',
    repo: 'G:\\Projetos\\Sabia',
    category: 'ATENDIMENTO',
    description: 'Higienização de leitos, manutenção predial e calibração de tomógrafos/monitores.',
    enabled: true,
    ingestionMode: 'NATIVO',
    lastIngestion: 'Tempo Real (SLA Ativo)',
    recordsCount: 312,
  },
  {
    id: 'contabil_faturamento',
    name: 'Contabilidade & Faturamento',
    repo: 'G:\\Projetos\\contabil (HealVista & C#)',
    category: 'FINANCEIRO',
    description: 'Faturamento de internação, conciliação de caixa e repasses médicos.',
    enabled: true,
    ingestionMode: 'NATIVO',
    lastIngestion: 'Tempo Real (Centros de Custo)',
    recordsCount: 940,
  },
  {
    id: 'hyperswitch_pagamentos',
    name: 'Fluxo de Pagamento & Split',
    repo: 'G:\\Projetos\\Fluxo de pagamento (Hyperswitch)',
    category: 'FINANCEIRO',
    description: 'Orquestrador multi-gateway (Pix/Cartão) com split condomínio vs médico.',
    enabled: false,
    ingestionMode: 'WEBHOOK',
    lastIngestion: 'Conciliação bancária externa',
    recordsCount: 450,
  },
  {
    id: 'almoxarifado_wms',
    name: 'WMS Intralogístico',
    repo: 'G:\\Projetos\\almoxarifado (OpenWMS)',
    category: 'LOGISTICA',
    description: 'Mapeamento de armazém por bins, ruas e picking de abastecimento.',
    enabled: false,
    ingestionMode: 'PLANILHA',
    lastIngestion: 'Inventário rotativo quinzenal',
    recordsCount: 2200,
  },
  {
    id: 'compras_suprimentos',
    name: 'Compras & Suprimentos',
    repo: 'G:\\Projetos\\compras (ERPNext)',
    category: 'FINANCEIRO',
    description: 'Cotação de fornecedores (RFQ), pedidos de compra e ordens de pagamento.',
    enabled: false,
    ingestionMode: 'OCR_PAPERLESS',
    lastIngestion: 'Leitura de notas fiscais via Paperless',
    recordsCount: 164,
  },
  {
    id: 'poli_zap',
    name: 'CRM & WhatsApp Ativo',
    repo: 'G:\\Projetos\\Poli (AIVIQ-ZAP)',
    category: 'ATENDIMENTO',
    description: 'Confirmação anti-ban de consultas, triagem de sintomas e ouvidoria.',
    enabled: true,
    ingestionMode: 'NATIVO',
    lastIngestion: 'Disparo seguro em execução',
    recordsCount: 800,
  },
  {
    id: 'paperless_auditoria',
    name: 'Auditoria Documental & OCR',
    repo: 'G:\\Projetos\\gestão de despesas (Paperless)',
    category: 'AUDITORIA',
    description: 'Extração automática de valores de notas fiscais e contratos de serviço.',
    enabled: true,
    ingestionMode: 'NATIVO',
    lastIngestion: 'Fila de OCR Tesseract ativa',
    recordsCount: 520,
  },
];

export default function IngestaoModulosPage() {
  const roles = MODULO_ROLES_CATALOG['ingestao-modulos'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [abaAtiva, setAbaAtiva] = useState<'conectores' | 'tabelas-sus' | 'dlq' | 'perfis'>('conectores');
  const [modules, setModules] = useState<ModuleConfig[]>(INITIAL_MODULES);
  const [activePlan, setActivePlan] = useState<'CUSTOM' | 'FARMACIA_ONLY' | 'ASSISTENCIAL' | 'SUITE_360'>('CUSTOM');
  const [viewMode, setViewMode] = useState<'PRIVADO' | 'PUBLICO_SUS'>('PRIVADO');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);

  // Carrega análise de custo do paciente da API criada
  const fetchPatientAnalysis = async () => {
    setLoadingPatient(true);
    try {
      const res = await fetch('/api/custo-paciente?cpf=123.456.789-00');
      const json = await res.json();
      if (json.success) {
        setPatientData(json.data);
      }
    } catch (err) {
      console.error('Falha ao carregar análise de paciente', err);
    } finally {
      setLoadingPatient(false);
    }
  };

  useEffect(() => {
    // Adiado para microtask: fetchPatientAnalysis() seta loading de forma síncrona.
    void Promise.resolve().then(() => fetchPatientAnalysis());
  }, []);

  const handleToggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextEnabled = !m.enabled;
          return {
            ...m,
            enabled: nextEnabled,
            ingestionMode: nextEnabled ? 'NATIVO' : 'PLANILHA',
          };
        }
        return m;
      })
    );
    setActivePlan('CUSTOM');
  };

  const handleApplyPreset = (preset: 'FARMACIA_ONLY' | 'ASSISTENCIAL' | 'SUITE_360') => {
    setActivePlan(preset);
    if (preset === 'FARMACIA_ONLY') {
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          enabled: m.id === 'estoque_fefo',
          ingestionMode: m.id === 'estoque_fefo' ? 'NATIVO' : 'PLANILHA',
        }))
      );
    } else if (preset === 'ASSISTENCIAL') {
      setModules((prev) =>
        prev.map((m) => {
          const isAssist = ['estoque_fefo', 'sabia_facilities', 'contabil_faturamento', 'poli_zap'].includes(m.id);
          return {
            ...m,
            enabled: isAssist,
            ingestionMode: isAssist ? 'NATIVO' : 'PLANILHA',
          };
        })
      );
    } else if (preset === 'SUITE_360') {
      setModules((prev) =>
        prev.map((m) => ({
          ...m,
          enabled: true,
          ingestionMode: 'NATIVO',
        }))
      );
    }
  };

  const handleSimulateUpload = (modName: string, tipo: string) => {
    setUploadStatus(`Processando ingestão para [${modName}]...`);
    setTimeout(async () => {
      try {
        const res = await fetch('/api/ingestao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: tipo === 'rh_ponto' ? 'FOLHA_RH' : tipo === 'compras_suprimentos' ? 'DESPESA_COMPRA' : 'DISPENSACAO_FARMACIA',
            registros: [
              {
                cpfPaciente: '123.456.789-00',
                nomePaciente: 'Carlos Eduardo Silveira',
                centroCustoId: 'CC-04',
                descricao: `Ingestão Externa: ${modName}`,
                valor: 350.0,
                data: new Date().toISOString(),
              },
            ],
          }),
        });
        const data = await res.json();
        if (data.success) {
          setUploadStatus(`✅ Sucesso: ${data.data.mensagem}`);
          fetchPatientAnalysis();
        }
      } catch (err) {
        setUploadStatus('❌ Erro na importação.');
      }
    }, 800);
  };

  const handleDownloadTemplate = (modId: string, modName: string) => {
    let headers = '';
    let sampleRow = '';

    if (modId === 'rh_ponto') {
      headers = 'Matricula;NomeServidor;Cargo;Especialidade;CustoHora;CargaHorariaSemanal;CentroCustoId\n';
      sampleRow = 'MED-104;Dr. Ricardo Mendes;Medico Especialista;Cardiologia;120.00;40;CC-03\nENF-209;Juliana Mendes;Tecnico Enfermagem;Geral;45.00;36;CC-04';
    } else if (modId === 'estoque_fefo' || modId === 'almoxarifado_wms') {
      headers = 'CodigoItem;Descricao;Lote;ValidadeFEFO;Quantidade;ValorUnitario;CPFPaciente;CentroCustoId\n';
      sampleRow = 'MED-0991;Ceftriaxona 1g IV;L-9941;2026-12-31;2;107.75;123.456.789-00;CC-04\nMAT-0302;Kit Cirurgico Esteril;K-302;2027-06-30;1;380.00;123.456.789-00;CC-04';
    } else if (modId === 'compras_suprimentos' || modId === 'paperless_auditoria') {
      headers = 'NumeroNF;Fornecedor;CNPJ;DataEmissao;ValorTotal;CentroCustoDestino;DescricaoDespesa\n';
      sampleRow = 'NF-98421;Distribuidora Medica Brasil Ltda;04.123.456/0001-99;2026-09-15;14500.00;CC-02;Insumos e Medicamentos';
    } else {
      headers = 'IdRegistro;Descricao;Data;Valor;CentroCusto;Observacao\n';
      sampleRow = 'REG-001;Registro Operacional Externo;2026-09-20;350.00;CC-01;Integracao legada';
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + sampleRow);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `Template_Ingestao_${modId}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setUploadStatus(`📥 Template CSV baixado para [${modName}]. Preencha e utilize 'Ingerir Arquivo'.`);
  };

  return (
    <>
      <PageHeader
        activeTitle="Gestão de Módulos & Ingestão de Dados Legados"
        activeSubtitle="Configure os módulos ativos ou conecte dados via planilhas CSV e webhooks sem retrabalho manual"
        actions={
          <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-[#E0E0E0]">
            <button
              onClick={() => handleApplyPreset('FARMACIA_ONLY')}
              className={`px-3 py-2 min-h-[44px] text-xs font-semibold rounded-lg transition-all ${
                activePlan === 'FARMACIA_ONLY'
                  ? 'bg-[#8A6A16]/[0.08] text-[#8A6A16] border border-[#8A6A16]/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Só Farmácia
            </button>
            <button
              onClick={() => handleApplyPreset('ASSISTENCIAL')}
              className={`px-3 py-2 min-h-[44px] text-xs font-semibold rounded-lg transition-all ${
                activePlan === 'ASSISTENCIAL'
                  ? 'bg-[#8A6A16]/[0.08] text-[#8A6A16] border border-[#8A6A16]/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assistencial
            </button>
            <button
              onClick={() => handleApplyPreset('SUITE_360')}
              className={`px-3 py-2 min-h-[44px] text-xs font-semibold rounded-lg transition-all ${
                activePlan === 'SUITE_360'
                  ? 'bg-[#8A6A16] text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Suite Completa 360
            </button>
          </div>
        }
      />

      {/* PERFIS & MATRIZ RBAC — só aparece na seção "Perfis" do menu lateral, não em todas as telas */}
      {abaAtiva === 'perfis' && (
        <ModuloRbacBar
          moduloId="ingestao-modulos"
          activeRole={activeRole}
          onRoleChange={setActiveRole}
          accentColor="#8A6A16"
          lightBg="bg-[#8A6A16]/[0.08]"
          lightBorder="border-[#8A6A16]/20"
        />
      )}

      {/* SUB-NAVEGAÇÃO POR ABAS */}
      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-1.5 mb-6 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'conectores', label: '1. Conectores & Módulos Legados', icon: Layers },
          { id: 'tabelas-sus', label: '2. Bases Nacionais (SIGTAP/CMED)', icon: FileSpreadsheet },
          { id: 'dlq', label: '3. Fila Dead Letter (DLQ)', icon: RefreshCw },
          { id: 'perfis', label: '4. Perfis & Matriz RBAC', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = abaAtiva === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAbaAtiva(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[44px] touch-manipulation ${
                isActive
                  ? 'bg-[#8A6A16] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ABA PERFIS */}
      {abaAtiva === 'perfis' && (
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs mb-6">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Perfis de Acesso do Módulo Ingestão &amp; ETL Hospitalar
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Responsáveis pela engenharia de dados, sincronização de schemas e administração de banco de dados.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#8A6A16]/[0.08] text-[#8A6A16] border border-[#8A6A16]/20">
                    {role.level}
                  </span>
                  {role.id === activeRole.id && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Perfil Ativo
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{role.name}</h4>
                <p className="text-xs text-slate-600 mb-3">{role.description}</p>
                
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  Responsável: <strong>{role.responsavelPadrao}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA BASES NACIONAIS */}
      {abaAtiva === 'tabelas-sus' && (
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs mb-6 max-w-4xl">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Ingestão de Tabelas Nacionais SUS &amp; ANVISA
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Bases oficiais atualizadas mensalmente para controle de conformidade, teto CMED e tabela SIGTAP.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-[#E0E0E0] bg-slate-50/50">
              <strong className="text-slate-900 block text-sm">Tabela SIGTAP (Competência 09/2026)</strong>
              <span className="text-slate-500 mt-1 block">4.890 procedimentos ambulatoriais e hospitalares mapeados.</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block mt-2">
                Sincronizado via DATASUS API
              </span>
            </div>
            <div className="p-4 rounded-xl border border-[#E0E0E0] bg-slate-50/50">
              <strong className="text-slate-900 block text-sm">Tabela CMED / ANVISA (Preços Tetos)</strong>
              <span className="text-slate-500 mt-1 block">26.400 medicamentos monitorados com PMC e PF.</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block mt-2">
                Conectado ao Banco CMED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA DLQ */}
      {abaAtiva === 'dlq' && (
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs mb-6 max-w-3xl">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Dead Letter Queue (DLQ) &amp; Fila de Exceções
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Mensagens com falha de schema ou inconsistência de rede retidas para reprocessamento garantido.
          </p>

          <div className="p-4 bg-[#8A6A16]/[0.08] border border-[#8A6A16]/20 rounded-xl text-xs text-[#6E5511] space-y-1">
            <strong>Fila Limpa:</strong>
            <p>Nenhum payload retido na Dead Letter Queue. 100% dos eventos integrados com sucesso.</p>
          </div>
        </div>
      )}

      {/* Banner de Feedback de Upload */}
      {uploadStatus && (
        <div className="max-w-7xl mx-auto w-full pt-2 pb-4">
          <div className="p-3 bg-[#8A6A16]/[0.08] border border-[#8A6A16]/20 rounded-xl text-xs font-medium text-[#6E5511] flex items-center justify-between">
            <span>{uploadStatus}</span>
            <button onClick={() => setUploadStatus(null)} className="text-[#8A6A16] hover:text-[#8A6A16] font-bold min-w-[36px] min-h-[36px] flex items-center justify-center">✕</button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Grade de Módulos (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#8A6A16]" /> Módulos do Sistema ({modules.filter((m) => m.enabled).length} de {modules.length} Ativos)
            </h2>
            <span className="text-xs text-[#64748B]">Clique no switch para alternar modo</span>
          </div>

          <div className="space-y-3">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className={`p-4 rounded-2xl border transition-all ${
                  mod.enabled
                    ? 'bg-white border-[#BFDBFE] shadow-sm hover:border-[#8A6A16]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-90'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#0F172A]">{mod.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          mod.enabled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {mod.enabled ? 'Nativo Contratado' : 'Não Contratado • Ingestão Ativa'}
                      </span>
                      <span className="text-[10px] text-[#64748B] font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                        {mod.category}
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B] mt-1">{mod.description}</p>
                    <p className="text-[11px] text-[#94A3B8] font-mono mt-1">Origem: {mod.repo}</p>

                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <span className="text-[#475569]">
                        <strong>Modo:</strong> {mod.ingestionMode}
                      </span>
                      <span className="text-[#64748B]">
                        <strong>Status:</strong> {mod.lastIngestion}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleToggleModule(mod.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        mod.enabled ? 'bg-[#8A6A16]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          mod.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {/* Ações de Ingestão caso desativado */}
                    {!mod.enabled && (
                      <div className="flex flex-col items-end gap-1.5">
                        <button
                          onClick={() => handleSimulateUpload(mod.name, mod.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#8A6A16] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-lg border border-[#BFDBFE] transition-colors"
                        >
                          <UploadCloud className="w-3 h-3" /> Ingerir Arquivo
                        </button>

                        <button
                          onClick={() => handleDownloadTemplate(mod.id, mod.name)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                          title="Baixar planilha modelo CSV/Excel para este módulo"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-emerald-600" /> Template CSV
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: O Resultado Final 360 (Custo Real do Paciente) (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#8A6A16] uppercase tracking-wider">O Resultado Final</span>
                <h3 className="text-lg font-extrabold text-[#0F172A]">Custo Real por Paciente</h3>
              </div>
              
              {/* Seletor de Visão Privado vs Público */}
              <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('PRIVADO')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    viewMode === 'PRIVADO' ? 'bg-[#8A6A16] text-white' : 'text-[#64748B]'
                  }`}
                >
                  Hospital Privado
                </button>
                <button
                  onClick={() => setViewMode('PUBLICO_SUS')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    viewMode === 'PUBLICO_SUS' ? 'bg-[#0E9F6E] text-white' : 'text-[#64748B]'
                  }`}
                >
                  Secretaria SUS
                </button>
              </div>
            </div>

            {loadingPatient ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#8A6A16]" />
                <span className="text-xs">Consolidando jornada do paciente...</span>
              </div>
            ) : patientData ? (
              <div className="mt-5 space-y-5">
                {/* Cartão do Paciente */}
                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Paciente Auditado</p>
                    <p className="text-sm font-bold text-[#0F172A]">{patientData.nome}</p>
                    <p className="text-xs font-mono text-slate-500">CPF: {patientData.cpf} • {patientData.tipoAtendimento}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
                    {patientData.diasInternacao} dias
                  </span>
                </div>

                {/* Totalizador de Custo */}
                <div className="p-4 rounded-xl bg-[#1E293B] text-white">
                  <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Custo Total Apurado</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-white">
                      R$ {patientData.custoTotalReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-emerald-400">100% Rastreado</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Alimentado por módulos nativos e camada de ingestão unificada.
                  </p>
                </div>

                {/* Desdobramento de Custos Diretos e Indiretos */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Composição do Custo</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800">1. Medicamentos &amp; Materiais (FEFO)</span>
                        <p className="text-[11px] text-slate-500">Origem: {modules.find(m => m.id === 'estoque_fefo')?.enabled ? 'OpenBoxes Nativo' : 'Planilha Ingerida'}</p>
                      </div>
                      <span className="font-bold text-slate-800">R$ {patientData.custosDiretos.medicamentosMateriais.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800">2. Horas Equipe Assistencial</span>
                        <p className="text-[11px] text-slate-500">Origem: {modules.find(m => m.id === 'rh_ponto')?.enabled ? 'OpenHRApp Ponto' : 'Folha Ingerida'}</p>
                      </div>
                      <span className="font-bold text-slate-800">R$ {patientData.custosDiretos.equipeAssistencial.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800">3. Hotelaria &amp; Facilities (Sabia)</span>
                        <p className="text-[11px] text-slate-500">Diárias de leito + higienização com SLA</p>
                      </div>
                      <span className="font-bold text-slate-800">R$ {(patientData.custosIndiretosRateados.diariaHotelaria + patientData.custosIndiretosRateados.higienizacaoFacilities).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-800">4. Depreciação &amp; Apoio ABC</span>
                        <p className="text-[11px] text-slate-500">Equipamentos + rateio administrativo</p>
                      </div>
                      <span className="font-bold text-slate-800">R$ {(patientData.custosIndiretosRateados.depreciacaoEquipamentos + patientData.custosIndiretosRateados.apoioAdministrativoABC).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Benchmark Específico do Modelo de Negócio */}
                {viewMode === 'PRIVADO' ? (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 uppercase">Visão Hospital Privado (TUSS / Particular)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">
                        +{patientData.benchmarkPrivado.margemPercentual}% Margem
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-blue-700">Valor Cobrado:</p>
                        <p className="font-bold text-slate-900 text-sm">R$ {patientData.benchmarkPrivado.tabelaTussParticular.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">Lucro Líquido:</p>
                        <p className="font-bold text-emerald-700 text-sm">R$ {patientData.benchmarkPrivado.margemContribuicao.toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-blue-600 mt-2">
                      Permite precificar pacotes cirúrgicos assertivos e negociar diárias com planos de saúde sem margem negativa.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 uppercase">Visão Gestor Público (SUS / SIGTAP)</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white font-bold">
                        Déficit Coberto
                      </span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-emerald-700">Repasse SUS (SIGTAP):</p>
                        <p className="font-bold text-slate-900 text-sm">R$ {patientData.benchmarkPublicoSus.repasseTabelaSigtap.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-red-700">Aporte Municipal:</p>
                        <p className="font-bold text-red-700 text-sm">R$ {patientData.benchmarkPublicoSus.subsidioMunicipalNecessario.toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-2">
                      Mostra que o SUS cobriu apenas {patientData.benchmarkPublicoSus.percentualCoberturaSus}% do custo real. A prefeitura financiou o restante.
                    </p>
                  </div>
                )}

                {/* Linha do Tempo Door-to-Door (Entrada à Saída) */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#8A6A16]" /> Jornada Door-to-Door (n8n Hub)
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Entrada 08:00 ➔ Saída 10:00
                    </span>
                  </div>

                  <div className="relative pl-5 border-l-2 border-blue-200 space-y-3 text-xs">
                    <div className="relative">
                      <span className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-[#8A6A16] ring-4 ring-blue-100" />
                      <p className="font-bold text-slate-800">1. Porta de Entrada (Check-in &amp; Triagem)</p>
                      <p className="text-[11px] text-slate-500">Recepção 360 • Manchester • Pulseira QR Code • <strong className="text-slate-700">R$ 38,50</strong></p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-[#8A6A16] ring-4 ring-blue-100" />
                      <p className="font-bold text-slate-800">2. Consulta Clínica Especializada (OpenEMR)</p>
                      <p className="text-[11px] text-slate-500">Clínica CardioVida • Dr. Ricardo Mendes • <strong className="text-slate-700">R$ 60,00</strong> (0,5h)</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-[#8A6A16] ring-4 ring-blue-100" />
                      <p className="font-bold text-slate-800">3. Baixa Imediata Estoque FEFO (OpenBoxes via n8n)</p>
                      <p className="text-[11px] text-slate-500">Ceftriaxona Lote L-9941 + Insumos • <strong className="text-slate-700">R$ 125,50</strong></p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-[#8A6A16] ring-4 ring-blue-100" />
                      <p className="font-bold text-slate-800">4. Laboratório Central LIMS (SENAITE.core)</p>
                      <p className="text-[11px] text-slate-500">Hemograma + Troponina • Laudo FHIR • <strong className="text-slate-700">R$ 145,00</strong></p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-[#8A6A16] ring-4 ring-blue-100" />
                      <p className="font-bold text-slate-800">5. Porta de Saída: Cobrança &amp; Split (Hyperswitch)</p>
                      <p className="text-[11px] text-slate-500">Split condomínio vs clínica médica • NF no Contábil • <strong className="text-slate-700">R$ 42,00</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}
