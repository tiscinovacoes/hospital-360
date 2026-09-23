import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="bg-white rounded-xl border border-[rgba(27,31,28,.12)] overflow-hidden overflow-x-auto">
      <table className={cn('w-full text-left', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('border-b border-[rgba(27,31,28,.08)] last:border-0 hover:bg-[rgba(246,243,236,.5)] transition-colors', className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn('px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[rgba(27,31,28,.45)]', className)}
      {...props}
    />
  );
}

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Código/ID — usa fonte mono. */
  mono?: boolean;
  /** Valor monetário — fonte mono, negrito. */
  currency?: boolean;
}

export function TableCell({ className, mono, currency, ...props }: TableCellProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-xs text-[#1B1F1C]',
        mono && 'font-mono',
        currency && 'font-mono font-semibold',
        className
      )}
      {...props}
    />
  );
}
