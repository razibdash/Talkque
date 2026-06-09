import { CheckCircle2, CircleHelp, MessageSquarePlus } from 'lucide-react';
import { EmptyState } from '@/components/dashboard/empty-state';
import { cn } from '@/lib/utils';
import type { GapStatus } from '@/types/database';

export type KnowledgeGapRow = {
  id: string;
  question: string;
  occurrenceCount: number;
  languageCode: string | null;
  dialectCode: string | null;
  confidenceAverage: number | null;
  status: GapStatus;
  lastSeenAt: string;
};

const statusStyles: Record<GapStatus, string> = {
  open: 'bg-amber-50 text-amber-700',
  in_review: 'bg-blue-50 text-blue-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  ignored: 'bg-slate-100 text-slate-600',
};

export function GapTable({
  gaps,
  markResolved,
}: {
  gaps: KnowledgeGapRow[];
  markResolved: (formData: FormData) => Promise<void>;
}) {
  if (!gaps.length) {
    return (
      <EmptyState
        icon={CircleHelp}
        title="No knowledge gaps"
        description="Low-confidence and unanswered caller questions will appear here."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
            <th className="pb-3 pr-4">Question</th>
            <th className="pb-3 pr-4">Frequency</th>
            <th className="pb-3 pr-4">Language</th>
            <th className="pb-3 pr-4">Avg. confidence</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {gaps.map((gap) => (
            <tr key={gap.id} className="border-b border-slate-100 align-top last:border-0">
              <td className="max-w-md py-4 pr-4">
                <p className="font-medium leading-6 text-slate-800">{gap.question}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Last seen {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(gap.lastSeenAt))}
                </p>
              </td>
              <td className="py-4 pr-4 font-semibold tabular-nums text-slate-700">
                {gap.occurrenceCount}
              </td>
              <td className="py-4 pr-4 uppercase text-slate-600">
                {gap.languageCode ?? 'Unknown'}
                {gap.dialectCode ? <span className="block text-xs normal-case text-slate-400">{gap.dialectCode}</span> : null}
              </td>
              <td className="py-4 pr-4 tabular-nums text-slate-600">
                {gap.confidenceAverage === null ? 'No data' : `${(gap.confidenceAverage * 100).toFixed(1)}%`}
              </td>
              <td className="py-4 pr-4">
                <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize', statusStyles[gap.status])}>
                  {gap.status.replace('_', ' ')}
                </span>
              </td>
              <td className="py-4">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled
                    title="Answer authoring is coming next"
                    className="inline-flex h-9 items-center rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-400"
                  >
                    <MessageSquarePlus className="mr-1.5 size-3.5" />
                    Add answer
                  </button>
                  {gap.status !== 'resolved' ? (
                    <form action={markResolved}>
                      <input type="hidden" name="gapId" value={gap.id} />
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center rounded-md bg-emerald-50 px-3 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <CheckCircle2 className="mr-1.5 size-3.5" />
                        Resolve
                      </button>
                    </form>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
