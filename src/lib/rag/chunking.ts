export function chunkText(text: string, size = 400, overlap = 50) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let index = 0;

  while (index < words.length) {
    const chunk = words.slice(index, index + size).join(' ');
    if (chunk.length > 50) chunks.push(chunk);
    index += Math.max(1, size - overlap);
  }

  return chunks;
}
