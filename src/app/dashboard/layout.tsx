import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { SignOutButton } from '@/components/SignOutButton';
import { TIMEGLASS_URL } from '@/config/program';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-deep-focus/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Logo href={TIMEGLASS_URL} className="text-still-white" />
          <nav className="flex items-center gap-1 text-[14px]">
            <Link
              href="/dashboard"
              className="rounded-full px-2.5 py-1.5 text-pale-flow hover:text-still-white"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/resources"
              className="rounded-full px-2.5 py-1.5 text-pale-flow hover:text-still-white"
            >
              Resources
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-9 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}
