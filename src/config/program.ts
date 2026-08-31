/**
 * Program constants for the VA referral program.
 *
 * Everything the PRD lists as an open question lives here, so the answers can
 * land in one file without touching copy or logic. Anything still unanswered is
 * typed as `null` and every surface that renders it is written to degrade
 * gracefully — an unset bounty is never shown as "$0" or "$TBD" to a VA.
 */

/** Paid when an introduced decision-maker attends a call. The headline number. */
export const ATTENDANCE_BOUNTY_USD = 35;

/**
 * Bonus paid when the VA supplied a phone/WhatsApp number, the number is
 * verified, and the person attends. Stacks on top of the attendance bounty.
 */
export const PHONE_BONUS_USD = 10;

/**
 * OPEN QUESTION (PRD §13): conversion bounty amount and the definition of
 * "converted". Until this is set, the landing page and dashboard describe the
 * conversion track qualitatively ("a larger bounty") rather than quoting a
 * number we might have to walk back.
 */
export const CONVERSION_BOUNTY_USD: number | null = null;

/**
 * OPEN QUESTION (PRD §13): VA-to-VA referral payout. Direct referrals only —
 * there is deliberately no multi-level tree.
 */
export const VA_REFERRAL_BOUNTY_USD: number | null = null;

/** Minimum cleared balance before a payout is released. */
export const MIN_PAYOUT_USD = 20;

/** Earnings are held this long after "attended" for fraud review. */
export const PAYOUT_HOLD_DAYS = 14;

/** Cleared earnings go out weekly. */
export const PAYOUT_DAY = 'Friday';

/**
 * More than this many leads from one VA inside 24h flags the account for manual
 * review. Not a hard block — a genuinely productive VA should not be stopped,
 * only looked at.
 */
export const LEAD_VELOCITY_REVIEW_THRESHOLD = 5;

export const PAYOUT_METHODS = [
  { value: 'paypal', label: 'PayPal' },
  { value: 'wise', label: 'Wise' },
  { value: 'gcash', label: 'GCash' },
  { value: 'payoneer', label: 'Payoneer' },
  { value: 'usdc_polygon', label: 'USDC (Polygon)' },
] as const;

export type PayoutMethod = (typeof PAYOUT_METHODS)[number]['value'];

/**
 * OPEN QUESTION (PRD §13): JM and Justin's contact details for the "Is this
 * legit?" FAQ. The FAQ renders the names with whatever is filled in here and
 * omits the contact list entirely while both are empty, rather than shipping
 * "[contact TBD]" to a VA who is deciding whether to trust us.
 */
export const REFERENCES: { name: string; contact: string | null }[] = [
  { name: 'JM', contact: null },
  { name: 'Justin', contact: null },
];

/** Public URLs on the main marketing site. */
export const TIMEGLASS_URL = 'https://timeglass.ai';
export const SECURITY_URL = 'https://timeglass.ai/security';

/**
 * Booking link the VA's superior lands on. The VA's referral code is appended
 * as `?ref=` so a booking can be attributed even when the contact email the
 * superior books with differs from the one the VA submitted.
 */
export const BOOKING_BASE_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ?? 'https://cal.com/timeglass/intro';

/** Public origin of the earn site, used to build shareable links server-side. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://timeglass.ai/earn';

export function usd(amount: number): string {
  return `$${amount}`;
}
