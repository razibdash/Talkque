import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchKnowledgeBase } from '@/lib/rag/search';
import {
  AuthenticationError,
  AuthorizationError,
  createSupabaseServerClient,
  requireOrganizationAccess,
} from '@/lib/supabase/server';

const searchSchema = z.object({
  query: z.string().trim().min(2).max(2000),
  languageCode: z.string().trim().min(2).max(20).nullable().optional(),
  dialectCode: z.string().trim().min(2).max(30).nullable().optional(),
  threshold: z.number().min(0).max(1).optional(),
  limit: z.number().int().min(1).max(20).optional(),
});

export async function POST(request: Request) {
  try {
    const input = searchSchema.parse(await request.json());
    const { organization } = await requireOrganizationAccess();
    const client = await createSupabaseServerClient();
    const results = await searchKnowledgeBase(organization.id, input.query, {
      languageCode: input.languageCode,
      dialectCode: input.dialectCode,
      threshold: input.threshold,
      limit: input.limit,
      client,
    });

    return NextResponse.json({ ok: true, results });
  } catch (cause) {
    if (cause instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: cause.issues[0]?.message ?? 'Invalid search request.' },
        { status: 400 },
      );
    }
    if (cause instanceof AuthenticationError) {
      return NextResponse.json({ ok: false, message: cause.message }, { status: 401 });
    }
    if (cause instanceof AuthorizationError) {
      return NextResponse.json({ ok: false, message: cause.message }, { status: 403 });
    }

    return NextResponse.json(
      {
        ok: false,
        message: cause instanceof Error ? cause.message : 'Knowledge search failed.',
      },
      { status: 500 },
    );
  }
}
