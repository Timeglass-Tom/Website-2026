-- ---------------------------------------------------------------------------
-- Row-level security for the earn schema.
--
-- Shape of the rules: a VA can read their own everything, insert their own
-- leads and evidence, and edit their own profile. Nothing else. Every write
-- that decides money — lead status, earnings, payouts, bookings, VA referral
-- qualification — is service-role only, so a VA cannot mark their own
-- introduction "attended" or clear their own hold.
-- ---------------------------------------------------------------------------

alter table public.earn_users             enable row level security;
alter table public.earn_referral_codes    enable row level security;
alter table public.earn_leads             enable row level security;
alter table public.earn_lead_status_events enable row level security;
alter table public.earn_lead_evidence     enable row level security;
alter table public.earn_va_referrals      enable row level security;
alter table public.earn_earnings          enable row level security;
alter table public.earn_payouts           enable row level security;
alter table public.earn_payout_events     enable row level security;
alter table public.earn_bookings          enable row level security;

-- users -------------------------------------------------------------------

create policy earn_users_select_own on public.earn_users
  for select using (auth.uid() = id);

create policy earn_users_update_own on public.earn_users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- The profile row is created by the signup handler under the service role, so
-- there is deliberately no client insert policy.

-- referral_codes ----------------------------------------------------------

create policy earn_referral_codes_select_own on public.earn_referral_codes
  for select using (auth.uid() = user_id);

-- leads -------------------------------------------------------------------

create policy earn_leads_select_own on public.earn_leads
  for select using (auth.uid() = user_id);

create policy earn_leads_insert_own on public.earn_leads
  for insert with check (auth.uid() = user_id);

-- Note there is no update policy: once a lead is submitted its status belongs
-- to the CRM and the booking webhook, not to the VA who submitted it.

-- lead_status_events ------------------------------------------------------

create policy earn_lead_status_events_select_own on public.earn_lead_status_events
  for select using (
    exists (
      select 1 from public.earn_leads l
      where l.id = lead_id and l.user_id = auth.uid()
    )
  );

-- evidence ----------------------------------------------------------------

create policy earn_lead_evidence_select_own on public.earn_lead_evidence
  for select using (auth.uid() = user_id);

create policy earn_lead_evidence_insert_own on public.earn_lead_evidence
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.earn_leads l
      where l.id = lead_id and l.user_id = auth.uid()
    )
  );

-- va_referrals ------------------------------------------------------------

-- A VA sees the people they referred. They do not see who referred them, and
-- there is no path to read another VA's downstream.
create policy earn_va_referrals_select_own on public.earn_va_referrals
  for select using (auth.uid() = referrer_id);

-- earnings / payouts ------------------------------------------------------

create policy earn_earnings_select_own on public.earn_earnings
  for select using (auth.uid() = user_id);

create policy earn_payouts_select_own on public.earn_payouts
  for select using (auth.uid() = user_id);

create policy earn_payout_events_select_own on public.earn_payout_events
  for select using (
    exists (
      select 1 from public.earn_payouts p
      where p.id = payout_id and p.user_id = auth.uid()
    )
  );

-- bookings ----------------------------------------------------------------

-- Bookings carry a third party's contact details and are never client-readable;
-- what the VA needs to see about a booking is reflected onto their own lead.
