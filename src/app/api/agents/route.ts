import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  // Create voice_agents + agent_versions + agent_language_configs.
  return NextResponse.json({ ok: true, agent: payload });
}
