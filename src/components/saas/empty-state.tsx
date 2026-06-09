import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Card className="flex min-h-64 flex-col items-center justify-center text-center">
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
