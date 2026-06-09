import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock3, ExternalLink, History, Phone } from 'lucide-react';
import { AgentForm, type AgentFormData } from '@/components/agents/agent-form';
import { AgentStatusBadge } from '@/components/agents/agent-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildAgentSystemPrompt } from '@/lib/agents/prompt-builder';
import { createSupabaseServerClient, getCurrentOrganization } from '@/lib/supabase/server';

export default async function AgentPage({ params }: { params: Promise<{ agentId: string }> }) {
  const [{ agentId }, organization] = await Promise.all([params, getCurrentOrganization()]);
  if (!organization) notFound();

  const supabase = await createSupabaseServerClient();
  const agentResult = await supabase
    .from('voice_agents')
    .select('*')
    .eq('organization_id', organization.id)
    .eq('id', agentId)
    .maybeSingle();
  if (agentResult.error) throw new Error(`Unable to load agent: ${agentResult.error.message}`);
  if (!agentResult.data) notFound();
  const agent = agentResult.data;

  const [versionsResult, phonesResult, callsResult] = await Promise.all([
    supabase
      .from('agent_versions')
      .select('*')
      .eq('organization_id', organization.id)
      .eq('agent_id', agent.id)
      .order('version_number', { ascending: false }),
    supabase
      .from('phone_numbers')
      .select('*')
      .eq('organization_id', organization.id)
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('conversations')
      .select('*')
      .eq('organization_id', organization.id)
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);
  if (versionsResult.error) throw new Error(`Unable to load versions: ${versionsResult.error.message}`);
  if (phonesResult.error) throw new Error(`Unable to load phone numbers: ${phonesResult.error.message}`);
  if (callsResult.error) throw new Error(`Unable to load recent calls: ${callsResult.error.message}`);

  const activeVersion = versionsResult.data.find((version) => version.id === agent.active_version_id);
  const editableVersion =
    versionsResult.data.find((version) => version.status === 'draft') ?? activeVersion ?? versionsResult.data[0];
  const languagesResult = editableVersion
    ? await supabase
        .from('agent_language_configs')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('agent_id', agent.id)
        .eq('agent_version_id', editableVersion.id)
        .order('is_default', { ascending: false })
    : { data: [], error: null };
  if (languagesResult.error) {
    throw new Error(`Unable to load language configuration: ${languagesResult.error.message}`);
  }

  const initialData: AgentFormData = {
    id: agent.id,
    name: agent.name,
    description: agent.description ?? '',
    status: agent.status,
    defaultLanguageCode: agent.default_language_code,
    defaultDialectCode: agent.default_dialect_code ?? '',
    systemPrompt:
      editableVersion?.system_prompt ??
      buildAgentSystemPrompt({
        organizationName: organization.name,
        agentName: agent.name,
        agentRole: 'voice agent',
        languageCode: agent.default_language_code,
        dialectCode: agent.default_dialect_code,
      }),
    providers: {
      voiceProvider:
        editableVersion?.voice_provider === 'retell' ||
        editableVersion?.voice_provider === 'vapi' ||
        editableVersion?.voice_provider === 'bland' ||
        editableVersion?.voice_provider === 'custom'
          ? editableVersion.voice_provider
          : 'livekit',
      llmProvider: editableVersion?.llm_provider ?? 'groq',
      llmModel: editableVersion?.llm_model ?? 'llama-3.3-70b-versatile',
      embeddingProvider: editableVersion?.embedding_provider ?? 'openai',
      embeddingModel: editableVersion?.embedding_model ?? 'text-embedding-3-small',
      sttProvider: editableVersion?.stt_provider ?? 'deepgram',
      ttsProvider: editableVersion?.tts_provider ?? 'elevenlabs',
      temperature: Number(editableVersion?.temperature ?? 0.2),
    },
    languages: languagesResult.data.length
      ? languagesResult.data.map((language) => ({
          languageCode: language.language_code,
          dialectCode: language.dialect_code ?? '',
          firstMessage: language.first_message ?? '',
          voiceId: language.voice_id ?? '',
          isDefault: language.is_default,
          isEnabled: language.is_enabled,
        }))
      : [
          {
            languageCode: agent.default_language_code,
            dialectCode: agent.default_dialect_code ?? '',
            firstMessage: '',
            voiceId: '',
            isDefault: true,
            isEnabled: true,
          },
        ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/agents" className="text-sm font-medium text-brand-700 hover:text-brand-600">
            ← Voice agents
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">{agent.name}</h1>
            <AgentStatusBadge status={agent.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {editableVersion?.status === 'draft'
              ? `Editing draft version ${editableVersion.version_number}`
              : 'Changes will create a new draft version.'}
          </p>
        </div>
        <Link
          href={`/agents/${agent.id}/versions`}
          className="focus-ring inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <History className="mr-2 size-4" />
          Version history
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active version</CardTitle>
            <CardDescription>Configuration currently serving calls.</CardDescription>
          </CardHeader>
          <CardContent>
            {activeVersion ? (
              <div className="space-y-2 text-sm">
                <p className="text-2xl font-bold text-slate-950">v{activeVersion.version_number}</p>
                <p className="capitalize text-slate-500">
                  {activeVersion.voice_provider} · {activeVersion.llm_provider}
                </p>
                <p className="text-xs text-slate-400">
                  Published {activeVersion.published_at ? new Date(activeVersion.published_at).toLocaleString() : 'date unavailable'}
                </p>
              </div>
            ) : <p className="text-sm text-slate-500">No version is published yet.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Linked phone numbers</CardTitle>
            <CardDescription>{phonesResult.data.length} number(s) routed to this agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {phonesResult.data.slice(0, 3).map((number) => (
              <div key={number.id} className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-slate-400" />
                <span className="font-medium">{number.phone_e164}</span>
                <span className="ml-auto capitalize text-slate-400">{number.status}</span>
              </div>
            ))}
            {!phonesResult.data.length ? <p className="text-sm text-slate-500">No phone numbers linked.</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent calls</CardTitle>
            <CardDescription>Latest conversations handled by this agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {callsResult.data.slice(0, 3).map((call) => (
              <Link key={call.id} href={`/calls/${call.id}`} className="flex items-center gap-2 text-sm hover:text-brand-700">
                <Clock3 className="size-4 text-slate-400" />
                <span>{call.started_at ? new Date(call.started_at).toLocaleString() : 'Not started'}</span>
                <ExternalLink className="ml-auto size-3.5 text-slate-400" />
              </Link>
            ))}
            {!callsResult.data.length ? <p className="text-sm text-slate-500">No calls recorded yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <AgentForm mode="edit" organizationName={organization.name} initialData={initialData} />
    </div>
  );
}
