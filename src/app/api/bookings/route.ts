import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { EARN_EVENTS, trackServer } from '@/lib/analytics-server';
import { attributeBooking } from '@/lib/attribution';
import { accrueAttendance, accrueConversion } from '@/lib/earnings';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Booking + attendance webhook.
 *
 * Fed by the booking tool on confirmation (with the `?ref=` code the VA's link
 * carried) and by the CRM when a rep marks a meeting attended or an account
 * converted. Attendance is the payout gate, and only this endpoint, never a
 * VA-facing route, can move a lead into it.
 */

type BookingEvent = {
  /** 'booked' | 'attended' | 'no_show' | 'converted' */
  type: string;
  externalId: string;
  attendeeEmail: string;
  attendeeName?: string;
  refCode?: string | null;
  scheduledAt?: string;
};

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const event = (await request.json()) as BookingEvent;
  if (!event?.type || !event.externalId || !event.attendeeEmail) {
    return NextResponse.json({ error: 'Malformed event.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const attribution = await attributeBooking(admin, {
    refCode: event.refCode ?? null,
    attendeeEmail: event.attendeeEmail,
  });

  // Upsert on external_id so a redelivered webhook, which every booking tool
  // does eventually, updates the same booking instead of creating a second.
  const { data: booking, error } = await admin
    .from('earn_bookings')
    .upsert(
      {
        external_id: event.externalId,
        ref_code: event.refCode ?? null,
        attendee_email: event.attendeeEmail.trim().toLowerCase(),
        attendee_name: event.attendeeName ?? null,
        scheduled_at: event.scheduledAt ?? null,
        lead_id: attribution.leadId,
        attributed_user_id: attribution.userId,
        attribution_method: attribution.method,
        raw: event as unknown as Record<string, unknown>,
        ...(event.type === 'attended' ? { attended_at: now } : {}),
      },
      { onConflict: 'external_id' },
    )
    .select('id, lead_id')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Could not record booking.' }, { status: 500 });
  }

  // An unattributed booking is still worth keeping, because it is a real lead
  // VA who submits the matching lead later can still be matched to it.
  if (!booking.lead_id) {
    return NextResponse.json({
      ok: true,
      attributed: false,
      method: attribution.method,
    });
  }

  switch (event.type) {
    case 'booked':
      await moveLead(booking.lead_id, 'meeting_booked', { booked_at: now });
      await trackServer(EARN_EVENTS.bookingCreated, attribution.userId ?? 'anonymous', {
        method: attribution.method,
      });
      break;

    case 'attended':
      await moveLead(booking.lead_id, 'attended', { attended_at: now });
      await payAttendance(booking.lead_id);
      await trackServer(EARN_EVENTS.meetingAttended, attribution.userId ?? 'anonymous', {
        method: attribution.method,
      });
      break;

    case 'converted':
      await moveLead(booking.lead_id, 'converted', { converted_at: now });
      await payConversion(booking.lead_id);
      break;

    case 'no_show':
      // A no-show does not pay and does not move the lead backwards, and the VA
      // can still nudge them to rebook against the same row.
      await admin.from('earn_lead_status_events').insert({
        lead_id: booking.lead_id,
        to_status: 'meeting_booked',
        source: 'booking_webhook',
        note: 'Booked but did not attend.',
      });
      break;

    default:
      return NextResponse.json({ error: 'Unknown event type.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, attributed: true, method: attribution.method });

  async function moveLead(
    leadId: string,
    to: string,
    extra: Record<string, string>,
  ) {
    const { data: current } = await admin
      .from('earn_leads')
      .select('status')
      .eq('id', leadId)
      .single();

    await admin.from('earn_leads').update({ status: to, ...extra }).eq('id', leadId);
    await admin.from('earn_lead_status_events').insert({
      lead_id: leadId,
      from_status: current?.status ?? null,
      to_status: to,
      source: 'booking_webhook',
    });
  }

  async function payAttendance(leadId: string) {
    const { data: lead } = await admin
      .from('earn_leads')
      .select('id, user_id, contact_phone, contact_phone_verified_at, flagged_reason')
      .eq('id', leadId)
      .single();

    if (!lead) return;
    // Flagged leads accrue nothing until a human clears the flag. The lead
    // still shows as attended in the VA's dashboard; only the money waits.
    if (lead.flagged_reason) return;

    await accrueAttendance(admin, lead);
  }

  async function payConversion(leadId: string) {
    const { data: lead } = await admin
      .from('earn_leads')
      .select('id, user_id, flagged_reason')
      .eq('id', leadId)
      .single();

    if (!lead || lead.flagged_reason) return;
    await accrueConversion(admin, lead);
  }
}

/**
 * Shared-secret auth. Constant-time compare so the header cannot be probed a
 * byte at a time; a missing secret fails closed rather than open.
 */
function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.EARN_BOOKING_WEBHOOK_SECRET;
  if (!expected) return false;

  const provided = request.headers.get('authorization')?.replace(/^Bearer /i, '') ?? '';
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
