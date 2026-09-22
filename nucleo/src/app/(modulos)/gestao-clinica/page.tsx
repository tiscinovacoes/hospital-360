'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloRbacBar } from '@/components/ModuloRbacBar';
import { KpiCard } from '@/components/KpiCard';
import { ModuloRole, MODULO_ROLES_CATALOG, hasPermission } from '@/types/rbac';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  Lock,
  ArrowLeft,
  Building,
  CreditCard,
  AlertCircle,
  FlaskConical,
  Package,
  Clock,
  CheckCircle2,
  Users,
  Percent,
  ChevronRight,
  X,
  ShoppingCart,
  Send,
  ShieldCheck,
  Zap,
  Check,
  Sliders,
  Receipt,
  Download,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

interface MarketplaceItem {
  id: string;
  name: string;
  category: string;
  regularPrice: number;
  hubPrice: number;
  discount: number;
  unit: string;
  qty: number;
}

const initialMarketplaceItems: MarketplaceItem[] = [
  { id: 'item-1', name: 'Luvas de Procedimento Nitrílicas (Cx 100un)', category: 'EPI', regularPrice: 48.0, hubPrice: 31.2, discount: 35, unit: 'Caixa', qty: 0 },
  { id: 'item-2', name: 'Seringas Descartáveis 5ml c/ Agulha (Cx 100un)', category: 'Injetáveis', regularPrice: 65.0, hubPrice: 42.25, discount: 35, unit: 'Caixa', qty: 0 },
  { id: 'item-3', name: 'Lençol Descartável Hospitalar 70cmx50m', category: 'Hotelaria', regularPrice: 32.0, hubPrice: 19.84, discount: 38, unit: 'Rolo', qty: 0 },
  { id: 'item-4', name: 'Kit Paramentação Cirúrgica Estéril Completo', category: 'Cirúrgico', regularPrice: 110.0, hubPrice: 71.5, discount: 35, unit: 'Kit', qty: 0 },
  { id: 'item-5', name: 'Álcool em Gel 70% Hospitalar Bag 1L', category: 'Higienização', regularPrice: 28.0, hubPrice: 16.8, discount: 40, unit: 'Unidade', qty: 0 },
];

export default function ClinicManagementPage() {
  const roles = MODULO_ROLES_CATALOG['gestao-clinica'];
  const [activeRole, setActiveRole] = useState<ModuloRole>(roles[0]);
  const [activeTab, setActiveTab] = useState<'painel' | 'agenda' | 'financeiro' | 'fila-openemr' | 'perfis'>('painel');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados da Fila & Atendimento OpenEMR (n8n)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pac-1');
  const [patientQueue, setPatientQueue] = useState([
    {
      id: 'pac-1',
      name: 'Maria Oliveira da Silva',
      cpf: '452.***.***-89',
      age: 58,
      status: 'Em Atendimento',
      entryTime: '08:30',
      triagem: 'Amarela',
      chiefComplaint: 'Dor precordial atípica e dispneia leve',
      procedimento: 'Consulta Cardiológica Especializada',
      custoAcumulado: 145.0,
      itensPrescritos: [] as string[],
      examesSolicitados: [] as string[],
      pago: false,
    },
    {
      id: 'pac-2',
      name: 'João Pedro Rocha',
      cpf: '318.***.***-21',
      age: 64,
      status: 'Aguardando Chamada',
      entryTime: '08:45',
      triagem: 'Verde',
      chiefComplaint: 'Ajuste de anti-hipertensivo e retorno',
      procedimento: 'Consulta de Retorno',
      custoAcumulado: 35.0,
      itensPrescritos: [] as string[],
      examesSolicitados: [] as string[],
      pago: false,
    },
    {
      id: 'pac-3',
      name: 'Ana Clara Sampaio',
      cpf: '290.***.***-54',
      age: 42,
      status: 'Aguardando Chamada',
      entryTime: '09:00',
      triagem: 'Azul',
      chiefComplaint: 'Risco cirúrgico pré-operatório',
      procedimento: 'Avaliação Cardiológica Risco Cirúrgico',
      custoAcumulado: 20.0,
      itensPrescritos: [] as string[],
      examesSolicitados: [] as string[],
      pago: false,
    },
    {
      id: 'pac-4',
      name: 'Carlos Eduardo Silva',
      cpf: '117.***.***-63',
      age: 71,
      status: 'Check-in na Portaria',
      entryTime: '09:15',
      triagem: 'Amarela',
      chiefComplaint: 'Palpitações noturnas e tontura',
      procedimento: 'Primeira Consulta Cardiológica',
      custoAcumulado: 10.0,
      itensPrescritos: [] as string[],
      examesSolicitados: [] as string[],
      pago: false,
    },
  ]);

  const [n8nLogs, setN8nLogs] = useState<Array<{ id: string; time: string; event: string; target: string; payload: string; status: 'sucesso' | 'processando' }>>([
    {
      id: 'log-1',
      time: '08:30:12',
      event: 'paciente.checkin_portaria',
      target: 'Sistema 360 Portaria',
      payload: '{"paciente_id": "pac-1", "catraca": "PORT-01", "custo_inicial": 10.00}',
      status: 'sucesso',
    },
    {
      id: 'log-2',
      time: '08:35:45',
      event: 'triagem.manchester_concluida',
      target: 'Manchester Protocol',
      payload: '{"paciente_id": "pac-1", "classificacao": "AMARELA", "tempo_espera_max": 60}',
      status: 'sucesso',
    },
    {
      id: 'log-3',
      time: '08:42:10',
      event: 'openemr.consulta_iniciada',
      target: 'OpenEMR Sala 204',
      payload: '{"clinica": "CardioVida", "medico": "Dr. Ricardo Mendes", "status": "IN_PROGRESS"}',
      status: 'sucesso',
    },
  ]);

  // Estados de Modais
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [showSurgicalModal, setShowSurgicalModal] = useState(false);
  const [showFintechModal, setShowFintechModal] = useState(false);
  const [showNoShowModal, setShowNoShowModal] = useState(false);

  // Marketplace Store
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>(initialMarketplaceItems);

  // Fintech 360 - Simulador de Antecipação
  const [advanceAmount, setAdvanceAmount] = useState<number>(15000);
  const advanceFeeRate = 0.0119; // 1,19% a.m.
  const advanceFee = advanceAmount * advanceFeeRate;
  const advanceNet = advanceAmount - advanceFee;
  const [advanceSuccessReceipt, setAdvanceSuccessReceipt] = useState<boolean>(false);

  // Solicitar Facilities
  const [facilityService, setFacilityService] = useState('Limpeza Concorrente Pós-Procedimento');
  const [facilityPriority, setFacilityPriority] = useState<'normal' | 'urgent'>('urgent');
  const [facilityNotes, setFacilityNotes] = useState('Higienização rápida da maca e troca de forração para o próximo paciente das 09:15.');

  // Reserva de Centro Cirúrgico (Áreas Nobres)
  const [surgicalRoom, setSurgicalRoom] = useState('Sala 01 - Laparoscopia & Vídeo');
  const [surgicalShift, setSurgicalShift] = useState('Manhã (07:00 às 12:00)');
  const [includeAnesthetist, setIncludeAnesthetist] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const updateItemQty = (id: string, delta: number) => {
    setMarketItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const totalMarketplaceCart = marketItems.reduce((acc, item) => acc + item.qty * item.hubPrice, 0);
  const totalMarketplaceSavings = marketItems.reduce(
    (acc, item) => acc + item.qty * (item.regularPrice - item.hubPrice),
    0
  );

  const handleCheckoutMarketplace = () => {
    setShowMarketplaceModal(false);
    showToast(
      `Pedido coletivo de R$ ${totalMarketplaceCart.toFixed(2)} faturado com sucesso no split quinzenal do condomínio!`
    );
    // Resetar quantidades
    setMarketItems(initialMarketplaceItems);
  };

  const handleSendFacilitiesRequest = () => {
    setShowFacilitiesModal(false);
    showToast(
      `Chamado de Facilities emitido com sucesso! SLA: Chegada em 8 minutos na Sala 204.`
    );
  };

  const handleBookSurgical = () => {
    setShowSurgicalModal(false);
    showToast(
      `Reserva da ${surgicalRoom} para o turno ${surgicalShift} confirmada na escala do centro cirúrgico!`
    );
  };

  const handleExecuteAdvance = () => {
    setAdvanceSuccessReceipt(true);
    showToast(`Antecipação de R$ ${advanceNet.toFixed(2)} liquidada instantaneamente via PIX D+0!`);
  };

  const handlePrescribeMedication = (patientId: string) => {
    const timeNow = new Date().toLocaleTimeString('pt-BR');
    const itemNome = 'Atorvastatina Cálcica 20mg (Cx 30cp) + Kit Injeção 5ml';
    const itemCusto = 42.5;

    setPatientQueue((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            custoAcumulado: p.custoAcumulado + itemCusto,
            itensPrescritos: [...p.itensPrescritos, itemNome],
          };
        }
        return p;
      })
    );

    const newLog = {
      // eslint-disable-next-line react-hooks/purity -- roda dentro do handler de clique handlePrescribeMedication, nunca durante o render.
      id: `log-${Date.now()}`,
      time: timeNow,
      event: 'openboxes.fefo_baixa_imediata',
      target: 'OpenBoxes Almoxarifado Central',
      payload: JSON.stringify({
        paciente_id: patientId,
        item: 'Atorvastatina 20mg',
        lote_fefo: 'LT-ATV-2026-09',
        validade: '2026-11-30',
        qty: 1,
        custo_unitario: itemCusto,
        disparado_por: 'n8n_webhook_rx',
      }),
      status: 'sucesso' as const,
    };
    setN8nLogs((prev) => [newLog, ...prev]);
    showToast(`Prescrição enviada! Baixa imediata FEFO executada no OpenBoxes (Lote LT-ATV-2026-09) via n8n.`);
  };

  const handleOrderLabExam = (patientId: string) => {
    const timeNow = new Date().toLocaleTimeString('pt-BR');
    const exameNome = 'Painel Cardíaco LIMS (Troponina I Ultrassensível + ECG Esforço)';
    const exameCusto = 85.0;

    setPatientQueue((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            custoAcumulado: p.custoAcumulado + exameCusto,
            examesSolicitados: [...p.examesSolicitados, exameNome],
          };
        }
        return p;
      })
    );

    const newLog = {
      id: `log-${Date.now()}`,
      time: timeNow,
      event: 'lims.senaite_order_created',
      target: 'SENAITE LIMS Laboratório',
      payload: JSON.stringify({
        paciente_id: patientId,
        workorder_id: 'WO-CARDIO-8821',
        analises: ['Troponina I', 'ECG Esforço'],
        prioridade: 'URGENTE_AMARELA',
        custo_laboratorial: exameCusto,
      }),
      status: 'sucesso' as const,
    };
    setN8nLogs((prev) => [newLog, ...prev]);
    showToast(`Requisição LIMS gerada! WorkOrder criada no SENAITE Laboratório via n8n.`);
  };

  const handleFinishConsultation = (patientId: string) => {
    const timeNow = new Date().toLocaleTimeString('pt-BR');
    const valorConsulta = 350.0;
    const taxaCondominio = 52.5; // 15%
    const liquidoClinica = 297.5; // 85%

    setPatientQueue((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            status: 'Concluído & Faturado',
            pago: true,
          };
        }
        return p;
      })
    );

    const newLog = {
      id: `log-${Date.now()}`,
      time: timeNow,
      event: 'hyperswitch.payment_split_settled',
      target: 'Hyperswitch Gateway + Contábil HealVista',
      payload: JSON.stringify({
        paciente_id: patientId,
        total_consulta: valorConsulta,
        split_clinica_85pct: liquidoClinica,
        split_condominio_15pct: taxaCondominio,
        nfse_chave: 'NFS-2026-BH-009182',
        custo_door_to_door_final: patientQueue.find((p) => p.id === patientId)?.custoAcumulado,
        status: 'PAID',
      }),
      status: 'sucesso' as const,
    };
    setN8nLogs((prev) => [newLog, ...prev]);
    showToast(`Consulta finalizada! Split Hyperswitch liquidado e NFS-e emitida no Contábil HealVista.`);
  };

  return (
    <>
      <PageHeader
        activeTitle="Consultório & Clínica Médica (OpenEMR)"
        activeSubtitle="Prontuário Eletrônico do Paciente (PEP) • Especialidade: Cardiologia (Sala 204)"
        actions={
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 min-h-[44px] rounded-xl text-xs font-semibold bg-[#C1622D]/[0.08] border border-[#C1622D]/20 text-[#C1622D] flex items-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#C1622D]" />
              RN-IND: Multi-Tenant
            </span>
          </div>
        }
      />
      {/* Toast Flutuante Asséptico (Sem preto/escuro) */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white text-slate-800 px-5 py-3.5 rounded-xl shadow-xl border border-[#C1622D]/30 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#C1622D]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 ml-2 min-w-[36px] min-h-[36px] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PERFIS & MATRIZ RBAC — só aparece na seção "Perfis" do menu lateral, não em todas as telas */}
      {activeTab === 'perfis' && (
        <ModuloRbacBar
          moduloId="gestao-clinica"
          activeRole={activeRole}
          onRoleChange={setActiveRole}
          accentColor="#C1622D"
          lightBg="bg-[#C1622D]/[0.08]"
          lightBorder="border-[#C1622D]/20"
        />
      )}

      {/* Abas Superiores Padronizadas com Touch Target HIG >= 44px */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: 'painel', label: 'Visão Geral & DRE', icon: DollarSign },
          { id: 'agenda', label: 'Agenda Preditiva & No-Show (IA)', icon: Calendar },
          { id: 'financeiro', label: 'Fintech 360 & Antecipação D+0', icon: CreditCard },
          { id: 'fila-openemr', label: 'Fila da Clínica & OpenEMR (n8n)', icon: Users },
          { id: 'perfis', label: 'Perfis & Matriz RBAC', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#C1622D] text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-[#E0E0E0] hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo Principal */}
      <div className="space-y-6">
        
        {/* TAB 1: PAINEL EXECUTIVO & DRE DA CLÍNICA */}
        {activeTab === 'painel' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 4 Cards de Métricas Padronizados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Honorários Líquidos"
                value="R$ 49.620"
                subtitle="Competência Atual"
                icon={DollarSign}
                tooltipInfo="Receita líquida auferida pelo médico cooperado após dedução das taxas operacionais do condomínio hospitalar e impostos retidos."
                trend={{ text: "+14,2% vs. mês anterior", isPositive: true }}
              />

              <KpiCard
                title="Fintech Disponível D+0"
                value="R$ 21.750"
                subtitle="Liberação Instantânea Pix"
                icon={CreditCard}
                tooltipInfo="Saldo de procedimentos faturados e auditados disponível para antecipação instantânea via gateway Hyperswitch à taxa de 1,19% a.m."
                trend={{ text: "Taxa 1,19% a.m.", isPositive: true }}
              />

              <KpiCard
                title="Volume de Pacientes"
                value="130"
                subtitle="Atendimentos no Mês"
                icon={Users}
                tooltipInfo="Total de consultas e procedimentos ambulatoriais realizados com registro de prontuário e prontidão de alta no OpenEMR."
                trend={{ text: "Ticket Médio: R$ 446,15", isPositive: true }}
              />

              <KpiCard
                title="Glosas em Recurso"
                value="R$ 1.850"
                subtitle="96,8% Reversão IA"
                icon={AlertCircle}
                tooltipInfo="Valor de faturamento glosado por operadoras de saúde em processo ativo de recurso automático com justificativa gerada por inteligência artificial."
                trend={{ text: "96,8% taxa de reversão IA", isPositive: true }}
              />
            </div>

            {/* DRE Mensal Detalhado da Sala 204 */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F3F4F6] gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#111928] flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-[#C1622D]" />
                    Demonstrativo do Resultado do Exercício (DRE) — Sala 204
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Competência: Setembro/2026 • Visão Contábil Gerencial
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Margem Líquida: 65,5%
                  </span>
                </div>
              </div>

              <div className="mt-4 font-mono text-xs space-y-2.5 divide-y divide-[#F3F4F6]">
                <div className="flex justify-between py-2 font-bold text-sm text-[#111928]">
                  <span>RECEITA BRUTA OPERACIONAL (Consultas + Procedimentos)</span>
                  <span>R$ 58.000,00</span>
                </div>
                
                <div className="space-y-1.5 pt-2 pl-4">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>• Consultas Particulares (42 atendimentos):</span>
                    <span>R$ 21.000,00</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>• Repasses de Convênios Unimed / Bradesco (88 atendimentos):</span>
                    <span>R$ 37.000,00</span>
                  </div>
                </div>

                <div className="flex justify-between py-2 text-red-600 pl-4">
                  <span>(-) Taxa Predial de Sublocação (Condomínio Hospitalar Hub)</span>
                  <span>- R$ 8.000,00</span>
                </div>

                <div className="flex justify-between py-2 text-red-600 pl-4">
                  <span>(-) Insumos Hospitalares do Marketplace Coletivo (Economia de 35% aplicada)</span>
                  <span>- R$ 380,00</span>
                </div>

                <div className="flex justify-between py-2.5 font-bold text-[#1E3A5F] bg-[#F9FAFB] px-3 rounded-lg">
                  <span>(=) RECEITA OPERACIONAL LÍQUIDA</span>
                  <span>R$ 49.620,00</span>
                </div>

                <div className="flex justify-between py-2 text-red-600 pl-4">
                  <span>(-) Despesas Internas (Secretária, Software PEP, Telefonia)</span>
                  <span>- R$ 11.620,00</span>
                </div>

                <div className="flex justify-between py-3.5 font-extrabold text-base text-[#0E9F6E] border-t-2 border-[#E5E7EB] bg-[#F0FDF4] px-4 rounded-xl">
                  <span>(=) LUCRO LÍQUIDO FINAL DISPONÍVEL AO MÉDICO</span>
                  <span>R$ 38.000,00</span>
                </div>
              </div>
            </div>

            {/* 4 Cards de Ações Rápidas do Hub */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-3">
                Serviços de Infraestrutura &amp; Compartilhamento do Hub
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Ação 1: Exames no Hub */}
                <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:border-[#C1622D] transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#C1622D] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-[#111928]">Exames no Hub</h4>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                      Envie solicitações de análises clínicas com liberação rápida e repasse de comissão.
                    </p>
                  </div>
                  <Link
                    href="/medico"
                    className="mt-4 w-full py-2 px-3 rounded-xl border border-[#C1622D] text-[#C1622D] hover:bg-[#A8531F] hover:text-white font-bold text-xs text-center transition-colors block"
                  >
                    Prescrever Exames
                  </Link>
                </div>

                {/* Ação 2: Marketplace Coletivo */}
                <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:border-[#0E9F6E] transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0E9F6E] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-[#111928]">Marketplace Coletivo</h4>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                      Compre insumos com 35% de desconto através do poder de compra coletivo do hospital.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMarketplaceModal(true)}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-[#0E9F6E] hover:bg-emerald-700 text-white font-bold text-xs text-center transition-colors shadow-sm"
                  >
                    Comprar Insumos (35% OFF)
                  </button>
                </div>

                {/* Ação 3: Solicitar Facilities */}
                <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:border-amber-500 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-[#111928]">Solicitar Facilities</h4>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                      Acione limpeza rápida, higienização de consultório ou descarte de lixo hospitalar.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFacilitiesModal(true)}
                    className="mt-4 w-full py-2 px-3 rounded-xl border border-amber-500 text-amber-700 hover:bg-amber-50 font-bold text-xs text-center transition-colors"
                  >
                    Acionar Limpeza (SLA 8m)
                  </button>
                </div>

                {/* Ação 4: Áreas Nobres (Centro Cirúrgico) */}
                <div className="p-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:border-purple-500 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Building className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-[#111928]">Áreas Nobres (Day Hospital)</h4>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                      Reserve blocos de centro cirúrgico com cobrança pay-per-use por hora de procedimento.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSurgicalModal(true)}
                    className="mt-4 w-full py-2 px-3 rounded-xl border border-purple-500 text-purple-700 hover:bg-purple-50 font-bold text-xs text-center transition-colors"
                  >
                    Reservar Bloco Cirúrgico
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: AGENDA PREDITIVA & IA NO-SHOW (RN16)
           ========================================================================= */}
        {activeTab === 'agenda' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Banner de Inteligência Preditiva No-Show (RN16) */}
            <div className="bg-[#FEF9C3] border border-[#FACA15] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#92400E] shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-200 rounded-xl">
                  <Sparkles className="w-6 h-6 text-[#C27803]" />
                </div>
                <div>
                  <strong className="text-sm text-[#78350F] block">
                    Predição Preditiva de Faltas (IA No-Show — Protocolo RN16)
                  </strong>
                  <p className="mt-1 leading-relaxed text-[#92400E]">
                    O algoritmo de machine learning analisou o perfil dos 8 pacientes da tarde. O slot das 16:00 (Paulo Rossi) possui <strong>74% de risco de falta</strong> devido ao histórico de cancelamentos prévios.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNoShowModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#C27803] hover:bg-[#A16207] text-white font-bold text-xs whitespace-nowrap shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Disparar Prevenção Ativa (WhatsApp)
              </button>
            </div>

            {/* Rastreamento Indoor de Pacientes (RN15) */}
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#F3F4F6] mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#111928]">
                    Monitor de Pacientes no Complexo em Tempo Real (RN15)
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Integração com totens de recepção, laboratório e catracas biomédicas
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  4 Pacientes Monitorados
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'Ana Carolina Souza',
                    time: '08:30',
                    loc: 'Consultório 204 (Em Atendimento)',
                    status: 'No Consultório',
                    badgeBg: 'bg-emerald-100 text-emerald-800',
                    progress: '100%',
                  },
                  {
                    name: 'Carlos Eduardo Lima',
                    time: '09:15',
                    loc: 'Recepção Central (Aguardando Chamada)',
                    status: 'Check-in Realizado',
                    badgeBg: 'bg-blue-100 text-blue-800',
                    progress: '75%',
                  },
                  {
                    name: 'Mariana Duarte',
                    time: '10:00',
                    loc: 'Laboratório Central (Coleta de Sangue)',
                    status: 'No Hub 360',
                    badgeBg: 'bg-purple-100 text-purple-800',
                    progress: '50%',
                  },
                  {
                    name: 'Paulo Henrique Rossi',
                    time: '16:00',
                    loc: 'Não compareceu ao prédio (Alto Risco)',
                    status: 'Risco de Falta 74%',
                    badgeBg: 'bg-amber-100 text-amber-800',
                    progress: '10%',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#111928]">{item.name}</p>
                        <p className="text-[#6B7280]">Horário Agendado: <strong>{item.time}</strong></p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className="font-semibold text-[#C1622D] flex items-center sm:justify-end gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {item.loc}
                      </span>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeBg}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: FINTECH 360 & ANTECIPAÇÃO D+0
           ========================================================================= */}
        {activeTab === 'financeiro' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F3F4F6] gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#111928] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#C1622D]" />
                    Fintech 360 — Antecipação de Recebíveis D+0
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Converta glosas ou faturamento de convênios a receber em 30-60 dias em liquidez imediata via PIX
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  Limite Pré-Aprovado: R$ 21.750,00
                </span>
              </div>

              {/* Simulador Interativo */}
              <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[#374151]">
                      Escolha o Valor a Antecipar:
                    </label>
                    <span className="text-xl font-mono font-extrabold text-[#C1622D]">
                      R$ {advanceAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={21750}
                    step={250}
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#C1622D]"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                    <span>Mín: R$ 1.000,00</span>
                    <span>Máx: R$ 21.750,00</span>
                  </div>
                </div>

                {/* Resumo Financeiro da Operação */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[11px] text-slate-500 block">Taxa de Antecipação</span>
                    <span className="text-sm font-mono font-bold text-[#1E3A5F]">1,19% a.m. (Hub VIP)</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[11px] text-slate-500 block">Custo Financeiro</span>
                    <span className="text-sm font-mono font-bold text-red-600">
                      - R$ {advanceFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-[11px] text-emerald-800 font-bold block">Valor Líquido via PIX D+0</span>
                    <span className="text-lg font-mono font-extrabold text-emerald-700">
                      R$ {advanceNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Conta de Destino: Banco Santander (Ag 1234 • CC 98765-4 • Dr. Ricardo Mendes)</span>
                  </div>
                  <button
                    onClick={() => setShowFintechModal(true)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Contratar Antecipação Imediata
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: FILA DA CLÍNICA & ESTEIRA OPENEMR (INTEGRAÇÃO N8N)
           ========================================================================= */}
        {activeTab === 'fila-openemr' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header da Esteira */}
            <div className="bg-white p-6 rounded-2xl border border-[#C1622D]/[0.12] shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C1622D]/[0.12] text-[#C1622D] border border-[#C1622D]/20 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#C1622D]" />
                      Esteira Ativa n8n Engine
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      OpenEMR v7.0 + OpenBoxes FEFO + SENAITE LIMS
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#1E3A5F]">
                    Fila de Atendimento da Clínica &amp; Automação de Prontuário
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pacientes chamados pela triagem de Manchester, prescrição com baixa imediata no estoque hospitalar e split automático de pagamento.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-semibold uppercase">Custo Door-to-Door Médio</span>
                    <span className="text-base font-mono font-extrabold text-[#C1622D]">R$ 52,50 / paciente</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-semibold uppercase">Status Gateway</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Hyperswitch Split OK
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Cards de Resumo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Pacientes na Fila</span>
                  <span className="text-lg font-bold text-[#1E3A5F]">4 Aguardando</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Tempo Médio Espera</span>
                  <span className="text-lg font-bold text-amber-600">14 minutos</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Baixas FEFO Estoque</span>
                  <span className="text-lg font-bold text-emerald-600">Instantânea (n8n)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Ordens LIMS Ativas</span>
                  <span className="text-lg font-bold text-indigo-600">SENAITE Sync</span>
                </div>
              </div>
            </div>

            {/* Grid Duplo: Fila e Painel de Consulta */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Coluna 1: Fila de Pacientes da Clínica (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#1E3A5F] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#C1622D]" />
                      Fila de Chamada • Sala 204
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">Hoje, 21 Set</span>
                  </div>

                  <div className="space-y-3">
                    {patientQueue.map((p) => {
                      const isSelected = p.id === selectedPatientId;
                      const triagemColor =
                        p.triagem === 'Amarela'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : p.triagem === 'Verde'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300';

                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPatientId(p.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#C1622D]/70 border-[#C1622D] shadow-sm ring-2 ring-[#C1622D]/20'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[#1E3A5F]">{p.name}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${triagemColor}`}>
                                  {p.triagem}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                CPF: {p.cpf} • {p.age} anos • Entrada Portaria: {p.entryTime}
                              </p>
                              <p className="text-[11px] text-slate-600 mt-1 font-medium italic">
                                &quot;{p.chiefComplaint}&quot;
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  p.status === 'Em Atendimento'
                                    ? 'bg-[#C1622D]/[0.12] text-[#C1622D] animate-pulse'
                                    : p.status === 'Concluído & Faturado'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {p.status}
                              </span>
                              <span className="block text-[11px] font-mono font-bold text-slate-700 mt-1">
                                R$ {p.custoAcumulado.toFixed(2)}
                              </span>
                              <span className="text-[9px] text-slate-400 block">custo acumulado</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Coluna 2: Estação de Atendimento & Disparo n8n (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {(() => {
                  const currentPatient = patientQueue.find((p) => p.id === selectedPatientId) || patientQueue[0];
                  return (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                      {/* Topo do Paciente Ativo */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1622D] block">
                            Prontuário Aberto no OpenEMR • Consulta em Andamento
                          </span>
                          <h3 className="text-base font-bold text-[#1E3A5F]">{currentPatient.name}</h3>
                          <p className="text-xs text-slate-500">
                            {currentPatient.procedimento} • Chegada há 48 min na portaria
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Custo Door-to-Door</span>
                          <span className="text-xl font-mono font-extrabold text-[#C1622D]">
                            R$ {currentPatient.custoAcumulado.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Portaria + Triagem + Insumos</span>
                        </div>
                      </div>

                      {/* Botões de Ação da Esteira n8n */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Gatilhos da Esteira de Automação (OpenEMR &rarr; n8n)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Ação 1: Prescrição / Baixa FEFO */}
                          <button
                            onClick={() => handlePrescribeMedication(currentPatient.id)}
                            disabled={currentPatient.pago}
                            className="p-3.5 rounded-xl border border-[#C1622D]/20 bg-[#C1622D]/50 hover:bg-[#A8531F]/70 text-left transition-all group disabled:opacity-50"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <Package className="w-4 h-4 text-[#C1622D] group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold text-[#C1622D] bg-[#C1622D]/[0.12] px-1.5 py-0.5 rounded">
                                + R$ 42,50
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#1E3A5F] block">Prescrever Medicamento</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Baixa FEFO imediata no OpenBoxes via n8n
                            </span>
                          </button>

                          {/* Ação 2: Exame LIMS */}
                          <button
                            onClick={() => handleOrderLabExam(currentPatient.id)}
                            disabled={currentPatient.pago}
                            className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-left transition-all group disabled:opacity-50"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <FlaskConical className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-1.5 py-0.5 rounded">
                                + R$ 85,00
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#1E3A5F] block">Solicitar Exame LIMS</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Cria WorkOrder no SENAITE Laboratório via n8n
                            </span>
                          </button>

                          {/* Ação 3: Checkout & Split */}
                          <button
                            onClick={() => handleFinishConsultation(currentPatient.id)}
                            disabled={currentPatient.pago}
                            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition-all group disabled:opacity-50"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <CreditCard className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Split 85/15
                              </span>
                            </div>
                            <span className="text-xs font-bold text-[#1E3A5F] block">Finalizar &amp; Split</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Hyperswitch checkout + NFS-e Contábil
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Itens Acumulados no Prontuário */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                          Composição do Custo Door-to-Door do Paciente
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>1. Portaria &amp; Catraca (Check-in biométrico)</span>
                            <span className="font-mono font-semibold">R$ 10,00</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>2. Triagem de Manchester &amp; Acolhimento de Enfermagem</span>
                            <span className="font-mono font-semibold">R$ 25,00</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span>3. Honorários Consulta Cardiológica Especializada</span>
                            <span className="font-mono font-semibold">R$ 110,00</span>
                          </div>
                          {currentPatient.itensPrescritos.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[#C1622D] font-medium">
                              <span>+ Prescrição: {item}</span>
                              <span className="font-mono font-bold">R$ 42,50</span>
                            </div>
                          ))}
                          {currentPatient.examesSolicitados.map((exame, idx) => (
                            <div key={idx} className="flex items-center justify-between text-indigo-700 font-medium">
                              <span>+ LIMS: {exame}</span>
                              <span className="font-mono font-bold">R$ 85,00</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-[#1E3A5F]">
                            <span>Custo Total Acumulado Door-to-Door:</span>
                            <span className="font-mono text-sm text-[#C1622D]">
                              R$ {currentPatient.custoAcumulado.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Console de Telemetria n8n em Tempo Real */}
                <div className="bg-[#0F172A] text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-xl font-mono text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="font-bold text-slate-100 text-xs">Console de Webhooks n8n • Telemetria Hospitalar</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Latência Média: 18ms</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {n8nLogs.map((log) => (
                      <div key={log.id} className="p-2 rounded bg-slate-900/90 border border-slate-800/80 text-[11px]">
                        <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                          <span className="text-[#C1622D]/40 font-bold">{log.time}</span>
                          <span className="text-slate-300 font-semibold">{log.event}</span>
                          <span className="text-emerald-400 bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-800">
                            HTTP 200 OK
                          </span>
                        </div>
                        <div className="text-slate-300">
                          <span className="text-slate-500">Destino:</span> {log.target}
                        </div>
                        <div className="text-slate-400 text-[10px] truncate mt-0.5">
                          <span className="text-slate-500">Payload:</span> {log.payload}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      {/* =========================================================================
          MODAL 1: MARKETPLACE DE INSUMOS COLETIVO (35% OFF)
         ========================================================================= */}
      {showMarketplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0E9F6E] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-200" />
                  Marketplace Hospitalar Coletivo — Economia de Escala
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Compras consolidadas de todos os consultórios com até 40% de desconto em relação ao varejo
                </p>
              </div>
              <button
                onClick={() => setShowMarketplaceModal(false)}
                className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#F9FAFB] text-[#6B7280] text-[11px] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="p-3">Produto / Insumo</th>
                      <th className="p-3 text-center">Varejo</th>
                      <th className="p-3 text-center">Hub 360</th>
                      <th className="p-3 text-center">Economia</th>
                      <th className="p-3 text-center">Quantidade</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {marketItems.map((item) => {
                      const itemSubtotal = item.qty * item.hubPrice;
                      return (
                        <tr key={item.id} className="hover:bg-[#F9FAFB]">
                          <td className="p-3">
                            <span className="font-bold text-[#111928] block">{item.name}</span>
                            <span className="text-[10px] text-[#6B7280]">{item.category} • {item.unit}</span>
                          </td>
                          <td className="p-3 text-center line-through text-slate-400 font-mono">
                            R$ {item.regularPrice.toFixed(2)}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-[#0E9F6E]">
                            R$ {item.hubPrice.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              -{item.discount}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => updateItemQty(item.id, -1)}
                                className="px-2 py-1 hover:bg-slate-100 text-slate-600 font-bold"
                              >
                                -
                              </button>
                              <span className="px-3 font-mono font-bold text-xs">{item.qty}</span>
                              <button
                                onClick={() => updateItemQty(item.id, 1)}
                                className="px-2 py-1 hover:bg-slate-100 text-slate-600 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[#111928]">
                            R$ {itemSubtotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totalizador do Pedido */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 font-semibold block">
                    Economia Total Acumulada neste pedido:
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-700">
                    R$ {totalMarketplaceSavings.toFixed(2)} economizados
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-600 block">Total do Carrinho:</span>
                  <span className="text-2xl font-mono font-extrabold text-[#0E9F6E]">
                    R$ {totalMarketplaceCart.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Faturamento lançado no extrato condominial da Sala 204
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMarketplaceModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  disabled={totalMarketplaceCart === 0}
                  onClick={handleCheckoutMarketplace}
                  className="px-5 py-2 bg-[#0E9F6E] hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Concluir Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: SOLICITAR FACILITIES & HIGIENIZAÇÃO (SLA 8 MIN)
         ========================================================================= */}
      {showFacilitiesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#EA580C] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  Chamado de Facilities &amp; Governança
                </h3>
                <p className="text-xs text-orange-100 mt-0.5">
                  Atendimento sob demanda para a Sala 204 • SLA médio: 8 minutos
                </p>
              </div>
              <button
                onClick={() => setShowFacilitiesModal(false)}
                className="p-1 rounded-lg hover:bg-orange-700 text-orange-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#374151] block mb-1">Tipo de Serviço Necessário:</label>
                <select
                  value={facilityService}
                  onChange={(e) => setFacilityService(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none font-semibold text-[#111928]"
                >
                  <option value="Limpeza Concorrente Pós-Procedimento">Limpeza Concorrente Pós-Procedimento (10 min)</option>
                  <option value="Desinfecção Terminal com Lâmpada UV-C">Desinfecção Terminal com Lâmpada UV-C (25 min)</option>
                  <option value="Coleta de Resíduos Biológicos Infectantes">Coleta de Resíduos Biológicos Infectantes (Grupo A)</option>
                  <option value="Manutenção Biomédica / Calibração">Manutenção Biomédica / Apoio Técnico</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#374151] block mb-1">Nível de Urgência:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFacilityPriority('normal')}
                    className={`p-2.5 rounded-xl border text-center font-bold ${
                      facilityPriority === 'normal'
                        ? 'bg-blue-50 border-[#C1622D] text-[#C1622D]'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    Normal (Próxima Ronda)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFacilityPriority('urgent')}
                    className={`p-2.5 rounded-xl border text-center font-bold ${
                      facilityPriority === 'urgent'
                        ? 'bg-red-50 border-red-500 text-red-600'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    Urgente (SLA 8 minutos)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#374151] block mb-1">Observações Adicionais:</label>
                <textarea
                  rows={3}
                  value={facilityNotes}
                  onChange={(e) => setFacilityNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowFacilitiesModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendFacilitiesRequest}
                className="px-5 py-2 bg-[#EA580C] hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Despachar Chamado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: RESERVA DE BLOCO CIRÚRGICO / ÁREAS NOBRES
         ========================================================================= */}
      {showSurgicalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#7C3AED] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-200" />
                  Reserva de Áreas Nobres — Day Hospital
                </h3>
                <p className="text-xs text-purple-100 mt-0.5">
                  Centro cirúrgico inteligente com modelo pay-per-use
                </p>
              </div>
              <button
                onClick={() => setShowSurgicalModal(false)}
                className="p-1 rounded-lg hover:bg-purple-700 text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#374151] block mb-1">Sala Cirúrgica:</label>
                <select
                  value={surgicalRoom}
                  onChange={(e) => setSurgicalRoom(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none font-semibold text-[#111928]"
                >
                  <option value="Sala 01 - Laparoscopia & Vídeo">Sala 01 — Laparoscopia &amp; Vídeo HD (3º Andar)</option>
                  <option value="Sala 02 - Cirurgia Geral & Vascular">Sala 02 — Cirurgia Geral &amp; Vascular (3º Andar)</option>
                  <option value="Sala 03 - Hemodinâmica & Cateterismo">Sala 03 — Hemodinâmica &amp; Cateterismo (2º Andar)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#374151] block mb-1">Turno Desejado:</label>
                <select
                  value={surgicalShift}
                  onChange={(e) => setSurgicalShift(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl outline-none font-semibold text-[#111928]"
                >
                  <option value="Manhã (07:00 às 12:00)">Manhã (07:00 às 12:00) — R$ 2.250,00</option>
                  <option value="Tarde (13:00 às 18:00)">Tarde (13:00 às 18:00) — R$ 2.250,00</option>
                  <option value="Hora Avulsa (Horário Livre)">Hora Avulsa — R$ 450,00/hora</option>
                </select>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <label className="flex items-center gap-2 font-bold text-purple-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAnesthetist}
                    onChange={(e) => setIncludeAnesthetist(e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span>Incluir Equipe de Enfermagem e Anestesiologia de Plantão</span>
                </label>
                <p className="text-[11px] text-purple-700 mt-1 pl-5">
                  Suporte completo de instrumentação e sala de recuperação pós-anestésica (RPA).
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSurgicalModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleBookSurgical}
                className="px-5 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: CONFIRMAÇÃO & COMPROVANTE FINTECH 360
         ========================================================================= */}
      {showFintechModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#1E3A5F] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Contrato de Cessão de Crédito Fintech 360
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Liquidação Instantânea D+0 via PIX
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFintechModal(false);
                  setAdvanceSuccessReceipt(false);
                }}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {!advanceSuccessReceipt ? (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Valor Bruto Solicitado:</span>
                      <span className="font-mono font-bold text-[#111928]">
                        R$ {advanceAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Desconto Taxa Condomínio (1,19%):</span>
                      <span className="font-mono font-bold">
                        - R$ {advanceFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-emerald-700 pt-2 border-t border-blue-200">
                      <span>Valor Líquido Creditado:</span>
                      <span className="font-mono">
                        R$ {advanceNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Ao confirmar, você autoriza a cessão de recebíveis de faturamento médico com quitação direta pelos convênios na conta garantida do condomínio.
                  </p>
                </>
              ) : (
                /* Comprovante PIX Instantâneo */
                <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-sm text-emerald-900">
                    TRANSFERÊNCIA PIX LIQUIDADA!
                  </h4>
                  <p className="font-mono text-xl font-extrabold text-emerald-700">
                    R$ {advanceNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 border-t border-emerald-200 pt-2 text-left space-y-1">
                    <p><strong>Autenticação Bancária:</strong> BACEN-E18290-2026-F9812A</p>
                    <p><strong>Data/Hora:</strong> Hoje às 12:15:04 BRT</p>
                    <p><strong>Favorecido:</strong> CardioVida Serviços Médicos Ltda</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end gap-2">
              {!advanceSuccessReceipt ? (
                <>
                  <button
                    onClick={() => setShowFintechModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleExecuteAdvance}
                    className="px-5 py-2 bg-[#059669] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    Confirmar &amp; Receber Pix
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowFintechModal(false);
                    setAdvanceSuccessReceipt(false);
                  }}
                  className="px-5 py-2 bg-[#1E3A5F] text-white rounded-xl text-xs font-bold"
                >
                  Concluir
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: IA NO-SHOW — DISPARO WHATSAPP PREVENTIVO (RN16)
         ========================================================================= */}
      {showNoShowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E5E7EB] shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-[#C27803] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-200" />
                  Prevenção Ativa de No-Show (IA WhatsApp)
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  Disparo inteligente com reengajamento e vaga de encaixe automático
                </p>
              </div>
              <button
                onClick={() => setShowNoShowModal(false)}
                className="p-1 rounded-lg hover:bg-amber-800 text-amber-100 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <p className="font-bold text-[#78350F]">Paciente-Alvo: Paulo Henrique Rossi (Slot 16:00)</p>
                <p className="text-slate-600 text-[11px]">
                  Risco de No-Show: <strong>74%</strong> • Último contato respondido há 14 dias.
                </p>
              </div>

              <div>
                <label className="font-bold text-[#374151] block mb-1">Mensagem Gerada pela IA:</label>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-700 leading-relaxed">
                  "Olá Paulo! Confirmamos sua consulta hoje com o Dr. Ricardo às 16:00 na CardioVida (Sala 204). O estacionamento do Hub está liberado com manobrista cortesia. Por favor, responda 1 para CONFIRMAR ou 2 para REMARCAR."
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                <strong>Gatilho de Encaixe Automático:</strong> Se o paciente responder "2" ou não responder em 45 minutos, o slot é ofertado imediatamente para a lista de espera de 3 pacientes prioritários.
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNoShowModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowNoShowModal(false);
                  showToast('Mensagem de WhatsApp disparada via Evolution API com rastreamento ativo de leitura!');
                }}
                className="px-5 py-2 bg-[#C27803] hover:bg-[#A16207] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Disparar Mensagem Agora
              </button>
            </div>
          </div>
        </div>
      )}

        {/* ABA PERFIS & MATRIZ RBAC */}
        {activeTab === 'perfis' && (
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-xs animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Perfis de Acesso do Módulo Gestão Clínica & Prontuário Eletrônico (OpenEMR)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Privilégios de prescrição médica, evolução de enfermagem e auditoria de prontuário conforme normas CFM e LGPD.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="p-4 rounded-2xl border border-[#E0E0E0] bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#C1622D]/[0.08] text-[#C1622D] border border-[#C1622D]/20">
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
      </div>
    </>
  );
}
