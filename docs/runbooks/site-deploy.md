# Site Deployment Runbook

Status: active · Owner: founder · Last updated: 2026-11-09

## What's deployed

The production site is the Astro app at the repository root (`src/`), built
to static output in `dist/`, plus one Cloudflare Pages Function
(`functions/api/intake.ts`) that Cloudflare bundles and serves automatically
because `functions/` sits at the repo root — no separate deploy step is
needed for it.

There is no custom build or deploy script. Cloudflare Pages' own Git
integration builds and deploys on every push to `main`; CI
(`.github/workflows/ci.yml`) only type-checks, tests, and builds to catch
breakage before it merges — it does not deploy anything.

**Superseded:** an earlier static-HTML site lived at `business/site/` and
deployed via `tools/build_site.py` + `scripts/deploy-site.sh`. Neither the
`tools/` directory nor the `scripts/` directory exist in this repository —
that pipeline was documented but never actually committed, and `business/site/`
has been removed. Historical docs under `docs/design/` and `finance/` that
reference `scripts/deploy-site.sh` or `business/site` are audit history for
that prior iteration, not current instructions.

## Required Cloudflare Pages settings

These are Cloudflare *project* settings, not repository files — they must
be set in the Cloudflare Pages dashboard (or via the API) and cannot be
pushed from here. **This is the one piece of this migration that needs a
human with dashboard access** — nothing in this repo can change it.

| Setting | Value |
| --- | --- |
| Framework preset | Astro (or leave as "None" and use the explicit commands below — both work) |
| Build command | `bun install && bun run build` |
| Build output / destination directory | `dist` |
| Root directory | repository root (empty) |
| Production branch | `main` |
| Node/Bun version | Bun — if the Pages build image doesn't auto-detect `bun.lock`, pin a Bun-enabled image or set the build command to `npm install && npm run build` instead (the scripts are package-manager-agnostic; only the lockfile differs) |
| Preview deployments | fine to leave on — the app has no server secrets to protect in preview |

### Pages Function environment variables

`functions/api/intake.ts` reads these at request time (not build time):

| Variable | Required | Effect if absent |
| --- | --- | --- |
| `ZOHO_WEBHOOK_URL` | no | Form still validates, generates a reference ID, and returns success — it just doesn't forward the inquiry anywhere. Set this once a CRM webhook exists. |
| `NOTIFY_EMAIL` | no | Currently unused by the handler; reserved for a future email-notification path. Safe to leave unset. |

Set these as **Production** (and Preview, if you want preview deploys to
forward too — there's no secret-leak risk here the way there was with the
old PostHog key, since this isn't a client-side value) environment variables
in the Pages project settings.

There is no analytics key to manage. The previous PostHog-via-`config.js`
injection scheme belonged to the retired static site and has no equivalent
here; if you want analytics on the new site, that's a separate, explicit
decision (e.g. a `<script>` tag in `src/layouts/Layout.astro` plus a real
Pages env var), not something this migration silently carries over.

## Verification after a deploy

```bash
curl -fsS https://company-os-3ox.pages.dev/ | grep -o '<title>[^<]*'
# expect the Eulok title, not "Company OS"

curl -fsS -X POST https://company-os-3ox.pages.dev/api/intake \
  -H 'Content-Type: application/json' \
  -d '{}'
# expect HTTP 422 with a validation-errors body — confirms the Function is live
```

Confirm which commit production is serving:

```bash
npx --yes wrangler@4 pages deployment list --project-name company-os
```

(The project name in Cloudflare may still say `company-os` even after the
site's content is rebranded to Eulok — renaming the Cloudflare *project*
itself is optional and separate from this migration; it does not affect the
`pages.dev` subdomain unless you choose to change that too.)

## Failure modes

| Symptom | Cause | Action |
| --- | --- | --- |
| Build fails with "command not found: bun" | Pages build image doesn't have Bun | Switch the build command to `npm install && npm run build` |
| `/api/intake` returns 500 | Function threw — check Cloudflare Pages Function logs (`wrangler pages deployment tail`) | `functions/api/intake.ts` already catches and reports errors as JSON; a 500 means something inside it threw synchronously before the try/catch, or a platform-level error |
| Intake form "succeeds" but nothing arrives in the CRM | `ZOHO_WEBHOOK_URL` not set, or webhook itself failing | The handler intentionally swallows webhook-forward failures so the client still gets a success response — check the env var is set, then check the webhook endpoint directly |
| Production still shows the old "Company OS" site | Cloudflare project's build command/output directory not yet updated to the values above | Apply the settings table above in the dashboard, then retrigger a deploy |

## Rollback

No custom script — use Cloudflare's own deployment history:

```bash
npx --yes wrangler@4 pages deployment list --project-name company-os
npx --yes wrangler@4 pages deployment rollback <deployment-id> --project-name company-os
```

Or simply `git revert` the offending commit and push to `main`; the Git
integration redeploys from the new HEAD automatically.
