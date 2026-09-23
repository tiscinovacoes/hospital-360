import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const alertVariants = cva('flex gap-3 p-3 rounded-lg border-l-4 text-xs leading-relaxed', {
  variants: {
    variant: {
      success: 'bg-[rgba(14,92,76,.06)] border-[#0E5C4C] text-[#0E5C4C]',
      warning: 'bg-[rgba(138,106,22,.08)] border-[#8A6A16] text-[#8A6A16]',
      critical: 'bg-[rgba(156,59,46,.06)] border-[#9C3B2E] text-[#9C3B2E]',
      info: 'bg-[rgba(14,92,76,.06)] border-[#0E5C4C] text-[#0E5C4C]',
    },
  },
  defaultVariants: { variant: 'info' },
});

const ICON_MAP = {
  success: CheckCircle2,
  warning: AlertTriangle,
  critical: XCircle,
  info: Info,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, variant = 'info', children, ...props }: AlertProps) {
  const Icon = ICON_MAP[variant ?? 'info'];
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
