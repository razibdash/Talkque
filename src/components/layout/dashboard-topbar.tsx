import { Button } from '@/components/ui/button';

export function DashboardTopbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/85 px-6 backdrop-blur lg:pl-80">
      <div>
        <p className="text-sm font-medium text-ink-900">Acme Global University</p>
        <p className="text-xs text-gray-500">Trial workspace - Provider: LiveKit + Groq</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary">Test agent</Button>
        <Button>Create agent</Button>
      </div>
    </header>
  );
}
