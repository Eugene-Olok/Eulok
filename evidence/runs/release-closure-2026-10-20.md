# Release closure — 2026-10-20

Status: **PASS — release merged to `main`; post-merge verification recorded**
Owner: founder
Repository: `Eugene-Olok/company-os`
Release branch: `release/closure-2026-10-20`
Addendum branch: `release/closure-addendum-2026-10-20`
Baseline `main`: `7a3c03a528617547cf610f0d1c81b43858ed5a29`
Release scope: Pages analytics release plus control-plane routing reliability

This is the canonical closure report. The supporting activation and Pages
reports remain in place and are not rewritten.

## 1. Verdict

The released code and activation are verified:

- the control plane is running committed `7a3c03a` and serves the repaired
  `implement` route;
- the 180-token production regression returns HTTP `200` from the
  non-reasoning Cloudflare primary;
- the Cloudflare Pages build contract passes and production serves armed
  analytics with session recording disabled;
- preview builds remain inert even when production credentials are present;
- the baseline and closure-branch deterministic and Phase 8 gates passed on
  clean worktrees;
- remote CI at baseline `7a3c03a`, release PR `5668013`, and merge commit
  `cf93b37` passed both workflows;
- production is still serving canonical deployment `25c4e60c`; the `7a3c03a`
  and `cf93b37` production records are `is_skipped: true`.

Residual limitation: PostHog server-side stored-event retrieval is not
available with the current credential scope. Live ingestion was verified; no
query-side retention claim is made.

No 46-item manifest exists in this repository. No bulk completion claim is
made.

## 2. Release identity and scope

| Item | Value |
| --- | --- |
| Baseline main | `7a3c03a528617547cf610f0d1c81b43858ed5a29` |
| Release branch | `release/closure-2026-10-20` |
| Addendum branch | `release/closure-addendum-2026-10-20` |
| Release evidence commit | `7438412bf5137263e3dc1c1c283205041e055f50` |
| Release report commit | `5668013` |
| Release PR | [#14](https://github.com/Eugene-Olok/company-os/pull/14) |
| Release squash merge | `cf93b3743ed74eb5b69262ecd561f712c2df843f` |
| Addendum PR | recorded in the final response |
| Addendum merge | recorded in the final response |
| Previous Pages release | PR #11, squash `69d7bff`; PR #12, squash `752087e` |
| Previous routing fix | `4998f69` |
| Production Pages deployment | `25c4e60c-a953-4591-80c7-bb344a194331` |
| Active control-plane PID | `470348` |
| Active control-plane start | `2026-10-20 18:11:42 EAT` |

The reviewed release diff is the 19-file change from `69d7bff^` through
`7a3c03a` plus the closure-only evidence/documentation diff on this branch.
The closure itself does not change routing code, the site builder, workflow
permissions, branch protection, or Cloudflare project settings.

## 3. Reviewed release changes

| Area | Change | Verification |
| --- | --- | --- |
| `implement` route | Cloudflare `gpt-oss-120b` primary; Groq, Poolside Laguna, MiniMax fallbacks | Live 180-token probe HTTP `200`; deterministic chain test |
| Reasoning budgets | Skip declared reasoning models below role/model minimum instead of calling them | Acceptance tests for skip, override, and adequate-budget paths |
| Truncation semantics | All-truncated requests report `client_truncated`, not provider outage | Router and boundary tests |
| Pages builder | One canonical builder for Pages and Direct Upload | Builder/contract tests; live Pages build |
| Preview isolation | Preview/stage always inert; production credentials ignored | Live preview deployment plus credentialed local preview run |
| Phase 8 contract | Read-only Pages project check added | `PAGES_BUILD_CONTRACT=PASS` |
| Deployment runbook | Canonical builder, settings, verification, failure modes | Documentation test pins the exact build command |

The review found no test deletion or gate weakening. The site builder fails
closed for missing or partial production analytics configuration, rejects
malformed keys and non-HTTPS hosts, never prints the key, and refuses an
in-place build without explicit permission.

## 4. Deterministic verification

### 4.1 Baseline gate at `7a3c03a`

| Field | Value |
| --- | --- |
| Status | `PASS` |
| Release eligibility | `PASS` |
| Worktree | `clean` |
| Local tests | `1880` passed |
| Branch coverage | `85%`, threshold passed |
| Golden set | `49/49` |
| Trajectory | `9/9` |
| Promptfoo | `18/18` |
| Security / lint / typecheck | `PASS` |
| CI classification | `LOCAL_ONLY` |

Evidence: `artifacts/gate-evidence.json`.

### 4.2 Baseline Phase 8 at `7a3c03a`

| Field | Value |
| --- | --- |
| Status | `PASS` |
| Deployment | `PASS` |
| Tests | `1880`, 0 failures |
| Failed / blocked / skipped | `0 / 0 / 0` |
| Pages build contract | `PASS` |
| Live site | `PASS` |
| Live analytics config | `PASS` |

Evidence: `evidence/runs/gate-evidence-phase8-20261020T153828Z.json`.

### 4.3 Closure-branch gates at `7438412`

| Field | Value |
| --- | --- |
| Core gate status | `PASS` |
| Core release eligibility | `PASS` |
| Worktree | `clean` |
| Local tests | `1880` passed, 7 skipped |
| Branch coverage | `85%`, threshold passed |
| Golden set | `49/49` |
| Trajectory | `9/9` |
| Promptfoo | `18/18` |
| Security / lint / typecheck | `PASS`, including `gitleaks` |
| Phase 8 status | `PASS` |
| Phase 8 deployment | `PASS` |
| Phase 8 failed / blocked / skipped | `0 / 0 / 0` |
| Pages build contract | `PASS` |
| Live site and analytics config | `PASS` |

Evidence:
`evidence/runs/gate-evidence-20261020T173421Z.json`,
`evidence/runs/gate-evidence-phase8-20261020T174245Z.json`,
`evidence/runs/deploy-site-evidence-20261020T174101Z.json`.

These are local gates. A local `PASS` is recorded separately from remote CI and
is never described as CI.

### 4.4 Remote CI at baseline

| Workflow | Run | Result |
| --- | --- | --- |
| `deterministic-gates` | [39439147491](https://github.com/Eugene-Olok/company-os/actions/runs/39439147491) | success |
| `phase8-gates` | [39439147463](https://github.com/Eugene-Olok/company-os/actions/runs/39439147463) | success |

The Cloudflare Pages deploy check on that commit is `skipped`.

### 4.5 Remote CI at release and merge

| Commit | Workflow | Run | Result |
| --- | --- | --- | --- |
| `5668013` (PR #14) | `deterministic-gates` | [39469968259](https://github.com/Eugene-Olok/company-os/actions/runs/39469968259) | success |
| `5668013` (PR #14) | `phase8-gates` | [39469968282](https://github.com/Eugene-Olok/company-os/actions/runs/39469968282) | success |
| `cf93b37` (merge) | `deterministic-gates` | [39471137000](https://github.com/Eugene-Olok/company-os/actions/runs/39471137000) | success |
| `cf93b37` (merge) | `phase8-gates` | [39471136977](https://github.com/Eugene-Olok/company-os/actions/runs/39471136977) | success |

The Cloudflare Pages check passed on PR #14. The workflow `Deploy Site` job was
skipped; deployment state is verified separately in §7.

## 5. Control-plane activation and live routing

Evidence:
`evidence/runs/final-activation-report-2026-10-20.md`,
`evidence/runs/model-routing-live-2026-10-20.json`,
`evidence/runs/model-routing-langfuse-2026-10-20.json`,
`evidence/runs/control-plane-postactivation-2026-10-20.log`.

| Check | Result |
| --- | --- |
| Service | active, PID `470348` |
| Health | ready, 9 roles |
| Bifrost | active, HTTP `200` |
| Live role probes | `11/11` HTTP `200` |
| `implement` 180-token regression | HTTP `200`, Cloudflare, 1 attempt, `1.884 s` |
| Live failover | observed on `architect`, `research`, `vision_qa` |
| Post-activation log | 21 lines, 14 HTTP `200`, 0 errors, 0 restarts |
| PostHog pageview ingestion | HTTP `200`, real browser event |

`research` took `63.5 s` because its primary timed out before fallback. This is
an operational latency risk, not a routing failure. The `implement` fallbacks
were not force-failed in production; their order and budget-skip behavior are
pinned deterministically.

## 6. Pages analytics production and preview

### 6.1 Production

Read-only live verification at `https://company-os-3ox.pages.dev`:

| Check | Result |
| --- | --- |
| Home page | HTTP `200`, expected content |
| `analytics.js` | HTTP `200` |
| `config.js` | HTTP `200`, well formed |
| Analytics armed | yes |
| API host | `https://us.i.posthog.com` |
| Session recording | disabled |
| Key value in evidence | not recorded |
| `config.js` hash | `a6408125f6c1bd96616689e98f784326301bc228f840ce888944fc60d0d2a2ea` |

The live alias, canonical deployment `25c4e60c`, and first canonical-builder
deployment `c632f071` serve byte-identical `config.js`. This is a third
independent observation of the same keyed configuration.

Evidence: `evidence/runs/pages-live-production-2026-10-20.json` and
`evidence/runs/pages-analytics-release-2026-10-20.md`.

### 6.2 Preview isolation

A credentialed local build on branch `release/closure-2026-10-20` resolved to
`preview`, wrote an inert config, armed no analytics, and leaked zero
credential-bearing files. The existing Pages preview deployment `6ba8a12b`
also ran the canonical builder and served inert config with empty preview
environment variables.

Evidence: `evidence/runs/pages-preview-builder-2026-10-20.json`.

### 6.3 PostHog boundary

The production site sent a real `$pageview`; ingestion accepted it with HTTP
`200`. No synthetic event was created. The available credential is a PostHog
project key only; no personal query credential is present, so stored-event and
retention queries were not executed.

## 7. Deployment trigger and production boundary

The Pages project is Git-integrated to `Eugene-Olok/company-os`; production
branch `main`; preview includes all branches; preview environment is empty;
production has `POSTHOG_KEY` as `secret_text` and `POSTHOG_HOST` as
`plain_text`. The build command is the canonical builder.

Pages deployment evidence:

| Commit | Environment | Deployment | State |
| --- | --- | --- | --- |
| `cf93b37` | production | `bba343b2` | `is_skipped: true` |
| `7a3c03a` | production | `0d1d1b18` | `is_skipped: true` |
| `752087e` | production | `25c4e60c` | `deploy:success`, canonical |
| `69d7bff` | production | `c632f071` | `deploy:success` |

The `7a3c03a` and `cf93b37` commits carried `[CF-Pages-Skip]`; Pages recorded
their production deployments as skipped rather than replacing canonical
production. The release-branch preview `3a0ca8fe` built successfully. The
closure merge is the recorded `bba343b2` skip at `2026-10-20T18:01:28Z`.

No Cloudflare setting, production site content, service, or credential was
changed. The external side effects were the release-branch preview build, the
guarded main merge, and the skip-marked production deployment record.

Evidence: `evidence/runs/pages-deployment-trigger-2026-10-20.json`,
`evidence/runs/pages-postmerge-2026-10-20.json`, `docs/runbooks/site-deploy.md`.

## 8. Security and evidence hygiene

| Check | Result |
| --- | --- |
| Committed evidence `gitleaks` scan | clean |
| Evidence test for secret-shaped strings | clean after removing raw commit messages |
| High-entropy key fingerprint | reduced to an eight-character prefix |
| Committed site config | inert |
| Production key recorded in repository | no |
| Credential values committed | no |
| Workflow permissions | `contents: read` |
| Branch protection | required check, linear history, enforce admins |

The deployment-history evidence records hashes, branches, environments, and
skip state only. It deliberately omits raw commit messages so arbitrary
secret-shaped fixtures cannot enter evidence.

## 9. Evidence index

| Evidence | Path |
| --- | --- |
| Final activation report | `evidence/runs/final-activation-report-2026-10-20.md` |
| Earlier activation report | `evidence/runs/activation-report-2026-10-20.md` |
| Control-plane defect report | `evidence/runs/control-plane-defects-2026-10-20.md` |
| Pages analytics release | `evidence/runs/pages-analytics-release-2026-10-20.md` |
| Pages deployment trigger | `evidence/runs/pages-deployment-trigger-2026-10-20.json` |
| Pages live production | `evidence/runs/pages-live-production-2026-10-20.json` |
| Pages preview builder | `evidence/runs/pages-preview-builder-2026-10-20.json` |
| Pages post-merge state | `evidence/runs/pages-postmerge-2026-10-20.json` |
| Live routing probes | `evidence/runs/model-routing-live-2026-10-20.json` |
| Langfuse route observations | `evidence/runs/model-routing-langfuse-2026-10-20.json` |
| PostHog delivery | `evidence/runs/posthog-live-verification-20261020T145832Z.json` |
| Post-activation log | `evidence/runs/control-plane-postactivation-2026-10-20.log` |
| Closure core gate | `evidence/runs/gate-evidence-20261020T173421Z.json` |
| Closure Phase 8 evidence | `evidence/runs/gate-evidence-phase8-20261020T174245Z.json` |
| Closure build-only staging | `evidence/runs/deploy-site-evidence-20261020T174101Z.json` |
| Baseline core gate | `artifacts/gate-evidence.json` |
| Baseline Phase 8 evidence | `evidence/runs/gate-evidence-phase8-20261020T153828Z.json` |
| Baseline build-only staging | `evidence/runs/deploy-site-evidence-20261020T153828Z.json` |

## 10. Roadmap manifest

`evidence/runs/inspection-2026-10-19.md` records that the supplied 46-item
build/release manifest is not present in the repository. A fresh search found
no such authoritative manifest. No roadmap item is marked complete, and no
invented list is used.

## 11. Blockers and limitations

Blockers: **none**.

Limitations:

1. PostHog server-side stored-event inspection is unavailable with the current
   project-key-only scope. Live ingestion is verified.
2. The `implement` fallback chain was not force-failed in production. Its
   order, retry contract, and reasoning-budget skip are deterministic tests.
3. `research` has a `63.5 s` primary-timeout-before-fallback observation.
4. A commit cannot contain its own merge SHA. The post-merge addendum records
   the verified release commit, PR, CI, and deployment state; the final
   response reports the addendum merge SHA.

## 12. Post-merge verification

Verified after the guarded squash merge:

| Check | Result |
| --- | --- |
| Release PR | [#14](https://github.com/Eugene-Olok/company-os/pull/14), merged |
| Squash merge | `cf93b3743ed74eb5b69262ecd561f712c2df843f` |
| Merge CI | deterministic `39471137000` success; Phase 8 `39471136977` success |
| Pages production record | `bba343b2`, `is_skipped: true` at `2026-10-20T18:01:28Z` |
| Canonical production | unchanged, `25c4e60c-a953-4591-80c7-bb344a194331` |
| Live Pages state | HTTP `200`; `config.js` hash `a6408125f6c1bd96616689e98f784326301bc228f840ce888944fc60d0d2a2ea` unchanged |
| Control-plane service | active, PID `470348`, health HTTP `200` |
| Local `main` | equals `origin/main` at merge commit; worktree clean |
| Addendum PR | recorded in the final response |

The addendum is itself merged through a second guarded, skip-marked PR because a
commit cannot record its own merge SHA. The final response reports that
addendum PR and merge SHA. No further production deployment is created by the
addendum merge.
