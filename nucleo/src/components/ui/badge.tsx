import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide font-sans',
  {
    variants: {
      variant: {
        active: 'bg-[rgba(14,92,76,.08)] text-[#0E5C4C]',
        warning: 'bg-[rgba(138,106,22,.10)] text-[#8A6A16]',
        critical: 'bg-[rgba(156,59,46,.08)] text-[#9C3B2E]',
        neutral: 'bg-[rgba(27,31,28,.06)] text-[rgba(27,31,28,.7)]',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      <span aria-hidden="true">●</span>
      {children}
    </span>
  );
}

export { badgeVariants };
