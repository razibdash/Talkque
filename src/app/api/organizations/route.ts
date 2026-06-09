import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  // Create organization, first member, default provider connections, default agent, subscription trial.
  return NextResponse.json({ ok: true, organization: payload });
}
