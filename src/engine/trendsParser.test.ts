import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTrendsSearchPrompt,
  extractGroundingSources,
  normalizeTrendTopic,
  parseGroundedTrendsResponse,
  sanitizeCustomQuery,
  sanitizeHttpUrl,
} from './trendsParser.ts';

test('normalizeTrendTopic defaults unknown topics to all', () => {
  assert.equal(normalizeTrendTopic('east-africa-rails'), 'east-africa-rails');
  assert.equal(normalizeTrendTopic('  EFRIS-COMPLIANCE  '), 'efris-compliance');
  assert.equal(normalizeTrendTopic('unknown-topic'), 'all');
  assert.equal(normalizeTrendTopic(undefined), 'all');
});

test('sanitizeCustomQuery strips control chars and bounds length', () => {
  const dirty = '  ISO\x00 20022 \n settlement   finality ';
  assert.equal(sanitizeCustomQuery(dirty), 'ISO 20022 settlement finality');
  assert.equal(sanitizeCustomQuery('a'.repeat(200)).length, 140);
});

test('sanitizeHttpUrl rejects unsafe protocols and accepts valid web links', () => {
  assert.equal(sanitizeHttpUrl('https://www.ura.go.ug/efris'), 'https://www.ura.go.ug/efris');
  assert.equal(sanitizeHttpUrl('http://example.org/docs'), 'http://example.org/docs');
  assert.equal(sanitizeHttpUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeHttpUrl('data:text/html,hi'), null);
  assert.equal(sanitizeHttpUrl('not a url'), null);
});

test('extractGroundingSources deduplicates citations and filters unsafe URIs', () => {
  const { sources, searchQueries } = extractGroundingSources({
    groundingChunks: [
      { web: { uri: 'https://www.bou.or.ug/payment-systems', title: 'Bank of Uganda NPS' } },
      { web: { uri: 'https://www.bou.or.ug/payment-systems', title: 'Duplicate entry' } },
      { web: { uri: 'javascript:alert(1)', title: 'Bad Link' } },
      { web: { uri: 'https://developer.mtn.com/momo-api', title: '' } },
    ],
    webSearchQueries: ['Uganda mobile money API 2026', 'uganda mobile money api 2026', 'URA EFRIS updates'],
  });

  assert.equal(sources.length, 2);
  assert.equal(sources[0].domain, 'bou.or.ug');
  assert.equal(sources[0].title, 'Bank of Uganda NPS');
  assert.equal(sources[1].domain, 'developer.mtn.com');
  assert.equal(sources[1].title, 'developer.mtn.com');
  assert.deepEqual(searchQueries, ['Uganda mobile money API 2026', 'URA EFRIS updates']);
});

test('parseGroundedTrendsResponse parses fenced JSON with grounding citations cleanly', () => {
  const rawResponse = [
    'Here is the latest summary:',
    '```json',
    JSON.stringify({
      briefingSummary: 'Regional payment rails are converging on instant settlement guarantees.',
      trends: [
        {
          title: 'ISO 20022 Settlement Adoption Accelerates',
          category: 'Payment Rails',
          publishedWindow: 'Nov 2026',
          summary: 'Cross-border clearing systems now enforce structured remittance payloads.',
          engineeringTakeaway: 'Validate ISO 20022 pacs.008 schemas at ingestion gates.',
          impactLevel: 'HIGH',
        },
        {
          title: 'Strict Idempotency Enforcement in Webhook Gateways',
          category: 'Reliability',
          publishedWindow: 'Q4 2026',
          summary: 'Aggregators require deterministic 200 OK acknowledgements on retry bursts.',
          engineeringTakeaway: 'Persist atomic composite event keys before ledger allocation.',
          impactLevel: 'unknown-level',
        },
      ],
    }),
    '```',
  ].join('\n');

  const parsed = parseGroundedTrendsResponse({
    rawText: rawResponse,
    groundingMetadata: {
      groundingChunks: [
        { web: { uri: 'https://www.swift.com/iso-20022', title: 'Swift ISO 20022 Migration' } },
      ],
      webSearchQueries: ['ISO 20022 financial operations 2026'],
    },
    topic: 'iso20022-open-banking',
    customQuery: 'ISO 20022',
    model: 'gemini-4-hydrogen',
    generatedAt: '2026-11-17T02:00:00.000Z',
  });

  assert.equal(parsed.topic, 'iso20022-open-banking');
  assert.equal(parsed.trends.length, 2);
  assert.equal(parsed.trends[0].impactLevel, 'HIGH');
  assert.equal(parsed.trends[1].impactLevel, 'MEDIUM');
  assert.equal(parsed.sources.length, 1);
  assert.equal(parsed.sources[0].url, 'https://www.swift.com/iso-20022');
});

test('buildTrendsSearchPrompt incorporates custom query when provided', () => {
  const prompt = buildTrendsSearchPrompt('efris-compliance', 'batch invoice signature');
  assert.match(prompt.userPrompt, /batch invoice signature/);
  assert.match(prompt.systemInstruction, /Google Search grounding/);
});
