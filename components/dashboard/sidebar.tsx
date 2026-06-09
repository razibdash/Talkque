'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Globe2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import { dashboardNavigation } from './navigation';

type DashboardSidebarProps = {
  organizationName: string;
};

export function DashboardSidebar({ organizationName }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-sidebar text-slate-300 lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Logo inverse href="/dashboard" />
      </div>

      <button
        type="button"
        className="mx-3 mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-left transition hover:bg-white/10"
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Organization
          </span>
          <span className="block truncate text-sm font-medium text-white">{organizationName}</span>
        </span>
        <ChevronDown className="ml-3 size-4 shrink-0 text-slate-500" />
      </button>

      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {dashboardNavigation.map((item) => {
          const active =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'bg-brand-500/20 font-medium text-emerald-300'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
              )}
            >
              <item.icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-3 text-xs text-slate-400">
          <Globe2 className="size-4 text-emerald-400" />
          <span>Global voice operations</span>
        </div>
      </div>
    </aside>
  );
}
