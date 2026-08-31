import { ButtonLink } from '@/components/Button';
import { Faq } from '@/components/Faq';
import { Logo } from '@/components/Logo';
import { TrackOnMount } from '@/components/TrackOnMount';
import { EARN_EVENTS } from '@/lib/analytics';
import {
  ATTENDANCE_BOUNTY_USD,
  MIN_PAYOUT_USD,
  PAYOUT_DAY,
  TIMEGLASS_URL,
  usd,
} from '@/config/program';
import {
  faq,
  footerCta,
  hero,
  howItWorks,
  whatIsTimeglass,
  whyYourBoss,
} from '@/content/landing';

/**
 * The landing page has one job: convert a VA to signup. Everything else the
 * PRD describes — the pitch email, the lead form, the collateral — lives behind
 * the signup wall, deliberately. Nothing here needs client JS except the single
 * analytics ping.
 */
export default function LandingPage() {
  return (
    <>
      <TrackOnMount event={EARN_EVENTS.landingView} />

      <header className="border-b border-hairline-soft">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Logo href={TIMEGLASS_URL} />
          <ButtonLink href="/sign-in" variant="ghost" className="text-[14px]">
            Sign in
          </ButtonLink>
        </div>
      </header>

      <main>
        {/* A. Hero */}
        <section className="px-6 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              For virtual assistants
            </p>
            <h1 className="mt-5 max-w-[21ch] text-[38px] font-medium leading-[1.06] tracking-[-0.025em] text-cream sm:text-[56px]">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.6] text-body sm:text-[19px]">
              {hero.subhead}
            </p>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="/sign-up" className="w-full sm:w-auto">
                {hero.cta}
              </ButtonLink>
              <p className="text-[14px] text-muted">
                {hero.signInPrompt}{' '}
                <a
                  href="/earn/sign-in"
                  className="text-body underline underline-offset-[3px] hover:text-cream"
                >
                  {hero.signInCta}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* B. What is Timeglass? */}
        <section className="border-t border-hairline-soft px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3 lg:gap-14">
            <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-cream sm:text-[30px]">
              {whatIsTimeglass.heading}
            </h2>
            <div className="space-y-5 lg:col-span-2">
              {whatIsTimeglass.paragraphs.map((p) => (
                <p key={p} className="max-w-[62ch] text-[16.5px] leading-[1.68] text-body">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* C. Why your boss will actually want this */}
        <section className="border-t border-hairline-soft px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-cream sm:text-[30px]">
              {whyYourBoss.heading}
            </h2>
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {whyYourBoss.tiles.map((tile) => (
                <div
                  key={tile.title}
                  className="rounded-[14px] border border-hairline bg-surface p-6"
                >
                  <h3 className="text-[16.5px] font-medium text-cream">{tile.title}</h3>
                  <p className="mt-2.5 text-[15px] leading-[1.6] text-body">{tile.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* D. How it works — and how we pay you */}
        <section className="border-t border-hairline-soft px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-cream sm:text-[30px]">
              {howItWorks.heading}
            </h2>
            <ol className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {howItWorks.steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-accent-wash text-[13px] font-medium text-accent tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-[16.5px] font-medium text-cream">{step.title}</h3>
                    <p className="mt-1.5 max-w-[46ch] text-[15px] leading-[1.6] text-body">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-10 max-w-[62ch] text-[14px] leading-[1.6] text-muted">
              Paid in USD, every {PAYOUT_DAY}, once you’ve cleared{' '}
              {usd(MIN_PAYOUT_USD)}. PayPal, Wise, GCash, Payoneer or USDC — your
              pick.
            </p>
          </div>
        </section>

        {/* E. FAQ */}
        <section className="border-t border-hairline-soft px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-cream sm:text-[30px]">
              Questions
            </h2>
            <div className="mt-8 max-w-3xl">
              <Faq items={faq} />
            </div>
          </div>
        </section>

        {/* F. Footer CTA */}
        <section className="border-t border-hairline-soft px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="max-w-[24ch] text-[30px] font-medium leading-[1.1] tracking-[-0.02em] text-cream sm:text-[38px]">
              {footerCta.heading}
            </h2>
            <p className="mt-4 max-w-[46ch] text-[16.5px] leading-[1.6] text-body">
              {footerCta.body}
            </p>
            <ButtonLink href="/sign-up" className="mt-8 w-full sm:w-auto">
              {footerCta.cta}
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline-soft px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo href={TIMEGLASS_URL} />
          <p className="text-[13.5px] text-faint">
            {usd(ATTENDANCE_BOUNTY_USD)} per attended call. No-shows don’t pay.
          </p>
        </div>
      </footer>
    </>
  );
}
