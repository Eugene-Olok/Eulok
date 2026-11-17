import type { APIRoute } from 'astro';
import { ThinkingLevel } from '@google/genai';
import {
  createGeminiServerClient,
  GEMINI_TRENDS_MODEL,
  getGeminiKeyStatus,
} from '../../../lib/geminiClient';
import {
  buildTrendsSearchPrompt,
  type GroundedTrendsPayload,
  normalizeTrendTopic,
  parseGroundedTrendsResponse,
  sanitizeCustomQuery,
} from '../../../engine/trendsParser';

export const prerender = false;

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 32;

const trendsCache = new Map<string, { payload: GroundedTrendsPayload; cachedAt: number }>();

function readCachedTrends(key: string): GroundedTrendsPayload | null {
  const entry = trendsCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    trendsCache.delete(key);
    return null;
  }
  return entry.payload;
}

function writeCachedTrends(key: string, payload: GroundedTrendsPayload): void {
  if (trendsCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = trendsCache.keys().next().value;
    if (oldestKey) trendsCache.delete(oldestKey);
  }
  trendsCache.set(key, { payload, cachedAt: Date.now() });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractCleanErrorMessage(rawMessage: string): string {
  const trimmed = rawMessage.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as { error?: { message?: string }; message?: string };
      const nested = parsed?.error?.message || parsed?.message;
      if (typeof nested === 'string' && nested.trim()) {
        return nested.trim();
      }
    } catch {
      // Fall through to rawMessage
    }
  }
  return trimmed;
}

function getUpstreamErrorDetails(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  const errObj = error as { status?: number; code?: string | number; message?: string };
  const rawMessage = errObj?.message || 'Unable to query search-grounded trends service.';
  const cleanMessage = extractCleanErrorMessage(rawMessage);
  const numericStatus =
    typeof errObj?.status === 'number'
      ? errObj.status
      : typeof errObj?.code === 'number'
      ? errObj.code
      : /429|RESOURCE_EXHAUSTED/i.test(rawMessage)
      ? 429
      : /403|PERMISSION_DENIED/i.test(rawMessage)
      ? 403
      : /400|API_KEY_INVALID|API key not valid/i.test(rawMessage)
      ? 400
      : /404|NOT_FOUND/i.test(rawMessage)
      ? 404
      : 502;

  const code =
    numericStatus === 429
      ? 'RATE_LIMITED'
      : numericStatus === 403 || numericStatus === 400
      ? 'API_KEY_ERROR'
      : numericStatus === 404
      ? 'MODEL_NOT_FOUND'
      : 'UPSTREAM_ERROR';

  const message =
    code === 'API_KEY_ERROR'
      ? `${cleanMessage} Verify or select a valid GEMINI_API_KEY in Settings > Secrets.`
      : code === 'RATE_LIMITED'
      ? `${cleanMessage} Search grounding quota temporarily reached; check Settings > Secrets or retry shortly.`
      : cleanMessage;

  return {
    status: numericStatus,
    code,
    message,
  };
}

async function fetchGroundedTrends(
  topicRaw?: string | null,
  queryRaw?: string | null,
  forceRefresh = false
) {
  const startedAt = Date.now();
  const keyStatus = getGeminiKeyStatus();
  const ai = createGeminiServerClient();

  if (!ai) {
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'MISSING_API_KEY',
        error:
          keyStatus === 'placeholder'
            ? 'Server search grounding is unavailable because GEMINI_API_KEY is still set to the workspace placeholder. Configure a valid key in Settings > Secrets.'
            : 'Server search grounding is unavailable because GEMINI_API_KEY is not configured in the server environment.',
      }),
      { status: 503, headers: JSON_HEADERS }
    );
  }

  const topic = normalizeTrendTopic(topicRaw);
  const customQuery = sanitizeCustomQuery(queryRaw);
  const cacheKey = `${topic}:${customQuery.toLowerCase()}`;

  if (!forceRefresh) {
    const cached = readCachedTrends(cacheKey);
    if (cached) {
      return new Response(
        JSON.stringify({
          ok: true,
          cached: true,
          latencyMs: Date.now() - startedAt,
          ...cached,
        }),
        { status: 200, headers: JSON_HEADERS }
      );
    }
  }

  const { systemInstruction, userPrompt } = buildTrendsSearchPrompt(topic, customQuery);

  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_TRENDS_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          abortSignal: AbortSignal.timeout(30000),
        },
      });

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata ?? null;
      const payload = parseGroundedTrendsResponse({
        rawText: response.text,
        groundingMetadata,
        topic,
        customQuery,
        model: GEMINI_TRENDS_MODEL,
      });

      writeCachedTrends(cacheKey, payload);

      return new Response(
        JSON.stringify({
          ok: true,
          cached: false,
          latencyMs: Date.now() - startedAt,
          ...payload,
        }),
        { status: 200, headers: JSON_HEADERS }
      );
    } catch (err) {
      lastError = err;
      const details = getUpstreamErrorDetails(err);
      const isTimeout = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
      const isRetryable = isTimeout || details.status === 429 || details.status >= 500;
      if (!isRetryable || attempt === maxAttempts) {
        return new Response(
          JSON.stringify({
            ok: false,
            code: isTimeout ? 'UPSTREAM_TIMEOUT' : details.code,
            error: isTimeout
              ? 'Live Google Search grounding request timed out. Please retry shortly.'
              : details.message,
          }),
          { status: isTimeout ? 504 : details.status, headers: JSON_HEADERS }
        );
      }
      await sleep(300 * 2 ** (attempt - 1));
    }
  }

  const fallback = getUpstreamErrorDetails(lastError);
  return new Response(
    JSON.stringify({
      ok: false,
      code: fallback.code,
      error: fallback.message,
    }),
    { status: fallback.status, headers: JSON_HEADERS }
  );
}

export const GET: APIRoute = async ({ url }) => {
  const topic = url.searchParams.get('topic');
  const query = url.searchParams.get('q');
  const refresh = url.searchParams.get('refresh') === '1' || url.searchParams.get('refresh') === 'true';
  return fetchGroundedTrends(topic, query, refresh);
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      topic?: string;
      query?: string;
      refresh?: boolean;
    };
    return fetchGroundedTrends(body?.topic, body?.query, Boolean(body?.refresh));
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'BAD_REQUEST',
        error: 'Malformed JSON payload.',
      }),
      { status: 400, headers: JSON_HEADERS }
    );
  }
};
