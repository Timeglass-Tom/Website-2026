/**
 * Post-signup resources. These sit behind the signup wall on purpose, since the
 * landing page's only job is conversion to signup and the pitch email is the
 * reason a VA comes back to the dashboard.
 *
 * Same house style as the landing copy: no em dashes, complete sentences joined
 * with conjunctions, and headings of ten words or fewer that say something.
 */

export const pitchEmailNote =
  'This version books the most meetings in our testing. You are welcome to edit ' +
  'it, and you should send it from your work email, since pitches from personal ' +
  'addresses convert at a lower rate.';

export const pitchEmailSubject = 'Something I’ve been using that would help both of us';

/**
 * Written in the VA's voice rather than a marketing voice, which is the whole
 * reason it works. Placeholders are square-bracketed so they are obvious to
 * replace, and the booking link is substituted with the VA's own ref-tagged URL
 * before it is ever shown.
 */
export function pitchEmailBody({
  bossName = '[Boss]',
  vaName = '[Your name]',
  bookingUrl,
}: {
  bossName?: string;
  vaName?: string;
  bookingUrl: string;
}): string {
  return `Hi ${bossName},

I've been reading about a tool called Timeglass that a friend of mine uses at her job, and I think it would make things easier for both of us.

It's basically a timesheet that writes itself while I work. It reads what I'm doing as it happens and sorts it into the right client and project automatically. Here are a few reasons I think it's worth 15 minutes to look at:

1. You get a clear, accurate record of my work without me having to rebuild it at the end of the week.
2. It shows exactly where time is going by client and project, so you can see which work is profitable and which is leaking margin.
3. It replaces the manual status updates I send you.
4. Their team gives a live demo and there is no commitment.
5. If you don't like it, we've lost 15 minutes.

Here's a link to book a time that works for you: ${bookingUrl}

Thanks,
${vaName}`;
}

export type Collateral = {
  title: string;
  body: string;
  /** The line worth saying out loud, where there is one. */
  say?: string;
};

/**
 * What lands with agency-style buyers, in the order to lead with it. The first
 * point comes first for a reason, because it is the most emotional sore point
 * any agency-style shop has.
 */
export const collateral: Collateral[] = [
  {
    title: 'Kill the timesheet, keep the invoice',
    body:
      'VA companies live and die on billable-hour accuracy, and their people hate ' +
      'filling in timecards, so the numbers come out too low or too high. ' +
      'Timeglass tracks automatically while VAs get on with the work, and billable ' +
      'time reconciles itself against client and project categories. You should ' +
      'lead with this one, because it is the most emotional sore point for any ' +
      'agency-style shop.',
  },
  {
    title: 'Client profitability is the number they care about',
    body:
      'Show them the math live. This is the CFO-level sell, because it moves the ' +
      'conversation from an admin tool to money the business is currently losing.',
    say:
      'Client X’s pod is running at 62% utilization but you’re billing them at a ' +
      'fixed retainer, so you’re leaving margin on the table.',
  },
  {
    title: 'Tiered permissions give visibility while the team keeps trust',
    body:
      'VA companies sit with a real tension, because leads need to know their ' +
      'people are working and full-surveillance tools tank morale at the same ' +
      'time. The tiered permission model runs from individual to pod lead to ' +
      'admin, and everything is reviewed before it is released, so you can frame ' +
      'it as trust with accountability.',
  },
  {
    title: 'Contractors get to keep their own machines',
    body:
      'Most VA workforces are remote and working on personal machines. Exclusion ' +
      'lists and OS-profile guidance mean nobody has to push company laptops onto ' +
      'contractors, which makes hiring faster and cheaper.',
  },
  {
    title: 'Role sub-categories turn timesheets into hiring data',
    body:
      'Every VA role has three to six sub-activities. Once those are tagged, the ' +
      'owner can see patterns across the team, and that tells them something ' +
      'useful about training and hiring.',
    say:
      'Our top performers spend 40% on scoping calls, while our bottom performers ' +
      'spend 70% on messaging.',
  },
  {
    title: 'Seats grow with headcount without a procurement cycle',
    body:
      'Seats are monthly, they are opt-out, and they can be added as the team ' +
      'grows. VA companies hire and churn constantly, so they cannot stomach an ' +
      'annual seat lock-in.',
  },
];

export const dosAndDonts = {
  dos: [
    'Send it from your work email, because that is the single biggest thing that moves the booking rate.',
    'Edit the email so it sounds like you, since your boss knows how you write.',
    'Say plainly that it would make your own work easier, which is true and happens to be the most persuasive part.',
    'Follow up once, about four days later, if you hear nothing back.',
    'Tell us if they say no and why, and we will help you draft the follow-up.',
  ],
  donts: [
    'Sending this to people you do not actually work with will get your account suspended, since attribution is checked.',
    'Describing Timeglass as monitoring or tracking software kills the meeting, and it is inaccurate.',
    'Avoid promising your boss a discount, a free tier, or a price. If they ask, tell them to raise it on the call.',
    'Booking the call on your boss’s behalf does not count, because they have to attend it themselves.',
  ],
};
