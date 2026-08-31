import type { FaqItem } from '@/content/landing';

/**
 * Native <details> accordion, so there is no client JS and no hydration cost,
 * and it opens before React has loaded. Most VAs reach this page on a phone
 * over a mobile connection, which counts for more than a custom animation.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-deep-focus border-y border-deep-focus">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16.5px] text-still-white marker:hidden [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="shrink-0 text-soft-signal transition-transform group-open:rotate-45"
            >
              <svg viewBox="0 0 14 14" className="h-[14px] w-[14px]">
                <path
                  d="M7 1v12M1 7h12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </summary>
          <div className="pb-6 text-[15.5px] leading-[1.68] text-pale-flow">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
