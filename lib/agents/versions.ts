export type VersionStatus = 'draft' | 'published' | 'retired';

export function nextVersionNumber(currentVersions: number[]): number {
  return Math.max(0, ...currentVersions) + 1;
}
