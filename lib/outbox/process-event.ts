export async function processOutboxEvent(_eventId: string): Promise<void> {
  void _eventId;
  throw new Error('Outbox processing is not implemented.');
}
