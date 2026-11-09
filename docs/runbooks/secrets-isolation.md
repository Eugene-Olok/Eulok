# Secrets Isolation Runbook

Status: **boundary active and verified on the host; Penpot sync system unit
installed and working** (see *Current host state*). The root re-apply was
executed by the founder on 2026-10-14; all 14 boundary checks passed with
`checks=14 failures=0 unverified=0` and `VERDICT: PROTECTED`. The
`opencode-penpot-sync` system unit was installed via
`sudo scripts/install-opencode-penpot-sync.sh --system` (2026-10-15) and
verified operational — the path unit is active, the service runs as root with
`Environment=HOME=/home/genie` in `[Service]`, hands rendered files back to
`genie:genie`, and the sync reports "already current" with the rendered
`penpot_mcp_url` file at mode `0600` owned by `genie:genie`.

## Problem

The provider secrets file `~/company-os/secrets/providers.env` is owned by
`genie` at mode `0600`. Every agent process runs as `genie`, so **the agent can
read the secrets file directly**. The bubblewrap wrapper
(`tools/secrets/cred_wrapper.sh` → `credential_loader.py`) only isolates the
*child* process; it does not stop the parent identity from reading the file.

Demonstrated with `scripts/isolate-secrets.sh --check`:

```
owner:group:     genie:genie
mode:            600
VERDICT: UNPROTECTED — the invoking identity can read the secrets file.
```

## Target design

1. Dedicated no-login system identity `company-os` / group `company-os`.
2. Run the three services (`bifrost`, `control-plane`, `nvidia-proxy`) as
   **system** units under that identity, delivering the secrets through
   systemd's `LoadCredential=providers.env:/home/genie/company-os/secrets/providers.env`.
   PID 1 (root) reads the file; the service user never needs read access to the
   on-disk path. Templates: `deploy/systemd/*.service`. The units execute from
   under `/home/genie` (mode `0750`), so `--apply` grants `company-os`
   **traversal only** of that path — a single revocable `setfacl` ACE
   (`u:company-os:--x`) on each directory lacking the other-execute bit, never
   supplementary group membership (see *Follow-ups*).
3. Run the **credential broker** as the single trusted reader of the secrets
   file (see below), so the ordinary agent identity never needs to read it.
4. Flip the secrets file to `root:root 0600` so `genie` (and therefore the
   agent) can no longer read it.

## Credential broker

`tools/secrets/cred_broker.py` is a local `AF_UNIX` service (units:
`deploy/systemd/company-os-credentials.{socket,service}`). It runs as root,
receives the secrets via `LoadCredential=`, and executes a requested command in
the same bubblewrap sandbox the loader uses — injecting **only the requested
categories** and returning the command's (redacted) output. It never returns
credential values, selects no files/hosts/secret names beyond the declared
categories, and authorizes every connection by kernel-reported peer uid
(`SO_PEERCRED`) against `COMPANY_OS_CRED_BROKER_ALLOWED_UIDS` (default: the
broker's own uid). When privileged, it maps each run back to the caller's
uid/gid so the command runs as the invoking identity.

### Privileged uid mapping (why the broker drops to the caller first)

Mapping back to the caller is not enough on its own. A **root** broker invoking
`bubblewrap --unshare-user --uid <peer>` on this host fails with:

```
bwrap: setting up uid map: Operation not permitted
```

The same command as the unprivileged caller (uid 1000) succeeds: writing a
userns uid map where the outer uid equals the inner uid is a *self-map*, which
the kernel always permits without `CAP_SETUID`. Only the root path is refused
(confirmed: the sandbox's own hardening — `ProtectSystem`, `PrivateTmp`,
`RestrictAddressFamilies`, etc. — does **not** cause it; a uid-1000 bwrap works
under the broker's full systemd sandbox properties).

The fix lives in `credential_loader.py::_sandbox_privilege_prefix`: when the
loader runs as root *and* a target identity is given, it prepends
`setpriv --reuid=<uid> --regid=<gid> --clear-groups --` so bubblewrap runs as
the caller and the uid map becomes a permitted self-map. It returns an empty
prefix for the ordinary unprivileged agent path, so behaviour there is
unchanged.

The drop **fails closed**. It refuses (raising `CredentialError`) rather than
falling through to running peer code as root whenever it cannot *prove* the drop
is effective: a privileged process with no target identity, a target without a
gid, or `setpriv` absent/not executable. `cred_broker.py` mirrors this at
startup: a privileged broker refuses to start (exit 1, before accepting any
connection) when `privilege_drop_available()` is false, so a peer command can
never be executed as root by a silent no-op.

`cred_wrapper.sh` routes through the broker whenever
`COMPANY_OS_CRED_BROKER_SOCKET` (default `/run/company-os/cred-broker.sock`)
is a live socket, and otherwise uses the in-process loader (which fails closed
once the file is protected and names the broker as the remedy).

### Readiness, not liveness

A live socket proves the broker process started; it does not prove the broker is
*usable*. A broker that came up but cannot read its credential file would accept
connections and then fail every `run`. The broker therefore exposes a
presence-only `ping` op (`cred_broker.py ping --socket <sock>`, exit 0 only when
the credential file is present and readable).

A successful `ping` is **necessary but not sufficient**: it proves the broker can
*read* the secrets, not that it can *spawn a sandboxed command*. A ping-only gate
once reported a broken boundary `PROTECTED` (see *Privileged uid mapping*), so
`--apply` now requires a full **end-to-end run probe** — a real
`client --socket <sock> cloudflare -- /bin/sh -c 'exit 0'` through the sandbox,
as the agent identity, exiting 0 — before it will flip the secrets file (see
*Activation*). `scripts/isolate-secrets.sh --check` surfaces the distinction:
`credential path: USABLE` (all probes pass) vs `BROKEN` (socket + ping pass but
the run probe fails) vs `UNAVAILABLE` (no active/ready socket).

The broker also exposes a presence-only `check` op
(`cred_broker.py check --socket <sock>`) that prints the same `key=value`
report as `credential_loader.py check` (`SET`/`MISSING`, never a value). The
release gate (`scripts/gates.sh`) uses it as a fallback: when the gate's own
identity cannot read the protected file, the live-Langfuse `creds_present`
decision is resolved from the broker, so `release_eligibility` can flip to
`PASS` from a credentialed run without exporting any secret into the gate's
environment (`GATES_LANGFUSE_MODE=required` default). With no broker socket
(e.g. CI) the fallback is skipped and the hermetic SKIP path is unchanged.

The gate's live Langfuse evidence is written with `--output /dev/stdout` and the
host shell redirects it into `artifacts/`. Because the sandbox `/dev` is a fresh
minimal devtmpfs, re-*opening* `/dev/stdout` is refused; the verifier honours the
sentinel in-process (`sys.stdout`) so the inherited stdout descriptor is used
instead (see `verify_langfuse_trace.py::_write_output`).

The broker's `RestrictAddressFamilies` deliberately allows
`AF_INET`/`AF_INET6` in addition to `AF_UNIX`: the sandboxed children of a
network category need to open sockets, and `--unshare-net` — not the systemd
socket-family filter — is what denies network to a run that should not have it.

### Sandbox capabilities: Node.js runtime and evidence overlay

The base sandbox binds only the repository and the system directories, so it
carries **no Node.js runtime** and its only writable paths are the `PrivateTmp`
`/tmp` and the (read-only) repository. Three narrowly-scoped bindings make the
documented deploy/gate commands (`scripts/deploy-site.sh` uses `npx --yes
wrangler@4`; `scripts/gates-phase8.sh` runs it with `--build-only`) work under
that boundary without widening it:

- **Node.js runtime (read-only).** A *trusted* Node prefix is discovered
  (`credential_loader.py::resolve_node_prefix`) and its `bin/` directory and
  `lib/node_modules/npm` are bound read-only. "Trusted" is validated, not
  assumed: the resolved prefix must be a directory that is not world-writable,
  owned by root or the running identity, contain an executable, non-world-writable
  `bin/node` that resolves *inside* the prefix (no symlink escape), and a
  `lib/node_modules/npm` directory. The whole `bin/` is bound (not individual
  files) because `npx`/`npm` are relative symlinks into `../lib/node_modules`.
  When bound, the prefix's `bin` is prepended to the child `PATH` and the child
  `HOME` becomes the tmpfs `/tmp` with `npm`/`XDG`/`WRANGLER` caches redirected
  there, so nothing writes into the read-only tree (a Node tool that insists on
  writing under the repo is handled by the tool-state overlay below). Discovery
  can be disabled
  (`COMPANY_OS_CRED_BROKER_BIND_NODE=0`) or pointed at an explicit prefix
  (`COMPANY_OS_NODE_PREFIX`); when no trusted prefix exists the sandbox is
  unchanged and the command fails closed as before.
- **Evidence overlay (writable, scoped).** The repository is read-only, so the
  scripts' `artifacts/<name>.json` evidence writes would fail with `EROFS`. The
  broker instead creates a per-caller, `0700` directory (owned by the caller) and
  **binds it over the repository's `artifacts/`** inside the sandbox. The scripts
  keep writing to their normal path; the bytes land in the host evidence
  directory (a path selector, never a credential). The overlay is applied only
  when the broker is privileged and running on the peer's behalf
  (`cred_broker.py::_dispatch` passes `evidence_dir=default_evidence_dir(peer_uid)`
  iff it is dropping to the caller), and the destination must already exist in
  the read-only bind — a missing `artifacts/` is skipped rather than aborting
  bubblewrap. No environment variable is exported, so the overlay cannot leak
  into the repository's own unit-test subprocesses. Evidence writes remain
  **atomic** (temp file in the same directory + `os.replace`).

  The permission model is two-level, because the sandboxed caller must *reach*
  its leaf before it can write it: the per-caller leaf is `0700` (owner-only — no
  other identity can read the evidence), and the shared base
  `/run/company-os/evidence` is `0711` (execute-only — a caller may traverse the
  base to its own leaf but cannot list it or read another's evidence). The base
  bit matters: the broker unit sets `UMask=0077`, so a root `mkdir` of the base
  would otherwise leave it at `0700` and the caller would be locked out of its
own leaf — bubblewrap then fails closed with `Can't find source path
/run/company-os/evidence/<uid>: Permission denied`. `_prepare_handoff_dir`
therefore normalizes the base to `0711` on every privileged handoff.

The evidence location is `$COMPANY_OS_EVIDENCE_DIR` when set, else
`/run/company-os/evidence/<uid>` for a privileged broker (the broker unit's
`ReadWritePaths` is `/run/company-os`, so this is the only location it can write),
else the user state directory. Because `/run` is tmpfs, privileged evidence is
**ephemeral**; copy it to `artifacts/` on the host to keep a durable record.

**Approved durable export.** Moving privileged evidence into the tracked tree
is done with `tools/export_privileged_evidence.py`, never a manual `cp`:

    tools/export_privileged_evidence.py --source /run/company-os/evidence/1000
    tools/export_privileged_evidence.py --source ./artifacts gate-evidence.json

It writes to `evidence/runs/` under a name derived from the run's own
`finished_at`/`generated_at` (so a re-export is idempotent and can never
silently overwrite a *different* run), refuses any file whose bytes match a
secret shape (the same shapes `tests/test_security_phase8.py` enforces),
writes atomically with `0644`, and supports `--dry-run`. This is the single
sanctioned path from the tmpfs overlay to version control; it is covered by
`tests/test_export_privileged_evidence.py`.

- **Tool-state overlay (writable, scoped).** A Node.js tool treats its project
  root as writable: `wrangler@4` resolves its project root from `cwd` and keeps
  per-project state under `<root>/.wrangler` — the API cache
  (`<root>/.wrangler/cache`) *and* the deploy bundling tmp dir
  (`<root>/.wrangler/tmp`). Because the repository is bound read-only and
  `deploy-site.sh` runs `cd "$ROOT"`, any real `wrangler pages deploy` fails
  closed with `EROFS: read-only file system, open
  '/home/genie/company/.wrangler/…'` while writing there. wrangler's cache
  location is overridable (`WRANGLER_CACHE_DIR`), but the deploy tmp dir is
  **not** — it is always `<project root>/.wrangler/tmp` — so an env poke only
  papers over half the problem. The fix is the same shape as the evidence
  overlay: the broker creates a per-caller `0700` host directory and **binds it
  over the repository's `.wrangler/`**, so the cache, deploy-config and bundling
  tmp paths behave exactly as on the host. It is applied only when the Node
  runtime is bound (`resolve_node_prefix` is not `None`) *and* the broker is
  acting for a caller (`cred_broker.py::_dispatch` passes
  `state_dir=default_state_dir(peer_uid)` iff it is dropping to the caller), so
  non-Node commands keep the minimal sandbox. The base
  `/run/company-os/state` is normalized to `0711` exactly like the evidence base
  (same `_prepare_handoff_dir`), and no environment variable is exported. The
  location is `$COMPANY_OS_STATE_DIR` when set, else
  `/run/company-os/state/<uid>` for a privileged broker, else the user state
  directory. The `.wrangler/` directory is gitignored and host content there is
  hidden by the overlay (a fresh empty state per run) — wrangler only memoizes
  API responses there, so there is no correctness cost.


> **Activation note.** `credential_loader.py` is imported by the long-running
> broker process, so edits to it (or to the sandbox/evidence logic it owns) take
> effect only after `sudo systemctl restart company-os-credentials.service`.
> Until then the *running* broker keeps its already-imported code; the
> broker-mediated tests reflect the running broker, not the working tree.

**Capability difference through the broker.** `gitleaks` is *not* bound into the
sandbox (binds are kept minimal). `scripts/gates-phase8.sh` therefore takes its
documented degradation path inside the broker — `do_pass "secret hygiene"
"pattern scan clean (gitleaks unavailable)"` — rather than the gitleaks scan it
runs on the host. This is an honest, narrower check, not a weakened one: the
pattern scan still runs, and the full gitleaks scan still runs on the host and in
CI.

**Run budget (long operations through the broker).** Each sandboxed run is
bounded by a wall-clock budget, default **300s** (`DEFAULT_RUN_TIMEOUT`). A
documented long operation — a full `deploy-site.sh` (not `--build-only`), or a
gate that runs the whole test suite — sets `COMPANY_OS_CRED_RUN_TIMEOUT` (seconds)
on the wrapper; the value is carried in the broker request and forwarded to the
loader. It is a bounded resource knob, never a credential, and is clamped to
`MAX_RUN_TIMEOUT` (3600s) so no caller can pin a sandbox slot indefinitely. When
the budget is exceeded the run fails closed with
`credentialed command exceeded the <N>s run budget …` rather than an opaque
broker error. Example:

```
COMPANY_OS_CRED_RUN_TIMEOUT=1800 tools/secrets/cred_wrapper.sh posthog cloudflare -- ./scripts/gates-phase8.sh
```

## Verdict: only `PROTECTED` when the whole boundary is verified

`--check` does not report `PROTECTED` merely because the file is unreadable or a
unit is `active`. It runs the same `verify_boundary` checklist that `--apply`
uses as a postflight, and prints one of:

- `UNPROTECTED` — the invoking identity can read the secrets file.
- `PROTECTED` — the file is unreadable **and** every check below is verified.
- `BLOCKED` — the file is unreadable, but a check failed (`[FAIL]`) or could not
  be evaluated at the current privilege level (`[ ?? ]`). Unverified is not a
  pass. A ping-only gate previously reported a broken boundary `PROTECTED`, so
  the verdict is a conjunction over the whole boundary.

Checks (14): prerequisites (identity, group, `systemctl`, templates); broker
policy (the installed unit declares the allow-list, socket mode `0660`); home
traversal present; installed units match the repository templates; broker socket
active; broker reachable (readiness probe); the agent identity is authorized; a
harmless run succeeds end-to-end; responses conform to the wire schema; all three
services `active`; restart counters stable over a window; an unauthorized
identity is denied; state dirs exist and are owned by `company-os`; and no legacy
user units are active. Checks that genuinely need root report `[ ?? ]` when run
without it.

## Activation (requires root)

```
scripts/isolate-secrets.sh --check       # no root: report exposure
scripts/isolate-secrets.sh --dry-run     # no root: print the plan
sudo scripts/isolate-secrets.sh --apply  # root: install the broker and flip
sudo scripts/isolate-secrets.sh --rollback  # root: restore prior state
```

`--apply` is gap-free and fail-closed: it installs the broker units, enables and
**restarts** `company-os-credentials.{socket,service}`, and **waits until the
broker is verifiably usable** — socket active, readiness probe passing, **and a
real command run through the sandbox** (see *Readiness, not liveness*) — before
flipping the secrets file. If the broker is not usable it aborts without touching
the file, so the agent can never be left without a credential path. There is no
`--accept-broker-gap` shortcut (removed).

`--apply` is idempotent and safe to re-run. It uses `systemctl restart` (not
`enable --now`) so a broker already running a previous revision picks up the
current code — otherwise an already-running *fixed* broker would never take
effect on re-apply. Step [6/7] also `restart`s the migrated services and waits
for each to reach `active` with a **stable restart counter** (`NRestarts`), so a
fast crash-loop — which is briefly `active` between restarts, and which an
`is-active` sample would wrongly pass — is reported as a failed migration.

The pre-migration state is recorded to
`/var/lib/company-os/isolation-state.json`; every step is idempotent.

Step [6/7] also **migrates service state**: before migration the user units kept
their state under `~/company-os/state` (the control plane's `boundary-audit.jsonl`
and `health.json`, Bifrost's `config.db`), while the system units run from
`/var/lib/company-os`. `seed_service_state` copies it into the target — after the
user units are stopped, so the files are quiescent — and only when the target is
still empty, so a re-apply never clobbers live state. Without this the services
would silently start on empty state and orphan the existing data (including the
audit trail). The control plane's state location is now passed explicitly via
`--state /var/lib/company-os/control-plane` rather than inferred from
`Path.home()`.

## Follow-ups (tracked, not done here)

- Host-validate the broker service hardening before production activation
  (the `NoNewPrivileges`/capability set in `company-os-credentials.service` is a
  starting point, not a validated profile).
- **Least privilege per service (residual).** Each of the three service units
  receives the *entire* secrets file via `LoadCredential=`, so e.g. the
  nvidia-proxy carries the Cloudflare/PostHog/Langfuse keys it never uses. The
  agent-facing path is category-scoped by the broker, but the long-running
  services are not. Narrowing this needs per-service credential files (or a
  broker-assisted startup), which cannot be created or validated without root on
  the host.
- Relocate service-owned assets out of `/home/genie` (the bifrost binary and
  state) so the `company-os` identity can reach them without traversing the
  founder's home. Until then, the services need traversal of `/home/genie` (mode
  `0750`). This is granted as a single revocable `setfacl` ACE
  (`u:company-os:--x`) on each traversal directory lacking the other-execute
  bit — **traversal only** (not read, not list), removed again by `--rollback`.
  An earlier revision used `SupplementaryGroups=genie`, which was rejected as
  too broad: group membership also exposes every group-`genie`-readable file.
  The secrets file itself stays `root:root 0600`.
- `open (opencode-penpot-sync)` renders a Penpot MCP URL (containing a live
  session token) into `~/.config/opencode/penpot_mcp_url` (mode `0600`,
  `genie:genie`). OpenCode — running as `genie` — must read this value to open
  the Penpot MCP connection, so this one credential is **agent-consumable by
  architecture** and is deliberately outside the three-service boundary. It is a
  single, rotatable Penpot session token; no provider key is exposed this way,
  and the file is never committed. Two consequences, both handled:
  - **Refresh must run as root.** Once the boundary is active, `providers.env`
    is `root:root 0600`, so the sync's *user* unit can no longer read it.
    `scripts/install-opencode-penpot-sync.sh --system` installs a root system
    path unit that re-renders on secret rotation and hands the rendered files
    back to `genie` (`PENPOT_OWNER_UID/GID`); a `sudo` run uses `SUDO_UID/GID`.
  - **Unreadable secret fails clean.** `tools/opencode_penpot_sync.py` now exits
    `2` with an actionable message (never a traceback, never the token) when the
    secrets file is present but unreadable, so a broken refresh is loud instead
    of silently serving a stale token. See `docs/runbooks/opencode-penpot-mcp.md`.

## Current host state (2026-10-15)

**Status: `PROTECTED` (verified 2026-10-14; reconfirmed 2026-10-15).** The
boundary is active — the secrets file is `root:root 0600`, `genie` cannot read
it, and all three services run as `company-os` behind the credential broker. The
credential path reports `USABLE` (socket + readiness ping + end-to-end run probe
all pass). The four defects from the initial activation are fixed in this
repository (see §8.3-§8.4).

**Penpot sync (2026-10-15).** The `opencode-penpot-sync` system unit was
installed via `sudo scripts/install-opencode-penpot-sync.sh --system` and
verified operational:

- Unit file: `/etc/systemd/system/opencode-penpot-sync.service` — `Environment=`
  lines in `[Service]`, `Environment=HOME=/home/genie` pinned, `ExecStart` points
  to the venv python + sync tool.
- Path unit: `/etc/systemd/system/opencode-penpot-sync.path` —
  `PathChanged=/home/genie/company-os/secrets/providers.env` (queried with
  `HOME=/home/genie` at install time).
- `systemctl start opencode-penpot-sync.service` → exit 0, logs "already current
  — penpot endpoint rendered for OpenCode (secret not printed)".
- Rendered files: `~/.config/opencode/penpot_mcp_url` (mode `0600`,
  `genie:genie`), `~/.config/opencode/opencode.json` references
  `{file:~/.config/opencode/penpot_mcp_url}`.
- `systemd-analyze verify` clean on both units.
- Tests: `tests/test_opencode_penpot_sync.py` (36 tests) guards the render
  (`Environment` in `[Service]`, `HOME` pinned, `PathChanged` correct) and the
  owner handoff (`PENPOT_OWNER_UID/GID`, `SUDO_UID/GID`).

The unprivileged `--check` reports `VERDICT: BLOCKED — the secrets file is
protected, but the migration is NOT fully verified (two checks need root)`. This
is expected: the root-only checks (`bc_unauthorized_denied`,
`bc_state_dirs`) cannot run without root. The authoritative `PROTECTED` verdict
comes from the founder's root `--apply`/`--check` on 2026-10-14
(`checks=14 failures=0 unverified=0`).

## Verification

`tests/test_secrets_isolation_boundary.py` asserts the boundary against the
**live** property — the protected file exists and the invoking identity cannot
read it — and SKIPs with an explicit reason otherwise. It deliberately does not
consult a marker file: a stale marker would let a re-broken boundary report
green. (An earlier version gated one test on a marker that was never written,
which silently skipped the owner-identity assertion even on an activated host;
that gate is removed, so `test_owner_is_not_the_agent_identity_when_isolated`
now actually asserts `uid != getuid()`.)
`tests/test_systemd_units.py` statically guards the unit
content (unprivileged identity, `LoadCredential`, baseline hardening, the
broker's address-family set, and that **no** service unit declares
`SupplementaryGroups=genie`). `tests/test_cred_broker.py` exercises the broker
protocol, authorization, redaction and readiness probe against a synthetic
secrets file; its client writer tolerates a reply-and-close broker exactly like
the production client (a test-synchronization race that reproduced ~60% against
a reply-and-close server, fixed without weakening any assertion).
`tests/test_secrets_isolation.py` checks that a privileged broker drops to the
caller *before* bubblewrap and fails closed when it cannot prove the drop. It
also pins the sandbox's Node.js runtime, evidence overlay and tool-state overlay
(`BrokerSandboxRuntimeTests`): `default_evidence_dir` and `default_state_dir`
precedence; `_prepare_handoff_dir` best-effort creation plus its
base-traversability rule (each shared base widens to `0711` while the per-caller
leaf stays `0700`, and a base other than the broker bases is left untouched);
`resolve_node_prefix` honouring its disable switch and explicit override; that a
world-writable prefix, a `bin/node` that escapes the prefix, or a `bin`/`npm`
bind **source** that escapes it via a symlink is treated as **untrusted**; that
the built bubblewrap command binds the node `bin` read-only, overlays the
evidence directory onto the repository's `artifacts/`, sets `PATH`/`HOME`, and
never exports `COMPANY_OS_EVIDENCE_DIR`/`COMPANY_OS_STATE_DIR`; that a Node run
gets a writable overlay on the repository's `.wrangler/` which is **not**
emitted once the Node runtime is disabled; and an isolation-guarded end-to-end
run proving `node` executes and that both the evidence write and the
`.wrangler/` tool-state write land on the host while the repository's own
`artifacts/` and `.wrangler/` are untouched. `tests/test_cred_broker.py` asserts
`_dispatch` mounts evidence (and forwards the `.wrangler` state overlay) only
when running on a peer's
behalf. `tests/test_isolate_secrets_script.py` skips its ACL round-trip only
when the filesystem genuinely cannot store ACLs (`setfacl` `EINVAL`, e.g. the
sandbox's tmpfs `/tmp`).
`tests/test_isolate_secrets_script.py` proves the migration script resolves the
invoking user's path under `sudo`, that `--dry-run` mutates nothing, that the
readiness gate requires the end-to-end run probe, that the service health wait is
not fooled by a crash-loop, that the migration stops the *invoking user's* user
units, that it migrates the pre-migration service state atomically (staged then
moved), and that `--check` only reports `PROTECTED` behind the full
`verify_boundary` conjunction. Crucially, `HomeTraversalBehaviorTests` *runs*
`dir_lacks_other_execute` / `home_traversal_status` / `grant_home_traversal`
against real directories — static name-checks alone had let the broken
`mode % 10 & 1 == 0` precedence ship. `tests/test_systemd_units.py` also asserts
the control-plane gets a writable `HOME` and an explicit `--state` inside
`ReadWritePaths`. The OS-level isolation verdict is `PROTECTED` only when the
full 14-condition `verify_boundary` conjunction passes under root.
