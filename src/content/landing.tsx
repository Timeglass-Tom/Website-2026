import type { ReactNode } from 'react';
import {
  ATTENDANCE_BOUNTY_USD,
  PAYOUT_HOLD_DAYS,
  REFERENCES,
  SECURITY_URL,
  usd,
} from '@/config/program';

/**
 * All landing-page copy lives here so it can be rewritten without touching a
 * layout component. Keep the register of the main site: plainspoken, confident,
 * lightly wry. Two hard brand lines apply to every word below —
 *
 *   1. Never say "screenshots". Timeglass reads the work as it happens.
 *   2. Never frame Timeglass as monitoring, surveillance, or bossware.
 *
 * And one line specific to this page: name the transaction plainly. "Do this,
 * get $35." Not "commissions", not "rewards".
 */

export const hero = {
  headline: `Introduce your boss to Timeglass. Get paid ${usd(ATTENDANCE_BOUNTY_USD)}.`,
  subhead:
    'Virtual assistants — get paid to introduce your employer to the software you already wish they used.',
  cta: 'Get started',
  signInPrompt: 'Already signed up?',
  signInCta: 'Sign in',
};

export const whatIsTimeglass = {
  heading: 'What is Timeglass?',
  paragraphs: [
    'Timeglass is a timesheet that writes itself while you work.',
    'Instead of stopping to log hours, VAs and their teams just do the work. Timeglass reads what’s happening as it happens, sorts it by client and project on its own, and hands over a finished timesheet to review in about a minute.',
    'The result: no more Friday-afternoon guesswork, no more “is your time in yet?” reminders, and a clear record of exactly what the team worked on and how long it took.',
  ],
};

export const whyYourBoss = {
  heading: 'Why your boss will actually want this',
  tiles: [
    {
      title: 'Kill the timesheet.',
      body: 'No more end-of-week reconstruction. The record writes itself.',
    },
    {
      title: 'Prove your work.',
      body: 'Every billable minute is captured — including the ones nobody would have thought to log.',
    },
    {
      title: 'See where margin goes.',
      body: 'Live view of which clients and projects are profitable, which are draining time.',
    },
  ],
};

export const howItWorks = {
  heading: 'How it works — and how we pay you',
  steps: [
    {
      title: 'Sign up.',
      body: 'Takes a minute. You’ll get a referral code and a share link.',
    },
    {
      title: 'Tell us who you’re introducing.',
      body: 'Name, company, work email. This is how we know to pay you — if this person or someone from their company takes a call with us, we attribute it to you.',
    },
    {
      title: 'Send them the email.',
      body: 'We’ll give you a template that works. Send it from your work email.',
    },
    {
      title: 'Get paid.',
      body: `${usd(ATTENDANCE_BOUNTY_USD)} lands when they attend the call. Paid out within two weeks of the booking, often sooner.`,
    },
  ],
};

export type FaqItem = { q: string; a: ReactNode };

/**
 * Typed array so items are cheap to add, reorder, or A/B test. Answers are
 * ReactNode rather than string because several of them carry links.
 */
export const faq: FaqItem[] = [
  {
    q: 'What counts as a completed call?',
    a: (
      <p>
        They show up. Ten minutes on the call is enough. If they book and no-show,
        that one doesn’t pay — but you can nudge them to rebook.
      </p>
    ),
  },
  {
    q: 'What if my boss says no?',
    a: (
      <p>
        Tell us why. Feedback matters — with a real reason, we can help you draft a
        follow-up or send resources that often get people over the edge. We’re on
        your side on getting the call booked.
      </p>
    ),
  },
  {
    q: 'Is this legit?',
    a: <IsThisLegitAnswer />,
  },
  {
    q: 'What data does Timeglass collect?',
    a: (
      <p>
        Timeglass reads the work as it happens on the employee’s own machine —
        enough to sort it into the right client and project. It’s built to be
        privacy-first: automatic PII anonymization, granular controls over what’s
        captured, and the employee reviews and releases everything before a manager
        sees it. Full details on the{' '}
        <a
          href={SECURITY_URL}
          className="text-accent underline underline-offset-[3px] hover:text-cream"
          target="_blank"
          rel="noreferrer"
        >
          Timeglass security page
        </a>
        .
      </p>
    ),
  },
  {
    q: 'How long until I get paid?',
    a: (
      <p>
        Two weeks from when the call was booked. Sometimes sooner. Earnings are held{' '}
        {PAYOUT_HOLD_DAYS} days after a call is marked attended, then go out with the
        next weekly run.
      </p>
    ),
  },
  {
    q: 'Can I refer other VAs?',
    a: (
      <p>
        Yes — after signing up, you’ll get a share link. When another VA signs up
        through it and earns their first payout, you earn too.
      </p>
    ),
  },
];

/**
 * The trust question, and the one place on the page where an unanswered open
 * item would be visible to a VA. Until real contact details for JM and Justin
 * are filled into `REFERENCES`, we answer the question without promising a
 * reference we cannot yet hand over — an empty "[contact TBD]" would do more
 * damage here than saying less.
 */
function IsThisLegitAnswer() {
  const reachable = REFERENCES.filter((r) => r.contact);

  return (
    <div className="space-y-3">
      <p>
        Yes. Timeglass is a real company with real customers, and this is a real
        offer: you introduce us to the person you work for, they take a call, we pay
        you {usd(ATTENDANCE_BOUNTY_USD)}. There is nothing to buy and nothing to pay
        us for.
      </p>
      {reachable.length > 0 && (
        <div>
          <p>
            You’re also welcome to reach out to people in the Philippines who work
            with Timeglass and can speak to it directly:
          </p>
          <ul className="mt-2 space-y-1">
            {reachable.map((r) => (
              <li key={r.name}>
                {r.name} — {r.contact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const footerCta = {
  heading: `Introduce one person. Get ${usd(ATTENDANCE_BOUNTY_USD)}.`,
  body: 'Sign up, tell us who you’re introducing, send the email we write for you.',
  cta: 'Get started',
};
