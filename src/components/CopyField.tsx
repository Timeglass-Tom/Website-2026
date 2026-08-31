'use client';

import { useState } from 'react';
import { track, type EarnEvent } from '@/lib/analytics';

/**
 * One-click copy. Referral codes and share links are the two things a VA needs
 * out of the dashboard fastest, and on a phone "select the text" is not a
 * realistic instruction.
 */
export function CopyField({
  label,
  value,
  event,
  mono = true,
}: {
  label: string;
  value: string;
  event?: EarnEvent;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Older mobile browsers and non-secure origins have no clipboard API.
      // Selecting the input is a workable fallback and better than nothing.
      return;
    }
    setCopied(true);
    if (event) track(event);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <p className="text-[12px] font-medium uppercase tracking-[0.13em] text-muted">
        {label}
      </p>
      <div className="mt-2 flex items-stretch gap-2">
        <input
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          className={`min-w-0 flex-1 rounded-[10px] border border-hairline bg-ground-deep px-3 py-2.5 text-[14px] text-cream ${
            mono ? 'font-mono' : ''
          }`}
        />
        <button
          type="button"
          onClick={() => void copy()}
          className="shrink-0 rounded-[10px] border border-hairline bg-surface px-4 text-[14px] font-medium text-cream transition-colors hover:bg-surface-raised"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
