import { ButtonLink } from '@/components/Button';
import { Faq } from '@/components/Faq';
import { Logo } from '@/components/Logo';
import { TrackOnMount } from '@/components/TrackOnMount';
import { EARN_EVENTS } from '@/lib/analytics';
import { TIMEGLASS_URL } from '@/config/program';
import {
  faq,
  footerCta,
  hero,
  howItWorks,
  whatIsTimeglass,
  whyYourBoss,
} from '@/content/landing';

/**
 * The landing page has one job, which is converting a VA to signup. The pitch
 * email, the lead form and the collateral all sit behind the signup wall.
 *
 * The dark and cream blocks alternate the way the main marketing site does:
 * Time Dark carries the pitch, Still White carries the explanation.
 */
export default function LandingPage() {
  return (
    <>
      <TrackOnMount event={EARN_EVENTS.landingView} />

      <header className="border-b border-deep-focus/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo href={TIMEGLASS_URL} className="text-still-white" />
          <div className="flex items-center gap-2 sm:gap-3">
            <ButtonLink href="/sign-in" variant="ghost" className="text-[14px]">
              Sign in
            </ButtonLink>
            <ButtonLink
              href="/sign-up"
              arrow
              className="px-4 py-2 text-[14px] sm:px-5"
            >
              Get started
            </ButtonLink>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-sand-gold">
              {hero.eyebrow}
            </p>
            <h1 className="font-display text-balance mt-6 max-w-[19ch] text-[42px] font-light leading-[1.02] text-still-white sm:text-[68px]">
              {hero.headline}
            </h1>
            <p className="mt-7 max-w-[52ch] text-[17px] leading-[1.6] text-pale-flow sm:text-[19px]">
              {hero.subhead}
            </p>
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="/sign-up" arrow className="w-full sm:w-auto">
                {hero.cta}
              </ButtonLink>
              <p className="text-[14px] text-dark-muted">
                {hero.signInPrompt}{' '}
                <a
                  href="/earn/sign-in"
                  className="text-pale-flow underline underline-offset-[3px] hover:text-still-white"
                >
                  {hero.signInCta}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* What is Timeglass */}
        <section className="border-t border-deep-focus/60 px-6 py-18 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3 lg:gap-16">
            <h2 className="font-display text-[28px] font-normal leading-[1.12] text-still-white sm:text-[34px]">
              {whatIsTimeglass.heading}
            </h2>
            <div className="space-y-5 lg:col-span-2">
              {whatIsTimeglass.paragraphs.map((p) => (
                <p
                  key={p}
                  className="max-w-[62ch] text-[16.5px] leading-[1.68] text-pale-flow"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Still White block: the explanation and the mechanics */}
        <div className="bg-still-white text-time-dark">
          <section className="px-6 py-18 sm:py-24">
            <div className="mx-auto max-w-6xl">
              <h2 className="font-display max-w-[30ch] text-[28px] font-normal leading-[1.12] sm:text-[34px]">
                {whyYourBoss.heading}
              </h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {whyYourBoss.tiles.map((tile) => (
                  <div
                    key={tile.title}
                    className="rounded-[16px] border border-mist-grey bg-warm-sand p-6"
                  >
                    <h3 className="font-display text-[18px] font-medium leading-[1.25]">
                      {tile.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.62] text-still-current">
                      {tile.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 pb-20 sm:pb-28">
            <div className="mx-auto max-w-6xl">
              <h2 className="font-display max-w-[30ch] text-[28px] font-normal leading-[1.12] sm:text-[34px]">
                {howItWorks.heading}
              </h2>

              <ol className="mt-10 grid gap-x-12 gap-y-9 sm:grid-cols-2">
                {howItWorks.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="mt-[3px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-time-dark text-[13px] font-medium tabular-nums text-still-white">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-[18px] font-medium">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-[48ch] text-[15px] leading-[1.62] text-still-current">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-12 max-w-[64ch] text-[14px] leading-[1.62] text-soft-signal">
                {howItWorks.footnote}
              </p>
            </div>
          </section>
        </div>

        {/* Questions */}
        <section className="px-6 py-18 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-[28px] font-normal leading-[1.12] text-still-white sm:text-[34px]">
              Questions
            </h2>
            <div className="mt-9 max-w-3xl">
              <Faq items={faq} />
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="border-t border-deep-focus/60 px-6 py-18 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display max-w-[24ch] text-[32px] font-light leading-[1.06] text-still-white sm:text-[46px]">
              {footerCta.heading}
            </h2>
            <p className="mt-5 max-w-[52ch] text-[16.5px] leading-[1.62] text-pale-flow">
              {footerCta.body}
            </p>
            <ButtonLink href="/sign-up" arrow className="mt-9 w-full sm:w-auto">
              {footerCta.cta}
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-deep-focus/60 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo href={TIMEGLASS_URL} className="text-still-white" />
          <p className="text-[13.5px] text-soft-signal">{footerCta.note}</p>
        </div>
      </footer>
    </>
  );
}
