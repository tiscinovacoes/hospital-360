'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserRole } from './UserContext';

export interface RoleThemeConfig {
  role: UserRole;
  title: string;
  subtitle: string;
  primaryColor: string;
  lightColor: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

export const roleThemes: Record<UserRole, RoleThemeConfig> = {
  admin: {
    role: 'admin',
    title: 'Administrador do Prédio',
    subtitle: 'Gestão predial, contratos e repasses',
    primaryColor: '#0A2540',
    lightColor: '#EBF0FB',
    accentColor: '#1A56DB',
    badgeBg: '#EBF0FB',
    badgeText: '#1A56DB',
  },
  medico: {
    role: 'medico',
    title: 'Prontuário Eletrônico (PEP)',
    subtitle: 'Consultas médicas, receitas e exames',
    primaryColor: '#059669',
    lightColor: '#D1FAE5',
    accentColor: '#0E9F6E',
    badgeBg: '#D1FAE5',
    badgeText: '#057A55',
  },
  laboratorio: {
    role: 'laboratorio',
    title: 'Laboratório & Imagem',
    subtitle: 'Laudos, análises clínicas e FHIR R4',
    primaryColor: '#7C3AED',
    lightColor: '#F5F3FF',
    accentColor: '#8B5CF6',
    badgeBg: '#F5F3FF',
    badgeText: '#6D28D9',
  },
  facilities: {
    role: 'facilities',
    title: 'Facilities & Higiene',
    subtitle: 'Limpeza concorrente/terminal e manutenção',
    primaryColor: '#EA580C',
    lightColor: '#FFEDD5',
    accentColor: '#F97316',
    badgeBg: '#FFEDD5',
    badgeText: '#C2410C',
  },
  recepcao: {
    role: 'recepcao',
    title: 'Totem & Recepção',
    subtitle: 'Triagem, senhas e autoatendimento touch',
    primaryColor: '#0EA5E9',
    lightColor: '#E0F2FE',
    accentColor: '#0284C7',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
  },
  internacao: {
    role: 'internacao',
    title: 'Internação & Enfermagem',
    subtitle: 'Mapa de leitos, turnover e medicação',
    primaryColor: '#14B8A6',
    lightColor: '#CCFBF1',
    accentColor: '#0D9488',
    badgeBg: '#CCFBF1',
    badgeText: '#0F766E',
  },
  'gestao-clinica': {
    role: 'gestao-clinica',
    title: 'Gestão de Clínica Autônoma',
    subtitle: 'Financeiro DRE, agenda preditiva e hub 360°',
    primaryColor: '#0891B2',
    lightColor: '#CFFAFE',
    accentColor: '#06B6D4',
    badgeBg: '#CFFAFE',
    badgeText: '#0E7490',
  },
  'dashboard-executivo': {
    role: 'dashboard-executivo',
    title: 'Dashboard Executivo 360°',
    subtitle: 'Visão macro estratégica e KPIs do negócio',
    primaryColor: '#0F766E',
    lightColor: '#CCFBF1',
    accentColor: '#115E59',
    badgeBg: '#E6FFFA',
    badgeText: '#0F766E',
  },
};

interface ThemeContextType {
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole | null) => void;
  getTheme: (role: UserRole) => RoleThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  const getTheme = (role: UserRole) => {
    return roleThemes[role] || roleThemes.admin;
  };

  return (
    <ThemeContext.Provider value={{ activeRole, setActiveRole, getTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
}
