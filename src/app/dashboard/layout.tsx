import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { SignOutButton } from '@/components/SignOutButton';
import { TIMEGLASS_URL } from '@/config/program';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-hairline-soft">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Logo href={TIMEGLASS_URL} />
          <nav className="flex items-center gap-1 text-[14px]">
            <Link
              href="/dashboard"
              className="rounded-[8px] px-2.5 py-1.5 text-body hover:text-cream"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/resources"
              className="rounded-[8px] px-2.5 py-1.5 text-body hover:text-cream"
            >
              Resources
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
