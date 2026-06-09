import Link from 'next/link';
import { Bot, Globe2, Network } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getLanguageName } from '@/lib/agents/language';
import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/types/database';

const statusStyles: Record<AgentStatus, string> = {
  draft: 'bg-amber-50 text-amber-700 ring-amber-200',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  paused: 'bg-slate-100 text-slate-700 ring-slate-200',
  archived: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export type AgentCardData = {
  id: string;
  name: string;
  description: string | null;
  status: AgentStatus;
  defaultLanguageCode: string;
  defaultDialectCode: string | null;
  activeVersionNumber: number | null;
  voiceProvider: string | null;
  llmProvider: string | null;
};

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset',
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

export function AgentCard({ agent }: { agent: AgentCardData }) {
  return (
    <Link href={`/agents/${agent.id}`} className="group block">
      <Card className="h-full transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
                <Bot className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-slate-950 group-hover:text-brand-700">
                  {agent.name}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {agent.description || 'No description yet.'}
                </p>
              </div>
            </div>
            <AgentStatusBadge status={agent.status} />
          </div>

          <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Globe2 className="size-4 text-slate-400" />
              <span>
                {getLanguageName(agent.defaultLanguageCode)}
                {agent.defaultDialectCode === 'syl' ? ' · Sylheti' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Network className="size-4 text-slate-400" />
              <span className="capitalize">
                {agent.voiceProvider || 'Not configured'} · {agent.llmProvider || 'No LLM'}
              </span>
              {agent.activeVersionNumber ? (
                <span className="ml-auto text-xs text-slate-400">v{agent.activeVersionNumber}</span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
