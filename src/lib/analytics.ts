/**
 * PostHog funnel instrumentation.
 *
 * The PRD asks for an event on every step of the funnel, so the step names are
 * enumerated here rather than passed as free strings, because a typo in one
 * is invisible until someone tries to build the funnel chart weeks later.
 */
export const EARN_EVENTS = {
  landingView: 'earn_landing_view',
  signupStart: 'earn_signup_start',
  signupComplete: 'earn_signup_complete',
  leadSubmitted: 'earn_lead_submitted',
  pitchEmailCopied: 'earn_pitch_email_copied',
  shareLinkCopied: 'earn_share_link_copied',
  bookingCreated: 'earn_booking_created',
  meetingAttended: 'earn_meeting_attended',
  payoutSent: 'earn_payout_sent',
} as const;

export type EarnEvent = (typeof EARN_EVENTS)[keyof typeof EARN_EVENTS];

let posthog: typeof import('posthog-js').default | null = null;

/** No-ops without a key so local and preview builds do not need PostHog set up. */
export async function initAnalytics() {
  if (typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || posthog) return;

  const mod = await import('posthog-js');
  mod.default.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    capture_pageview: false,
    person_profiles: 'identified_only',
  });
  posthog = mod.default;
}

export function track(event: EarnEvent, properties?: Record<string, unknown>) {
  posthog?.capture(event, properties);
}

export function identify(userId: string, properties?: Record<string, unknown>) {
  posthog?.identify(userId, properties);
}
