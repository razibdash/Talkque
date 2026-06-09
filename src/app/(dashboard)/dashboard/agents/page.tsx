import { PageHeader } from '@/components/saas/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const sections = ["Published agent versions", "Language configs", "Provider config", "Phone routing"];

export default function AgentsPage() {
  return (
    <div>
      <PageHeader
        title="Agents"
        description="Create, publish, version, and test AI voice agents for each organization."
        actions={<Button>New agent</Button>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => (
          <Card key={section}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink-900">{section}</h2>
              <Badge color="green">Ready</Badge>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              This panel maps to the Talkque SaaS database domain and should be connected to Supabase queries.
            </p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <h2 className="font-semibold text-ink-900">Implementation notes</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Keep all queries tenant-scoped by organization_id. Use server actions or route handlers for writes, and apply Supabase RLS for security.
        </p>
      </Card>
    </div>
  );
}
