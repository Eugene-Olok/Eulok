# Control-plane and Pages deploy defects — 2026-10-20

Status: **A — PASS (code + live evidence). B — FAIL pending founder dashboard change.**

Starting commit: `0257bd9` (branch `fix/business-evidence-placeholder-guard`).
Worktree was dirty by design; nothing was committed, pushed, deployed, or restarted
during this work. The live analytics payload remains inert.

## Scope

Two production defects recorded in `evidence/runs/activation-report-2026-10-20.md`:

- **A. `implement` provider reliability.** The `nim/nemotron-3-super-120b` primary
  returned 404, and the remaining candidates were reasoning-first models that
  returned empty content at small `max_tokens`.
- **B. Pages Git integration clobbers analytics.** Every push to `main` rebuilt
  `business/site/config.js` with the committed inert value, replacing the keyed
  config written by Direct Upload.

Constraints honoured: no provider/credential configuration changes, no service
restart, no deploy, no push, no Cloudflare mutation. Cloudflare was read only.

## A. `implement` provider reliability

### Live root-cause probes (gateway `127.0.0.1:8080`, 2026-10-20)

| Provider / model | max_tokens | Result |
|---|---:|---|
| `nvidia/nvidia/nemotron-3-super-120b-a12b` | 180 | 404 |
| `groq/openai/gpt-oss-20b` | 180 | empty, reasoning 178 |
| `openrouter/cohere/north-mini-code:free` | 180 | empty, reasoning 201 |
| `cloudflare/@cf/openai/gpt-oss-120b` | 180 | sometimes partial, sometimes empty + `length` |
| `groq/qwen/qwen3.8-27b` | 180 | 104 tokens, 1.3 s, non-reasoning |
| `openrouter/poolside/laguna-s-2.1:free` | 180 / 1024 | usable; intermittent 429 |
| `openrouter/minimax/minimax-m3.1-flash:free` | 1024 | empty (reasoning ~1.7k) |
| `nvidia/nvidia/nemotron-3.5-lightning-30b-a3b` | 1024 | empty after 41 s on a coding prompt |
| most `nvidia/*` catalog entries | 180 / 1024 | 404 or 503 (`ResourceExhausted`) |

Conclusion: NVIDIA free routing is no longer dependable; reasoning-first
fallbacks cannot satisfy small output budgets because hidden reasoning consumes
the budget before content exists.

### Fix

`config/models.yaml` `implement` chain (4 candidates, 3 vendor families, all free):

1. `cloudflare` / `gpt-oss-120b` → `@cf/openai/gpt-oss-120b`
2. `groq` / `qwen3.6-27b` → `qwen/qwen3.8-27b`
3. `openrouter_free` / `poolside/laguna-s-2.1:free`
4. `openrouter_free` / `minimax/minimax-m3.1-flash:free` (reasoning, gated)

`config/model-compat.yaml` adds a deterministic reasoning classification
(8 models), `minimum_output_tokens.implement: 768`, and a per-model floor of
`2048` for minimax (it spent ~1.7k tokens on reasoning and returned empty at
1024). `config/model-compat.json` was regenerated with `tools/sync_model_compat.py`.

`company_os/control_plane/router.py` now:

- computes the applicable minimum before reserving budget;
- emits `state: SKIPPED, reason: reasoning_budget_below_minimum` without a
  provider call when `effective max_tokens < minimum`;
- returns `client_truncated` when every contacted candidate was truncated or
  skipped (instead of implying providers were down);
- honours pinned candidates: a pinned reasoning model below its floor fails
  deterministically without a call.

`config/provider-certification.json` records dated corrections (the historical
entries are preserved in the `corrections` list): nemotron-3-super 404,
laguna now pass.

### Live verification of the repaired chain (Python router, temp state, real gateway)

| Case | Result | Attempts |
|---|---|---|
| chain, 1024 | ok, cloudflare, 1166 chars, 7.3 s | `cloudflare` |
| chain, 2048 | ok, cloudflare, 912 chars, 4.5 s | `cloudflare` |
| chain, 180 | ok, groq qwen, 173 chars, 5.3 s | `cloudflare:client_truncated`, `groq` |
| pin groq qwen, 180 | ok, 173 chars, 0.5 s | `groq` |
| pin laguna, 180 | ok, 626 chars, 8.9 s | `openrouter_free` |
| pin minimax, 180 | `client_truncated`, 0 calls | `SKIPPED` (floor 2048) |
| pin minimax, 1024 | `client_truncated`, 0 calls | `SKIPPED` (floor 2048) |
| pin minimax, 2048 | ok, 216 chars, 5.1 s | `openrouter_free` |

The live default path (`1024`) succeeds on the non-reasoning primary; `180`
fails over to groq instead of exhausting reasoning candidates. The live service
was **not** restarted, so the running process still holds the previous config;
these results use the repository config through the same router code.

## B. Pages Git integration

### Root cause (Cloudflare API, read only)

Project `company-os`, `production_branch: main`:

- command: `build_command: "exit 0"`
- destination: `business/site`; root: repository root
- production env vars: none
- preview env vars: none

Therefore every `main` push "builds" nothing and publishes the committed inert
`config.js` (286 bytes). Direct Upload writes the keyed file, then the next push
replaces it. Domain: `company-os-3ox.pages.dev`.

### Fix

- `tools/build_site.py` — the single canonical builder. Profiles:
  `production` (requires key + host, fails closed), `preview` and `stage`
  (always inert), `auto` (uses `CF_PAGES_BRANCH`; missing variable exits 3).
  Validates `phc_` key shape and https host; refuses partial credential pairs;
  writes atomically; never prints the key. In-place builds require
  `--allow-in-place` and are used only by the Pages build command.
- `scripts/deploy-site.sh` — now delegates staging to the builder, checks
  `CLOUDFLARE_API_TOKEN` before building (so "unavailable" keeps the
  `CLOUDFLARE_API_TOKEN` reason), builds `production` for deploy and `stage` for
  `--build-only`.
- `tools/check_pages_build_contract.py` — read-only API verifier. Checks branch,
  exact command `python3 tools/build_site.py --profile auto --out business/site
  --allow-in-place`, destination, root, production `POSTHOG_KEY` (secret_text)
  and `POSTHOG_HOST`, and that preview has neither. Exit 0 PASS / 1 FAIL /
  3 BLOCKED; never prints values.
- `docs/runbooks/site-deploy.md` — required settings, current mismatch,
  profiles, verification, failure modes, rollback.
- `scripts/gates-phase8.sh` — adds the read-only `pages build contract` check.
- Tests: `tests/test_site_build_contract.py` (builder, fail-closed, profile
  matrix, in-place guard, single-builder and runbook drift, committed inert
  file, `evaluate()` matrix); `tests/test_phase8_gate.py` follows the builder.

### Live contract check (read only, cloudflare credentials)

```
PASS production branch: expected main
FAIL build command: expected: python3 tools/build_site.py --profile auto --out business/site --allow-in-place
PASS destination directory: expected business/site
PASS root directory: expected repository root
FAIL production POSTHOG_KEY: expected a production-scoped secret_text variable
FAIL production POSTHOG_HOST: expected a production-scoped variable
PASS preview has no analytics: preview must not inherit production analytics
PAGES_BUILD_CONTRACT=FAIL
```

This is the expected result until the founder changes the dashboard settings.
`https://company-os-3ox.pages.dev/` returns 200; its `config.js` is still the
286-byte inert file.

### Required founder action (not performed by this work)

In Cloudflare Pages → project `company-os` → Settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Build command | `python3 tools/build_site.py --profile auto --out business/site --allow-in-place` |
| Build output directory | `business/site` |
| Root directory | repository root (empty) |
| Production `POSTHOG_KEY` | secret, value from the credential store |
| Production `POSTHOG_HOST` | production host |
| Preview variables | none |

After applying: re-run `tools/check_pages_build_contract.py`, then trigger one
authorized `main` deploy and verify the live `config.js` is non-empty/keyed
without printing the key.

## Deterministic verification

`./scripts/gates.sh` → **PASS**, `failed_checks=0` (log:
`/tmp/opencode/gates-final-2026-10-20.log`):

- unit tests: 1880, 0 failures, 7 skipped
- coverage: 85% branch, threshold pass
- mypy: 40 source files, no issues
- ruff + format: 270 files clean
- golden set: 49/49, stable over 3 order-independent passes
- trajectory: 9/9
- promptfoo: 18/18
- langfuse trace: PASS
- shellcheck, actionlint, gitleaks, trivy, semgrep (496 rules, 0 findings),
  osv-scanner: PASS
- model-compat YAML/JSON synchronized

`./scripts/gates-phase8.sh` without credentials → `status=BLOCKED` (rc 3), with
only expected credential Blocks and no failures, including the new
`pages build contract` BLOCKED line. With cloudflare credentials it reports
`status=FAIL` solely because the live Pages settings above are not applied;
live site content and inert analytics both verified.

## Residual risks

- OpenRouter free models are rate limited (observed 429) and minimax spends
  its output budget on reasoning; the 2048 floor prevents empty calls at the
  default 1024 but the tail is best-effort, not guaranteed.
- NVIDIA free routing remains mostly 404/503; no implement candidate depends on
  it now.
- The running control plane still uses the pre-fix config until an authorized
  restart; live end-to-end verification above intentionally used a separate
  router instance.
- The `pages build contract` gate remains FAIL/BLOCKED until the external
  settings are applied; until then any `main` push can clobber analytics.
- No `BUILD 0/46` manifest exists, so no roadmap items were ticked.

## Files

Modified: `company_os/control_plane/router.py`, `config/models.yaml`,
`config/model-compat.yaml`, `config/model-compat.json`,
`config/provider-certification.json`, `scripts/deploy-site.sh`,
`scripts/gates-phase8.sh`, `tests/golden/company-os-golden-set.yaml`,
`tests/test_control_plane_acceptance.py`, `tests/test_control_plane_boundary.py`,
`tests/test_phase8_gate.py`, `evidence/runs/mission-report-2026-10-20.md`.

Added: `tools/build_site.py`, `tools/check_pages_build_contract.py`,
`tests/test_site_build_contract.py`, `docs/runbooks/site-deploy.md`, this report.
