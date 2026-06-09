import Link from 'next/link';
import { Bot, Plus } from 'lucide-react';
import { AgentCard, type AgentCardData } from '@/components/agents/agent-card';
import { AgentForm } from '@/components/agents/agent-form';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentOrganization, createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const [{ new: createNew }, organization] = await Promise.all([
    searchParams,
    getCurrentOrganization(),
  ]);

  if (!organization) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-slate-500">
          Create or join an organization before managing voice agents.
        </CardContent>
      </Card>
    );
  }

  if (createNew === '1') {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand-700">Agent management</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">New voice agent</h1>
          </div>
          <Link href="/agents" className="text-sm font-medium text-slate-500 hover:text-slate-900">
            Cancel
          </Link>
        </div>
        <AgentForm mode="create" organizationName={organization.name} />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const agentsResult = await supabase
    .from('voice_agents')
    .select('*')
    .eq('organization_id', organization.id)
    .order('created_at', { ascending: false });
  if (agentsResult.error) {
    throw new Error(`Unable to load agents: ${agentsResult.error.message}`);
  }

  const versionIds = agentsResult.data
    .map((agent) => agent.active_version_id)
    .filter((id): id is string => Boolean(id));
  const versionsResult = versionIds.length
    ? await supabase
        .from('agent_versions')
        .select('*')
        .eq('organization_id', organization.id)
        .in('id', versionIds)
    : { data: [], error: null };
  if (versionsResult.error) {
    throw new Error(`Unable to load active agent versions: ${versionsResult.error.message}`);
  }
  const versionsById = new Map(versionsResult.data.map((version) => [version.id, version]));

  const agents: AgentCardData[] = agentsResult.data.map((agent) => {
    const version = agent.active_version_id ? versionsById.get(agent.active_version_id) : null;
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      defaultLanguageCode: agent.default_language_code,
      defaultDialectCode: agent.default_dialect_code,
      activeVersionNumber: version?.version_number ?? null,
      voiceProvider: version?.voice_provider ?? null,
      llmProvider: version?.llm_provider ?? null,
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-700">
            <Bot className="size-5" />
            <p className="text-sm font-semibold">Agent management</p>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Voice agents</h1>
          <p className="mt-2 text-sm text-slate-500">
            Configure multilingual behavior, providers, prompts, and releases.
          </p>
        </div>
        <Link
          href="/agents?new=1"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          <Plus className="mr-2 size-4" />
          Create new agent
        </Link>
      </div>

      {agents.length ? (
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
        </div>
      ) : (
        <Card className="mt-7 border-dashed">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <div className="rounded-2xl bg-brand-50 p-4 text-brand-700">
              <Bot className="size-7" />
            </div>
            <h2 className="mt-4 font-semibold text-slate-950">Create your first voice agent</h2>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Start with a draft, configure its languages and providers, then publish when it is ready.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
