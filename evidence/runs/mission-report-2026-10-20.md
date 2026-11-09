# Mission report — provider routing reliability, release verification, site deploy

Date: 2026-10-20
Commit under test: `40caf01` (+ this report)
Operator: OpenCode session, human founder accountable

## Problem

Live inference through the control plane intermittently returned
`503 no_eligible_provider` for `router` and `vision_qa`. Two independent
defects were found:

1. **Self-inflicted circuit opening.** A caller-supplied `max_tokens` that a
   reasoning-style free model spends on reasoning produces HTTP 200 with
   `content: ""` and `finish_reason: "length"`. `BifrostClient` classified
   that as a provider fault, called `mark_transient()`, and opened the health
   circuit. With two candidates on a role, one small-`max_tokens` request
   could exhaust eligibility.
2. **Dead / broken candidate entries.** `vision_qa` listed
   `openrouter_free/inclusionai/ling-3.0-flash-vl:free`, which the gateway
   rejects (`404` — model is paid-only), and the `tests` Cloudflare fallback
   used `gpt-oss-120b`, which the gateway rejects with
   `400 no_key_supports_model`; the served id is `@cf/openai/gpt-oss-120b`.

## Change

- `company_os/control_plane/bifrost.py`: empty content with
  `finish_reason == "length"` → `client_truncated`, no `mark_transient`.
  Every other empty/malformed completion still fails closed as
  `provider_error` and still trips the circuit.
- `company_os/control_plane/router.py`: when every attempted candidate was
  healthy but truncated, report `client_truncated` rather than
  `no_eligible_provider`.
- `company_os/control_plane/boundary.py`: `client_truncated` maps to
  `400 invalid_request_error` (client input problem, not a gateway fault).
- `config/models.yaml`: router gains a fourth independent free fallback
  (`cloudflare/gpt-oss-120b`); `vision_qa` replaces the paid-only candidate
  with `nim/nemotron-3.5-super-vl-120b` and
  `nim/meta/llama-3.2-11b-vision-instruct`.
- `config/model-compat.yaml`: alias `nim.nemotron-3.5-super-vl-120b` and
  `cloudflare.gpt-oss-120b → @cf/openai/gpt-oss-120b`; JSON regenerated.
- Regression tests added for all of the above and for per-role capacity
  (router = 4 independent free vendors, vision_qa ≥ 3 with unique models).
- Golden set routing expectations updated; still 49/49 deterministic.

Classification, vendor separation, budget enforcement, JSON routing contract
and fail-closed provider errors are unchanged. No paid provider was used; all
candidates are in `config/provider-policy.yaml` `free_providers`.

## Evidence (this tree)

| Check | Result |
| --- | --- |
| `./scripts/gates.sh` | PASS, 0 failed |
| unit tests | 1847 run, 0 failures (baseline 406) |
| mypy (strict) | PASS, 25 files |
| coverage | 85% branch (threshold 85%) |
| gitleaks / semgrep / trivy / osv-scanner / shellcheck | PASS |
| golden set | 49/49, stable over 3 order-independent passes |
| promptfoo | 18/18 |
| langfuse trace | PASS |
| `./scripts/gates-phase8.sh` (credentialed) | PASS, 0 failed, 0 blocked, 0 skipped |
| live site | `https://company-os-3ox.pages.dev` answered with expected content |
| live analytics | deployed `config.js` carries key + host; session recording disabled |
| deploy | state=`verified`, https://e55a6da8.company-os-3ox.pages.dev |

## Measured reliability (live gateway, new config)

A temporary control-plane instance was started on `127.0.0.1:8095` with the
repository config and a fresh state directory, so circuits began healthy.
Requests went to the real Bifrost gateway on `127.0.0.1:8080`.

| Request | Result |
| --- | --- |
| `router`, `max_tokens=180` | 200, valid routing JSON |
| `vision_qa`, `max_tokens=180` | 200 |
| `summarise`, `max_tokens=180` | 200 |
| `tests`, `max_tokens=180` | 200 |
| `implement`, `max_tokens=180` | 200 |
| `router`, `max_tokens=4` | 400 `client_truncated` (not 503) |
| `router`, `max_tokens=4` then normal | normal request 200 — circuit stayed closed |

This is live evidence for the new configuration on the current gateway. It is
not evidence that the running production service has already adopted it: see
the limitation below.

## Remaining limitations (honest)

- **Production restart required.** `company-os-control-plane.service` loads
  `config/models.yaml` once at startup. The running unit (PID 214229) still
  holds the pre-change candidate list. Applying the new routing live requires
  an authorized `systemctl restart company-os-control-plane.service`, which
  was outside this task's authorization. The live table above was measured on
  a separate instance using the repository config.
- `router` still returns `502 router_contract_unsatisfied` when a model does
  not emit valid routing JSON — by design.
- `review` still requires `X-Company-OS-Implementation-Id` — by design.
- `actionlint` is unavailable in the credential sandbox; CI covers it.
- Free-provider latency and quota behaviour remain external and variable;
  the circuit breaker bounds the impact but cannot guarantee provider uptime.
- No authoritative `BUILD 0/46` release manifest exists; no ticks are claimed.

## Decision

Deterministic gates and Phase 8 pass on the committed tree, and the live site
and analytics are verified. The routing defect is fixed and proven in tests
and against the live gateway. Release remains **conditional** on the
authorized production control-plane restart; without it, production keeps the
old candidate list.

## Post-merge correction (2026-10-20 14:0x EAT)

The "live analytics verified" statement above was true at deploy time. The
merge to `main` (`4998f69`) then triggered the Cloudflare Pages Git
integration, which redeployed production from the committed `business/site`
and replaced the keyed `config.js` with the committed inert 286-byte file.
The original statement is retained; this note records the later state so the
record is auditable rather than silently rewritten. Evidence and the permanent
fix: `evidence/runs/activation-report-2026-10-20.md` §8.2.
