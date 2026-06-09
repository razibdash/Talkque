import { NextResponse } from 'next/server';

export async function POST() {
  // Process pending outbox_events and create/update followup_messages.
  return NextResponse.json({ ok: true, processed: 0 });
}
