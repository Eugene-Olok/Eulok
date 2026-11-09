# Company OS Responsive Specification

**Status:** Breakpoint values approved 2026-10-08 (§26.8 option A); the responsive contract is **not complete** until actual behaviour is validated (see verification matrix).

## Principles

- Mobile-first.
- Base layout must work from 320px.
- Reflow at 400% zoom without two-dimensional scrolling for ordinary content.
- Never reduce page gutters below 16px.
- Preserve readable text measure.
- Media is constrained to its container and preserves aspect ratio.
- Wide data surfaces use labelled, keyboard-accessible horizontal scrolling rather than page-level overflow.
- Motion and transitions respect reduced-motion preferences.

## Breakpoint contract (approved 2026-10-08 — §26.8 option A)

CSS pixels are canonical. Approximate em equivalents (16px reference) are supporting documentation only — **not** a second independent source of truth.

| Token | Minimum (canonical, px) | ≈ em @16px | Intent |
|---|---:|---:|---|
| sm | 480px | ≈30em | large phones / modest gutter increase |
| md | 768px | ≈48em | tablet / navigation capability change |
| lg | 1024px | ≈64em | desktop composition |
| xl | 1440px | ≈90em | wide-screen behavior |

These are **layout breakpoints, not device restrictions**: components must remain fluid between breakpoints and support 320px viewports, 400% zoom/reflow and accessible keyboard interaction.

Canonical breakpoint values live in `DESIGN_TOKENS.yaml` (`primitive.breakpoint.*` → `semantic.breakpoint.*`, decision 26.8, now `VALID_APPROVED`). Validation: `tools/validate_design_tokens.py`. **Approval of the values does not complete the responsive contract** — actual responsive behaviour must be validated (below).

## Layout invariants

- Minimum horizontal gutter: 16px.
- Existing container cap: 980px is CURRENT evidence, not automatically the final system value.
- Grid behavior must avoid fixed-width overflow.
- Touch targets: 44×44 CSS px recommended; never below the applicable WCAG 2.2 minimum.
- Heading hierarchy remains semantic and independent of visual size.
- Tables and other wide content remain keyboard navigable.

## Verification matrix

Every P0/P1 page/template must be checked at:

- 320px baseline
- approved breakpoint boundaries
- representative desktop width
- 1440px+ wide viewport
- 200% zoom
- 400% zoom/reflow where applicable
- reduced-motion preference

Evidence is required for failures and for final passes. Responsive correctness is not inferred from one desktop screenshot.
