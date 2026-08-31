import type { FaqItem } from '@/content/landing';

/**
 * Native <details> accordion — no client JS, no hydration cost, and it stays
 * open-able before React loads. Most VAs reach this page on a phone over a
 * mobile connection; that matters more than a custom animation.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-hairline border-y border-hairline">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[16px] font-medium text-cream marker:hidden [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="shrink-0 text-muted transition-transform group-open:rotate-45"
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
          <div className="pb-5 text-[15.5px] leading-[1.65] text-body">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
