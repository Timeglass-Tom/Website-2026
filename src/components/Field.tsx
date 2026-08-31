import type { ComponentProps, ReactNode } from 'react';

/* 16px on the control is load-bearing. Anything smaller makes iOS Safari zoom
   the page on focus, and most of these forms get filled in on a phone. */
const control =
  'w-full rounded-[10px] border border-deep-focus bg-deep-time px-3.5 py-3 text-[16px] text-still-white placeholder:text-soft-signal focus:border-sand-gold focus:outline-none';

export function Label({
  htmlFor,
  children,
  hint,
  optional,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-[14px] font-medium text-still-white">
        {children}
        {optional && <span className="ml-1.5 text-[13px] text-soft-signal">Optional</span>}
      </label>
      {hint && <p className="mt-1 text-[13px] leading-[1.55] text-dark-muted">{hint}</p>}
    </div>
  );
}

export function Input({ className = '', ...rest }: ComponentProps<'input'>) {
  return <input className={`${control} ${className}`} {...rest} />;
}

export function Select({ className = '', children, ...rest }: ComponentProps<'select'>) {
  return (
    <select className={`${control} ${className}`} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...rest }: ComponentProps<'textarea'>) {
  return <textarea className={`${control} ${className}`} {...rest} />;
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-[10px] border border-[#7a3b30] bg-[#2e1a17] px-3.5 py-2.5 text-[14px] leading-[1.55] text-[#f0b4a8]"
    >
      {children}
    </p>
  );
}
