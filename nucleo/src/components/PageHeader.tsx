'use client';

import { useEffect } from 'react';
import { usePageHeader, PageHeaderConfig } from '@/app/contexts/PageHeaderContext';

/**
 * Registra o título, subtítulo e ações do topo da página no VigiaSidebarLayout
 * persistente (montado uma única vez em `(modulos)/layout.tsx`).
 *
 * Substitui o antigo padrão de envolver a página inteira em
 * `<VigiaSidebarLayout activeTitle=... activeSubtitle=... actions={...}>`,
 * que forçava o header/sidebar a serem desmontados e remontados a cada
 * navegação entre módulos. Este componente não renderiza nada visível —
 * apenas "publica" a configuração do cabeçalho da página atual via contexto.
 */
export function PageHeader(config: PageHeaderConfig) {
  const { setHeader } = usePageHeader();

  // Sincroniza a cada render da página (título/ações podem depender de estado local).
  useEffect(() => {
    setHeader(config);
  });

  // Limpa o cabeçalho ao desmontar, para não vazar título/ações de uma
  // página para a próxima durante a transição de rota.
  useEffect(() => {
    return () => setHeader({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
