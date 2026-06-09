import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold text-ink-900">Set up your first Talkque agent</h1>
        <p className="mt-2 text-gray-500">Create organization, choose providers, configure languages, and upload knowledge.</p>
        <div className="mt-8 grid gap-6">
          <Card>
            <h2 className="font-semibold text-ink-900">1. Organization</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input placeholder="Organization name" />
              <Input placeholder="Country, e.g. BD, UK, US" />
              <Input placeholder="Industry, e.g. Education, Healthcare" />
              <Input placeholder="Default timezone" />
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold text-ink-900">2. Agent and languages</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input placeholder="Agent name" />
              <Input placeholder="Default language: en / bn" />
            </div>
            <Textarea className="mt-4" placeholder="First message / greeting" />
          </Card>
          <Card>
            <h2 className="font-semibold text-ink-900">3. Knowledge base</h2>
            <p className="mt-2 text-sm text-gray-500">Upload FAQs, policy docs, admission documents, clinic procedures, or business information.</p>
            <div className="mt-4 rounded-2xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">Drop PDF, DOCX, TXT or CSV files here</div>
          </Card>
          <div className="flex justify-end"><Button>Create workspace</Button></div>
        </div>
      </div>
    </main>
  );
}
