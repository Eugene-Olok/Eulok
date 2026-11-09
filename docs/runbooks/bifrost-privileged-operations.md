# Runbook — Bifrost privileged operations (security boundary)

Status: **designed, tested, NOT installed.** Installing the dispatcher + sudoers
requires an explicit owner decision (see "Authorization boundary" below).

## Purpose

The live Bifrost store lives at `/var/lib/company-os/bifrost/data/` and is
owned `company-os:company-os` (`0600`), and the service is restarted with
`systemctl`. Reading the store, installing an additive seed, backing up and
rolling back therefore require privilege. This runbook describes the narrow,
auditable mechanism that lets the operator (or an agent acting for the
operator) perform exactly those operations **without ever handling the root
password**, and why it is safe.

## Trust model (read before approving)

A program that runs as root must execute **only code the unprivileged caller
cannot write**. The developer tree (`/home/genie/company`) and its virtualenv
are owned `genie:genie` and are writable by the caller, so executing them as
root would be a local privilege-escalation vector: an unprivileged process
could edit the module and have it run as root.

Therefore the privileged boundary is:

* `deploy/bifrost-ops/install.sh` copies the operations modules, the dispatcher
  and the seeds into **root-owned** locations:
  * `/usr/local/lib/company-os/bifrost-ops/` — modules + `seeds/` (root:root,
    `0644`, directory not group/world writable);
  * `/usr/local/sbin/company-os-bifrost-ops` — dispatcher (root:root `0755`);
  * `/etc/sudoers.d/company-os-bifrost-ops` — the narrow rule (root:root `0440`).
* The dispatcher runs a **fixed absolute interpreter** (`/usr/bin/python3`) in
  **isolated mode** (`-I`, which ignores `PYTHONPATH`/`PYTHONHOME`, the working
  directory and the user site dir) with a **cleared environment** (`env -i`,
  fixed `PATH`) — so no inherited variable can influence execution.
* The dispatcher **refuses to run if its own code directory is not root-owned
  and clean** (`_is_trusted_path`), so a partial or tampered install fails
  closed.
* The caller may supply **at most one token**, `step1` or `step2`; every path is
  a fixed constant. There is no argument passthrough.

## Effective sudoers privilege

```
genie ALL=(root) NOPASSWD: /usr/local/sbin/company-os-bifrost-ops inspect
genie ALL=(root) NOPASSWD: /usr/local/sbin/company-os-bifrost-ops status
genie ALL=(root) NOPASSWD: /usr/local/sbin/company-os-bifrost-ops backup
genie ALL=(root) NOPASSWD: /usr/local/sbin/company-os-bifrost-ops seed step1
genie ALL=(root) NOPASSWD: /usr/local/sbin/company-os-bifrost-ops seed step2
genie ALL=(root) NOPASSWD: /usr/local/sbin/company-os-bifrost-ops rollback
```

There is **no wildcard, no `""` passthrough, no `ALL`** command: sudo matches
each command line token-for-token, so the dispatcher can only ever receive the
six forms above. Removing the file revokes the privilege.

## Install

```bash
sudo deploy/bifrost-ops/install.sh     # verifies deploy/bifrost-ops/SHA256SUMS, installs root-owned, validates sudoers
```

Idempotent: re-running replaces the installed files. It fails closed on every
partial-installation path:

* it refuses (before writing anything) if any **source** file differs from
  `SHA256SUMS`;
* after copying, it **re-hashes the installed bytes** against the same manifest
  (closing the verify→copy race) and, on any mismatch, **removes the installed
  code** and exits non-zero;
* the sudoers rule is installed **last**, only after the code it authorizes is
  verified byte-for-byte — so a partial install never leaves an active
  root rule pointing at unverified code.

## Operations

| Command | Effect | Blast radius |
|---|---|---|
| `sudo company-os-bifrost-ops inspect` | read-only, sanitized live state (config.json presence/perms, providers, keys, governance keys, `enforce_auth_on_inference`) **plus rollback-anchor readiness** (`rollback.rollback_ready`: backup exists, manifest found, digest matches) | none |
| `sudo company-os-bifrost-ops status` | `systemctl is-active` + loopback `/health` | none |
| `sudo company-os-bifrost-ops backup` | consistent online snapshot + integrity + disposable restore-test + sanitized manifest, under a **unique** name (`config.db.<utc>-<pid>.bak` + sidecar manifest) | writes a new file under `/var/lib/company-os/backups/`; never collides with or rewrites the canonical anchor |
| `sudo company-os-bifrost-ops seed step1` | install the auth seed as `config.json`, restart the unit | **enables management auth** |
| `sudo company-os-bifrost-ops seed step2` | install the auth + six-provider seed, restart the unit | **adds providers** |
| `sudo company-os-bifrost-ops rollback` | restore the canonical pre-restore backup, remove `config.json` (originally absent), restart | reverts step1/step2 |

## Migration procedure (corrected sequence with checkpoints)

Run these in order, as `genie` (each is passwordless via the sudoers rule). Each
`seed` **restarts the unit automatically and synchronously** (`systemctl
restart`, no `--no-block`); there is **no automatic readiness gate**, so the
operator must perform the checkpoints between steps.

```bash
# 0. Install (root, once) — freezes code + sudoers.
sudo /home/genie/company/deploy/bifrost-ops/install.sh

# 1. PRE-FLIGHT (read-only). rollback.rollback_ready MUST be true before you
#    mutate anything; if false, STOP and fix the rollback anchor first.
sudo company-os-bifrost-ops inspect
sudo company-os-bifrost-ops status          # active + /health

# 2. Safety snapshot — creates a NEW uniquely-named backup; the canonical
#    anchor and its manifest are left untouched.
sudo company-os-bifrost-ops backup

# 3. Step 1: enable management auth (restarts the unit).
sudo company-os-bifrost-ops seed step1
# CHECKPOINT: wait for /health == 200, then confirm auth is enforced
#   (unauth GET /api/providers -> 401; correct Basic -> 200). See §"Verification".
sudo company-os-bifrost-ops status

# 4. Step 2: add the six providers (restarts the unit).
sudo company-os-bifrost-ops seed step2
# CHECKPOINT: wait for /health == 200, then confirm the inventory
#   (gemini, groq, openrouter, nvidia, zai, cloudflare added; mistral/openai kept).
sudo company-os-bifrost-ops inspect

# 5. If any checkpoint fails: restore the digest-verified anchor.
sudo company-os-bifrost-ops rollback
```

**Exit-status contract (from source, not invented).** `0` = success; `2` =
refused (bad/extra argument, unknown step, unverifiable rollback, missing
prerequisite); `3` = the underlying check failed (backup `ok=false`; rollback
result `ok=false`); `1` = a runtime failure surfaced cleanly (e.g. the
`systemctl` restart failed, or the seed write failed) — reported as a JSON
`{"error": ...}` on stderr, never a raw traceback.

## Failure modes and recovery

* **Seed rejected (literal secret)** — the ops module refuses a seed whose key
  or credential value is not an `env.<NAME>` reference, so a tampered seed never
  reaches the store. Nothing changes.
* **Restart fails** — `systemctl restart` is not `--no-block`; the unit's own
  `Restart=on-failure` re-attempts. If the service does not come up, run
  `sudo company-os-bifrost-ops rollback` (restores the pre-restore backup and
  removes `config.json`). The rollback preserves the current state first
  (`config.db.<ts>.pre-rollback` + sidecars) so it is itself reversible.
* **Backup target already exists** — the backup step refuses (exit 2) rather than
  overwriting the canonical pre-restore target, which may be owner-verified by
  digest. Use a distinct `--label` (the dispatcher does) or pass `--overwrite`.
* **Backup digest mismatch or missing manifest** — rollback compares the backup
  bytes to the sha256 recorded in its manifest (the dispatcher names the
  canonical manifest; the tool falls back to the backup's sidecar). It refuses
  (exit 2) on mismatch **and** when no manifest can be found at all, so a
  valid-but-substituted db is never silently restored. Confirm
  `inspect.rollback.rollback_ready == true` *before* migrating; if it is false,
  the anchor and its manifest must be reconciled first.
* **Stale WAL/SHM** — rollback removes `config.db-wal`/`-shm` before restoring
  so the restored db is not shadowed by stale pages.
* **Lost `config.json` state** — the live app-dir originally had no
  `config.json`; rollback recreates that exact state (`--original-config absent`).
* **Disaster** — the root-owned pre-restore backup
  (`/var/lib/company-os/backups/config.db.pre-restore.bak`, sha256
  `78b281f6cd624fcbb06cf7027b11d4dfcd0fe7cf3747b05ac1ae649a259c3871`) plus its
  sanitized manifest are the recovery point.

## Verification (deterministic)

* `tests/test_bifrost_ops_security.py` — trust predicate rejects caller-writable
  dirs; dispatcher pins the interpreter, uses `env -i` + `-I`, reads no
  environment override, refuses extra/unknown arguments; sudoers is the exact
  allowlist with no wildcard; the installer installs root-owned and verifies
  digests **and re-verifies the installed bytes after copying** (closing the
  verify→copy race) and fails closed by removing the code on mismatch, installing
  the sudoers rule only last; `SHA256SUMS` matches the reviewed bytes; the trust
  predicate rejects symlinks and a non-root-owned parent; the installed modules
  import only the standard library; the seeds carry env references only.
* `tests/test_bifrost_ops.py` — operations module behaviour (sandbox only).

### Positive auth check (root-only by design)

`providers.env` is `root:root 0600` inside a `genie`-owned directory, and the
service receives it through `LoadCredential=`. An unprivileged shell cannot
read it, and it must never be `source`d as root: the directory is caller-
writable, so sourcing would execute attacker-replaceable code. This check
parses only the two known keys and prints only the HTTP status; values never
reach argv, disk, or the terminal.

```bash
sudo /usr/bin/python3 - <<'PY'
import base64, os, stat, urllib.request, urllib.error
paths = ["/run/credentials/company-os-bifrost.service/providers.env",
         "/home/genie/company-os/secrets/providers.env"]
path = next(p for p in paths if os.path.exists(p))
st = os.lstat(path)
assert stat.S_ISREG(st.st_mode) and st.st_uid == 0, "refusing non-root regular file"
vals = {}
for line in open(path, encoding="utf-8"):
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    key, val = line.split("=", 1)
    key = key.strip().removeprefix("export ").strip()
    if val[:1] == val[-1:] and val[:1] in "\"'":
        val = val[1:-1]
    vals[key] = val
creds = f'{vals["BIFROST_ADMIN_USERNAME"]}:{vals["BIFROST_ADMIN_PASSWORD"]}'
req = urllib.request.Request(
    "http://127.0.0.1:8080/api/config",
    headers={"Authorization": "Basic " + base64.b64encode(creds.encode()).decode()})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        print("PASS", response.status)
except urllib.error.HTTPError as exc:
    print("FAIL", exc.code)
PY
```

Expected `PASS 200`. A `401` here means the credential values in the file and
the ones the running service loaded disagree (re-seed step 1, then retest).

## Authorization boundary

Installing the dispatcher + sudoers, enabling live authentication, installing a
seed into the live store, and restarting `company-os-bifrost.service` are
**production mutations** and require a separate, explicit owner decision after
the evidence is reviewed. Until then the safe path is the owner running the
operations directly (as already done for the backup).

## Limitations

* The mechanism grants the operator root for exactly these operations; it does
  not sandbox the root process beyond not trusting its input. A compromised
  root-owned module or interpreter is out of scope (that is root already).
* `inspect`/`backup` read the whole store; their output is sanitized (names /
  status only, never a credential value), but it is still INTERNAL-classified.
* No automatic post-seed inference check is bundled here: `verify` needs the
  admin credential and is intentionally kept out of the root path (the operator
  runs `tools/bifrost_restore_config.py verify` with the credential in their own
  environment).

## Installed state (verified 2026-10-19)

Installation of the reviewed boundary is **complete and verified**:
`/usr/local/lib/company-os/bifrost-ops/` (modules + `seeds/`), the dispatcher
`/usr/local/sbin/company-os-bifrost-ops`, and
`/etc/sudoers.d/company-os-bifrost-ops` — all root-owned, digest-verified, and
the six passwordless invocations are effective. The installer did not restart
the unit (`ExecMainStartTimestamp` unchanged, `NRestarts=0`).

### Rollback anchor prerequisite — RESOLVED 2026-10-19

Recorded here because it is the failure mode to check after every install:
`rollback_ready: false` means the **canonical manifest does not exist** and
rollback will refuse. It was remediated on 2026-10-19 and now reads `true`
(manifest installed `root:root 0644`, sha256 `a6945f67…c7b5`, live backup digest
`78b281f6…c3871` verified by `inspect`). Evidence:
`evidence/runs/bifrost-installation-2026-10-19.json`.

```
/var/lib/company-os/backups/bifrost-pre-restore.manifest.json   -> missing
/var/lib/company-os/backups/config.db.pre-restore.bak           -> present
```

The backup bytes themselves are fine; only the manifest that pins their digest
was written to the repo (`evidence/runs/bifrost-live-pre-restore-manifest-2026-10-18.json`)
instead of the canonical path. Because rollback's digest check is
unconditional, `rollback` will **refuse** until the manifest is in place.

**Do not migrate unless `rollback_ready` is true.** If it is false, the
remediation installs the reviewed manifest at the canonical path as root. Its recorded backup digest,
`78b281f6cd624fcbb06cf7027b11d4dfcd0fe7cf3747b05ac1ae649a259c3871`, matches the
owner-verified backup.

Run each command as **one line**. Do not use `\` continuations — some shells
mangle a pasted `\`+newline into a literal space, which turns the source path
into `' '` and makes `install` fail with `cannot stat ' '`.

Pre-check (unprivileged) — expect
`a6945f67eb67afd4ad4d16f24f2e9da26422d4b1691cd929b32c3a1a82c6c7b5`:

```bash
sha256sum /home/genie/company/evidence/runs/bifrost-live-pre-restore-manifest-2026-10-18.json
```

Confirm the canonical manifest is absent before writing (if it exists, **stop
and investigate** — do not overwrite a different manifest):

```bash
sudo test -e /var/lib/company-os/backups/bifrost-pre-restore.manifest.json && echo EXISTS_STOP || echo ABSENT_OK
```

Install (root), then prove the installed bytes:

```bash
sudo install -o root -g root -m 0644 /home/genie/company/evidence/runs/bifrost-live-pre-restore-manifest-2026-10-18.json /var/lib/company-os/backups/bifrost-pre-restore.manifest.json
```

```bash
sudo sha256sum /var/lib/company-os/backups/bifrost-pre-restore.manifest.json
```

Require `rollback.manifest_found: true`, `digest_matches_manifest: true`,
`rollback_ready: true`:

```bash
sudo company-os-bifrost-ops inspect
```

A `digest_matches_manifest: false` here is a **real stop**: it means the live
backup no longer matches the owner-verified anchor. Investigate the backup; do
not migrate.

### Migration preflight — value-free credential inventory

The installed seeds reference environment variables (`env.NAME`), resolved by the
unit's `ExecStart` (`set -a; source "$CREDENTIALS_DIRECTORY/providers.env"`).
A missing or empty name does **not** fail `seed` — Bifrost accepts the additive
config write — but that provider then fails at request time. Check before
migrating.

`providers.env` is `root:root 0600`, so this must run under `sudo`. It prints
**names only, never values**:

```bash
sudo cut -d= -f1 /home/genie/company-os/secrets/providers.env | sed 's/^[[:space:]]*//; s/^export[[:space:]]*//; s/[[:space:]]*$//' | grep -E '^[A-Za-z_][A-Za-z0-9_]*$' | sort -u
```

Required names — step1: `BIFROST_ADMIN_USERNAME`, `BIFROST_ADMIN_PASSWORD`.
step2 adds: `CLOUDFLARE_API_TOKEN`, `GOOGLE_API_KEY`, `GROQ_API_KEY`,
`MISTRAL_API_KEY`, `NVIDIA_API_KEY`, `OPENROUTER_API_KEY`, `ZAI_API_KEY`.
Runtime (encrypted live rows): `BIFROST_ENCRYPTION_KEY`.

Do not migrate if any required name is absent. Do not print, copy, or paste
values. A missing key is a credential-provisioning decision for the founder, not
something to infer or fabricate.

## Provider verification matrix (verified 2026-10-19)

All six restored providers were exercised end-to-end through
`POST /v1/chat/completions` on the live gateway. Use these IDs as the known-good
set; model names move, so re-run this matrix after any provider or credential
change.

| Provider | Verified model | Observed |
| --- | --- | --- |
| gemini | `gemini/gemini-flash-latest` | `200` |
| groq | `groq/openai/gpt-oss-20b` | `200` |
| mistral | `mistral/open-mistral-nemo` (`mistral/mistral-tiny` also `200`) | `200` |
| nvidia | `nvidia/nvidia/nemotron-3.5-lightning-30b-a3b`, `nvidia/nvidia/nemotron-3-super-120b-a12b` | `200` |
| zai | `zai/glm-4.5-flash` | `200` |
| cloudflare | `cloudflare/@cf/openai/gpt-oss-120b` | `200` |

Known account-level constraints (not configuration defects):

- `openrouter` returns `403 Key limit exceeded (total limit)`. Raise or rotate
  the key's limit; no repo change can fix this.
- `mistral/mistral-small-latest` returns `429 Rate limit exceeded` on the free
  tier while other Mistral models succeed.
- `zai/glm-4.6` returns `429 Insufficient balance or no resource package`.

NVIDIA model IDs churn. The compatibility proxy now serves a read-only
`GET /v1/models` pass-through, and step 2 sets
`custom_provider_config.allowed_requests.list_models = true`, so the gateway
catalog lists the live NVIDIA set (81 models at verification) instead of falling
back to the static datasheet. If NVIDIA retires a model, `410 Gone` from the
proxy means the ID is gone upstream, not that the key or wiring is wrong.

Re-verify:

```bash
curl -s http://127.0.0.1:8080/v1/models | jq -r '.data[].id' | cut -d/ -f1 | sort | uniq -c
curl -s http://127.0.0.1:8080/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"nvidia/nvidia/nemotron-3.5-lightning-30b-a3b","messages":[{"role":"user","content":"Answer with exactly: ok"}],"max_tokens":256}'
```

The NVIDIA proxy reads `company_os/adapters/nvidia_compat_proxy.py` directly
from the repository, so adapter changes take effect on
`sudo systemctl restart company-os-nvidia-proxy.service` — not on
`install.sh`.
