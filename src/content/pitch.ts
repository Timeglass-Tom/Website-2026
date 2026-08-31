/**
 * Post-signup resources. These live behind the signup wall on purpose — the
 * landing page's only job is conversion to signup, and the pitch email is the
 * reason a VA comes back to the dashboard.
 */

export const pitchEmailNote =
  'We’ve found this version gets the most meetings booked. You can edit it — but ' +
  'send it from your work email, not a personal one. Personal-email pitches ' +
  'convert less.';

export const pitchEmailSubject = 'Something I’ve been using that would help both of us';

/**
 * Written in the VA's voice, not marketing's — that is the whole reason it
 * works. Placeholders are square-bracketed so they are obvious to replace, and
 * the booking link is substituted with the VA's own ref-tagged URL before it is
 * ever shown.
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

I've been reading about a tool called Timeglass that a friend of mine uses at her job, and I think it would actually make things easier for both of us.

It's basically a timesheet that writes itself while I work — it reads what I'm doing as it happens and sorts it into the right client and project automatically. A few reasons I think it's worth 15 minutes to look at:

1. You get a clear, accurate record of my work without me having to reconstruct it at the end of the week.
2. It shows exactly where time is going by client and project — so you can see which work is profitable and which is leaking margin.
3. It replaces the manual status updates I send you.
4. Their team gives a live demo, no commitment.
5. If you don't like it, we've lost 15 minutes.

Here's a link to book a time that works for you: ${bookingUrl}

Thanks,
${vaName}`;
}

export type Collateral = {
  title: string;
  body: string;
  /** The line to actually say, where there is one worth quoting verbatim. */
  say?: string;
};

/**
 * What actually resonates with agency-style buyers, in the order to lead with
 * it. Point 1 first is not arbitrary — it is the most emotional pain point any
 * agency-style shop has.
 */
export const collateral: Collateral[] = [
  {
    title: 'Kill the timesheet, keep the invoice.',
    body:
      'VA companies live and die on billable-hour accuracy, but their people hate ' +
      'filling timecards and often under- or over-report. Timeglass tracks ' +
      'automatically — VAs just do the work, and billable time reconciles itself ' +
      'against client and project categories. Lead with this. It’s the most ' +
      'emotional pain point for any agency-style shop.',
  },
  {
    title: 'Client-level profitability, not just hours logged.',
    body:
      'Show them the math live. This is the CFO-level sell — it moves the ' +
      'conversation from “admin tool” to “money we are currently losing.”',
    say:
      'Client X’s pod is running at 62% utilization but you’re billing them at a ' +
      'fixed retainer — you’re leaving margin on the table.',
  },
  {
    title: 'The right visibility for the right role — without feeling like spyware.',
    body:
      'VA companies have a real tension: leads need to know their people are ' +
      'actually working, but full-surveillance tools tank morale. The tiered ' +
      'permission model (individual → pod lead → admin) plus review-before-release ' +
      'is the answer. Frame it as trust with accountability.',
  },
  {
    title: 'BYOD-friendly.',
    body:
      'Most VA workforces are remote and on personal machines. Exclusion lists and ' +
      'OS-profile guidance mean nobody has to force company laptops on contractors. ' +
      'Big unlock for hiring speed and cost.',
  },
  {
    title: 'Role sub-categorization = performance data.',
    body:
      'Every VA role has 3–6 sub-activities. Once those are tagged, the owner can ' +
      'see patterns across the team — that’s a training and hiring insight, not a ' +
      'timesheet.',
    say:
      'Our top performers spend 40% on discovery, our bottom performers spend 70% ' +
      'on messaging.',
  },
  {
    title: 'Scales with headcount, no procurement friction.',
    body:
      'Monthly, opt-out, dynamic seat adds. VA companies hire and churn constantly ' +
      'and can’t stomach annual seat lock-ins.',
  },
];

export const dosAndDonts = {
  dos: [
    'Send it from your work email. It’s the single biggest thing that moves the booking rate.',
    'Edit the email so it sounds like you. Your boss knows how you write.',
    'Say plainly that it would make your own work easier. That’s true, and it’s the most persuasive part.',
    'Follow up once, about four days later, if you hear nothing.',
    'Tell us if they say no, and why. We’ll help you draft the follow-up.',
  ],
  donts: [
    'Don’t send it to people you don’t actually work with. Attribution is checked, and mass-blasted pitches get accounts suspended.',
    'Don’t describe Timeglass as monitoring or tracking software. It isn’t, and that framing kills the meeting.',
    'Don’t promise your boss a discount, a free tier, or a price. If they ask, tell them to ask us on the call.',
    'Don’t sign your boss up yourself or book the call on their behalf. They have to attend for it to pay.',
  ],
};
