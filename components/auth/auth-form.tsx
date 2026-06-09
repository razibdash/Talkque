import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AuthFormProps = {
  mode: 'login' | 'signup' | 'forgot-password';
};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const title = isLogin ? 'Welcome back' : isSignup ? 'Create your workspace' : 'Reset your password';
  const description = isLogin
    ? 'Sign in to manage your AI phone agents.'
    : isSignup
      ? 'Start building multilingual customer conversations.'
      : 'We will send a secure reset link to your email.';

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      <form className="mt-8 space-y-4">
        {isSignup ? <Input aria-label="Full name" placeholder="Full name" /> : null}
        <Input aria-label="Work email" placeholder="Work email" type="email" />
        {mode !== 'forgot-password' ? (
          <Input aria-label="Password" placeholder="Password" type="password" />
        ) : null}
        {isLogin ? (
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-medium text-brand-700 hover:text-brand-600">
              Forgot password?
            </Link>
          </div>
        ) : null}
        <Button className="w-full" type="submit">
          {isLogin ? 'Sign in' : isSignup ? 'Create account' : 'Send reset link'}
        </Button>
      </form>
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
