# Component Specification Contract

**Status:** IMPLEMENTED_AND_TESTED (offline) · **Schema version:** 1
**Enforces:** `tools/design_spec.py` · **Consumed by:** `tools/compile_design.py`
**Live Penpot effect:** none — decision 26.16 is approved, but execution stays
gated (fail-closed `preflight`: no verified target, no write authorization, RPC
reachability blocked by a Cloudflare challenge).

## Why this exists

`DESIGN_MANIFEST.yaml` carries *what* components exist (ids, status, priority,
basis) but not *how* they are built. A Penpot component needs anatomy: nodes,
layout, token bindings, variants, states, accessibility, and dependencies.

This contract adds **only that missing structure**. It is deliberately **not a
second source of truth**:

| Fact | Owned by | Not restated here |
|------|----------|-------------------|
| component identity, status, priority | `DESIGN_MANIFEST.yaml` | id is *referenced*, never redefined |
| canonical token names and values | `DESIGN_TOKENS.yaml` | tokens are referenced by name only |
| family layer, dependency rules | `COMPONENT_DEPENDENCIES.yaml` | `layer` must equal the graph's |
| page ↔ template mapping | `PAGE_TEMPLATE_MAP.yaml` | `page_target` references a map row |

If a spec disagrees with any of those files, the spec is wrong and is rejected.

## Location and discovery

Specs live in `docs/design/component-specs/*.yaml`. `--dir` discovers them
recursively (sorted); `--spec` selects explicit files. The compiler reads the
same set.

## Document shape

```yaml
schema_version: 1
kind: component-spec
component:
  id: COMP-ACT-01                 # known COMP-* manifest id, implementable status
  name: "Button / Primary"        # unique across the spec set; Penpot component name
  layer: L2                       # == graph family layer for the id's family
  page_target: PAGE-001           # PAGE-* id present in PAGE_TEMPLATE_MAP
  variants: [size-default, size-compact]
  states: [default, hover, focus-visible, active, disabled]
  tokens: [ <canonical token name>, ... ]     # exactly the referenced set
  accessibility:
    role: button
    name_from: content
    min_target: semantic.space.card-padding   # optional token
  dependencies: [COMP-SPC-01]     # implementable COMP-* ids; no self-reference
  anatomy:
    - node: root
      type: frame
      fill: semantic.color.action.primary
      radius: semantic.radius.md
      sizing: {width: hug, height: hug}
      layout:
        direction: row
        align: center
        padding: semantic.space.card-padding
      children:
        - node: label
          type: text
          content: "Get started"
          fill: semantic.color.fg.inverse
          text:
            family: semantic.type.family.body
            size: semantic.type.size.body
            weight: semantic.type.weight.bold
            line_height: semantic.type.leading.body
```

## Node vocabulary

`type` is one of `frame, group, rect, ellipse, line, text`. Only `frame` and
`group` may carry `children`. Token-carrying fields by type:

| type | colour tokens | size tokens |
|------|---------------|-------------|
| frame | `fill`, `stroke` | `radius`, `stroke_width` |
| rect | `fill`, `stroke` | `radius`, `stroke_width` |
| ellipse | `fill`, `stroke` | `stroke_width` |
| line | `stroke` | `stroke_width` |
| text | `fill` | — (uses the `text` block) |
| group | — | — |

Common blocks (all optional unless noted):

- `effects`: list of shadow tokens.
- `sizing`: `{width: fixed|hug|fill, height: fixed|hug|fill}`.
- `layout`: `{direction: row|column, align: start|center|end|space-between|space-around, gap: <token>, padding: <token> | {top,right,bottom,left}: <token>}`.
- `text` (text nodes only): `family`, `size`, `weight` (required), `line_height` (optional) — all tokens. Text nodes also require a non-empty `content` and may not have `children`.

`node` ids match `^[a-z][a-z0-9-]*(\.[a-z0-9-]+)*$` and are unique within a spec.

## Validation rules (fail-closed)

1. `schema_version == 1` and `kind == "component-spec"`.
2. `component.id` is a known `COMP-*` manifest id with an implementable status
   (`CURRENT` or `REQUIRED`).
3. `component.layer` equals the id's family layer from `COMPONENT_DEPENDENCIES.yaml`.
4. Every referenced token is a canonical token classified **`VALID_APPROVED`**
   — pending/unknown tokens are rejected.
5. Token references are **complete and non-dead**: every anatomy token appears
   in `component.tokens`, and every declared token is used.
6. **No raw colour literals** (`#rrggbb`) anywhere — components consume tokens
   only (TEST-012).
7. **L1 primitives never declare interaction states** (dependency-graph rule R2).
8. `states` ⊆ the contract state model (`default, hover, focus-visible, active,
   disabled, validation, error, success, loading`).
9. `component.name` is unique across the spec set; `component.id` is unique.
10. `accessibility.role` ⊆ a conservative ARIA allowlist; `name_from` ⊆
    `{content, label, aria-label, aria-labelledby, title}`.
11. `page_target`, when present, is an implementable, non-`OUT_OF_SCOPE` `PAGE-*`
    id present in the page/template map.
12. `dependencies` reference implementable `COMP-*` ids; self-dependency is
    rejected.
13. **Strict schema:** any property outside the contract's allowlists — at the
    top level, `component`, `accessibility`, `layout`, `sizing`, `text`, or a
    node's type-specific vocabulary — is rejected. A field not supported for a
    node type (for example `fill` on a `group`) fails closed rather than being
    silently ignored.

## CLI

```
python3 tools/design_spec.py --dir docs/design/component-specs
python3 tools/design_spec.py --spec docs/design/component-specs/COMP-ACT-01.yaml
```

Exit codes: `0` all specs valid · `1` findings · `2` could not load inputs
(including a broken token contract — specs are never validated against a
non-loadable source of truth).

## Honesty

Validation proves the **specification** is consistent with the repo contract.
It is **not** evidence that any Penpot artefact exists. Per decision 26.16, repo
is authoritative and Penpot is downstream; this contract compiles to *operations*
that still require a verified, human-approved target to execute.
