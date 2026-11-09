# Credential-Broker Sandbox Fix — 2026-10-17

Branch: `feat/phase9-reconciliation-product`
Commits: `117ee70` (§1–7: Node runtime + scoped evidence overlay), plus this
follow-up commit (§8: bounded run budget).
Scope: `tools/secrets/` (loader, broker, wrapper), `scripts/deploy-site.sh`,
`scripts/gates-phase8.sh`, tests, runbook.

> Purpose: make the documented broker-mediated deployment/gate workflows run
> under the hardened credential sandbox, without weakening the isolation
> boundary. Authorized by the founder ("Option 1", permanent fix).

---

## 1. Problem

The broker sandbox bound only the repository (read-only) and system
directories, with a `PrivateTmp` `/tmp` as the sole writable path. Two
documented workflows therefore failed inside it:

- `npx`/`node` were **absent** (the base sandbox carries no Node.js runtime),
  so `scripts/deploy-site.sh` (`npx --yes wrangler@4`) and
  `scripts/gates-phase8.sh` could not run.
- Evidence writes (`artifacts/<name>.json`) failed with
  `EROFS: read-only file system`.

Observed (old broker, as `genie`):

```
BLOCKED: wrangler and npx are both unavailable
OSError: [Errno 30] Read-only file system: 'artifacts/deploy-site-evidence.json'
```

## 2. Change (minimal, additive)

Three narrowly-scoped changes in `tools/secrets/credential_loader.py`:

1. **Trusted Node.js runtime (read-only).** `resolve_node_prefix()` discovers a
   Node prefix and binds its `bin/` and `lib/node_modules/npm` read-only. A
   prefix is trusted only when it is a directory owned by root/the caller, not
   world-writable, containing an executable non-world-writable `bin/node` that
   resolves *inside* the prefix, and a `lib/node_modules/npm`. The whole `bin/`
   is bound because `npx`/`npm` are relative symlinks into
   `../lib/node_modules`. When bound, the prefix `bin` is prepended to `PATH`
   and `HOME` moves to the tmpfs `/tmp` with npm/XDG/wrangler caches redirected
   there. Disable with `COMPANY_OS_CRED_BROKER_BIND_NODE=0`; pin with
   `COMPANY_OS_NODE_PREFIX`.
2. **Writable evidence overlay (scoped).** `default_evidence_dir()` +
   `_prepare_evidence_dir()` create a per-caller `0700` directory (chowned to
   the caller by a root broker) which is `--bind`-mounted **over the
   repository's `artifacts/` only**. `scripts/deploy-site.sh` and
   `scripts/gates-phase8.sh` keep writing to their normal path; the bytes land
   in the host evidence directory. The overlay is applied only when the broker
   is privileged and running on a distinct peer (`cred_broker.py::_dispatch`),
   and only when `artifacts/` already exists in the read-only bind (a missing
   dir is skipped, not an abort). No env var is exported into the sandbox, so
   nested unit-test subprocesses are unaffected. Evidence writes are now atomic
   (`tempfile` in the same dir + `os.replace`).
   - **Base traversability (fixes the activation-revealed defect — §5).** The
     shared base `/run/company-os/evidence` is normalized to `0711`
     (execute-only) on every privileged handoff; the per-caller leaf stays
     `0700`. The broker unit's `UMask=0077` would otherwise leave the base at
     `0700`, locking the caller out of its own leaf.
3. **Bind-source resolution hardening.** `_is_trusted_node_prefix()` now
   requires the `bin` and `npm` bind *sources* to resolve inside the prefix
   (new `_within(root, path)` helper), not just `bin/node`. A symlinked `bin/`
   or `lib/node_modules/npm` pointing at an unrelated tree would otherwise be
   bound read-only into the sandbox.

**Boundary preserved:** repo still read-only; no host secrets dir exposed;
evidence overlay restricted to `artifacts/`; node bound read-only from a
validated trusted prefix; fail-closed unchanged; no authz/lane/allowlist change.

## 3. Verification (this host, as `genie`)

| Check | Result |
|---|---|
| Node in sandbox (`resolve_node_prefix`) | `/home/genie/.nvm/versions/node/v24.20.0`, `node v24.20.0`, `npx 11.19.0` |
| `npx --yes wrangler@4 --version` (sandbox, `--share-net`) | `4.151.1` (DNS works) |
| `deploy-site.sh --build-only` (sandbox) | rc 0; evidence written to host dir; repo `artifacts/` untouched |
| `BrokerSandboxRuntimeTests` (new + hardened) | 9 tests OK |
| full host suite (`discover -s tests`) | **1593 tests, 6 failures, skipped=5** — all 6 share one root cause, see §5 |
| broker-dependent modules with broker **bypassed** (`COMPANY_OS_CRED_BROKER_SOCKET=/nonexistent`) | 46 tests OK (CI/sandbox path is green) |
| `ruff check .` | All checks passed |
| `semgrep --config=auto --error --exclude .git .` | 0 findings |
| `bash -n` on 3 scripts; `py_compile` | OK |

The 6 full-suite failures are exactly and only the live-broker base-perms
artifact — every one reports
`bwrap: Can't find source path /run/company-os/evidence/1000: Permission denied`
in `test_secrets_isolation.SecretsIsolationTests` (4) and
`test_secrets_isolation_boundary.SyntheticSandboxTests` (2). All 6 pass the
moment the broker is bypassed, so the code fix is complete and CI is green; the
live failures clear on broker restart (§7).

New regression tests pin the trust checks (world-writable / symlink-escape
prefixes refused — including a symlinked `bin`/`npm` **bind source**), the
base-traversability rule (base `0711`, leaf `0700`, a non-broker base left
untouched), the overlay scope, the `COMPANY_OS_EVIDENCE_DIR` non-leak, an
isolation-guarded end-to-end node+evidence run, and `_dispatch`'s
evidence-mount-only-when-dropping behaviour.

## 4. Test-report reconciliation (why two contradictory reports are both true)

Two reports coexisted and are **both legitimate**; neither is a weakened test.

- **"Full suite exits 0" — the broker-sandbox run.** Inside the sandbox,
  `shutil.which("opencode")` is `None` (the bound node prefix ships `bin/`
  without a resolvable `opencode`), so the live MCP probes self-skip via
  `@unittest.skipUnless` (`skipped=27`) → `rc=0`. The broker-dependent tests
  also take the loader fallback (no broker socket inside the sandbox) and pass.
- **"Gate fails on the Penpot MCP test" — the host run.** On the host,
  `opencode` resolves, so `test_penpot_mcp_tools_discoverable` spawns a nested
  `opencode run` that **times out at 180 s** (see §6). Independent of this
  change.

Rerunnability: the gate is reliable when the live Penpot MCP is healthy and
uncontended. The test is **not** weakened or skipped — its skip path only
triggers when the nested run is slow *and* returns non-zero, which does not
happen here (it returns `rc=0`; only the timeout fires).

## 5. Activation-revealed defect (found by this fix's own tests)

Restarting the broker (it is now **PID 194217**, started 2026-10-17 01:54:11 —
not the pre-change PID 782) activated the evidence overlay, and immediately
exposed a real bug the new tests caught:

```
AssertionError: 1 != 0 : Command failed: bwrap: Can't find source path
/run/company-os/evidence/1000: Permission denied
```

Cause: `_prepare_evidence_dir` chmodded only the per-caller **leaf** (`0700`),
never the shared **base**. Under the unit's `UMask=0077` the root `mkdir` of
`/run/company-os/evidence` left it `0700`, so the sandboxed caller could not
traverse into its own leaf. **Fixed** (base → `0711`), with a hermetic
regression test. The 4 failures persist only until the broker reloads the fixed
loader (§7) — the code fix is verified hermetically now.

## 6. Penpot MCP test: transient, not a deterministic failure

`tests/test_mcp_regression.py::MCPConnectionTests::test_penpot_mcp_tools_discoverable`
**passed** in the authoritative full run above (`... ok`, line 949). It has also
been observed to time out (180 s) in a separate standalone invocation, which is
why an earlier report showed `failed_checks=1`. Diagnosis of the slow path: the
nested `opencode run "use penpot ..."` completes with `rc=0` **within a 400 s
budget** but can exceed the 180 s test timeout; stderr shows
`⚙ penpot_high_level_overview Unknown` and stdout reports **"No Penpot instance
connected for user token"** — the Penpot MCP transport is connected but no live
Penpot design instance is attached to the token, and model latency varies. The
test is untouched by this change; **it must not be weakened or skipped** (its
skip path only triggers when the nested run is slow *and* returns non-zero, which
does not hold — it returns `rc=0`). It is a flaky/environmental probe, not proof
of a regression.

## 7. Blocker for activation

The running broker (**PID 194217**) loaded the pre-hardening code plus the
evidence-overlay change (which carries the base-perms defect). Activating the
corrected loader requires a root restart, which the agent cannot perform (no
passwordless sudo):

```
sudo systemctl restart company-os-credentials.service
```

After that, the documented broker-mediated commands should run end-to-end and
the 4 live-broker tests should pass. Durable privileged evidence must be copied
out of `/run/company-os/evidence/<uid>` (tmpfs) to `artifacts/`.

**Status: DONE.** The founder restarted the broker (now **PID 207184**, started
2026-10-17 02:36:28). Post-restart: base `/run/company-os/evidence` is `0711`,
the per-caller leaf is `0700`, the 46 broker-dependent tests pass, and the full
host suite is green (`Ran 1593 tests … OK (skipped=5)`). The documented
`deploy-site.sh --build-only` ran end-to-end through the broker (`rc 0`, evidence
at `/run/company-os/evidence/1000/deploy-site-evidence.json`).

A second restart (**PID 240655**, started 2026-10-17 11:14:59) activated the §8
run-budget change. The §9 tool-state change below was authored *after* that
restart, so it needs its own restart to go live.

## 8. Run-budget defect (found running the Phase 8 gate *through* the broker)

With the sandbox fix active, the documented broker-mediated gate
(`tools/secrets/cred_wrapper.sh posthog cloudflare -- ./scripts/gates-phase8.sh`,
named in the runbook and in the wrapper's own usage) failed at exactly **300s**:

```
cred-broker: internal broker error
```

Cause: `run_with_credentials` bounded every sandboxed run at a hard-coded
`subprocess.run(timeout=300)`. A gate that runs the whole test suite (~8 min),
and a non-`--build-only` deploy, legitimately exceed that. The resulting
`subprocess.TimeoutExpired` escaped to the broker's catch-all, surfacing as the
opaque "internal broker error" with no diagnosis. Confirmed deterministically: a
broker-mediated `sleep 320` returned `rc=1` at **300s**, and `sleep 60` with a
15s budget returned `rc=1` at **16s**.

**Fix (bounded, request-scoped, default-preserving):**

- `credential_loader.py`: `DEFAULT_RUN_TIMEOUT=300`, `MAX_RUN_TIMEOUT=3600`,
  `RUN_TIMEOUT_ENV=COMPANY_OS_CRED_RUN_TIMEOUT`; `resolve_run_timeout()` reads an
  explicit argument → env → default, and clamps to `[1, MAX_RUN_TIMEOUT]`.
  `run_with_credentials(..., timeout=…)` applies it and translates
  `TimeoutExpired` into a clear `CredentialError` naming the budget and the env
  var. `subprocess.TimeoutExpired` is no longer reachable as an opaque error.
- `cred_broker.py`: `_dispatch` validates `request["timeout"]` (int, not bool)
  and forwards it; `client()` carries `--timeout` in the request and sizes its
  socket read to the requested budget; `CLIENT_RUN_TIMEOUT = MAX_RUN_TIMEOUT+30`.
- `cred_wrapper.sh`: `COMPANY_OS_CRED_RUN_TIMEOUT` (exported) is passed as
  `--timeout` to the broker client and reaches the loader fallback path.

**Boundary preserved:** the budget is a resource knob, never a credential; it is
caller-supplied but clamped to `MAX_RUN_TIMEOUT` (1 h), so no caller can pin a
sandbox slot without bound. Authz/lane/allowlist unchanged.

**Verification:**

| Check | Result |
|---|---|
| `resolve_run_timeout` (default / explicit / clamp-high / clamp-low / bool / env / env-garbage) | 300 / 1500 / 3600 / 300 / 300 / 1200 / 300 |
| end-to-end via throwaway non-root broker: budget 90, `sleep 20` | rc 0, 21s |
| end-to-end via throwaway non-root broker: budget 15, `sleep 60` | rc 1, 16s, `credentialed command exceeded the 15s run budget …` |
| focused suite (`test_cred_broker`, `test_secrets_isolation[_boundary]`, `test_isolate_secrets_script`) | 117 tests OK |
| `ruff check` / `semgrep --config=auto` (changed files) / `bash -n` | clean |

New tests: `test_dispatch_forwards_timeout_and_rejects_bad_type`,
`test_client_request_carries_timeout_and_sizes_socket_budget`,
`test_resolve_run_timeout_defaults_and_clamps`,
`test_run_with_credentials_applies_the_budget`,
`test_run_with_credentials_reports_timeout_clearly`.

> **Activation:** the *running* broker must be restarted to pick up the server-side
> `_dispatch` timeout forwarding (`sudo systemctl restart
> company-os-credentials.service`); the new `client` code takes effect per
> invocation. The wrapper's own usage example now shows
> `COMPANY_OS_CRED_RUN_TIMEOUT=1800 … gates-phase8.sh`.

## 9. Toolchain-state (`.wrangler`) defect (found running the gate through the broker)

With §8 live, the documented broker-mediated gate ran **to completion** for the
first time — `COMPANY_OS_CRED_RUN_TIMEOUT=1800 tools/secrets/cred_wrapper.sh
cloudflare posthog -- ./scripts/gates-phase8.sh` → **rc 3 (BLOCKED)**, 401s,
`failed=0`, `blocked=2`, `tests=1598`, `baseline=406`; evidence at
`/run/company-os/evidence/1000/{gate-evidence-phase8.json,deploy-site-evidence.json}`.
The two BLOCKED checks are the live-site ones ("live site verification", "live
analytics configuration"), which cannot pass before a deploy that injects
`POSTHOG_KEY`.

Resolving them requires the gate to read the canonical Pages project domain, which
it does with `npx --yes wrangler@4 pages project list --json`
(`scripts/gates-phase8.sh` L481-501). Inside the sandbox that failed closed:

```
EROFS: read-only file system, open '/home/genie/company/.wrangler/cache/pages.json'
```

**Root cause.** `wrangler@4` resolves its project root from `cwd` (there is no
`package.json` in the repo, so `getPagesProjectRoot()` falls back to
`process.cwd()`) and keeps per-project state under `<root>/.wrangler`:

- the API cache `<root>/.wrangler/cache` (`getCacheFolder2` → env
  `WRANGLER_CACHE_DIR` → nearest `node_modules/.cache/wrangler` → else
  `<cwd>/.wrangler/cache`), and
- the deploy **bundling tmp dir** `<root>/.wrangler/tmp`, created via
  `getWranglerTmpDir(getPagesProjectRoot(), "pages")` — **no env override**.

`deploy-site.sh` runs `cd "$ROOT"`, so both resolve under the read-only repo
bind. The host `<repo>/.wrangler/` exists (a leftover cache dir; gitignored at
`.gitignore:18`), which is why wrangler actually tried to open it. Pinning
`WRANGLER_CACHE_DIR=/tmp/.wrangler/cache` fixes the *cache* half (verified: a
real `pages project list` reaches the Cloudflare API from `cwd=repo` with no
EROFS), but **not** the deploy tmp dir — so it is a partial mitigation, not the
fix. A bubblewrap writable bind cannot be used to dodge this either: `--bind`/
`--dir` over a path that does not exist inside an earlier `--ro-bind` fails with
`bwrap: Can't mkdir … Read-only file system`.

**Fix (same shape as the evidence overlay — a writable tool-state overlay):**

- `credential_loader.py`: new `STATE_DIR_ENV=COMPANY_OS_STATE_DIR`,
  `STATE_BASE=/run/company-os/state`, `WRANGLER_STATE_REL=".wrangler"`;
  `default_evidence_dir`/`default_state_dir` share one `_default_handoff_dir`
  helper; `_prepare_evidence_dir` generalized to `_prepare_handoff_dir` (both
  managed bases normalize to `0711`, leaf `0700`, any other base untouched);
  `run_with_credentials(..., state_dir=…)` prepares the directory and
  `_build_bwrap_command(..., state_dir=…)` **binds it over `<repo>/.wrangler`
  only when the Node runtime is bound**. The `WRANGLER_CACHE_DIR` poke is
  removed: with the real `.wrangler` writable, the cache, deploy-config and
  bundling tmp paths behave exactly as on the host — one faithful mechanism, no
  split state.
- `cred_broker.py`: `_dispatch` passes
  `state_dir=default_state_dir(peer_uid)` iff it is dropping to the caller.
- `cred_wrapper.sh` / loader CLI: the CLI `run` path passes
  `state_dir=default_state_dir()` too.

**Boundary preserved.** The overlay is a per-caller `0700` host path (a path
selector, never a credential); it is added only for Node runs on a caller's
behalf; no env var is exported; the repository mount itself stays read-only and
the sandbox is otherwise unchanged (non-Node commands get no extra mount).

**Verification:**

| Check | Result |
|---|---|
| `ruff check` / `semgrep --config=auto` (changed files) | clean |
| `tests.test_secrets_isolation` | 43 tests OK |
| `tests.test_cred_broker` | 26 tests OK |
| `test_secrets_isolation_boundary` + `test_security_phase8` + `test_systemd_units` + `test_phase8_gate` + `test_isolate_secrets_script` | 91 tests OK |
| real `npx wrangler@4 pages project list` through the loader, `cwd=repo`, synthetic token | `HAS_EROFS False`, reaches API (auth 400/9106) |
| e2e sandbox: `node` runs; `.wrangler/cache` + `.wrangler/tmp` writes land on the host state dir; repo `.wrangler/` untouched | OK |

New/updated tests: `test_default_state_dir_precedence`,
`test_bwrap_command_overlays_wrangler_state_for_node` (node-gated: emitted with
Node, absent with `COMPANY_OS_CRED_BROKER_BIND_NODE=0`),
`test_node_runtime_and_writable_overlays_work_in_sandbox` (was
`…evidence_overlay…`), `test_prepare_handoff_dir_*` (renamed from
`…evidence_dir…`), and `test_dispatch_mounts_evidence_only_when_dropping_to_peer`
now also asserts the `state_dir` forwarding.

> **Activation:** like §8, this loader/broker change requires a root restart
> (`sudo systemctl restart company-os-credentials.service`) to take effect in the
> running broker; the second restart above (**PID 240655**) only made §8 live
> (this §9 change was authored afterwards). The `.wrangler` mount point is
> host-created on demand and already exists (gitignored).

