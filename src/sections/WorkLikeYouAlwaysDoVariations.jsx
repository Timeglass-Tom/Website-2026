/**
 * "Work like you always do." — three right-side panel variations.
 *
 * Comparison harness: all three complete sections stacked vertically with a
 * small label above each. Drop this on a route, screenshot, pick one, then
 * lift the chosen Panel* component into the real section.
 *
 * No dependencies. Tailwind only, with arbitrary hex values so the palette is
 * exact regardless of tailwind.config — swap the constants below for design
 * tokens once one variation is chosen.
 */

/* ---------------------------------------------------------------------------
 * Palette / shape tokens (mirrors the existing site)
 * ------------------------------------------------------------------------- */

const CREAM = 'bg-[#FAF6EF]';
const INK = 'text-[#0B1A1C]'; // deep teal-green
const BODY = 'text-[#4C5C5D]';
const MUTED = 'text-[#8A9698]';
const FAINT = 'text-[#A9A196]'; // ignored / inactive names
const HAIRLINE = 'border-[#EFE9DE]';
const PILL = 'bg-[#E4EEE3] text-[#3E6B4E]'; // pale-green status pill
const CARD_SHADOW =
  'shadow-[0_1px_2px_rgba(11,26,28,0.04),0_10px_28px_-12px_rgba(11,26,28,0.14)]';
const CARD = `bg-white rounded-[14px] border ${HAIRLINE} ${CARD_SHADOW}`;

/* ---------------------------------------------------------------------------
 * Data — names appear literally. The specificity is the point.
 * ------------------------------------------------------------------------- */

const WATCHING = [
  { name: 'Figma', mark: 'F', chip: 'bg-[#F5E3DC] text-[#B85B3E]' },
  { name: 'Linear', mark: 'L', chip: 'bg-[#E5E5F1] text-[#4E4E7C]' },
  { name: 'Google Docs', mark: 'D', chip: 'bg-[#DFE8F5] text-[#3160A6]' },
  { name: 'Chrome (work profile)', mark: 'C', chip: 'bg-[#E7EFE5] text-[#4A7A46]' },
  { name: 'Slack', mark: 'S', chip: 'bg-[#EEE2F1] text-[#6E4380]' },
];

const IGNORED = [
  { name: 'iMessage', mark: 'M' },
  { name: 'Chase', mark: 'C' },
  { name: 'Personal Gmail', mark: 'G' },
  { name: '1Password', mark: '1' },
];

const IGNORED_CHIP = 'bg-[#F0EDE7] text-[#A9A196]';

/* ---------------------------------------------------------------------------
 * Shared primitives
 * ------------------------------------------------------------------------- */

/** Slow, soft radar pulse. Deliberately quieter than Tailwind's animate-ping. */
function PulseKeyframes() {
  return (
    <style>{`
      @keyframes tgPulse {
        0%   { transform: scale(1);   opacity: 0.45; }
        70%  { transform: scale(2.8); opacity: 0; }
        100% { transform: scale(2.8); opacity: 0; }
      }
      .tg-dot { position: relative; }
      .tg-dot::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 9999px;
        background: #4C9A6A;
        animation: tgPulse 2.8s cubic-bezier(0, 0, 0.2, 1) infinite;
        animation-delay: var(--tg-delay, 0s);
      }
      @media (prefers-reduced-motion: reduce) {
        .tg-dot::after { animation: none; opacity: 0; }
      }
    `}</style>
  );
}

function LiveDot({ delay = 0, className = '' }) {
  return (
    <span
      className={`tg-dot inline-block h-[6px] w-[6px] rounded-full bg-[#4C9A6A] ${className}`}
      style={{ '--tg-delay': `${delay}s` }}
    />
  );
}

function AppMark({ mark, chip, size = 'md' }) {
  const dims =
    size === 'sm'
      ? 'h-[16px] w-[16px] rounded-[4px] text-[9px]'
      : 'h-[22px] w-[22px] rounded-[6px] text-[10px]';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-semibold ${dims} ${chip}`}
      aria-hidden="true"
    >
      {mark}
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * Left-hand copy — identical across all three variations
 * ------------------------------------------------------------------------- */

function SectionCopy() {
  return (
    <div className="lg:col-span-2">
      <h2
        className={`text-[34px] sm:text-[40px] font-medium leading-[1.08] tracking-[-0.022em] ${INK}`}
      >
        Work like you always do.
      </h2>
      <p className={`mt-5 max-w-[36ch] text-[17px] leading-[1.62] ${BODY}`}>
        Timeglass captures the apps and windows you chose to watch — and only
        those. No timers, no reconstruction, no surprise about what it sees.
      </p>
    </div>
  );
}

function Section({ children }) {
  return (
    <section className={`${CREAM} px-6 py-20 sm:py-24`}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-5 lg:gap-16">
        <SectionCopy />
        <div className="lg:col-span-3">{children}</div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Variation A — Watched / Ignored split
 * Closest cousin of the existing "Capture on your terms" card.
 * ------------------------------------------------------------------------- */

function PanelA() {
  return (
    <div className={`${CARD} w-full max-w-[500px] p-5 sm:p-6 lg:ml-auto`}>
      <div className="flex items-baseline justify-between">
        <h3 className={`text-[15px] font-medium ${INK}`}>Watching today.</h3>
        <span
          className={`rounded-full px-2 py-[3px] text-[11px] font-medium ${PILL}`}
        >
          5 active
        </span>
      </div>

      <div className="mt-5">
        <p
          className={`text-[11px] font-medium uppercase tracking-[0.13em] ${MUTED}`}
        >
          Watching
        </p>
        <ul className="mt-2.5 space-y-px">
          {WATCHING.map((app, i) => (
            <li
              key={app.name}
              className="flex items-center gap-3 rounded-[10px] px-2 py-[9px] -mx-2"
            >
              <AppMark mark={app.mark} chip={app.chip} />
              <span className={`text-[14px] ${INK}`}>{app.name}</span>
              <LiveDot delay={i * 0.28} className="ml-auto" />
            </li>
          ))}
        </ul>
      </div>

      <div className={`mt-5 border-t ${HAIRLINE} pt-5`}>
        <p
          className={`text-[11px] font-medium uppercase tracking-[0.13em] ${MUTED}`}
        >
          Ignored
        </p>
        <ul className="mt-2.5 space-y-px">
          {IGNORED.map((app) => (
            <li
              key={app.name}
              className="flex items-center gap-3 rounded-[10px] px-2 py-[9px] -mx-2"
            >
              <AppMark mark={app.mark} chip={IGNORED_CHIP} />
              <span
                className={`text-[14px] line-through decoration-[#D6D0C5] decoration-1 ${FAINT}`}
              >
                {app.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`mt-5 border-t ${HAIRLINE} pt-4`}>
        <p className={`text-[12.5px] ${MUTED}`}>You chose this. Change anytime.</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Variation B — Ambient status readout (menu-bar widget)
 * ------------------------------------------------------------------------- */

function HourglassMark({ className = '' }) {
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

function PanelB() {
  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[300px]">
        {/* Implied system menu bar */}
        <div className="flex items-center justify-end gap-3 pr-3">
          <span className="h-[3px] w-[3px] rounded-full bg-[#C9C2B6]" />
          <span className="h-[3px] w-[3px] rounded-full bg-[#C9C2B6]" />
          <span className="flex h-[20px] w-[20px] items-center justify-center rounded-[5px] bg-[#0B1A1C]/[0.06]">
            <HourglassMark className="h-[11px] w-[9px] text-[#0B1A1C]/70" />
          </span>
          <span className={`text-[10.5px] ${MUTED}`}>2:41 PM</span>
        </div>

        {/* Popover notch */}
        <div className="mr-[52px] flex justify-end">
          <div className="mt-1.5 h-2 w-2 rotate-45 rounded-[2px] border-l border-t border-[#EFE9DE] bg-white" />
        </div>

        <div className={`${CARD} -mt-[5px] overflow-hidden`}>
          <div
            className={`flex items-center justify-between border-b ${HAIRLINE} px-3.5 py-3`}
          >
            <span className="flex items-center gap-2">
              <HourglassMark className="h-[12px] w-[10px] text-[#0B1A1C]/60" />
              <span className={`text-[12.5px] font-medium ${INK}`}>Timeglass</span>
            </span>
            <span className={`text-[11px] tabular-nums ${MUTED}`}>6h 12m today</span>
          </div>

          <div className="px-3.5 py-3">
            <p
              className={`text-[10.5px] font-medium uppercase tracking-[0.13em] ${MUTED}`}
            >
              Now watching
            </p>
            <ul className="mt-2">
              {WATCHING.map((app, i) => (
                <li key={app.name} className="flex items-center gap-2.5 py-[5px]">
                  <AppMark mark={app.mark} chip={app.chip} size="sm" />
                  <span className={`text-[12.5px] ${INK}`}>{app.name}</span>
                  <LiveDot delay={i * 0.28} className="ml-auto" />
                </li>
              ))}
            </ul>
          </div>

          <div className={`border-t ${HAIRLINE} px-3.5 py-3`}>
            <p
              className={`text-[10.5px] font-medium uppercase tracking-[0.13em] ${MUTED}`}
            >
              Never
            </p>
            <ul className="mt-2">
              {IGNORED.map((app) => (
                <li key={app.name} className="flex items-center gap-2.5 py-[5px]">
                  <AppMark mark={app.mark} chip={IGNORED_CHIP} size="sm" />
                  <span
                    className={`text-[12.5px] line-through decoration-[#D6D0C5] decoration-1 ${FAINT}`}
                  >
                    {app.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`flex items-center justify-between border-t ${HAIRLINE} bg-[#FCFAF6] px-3.5 py-2.5`}
          >
            <span className={`text-[11.5px] ${MUTED}`}>Edit list</span>
            <svg
              viewBox="0 0 6 10"
              className="h-[9px] w-[6px] text-[#B4ADA1]"
              aria-hidden="true"
            >
              <path
                d="M1 1l4 4-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Variation C — preserve the current timer gesture, add a condensed trust panel
 * ------------------------------------------------------------------------- */

function InlineChip({ app, ignored = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[7px] border px-2 py-[5px] text-[12.5px] ${
        ignored
          ? `border-[#EFE9DE] bg-[#FAF8F4] line-through decoration-[#D6D0C5] decoration-1 ${FAINT}`
          : `border-[#EFE9DE] bg-white ${INK}`
      }`}
    >
      <span
        className={`h-[5px] w-[5px] rounded-full ${
          ignored ? 'bg-[#CFC8BC]' : 'bg-[#4C9A6A]'
        }`}
        aria-hidden="true"
      />
      {app.name}
    </span>
  );
}

function PanelC() {
  return (
    <div className="w-full max-w-[480px] lg:ml-auto">
      <div className={`${CARD} p-5`}>
        <div className="flex items-center justify-between">
          <p
            className={`text-[11px] font-medium uppercase tracking-[0.13em] ${MUTED}`}
          >
            Watching
          </p>
          <span
            className={`rounded-full px-2 py-[3px] text-[11px] font-medium ${PILL}`}
          >
            5 active
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {WATCHING.map((app) => (
            <InlineChip key={app.name} app={app} />
          ))}
        </div>

        <div className={`mt-4 border-t ${HAIRLINE} pt-4`}>
          <p
            className={`text-[11px] font-medium uppercase tracking-[0.13em] ${MUTED}`}
          >
            Ignored
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {IGNORED.map((app) => (
              <InlineChip key={app.name} app={app} ignored />
            ))}
          </div>
        </div>
      </div>

      {/* The gesture from the current design, kept intact. */}
      <div className="mt-6 pl-6">
        <span
          className={`inline-flex items-center rounded-full border ${HAIRLINE} bg-white px-3.5 py-2 text-[13px] line-through decoration-[#D6D0C5] decoration-1 ${FAINT} ${CARD_SHADOW}`}
        >
          Start timer · there isn&apos;t one
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Comparison harness
 * ------------------------------------------------------------------------- */

function VariationLabel({ children }) {
  return (
    <div className={`${CREAM} px-6 pt-14`}>
      <div className="mx-auto max-w-6xl">
        <p
          className={`text-[11px] font-medium uppercase tracking-[0.16em] ${MUTED}`}
        >
          {children}
        </p>
        <div className={`mt-3 border-t ${HAIRLINE}`} />
      </div>
    </div>
  );
}

export default function WorkLikeYouAlwaysDoVariations() {
  return (
    <div className={CREAM}>
      <PulseKeyframes />

      <VariationLabel>Variation A — Watched / Ignored split</VariationLabel>
      <Section>
        <PanelA />
      </Section>

      <VariationLabel>Variation B — Ambient status readout</VariationLabel>
      <Section>
        <PanelB />
      </Section>

      <VariationLabel>
        Variation C — Preserve the current gesture
      </VariationLabel>
      <Section>
        <PanelC />
      </Section>

      <div className="h-16" />
    </div>
  );
}

export { PanelA, PanelB, PanelC, SectionCopy };
