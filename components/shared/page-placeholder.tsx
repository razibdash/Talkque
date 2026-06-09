import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type PagePlaceholderProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
};

export function PagePlaceholder({
  title,
  description,
  icon: Icon = Construction,
  actionLabel,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-700">Workspace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <Card className="min-h-72">
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
            <Icon className="size-6" />
          </span>
          <h2 className="mt-5 font-semibold text-slate-900">Ready for the next implementation phase</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            The route and product boundary are in place. Connect Supabase data and provider workflows here.
          </p>
          {actionLabel ? (
            <Button className="mt-5">
              {actionLabel}
              <ArrowUpRight className="ml-2 size-4" />
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
