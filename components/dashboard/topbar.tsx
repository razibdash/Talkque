import { Bell, Menu, Search } from 'lucide-react';

export function DashboardTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6 lg:px-8">
      <button aria-label="Open navigation" className="mr-3 text-slate-500 lg:hidden">
        <Menu className="size-5" />
      </button>
      <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-400 sm:flex">
        <Search className="size-4" />
        Search Talkque
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button
          aria-label="Notifications"
          className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Bell className="size-[18px]" />
        </button>
        <div className="grid size-9 place-items-center rounded-full bg-sidebar text-xs font-semibold text-white">
          TL
        </div>
      </div>
    </header>
  );
}
