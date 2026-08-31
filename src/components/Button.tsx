import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * Pill buttons, matching the main marketing site. The primary sits in Sand
 * Gold with Time Dark text and carries an arrow, which is the affordance the
 * rest of the brand uses for anything that moves you forward.
 */
const base =
  'inline-flex items-center justify-center gap-2 rounded-full text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55';

const variants = {
  primary: 'bg-sand-gold text-time-dark hover:bg-sand-gold-lift px-6 py-3',
  onLight:
    'border border-time-dark/20 text-time-dark hover:bg-time-dark hover:text-still-white px-6 py-3',
  onDark:
    'border border-still-white/25 text-still-white hover:bg-still-white/10 px-6 py-3',
  ghost: 'text-pale-flow hover:text-still-white px-3 py-2',
} as const;

type Variant = keyof typeof variants;

function Arrow() {
  return (
    <svg viewBox="0 0 16 12" className="h-[11px] w-[15px]" aria-hidden="true">
      <path
        d="M1 6h13M9.5 1.5L14 6l-4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ButtonLink({
  href,
  variant = 'primary',
  arrow = false,
  className = '',
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  arrow?: boolean;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, 'href' | 'children'>) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({
  variant = 'primary',
  arrow = false,
  className = '',
  children,
  ...rest
}: { variant?: Variant; arrow?: boolean; children: ReactNode } & ComponentProps<'button'>) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
