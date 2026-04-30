'use client';

import Link from 'next/link';
import { APP_NAME } from '@repo/shared';
import { logout } from '@/services/auth.service';
import { useAuth } from '@/app/providers/auth-provider';


export default function Home() {
  const { user, isAuthLoading, clearAuth } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearAuth();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          {APP_NAME}
        </h1>

        <div className="mt-4 text-sm text-zinc-600">
          {user ? (
            <p>Signed in as {user.email}</p>
          ) : (
            <p>You are not signed in</p>
          )}
        </div>

        <div className="mt-6">
          {user ? (
            <button
              onClick={handleLogout}
              className="h-11 cursor-pointer w-full rounded-xl bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Logout
            </button>
          ) : (
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/login"
                className="flex h-11 w-full items-center justify-center rounded-xl bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="flex h-11 w-full items-center justify-center rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}