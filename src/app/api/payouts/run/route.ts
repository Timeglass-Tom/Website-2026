import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { MIN_PAYOUT_USD, type PayoutMethod } from '@/config/program';
import { EARN_EVENTS, trackServer } from '@/lib/analytics-server';
import { accrueVaReferral, clearMaturedEarnings } from '@/lib/earnings';
import { providerFor } from '@/lib/payouts';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * The weekly payout run. Meant to be hit by a scheduler every Friday; safe to
 * run more often, and safe to re-run after a failure.
 *
 * Order matters and is the whole design:
 *   1. Clear earnings whose 14-day fraud-review hold has elapsed.
 *   2. Group cleared earnings per VA and skip anyone under the minimum.
 *   3. Create the payout row FIRST, then attach the earnings to it, then send.
 *
 * Creating the row before sending is what makes a crash mid-run recoverable: a
 * payout that exists but was never sent is visible and retryable, whereas money
 * sent with no row is money we cannot account for.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const cleared = await clearMaturedEarnings(admin);

  const { data: payable, error } = await admin
    .from('earn_earnings')
    .select('id, user_id, amount_usd')
    .eq('status', 'cleared')
    .is('payout_id', null);

  if (error) {
    return NextResponse.json({ error: 'Could not read the ledger.' }, { status: 500 });
  }

  const byUser = new Map<string, { ids: string[]; total: number }>();
  for (const row of payable ?? []) {
    const entry = byUser.get(row.user_id) ?? { ids: [], total: 0 };
    entry.ids.push(row.id);
    entry.total += Number(row.amount_usd);
    byUser.set(row.user_id, entry);
  }

  const results: { userId: string; status: string; detail?: string }[] = [];

  for (const [userId, entry] of byUser) {
    if (entry.total < MIN_PAYOUT_USD) {
      results.push({ userId, status: 'below_minimum' });
      continue;
    }

    const { data: profile } = await admin
      .from('earn_users')
      .select('payout_method, payout_details, country, status')
      .eq('id', userId)
      .single();

    // A VA under review does not get paid until a human clears them, and one
    // who never picked a rail keeps accruing until they do.
    if (!profile || profile.status !== 'active') {
      results.push({ userId, status: 'account_not_active' });
      continue;
    }
    if (!profile.payout_method) {
      results.push({ userId, status: 'no_payout_method' });
      continue;
    }

    const method = profile.payout_method as PayoutMethod;

    const { data: payout, error: payoutError } = await admin
      .from('earn_payouts')
      .insert({
        user_id: userId,
        amount_usd: entry.total,
        method,
        status: 'processing',
      })
      .select('id')
      .single();

    if (payoutError || !payout) {
      results.push({ userId, status: 'payout_row_failed' });
      continue;
    }

    // Attach the earnings before sending. If the send then fails, these stay
    // attached to a failed payout rather than being picked up by the next run
    // and paid twice.
    await admin
      .from('earn_earnings')
      .update({ payout_id: payout.id })
      .in('id', entry.ids);

    const provider = providerFor(method);
    const result = await provider.send({
      payoutId: payout.id,
      userId,
      amountUsd: entry.total,
      method,
      destination: (profile.payout_details ?? {}) as Record<string, unknown>,
      countryCode: profile.country,
    });

    if (result.ok) {
      await admin
        .from('earn_payouts')
        .update({
          status: result.status,
          provider_ref: result.providerRef,
          local_currency: result.localCurrency ?? null,
          local_amount: result.localAmount ?? null,
          ...(result.status === 'paid' ? { paid_at: new Date().toISOString() } : {}),
        })
        .eq('id', payout.id);

      if (result.status === 'paid') {
        await admin
          .from('earn_earnings')
          .update({ status: 'paid' })
          .eq('payout_id', payout.id);

        // A VA's first payout is what qualifies whoever referred them.
        await accrueVaReferral(admin, userId);
      }

      await admin.from('earn_payout_events').insert({
        payout_id: payout.id,
        status: result.status,
        detail: { provider: provider.id, providerRef: result.providerRef },
      });

      await trackServer(EARN_EVENTS.payoutSent, userId, {
        amountUsd: entry.total,
        method,
        provider: provider.id,
        status: result.status,
      });

      results.push({ userId, status: result.status });
      continue;
    }

    // Failed: release the earnings so a later run can retry them, and keep the
    // payout row as the record of what was attempted.
    await admin
      .from('earn_earnings')
      .update({ payout_id: null })
      .eq('payout_id', payout.id);

    await admin
      .from('earn_payouts')
      .update({ status: 'failed', failure_reason: result.reason })
      .eq('id', payout.id);

    await admin.from('earn_payout_events').insert({
      payout_id: payout.id,
      status: 'failed',
      detail: { provider: provider.id, reason: result.reason, retryable: result.retryable },
    });

    results.push({ userId, status: 'failed', detail: result.reason });
  }

  return NextResponse.json({ clearedEarnings: cleared, payouts: results });
}

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.EARN_PAYOUT_RUN_SECRET;
  if (!expected) return false;

  const provided = request.headers.get('authorization')?.replace(/^Bearer /i, '') ?? '';
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
