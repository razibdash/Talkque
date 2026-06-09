import { Building2, Check, Languages, Phone } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-surface px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Logo />
        <div className="mt-10 flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-white"><Check className="size-3.5" /></span>
          Account
          <span className="h-px flex-1 bg-slate-200" />
          <span className="grid size-6 place-items-center rounded-full bg-sidebar text-white">2</span>
          Workspace
          <span className="h-px flex-1 bg-slate-200" />
          <span className="grid size-6 place-items-center rounded-full bg-slate-200">3</span>
          First agent
        </div>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Tell us about your operation</CardTitle>
            <CardDescription>These defaults help Talkque prepare your multilingual workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span className="flex items-center gap-2"><Building2 className="size-4" /> Organization name</span>
              <Input placeholder="Acme Support" />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2"><Languages className="size-4" /> Primary language</span>
                <Input placeholder="English" />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2"><Phone className="size-4" /> Calling region</span>
                <Input placeholder="United States" />
              </label>
            </div>
            <Button className="w-full sm:w-auto">Continue to agent setup</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
