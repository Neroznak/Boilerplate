'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth-provider';

export default function AuthLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace('/');
    }
  }, [isAuthLoading, user, router]);

  if (isAuthLoading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      {children}
    </main>
  );
}