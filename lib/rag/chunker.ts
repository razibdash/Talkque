export type ChunkOptions = {
  maxTokens?: number;
  overlapTokens?: number;
  maxCharacters?: number;
  overlapCharacters?: number;
  metadata?: Record<string, unknown>;
};

export type TextChunk = {
  index: number;
  content: string;
  tokenCount: number;
  metadata: Record<string, unknown> & {
    startWord: number;
    endWord: number;
  };
};

const WORDS_PER_TOKEN = 0.75;

function approximateTokens(wordCount: number) {
  return Math.ceil(wordCount / WORDS_PER_TOKEN);
}

export function chunkText(text: string, options: ChunkOptions = {}): TextChunk[] {
  const normalized = text.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').trim();
  if (!normalized) return [];

  const maxTokens = Math.max(20, options.maxTokens ?? 450);
  const overlapTokens = Math.max(0, options.overlapTokens ?? 60);
  const characterLimit = options.maxCharacters;
  const characterOverlap = options.overlapCharacters;
  const maxWords = characterLimit
    ? Math.max(10, Math.floor(characterLimit / 6))
    : Math.max(10, Math.floor(maxTokens * WORDS_PER_TOKEN));
  const overlapWords = characterOverlap
    ? Math.max(0, Math.floor(characterOverlap / 6))
    : Math.min(maxWords - 1, Math.floor(overlapTokens * WORDS_PER_TOKEN));
  const words = normalized.split(/\s+/);
  const chunks: TextChunk[] = [];
  let startWord = 0;

  while (startWord < words.length) {
    let endWord = Math.min(words.length, startWord + maxWords);

    if (endWord < words.length) {
      const window = words.slice(startWord, endWord).join(' ');
      const boundary = Math.max(
        window.lastIndexOf('\n\n'),
        window.lastIndexOf('. '),
        window.lastIndexOf('? '),
        window.lastIndexOf('! '),
      );

      if (boundary > window.length * 0.55) {
        endWord = startWord + window.slice(0, boundary + 1).split(/\s+/).length;
      }
    }

    const content = words.slice(startWord, endWord).join(' ').trim();
    if (content) {
      chunks.push({
        index: chunks.length,
        content,
        tokenCount: approximateTokens(endWord - startWord),
        metadata: {
          ...(options.metadata ?? {}),
          startWord,
          endWord,
        },
      });
    }

    if (endWord >= words.length) break;
    startWord = Math.max(startWord + 1, endWord - overlapWords);
  }

  return chunks;
}
