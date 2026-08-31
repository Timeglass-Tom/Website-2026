'use client';

import { useEffect } from 'react';
import { track, type EarnEvent } from '@/lib/analytics';

/** Fires one funnel event when a server-rendered page mounts. */
export function TrackOnMount({
  event,
  properties,
}: {
  event: EarnEvent;
  properties?: Record<string, unknown>;
}) {
  useEffect(() => {
    track(event, properties);
    // Deliberately fires once per mount; properties are static per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
