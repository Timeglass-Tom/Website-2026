import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ATTENDANCE_BOUNTY_USD, SITE_URL, usd } from '@/config/program';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import './globals.css';

/**
 * The brand pairs Aeonik Pro for headlines with Inter for supporting copy and
 * UI. Inter is loaded exactly as specified. Aeonik Pro is licensed and cannot
 * ship from here, so Outfit stands in for it (see --font-display in
 * globals.css for how to swap the real face back in).
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Get paid ${usd(ATTENDANCE_BOUNTY_USD)} to introduce your boss to Timeglass`,
    template: '%s · Timeglass Earn',
  },
  description:
    'We pay virtual assistants to introduce their employer to a timesheet that fills itself in.',
  openGraph: {
    title: `Get paid ${usd(ATTENDANCE_BOUNTY_USD)} to introduce your boss to Timeglass`,
    description:
      'We pay virtual assistants to introduce their employer to a timesheet that fills itself in.',
    url: SITE_URL,
    siteName: 'Timeglass',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0c1b1d',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
