# EULOK — Independent Software Engineering Studio

**Software engineering practice, technical demonstrations, and operational tooling.**

EULOK builds, stabilizes, and integrates business-critical software systems — combining a pre-rendered multi-page web platform in Astro 5 + React 19 with interactive engineering sandboxes, deterministic financial reconciliation tools, and regional scoping calculators.

> Models propose. Deterministic systems decide.

## Stack

- **Astro 5** (`@astrojs/node` hybrid server/static output, React islands via `@astrojs/react`)
- **React 19 + TypeScript**
- **Recharts** for throughput, error-rate, and 30-day historical settlement success visualizations
- **Google GenAI (`@google/genai`)** with Google Search Grounding for live Financial Operations briefs (`/api/insights/trends`)
- **Vitest + React Testing Library + Node.js Test Runner** (`node:test --experimental-strip-types`)

## Routes & Core Features

1. **Public Engineering & Service Architecture**
   - Unified **Pattern A** alternating full-bleed band layout (`theme-dark` / `theme-navy` in Dark Mode; `#f8fafc` / `#f1f5f9` with elevated white cards in Light Mode) across all pages:
     - `/` — Engineering position, six disciplines, six-stage delivery spine, technical proof bento, and honest empty-state policy
     - `/services`, `/services/finance-integrations`, `/services/reconciliation`, `/services/performance-builds`
     - `/work` (How We Work), `/case-studies`, `/about`, `/standards`, `/verification`, `/status`, `/security`, `/privacy`, `/accessibility`, `/contact`
   - Shared **Global Command Menu (`Cmd+K` / `Ctrl+K`)** (`src/components/CommandPalette.tsx`) indexing every page, simulator, Engineering Note anchor, chart, and quick action.

2. **Finance Integrations Sandbox & 30-Day Telemetry (`/services/finance-integrations`)**
   - **Webhook Signature & Idempotency Replay Simulator** (`src/engine/webhookSandbox.ts`): Interactive fail-closed HMAC-SHA256 verification and duplicate retry prevention sandbox.
   - **API Throughput, Error Rates & 30-Day Historical SLA Dashboard** (`src/components/FinancePerformanceDashboard.tsx`, `src/engine/integrationTelemetry.ts`): Recharts `<ComposedChart>` (1H/24H/7D throughput + error curves) and `<LineChart>` tracking rolling 30-day settlement success rates against the `99.5%` SLA reference threshold, synced live to sandbox actions.

3. **Scoping Studio & Regional Estimator (`/scope-calculator`)**
   - **Deterministic Scope Engine** (`src/engine/scopeCalculator.ts`): Derives headline timelines directly from summed 6-stage milestone durations, evaluates risk on a bounded logarithmic scale across carrier rails and compliance controls, computes region-adjusted pricing (`Uganda`, `Kenya / EA`, `Remote US/EU/UK`) across `UGX`, `USD`, `KES`, `GBP`, and `EUR`, and exports Markdown SOW drafts and permalink URLs.

4. **Interactive Ops Suite & Rescue Triage (`/ops-suite`, `/rescue`)**
   - **Deterministic Reconciliation Engine** (`src/engine/reconciliationCore.ts`): Fixed-point integer rules R1–R8 for MTN MoMo, Airtel Money, and bank exports with refund/reversal partitioning and live invariant checks.
   - **Software Rescue Readiness Scorecard** (`src/engine/rescueDiagnostic.ts`): 8-point triage rubric producing prioritized P0/P1/P2 stabilization plans.

5. **Engineering Notes & Search-Grounded FinOps Brief (`/insights`)**
   - Six expandable architectural notes plus `LiveFinOpsTrendsSection` backed by `POST /api/insights/trends` (`src/pages/api/insights/trends.ts`). Requires `GEMINI_API_KEY` configured in the server runtime; fails explicitly with diagnostic guidance when no valid key is configured.

## Development & Verification

```bash
npm install        # install dependencies
npm run dev        # run Astro dev server on http://localhost:3000
npm run lint       # TypeScript type check (tsc --noEmit)
npm test           # run node:test deterministic engine suites + Vitest RTL component tests
npm run build      # production build → dist/
```

## Configuration

Copy `.env.example` and configure server-side environment variables in your host environment:
- `GEMINI_API_KEY` — Server-side Gemini API key for Google Search Grounding on `/api/insights/trends`
- `ZOHO_WEBHOOK_URL` — Optional intake forwarding webhook for `/api/intake`

