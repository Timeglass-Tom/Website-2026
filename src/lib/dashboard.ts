import 'server-only';
import { redirect } from 'next/navigation';
import { summarize, type EarningsSummary } from '@/lib/earnings';
import { ensureProfile, type EarnProfile } from '@/lib/profile';
import { createClient } from '@/lib/supabase/server';

export type LeadRow = {
  id: string;
  company_name: string;
  contact_name: string;
  contact_role: string | null;
  contact_email: string;
  status: string;
  created_at: string;
  booked_at: string | null;
  attended_at: string | null;
};

export type VaReferralRow = {
  id: string;
  created_at: string;
  qualified_at: string | null;
  referred: { full_name: string | null; email: string } | null;
};

export type PayoutRow = {
  id: string;
  amount_usd: string;
  method: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  local_currency: string | null;
  local_amount: string | null;
};

export type DashboardData = {
  profile: EarnProfile;
  summary: EarningsSummary;
  leads: LeadRow[];
  vaReferrals: VaReferralRow[];
  payouts: PayoutRow[];
  /** Earnings that a VA referral has produced, for the "My VA referrals" table. */
  vaReferralEarningsUsd: number;
};

/**
 * Everything the dashboard renders, in one round trip's worth of queries.
 * Reads run under the VA's own session, so RLS is what guarantees a VA never
 * sees another VA's rows.
 */
export async function loadDashboard(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  const profile = await ensureProfile(user);

  const [earnings, leads, vaReferrals, payouts] = await Promise.all([
    supabase.from('earn_earnings').select('amount_usd, status, kind'),
    supabase
      .from('earn_leads')
      .select(
        'id, company_name, contact_name, contact_role, contact_email, status, created_at, booked_at, attended_at',
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('earn_va_referrals')
      .select('id, created_at, qualified_at, referred:referred_id (full_name, email)')
      .order('created_at', { ascending: false }),
    supabase
      .from('earn_payouts')
      .select(
        'id, amount_usd, method, status, created_at, paid_at, local_currency, local_amount',
      )
      .order('created_at', { ascending: false }),
  ]);

  const earningRows = earnings.data ?? [];

  return {
    profile,
    summary: summarize(earningRows),
    leads: (leads.data ?? []) as LeadRow[],
    vaReferrals: (vaReferrals.data ?? []) as unknown as VaReferralRow[],
    payouts: (payouts.data ?? []) as PayoutRow[],
    vaReferralEarningsUsd: earningRows
      .filter((e) => e.kind === 'va_referral' && e.status !== 'void')
      .reduce((total, e) => total + Number(e.amount_usd), 0),
  };
}

export function formatUsd(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(iso: string | null): string {
  if (!iso) return ', ';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
