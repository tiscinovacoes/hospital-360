'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../components/VigiaSidebarLayout';
import { KpiCard } from '../../components/KpiCard';
import {
  Pill,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  BarChart3,
  RefreshCw,
  QrCode,
  DollarSign
} from 'lucide-react';

interface MedicineLot {
  id: string;
  code: string;
  name: string;
  dosage: string;
  category: 'Antibiótico' | 'Analgésico' | 'Cardiológico' | 'Insumo Cirúrgico' | 'Oncológico';
  currentStock: number;
  unit: string;
  lotNumber: string;
  expiryDate: string; // YYYY-MM-DD
  daysToExpiry: number;
  unitCost: number;
  cmedCeilingPrice: number;
  storageLocation: string;
  status: 'Prioritário FEFO' | 'Estável' | 'Atenção' | 'Crítico';
}

const mockLots: MedicineLot[] = [
  {
    id: 'lot-001',
    code: 'MED-AMX-500',
    name: 'Amoxicilina + Clavulanato',
    dosage: '500mg/125mg Frasco',
    category: 'Antibiótico',
    currentStock: 140,
    unit: 'Frasco',
    lotNumber: 'LT-2026-09A',
    expiryDate: '2026-10-15',
    daysToExpiry: 24,
    unitCost: 18.50,
    cmedCeilingPrice: 32.40,
    storageLocation: 'Almoxarifado Central - Prateleira A-04',
    status: 'Prioritário FEFO',
  },
  {
    id: 'lot-002',
    code: 'MED-DIP-500',
    name: 'Dipirona Sódica Injetável',
    dosage: '500mg/mL Ampola 2mL',
    category: 'Analgésico',
    currentStock: 850,
    unit: 'Ampola',
    lotNumber: 'LT-2026-11B',
    expiryDate: '2026-11-30',
    daysToExpiry: 70,
    unitCost: 1.80,
    cmedCeilingPrice: 3.20,
    storageLocation: 'Farmácia Satélite - Gaveteiro 02',
    status: 'Estável',
  },
  {
    id: 'lot-003',
    code: 'MED-ENO-040',
    name: 'Enoxaparina Sódica',
    dosage: '40mg/0.4mL Seringa',
    category: 'Cardiológico',
    currentStock: 65,
    unit: 'Seringa Preenchida',
    lotNumber: 'LT-2026-10X',
    expiryDate: '2026-10-05',
    daysToExpiry: 14,
    unitCost: 28.90,
    cmedCeilingPrice: 48.00,
    storageLocation: 'Câmara Fria 02 (2°C a 8°C)',
    status: 'Crítico',
  },
  {
    id: 'lot-004',
    code: 'INS-SER-020',
    name: 'Seringa Descartável Luer Lock',
    dosage: '20mL Estéril c/ Agulha',
    category: 'Insumo Cirúrgico',
    currentStock: 1200,
    unit: 'Unidade',
    lotNumber: 'LT-2027-01S',
    expiryDate: '2027-05-20',
    daysToExpiry: 241,
    unitCost: 0.95,
    cmedCeilingPrice: 1.60,
    storageLocation: 'Almoxarifado Central - Corredor B',
    status: 'Estável',
  },
  {
    id: 'lot-005',
    code: 'MED-TRA-050',
    name: 'Cloridrato de Tramadol',
    dosage: '50mg/mL Ampola',
    category: 'Analgésico',
    currentStock: 90,
    unit: 'Ampola',
    lotNumber: 'LT-2026-10T',
    expiryDate: '2026-10-22',
    daysToExpiry: 31,
    unitCost: 6.20,
    cmedCeilingPrice: 11.50,
    storageLocation: 'Armário Seguro Psicotrópicos',
    status: 'Prioritário FEFO',
  },
];

export default function FarmaciaEstoquePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [selectedLot, setSelectedLot] = useState<MedicineLot | null>(mockLots[0]);
  const [dispensationSuccess, setDispensationSuccess] = useState<string | null>(null);

  const filteredLots = mockLots.filter((lot) => {
    const matchesSearch =
      lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'Todos' || lot.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSimulateFefoDispensation = (lot: MedicineLot) => {
    setDispensationSuccess(`Baixa FEFO realizada com sucesso! Lote ${lot.lotNumber} dispensado via n8n. Custo unitário de R$ ${lot.unitCost.toFixed(2)} lançado no prontuário do paciente.`);
    setTimeout(() => setDispensationSuccess(null), 5000);
  };

  return (
    <VigiaSidebarLayout
      activeTitle="Farmácia Hospitalar & Estoque Inteligente (FEFO)"
      activeSubtitle="Dispensação beira-leito com rastreabilidade por lote e integração de custos"
      actions={
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hub Central</span>
          </Link>
          <button
            onClick={() => handleSimulateFefoDispensation(selectedLot || mockLots[0])}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#1A56DB] hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Simular Baixa FEFO</span>
          </button>
        </div>
      }
    >
      {/* Feedback de Notificação */}
      {dispensationSuccess && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-slate-800 text-sm font-medium animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#1A56DB] flex-shrink-0" />
          <span>{dispensationSuccess}</span>
        </div>
      )}

      {/* Cards de Métricas Padronizados (Máximo 3 linhas + Tooltip informativo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Itens em Estoque"
          value="2.345"
          subtitle="Catalogados OpenBoxes"
          icon={Package}
          tooltipInfo="Quantidade total de códigos farmacêuticos e insumos hospitalares ativos com controle de lote e rastreamento atômico."
          trend={{ text: "100% Rastreáveis", isPositive: true }}
        />

        <KpiCard
          title="Alerta Crítico (< 30d)"
          value="3 Lotes"
          subtitle="Prioridade Máxima"
          icon={ShieldAlert}
          tooltipInfo="Medicamentos com prazo de validade inferior a 30 dias que devem ser consumidos prioritariamente pelo critério FEFO para evitar perdas."
          trend={{ text: "Ação de Consumo", isAlert: true }}
        />

        <KpiCard
          title="Economia FEFO Apurada"
          value="R$ 14.820"
          subtitle="Desperdício Evitado"
          icon={TrendingDown}
          tooltipInfo="Economia financeira acumulada obtida pela priorização sistemática de lotes com vencimento mais próximo em relação ao consumo aleatório."
          trend={{ text: "Zero Perdas por Validade", isPositive: true }}
        />

        <KpiCard
          title="Auditoria Teto CMED"
          value="100%"
          subtitle="Conformidade de Preço"
          icon={DollarSign}
          tooltipInfo="Índice de conformidade das aquisições frente à tabela regulatória de preços-teto da Câmara de Regulação do Mercado de Medicamentos (CMED)."
          trend={{ text: "Dentro do Teto Legal", isPositive: true }}
        />
      </div>

      {/* Conteúdo Principal: Tabela de Lotes FEFO e Detalhe Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Lotes com Filtros */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar medicamento, lote ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1A56DB]"
              >
                <option value="Todos">Todas as Categorias</option>
                <option value="Antibiótico">Antibiótico</option>
                <option value="Analgésico">Analgésico</option>
                <option value="Cardiológico">Cardiológico</option>
                <option value="Insumo Cirúrgico">Insumo Cirúrgico</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Medicamento / Insumo</th>
                  <th className="px-4 py-3">Lote</th>
                  <th className="px-4 py-3">Validade (FEFO)</th>
                  <th className="px-4 py-3">Saldo</th>
                  <th className="px-4 py-3">Custo Un.</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLots.map((lot) => {
                  const isSelected = selectedLot?.id === lot.id;
                  return (
                    <tr
                      key={lot.id}
                      onClick={() => setSelectedLot(lot)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{lot.name}</div>
                        <div className="text-[11px] text-slate-500">{lot.dosage}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {lot.lotNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {lot.daysToExpiry <= 15 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              {lot.daysToExpiry} dias (Crítico)
                            </span>
                          ) : lot.daysToExpiry <= 35 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              {lot.daysToExpiry} dias (Prioritário)
                            </span>
                          ) : (
                            <span className="text-slate-600">
                              {lot.daysToExpiry} dias
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        {lot.currentStock} {lot.unit}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        R$ {lot.unitCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulateFefoDispensation(lot);
                          }}
                          className="text-xs font-bold text-[#1A56DB] hover:text-blue-800 hover:underline"
                        >
                          Dispensar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Painel Lateral: Detalhes do Lote Selecionado & Algoritmo FEFO */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between">
          {selectedLot ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detalhes do Lote
                </span>
                <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedLot.code}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900">{selectedLot.name}</h3>
              <p className="text-xs text-slate-500 mb-5">{selectedLot.dosage}</p>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Número do Lote</span>
                  <span className="font-bold text-slate-800">{selectedLot.lotNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Data de Validade</span>
                  <span className="font-bold text-rose-600">{selectedLot.expiryDate}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Localização Física</span>
                  <span className="font-medium text-slate-700 text-right">{selectedLot.storageLocation}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Preço Unitário de Custo</span>
                  <span className="font-bold text-slate-900">R$ {selectedLot.unitCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Preço Teto CMED</span>
                  <span className="font-bold text-slate-700">R$ {selectedLot.cmedCeilingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Margem sob o Teto</span>
                  <span className="font-bold text-emerald-600">
                    -{Math.round((1 - selectedLot.unitCost / selectedLot.cmedCeilingPrice) * 100)}% mais barato
                  </span>
                </div>
              </div>

              <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#1A56DB]" />
                  Regra FEFO Ativa:
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Quando o médico prescrever este medicamento no OpenEMR, o robô do n8n selecionará automaticamente este lote por ser o de vencimento mais próximo, debitando do estoque e repassando o custo exato para a conta do paciente.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Selecione um lote ao lado para ver os detalhes
            </div>
          )}

          <button
            onClick={() => selectedLot && handleSimulateFefoDispensation(selectedLot)}
            className="mt-6 w-full py-2.5 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Dispensar Este Lote para Paciente
          </button>
        </div>
      </div>
    </VigiaSidebarLayout>
  );
}
