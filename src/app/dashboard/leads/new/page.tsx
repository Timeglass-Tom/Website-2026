import Link from 'next/link';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { LeadForm } from './LeadForm';

export const metadata: Metadata = { title: 'Add a company' };

export default async function NewLeadPage() {
  const h = await headers();
  const detected =
    h.get('x-vercel-ip-country') ?? h.get('cf-ipcountry') ?? h.get('x-country-code');

  return (
    <div className="max-w-[34rem]">
      <Link href="/dashboard" className="text-[13.5px] text-muted hover:text-cream">
        ← Back
      </Link>

      <h1 className="mt-5 text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-cream">
        Who are you introducing?
      </h1>
      {/* The framing the PRD asks for, stated plainly and up front. This is the
          one thing standing between a VA and getting paid, and pretending
          otherwise would only cost us completions. */}
      <p className="mt-3 text-[15.5px] leading-[1.6] text-body">
        We need this so we can attribute the meeting to you and pay you. If this
        person — or anyone from their company — takes a call with us, it’s yours.
      </p>

      <div className="mt-8">
        <LeadForm defaultCountry={detected?.toUpperCase() ?? 'PH'} />
      </div>
    </div>
  );
}
