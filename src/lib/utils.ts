import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskPhone(value?: string | null) {
  if (!value) return 'Unknown';
  const clean = value.replace(/\D/g, '');
  if (clean.length < 7) return value;
  return `${clean.slice(0, 3)}****${clean.slice(-4)}`;
}

export function formatDuration(seconds?: number | null) {
  if (!seconds) return '0s';
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes ? `${minutes}m ${rest}s` : `${rest}s`;
}
