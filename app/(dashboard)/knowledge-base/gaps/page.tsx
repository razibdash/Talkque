import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { ArrowLeft, CircleHelp } from 'lucide-react';
import { z } from 'zod';
import { GapTable, type KnowledgeGapRow } from '@/components/knowledge-base/gap-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createSupabaseServerClient, requireOrganizationAccess } from '@/lib/supabase/server';

function normalizeQuestion(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
}

async function markGapResolved(formData: FormData) {
  'use server';

  const gapId = z.string().uuid().parse(formData.get('gapId'));
  const { organization, user } = await requireOrganizationAccess(undefined, [
    'owner',
    'admin',
    'manager',
  ]);
  const supabase = await createSupabaseServerClient();
  const result = await supabase
    .from('kb_gaps')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
    })
    .eq('organization_id', organization.id)
    .eq('id', gapId);

  if (result.error) {
    throw new Error(`Unable to resolve knowledge gap: ${result.error.message}`);
  }

  revalidatePath('/knowledge-base');
  revalidatePath('/knowledge-base/gaps');
}

export default async function KnowledgeGapsPage() {
  const { organization } = await requireOrganizationAccess();
  const supabase = await createSupabaseServerClient();
  const [gapsResult, answersResult] = await Promise.all([
    supabase
      .from('kb_gaps')
      .select('*')
      .eq('organization_id', organization.id)
      .order('occurrence_count', { ascending: false })
      .order('last_seen_at', { ascending: false }),
    supabase
      .from('answer_events')
      .select('query, confidence_score')
      .eq('organization_id', organization.id)
      .not('confidence_score', 'is', null)
      .limit(5000),
  ]);

  if (gapsResult.error) {
    throw new Error(`Unable to load knowledge gaps: ${gapsResult.error.message}`);
  }
  if (answersResult.error) {
    throw new Error(`Unable to load answer confidence: ${answersResult.error.message}`);
  }

  const confidenceByQuestion = new Map<string, { total: number; count: number }>();
  for (const event of answersResult.data) {
    if (event.confidence_score === null) continue;
    const key = normalizeQuestion(event.query);
    const current = confidenceByQuestion.get(key) ?? { total: 0, count: 0 };
    current.total += event.confidence_score;
    current.count += 1;
    confidenceByQuestion.set(key, current);
  }

  const gaps: KnowledgeGapRow[] = gapsResult.data.map((gap) => {
    const confidence = confidenceByQuestion.get(gap.normalized_question) ??
      confidenceByQuestion.get(normalizeQuestion(gap.question));
    return {
      id: gap.id,
      question: gap.question,
      occurrenceCount: gap.occurrence_count,
      languageCode: gap.language_code,
      dialectCode: gap.dialect_code,
      confidenceAverage: confidence ? confidence.total / confidence.count : null,
      status: gap.status,
      lastSeenAt: gap.last_seen_at,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/knowledge-base" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft className="mr-1.5 size-4" />
          Back to knowledge base
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Knowledge gaps
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Prioritize repeated questions that produced low-confidence or fallback answers.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Observed gaps</CardTitle>
            <CardDescription>Confidence averages are derived from matching answer audit events.</CardDescription>
          </div>
          <CircleHelp className="size-5 text-brand-600" />
        </CardHeader>
        <CardContent>
          <GapTable gaps={gaps} markResolved={markGapResolved} />
        </CardContent>
      </Card>
    </div>
  );
}
