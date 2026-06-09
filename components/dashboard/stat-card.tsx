import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) {
  const positive = trend?.direction === 'up';
  const negative = trend?.direction === 'down';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          </div>
          <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Icon className="size-5" />
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend ? (
            <span
              className={cn(
                'inline-flex items-center font-semibold',
                positive && 'text-brand-700',
                negative && 'text-amber-700',
                trend.direction === 'neutral' && 'text-slate-500',
              )}
            >
              {positive ? <ArrowUpRight className="mr-0.5 size-3.5" /> : null}
              {negative ? <ArrowDownRight className="mr-0.5 size-3.5" /> : null}
              {trend.value}
            </span>
          ) : null}
          <span className="text-slate-400">{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}
