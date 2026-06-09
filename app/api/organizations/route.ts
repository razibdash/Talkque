import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  AuthenticationError,
  createSupabaseServerClient,
  getCurrentOrganization,
  requireUser,
} from '@/lib/supabase/server';
import type { TablesInsert } from '@/types/database';

export const runtime = 'nodejs';

const onboardingSchema = z
  .object({
    organizationName: z.string().trim().min(2).max(200),
    organizationType: z.string().trim().min(2).max(50),
    industry: z.string().trim().min(2).max(100),
    countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
    timezone: z.string().trim().min(2).max(100),
    website: z.union([z.literal(''), z.string().url().max(500)]),
    agentName: z.string().trim().min(2).max(120),
    defaultLanguage: z.string().trim().min(2).max(12),
    supportedLanguages: z.array(z.string().trim().min(2).max(12)).min(1).max(20),
    sylhetiDialect: z.boolean(),
    greetingMessage: z.string().trim().min(5).max(1000),
    voiceProvider: z.enum(['livekit', 'retell', 'vapi', 'custom']),
    llmProvider: z.literal('groq'),
    embeddingProvider: z.literal('openai'),
    sttProvider: z.literal('deepgram'),
    ttsProvider: z.literal('elevenlabs'),
    uploadLater: z.boolean(),
    faqs: z
      .array(
        z.object({
          question: z.string().trim().max(500),
          answer: z.string().trim().max(3000),
        }),
      )
      .length(3),
  })
  .superRefine((value, context) => {
    if (!value.supportedLanguages.includes(value.defaultLanguage)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['supportedLanguages'],
        message: 'The default language must be included in supported languages.',
      });
    }

    value.faqs.forEach((faq, index) => {
      if (Boolean(faq.question) !== Boolean(faq.answer)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['faqs', index],
          message: 'Each FAQ requires both a question and an answer.',
        });
      }
    });
  });

const languageNames: Record<string, string> = {
  en: 'English',
  bn: 'Bengali',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
};

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'workspace'
  );
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function provisioningError(step: string, message: string) {
  return new Error(`Unable to create ${step}: ${message}`);
}

export async function GET() {
  try {
    const organization = await getCurrentOrganization();
    return NextResponse.json({ organization });
  } catch (cause) {
    if (cause instanceof AuthenticationError) {
      return NextResponse.json({ message: cause.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: cause instanceof Error ? cause.message : 'Unable to load organization.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let organizationId: string | null = null;

  try {
    const body: unknown = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? 'Check the onboarding details and try again.',
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const user = await requireUser(supabase);
    const admin = createSupabaseAdminClient();
    const input = parsed.data;
    const existingMembershipResult = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (existingMembershipResult.error) {
      throw provisioningError(
        'workspace membership check',
        existingMembershipResult.error.message,
      );
    }

    if (existingMembershipResult.data) {
      return NextResponse.json(
        {
          message: 'Your account already has an active Talkque workspace.',
          organizationId: existingMembershipResult.data.organization_id,
        },
        { status: 409 },
      );
    }

    const slug = `${slugify(input.organizationName)}-${randomBytes(3).toString('hex')}`;

    const organizationResult = await admin
      .from('organizations')
      .insert({
        name: input.organizationName,
        slug,
        industry: input.industry,
        country_code: input.countryCode,
        default_timezone: input.timezone,
        default_locale: input.defaultLanguage,
        settings: {
          organization_type: input.organizationType,
          website: input.website || null,
          upload_knowledge_later: input.uploadLater,
          onboarding_completed_at: new Date().toISOString(),
        },
        created_by: user.id,
      })
      .select('*')
      .single();

    if (organizationResult.error || !organizationResult.data) {
      throw provisioningError(
        'organization',
        organizationResult.error?.message ?? 'No organization was returned.',
      );
    }

    organizationId = organizationResult.data.id;

    const memberResult = await admin.from('organization_members').insert({
      organization_id: organizationId,
      user_id: user.id,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(),
    });

    if (memberResult.error) {
      throw provisioningError('owner membership', memberResult.error.message);
    }

    const agentResult = await admin
      .from('voice_agents')
      .insert({
        organization_id: organizationId,
        name: input.agentName,
        slug: slugify(input.agentName),
        status: 'active',
        default_language_code: input.defaultLanguage,
        metadata: { created_during_onboarding: true },
        created_by: user.id,
      })
      .select('*')
      .single();

    if (agentResult.error || !agentResult.data) {
      throw provisioningError(
        'voice agent',
        agentResult.error?.message ?? 'No agent was returned.',
      );
    }

    const agentId = agentResult.data.id;
    const versionResult = await admin
      .from('agent_versions')
      .insert({
        organization_id: organizationId,
        agent_id: agentId,
        version_number: 1,
        status: 'published',
        system_prompt: `You are ${input.agentName}, a helpful multilingual AI phone agent for ${input.organizationName}. Respond clearly, protect customer privacy, and use trusted knowledge when available.`,
        first_message: {
          default_language: input.defaultLanguage,
          message: input.greetingMessage,
        },
        llm_provider: input.llmProvider,
        voice_provider: input.voiceProvider,
        stt_provider: input.sttProvider,
        tts_provider: input.ttsProvider,
        embedding_provider: input.embeddingProvider,
        published_at: new Date().toISOString(),
        published_by: user.id,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (versionResult.error || !versionResult.data) {
      throw provisioningError(
        'agent version',
        versionResult.error?.message ?? 'No version was returned.',
      );
    }

    const versionId = versionResult.data.id;
    const activateResult = await admin
      .from('voice_agents')
      .update({ active_version_id: versionId })
      .eq('id', agentId)
      .eq('organization_id', organizationId);

    if (activateResult.error) {
      throw provisioningError('active agent version', activateResult.error.message);
    }

    const languageRows: TablesInsert<'agent_language_configs'>[] = Array.from(
      new Set(input.supportedLanguages),
    ).map((languageCode) => ({
      organization_id: organizationId as string,
      agent_id: agentId,
      agent_version_id: versionId,
      language_code: languageCode,
      display_name: languageNames[languageCode] ?? languageCode.toUpperCase(),
      first_message: languageCode === input.defaultLanguage ? input.greetingMessage : null,
      is_default: languageCode === input.defaultLanguage,
      is_enabled: true,
    }));

    if (input.sylhetiDialect) {
      languageRows.push({
        organization_id: organizationId,
        agent_id: agentId,
        agent_version_id: versionId,
        language_code: 'bn',
        dialect_code: 'syl',
        display_name: 'Sylheti',
        first_message: input.defaultLanguage === 'bn' ? input.greetingMessage : null,
        is_default: false,
        is_enabled: true,
      });
    }

    const languagesResult = await admin.from('agent_language_configs').insert(languageRows);
    if (languagesResult.error) {
      throw provisioningError('language configurations', languagesResult.error.message);
    }

    const providerRows = [
      { provider_type: 'voice' as const, provider_name: input.voiceProvider },
      { provider_type: 'llm' as const, provider_name: input.llmProvider },
      { provider_type: 'embeddings' as const, provider_name: input.embeddingProvider },
      { provider_type: 'stt' as const, provider_name: input.sttProvider },
      { provider_type: 'tts' as const, provider_name: input.ttsProvider },
    ].map((provider) => ({
      organization_id: organizationId as string,
      ...provider,
      credentials_ref: null,
      config: { configured: false },
      status: 'active' as const,
      is_default: true,
      created_by: user.id,
    }));

    const providersResult = await admin.from('provider_connections').insert(providerRows);
    if (providersResult.error) {
      throw provisioningError('provider defaults', providersResult.error.message);
    }

    const completedFaqs = input.faqs.filter((faq) => faq.question && faq.answer);

    if (completedFaqs.length) {
      const sourceResult = await admin
        .from('kb_sources')
        .insert({
          organization_id: organizationId,
          name: 'Onboarding FAQs',
          source_type: 'text',
          base_language_code: input.defaultLanguage,
          status: 'active',
          metadata: { created_during_onboarding: true },
          created_by: user.id,
        })
        .select('*')
        .single();

      if (sourceResult.error || !sourceResult.data) {
        throw provisioningError(
          'FAQ source',
          sourceResult.error?.message ?? 'No source was returned.',
        );
      }

      const faqText = completedFaqs
        .map((faq) => `Question: ${faq.question}\nAnswer: ${faq.answer}`)
        .join('\n\n');
      const documentResult = await admin
        .from('kb_documents')
        .insert({
          organization_id: organizationId,
          source_id: sourceResult.data.id,
          title: 'Starter FAQs',
          base_language_code: input.defaultLanguage,
          status: 'ready',
          metadata: { content_type: 'faq', created_during_onboarding: true },
          created_by: user.id,
        })
        .select('*')
        .single();

      if (documentResult.error || !documentResult.data) {
        throw provisioningError(
          'FAQ document',
          documentResult.error?.message ?? 'No document was returned.',
        );
      }

      const versionDocumentResult = await admin
        .from('kb_document_versions')
        .insert({
          organization_id: organizationId,
          document_id: documentResult.data.id,
          version_number: 1,
          content_hash: sha256(faqText),
          byte_size: Buffer.byteLength(faqText, 'utf8'),
          extracted_text: faqText,
          parser_name: 'talkque-manual-faq',
          parser_version: '1',
          processing_status: 'ready',
          processed_at: new Date().toISOString(),
          metadata: { faq_count: completedFaqs.length },
        })
        .select('*')
        .single();

      if (versionDocumentResult.error || !versionDocumentResult.data) {
        throw provisioningError(
          'FAQ document version',
          versionDocumentResult.error?.message ?? 'No document version was returned.',
        );
      }

      const documentVersionId = versionDocumentResult.data.id;
      const chunksResult = await admin.from('kb_chunks').insert(
        completedFaqs.map((faq, index) => {
          const content = `Question: ${faq.question}\nAnswer: ${faq.answer}`;
          return {
            organization_id: organizationId as string,
            document_id: documentResult.data.id,
            document_version_id: documentVersionId,
            chunk_index: index,
            content,
            content_hash: sha256(content),
            language_code: input.defaultLanguage,
            metadata: { type: 'faq', question: faq.question },
          };
        }),
      );

      if (chunksResult.error) {
        throw provisioningError('FAQ chunks', chunksResult.error.message);
      }

      const currentVersionResult = await admin
        .from('kb_documents')
        .update({ current_version_id: documentVersionId })
        .eq('id', documentResult.data.id)
        .eq('organization_id', organizationId);

      if (currentVersionResult.error) {
        throw provisioningError('current FAQ version', currentVersionResult.error.message);
      }
    }

    const response = NextResponse.json(
      {
        organizationId,
        agentId,
        agentVersionId: versionId,
      },
      { status: 201 },
    );
    response.cookies.set('talkque_organization_id', organizationId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (cause) {
    if (organizationId) {
      try {
        await createSupabaseAdminClient().from('organizations').delete().eq('id', organizationId);
      } catch {
        // Preserve the provisioning error; orphan cleanup should be monitored separately.
      }
    }

    if (cause instanceof AuthenticationError) {
      return NextResponse.json({ message: cause.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        message:
          cause instanceof Error
            ? cause.message
            : 'Unable to create your Talkque workspace. Please try again.',
      },
      { status: 500 },
    );
  }
}
