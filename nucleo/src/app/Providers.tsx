'use client';

import React from 'react';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PageHeaderProvider } from './contexts/PageHeaderContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <NotificationProvider>
        <ThemeProvider>
          <PageHeaderProvider>
            {children}
          </PageHeaderProvider>
        </ThemeProvider>
      </NotificationProvider>
    </UserProvider>
  );
}
