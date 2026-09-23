import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-bold font-sans transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C4C] focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-[#C1622D] text-white hover:bg-[#A8531F]',
        secondary: 'bg-[rgba(14,92,76,.08)] text-[#0E5C4C] hover:bg-[rgba(14,92,76,.14)]',
        outline: 'bg-transparent border border-[rgba(27,31,28,.12)] text-[#1B1F1C] hover:bg-[rgba(27,31,28,.06)]',
        ghost: 'bg-transparent text-[rgba(27,31,28,.7)] hover:bg-[rgba(27,31,28,.06)]',
        danger: 'bg-[#9C3B2E] text-white hover:bg-[#7E2F24]',
      },
      size: {
        sm: 'h-9 px-3 text-xs rounded-md',
        md: 'h-11 min-h-[44px] px-4 text-xs',
        lg: 'h-12 min-h-[44px] px-6 text-sm rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), loading && 'cursor-wait', className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
