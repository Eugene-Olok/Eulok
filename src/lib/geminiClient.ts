import { GoogleGenAI } from '@google/genai';

export const GEMINI_TRENDS_MODEL = 'gemini-4-hydrogen';

export function getGeminiApiKey(): string | undefined {
  const metaEnv =
    typeof import.meta !== 'undefined'
      ? (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
      : undefined;
  const raw = process.env.GEMINI_API_KEY ?? metaEnv?.GEMINI_API_KEY;
  if (!raw) return undefined;
  const cleaned = raw.trim().replace(/^["']|["']$/g, '').trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

export function createGeminiServerClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}
