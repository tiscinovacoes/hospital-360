import React, { useId } from 'react';
import { cn } from '@/lib/utils';

const fieldBase =
  'w-full px-3 py-2.5 min-h-[40px] rounded-lg border text-[13px] font-sans bg-white outline-none transition-colors ' +
  'placeholder:text-[rgba(27,31,28,.35)] disabled:opacity-40 disabled:cursor-not-allowed';

const fieldStateClasses = (hasError?: boolean) =>
  hasError
    ? 'border-[#9C3B2E] bg-[rgba(156,59,46,.03)] text-[#9C3B2E] focus:ring-2 focus:ring-[#9C3B2E]/15'
    : 'border-[rgba(27,31,28,.12)] text-[#1B1F1C] focus:border-[#0E5C4C] focus:ring-2 focus:ring-[#0E5C4C]/15';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, fieldStateClasses(error), className)} aria-invalid={error || undefined} {...props} />
  )
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, fieldStateClasses(error), 'min-h-[88px] resize-y', className)} aria-invalid={error || undefined} {...props} />
  )
);
Textarea.displayName = 'Textarea';

export interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement<{ id?: string; error?: boolean; 'aria-describedby'?: string }>;
}

/** Wrapper com label, hint e mensagem de erro — envolve Input ou Textarea. */
export function FormField({ label, hint, error, required, children }: FormFieldProps) {
  const autoId = useId();
  const fieldId = children.props.id ?? autoId;
  const descId = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;

  const field = React.cloneElement(children, {
    id: fieldId,
    error: Boolean(error),
    'aria-describedby': descId,
  });

  return (
    <div>
      <label htmlFor={fieldId} className="block text-[11px] font-bold text-[rgba(27,31,28,.60)] mb-1.5">
        {label}
        {required && <span className="text-[#9C3B2E]"> *</span>}
      </label>
      {field}
      {error ? (
        <p id={descId} className="text-[10px] text-[#9C3B2E] font-semibold mt-1">{error}</p>
      ) : hint ? (
        <p id={descId} className="text-[10px] text-[rgba(27,31,28,.45)] mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
