'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from './UserContext';

export interface NotificationToast {
  id: string;
  module: UserRole;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

interface NotificationContextType {
  counts: Record<UserRole, number>;
  getUrgentCount: (role: UserRole) => number;
  recentToasts: NotificationToast[];
  dismissToast: (id: string) => void;
  incrementCount: (role: UserRole) => void;
  decrementCount: (role: UserRole) => void;
}

const initialCounts: Record<UserRole, number> = {
  admin: 2,
  medico: 4,
  laboratorio: 3,
  facilities: 5,
  recepcao: 7,
  internacao: 2,
  'gestao-clinica': 3,
  'dashboard-executivo': 4,
};

const initialToasts: NotificationToast[] = [
  {
    id: 't-1',
    module: 'facilities',
    title: 'Higienização Solicitada',
    message: 'Leito 12 - Alta realizada. Tipo: Limpeza Terminal.',
    time: 'Agora',
    type: 'warning',
  },
  {
    id: 't-2',
    module: 'medico',
    title: 'Laudo Disponível no Hub',
    message: 'Hemograma completo da paciente Ana Carolina liberado pelo laboratório.',
    time: 'Há 2 min',
    type: 'success',
  },
  {
    id: 't-3',
    module: 'recepcao',
    title: 'Check-in no Totem',
    message: 'Paciente Carlos Eduardo retirou senha A248 para Cardiologia.',
    time: 'Há 4 min',
    type: 'info',
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<Record<UserRole, number>>(initialCounts);
  const [recentToasts, setRecentToasts] = useState<NotificationToast[]>(initialToasts);

  // Simulação em tempo real (oscilação a cada 8 segundos para facilities)
  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => {
        const isIncrement = Math.random() < 0.7;
        const currentFacilities = prev.facilities;
        const nextVal = isIncrement
          ? currentFacilities + 1
          : Math.max(1, currentFacilities - 1);

        return {
          ...prev,
          facilities: nextVal,
        };
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getUrgentCount = (role: UserRole): number => {
    const total = counts[role] || 0;
    switch (role) {
      case 'facilities':
        return Math.ceil(total * 0.6);
      case 'medico':
      case 'internacao':
        return Math.ceil(total * 0.5);
      case 'dashboard-executivo':
      case 'admin':
        return Math.ceil(total * 0.4);
      default:
        return Math.ceil(total * 0.3);
    }
  };

  const dismissToast = (id: string) => {
    setRecentToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const incrementCount = (role: UserRole) => {
    setCounts((prev) => ({ ...prev, [role]: (prev[role] || 0) + 1 }));
  };

  const decrementCount = (role: UserRole) => {
    setCounts((prev) => ({ ...prev, [role]: Math.max(0, (prev[role] || 0) - 1) }));
  };

  return (
    <NotificationContext.Provider
      value={{
        counts,
        getUrgentCount,
        recentToasts,
        dismissToast,
        incrementCount,
        decrementCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser utilizado dentro de um NotificationProvider');
  }
  return context;
}
