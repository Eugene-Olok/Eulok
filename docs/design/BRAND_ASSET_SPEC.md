# Company OS — Brand Asset Specification

**Status:** `DECIDED` — decision **26.1** (option A, wordmark-only, founder-approved 2026-10-11).
This document is a **specification only**. It contains **no artwork**. The canonical mark is the
typeset text wordmark `COM-OS`; no symbol exists and none is required. No symbol, alternate wordmark
rendering, favicon, apple-touch icon, or Open Graph image may be invented, drafted, or published by an
agent — such derivations are the founder's to produce or commission, then review and approve.

## 1. Scope and authority

- **Canonical brand mark:** the exact text wordmark `COM-OS` (typeset). It is the entire mark — there
  is **no symbol**, not alongside and not standalone.
- **Product/company name:** `Company OS` is retained in page metadata (`<title>`, `og:title`) and in
  prose. It is the deploy-gate-pinned product string (`scripts/deploy-site.sh`); it is **not** the logo.
  The distinction is deliberate: logo wordmark `COM-OS`, product name `Company OS`.
- **Single lockup:** decision **26.5** (approved 2026-10-11) fixes **one lockup, no variants**
  (no stacked / horizontal / reversed lockup). The lockup *is* the typeset `COM-OS` wordmark.
- **Approval gate:** any *artwork* derivation (favicon/OG/app icon) is founder-reviewed and approved
  before it is produced. No such artwork exists today and none is produced by this decision.
- **Token authority:** the wordmark consumes existing semantic colour roles; it does **not** create
  tokens. Ink = `semantic.color.fg.default`; surface = `semantic.color.bg.canvas` /
  `semantic.color.bg.surface` per theme (see `DESIGN_TOKENS.yaml`).

## 2. The mark (as decided)

| Property | Value |
|---|---|
| Mark | exact text `COM-OS` |
| Kind | typeset wordmark (no symbol, no icon) |
| Typeface | the approved system font stack (decision 26.2) |
| Lockup | single lockup, no variants (decision 26.5) |
| Where it appears | site nav wordmark (`business/site/index.html`) |
| Rendered by | plain HTML text (`<strong>COM-OS</strong>`) — no image, no font file |

## 3. Asset specifications (for any future derivation)

These apply **only** if/when the founder derives an icon or social image from the wordmark. Nothing
here is produced by this decision.

- **Wordmark text:** literal `COM-OS`, uppercase, hyphen — no alternate casing, spacing, or glyph set.
- **Colour:** one flat ink colour per variant (no gradients, no effects). Ink uses
  `semantic.color.fg.*` neutral roles for the master; the carved-out interactive hue is not used until
  that family is separately approved.
- **Derived icon candidates (future):** an `.ico` bundle (16/32/48), an SVG favicon with
  `prefers-color-scheme` media queries, apple-touch 180, maskable 192/512.
- **Naming (future):** `brand/icon/{favicon.ico,icon-*.png}` if such artwork is ever produced.

## 4. Contrast requirements (WCAG 2.2 AA) — applies to any rendered derivation

- Any rendered mark/icon must meet **≥ 3:1** non-text contrast against every surface it is placed on,
  in both themes (light: `#fafafa` canvas / `#ffffff` surface; dark: `#0f0f0f` canvas / `#1a1a1a` surface).
- Where a single ink colour cannot satisfy both themes, a reversed variant is used.
- The nav wordmark is normal text and is checked as text contrast, not non-text contrast.

## 5. Small-size legibility — applies to any future icon

- Any derived icon must be legible and distinguishable at **16 px** (favicon floor).
- Verification at 16 / 32 / 48 / 180 / 512 px on both light and dark backgrounds, plus a maskable
  safe-zone check for the 192/512 app icons.

## 6. Light / dark theme variants — applies to any future icon

- **`ink`:** dark ink for light surfaces. **`reversed`:** light ink for dark surfaces.
- Adaptive SVG favicon may select the variant via `prefers-color-scheme`; a raster `.ico` fallback
  ships a variant legible on both. The product shell override (26.4) may select the variant explicitly.
- The nav wordmark itself needs no variant: it inherits the theme's `fg.default`.

## 7. Favicon and Open Graph derivation (future, artwork required)

- **Favicon (BRAND-010):** derived deterministically from the wordmark `COM-OS` when artwork is
  produced; no re-drawing. Not produced by this decision.
- **Open Graph (PAGE-027):** 1200×630 template combining the wordmark `COM-OS` on the brand surface;
  per-page `og:title`/`og:description` already exist, `og:image` is currently absent and is added only
  once artwork exists.
- **Not blocked, not produced:** BRAND-010 and PAGE-027 are **no longer blocked on a pending asset**
  (the mark is decided — `COM-OS`), but no artwork is produced here, so neither may be marked complete.

## 8. Acceptance checklist

- [x] Brand mark decided: exact text wordmark `COM-OS` (decision 26.1, approved 2026-10-11).
- [x] No symbol; single lockup, no variants (decision 26.5, approved 2026-10-11).
- [x] Product name `Company OS` retained in `<title>`/`og:title` (deploy-gate-pinned).
- [x] Nav wordmark propagated to `business/site/index.html` as `<strong>COM-OS</strong>`.
- [ ] Favicon / OG artwork produced (founder's to produce or commission; **not done** — no artwork).
- [ ] Founder review + explicit approval recorded for any produced artwork.

## 9. Explicit non-claims

- No symbol exists; none is required by the decision.
- No favicon / OG / app-icon artwork has been created.
- Decision 26.1 is `APPROVED` (wordmark-only); the *wordmark* is complete, but *artwork derivations*
  (BRAND-010, PAGE-027) remain unproduced.
