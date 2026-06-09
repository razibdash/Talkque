export async function embedWithOpenAI(input: string): Promise<number[]> {
  // Keep embedding provider separate from Groq. Groq is used for LLM inference, not RAG embeddings in this scaffold.
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
      input,
    }),
  });

  if (!res.ok) throw new Error(`Embedding request failed: ${res.status}`);
  const json = await res.json();
  return json.data[0].embedding as number[];
}
