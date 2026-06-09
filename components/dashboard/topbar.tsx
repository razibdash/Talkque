import { Bell, ChevronDown } from 'lucide-react';
import { MobileNav } from './mobile-nav';

type DashboardTopbarProps = {
  organizationName: string;
  environment: string;
  userEmail: string;
};

function getInitials(value: string) {
  const localPart = value.split('@')[0] ?? value;
  const parts = localPart.split(/[.\s_-]+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'TQ';
}

export function DashboardTopbar({
  organizationName,
  environment,
  userEmail,
}: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6 lg:px-8">
      <MobileNav organizationName={organizationName} />

      <div className="ml-3 min-w-0 lg:ml-0">
        <p className="truncate text-sm font-semibold text-slate-900">{organizationName}</p>
        <p className="hidden text-xs text-slate-500 sm:block">Multilingual voice operations</p>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <span className="hidden rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700 sm:inline-flex">
          {environment}
        </span>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Bell className="size-[18px]" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-brand-500" />
        </button>
        <button
          type="button"
          aria-label="Open user menu"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 text-left shadow-sm hover:bg-slate-50"
        >
          <span className="grid size-7 place-items-center rounded-lg bg-sidebar text-[11px] font-semibold text-white">
            {getInitials(userEmail)}
          </span>
          <span className="hidden max-w-40 truncate text-xs font-medium text-slate-700 md:block">
            {userEmail}
          </span>
          <ChevronDown className="hidden size-3.5 text-slate-400 md:block" />
        </button>
      </div>
    </header>
  );
}
