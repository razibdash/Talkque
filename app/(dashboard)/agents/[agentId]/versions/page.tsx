import Link from 'next/link';
import { notFound } from 'next/navigation';
import { History } from 'lucide-react';
import { VersionHistory, type VersionHistoryItem } from '@/components/agents/version-history';
import { createSupabaseServerClient, getCurrentOrganization } from '@/lib/supabase/server';

export default async function AgentVersionsPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const [{ agentId }, organization] = await Promise.all([params, getCurrentOrganization()]);
  if (!organization) notFound();

  const supabase = await createSupabaseServerClient();
  const [agentResult, versionsResult] = await Promise.all([
    supabase
      .from('voice_agents')
      .select('*')
      .eq('organization_id', organization.id)
      .eq('id', agentId)
      .maybeSingle(),
    supabase
      .from('agent_versions')
      .select('*')
      .eq('organization_id', organization.id)
      .eq('agent_id', agentId)
      .order('version_number', { ascending: false }),
  ]);
  if (agentResult.error) throw new Error(`Unable to load agent: ${agentResult.error.message}`);
  if (versionsResult.error) throw new Error(`Unable to load versions: ${versionsResult.error.message}`);
  if (!agentResult.data) notFound();
  const agent = agentResult.data;

  const versions: VersionHistoryItem[] = versionsResult.data.map((version) => ({
    id: version.id,
    versionNumber: version.version_number,
    status: version.status,
    createdAt: version.created_at,
    publishedAt: version.published_at,
    systemPrompt: version.system_prompt,
    llmProvider: version.llm_provider,
    llmModel: version.llm_model,
    voiceProvider: version.voice_provider,
    sttProvider: version.stt_provider,
    ttsProvider: version.tts_provider,
    embeddingProvider: version.embedding_provider,
    isActive: version.id === agent.active_version_id,
  }));

  return (
    <div>
      <Link href={`/agents/${agentId}`} className="text-sm font-medium text-brand-700 hover:text-brand-600">
        ← {agent.name}
      </Link>
      <div className="mt-3 flex items-center gap-3">
        <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
          <History className="size-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Version history</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review provider configuration, prompt changes, and release status.
          </p>
        </div>
      </div>
      <div className="mt-7">
        <VersionHistory agentId={agentId} versions={versions} />
      </div>
    </div>
  );
}
