import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateWithGroq(prompt: string) {
  const model = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';
  const response = await groq.chat.completions.create({
    model,
    temperature: 0.25,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0]?.message?.content ?? '';
}
