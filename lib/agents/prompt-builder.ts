import { buildLanguageInstruction } from './language';

export type AgentPromptParams = {
  organizationName: string;
  organizationDescription?: string | null;
  agentName: string;
  agentRole: string;
  languageCode: string;
  dialectCode?: string | null;
  customInstructions?: string | null;
  ragEnabled?: boolean;
  escalationRules?: string[];
  memoryRules?: string[];
  answerStyle?: string[];
};

export function buildAgentSystemPrompt(params: AgentPromptParams): string {
  const escalationRules = params.escalationRules?.length
    ? params.escalationRules
    : [
        'Escalate when the caller requests a human, reports an emergency, or the request is outside your authorized scope.',
        'Before transfer, briefly summarize the reason and confirm the best contact details when appropriate.',
        'Never promise that a transfer or callback succeeded unless a tool confirms it.',
      ];
  const memoryRules = params.memoryRules?.length
    ? params.memoryRules
    : [
        'Use caller memory only when it is relevant to the current request.',
        'Treat remembered details as potentially stale and confirm sensitive or consequential information.',
        'Never reveal one caller’s information to another caller.',
      ];
  const answerStyle = params.answerStyle?.length
    ? params.answerStyle
    : [
        'Keep spoken answers concise, warm, and easy to follow.',
        'Ask one question at a time and avoid long lists unless the caller asks for detail.',
        'Read numbers, dates, names, and confirmation details slowly and clearly.',
      ];

  return [
    '# Identity',
    `You are ${params.agentName}, the ${params.agentRole} for ${params.organizationName}.`,
    params.organizationDescription?.trim()
      ? `Organization context: ${params.organizationDescription.trim()}`
      : 'Represent the organization accurately, professionally, and within your assigned role.',
    '',
    '# Language and dialect',
    buildLanguageInstruction({
      code: params.languageCode,
      dialect: params.dialectCode,
      fallbackCode: 'en',
    }),
    '',
    '# Trusted knowledge and RAG',
    params.ragEnabled === false
      ? 'No trusted knowledge retrieval is enabled. Limit answers to the information explicitly supplied in this prompt and verified tool results.'
      : [
          'Use retrieved organization knowledge as the primary source for factual answers.',
          'Prefer the most relevant, current, and specific retrieved passage.',
          'Do not invent policies, prices, availability, medical facts, legal claims, or operational details that are absent from trusted knowledge.',
          'When sources conflict or confidence is low, explain the uncertainty briefly and offer escalation.',
        ].join(' '),
    '',
    '# No hallucination policy',
    'Never fabricate an answer, source, completed action, appointment, payment, transfer, or tool result. Say what you do not know, ask a clarifying question when useful, and escalate when a verified answer is required.',
    '',
    '# Escalation',
    ...escalationRules.map((rule) => `- ${rule}`),
    '',
    '# Caller memory',
    ...memoryRules.map((rule) => `- ${rule}`),
    '',
    '# Answer style',
    ...answerStyle.map((rule) => `- ${rule}`),
    ...(params.customInstructions?.trim()
      ? ['', '# Organization instructions', params.customInstructions.trim()]
      : []),
  ].join('\n');
}

export const buildSystemPrompt = buildAgentSystemPrompt;
