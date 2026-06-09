import * as React from 'react';
import { cn } from '@/lib/utils';

const colors = {
  green: 'bg-green-50 text-green-700 ring-green-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  gray: 'bg-gray-50 text-gray-700 ring-gray-600/20',
};

export function Badge({ className, color = 'gray', ...props }: React.HTMLAttributes<HTMLSpanElement> & { color?: keyof typeof colors }) {
  return <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset', colors[color], className)} {...props} />;
}
