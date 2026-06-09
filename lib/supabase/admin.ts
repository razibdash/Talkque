import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { requirePublicSupabaseConfig } from './config';

let adminClient: SupabaseClient<Database> | undefined;

export function createSupabaseAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('The Supabase service-role client can only be used on the server.');
  }

  if (adminClient) {
    return adminClient;
  }

  const config = requirePublicSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error(
      'Supabase admin access is not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.',
    );
  }

  adminClient = createClient<Database>(
    config.url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );

  return adminClient;
}
