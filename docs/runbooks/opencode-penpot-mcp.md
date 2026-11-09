# Runbook — OpenCode loads the Penpot MCP server

## Symptom

OpenCode's MCP panel showed `gbrain · Connected` and
`penpot · Invalid MCP URL for "penpot"` — the Penpot MCP server never loaded.

Reproduce deterministically:

```bash
opencode mcp list
# penpot  Invalid MCP URL for "penpot"
```

## Root cause

`~/.config/opencode/opencode.json` referenced the endpoint as
`"url": "{env:PENPOT_MCP_URL}"`. OpenCode substitutes `{env:VAR}` with an empty
string when the variable is unset, and `PENPOT_MCP_URL` is **never exported**
into the environment OpenCode launches with. The value is a live Penpot session
token that lives only in the external secrets store:

```
~/company-os/secrets/providers.env   # export PENPOT_MCP_URL="https://design.penpot.app/mcp/stream?userToken=…"
```

Empty string ⇒ empty URL ⇒ `Invalid MCP URL`.

## Fix

OpenCode supports `{file:path}` — its documented mechanism for "keeping sensitive
data like API keys in separate files" — which substitutes the file's **contents**.
So we render the token into a dedicated, permission-locked file and point the
config at it:

1. `tools/opencode_penpot_sync.py` reads `PENPOT_MCP_URL` (environment first, then
   the secrets store) and:
   - writes `~/.config/opencode/penpot_mcp_url` atomically, **mode 0600, no
     trailing newline**;
   - ensures `mcp.penpot = {"type":"remote","url":"{file:~/.config/opencode/penpot_mcp_url}","enabled":true,"oauth":false}`
     in `opencode.json`, preserving every other key (e.g. `mcp.gbrain`).
   - The token is never printed to stdout/stderr and never enters the repo.
2. `scripts/install-opencode-penpot-sync.sh` installs a systemd **user** unit so
   the file exists at login and refreshes the instant the secret changes:
   - `opencode-penpot-sync.service` runs the sync once (at login and on demand);
   - `opencode-penpot-sync.path` (`PathChanged=` the secrets file) re-runs it
     whenever `providers.env` is rewritten.

Because the rendered file lives outside the repository and the config only ever
contains the `{file:…}` token, no secret is committed and the data-classification
rules are respected (the session token stays RESTRICTED / external).

## Interaction with the secrets-isolation boundary

The secrets-isolation boundary makes `~/company-os/secrets/providers.env`
`root:root 0600`. That has two effects here:

1. **The refresh must run as root.** A *user* unit (running as `genie`) can no
   longer read the secret, so rotation would silently stop updating the rendered
   file. Install the root system unit instead:

   ```bash
   sudo scripts/install-opencode-penpot-sync.sh --system
   ```

   It runs as `root`, re-renders on `PathChanged=` of `providers.env`, and hands
   the rendered files back to the OpenCode user via `PENPOT_OWNER_UID/GID` (a
   manual `sudo tools/opencode_penpot_sync.py` uses `SUDO_UID/GID` instead) so
   `genie` keeps read access. Without that handoff the file would become
   `root:root 0600` and OpenCode would fail to load it.

   The unit also pins `Environment=HOME=<opencode user's home>` in `[Service]`.
   A root unit otherwise starts with `HOME=/root`, so the tool would resolve the
   secret and the config under `/root` (the failure
   `PENPOT_MCP_URL not found … /root/company-os/secrets/providers.env`). The
   installer resolves that home from `SUDO_USER`/the owner uid at install time;
   it never hard-codes the secret path (security contract §15). Preview the exact
   unit without installing:

   ```bash
   scripts/install-opencode-penpot-sync.sh --system --render-to /tmp/penpot-unit
   ```

   `--render-to` works unprivileged and writes both unit files to the given
   directory; it is what the test suite asserts the unit shape against.

2. **An unreadable secret fails clean.** If the tool cannot read the secrets
   file it exits `2` with an actionable message — never a traceback and never the
   token — so a broken refresh is loud rather than silently serving a stale
   token.

The rendered `penpot_mcp_url` is agent-consumable **by architecture**: OpenCode
itself, running as `genie`, reads it to open the MCP connection. It is a single
rotatable session token, not a provider key, and it never leaves that one `0600`
file.

## Install / apply

```bash
# before the boundary is active (secret readable by genie):
scripts/install-opencode-penpot-sync.sh          # user unit

# once the boundary is active (providers.env is root:root 0600):
sudo scripts/install-opencode-penpot-sync.sh --system   # root system unit
```

## Verify

```bash
opencode mcp list                 # penpot should no longer say "Invalid MCP URL"
tools/opencode_penpot_sync.py --check   # exit 0 == in sync
systemctl --user status opencode-penpot-sync.path
tools/opencode_penpot_sync.py --print-paths   # paths + token form (never the secret)
```

`--check` exits `0` when in sync, `1` when out of sync, `2` when the secret is
missing, unreadable, or the URL/config is invalid.

## Rotate the token

Edit `~/company-os/secrets/providers.env` — that is the only source of truth.
With the boundary active, do it as root so the path unit fires; it re-renders
the file. To force it:

```bash
sudo systemctl start opencode-penpot-sync.service   # system unit (boundary active)
# or, before the boundary is active:
systemctl --user start opencode-penpot-sync.service
```

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `penpot` still invalid | `opencode mcp list`; then `tools/opencode_penpot_sync.py --print-paths` and confirm the url file is non-empty, mode 0600. |
| `cannot read secrets file … permission denied` | Expected once the boundary is active and the command ran as `genie`. Refresh as root (`sudo tools/opencode_penpot_sync.py`) or install the system unit. |
| `PENPOT_MCP_URL not found` | Confirm `~/company-os/secrets/providers.env` has the key; the outer directory is outside the sandbox. |
| `must be an http(s) URL` | The stored value is malformed (missing scheme/host). |
| Config lost after an edit | Re-run `scripts/install-opencode-penpot-sync.sh` (add `--system` if the boundary is active). |
| No systemd user session | Run the sync from shell init instead: `tools/opencode_penpot_sync.py`. |

## Why not `{env:PENPOT_MCP_URL}`?

Exporting a restricted session token globally would leak it into every child
process and violate least-privilege. `{file:…}` keeps the secret in a single
0600 file that only OpenCode reads at config load.

## Tests

`tests/test_opencode_penpot_sync.py` (offline) covers secret resolution
precedence, URL validation, the 0600/no-newline rendering contract, idempotent
byte-for-byte sync, preservation of unrelated config keys, `--check` semantics,
refusal without writing when the secret is missing/invalid, and that the secret
never appears in tool output. It is part of the standard gate
(`python -m unittest discover -s tests`).
