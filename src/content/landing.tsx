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
 * layout component.
 *
 * House style for this file, on top of the brand voice:
 *   1. Never say "screenshots". Timeglass reads the work as it happens.
 *   2. Never frame Timeglass as monitoring, surveillance, or bossware.
 *   3. Name the transaction plainly. "Do this, get $35."
 *   4. No em dashes anywhere. Use commas or full stops.
 *   5. Complete sentences joined with conjunctions. No standalone fragments,
 *      no repeated sentence openings, no "X, not Y" constructions.
 *   6. Headings run to ten words at most and say something, rather than
 *      labelling the section they sit on.
 */

export const hero = {
  eyebrow: 'For virtual assistants',
  headline: `Introduce your boss to Timeglass. Get paid ${usd(ATTENDANCE_BOUNTY_USD)}.`,
  subhead:
    'We pay virtual assistants to introduce their employer to a timesheet that fills itself in.',
  cta: 'Get started',
  signInPrompt: 'Have an account?',
  signInCta: 'Sign in',
};

export const whatIsTimeglass = {
  heading: 'What is Timeglass?',
  paragraphs: [
    'Timeglass is a timesheet that writes itself while you work.',
    'VAs and their teams carry on with the work, and Timeglass reads what is happening as it happens, sorts it by client and project on its own, then hands over a finished timesheet to review in about a minute.',
    'The result is that Friday afternoons stop being an exercise in guesswork, the emails chasing missing time stop going out, and everyone gets a clear record of what the team worked on and how long it took.',
  ],
};

export const whyYourBoss = {
  heading: 'Why your boss will actually want this',
  tiles: [
    {
      title: 'The timesheet stops being a Friday afternoon job',
      body: 'Nobody has to rebuild the week from memory, because the record fills in while the work is happening.',
    },
    {
      title: 'Billable minutes get counted without anyone logging them',
      body: 'Every billable minute lands in the record, including the small ones that would usually go unlogged.',
    },
    {
      title: 'You can see which clients are quietly losing money',
      body: 'There is a live view of where the hours go by client and project, so the work that drains time shows up early.',
    },
  ],
};

export const howItWorks = {
  heading: 'How it works and how we pay you',
  steps: [
    {
      title: 'Sign up',
      body: 'It takes about a minute, and you get a referral code and a share link straight away.',
    },
    {
      title: 'Tell us who you are introducing',
      body: 'We need their name, their company, and their work email, because that is how we know to pay you. If that person or anyone from their company takes a call with us, the introduction is credited to you.',
    },
    {
      title: 'Send them the email',
      body: 'We give you a template that books meetings, and you send it from your work email.',
    },
    {
      title: 'Get paid',
      body: `The ${usd(
        ATTENDANCE_BOUNTY_USD,
      )} lands when they attend the call, and it is paid out within two weeks of the booking, often sooner.`,
    },
  ],
  footnote:
    'Everything is paid in USD every Friday once you have cleared $20, and you can take it through PayPal, Wise, GCash, Payoneer, or USDC.',
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
        They need to show up, and ten minutes on the call is enough to count. If
        they book a time and then miss it, that one does not pay out, though you
        are welcome to nudge them into rebooking.
      </p>
    ),
  },
  {
    q: 'What if my boss says no?',
    a: (
      <p>
        Let us know why they said no, because a real reason gives us something to
        work with. We can help you draft a follow-up or send over material that
        often gets people to reconsider, and we want the call booked as much as
        you do.
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
        Timeglass reads the work as it happens on the employee’s own machine, and
        it reads enough to sort that work into the right client and project.
        Privacy is built in, so personal information is anonymized automatically,
        there are granular controls over what gets captured, and the employee
        reviews and releases everything before a manager sees any of it. There is
        more detail on the{' '}
        <a
          href={SECURITY_URL}
          className="text-sand-gold underline underline-offset-[3px] hover:text-still-white"
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
        It takes about two weeks from the date the call was booked, and it is
        often sooner than that. Earnings are held for {PAYOUT_HOLD_DAYS} days
        after a call is marked attended, and then they go out with the next weekly
        payment run.
      </p>
    ),
  },
  {
    q: 'Can I refer other VAs?',
    a: (
      <p>
        Yes. Once you sign up you get a share link, and when another VA signs up
        through it and earns their first payout, you earn as well.
      </p>
    ),
  },
];

/**
 * The trust question, and the one place on the page where an unanswered open
 * item would be visible to a VA. Until real contact details for JM and Justin
 * are filled into `REFERENCES`, the answer stands on its own rather than
 * promising a reference we cannot hand over.
 */
function IsThisLegitAnswer() {
  const reachable = REFERENCES.filter((r) => r.contact);

  return (
    <div className="space-y-3">
      <p>
        Yes. Timeglass is a real company with real customers, and the offer is
        exactly what it says. You introduce us to the person you work for, they
        take a call with us, and we pay you {usd(ATTENDANCE_BOUNTY_USD)}. There is
        nothing for you to buy and nothing for you to pay us.
      </p>
      {reachable.length > 0 && (
        <div>
          <p>
            You are also welcome to contact people in the Philippines who work
            with Timeglass and can speak to it directly.
          </p>
          <ul className="mt-2 space-y-1">
            {reachable.map((r) => (
              <li key={r.name}>
                {r.name}, {r.contact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const footerCta = {
  heading: `Introduce one person and get ${usd(ATTENDANCE_BOUNTY_USD)}.`,
  body: 'You sign up, tell us who you are introducing, and send the email we write for you.',
  cta: 'Get started',
  note: `We pay ${usd(ATTENDANCE_BOUNTY_USD)} for every call that gets attended.`,
};
