'use client';

import { useState } from 'react';
import { EARN_EVENTS, track } from '@/lib/analytics';
import { pitchEmailBody, pitchEmailNote, pitchEmailSubject } from '@/content/pitch';

/**
 * Editable inline, with the VA's own ref-tagged booking link substituted in
 * before it is shown. Editing is the point, because a pitch in the VA's own
 * words from their own address is what books meetings, so the textarea is the
 * surface and stays fully editable.
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
    <div className="rounded-[16px] border border-deep-focus bg-deep-time p-5">
      <p className="text-[13.5px] leading-[1.62] text-dark-muted">{pitchEmailNote}</p>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-medium uppercase tracking-[0.13em] text-soft-signal">
            Subject
          </p>
          <button
            type="button"
            onClick={() => void copy('subject', pitchEmailSubject)}
            className="text-[13px] text-sand-gold hover:text-still-white"
          >
            {copied === 'subject' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-1.5 rounded-[10px] border border-deep-focus bg-time-dark-deep px-3 py-2.5 text-[14.5px] text-still-white">
          {pitchEmailSubject}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="pitch-body"
            className="text-[12px] font-medium uppercase tracking-[0.13em] text-soft-signal"
          >
            Email
          </label>
          <button
            type="button"
            onClick={() => void copy('body', body)}
            className="text-[13px] text-sand-gold hover:text-still-white"
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
          className="mt-1.5 w-full resize-y rounded-[10px] border border-deep-focus bg-time-dark-deep px-3.5 py-3 text-[14.5px] leading-[1.62] text-still-white focus:border-sand-gold focus:outline-none"
        />
      </div>
    </div>
  );
}
