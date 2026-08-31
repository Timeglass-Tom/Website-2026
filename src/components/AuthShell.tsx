import type { ReactNode } from 'react';
import { Logo } from '@/components/Logo';
import { TIMEGLASS_URL } from '@/config/program';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-dvh px-6 py-10 sm:py-16">
      <div className="mx-auto max-w-[26rem]">
        <Logo href={TIMEGLASS_URL} />
        <h1 className="mt-9 text-[28px] font-medium leading-[1.15] tracking-[-0.02em] text-cream">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-[15.5px] leading-[1.6] text-body">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-7 text-[14px] text-muted">{footer}</div>}
      </div>
    </div>
  );
}
