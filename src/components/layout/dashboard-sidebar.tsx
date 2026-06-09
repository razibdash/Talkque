'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dashboardNav } from '@/lib/config/navigation';
import { cn } from '@/lib/utils';

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-sidebar text-white lg:block">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <div>
          <div className="text-lg font-semibold">Talkque</div>
          <div className="text-xs text-gray-400">Global AI phone agents</div>
        </div>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {dashboardNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white',
                active && 'bg-white/10 text-brand-100',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
