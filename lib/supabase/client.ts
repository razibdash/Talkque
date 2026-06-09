'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { requirePublicSupabaseConfig } from './config';

export function createSupabaseBrowserClient() {
  const config = requirePublicSupabaseConfig();
  return createBrowserClient<Database>(config.url, config.anonKey);
}
