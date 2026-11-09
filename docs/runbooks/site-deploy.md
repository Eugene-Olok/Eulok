# Site Deployment and Analytics Runbook

Status: active · Owner: founder · Last updated: 2026-10-20

## Why this exists

`business/site/config.js` is committed inert on purpose:

```js
window.__POSTHOG_CONFIG__ = {};
```

A keyed config is generated only at build time. There are two deployment
paths, and they must not implement analytics differently:

| Path | Trigger | Builder profile |
| --- | --- | --- |
| Cloudflare Pages Git integration | every push to `main` | `auto` (production branch → production) |
| `scripts/deploy-site.sh` (Direct Upload) | explicit founder deploy | `production`; `--build-only` uses `stage` |

Both paths call **one** canonical builder: `tools/build_site.py`.

## Required Cloudflare Pages settings

These are project settings, not repository files. They must be applied in the
Cloudflare dashboard (or API) by the founder. The repository cannot set them,
and agents must not mutate production settings.

| Setting | Required value |
| --- | --- |
| Production branch | `main` |
| Root directory | repository root (empty) |
| Build command | `python3 tools/build_site.py --profile auto --out business/site --allow-in-place` |
| Build output / destination directory | `business/site` |
| Production variable `POSTHOG_KEY` | PostHog project key, type **Secret** |
| Production variable `POSTHOG_HOST` | the project's API host from the credential store (https only) |
| Preview variables | **none** — previews must never receive production analytics |

Do not add `POSTHOG_*` to the Preview environment. The builder ignores them
for preview branches anyway, but keeping the scope empty is the second
barrier.

### Observed state (2026-10-20) — PASS

Earlier in this release the project ran `exit 0`, so a production build
published the committed inert `config.js`. That defect was corrected before
this closure. Read-only inspection
(`tools/check_pages_build_contract.py`) now returns
`PAGES_BUILD_CONTRACT=PASS`:

- build command: `python3 tools/build_site.py --profile auto --out business/site --allow-in-place`
- destination directory: `business/site`
- production `POSTHOG_KEY`: `secret_text`
- production `POSTHOG_HOST`: `plain_text`
- preview env vars: none
- production branch: `main`
- domain: `company-os-3ox.pages.dev`

No Cloudflare project setting was changed while producing this closure
evidence. The evidence-only merge path was also verified: Pages records a
production commit containing `[CF-Pages-Skip]` as `is_skipped: true` rather
than deploying it. Use that marker only for evidence/documentation merges and
verify the resulting deployment state.

## Build profiles

`tools/build_site.py`:

| Profile | Analytics | Missing credentials |
| --- | --- | --- |
| `production` | injects key + host | exit 3 (fails closed) |
| `preview` | always inert | n/a (production vars ignored) |
| `stage` | always inert | n/a |
| `auto` | `CF_PAGES_BRANCH == main` → production, any other branch → preview | exit 3 when `CF_PAGES_BRANCH` is absent |

A partial pair (`POSTHOG_KEY` without `POSTHOG_HOST`, or the reverse) is
refused in every profile. Invalid keys and non-`https` hosts are refused. The
key is never printed and never written outside the build output.

## Verification

Read-only contract check (requires broker-injected credentials):

```bash
tools/secrets/cred_wrapper.sh cloudflare -- python3 tools/check_pages_build_contract.py
```

It prints one line per setting and `PAGES_BUILD_CONTRACT=PASS|FAIL`, plus
exit 3 when the API or credentials are unavailable. It never mutates
Cloudflare and never prints credential values.

After a deployment, verify the live shape without printing the key:

```bash
curl -fsS https://company-os-3ox.pages.dev/config.js \
  | python3 -c 'import sys,re; t=sys.stdin.read(); print("inert" if "= {};" in t else "armed" if re.search(r"\"key\"\s*:\s*\"phc_", t) else "malformed")'
```

An inert result on production means analytics is **not** working. A malformed
result is a build defect.

Confirm which commit production is serving:

```bash
npx --yes wrangler@4 pages deployment list --project-name company-os
```

The newest `Production` / `main` row must reference the commit you intended
to deploy. A newer row from an unintended push is the clobbering failure.

## Deploying deliberately

Direct Upload (credentials via the broker; see `docs/runbooks/secrets-isolation.md`):

```bash
tools/secrets/cred_wrapper.sh cloudflare posthog -- ./scripts/deploy-site.sh
```

The script writes `artifacts/deploy-site-evidence.json` with states
`build`, `attempted`, `verified`, or `unavailable`. Exit 0 is the only
success. A production build without analytics config now exits 3 instead of
shipping an inert site.

## Failure modes

| Symptom | Cause | Action |
| --- | --- | --- |
| Production `config.js` is inert after a push | Pages build command is `exit 0` or env vars absent | apply the settings above; re-run the verification |
| Page build fails with `BLOCKED: production analytics config is missing` | production variables not scoped to Production | add them to the Production environment only |
| Preview has analytics | `POSTHOG_*` leaked into Preview | remove them; the builder also forces inert previews |
| `PAGES_BUILD_CONTRACT=FAIL` on `build command` | dashboard value drifted from this runbook | restore the exact command |
| Pages build fails with `python3: command not found` | build image does not expose Python 3 | pin a build image with Python 3 (or set `PYTHON_VERSION`) and re-run |
| Direct Upload succeeds but Git push reverts analytics | both paths active with different settings | keep the Pages build command canonical, or disconnect the Git integration from production |

## Rollback

Re-run Direct Upload from a known-good commit:

```bash
git rev-parse HEAD
tools/secrets/cred_wrapper.sh cloudflare posthog -- ./scripts/deploy-site.sh
```

The staged tree is a temp directory; the working tree and Git history never
contain a key. If the Pages Git integration is producing unintended
production deployments, the founder may disconnect it from production or
keep it but with the canonical build command — that decision is external and
must be recorded in the deployment evidence.
