import { NextResponse } from 'next/server';

export function apiPlaceholder(resource: string, status = 501) {
  return NextResponse.json(
    {
      ok: false,
      code: 'NOT_IMPLEMENTED',
      message: `${resource} is scaffolded and ready for implementation.`,
    },
    { status },
  );
}

export function webhookAccepted(provider: string) {
  return NextResponse.json(
    {
      ok: true,
      provider,
      message: 'Webhook endpoint is available; verification and processing are not implemented.',
    },
    { status: 202 },
  );
}
