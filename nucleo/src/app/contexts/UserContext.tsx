'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole =
  | 'admin'
  | 'medico'
  | 'laboratorio'
  | 'facilities'
  | 'recepcao'
  | 'internacao'
  | 'gestao-clinica'
  | 'dashboard-executivo';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roleTitle: string;
  isMaster?: boolean;
  allowedRoles: UserRole[];
}

export const mockUsers: User[] = [
  {
    id: 'master',
    name: 'Dr. Roberto Silveira',
    email: 'roberto.silveira@hospital360.com.br',
    avatar: '👨‍⚕️',
    roleTitle: 'Diretor Geral & Gestor Master',
    isMaster: true,
    allowedRoles: [
      'admin',
      'medico',
      'laboratorio',
      'facilities',
      'recepcao',
      'internacao',
      'gestao-clinica',
      'dashboard-executivo',
    ],
  },
  {
    id: 'medico',
    name: 'Dr. Ricardo Mendes',
    email: 'ricardo.mendes@hospital360.com.br',
    avatar: '🩺',
    roleTitle: 'Médico Cardiologista (Sala 204)',
    isMaster: false,
    allowedRoles: ['medico', 'gestao-clinica'],
  },
  {
    id: 'facilities',
    name: 'Carlos Oliveira',
    email: 'carlos.facilities@hospital360.com.br',
    avatar: '🧹',
    roleTitle: 'Supervisor de Facilities & Higiene',
    isMaster: false,
    allowedRoles: ['facilities'],
  },
  {
    id: 'recepcao',
    name: 'Mariana Santos',
    email: 'mariana.recepcao@hospital360.com.br',
    avatar: '👩‍💼',
    roleTitle: 'Atendente de Recepção & Triagem',
    isMaster: false,
    allowedRoles: ['recepcao'],
  },
  {
    id: 'admin',
    name: 'Fernanda Costa',
    email: 'fernanda.admin@hospital360.com.br',
    avatar: '🏢',
    roleTitle: 'Administradora do Prédio',
    isMaster: false,
    allowedRoles: ['admin', 'dashboard-executivo'],
  },
];

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  hasAccess: (role: UserRole) => boolean;
  switchUserById: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);

  const hasAccess = (role: UserRole): boolean => {
    if (currentUser.isMaster) return true;
    return currentUser.allowedRoles.includes(role);
  };

  const switchUserById = (id: string) => {
    const found = mockUsers.find((u) => u.id === id);
    if (found) {
      setCurrentUser(found);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, hasAccess, switchUserById }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser utilizado dentro de um UserProvider');
  }
  return context;
}
