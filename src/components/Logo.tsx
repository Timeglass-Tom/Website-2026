import Link from 'next/link';
import { TIMEGLASS_URL } from '@/config/program';

/**
 * The Timeglass mark: two curved halves whose negative space forms an
 * hourglass, wide at the top and bottom and pinched at the waist. Each half has
 * a straight outer edge and an ogee inner edge that swells toward the centre.
 *
 * The guidelines forbid recolouring the mark on its own, so it takes
 * currentColor and moves with the text it sits beside.
 */
export function HourglassMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 62 60"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 0 L2.6 0 C2.6 13 21 17 21 30 C21 43 2.6 47 2.6 60 L0 60 Z" />
      <path d="M62 0 L59.4 0 C59.4 13 41 17 41 30 C41 43 59.4 47 59.4 60 L62 60 Z" />
    </svg>
  );
}

export function Logo({
  href = TIMEGLASS_URL,
  className = '',
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label="Timeglass"
    >
      <HourglassMark className="h-[19px] w-[20px]" />
      <span className="font-display text-[19px] font-normal">Timeglass</span>
    </Link>
  );
}
