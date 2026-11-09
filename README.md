# Eulok

**Software engineering studio site and internal operations tooling.**

Eulok is a business website plus an interactive operations suite, built as a
single Astro + React application. It covers the public-facing services site
(home, services, case studies, contact) and an embedded demo of the
deterministic reconciliation/workflow engine the studio builds for clients.

> Models propose. Deterministic systems decide.

## Stack

- **Astro 5** (static output, React islands via `@astrojs/react`)
- **React 19 + TypeScript**
- **Bun** as the package manager and task runner (see `bun.lock` — don't mix
  in `npm install`, it will produce a second, conflicting lockfile)
- **Vitest** + Node's built-in test runner for unit tests
- Deployed as a Cloudflare Pages site with a Pages Function
  (`functions/api/intake.ts`) for the contact/intake form — see
  `docs/runbooks/site-deploy.md`

## Features

1. **Public site**
   - Home, Services (6 offerings: business websites, custom software,
     payments & integrations, reconciliation, workflow automation, software
     rescue), detailed service pages, How We Work, Work/Case Studies, About,
     Standards, Security, Privacy, Accessibility, Contact.
   - Contact form posts to `/api/intake`, a Cloudflare Pages Function that
     validates the payload (`src/engine/intakeValidation.ts`), generates a
     reference ID, and optionally forwards to a configured webhook
     (`ZOHO_WEBHOOK_URL` env var) — no webhook configured means the form
     still validates and confirms, it just doesn't forward anywhere yet.

2. **Interactive Ops Suite** (`/ops-suite`)
   - **Reconciliation engine** (`src/engine/reconciliationCore.ts`): a
     deterministic, zero-LLM rules engine (R1–R8) over synthetic
     mobile-money/SACCO/school-fee fixtures — exact matches, partial
     allocations, duplicates, refunds/reversals, conflicting exceptions.
   - **Client lifecycle state machine** (`src/engine/workflowEngine.ts`):
     the 11-state `PROSPECT → … → CLOSED` pipeline with fail-closed
     transition checks.
   - **Scope calculator** (`src/engine/scopeCalculator.ts`): deterministic
     project-scope/risk estimation from input parameters.

## Development

```bash
bun install        # install dependencies
bun run dev         # dev server on :3000
bun run build       # production build → dist/
bun run preview     # preview the production build on :3000
bun run lint         # tsc --noEmit
bun run test         # node:test suites + vitest component tests
```

## Styling

Design tokens live in `docs/design/DESIGN_TOKENS.yaml`: monochromatic,
high-contrast typography, automatic dark/light via `color-scheme`, visible
focus states, and a skip link for keyboard navigation.

## Deployment

Production deploys via Cloudflare Pages' own Git integration on push to
`main` — there is no custom deploy script. Build command, output directory,
and the Pages Function's environment variables are Cloudflare *project*
settings, not repository files; see `docs/runbooks/site-deploy.md` for the
exact values and `docs/runbooks/cloudflare-recovery.md` for rollback.
