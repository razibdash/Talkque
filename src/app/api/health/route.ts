import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'talkque-saas', timestamp: new Date().toISOString() });
}
