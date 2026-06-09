'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import { dashboardNavigation } from './navigation';

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-sidebar text-slate-300 lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Logo inverse />
      </div>
      <button className="mx-3 mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left">
        <span>
          <span className="block text-xs text-slate-400">Workspace</span>
          <span className="block text-sm font-medium text-white">Talkque Labs</span>
        </span>
        <ChevronDown className="size-4" />
      </button>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
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
                  ? 'bg-brand-500/15 font-medium text-brand-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <item.icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs leading-5 text-slate-500">
        Multilingual voice infrastructure
        <br />
        Foundation v0.1
      </div>
    </aside>
  );
}
