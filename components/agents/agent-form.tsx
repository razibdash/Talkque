'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { buildAgentSystemPrompt } from '@/lib/agents/prompt-builder';
import type { AgentStatus } from '@/types/database';
import {
  LanguageConfigEditor,
  type EditableLanguageConfig,
} from './language-config-editor';
import { PromptEditor } from './prompt-editor';
import { ProviderConfigPanel, type ProviderConfig } from './provider-config-panel';

export type AgentFormData = {
  id?: string;
  name: string;
  description: string;
  status: AgentStatus;
  defaultLanguageCode: string;
  defaultDialectCode: string;
  systemPrompt: string;
  providers: ProviderConfig;
  languages: EditableLanguageConfig[];
};

type Props = {
  mode: 'create' | 'edit';
  organizationName: string;
  initialData?: AgentFormData;
};

const defaultProviders: ProviderConfig = {
  voiceProvider: 'livekit',
  llmProvider: 'groq',
  llmModel: 'llama-3.3-70b-versatile',
  embeddingProvider: 'openai',
  embeddingModel: 'text-embedding-3-small',
  sttProvider: 'deepgram',
  ttsProvider: 'elevenlabs',
  temperature: 0.2,
};

function createInitialData(organizationName: string): AgentFormData {
  const name = 'Customer Support Agent';
  return {
    name,
    description: '',
    status: 'draft',
    defaultLanguageCode: 'en',
    defaultDialectCode: '',
    systemPrompt: buildAgentSystemPrompt({
      organizationName,
      agentName: name,
      agentRole: 'customer support voice agent',
      languageCode: 'en',
      ragEnabled: true,
    }),
    providers: defaultProviders,
    languages: [
      {
        languageCode: 'en',
        dialectCode: '',
        firstMessage: 'Hello! Thank you for calling. How can I help you today?',
        voiceId: '',
        isDefault: true,
        isEnabled: true,
      },
    ],
  };
}

const fieldClass =
  'focus-ring h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700';

export function AgentForm({ mode, organizationName, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AgentFormData>(
    initialData ?? createInitialData(organizationName),
  );
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function update<K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateLanguages(languages: EditableLanguageConfig[]) {
    const defaultLanguage = languages.find((language) => language.isDefault) ?? languages[0];
    setForm((current) => ({
      ...current,
      languages,
      defaultLanguageCode: defaultLanguage?.languageCode ?? current.defaultLanguageCode,
      defaultDialectCode: defaultLanguage?.dialectCode ?? '',
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);

    if (!form.name.trim() || !form.languages.length) {
      setMessage('Enter an agent name and configure at least one language.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/agents', {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'create'
            ? { action: 'createAgent', ...form }
            : { agentId: form.id, ...form },
        ),
      });
      const payload = (await response.json()) as {
        message?: string;
        agent?: { id: string };
        draftVersion?: { version_number: number };
      };
      if (!response.ok) throw new Error(payload.message || 'Unable to save agent.');

      if (mode === 'create' && payload.agent?.id) {
        router.push(`/agents/${payload.agent.id}`);
      } else {
        setMessage(
          payload.draftVersion
            ? `Saved as draft version ${payload.draftVersion.version_number}.`
            : 'Agent saved.',
        );
        router.refresh();
      }
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Unable to save agent.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Create a voice agent' : 'Agent profile'}</CardTitle>
          <CardDescription>
            Name the agent, describe its responsibility, and control deployment status.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Agent name</span>
            <Input
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              maxLength={120}
              required
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Status</span>
            <select
              className={fieldClass}
              value={form.status}
              onChange={(event) => update('status', event.target.value as AgentStatus)}
            >
              <option value="draft">Draft</option>
              {mode === 'edit' ? (
                <>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </>
              ) : null}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
            <span>Description</span>
            <textarea
              className="focus-ring min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              maxLength={1000}
              placeholder="What this agent handles and when callers should use it."
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language support</CardTitle>
          <CardDescription>
            Configure greetings and enable the Sylheti launch wedge for Bengali callers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageConfigEditor value={form.languages} onChange={updateLanguages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provider configuration</CardTitle>
          <CardDescription>
            New agents start with Groq, OpenAI embeddings, Deepgram STT, and ElevenLabs TTS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderConfigPanel
            value={form.providers}
            onChange={(providers) => update('providers', providers)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System prompt</CardTitle>
          <CardDescription>
            Configuration changes are stored in a draft version until you publish them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptEditor
            value={form.systemPrompt}
            onChange={(systemPrompt) => update('systemPrompt', systemPrompt)}
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex items-center justify-end gap-4 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        {message ? (
          <p className="mr-auto text-sm text-slate-600" role="status">
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          {mode === 'create' ? 'Create agent' : 'Save draft'}
        </Button>
      </div>
    </form>
  );
}
