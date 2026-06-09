export type PromptContext = {
  organizationName: string;
  agentName: string;
  language: string;
  instructions: string;
};

export function buildSystemPrompt(context: PromptContext): string {
  return [
    `You are ${context.agentName}, an AI phone agent for ${context.organizationName}.`,
    `Primary language: ${context.language}.`,
    context.instructions,
  ].join('\n\n');
}
