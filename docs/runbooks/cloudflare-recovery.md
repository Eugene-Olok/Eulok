# Cloudflare Pages Deployment Recovery Runbook

Status: active · Last updated: 2026-11-09

This replaces the prior version of this runbook, which was written for the
retired `business/site` static deploy (`scripts/deploy-site.sh`,
`phase8.yml`). That script and workflow no longer exist; see
`docs/runbooks/site-deploy.md` for what's actually deployed now (the Astro
app + `functions/api/intake.ts`, built and deployed by Cloudflare Pages'
own Git integration — no custom deploy script in this repo).

## Prerequisites

- A Cloudflare API Token with Pages permissions (for `wrangler`), or just
  dashboard access
- `wrangler` CLI (`npx wrangler@4`, no separate install needed)
- `curl` for verification

## Incident Detection

A deployment problem shows up as one of:
1. `.github/workflows/ci.yml` failing on `main` (type-check, test, or build
   breakage — this blocks confidence in a commit, though it doesn't block
   Cloudflare from deploying it; Cloudflare Pages' Git integration deploys
   independently of GitHub Actions status)
2. The live site at `https://company-os-3ox.pages.dev/` serving stale or
   wrong content
3. `POST /api/intake` returning 500 instead of a validation response

## Recovery Procedure

### Step 1: Find the last known-good deployment

```bash
npx --yes wrangler@4 pages deployment list --project-name company-os
```

Identify the most recent deployment whose commit hash you know was good
(e.g. the commit before the one that broke things).

### Step 2: Roll back

```bash
npx --yes wrangler@4 pages deployment rollback <deployment-id> --project-name company-os
```

This re-promotes a previous build to production immediately — it does not
rebuild, so it's fast and doesn't depend on the repo being in any
particular state.

### Step 3 (alternative): Revert the commit instead

If the rollback target is far enough back that you'd rather fix forward:

```bash
git revert <bad-commit-sha>
git push origin main
```

The Cloudflare Pages Git integration builds and deploys the new HEAD
automatically — no manual deploy command needed.

### Step 4: Verify

```bash
curl -fsS https://company-os-3ox.pages.dev/ -o /tmp/live.html
grep -o '<title>[^<]*' /tmp/live.html

curl -fsS -o /dev/null -w '%{http_code}\n' -X POST \
  https://company-os-3ox.pages.dev/api/intake \
  -H 'Content-Type: application/json' -d '{}'
# expect 422 (validation error on an empty payload) — confirms the
# Function is deployed and responding, not just the static shell
```

## Escalation

1. Check the Cloudflare Pages dashboard's deployment log for the specific
   build/runtime error.
2. Confirm the build command and output directory still match
   `docs/runbooks/site-deploy.md` — dashboard settings can drift
   independently of the repo and nothing here can detect that drift
   automatically.
3. For a Function-specific failure, `npx wrangler@4 pages deployment tail`
   against the live deployment to see request-time logs.
4. Contact Cloudflare support only after 1–3 are exhausted.

## Related Documentation

- `docs/runbooks/site-deploy.md` — current build/deploy settings and
  required Function environment variables
- `.github/workflows/ci.yml` — pre-merge checks (no deploy step)
- `functions/api/intake.ts` — the only server-side code in this deployment
