'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface PageHeaderConfig {
  activeTitle?: string;
  activeSubtitle?: string;
  actions?: ReactNode;
}

interface PageHeaderContextType {
  header: PageHeaderConfig;
  setHeader: (config: PageHeaderConfig) => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(undefined);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [header, setHeaderState] = useState<PageHeaderConfig>({});

  // Identidade estável: evita recriar a função a cada render do provider.
  const setHeader = useCallback((config: PageHeaderConfig) => {
    setHeaderState(config);
  }, []);

  return (
    <PageHeaderContext.Provider value={{ header, setHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader(): PageHeaderContextType {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error('usePageHeader deve ser utilizado dentro de um PageHeaderProvider');
  }
  return context;
}
