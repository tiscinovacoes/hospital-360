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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIA_COR, CATEGORIA_COR_FORTE, MODULO_THEMES, ModuloCategoria, ModuloId } from './ModuloLayoutShell';

/** Todo módulo com logo própria: os do tema + a administração de perfis. */
export type ModuloLogoId = ModuloId | 'admin-perfis';

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
};

/** Categoria do módulo — `admin-perfis` não está no tema e é Governança. */
export function categoriaDoModulo(id: ModuloLogoId): ModuloCategoria {
  return id === 'admin-perfis' ? 'FINANCEIRO' : MODULO_THEMES[id].categoria;
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
  tom?: 'categoria' | 'papel';
  className?: string;
}

/**
 * Logo de módulo — mesma família da logo "Vigia Saúde 360": quadrado com o
 * símbolo em papel, no tom forte da categoria do módulo (IDENTIDADE_VISUAL § 4).
 * O quadrado já carrega a categoria, então o dot de 9px só aparece no tom
 * `papel`, onde o fundo é neutro. Símbolo em papel sobre o tom forte ≥ 4,1:1.
 *
 * É decorativa (aria-hidden): o nome do módulo sempre aparece ao lado.
 */
export function ModuloLogo({ moduloId, tamanho = 'md', tom = 'categoria', className }: ModuloLogoProps) {
  const Icone = MODULO_LOGO_ICONE[moduloId];
  const categoria = categoriaDoModulo(moduloId);
  const t = TAMANHOS[tamanho];

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 shadow-sm',
        tom === 'categoria' ? 'text-[#F6F3EC]' : 'bg-[#F6F3EC] text-[#1B1F1C]',
        t.caixa,
        className
      )}
      style={tom === 'categoria' ? { backgroundColor: CATEGORIA_COR_FORTE[categoria] } : undefined}
    >
      <Icone className={t.icone} strokeWidth={1.75} />
      {tom === 'papel' && (
        <span
          className="absolute -top-[3px] -right-[3px] w-[9px] h-[9px] rounded-full ring-2 ring-marca-forte"
          style={{ backgroundColor: CATEGORIA_COR[categoria] }}
        />
      )}
    </span>
  );
}
