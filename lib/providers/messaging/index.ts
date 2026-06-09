export type MessagingProviderName = 'whatsapp';

export interface MessagingProvider {
  name: MessagingProviderName;
  sendMessage(to: string, body: string): Promise<{ messageId: string }>;
}
