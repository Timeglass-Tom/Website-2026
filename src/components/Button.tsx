import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

const base =
  'inline-flex items-center justify-center rounded-[10px] text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55';

const variants = {
  primary: 'bg-accent text-ground hover:bg-[#7fd7a0] px-6 py-3',
  secondary:
    'border border-hairline bg-surface text-cream hover:bg-surface-raised px-6 py-3',
  ghost: 'text-body hover:text-cream px-3 py-2',
} as const;

type Variant = keyof typeof variants;

export function ButtonLink({
  href,
  variant = 'primary',
  className = '',
  children,
  ...rest
}: { href: string; variant?: Variant; children: ReactNode } & Omit<
  ComponentProps<typeof Link>,
  'href' | 'children'
>) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: { variant?: Variant; children: ReactNode } & ComponentProps<'button'>) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
