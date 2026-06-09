import Link from 'next/link';
import { ArrowRight, Bot, Globe2, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Globe2,
    title: 'Multilingual by design',
    description: 'Configure languages, dialects, voices, and region-aware call flows from one workspace.',
  },
  {
    icon: ShieldCheck,
    title: 'Grounded answers',
    description: 'Use retrieval, confidence policies, and answer auditing to keep every conversation trustworthy.',
  },
  {
    icon: Bot,
    title: 'Provider independent',
    description: 'Switch voice, model, embedding, speech, and telephony providers behind stable contracts.',
  },
];

export default function MarketingPage() {
  return (
    <>
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <a href="#platform" className="hover:text-slate-950">Platform</a>
          <a href="#features" className="hover:text-slate-950">Features</a>
          <Link href="/login" className="hover:text-slate-950">Sign in</Link>
          <Link href="/signup" className="rounded-lg bg-sidebar px-4 py-2.5 font-medium text-white">
            Start building
          </Link>
        </nav>
      </header>
      <main>
        <section id="platform" className="relative overflow-hidden px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.13),transparent_32%)]" />
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
              <Sparkles className="size-3.5" />
              Global conversations, one operating system
            </div>
            <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
              AI phone agents that speak your customer&apos;s language.
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Build, deploy, and improve multilingual voice agents with reliable knowledge, global telephony,
              and provider flexibility.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
              >
                Create your first agent
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View dashboard
              </Link>
            </div>
          </div>
        </section>
        <section id="features" className="bg-surface px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-brand-700">Built for serious voice operations</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Everything your team needs to run AI calls with confidence.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="p-7">
                    <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                      <feature.icon className="size-5" />
                    </span>
                    <h3 className="mt-5 font-semibold text-slate-950">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
