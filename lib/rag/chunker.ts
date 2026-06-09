export type ChunkOptions = {
  maxCharacters?: number;
  overlapCharacters?: number;
};

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const maxCharacters = options.maxCharacters ?? 1200;
  if (text.length <= maxCharacters) return [text];
  throw new Error('Production document chunking is not implemented.');
}
