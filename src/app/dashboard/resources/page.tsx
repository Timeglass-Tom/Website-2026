import Link from 'next/link';
import type { Metadata } from 'next';
import { collateral, dosAndDonts } from '@/content/pitch';
import { PayoutMethodForm } from '@/components/PayoutMethodForm';
import { loadDashboard } from '@/lib/dashboard';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { MIN_PAYOUT_USD, PAYOUT_DAY, PAYOUT_HOLD_DAYS, usd } from '@/config/program';

export const metadata: Metadata = { title: 'How to pitch your boss' };

export const dynamic = 'force-dynamic';

export default async function ResourcesPage() {
  const profile = isSupabaseConfigured() ? (await loadDashboard()).profile : null;

  return (
    <div className="max-w-[46rem] space-y-12">
      <div>
        <Link
          href="/dashboard"
          className="text-[13.5px] text-dark-muted hover:text-still-white"
        >
          Back to dashboard
        </Link>
        <h1 className="font-display mt-5 text-[32px] font-normal leading-[1.1] text-still-white">
          How to pitch your boss
        </h1>
        <p className="mt-4 text-[16px] leading-[1.62] text-pale-flow">
          Here are six things that land with the people who run agencies and VA
          teams, roughly in the order you should lead with them. You will not need
          all six, because the first one wins most conversations on its own.
        </p>
      </div>

      <ol className="space-y-9">
        {collateral.map((point, i) => (
          <li key={point.title} className="flex gap-4">
            <span className="mt-[3px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sand-gold/15 text-[13px] font-medium tabular-nums text-sand-gold">
              {i + 1}
            </span>
            <div>
              <h2 className="font-display text-[18px] font-medium text-still-white">
                {point.title}
              </h2>
              <p className="mt-2.5 text-[15.5px] leading-[1.68] text-pale-flow">
                {point.body}
              </p>
              {point.say && (
                <blockquote className="mt-4 border-l-2 border-sand-gold pl-4 text-[15.5px] leading-[1.62] text-still-white italic">
                  “{point.say}”
                </blockquote>
              )}
            </div>
          </li>
        ))}
      </ol>

      <section className="grid gap-8 border-t border-deep-focus/70 pt-10 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-[18px] font-medium text-still-white">
            Worth doing
          </h2>
          <ul className="mt-4 space-y-3">
            {dosAndDonts.dos.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-[15px] leading-[1.62] text-pale-flow"
              >
                <span aria-hidden="true" className="mt-[2px] text-sand-gold">
                  +
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-[18px] font-medium text-still-white">
            Worth avoiding
          </h2>
          <ul className="mt-4 space-y-3">
            {dosAndDonts.donts.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-[15px] leading-[1.62] text-pale-flow"
              >
                <span aria-hidden="true" className="mt-[2px] text-soft-signal">
                  &minus;
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {profile && (
        <section className="border-t border-deep-focus/70 pt-10">
          <h2 className="font-display text-[18px] font-medium text-still-white">
            How you get paid
          </h2>
          <p className="mt-3 text-[15px] leading-[1.62] text-pale-flow">
            Cleared earnings go out every {PAYOUT_DAY} once you have reached{' '}
            {usd(MIN_PAYOUT_USD)}. Earnings are held for {PAYOUT_HOLD_DAYS} days
            after a call is marked attended so we can run a fraud review, and there
            is nothing for you to do during that time.
          </p>
          <div className="mt-6 max-w-[22rem]">
            <PayoutMethodForm current={profile.payout_method} />
          </div>
        </section>
      )}
    </div>
  );
}
