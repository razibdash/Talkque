import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  // Run agent_test_cases against a specific agent_version_id before publishing.
  return NextResponse.json({ ok: true, evaluation: payload });
}
