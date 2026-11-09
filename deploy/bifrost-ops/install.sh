#!/bin/bash
# Install the Company OS privileged Bifrost operations boundary (ROOT REQUIRED).
#
# This is the step that makes unattended operation safe: it freezes the
# operations modules, the dispatcher, the sudoers fragment and the seeds into
# ROOT-OWNED locations that the unprivileged caller cannot write. Without this
# copy, the dispatcher would execute code from the caller-writable developer
# tree as root — a local privilege-escalation vector. The dispatcher refuses to
# run when its code directory is not root-owned, so a missing/partial install
# fails closed.
#
# Integrity: `deploy/bifrost-ops/SHA256SUMS` pins the exact digest of every
# installed file. This script (a) refuses to install if any SOURCE file differs,
# then (b) after copying, re-hashes the INSTALLED files and verifies them
# against the same manifest. Step (b) closes the verify->copy TOCTOU window: a
# race that swapped bytes mid-copy changes the installed hash and is caught. On
# any installed-digest mismatch the script removes the installed code and exits
# non-zero, and the sudoers rule is installed LAST — only after the code it
# authorizes has been proven byte-for-byte.
#
# Idempotent: re-running replaces the installed files.
#
# This script is NOT executed by the audit task and is safe to read-only review.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "error: must be run as root" >&2; exit 2; }

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
MANIFEST_SRC="$HERE/SHA256SUMS"
OPS_DIR=/usr/local/lib/company-os/bifrost-ops
SBIN=/usr/local/sbin/company-os-bifrost-ops
SUDOERS=/etc/sudoers.d/company-os-bifrost-ops
SEED_SRC="$REPO/evidence/runs/bifrost-seeds"
LAUNCHER_SRC="$REPO/deploy/sbin/company-os-bifrost-ops"
SUDOERS_SRC="$REPO/deploy/sudoers.d/company-os-bifrost-ops"

command -v visudo >/dev/null || { echo "error: visudo not found" >&2; exit 2; }

# Expected digest for a repository-relative path, from the reviewed manifest.
expected() { awk -v f="$1" '$2 == f { print $1 }' "$MANIFEST_SRC"; }

# Fail closed: remove anything this script installed for code (never the
# pre-existing backup/seeds), so a failed install cannot leave root-owned,
# sudo-authorized code behind.
rollback_install() {
  echo "error: installed digest verification failed; removing installed code" >&2
  rm -rf "$OPS_DIR" "$SBIN" "$SUDOERS"
  exit 3
}

# Compare an installed file's digest to the manifest entry for its source path.
verify_installed() {
  local rel="$1" dest="$2" want got
  want="$(expected "$rel")"
  [ -n "$want" ] || { echo "error: no manifest digest for $rel" >&2; rollback_install; }
  got="$(sha256sum "$dest" | awk '{ print $1 }')"
  [ "$got" = "$want" ] || {
    echo "error: installed digest mismatch" >&2
    echo "  file:     $dest" >&2
    echo "  expected: $want" >&2
    echo "  actual:   $got" >&2
    rollback_install
  }
}

# 1. Verify the exact reviewed SOURCE bytes (fail fast, before any write).
echo "== verifying source digests =="
( cd "$REPO" && sha256sum --check "$MANIFEST_SRC" ) \
  || { echo "error: source digest mismatch; refusing to install" >&2; exit 3; }

# 2. Install root-owned code + seeds.
echo "== installing root-owned operations =="
install -d -o root -g root -m 0755 /usr/local/lib/company-os
install -d -o root -g root -m 0755 "$OPS_DIR"
install -d -o root -g root -m 0755 "$OPS_DIR/seeds"
install -o root -g root -m 0644 "$REPO/tools/bifrost_ops.py"            "$OPS_DIR/bifrost_ops.py"
install -o root -g root -m 0644 "$REPO/tools/backup_bifrost_state.py"   "$OPS_DIR/backup_bifrost_state.py"
install -o root -g root -m 0644 "$REPO/tools/rollback_bifrost_state.py" "$OPS_DIR/rollback_bifrost_state.py"
install -o root -g root -m 0644 "$SEED_SRC/step1-auth.json"                "$OPS_DIR/seeds/step1-auth.json"
install -o root -g root -m 0644 "$SEED_SRC/step2-auth-plus-providers.json" "$OPS_DIR/seeds/step2-auth-plus-providers.json"
install -o root -g root -m 0755 "$LAUNCHER_SRC" "$SBIN"

# 3. Verify the INSTALLED bytes (closes the verify->copy TOCTOU).
echo "== verifying installed digests =="
verify_installed tools/bifrost_ops.py            "$OPS_DIR/bifrost_ops.py"
verify_installed tools/backup_bifrost_state.py   "$OPS_DIR/backup_bifrost_state.py"
verify_installed tools/rollback_bifrost_state.py "$OPS_DIR/rollback_bifrost_state.py"
verify_installed evidence/runs/bifrost-seeds/step1-auth.json                "$OPS_DIR/seeds/step1-auth.json"
verify_installed evidence/runs/bifrost-seeds/step2-auth-plus-providers.json "$OPS_DIR/seeds/step2-auth-plus-providers.json"
verify_installed deploy/sbin/company-os-bifrost-ops "$SBIN"

# 4. Sudoers — validated AND digest-verified, installed LAST (only after the
#    code it authorizes is proven byte-for-byte).
echo "== installing sudoers (validated + verified) =="
visudo -cf "$SUDOERS_SRC" >/dev/null || { echo "error: sudoers fragment failed validation" >&2; exit 3; }
install -o root -g root -m 0440 "$SUDOERS_SRC" "$SUDOERS"
verify_installed deploy/sudoers.d/company-os-bifrost-ops "$SUDOERS"

# 5. Report the frozen digests (evidence for the audit trail).
echo "== installed (root-owned, digest-verified) =="
sha256sum "$SBIN" "$OPS_DIR"/*.py "$OPS_DIR"/seeds/*.json "$SUDOERS"
echo "== effective privilege =="
sudo -l -U "$(logname 2>/dev/null || echo genie)" 2>/dev/null | grep company-os-bifrost-ops || true
echo "done."
