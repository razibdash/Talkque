'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { requirePublicSupabaseConfig } from './config';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const config = requirePublicSupabaseConfig();
  browserClient = createBrowserClient<Database>(config.url, config.anonKey);

  return browserClient;
}
