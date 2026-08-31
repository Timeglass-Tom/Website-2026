import type { Metadata, Viewport } from 'next';
import { ATTENDANCE_BOUNTY_USD, SITE_URL, usd } from '@/config/program';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Get paid ${usd(ATTENDANCE_BOUNTY_USD)} to introduce your boss to Timeglass`,
    template: '%s · Timeglass Earn',
  },
  description:
    'Virtual assistants: get paid to introduce your employer to the software you already wish they used.',
  openGraph: {
    title: `Get paid ${usd(ATTENDANCE_BOUNTY_USD)} to introduce your boss to Timeglass`,
    description:
      'Virtual assistants: get paid to introduce your employer to the software you already wish they used.',
    url: SITE_URL,
    siteName: 'Timeglass',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b1a1c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
