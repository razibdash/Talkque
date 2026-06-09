import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type {
  Database,
  MemberRole,
  Organization,
  OrganizationMember,
} from '@/types/database';
import { requirePublicSupabaseConfig } from './config';

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<Awaited<ReturnType<typeof cookies>>['set']>[2];
};

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required.') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'You do not have access to this organization.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export type OrganizationAccess = {
  user: User;
  organization: Organization;
  membership: OrganizationMember;
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const config = requirePublicSupabaseConfig();

  return createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components cannot write cookies. Middleware handles session refresh.
          }
        },
      },
    },
  );
}

export type ServerSupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function requireUser(
  client?: ServerSupabaseClient,
): Promise<User> {
  const supabase = client ?? (await createSupabaseServerClient());
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError();
  }

  return user;
}

export async function getCurrentOrganization(): Promise<Organization | null> {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);
  const cookieStore = await cookies();
  const preferredOrganizationId = cookieStore.get('talkque_organization_id')?.value;

  let membershipQuery = supabase
    .from('organization_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (preferredOrganizationId) {
    membershipQuery = membershipQuery.eq('organization_id', preferredOrganizationId);
  }

  const initialMembershipResult = await membershipQuery
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  let membership = initialMembershipResult.data as OrganizationMember | null;
  let membershipError = initialMembershipResult.error;

  if (!membership && !membershipError && preferredOrganizationId) {
    const fallback = await supabase
      .from('organization_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    membership = fallback.data as OrganizationMember | null;
    membershipError = fallback.error;
  }

  if (membershipError) {
    throw new Error(`Unable to load organization membership: ${membershipError.message}`);
  }

  if (!membership) {
    return null;
  }

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', membership.organization_id)
    .is('deleted_at', null)
    .maybeSingle();

  if (organizationError) {
    throw new Error(`Unable to load organization: ${organizationError.message}`);
  }

  return organization as Organization | null;
}

export async function requireOrganizationAccess(
  organizationId?: string,
  allowedRoles?: readonly MemberRole[],
): Promise<OrganizationAccess> {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);
  let resolvedOrganizationId = organizationId;

  if (!resolvedOrganizationId) {
    const currentOrganization = await getCurrentOrganization();

    if (!currentOrganization) {
      throw new AuthorizationError('No active organization membership was found.');
    }

    resolvedOrganizationId = currentOrganization.id;
  }

  const membershipResult = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', resolvedOrganizationId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();
  const membership = membershipResult.data as OrganizationMember | null;
  const membershipError = membershipResult.error;

  if (membershipError) {
    throw new Error(`Unable to verify organization membership: ${membershipError.message}`);
  }

  if (!membership) {
    throw new AuthorizationError();
  }

  if (allowedRoles?.length && !allowedRoles.includes(membership.role)) {
    throw new AuthorizationError('Your organization role does not permit this action.');
  }

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', resolvedOrganizationId)
    .is('deleted_at', null)
    .maybeSingle();

  if (organizationError) {
    throw new Error(`Unable to load organization: ${organizationError.message}`);
  }

  if (!organization) {
    throw new AuthorizationError('The organization does not exist or is unavailable.');
  }

  return { user, organization: organization as Organization, membership };
}
