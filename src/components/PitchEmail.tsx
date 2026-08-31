'use client';

import { useState } from 'react';
import { EARN_EVENTS, track } from '@/lib/analytics';
import { pitchEmailBody, pitchEmailNote, pitchEmailSubject } from '@/content/pitch';

/**
 * Editable inline, with the VA's own ref-tagged booking link already
 * substituted in. Editing is the point — a pitch in the VA's own words from the
 * VA's own address is what books meetings — so the textarea is the primary
 * surface, not a preview of something locked.
 */
export function PitchEmail({
  bookingUrl,
  vaName,
}: {
  bookingUrl: string;
  vaName: string;
}) {
  const [body, setBody] = useState(() =>
    pitchEmailBody({ bookingUrl, vaName: vaName || '[Your name]' }),
  );
  const [copied, setCopied] = useState<'subject' | 'body' | null>(null);

  async function copy(what: 'subject' | 'body', value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(what);
    if (what === 'body') track(EARN_EVENTS.pitchEmailCopied);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="rounded-[14px] border border-hairline bg-surface p-5">
      <p className="text-[13.5px] leading-[1.6] text-muted">{pitchEmailNote}</p>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-medium uppercase tracking-[0.13em] text-muted">
            Subject
          </p>
          <button
            type="button"
            onClick={() => void copy('subject', pitchEmailSubject)}
            className="text-[13px] text-accent hover:text-cream"
          >
            {copied === 'subject' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-1.5 rounded-[10px] border border-hairline bg-ground-deep px-3 py-2.5 text-[14.5px] text-cream">
          {pitchEmailSubject}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="pitch-body"
            className="text-[12px] font-medium uppercase tracking-[0.13em] text-muted"
          >
            Email
          </label>
          <button
            type="button"
            onClick={() => void copy('body', body)}
            className="text-[13px] text-accent hover:text-cream"
          >
            {copied === 'body' ? 'Copied' : 'Copy to clipboard'}
          </button>
        </div>
        <textarea
          id="pitch-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={22}
          spellCheck
          className="mt-1.5 w-full resize-y rounded-[10px] border border-hairline bg-ground-deep px-3.5 py-3 text-[14.5px] leading-[1.6] text-cream focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
}
