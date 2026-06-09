export type EvaluationResult = {
  score: number;
  passed: boolean;
  notes: string[];
};

export async function evaluateAgentVersion(_versionId: string): Promise<EvaluationResult> {
  void _versionId;
  throw new Error('Agent evaluations are not implemented.');
}
