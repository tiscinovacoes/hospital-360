'use client';

import React from 'react';
import {
  Ambulance,
  BedDouble,
  Boxes,
  CreditCard,
  FileSpreadsheet,
  FlaskConical,
  LayoutDashboard,
  MessageSquare,
  Pill,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  UserCheck,
  UserCog,
  ConciergeBell,
  HeartPulse,
  ClipboardCheck,
  Sparkles,
  Users,
  Network,
  Activity,
  Calculator,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIA_COR, MODULO_THEMES, ModuloCategoria, ModuloId } from './ModuloLayoutShell';

/** Todo módulo com logo própria: os do tema + a administração de perfis. */
export type ModuloLogoId = ModuloId | 'admin-perfis' | TelaForaDoTemaId;

/** Estações door-to-door e telas do núcleo que vivem fora de (modulos)/. */
export type TelaForaDoTemaId =
  | 'recepcao'
  | 'medico'
  | 'internacao'
  | 'tarefas'
  | 'facilities'
  | 'pacientes'
  | 'centros-custo'
  | 'atividades'
  | 'rateio'
  | 'relatorios';

const CATEGORIA_FORA_DO_TEMA: Record<'admin-perfis' | TelaForaDoTemaId, ModuloCategoria> = {
  'admin-perfis': 'FINANCEIRO',
  recepcao: 'ASSISTENCIAL',
  medico: 'ASSISTENCIAL',
  internacao: 'ASSISTENCIAL',
  tarefas: 'OPERACAO',
  facilities: 'OPERACAO',
  pacientes: 'FINANCEIRO',
  'centros-custo': 'FINANCEIRO',
  atividades: 'FINANCEIRO',
  rateio: 'FINANCEIRO',
  relatorios: 'FINANCEIRO',
};

type Icone = React.ComponentType<{ className?: string; strokeWidth?: number }>;

/**
 * Registro único módulo → símbolo da logo. Módulo novo ganha logo adicionando
 * uma linha aqui; cabeçalho, menu lateral e hub leem daqui, então a marca
 * nunca diverge entre as telas.
 */
export const MODULO_LOGO_ICONE: Record<ModuloLogoId, Icone> = {
  'dashboard-executivo': LayoutDashboard,
  'compras-publicas': ShoppingCart,
  'estoque-central': Boxes,
  'farmacia-estoque': Pill,
  'escala-medica': UserCheck,
  'gestao-clinica': Stethoscope,
  'laboratorio': FlaskConical,
  'leitos-censo': BedDouble,
  'financeiro-split': CreditCard,
  'automacao-mensageria': MessageSquare,
  'ingestao-modulos': FileSpreadsheet,
  'arquitetura-seguranca': ShieldCheck,
  'regulacao-vagas': Ambulance,
  'admin-perfis': UserCog,
  recepcao: ConciergeBell,
  medico: HeartPulse,
  internacao: BedDouble,
  tarefas: ClipboardCheck,
  facilities: Sparkles,
  pacientes: Users,
  'centros-custo': Network,
  atividades: Activity,
  rateio: Calculator,
  relatorios: BarChart3,
};

/** Categoria do módulo — telas fora do tema têm categoria fixa aqui. */
export function categoriaDoModulo(id: ModuloLogoId): ModuloCategoria {
  return id in CATEGORIA_FORA_DO_TEMA
    ? CATEGORIA_FORA_DO_TEMA[id as keyof typeof CATEGORIA_FORA_DO_TEMA]
    : MODULO_THEMES[id as ModuloId].categoria;
}

const TAMANHOS = {
  sm: { caixa: 'w-7 h-7 rounded-lg', icone: 'w-4 h-4' },
  md: { caixa: 'w-9 h-9 rounded-xl', icone: 'w-5 h-5' },
  lg: { caixa: 'w-10 h-10 rounded-xl', icone: 'w-5 h-5' },
} as const;

interface ModuloLogoProps {
  moduloId: ModuloLogoId;
  tamanho?: keyof typeof TAMANHOS;
  /** `papel` inverte as cores para fundos em azul marca (ex.: hero do hub). */
  tom?: 'marca' | 'papel';
  className?: string;
}

/**
 * Logo de módulo — mesma família da logo "Vigia Saúde 360": quadrado no azul
 * da marca (#5B84B1) com o símbolo em papel. A categoria entra só pelo dot de
 * 9px no canto, como pede o guia (§ 2.1 e § 5): nada de bloco na cor do módulo.
 * O quadrado só leva ícone, então o azul claro basta (contraste gráfico ≥ 3:1).
 *
 * É decorativa (aria-hidden): o nome do módulo sempre aparece ao lado.
 */
export function ModuloLogo({ moduloId, tamanho = 'md', tom = 'marca', className }: ModuloLogoProps) {
  const Icone = MODULO_LOGO_ICONE[moduloId];
  const cor = CATEGORIA_COR[categoriaDoModulo(moduloId)];
  const t = TAMANHOS[tamanho];

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 shadow-sm',
        tom === 'marca' ? 'bg-marca text-[#F6F3EC]' : 'bg-[#F6F3EC] text-[#1B1F1C]',
        t.caixa,
        className
      )}
    >
      <Icone className={t.icone} strokeWidth={1.75} />
      <span
        className={cn(
          'absolute -top-[3px] -right-[3px] w-[9px] h-[9px] rounded-full ring-2',
          tom === 'marca' ? 'ring-white' : 'ring-marca-forte'
        )}
        style={{ backgroundColor: cor }}
      />
    </span>
  );
}
