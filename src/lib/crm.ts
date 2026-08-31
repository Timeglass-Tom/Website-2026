import 'server-only';

/**
 * Lead sync to the Timeglass CRM.
 *
 * OPEN QUESTION (PRD §13): the CRM endpoint is still to be provided. Until
 * `EARN_CRM_WEBHOOK_URL` is set this no-ops and reports it, so a missing
 * endpoint can never be the reason a VA's lead submission fails, because the row is
 * already committed by the time this runs, and `crm_synced_at` records whether
 * it made it across.
 */

export type CrmLeadPayload = {
  leadId: string;
  vaId: string;
  vaEmail: string;
  vaReferralCode: string;
  companyName: string;
  companyWebsite: string | null;
  companySize: string | null;
  contactName: string;
  contactRole: string | null;
  contactRelationship: string | null;
  contactEmail: string;
  contactPhone: string | null;
  country: string | null;
  timezone: string | null;
  pitchChannel: string | null;
  submittedAt: string;
};

export type CrmSyncResult = { synced: boolean; reason?: string };

export async function syncLeadToCrm(payload: CrmLeadPayload): Promise<CrmSyncResult> {
  const url = process.env.EARN_CRM_WEBHOOK_URL;
  if (!url) {
    return { synced: false, reason: 'EARN_CRM_WEBHOOK_URL is not configured.' };
  }

  const secret = process.env.EARN_CRM_WEBHOOK_SECRET;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(secret ? { authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify({ source: 'earn', ...payload }),
      // A slow CRM must not hold up the VA's confirmation screen.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return { synced: false, reason: `CRM responded ${response.status}` };
    }
    return { synced: true };
  } catch (error) {
    return {
      synced: false,
      reason: error instanceof Error ? error.message : 'CRM request failed',
    };
  }
}
