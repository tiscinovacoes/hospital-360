'use client';

import React from 'react';
import { VigiaSidebarLayout } from '@/components/VigiaSidebarLayout';
import { usePageHeader } from '../contexts/PageHeaderContext';

/**
 * Casca persistente do hub Vigia Saúde 360.
 *
 * Agrupa todas as rotas de módulo (grupo de rotas `(modulos)`, sem efeito
 * na URL) sob um único `VigiaSidebarLayout`. Diferente do padrão anterior
 * — em que cada page.tsx chamava `<VigiaSidebarLayout>` diretamente —,
 * este layout é montado uma única vez pelo Next.js e permanece montado
 * ao navegar entre módulos: só o conteúdo interno (`children`) troca.
 *
 * O título/subtítulo/ações de cada página, que antes eram passados como
 * prop direta para o VigiaSidebarLayout, agora chegam via contexto
 * (`usePageHeader`), publicados pelo componente <PageHeader /> que cada
 * página renderiza. O moduloId (cor/tema) continua sendo resolvido
 * automaticamente pelo pathname dentro do próprio VigiaSidebarLayout.
 */
export default function ModulosLayout({ children }: { children: React.ReactNode }) {
  const { header } = usePageHeader();

  return (
    <VigiaSidebarLayout
      activeTitle={header.activeTitle}
      activeSubtitle={header.activeSubtitle}
      actions={header.actions}
    >
      {children}
    </VigiaSidebarLayout>
  );
}
