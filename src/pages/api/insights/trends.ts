import type { APIRoute } from 'astro';
import {
  createGeminiServerClient,
  GEMINI_TRENDS_MODEL,
} from '../../../lib/geminiClient';
import {
  buildTrendsSearchPrompt,
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

async function fetchGroundedTrends(topicRaw?: string | null, queryRaw?: string | null) {
  const ai = createGeminiServerClient();
  if (!ai) {
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'MISSING_API_KEY',
        error:
          'Server search grounding is unavailable because GEMINI_API_KEY is not configured in the server environment.',
      }),
      { status: 503, headers: JSON_HEADERS }
    );
  }

  const topic = normalizeTrendTopic(topicRaw);
  const customQuery = sanitizeCustomQuery(queryRaw);
  const { systemInstruction, userPrompt } = buildTrendsSearchPrompt(topic, customQuery);

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_TRENDS_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          abortSignal: AbortSignal.timeout(22000),
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

      return new Response(
        JSON.stringify({
          ok: true,
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
  return fetchGroundedTrends(topic, query);
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      topic?: string;
      query?: string;
    };
    return fetchGroundedTrends(body?.topic, body?.query);
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
