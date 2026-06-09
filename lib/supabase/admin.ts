import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { requirePublicSupabaseConfig } from './config';

export function createSupabaseAdminClient() {
  const config = requirePublicSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error(
      'Supabase admin access is not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    );
  }

  return createClient<Database>(
    config.url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
