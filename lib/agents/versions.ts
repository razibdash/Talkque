import type { AgentVersion, TablesInsert } from '@/types/database';

export type VersionStatus = AgentVersion['status'];

export function nextVersionNumber(currentVersions: number[]): number {
  return Math.max(0, ...currentVersions) + 1;
}

export function createVersionClone(
  source: AgentVersion,
  versionNumber: number,
  createdBy: string,
): TablesInsert<'agent_versions'> {
  return {
    organization_id: source.organization_id,
    agent_id: source.agent_id,
    version_number: versionNumber,
    status: 'draft',
    system_prompt: source.system_prompt,
    first_message: source.first_message,
    llm_provider: source.llm_provider,
    llm_model: source.llm_model,
    voice_provider: source.voice_provider,
    stt_provider: source.stt_provider,
    tts_provider: source.tts_provider,
    embedding_provider: source.embedding_provider,
    embedding_model: source.embedding_model,
    embedding_dimensions: source.embedding_dimensions,
    temperature: source.temperature,
    max_response_tokens: source.max_response_tokens,
    tools_config: source.tools_config,
    rag_config: source.rag_config,
    safety_config: source.safety_config,
    created_by: createdBy,
  };
}
