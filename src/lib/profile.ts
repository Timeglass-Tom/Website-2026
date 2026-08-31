import 'server-only';
import { cookies, headers } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/server';
import { REF_COOKIE, generateReferralCode, normalizeCode } from '@/lib/referral';

export type EarnProfile = {
  id: string;
  email: string;
  full_name: string | null;
  country: string | null;
  payout_method: string | null;
  status: string;
  referral_code: string;
};

/**
 * Creates the profile row, the referral code, and the VA-to-VA referral link if
 * one applies — then returns the profile.
 *
 * Called on every dashboard load rather than only at signup: a VA can arrive
 * through the password form, an OAuth callback, or an email confirmation link,
 * and making this idempotent is cheaper than making all three paths create the
 * same rows correctly.
 */
export async function ensureProfile(user: User): Promise<EarnProfile> {
  const admin = createAdminClient();
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

  const { data: existing } = await admin
    .from('earn_users')
    .select('id, email, full_name, country, payout_method, status')
    .eq('id', user.id)
    .maybeSingle();

  let profile = existing;

  if (!profile) {
    const ip = await clientIp();
    const { data: inserted, error } = await admin
      .from('earn_users')
      .insert({
        id: user.id,
        email: user.email ?? '',
        full_name: asString(meta.full_name) ?? asString(meta.name),
        country: asString(meta.country),
        payout_method: asString(meta.payout_method) || null,
        referred_by_code: await pendingReferralCode(),
        signup_ip: ip,
      })
      .select('id, email, full_name, country, payout_method, status')
      .single();

    if (error) throw error;
    profile = inserted;
  }

  const referralCode = await ensureReferralCode(user.id);
  await ensureVaReferral(user.id);

  return { ...profile, referral_code: referralCode };
}

async function ensureReferralCode(userId: string): Promise<string> {
  const admin = createAdminClient();

  const { data: active } = await admin
    .from('earn_referral_codes')
    .select('code')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (active) return active.code;

  // Codes are short enough that a collision is possible, if rare. Retry rather
  // than lengthening the code — a VA has to be able to read theirs out loud.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateReferralCode();
    const { error } = await admin
      .from('earn_referral_codes')
      .insert({ code, user_id: userId, is_active: true });
    if (!error) return code;
    if (error.code !== '23505') throw error;
  }

  throw new Error('Could not allocate a referral code after 5 attempts.');
}

/**
 * Links a new VA to the VA whose share link they arrived on. The bounty itself
 * is only accrued later, when the referred VA earns their first payout — this
 * just records the relationship.
 */
async function ensureVaReferral(userId: string): Promise<void> {
  const code = await pendingReferralCode();
  if (!code) return;

  const admin = createAdminClient();

  const { data: owner } = await admin
    .from('earn_referral_codes')
    .select('user_id')
    .eq('code', code)
    .maybeSingle();

  // Nobody owns this code, or the VA is standing on their own link.
  if (!owner || owner.user_id === userId) return;

  // `earn_va_referrals_once` makes this a no-op on a second dashboard load.
  await admin
    .from('earn_va_referrals')
    .insert({ referrer_id: owner.user_id, referred_id: userId, code })
    .select('id')
    .maybeSingle();
}

async function pendingReferralCode(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(REF_COOKIE)?.value;
  return raw ? normalizeCode(raw) : null;
}

async function clientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return h.get('x-real-ip');
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
