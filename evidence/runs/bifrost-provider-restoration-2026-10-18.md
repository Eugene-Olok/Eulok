# Bifrost Provider Restoration Assessment — 2026-10-18

- **Author:** opencode (principal-engineer certification pass)
- **Scope:** read-only. No configuration, ownership, permission or service change was made.
- **Branch/HEAD at capture:** `fix/business-evidence-placeholder-guard` @ `32ea127`
- **Classification:** INTERNAL. Contains no secret values (names only).

This is a forensic assessment of why the running Bifrost gateway exposes only one
provider, and the smallest safe change that would restore the intended free-provider
path. **Nothing in this document has been applied.** Applying it requires root and a
separate explicit authorization.

---

## 1. Current observed Bifrost inventory

Runtime query (read-only):

```
GET http://127.0.0.1:8080/api/providers
→ {"providers":[{"name":"mistral", ... "provider_status":"active", "status":"unknown"}], "total":1}
```

- **Exactly one provider is registered: `mistral`.**
- Its `provider_status` is `active` but instance `status` is `unknown`.
- Journal shows repeated, sanitized warnings for mistral only:
  `unfiltered/filtered list-models failed for provider mistral ...: network error ...
  falling back onto the static datasheet` — i.e. the gateway currently cannot reach
  the mistral API either. No other provider appears anywhere in the journal.

Live process:

```
PID 1280  /home/genie/.cache/bifrost/v2.2.3/bin/bifrost-http-0 \
          -app-dir /var/lib/company-os/bifrost/data -host 127.0.0.1 -port 8080
```

## 2. Intended provider set (from the repository)

`config/model-compat.yaml` `transports`:

| transport | provider |
| --- | --- |
| `google_free` | gemini |
| `groq` | groq |
| `nim` | nvidia |
| `zai` | zai |
| `openrouter_free` | openrouter |
| `cloudflare` | cloudflare |
| `mistral` | mistral |
| `local` | local |

`config/provider-policy.yaml` `free_providers` = `[google_free, groq, nim, zai,
openrouter_free, cloudflare]`. The runbook names the same set (Gemini, Groq, NVIDIA,
Z.AI, OpenRouter, Cloudflare, Mistral).

Known model identifiers (examples, from `model-compat.yaml` aliases):
`gemini-3.6-flash`, `gemini-3.8-flash`, `qwen/qwen3.8-27b`,
`openai/gpt-oss-20b`, `nvidia/nemotron-3-super-120b-a12b`,
`@cf/openai/gpt-oss-120b` (Cloudflare).

## 3. Provider definitions found on disk

A **readable reference copy** exists at the pre-migration data directory:

`/home/genie/company-os/state/bifrost/data/config.json` (genie-owned, 2026-09-28).

Top-level keys: `$schema`, `client`, `config_store`, `encryption_key`, `governance`,
`providers`. `providers` is an **object keyed by provider name**. Exact structure
(extracted with literal secrets suppressed; only `env.<NAME>` references shown):

| provider key | `keys[].name` | `keys[].value` | `models` |
| --- | --- | --- | --- |
| `gemini` | `google-ai-studio-primary` | `env.GOOGLE_API_KEY` | `null` (unrestricted) |
| `groq` | `groq-primary` | `env.GROQ_API_KEY` | `null` |
| `openrouter` | `openrouter-primary` | `env.OPENROUTER_API_KEY` | `null` |
| `mistral` | `mistral-primary` | `env.MISTRAL_API_KEY` | `null` |
| `nvidia` | `nvidia-primary` | `env.NVIDIA_API_KEY` | `null` |
| `zai` | `zai-primary` | `env.ZAI_API_KEY` | `null` |
| `cloudflare` | `cloudflare-primary` | `env.CLOUDFLARE_API_TOKEN` | `null` |

(The `@cf/openai/gpt-oss-120b` identifier earlier attributed to the store is in fact
a repo-side `model-compat.yaml` alias; the store itself sets `models: null`, i.e. no
provider-side model filter. Corrected for accuracy.)

The same config declares `encryption_key` and `config_store`, meaning the
**authoritative provider store is the encrypted `config.db`**, not `config.json`
(which acts as bootstrap/seed). The live store lives under the root-only app-dir
and could not be read.

## 4. Required environment-variable names (presence only — values never read)

All are present in the credential store (`cred_broker.py check --socket ...`,
names + SET only):

`GOOGLE_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `MISTRAL_API_KEY`,
`NVIDIA_API_KEY`, `ZAI_API_KEY`, `CLOUDFLARE_API_TOKEN`, `BIFROST_ENCRYPTION_KEY`.

## 5. Ownership / permission metadata

| Path | Owner:Group | Mode | Readable by agent |
| --- | --- | --- | --- |
| `/home/genie/company-os/secrets/providers.env` | `root:root` | `0600` | no |
| `/var/lib/company-os` | `company-os:company-os` | `0750` | no |
| `/var/lib/company-os/bifrost` | — | — | no (permission denied) |
| `/etc/systemd/system/company-os-bifrost.service` | `root:root` | `0644` | yes |

Service: `company-os-bifrost.service`, `User=company-os`,
`LoadCredential=providers.env:/home/genie/company-os/secrets/providers.env`,
`ExecStart=... source "$CREDENTIALS_DIRECTORY/providers.env" ... -app-dir
/var/lib/company-os/bifrost/data ...`.

## 6. Diagnosis

**Confirmed (evidence-backed):**

1. The repository intends **7 providers** (6 free + mistral); the runtime exposes
   **1** (mistral). This is a **live configuration drift**.
2. All provider **credentials are present**; the gap is **not** a missing key.
3. The provider **definitions and env-var names are known and correct** (readable
   reference config + repo policy agree).
4. The live authoritative store (encrypted `config.db` under the root-only
   app-dir) contains only mistral — inferred from `/api/providers` and the journal,
   which mention no other provider.

**Leading root-cause hypothesis (requires root to confirm):** the systemd
migration (`scripts/isolate-secrets.sh`) repointed Bifrost's `-app-dir` from the
old user-unit data directory (`~/company-os/state/bifrost/data`, which still holds
the 7-provider `config.json`/`config.db`) to the new system path
`/var/lib/company-os/bifrost/data`, **without migrating the config store**. The new
store was then initialized with only the mistral provider. Timing is consistent:
the installed unit is dated 2026-10-14 18:45; the old `config.db` was last written
2026-10-14 16:20. No bind-mount links the two directories (verified via
`/proc/mounts`).

**Unresolved uncertainty:** the exact content of the live encrypted store cannot be
read at agent privilege, so we cannot yet see whether the other providers were
dropped at migration, disabled later, or never seeded. Confirming requires a root
read of `/var/lib/company-os/bifrost/data/`.

## 7. Proposed exact restoration (NOT applied)

Goal: make the **live** store expose the same 7 providers as the known-good
reference, with **no routing-policy change** (`config/models.yaml`,
`config/provider-policy.yaml`, `config/model-compat.yaml` already match the
intended set and must not be touched).

### Exact required end-state (the `providers` object)

```json
"providers": {
  "gemini":     {"keys": [{"name": "google-ai-studio-primary", "value": "env.GOOGLE_API_KEY"}]},
  "groq":       {"keys": [{"name": "groq-primary",  "value": "env.GROQ_API_KEY"}]},
  "openrouter": {"keys": [{"name": "openrouter-primary", "value": "env.OPENROUTER_API_KEY"}]},
  "mistral":    {"keys": [{"name": "mistral-primary", "value": "env.MISTRAL_API_KEY"}]},
  "nvidia":     {"keys": [{"name": "nvidia-primary", "value": "env.NVIDIA_API_KEY"}]},
  "zai":        {"keys": [{"name": "zai-primary", "value": "env.ZAI_API_KEY"}]},
  "cloudflare": {"keys": [{"name": "cloudflare-primary", "value": "env.CLOUDFLARE_API_TOKEN"}]}
}
```

`mistral` already exists live; the delta is the other **six**. Each value is an
`env.<NAME>` **reference**, resolved at runtime from the `providers.env` delivered
by systemd `LoadCredential` — the store must contain the reference, never the
literal key.

### Path A (preferred) — re-seed the live encrypted store from the known-good reference

Run as root. Sequence (exact; adjust only the timestamp token):

```bash
set -Eeuo pipefail
LIVE=/var/lib/company-os/bifrost/data
REF=/home/genie/company-os/state/bifrost/data
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

# 0. inventory BEFORE (record evidence)
curl -s -m5 http://127.0.0.1:8080/api/providers | tee /root/bifrost-providers-before-$STAMP.json

# 1. quiesce + backup (preserve original bytes; auditable)
systemctl stop company-os-bifrost.service
install -d -m 0700 /root/bifrost-backup
cp -a "$LIVE/config.db"   "/root/bifrost-backup/config.db.$STAMP.bak"
cp -a "$LIVE/config.json" "/root/bifrost-backup/config.json.$STAMP.bak" 2>/dev/null || true
sha256sum /root/bifrost-backup/*.$STAMP.bak | tee /root/bifrost-backup/SHA256SUMS.$STAMP

# 2. re-seed provider config from the known-good reference, preserving the
#    LIVE encryption_key so the existing store stays decryptable. Only the
#    `providers` object is taken from REF; `encryption_key`/`config_store` are
#    kept from LIVE (do NOT copy the reference encryption_key over the live one).
#    (Merge is done by the operator's exact tool of choice; the invariant is:
#     providers := REF.providers ; encryption_key := LIVE.encryption_key.)
#    If the live store is config.db-backed, re-apply providers via the store's
#    own writer so the DB is rewritten consistently, not by copying a JSON file
#    over a DB.

# 3. restore ownership/perms (never loosen)
chown company-os:company-os "$LIVE/config.db" "$LIVE/config.json" 2>/dev/null || true
chmod 0600 "$LIVE/config.db"; chmod 0600 "$LIVE/config.json" 2>/dev/null || true

# 4. start
systemctl start company-os-bifrost.service
```

The operator must **not** `cp` the reference `config.json` wholesale over the live
one, because that would overwrite the live `encryption_key` and make the live
`config.db` undecryptable. The invariant is *merge providers, preserve live key*.

### Path B (fallback) — Bifrost admin API

Add each of the six providers through the gateway's own admin/config API with
`keys[].value = env.<NAME>` and no model filter. **Currently unavailable:** the
credential store holds no `BIFROST_ADMIN_*` credential (only
`BIFROST_ENCRYPTION_KEY`), so this path first requires provisioning an admin
credential — itself a founder decision. The exact endpoint set must be taken from
the installed Bifrost v2.2.3 admin route documentation; it is not asserted here
because it has not been verified against the running build.

### Not to be changed

No provider is added to or removed from `config/models.yaml` or
`config/provider-policy.yaml`; the intended set already matches the repo.

## 7c. Security implications

- **No secret is placed in the store or in git.** Provider values remain
  `env.<NAME>` references; the literal keys stay only in the root-only
  `providers.env` delivered via systemd `LoadCredential`. The merge must not
  inline any literal key.
- **Encryption key continuity.** Overwriting the live `encryption_key` with the
  reference one would render the live `config.db` unreadable and could strand
  data. Path A explicitly preserves the live key.
- **Confidentiality policy is unchanged and still enforced at the boundary.**
  Adding free providers re-enables *free* routes only; `provider-policy.yaml`
  (`confidential_allow_providers: [local]`) still forbids confidential client
  data from reaching free providers. This change does not widen the trust
  boundary.
- **Least privilege on the store.** The store stays `company-os:company-os` `0600`
  under a `0750` parent; the change must not loosen ownership or mode.
- **Auditability.** Backups are timestamped, checksummed, and retained; before/after
  `/api/providers` inventory is captured. Any change is therefore reversible and
  reviewable.
- **Blast radius.** The change is confined to the Bifrost provider registry; it
  does not alter the systemd unit, the credential file, routing policy, or any
  other service.

## 8. Preflight validation (no secret values revealed)

```bash
# names + SET/MISSING only
.venv/bin/python tools/secrets/cred_broker.py check --socket /run/company-os/cred-broker.sock \
  | grep -E '^(google|groq|openrouter|nvidia|zai|cloudflare|mistral)\.'
# current inventory
curl -s -m5 http://127.0.0.1:8080/api/providers
```

## 9. Post-change verification

1. `curl -s http://127.0.0.1:8080/api/providers` → `total: 7`.
2. `.venv/bin/python tools/control_plane_live_smoke.py` → `verdict: pass`, exit 0.
3. Confirm the boundary still echoes only logical roles (`/v1/models` = 9 roles).
4. Re-run the deterministic gate for a fresh release-eligibility verdict.

## 10. Expected behavior matrix after restoration

| Condition | Expected |
| --- | --- |
| Valid credentials, provider healthy | request routed; physical model never disclosed to client |
| Missing credential for a provider | that provider dropped/unavailable; fail closed, other routes unaffected |
| Provider outage / timeout | classified failure; bounded fallback advances in declared order; no silent paid substitution |
| Rate limit (429) | surfaced/classified; not reported as success |
| Malformed provider response | classified as failure at the boundary |
| Policy denial (confidential/restricted lane) | denied fail-closed; free providers never receive confidential data |

## 11. Rollback

Before any change, back up `/var/lib/company-os/bifrost/data/config.db` (and
`config.json`). Rollback = stop `company-os-bifrost.service`, restore the backup,
restart. The migration created timestamped backups of the old store
(`config.db.backup-*`), demonstrating the established rollback convention.

## 12. Prerequisites and authorization

- **Root** to read/repair `/var/lib/company-os/bifrost/data/`.
- **Authorization** for a production configuration change and a service restart.
- Bifrost **admin credentials** if the admin API path is used
  (`BIFROST_ADMIN_*` were not present in the credential store; only
  `BIFROST_ENCRYPTION_KEY` was).
- A separate explicit approval for the change and its rollback plan.

Until the live provider path is restored, end-to-end inference for the free-routed
roles is **BLOCKED**, not failed and not proven.

---

# ADDENDUM — Exact-version closed-loop findings (2026-10-18, later pass)

Re-captured on branch `fix/business-evidence-placeholder-guard` @ `fbed5fd`.
All read-only or disposable-store. **No live change applied.** Evidence:
`evidence/runs/bifrost-api-contract-2026-10-18.json`.

## 13. Corrections to §3/§6 (earlier claims that are now superseded)

The earlier §3 conclusion ("authoritative store is the encrypted `config.db`") is
**confirmed**, but one earlier experiment (a claim that `config.json` is entirely
inert after first boot) was **confounded and is corrected here**. The confounding
cause is itself a finding:

- **Path semantics.** Bifrost resolves `config_store.config.path = "./config.db"`
  relative to the **process CWD**, not `-app-dir`. The live unit sets
  `WorkingDirectory=/var/lib/company-os/bifrost/data`, so they coincide live. An
  earlier disposable run was launched from a different CWD and therefore wrote its
  store elsewhere; the resulting "seed-only" conclusion was invalid.

A second, separate hygiene incident was found and remediated: the confounded run
created `config.db`, `config.db-shm`, `config.db-wal` in the **repository root**
(CWD). `config.db` is gitignored; the WAL/SHM were untracked. All three were
verified unused by any process and removed; `git status` is clean again.

## 14. Root cause of the live provider loss (exact-version evidence)

From the live service journal at its start (2026-10-18 11:21:31):

```
config file not found at path: /var/lib/company-os/bifrost/data/config.json, initializing with default values
config store initialized (default SQLite)
No admin account is configured for this Bifrost instance yet, and no setup token is configured.
```

**The live app-dir contains no `config.json` at all.** Bifrost therefore created
the SQLite store from **defaults**, and the only provider present (`mistral`, key
`MISTRAL_API_KEY_auto_detected`) was auto-detected from the `MISTRAL_API_KEY`
environment variable delivered by systemd `LoadCredential`. The reference store's
other providers were **never seeded** into the new app-dir. This is consistent with
§6's migration hypothesis and is now **evidence-confirmed** rather than inferred.

## 15. Installed-version behaviour that governs the fix (v2.2.3)

| Behaviour | Result (disposable store) | Status |
| --- | --- | --- |
| Missing store + `config.json` present | seeded with exactly the config.json providers | PASS |
| Existing store + provider added to `config.json` + restart | provider **added** | PASS |
| Existing store + provider removed from `config.json` + restart | provider **NOT** removed | PASS |
| `governance.auth_config.is_enabled=true` | management API `401` | PASS |
| `governance.auth_config.is_enabled=false` | management API `200` incl. **writes** | PASS |

Consequences:

1. **`config.json` is an additive seed**, applied on every start (adds missing,
   never deletes). It is not inert after first boot (correcting the earlier claim).
2. **Authentication is controlled solely by `config.json` `governance.auth_config`.**
   With no `config.json`, auth is off and the management API is **fully
   unauthenticated — reads and mutations — on 127.0.0.1**. This is a live
   least-privilege finding: any local process can add/remove providers or keys.

## 16. Management API write contract (exact, validated)

```
POST /api/providers                {"provider": "<id>"}                  -> 200   (400 if "provider" missing)
POST /api/providers                {"provider": "<existing>"}            -> 409   "Provider <id> already exists"
POST /api/providers/<id>/keys      {"name","value":"env.<NAME>","models":["*"],"weight":1} -> 200
POST /api/providers/<id>/keys      (repeat identical)                    -> 409   "API key names must be unique across providers."
POST /api/providers/<id>/keys      {"value":"<literal>"}                 -> 200   (channel does NOT reject literals - caller must pass env refs)
```

- Key `value` is stored as the `env.<NAME>` **reference**, never the secret
  (`encryption_status=plain_text`); the secret never enters the store.
- Duplicate provider/key return `409` — safe, but a retry must treat `409` as
  *already-exists*, not failure (no blind retry loop).

## 17. Security remediation (exact minimal change — NOT applied)

Root cause: **no `config.json`** in the live app-dir. Minimal supported fix:

1. Create `/var/lib/company-os/bifrost/data/config.json` (owner/group
   `company-os:company-os`, mode `0600`) containing **only** governance auth
   config (no providers - keep the change minimal):
   ```json
   {"$schema":"<same $schema as reference>",
    "governance":{"auth_config":{
      "is_enabled": true,
      "admin_username": "env.BIFROST_ADMIN_USERNAME",
      "admin_password": "env.BIFROST_ADMIN_PASSWORD",
      "disable_auth_on_inference": true}}}
   ```
2. Add `BIFROST_ADMIN_USERNAME` and `BIFROST_ADMIN_PASSWORD` to
   `/home/genie/company-os/secrets/providers.env` (root `0600`). Password chosen by
   the owner in their own terminal; **never** pasted into chat.
3. `systemctl restart company-os-bifrost.service`.
4. Verify: unauthenticated `GET /api/providers` -> `401`; authorized admin request
   -> `200`; inference path unaffected (`disable_auth_on_inference=true`).

**Impact / blast radius:** adds one config file + two secret entries + a restart.
Does not alter the store, routing policy, or any other service. `disable_auth_on_inference`
keeps the inference path open to clients.

**Recovery:** delete the wrong `config.json` (or set `is_enabled=false`) and restart
-> auth returns to disabled. No store data is modified by this step.

**Checkpoint:** this is a material production configuration change plus new-secret
provisioning; it requires the owner's approval and a root terminal. Per the approved
execution order it gates live provider writes.

## 18. Corrected migration procedure (management API — NOT applied)

Order issues the earlier Path A did not cover: (a) the live app-dir has no
`config.json`, so there is nothing to "merge"; (b) writing a live `config.json` with
providers would also add them (additive seed) - but that couples two changes;
(c) the JSON-file route cannot express per-key `models`/`weight` as precisely as the
API. The **approved management-API route** is therefore the primary method:

```
for p in gemini groq openrouter nvidia zai cloudflare; do
  POST /api/providers            {"provider":"$p"}                       # 200 new | 409 exists
  POST /api/providers/$p/keys    {"name":"<ref-name>","value":"env.<VAR>","models":["*"],"weight":1}
done
```

with the fixed mapping: gemini->`env.GOOGLE_API_KEY` (name `google-ai-studio-primary`),
groq->`env.GROQ_API_KEY`, openrouter->`env.OPENROUTER_API_KEY`,
nvidia->`env.NVIDIA_API_KEY`, zai->`env.ZAI_API_KEY`,
cloudflare->`env.CLOUDFLARE_API_TOKEN`. `mistral` is preserved untouched.
`openai` and the reference `*_auto_detected` duplicates are **excluded**.

## 19. Required backup before any live write (NOT applied — needs root)

The API exposes **no** export/backup route (all such paths return the SPA). A
verified backup therefore requires a root read of the live store:

```
sudo systemctl stop company-os-bifrost.service
sudo sqlite3 /var/lib/company-os/bifrost/data/config.db ".backup '/root/bifrost-backup/config.db.<STAMP>'"
sudo sha256sum /root/bifrost-backup/config.db.<STAMP>
sudo sqlite3 '/root/bifrost-backup/config.db.<STAMP>' 'PRAGMA integrity_check;'   # expect: ok
sudo systemctl start company-os-bifrost.service
```

The backup must be integrity-checked and restored to a **disposable** path to prove
restorability before the live write (see execution order Phase 2).

## 20. Mandatory checkpoint — decisions required

Live writes are gated (Phase 2 backup requires root; Phase 1 auth remediation is a
material production change). The following require the owner:

1. **Root terminal** for: live store inspection, Phase 2 backup, and any config change.
2. **Auth remediation approval + admin credentials** (owner-entered; not in chat).
   Decision needed: enable management-API auth (create live `config.json` + admin
   creds + restart), and whether to do that **before** or **after** the six-provider
   migration (auth-on locks the currently-open write path).
3. **Sequencing confirmation** for: backup -> migrate (six providers) -> verify ->
   enable auth -> re-verify.

Until then the provider path remains **BLOCKED** (not failed, not proven). No live
mutation has been performed.

## 21. The management API CANNOT restore all six providers (supersedes §16/§18 primary method)

Exact-version probe of the running v2.2.3 instance (disposable store, auth off):
provider creation (`POST /api/providers`) returns 200 for **every** attempted id, but
**key creation** (`POST /api/providers/<id>/keys` -> `env.PROBE`) succeeds only for
ids in the API's internal provider registry:

| provider id  | provider-create | key-create |
|--------------|-----------------|------------|
| gemini       | 200             | **200**    |
| groq         | 200             | **200**    |
| openrouter   | 200             | **200**    |
| mistral      | 409 (exists)    | **200**    |
| nvidia       | 200             | **500** `unsupported provider: nvidia` |
| zai          | 200             | **500** `unsupported provider: zai`    |
| cloudflare   | 200             | **500** `unsupported provider: cloudflare` |

The error is `failed to create provider for the given key: unsupported provider: <id>` -
the store accepts the name, but no key can be bound, so the provider is unusable. The
**approved API-only method is therefore insufficient**: it can add 3 of 6 providers and
cannot add `nvidia`, `zai`, or `cloudflare`. (Probe: `/tmp/opencode/bifrost-lab/probe_ids.py`.)

## 22. Corrected, validated restoration method — config.json additive seed (replaces §18)

Root cause is that the live app-dir has **no `config.json`** (§14), so the store came up
from defaults. Bifrost reconciles providers **from `config.json` on every start,
additively** (§15): providers present there and missing from the store are added; existing
ones are never removed. This route accepts the full six, including the three the API
rejects.

**End-to-end validation on a disposable store that mirrors live (mistral only):**

```
pre :  providers=[mistral]                keys=[mistral-primary]
apply: add six providers + keys to config.json (additive), restart
post:  providers=[cloudflare, gemini, groq, mistral, nvidia, openrouter, zai]
       keys=[cloudflare-primary, google-ai-studio-primary, groq-primary,
             mistral-primary, nvidia-primary, openrouter-primary, zai-primary]
       RESULT providers_ok: True  keys_ok: True
```

(Tests: `/tmp/opencode/bifrost-lab/test_seed_restore.py`; tool E2E `/tmp/opencode/bifrost-lab/test_tool2.py` -> `FINAL rc: 0`.)

**Tool:** `tools/bifrost_restore_config.py`
- `plan`   - additive delta only (no write); `openai` and `*_auto_detected` excluded.
- `render --out <path> [--existing <path>]` - emits the exact `config.json`; preserves an
  existing file's unrelated top-level keys; excludes `openai`.
- `verify --base-url http://127.0.0.1:8080` - asserts the six providers **and** their keys
  are present (exit 3 otherwise).

All key values are `env.<NAME>` **references**; no credential is written or emitted.
`mistral` is preserved untouched. The change is additive and reversible (restore/remove
`config.json`, restart).

**Consequence for §20:** the method is now the `config.json` additive seed, not the
management API. This remains a live production config change (creating
`/var/lib/company-os/bifrost/data/config.json` + restart) and is subject to the same
Phase 1-2 auth checkpoint and root requirement. `encryption_key` is intentionally
**omitted** (the live store initialised from defaults in plain-text `env.` refs; adding a
foreign `encryption_key` is not required and is left out to avoid a key-store mismatch).

## 23. Authentication mechanism — RESOLVED (exact v2.2.3)

Binary-extracted struct: `governance.auth_config = { is_enabled bool,
admin_username SecretVar, admin_password SecretVar }`.
`SecretVar` accepts a literal string or an env reference. Env forms tested on a
disposable store (Basic `admin:<env-value>`):

| form | result |
|------|--------|
| plain string `"env.NAME"` | **200 WORKS** (this is the form the production reference uses) |
| `{"ref":"env.NAME","type":"env"}` | 200 WORKS |
| `{"value":"env.NAME","ref":"env.NAME","type":"env"}` | 200 WORKS |
| `{"value":"env.NAME","type":"env"}` (no ref) | 401 (not resolved) |

Enforcement (disposable, `is_enabled=true`): unauth read **401**, unauth write **401**,
wrong creds **401**, correct Basic **200**, Bearer **401**. `/health` whitelisted
(**200 unauth**). Inference is **not** admin-gated: `POST /v1/chat/completions` unauth →
`400 no_key_supports_model` (not 401); `client.enforce_auth_on_inference` defaults
`false` (live value: `false`). Auth loads at startup ⇒ a **restart** applies it
(`/api/config` exposes `restart_required`).

**Seed precedence (material):** `config.json` is an additive seed for the **whole**
config incl. governance - it sets a value only where the store lacks one. Proof: a store
whose DB already had `is_auth_enabled=true` ignored a `config.json` with
`is_enabled=false` (restored-reference start → 401). **The live store has NO
`auth_config`** (live `GET /api/config` has no `auth_config`; matches the journal "No
admin account is configured") ⇒ the seed **will** apply on live. (Disposable store with
governance absent ⇒ seed enforced: tool3 STEP1.)

Runtime writer `PUT /api/config` exists (the UI save path) but rejects partial bodies
(`400 log_retention_days must be at least 1`); its exact schema is not fully resolved and
it is **not** used. The legacy `disable_auth_on_inference` field is ignored by this build
- do not set it. Do **not** add a `client` block (preserve live defaults).

## 24. Backup / restore procedure — verified on the reference store (proxy)

`sqlite3` CLI is **not installed** on the host; the consistent method is Python's
`sqlite3.Connection.backup()` (online backup; source opened `mode=ro` ⇒ the live DB is
never modified; the service is **not** stopped).

Result (reference store): sha256 `ee9a7b14dd1743e4f5cdb048b1dda2c472e04fd7b7c9b7ede383655e2d826463`;
size `41558016`; `PRAGMA integrity_check` = **ok**; 61 tables;
providers `[cloudflare,gemini,groq,mistral,nvidia,openai,openrouter,zai]`; 9 keys.

**Encryption-key dependency (material):** the reference keys are marked
`encryption_status='encrypted'`, so restoring a store whose keys are encrypted requires
`BIFROST_ENCRYPTION_KEY`. (The restored-reference gateway returned 401 - that was its DB
having auth enabled, not a restore failure.) **LIVE keys are `plain_text` env references**
⇒ the live restore is not key-dependent, but the production backup must still retain the
encryption key so any future encrypted key can be decrypted. Live before-inventory:
providers `[mistral]`, keys `[MISTRAL_API_KEY_auto_detected]`.

## 25. Final production manifest (NOT applied)

Live facts (verified): unit `/etc/systemd/system/company-os-bifrost.service`;
`User/Group=company-os`; `WorkingDirectory=/var/lib/company-os/bifrost/data`;
`ExecStart` sources `$CREDENTIALS_DIRECTORY/providers.env`
(`LoadCredential=providers.env:/home/genie/company-os/secrets/providers.env`, root:root
0600); DB `./config.db` = `/var/lib/company-os/bifrost/data/config.db`; **no
`config.json`**; management API **unauthenticated**; `enforce_auth_on_inference=false`.

Intended config = existing `mistral` + exactly `gemini, groq, openrouter, nvidia, zai,
cloudflare` (env-ref keys); `openai` and reference-store duplicates **excluded**; no
`client`, no `encryption_key`, no reference-store settings copied. Restart required once
per change (brief gateway downtime for backend callers). Rollback = restore the backup
`config.db` over the live file (and remove `config.json`) + restart.

### Change 1 - enable management-API auth (seed, auth only)

`/var/lib/company-os/bifrost/data/config.json`:
```json
{
  "$schema": "https://getbifrost.ai/schema",
  "config_store": { "enabled": true, "type": "sqlite", "config": { "path": "./config.db" } },
  "governance": { "auth_config": { "is_enabled": true,
    "admin_username": "env.BIFROST_ADMIN_USERNAME",
    "admin_password": "env.BIFROST_ADMIN_PASSWORD" } }
}
```

### Change 2 - add the six providers (seed, auth + six)

Same file, with `providers` = `mistral` + the six (each `{"keys":[{"name":..., "value":
"env.<VAR>", "models":["*"], "weight":1}]}`), exactly as emitted by
`tools/bifrost_restore_config.py render --auth enable --providers six`.

### Reviewed command sequence (owner runs; § see step labels)

> **SUPERSEDED by §30.** The step-2 append below is not shell-safe for a
> password containing spaces/metacharacters and the rollback below is the
> incomplete version §29 corrects. Use the tool-backed sequence in §30.

```bash
# --- 0. unprivileged preflight (no root) ---
systemctl status company-os-bifrost.service --no-pager
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/api/providers   # expect 200 (unauth today)

# --- 1. root: inspect live state (read-only) ---
sudo ls -la /var/lib/company-os/bifrost/data/
sudo test -e /var/lib/company-os/bifrost/data/config.json && echo "config.json EXISTS" || echo "config.json ABSENT (expected)"

# --- 2. root: provision admin creds into providers.env (prompt; no args/history) ---
sudo bash -c 'read -rsp "admin username: " U; echo >&2; read -rsp "admin password: " P; echo >&2;
  umask 077; printf "BIFROST_ADMIN_USERNAME=%s\nBIFROST_ADMIN_PASSWORD=%s\n" "$U" "$P" >> /home/genie/company-os/secrets/providers.env'
sudo stat -c '%a %U:%G' /home/genie/company-os/secrets/providers.env      # expect 600 root:root
sudo grep -c '^BIFROST_ADMIN_' /home/genie/company-os/secrets/providers.env   # expect 2 (no values shown)

# --- 3. root: consistent online backup (service NOT stopped, live DB NOT modified) ---
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
sudo install -d -m 0700 -o root -g root /root/bifrost-backup
sudo python3 - "$STAMP" <<'PY'
import sqlite3, sys, os, hashlib
stamp=sys.argv[1]
src=sqlite3.connect("file:/var/lib/company-os/bifrost/data/config.db?mode=ro",uri=True)
dst=sqlite3.connect(f"/root/bifrost-backup/config.db.{stamp}")
with dst: src.backup(dst)
dst.close(); src.close()
p=f"/root/bifrost-backup/config.db.{stamp}"
os.chmod(p,0o600)
print("sha256", hashlib.sha256(open(p,'rb').read()).hexdigest())
c=sqlite3.connect(f"file:{p}?mode=ro",uri=True)
print("integrity", c.execute("PRAGMA integrity_check").fetchone()[0])
print("providers", [r[0] for r in c.execute("select name from config_providers order by name")])
PY
# record STAMP and sha256 as evidence; restore-test to a disposable path before proceeding:
sudo install -d -m 0700 /root/bifrost-backup/restore-test
sudo cp /root/bifrost-backup/config.db.$STAMP /root/bifrost-backup/restore-test/config.db
sudo python3 - <<'PY'
import sqlite3
c=sqlite3.connect("file:/root/bifrost-backup/restore-test/config.db?mode=ro",uri=True)
print("restore-test integrity", c.execute("PRAGMA integrity_check").fetchone()[0])
print("restore-test tables", c.execute("select count(*) from sqlite_master where type='table'").fetchone()[0])
PY

# --- 4. root: CHANGE 1 - install auth-only seed, restart, verify ---
sudo install -m 0600 -o company-os -g company-os /dev/stdin /var/lib/company-os/bifrost/data/config.json <<'JSON'
{ "…auth-only seed from §25 Change 1…" }
JSON
sudo systemctl restart company-os-bifrost.service
curl -s -o /dev/null -w 'unauth providers: %{http_code}\n' http://127.0.0.1:8080/api/providers            # expect 401
curl -s -o /dev/null -w 'health: %{http_code}\n' http://127.0.0.1:8080/health                            # expect 200
# authorized check (creds read from the same file; password never printed to the terminal):
read -rsp 'admin username: ' BU; echo; read -rsp 'admin password: ' BP; echo
curl -s -o /dev/null -w 'basic providers: %{http_code}\n' -u "$BU:$BP" http://127.0.0.1:8080/api/providers  # expect 200
unset BU BP

# --- 5. root: CHANGE 2 - install auth+six seed, restart, verify ---
sudo install -m 0600 -o company-os -g company-os /dev/stdin /var/lib/company-os/bifrost/data/config.json <<'JSON'
{ "…auth + six providers seed from §25 Change 2…" }
JSON
sudo systemctl restart company-os-bifrost.service
read -rsp 'admin username: ' BU; echo; read -rsp 'admin password: ' BP; echo
curl -s -u "$BU:$BP" http://127.0.0.1:8080/api/providers | python3 -c 'import sys,json;print(sorted(p["name"] for p in json.load(sys.stdin)["providers"]))'
curl -s -u "$BU:$BP" http://127.0.0.1:8080/api/keys | python3 -c 'import sys,json;print(sorted(k["name"] for k in json.load(sys.stdin)))'
unset BU BP

# --- 6. rollback (root, only if needed) ---
sudo systemctl stop company-os-bifrost.service
sudo cp /root/bifrost-backup/config.db.$STAMP /var/lib/company-os/bifrost/data/config.db
sudo rm -f /var/lib/company-os/bifrost/data/config.json
sudo systemctl start company-os-bifrost.service
```

## 26. Checkpoint (before the first production mutation)

Presented for confirmation: (a) auth change §23 + tests; (b) seed diff §25 + tests
(`/tmp/opencode/bifrost-lab/test_tool3.py` -> `TEST_OK`); (c) backup/restore procedure
§24; (d) operation order, restart impact, rollback, before/after inventory §25.
No live mutation has been performed. Remaining owner inputs: root execution of steps
1-5, the admin username/password values (entered at the prompt in step 2), and explicit
confirmation of the final change.

## 27. Post-approval verification plan (not executed)

After the owner runs the steps: confirm 401 unauth / 200 authorized; provider
persistence across restart; each provider's key registration via `/api/keys`; then
provider **eligibility** separately from inference; rerun deterministic engineering gates
and the live Langfuse trace verification. Report PASS/FAIL/BLOCKED/NOT IMPLEMENTED/NOT
VERIFIED. No push/merge/deploy; Telegram/WhatsApp untouched.

## 28. Credential delivery — proven, and the supported provisioning path

**Proof of delivery.** The unit carries
`LoadCredential=providers.env:/home/genie/company-os/secrets/providers.env`
(root:root 0600, delivered by PID 1 into `$CREDENTIALS_DIRECTORY`) and
`ExecStart` runs the wrapper `bash -lc 'set -a; source "$CREDENTIALS_DIRECTORY/providers.env";
set +a; exec …'`. So the file's assignments become **process environment
variables**. Evidence: the live key `MISTRAL_API_KEY_auto_detected` carries the
reference `env.MISTRAL_API_KEY` and resolves — the same env-reference mechanism
that will resolve `env.BIFROST_ADMIN_USERNAME` / `env.BIFROST_ADMIN_PASSWORD`.
There is no `EnvironmentFile=`, `Environment=` is empty, no drop-ins,
`DynamicUser=no`.

**Supported way to provision the admin credential.** It is an assignment in that
same protected file, and it is a *declared* credential category — not a bare
append. `CREDENTIAL_CATEGORIES["bifrost"]` is now
`["BIFROST_ENCRYPTION_KEY", "BIFROST_ADMIN_USERNAME", "BIFROST_ADMIN_PASSWORD"]`,
so the presence-only `check` surface (loader + broker) reports them and the
category is a first-class citizen of the approved secret mechanism.

**Tool:** `tools/secrets/provision_bifrost_admin.py`
* `check` — read-only presence of the three bifrost vars (never a value).
* `provision` — username via `getpass`, password via `getpass` (no echo) or
  `--generate-password N`; validates (username: no `:`/whitespace; password: no
  newline/NUL); writes **shell-safe** (`shlex.quote`) so `source` reconstructs
  the exact value including spaces/metacharacters; **idempotent** (replaces,
  never duplicates); preserves comments and order; atomic replace; mode `0600`;
  `chown root:root`.
* Tests: `tests/test_bifrost_admin_provisioning.py` (round-trip through bash
  `source`, idempotency, validation, CLI end-to-end) — 8 passing.

**Root-home hazard (handled):** run as root, `Path.home()` is `/root`, so the
tool's default path would be wrong. The reviewed command passes
`--file /home/genie/company-os/secrets/providers.env` explicitly.

**Residual (documented, not silently accepted):** the file is LoadCredentialed
wholesale, so `BIFROST_ADMIN_*` also enter the environments of the other
services that read it — the same treatment `BIFROST_ENCRYPTION_KEY` already
receives. Per-service credential scoping remains the runbook's standing follow-up
(`docs/runbooks/secrets-isolation.md`, "Residual"). Least-privilege alternative
(**Option B**, requires a unit change + test update): a dedicated
`bifrost-admin.env` plus a second `LoadCredential=` on the Bifrost unit.

## 29. Corrected rollback (supersedes §25 step 6 and §19)

**Tool:** `tools/rollback_bifrost_state.py` (`plan` / `rollback`). Requirements
and how each is met:
1. **Prove before stopping** — `integrity_check` on the backup runs first; abort if not `ok`.
2. **Stay reversible** — the current `config.db` *and* its `-wal`/`-shm` sidecars
   are copied to `config.db.<ts>.pre-rollback` before anything is overwritten.
3. **No shadowing** — `config.db-wal` / `config.db-shm` are removed so the
   restored db is not overlaid by stale WAL pages.
4. **Original `config.json` state** — `--original-config absent` (the live truth)
   *removes* `config.json` so the additive seed cannot re-apply on the next
   start; otherwise the saved original is restored from a path.
5. **Ownership/permissions** — `company-os:company-os`, mode `0600`.
6. **Verify, don't assert** — re-runs `integrity_check` and prints the restored
   provider inventory.
`--sandbox` runs unprivileged on temp paths and never calls systemd. Tests:
`tests/test_bifrost_backup_rollback.py` — 5 passing (2 backup incl. tamper
detection, 3 rollback).

**Corrected claim:** removing `config.json` is safe *for this host because the
app-dir originally had none* — that is not a general truth. If a `config.json`
ever appears, capture it first and pass it via `--original-config <path>`.

## 30. Final pre-change report + reviewed command sequence (tool-backed)

| Item | Status |
| --- | --- |
| Root cause + validated method | DONE (§21–§22) |
| Auth mechanism + enforcement tests | DONE (§23) |
| Credential-delivery proof + supported provisioning | DONE (§28) |
| Live backup method + restore-test | DONE (§24); tool `tools/backup_bifrost_state.py` |
| Corrected rollback | DONE (§29); tool `tools/rollback_bifrost_state.py` |
| Exact seed diffs, reviewed + linted | DONE — `evidence/runs/bifrost-seeds/step1-auth.json`, `step2-auth-plus-providers.json` (`lint` ok) |
| Tests | 20 new passing; full suite **1715 passed / 5 skipped**, ruff clean, guards green |
| **Live backup of the real store** | **BLOCKED — needs your root terminal** |
| **First production mutation (steps 4-5)** | **NOT AUTHORIZED** |

```bash
# --- 0. preflight (no root) ---
systemctl status company-os-bifrost.service --no-pager
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/api/providers    # 200 (unauth today)

# --- 1. root: read-only inspect live state ---
sudo ls -la /var/lib/company-os/bifrost/data/
sudo test -e /var/lib/company-os/bifrost/data/config.json && echo "EXISTS" || echo "ABSENT (expected)"

# --- 2. root: provision admin creds (prompt; value never printed/persisted) ---
sudo .venv/bin/python tools/secrets/provision_bifrost_admin.py provision \
  --file /home/genie/company-os/secrets/providers.env
sudo stat -c '%a %U:%G' /home/genie/company-os/secrets/providers.env          # 600 root:root
.venv/bin/python tools/secrets/provision_bifrost_admin.py check \
  --file /home/genie/company-os/secrets/providers.env                          # ADMIN_* = SET

# --- 3. root: consistent online backup + restore-test + manifest ---
sudo .venv/bin/python tools/backup_bifrost_state.py backup --label pre-restore
# record printed backup path + sha256; ok:true required before continuing

# --- 4. root: CHANGE 1 (auth) - install seed, restart, verify ---
sudo install -m 0600 -o company-os -g company-os \
  evidence/runs/bifrost-seeds/step1-auth.json /var/lib/company-os/bifrost/data/config.json
sudo systemctl restart company-os-bifrost.service
curl -s -o /dev/null -w 'unauth providers: %{http_code}\n' http://127.0.0.1:8080/api/providers   # 401
curl -s -o /dev/null -w 'health: %{http_code}\n'           http://127.0.0.1:8080/health           # 200
read -rsp 'admin username: ' BU; echo; read -rsp 'admin password: ' BP; echo
curl -s -o /dev/null -w 'basic providers: %{http_code}\n' -u "$BU:$BP" http://127.0.0.1:8080/api/providers  # 200
unset BU BP

# --- 5. root: CHANGE 2 (providers) - install seed, restart, verify inventory ---
sudo install -m 0600 -o company-os -g company-os \
  evidence/runs/bifrost-seeds/step2-auth-plus-providers.json /var/lib/company-os/bifrost/data/config.json
sudo systemctl restart company-os-bifrost.service
read -rsp 'admin username: ' BU; echo; read -rsp 'admin password: ' BP; echo
BIFROST_ADMIN_USERNAME="$BU" BIFROST_ADMIN_PASSWORD="$BP" \
  .venv/bin/python tools/bifrost_restore_config.py verify --base-url http://127.0.0.1:8080
unset BU BP

# --- 6. rollback (root, only if needed) ---
sudo .venv/bin/python tools/rollback_bifrost_state.py plan \
  --backup /var/lib/company-os/backups/config.db.<LABEL>.bak --original-config absent
sudo .venv/bin/python tools/rollback_bifrost_state.py rollback \
  --backup /var/lib/company-os/backups/config.db.<LABEL>.bak --original-config absent
```

**Restart impact:** one brief gateway restart per change (steps 4 and 5); backend
callers during the restart interval get connection-refused. No other service is
restarted; the credential file is only read at process start, so step 2 takes
effect at the step-4 restart.

## 31. Checkpoint — nothing mutated

No live write, no seed install, no credential change, no restart, no push/merge/
deploy. Awaiting, from you: (a) the root execution of steps 1–3 (inspect,
provision, backup) — I cannot run root (no passwordless sudo / no TTY) and will
not bypass via docker/pkexec; (b) the admin username/password chosen at the step-2
prompt; (c) explicit authorization to run the first mutation (step 4).

Open decisions: (i) Option A (append to the shared secrets file — smallest change,
**recommended**) vs Option B (dedicated `bifrost-admin.env` unit change — better
isolation, larger blast radius).

## 32. Tool-backed proof on a real store (reference)

`tools/backup_bifrost_state.py backup --sandbox` against the reference store
(a real 41 MB Bifrost `config.db`) produced sha256
`ee9a7b14dd1743e4f5cdb048b1dda2c472e04fd7b7c9b7ede383655e2d826463` (identical to
the earlier manual proof), `integrity_check=ok`, 61 tables,
`restore_test.inventory_matches=true`, `ok:true`. Sanitized summary:
`evidence/runs/bifrost-backup-tool-proof-2026-10-18.json` (no values; the 41 MB
db and backups are NOT committed). The reference store already carries
`governance_config` keys `admin_username/admin_password/is_auth_enabled` — which
explains the earlier observation that a seed does not override an auth setting a
store already has; the LIVE store has none, so the seed applies there.

The reference store is **not** the live store and was not modified; the LIVE
backup (step 3 of §30) and the first mutation (steps 4-5) remain the owner's.

## 33. Playbook — exact root commands (owner terminal), Option A

Decision: **Option A** — the Bifrost admin credential lives in the existing
root-owned `providers.env` (no unit change). Run the three operations
SEPARATELY; verify each before the next. Nothing below mutates auth or providers.
The auditor (agent, uid 1000) has **no controlling TTY** (`open("/dev/tty")` →
`ENXIO`) and passwordless sudo is not configured, so it cannot run these itself;
each command prompts for the password locally — do not paste credentials anywhere.

### Op 1 — live inspection (read-only)  → expect PASS
```bash
sudo ls -l /var/lib/company-os/bifrost/data/
sudo sh -c 'test -e /var/lib/company-os/bifrost/data/config.json && echo "config.json: EXISTS" || echo "config.json: ABSENT"'
sudo stat -c '%a %U:%G %n' /var/lib/company-os/bifrost/data/config.db \
                            /home/genie/company-os/secrets/providers.env
sudo python3 - <<'PY'
import sqlite3
c = sqlite3.connect("file:/var/lib/company-os/bifrost/data/config.db?mode=ro", uri=True)
print("providers:", [r[0] for r in c.execute("select name from config_providers order by name")])
print("keys:", [r[0] for r in c.execute("select name from config_keys order by name")])
print("governance_config_keys:", [r[0] for r in c.execute("select key from governance_config order by key")])
print("enforce_auth_on_inference:", c.execute("select enforce_auth_on_inference from config_client").fetchone())
PY
```
Sanitized (names/status only). Expected today: `config.json: ABSENT`; providers
`[mistral]`; `governance_config_keys` empty or without `is_auth_enabled`.

### Op 2 — provision the admin credential (root, prompted)  → expect PASS
```bash
sudo /home/genie/company/.venv/bin/python \
  /home/genie/company/tools/secrets/provision_bifrost_admin.py provision \
  --file /home/genie/company-os/secrets/providers.env
# genuine getpass prompts (username, password, confirm) — nothing echoed, no args, no history
sudo stat -c '%a %U:%G %n' /home/genie/company-os/secrets/providers.env          # expect 600 root:root
sudo /home/genie/company/.venv/bin/python \
  /home/genie/company/tools/secrets/provision_bifrost_admin.py check \
  --file /home/genie/company-os/secrets/providers.env
# expect bifrost.BIFROST_ADMIN_USERNAME=SET and bifrost.BIFROST_ADMIN_PASSWORD=SET (no values)
```

### Op 3 — live backup (root; service NOT stopped)  → expect PASS
```bash
sudo /home/genie/company/.venv/bin/python \
  /home/genie/company/tools/backup_bifrost_state.py backup \
  --label pre-restore \
  --manifest-out /home/genie/company-os/ops/bifrost-pre-restore.manifest.json
sudo stat -c '%a %U:%G %n' /var/lib/company-os/backups/config.db.pre-restore.bak   # expect 600 root:root
```
The tool prints `ok`, `sha256`, `integrity_check`, `providers`, `keys`, and the
`restore_test` block; it writes the sanitized manifest (world-readable) to
`/home/genie/company-os/ops/…` so the auditor can consume it for §34.

### STOP
Do not install either seed, change auth, write via the management API, or restart
until the regenerated pre-change manifest (§34) is confirmed.

## 34. Regenerated pre-change manifest — from the ACTUAL live state

Sources of truth: the owner's Op-1 terminal output and the live backup manifest
(`evidence/runs/bifrost-live-pre-restore-manifest-2026-10-18.json`, captured
2026-10-18T14:04:02Z). Nothing below is assumed from §25.

**Live state (authoritative):**
* `config.json`: **ABSENT** (app-dir `/var/lib/company-os/bifrost/data/`).
* DB `/var/lib/company-os/bifrost/data/config.db`: 34,332,672 B, `600 company-os:company-os`; sidecars `config.db-wal` 2,158,912 B and `config.db-shm` 32,768 B present.
* providers: `[mistral]`; key `MISTRAL_API_KEY_auto_detected` (env-ref, weight 1.0, enabled; key `encryption_status='encrypted'`).
* `governance_config_keys`: `[complexity_semantic_generations, restart_required]` — **no** `is_auth_enabled`/`admin_username`/`admin_password` ⇒ auth NOT configured.
* `enforce_auth_on_inference = false`.
* `providers.env`: `600 root:root`; `BIFROST_ENCRYPTION_KEY`, `BIFROST_ADMIN_USERNAME`, `BIFROST_ADMIN_PASSWORD` all **SET**.

**Backup (Op 3):** `/var/lib/company-os/backups/config.db.pre-restore.bak`,
sha256 `78b281f6cd624fcbb06cf7027b11d4dfcd0fe7cf3747b05ac1ae649a259c3871`,
size 34,340,864 B, `600 root:root`, `integrity_check=ok` (61 tables),
`restore_test {integrity ok, inventory_matches true, ok true}`, `ok:true`.

**Auth config change (Change 1).** `config.json` absent → present:
```json
{ "$schema":"https://getbifrost.ai/schema",
  "config_store":{"enabled":true,"type":"sqlite","config":{"path":"./config.db"}},
  "governance":{"auth_config":{"is_enabled":true,
    "admin_username":"env.BIFROST_ADMIN_USERNAME",
    "admin_password":"env.BIFROST_ADMIN_PASSWORD"}} }
```

**Provider change (Change 2).** Adds `providers` = `mistral` (already in the DB,
so additive no-op) + exactly `gemini, groq, openrouter, nvidia, zai, cloudflare`,
each key `{"name":"<x>-primary","value":"env.<VAR>","models":["*"],"weight":1}`;
`openai` excluded. `encryption_key` deliberately **omitted** so the service keeps
using the env `BIFROST_ENCRYPTION_KEY` and the existing encrypted key row stays
decryptable.

**Restart impact.** Unit `company-os-bifrost.service`; one restart per change
(steps 4 and 5). Backends calling the gateway during each restart see
connection-refused for ~seconds. `logs.db` untouched.

**Rollback.** `tools/rollback_bifrost_state.py rollback --backup <the backup>
--original-config absent`: verifies the backup, preserves current db+sidecars to
`*.pre-rollback`, removes `config.db-wal`/`-shm`, restores the db, **removes
`config.json`** (originally absent, re-verified above), chowns
`company-os:company-os` `0600`, restarts, re-verifies. `BIFROST_ENCRYPTION_KEY`
is unchanged by provisioning, so the restored encrypted key row decrypts.

## 35. Discrepancy & correction log

* **D1 (command, not system):** Op-1 used `systemctl status bifrost` → "Unit not
  found". Correct unit is `company-os-bifrost.service`. No impact.
* **D2 (expected):** backup 34,340,864 B > live main file 34,332,672 B. The
  online backup checkpoints the 2,158,912 B WAL into the copy; a superset is
  correct, not a failure.
* **D3 (CORRECTION to §24):** the live **key row** `MISTRAL_API_KEY_auto_detected`
  is `encryption_status='encrypted'` (the **provider** row is `plain_text`).
  §24's "live keys are plain_text ⇒ restore not key-dependent" was wrong. Restore
  depends on `BIFROST_ENCRYPTION_KEY`, which is present and unchanged, and the
  seed omits `encryption_key` — so the plan is unaffected, but the dependency is
  now explicit.
* **D4:** `restart_required` is already present in `governance_config` (Bifrost's
  own pending-restart flag). The planned restarts clear it. Not a blocker.
* **D5 (tool bug, fixed):** `backup_bifrost_state.py` named a field `weights`
  while it held row counts; renamed to `row_counts`.
* **D6:** the owner's Op-1 replaced the DB-inspection heredoc with the systemctl
  call, so live DB inventory came from the backup manifest (equivalent, from the
  live DB, read-only). No gap.

## 36. Execution enablement (so the agent can run root ops without the password)

> **SUPERSEDED / REJECTED — see §37.** The design in this section (a dispatcher
> that forwards to repo tools under `/home/genie/company`) is **unsafe**: the
> repo and virtualenv are caller-writable, so running them as root is a local
> privilege-escalation vector. It was replaced by the root-owned, isolated
> dispatcher described in §37–§39. Kept for the audit trail.

Handling the root password through the chat transcript would place a RESTRICTED
credential into logs and model context — not acceptable. Instead, a scoped,
auditable capability:
* `deploy/sbin/company-os-bifrost-ops` — root dispatcher, fixed subcommands only
  (`inspect status backup seed verify rollback`), forwarding validated args to
  absolute repo tools; refuses anything else. Not a general root shell.
* `deploy/sudoers.d/company-os-bifrost-ops` — `genie ALL=(root) NOPASSWD:` that
  one dispatcher (`visudo -c` → parsed OK).
* `tools/bifrost_ops.py` — `inspect` (read-only, sanitized), `install-seed`
  (`--confirm` required; owner/mode fixed; restarts), `status`.
* Tests: `tests/test_bifrost_ops.py` — 9 passing (inspect, sandbox install,
  `--confirm` gate, dispatcher refusals, stub-repo mapping).

Install once (root), then the agent executes `sudo company-os-bifrost-ops …`:
```bash
sudo install -m 0755 -o root -g root deploy/sbin/company-os-bifrost-ops /usr/local/sbin/company-os-bifrost-ops
sudo install -m 0440 -o root -g root deploy/sudoers.d/company-os-bifrost-ops /etc/sudoers.d/company-os-bifrost-ops
sudo visudo -c
```

(As noted under the §36 banner, the forwarding design was rejected — see §37.)
These bare `install` lines are historical; the supported install path is
`deploy/bifrost-ops/install.sh` (§38).

## 37. Security audit of the privileged-operations boundary

### 37.1 Verdict

The originally-proposed unattended-root dispatcher (§36) is **REJECTED as
unsafe** and was rebuilt from scratch. Root cause: it executed code from
`/home/genie/company` with the caller's virtualenv interpreter. Both are
`genie:genie` and writable by the unprivileged caller, so an unprivileged
process could alter the code and have it run as root — a local
privilege-escalation (root) vector. The same class of defect applied to:

* `COMPANY_OS_REPO` read from the environment (caller-controlled code root);
* `.venv/bin/python` (a caller-owned symlink) as the interpreter;
* seeds read from the caller-writable repo;
* the sudoers rule as originally written (`""`/wildcards allowed argument
  passthrough).

Nothing from the §36 design was installed. The replacement is in §38–§39.

### 37.2 Threat model (assets and boundaries)

| Asset | Sensitivity | Reached over |
|---|---|---|
| Live store `/var/lib/company-os/bifrost/data/config.db` | RESTRICTED | root only (`company-os:company-os 0750/0600`) |
| `BIFROST_ENCRYPTION_KEY`, `BIFROST_ADMIN_*` in `/home/genie/company-os/secrets/providers.env` | RESTRICTED | root:root `0600` |
| The service unit `company-os-bifrost.service` | INTERNAL | `systemctl` |
| The dispatcher + modules + seeds (when installed) | INTERNAL | root-owned, caller read-only |

Trust boundary: **only root-owned, caller-non-writable code/data may execute as
root.** Everything reachable and writable by `genie` is untrusted input to the
root path. The mechanism grants no more than six fixed operations; it is not a
general root shell.

### 37.3 Defects found and how they were closed

| # | Defect (as originally built) | Fix |
|---|---|---|
| A1 | Root dispatcher executed modules from the caller-writable repo | Install modules to root-owned `/usr/local/lib/company-os/bifrost-ops/`; dispatcher runs only those |
| A2 | Interpreter taken from the caller's virtualenv (`PATH`/symlink) | Pin `/usr/bin/python3`, run under `/usr/bin/env -i` (cleared env, fixed `PATH`) |
| A3 | Environment trust (`COMPANY_OS_REPO`, `PYTHONPATH`, `PYTHONHOME`) | `env -i` + Python `-I` (isolated; ignores env and CWD) |
| A4 | Seeds read from caller-writable repo | Seeds installed root-owned; `_assert_seed_safe` refuses any non-`env.*` credential |
| A5 | Arbitrary argument passthrough via sudoers wildcard/`""` | Exact per-invocation `NOPASSWD` lines; dispatcher enforces exact arity |
| A6 | Non-atomic seed write (partial/garbage file possible) | `O_CREAT|O_EXCL` atomic write at `0600`; refuses to overwrite |
| A7 | Rollback shelled out to `rm` from the caller `PATH` | `Path.unlink` (no external command from the caller's environment) |
| A8 | No fail-closed check on its own code | Dispatcher trusts its code tree **only if root-owned and clean**; else exits |
| A9 | `--base-url` reached `urllib.request.urlopen` unvalidated (semgrep `dynamic-urllib-use`) — a `file://` value could read arbitrary files | `_loopback_http_base()` in both tools rejects any non-`http(s)` scheme and any non-loopback host, else exits 2; `file://`/remote suppressed findings carry a justified `# nosemgrep` (the validator is the control, tested by `LoopbackBaseUrlTests`) |
| A10 | Row-count SQL interpolated a table name from the store schema (semgrep `formatted-sql-query` / `sqlalchemy-execute-raw-query`) | `_safe_ident()` shape-whitelists `^[A-Za-z_][A-Za-z0-9_]*$` before interpolation (SQLite cannot bind an identifier); tested by `SafeIdentTests` |

### 37.4 Deterministic tests

* `tests/test_bifrost_ops_security.py` — trust predicate rejects caller-writable
  code dirs; dispatcher pins the interpreter, uses `env -i` + `-I`, ignores an
  environment override, and refuses extra/unknown arguments; the sudoers
  fragment is the exact six-line allowlist with no wildcard; the installer
  installs root-owned and verifies digests; `SHA256SUMS` matches the reviewed
  bytes; the installed modules import only the standard library; the seeds carry
  env references only.
* `tests/test_bifrost_ops.py` — operations module behaviour (sandbox only):
  `inspect`, seed install with tamper rejection, `--confirm` gate, dispatcher
  refusals.
* Static: `bash -n` on both scripts, `shellcheck` clean, `visudo -c` parses.

These are deterministic checks (exit statuses, file ownership, matched bytes) —
they take precedence over any model judgement. Runtime proof against the exact
binary is in §40.

### 37.5 Residual risk / limitations

* The mechanism grants root for exactly these operations; it does not sandbox
  the root process beyond not trusting its inputs. A compromised root-owned
  module or interpreter is already root and out of scope.
* `inspect`/`backup` read the whole live store; their output is sanitized
  (names/status only) but remains INTERNAL.
* `D3` correction still stands: the live **key row** is `encrypted`, so restore
  depends on `BIFROST_ENCRYPTION_KEY` (env, unchanged by provisioning).

## 38. Hardened artifacts (final)

* `deploy/sbin/company-os-bifrost-ops` — root dispatcher. Fixed
  `OPS_DIR=/usr/local/lib/company-os/bifrost-ops`; pinned
  `PY=/usr/bin/python3`; isolated exec via `/usr/bin/env -i PATH=… "$PY" -I -B`;
  no env trust; exact per-subcommand arity; sourceable for tests; fixed
  db/app/backup/manifest/seeds/unit paths. Allowlist: `inspect status backup
  seed step1|step2 rollback`.
* `deploy/sudoers.d/company-os-bifrost-ops` — six explicit
  `genie ALL=(root) NOPASSWD:` lines (no `""`, no wildcard, no passthrough).
* `deploy/bifrost-ops/install.sh` — root installer: verifies `SHA256SUMS`,
  installs root-owned copies + seeds, installs dispatcher + sudoers, validates
  with `visudo -cf`; idempotent; not executed.
* `deploy/bifrost-ops/SHA256SUMS` — pinned digests of the three modules, both
  seeds, the dispatcher and the sudoers fragment.
* `tools/bifrost_ops.py` — hardened: `_assert_seed_safe` (every provider key and
  auth credential must be an `env.*` reference), atomic `O_CREAT|O_EXCL` `0600`
  write, stdlib-only.
* `tools/rollback_bifrost_state.py` — hardened: `Path.unlink` instead of a
  caller-`PATH` `rm`.

Operator runbook: `docs/runbooks/bifrost-privileged-operations.md`.

## 39. Stopping conditions (binding)

The following are **production mutations** and remain unauthorized until the
owner gives a separate, explicit decision after reviewing this report:

1. installing the dispatcher/sudoers on the host;
2. enabling live authentication (installing the `config.json` seed);
3. installing the provider seed into the live store;
4. restarting `company-os-bifrost.service`;
5. commit / push / merge / deploy.

Everything above is designed, tested and staged locally; **nothing has been
installed on the host.**

## 40. Session re-verification against the exact installed binary

Fresh, this-session evidence: `evidence/runs/bifrost-privops-audit-2026-10-18.json`
(binary `/home/genie/.cache/bifrost/v2.2.3/bin/bifrost-http-0`, disposable store
under `/tmp/opencode`, production never touched).

* **Auth enforcement** (`is_enabled:true`, env-reference admin):
  `/health` unauth → **200**; `GET /api/providers` unauth → **401**;
  `POST /api/providers` unauth → **401** (writes enforced); correct Basic →
  **200**; wrong Basic → **401**; `POST /v1/chat/completions` unauth → **400**
  (not admin-gated). **PASS.**
* **Additive seed:** a `config.json` adding a new provider added it and
  **preserved** a pre-existing provider absent from `config.json` (`openai`
  retained). **PASS.**
* **Seed precedence:** a store that already had `is_auth_enabled` was not
  overridden by `config.json` — confirming the live store (which lacks the key)
  will accept the auth seed. **PASS.**

Properties not re-run this session (management-API write matrix; the three
env-form variants of the `SecretVar` reference) remain covered by the
version-exact `evidence/runs/bifrost-api-contract-2026-10-18.json` and are
labelled as such, not as re-verified.

## 41. Deterministic gates and full suite (session results)

Command: `./scripts/gates.sh` — **FINAL RESULT: status=PASS, failed_checks=0**
(`artifacts/gate-evidence.json`). Checks: git repository, git diff check, bash
syntax, shellcheck, GitHub Actions syntax, gitleaks, trivy filesystem,
semgrep, osv-scanner, model compatibility artifact, python compile, unit tests,
architecture conformance, bundle budget, design manifest, decision effects,
design tokens, design graph, design contract specs, design gate sequence, penpot
map, design component specs, design compiler, design token export, design
diagnostic, golden set, trajectory, promptfoo, langfuse trace, ruff — all PASS.

`release_eligibility: BLOCKED` / `worktree: dirty` — correct and intended:
uncommitted changes are not release evidence, and this task deliberately does
not commit.

Full test suite: `.venv/bin/python -m pytest -q` →
**1754 passed, 5 skipped, 355 subtests passed** (309s).
Focused: security/ops suites **59 passed**.
Secret scan over tracked history and the filesystem (incl. untracked new
files): `gitleaks` — no leaks. `ruff` — all checks passed. Semgrep over the five
privileged modules — clean (rc=0).

### 41.1 Diff review (final)

Changed/added: the report, `tools/secrets/credential_loader.py` (+2 admin names
to the `bifrost` category), and the new privileged-ops set (`deploy/…`,
`tools/…`, `tests/…`, `evidence/…`, `docs/runbooks/bifrost-privileged-operations.md`).
No unrelated changes; no temporary artifacts committed; no secrets.

Confirmed: no production database, seed, service or auth state was modified;
Telegram and WhatsApp integrations untouched; **no commit, push, merge or
deploy was performed.** Disposable store copies under `/tmp/opencode` were
removed.

---

## 42. Independent adversarial review (2026-10-19)

A second, independent review was performed against revision
`fbed5fd91d5afa61d6693014fd7ca3d056b9885f`. It re-derived the boundary from
source (not from this report), re-verified the highest-risk assumptions against
the exact binary, and found four defects, all now fixed with regression tests.
Evidence: `evidence/runs/bifrost-independent-review-2026-10-19.json`.

### 42.1 Defects found and fixed

| ID | Sev | Defect | Fix |
|----|-----|--------|-----|
| D1 | Medium | `install.sh` verified **source** digests then copied (verify→copy TOCTOU); trust predicate checked ownership, not content | installer now re-hashes the **installed** bytes vs `SHA256SUMS` before installing sudoers, and removes the code + exits non-zero on mismatch; sudoers installed last |
| D2 | Medium | `backup` wrote `config.db.pre-restore.bak` — the owner-verified rollback target — silently overwriting it | backup refuses to overwrite unless `--overwrite`; dispatcher never passes it |
| D3 | Low | `rollback` checked `integrity_check` only, not the recorded digest | rollback refuses when the backup does not match its manifest sha256 |
| D4 | Low | trust predicate followed symlinks and did not check the `OPS_DIR` parent | rejects symlinks; verifies the parent is root-owned/clean |

### 42.2 Property checks (independent)

All ten structural properties in the review's checklist are `PASS`; see §42.2
enumeration in the evidence JSON. No "security theater" (checks whose failure
cannot propagate) was found: the installer digest check is load-bearing (it
gates the sudoers rule) and the dispatcher's trust predicate is load-bearing
(it refuses before any privileged work).

### 42.3 Exact-binary re-verification (this session)

Disposable copy of the reference store, `governance_config` cleared, `step2`
seed applied, loopback only: `/health` 200 unauth, `GET/POST /api/providers`
**401** unauth, correct Basic **200**, wrong Basic **401**, `/v1/chat/completions`
unauth **400**; providers after = six added + `mistral`/`openai` preserved.
**PASS.**

### 42.4 Gates and tests (this session)

`./scripts/gates.sh` → **PASS, failed_checks=0 (30 checks)**.
Full suite → **1760 passed, 5 skipped, 355 subtests**.
Focused → **65 passed**. `ruff`, `semgrep`, `shellcheck`, `bash -n`,
`visudo -cf`, `gitleaks` (git + filesystem, incl. untracked), `sha256sum
--check deploy/bifrost-ops/SHA256SUMS` — all clean. `release_eligibility`:
**BLOCKED** (dirty worktree) — correct, the changes are intentionally
uncommitted.

### 42.5 Verdict and authorization boundary

**READY FOR OWNER AUTHORIZATION** — with **installation** authorization
(dispatcher + sudoers) separated from **production config-migration**
authorization (seed + restart). No production mutation was performed: the
installed paths remain absent and the live store was not read or written.

Still NOT verified end-to-end against the live database (that requires the
unauthorized mutation); it is verified against the exact binary on disposable
copies only.

---

## 43. Pre-authorization command-contract check (2026-10-19)

A read-only verification of the exact commands proposed for installation and
migration. Two defects (D5, D6) were found and fixed; both would have made the
proposed command sequence misbehave on the live host. No privileged or live
command was executed.

### 43.1 Dispatcher contract (accepted subcommands)

`dispatch()` (`deploy/sbin/company-os-bifrost-ops:89`) accepts exactly:
`inspect` (1 arg), `status` (1 arg), `backup` (1 arg), `seed step1|step2`
(2 args), `rollback` (1 arg). The sudoers fragment allowlists the same six
forms token-for-token. All four proposed commands are accepted as written.

### 43.2 Defects found and fixed

| ID | Sev | Defect | Fix |
|----|-----|--------|-----|
| D5 | High | `backup` wrote the **canonical** path `config.db.pre-restore.bak` and `--manifest-out` rewrote the **canonical** manifest — so the routine backup (a) failed `exit 2` once the canonical file existed and (b) would have clobbered the digest the rollback anchor is checked against (breaking `rollback`) | dispatcher passes no `--label`/`--manifest-out`; the tool stamps a unique name (`<utc>-<pid>`) and its own sidecar manifest. The canonical anchor is never touched. |
| D6 | Medium | rollback verified the digest only when a manifest happened to exist (missing manifest → warn + proceed), and looked only at the canonical manifest path | digest verification is now **unconditional**: the manifest is resolved from the explicit path or the backup's sidecar; if none is found, or it records no sha256, or the sha256 differs, rollback **refuses (exit 2)** |

### 43.3 Rollback readiness checkpoint

`inspect` now reports a `rollback` block (`backup_exists`, `manifest_found`,
`digest_matches_manifest`, `rollback_ready`). `rollback_ready` is exactly the
condition under which `rollback` will restore, so the operator confirms
`sudo company-os-bifrost-ops inspect` shows `rollback_ready: true` **before**
mutating. The probe degrades to "not ready" for an unprivileged caller (never
crashes on `EACCES`).

### 43.4 Command verdicts

| Proposed command | Verdict | Basis |
|---|---|---|
| `sudo company-os-bifrost-ops backup` | **FAIL as originally proposed → PASS after D5 fix** | original mapped to the canonical path (collision); now a unique snapshot |
| `sudo company-os-bifrost-ops seed step1` | **PASS** | accepted; writes live `config.json`, restarts the unit (auto, synchronous) |
| `sudo company-os-bifrost-ops seed step2` | **PASS** | accepted; adds six providers, restarts the unit (auto, synchronous) |
| `sudo company-os-bifrost-ops rollback` | **PASS (contract); live readiness NOT VERIFIED** | digest-verified (D6); whether the live manifest resolves cannot be read from the audit (root-only dir) — confirm via `inspect.rollback.rollback_ready` |

Both `seed` steps restart the unit automatically; the operator must run the
`status`/`inspect` checkpoints between them (there is no automatic readiness
gate).

### 43.5 Installer contract

Idempotent (re-running replaces files); verifies source **and** installed bytes
against `SHA256SUMS`; installs sudoers **last**; and fails closed on every
partial path (source mismatch → exit 3 before any write; installed mismatch →
`rollback_install` removes code + exit 3; sudoers validation failure → exit 3
with no rule installed). Verdict: **PASS**.

### 43.6 Gates and tests (this session)

`./scripts/gates.sh` → **PASS, failed_checks=0**. Full suite → **1766 passed,
5 skipped, 355 subtests** (focused ops/security/backup/rollback/restore/
provisioning → **71 passed**). `ruff`, `shellcheck`, `visudo -cf`,
`sha256sum --check` all clean. `release_eligibility`: **BLOCKED** (dirty
worktree, by design). No production mutation; installed paths still absent.

## 44. Post-install checkpoint 5 — rollback anchor remediated (2026-10-19)

Checkpoint 5 failed at installation time: `rollback.rollback_ready` was `false`
because the canonical manifest
`/var/lib/company-os/backups/bifrost-pre-restore.manifest.json` did not exist.
The earlier backup had written its sanitized manifest into repo evidence
(`evidence/runs/bifrost-live-pre-restore-manifest-2026-10-18.json`) instead of
the path the dispatcher reads. Because rollback's digest check is unconditional
(D6), the safety net was inoperable.

### 44.1 Prechecks (deterministic)

| Check | Result |
|---|---|
| repo manifest sha256 | `a6945f67…c7b5` (matches picked-up artifact) |
| repo manifest parses as JSON | yes |
| recorded backup path | `/var/lib/company-os/backups/config.db.pre-restore.bak` |
| recorded backup sha256 | `78b281f6…c3871` (owner-verified) |
| recorded size / integrity / restore test | `34340864` / `ok` / `true` |
| manifest contains sensitive values | no |
| canonical manifest absent before write | yes (`ABSENT_OK`) |

### 44.2 Remediation (founder-executed, root, one-time)

`sudo install -o root -g root -m 0644 <repo manifest> /var/lib/company-os/backups/bifrost-pre-restore.manifest.json`
→ exit `0`; installed sha256 re-read as `a6945f67…c7b5`.

Scope: one root-owned `0644` JSON manifest. The backup bytes, `config.db`,
`config.json`, credentials, encryption key, and the unit were not touched.

### 44.3 Post-remediation verification (reviewer, read-only)

```
manifest_found        : true
digest_matches_manifest: true
rollback_ready        : true
backup_exists         : true
config_json_present   : false
providers             : ["mistral"]
enforce_auth          : false
```

Service unchanged: `active`, `MainPID=1280`, `NRestarts=0`,
`ExecMainStartTimestamp=2026-10-18 11:21:30 EAT`, `/health=200`.

### 44.4 Regression guard

Added `CanonicalPathContractTests` (5 tests) to
`tests/test_bifrost_ops_security.py`. It resolves the dispatcher's shell
constants by sourcing the launcher in bash (not by reimplementing expansion),
and asserts every module + the dispatcher agree on `LIVE_DB`, `LIVE_APP`,
`LIVE_BACKUP`, `LIVE_MANIFEST`, and the sidecar naming rule. Checkpoint 5's
failure was a path-contract violation; that class is now test-pinned.

### 44.5 Verdict

**INSTALLATION PASS · ROLLBACK ANCHOR READY · MIGRATION NOT STARTED.**
`./scripts/gates.sh` → PASS, `failed_checks=0`; focused suites → 76 passed.
Migration remains gated on explicit founder authorization.
