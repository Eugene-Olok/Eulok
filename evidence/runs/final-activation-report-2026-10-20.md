# Final production activation report — model routing

Date: 2026-10-20 (EAT)
Release commit: `7a3c03a528617547cf610f0d1c81b43858ed5a29`
Branch: `main`
Supersedes: `evidence/runs/activation-report-2026-10-20.md` (pre-merge report)
Status: **ACTIVE — PASS**

## 1. Scope

Activate and verify the committed model-routing changes in the running
production control plane:

- `implement` primary moved from the dead NVIDIA route to Cloudflare
  `@cf/openai/gpt-oss-120b`.
- `implement` fallbacks are now Groq Qwen, OpenRouter Poolside Laguna, and
  OpenRouter MiniMax.
- Reasoning models below their minimum output budget are skipped
  deterministically instead of being called, failing, and opening the provider
  circuit.
- No website deployment, provider credential change, or unrelated service
  restart was in scope.

## 2. Preflight: restart was required

| Evidence | Value |
| --- | --- |
| Old process start | `2026-10-20 13:51:06 EAT`, PID `399498` |
| Committed config/code mtime | `2026-10-20 17:29:16 EAT` |
| Repository HEAD / `origin/main` | `7a3c03a` / `7a3c03a` |
| Worktree before gates | clean |
| Configuration reload mechanism | startup only; no signal/reload path |
| Bifrost | active, health HTTP `200` |

The old process predated the merged routing files and had loaded the prior
configuration into memory. A restart was therefore necessary, not cosmetic.

## 3. Restart authorization and execution

The founder authorized and executed:

```bash
sudo systemctl restart company-os-control-plane.service
```

This was the only privileged action. It was not run by an agent; the shell has
no non-interactive sudo grant for `systemctl`.

Observed after restart:

| Check | Result |
| --- | --- |
| Service state | `active (running)` |
| New main PID | `470348` |
| Process start | `2026-10-20 18:11:42 EAT` |
| `/health` | `status=ok`, `ready=true`, 9 roles |
| Bifrost | active, HTTP `200` |
| Website | unchanged; no deployment performed |

Blast radius was limited to `127.0.0.1:8090`. Bifrost on `127.0.0.1:8080` and
the website were unaffected. `PartOf=company-os-bifrost.service` propagates
restarts from Bifrost to the control plane, not in the reverse direction.

## 4. Activated configuration

Committed `config/models.yaml` `implement` chain:

| Order | Provider | Wire model |
| --- | --- | --- |
| primary | `cloudflare` | `@cf/openai/gpt-oss-120b` |
| fallback 1 | `groq` | `qwen/qwen3.8-27b` |
| fallback 2 | `openrouter_free` | `poolside/laguna-s-2.1:free` |
| fallback 3 | `openrouter_free` | `minimax/minimax-m3.1-flash:free` |

All four candidates are free-eligible and span three vendor families.

The reasoning policy in `config/model-compat.yaml` is also active:

- `implement` minimum output budget: `768` tokens.
- MiniMax per-model floor: `2048` tokens.
- A reasoning candidate below its floor is recorded as
  `SKIPPED/reasoning_budget_below_minimum` and is not called.
- If no adequate candidate remains, the boundary reports
  `client_truncated`, not a provider outage.

No source or configuration change was made during activation.

## 5. Live production role matrix

Requests were sent to the running boundary at
`http://127.0.0.1:8090/v1/chat/completions`; routing identity was read back
from Langfuse, not inferred from provider prose. All calls used free providers.

| Role | max_tokens | HTTP | Provider | Wire model | Attempts | Latency |
| --- | ---: | ---: | --- | --- | ---: | ---: |
| `implement` | 1024 | 200 | `cloudflare` | `@cf/openai/gpt-oss-120b` | 1 | 3.015 s |
| `implement` | 180 | 200 | `cloudflare` | `@cf/openai/gpt-oss-120b` | 1 | 1.884 s |
| `implement` | 180 | 200 | `cloudflare` | `@cf/openai/gpt-oss-120b` | 1 | 2.757 s |
| `tests` | 1024 | 200 | `groq` | `qwen/qwen3.8-27b` | 1 | 1.325 s |
| `review` | 1024 | 200 | `zai` | `glm-4.7-flash` | 1 | 17.103 s |
| `security` | 2048 | 200 | `nim` | `nvidia/nemotron-3-ultra-550b-a55b` | 1 | 8.392 s |
| `architect` | 2048 | 200 | `nim` | `nvidia/nemotron-3-ultra-550b-a55b` | 2 | 3.116 s |
| `research` | 1024 | 200 | `nim` | `nvidia/nemotron-3-ultra-550b-a55b` | 2 | 63.555 s |
| `summarise` | 2048 | 200 | `groq` | `openai/gpt-oss-20b` | 1 | 1.520 s |
| `vision_qa` | 1024 | 200 | `nim` | `nvidia/nemotron-3.5-super-vl-120b-a12b` | 2 | 3.180 s |
| `router` | 512 | 200 | `google_free` | `gemini-3.6-flash` | 1 | 13.618 s |

Results:

- 11/11 bounded production probes returned HTTP `200` with non-empty content
  and `finish_reason=stop`.
- The `review` probe used the opaque implementation ID minted by the preceding
  `implement` call, so reviewer independence was enforced against a real
  implementer identity (`cloudflare` implementer, `zai` reviewer).
- The `implement` 180-token probe is the exact production regression: the old
  configuration returned HTTP `503`. The new configuration returned HTTP `200`
  in 1.884 s from the non-reasoning Cloudflare primary with one attempt.
- The `research` call completed but took 63.5 s because its Google primary hit
  `timeout_or_network` before the NVIDIA fallback succeeded. This is an
  operational latency observation, not a routing failure.
- `architect` and `vision_qa` also exercised fallback after a first-attempt
  failure and completed successfully. This proves live failover behavior for
  the shared router.
- The `implement` fallback candidates were not force-failed in production. Their
  declared order and reasoning-skip behavior are pinned deterministically in
  `tests/test_control_plane_acceptance.py::ImplementProviderReliabilityTests`.

## 6. PostHog production analytics

Command:

```bash
.venv/bin/python tools/verify_posthog_delivery.py
```

The verifier drove the live site in Chromium with a real browser identity and
observed the actual PostHog network round-trip.

| Check | Result |
| --- | --- |
| `config.js` well formed | PASS |
| `analytics.js` included | PASS |
| PostHog object initialized | PASS |
| Browser not classified as a bot | PASS |
| Event observed | `$pageview` |
| Ingestion response | HTTP `200` |
| `static/array.js` | HTTP `200` |
| Verdict | PASS |

This was one real pageview from a browser visit, not a synthetic capture API
call. No event was fabricated.

Constraint: the credential store contains only a PostHog project key (`phc_`)
and host. It does not contain a personal API key (`phx_`), so a dashboard-side
query of stored events is not possible. Presenting the project key to
`/api/projects/` returns HTTP `401`. The PASS therefore means the production
site sent the event and PostHog ingestion accepted it; it is not a claim that
the dashboard retention query was executed.

## 7. Deterministic gates

### 7.1 Core gate

```bash
./scripts/gates.sh
```

| Field | Value |
| --- | --- |
| Status | `PASS` |
| Release eligibility | `PASS` |
| Commit | `7a3c03a` |
| Worktree | `clean` |
| Failed checks | `0` |
| Unit tests | `1880` passed |
| Coverage | `85%` branch, threshold passed |
| Golden set | `49/49` |
| Trajectory | `9/9` |
| Promptfoo | `18/18` |
| Langfuse trace | PASS |
| Security / lint / typecheck | PASS |
| CI | `LOCAL_ONLY` — no CI pass is claimed |

### 7.2 Phase 8 production gate

```bash
COMPANY_OS_CRED_RUN_TIMEOUT=1800 \
  tools/secrets/cred_wrapper.sh cloudflare posthog -- \
  ./scripts/gates-phase8.sh
```

| Field | Value |
| --- | --- |
| Status | `PASS` |
| Deployment | `PASS` |
| Commit | `7a3c03a` |
| Worktree | `clean` |
| Tests | `1880`, 0 failures |
| Failed / blocked / skipped | `0 / 0 / 0` |
| Cloudflare credentials | PASS |
| PostHog credentials | PASS |
| Pages build contract | PASS |
| Live site verification | PASS |
| Live analytics configuration | PASS |

The website was verified read-only. `deploy-site.sh --build-only` staged a build;
no deployment was performed.

### 7.3 Post-activation service log

```bash
journalctl -u company-os-control-plane.service \
  --since '2026-10-20 18:11:42' --no-pager -o cat
```

| Check | Result |
| --- | --- |
| Log lines | 21 |
| HTTP responses | 14 × HTTP `200`, zero non-200 |
| Tracebacks / exceptions / error lines | 0 |
| Secret-bearing log lines | 0 |
| `systemctl` `Result` | `success` |
| `StatusErrno` | `0` |
| Restarts since activation | `0` |
| Bifrost `Result` / state | `success`, active (running) |

The log shows the clean stop/start, Langfuse tracing enabled, the listener bound
to `127.0.0.1:8090` with all nine logical models, and only successful health and
completion requests. The raw sanitized log is retained as evidence.

### 7.4 Remote CI after activation

The activation gate itself ran locally and recorded `ci=LOCAL_ONLY`. Remote CI
for the same commit was checked later and passed:

| Workflow | Run | Result |
| --- | --- | --- |
| `deterministic-gates` | [39439147491](https://github.com/Eugene-Olok/company-os/actions/runs/39439147491) | success |
| `phase8-gates` | [39439147463](https://github.com/Eugene-Olok/company-os/actions/runs/39439147463) | success |

This does not retroactively change the gate classification. It records the
separate remote result for `7a3c03a`.

## 8. Evidence index

| Evidence | Path |
| --- | --- |
| Core gate JSON | `artifacts/gate-evidence.json` |
| Phase 8 gate JSON | `evidence/runs/gate-evidence-phase8-20261020T153828Z.json` |
| Deploy staging evidence | `evidence/runs/deploy-site-evidence-20261020T153828Z.json` |
| Live role probes | `evidence/runs/model-routing-live-2026-10-20.json` |
| Langfuse route observations | `evidence/runs/model-routing-langfuse-2026-10-20.json` |
| PostHog delivery | `evidence/runs/posthog-live-verification-20261020T145832Z.json` |
| Post-activation service log | `evidence/runs/control-plane-postactivation-2026-10-20.log` |

The Phase 8 JSON was copied from the broker evidence handoff at
`/run/company-os/evidence/1000/gate-evidence-phase8.json`, which is where the
credentialed sandbox records evidence while the repository is read-only.

## 9. Unresolved blockers and limitations

Blockers to this activation: **none**.

Residual limitations, stated rather than hidden:

1. PostHog server-side stored-event inspection was not possible because only a
   `phc_` project key is available. Live ingestion was verified end-to-end and
   accepted with HTTP `200`.
2. The `implement` fallback chain was not forced to fail in production while
   Cloudflare was healthy. The fallback order and reasoning-budget skip are
   covered by deterministic acceptance tests and by live failover observed on
   `architect`, `research`, and `vision_qa`.
3. At activation time, CI had not been checked. Remote CI for `7a3c03a`
   later passed in both workflows (§7.4); the local gate still records
   `ci=LOCAL_ONLY` and is not reclassified as a CI run.
4. `research` showed a 63.5 s first-attempt timeout before fallback. Routing
   succeeded, but this is a latency risk worth monitoring.

## 10. Verdict

**Production activation: SUCCEEDED.**

The control plane is running committed `7a3c03a`, the new `implement` chain is
live and served the 180-token production regression with HTTP `200` from
Cloudflare, all nine logical models answered bounded live probes, reasoning
budget handling is deterministic and covered, live PostHog ingestion is
accepted, and both the core and Phase 8 deterministic gates pass on a clean
worktree. The website was not deployed or modified.

At the time of writing, no commit had been created. This report is committed
with the release evidence; the release-closure report records the commit, PR,
and post-merge verification. The worktree after evidence generation contained
only the new untracked evidence files listed above; the gates themselves ran
on clean `7a3c03a`.
