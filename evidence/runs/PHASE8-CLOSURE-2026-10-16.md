# Phase 8 Closure — Re-verification Record, 2026-10-16

Branch: `reconcile/phase9-integration`
HEAD for every run below: `5f33cd8681d237814cdebaeeb70512fd821212fb`
Baseline: 406 tests (Phase 7 proof, preserved)
Re-verification date: 2026-10-16 (this session; all gate runs re-executed on the
clean committed tree so evidence metadata equals the verified commit)

> Purpose of this record: re-verify, on today's mainline-superset tree, that the
> Phase 8 closure declared in `PHASE8-CLOSURE-2026-10-06.md` and merged to
> `main` (`e597933`, PR #8) still holds after the Phase 9 merge and this
> session's reconciliation. No claim below is inherited without re-execution.

---

## 1. Deterministic engineering gate (`scripts/gates.sh`, hermetic mode)

Result: **status=PASS, failed_checks=0**, exit 0
(`GATES_LANGFUSE_MODE=hermetic`; evidence: `artifacts/gate-evidence.json`,
recorded commit `5f33cd8`)

32 PASS, 1 explicit SKIP, 0 FAIL:

| Check | Result |
|---|---|
| git repository / git diff check | PASS |
| bash syntax / shellcheck | PASS |
| GitHub Actions syntax (actionlint) | PASS |
| gitleaks (113 commits, ~9.78 MB) — no leaks | PASS |
| trivy filesystem | PASS |
| semgrep | PASS |
| osv-scanner | PASS |
| model-compat YAML/JSON synchronized + artifact | PASS |
| python compile | PASS |
| unit tests — 1423 tests | PASS |
| bundle budget (TEST-007) | PASS |
| design manifest (290 unique items; CURRENT=30 REQUIRED=178 FUTURE=60 OUT_OF_SCOPE=22) | PASS |
| decision effects (18 approved decisions; 12 authorized deferrals/exclusions) | PASS |
| design tokens / design graph | PASS |
| design contract specs (2/2 specs, 21 anchors) | PASS |
| design gate sequence (GATE-2) | PASS |
| penpot map / component specs / compiler / token export / diagnostic (offline) | PASS |
| golden set | PASS |
| trajectory | PASS |
| promptfoo — 18/18 (promptfoo 0.123.1) | PASS |
| langfuse trace | **SKIP** — credentials absent; hermetic mode records an explicit SKIP, never a pass (`release_eligibility=BLOCKED`, the designed fail-closed consequence) |
| ruff | PASS |

## 2. Phase 8 gate (`scripts/gates-phase8.sh`, `PHASE8_ALLOW_BLOCKED=1`)

Result: **status=BLOCKED, failed=0, blocked=4, skipped=0**, exit 0
(evidence: `artifacts/gate-evidence-phase8.json`, recorded commit `5f33cd8`,
tests=1423 vs baseline 406, `preserved=true`)

16 PASS checks including: evidence contracts; CI configuration (structure +
actionlint); secret hygiene (gitleaks clean); website files/placeholders/
inert-analytics/deploy-target/build; bash syntax.

4 BLOCKED (external credentials absent on this host — fail-closed, honest):

- BLOCKED cloudflare credentials — `CLOUDFLARE_API_TOKEN` not set; site deploy cannot run
- BLOCKED posthog credentials — `POSTHOG_KEY` not set; site ships with inert analytics config
- BLOCKED live site verification — canonical project domain unresolvable
- BLOCKED live analytics configuration — canonical project domain unresolvable

This BLOCKED state with `failed=0` is the correct fail-closed posture and
matches the state recorded in the Phase 9 governance audit (2026-10-13).

## 3. Unit suite detail

`python -m unittest discover -s tests`: **1423 tests, 0 failures, 5 skips,
exit 0** (302 s wall). All 5 skips are permitted environment/condition skips
with explicit reasons — none is a weakened deterministic gate:

1. `test_browser_verify.LiveRenderedTests.test_missing_landmark_and_heading_fails` — `RUN_BROWSER_LANE` not set (live browser lane is opt-in)
2. `test_browser_verify.LiveRenderedTests.test_real_index_html_passes` — same
3. `test_browser_verify.LiveRenderedTests.test_retired_colour_literal_fails` — same
4. `test_mcp_regression.GBrainConfigTests.test_gbrain_serve_starts_cleanly` — live host `gbrain serve` (PID 19082) holds the single-writer PGLite datastore lock; exclusive-access connection probe cannot run here
5. `test_mcp_regression.MCPConnectionTests.test_gbrain_mcp_tools_discoverable` — same

## 4. Hardening applied this session (on top of the merged closure)

Both fixes concern the live-probe MCP tests, which CI excludes (`opencode`/
`gbrain` not installed there); they are environment-bound probes, not
deterministic security gates:

- Commit `5f33cd8` — `tests/test_mcp_regression.py`:
  - deterministic `/proc`-based detector + environment-blocked skip for the
    two exclusive-datastore probes (a live host gbrain serve holds the
    single-writer lock; the previous behavior was an unrelated local failure);
  - replaced the brittle exact-LLM-phrase assertion in
    `test_penpot_mcp_tools_discoverable` ("high-level overview") with stable
    Penpot tool-surface markers. The Penpot MCP had in fact worked — it listed
    its real tools (`execute_code`, `penpot_api_info`, library, tokens,
    `export_shape`) — but rephrased the overview. The test now asserts its
    stated contract (tools discoverable) instead of one magic phrase.
- Commit `04fa72a` — `datetime.UTC` modernization and external-service test
  skip hardening across verification harnesses (behavior-preserving on the
  pinned Python 3.12).

## 5. Security posture (unchanged, re-confirmed)

The Phase 8 secrets-isolation superset is intact on this tree and is a strict
superset of the Phase 9 branch content (proof: `evidence/runs/branch-audit-2026-10-16.md`
§2b): `tools/secrets/cred_broker.py`, `scripts/isolate-secrets.sh`,
`deploy/systemd/company-os-{credentials,credentials.socket,bifrost,nvidia-proxy,control-plane}.service`,
`tests/test_cred_broker.py`, `tests/test_isolate_secrets_script.py`,
`tests/test_secrets_isolation*.py`, `tests/test_systemd_units.py`,
dynamic category allowlist in `cred_wrapper.sh`, the
`COMPANY_OS_SECRETS_FILE` override path, endpoint validators, and the
documented removal of the `_BWRAP_MARKER` env-var sandbox bypass.

## 6. Verdict

- **Phase 8 engineering closure: HOLDS** on `5f33cd8` — 0 failed checks on both
  gates; the only non-PASS results are the designed fail-closed BLOCKED/SKIP
  rows for absent external credentials.
- **Release eligibility: BLOCKED** — external prerequisites (Cloudflare API
  token, PostHog key, live site/analytics verification, credentialed Langfuse
  trace) are absent on this host. Supplying those credentials is an operator
  action, not an engineering gap.
- No Phase 8 gate, baseline, or assertion was weakened to reach this result.
