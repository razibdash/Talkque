import crypto from 'node:crypto';

export function normalizePhoneToE164(phone: string) {
  return phone.trim().replace(/\s+/g, '');
}

export function hashPhone(phone: string) {
  const secret = process.env.PHONE_HASH_SECRET ?? 'development-secret';
  return crypto.createHmac('sha256', secret).update(normalizePhoneToE164(phone)).digest('hex');
}
