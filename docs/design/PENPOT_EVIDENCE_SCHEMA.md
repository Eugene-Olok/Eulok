# Company OS — Penpot Evidence Schema

**Status:** Offline tooling; decision 26.16 was approved 2026-10-10 (contract restated verbatim, Penpot Cloud) — this schema governs evidence for live runs once the founder creates/connects the Company OS file.

This document defines the evidence records the Penpot offline toolchain produces
and the rules that keep them honest and free of secrets. It is deliberately
narrow: it describes structure and identity, never connectivity. No live Penpot
operation may be recorded as VERIFIED evidence until the Company OS design file
exists, is connected, and an approved workflow performs and reads back the operation.

## Scope

Applies to the offline Phase D tooling:

| Tool | Role |
| --- | --- |
| `tools/validate_penpot_map.py` | structural validation of the implementation map against the canonical contract |
| `tools/plan_penpot_ops.py` | deterministic, reproducible operation plan from declared mappings |
| `tools/compare_penpot_readback.py` | pure comparison of a plan against a read-back observation |
| `tools/penpot_evidence.py` | redacted evidence record construction and validation |

These tools never connect to Penpot. A Penpot MCP server being unavailable is
irrelevant to them.

## States

An evidence record carries exactly one state:

| State | Meaning |
| --- | --- |
| `PLANNED` | a deterministic plan was generated from approved canonical inputs; nothing was executed |
| `VERIFIED` | *intended* meaning: a live read-back was performed and every declared field matched. A structurally valid record alone does not establish this — see below. |
| `BLOCKED` | a live read-back was attempted or required but could not confirm (missing/ambiguous observation, mismatch, or a live path that is not established) |
| `NOT_RUN` | nothing was executed — the honest default when no approved live run exists |

`VERIFIED` is not reachable from repository inputs alone. Constructing a
`VERIFIED` record requires an explicit `performed: true` and a non-empty
`observation_ref`; without both, validation fails.

**Structural validation is not provenance.** Both of those fields are
caller-supplied. A `VERIFIED` record that passes validation only proves the
record is *shaped* correctly — it is **not** proof that an execution or read-back
occurred, and the offline toolchain must never present it as such. Provenance
requires an approved live workflow that independently records the observation
referenced by `observation_ref`; the offline toolchain neither provides nor can
enforce that.

## Record shapes

Plan evidence (state `PLANNED`):

```json
{
  "schema_version": 1,
  "state": "PLANNED",
  "plan_hash": "<sha256 over the canonical plan body>",
  "op_count": 0,
  "source": { "readiness_state": "BLOCKED" },
  "operations": []
}
```

Read-back evidence:

```json
{
  "schema_version": 1,
  "state": "NOT_RUN",
  "plan_hash": "<sha256>",
  "performed": false,
  "observation_ref": null,
  "findings": []
}
```

Read-back comparison status maps to a state as: `VERIFIED → VERIFIED`,
`MISMATCH → BLOCKED`, `BLOCKED → BLOCKED`, and any unperformed comparison →
`NOT_RUN`.

## Redaction

Redaction is recursive and covers, in every record:

- values whose mapping key names a secret (`token`, `secret`, `password`,
  `credential`, `authorization`, `…_token`, `…_secret`, …) → `[REDACTED]`;
- mapping keys whose own text looks like a credential (a fixed prefix/shape
  allowlist: `sk-…`, `ghp_…`, JWTs, PEM headers, …) — the key is replaced with
  `[REDACTED]` (two such keys in one mapping collapse to one entry);
- strings carrying a credential-bearing URL — userinfo with or without a
  password (`scheme://user@host`, `scheme://user:pass@host`: safe characters,
  including the colon and encoded `%40`, are preserved before the `@`) on the
  allowlisted schemes `http`, `https`, `ws`, `wss`, `postgres`, `postgresql`
  and `penpot`, or a token-bearing query parameter (`access_token=`, `token=`,
  `apikey=`, …, but not the ambiguous bare `key=`) → `[REDACTED]`;
- inline bearer credentials (`Bearer <token>`, any case) → `[REDACTED]`;
- standalone `<token-param>=<value>` fragments outside a URL → the value is
  replaced with `[REDACTED]`.

### Known limitations

This is a fixed allowlist, **not** a general secret detector. It does not
detect: credentials on unlisted schemes, HTTP `Basic` auth, bare high-entropy
strings with no recognizable prefix, secret-like keys in unknown formats, or a
credential split across several records. Validation flags a record that still
contains a covered class and never echoes the offending key or value. Callers
must never rely on redaction as the only control, and must never place a live
workspace URL or credential in repository evidence.

## Fail-closed guarantees

- The map validator treats an undeclared mapping as **not evidence of
  implementation**; entries require attached verification evidence and, while
  readiness is `BLOCKED`, are reported as a warning rather than silently
  accepted.
- The planner refuses unknown ids, non-implementable statuses, layer/template
  mismatches, and any token that is not `VALID_APPROVED`. Refusals are recorded,
  never dropped.
- The comparator returns `BLOCKED` — never a pass — on a missing, ambiguous, or
  unexpected observation, or when the plan declares no operations (a vacuous
  pass is disallowed).
- The plan hash is `sha256` over canonical JSON of `{schema_version, source,
  operations, refusals}`, excluding run metadata and absolute paths, so the same
  inputs yield the same hash on any machine.

## Gate

`scripts/gates.sh` runs `tools/validate_penpot_map.py` as the
`penpot map (offline)` check. An empty map passes with an explicit
`workspace: N/A` line; it does not assert that Penpot has been used.

## Relationship to decision 26.16

Decision 26.16 is **APPROVED (2026-10-10)**: the founder restated the §8.5 Penpot
contract verbatim and selected Penpot Cloud (`DESIGN_DECISIONS.md` §3 26.16), so the
`PENPOT_IMPLEMENTATION_MAP.yaml` readiness state is now `PARTIAL` (BLOCKER-1/2
resolved; only the 22-pending-token exclusion remains open). This schema therefore
governs how a live approved run must record its evidence. It does not itself authorise
a run: no Company OS file exists yet, so nothing is recorded as VERIFIED until the
founder creates and connects the file and an operation is performed and read back.
Everything that can be decided without a live workspace stays deterministic and offline.
