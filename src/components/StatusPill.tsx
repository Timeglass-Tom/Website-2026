/**
 * The lead state machine, rendered. The wording is VA-facing, so the database
 * says `meeting_booked` and the VA reads "Call booked". Only the states that
 * carry money take Sand Gold.
 */
const LABELS: Record<string, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-deep-time text-pale-flow' },
  contacted: { label: 'We have reached out', className: 'bg-deep-time text-pale-flow' },
  meeting_booked: { label: 'Call booked', className: 'bg-glass-teal/40 text-quiet-glass' },
  attended: { label: 'Attended', className: 'bg-sand-gold/15 text-sand-gold' },
  converted: { label: 'Converted', className: 'bg-sand-gold/15 text-sand-gold' },
  paid: { label: 'Paid', className: 'bg-sand-gold text-time-dark' },
  rejected: { label: 'Closed', className: 'bg-deep-time text-soft-signal' },
};

export function StatusPill({ status }: { status: string }) {
  const entry = LABELS[status] ?? {
    label: status,
    className: 'bg-deep-time text-pale-flow',
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-[4px] text-[12px] font-medium ${entry.className}`}
    >
      {entry.label}
    </span>
  );
}

export const LEAD_STATUS_ORDER = [
  'submitted',
  'contacted',
  'meeting_booked',
  'attended',
  'converted',
  'paid',
] as const;
