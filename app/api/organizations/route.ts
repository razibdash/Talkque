import { apiPlaceholder } from '@/lib/api-response';

export async function GET() {
  return apiPlaceholder('Organization listing');
}

export async function POST() {
  return apiPlaceholder('Organization creation');
}
