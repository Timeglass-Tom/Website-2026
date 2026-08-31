-- ---------------------------------------------------------------------------
-- timeglass.ai/earn — VA referral program schema
--
-- Lives in `public` with an `earn_` prefix rather than a dedicated schema: the
-- referral program may share a Supabase project with product tables, and a
-- prefix keeps the names collision-free without needing PostgREST to be
-- reconfigured to expose an extra schema. Mapping to the names in the PRD:
--
--   users              -> earn_users
--   referral_codes     -> earn_referral_codes
--   leads              -> earn_leads
--   lead_status_events -> earn_lead_status_events
--   va_referrals       -> earn_va_referrals
--   payouts            -> earn_payouts
--   payout_events      -> earn_payout_events
--
-- Every table is RLS-protected. A VA reads only their own rows; all writes that
-- move money or status happen server-side under the service role, so a VA can
-- never mark their own lead "attended".
-- ---------------------------------------------------------------------------

create extension if not exists pgcrypto;

-- --------------------------------------------------------------------------
-- Enums — the lead state machine and the payout lifecycle
-- --------------------------------------------------------------------------

create type earn_lead_status as enum (
  'submitted',
  'contacted',
  'meeting_booked',
  'attended',
  'converted',
  'paid',
  'rejected'
);

create type earn_earning_kind as enum (
  'attendance',      -- the introduced person showed up
  'phone_bonus',     -- verified phone/WhatsApp supplied and person attended
  'conversion',      -- the company became a paying customer
  'va_referral'      -- a VA who signed up on your link earned their first payout
);

create type earn_earning_status as enum (
  'pending',   -- accrued, inside the fraud-review hold window
  'cleared',   -- hold elapsed, eligible for the next payout run
  'paid',
  'void'       -- reversed by review
);

create type earn_payout_status as enum (
  'queued',
  'processing',
  'paid',
  'failed',
  'cancelled'
);

-- --------------------------------------------------------------------------
-- users
-- --------------------------------------------------------------------------

create table public.earn_users (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text        not null,
  full_name      text,
  country        text,
  payout_method  text,
  -- Payout destination (PayPal address, Wise recipient id, GCash number, …).
  -- Kept as jsonb because each rail needs a different shape; never exposed to
  -- any client but the owner's own session.
  payout_details jsonb,
  -- Set at signup when the VA arrived on another VA's share link. Denormalized
  -- here as well as in earn_va_referrals so attribution survives a code rename.
  referred_by_code text,
  -- 'active' | 'review' | 'suspended'. Anti-abuse flags land here.
  status         text        not null default 'active',
  signup_ip      inet,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- --------------------------------------------------------------------------
-- referral_codes
--
-- One active code per VA, but modelled as its own table so a code can be
-- rotated (abuse, a VA who published theirs somewhere they regret) without
-- orphaning the leads and signups already attributed to the old one.
-- --------------------------------------------------------------------------

create table public.earn_referral_codes (
  code       text        primary key,
  user_id    uuid        not null references public.earn_users (id) on delete cascade,
  is_active  boolean     not null default true,
  created_at timestamptz not null default now()
);

create unique index earn_referral_codes_one_active_per_user
  on public.earn_referral_codes (user_id)
  where is_active;

-- --------------------------------------------------------------------------
-- leads — the strategically important table. Each row is a company + superior
-- a VA intends to pitch, and the attribution claim that goes with it.
-- --------------------------------------------------------------------------

create table public.earn_leads (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.earn_users (id) on delete cascade,

  company_name       text not null,
  company_website    text,
  company_size       text,
  country            text,
  timezone           text,

  contact_name       text not null,
  contact_role       text,
  -- The VA's own words on how they know this person. Useful for both
  -- attribution ties and for sales working the lead directly.
  contact_relationship text,
  contact_email      text not null,
  -- Optional, incentivized: a verified number that attends earns PHONE_BONUS.
  contact_phone      text,
  contact_phone_verified_at timestamptz,

  pitch_channel      text,   -- email | in_person | chat | other

  status             earn_lead_status not null default 'submitted',
  -- Set when the booking webhook matches this lead, by ref code or by email.
  booked_at          timestamptz,
  attended_at        timestamptz,
  converted_at       timestamptz,

  -- Normalized company domain, derived from contact_email. Used for dedupe,
  -- attribution ties, and self-referral detection.
  contact_email_domain text generated always as (
    lower(split_part(contact_email, '@', 2))
  ) stored,

  -- Anti-abuse: set by review, never by the VA.
  flagged_reason     text,
  crm_synced_at      timestamptz,
  submitted_ip       inet,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index earn_leads_user_id_idx on public.earn_leads (user_id);
create index earn_leads_status_idx on public.earn_leads (status);
create index earn_leads_contact_email_idx on public.earn_leads (lower(contact_email));
create index earn_leads_domain_idx on public.earn_leads (contact_email_domain);

-- One VA cannot submit the same contact twice; two different VAs claiming the
-- same contact is allowed at insert time and resolved by the tie-break rules in
-- lib/attribution.ts (evidence first, then earliest submission).
create unique index earn_leads_user_contact_unique
  on public.earn_leads (user_id, lower(contact_email));

-- --------------------------------------------------------------------------
-- lead_status_events — append-only history behind each lead's current status.
-- --------------------------------------------------------------------------

create table public.earn_lead_status_events (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.earn_leads (id) on delete cascade,
  from_status earn_lead_status,
  to_status   earn_lead_status not null,
  -- 'crm' | 'booking_webhook' | 'admin' | 'system'
  source      text not null,
  note        text,
  created_at  timestamptz not null default now()
);

create index earn_lead_status_events_lead_idx
  on public.earn_lead_status_events (lead_id, created_at desc);

-- --------------------------------------------------------------------------
-- lead evidence — optional per-lead uploads. Explicitly not a payout gate:
-- attendance is the gate. Evidence only breaks attribution ties and surfaces
-- mass-blasted identical pitches.
-- --------------------------------------------------------------------------

create table public.earn_lead_evidence (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.earn_leads (id) on delete cascade,
  user_id     uuid not null references public.earn_users (id) on delete cascade,
  storage_path text not null,
  note        text,
  -- Hash of the uploaded file, so identical uploads across accounts are
  -- detectable without a human comparing images.
  content_hash text,
  created_at  timestamptz not null default now()
);

create index earn_lead_evidence_lead_idx on public.earn_lead_evidence (lead_id);
create index earn_lead_evidence_hash_idx on public.earn_lead_evidence (content_hash);

-- --------------------------------------------------------------------------
-- va_referrals — direct VA -> VA only. No multi-level tree, by design.
-- --------------------------------------------------------------------------

create table public.earn_va_referrals (
  id             uuid primary key default gen_random_uuid(),
  referrer_id    uuid not null references public.earn_users (id) on delete cascade,
  referred_id    uuid not null references public.earn_users (id) on delete cascade,
  code           text not null,
  -- Set when the referred VA earns their first payout, which is what triggers
  -- the referrer's bounty.
  qualified_at   timestamptz,
  created_at     timestamptz not null default now(),
  constraint earn_va_referrals_no_self check (referrer_id <> referred_id),
  constraint earn_va_referrals_once unique (referred_id)
);

create index earn_va_referrals_referrer_idx on public.earn_va_referrals (referrer_id);

-- --------------------------------------------------------------------------
-- earnings — the ledger. One row per thing we owe a VA. Payouts settle these;
-- the two are kept separate so a payout can be retried or split across rails
-- without touching what was earned.
-- --------------------------------------------------------------------------

create table public.earn_earnings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.earn_users (id) on delete cascade,
  lead_id      uuid references public.earn_leads (id) on delete set null,
  va_referral_id uuid references public.earn_va_referrals (id) on delete set null,
  kind         earn_earning_kind not null,
  amount_usd   numeric(10, 2) not null check (amount_usd >= 0),
  status       earn_earning_status not null default 'pending',
  -- Hold expiry: 14 days after the triggering event, for fraud review.
  clears_at    timestamptz not null,
  payout_id    uuid,
  note         text,
  created_at   timestamptz not null default now(),
  -- An attendance bounty is paid once per lead, and so is a phone bonus. This
  -- is the ledger's guard against a status flapping attended -> booked ->
  -- attended and paying twice.
  constraint earn_earnings_once_per_lead_kind unique (lead_id, kind)
);

create index earn_earnings_user_idx on public.earn_earnings (user_id, status);
create index earn_earnings_clears_at_idx on public.earn_earnings (clears_at)
  where status = 'pending';

-- --------------------------------------------------------------------------
-- payouts + payout_events
-- --------------------------------------------------------------------------

create table public.earn_payouts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.earn_users (id) on delete cascade,
  amount_usd   numeric(10, 2) not null check (amount_usd > 0),
  method       text not null,
  status       earn_payout_status not null default 'queued',
  -- Identifier returned by the rail (Wise transfer id, PayPal batch id, tx hash).
  provider_ref text,
  -- What the VA actually receives, for the payout screen.
  local_currency text,
  local_amount   numeric(14, 2),
  failure_reason text,
  created_at   timestamptz not null default now(),
  paid_at      timestamptz
);

create index earn_payouts_user_idx on public.earn_payouts (user_id, created_at desc);

alter table public.earn_earnings
  add constraint earn_earnings_payout_fk
  foreign key (payout_id) references public.earn_payouts (id) on delete set null;

create table public.earn_payout_events (
  id         uuid primary key default gen_random_uuid(),
  payout_id  uuid not null references public.earn_payouts (id) on delete cascade,
  status     earn_payout_status not null,
  detail     jsonb,
  created_at timestamptz not null default now()
);

create index earn_payout_events_payout_idx
  on public.earn_payout_events (payout_id, created_at desc);

-- --------------------------------------------------------------------------
-- Bookings — raw rows from the booking webhook, kept even when they cannot be
-- attributed to anyone. An unattributed booking is a lead-gen signal in its own
-- right, and a later-submitted lead can still be matched against it.
-- --------------------------------------------------------------------------

create table public.earn_bookings (
  id             uuid primary key default gen_random_uuid(),
  external_id    text unique,
  ref_code       text,
  attendee_email text not null,
  attendee_name  text,
  company_domain text generated always as (
    lower(split_part(attendee_email, '@', 2))
  ) stored,
  scheduled_at   timestamptz,
  attended_at    timestamptz,
  lead_id        uuid references public.earn_leads (id) on delete set null,
  attributed_user_id uuid references public.earn_users (id) on delete set null,
  -- How attribution was decided: 'ref_code' | 'lead_email' | 'lead_domain' |
  -- 'unattributed'. Recorded so a disputed payout can be explained.
  attribution_method text,
  raw            jsonb,
  created_at     timestamptz not null default now()
);

create index earn_bookings_email_idx on public.earn_bookings (lower(attendee_email));

-- --------------------------------------------------------------------------
-- updated_at maintenance
-- --------------------------------------------------------------------------

create or replace function public.earn_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger earn_users_touch
  before update on public.earn_users
  for each row execute function public.earn_touch_updated_at();

create trigger earn_leads_touch
  before update on public.earn_leads
  for each row execute function public.earn_touch_updated_at();
