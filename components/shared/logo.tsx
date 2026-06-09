import Link from 'next/link';
import { AudioLines } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  inverse?: boolean;
  compact?: boolean;
  href?: string;
  className?: string;
};

export function Logo({ inverse = false, compact = false, href = '/', className }: LogoProps) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-sm">
        <AudioLines className="size-5" />
      </span>
      {!compact ? (
        <span className={inverse ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-slate-950'}>
          Talkque
        </span>
      ) : null}
    </Link>
  );
}
