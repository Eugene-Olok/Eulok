# Production activation report — control plane model routing

Date: 2026-10-20 (EAT)
Release commit: `4998f6947242bd738594cb92c3221a286724349e` (origin/main)
Tested worktree: `0257bd9597a05d37993b954bb90cd9db4e85f942` (tree identical to `4998f69`)
Follow-up to: `evidence/runs/mission-report-2026-10-20.md`

## 1. Preflight

| Check | Result |
| --- | --- |
| branch | `fix/business-evidence-placeholder-guard` |
| HEAD | `0257bd9` |
| `origin/main` | `4998f69` |
| `git diff --stat origin/main HEAD` | empty — identical trees |
| working tree before activation | clean (0 entries) |
| config mtimes | `models.yaml` 00:49:17, `model-compat.yaml` 00:48:40 |
| control-plane code mtimes | `router.py` 01:12:20, `bifrost.py` 00:49:55 |

## 2. Service definition and blast radius

Unit: `/etc/systemd/system/company-os-control-plane.service` (system unit)
- `User=company-os`, `WorkingDirectory=/home/genie/company`
- `ExecStart=... tools/company_os_control_plane.py --state /var/lib/company-os/control-plane`
- `Wants=company-os-bifrost.service`, `After=company-os-bifrost.service`,
  `PartOf=company-os-bifrost.service`
- `Restart=always`, `RestartSec=5`

Only `company-os-control-plane.service` would be restarted. `PartOf=` propagates
restart **from Bifrost to the control plane**, not the reverse, so restarting the
control plane cannot restart Bifrost. Expected impact: `127.0.0.1:8090`
unavailable for a few seconds; in-flight requests fail; clients retry.
Bifrost (`127.0.0.1:8080`), the NVIDIA proxy, the credential broker/socket and
all other units are unaffected. State under
`/var/lib/company-os/control-plane` persists.

## 3. Restart: already performed before inspection — not repeated

The procedure assumed the restart had not happened. Deterministic evidence
shows it had:

- `journalctl`: `Stopping company-os-control-plane.service` at
  `13:51:06 +0300`, then `Started ...` at `13:51:06 +0300`.
- `ActiveEnterTimestamp` / process start: `2026-10-20 13:51:06 EAT`,
  MainPID `399498`, `NRestarts=0`, `Result=success`.
- The release commit was created at `01:57:13 +0300`; every config and code
  file mtime is earlier than `13:51:05`.
- The unit's `WorkingDirectory` is `/home/genie/company`, and that worktree's
  tree equals `origin/main`.

Therefore the running process started after the release commit and loaded the
committed `config/models.yaml` and control-plane code. A second restart would
add another outage without changing state, so none was performed (per the
instruction not to restart blindly). No privileged action was required for
activation; no sudoers or authentication changes were made.

## 4. Post-activation service state

- `systemctl is-active` → `active`
- `SubState=running`, `Result=success`, `NRestarts=0`
- `/health` → `{"status":"ok","ready":true,...}`, 9 roles, uptime consistent
  with 13:51:06.
- Bifrost unchanged: MainPID `214228`, active since `2026-10-19 14:40:06 EAT`.

## 5. Live smoke tests (production `127.0.0.1:8090`)

Prompt: "Write a short unit test for a function that adds two integers."

| Role | max_tokens | HTTP | Latency | finish_reason | Result |
| --- | --- | --- | --- | --- | --- |
| router | 1024 | 200 | 2.77 s | stop | valid routing contract (`role="tests"`) |
| vision_qa | 1024 | 200 | 66.11 s | stop | content |
| summarise | 1024 | 200 | 2.52 s | stop | content |
| tests | 1024 | 200 | 0.74 s | stop | content |
| implement | 1024 | 200 | 53.54 s | stop | content |

5/5 successful. `implement` also succeeds at 2048 (22.1 s, 988 completion
tokens). At `max_tokens=180`, `implement` returns 503 because its NVIDIA
primary is now 404 and both free OpenRouter fallbacks spend the budget on
reasoning; see defects below.

## 6. Truncation / circuit-closed proof

At `14:02:48 +0300`:

1. `router`, `max_tokens=4` → `HTTP 400`, `code=client_truncated` (7.21 s).
2. Immediately after, `router`, `max_tokens=1024` → `HTTP 200`, non-empty
   content (1.66 s).

The provider circuit stayed closed: a client-side truncation did not
down-rank the provider.

## 7. Logs (window `2026-10-20 13:51:00` → activation end)

| Check | Result |
| --- | --- |
| HTTP statuses | 15 × 200, 2 × 400, 1 × 503 |
| tracebacks / exceptions / crashes | 0 |
| `policy_blocked` / `cost_blocked` / `budget_blocked` / paid | 0 |
| secret-pattern matches (`sk-`, `phc_`, `ghp_`, `Bearer`, `api_key=`) | 0 |

No credential leakage, no unexpected paid-provider use, no policy violations
observed. Startup logged only the Langfuse host and the listening line.

## 8. Defects found during verification (not fixed — activation is read-only)

### 8.1 `implement` primary is dead (free-model rotation)

`nim/nvidia/nemotron-3-super-120b-a12b` now returns `404`
(`model_or_route_unavailable`). Direct probe with a fresh health store
confirmed the 404 is the provider, not the circuit. The two OpenRouter free
fallbacks (`poolside/laguna-s-2.1:free`, `cohere/north-mini-code:free`) return
HTTP 200 with empty content and `finish_reason="length"` at 64–180 tokens
(reasoning consumes the budget). At 1024+ tokens `implement` succeeds.

Impact: `implement` with small `max_tokens` fails; realistic budgets work.
Fix (separate change): replace the dead NVIDIA model id and re-verify the
OpenRouter fallbacks against the live gateway.

### 8.2 CRITICAL — site analytics regression from the Pages Git integration

The authorized deploy at ~22:5x UTC on 2026-10-19 produced
`e55a6da8.company-os-3ox.pages.dev` with a keyed `config.js` (verified). The
merge to `main` (`4998f69`) then triggered the Cloudflare Pages Git
integration, which built the committed `business/site` and deployed production
from `4998f69`.

Evidence:
- `wrangler pages deployment list` (read-only) shows the newest
  **Production/main** deployment `0eb080ea-…` from source `4998f69`
  (12 hours ago), newer than `e55a6da8-…`.
- Live `https://company-os-3ox.pages.dev/config.js` is now 286 bytes with no
  key — byte-for-byte the committed inert file (`wc -c business/site/config.js`
  = 286).
- `analytics_armed=false`.

So `main` pushes silently overwrite the deploy-time PostHog injection. This
also means the "live analytics verified" line in the mission report is true
only at deploy time, not after the merge.

Permanent fix (requires separate authorization; **not performed** here because
this task forbids deploying the site and changing production configuration):
disconnect the Pages Git integration from production (keep previews), or move
key injection into the Pages build itself using a Pages project environment
variable, so every build is correctly configured. Re-deploying alone will be
clobbered again on the next `main` push.

## 9. Safety confirmations

- No source code or model configuration changed during activation.
- No website deploy performed.
- No secrets, provider credentials, access controls or unrelated services
  modified.
- No sudoers change and no authentication bypass.
- Only read-only inspection and inference requests were issued.

## 10. Verdict

**Production activation: SUCCEEDED.** The control plane is active, healthy and
running the release-certified code and model configuration; all five roles
served successful live responses at a realistic token budget, and the
truncation test returned `400 client_truncated` with the circuit remaining
closed.

**Not fully green:** `implement` has a dead primary (free-model rotation), and
live site analytics is regressed by the Pages Git integration. Both are
reported above and require separate authorized changes; neither was introduced
by this activation.
