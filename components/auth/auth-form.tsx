'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type AuthFormProps = {
  mode: 'login' | 'signup' | 'forgot-password';
  nextPath?: string;
};

function safeRedirectPath(path?: string) {
  return path?.startsWith('/') && !path.startsWith('//') ? path : '/dashboard';
}

export function AuthForm({ mode, nextPath }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const title = isLogin ? 'Welcome back' : isSignup ? 'Create your workspace' : 'Reset your password';
  const description = isLogin
    ? 'Sign in to manage your AI phone agents.'
    : isSignup
      ? 'Start building multilingual customer conversations.'
      : 'We will send a secure reset link to your email.';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');
    const fullName = String(formData.get('fullName') ?? '').trim();

    if (!email) {
      setError('Enter your work email.');
      setLoading(false);
      return;
    }

    if (mode !== 'forgot-password' && password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    if (isSignup && fullName.length < 2) {
      setError('Enter your full name.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) throw signInError;

        router.replace(safeRedirectPath(nextPath));
        router.refresh();
        return;
      }

      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          router.replace('/onboarding');
          router.refresh();
        } else {
          setSuccess('Check your email to confirm your account, then continue to onboarding.');
        }
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=1`,
      });

      if (resetError) throw resetError;
      setSuccess('Password reset instructions have been sent. Check your inbox.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{description}</p>

      {success ? (
        <div className="mt-6 flex gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-700">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>{success}</span>
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {isSignup ? (
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Full name
            <Input name="fullName" autoComplete="name" placeholder="Amina Rahman" required />
          </label>
        ) : null}
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          Work email
          <Input name="email" autoComplete="email" placeholder="you@company.com" type="email" required />
        </label>
        {mode !== 'forgot-password' ? (
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            Password
            <Input
              name="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={8}
              placeholder="At least 8 characters"
              type="password"
              required
            />
          </label>
        ) : null}
        {isLogin ? (
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-medium text-brand-700 hover:text-brand-600">
              Forgot password?
            </Link>
          </div>
        ) : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {isLogin ? 'Sign in' : isSignup ? 'Create account' : 'Send reset link'}
        </Button>
      </form>

      {isLogin ? (
        <Button className="mt-3 w-full" type="button" variant="outline" disabled>
          <Mail className="mr-2 size-4" />
          Magic link coming soon
        </Button>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-500">
        {isLogin ? 'New to Talkque?' : 'Already have an account?'}{' '}
        <Link
          href={isLogin ? '/signup' : '/login'}
          className="font-medium text-brand-700 hover:text-brand-600"
        >
          {isLogin ? 'Create an account' : 'Sign in'}
        </Link>
      </p>
    </div>
  );
}
