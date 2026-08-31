import Link from 'next/link';
import { TIMEGLASS_URL } from '@/config/program';

/**
 * The Timeglass hourglass mark, lifted from the main site's inline SVG so the
 * two properties draw the same glyph at any size.
 */
export function HourglassMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 14" className={className} aria-hidden="true">
      <path
        d="M2 1h8M2 13h8M2.6 1.6c0 3 2.6 3.7 2.6 4.9S2.6 9.4 2.6 12.4M9.4 1.6c0 3-2.6 3.7-2.6 4.9s2.6 2.9 2.6 5.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ href = TIMEGLASS_URL }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 text-cream"
      aria-label="Timeglass"
    >
      <HourglassMark className="h-[17px] w-[14px] text-accent" />
      <span className="text-[16px] font-medium tracking-[-0.01em]">Timeglass</span>
    </Link>
  );
}
