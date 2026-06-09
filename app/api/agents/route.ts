import { apiPlaceholder } from '@/lib/api-response';

export async function GET() {
  return apiPlaceholder('Agent listing');
}

export async function POST() {
  return apiPlaceholder('Agent creation');
}
