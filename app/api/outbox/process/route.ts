import { apiPlaceholder } from '@/lib/api-response';

export async function POST() {
  return apiPlaceholder('Outbox processing');
}
