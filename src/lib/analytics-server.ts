import 'server-only';
import { EARN_EVENTS, type EarnEvent } from '@/lib/analytics';

/**
 * Server-side funnel events.
 *
 * The last three steps the PRD asks for — booking created, attendance, payout —
 * only ever happen in a webhook or a scheduled run, where there is no browser
 * to capture them. This posts straight to PostHog's capture endpoint instead.
 *
 * Never awaited on a critical path and never allowed to throw: losing an
 * analytics event is acceptable, failing a booking or a payout because of one
 * is not.
 */
export async function trackServer(
  event: EarnEvent,
  distinctId: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

  try {
    await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId,
        properties: { ...properties, $lib: 'earn-server' },
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Deliberately silent.
  }
}

export { EARN_EVENTS };
