# Company OS Design Tokens

**Status:** Contract active — canonical in `DESIGN_TOKENS.yaml`; 104 of 126 tokens are founder-approved (`VALID_APPROVED`), 22 remain `VALID_PENDING_DECISION` (governing decision pending/ownerless under GOV-004). Individual approval is not package approval; unresolved decisions (26.1, 26.5, 26.9, 26.11) keep the package unapproved as a whole. (26.16 was approved 2026-10-10: §8.5 contract restated verbatim; Penpot Cloud.)

## Purpose

This document defines the token architecture. It deliberately does **not** invent final brand values where the audit identifies an unresolved owner decision.

## Authority

**Canonical token data:** `docs/design/DESIGN_TOKENS.yaml` (machine-readable, versioned). This document is the architecture prose; the YAML file is the contract. Penpot variables and frontend CSS custom properties are downstream representations and must use the same token names and values.

**Location and authority — resolved (26.17, approved 2026-10-08):** the in-repository `docs/design/` package is the **canonical design-system location** (tokens, human-readable specifications, manifest, Penpot mapping). Validators live under `tools/`. **Git history in the Company OS repository is the source of truth; there is no separate design repository or external authority.** The founder is accountable and retains sole approval authority; agents may propose and implement changes through the established review workflow but cannot self-approve decisions. This resolution also fixes the storage-format decision (GOV-007) without changing approved token values or bypassing pending decisions.

The direction is:

```
Founder decision  (docs/design/DESIGN_DECISIONS.md — decision register)
      ↓
Canonical token data  (docs/design/DESIGN_TOKENS.yaml)
      ├──→ Penpot variables
      └──→ frontend CSS/design tokens
```

## Naming scheme

Structure: `<layer>.<domain>.<role>[.<variant>]` — e.g. `semantic.color.bg.canvas`, `component.card.border`.

- Layers: `primitive` → `semantic` → `component` (components alias semantics; semantics alias primitives or stay null-pending).
- Domains per layer are constrained by the naming patterns declared in `DESIGN_TOKENS.yaml` (`naming` block).
- Token names are stable identifiers: never reused after deletion.

## Status model (tri-state)

Every token resolves to exactly one of:

| Classification | Meaning |
|---|---|
| `VALID_APPROVED` | Structure + contrast valid **and** its governing decision is `APPROVED` with evidence. |
| `VALID_PENDING_DECISION` | Structure valid; governing decision pending (or no decision owner yet), **or** the token is an explicit founder-deferred scope carve-out (`pending_separate_approval: true`) under an approved decision. |
| `INVALID` | Structural/alias/naming violation, unknown decision reference, or an approved decision whose value fails a blocking threshold. A null value under an approved decision is `INVALID` unless it carries the explicit `pending_separate_approval: true` carve-out; setting that marker on a token that has a value, or to any value other than `true`, is also `INVALID`. |

Agents never set `APPROVED`. Approval is a founder edit to the decision register block in `DESIGN_DECISIONS.md` §5 (`status`, `approval`, `approved_date`, `approval_evidence`).

A **scope carve-out** records that the founder approved a decision while explicitly deferring part of its token scope (e.g. on 2026-10-08 decision 26.3 was approved for the neutral foundation while the accent/action/focus hue was deferred to a separate approval). Carved-out tokens stay `VALID_PENDING_DECISION`, are warned on every validator run, and must never be consumed as production values. The 26.3 hue carve-out was separately resolved by the founder on 2026-10-09 (**Option 1 — neutral-derived monochrome**); see §3 26.3 in `DESIGN_DECISIONS.md`.

## Validation

```sh
python3 tools/validate_design_tokens.py          # tri-state classification + WCAG contrast matrix
python3 tools/validate_design_tokens.py --verbose  # per-token lines
```

Exit `0` only when there are no `INVALID` findings. Open defects (A11Y-004) and not-run contrast pairs are reported honestly — they are never counted as passes.

## Theme architecture (26.4 — light + dark, approved 2026-10-08)

The contract carries a **theme dimension** for colour. Both themes must satisfy WCAG 2.2 AA.

- **Light is the canonical production theme**; **dark is a complete** semantic palette over the *same* roles — not a placeholder.
- **Resolution happens at the semantic colour layer.** Primitives are shared raw values (`primitive.color.*` light, `primitive.color.dark-*-raw` dark). Semantic colour tokens carry `value` (light) and `value_dark` (dark). Components **inherit** by aliasing a semantic colour token; a component may never carry its own light-only literal (the validator enforces this — `validate_theme_coverage`).
- **Preference:** `prefers-color-scheme` provides the initial preference; the product shell may apply an explicit override.
- **Status (2026-10-09):** the interactive hue family (`accent`, `action.*`, `focus.ring`, `fg.inverse`, `status.text-color`) was carved out under 26.3; the founder separately approved it on 2026-10-09 (**Option 1 — neutral-derived monochrome**), so **light and dark values land together** and the six roles are `VALID_APPROVED`. The carve-out's historical record remains in §3 26.3.
- **Open obligations (not passes):** visual regression must cover both themes once rendered UI exists; dark-mode CSS counts against the 26.15 performance budget (CSS ≤ 15 KB, transfer ≤ 100 KB); overlays/scrims have no hex-only token today and land with the overlay component under the interactive scope.

## Token layers

### Primitive tokens

Raw design values with no component meaning.

- colour primitives
- font families
- font sizes
- font weights
- line heights
- spacing units
- radii
- border widths
- shadows
- motion durations/easing
- breakpoints
- icon sizes
- z-index layers

### Semantic tokens

Meaningful roles consumed by components and pages.

Examples:

```text
color.bg.canvas
color.bg.surface
color.bg.subtle
color.fg.default
color.fg.muted
color.fg.inverse
color.border.subtle
color.border.default
color.border.strong
color.action.primary
color.action.primary-hover
color.focus.ring

type.family.body
type.family.mono
type.size.body
type.size.lead
type.size.h1 … type.size.h6
type.weight.regular / medium / semibold / bold
type.leading.body / tight / relaxed

space.1 … space.n
radius.sm / md / lg / pill
shadow.none / low / medium / high
motion.fast / normal / slow
focus.ring
z.base / dropdown / sticky / overlay / modal
icon.sm / md / lg
breakpoint.sm / md / lg / xl
```

These names are a naming proposal derived from audit §21, not permission to invent final values.

## Current values that must be treated as evidence, not approved tokens

The current site contains raw values including `#151515`, `#fafafa`, `#ffffff`, `#dddddd`, `#bbbbbb`, `#111111`, `#555555`, spacing literals, 14px/999px radii and a 980px container. These are baseline evidence only. They are not automatically the new design system.

The audit records the existing `#bbb` badge border as approximately 1.9:1 against white, below the WCAG 2.2 non-text 3:1 target. The replacement must be selected through the approved palette/contrast process.

## Required invariants

1. No unexplained raw colour literals in component/page CSS once token conformance is active.
2. No component-specific magic spacing where a declared token exists.
3. Semantic roles are preferred over primitive values in component implementation.
4. Focus indication must be visible and must not depend on colour alone.
5. Text contrast targets at least 4.5:1 for normal text and 3:1 for large text where applicable; non-text contrast targets 3:1.
6. Interactive target sizes meet the programme's responsive/accessibility contract.
7. Reduced-motion behavior is defined before motion ships.
8. Breakpoints are approved before being treated as canonical values.
9. Token names are identical in the canonical file, CSS mapping and Penpot variable mapping.
10. A token change requires visual/accessibility regression verification before release.

## Approval gates

Before final token values are committed:

- palette decision recorded
- typography/font strategy recorded
- spacing/geometry reviewed
- breakpoint values recorded
- motion budget recorded
- contrast matrix passes
- founder approval recorded

No Penpot foundation is allowed to originate an unapproved token value.
