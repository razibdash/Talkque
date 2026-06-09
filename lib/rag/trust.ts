export type TrustDecision = {
  canAnswer: boolean;
  confidence: number;
  reason: string;
};

export function evaluateRetrievalTrust(scores: number[], threshold = 0.72): TrustDecision {
  const confidence = Math.max(...scores, 0);
  return {
    canAnswer: confidence >= threshold,
    confidence,
    reason: confidence >= threshold ? 'retrieval_threshold_met' : 'insufficient_evidence',
  };
}
