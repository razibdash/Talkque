import { webhookAccepted } from '@/lib/api-response';

export async function POST() {
  return webhookAccepted('livekit');
}
