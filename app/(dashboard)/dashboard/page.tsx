import { Bot, Clock3, PhoneCall, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const metrics = [
  { label: 'Total calls', value: '0', detail: 'This billing period', icon: PhoneCall },
  { label: 'Live agents', value: '0', detail: 'Ready to receive calls', icon: Bot },
  { label: 'Minutes used', value: '0', detail: 'Across all providers', icon: Clock3 },
  { label: 'Resolution rate', value: '--', detail: 'Available after first calls', icon: TrendingUp },
];

export default function DashboardPage() {
  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-medium text-brand-700">Overview</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Good evening, Talkque Labs</h1>
        <p className="mt-2 text-sm text-slate-500">Here is how your voice operation is performing.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{metric.label}</p>
                <metric.icon className="size-4 text-brand-600" />
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-400">{metric.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Call activity</CardTitle>
            <CardDescription>Daily calls and handled minutes will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
              Connect a phone number to begin collecting activity
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
            <CardDescription>Complete the essentials for your first live call.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {['Create an agent', 'Add trusted knowledge', 'Connect a phone number'].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {index + 1}
                </span>
                <span className="text-slate-700">{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
