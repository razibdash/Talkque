import Link from 'next/link';
import { AudioLines } from 'lucide-react';

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-white shadow-sm">
        <AudioLines className="size-5" />
      </span>
      <span className={inverse ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-slate-950'}>
        Talkque
      </span>
    </Link>
  );
}
