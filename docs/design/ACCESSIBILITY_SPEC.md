# Company OS Accessibility Specification

**Target:** WCAG 2.2 Level AA.

**Status:** Contract established; implementation and verification pending.

## Non-negotiable requirements

- Semantic HTML first.
- One logical page heading and no skipped heading levels.
- Unique, correctly labelled landmarks.
- Full keyboard operation.
- Visible focus indication.
- Logical focus order.
- Programmatic form labels, instructions and errors.
- Status/error information available without relying on colour.
- Text and non-text contrast meet the declared WCAG thresholds.
- Reduced-motion support.
- 200% zoom and 400% reflow verification.
- Accessible names for icon-only controls.
- Consistent navigation across pages.
- Reversible/destructive actions receive the appropriate confirmation/prevention treatment.

## Current known defect

A11Y-004 — the status badge border. It used `#bbb` against `#fff` (audit: ≈1.9:1, below the 3:1 non-text target). **Repaired 2026-10-08** under the approved 26.3 palette decision: the badge border is now `#767676` (4.54:1 on `#ffffff`, 4.35:1 on `#fafafa`) via `semantic.color.border.default`. The contrast matrix therefore reports `DEFECT_CLOSED_PENDING_REVIEW`; the defect is **not fully closed** until the rendered result passes visual review. `#bbbbbb` is retired from active token use and preserved as historical evidence in `DESIGN_DECISIONS.md` §3 26.3.

## Component / page accessibility matrix (Gate 2)

Requirement codes map to the manifest families in `COMPONENT_DEPENDENCIES.yaml` and the templates in `PAGE_TEMPLATE_MAP.yaml`. "—" means not applicable by rule, never "unchecked".

### Component families

| Family | Layer | Keyboard | ARIA / roles | Focus-visible | Explicit states (R4) | Contrast (non-text) | Notes |
|---|---|---|---|---|---|---|---|
| COMP-SPC | L1 | — | — | — | — | — | R2: no interaction semantics |
| COMP-TXT | L1 | links → ACT | — | links → ACT | — | text tokens | R2; text contrast via token matrix |
| COMP-ACT | L2 | required | required (icon-only names) | required | required | 3:1 boundary/focus | ACT-06 labelled icon buttons |
| COMP-FBK | L2 | dismiss controls | status/alert roles | required where actionable | required (dismissible) | 3:1 indicators; status ≠ colour alone | FBK-13 PASS/BLOCKED/FAIL/SKIP |
| COMP-FRM | L2 | required | labels/instructions/errors | required | required + error | 4.5:1 text; 3:1 borders | 17.2 form rules |
| COMP-SEL | L2 | required | fieldset/legend, group roles | required | required + error | 3:1 boundaries | pairs with FRM labels |
| COMP-NAV | L2 | required | nav/banner/contentinfo | required | disclosure states | text + 3:1 | unique landmarks (test-enforced) |
| COMP-CON | L2 | — (layout) | landmark structure in CON-07 | — | — | 3:1 layout boundaries | shell owns nav/main/footer |
| COMP-DAT | L2 | sort/filter keys | table/headers semantics | required on controls | required | 3:1 borders; scrollable labelled | RESP-007 overflow pattern |
| COMP-OVL | L2 | required | dialog/menu roles | required (OVL-08: trap, Esc, restore) | required | 3:1 backdrop/focus | focus management contract |
| COMP-SYS | L2 | — (labels) | text always accompanies colour | — | — | 4.5:1 labels | SYS-06: BLOCKED distinct from FAIL |
| PATTERN-INTAKE-FORM | L3 | inherits L2 | inherits L2 | inherits L2 | inherits L2 | inherits L2 | R3: no internal reach-through |
| PATTERN-CONFIRMATION-DIALOG | L3 | inherits L2 | inherits L2 | inherits L2 | inherits L2 | inherits L2 | confirmation before destructive |
| PATTERN-EMPTY-STATE | L3 | inherits L2 | inherits L2 | inherits L2 | inherits L2 | inherits L2 | — |

### Page templates

| Template | Landmarks + single h1 (TEST-001) | Keyboard walk | Forms | 200% zoom / 400% reflow | Manual protocol (TEST-013) |
|---|---|---|---|---|---|
| Landing | required | required | — | required | required (P0/P1) |
| Marketing | required | required | — | required | required (P0/P1) + breadcrumb (17.3) |
| Content | required | required | — | required | required (P0/P1) + breadcrumb (17.3) |
| Form | required | required | required (PAGE-010) | required | required (P0/P1) + error-recovery script |
| Utility | required | required | — | required | required (P0/P1) |
| Excluded | not implemented (§25) | — | — | — | — |

## Measured contrast matrix (deterministic — `tools/validate_design_tokens.py`)

Both themes must satisfy WCAG 2.2 AA (26.4, approved 2026-10-08 — option B: light + dark).

| Pair | Theme | Measured | Required | Enforcement | Status |
|---|---|---:|---:|---|---|
| text-on-canvas | light (`#151515` / `#fafafa`) | 17.5:1 | 4.5:1 | blocking | PASS (26.3 approved) |
| text-on-canvas | dark (`#f2f2f2` / `#0f0f0f`) | 17.12:1 | 4.5:1 | blocking | PASS (26.4 approved) |
| muted-text-on-canvas | light (`#555555` / `#fafafa`) | 7.14:1 | 4.5:1 | blocking | PASS (26.3 approved) |
| muted-text-on-canvas | dark (`#a9a9a9` / `#0f0f0f`) | 8.16:1 | 4.5:1 | blocking | PASS (26.4 approved) |
| text-on-surface | light (`#151515` / `#ffffff`) | 18.26:1 | 4.5:1 | blocking | PASS (26.3 approved) |
| text-on-surface | dark (`#f2f2f2` / `#1a1a1a`) | 15.55:1 | 4.5:1 | blocking | PASS (26.4 approved) |
| badge-border-on-surface | light (`#767676` / `#ffffff`) | 4.54:1 | 3.0:1 | tracked defect | **DEFECT_CLOSED_PENDING_REVIEW — A11Y-004** |
| badge-border-on-surface | dark (`#8f8f8f` / `#1a1a1a`) | 5.38:1 | 3.0:1 | tracked defect | **DEFECT_CLOSED_PENDING_REVIEW — A11Y-004** |
| strong-border-on-canvas | light (`#111111` / `#fafafa`) | 18.09:1 | 3.0:1 | blocking | PASS (26.3 approved) |
| strong-border-on-canvas | dark (`#e5e5e5` / `#0f0f0f`) | 15.22:1 | 3.0:1 | blocking | PASS (26.4 approved) |
| subtle-border-on-canvas | light (`#8f8f8f` / `#fafafa`) | 3.10:1 | 3.0:1 | blocking | PASS (26.3 approved) |
| subtle-border-on-canvas | dark (`#6b6b6b` / `#0f0f0f`) | 3.60:1 | 3.0:1 | blocking | PASS (26.4 approved) |
| focus-ring-on-canvas | light (`#151515` / `#fafafa`) | 17.50:1 | 3.0:1 | blocking | PASS (26.3 hue approved 2026-10-09) |
| focus-ring-on-canvas | dark (`#f2f2f2` / `#0f0f0f`) | 17.12:1 | 3.0:1 | blocking | PASS (26.4 approved) |

`DEFECT_CLOSED_PENDING_REVIEW` = the repair value now passes (4.54:1 light / 5.38:1 dark), but the defect is not fully closed until the rendered result passes visual review. A11Y-004's retired value `#bbbbbb` (1.92:1) is preserved as historical evidence in `DESIGN_DECISIONS.md` §3 26.3. `NOT_RUN` is never reported as pass. The focus ring, accent/action, `fg.inverse` and `status.text-color` roles were the carved-out interactive hue family; the founder separately approved them on 2026-10-09 (**26.3 Option 1 — neutral-derived monochrome**), so their light and dark values now land together and the focus row above measures PASS. Rendered focus/action visual review remains an outstanding item — contrast ratios are evidence, not visual approval. `NOT_RUN` stays meaningful only when a required measured value is genuinely absent.


## Imagery and alternative text policy (26.14 — abstract SVG only)

Imagery strategy: **abstract, purpose-built SVG illustrations and diagrams only; no photography or stock imagery in v1** (decision 26.14, approved 2026-10-08). The brand stays text-led; SVG illustrations never substitute for the separately approved brand mark (26.1/BRAND-009).

**Decorative vs informative alt text (policy in force before any imagery is published — A11Y-008, WCAG 1.1.1):**

- **Informative image** (conveys information not in adjacent text) → must have a concise, purpose-written `alt` describing the information.
- **Decorative image** (purely visual, no information) → `alt=""` (empty) and `role="presentation"` so assistive tech skips it; never omit the attribute.
- **Complex diagram** (information exceeds a short alt) → short `alt` plus an adjacent text description (prose or figure caption, COMP-CON-11); the description is content, owned and reviewed like content.
- **Alt text is never invented for an asset no one has seen** — it is authored against the actual, approved asset.
- **No text baked into SVG** where it would duplicate or contradict accessible text; meaningful diagram labels must be real text or have a text equivalent.

**Assets:** every externally sourced asset records **provenance + licence** (GOV-013) before entering the repo; **founder approval is required before any asset is published**; assets count against the approved performance budgets (26.15) and reserve aspect ratios (RESP-008) to protect CLS.

## Verification layers

### Automated

- axe-core
- contrast checks
- HTML validation
- link integrity
- existing Company OS site-content invariants

### Manual

- keyboard-only protocol
- screen-reader protocol using VoiceOver and NVDA
- focus order
- form error recovery
- zoom/reflow
- P0/P1 template review

## Completion rule

No component or page is complete on visual/model judgement alone. Required automated checks must pass, and P0/P1 work requires recorded manual verification. Failures must be represented honestly as FAIL or BLOCKED; they are never silently skipped.
