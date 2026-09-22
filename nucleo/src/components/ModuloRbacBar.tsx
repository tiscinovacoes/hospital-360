'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  Check, 
  Lock, 
  Info, 
  X,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { ModuloId, ModuloRole, PermissionAction, getRolesForModulo } from '@/types/rbac';

interface ModuloRbacBarProps {
  moduloId: ModuloId;
  activeRole: ModuloRole;
  onRoleChange: (role: ModuloRole) => void;
  accentColor?: string;
  lightBg?: string;
  lightBorder?: string;
}

const ALL_ACTIONS: { id: PermissionAction; label: string; description: string }[] = [
  { id: 'READ', label: 'Consultar', description: 'Visualização de relatórios, dados e prontuários' },
  { id: 'CREATE', label: 'Lançar / Criar', description: 'Geração de pedidos, dispensações e cadastros' },
  { id: 'UPDATE', label: 'Editar', description: 'Modificação de parâmetros e registros' },
  { id: 'DELETE', label: 'Excluir / Anular', description: 'Cancelamentos e exclusões com trilha de auditoria' },
  { id: 'APPROVE', label: 'Aprovar / Assinar', description: 'Aprovação técnica, liberação de despesa ou laudo' },
  { id: 'AUDIT', label: 'Auditoria & Logs', description: 'Acesso a trilhas imutáveis e conformidade regulatória' },
  { id: 'EXPORT', label: 'Exportar Dados', description: 'Download de relatórios, planilhas e demonstrativos' },
];

export function ModuloRbacBar({
  moduloId,
  activeRole,
  onRoleChange,
  accentColor = '#1A56DB',
  lightBg = 'bg-blue-50',
  lightBorder = 'border-blue-200',
}: ModuloRbacBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [matrixModalOpen, setMatrixModalOpen] = useState(false);
  const roles = getRolesForModulo(moduloId);

  return (
    <>
      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-3 md:p-4 mb-6 shadow-xs transition-all">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          
          {/* Perfil Ativo e Seletor */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
              style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40` }}
            >
              <ShieldCheck className="w-5 h-5" style={{ color: accentColor }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Perfil de Acesso (RBAC)
                </span>
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  style={{ 
                    backgroundColor: `${accentColor}12`, 
                    color: accentColor, 
                    borderColor: `${accentColor}30` 
                  }}
                >
                  {activeRole.level}
                </span>
              </div>

              {/* Dropdown de Troca de Papel */}
              <div className="relative mt-0.5">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-left font-bold text-slate-900 hover:text-slate-700 transition-colors py-1 min-h-[44px] md:min-h-0 touch-manipulation"
                >
                  <span className="text-sm md:text-base truncate max-w-[240px] md:max-w-[340px]">
                    {activeRole.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-80 md:w-96 bg-white border border-[#E0E0E0] rounded-2xl shadow-xl z-50 p-2 divide-y divide-slate-100">
                    <div className="p-2">
                      <span className="text-xs font-semibold text-slate-500 block mb-1">
                        Alternar Perfil Operacional para Teste:
                      </span>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Simule a interface com as restrições e permissões de cada função no hospital.
                      </p>
                    </div>

                    <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
                      {roles.map((role) => {
                        const isCurrent = role.id === activeRole.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => {
                              onRoleChange(role);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 min-h-[44px] ${
                              isCurrent 
                                ? 'bg-slate-50 border border-slate-200' 
                                : 'hover:bg-slate-50/80 border border-transparent'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${isCurrent ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {role.name}
                                </span>
                                {isCurrent && (
                                  <Check className="w-3.5 h-3.5" style={{ color: accentColor }} />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {role.description}
                              </p>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                {role.responsavelPadrao}
                              </span>
                            </div>
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                              {role.level}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Permissões Ativas e Botão Matriz */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 max-w-full">
              {ALL_ACTIONS.map((action) => {
                const granted = activeRole.permissions.includes(action.id);
                return (
                  <span
                    key={action.id}
                    title={action.description}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                      granted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200 line-through opacity-70'
                    }`}
                  >
                    {granted ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                    )}
                    {action.label}
                  </span>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setMatrixModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all min-h-[44px] md:min-h-0 shrink-0 touch-manipulation"
            >
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Ver Matriz</span>
            </button>
          </div>
        </div>

        {/* Responsável atual da simulação */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Sessão Simulada: <strong>{activeRole.responsavelPadrao}</strong></span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span>Rastreabilidade ativa de ações (TCU / ANVISA / LGPD)</span>
          </div>
        </div>
      </div>

      {/* Modal Matriz de Acessos */}
      {matrixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/25 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center border"
                  style={{ backgroundColor: `${accentColor}15`, borderColor: `${accentColor}40` }}
                >
                  <ShieldCheck className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Matriz de Perfis e Permissões do Módulo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Controle de Acesso Baseado em Papéis (RBAC - ISO 27001 / CFM / ANVISA)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMatrixModalOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {roles.map((role) => (
                <div 
                  key={role.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    role.id === activeRole.id 
                      ? 'bg-blue-50/40 border-blue-200' 
                      : 'bg-white border-[#E0E0E0]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{role.name}</h4>
                      {role.id === activeRole.id && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-600 text-white">
                          Ativo Agora
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {role.level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3">{role.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-slate-100">
                    {ALL_ACTIONS.map((action) => {
                      const granted = role.permissions.includes(action.id);
                      return (
                        <div 
                          key={action.id} 
                          className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg border ${
                            granted 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium' 
                              : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                          }`}
                        >
                          {granted ? (
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          ) : (
                            <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{action.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setMatrixModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors min-h-[44px]"
              >
                Fechar Matriz
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
