'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    try {
      await createClient().auth.signOut();
    } finally {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="rounded-full px-2.5 py-1.5 text-[14px] text-soft-signal hover:text-still-white"
    >
      Sign out
    </button>
  );
}
