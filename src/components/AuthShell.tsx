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
        <Logo href={TIMEGLASS_URL} className="text-still-white" />
        <h1 className="font-display mt-10 text-[30px] font-normal leading-[1.12] text-still-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-[15.5px] leading-[1.62] text-pale-flow">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-7 text-[14px] text-dark-muted">{footer}</div>}
      </div>
    </div>
  );
}
