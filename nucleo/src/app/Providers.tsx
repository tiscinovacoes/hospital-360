'use client';

import React from 'react';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <NotificationProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </NotificationProvider>
    </UserProvider>
  );
}
