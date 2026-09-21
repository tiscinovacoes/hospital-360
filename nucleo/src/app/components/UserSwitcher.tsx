'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser, mockUsers } from '../contexts/UserContext';
import { ChevronDown, Check, UserCheck, ShieldCheck } from 'lucide-react';

export function UserSwitcher() {
  const { currentUser, switchUserById } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 bg-white border border-[#E5E7EB] hover:border-[#1A56DB] rounded-lg shadow-sm transition-all text-left group"
        title="Alternar perfil de demonstração"
      >
        <span className="text-xl select-none">{currentUser.avatar}</span>
        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#111928] group-hover:text-[#1A56DB] transition-colors">
              {currentUser.name}
            </span>
            {currentUser.isMaster && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF9C3] text-[#92400E] border border-[#FACA15]">
                MASTER
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6B7280] truncate max-w-[180px]">
            {currentUser.roleTitle}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#1A56DB]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-[#F3F4F6] mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              Simulação de Usuários (Demo)
            </p>
            <p className="text-[11px] text-[#9CA3AF]">
              Troque de perfil para testar as permissões em tempo real
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {mockUsers.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUserById(user.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-[#EBF0FB] text-[#1A56DB]'
                      : 'hover:bg-[#F9FAFB] text-[#111928]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl flex-shrink-0">{user.avatar}</span>
                    <div className="truncate">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold truncate">
                          {user.name}
                        </span>
                        {user.isMaster && (
                          <span className="text-[9px] font-bold px-1 rounded bg-[#FEF9C3] text-[#92400E]">
                            MASTER
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B7280] truncate">
                        {user.roleTitle}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#1A56DB] flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3 pt-2 pb-1 border-t border-[#F3F4F6] mt-1 text-[11px] text-[#6B7280] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0E9F6E]" />
            <span>Permissões validadas via <code>UserContext</code></span>
          </div>
        </div>
      )}
    </div>
  );
}
