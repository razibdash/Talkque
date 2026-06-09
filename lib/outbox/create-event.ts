export type OutboxEventInput = {
  organizationId: string;
  eventType: string;
  payload: Record<string, unknown>;
};

export async function createOutboxEvent(_input: OutboxEventInput) {
  void _input;
  throw new Error('Outbox persistence is not implemented.');
}
