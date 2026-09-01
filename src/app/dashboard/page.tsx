import Link from 'next/link';
import type { Metadata } from 'next';
import { ButtonLink } from '@/components/Button';
import { CopyField } from '@/components/CopyField';
import { StatusPill } from '@/components/StatusPill';
import { PitchEmail } from '@/components/PitchEmail';
import {
  ATTENDANCE_BOUNTY_USD,
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
        <h1 className="font-display text-[30px] font-normal leading-[1.12] text-still-white">
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

        <div className="mt-5 space-y-4 rounded-[16px] border border-deep-focus bg-deep-time p-5">
          <CopyField label="Your referral code" value={code} />
          <CopyField
            label="Booking link for the person you are introducing"
            value={bookingLink(code)}
            event={EARN_EVENTS.shareLinkCopied}
            mono={false}
          />
          <CopyField
            label="Your share link for other VAs"
            value={shareLink(code)}
            event={EARN_EVENTS.shareLinkCopied}
            mono={false}
          />
        </div>

        <ButtonLink href="/dashboard/leads/new" arrow className="mt-5 w-full sm:w-auto">
          Add a company to refer
        </ButtonLink>
      </section>

      {/* My referrals (companies) */}
      <section>
        <SectionHeading
          title="My referrals"
          note={`The ${usd(ATTENDANCE_BOUNTY_USD)} lands when they attend the call.`}
        />

        {leads.length === 0 ? (
          <Empty>
            You have not added a company yet. Add the person you are introducing,
            because we cannot credit a meeting to you without it.
          </Empty>
        ) : (
          <ul className="mt-4 divide-y divide-deep-focus overflow-hidden rounded-[16px] border border-deep-focus bg-deep-time">
            {leads.map((lead) => (
              <li key={lead.id}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <p className="truncate text-[15.5px] font-medium text-still-white">
                        {lead.company_name}
                      </p>
                      <p className="mt-0.5 truncate text-[13.5px] text-dark-muted">
                        {lead.contact_name}
                        {lead.contact_role ? ` · ${lead.contact_role}` : ''}
                      </p>
                    </div>
                    <StatusPill status={lead.status} />
                  </summary>
                  <dl className="grid gap-x-6 gap-y-2 border-t border-deep-focus/70 px-4 py-4 text-[13.5px] sm:grid-cols-2">
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
            Nobody has joined through your link yet. Share it in Facebook groups,
            group chats, or anywhere else you know other VAs.
          </Empty>
        ) : (
          <>
            <ul className="mt-4 divide-y divide-deep-focus overflow-hidden rounded-[16px] border border-deep-focus bg-deep-time">
              {vaReferrals.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] text-still-white">
                      {r.referred?.full_name ?? r.referred?.email ?? 'A VA'}
                    </p>
                    <p className="mt-0.5 text-[13px] text-dark-muted">
                      Joined {formatDate(r.created_at)}
                    </p>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-[4px] text-[12px] font-medium ${
                      r.qualified_at
                        ? 'bg-sand-gold/15 text-sand-gold'
                        : 'bg-deep-time text-pale-flow'
                    }`}
                  >
                    {r.qualified_at ? 'Earned' : 'Not yet earning'}
                  </span>
                </li>
              ))}
            </ul>
            {vaReferralEarningsUsd > 0 && (
              <p className="mt-3 text-[13.5px] text-dark-muted">
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
          note={`Payments go out every ${PAYOUT_DAY}.`}
        />

        <div className="mt-4 rounded-[16px] border border-deep-focus bg-deep-time p-5">
          <p className="text-[14px] text-pale-flow">
            Paid by{' '}
            <span className="text-still-white">
              {PAYOUT_METHODS.find((m) => m.value === profile.payout_method)?.label ??
                'a method you haven’t picked yet'}
            </span>
            .{' '}
            <Link
              href="/dashboard/resources"
              className="text-sand-gold underline underline-offset-[3px]"
            >
              Change it
            </Link>
          </p>

          {payouts.length === 0 ? (
            <p className="mt-3 text-[13.5px] text-dark-muted">No payouts yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-deep-focus/70 border-t border-deep-focus/70">
              {payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-[15px] text-still-white tabular-nums">
                      {formatUsd(Number(p.amount_usd))}
                      {p.local_amount && p.local_currency && (
                        <span className="ml-2 text-[13px] text-dark-muted">
                          ≈ {Number(p.local_amount).toLocaleString()} {p.local_currency}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[13px] text-dark-muted">
                      {formatDate(p.paid_at ?? p.created_at)} · {p.method}
                    </p>
                  </div>
                  <span className="text-[13px] text-pale-flow capitalize">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Resources, the pitch email is the thing VAs come back for, so it is
          expanded here rather than hidden a click away. */}
      <section>
        <SectionHeading
          title="Your pitch email"
          note="Send it from your work email, since that makes the biggest difference to whether it gets a reply."
        />
        <div className="mt-4">
          <PitchEmail bookingUrl={bookingLink(code)} vaName={profile.full_name ?? ''} />
        </div>
        <p className="mt-4 text-[14px] text-dark-muted">
          More ammunition for the conversation:{' '}
          <Link
            href="/dashboard/resources"
            className="text-sand-gold underline underline-offset-[3px]"
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
    <div className="rounded-[16px] border border-deep-focus bg-deep-time px-4 py-4">
      <dt className="text-[12px] font-medium uppercase tracking-[0.12em] text-soft-signal">
        {label}
      </dt>
      <dd
        className={`mt-1.5 text-[22px] font-medium tabular-nums sm:text-[26px] ${
          emphasis ? 'text-sand-gold' : 'text-still-white'
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
      <h2 className="font-display text-[20px] font-medium text-still-white">{title}</h2>
      {note && <p className="text-[13.5px] text-dark-muted">{note}</p>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-soft-signal">{label}</dt>
      <dd className="min-w-0 truncate text-pale-flow">{value}</dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-[16px] border border-dashed border-deep-focus px-5 py-6 text-[14.5px] leading-[1.62] text-dark-muted">
      {children}
    </p>
  );
}

function NotConnected() {
  return (
    <div className="rounded-[16px] border border-deep-focus bg-deep-time p-6">
      <h1 className="font-display text-[22px] font-medium text-still-white">Dashboard isn’t live yet</h1>
      <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.62] text-pale-flow">
        The landing page ships first by design, and the dashboard switches on as
        soon as Supabase credentials are set for this environment.
      </p>
    </div>
  );
}
