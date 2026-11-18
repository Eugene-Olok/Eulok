# EULOK — Independent Software Engineering Studio

**Software engineering practice, technical demonstrations, and operational tooling for Uganda and East Africa.**

EULOK designs, builds, stabilizes, and integrates business-critical software systems — combining a pre-rendered static multi-page web platform in Astro 5 + React 19 with interactive engineering sandboxes, deterministic financial reconciliation tools, and an East Africa technical architecture scoping workbench.

> Models propose. Deterministic systems decide.

## Stack & Hosting Model

- **Astro 5 (`output: 'static'`) + React 19 + TypeScript**: Compiles directly to pure static HTML/CSS/assets under `dist/` for GitHub -> Cloudflare Pages Git deployment.
- **Cloudflare Pages Functions (`functions/api/intake.ts`)**: Handles `POST /api/intake` serverless brief validation and optional webhook forwarding in production.
- **Recharts**: Interactive throughput, error-rate, and 30-day historical settlement success visualizations (`/services/finance-integrations`).
- **Vitest + React Testing Library + Node.js Test Runner**: `node:test --experimental-strip-types` for deterministic core engines + Vitest/RTL for UI behavior.

## Routes & Core Features

1. **Public Engineering & Service Architecture**
   - Unified alternating full-bleed band layout across all routes:
     - `/` — Engineering position, six disciplines, six-stage delivery spine, technical proof bento, and honest empty-state policy
     - `/services`, `/services/finance-integrations`, `/services/reconciliation`, `/services/performance-builds`
     - `/rescue`, `/work`, `/case-studies`, `/insights`, `/verification`, `/about`, `/standards`, `/security`, `/privacy`, `/accessibility`, `/contact`
   - Shared **Global Command Menu (`Cmd+K` / `Ctrl+K`)** (`src/components/CommandPalette.tsx`) indexing every page, simulator, Engineering Note anchor, chart, and quick action.

2. **Finance Integrations Sandbox & 30-Day Telemetry (`/services/finance-integrations`)**
   - **Webhook Signature & Idempotency Replay Simulator** (`src/engine/webhookSandbox.ts`): Interactive fail-closed HMAC-SHA256 verification and duplicate retry prevention sandbox.
   - **API Throughput, Error Rates & 30-Day Historical SLA Dashboard** (`src/components/FinancePerformanceDashboard.tsx`, `src/engine/integrationTelemetry.ts`): Recharts visualizations tracking settlement success against the `99.5%` SLA reference threshold, synced live to sandbox actions.

3. **Architecture & Scoping Workbench (`/scope-calculator`)**
   - **Deterministic Architecture & Feasibility Engine** (`src/engine/scopeCalculator.ts`): Models Uganda Domestic and East Africa Cross-Border (EAC) deployments, derives timelines directly from summed 6-stage milestone durations with 100% effort allocation, computes logarithmic technical risk (`1–10`), generates explicit **Failure-Mode Mitigations**, maps a 4-layer **Target Architecture Topology**, defines **Mandatory Verification Gates**, and exports Markdown technical specifications and shareable URLs. Commercial pricing is intentionally excluded and agreed directly during client consultation.

4. **Interactive Ops Suite & Rescue Triage (`/ops-suite`, `/rescue`)**
   - **Deterministic Reconciliation Engine** (`src/engine/reconciliationCore.ts`): Fixed-point integer rules R1–R8 for MTN MoMo, Airtel Money, and bank exports with refund/reversal partitioning and live invariant checks.
   - **Software Rescue Readiness Scorecard** (`src/engine/rescueDiagnostic.ts`): 8-point triage rubric producing prioritized P0/P1/P2 stabilization plans.

5. **Engineering Notes & Architecture Archive (`/insights`)**
   - Deterministic searchable & filterable archive of six expandable technical briefs covering integer arithmetic, mobile-money idempotency, fail-closed human approval boundaries, rescue triage, release readiness, and 3G low-bandwidth engineering across Kampala and East Africa.

## Development & Verification

```bash
npm install        # install dependencies
npm run dev        # run Astro dev server on http://localhost:3000
npm run lint       # TypeScript type check (tsc --noEmit)
npm test           # run node:test deterministic engine suites + Vitest RTL component tests
npm run build      # static production build -> dist/
npm run preview    # preview built static dist/ locally on port 3000
```

## Configuration

Copy `.env.example` and configure optional environment variables in your Cloudflare Pages dashboard:
- `PUBLIC_SITE_URL` — Canonical site origin override
- `ZOHO_WEBHOOK_URL` — Optional server-side intake forwarding webhook read by `functions/api/intake.ts`
