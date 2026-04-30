'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/services/auth.service';
import { useAuth } from '@/app/providers/auth-provider';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login(email, password);
      setAuth(response.user, response.accessToken);
      router.push('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 w-full">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6">
          <h1 className="text-2xl  font-semibold tracking-tight text-zinc-950">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your email and password to continue.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">
            Email
          </span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-900"
            />
          </label>

          <label className="block">
          <span className="mb-1 block text-sm font-medium text-zinc-700">
            Password
          </span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
              className="h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-900"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 h-11 w-full rounded-xl bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Don’t have an account?{' '}
          <a href="/register" className="text-zinc-900 hover:underline">
            Sign up
          </a>
        </p>
        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}