# timeglass.ai/earn, VA referral program

A standalone referral site that pays virtual assistants to introduce Timeglass
to the person who employs them. It doubles as a lead-gen funnel: to be
attributed for a payout, a VA has to tell us who they're introducing, and that
lead flows to the CRM where sales can work it directly.

Built as a Next.js app served at the `/earn` **subpath** of `timeglass.ai`
rather than on a subdomain, so it shares the apex origin, and therefore cookies
and trust, with the main marketing site. `basePath: '/earn'` in `next.config.ts` handles
this; routes are authored as if they were at the root.

## Running it

```bash
npm install
cp .env.example .env.local   # every var is optional; see "Degrading gracefully"
npm run dev                  # http://localhost:3000/earn
```

```bash
npm run build       # production build
npm run typecheck   # tsc --noEmit
```

## Degrading gracefully

The PRD ships the landing page before anything else exists, so nothing on the
critical path hard-requires a credential:

| Missing | What happens |
|---|---|
| Supabase vars | Landing page is fully live. Signup and dashboard render a "not live yet" panel instead of throwing. |
| `EARN_CRM_WEBHOOK_URL` | Leads are still stored and attributed; `crm_synced_at` stays null. A CRM outage never costs us a lead. |
| Wise / PayPal creds | Those rails fall back to the manual provider, which queues the payout for a human rather than failing it. |
| PostHog key | Analytics no-op. |
| `EARN_BOOKING_WEBHOOK_SECRET` / `EARN_PAYOUT_RUN_SECRET` | Fail **closed**, the endpoint rejects everything. These two are deliberately not optional. |

## Database

`supabase/migrations/` holds the schema (`0001`) and the RLS policies (`0002`).
They have **not** been applied to any project, apply them with the Supabase CLI
or by pasting into the SQL editor:

```bash
supabase db push
```

Tables live in `public` with an `earn_` prefix so the program can share a project
with product tables without needing PostgREST reconfigured for an extra schema.
The mapping to the PRD's table names is documented at the top of `0001`.

The RLS shape: a VA reads their own rows, inserts their own leads and evidence,
and edits their own profile. **Every write that decides money**, lead status,
earnings, payouts, bookings, is service-role only, so a VA cannot mark their
own introduction attended or clear their own hold.

Auth uses Supabase Auth (email + password, Google, Facebook). The PRD suggested
Clerk with Supabase as the alternative; Supabase won because auth and the
database then share one set of credentials and RLS keys directly off
`auth.uid()`, which is what enforces the rule above. Facebook OAuth is not
optional, in the Philippines, Vietnam and Indonesia it is often the account a
VA actually remembers the password to.

## How the money works

1. A VA submits a lead (`POST /earn/api/leads`). Self-referrals are rejected;
   more than 5 leads in 24h flags the account for review but still accepts the
   lead.
2. The booking tool and CRM post to `POST /earn/api/bookings` with
   `booked` / `attended` / `no_show` / `converted`. Attribution runs in
   `lib/attribution.ts`.
3. `attended` accrues the $35 bounty into `earn_earnings` as `pending`, held 14
   days for fraud review. Flagged leads accrue nothing until a human clears them.
4. `POST /earn/api/payouts/run` (weekly scheduler, Friday) clears matured
   earnings, groups them per VA, skips anyone under $20, and sends through the
   rail they picked.

Attribution is the subtle part. A ref code on the booking link is strong
evidence but not automatically the winner: a VA who submitted the lead a week
before someone else's code showed up has the earlier claim and gets it. Ties
break on evidence, then on first submission. Two VAs with a claim on the same
domain and no other signal goes to review rather than guessing with someone's
money.

Payout rails sit behind the `PayoutProvider` interface in `lib/payouts/`, so
adding Payoneer or USDC is a new file rather than a change to the ledger.

## The hero image

**`public/hero.jpg` is not in the repo and has to be added.** While it is
absent the hero falls back to the Time Dark ground and still reads as intended,
so nothing breaks. Drop the photograph in at that exact path and it appears.

Ship it around 2400px wide and compressed. `object-position: 62% 42%` keeps the
subject in frame as the viewport narrows, and that value is in `globals.css` if
a different crop suits the photograph better.

The type sits over the photograph behind a two-gradient scrim: a gentle vertical
one blending into the header above and the section below, and a strong
horizontal one under the text column. The opacities look heavy because they are
set against the worst case, which is a blown-out white pixel behind the type.

Contrast was measured rather than eyeballed, by rendering the built page over a
pure white frame and sampling the composited pixels behind the actual glyph
boxes. Every line clears WCAG AA at every width tested, and since the test
background is pure white, a real photograph can only improve on these:

| Line | Required | Worst measured |
|---|---|---|
| Eyebrow, Sand Gold on photo | 4.5:1 | 5.38:1 |
| Headline, Still White | 3:1 (large text) | 6.10:1 |
| Sub-headline | 4.5:1 | 7.16:1 |
| Sign-in line | 4.5:1 | 7.18:1 |

Tested at 360, 390, 600, 768, 820, 1024, 1280, 1440 and 1920px wide. The scrim
has three tiers, because between 768px and 1280px the text still spans the frame
and the falloff has to stay high, while above 1280px the container stops growing
and the photograph can be let through on the right.

Note that `next/image` does not prefix `basePath` onto the `url` param it hands
the optimizer, so the hero builds its src from the shared `BASE_PATH` constant
in `src/config/site.ts`. A bare `/hero.jpg` resolves to a file that does not
exist and the optimizer answers 400.

## Design and copy

Everything visual comes from the Timeglass 2026 Digital Brand Guidelines rather
than from invention. `src/app/globals.css` carries the palette with the guide's
own swatch names, so a designer reading the CSS and a designer reading the PDF
are looking at the same thing:

| Role | Swatch | Hex |
|---|---|---|
| Page ground, dark blocks | Time Dark | `#0C1B1D` |
| Page ground, light blocks | Still White | `#FAF8F4` |
| Accent, every primary action | Sand Gold | `#DA9944` |
| Cards on light, borders on dark | Warm Sand, Deep Focus | `#F0EFEB`, `#243E41` |
| Body copy on light, on dark | Still Current, Pale Flow | `#485759`, `#C1D0D2` |

Dark and light blocks alternate the way the main marketing site does, with Time
Dark carrying the pitch and Still White carrying the explanation.

**Typography.** The guide pairs Aeonik Pro for headlines with Inter for
supporting copy and UI, and sets every headline at -4% letter spacing. Inter is
loaded exactly as specified. Aeonik Pro is licensed and cannot ship from this
repo, so the display stack lists it first and falls back to Outfit, the closest
geometric grotesque on Google Fonts. Self-host the licensed face and the
fallback stops being used with no other change. The -4% tracking is bound to the
`.font-display` class so no heading can be set without it.

**The mark** is redrawn as inline SVG in `src/components/Logo.tsx`: two curved
halves whose negative space forms the hourglass, wide at top and bottom and
pinched at the waist. It takes `currentColor`, since the guidelines forbid
recolouring the mark on its own.

### Where the copy lives

- `src/content/landing.tsx` for every word of the landing page, plus the FAQ as
  a typed `{ q, a: ReactNode }[]`.
- `src/content/pitch.ts` for the pitch email template and the "how to pitch your
  boss" collateral.
- `src/config/program.ts` for payout amounts, thresholds, and every open
  question from PRD §13.

House style, enforced by hand across every user-facing string:

- No em dashes anywhere. Commas and full stops do the work instead.
- Complete sentences joined with conjunctions, so there are no standalone
  fragments, no repeated sentence openings, and no "X, not Y" constructions.
- Headings run to ten words at most and say something, rather than labelling the
  section they sit on.
- A banned-word list is avoided throughout, including "unlock", "leverage",
  "insights", "already", "matters", "ensure", "impact", "transform", and
  "discover".

Two brand rules carry over from the main site and are hard lines: never say
"screenshots", because Timeglass reads the work as it happens, and never frame
Timeglass as monitoring, surveillance, or bossware. A third applies only here,
which is that the transaction gets named plainly. "Do this, get $35."

## Still open

Tracked in `src/config/program.ts`, where each is `null` and every surface that
would render it degrades rather than showing a placeholder to a VA:

- **Conversion bounty amount** and the definition of "converted". Conversions are
  recorded on the lead, so these are payable retroactively once the number lands.
- **VA-to-VA referral amount.** Same, the relationship is recorded at signup.
- **JM and Justin's contact details** for the "Is this legit?" FAQ. The answer
  currently stands on its own and omits the reference list.
- **CRM webhook endpoint.**
- KYC threshold for large payouts, and legal review of paying non-US individuals
  for lead-gen.

Not built, in the PRD's own ship order: evidence upload has a table, RLS policy
and storage path column but no UI (§8.7, priority 9); the Wise and PayPal
providers have real shapes but stubbed HTTP calls (priority 10). The leaderboard
is deliberately absent (§8.8), empty leaderboards kill credibility.
