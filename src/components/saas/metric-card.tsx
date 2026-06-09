import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

export function MetricCard({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-ink-900">{value}</p>
          {hint ? <p className="mt-2 text-xs text-gray-500">{hint}</p> : null}
        </div>
        {icon ? <div className="rounded-xl bg-brand-50 p-3 text-brand-600">{icon}</div> : null}
      </div>
    </Card>
  );
}
