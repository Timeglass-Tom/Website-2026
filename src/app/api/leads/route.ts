import { NextResponse, type NextRequest } from 'next/server';
import { LEAD_VELOCITY_REVIEW_THRESHOLD } from '@/config/program';
import { isSelfReferral } from '@/lib/attribution';
import { syncLeadToCrm } from '@/lib/crm';
import { ensureProfile } from '@/lib/profile';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { leadSchema } from '@/lib/validation';

/**
 * Lead submission, the most strategically important write on the site. Two
 * things happen here and they are ordered deliberately: the row is committed
 * first, then the CRM is told about it. A CRM outage must never cost us the
 * lead or cost the VA their attribution.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const parsed = leadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Some fields need another look.', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const profile = await ensureProfile(user);
  const admin = createAdminClient();

  // --- Anti-abuse, checked before the insert -------------------------------

  if (isSelfReferral(profile.email, input.contactEmail)) {
    return NextResponse.json(
      {
        error:
          'That address is on the same domain as your own, so we cannot credit ' +
          'it as an introduction. If this really is your employer, email us and ' +
          'we will sort it out.',
      },
      { status: 422 },
    );
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await admin
    .from('earn_leads')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', dayAgo);

  // Over the velocity threshold the lead is still accepted, because a genuinely
  // productive VA should keep working, and it is flagged for a human to look at
  // before any money moves.
  const flaggedReason =
    (recentCount ?? 0) >= LEAD_VELOCITY_REVIEW_THRESHOLD
      ? `More than ${LEAD_VELOCITY_REVIEW_THRESHOLD} leads submitted in 24h`
      : null;

  // --- Commit ---------------------------------------------------------------

  const { data: lead, error } = await admin
    .from('earn_leads')
    .insert({
      user_id: user.id,
      company_name: input.companyName,
      company_website: input.companyWebsite,
      company_size: input.companySize,
      country: input.country,
      timezone: input.timezone,
      contact_name: input.contactName,
      contact_role: input.contactRole,
      contact_relationship: input.contactRelationship,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      pitch_channel: input.pitchChannel,
      status: 'submitted',
      flagged_reason: flaggedReason,
      submitted_ip: clientIp(request),
    })
    .select('id, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'You have submitted this person before, so check your dashboard for the current status.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'We could not save that. Please try again.' }, { status: 500 });
  }

  await admin.from('earn_lead_status_events').insert({
    lead_id: lead.id,
    from_status: null,
    to_status: 'submitted',
    source: 'system',
    note: flaggedReason ? `Flagged: ${flaggedReason}` : null,
  });

  // --- Hand off to the CRM --------------------------------------------------

  const sync = await syncLeadToCrm({
    leadId: lead.id,
    vaId: user.id,
    vaEmail: profile.email,
    vaReferralCode: profile.referral_code,
    companyName: input.companyName,
    companyWebsite: input.companyWebsite,
    companySize: input.companySize,
    contactName: input.contactName,
    contactRole: input.contactRole,
    contactRelationship: input.contactRelationship,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    country: input.country,
    timezone: input.timezone,
    pitchChannel: input.pitchChannel,
    submittedAt: lead.created_at,
  });

  if (sync.synced) {
    await admin
      .from('earn_leads')
      .update({ crm_synced_at: new Date().toISOString() })
      .eq('id', lead.id);
  }

  // The VA's response never mentions the CRM. From their side the lead is in,
  // and it genuinely is. Retrying a failed sync is our job to handle.
  return NextResponse.json({ id: lead.id }, { status: 201 });
}

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip');
}
