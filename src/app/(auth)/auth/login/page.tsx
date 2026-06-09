import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-ink-900">Sign in to Talkque</h1>
        <p className="mt-2 text-sm text-gray-500">Access your organization workspace.</p>
        <form className="mt-6 space-y-4">
          <Input type="email" placeholder="Email address" />
          <Input type="password" placeholder="Password" />
          <Button className="w-full">Sign in</Button>
        </form>
        <p className="mt-6 text-sm text-gray-500">No account? <Link className="text-brand-600" href="/auth/register">Create one</Link></p>
      </Card>
    </main>
  );
}
