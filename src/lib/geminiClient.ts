import { GoogleGenAI } from '@google/genai';

export const GEMINI_TRENDS_MODEL = 'gemini-4-hydrogen';

export type GeminiKeyStatus = 'configured' | 'placeholder' | 'missing';

const PLACEHOLDER_KEY_PATTERNS = [
  /^MY_GEMINI_API_KEY$/i,
  /^YOUR_.*KEY.*$/i,
  /^GEMINI_API_KEY$/i,
  /^REPLACE_ME$/i,
  /^changeme$/i,
  /^placeholder$/i,
  /^test[-_]?key$/i,
];

function readRawGeminiApiKey(): string | undefined {
  const metaEnv =
    typeof import.meta !== 'undefined'
      ? (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
      : undefined;
  const raw = process.env.GEMINI_API_KEY ?? metaEnv?.GEMINI_API_KEY;
  if (!raw) return undefined;
  const cleaned = raw.trim().replace(/^["']|["']$/g, '').trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

export function isPlaceholderGeminiKey(value?: string | null): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  if (trimmed.length < 16) return true;
  return PLACEHOLDER_KEY_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function getGeminiKeyStatus(): GeminiKeyStatus {
  const raw = readRawGeminiApiKey();
  if (!raw) return 'missing';
  if (isPlaceholderGeminiKey(raw)) return 'placeholder';
  return 'configured';
}

export function getGeminiApiKey(): string | undefined {
  const raw = readRawGeminiApiKey();
  if (!raw || isPlaceholderGeminiKey(raw)) return undefined;
  return raw;
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
