import type { ComponentProps, ReactNode } from 'react';

const control =
  'w-full rounded-[10px] border border-hairline bg-surface px-3.5 py-3 text-[16px] text-cream placeholder:text-faint focus:border-accent focus:outline-none';

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
      <label htmlFor={htmlFor} className="text-[14px] font-medium text-cream">
        {children}
        {optional && <span className="ml-1.5 text-[13px] text-faint">Optional</span>}
      </label>
      {hint && <p className="mt-1 text-[13px] leading-[1.5] text-muted">{hint}</p>}
    </div>
  );
}

export function Input({ className = '', ...rest }: ComponentProps<'input'>) {
  // 16px font size on the control is load-bearing: anything smaller makes iOS
  // Safari zoom the whole page on focus, and most of these forms are filled in
  // on a phone.
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
    <p role="alert" className="rounded-[10px] bg-[#3a1c1c] px-3.5 py-2.5 text-[14px] text-[#f3b0a8]">
      {children}
    </p>
  );
}
