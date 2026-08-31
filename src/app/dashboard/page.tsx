import Link from 'next/link';
import type { Metadata } from 'next';
import { ButtonLink } from '@/components/Button';
import { CopyField } from '@/components/CopyField';
import { StatusPill } from '@/components/StatusPill';
import { PitchEmail } from '@/components/PitchEmail';
import {
  ATTENDANCE_BOUNTY_USD,
  MIN_PAYOUT_USD,
  PAYOUT_DAY,
  PAYOUT_METHODS,
  VA_REFERRAL_BOUNTY_USD,
  usd,
} from '@/config/program';
import { EARN_EVENTS } from '@/lib/analytics';
import { formatDate, formatUsd, loadDashboard } from '@/lib/dashboard';
import { bookingLink, shareLink } from '@/lib/referral';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export const metadata: Metadata = { title: 'Dashboard' };

// Earnings and lead status change under the VA's feet; never serve a build-time
// snapshot of them.
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <NotConnected />;

  const { profile, summary, leads, vaReferrals, payouts, vaReferralEarningsUsd } =
    await loadDashboard();

  const code = profile.referral_code;

  return (
    <div className="space-y-10">
      {/* Always visible at top: what you've earned, your code, your links. */}
      <section>
        <h1 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-cream">
          {profile.full_name ? `Hi ${profile.full_name.split(' ')[0]}.` : 'Your earnings'}
        </h1>

        <dl className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Earned" value={formatUsd(summary.totalUsd)} emphasis />
          <Stat
            label="Pending"
            value={formatUsd(summary.pendingUsd + summary.clearedUsd)}
          />
          <Stat label="Paid out" value={formatUsd(summary.paidUsd)} />
        </dl>

        <div className="mt-5 space-y-4 rounded-[14px] border border-hairline bg-surface p-5">
          <CopyField label="Your referral code" value={code} />
          <CopyField
            label="Booking link — send this to the person you’re introducing"
            value={bookingLink(code)}
            event={EARN_EVENTS.shareLinkCopied}
            mono={false}
          />
          <CopyField
            label="Your share link — for other VAs"
            value={shareLink(code)}
            event={EARN_EVENTS.shareLinkCopied}
            mono={false}
          />
        </div>

        <ButtonLink href="/dashboard/leads/new" className="mt-5 w-full sm:w-auto">
          Add a company to refer
        </ButtonLink>
      </section>

      {/* My referrals (companies) */}
      <section>
        <SectionHeading
          title="My referrals"
          note={`${usd(ATTENDANCE_BOUNTY_USD)} lands when they attend the call.`}
        />

        {leads.length === 0 ? (
          <Empty>
            No companies yet. Add the person you’re introducing — we can’t attribute
            a meeting to you without it.
          </Empty>
        ) : (
          <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-[14px] border border-hairline bg-surface">
            {leads.map((lead) => (
              <li key={lead.id}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <p className="truncate text-[15.5px] font-medium text-cream">
                        {lead.company_name}
                      </p>
                      <p className="mt-0.5 truncate text-[13.5px] text-muted">
                        {lead.contact_name}
                        {lead.contact_role ? ` · ${lead.contact_role}` : ''}
                      </p>
                    </div>
                    <StatusPill status={lead.status} />
                  </summary>
                  <dl className="grid gap-x-6 gap-y-2 border-t border-hairline-soft px-4 py-4 text-[13.5px] sm:grid-cols-2">
                    <Detail label="Contact" value={lead.contact_email} />
                    <Detail label="Submitted" value={formatDate(lead.created_at)} />
                    <Detail label="Call booked" value={formatDate(lead.booked_at)} />
                    <Detail label="Attended" value={formatDate(lead.attended_at)} />
                  </dl>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* My VA referrals */}
      <section>
        <SectionHeading
          title="My VA referrals"
          note={
            VA_REFERRAL_BOUNTY_USD === null
              ? 'You earn when a VA who signed up on your link earns their first payout.'
              : `${usd(
                  VA_REFERRAL_BOUNTY_USD,
                )} when a VA who signed up on your link earns their first payout.`
          }
        />

        {vaReferrals.length === 0 ? (
          <Empty>
            Nobody yet. Share your link above — it works in Facebook groups, group
            chats, anywhere other VAs are.
          </Empty>
        ) : (
          <>
            <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-[14px] border border-hairline bg-surface">
              {vaReferrals.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] text-cream">
                      {r.referred?.full_name ?? r.referred?.email ?? 'A VA'}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      Joined {formatDate(r.created_at)}
                    </p>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-[4px] text-[12px] font-medium ${
                      r.qualified_at
                        ? 'bg-accent-wash text-accent'
                        : 'bg-surface-raised text-body'
                    }`}
                  >
                    {r.qualified_at ? 'Earned' : 'Not yet earning'}
                  </span>
                </li>
              ))}
            </ul>
            {vaReferralEarningsUsd > 0 && (
              <p className="mt-3 text-[13.5px] text-muted">
                {formatUsd(vaReferralEarningsUsd)} earned from VA referrals.
              </p>
            )}
          </>
        )}
      </section>

      {/* Payouts */}
      <section>
        <SectionHeading
          title="Payouts"
          note={`Every ${PAYOUT_DAY}, once you’ve cleared ${usd(MIN_PAYOUT_USD)}.`}
        />

        <div className="mt-4 rounded-[14px] border border-hairline bg-surface p-5">
          <p className="text-[14px] text-body">
            Paid by{' '}
            <span className="text-cream">
              {PAYOUT_METHODS.find((m) => m.value === profile.payout_method)?.label ??
                'a method you haven’t picked yet'}
            </span>
            .{' '}
            <Link
              href="/dashboard/resources"
              className="text-accent underline underline-offset-[3px]"
            >
              Change it
            </Link>
          </p>

          {summary.clearedUsd > 0 && summary.clearedUsd < MIN_PAYOUT_USD && (
            <p className="mt-3 text-[13.5px] text-muted">
              {formatUsd(summary.clearedUsd)} is cleared and waiting — payouts go out
              once you reach {usd(MIN_PAYOUT_USD)}.
            </p>
          )}

          {payouts.length === 0 ? (
            <p className="mt-3 text-[13.5px] text-muted">No payouts yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-hairline-soft border-t border-hairline-soft">
              {payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-[15px] text-cream tabular-nums">
                      {formatUsd(Number(p.amount_usd))}
                      {p.local_amount && p.local_currency && (
                        <span className="ml-2 text-[13px] text-muted">
                          ≈ {Number(p.local_amount).toLocaleString()} {p.local_currency}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {formatDate(p.paid_at ?? p.created_at)} · {p.method}
                    </p>
                  </div>
                  <span className="text-[13px] text-body capitalize">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Resources — the pitch email is the thing VAs come back for, so it is
          expanded here rather than hidden a click away. */}
      <section>
        <SectionHeading
          title="Your pitch email"
          note="Send it from your work email. That’s the one thing that matters most."
        />
        <div className="mt-4">
          <PitchEmail bookingUrl={bookingLink(code)} vaName={profile.full_name ?? ''} />
        </div>
        <p className="mt-4 text-[14px] text-muted">
          More ammunition for the conversation:{' '}
          <Link
            href="/dashboard/resources"
            className="text-accent underline underline-offset-[3px]"
          >
            How to pitch your boss
          </Link>
        </p>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-[14px] border border-hairline bg-surface px-4 py-4">
      <dt className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </dt>
      <dd
        className={`mt-1.5 text-[22px] font-medium tabular-nums sm:text-[26px] ${
          emphasis ? 'text-accent' : 'text-cream'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 className="text-[19px] font-medium tracking-[-0.015em] text-cream">{title}</h2>
      {note && <p className="text-[13.5px] text-muted">{note}</p>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 truncate text-body">{value}</dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-[14px] border border-dashed border-hairline px-5 py-6 text-[14.5px] leading-[1.6] text-muted">
      {children}
    </p>
  );
}

function NotConnected() {
  return (
    <div className="rounded-[14px] border border-hairline bg-surface p-6">
      <h1 className="text-[20px] font-medium text-cream">Dashboard isn’t live yet</h1>
      <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.6] text-body">
        The landing page ships first, by design. The dashboard switches on as soon
        as Supabase credentials are set for this environment.
      </p>
    </div>
  );
}
