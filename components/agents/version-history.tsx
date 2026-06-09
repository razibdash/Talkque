'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type VersionHistoryItem = {
  id: string;
  versionNumber: number;
  status: 'draft' | 'published' | 'retired';
  createdAt: string;
  publishedAt: string | null;
  systemPrompt: string;
  llmProvider: string;
  llmModel: string;
  voiceProvider: string;
  sttProvider: string;
  ttsProvider: string;
  embeddingProvider: string;
  isActive: boolean;
};

export function VersionHistory({
  agentId,
  versions,
}: {
  agentId: string;
  versions: VersionHistoryItem[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasActiveVersion = versions.some((version) => version.isActive);

  async function runAction(action: 'publishVersion' | 'createVersion', versionId?: string) {
    setPending(`${action}:${versionId ?? 'active'}`);
    setError(null);
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, agentId, versionId }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(payload.message || 'Unable to update version history.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update version history.');
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Published versions are retained as immutable release history.
        </p>
        <Button
          variant="outline"
          onClick={() => runAction('createVersion')}
          disabled={pending !== null || !hasActiveVersion}
          title={hasActiveVersion ? undefined : 'Publish a version before cloning the active release.'}
        >
          {pending === 'createVersion:active' ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Copy className="mr-2 size-4" />
          )}
          Create draft from active
        </Button>
      </div>
      {error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {versions.map((version, index) => {
        const previous = versions[index + 1];
        return (
          <Card key={version.id} className={cn(version.isActive && 'border-brand-400 ring-1 ring-brand-100')}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-950">Version {version.versionNumber}</h2>
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      version.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
                    )}>
                      {version.status}
                    </span>
                    {version.isActive ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-brand-700">
                        <CheckCircle2 className="size-3.5" /> Active
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Created {new Date(version.createdAt).toLocaleString()}
                  </p>
                </div>
                {version.status === 'draft' ? (
                  <Button
                    size="sm"
                    onClick={() => runAction('publishVersion', version.id)}
                    disabled={pending !== null}
                  >
                    {pending === `publishVersion:${version.id}` ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    Publish version
                  </Button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Config label="Voice" value={version.voiceProvider} />
                <Config label="LLM" value={`${version.llmProvider} / ${version.llmModel}`} />
                <Config label="Speech" value={`${version.sttProvider} → ${version.ttsProvider}`} />
                <Config label="Embeddings" value={version.embeddingProvider} />
              </div>

              <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Prompt diff
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {previous
                    ? `Diff placeholder: compare version ${version.versionNumber} with version ${previous.versionNumber}.`
                    : 'This is the first version; there is no earlier prompt to compare.'}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {!versions.length ? (
        <Card><CardContent className="p-8 text-center text-sm text-slate-500">No versions have been created.</CardContent></Card>
      ) : null}
    </div>
  );
}

function Config({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 truncate font-medium capitalize text-slate-700">{value}</p>
    </div>
  );
}
