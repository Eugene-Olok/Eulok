/**
 * Financial Operations Live Trends & Search Grounding Parser
 * Pure, deterministic prompt construction, structured JSON extraction,
 * URL sanitization, and grounding citation normalization.
 */

export type TrendTopicId =
  | 'all'
  | 'east-africa-rails'
  | 'efris-compliance'
  | 'idempotency-settlement'
  | 'iso20022-open-banking';

export interface TrendTopicDefinition {
  id: TrendTopicId;
  label: string;
  searchAngle: string;
}

export const TREND_TOPICS: Record<TrendTopicId, TrendTopicDefinition> = {
  all: {
    id: 'all',
    label: 'All FinOps Trends',
    searchAngle:
      'financial operations engineering, real-time payment rails, ISO 20022 settlement, mobile money APIs in East Africa, and automated ledger reconciliation',
  },
  'east-africa-rails': {
    id: 'east-africa-rails',
    label: 'East Africa Rails',
    searchAngle:
      'Uganda and East Africa payment systems, MTN MoMo API, Airtel Money API, mobile money interoperability, and Bank of Uganda national payment system updates',
  },
  'efris-compliance': {
    id: 'efris-compliance',
    label: 'EFRIS & Fiscal APIs',
    searchAngle:
      'Uganda Revenue Authority URA EFRIS e-invoicing updates, fiscalization API requirements, ERP integration compliance, and electronic tax reporting standards',
  },
  'idempotency-settlement': {
    id: 'idempotency-settlement',
    label: 'Idempotency & Ledgers',
    searchAngle:
      'payment webhook idempotency, distributed ledger reconciliation, double-entry immutable accounting engines, and fail-closed settlement reliability',
  },
  'iso20022-open-banking': {
    id: 'iso20022-open-banking',
    label: 'ISO 20022 & Treasury',
    searchAngle:
      'ISO 20022 payment messaging adoption, instant cross-border clearing, cryptographic webhook verification, and corporate treasury automation APIs',
  },
};

export type TrendImpactLevel = 'HIGH' | 'MEDIUM' | 'WATCH';

export interface GroundedTrendItem {
  title: string;
  category: string;
  publishedWindow: string;
  summary: string;
  engineeringTakeaway: string;
  impactLevel: TrendImpactLevel;
}

export interface GroundingSourceLink {
  title: string;
  url: string;
  domain: string;
}

export interface GroundedTrendsPayload {
  topic: TrendTopicId;
  customQuery?: string;
  generatedAt: string;
  model: string;
  briefingSummary: string;
  trends: GroundedTrendItem[];
  sources: GroundingSourceLink[];
  searchQueries: string[];
}

export function normalizeTrendTopic(raw?: string | null): TrendTopicId {
  if (!raw || typeof raw !== 'string') return 'all';
  const cleaned = raw.trim().toLowerCase() as TrendTopicId;
  return cleaned in TREND_TOPICS ? cleaned : 'all';
}

export function sanitizeCustomQuery(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
}

export function buildTrendsSearchPrompt(topicId: TrendTopicId, customQuery?: string): {
  systemInstruction: string;
  userPrompt: string;
} {
  const topic = TREND_TOPICS[topicId];
  const cleanedQuery = sanitizeCustomQuery(customQuery);
  const focusClause = cleanedQuery
    ? `Primary focus query: "${cleanedQuery}" within the domain of ${topic.searchAngle}.`
    : `Focus domain: ${topic.searchAngle}.`;

  const systemInstruction = [
    'You are a principal financial systems researcher preparing an engineering brief for fintech and operations teams.',
    'Use Google Search grounding to retrieve current, verifiable industry news, regulatory changes, payment network announcements, and reliability engineering developments.',
    'Never invent URLs, statistics, dates, or announcements. Cite facts strictly supported by the retrieved search results.',
    'Keep prose concise, objective, and focused on engineering implications (idempotency, settlement finality, tax compliance APIs, webhook security, ledger correctness).',
    'Output strictly valid JSON matching this schema with no surrounding commentary:',
    '{',
    '  "briefingSummary": "2-3 sentence executive synthesis of the current operational landscape",',
    '  "trends": [',
    '    {',
    '      "title": "Concise headline (max 14 words)",',
    '      "category": "Short domain category (e.g. Payment Rails, Fiscal Compliance, Settlement Engineering)",',
    '      "publishedWindow": "Recency window grounded in source (e.g. Nov 2026 or Q4 2026)",',
    '      "summary": "2-3 sentence factual summary grounded in search results",',
    '      "engineeringTakeaway": "Concrete architectural or integration action item for engineering teams",',
    '      "impactLevel": "HIGH" | "MEDIUM" | "WATCH"',
    '    }',
    '  ]',
    '}',
    'Provide 4 to 5 distinct trend items.',
  ].join('\n');

  const userPrompt = [
    `Search the web for the latest developments in ${focusClause}`,
    'Prioritize recent standards updates, regulator notices, payment rail interoperability shifts, and production reliability practices relevant to teams operating across East Africa and global settlement rails.',
    'Return the grounded brief strictly as JSON.',
  ].join('\n\n');

  return { systemInstruction, userPrompt };
}

export function sanitizeHttpUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function extractDomainFromUrl(validUrl: string): string {
  try {
    return new URL(validUrl).hostname.replace(/^www\./i, '');
  } catch {
    return 'source';
  }
}

export interface RawGroundingChunk {
  web?: {
    uri?: string | null;
    title?: string | null;
  } | null;
}

export interface RawGroundingMetadata {
  groundingChunks?: RawGroundingChunk[] | null;
  webSearchQueries?: (string | null)[] | null;
}

export function extractGroundingSources(metadata?: RawGroundingMetadata | null): {
  sources: GroundingSourceLink[];
  searchQueries: string[];
} {
  const seenUrls = new Set<string>();
  const sources: GroundingSourceLink[] = [];

  for (const chunk of metadata?.groundingChunks ?? []) {
    const safeUrl = sanitizeHttpUrl(chunk?.web?.uri);
    if (!safeUrl || seenUrls.has(safeUrl)) continue;
    seenUrls.add(safeUrl);
    const rawTitle = chunk?.web?.title?.trim();
    const domain = extractDomainFromUrl(safeUrl);
    sources.push({
      title: rawTitle && rawTitle.length > 0 ? rawTitle : domain,
      url: safeUrl,
      domain,
    });
  }

  const seenQueries = new Set<string>();
  const searchQueries: string[] = [];
  for (const q of metadata?.webSearchQueries ?? []) {
    const cleaned = q?.trim();
    if (cleaned && !seenQueries.has(cleaned.toLowerCase())) {
      seenQueries.add(cleaned.toLowerCase());
      searchQueries.push(cleaned);
    }
  }

  return { sources, searchQueries };
}

function normalizeImpactLevel(raw: unknown): TrendImpactLevel {
  if (typeof raw !== 'string') return 'MEDIUM';
  const upper = raw.trim().toUpperCase();
  if (upper === 'HIGH' || upper === 'MEDIUM' || upper === 'WATCH') {
    return upper;
  }
  return 'MEDIUM';
}

function parseJsonCandidate(rawText: string): Record<string, unknown> | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  // 1. Direct parse
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fall through to fence extraction
  }

  // 2. Markdown code fence extraction
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Fall through to balanced-brace extraction
    }
  }

  // 3. Balanced outermost object extraction
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const slice = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(slice);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseMarkdownTrendsFallback(
  rawText: string,
  topic: TrendTopicId
): { briefingSummary?: string; trends: GroundedTrendItem[] } {
  const trimmed = rawText.trim();
  if (!trimmed) return { trends: [] };

  const sections = trimmed
    .split(/\n(?=#{2,3}\s+|\d+\.\s+\*\*)/)
    .map((part) => part.trim())
    .filter(Boolean);

  const trends: GroundedTrendItem[] = [];
  let introSummary: string | undefined;

  for (const section of sections) {
    const headingMatch = section.match(/^(?:#{2,3}\s+|(?:\d+\.\s+))(.+?)(?:\n+([\s\S]+))?$/);
    if (!headingMatch) {
      if (!introSummary) {
        const cleaned = stripMarkdownFormatting(section);
        if (cleaned.length > 24) introSummary = cleaned.slice(0, 360);
      }
      continue;
    }

    const title = stripMarkdownFormatting(headingMatch[1]).slice(0, 120);
    const bodyRaw = (headingMatch[2] || '').trim();
    if (!title || !bodyRaw) continue;

    const lines = bodyRaw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const takeawayLine = lines.find((l) =>
      /takeaway|action|engineering|recommendation/i.test(l)
    );
    const summaryLines = lines.filter((l) => l !== takeawayLine);
    const summary = stripMarkdownFormatting(summaryLines.join(' ')).slice(0, 420);
    if (!summary) continue;

    trends.push({
      title,
      category: TREND_TOPICS[topic].label,
      publishedWindow: 'Live Web Brief',
      summary,
      engineeringTakeaway: takeawayLine
        ? stripMarkdownFormatting(
            takeawayLine.replace(/^[-*]\s*/, '').replace(/^[^:]+:\s*/, '')
          )
        : 'Review cited primary specifications and validate webhook/settlement behavior before rollout.',
      impactLevel: 'MEDIUM',
    });
  }

  return {
    briefingSummary: introSummary,
    trends: trends.slice(0, 5),
  };
}

export function parseGroundedTrendsResponse(params: {
  rawText: string | undefined;
  groundingMetadata?: RawGroundingMetadata | null;
  topic: TrendTopicId;
  customQuery?: string;
  model: string;
  generatedAt?: string;
}): GroundedTrendsPayload {
  const { sources, searchQueries } = extractGroundingSources(params.groundingMetadata);
  const raw = (params.rawText ?? '').trim();
  const parsedObj = parseJsonCandidate(raw);

  const trends: GroundedTrendItem[] = [];

  if (parsedObj && Array.isArray(parsedObj.trends)) {
    for (const item of parsedObj.trends) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      const title = typeof rec.title === 'string' ? rec.title.trim() : '';
      const summary = typeof rec.summary === 'string' ? rec.summary.trim() : '';
      if (!title || !summary) continue;

      trends.push({
        title,
        category:
          typeof rec.category === 'string' && rec.category.trim()
            ? rec.category.trim()
            : TREND_TOPICS[params.topic].label,
        publishedWindow:
          typeof rec.publishedWindow === 'string' && rec.publishedWindow.trim()
            ? rec.publishedWindow.trim()
            : 'Current Web Brief',
        summary,
        engineeringTakeaway:
          typeof rec.engineeringTakeaway === 'string' && rec.engineeringTakeaway.trim()
            ? rec.engineeringTakeaway.trim()
            : 'Verify upstream contract behavior and idempotency guarantees against cited documentation.',
        impactLevel: normalizeImpactLevel(rec.impactLevel),
      });
    }
  }

  let markdownFallbackSummary: string | undefined;
  if (trends.length === 0 && raw) {
    const mdParsed = parseMarkdownTrendsFallback(raw, params.topic);
    if (mdParsed.trends.length > 0) {
      trends.push(...mdParsed.trends);
      markdownFallbackSummary = mdParsed.briefingSummary;
    }
  }

  const briefingSummary =
    parsedObj && typeof parsedObj.briefingSummary === 'string' && parsedObj.briefingSummary.trim()
      ? parsedObj.briefingSummary.trim()
      : markdownFallbackSummary
      ? markdownFallbackSummary
      : trends.length > 0
      ? `Search-grounded synthesis across ${trends.length} developments in ${TREND_TOPICS[params.topic].label}.`
      : stripMarkdownFormatting(raw) || 'Search grounding completed without structured trend items.';

  if (trends.length === 0 && raw) {
    trends.push({
      title: `${TREND_TOPICS[params.topic].label} — Search Synthesis`,
      category: TREND_TOPICS[params.topic].label,
      publishedWindow: 'Live Web Synthesis',
      summary: stripMarkdownFormatting(raw).slice(0, 600),
      engineeringTakeaway:
        'Review the cited primary sources below for full protocol and regulatory specifications.',
      impactLevel: 'WATCH',
    });
  }

  return {
    topic: params.topic,
    customQuery: sanitizeCustomQuery(params.customQuery) || undefined,
    generatedAt: params.generatedAt ?? new Date().toISOString(),
    model: params.model,
    briefingSummary,
    trends,
    sources,
    searchQueries,
  };
}
