import Link from 'next/link';
import type { Metadata } from 'next';
import { collateral, dosAndDonts } from '@/content/pitch';
import { PayoutMethodForm } from '@/components/PayoutMethodForm';
import { loadDashboard } from '@/lib/dashboard';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { MIN_PAYOUT_USD, PAYOUT_DAY, PAYOUT_HOLD_DAYS, usd } from '@/config/program';

export const metadata: Metadata = { title: 'How to pitch your boss' };

// Earnings and lead status change under the VA's feet; never serve a build-time
// snapshot of them.
export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
  const profile = isSupabaseConfigured() ? (await loadDashboard()).profile : null;

  return (
    <div className="max-w-[46rem] space-y-12">
      <div>
        <Link href="/dashboard" className="text-[13.5px] text-muted hover:text-cream">
          ← Back
        </Link>
        <h1 className="mt-5 text-[28px] font-medium leading-[1.12] tracking-[-0.02em] text-cream">
          How to pitch your boss
        </h1>
        <p className="mt-3 text-[16px] leading-[1.6] text-body">
          Six things that actually land with the people who run agencies and VA
          teams, roughly in the order to lead with them. You don’t need all six —
          the first one wins most conversations on its own.
        </p>
      </div>

      <ol className="space-y-8">
        {collateral.map((point, i) => (
          <li key={point.title} className="flex gap-4">
            <span className="mt-[3px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-accent-wash text-[13px] font-medium tabular-nums text-accent">
              {i + 1}
            </span>
            <div>
              <h2 className="text-[17px] font-medium text-cream">{point.title}</h2>
              <p className="mt-2 text-[15.5px] leading-[1.65] text-body">{point.body}</p>
              {point.say && (
                <blockquote className="mt-3 border-l-2 border-accent pl-4 text-[15.5px] leading-[1.6] text-cream italic">
                  “{point.say}”
                </blockquote>
              )}
            </div>
          </li>
        ))}
      </ol>

      <section className="grid gap-6 border-t border-hairline-soft pt-10 sm:grid-cols-2">
        <div>
          <h2 className="text-[17px] font-medium text-cream">Do</h2>
          <ul className="mt-3 space-y-2.5">
            {dosAndDonts.dos.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] leading-[1.6] text-body">
                <span aria-hidden="true" className="mt-[2px] text-accent">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-[17px] font-medium text-cream">Don’t</h2>
          <ul className="mt-3 space-y-2.5">
            {dosAndDonts.donts.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] leading-[1.6] text-body">
                <span aria-hidden="true" className="mt-[2px] text-faint">
                  ✕
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {profile && (
        <section className="border-t border-hairline-soft pt-10">
          <h2 className="text-[17px] font-medium text-cream">How you get paid</h2>
          <p className="mt-2 text-[15px] leading-[1.6] text-body">
            Cleared earnings go out every {PAYOUT_DAY} once you’ve reached{' '}
            {usd(MIN_PAYOUT_USD)}. Earnings are held {PAYOUT_HOLD_DAYS} days after a
            call is marked attended, which is our fraud-review window — nothing to do
            on your side.
          </p>
          <div className="mt-5 max-w-[22rem]">
            <PayoutMethodForm current={profile.payout_method} />
          </div>
        </section>
      )}
    </div>
  );
}
