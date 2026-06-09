import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-ink-900">Create your Talkque workspace</h1>
        <p className="mt-2 text-sm text-gray-500">Start with one organization and one AI phone agent.</p>
        <form className="mt-6 space-y-4">
          <Input placeholder="Full name" />
          <Input type="email" placeholder="Work email" />
          <Input type="password" placeholder="Password" />
          <Button className="w-full">Continue to onboarding</Button>
        </form>
        <p className="mt-6 text-sm text-gray-500">Already have an account? <Link className="text-brand-600" href="/auth/login">Sign in</Link></p>
      </Card>
    </main>
  );
}
