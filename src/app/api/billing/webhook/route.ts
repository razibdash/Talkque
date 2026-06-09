import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  // Verify Stripe/SSLCommerz signature, then update subscriptions and usage.
  return NextResponse.json({ ok: true, bytes: body.length });
}
