import { MessagesSquare } from 'lucide-react';
import { PagePlaceholder } from '@/components/shared/page-placeholder';

export default async function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  return <PagePlaceholder title={`Conversation: ${conversationId}`} description="Inspect transcript, recording, timeline, tool calls, retrieval evidence, and call outcome." icon={MessagesSquare} />;
}
