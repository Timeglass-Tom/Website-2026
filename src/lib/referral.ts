import { BOOKING_BASE_URL, SITE_URL } from '@/config/program';

/**
 * Referral codes are shown, typed, and read aloud over chat, so the alphabet
 * drops the characters that get confused in those settings (0/O, 1/I/L) and the
 * code stays short enough to retype without resentment.
 */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 7;

export function generateReferralCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = '';
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }
  return code;
}

/** The link a VA shares to recruit other VAs. */
export function shareLink(code: string): string {
  return `${SITE_URL}?ref=${encodeURIComponent(code)}`;
}

/**
 * The link a VA sends to the person they are introducing. The ref code rides
 * along so a booking is attributable even when the superior books with a
 * different address than the one the VA submitted.
 */
export function bookingLink(code: string): string {
  const url = new URL(BOOKING_BASE_URL);
  url.searchParams.set('ref', code);
  return url.toString();
}

/** Codes are stored and compared uppercase; VAs will type them however. */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Cookie that carries a VA-to-VA referral code from the share link through to
 * signup. Set by the proxy on any entry point, read when the profile row is
 * created.
 */
export const REF_COOKIE = 'tg_earn_ref';
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days
