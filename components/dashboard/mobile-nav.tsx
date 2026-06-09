'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import { dashboardNavigation } from './navigation';

export function MobileNav({ organizationName }: { organizationName: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,20rem)] flex-col bg-sidebar shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Logo inverse href="/dashboard" />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Organization</p>
              <p className="mt-1 truncate text-sm font-medium text-white">{organizationName}</p>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {dashboardNavigation.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm',
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
          </aside>
        </div>
      ) : null}
    </>
  );
}
