import Link from 'next/link';
import { MarketingNav } from '@/components/layout/marketing-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  ['Multilingual phone agents', 'Bangla, Sylheti, English first - designed for global languages and dialects.'],
  ['Provider-agnostic voice stack', 'Use LiveKit, Retell, Vapi, Bland, or custom Twilio/SIP without redesigning SaaS.'],
  ['Answer trust layer', 'Show exactly which knowledge-base chunks supported each AI answer.'],
  ['Knowledge-gap loop', 'When the agent cannot answer, Talkque creates an actionable gap for admins.'],
  ['Caller memory with consent', 'Remember preferences and previous questions while keeping privacy controls.'],
  ['Outbox follow-ups', 'Reliable WhatsApp, SMS, and email summaries after calls.'],
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-white">
      <MarketingNav />
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
        <div>
          <Badge color="green">Global SaaS - multilingual voice agents</Badge>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-ink-900 md:text-6xl">
            Never miss another customer call.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Talkque answers calls 24/7 in the caller's language, searches your knowledge base, escalates when needed, and sends follow-up summaries.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/register"><Button className="px-6 py-3">Start free trial</Button></Link>
            <Link href="#features"><Button variant="secondary" className="px-6 py-3">See features</Button></Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600 md:grid-cols-4">
            {['24/7 calls', 'Global languages', 'RAG answers', 'Human handoff'].map((item) => <div key={item} className="rounded-xl bg-gray-50 p-4">{item}</div>)}
          </div>
        </div>
        <Card className="bg-sidebar p-6 text-white shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Live call simulation</p>
              <p className="font-semibold">Admission office agent</p>
            </div>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-200">Active</span>
          </div>
          <div className="space-y-4 text-sm">
            <div className="rounded-2xl bg-white/10 p-4">Caller: CSE admission fee koto?</div>
            <div className="rounded-2xl bg-brand-500 p-4">Talkque: CSE admission fee depends on program type. I found the latest fee details in your uploaded admission policy. Would you like the application deadline too?</div>
            <div className="rounded-2xl bg-white/10 p-4">System: Retrieved 3 knowledge chunks - confidence 0.86</div>
          </div>
        </Card>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold text-ink-900">Built around SaaS-grade operations</h2>
          <p className="mt-3 text-gray-600">The product is not hard-coded to Bangladesh or one provider. It is designed for global organizations.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, description]) => (
            <Card key={title}>
              <h3 className="font-semibold text-ink-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500">{description}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
