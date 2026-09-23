'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, children, footer, className }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const focusable = node?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && node) {
        const items = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[rgba(27,31,28,.40)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn('relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6', className)}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 id={titleId} className="font-display text-xl font-semibold text-[#1B1F1C] text-pretty">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2.5 -mt-2.5 rounded-lg flex items-center justify-center text-[rgba(27,31,28,.40)] hover:bg-[rgba(27,31,28,.06)] outline-none focus-visible:ring-2 focus-visible:ring-[#0E5C4C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-sm text-[rgba(27,31,28,.70)] leading-relaxed">{children}</div>

        {footer && <div className="flex items-center justify-end gap-2 mt-6">{footer}</div>}
      </div>
    </div>
  );
}
