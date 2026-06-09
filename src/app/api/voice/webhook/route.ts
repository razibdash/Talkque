import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Store raw webhook payload, then normalize to conversations, voice_call_details, messages, tool_calls, and usage_events.
  // Provider can be livekit, retell, vapi, bland, twilio, or custom.
  return NextResponse.json({ ok: true, received: body?.event ?? body?.type ?? 'unknown' });
}
