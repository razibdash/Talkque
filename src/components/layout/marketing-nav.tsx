import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MarketingNav() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <Link href="/" className="text-xl font-bold text-ink-900">Talkque</Link>
      <nav className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
        <a href="#features">Features</a>
        <a href="#markets">Markets</a>
        <a href="#pricing">Pricing</a>
      </nav>
      <div className="flex gap-3">
        <Link href="/auth/login"><Button variant="ghost">Sign in</Button></Link>
        <Link href="/auth/register"><Button>Start free</Button></Link>
      </div>
    </header>
  );
}
