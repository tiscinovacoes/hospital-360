'use client';

import React, { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div role="tablist" className={cn('flex items-center gap-5 overflow-x-auto border-b border-[rgba(27,31,28,.12)]', className)}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger deve estar dentro de <Tabs>');
  const ativo = ctx.value === value;

  return (
    <button
      role="tab"
      aria-selected={ativo}
      onClick={() => ctx.onChange(value)}
      className={cn(
        'pb-3 min-h-[44px] text-xs font-bold whitespace-nowrap border-b-2 -mb-px flex-shrink-0 transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-[#0E5C4C] focus-visible:ring-offset-2 rounded-t',
        ativo ? 'border-[#0E5C4C] text-[#1B1F1C]' : 'border-transparent text-[rgba(27,31,28,.45)] hover:text-[rgba(27,31,28,.7)]',
        className
      )}
    >
      {children}
    </button>
  );
}
