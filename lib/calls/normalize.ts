export type NormalizedCallEvent = {
  provider: string;
  externalId: string;
  event: string;
  occurredAt: string;
  payload: Record<string, unknown>;
};

export function normalizeCallEvent(
  provider: string,
  payload: Record<string, unknown>,
): NormalizedCallEvent {
  return {
    provider,
    externalId: String(payload.id ?? payload.call_id ?? ''),
    event: String(payload.event ?? payload.type ?? 'unknown'),
    occurredAt: String(payload.created_at ?? new Date().toISOString()),
    payload,
  };
}
