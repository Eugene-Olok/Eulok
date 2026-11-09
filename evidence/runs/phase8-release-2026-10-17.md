# Phase 8 — broker-mediated production deploy + release verification

- Date: 2026-10-17
- Branch: `feat/phase9-reconciliation-product`
- HEAD at deploy: `cca2950a379537b6e01acd40f28b9d98829f0d65`
- Broker: `company-os-credentials.service`, `MainPID=264720`, started `2026-10-17 12:36:58 EAT` (running Fix #3)

## Objective

Deliver the broker-mediated production deployment path, deploy the site with the
PostHog key injected at deploy time, and independently verify the live result —
without exposing any secret value or weakening the secrets-isolation boundary.

## 1. Sandbox fix #3 (live)

Committed as `cca2950` (`feat(secrets): writable .wrangler tool-state overlay for
broker sandbox`). See `evidence/runs/broker-sandbox-fix-2026-10-17.md` and
`docs/runbooks/secrets-isolation.md` §3. Verified live through the real broker:

    tools/secrets/cred_wrapper.sh cloudflare -- npx --yes wrangler@4 pages project list --json
    -> real project data (company-os / company-os-3ox.pages.dev), rc=0, no EROFS

## 2. Production deploy (authorized)

    COMPANY_OS_CRED_RUN_TIMEOUT=900 \
      tools/secrets/cred_wrapper.sh cloudflare posthog -- ./scripts/deploy-site.sh

- Result: `DEPLOY_RC=0`, `state=verified exit=0`
- PostHog key injected into the **staged** `config.js` only (committed file stays inert)
- Deployment: `https://e9765663.company-os-3ox.pages.dev`
- Cloudflare project `company-os`, branch `main`, domain `company-os-3ox.pages.dev`
- Cloudflare health (via `pages project list --json`): deployment
  `e9765663-8ac3-4b6e-b149-43229eee15f2`, Production, branch `main`, source `cca2950`;
  prior production `78a360da-…` (source `e597933`)
- Log: `evidence/runs/deploy-site-20261017.log`

Note: the subsequent Phase 8 gate run invokes `deploy-site.sh --build-only`, whose
evidence write overwrote `artifacts/deploy-site-evidence.json` with `state=build`.
The verified deploy record is preserved in the log above; the gate records below
reference commit `cca2950`.

## 3. Post-deploy independent verification

Live `config.js` (production domain and the deployment URL) is **active**:

- 226 bytes; keys `[api_host, disable_session_recording, key]`
- `api_host = https://us.i.posthog.com`, `disable_session_recording = true`
- key present (`phc_…`, 48 chars) — **value never printed or recorded**

Committed `business/site/config.js` remains inert (`window.__POSTHOG_CONFIG__ = {};`).

PostHog live delivery (`tools/verify_posthog_delivery.py https://company-os-3ox.pages.dev/`):

- `verdict = PASS`, all `REQUIRED_CHECKS` true
- events `['$pageview']`, ingestion statuses `[200]`, `array.js` 200
- secrets exposure: none
- Evidence: `evidence/runs/posthog-live-verification-20261017T100223Z.json`

Secret non-exposure: repo scan for live credential patterns found only env-var refs
and test placeholders (no real values). The live `phc_` key is public-by-design.

## 4. Phase 8 gate (broker-mediated, post-deploy)

    COMPANY_OS_CRED_RUN_TIMEOUT=1800 \
      tools/secrets/cred_wrapper.sh cloudflare posthog -- ./scripts/gates-phase8.sh

- `status = PASS`, `deployment = PASS`, `failed = 0`, `blocked = 0`, `skipped = 0`
- tests `1600 >= baseline 406` (preserved)
- "live site verification" PASS; "live analytics configuration" PASS (values not printed)
- Evidence: `evidence/runs/phase8-gate-20261017T101356Z.json`

## 5. Main gates (hermetic, host)

    GATES_LANGFUSE_MODE=hermetic ./scripts/gates.sh

- `status = PASS`, `failed_checks = 0`; Langfuse sub-check = explicit SKIP
- Evidence: `artifacts/gate-evidence.json` (gitignored, regenerable)

## 6. Credentialed Langfuse trace (broker-mediated)

    COMPANY_OS_CRED_RUN_TIMEOUT=300 \
      tools/secrets/cred_wrapper.sh langfuse -- \
      .venv/bin/python tools/verify_langfuse_trace.py --emit-request --window-minutes 60

- `verdict = pass`, `observations_inspected = 1`, `found = True`
- host `https://us.cloud.langfuse.com`; key fingerprint `pk-l...c34d`
- boundary request emitted (`company_os.boundary.request`), span closed, flushed
- trace_id `aa116124d4bd82aef6a9db896c5bd186`
- Evidence: `evidence/runs/langfuse-evidence-20261017T103719Z.json`

## 7. Release eligibility — open item

Engineering prerequisites are met (broker-fixed sandbox, live deploy verified,
Stage 8 gate PASS, main gates PASS, credentialed Langfuse trace PASS). The
`release_eligibility` field emitted by `scripts/gates.sh` cannot be flipped to
PASS in this operator environment as-is, for a structural reason:

- `gates.sh` decides `creds_present` from exported `LANGFUSE_*` env vars **or** the
  local `credential_loader.py check` (which reads the secrets file).
- As `genie`, the secrets file is not readable -> `check` reports MISSING ->
  Langfuse SKIP -> `release_eligibility = BLOCKED`.
- The broker can read creds, but a broker-sandboxed `gates.sh` lacks the host
  security/lint tools (gitleaks/trivy/semgrep/osv/actionlint/promptfoo/ruff) and
  cannot reach the broker socket, so it cannot be the venue either.

Options to close:
1. Run `gates.sh` where its credential probe can read (root/operator with the
   credential); no code change.
2. Make the gate's credential probe consult the broker (`op: check`, already
   supported by the broker) or run the Langfuse check broker-mediated; requires a
   gate/probe change and a broker restart.

No secret value was printed, copied, committed, or transmitted at any point; the
isolation boundary (auth, lanes, allowlists, security checks) was not weakened.
