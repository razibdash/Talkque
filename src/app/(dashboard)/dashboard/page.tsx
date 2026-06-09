import { Bot, BookOpen, PhoneCall, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/saas/metric-card';
import { PageHeader } from '@/components/saas/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const recentCalls = [
  ['+88017****1234', '2m 12s', 'Bangla / Sylheti', 'positive'],
  ['+4420****0192', '4m 08s', 'English', 'neutral'],
  ['+9715****7731', '1m 34s', 'Arabic', 'frustrated'],
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Overview" description="SaaS health, active voice agents, usage, and call quality for your organization." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Calls today" value="128" hint="Across 3 phone numbers" icon={<PhoneCall className="h-5 w-5" />} />
        <MetricCard label="Minutes this month" value="1,842" hint="72% of included plan" icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard label="Active agents" value="4" hint="2 published versions" icon={<Bot className="h-5 w-5" />} />
        <MetricCard label="KB chunks" value="9,304" hint="5 languages indexed" icon={<BookOpen className="h-5 w-5" />} />
      </div>
      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-ink-900">Recent conversations</h2>
          <Badge color="green">Live</Badge>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500"><tr><th className="p-3">Caller</th><th>Duration</th><th>Language</th><th>Sentiment</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {recentCalls.map(([phone, duration, language, sentiment]) => (
                <tr key={phone}><td className="p-3 font-medium text-ink-900">{phone}</td><td>{duration}</td><td>{language}</td><td><Badge color={sentiment === 'frustrated' ? 'red' : sentiment === 'positive' ? 'green' : 'gray'}>{sentiment}</Badge></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
