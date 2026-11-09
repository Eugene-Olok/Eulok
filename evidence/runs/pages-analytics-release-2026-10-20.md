# Pages analytics release — 2026-10-20

## Verdict

Production is now built by the canonical analytics builder. The live
`config.js` is armed, session recording is disabled, the Cloudflare Pages
build contract passes, and a second production push rebuilt the site without
changing the keyed config.

| Area | Status | Evidence |
| --- | --- | --- |
| Model reliability (implement chain and reasoning budgets) | PASS | `evidence/runs/control-plane-defects-2026-10-20.md` |
| Pages build contract | PASS | `tools/check_pages_build_contract.py` |
| Production Pages build | PASS | deployment `c632f071-08fa-4ad5-83eb-e5fee0e23fe8` |
| Live analytics client configuration | PASS | live `config.js` is armed; key value not printed |
| No secret in build logs or browser assets | PASS | log scan and live asset checks |
| Second push preserves analytics | PASS | deployment `25c4e60c-a953-4591-80c7-bb344a194331`; key unchanged |
| PostHog event ingestion | UNVERIFIED | no authenticated PostHog query credential; no test event fabricated |

## Released commit

- PR: `#11` — `fix(release): make Pages builds preserve analytics config`
- Squash merge commit: `69d7bff2ad5e7759b053586d57810a46a7b24fca`
- Base: `origin/main` at `4998f6947242bd738594cb92c3221a286724349e`
- Release branch: `release/pages-analytics-2026-10-20` at
  `a3be7c147a5ba8266ed4b01aa223df0c028efdbd`
- The squash tree is identical to the release branch tree:
  `5f42558a4baab68260e335a33f16873ac5559404`.

## Before and after

The previous project configuration ran `exit 0`, so Cloudflare published the
committed inert `config.js` on every production build.

Before:

- build command: `exit 0`
- production environment variables: none
- live `config.js`: inert, 286 bytes
- latest production deployment: `0eb080ea-61e9-426f-8169-c080b804b4a7`
  at `4998f6947242`

After:

- build command:
  `python3 tools/build_site.py --profile auto --out business/site --allow-in-place`
- production `POSTHOG_KEY`: `secret_text`
- production `POSTHOG_HOST`: `plain_text`
- preview environment variables: none
- production branch, destination directory, root directory, compatibility
  settings, and Git integration preserved

The settings PATCH was limited to the build command and production PostHog
variables. The payload digest was `343a34dc334abfe2` (SHA-256 prefix over the
redacted request structure). It did not change `source`, `deployment_configs`
keys, preview variables, domains, or compatibility settings. The deployment
list was unchanged immediately after the PATCH, so updating project settings
did not trigger a deployment.

## Production build evidence

- Deployment: `c632f071-08fa-4ad5-83eb-e5fee0e23fe8`
- Environment: production, branch `main`
- Commit: `69d7bff2ad5e7759b053586d57810a46a7b24fca`
- Created: `2026-10-20T13:44:01Z`
- Final stage: `deploy:success`
- Build log:
  - executed `python3 tools/build_site.py --profile auto --out business/site --allow-in-place`
  - reported `analytics: armed for production`
  - uploaded one changed file (the keyed `config.js`); the other 19 assets
    were unchanged
- Build log scan: 214 lines, no `phc_` key material, no bearer token.

## Live verification

Checked from the canonical `https://company-os-3ox.pages.dev` endpoint with
cache-busting headers:

- `config.js`: HTTP 200, 225 bytes, `__POSTHOG_CONFIG__` parsed successfully
- key present with valid `phc_` shape and length 48 (value not printed)
- API host: `https://us.i.posthog.com` (HTTPS)
- `disable_session_recording`: `true`
- `phc_` absent from live `index.html` and `analytics.js`
- live home page contains the expected title, hero, analytics script, and
  honest case-studies section
- PostHog SDK `static/array.js`: HTTP 200
- no Content-Security-Policy header blocks the SDK
- `config.js` is served with `cache-control: public, max-age=0,
  must-revalidate`

Phase 8 with Cloudflare and PostHog credentials:

```text
status=PASS
failed=0 blocked=0 skipped=0
tests=1880 baseline=406
PASS pages build contract
PASS live site verification
PASS live analytics configuration
```

Full deterministic gates before release:

```text
status=PASS
failed_checks=0
1880 tests, 7 skipped, 0 failures
golden set 49/49
ruff, ruff format, mypy, semgrep, gitleaks: PASS
```

## Preview safety

The release branch preview `bb9b1bae-042a-4e7b-a0d2-da38c967295a` was built
before the settings change, so it only proves the old inert path. Preview
profile behavior with production credentials present was tested from the
release commit: `auto` on a non-`main` branch resolved to `preview` and wrote
`window.__POSTHOG_CONFIG__ = {};`.

The report branch then exercised the new builder on preview deployment
`6ba8a12b-4bee-42ec-ab29-367840987ed7`. Its build log ran the canonical
command and reported `analytics: inert (profile=preview)`. The served
`config.js` was 93 bytes with an empty object, and no key appeared in the
build log. Preview environment variables remain empty.

## Second push (reproducibility)

The report commit `230351c521c938ca70ab4f883f24b75f78fb9cfb` was squash-merged
as `752087ee35926b3582b4ee043ce9f66123c58faa`. That push produced production
deployment `25c4e60c-a953-4591-80c7-bb344a194331`:

- created `2026-10-20T14:03:39Z`, production, branch `main`
- final stage `deploy:success`
- build log: `analytics: armed for production`, no key material, no bearer
  token
- upload summary: `Uploaded 0 files (20 already uploaded)` — the rebuilt tree
  was byte-identical, so the keyed `config.js` was preserved
- live `config.js`: 225 bytes, armed, key hash identical to the first build,
  host `https://us.i.posthog.com`, session recording disabled
- live home page still contains the expected content; no key in HTML
- Phase 8 with credentials: `status=PASS`, 0 failed, 0 blocked

This is the second-push proof. A push that adds documentation rebuilt the
site and did not clobber analytics.

## Rollback

- A failed production build leaves the previous deployment live; Cloudflare
  does not replace a successful deployment with a failed one.
- If the build fails or serves inert config, the immediate fallback is a
  controlled Direct Upload from the released tree with the production profile,
  using the credential broker. Do not use the old `exit 0` command as a
  fallback: it is the defect being fixed.
- To restore the prior inert site, deploy the prior commit's static tree
  (`4998f6947242`) to the same Pages project.
- If the PostHog key or any credential is exposed, rotate it before any
  further deployment.

## Residual risk

- Actual PostHog ingestion was not verified. The live client is configured to
  send events and the SDK is reachable, but no event was fabricated and no
  authenticated PostHog query credential is available in this environment. Do
  not describe this release as proof that events have been received.
