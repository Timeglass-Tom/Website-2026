import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ATTENDANCE_BOUNTY_USD,
  CONVERSION_BOUNTY_USD,
  PAYOUT_HOLD_DAYS,
  PHONE_BONUS_USD,
  VA_REFERRAL_BOUNTY_USD,
} from '@/config/program';

/**
 * The ledger. One row per thing we owe a VA, written once and then only ever
 * moved through pending -> cleared -> paid (or void).
 *
 * Accrual is separated from payment on purpose: a payout can be retried, split
 * across rails, or fail, and none of that should be able to change the record
 * of what was earned.
 */

export type EarningKind = 'attendance' | 'phone_bonus' | 'conversion' | 'va_referral';

function clearsAt(from = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + PAYOUT_HOLD_DAYS);
  return d.toISOString();
}

/**
 * Accrues an earning, or does nothing if one already exists.
 *
 * The `(lead_id, kind)` unique constraint is what makes this safe to call more
 * than once: a lead whose status flaps attended -> booked -> attended must pay
 * exactly one attendance bounty, and the database constraint is what
 * guarantees that.
 */
async function accrue(
  db: SupabaseClient,
  row: {
    userId: string;
    kind: EarningKind;
    amountUsd: number;
    leadId?: string | null;
    vaReferralId?: string | null;
    note?: string;
  },
): Promise<boolean> {
  const { error } = await db.from('earn_earnings').insert({
    user_id: row.userId,
    lead_id: row.leadId ?? null,
    va_referral_id: row.vaReferralId ?? null,
    kind: row.kind,
    amount_usd: row.amountUsd,
    status: 'pending',
    clears_at: clearsAt(),
    note: row.note ?? null,
  });

  if (!error) return true;
  if (error.code === '23505') return false; // already accrued
  throw error;
}

/**
 * Called when a booking is marked attended. Pays the headline bounty, plus the
 * phone bonus when the VA supplied a number that was verified.
 */
export async function accrueAttendance(
  db: SupabaseClient,
  lead: {
    id: string;
    user_id: string;
    contact_phone: string | null;
    contact_phone_verified_at: string | null;
  },
): Promise<void> {
  await accrue(db, {
    userId: lead.user_id,
    leadId: lead.id,
    kind: 'attendance',
    amountUsd: ATTENDANCE_BOUNTY_USD,
  });

  if (lead.contact_phone && lead.contact_phone_verified_at) {
    await accrue(db, {
      userId: lead.user_id,
      leadId: lead.id,
      kind: 'phone_bonus',
      amountUsd: PHONE_BONUS_USD,
      note: 'Verified phone number supplied and the contact attended.',
    });
  }
}

/**
 * Called when a referred company becomes a paying customer.
 *
 * OPEN QUESTION (PRD §13): the conversion bounty amount is not set. Until it
 * is, this records nothing rather than accruing a zero, because a $0 line item
 * in a VA's dashboard reads as a broken promise, and a wrong number is worse. The
 * conversion itself is still recorded on the lead, so these are payable
 * retroactively once the amount lands.
 */
export async function accrueConversion(
  db: SupabaseClient,
  lead: { id: string; user_id: string },
): Promise<boolean> {
  if (CONVERSION_BOUNTY_USD === null) return false;

  return accrue(db, {
    userId: lead.user_id,
    leadId: lead.id,
    kind: 'conversion',
    amountUsd: CONVERSION_BOUNTY_USD,
  });
}

/**
 * Called when a VA who signed up on someone's share link earns their own first
 * payout. Direct referrals only, and there is deliberately no walk up a tree.
 *
 * Same open question as above: nothing is accrued until the amount is set.
 */
export async function accrueVaReferral(
  db: SupabaseClient,
  referredUserId: string,
): Promise<boolean> {
  if (VA_REFERRAL_BOUNTY_USD === null) return false;

  // Claim the referral by updating only rows that are still unqualified, and
  // treat "no row came back" as "someone else already claimed it". A read-then-
  // write here would let two concurrent payout runs both accrue the bounty.
  const { data: claimed } = await db
    .from('earn_va_referrals')
    .update({ qualified_at: new Date().toISOString() })
    .eq('referred_id', referredUserId)
    .is('qualified_at', null)
    .select('id, referrer_id')
    .maybeSingle();

  if (!claimed) return false;
  const referral = claimed;

  return accrue(db, {
    userId: referral.referrer_id,
    vaReferralId: referral.id,
    kind: 'va_referral',
    amountUsd: VA_REFERRAL_BOUNTY_USD,
    note: 'A VA you referred earned their first payout.',
  });
}

/** Moves earnings past their hold window into the next payout run. */
export async function clearMaturedEarnings(db: SupabaseClient): Promise<number> {
  const { data, error } = await db
    .from('earn_earnings')
    .update({ status: 'cleared' })
    .eq('status', 'pending')
    .lte('clears_at', new Date().toISOString())
    .select('id');

  if (error) throw error;
  return data?.length ?? 0;
}

export type EarningsSummary = {
  totalUsd: number;
  pendingUsd: number;
  clearedUsd: number;
  paidUsd: number;
};

export function summarize(
  earnings: { amount_usd: number | string; status: string }[],
): EarningsSummary {
  const sum = (predicate: (status: string) => boolean) =>
    earnings
      .filter((e) => predicate(e.status))
      .reduce((total, e) => total + Number(e.amount_usd), 0);

  return {
    // "Total earned" excludes voided rows, a reversed bounty should not keep
    // inflating a number the VA reads as money owed to them.
    totalUsd: sum((s) => s !== 'void'),
    pendingUsd: sum((s) => s === 'pending'),
    clearedUsd: sum((s) => s === 'cleared'),
    paidUsd: sum((s) => s === 'paid'),
  };
}
