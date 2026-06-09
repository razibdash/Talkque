import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createVersionClone, nextVersionNumber } from '@/lib/agents/versions';
import {
  AuthenticationError,
  AuthorizationError,
  createSupabaseServerClient,
  requireOrganizationAccess,
} from '@/lib/supabase/server';
import type {
  AgentVersion,
  TablesInsert,
  TablesUpdate,
} from '@/types/database';

export const runtime = 'nodejs';

const agentStatusSchema = z.enum(['draft', 'active', 'paused', 'archived']);
const providerSchema = z.object({
  voiceProvider: z.enum(['livekit', 'retell', 'vapi', 'bland', 'custom']),
  llmProvider: z.string().trim().min(1).max(50).default('groq'),
  llmModel: z.string().trim().min(1).max(200).default('llama-3.3-70b-versatile'),
  embeddingProvider: z.string().trim().min(1).max(50).default('openai'),
  embeddingModel: z.string().trim().min(1).max(200).default('text-embedding-3-small'),
  sttProvider: z.string().trim().min(1).max(50).default('deepgram'),
  ttsProvider: z.string().trim().min(1).max(50).default('elevenlabs'),
  temperature: z.number().min(0).max(2).default(0.2),
});
const languageSchema = z.object({
  languageCode: z.string().trim().min(2).max(12).transform((value) => value.toLowerCase()),
  dialectCode: z.string().trim().max(20).default(''),
  firstMessage: z.string().trim().max(1000).default(''),
  voiceId: z.string().trim().max(200).default(''),
  isDefault: z.boolean().default(false),
  isEnabled: z.boolean().default(true),
});
const configurationSchema = z
  .object({
    systemPrompt: z.string().trim().min(20).max(100_000),
    providers: providerSchema,
    languages: z.array(languageSchema).min(1).max(30),
  })
  .superRefine((value, context) => {
    if (value.languages.filter((language) => language.isDefault && language.isEnabled).length !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['languages'],
        message: 'Choose exactly one enabled default language.',
      });
    }

    const keys = value.languages.map(
      (language) => `${language.languageCode}:${language.dialectCode || 'standard'}`,
    );
    if (new Set(keys).size !== keys.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['languages'],
        message: 'Each language and dialect combination must be unique.',
      });
    }
  });

const createAgentSchema = z
  .object({
    action: z.literal('createAgent'),
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).default(''),
    status: agentStatusSchema.default('draft'),
    defaultLanguageCode: z.string().trim().min(2).max(12),
    defaultDialectCode: z.string().trim().max(20).default(''),
  })
  .and(configurationSchema);

const updateAgentSchema = z
  .object({
    agentId: z.string().uuid(),
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).default(''),
    status: agentStatusSchema,
    defaultLanguageCode: z.string().trim().min(2).max(12),
    defaultDialectCode: z.string().trim().max(20).default(''),
  })
  .and(configurationSchema);

const versionActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('createVersion'),
    agentId: z.string().uuid(),
    versionId: z.string().uuid().optional(),
  }),
  z.object({
    action: z.literal('publishVersion'),
    agentId: z.string().uuid(),
    versionId: z.string().uuid(),
  }),
]);

type Supabase = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type ParsedConfiguration = z.infer<typeof configurationSchema>;

function slugify(value: string) {
  const base =
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'agent';
  return `${base}-${randomBytes(3).toString('hex')}`;
}

function errorResponse(cause: unknown) {
  if (cause instanceof AuthenticationError) {
    return NextResponse.json({ message: cause.message }, { status: 401 });
  }
  if (cause instanceof AuthorizationError) {
    return NextResponse.json({ message: cause.message }, { status: 403 });
  }
  return NextResponse.json(
    { message: cause instanceof Error ? cause.message : 'Unable to manage agents.' },
    { status: 500 },
  );
}

async function requireAgent(
  supabase: Supabase,
  organizationId: string,
  agentId: string,
) {
  const result = await supabase
    .from('voice_agents')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('id', agentId)
    .maybeSingle();

  if (result.error) throw new Error(`Unable to load agent: ${result.error.message}`);
  if (!result.data) throw new AuthorizationError('The agent does not exist in this organization.');
  return result.data;
}

async function getNextVersionNumber(
  supabase: Supabase,
  organizationId: string,
  agentId: string,
) {
  const result = await supabase
    .from('agent_versions')
    .select('version_number')
    .eq('organization_id', organizationId)
    .eq('agent_id', agentId)
    .order('version_number', { ascending: false })
    .limit(1);
  if (result.error) throw new Error(`Unable to calculate the next version: ${result.error.message}`);
  return nextVersionNumber(result.data.map((version) => version.version_number));
}

function versionValues(
  organizationId: string,
  agentId: string,
  versionNumber: number,
  userId: string,
  configuration: ParsedConfiguration,
): TablesInsert<'agent_versions'> {
  return {
    organization_id: organizationId,
    agent_id: agentId,
    version_number: versionNumber,
    status: 'draft',
    system_prompt: configuration.systemPrompt,
    first_message: {
      default_language:
        configuration.languages.find((language) => language.isDefault)?.languageCode ?? 'en',
      messages: Object.fromEntries(
        configuration.languages.map((language) => [
          `${language.languageCode}${language.dialectCode ? `-${language.dialectCode}` : ''}`,
          language.firstMessage,
        ]),
      ),
    },
    llm_provider: configuration.providers.llmProvider,
    llm_model: configuration.providers.llmModel,
    voice_provider: configuration.providers.voiceProvider,
    stt_provider: configuration.providers.sttProvider,
    tts_provider: configuration.providers.ttsProvider,
    embedding_provider: configuration.providers.embeddingProvider,
    embedding_model: configuration.providers.embeddingModel,
    temperature: configuration.providers.temperature,
    created_by: userId,
  };
}

async function replaceLanguages(
  supabase: Supabase,
  organizationId: string,
  agentId: string,
  versionId: string,
  languages: ParsedConfiguration['languages'],
) {
  const deleteResult = await supabase
    .from('agent_language_configs')
    .delete()
    .eq('organization_id', organizationId)
    .eq('agent_id', agentId)
    .eq('agent_version_id', versionId);
  if (deleteResult.error) {
    throw new Error(`Unable to replace language configuration: ${deleteResult.error.message}`);
  }

  const rows: TablesInsert<'agent_language_configs'>[] = languages.map((language) => ({
    organization_id: organizationId,
    agent_id: agentId,
    agent_version_id: versionId,
    language_code: language.languageCode,
    dialect_code: language.dialectCode || null,
    first_message: language.firstMessage || null,
    voice_id: language.voiceId || null,
    is_default: language.isDefault,
    is_enabled: language.isEnabled,
  }));
  const insertResult = await supabase.from('agent_language_configs').insert(rows);
  if (insertResult.error) {
    throw new Error(`Unable to save language configuration: ${insertResult.error.message}`);
  }
}

async function cloneLanguages(
  supabase: Supabase,
  organizationId: string,
  agentId: string,
  sourceVersionId: string,
  targetVersionId: string,
) {
  const sourceResult = await supabase
    .from('agent_language_configs')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('agent_id', agentId)
    .eq('agent_version_id', sourceVersionId);
  if (sourceResult.error) {
    throw new Error(`Unable to load source languages: ${sourceResult.error.message}`);
  }
  if (!sourceResult.data.length) return;

  const rows: TablesInsert<'agent_language_configs'>[] = sourceResult.data.map((language) => ({
    organization_id: organizationId,
    agent_id: agentId,
    agent_version_id: targetVersionId,
    language_code: language.language_code,
    dialect_code: language.dialect_code,
    locale: language.locale,
    display_name: language.display_name,
    first_message: language.first_message,
    system_prompt_addendum: language.system_prompt_addendum,
    voice_id: language.voice_id,
    voice_settings: language.voice_settings,
    pronunciation_dictionary: language.pronunciation_dictionary,
    is_default: language.is_default,
    is_enabled: language.is_enabled,
  }));
  const insertResult = await supabase.from('agent_language_configs').insert(rows);
  if (insertResult.error) {
    throw new Error(`Unable to clone source languages: ${insertResult.error.message}`);
  }
}

export async function GET(request: Request) {
  try {
    const { organization } = await requireOrganizationAccess();
    const supabase = await createSupabaseServerClient();
    const agentId = new URL(request.url).searchParams.get('agentId');
    let query = supabase
      .from('voice_agents')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });
    if (agentId) query = query.eq('id', agentId);

    const result = await query;
    if (result.error) throw new Error(`Unable to list agents: ${result.error.message}`);
    return NextResponse.json({ agents: result.data });
  } catch (cause) {
    return errorResponse(cause);
  }
}

export async function POST(request: Request) {
  let createdAgentId: string | null = null;

  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null || !('action' in body)) {
      return NextResponse.json({ message: 'An agent action is required.' }, { status: 400 });
    }

    const action = (body as { action?: unknown }).action;
    const { organization, user } = await requireOrganizationAccess(undefined, [
      'owner',
      'admin',
      'manager',
    ]);
    const supabase = await createSupabaseServerClient();

    if (action === 'createAgent') {
      const parsed = createAgentSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { message: parsed.error.issues[0]?.message ?? 'Invalid agent configuration.' },
          { status: 400 },
        );
      }
      const input = parsed.data;
      const defaultLanguage =
        input.languages.find((language) => language.isDefault) ?? input.languages[0];
      const agentResult = await supabase
        .from('voice_agents')
        .insert({
          organization_id: organization.id,
          name: input.name,
          slug: slugify(input.name),
          description: input.description || null,
          status: 'draft',
          default_language_code: defaultLanguage.languageCode,
          default_dialect_code: defaultLanguage.dialectCode || null,
          created_by: user.id,
        })
        .select('*')
        .single();
      if (agentResult.error || !agentResult.data) {
        throw new Error(`Unable to create agent: ${agentResult.error?.message ?? 'No agent returned.'}`);
      }
      createdAgentId = agentResult.data.id;

      const versionResult = await supabase
        .from('agent_versions')
        .insert(versionValues(organization.id, createdAgentId, 1, user.id, input))
        .select('*')
        .single();
      if (versionResult.error || !versionResult.data) {
        throw new Error(`Unable to create agent version: ${versionResult.error?.message ?? 'No version returned.'}`);
      }
      await replaceLanguages(
        supabase,
        organization.id,
        createdAgentId,
        versionResult.data.id,
        input.languages,
      );
      return NextResponse.json(
        { agent: agentResult.data, draftVersion: versionResult.data },
        { status: 201 },
      );
    }

    const parsedAction = versionActionSchema.safeParse(body);
    if (!parsedAction.success) {
      return NextResponse.json(
        { message: parsedAction.error.issues[0]?.message ?? 'Invalid version action.' },
        { status: 400 },
      );
    }
    const input = parsedAction.data;
    const agent = await requireAgent(supabase, organization.id, input.agentId);

    if (input.action === 'createVersion') {
      const sourceVersionId = input.versionId ?? agent.active_version_id;
      if (!sourceVersionId) {
        return NextResponse.json(
          { message: 'Publish an initial version before cloning the active version.' },
          { status: 409 },
        );
      }
      const sourceResult = await supabase
        .from('agent_versions')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('agent_id', agent.id)
        .eq('id', sourceVersionId)
        .maybeSingle();
      if (sourceResult.error) throw new Error(`Unable to load source version: ${sourceResult.error.message}`);
      if (!sourceResult.data) {
        return NextResponse.json({ message: 'The source version was not found.' }, { status: 404 });
      }

      const number = await getNextVersionNumber(supabase, organization.id, agent.id);
      const versionResult = await supabase
        .from('agent_versions')
        .insert(createVersionClone(sourceResult.data as AgentVersion, number, user.id))
        .select('*')
        .single();
      if (versionResult.error || !versionResult.data) {
        throw new Error(`Unable to create draft version: ${versionResult.error?.message ?? 'No version returned.'}`);
      }
      await cloneLanguages(
        supabase,
        organization.id,
        agent.id,
        sourceResult.data.id,
        versionResult.data.id,
      );
      return NextResponse.json({ version: versionResult.data }, { status: 201 });
    }

    const versionResult = await supabase
      .from('agent_versions')
      .select('*')
      .eq('organization_id', organization.id)
      .eq('agent_id', agent.id)
      .eq('id', input.versionId)
      .maybeSingle();
    if (versionResult.error) throw new Error(`Unable to load version: ${versionResult.error.message}`);
    if (!versionResult.data) {
      return NextResponse.json({ message: 'The version was not found.' }, { status: 404 });
    }
    if (versionResult.data.status !== 'draft') {
      return NextResponse.json({ message: 'Only draft versions can be published.' }, { status: 409 });
    }

    const publishResult = await supabase
      .from('agent_versions')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_by: user.id,
      })
      .eq('organization_id', organization.id)
      .eq('agent_id', agent.id)
      .eq('id', versionResult.data.id)
      .eq('status', 'draft')
      .select('*')
      .single();
    if (publishResult.error || !publishResult.data) {
      throw new Error(`Unable to publish version: ${publishResult.error?.message ?? 'No version returned.'}`);
    }

    const agentUpdate: TablesUpdate<'voice_agents'> = {
      active_version_id: publishResult.data.id,
      status: agent.status === 'draft' ? 'active' : agent.status,
    };
    const activateResult = await supabase
      .from('voice_agents')
      .update(agentUpdate)
      .eq('organization_id', organization.id)
      .eq('id', agent.id);
    if (activateResult.error) {
      await supabase
        .from('agent_versions')
        .update({ status: 'draft', published_at: null, published_by: null })
        .eq('organization_id', organization.id)
        .eq('agent_id', agent.id)
        .eq('id', publishResult.data.id);
      throw new Error(`Version published but activation failed: ${activateResult.error.message}`);
    }
    return NextResponse.json({ version: publishResult.data });
  } catch (cause) {
    if (createdAgentId) {
      try {
        const { organization } = await requireOrganizationAccess(undefined, ['owner', 'admin', 'manager']);
        const supabase = await createSupabaseServerClient();
        await supabase
          .from('voice_agents')
          .delete()
          .eq('organization_id', organization.id)
          .eq('id', createdAgentId);
      } catch {
        // Keep the original provisioning error; failed cleanup should be captured by server monitoring.
      }
    }
    return errorResponse(cause);
  }
}

export async function PATCH(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = updateAgentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid agent configuration.' },
        { status: 400 },
      );
    }

    const { organization, user } = await requireOrganizationAccess(undefined, [
      'owner',
      'admin',
      'manager',
    ]);
    const supabase = await createSupabaseServerClient();
    const input = parsed.data;
    const agent = await requireAgent(supabase, organization.id, input.agentId);
    const defaultLanguage =
      input.languages.find((language) => language.isDefault) ?? input.languages[0];

    const updateResult = await supabase
      .from('voice_agents')
      .update({
        name: input.name,
        description: input.description || null,
        status: input.status,
        default_language_code: defaultLanguage.languageCode,
        default_dialect_code: defaultLanguage.dialectCode || null,
        archived_at: input.status === 'archived' ? new Date().toISOString() : null,
      })
      .eq('organization_id', organization.id)
      .eq('id', agent.id)
      .select('*')
      .single();
    if (updateResult.error || !updateResult.data) {
      throw new Error(`Unable to update agent: ${updateResult.error?.message ?? 'No agent returned.'}`);
    }

    const draftResult = await supabase
      .from('agent_versions')
      .select('*')
      .eq('organization_id', organization.id)
      .eq('agent_id', agent.id)
      .eq('status', 'draft')
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (draftResult.error) throw new Error(`Unable to load draft version: ${draftResult.error.message}`);

    let draftVersion = draftResult.data;
    if (draftVersion) {
      const values = versionValues(
        organization.id,
        agent.id,
        draftVersion.version_number,
        user.id,
        input,
      );
      const draftUpdate = await supabase
        .from('agent_versions')
        .update({
          system_prompt: values.system_prompt,
          first_message: values.first_message,
          llm_provider: values.llm_provider,
          llm_model: values.llm_model,
          voice_provider: values.voice_provider,
          stt_provider: values.stt_provider,
          tts_provider: values.tts_provider,
          embedding_provider: values.embedding_provider,
          embedding_model: values.embedding_model,
          temperature: values.temperature,
        })
        .eq('organization_id', organization.id)
        .eq('agent_id', agent.id)
        .eq('id', draftVersion.id)
        .eq('status', 'draft')
        .select('*')
        .single();
      if (draftUpdate.error || !draftUpdate.data) {
        throw new Error(`Unable to update draft version: ${draftUpdate.error?.message ?? 'No draft returned.'}`);
      }
      draftVersion = draftUpdate.data;
    } else {
      const number = await getNextVersionNumber(supabase, organization.id, agent.id);
      const createResult = await supabase
        .from('agent_versions')
        .insert(versionValues(organization.id, agent.id, number, user.id, input))
        .select('*')
        .single();
      if (createResult.error || !createResult.data) {
        throw new Error(`Unable to create draft version: ${createResult.error?.message ?? 'No draft returned.'}`);
      }
      draftVersion = createResult.data;
    }

    await replaceLanguages(
      supabase,
      organization.id,
      agent.id,
      draftVersion.id,
      input.languages,
    );
    return NextResponse.json({ agent: updateResult.data, draftVersion });
  } catch (cause) {
    return errorResponse(cause);
  }
}
