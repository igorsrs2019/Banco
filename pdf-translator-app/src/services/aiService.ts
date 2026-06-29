import { TranslationResult } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
const BASE_URL =
  process.env.EXPO_PUBLIC_AI_BASE_URL ?? 'https://api.openai.com/v1';
const MODEL = process.env.EXPO_PUBLIC_AI_MODEL ?? 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are an English-to-Portuguese language tutor.
When given an English word or phrase, respond ONLY with valid JSON in this exact format:
{
  "translation": "tradução em português",
  "explanation": "explicação simples em português do que significa e como é usado",
  "example": "example sentence in English using the word/phrase"
}
Keep the explanation under 2 sentences. Keep the example sentence natural and simple.`;

export async function translateAndExplain(
  term: string
): Promise<TranslationResult> {
  if (!API_KEY) {
    throw new Error(
      'API key não configurada. Adicione EXPO_PUBLIC_OPENAI_API_KEY no arquivo .env'
    );
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: term },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro na API (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Resposta vazia da API de IA');
  }

  const parsed = JSON.parse(content) as TranslationResult;
  if (!parsed.translation || !parsed.explanation || !parsed.example) {
    throw new Error('Formato de resposta inválido da API');
  }
  return parsed;
}
