import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CircleHelp,
  Clock3,
  Languages,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { EmptyState } from '@/components/dashboard/empty-state';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DashboardOverviewData = {
  stats: {
    callsToday: number;
    minutesThisMonth: number;
    activeAgents: number;
    knowledgeGapsThisWeek: number;
  };
  recentConversations: {
    id: string;
    caller: string;
    agent: string;
    language: string;
    duration: string;
    status: 'Resolved' | 'Escalated' | 'Follow-up';
    startedAt: string;
  }[];
  languages: { name: string; code: string; percentage: number; calls: number }[];
  agents: {
    name: string;
    status: 'Healthy' | 'Needs attention';
    successRate: number;
    latency: string;
  }[];
  setup: { label: string; complete: boolean; href: string }[];
};

// Replace this object with v_dashboard_overview and related Supabase queries.
const mockOverview: DashboardOverviewData = {
  stats: {
    callsToday: 128,
    minutesThisMonth: 3842,
    activeAgents: 4,
    knowledgeGapsThisWeek: 12,
  },
  recentConversations: [
    {
      id: 'conv_01',
      caller: '+1 ••• ••• 0184',
      agent: 'Customer Support',
      language: 'English',
      duration: '04:18',
      status: 'Resolved',
      startedAt: '8 minutes ago',
    },
    {
      id: 'conv_02',
      caller: '+44 ••• ••• 892',
      agent: 'Booking Assistant',
      language: 'Spanish',
      duration: '02:41',
      status: 'Follow-up',
      startedAt: '22 minutes ago',
    },
    {
      id: 'conv_03',
      caller: '+880 ••• ••• 771',
      agent: 'Customer Support',
      language: 'Bengali',
      duration: '06:05',
      status: 'Escalated',
      startedAt: '37 minutes ago',
    },
    {
      id: 'conv_04',
      caller: '+971 ••• ••• 449',
      agent: 'Sales Qualifier',
      language: 'Arabic',
      duration: '03:12',
      status: 'Resolved',
      startedAt: '1 hour ago',
    },
  ],
  languages: [
    { name: 'English', code: 'EN', percentage: 46, calls: 498 },
    { name: 'Spanish', code: 'ES', percentage: 22, calls: 238 },
    { name: 'Bengali', code: 'BN', percentage: 18, calls: 195 },
    { name: 'Arabic', code: 'AR', percentage: 14, calls: 152 },
  ],
  agents: [
    { name: 'Customer Support', status: 'Healthy', successRate: 91, latency: '680 ms' },
    { name: 'Booking Assistant', status: 'Healthy', successRate: 88, latency: '740 ms' },
    { name: 'Sales Qualifier', status: 'Healthy', successRate: 86, latency: '790 ms' },
    { name: 'After-hours Agent', status: 'Needs attention', successRate: 72, latency: '1.2 s' },
  ],
  setup: [
    { label: 'Create your first voice agent', complete: true, href: '/agents' },
    { label: 'Add trusted knowledge', complete: true, href: '/knowledge-base' },
    { label: 'Connect a phone number', complete: false, href: '/settings' },
    { label: 'Run a test conversation', complete: false, href: '/agents' },
  ],
};

export default function DashboardPage() {
  const data = mockOverview;
  const completedSetup = data.setup.filter((item) => item.complete).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-700">Overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Voice operations at a glance
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor conversations, multilingual coverage, and agent readiness.
          </p>
        </div>
        <Link
          href="/calls"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          View all calls
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Calls today"
          value={data.stats.callsToday.toLocaleString()}
          description="vs. yesterday"
          icon={PhoneCall}
          trend={{ value: '12.4%', direction: 'up' }}
        />
        <StatCard
          title="Minutes this month"
          value={data.stats.minutesThisMonth.toLocaleString()}
          description="of 5,000 included"
          icon={Clock3}
          trend={{ value: '77%', direction: 'neutral' }}
        />
        <StatCard
          title="Active agents"
          value={String(data.stats.activeAgents)}
          description="across 6 languages"
          icon={Bot}
          trend={{ value: 'All online', direction: 'up' }}
        />
        <StatCard
          title="Knowledge gaps"
          value={String(data.stats.knowledgeGapsThisWeek)}
          description="identified this week"
          icon={CircleHelp}
          trend={{ value: '3 new', direction: 'down' }}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,0.85fr)]">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Recent conversations</CardTitle>
              <CardDescription>Latest calls handled across your active agents.</CardDescription>
            </div>
            <MessageSquareText className="size-5 text-brand-600" />
          </CardHeader>
          <CardContent>
            {data.recentConversations.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                      <th className="pb-3 pr-4">Caller</th>
                      <th className="pb-3 pr-4">Agent</th>
                      <th className="pb-3 pr-4">Language</th>
                      <th className="pb-3 pr-4">Duration</th>
                      <th className="pb-3 pr-4">Outcome</th>
                      <th className="pb-3 text-right">Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentConversations.map((conversation) => (
                      <tr key={conversation.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-4 pr-4 font-medium text-slate-800">{conversation.caller}</td>
                        <td className="py-4 pr-4 text-slate-600">{conversation.agent}</td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                            {conversation.language}
                          </span>
                        </td>
                        <td className="py-4 pr-4 tabular-nums text-slate-600">{conversation.duration}</td>
                        <td className="py-4 pr-4">
                          <StatusBadge status={conversation.status} />
                        </td>
                        <td className="py-4 text-right text-xs text-slate-400">{conversation.startedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={PhoneCall}
                title="No conversations yet"
                description="Connect a phone number and place a test call to see activity here."
                action={{ label: 'Set up calling', href: '/settings' }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language distribution</CardTitle>
            <CardDescription>Conversation volume over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {data.languages.map((language) => (
              <div key={language.code}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="grid size-7 place-items-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
                      {language.code}
                    </span>
                    {language.name}
                  </span>
                  <span className="text-xs text-slate-400">{language.calls} calls</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${language.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            <Link href="/analytics" className="inline-flex items-center text-sm font-medium text-brand-700 hover:text-brand-600">
              Explore language analytics
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Agent health</CardTitle>
              <CardDescription>Resolution quality and response latency.</CardDescription>
            </div>
            <ShieldCheck className="size-5 text-brand-600" />
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {data.agents.map((agent) => (
              <div key={agent.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    'grid size-9 place-items-center rounded-xl',
                    agent.status === 'Healthy'
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-amber-50 text-amber-700',
                  )}
                >
                  {agent.status === 'Healthy' ? <Bot className="size-4" /> : <AlertTriangle className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{agent.name}</p>
                  <p className="text-xs text-slate-400">{agent.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">{agent.successRate}%</p>
                  <p className="text-xs text-slate-400">{agent.latency}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Setup checklist</CardTitle>
              <CardDescription>{completedSetup} of {data.setup.length} essentials completed.</CardDescription>
            </div>
            <Languages className="size-5 text-brand-600" />
          </CardHeader>
          <CardContent>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${(completedSetup / data.setup.length) * 100}%` }}
              />
            </div>
            <div className="space-y-2">
              {data.setup.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-slate-50"
                >
                  <span
                    className={cn(
                      'grid size-7 place-items-center rounded-full',
                      item.complete
                        ? 'bg-brand-500 text-white'
                        : 'border border-slate-200 bg-white text-slate-400',
                    )}
                  >
                    {item.complete ? <Check className="size-4" /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={cn('text-sm', item.complete ? 'text-slate-500 line-through' : 'font-medium text-slate-700')}>
                    {item.label}
                  </span>
                  <ArrowRight className="ml-auto size-4 text-slate-300" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: DashboardOverviewData['recentConversations'][number]['status'];
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
        status === 'Resolved' && 'bg-brand-50 text-brand-700',
        status === 'Escalated' && 'bg-amber-50 text-amber-700',
        status === 'Follow-up' && 'bg-blue-50 text-blue-700',
      )}
    >
      {status}
    </span>
  );
}
