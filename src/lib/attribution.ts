import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeCode } from '@/lib/referral';

/**
 * Deciding who gets paid for a booking.
 *
 * The rules, from the PRD:
 *   - A booking belongs to a VA if it came through a link carrying their
 *     referral code, OR the booked contact's email matches a lead that VA
 *     submitted — whichever came first.
 *   - Ties between two VAs claiming the same company break on evidence first,
 *     then on who submitted first.
 *
 * `whichever came first` is the part worth being careful about: a ref code on
 * the booking link is strong evidence, but it is not automatically the winner.
 * A VA who submitted the lead a week before someone else's code showed up on
 * the booking has the earlier claim, and gets it.
 */

export type AttributionMethod =
  | 'ref_code'
  | 'lead_email'
  | 'lead_domain'
  | 'unattributed';

export type AttributionResult = {
  userId: string | null;
  leadId: string | null;
  method: AttributionMethod;
  /** Populated when more than one VA had a claim, for the audit trail. */
  contenders?: string[];
};

type LeadRow = {
  id: string;
  user_id: string;
  contact_email: string;
  contact_email_domain: string | null;
  created_at: string;
};

export type BookingInput = {
  refCode: string | null;
  attendeeEmail: string;
};

export async function attributeBooking(
  db: SupabaseClient,
  booking: BookingInput,
): Promise<AttributionResult> {
  const email = booking.attendeeEmail.trim().toLowerCase();
  const domain = email.split('@')[1] ?? '';

  // --- Claim 1: a lead this VA submitted, matched on the contact's own email.
  const { data: emailMatches } = await db
    .from('earn_leads')
    .select('id, user_id, contact_email, contact_email_domain, created_at')
    .eq('contact_email', email)
    .order('created_at', { ascending: true });

  // --- Claim 2: the referral code that rode along on the booking link.
  const refCode = booking.refCode ? normalizeCode(booking.refCode) : null;
  const refUserId = refCode ? await userIdForCode(db, refCode) : null;

  const leads = (emailMatches ?? []) as LeadRow[];

  if (leads.length > 0) {
    const winner = pickEarliest(leads, refUserId);
    return {
      userId: winner.user_id,
      leadId: winner.id,
      method: 'lead_email',
      contenders: uniq(leads.map((l) => l.user_id)),
    };
  }

  if (refUserId) {
    // The code identifies the VA even with no matching lead on file. They still
    // get paid — but we try to hang the booking off one of their leads at the
    // same company so the dashboard row moves rather than stranding the
    // booking somewhere the VA cannot see it.
    const leadId = domain ? await leadAtDomain(db, refUserId, domain) : null;
    return {
      userId: refUserId,
      leadId,
      method: leadId ? 'lead_domain' : 'ref_code',
    };
  }

  // --- Claim 3: nobody's code, nobody's contact — but someone may have
  // submitted a lead at this company. Weakest signal, so it only applies when
  // exactly one VA has a claim on the domain; anything ambiguous goes to review
  // rather than guessing with someone's money.
  if (domain) {
    const { data: domainMatches } = await db
      .from('earn_leads')
      .select('id, user_id, contact_email, contact_email_domain, created_at')
      .eq('contact_email_domain', domain)
      .order('created_at', { ascending: true });

    const rows = (domainMatches ?? []) as LeadRow[];
    const owners = uniq(rows.map((r) => r.user_id));

    if (owners.length === 1 && rows[0]) {
      return {
        userId: rows[0].user_id,
        leadId: rows[0].id,
        method: 'lead_domain',
      };
    }

    if (owners.length > 1) {
      return { userId: null, leadId: null, method: 'unattributed', contenders: owners };
    }
  }

  return { userId: null, leadId: null, method: 'unattributed' };
}

/**
 * Tie-break among VAs claiming the same contact. Evidence wins, then the
 * earliest submission. A ref code on the booking only breaks a tie between
 * leads submitted on the same day — it never beats a materially earlier claim.
 */
function pickEarliest(leads: LeadRow[], refUserId: string | null): LeadRow {
  const sorted = [...leads].sort(
    (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
  );
  const earliest = sorted[0]!;

  if (!refUserId) return earliest;

  const refLead = sorted.find((l) => l.user_id === refUserId);
  if (!refLead || refLead.id === earliest.id) return earliest;

  const sameDay =
    Math.abs(Date.parse(refLead.created_at) - Date.parse(earliest.created_at)) <
    24 * 60 * 60 * 1000;

  return sameDay ? refLead : earliest;
}

async function userIdForCode(
  db: SupabaseClient,
  code: string,
): Promise<string | null> {
  const { data } = await db
    .from('earn_referral_codes')
    .select('user_id')
    .eq('code', code)
    .maybeSingle();
  return data?.user_id ?? null;
}

async function leadAtDomain(
  db: SupabaseClient,
  userId: string,
  domain: string,
): Promise<string | null> {
  const { data } = await db
    .from('earn_leads')
    .select('id')
    .eq('user_id', userId)
    .eq('contact_email_domain', domain)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

function uniq(values: string[]): string[] {
  return [...new Set(values)];
}

/**
 * Self-referral check. A VA introducing someone at their own email domain is
 * the obvious abuse case, and free webmail domains are excluded because half
 * of the legitimate SMB owners in this market use Gmail for work.
 */
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.com.ph',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'live.com',
  'mail.com',
  'zoho.com',
  'gmx.com',
  'yandex.com',
]);

export function isSelfReferral(vaEmail: string, contactEmail: string): boolean {
  const vaDomain = domainOf(vaEmail);
  const contactDomain = domainOf(contactEmail);

  if (!vaDomain || !contactDomain) return false;
  if (vaEmail.trim().toLowerCase() === contactEmail.trim().toLowerCase()) return true;
  if (FREE_EMAIL_DOMAINS.has(vaDomain) || FREE_EMAIL_DOMAINS.has(contactDomain)) {
    return false;
  }
  return vaDomain === contactDomain;
}

function domainOf(email: string): string {
  return email.trim().toLowerCase().split('@')[1] ?? '';
}
