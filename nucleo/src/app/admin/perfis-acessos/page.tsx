'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { VigiaSidebarLayout } from '../../../components/VigiaSidebarLayout';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Users,
  Search,
  Filter,
  Check,
  CheckCircle2,
  FileBadge,
  Sliders,
  Sparkles,
  Download,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { 
  ModuloId, 
  ModuloRole, 
  PermissionAction, 
  RoleLevel, 
  MODULO_ROLES_CATALOG,
  hasPermission 
} from '@/types/rbac';

const ALL_ACTIONS: { id: PermissionAction; label: string; desc: string }[] = [
  { id: 'READ', label: 'Consultar', desc: 'Leitura de dados e prontuários' },
  { id: 'CREATE', label: 'Criar', desc: 'Emissão de pedidos, cadastros e requisições' },
  { id: 'UPDATE', label: 'Editar', desc: 'Modificação de registros e parâmetros' },
  { id: 'DELETE', label: 'Excluir', desc: 'Cancelamentos e anulações de registros' },
  { id: 'APPROVE', label: 'Aprovar', desc: 'Homologação técnica, laudos ou despesas' },
  { id: 'AUDIT', label: 'Auditoria', desc: 'Acesso a trilhas de log e conformidade' },
  { id: 'EXPORT', label: 'Exportar', desc: 'Download de relatórios oficiais' },
];

const MODULOS_INFO: { id: ModuloId; name: string; color: string; bg: string }[] = [
  { id: 'compras-publicas', name: '1. Compras Públicas & Atas', color: '#1A56DB', bg: 'bg-blue-50' },
  { id: 'estoque-central', name: '2. Estoque Central & Almoxarifado', color: '#D97706', bg: 'bg-amber-50' },
  { id: 'escala-medica', name: '3. Escala Médica & Plantões', color: '#4F46E5', bg: 'bg-indigo-50' },
  { id: 'farmacia-estoque', name: '4. Farmácia Hospitalar & FEFO', color: '#0E9F6E', bg: 'bg-emerald-50' },
  { id: 'gestao-clinica', name: '5. Gestão Clínica & Prontuário PEP', color: '#0891B2', bg: 'bg-cyan-50' },
  { id: 'laboratorio', name: '6. Laboratório Clínico & LIS', color: '#0D9488', bg: 'bg-teal-50' },
  { id: 'leitos-censo', name: '7. Censo & Gestão de Leitos', color: '#0284C7', bg: 'bg-sky-50' },
  { id: 'financeiro-split', name: '8. Financeiro & Split SUS', color: '#16A34A', bg: 'bg-green-50' },
  { id: 'automacao-mensageria', name: '9. Automação & Mensageria WhatsApp', color: '#059669', bg: 'bg-emerald-50' },
  { id: 'ingestao-modulos', name: '10. Ingestão & ETL de Sistemas', color: '#EA580C', bg: 'bg-orange-50' },
  { id: 'arquitetura-seguranca', name: '11. Governança, Arquitetura & CISO', color: '#7C3AED', bg: 'bg-violet-50' },
  { id: 'dashboard-executivo', name: '12. Dashboard Executivo 360°', color: '#2563EB', bg: 'bg-blue-50' },
];

export default function CentralPerfisAcessosPage() {
  const [moduloFiltro, setModuloFiltro] = useState<string>('TODOS');
  const [nivelFiltro, setNivelFiltro] = useState<string>('TODOS');
  const [busca, setBusca] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Coleta todos os papéis de todos os módulos
  const todosOsPapeis = Object.entries(MODULO_ROLES_CATALOG).flatMap(([modId, roles]) => 
    roles.map(r => ({
      ...r,
      moduloId: modId as ModuloId,
      moduloNome: MODULOS_INFO.find(m => m.id === modId)?.name || modId,
      moduloColor: MODULOS_INFO.find(m => m.id === modId)?.color || '#1A56DB',
      moduloBg: MODULOS_INFO.find(m => m.id === modId)?.bg || 'bg-blue-50',
    }))
  );

  const papeisFiltrados = todosOsPapeis.filter(role => {
    const matchModulo = moduloFiltro === 'TODOS' || role.moduloId === moduloFiltro;
    const matchNivel = nivelFiltro === 'TODOS' || role.level === nivelFiltro;
    const matchBusca = 
      role.name.toLowerCase().includes(busca.toLowerCase()) ||
      role.description.toLowerCase().includes(busca.toLowerCase()) ||
      role.responsavelPadrao.toLowerCase().includes(busca.toLowerCase());
    return matchModulo && matchNivel && matchBusca;
  });

  return (
    <VigiaSidebarLayout
      moduloId="arquitetura-seguranca"
      activeTitle="Matriz Geral de Perfis & Controle de Acesso (RBAC 360°)"
      activeSubtitle="Governança de privilégios hospitalares em todos os 13 módulos conforme ISO 27001, CFM e LGPD"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 border border-[#E0E0E0] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Admin</span>
          </Link>

          <button
            type="button"
            onClick={() => triggerToast('Matriz Geral de Acessos exportada em planilha auditada para o comitê de compliance.')}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Matriz RBAC</span>
          </button>
        </div>
      }
    >
      {/* Toast Feedback */}
      {toast && (
        <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-950 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span className="font-bold">{toast}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToast(null)}
            className="text-blue-700 hover:text-blue-900 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BANNER INSTITUCIONAL */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] p-5 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-50 text-violet-700 border border-violet-200">
              Segregação de Funções (SoD)
            </span>
            <span className="text-xs text-slate-500 font-medium">Controle de Privilégio Mínimo</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Painel Centralizado de Papéis e Permissões do Hospital 360
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Cada ação clínica, dispensação de fármaco, liberação de pagamento e emissão de laudo é rigorosamente amarrada ao perfil do profissional com rastreabilidade legal imutável.
          </p>
        </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] p-4 mb-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Seletor Módulo */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600">Módulo:</span>
            <select
              value={moduloFiltro}
              onChange={e => setModuloFiltro(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none min-h-[44px]"
            >
              <option value="TODOS">Todos os Módulos (12)</option>
              {MODULOS_INFO.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Seletor Nível */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-600">Nível:</span>
            <select
              value={nivelFiltro}
              onChange={e => setNivelFiltro(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none min-h-[44px]"
            >
              <option value="TODOS">Todos os Níveis</option>
              <option value="operacional">Operacional</option>
              <option value="supervisao">Supervisão</option>
              <option value="diretoria">Diretoria</option>
              <option value="auditoria">Auditoria</option>
            </select>
          </div>
        </div>

        {/* Input Busca */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por papel, descrição ou responsável..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E0E0E0] rounded-xl text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* TABELA DA MATRIZ GERAL RBAC */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="p-3.5">Módulo Hospitalar</th>
                <th className="p-3.5">Perfil de Acesso &amp; Responsável</th>
                <th className="p-3.5 text-center">Nível</th>
                {ALL_ACTIONS.map(a => (
                  <th key={a.id} className="p-3.5 text-center" title={a.desc}>
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {papeisFiltrados.map((role) => (
                <tr key={`${role.moduloId}-${role.id}`} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3.5">
                    <span 
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block"
                      style={{ 
                        backgroundColor: `${role.moduloColor}12`, 
                        color: role.moduloColor,
                        borderColor: `${role.moduloColor}35`
                      }}
                    >
                      {role.moduloNome}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <strong className="text-sm text-slate-900 block">{role.name}</strong>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{role.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Responsável Padrão: <strong>{role.responsavelPadrao}</strong>
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      role.level === 'diretoria'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : role.level === 'supervisao'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : role.level === 'auditoria'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {role.level}
                    </span>
                  </td>

                  {ALL_ACTIONS.map(action => {
                    const granted = role.permissions.includes(action.id);
                    return (
                      <td key={action.id} className="p-3.5 text-center">
                        {granted ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-300 border border-slate-200">
                            <Lock className="w-3 h-3" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </VigiaSidebarLayout>
  );
}
