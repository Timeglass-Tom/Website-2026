/**
 * The lead state machine, rendered. Wording is VA-facing: the database says
 * `meeting_booked`, the VA reads "Call booked", and the money-bearing states
 * (attended, converted, paid) are the only ones that get the accent colour.
 */
const LABELS: Record<string, { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-surface-raised text-body' },
  contacted: { label: 'We’ve reached out', className: 'bg-surface-raised text-body' },
  meeting_booked: { label: 'Call booked', className: 'bg-[#1c3a4a] text-[#93c5e8]' },
  attended: { label: 'Attended — you earned', className: 'bg-accent-wash text-accent' },
  converted: { label: 'Converted', className: 'bg-accent-wash text-accent' },
  paid: { label: 'Paid', className: 'bg-accent-wash text-accent' },
  rejected: { label: 'Closed', className: 'bg-surface-raised text-faint' },
};

export function StatusPill({ status }: { status: string }) {
  const entry = LABELS[status] ?? {
    label: status,
    className: 'bg-surface-raised text-body',
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
