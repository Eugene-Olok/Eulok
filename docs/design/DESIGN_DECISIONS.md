# Company OS Design Decisions

**Status:** Decision register active. **18 decisions recorded — 18 APPROVED.** Four decisions closed by founder instruction on 2026-10-11 (all recorded in §3 with provenance): **26.1** brand mark = the exact text wordmark `COM-OS` (option A, wordmark-only), **26.5** one lockup / no variants, **26.9** contact path = direct WhatsApp deep link (`https://wa.me/256760779160`, no form/backend/email), **26.11** legal/consent out of initial-release scope (owner-managed privately) with analytics staying enabled. Tokens under APPROVED decisions classify VALID_APPROVED when structurally valid.

**Authority:** AGENTS.md (founder remains accountable; agents propose, deterministic systems decide), audit §26 (`evidence/runs/design-system-audit-2026-10-08.md`), GOV-004 (founder approval gate), GOV-012 (design ownership: founder = accountable).

**Owner of every decision in this register:** founder.

---

## 1. How to read this register

### 1.1 Status vocabulary (machine-checked)

| Status | Meaning | Effect on tokens / scope |
|---|---|---|
| `PENDING` | Recorded, options proposed, founder has not decided | Dependent tokens are `VALID_PENDING_DECISION`; no dependent value is binding |
| `PENDING_ESCALATE` | Same as PENDING, plus a standing risk that worsens while undecided | As PENDING; must be raised at every design review until resolved |
| `BLOCKED` | No viable option exists until a dependency outside the design programme clears | Dependent scope cannot be scheduled; failure class `BLOCKED` is reported honestly |
| `APPROVED` | Founder has recorded an explicit choice in §5 with date and evidence | Dependent tokens may move to `VALID_APPROVED` |

### 1.2 Rules

1. **Nothing in this register is approved.** The "recommended default" on each decision is a **PROPOSED DEFAULT** — it is what the system will assume for planning only. A proposed default is never treated as an approval (AGENTS.md: agents must not treat their own output as proof of correctness).
2. **Unapproved values are never rendered.** `docs/design/DESIGN_TOKENS.yaml` carries proposed values as evidence-backed proposals with `decision_id` pointers; the validator classifies them `VALID_PENDING_DECISION`, never `VALID_APPROVED`.
3. **Approval is a file edit, not a conversation.** To approve a decision the founder changes `status` to `APPROVED` in the machine-readable register (§5), adds `approved_date` and `approval_evidence`, and commits. The token validator then reclassifies the dependent tokens deterministically.
4. **No decision may be approved by an agent.** Agents may prepare options, compute consequences, and run verification. They may not set `APPROVED`.
5. **Where the audit §26 table and the §15 manifest disagree on a manifest ID**, the §15/§14.4 registry (which matches the canonical `DESIGN_MANIFEST.yaml`) governs. Divergences are documented in §6 rather than silently corrected.

### 1.3 Machine-readable register

The YAML block in §5 is the single machine-readable source for decision statuses. `tools/validate_design_tokens.py` parses exactly this block and refuses to classify any token as `VALID_APPROVED` while its `decision_id` is not `APPROVED`.

---

## 2. Historical decision recovery (Gate 2 evidence)

Before recording anything, prior decision material was searched for across every ref, the working tree, and the knowledge base. Verdicts:

| Target | Classification | Search evidence |
|---|---|---|
| §8.2 Identity contract text | **UNKNOWN** — genuinely unrecoverable | Phase 8 closure 5-step search trail (`evidence/runs/PHASE8-CLOSURE-2026-10-06.md:155-174`, also `:35`, `:205-206`); Gate 2 re-run: `git log --all -S'§8.5'`, `-S'penpot'`, `-S'identity'` → only closure/audit/design-package commits (`c4b5e81`, `f478cfd`, `36fc7b8`, `a5fee1f`…`c9f75c0`); no contract text in any reachable blob |
| §8.5 Penpot contract text | **UNKNOWN** — genuinely unrecoverable | Same trail; closure line 226: "No Penpot credentials and no §8.5 text. No design artifacts invented." |
| Brand / palette / typography / motion / breakpoint decisions | **NONE FOUND — no historical approval exists** | `git log --all -S'design system'` (only audit + package commits); `decisions/` contains only `trust-tiers.md`; `~/.config/opencode/skills/` has no penpot/token design decisions; gbrain search returns only AGENTS/ETHOS governance pages |
| Performance budgets | **NONE FOUND** | `grep -i 'LCP\|performance budget' evidence/runs/` → no budget values anywhere; `gates-phase8.sh` has no performance check |
| Design-system location decision | **NONE FOUND** — package location chosen by the package branch itself | Audit GOV-001 evidence: "docs/ empty; no DESIGN.md" at audit time |

**Consequences:**

- Decision 26.16 carried the founder restatement obligation for §8.5 (risk §27.A); there is no historical text to adopt. The founder discharged it on 2026-10-10 with a **new restated contract** approved verbatim (Penpot Cloud hosting) — recorded in §3 26.16. The restatement is a new contract, **never** represented as recovered §8.5 history; the historical text remains `UNKNOWN`.
- Identity portal work stays `OUT_OF_SCOPE` (PAGE-029, EXCL-004) — unchanged.
- Every proposed value in `DESIGN_TOKENS.yaml` is either (a) current-site evidence (the seven hex literals, spacing literals, 980px container) or (b) explicitly null with a `decision_id`. Nothing is adopted from an imagined history.

**Classification legend used above:** `APPROVED` (bound), `PROPOSED` (offered, not bound), `HISTORICAL-ABANDONED` (found but superseded — none found), `UNKNOWN` (requirement existed, text unrecoverable — §8.2/§8.5).

---

## 3. Decision records

Each record carries: decision, current/historical evidence, status, proposed options, recommended default (**PROPOSED DEFAULT — NOT APPROVED**), consequences, dependencies, affected manifest IDs, release impact, owner, approval state.

### 26.1 — Brand mark: wordmark-only or symbol

- **Decision:** Keep the wordmark-only mark or commission/introduce a symbol.
- **Evidence:** BRAND-001 (no logo exists), BRAND-002 (wordmark as nav text, `business/site/index.html:16`) — CURRENT. BRAND-009 REQUIRED. No historical logo artefact in any ref.
- **Status:** `APPROVED`. **approved_date:** `2026-10-11`. **approval_evidence:** founder instruction 2026-10-11 ("Approve the brand mark as the exact text wordmark `COM-OS`; wordmark-only — option A; one logo lockup; no symbol/artwork"), recorded here by the agent per §7.3 (the founder instruction is the provenance; the agent selected no option). This supersedes the 2026-10-09 option-**B** direction-only re-confirmation.
- **Selected option:** **(A)** — wordmark-only. The canonical brand mark (and the single lockup, 26.5) is the **exact text `COM-OS`**, typeset in the system font stack. No symbol is introduced and no brand artwork is produced.
- **Founder rationale (verbatim intent, founder-supplied):** the brand mark is exactly the text `COM-OS`; there is **one** logo lockup (no stacked/horizontal/reversed variants); the product/company name used in page metadata (`<title>`, `og:title`) and prose remains `Company OS` and is deploy-gate-pinned (`scripts/deploy-site.sh`).
- **Authority limit (binding):** the agent must **not invent, draft, or publish** any symbol, alternate wordmark rendering, favicon, apple-touch icon, or OG image. No founder-supplied binary asset is required — the mark is plain typeset text — but no artwork may be manufactured.
- **Requirement reconciliation:** BRAND-009 (logo and wordmark design) is satisfied by this typeset text wordmark; BRAND-010 (favicon/app-icon set) and PAGE-027 (`og:image`) remain REQUIRED as future derivations but are **not produced** here and are no longer blocked on a pending asset (the mark is decided).
- **Prior state (superseded, kept for the audit trail):** the 2026-10-09 founder directive selected option **B** (a distinct symbol alongside the wordmark) as *approved direction only*, with `26.1`/`26.5` asset-gated (`PENDING_ASSET`). That direction is withdrawn by the 2026-10-11 option-A instruction.
- **Propagation performed:** `docs/design/BRAND_ASSET_SPEC.md` restated for option A (wordmark-only, no symbol); `business/site/index.html` nav wordmark changed `<strong>Company OS</strong>` → `<strong>COM-OS</strong>` (product name in `<title>`/`og:title` unchanged); `DESIGN_MANIFEST.yaml` BRAND-002/BRAND-009/BRAND-010/PAGE-027 notes updated. No tokens are owned by 26.1 (nothing to flip).
- **Options:** (A) wordmark-only — **selected**. (B) symbol mark alongside the wordmark (withdrawn 2026-10-11). (C) deferred.
- **Consequences:** the brand workstream closes on a typeset text mark; no asset dependency remains; favicon (BRAND-010) and OG (PAGE-027) derivations are no longer asset-blocked although not produced here; 26.5 (single lockup) closes.
- **Depends on:** nothing. **Blocks:** 26.5 (lockup) — satisfied.
- **Affected manifest IDs:** BRAND-001, BRAND-002, BRAND-009, BRAND-010, PAGE-027.
- **Release impact:** P1; the nav mark ships as text; no binary asset.
- **Owner:** founder. **Approval state:** approved (founder, 2026-10-11).

### 26.2 — Font loading strategy (system stack vs self-hosted webfont)

- **Decision:** Ship with the platform system stack, or self-host a webfont (Inter or successor).
- **Evidence:** BRAND-007/008 — `font-family: Inter,system-ui,sans-serif` names Inter but no font file exists anywhere (`index.html:12`, repo-wide find empty); effective family today is `system-ui` (audit §5.2, risk §27.D). No historical font decision anywhere.
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08 ("Approve Option A: retain the system font stack for v1 and defer custom webfonts to a separate, explicitly approved decision."), recorded here by the agent per §7.3.
- **Selected option:** **(A)** — system stack for v1; custom webfonts deferred to a separate, explicitly approved decision.
- **Founder rationale (verbatim, founder-supplied):** "Approve Option A: retain the system font stack for v1 and defer custom webfonts to a separate, explicitly approved decision."
- **Two-part approval (strategy vs values — kept distinct per founder instruction):** the founder approved the **strategy** outright and supplied the concrete type values as a **proposed initial scale subject to the agent validating them against the existing CSS, responsive behaviour and typography hierarchy before those tokens are marked approved.** Strategy approval and token-value approval are therefore separate clauses.
- **Value verification performed 2026-10-08 (agent, deterministic — `business/site/index.html:12`):**
  - `h2` has no explicit rule today → UA default `1.5em` = **24px**; proposed 24px **matches the established value** (no visual change).
  - `h3` has no explicit rule today → UA default `1.17em` ≈ **18.72px**; proposed **18px** is a deliberate **0.72px normalisation**, recorded as such (not accidental drift).
  - body `1rem` = **16px** with line-height 1.6; `h1` = `clamp(2.5rem,7vw,5rem)` with line-height 1.05 — both **established and left unchanged**. The proposed "lead/display 20px" is a **new intermediate step** (`primitive.type.size-lead`), *not* the hero/display size, which stays `primitive.type.size-hero` (`clamp(2.5rem,7vw,5rem)`).
  - weights: no `font-weight` is declared except `.steps li::before{font-weight:700}` → UA defaults **400/700**; proposed 400/700 **match** (no visual change).
  - values are stored in **`rem`** (1.25 / 1.5 / 1.125rem) so they keep scaling with the user's root font-size and preserve current zoom/responsive behaviour; px equivalents are 20 / 24 / 18. `h2`/`h3` were already `rem`-based UA defaults, so this **does not change** their responsiveness.
  - font family: canonical token stays the pure system stack; the production literal names an **unloaded `Inter`** (no `@font-face`/webfont anywhere) whose effective rendering already falls back to `system-ui` — consistent with option A and flagged as latent webfont intent (audit §5.2 / risk §27.D).
- **Propagation performed on approval:** the strategy approval + verified values mark the five previously-null type tokens (`primitive.type.size-lead`, `semantic.type.size.h2`, `semantic.type.size.h3`, `semantic.type.weight.regular`, `semantic.type.weight.bold`) and two new primitives (`primitive.type.size-h2` = `1.5rem`, `primitive.type.size-h3` = `1.125rem`) `VALID_APPROVED`; all other 26.2 tokens with established values also resolve to `VALID_APPROVED`. No 26.2 token remains null; no 26.2 token is INVALID.
- **Options:** (A) system stack — zero bytes, zero licence, zero FOUT; typographic distinctiveness sacrificed. (B) self-host one webfont (woff2 subset, licence recorded under GOV-013) — distinct voice, adds ~15–40 KB and a licence/provenance record. (C) variable font self-host — richer scale, slightly larger file.
- **Consequences:** (A) FOUND-004 tokens name system families honestly; no `@font-face` anywhere. (B)/(C) remain available only as a separate, explicitly approved decision and require a GOV-013 third-party asset record before any file lands.
- **Depends on:** nothing (root decision — satisfied). **Blocks (now unblocked):** FOUND-004, FOUND-005, FOUND-007, FOUND-024, BRAND-007, BRAND-008 type-scale rollout, GOV-013.
- **Affected manifest IDs:** BRAND-007, BRAND-008, FOUND-004, FOUND-005, FOUND-007, FOUND-024, GOV-013.
- **Release impact:** P0 — the type layer cannot be declared complete without it.
- **Owner:** founder. **Approval state:** approved (strategy); token values verified against CSS then approved.

### 26.3 — Palette: adopt §5.2-derived neutrals or re-derive

- **Decision:** Whether the seven current-site colour literals become the system's neutral foundation (after contrast re-check), and what accent/action colours are introduced.
- **Evidence:** BRAND-006 REQUIRED — seven unroled literals (`#151515 #fafafa #ffffff #dddddd #bbbbbb #111111 #555555`, `index.html:12`). Measured: badge border `#bbbbbb` on `#ffffff` ≈1.9:1 — fails WCAG 1.4.11 3:1 (A11Y-004, the only measured WCAG failure in production). `#dddddd` on `#fafafa` ≈1.3:1 (decorative-boundary risk, audit §19.4). No accent/interactive colour exists at all. Ratios re-verified against the current token values by `tools/validate_design_tokens.py` on 2026-10-08 (17.5 / 7.14 / 18.26 / 18.09 pass; 1.92 defect; 1.3 advisory; focus NOT_RUN).
- **Selected option:** **(A)** — adopted neutrals as primitives, semantic roles assigned, failing values to be replaced, accent/action/focus derived through a documented contrast-checked procedure.
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08 ("Approve option A, with one clarification…"), recorded here by the agent per §7.3 (founder instruction is the provenance; the agent chose no option).
- **Founder rationale (verbatim, founder-supplied):** "adopting the existing neutrals approves them as the initial neutral foundation, not as a complete or permanently fixed brand identity. The accent/action/focus hue must remain pending until separately approved."
- **Scope of this approval:** the neutral foundation and the repair procedure only. It is explicitly **not** approval of a complete or permanent brand identity, and **not** approval of any accent/action/focus hue value.
- **Scope carve-out (per the founder clarification):** these 8 governed tokens keep `value: null` with `pending_separate_approval: true` and therefore stay `VALID_PENDING_DECISION` — they are not approved by 26.3:
  - founder-named (must remain pending until separately approved): `primitive.color.accent`, `semantic.color.action.primary`, `semantic.color.action.primary-hover`, `semantic.color.focus.ring`
  - technical classification by the agent (not a founder attribution): `semantic.color.border.default` + `component.badge.border` (A11Y-004 replacement slot — authorised as a repair by option A, but the concrete value still requires explicit approval before landing), `semantic.color.fg.inverse` (inverse/on-dark role undefined while the hue system is pending; may also involve 26.4), `component.status.text-color` (status hue roles undefined; A11Y-013 keeps non-colour signalling mandatory regardless)
- **Propagation performed on approval:** the 15 valued 26.3 tokens (7 colour primitives + 6 semantic aliases + 2 component aliases) flip `VALID_PENDING_DECISION → VALID_APPROVED`; the 4 blocking contrast pairs resolve `PENDING_PASS → PASS`; `badge-border-on-surface` stays `KNOWN_OPEN_DEFECT`; subtle stays `ADVISORY_FAIL`; focus stays `NOT_RUN`.
- **Border repair propagation (round 2, 2026-10-08, founder option B):** `#bbbbbb` retired from active token use (preserved here as historical evidence — 1.92:1 on `#ffffff`, WCAG 1.4.11 failure, A11Y-004). Badge/default boundary → new `primitive.color.border-default-raw` = `#767676` (4.54:1 on white / 4.35:1 on canvas); static/card boundary → `primitive.color.border-subtle-raw` changed `#dddddd`→`#8f8f8f` (3.23:1 white / 3.10:1 canvas). `semantic.color.border.default` and `component.badge.border` now alias the default grey and are `VALID_APPROVED`; `semantic.color.border.subtle` follows the repaired primitive. The subtle pair was upgraded `advisory → blocking` because the founder adopted the 3:1 non-text requirement on both surfaces. Contrast state after repair: **5 PASS** · badge `DEFECT_CLOSED_PENDING_REVIEW` (4.54:1 — pending rendered visual review, not yet fully closed) · focus `NOT_RUN`. Distinct roles documented on both primitives: `border-default-raw` = UI-component boundary, `border-subtle-raw` = static content boundary; they must never be substituted for one another.
- **Hue-family resolution (separate approval, 2026-10-09, founder Option 1 — monochrome):** the founder separately approved the interactive hue family the 2026-10-08 carve-out deferred. Selected **Option 1 — neutral-derived monochrome** (no new brand hue; interactive roles map to the strong neutral per theme). The six carved-out tokens (`primitive.color.accent`, `semantic.color.fg.inverse`, `semantic.color.action.primary`, `semantic.color.action.primary-hover`, `semantic.color.focus.ring`, `component.status.text-color`) now carry values with light and dark counterparts landing together (26.4). Three new primitives were added (`primitive.color.accent-hover-raw`, `primitive.color.dark-accent-raw`, `primitive.color.dark-accent-hover-raw`); the contrast matrix gained five pairs (inverse-on-action, inverse-on-hover, action-on-canvas, action-hover-on-canvas, status-text-on-surface) and the focus ring now measures 17.50:1 light / 17.12:1 dark. All ratios computed deterministically (`hue_proposal.py`, closure report §19.6). **Ratios are evidence, not visual approval** — rendered focus/action visual review remains a separate outstanding item. Recorded in the §5 register (26.3 approval_evidence note), `PERFORMANCE_BUDGET.yaml` unaffected, and closure report §20.
- **Options:** (A) adopt the neutrals as primitives, role them semantically, replace `#bbbbbb`/`#dddddd` where they fail, and derive accent/action/focus colours through a documented contrast-checked procedure. (B) re-derive the full palette from scratch (new direction, longer timeline). (C) adopt a ready-made open palette (licence check under GOV-013).
- **Consequences:** colour foundation is binding for downstream consumers; A11Y-004 remains open until its replacement value lands, passes, and is approved; brand identity remains an open question by explicit founder instruction (revisit only on founder initiative).
- **Depends on:** nothing (root decision — satisfied). **Blocks (now unblocked):** 26.4 (dark mode, dependency satisfied), FOUND-001/002/003/013 consumption, the A11Y-004 repair, COMP-DAT-06 rebuild, every colour token consumer.
- **Affected manifest IDs:** BRAND-006, FOUND-001, FOUND-002, FOUND-003, FOUND-013, A11Y-004, COMP-DAT-06, TEST-006.
- **Required implementation and verification:** (1) replacement value for `#bbbbbb` (blocking, A11Y-004) and `#dddddd` (advisory) — proposed as the immediate next question under §4.12; landing requires explicit value approval. (2) Accent/action/focus hue — separate founder approval before any value is proposed as approved. (3) Three-design-validator suite re-run after every propagation step.
- **Reversibility:** high while no CSS/Penpot consumer exists (foundation-only change); costly after frontend implementation derives from it. **Known risks:** ratifies historical greys as the starting point (accepted as explicitly non-permanent by the founder's clarification); A11Y-004 stays visibly open until repaired.
- **Remaining questions:** badge/subtle rendered visual review (A11Y-004 closure); focus ring geometry (FOUND-017, GOV-004); rendered focus/action visual review; disabled-state colour roles (no token exists — intentionally not fabricated, 2026-10-09 directive); brand asset still pending (26.1/26.5).
- **Release impact:** P0 — colour foundation of everything visual.
- **Owner:** founder. **Approval state:** approved (founder, 2026-10-08).

### 26.4 — Dark mode: now / later / never

- **Decision:** Whether the system carries a dark palette from day one.
- **Evidence:** BRAND-013 FUTURE, FOUND-021 FUTURE — both deferred pending palette roles (BRAND-006 notes: "Deferred until palette roles exist; decision §26.4"). Site is light-only today (`#fafafa` canvas).
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08 ("approve B — both light and dark", with an explicit mandate: implement a proper theme architecture, not just dark colours; both themes WCAG 2.2 AA; no component may hard-code light-only colours; visual regression covers both themes; CSS must fit the approved 15 KB/100 KB budgets; B is not approved as a nominal placeholder), recorded here by the agent per §7.3.
- **Selected option:** **(B)** — now / both light and dark, implemented as a first-class theme architecture. Founder rationale (verbatim, founder-supplied): "For Company OS, I would choose both light and dark rather than permanently constraining the system to light-only … Light theme: canonical current production theme. Dark theme: complete, contrast-validated semantic palette. Shared primitives where appropriate; semantic tokens map differently per theme. Both themes must satisfy WCAG 2.2 AA. Support explicit user/system preference through a theme mechanism. No component may hard-code light-only colors. Focus, borders, states, surfaces, text, overlays, and interactive controls all need dark-theme equivalents. Visual regression should cover both themes. prefers-color-scheme can provide the initial system preference, with an explicit theme override if/when the product shell requires it. Performance budget remains unchanged; the additional CSS must fit within the approved 15 KB CSS / 100 KB transfer budgets."
- **Policy constraints (binding):** the light palette stays the canonical production theme; the dark palette is a **complete** semantic contract of the *same* roles (no nominal placeholder); theme resolution happens at the **semantic colour layer** (primitives are shared raw values; semantic roles map per theme; components inherit — no component-owned light-only literal); initial preference from `prefers-color-scheme`, explicit override supported by the product shell; both themes measured against WCAG 2.2 AA; dark-mode CSS counts against the approved performance budgets; visual regression must cover both themes.
- **Propagation performed on approval:** added a top-level `themes` contract; added shared dark primitives (canvas/surface/text/muted/borders); added `value_dark` + `dark_decision_id: "26.4"` to the seven ratified neutral semantic colour roles; the accent/action/focus/inverse/status roles (already carved out under 26.3) keep their dark counterparts inside the *same* separate approval; added per-theme dark contrast pairs; extended `tools/validate_design_tokens.py` with theme-coverage and dark-contrast checks; updated `DESIGN_TOKENS.md`, `ACCESSIBILITY_SPEC.md`, `DESIGN_SYSTEM.md`. **Manifest propagation completed 2026-10-11:** `BRAND-013` and `FOUND-021` promoted `FUTURE → REQUIRED` in `DESIGN_MANIFEST.yaml` (per §6), and the manifest validator counts updated `REQUIRED 175 → 177`, `FUTURE 63 → 61`.
- **Options:** (A) later — light-only v1, dark deferred. (B) now — both, as a theme architecture (approved). (C) never — reclassify FOUND-021 OUT_OF_SCOPE.
- **Consequences:** the token contract now carries a `light`/`dark` dimension for colour; semantic colour tokens double in effective values; the contrast matrix gains dark rows. **Dependency flag:** the interactive hue family (accent/action/focus, plus `fg.inverse` and `status.text-color`) was carved out of the 26.3 approval pending a separate founder hue decision; the founder resolved it on 2026-10-09 (Option 1 — neutral-derived monochrome) with its light and dark equivalents landing together, so those roles are no longer pending. Overlays (scrim/rgba) have no hex-only token form and no overlay component exists yet → recorded as an open obligation under the same interactive-component scope. **Visual-regression for both themes cannot be executed until rendered UI exists** → tracked open obligation (like TEST-007/A11Y-004 review), not a pass.
- **Depends on:** 26.3 (palette roles exist). **Blocks:** FOUND-021 (was: semantic colour token doubling) — now delivered for neutrals; unblocks dark-mode consumption.
- **Affected manifest IDs:** BRAND-013, FOUND-021. (Audit §26 table says "FOUND-016" — divergence, see §6.)
- **Release impact:** none for v1 light-only shipping; dark must be complete + contrast-validated before any dark-mode release (it is, for neutrals).
- **Owner:** founder. **Approval state:** approved.

### 26.5 — Logo lockup rules

- **Decision:** Lockup variants (stacked, horizontal, reversed) or a single lockup.
- **Evidence:** BRAND-002 (wordmark as nav text, `business/site/index.html:16`) — CURRENT; BRAND-009 (logo and wordmark design) — REQUIRED. The lockup evidence sits in BRAND-002/BRAND-009. (The audit §26 inline ref "(BRAND-011)" is iconography — divergence, see §6.)
- **Status:** `APPROVED`. **approved_date:** `2026-10-11`. **approval_evidence:** founder instruction 2026-10-11 ("one logo lockup, no variants"), recorded here by the agent per §7.3.
- **Selected option:** **(A)** — a **single lockup, no variants**. The lockup is the typeset text wordmark `COM-OS` from 26.1; there is no stacked, horizontal, or reversed variant.
- **Options:** (A) single lockup, no variants — **selected**. (B) two lockups (horizontal + stacked) with documented usage. (C) full lockup set with reversed/knockout.
- **Consequences:** no variant set is produced; the nav uses the single lockup; favicon/OG, when later derived (26.1), reuse the same wordmark. `COMP-CON-08` is a two-column content-layout component in the §15 registry and is **not** a lockup — it is no longer referenced here (documented divergence, §6).
- **Depends on:** 26.1 (satisfied). **Blocks:** nothing (BRAND-009 lockup decided).
- **Affected manifest IDs:** BRAND-002, BRAND-009.
- **Release impact:** P2.
- **Owner:** founder. **Approval state:** approved (founder, 2026-10-11).

### 26.6 — Density: comfortable vs compact default

- **Decision:** Default spacing density for the system (comfortable vs compact), or dual density.
- **Evidence:** BRAND-014 FUTURE, FOUND-020 FUTURE — "Only matters once product UI (OPS) exists". Current site literals (§5.2) are comfortable-leaning (48px page padding, 20–24px gaps).
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08 ("Approve Option A — comfortable default, and keep the 10px and 18px values as deliberate optical exceptions."), recorded here by the agent per §7.3.
- **Selected option:** **(A)** — comfortable default.
- **Founder rationale (verbatim, founder-supplied):** "Default density: comfortable. Ratify the existing measured spacing values. Preserve 10px and 18px as documented optical exceptions. Do not normalize them merely to enforce a mathematical spacing grid. Do not introduce a second compact scale for the future OPS UI at this stage."
- **Policy constraints (binding):** the 10px and 18px values are preserved as **deliberate optical exceptions** (FOUND-009) and must not be normalised onto a mathematical grid; **no compact scale** is introduced now (a future OPS compact density, if ever needed, is a separate decision).
- **Propagation performed on approval:** all 22 tokens owned by 26.6 flip `VALID_PENDING_DECISION → VALID_APPROVED` — 11 `primitive.space.*` literals, 6 `semantic.space.*` roles, and 5 `component.*` consumers (card/badge/container/grid). Values are unchanged (the measured comfortable scale is ratified); 10px/18px carry explicit optical-exception notes.
- **Options:** (A) comfortable default (approved). (B) compact default. (C) comfortable website + compact future product UI (token set carries both from the start).
- **Consequences:** the spacing scale is now canonical and comfortable; the numbered ladder `space.1…space.n` stays deliberately un-materialised; density tokens for a compact OPS UI are deferred.
- **Depends on:** nothing (root decision — satisfied). **Blocks (now unblocked):** FOUND-009 spacing-scale end values, FOUND-020 density tokens, space tokens.
- **Affected manifest IDs:** BRAND-014, FOUND-009, FOUND-020. (Audit inline ref "(BRAND-013)" is dark theme — divergence, see §6.)
- **Release impact:** P3 for v1 website; required before OPS product UI.
- **Owner:** founder. **Approval state:** approved.

### 26.7 — Motion budget: none / minimal / expressive

- **Decision:** How much motion the system permits.
- **Evidence:** BRAND-015 FUTURE — "Nothing animates today; A11Y-007 constrains it". FOUND-016 REQUIRED (motion tokens) lands "with first interactive states". No transitions/keyframes exist (`@media/@keyframes` counts: 0).
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08 ("Approve Option A. Adopt the minimal, reduced-motion-safe motion policy…"), recorded here by the agent per §7.3.
- **Selected option:** **minimal, reduced-motion-safe** — the option presented as **(A)** in the Gate 3 session (equivalent to the record's original **(B) minimal**). The founder's answer enumerates the policy verbatim, so the selection is unambiguous.
- **Founder rationale (verbatim, founder-supplied):** "Approve Option A. Adopt the minimal, reduced-motion-safe motion policy: Fast: 150ms / Normal: 250ms / Slow: 400ms / Standard easing: cubic-bezier(0.2, 0, 0, 1). Semantic motion tokens alias the corresponding primitive tokens. Motion is optional per component, never mandatory decoration. prefers-reduced-motion: reduce is mandatory. Reduced-motion mode should collapse nonessential movement to 0ms or an appropriate opacity-only transition. No autoplay, looping, parallax, or motion-dependent interaction should be introduced merely because motion tokens now exist. Motion must not cause layout instability or interfere with keyboard/focus states."
- **Policy constraints (binding):** motion is optional per component (never mandatory decoration); `prefers-reduced-motion: reduce` is **mandatory** and collapses nonessential movement to 0ms or an opacity-only transition; no autoplay/looping/parallax/motion-dependent interaction may be introduced merely because motion tokens now exist; motion must not cause layout instability or interfere with keyboard/focus states.
- **Propagation performed on approval:** `primitive.motion.{fast,normal,slow}` = 150/250/400ms, `primitive.motion.ease-standard` = `cubic-bezier(0.2, 0, 0, 1)`, and the `semantic.motion.{fast,normal,slow}` aliases flip `VALID_PENDING_DECISION → VALID_APPROVED`; no motion token remains null. **Manifest propagation completed 2026-10-11:** `BRAND-015` promoted `FUTURE → REQUIRED` in `DESIGN_MANIFEST.yaml` (its token counterpart `FOUND-016` was already REQUIRED); manifest validator counts updated (`REQUIRED 177 → 178`, `FUTURE 61 → 60`).
- **Options:** (A) none — no motion beyond native scrolling; simplest, most austere. (B) minimal — short hover/focus transitions, reduced-motion honoured everywhere. (C) expressive — durations/easing scale, scroll and entrance motion, full reduced-motion opt-out.
- **Consequences:** only the minimal token set exists; any motion ships only with A11Y-007 `prefers-reduced-motion` support, and the binding policy constraints above limit decorative use.
- **Depends on:** nothing (root decision — satisfied). **Blocks (now unblocked):** FOUND-016, BRAND-015, A11Y-007 scope, motion tokens.
- **Affected manifest IDs:** BRAND-015, FOUND-016, A11Y-007. (Audit inline ref "(BRAND-014/015)" — BRAND-014 is density, see §6.)
- **Release impact:** P2 — before first interactive transition ships.
- **Owner:** founder. **Approval state:** approved.

### 26.8 — Breakpoint values

- **Decision:** Adopt the proposed breakpoint set (480 / 768 / 1024 / 1440) or choose different values.
- **Evidence:** FOUND-015 REQUIRED, RESP-001 REQUIRED — `@media` count: 0; no breakpoint exists. Proposal recorded in audit §18.2 and restated in `docs/design/RESPONSIVE_SPEC.md` (explicitly "not yet canonical"). RESPONSIVE_SPEC.md:27: "No implementation may treat these as final until owner decision §26.8 is recorded."
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08 ("Approve Option A: adopt the breakpoints at 480 / 768 / 1024 / 1440 CSS pixels…"), recorded here by the agent per §7.3.
- **Selected option:** **(A)** — adopt `sm 480px / md 768px / lg 1024px / xl 1440px`.
- **Founder rationale (verbatim, founder-supplied):** "Approve Option A: adopt the breakpoints at 480 / 768 / 1024 / 1440 CSS pixels, and record their approximate em equivalents as supporting documentation, not as a second independent source of truth."
- **Canonical units:** **CSS pixels are canonical** across the token contract, CSS, tests and Penpot. **Approximate em equivalents are supporting documentation only** (16px reference): sm ≈ 30em, md ≈ 48em, lg ≈ 64em, xl ≈ 90em. They are explicitly **not** a second source of truth and must not be used to override the px values.
- **These are layout breakpoints, not device restrictions (founder instruction):** components must remain **fluid between breakpoints**, and must support **320px viewports**, **400% zoom/reflow**, and **accessible keyboard interaction**.
- **Responsive-contract completeness:** the breakpoint *values* are approved, but the **responsive contract is not complete** until actual responsive behaviour is validated against the approved boundaries, 320px, 400% zoom/reflow and keyboard operation. This is tracked as an open verification obligation (see `RESPONSIVE_SPEC.md` verification matrix), not satisfied by this approval.
- **Propagation performed on approval:** the 4 primitive breakpoint tokens, their 4 semantic aliases, and `component.grid.min-column` flip `VALID_PENDING_DECISION → VALID_APPROVED`; px values are unchanged (the proposal is ratified); the em equivalents are recorded in token `evidence` as supporting notes only.
- **Options:** (A) adopt §18.2 set (sm 480 / md 768 / lg 1024 / xl 1440). (B) alternative set (e.g. 600/900/1200 — fewer, wider steps). (C) two-breakpoint minimal set (mobile/desktop only).
- **Consequences:** `breakpoint.*` tokens are now canonical and may be treated as final; no implementation may still cite "§26.8 unrecorded". Behavioural completeness remains gated on the validation matrix.
- **Depends on:** nothing (root decision — satisfied). **Blocks (now unblocked):** FOUND-015, RESP-001, RESP-004, RESP-005, RESP-010, TEST-009, whole RESP family rollout.
- **Affected manifest IDs:** FOUND-015, RESP-001, RESP-004, RESP-005, RESP-010, RESP-011, TEST-009.
- **Release impact:** P0 — responsive contract before any component ships.
- **Owner:** founder. **Approval state:** approved.

### 26.9 — Contact submission path

- **Decision:** How PAGE-010 submits, given no backend exists and `mailto:` is test-forbidden.
- **Evidence:** Risk §27.H; closure §34 Email BLOCKED (no sending credentials path); `test_site_content.py` forbids `mailto:`; sops/intake requires six structured questions (`sops/intake/SKILL.md:29-38`). No historical submission design exists.
- **Status:** `APPROVED` (resolved 2026-10-11). **approved_date:** `2026-10-11`. **approval_evidence:** founder instruction 2026-10-11 ("direct WhatsApp deep link to the canonical number +256760779160 — `https://wa.me/256760779160`; no form, no backend, no email subsystem"), recorded here by the agent per §7.3.
- **Selected option:** **(E)** — direct WhatsApp deep link. PAGE-010 exposes a WhatsApp call-to-action to `https://wa.me/256760779160` (canonical international number `+256760779160`; E.164 digits, no `+`, no spaces or separators in the URL). No contact form, server endpoint, database, or email subsystem is introduced.
- **Blocker resolution (honest):** the prior `BLOCKED` status meant "no viable default" (no verified form/email path). The founder resolved it by selecting a path that needs neither — an outbound WhatsApp deep link requires no backend and no email capability, so §34 stays as-is and the blocker is genuinely cleared, **not** suppressed. Leaving `BLOCKED` after an executable decision would misreport the gate.
- **Accessibility / behaviour requirements (binding):** the CTA is a real `<a>` with a visible, descriptive accessible name (its link text); it works on mobile (app deep link) and desktop (`wa.me` web fallback); no `mailto:`; no submit control that goes nowhere; `target="_blank"`, if used, carries `rel="noopener"`. Existing `test_site_content.py` invariants are preserved.
- **Options:** (A) external form service (needs founder vendor choice + privacy review feeding PAGE-011). (B) email capability restored (unblocks §34 first). (C) structured intake via a different route. (D) ship PAGE-010 without a submit control, explicitly labelled. (E) direct WhatsApp deep link — **selected**.
- **Consequences:** no submission control can silently drop input; the FRM/SEL form-item build work is not consumed by the contact path and remains governed by its own manifest statuses for other scopes; the `mailto:` prohibition holds.
- **Depends on:** nothing (no external capability required). **Blocks:** PAGE-010 (now unblocked for the WhatsApp path), COMP-ACT-11.
- **Affected manifest IDs:** PAGE-010, COMP-ACT-11.
- **Release impact:** P1 page ships with the WhatsApp path.
- **Owner:** founder. **Approval state:** approved (founder, 2026-10-11).
- **Prior state (superseded, kept for the audit trail):** `BLOCKED` (2026-10-09 founder directive: "no contact form / submission path in v1"; revisit only on founder initiative). Superseded by the 2026-10-11 option-E instruction.

### 26.10 — Multi-page IA approval

- **Decision:** Approve the proposed multi-page information architecture (§17.3: Services · Work · About · Contact + Privacy/Accessibility footer) or stay single-page.
- **Evidence:** PAGE-002…015 REQUIRED (17 required pages total); risk §27.G — `test_site_content.py` invariants are single-page-shaped but are correct contracts to *extend, not weaken* (TEST-001). Current site: one page (`business/site/index.html`).
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08, recorded here by the agent per §7.3 (founder instruction is the provenance; the agent chose no option).
- **Selected option:** **(A)** — approve the **full §17.3 information architecture**.
- **Founder instruction (verbatim, founder-supplied):** "Approve Option A — the full §17.3 information architecture." followed by the recorded constraints below.
- **Binding constraints (verbatim intent, founder-supplied — all carried into propagation):**
  1. The approved scope is the **proposed primary navigation, page hierarchy, templates, footer links, and utility pages** (the full §17.3 IA).
  2. **Preserve all existing `test_site_content.py` invariants; extend tests for the multi-page site rather than weakening them** (TEST-001 rule — extend, never weaken).
  3. **Case-study pages stay honest:** render the empty state until evidence is approved (COMP-DAT-14).
  4. **Do not publish contact forms** until decision **26.9** establishes a **verified submission path** (PAGE-010 submission is not launchable before then).
  5. **Do not publish the Open Graph template as complete** until the brand assets from **26.1/26.5** are approved (PAGE-027 stays blocked on the mark).
  6. **Keep unresolved dependencies explicitly BLOCKED; IA approval does NOT imply implementation or launch readiness.**
  7. **Keep the blog/CMS decision 26.13 separate** rather than treating it as automatically approved by the IA.
- **Scope boundary (binding):** this approval fixes the IA *structure* only. It confers **no implementation, publication, or launch readiness**. Pages with unresolved dependencies remain BLOCKED: PAGE-010 (26.9/Email), PAGE-027 (26.1/26.5 asset), case-study detail (approved evidence), and 26.13 (blog/CMS) stays its own decision. `test_site_content.py` is extended (multi-page assertions), never weakened.
- **Options:** (A) approve full §17.3 IA (nav + templates + footer links) — **selected**. (B) staged IA. (C) stay one-page (scope reduction).
- **Consequences:** unlocks the page/template track; TEST-001 gains multi-page assertions; PAGE-026 (sitemap) enters scope; A11Y-011 (consistent nav) becomes non-trivial across templates; COMP-NAV-04/09 and COMP-CON-07 rollout enabled. 26.13 remains PENDING (not implied by this approval).
- **Depends on:** nothing. **Blocks (now unblocked except where otherwise BLOCKED):** PAGE-002…015, PAGE-026, TEST-001 rework, TEST-010, COMP-NAV-04/09, COMP-CON-07 rollout; **26.13 dependency satisfied but 26.13 stays PENDING**.
- **Affected manifest IDs:** PAGE-002, PAGE-003, PAGE-004, PAGE-005, PAGE-006, PAGE-007, PAGE-008, PAGE-009, PAGE-010, PAGE-011, PAGE-012, PAGE-013, PAGE-014, PAGE-015, PAGE-026, PAGE-027, TEST-001, TEST-010, A11Y-011.
- **Release impact:** P0 sequencing decision — gates the entire page track; **structure approved, launch readiness is not**.
- **Owner:** founder. **Approval state:** approved (IA structure), with the seven binding constraints above. (Audit §17.3 cites "§26.4" for IA — cross-reference typo, see §6.)

### 26.11 — Terms page + cookie/analytics consent (standing risk)

- **Decision:** Whether to publish terms (PAGE-017) and an analytics consent mechanism (PAGE-018) while analytics is already live.
- **Evidence:** PostHog deployed and live-verified (BASE-003, closure §; `$pageview` accepted 200). PAGE-017/018 are OUT_OF_SCOPE in the manifest; no legal text or counsel review exists; no consent decision or jurisdiction analysis exists. Audit §27 standing risk: "**live analytics with no disclosure/consent decision**".
- **Status:** `APPROVED`. **approved_date:** `2026-10-11`. **approval_evidence:** founder instruction 2026-10-11 ("legal pages and cookie/analytics consent are outside initial-release scope; the owner is handling the legal/consent work privately; analytics stays enabled"), recorded here by the agent per §7.3.
- **Selected option:** **(D)** — terms (PAGE-017) and the consent banner (PAGE-018) stay OUT_OF_SCOPE for the initial release; the **founder handles the legal/consent work privately**; analytics remains **enabled** (option C, inert-by-default analytics, is declined).
- **Founder rationale (verbatim intent, founder-supplied):** the owner is explicitly handling legal/consent privately and it is outside initial-release scope; analytics stays on.
- **Scope note (binding):** PAGE-011 (privacy & analytics disclosure, REQUIRED) belongs to the IA (26.10) and is delivered as part of the owner-managed legal workstream; engineering publishes **no legal text and no legal assertions**, and no consent mechanism is built here. This record captures a policy decision, not legal analysis.
- **Reconciliation:** PAGE-017/PAGE-018 remain OUT_OF_SCOPE and EXCL-006 (advertising/retargeting pixels) remains OUT_OF_SCOPE — all three declared **excluded** against this decision in `DECISION_MANIFEST_EFFECTS.yaml`; BASE-003 (PostHog, inert-by-default config) is unchanged and stays enabled at deploy time.
- **Options:** (A) minimal disclosure first: publish PAGE-011 privacy/analytics disclosure now and defer terms/consent with a recorded rationale. (B) full consent banner (needs jurisdiction analysis + consent decision — OUT_OF_SCOPE items enter scope). (C) switch analytics to inert-by-default (config-controlled). (D) keep terms/consent out of initial-release scope; owner-managed privately; analytics enabled — **selected**.
- **Consequences:** the standing governance risk is resolved by an explicit owner decision rather than an ongoing escalation; no tokens are unblocked; nothing new is escalated.
- **Depends on:** 26.10 (PAGE-011 belongs to the IA). **Blocks:** nothing new.
- **Affected manifest IDs:** PAGE-017, PAGE-018, PAGE-011, BASE-003, EXCL-006.
- **Release impact:** standing risk resolved (owner-managed legal; analytics enabled).
- **Owner:** founder. **Approval state:** approved (founder, 2026-10-11).
- **Prior state (superseded, kept for the audit trail):** `PENDING_ESCALATE` (2026-10-09) — the founder had recorded the minimum required legal input (jurisdictions, data, purposes, processors, retention, requirements) and no consent mechanism or legal assertion was made. Superseded by the 2026-10-11 option-D instruction (owner-managed privately, out of initial-release scope).

### 26.12 — Custom domain: reaffirm gate or follow founder scope

- **Decision:** Reaffirm the pages.dev-only gate or authorise custom-domain configuration.
- **Evidence:** Risk §27.E — `gates-phase8.sh` requires NO custom-domain marker; `scripts/deploy-site.sh` is pages.dev-only; founder scope elsewhere mentions Cloudflare/domain. Conflict is live: work could ship that CI then rejects.
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08, recorded here by the agent per §7.3 (founder instruction is the provenance; the agent chose no option).
- **Selected option:** **(A)** — retain the **pages.dev-only deployment gate**.
- **Founder instruction (verbatim, founder-supplied):** "Approve Option A — retain the pages.dev-only deployment gate."
- **Binding constraints (verbatim intent, founder-supplied — all carried into propagation):**
  1. Keep `deploy-site.sh` restricted to the existing **pages.dev** endpoint.
  2. Preserve the **deterministic Phase 8 gate**; do not weaken or bypass it.
  3. Keep **EXCL-001 OUT_OF_SCOPE**.
  4. Do **not** purchase a domain, change DNS/TLS, or introduce custom-domain routing in this decision.
  5. **Reopen only when the founder explicitly records the intended domain and authorizes the change.** Update and verify the gate **before** deploying to a custom domain.
- **Scope boundary (binding):** no gate/script/DNS changes were made by this decision; it is a policy record. Any future reopen is a founder-authorized gate change made *before* any custom-domain deployment (gate updated then verified, per the constraint).
- **Options:** (A) keep the gate (pages.dev only) — **selected**. (B) authorise custom domain.
- **Consequences:** `deploy-site.sh` stays pages.dev-only; `gates-phase8.sh:430` determinism preserved; EXCL-001 stays OUT_OF_SCOPE; zero domain cost/DNS/TLS surface. The §27.E conflict is now resolved in favour of (A) until a founder-recorded domain intent exists.
- **Depends on:** nothing (root — satisfied). **Blocks (unchanged):** EXCL-001 (stays OUT_OF_SCOPE), BASE-004 changes (none authorized).
- **Affected manifest IDs:** EXCL-001, BASE-004.
- **Release impact:** deployment-policy decision; no visual impact.
- **Owner:** founder. **Approval state:** approved (pages.dev-only). Reopen requires the founder to record the intended domain + authorize the change; the gate is updated and verified before any custom-domain deploy.

### 26.13 — Blog/CMS: stay excluded or fund a pipeline

- **Decision:** Keep blog/CMS excluded or fund an editorial pipeline.
- **Evidence:** PAGE-016 OUT_OF_SCOPE — "no editorial pipeline, no CMS, no authoring workflow exists" (§25.7); VOX-005…008 writing standards exist as REQUIRED content rules but no publishing flow.
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08, recorded here by the agent per §7.3 (founder instruction is the provenance; the agent chose no option).
- **Selected option:** **(A)** — keep the **blog and CMS/editorial pipeline excluded from v1**. Decided separately from the approved IA (26.10) on **current evidence**, not assumed future demand.
- **Founder instruction (verbatim, founder-supplied):** "Approve Option A — keep the blog and CMS/editorial pipeline excluded from v1."
- **Binding constraints (verbatim intent, founder-supplied — re-evaluation is gated on ALL three being evidenced together):**
  1. **Recurring demand:** a demonstrated need for regularly published long-form content.
  2. **Named owner:** someone accountable for authoring, review, and publication.
  3. **Defined cadence:** an agreed publishing schedule and sustainable workflow.
  Until then: **keep PAGE-016 and EXCL-007 OUT_OF_SCOPE; retain the existing writing standards (VOX-005…008) for governed static pages; do not introduce CMS hosting, an editorial workflow, or associated maintenance and security costs.**
- **Evaluation basis:** decision made on current evidence §25.7 (no editorial pipeline/CMS/authoring workflow), not speculative future demand. Any re-open requires the three conditions above to be **evidenced**, not asserted.
- **Options:** (A) stay excluded — **selected**. (B) fund a pipeline.
- **Consequences:** PAGE-016 and EXCL-007 remain OUT_OF_SCOPE; nothing to build; VOX-005…008 apply to governed static pages; no CMS/editorial hosting, workflow, maintenance, or security surface in v1. 26.10's dependency is satisfied; the decision is independent of the IA.
- **Depends on:** 26.10 (IA defines where long-form content would live) — satisfied; **26.13 is its own decision and is not implied by the IA approval**. **Blocks:** PAGE-016, EXCL-007 (remain OUT_OF_SCOPE by this decision).
- **Affected manifest IDs:** PAGE-016, EXCL-007, VOX-005…008 (retained unchanged).
- **Release impact:** none (exclusion confirmed).
- **Owner:** founder. **Approval state:** approved (stay excluded); re-evaluation gated on the three evidenced conditions.

### 26.14 — Imagery strategy

- **Decision:** No imagery / abstract SVG / photography policy for the site.
- **Evidence:** BRAND-004 CURRENT (absent — "defensible for an evidence-first brand"), BRAND-012 REQUIRED (policy still required), RESP-008 REQUIRED ("rule lands before imagery does"), A11Y-008 alt-text policy REQUIRED, COMP-CON-11 FUTURE ("arrives with imagery"). Risk: no stock-photo fabrication, no client material without approval (AGENTS.md client isolation).
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08, recorded here by the agent per §7.3 (founder instruction is the provenance; the agent chose no option).
- **Selected option:** **(B)** — abstract SVG only; no photography or stock imagery in v1.
- **Founder instruction (verbatim, founder-supplied):** "Approve Option B — abstract SVG only, with the stated licensing, provenance, performance, accessibility, and founder-approval requirements."
- **Binding constraints (verbatim intent, founder-supplied — all carried into propagation):**
  1. Permit **simple, purpose-built abstract SVG illustrations and diagrams**; **no photography or stock imagery in v1**.
  2. Keep the brand **text-led**; SVG illustrations **do not substitute for the separately approved brand mark** (26.1/BRAND-009).
  3. Record **provenance and licensing for every externally sourced asset** (GOV-013).
  4. Apply **responsive sizing and reserve aspect ratios** to prevent layout shift (RESP-008; CLS ≤ 0.05, 26.15).
  5. Establish the **decorative-versus-informative alt-text policy before publishing imagery** (A11Y-008; 1.1.1).
  6. **Count all assets against the approved performance budgets** (26.15).
  7. Require **founder approval before any actual asset is published**.
  8. Keep **media tokens limited to evidenced needs**; do **not invent a large illustration library**.
- **Scope boundary (binding):** none of the above authorizes creating artwork. No SVG illustration, diagram, or media token is produced by the agent; actual assets require founder approval before publication. Policy text is recorded now (`ACCESSIBILITY_SPEC.md` imagery/alt-text policy); artwork is not.
- **Options:** (A) none for v1. (B) abstract SVG only — **selected**. (C) photography under provenance policy.
- **Consequences:** BRAND-012 policy is now exercised (abstract SVG permitted, photography prohibited in v1); RESP-008 and A11Y-008 rules in force before any imagery lands; COMP-CON-11 / COMP-SPC-05 remain FUTURE until an evidenced need exists; media tokens stay unpopulated until evidence.
- **Depends on:** nothing (root — satisfied). **Blocks (now unblocked under policy, not implementation):** BRAND-012 policy text, RESP-008 scope, A11Y-008 scope, COMP-CON-11, COMP-SPC-05, media tokens.
- **Affected manifest IDs:** BRAND-004, BRAND-012, RESP-008, A11Y-008, COMP-CON-11, COMP-SPC-05, GOV-013, FOUND-019 (icon sizes, vector-only note).
- **Release impact:** P2 — policy text ships before any asset; **approval does not authorize asset creation**.
- **Owner:** founder. **Approval state:** approved (abstract SVG strategy); actual assets require separate founder approval.

### 26.15 — Performance budget values

- **Decision:** Concrete numeric budgets for LCP, CLS, total JS, total CSS, and transfer size.
- **Evidence:** TEST-007 REQUIRED — "gap; ETHOS §9" ; Gate 2 recovery (§2 above): **no budget values exist anywhere** in evidence, gates, or history. Site today is ~4 KB of inline HTML with two small local scripts — no measurement tooling in CI.
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08 ("Approve Option A — strict v1 budgets."), recorded here by the agent per §7.3.
- **Selected option:** **(A)** — strict v1 budgets.
- **Approved thresholds (canonical, hard budgets):** LCP **≤ 1.5 s** on simulated 4G · CLS **≤ 0.05** · total JavaScript transfer **≤ 25 KB** · total CSS transfer **≤ 15 KB** · total page transfer **≤ 100 KB**.
- **Founder rationale (verbatim, founder-supplied):** "Treat them as hard production budgets, not aspirational targets. They are appropriate for the current static-site architecture and provide meaningful regression detection without requiring premature optimization. Keep measurement tooling as a separate decision. Until tooling is selected and operational, TEST-007 remains BLOCKED, not PASS."
- **Measurement tooling:** deliberately **not** resolved by the budget-values decision itself. Status ladder: **1. measurement approach approved — YES (2026-10-09)** · **2. measurement tool operational — YES (2026-10-09, `tools/check_bundle_budget.py`)** · **3. reproducible measurements produced — YES (2026-10-09, byte budgets)** · **4. TEST-007 verified and closed — PARTIAL (byte budgets PASS; LCP/CLS still BLOCKED on a browser lane)**. `PERFORMANCE_BUDGET.yaml` records the tooling (`tooling: stdlib-python-bundle-budget`, `tooling_status: OPERATIONAL`).
- **Propagation performed on approval:** `PERFORMANCE_BUDGET.yaml` thresholds set to the approved values with per-budget `status: APPROVED` and file `status: APPROVED`; the `BLOCKED` reason for TEST-007 is now "tooling undefined" rather than "budget undefined". **Tooling operational (2026-10-09, founder TEST-007 directive):** `tools/check_bundle_budget.py` implemented (stdlib-only, deterministic), wired into `scripts/gates.sh` as `bundle budget (TEST-007)`, covered by `tests/test_bundle_budget.py`. Byte budgets measure reproducibly and PASS; LCP/CLS remain BLOCKED on a browser lane.
- **Measurement approach approved (2026-10-09, founder directive 8):** a **lightweight, deterministic, stdlib-only** budget measurement — no Docker/DB/paid infrastructure/heavy browser stack. Tooling inspection (2026-10-09): `business/site/` payload = **6532 B delivered** (index.html 3908B + config.js 286B + analytics.js 2338B); node v24.20.0 present; **no chromium/Chrome; no Playwright/bs4/requests** in `.venv`; CI = GitHub Actions (ubuntu-latest, Python 3.12 + Node 24). Approach: stdlib Python deterministic check measuring delivered bytes + a `zlib` gzip estimate against the approved budgets (JS ≤ 25 KB, CSS ≤ 15 KB, transfer ≤ 100 KB), runnable in the existing Python environment and CI. Real-browser LCP/CLS measurement requires a browser lane (excluded as heavy) and stays out for now. **Tooling implemented and operational 2026-10-09** (`tools/check_bundle_budget.py`; deterministic; wired into the gate; byte budgets PASS reproducibly — sha256 of three runs identical). **LCP/CLS remain `BLOCKED`** until a founder-approved browser lane exists — never a fabricated pass. Recorded in `PERFORMANCE_BUDGET.yaml` and closure report §20.
- **Re-measurement (2026-10-11, after decision 26.9):** the authorized Contact section + WhatsApp CTA added to `business/site/index.html` grew the first-load payload from **6532 B → 6932 B** (index.html 3908 B → 4308 B; JS unchanged at 2624 B; css 0 B). All byte budgets still PASS (`total_js 2624/25600`, `total_css 0/15360`, `transfer 6932/102400`); **LCP/CLS remain `BLOCKED`** (no approved browser lane). Recorded as `measurement.remeasured_2026_10_11` in `PERFORMANCE_BUDGET.yaml` and pinned by `tests/test_bundle_budget.py`.
- **Options:** (A) strict v1 budgets suited to a static text site (approved). (B) adopt industry defaults wholesale. (C) defer budgets until the first visual redesign snapshot exists.
- **Consequences:** budgets are now hard limits; TEST-007 stays `BLOCKED` until measurement tooling is chosen and operational — a separate decision.
- **Depends on:** nothing (root decision — satisfied). **Blocks:** TEST-007.
- **Affected manifest IDs:** TEST-007.
- **Release impact:** P1 — before visual redesign ships (budgets must exist to catch regressions).
- **Owner:** founder. **Approval state:** approved.

### 26.16 — Penpot hosting + §8.5 contract restatement

- **Decision:** (a) Penpot hosting: cloud vs self-host; (b) restate/approve the Penpot contract, because the historical §8.5 text is unrecoverable (risk §27.A).
- **Evidence:** PEN-001 REQUIRED ("no Penpot artefacts in repo or history; §8.5 text unrecoverable"), PEN-008 FUTURE ("NOT ESTABLISHED — cloud vs self-host"), GOV-008 REQUIRED ("§8.5 text unrecoverable"). Phase 8 closure search trail (§5.1 of PHASE8-CLOSURE) proves the text is gone; Gate 2 recovery (§2 above) re-confirms. No Penpot credentials or workspace referenced anywhere safe to use.
- **Status:** `APPROVED`. **approved_date:** `2026-10-10`. **approval_evidence:** founder approval 2026-10-10 of the proposed §8.5 restatement **verbatim**, with **Penpot Cloud** as the selected hosting option. The approved text is a NEW founder restatement, not recovered §8.5 history (see §2). Approval protocol §7 step 3: the agent records the founder instruction as provenance and chose no option.
- **Options:** (A) Penpot cloud + founder-approved restated contract (repo remains authoritative; Penpot downstream-only). (B) self-hosted Penpot (PEN-008) + restated contract (adds infrastructure — ETHOS §9: complexity must earn its place). (C) remain without Penpot entirely for v1 (then PEN-001…008 and TEST-014 must be reclassified, an explicit scope decision).
- **Recommended default (historical):** none for hosting; (A) was the planning assumption only — **PROPOSED DEFAULT, NOT APPROVED** until the founder approved option (A) on 2026-10-10 (hosting is now **selected**; see approval below). The §8.5 restatement obligation cannot be defaulted: the founder supplied the contract text on 2026-10-10.
- **Consequences:** Before approval: `PENPOT_IMPLEMENTATION_MAP.yaml` stayed `NOT_STARTED`, no Penpot mapping was claimed, the Penpot portion of Gate 2 reported `BLOCKED`. **After approval (2026-10-10):** `readiness.state` is `PARTIAL` (BLOCKER-1 connectivity + BLOCKER-2 contract resolved; BLOCKER-3 = the 22 pending GOV-004 tokens remain excluded), the top-level `status` stays `NOT_STARTED` (no mappings declared yet), and the Company OS design file does not exist — it is created by the founder in the Penpot app.
- **Depends on:** founder restatement (§8.5) — **supplied 2026-10-10**; 26.17 (storage/location conventions feed GOV-008 sync direction). **Blocks:** PEN-001, PEN-002, PEN-003, PEN-004, PEN-005, PEN-006, PEN-008, GOV-008, TEST-014.
- **Affected manifest IDs:** PEN-001, PEN-002, PEN-008, GOV-008, TEST-014 (all PEN/TEST-014 work derives from this decision).
- **Release impact:** P1 for the Penpot track; zero impact on the website token/component track (which proceeds on repo authority).
- **Owner:** founder. **Approval state:** approved (26.16) — 2026-10-10.
- **Founder directive (2026-10-09):** decision stays `BLOCKED`. The agent must **request the governing text or a founder restatement** specifying the required Penpot contract and hosting expectations before any mapping claim. Independent repo-authority work continues; no Penpot readiness is claimed (MCP unmounted/unwired; see closure report §19/§20).
- **Founder approval (2026-10-10):** the founder approved the proposed §8.5 restatement **verbatim** and selected **option (A) — Penpot Cloud**. **Selected option:** (A) Penpot Cloud + approved restated contract (repo remains authoritative; Penpot downstream-only). The 22 `VALID_PENDING_DECISION` GOV-004 tokens stay excluded from modelling. Approved contract text (verbatim owner wording):

  > **Decision 26.16 — Penpot Cloud and Design Synchronization Contract**
  >
  > **Hosting:** Company OS will use Penpot Cloud for its design workspace.
  >
  > **Authority:** The Company OS repository is authoritative for approved design tokens and governed specifications. Penpot is the visual design and collaboration workspace. Neither source may silently override the other's governed artifacts.
  >
  > **Synchronization:** Governed token synchronization is one-way from the repository to Penpot. Synchronization and verification will run on demand during design work and at defined automation or release checkpoints where technically supported. Unsupported automation must be identified explicitly rather than simulated.
  >
  > **Conflict resolution:** Synchronization must detect and report conflicting or divergent values. It must not silently overwrite approved content. Resolution requires review, an explicit decision, and an auditable change to the appropriate source of truth.
  >
  > **Tool commitment:** Company OS will use the existing Penpot Cloud interface and verified remote MCP integration for supported design operations. Repository tooling and CI remain responsible for deterministic validation and implementation verification. Consequential writes must be read back and verified.
  >
  > **Reliability and auditability:** Operations must be validated before execution, safe to repeat where practicable, and accompanied by evidence of their result. Partial failures or ambiguous outcomes must be reported explicitly and must not be treated as successful synchronization.
  >
  > **Approval and change control:** Owner-controlled decisions remain subject to explicit approval. Exploratory design work does not automatically become an approved specification or production implementation.
  >
  > **Release quality:** Design-system and page completion requires applicable responsive, accessibility, implementation-parity, and regression checks. A successful connection or synchronization alone does not establish completion.

- **Provenance note:** the approved text is the founder's **new restatement**, recorded verbatim above. It is **not** recovered historical §8.5 text (which remains `UNKNOWN` — §2). Hosting selection: **Penpot Cloud** (option A). Sync direction remains one-way repository → Penpot (GOV-008); the schedule and safeguards are to be implemented according to the actual capabilities of the existing tooling.

### 26.17 — Design-system location

- **Decision:** Where the design system lives: in-repo (`docs/design/` package — the current branch's choice) vs a dedicated repository.
- **Evidence:** GOV-001 REQUIRED ("docs/ empty; no DESIGN.md" at audit time — now satisfied by this package), GOV-007 REQUIRED (storage format decision: W3C Design Tokens–compatible JSON vs other). The package branch itself instantiated `docs/design/` + `tools/validate_design_manifest.py` under a single git history; audit default: "In-repo — single git history". `DESIGN_TOKENS.md` §Authority already defers to "the approved design-system location".
- **Status:** `APPROVED`. **approved_date:** `2026-10-08`. **approval_evidence:** founder instruction in the Gate 3 interactive session, 2026-10-08, recorded here by the agent per §7.3 (founder instruction is the provenance; the agent chose no option).
- **Selected option:** **(A)** — in-repository `docs/design/` package as the **canonical design-system location**.
- **Founder instruction (verbatim, founder-supplied):** "Approve Option A — the in-repository docs/design/ package as the canonical design-system location."
- **Recorded locations (verbatim intent, founder-supplied):**
  1. **Canonical location:** `docs/design/` in the Company OS repository.
  2. **Machine-readable tokens:** `docs/design/DESIGN_TOKENS.yaml`.
  3. **Human-readable specifications:** the existing Markdown specifications under `docs/design/`.
  4. **Manifest and Penpot mapping:** remain under `docs/design/`.
  5. **Validators:** remain under `tools/`.
  6. **Source of truth:** Git history in the Company OS repository; **no separate design repository or external authority**.
  7. **Ownership:** the founder is accountable and retains **sole approval authority**. Agents may propose and implement changes through the established review workflow but **cannot self-approve decisions**.
- **Propagation performed:** `DESIGN_TOKENS.md` §Authority now states the canonical location as **resolved** (26.17, 2026-10-08), not future work; GOV-007 is recorded as resolved by this decision.
- **GOV-007 resolution (per founder instruction):** this decision **resolves the storage-format decision (GOV-007)** — `docs/design/DESIGN_TOKENS.yaml` is canonical machine-readable token storage, diffable in git — **without changing any approved token value or bypassing pending decisions.** Pending stand-alone tokens (39) and the pending hue-family carve-out remain exactly as governed by their own decisions.
- **Options:** (A) in-repo `docs/design/` — **selected**. (B) dedicated design repo. (C) naming variant (`docs/DESIGN.md` + `design/tokens.json`).
- **Consequences:** the whole package converts from "working draft" to canonical; GOV-001 satisfied (source-of-truth doc exists in-repo); GOV-008 sync direction resolved meanwhile (Penpot ↔ repo, repo canonical per §21.4) but its full contract remains provisional on §8.5 recovery (§27.A).
- **Depends on:** nothing. **Blocks (unblocked/ resolved):** GOV-001, GOV-007 (resolved), GOV-008 (sync direction only; full contract still blocked on §8.5), DESIGN_TOKENS.md canonical-path statement.
- **Affected manifest IDs:** GOV-001, GOV-007, GOV-008.
- **Release impact:** P0 governance — this approval is what makes the package canonical.
- **Owner:** founder. **Approval state:** approved (canonical location); founder retains sole approval authority; agents cannot self-approve.

### 26.18 — GOV-004 scoped token-value approval (register entry)

- **Decision:** Represent the GOV-004 scoped value approval as a dedicated register decision so the affected §8 ownerless tokens can carry a real `decision_id` and classify deterministically.
- **Evidence:** §8 mapping ratified by the founder 2026-10-09 (Option A, GOV-004 — not §26.6). Value approval granted 2026-10-09 ("approve, with validation"); deterministic verification corrected the claimed count to **11 effective values**; §8 addendum recorded the encoding blocker (validator register accepted exactly `26.1`–`26.17`).
- **Status:** `APPROVED`. **approved_date:** `2026-10-09`. **approval_evidence:** founder authorization in the 2026-10-09 finalize directive — GOV-004 scoped token-value approval covering exactly 11 tokens (5 evidence-backed + 6 aliases to non-null canonicals); 8 aliases-to-null and 14 deferred null-valued tokens remain unapproved; validator decision-ID set extended only for 26.18 (exact-set enforcement preserved).
- **Scope (binding):** authorizes exactly 11 values:
  - **(a) Evidence-backed (5):** `primitive.radius.14` (14px), `primitive.radius.pill` (999px), `primitive.border.width-1` (1px), `primitive.shadow.none` (`none`), `component.container.max` (980px).
  - **(b) Aliases to non-null canonicals (6):** `semantic.radius.md`→`primitive.radius.14`, `semantic.radius.pill`→`primitive.radius.pill`, `semantic.border.width`→`primitive.border.width-1`, `semantic.shadow.none`→`primitive.shadow.none`, `component.card.radius`→`semantic.radius.md`, `component.badge.radius`→`semantic.radius.pill`.
  - **NOT approved:** the 8 aliases resolving to null (`semantic.z.{base,dropdown,sticky,overlay,modal}`, `semantic.icon.{sm,md,lg}`) and the 14 deferred null-valued tokens (d-group) — they stay `VALID_PENDING_DECISION` with `decision_id: null` until real consumer requirements justify values.
- **Contract change (founder-authorized):** `validate_design_tokens.py` `validate_register` expected-ID set extended `{26.1..26.17}` → `{26.1..26.18}`. Exact-set enforcement, unknown-ID rejection, dependency checks, and cycle checks are unchanged. No other gate/validator was modified.
- **Not a package sign-off:** individual value approval ≠ Gate 2 package approval; existing blockers (26.1/26.5, 26.9, 26.11, 26.16) stand.
- **Propagation performed:** the 11 in-scope tokens' `decision_id` set to `"26.18"` and computed status now `VALID_APPROVED`; affected mirrors/counts updated from the source token data.
- **Options:** (a) dedicated register decision under GOV-004 — **selected**. (b) leave `decision_id` null with approval recorded as prose only (kept the encoding blocker). (c) attribute to an existing §26 decision (withdrawn by closure §19.2 — would falsify governance data).
- **Depends on:** nothing (root decision — satisfied).
- **Affected manifest IDs:** GOV-004.
- **Owner:** founder. **Approval state:** approved (scoped value approval).

---

## 4. Decision dependency graph

```text
26.1 Brand mark ──────────────► 26.5 Lockup ─► BRAND-009
       │
       └────────────────────────────────────► PAGE-027 / BRAND-010

26.2 Font strategy ──────────► type tokens (FOUND-004/005/007/024)

26.3 Palette ────────────────► 26.4 Dark mode ─► FOUND-021
       │
       ├──► colour tokens (FOUND-001/002/003/013)
       ├──► contrast matrix (TEST-006) ─► A11Y-004 fix (badge border)
       └──► COMP-DAT-06 rebuild

26.6 Density ────────────────► spacing end values (FOUND-009/020)
26.7 Motion budget ──────────► motion tokens (FOUND-016) + A11Y-007 scope
26.8 Breakpoints ────────────► responsive family (FOUND-015, RESP-*, TEST-009)

26.10 Multi-page IA ─────────► 26.9 Contact path (form pages need IA)
                 ├──────────► 26.11 Terms/consent (PAGE-011 in IA)
                 └──────────► 26.13 Blog/CMS (long-form placement)

26.9  Contact path ──► WhatsApp deep link https://wa.me/256760779160 ✔ APPROVED 2026-10-11 (option E; no backend/email)
26.11 Terms/consent ── ✔ APPROVED 2026-10-11 (owner-managed, out of initial-release scope; analytics stays enabled)
26.12 Custom domain ─► deployment policy (independent)
26.14 Imagery ────────► media tokens / RESP-008 / A11Y-008 (independent)
26.15 Budgets ────────► TEST-007 (independent)
26.17 Location ───────► 26.16 hosting/contract ✔ APPROVED 2026-10-10 (option A: Penpot Cloud + restated contract)
```

Hard edges enforced by the register (validator-checked `depends_on`):

| From | To |
|---|---|
| 26.4 | 26.3 |
| 26.5 | 26.1 |
| 26.9 | 26.10 |
| 26.11 | 26.10 |
| 26.13 | 26.10 |
| 26.16 | 26.17 |

No cycles exist in this edge set (checked deterministically by `tools/validate_design_graph.py`).

---

## 5. Machine-readable decision register

<!-- decision-register:start — parsed by tools/validate_design_tokens.py; do not edit except to record founder approval (status + approved_date + approval_evidence) or, with explicit founder authorization, to add a new decision row (26.18 added 2026-10-09) -->
```yaml
decision_register:
  - {id: "26.1",  status: APPROVED,        approval: approved, approved_date: "2026-10-11", approval_evidence: "Founder instruction 2026-10-11: approve the brand mark as the exact text wordmark COM-OS (option A, wordmark-only); one logo lockup; no symbol/artwork — recorded in §3 26.1 (DESIGN_DECISIONS.md)", depends_on: [], notes: "Option A selected 2026-10-11 (supersedes the 2026-10-09 option-B direction-only re-confirmation). Canonical mark = typeset text COM-OS; product name Company OS retained in <title>/og:title (deploy-gate-pinned); BRAND-009/010 + PAGE-027 no longer asset-blocked, but no artwork is produced here"}
  - {id: "26.2",  status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve Option A' (system stack for v1; webfont deferred); concrete type values supplied as a proposed scale and verified against current CSS before token approval — recorded in §3 26.2 (DESIGN_DECISIONS.md)", depends_on: []}
  - {id: "26.3",  status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve option A' with scope clarification — recorded in §3 26.3 (DESIGN_DECISIONS.md) — plus hue-family Option 1 (neutral-derived monochrome) separately approved 2026-10-09 — §3 26.3 addendum", depends_on: [], notes: "Hue family separately approved 2026-10-09 (Option 1 monochrome): six carve-out tokens + dark counterparts now VALID_APPROVED; see §3 26.3 addendum"}
  - {id: "26.4",  status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'approve B — both light and dark' with explicit theme-architecture mandate (both AA, no light-only component colours, visual regression covers both themes, fits approved budgets) — recorded in §3 26.4", depends_on: ["26.3"]}
  - {id: "26.5",  status: APPROVED,        approval: approved, approved_date: "2026-10-11", approval_evidence: "Founder instruction 2026-10-11: one logo lockup, no variants (option A) — recorded in §3 26.5 (DESIGN_DECISIONS.md)", depends_on: ["26.1"], notes: "Single lockup = the typeset COM-OS wordmark (26.1). Affected ids corrected to BRAND-002/BRAND-009 (the earlier COMP-CON-08 reference was a §6 divergence — COMP-CON-08 is a two-column layout, not a lockup)"}
  - {id: "26.6",  status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve Option A — comfortable default' (ratify measured spacing; keep 10px/18px optical exceptions; no compact scale) — recorded in §3 26.6", depends_on: []}
  - {id: "26.7",  status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve Option A' (minimal reduced-motion-safe; 150/250/400ms; cubic-bezier(0.2,0,0,1)) — recorded in §3 26.7 (DESIGN_DECISIONS.md)", depends_on: []}
  - {id: "26.8",  status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve Option A' (480/768/1024/1440 CSS px; em equivalents as supporting doc only) — recorded in §3 26.8 (DESIGN_DECISIONS.md)", depends_on: []}
  - {id: "26.9",  status: APPROVED,        approval: approved, approved_date: "2026-10-11", approval_evidence: "Founder instruction 2026-10-11: direct WhatsApp deep link to +256760779160 (https://wa.me/256760779160); no form/backend/email — recorded in §3 26.9 (DESIGN_DECISIONS.md)", depends_on: ["26.10"], notes: "Option E (WhatsApp deep link) selected 2026-10-11; BLOCKED genuinely cleared by choosing a path needing no backend/email; affected ids PAGE-010, COMP-ACT-11; mailto prohibition + test_site_content.py invariants preserved"}
  - {id: "26.10", status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve Option A — the full §17.3 information architecture' with 7 binding constraints (extend not weaken test_site_content.py; case-study empty state; no contact forms before 26.9; no OG complete before 26.1/26.5; dependencies stay BLOCKED; IA ≠ implementation/launch readiness; 26.13 kept separate) — recorded in §3 26.10", depends_on: []}
  - {id: "26.11", status: APPROVED,        approval: approved, approved_date: "2026-10-11", approval_evidence: "Founder instruction 2026-10-11: legal pages + cookie/analytics consent outside initial-release scope; owner handles legal privately; analytics stays enabled (option D) — recorded in §3 26.11 (DESIGN_DECISIONS.md)", depends_on: ["26.10"], notes: "PAGE-017/PAGE-018 stay OUT_OF_SCOPE (declared excluded against this decision); EXCL-006 excluded; BASE-003 analytics remains enabled; engineering publishes no legal text or legal assertions"}
  - {id: "26.12", status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve Option A — retain the pages.dev-only deployment gate' (deploy-site.sh stays pages.dev-only; Phase 8 gate preserved; EXCL-001 OUT_OF_SCOPE; no domain/DNS/TLS now; reopen only with founder-recorded domain + gate updated and verified first) — recorded in §3 26.12", depends_on: []}
  - {id: "26.13", status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve Option A — keep the blog and CMS/editorial pipeline excluded from v1', re-evaluation gated on all three evidenced conditions (recurring demand, named owner, defined cadence); VOX-005…008 retained — recorded in §3 26.13", depends_on: ["26.10"]}
  - {id: "26.14", status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve Option B — abstract SVG only' with 8 binding constraints (no photography/stock; text-led; mark separate; provenance+licence; responsive+aspect-ratio; alt-text policy first; count against 26.15 budgets; founder approval before publish; media tokens evidenced only, no library) — recorded in §3 26.14", depends_on: []}
  - {id: "26.15", status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve Option A — strict v1 budgets' (LCP 1.5s/4G, CLS 0.05, JS 25KB, CSS 15KB, transfer 100KB; tooling separate) — recorded in §3 26.15", depends_on: [], notes: "Measurement approach approved 2026-10-09 (stdlib deterministic bundle-budget); tooling operational 2026-10-09 (tools/check_bundle_budget.py) — byte budgets PASS reproducibly; LCP/CLS stay BLOCKED until a founder-approved browser lane"}
  - {id: "26.16", status: APPROVED,        approval: approved, approved_date: "2026-10-10", approval_evidence: "Founder approval 2026-10-10: proposed §8.5 restatement approved verbatim; Penpot Cloud selected (option A) — new restated contract, NOT recovered §8.5 history (historical text UNKNOWN, §2); recorded in §3 26.16", depends_on: ["26.17"], notes: "BLOCKED until 2026-10-10 pending founder restatement; repo remains authoritative / Penpot downstream-only; the 22 GOV-004 pending tokens stay excluded from modelling (approved contract)"}
  - {id: "26.17", status: APPROVED,        approval: approved, approved_date: "2026-10-08", approval_evidence: "Gate 3 interactive session 2026-10-08: founder instruction 'Approve Option A — the in-repository docs/design/ package as the canonical design-system location' (canonical locations + ownership recorded; GOV-007 storage format resolved without changing token values or bypassing pending decisions) — recorded in §3 26.17", depends_on: []}
  - {id: "26.18", status: APPROVED,        approval: approved, approved_date: "2026-10-09", approval_evidence: "Founder authorization 2026-10-09 (finalize directive): GOV-004 scoped token-value approval — authorize exactly 11 tokens (5 evidence-backed + 6 aliases to non-null canonicals) under §8; 8 aliases-to-null and 14 deferred null-valued tokens NOT approved; validator decision-ID set extended only for 26.18 — recorded in §3 26.18, §8", depends_on: [], notes: "GOV-004 scoped value approval; does not set an owner for null-valued or deferred tokens; not a package sign-off."}
```
<!-- decision-register:end -->

---

## 6. Audit cross-reference notes (documented divergences)

The audit §26 table's inline manifest-ID parentheses diverge from the §15/§14.4 registry (which matches `DESIGN_MANIFEST.yaml` exactly). This register uses the §15-correct IDs. Divergences recorded, not silently patched — the audit stays immutable as the baseline:

| Decision | Audit §26 inline ref | §15 registry says | Treatment |
|---|---|---|---|
| 26.2 | "(BRAND-001…004)" | Brand fonts = BRAND-007/008 (BRAND-001…004 = logo/wordmark/favicon/imagery) | Record BRAND-007/008; audit table unchanged |
| 26.3 | "(BRAND-005…008)" | Palette = BRAND-006/007/008 (BRAND-005 = icon set) | Record BRAND-006…008 |
| 26.4 | Blocks "FOUND-016, token doubling" | Dark palette = FOUND-021 (FOUND-016 = motion tokens, belongs to 26.7) | Recorded BRAND-013 + FOUND-021 — both promoted FUTURE → REQUIRED in `DESIGN_MANIFEST.yaml` (2026-10-11, under approved 26.4) |
| 26.5 | "(BRAND-011)" | BRAND-011 = iconography; lockup evidence sits in BRAND-009/002 (`COMP-CON-08` is a two-column content layout, not a lockup) | Record BRAND-009 + BRAND-002 (COMP-CON-08 reference corrected 2026-10-11 under approved 26.5) |
| 26.6 | "(BRAND-013)" | Density = BRAND-014 (BRAND-013 = dark theme) | Record BRAND-014 + FOUND-009/020 |
| 26.7 | "(BRAND-014/015)" | Motion = BRAND-015 only (BRAND-014 = density) | Record BRAND-015 + FOUND-016 + A11Y-007 — BRAND-015 promoted FUTURE → REQUIRED (2026-10-11) |
| 26.10 | audit §17.3 cites "§26.4" for IA | IA decision = 26.10 in the §26 table (26.4 = dark mode) | Typo noted; IA stays 26.10 |

These are documentation-level divergences inside the audit. They do not affect the 290-item verification (audit §14.5 intact). The only manifest status/count changes derived from them are the approved-decision propagations, not silent corrections of the audit: dark theme `BRAND-013` + `FOUND-021` → `REQUIRED` under 26.4, and motion `BRAND-015` → `REQUIRED` under 26.7 (REQUIRED 175→178, FUTURE 63→60). Both were detected and justified by the machine-readable decision→manifest effects map (`DESIGN_MANIFEST` + `docs/design/DECISION_MANIFEST_EFFECTS.yaml` + `tools/validate_decision_manifest.py`).

---

## 7. Approval protocol

1. Founder reviews a decision record (§3) and its options.
2. Founder edits the row in §5: `status: APPROVED`, adds `approved_date: YYYY-MM-DD` and `approval_evidence: "<commit / meeting / message ref>"`, and (if choosing a non-default option) replaces the recommended default in the §3 record with the chosen option, marked **APPROVED**.
3. Founder commits the change (or instructs an agent to make that exact edit — the agent records the instruction as provenance and does not choose the option).
4. `python3 tools/validate_design_tokens.py` re-runs: dependent tokens flip `VALID_PENDING_DECISION → VALID_APPROVED` when their value satisfies structure and contrast checks; any token whose decision is still pending keeps its pending classification.
5. Decisions with `status: BLOCKED` may only leave `BLOCKED` when the external dependency is evidenced as cleared (e.g. §34 email capability for 26.9, founder §8.5 restatement for 26.16).
6. `PENDING_ESCALATE` (26.11) is re-raised at every design review until approved or explicitly withdrawn with a recorded rationale.

---

## 8. Ownerless token mapping (GOV-004) — recorded 2026-10-08 (Gate 3 closure)

The 33 tokens with `decision_id: null` are owned by **no §26 decision** and governed via
GOV-004 / FOUND-012 / FOUND-014 (NOT by 26.6). Full mapping and rationale:
`evidence/runs/design-gate3-decision-closure-2026-10-08.md` §8. Summary:

- **(a) Evidence-backed (5)** — current-site baseline, no invention: `primitive.border.width-1`
  (1px), `primitive.radius.14` (14px), `primitive.radius.pill` (999px), `primitive.shadow.none`
  (`none`), `component.container.max` (980px).
- **(b) Deterministic alias derivations (14)** — value follows the referenced token:
  `semantic.border.width`, `semantic.radius.{md,pill}`, `semantic.shadow.none`,
  `semantic.icon.{sm,md,lg}`, `semantic.z.{base,dropdown,modal,overlay,sticky}`,
  `component.badge.radius`, `component.card.radius`.
- **(d) Deferred — no evidence, not required for v1 (14)** — re-checked under GOV-004 when a
  consumer component needs them: `primitive.icon.{sm,md,lg}` (post-26.1 asset/icon system),
  `primitive.shadow.{low,medium,high}` (needs overlay/component decision),
  `primitive.z.{base,dropdown,modal,overlay,sticky}` (overlays/nav shell), `semantic.radius.{sm,lg}`
  (no consumer sizes), `semantic.focus.width` (FOUND-017).
- **(c) New founder decisions required: 0** — nothing invented; no validation warning is silenced
  by this mapping (honest classification is the goal).
- **Founder ratification (2026-10-09):** the founder ratified **Option A of this mapping** under
  GOV-004 (not §26.6) — **(a) 5 evidence-backed adopted**, **(b) 14 deterministic alias
  derivations**, **(d) 14 deferred**. Deferred tokens stay pending; no owner is fabricated. The
  mechanism below is unchanged: when a deferred token becomes required, the founder approves its
  value under GOV-004 and the token's `decision_id` is set in `DESIGN_TOKENS.yaml`.
- **Value approval (2026-10-09, GOV-004 A1 — founder "approve, with validation"):** the founder
  approved the **values** this mapping carries, conditioned on traceability and on every alias
  exactly matching its canonical token. Deterministic verification corrected the claimed count:
  only **11 of the 19 tokens carry an effective value**. (a) **5 evidence-backed values** — each
  traceable to `index.html:12` / audit §5.2 — `primitive.radius.14` (14px),
  `primitive.radius.pill` (999px), `primitive.border.width-1` (1px), `primitive.shadow.none`
  (`none`), `component.container.max` (980px). (b) **6 valued aliases** — each exactly references
  its canonical primitive (no new or conflicting value): `semantic.radius.md`→`primitive.radius.14`,
  `semantic.radius.pill`→`primitive.radius.pill`, `semantic.border.width`→`primitive.border.width-1`,
  `semantic.shadow.none`→`primitive.shadow.none`, `component.card.radius`→`semantic.radius.md`,
  `component.badge.radius`→`semantic.radius.pill`. The remaining **8 aliases**
  (`semantic.z.{base,dropdown,sticky,overlay,modal}`, `semantic.icon.{sm,md,lg}`) resolve to
  **null deferred primitives** (the d-group), so they carry no value to approve and stay pending.
**Recording decision IDs — RESOLVED (2026-10-09):** the founder supplied the intended
   representation and authorized the required gate change. GOV-004 scoped value approvals are
   now encoded as register decision **26.18** (see §3 26.18); `validate_design_tokens.py`
   `validate_register` accepted exactly `26.1`–`26.17` and was extended to `{26.1..26.18}`
   under explicit founder authorization, preserving exact-set enforcement, unknown-ID rejection,
   dependency checks, and cycle checks. The **11 in-scope values** now carry `decision_id: "26.18"`
   and classify `VALID_APPROVED`. **Nothing else changed:** the 8 aliases-to-null and the 14
   deferred null-valued tokens keep `decision_id: null` and stay `VALID_PENDING_DECISION`, and
   validators no longer warn on the 11 approved tokens (the warnings the approval legitimately
   removes are not "silenced" — approval is the reason they go away).

When a deferred token becomes required, the founder approves its value under GOV-004 and the
token's `decision_id` is set in `DESIGN_TOKENS.yaml`.

---

## 9. GOV-004 final dispositions of remaining open items (2026-10-09)

Founder final recommended decisions on the remaining GOV-004 / Gate 3 open items, recorded for the
audit trail. Where a decision defers or keeps an item blocked, the item's own record above (§3/§5)
is unchanged and remains authoritative.

| Ref | Item | Founder disposition | Effect | Recorded at |
|---|---|---|---|---|
| A1 | §8 ownerless values (radius/border/shadow/container) | Approve, with validation | Value approval recorded (§8 addendum, scope = 11 effective values); GOV-004 `decision_id` encoded as register decision **26.18** (founder-authorized validator set extension, 2026-10-09); the 11 tokens now carry `decision_id: "26.18"` and classify `VALID_APPROVED` | §3 26.18, §8 addendum |
| A2 | PAGE-027 template mapping | Confirm Utility, subject to scope | Mapping `PROPOSED`→`CONFIRMED` under Utility (26.10); og:image content stays BLOCKED on the approved mark (26.1/26.5) — no asset approved, no blocker lifted | `PAGE_TEMPLATE_MAP.yaml`, §3 26.10 |
| A3 | Gate 2 package-wide sign-off | Hold | Package sign-off stays pending (13 approved decisions; asset/legal/contract blockers remain) | §3, status header |
| C1 | Brand asset (26.1/26.5, BRAND-009/010) | Defer | Founder supplies/commissions the asset; pending-asset record unchanged | §3 26.1/26.5, `BRAND_ASSET_SPEC.md` |
| C2 | Legal/consent/disclosure (26.11) | Defer | Minimum required input (jurisdictions, data, purposes, processors, retention, requirements) awaited; no consent mechanism or legal assertions | §3 26.11 |
| C3 | §8.5 contract + hosting (26.16) | Defer | Founder must restate the contract + hosting expectation; not reconstructed by the agent | §3 26.16 |
| C4 | Penpot readiness | Keep BLOCKED | No readiness claimed; MCP unmounted/unwired; real connection + required operations must be verified first | §3 26.16, `PENPOT_IMPLEMENTATION_MAP.yaml` |
| C5 | Performance measurement (26.15 / TEST-007) | Proceed with the approved measurement approach | stdlib deterministic bundle-budget tooling proceeds (`PERFORMANCE_BUDGET.yaml`); TEST-007 stays BLOCKED until the tool is operational and reproducible | §3 26.15, `PERFORMANCE_BUDGET.yaml` |
| C6 | 14 null-valued deferred tokens (d-group) | Defer | No values assigned until real consumer requirements justify them | §8 mapping (d) |
| D1–D5 | Rendered-evidence verification obligations (visual regression both themes, rendered accessibility review, responsive behaviour validation, production implementation) | Keep open | None exercised without rendered artifacts + deterministic evidence; no launch readiness claimed | §3 26.4/26.8, contrast_matrix, closure report §19.8 |

A1's `decision_id` representation is now resolved: register decision **26.18** (this pass) with a
founder-authorized validator set extension (`validate_design_tokens.py` `validate_register`
expected IDs `{26.1..26.17}` → `{26.1..26.18}`). No other gate, validator, register, CI, or
deployment was changed by this decision pass.

**Superseding resolution (2026-10-10):** C3 and C4 are superseded. On 2026-10-10 the founder
approved the proposed §8.5 restatement **verbatim** and selected **Penpot Cloud** (decision 26.16
→ `APPROVED`; §3 26.16). The contract is a new restatement, **not** recovered §8.5 text. Penpot MCP
connectivity was verified live on 2026-10-10
(`evidence/runs/design-phaseD-penpot-diagnostic-2026-10-10.md`); the readiness map's BLOCKER-1 and
BLOCKER-2 are resolved and `readiness.state` moved off `BLOCKED` (`PENPOT_IMPLEMENTATION_MAP.yaml`).
The table above remains the dated 2026-10-09 record.

**Superseding resolution (2026-10-11):** A2, A3, C1, and C2 are resolved by founder instruction of
2026-10-11. `26.1` and `26.5` are APPROVED wordmark-only / single-lockup (**C1** resolved: no asset is
pending — the mark is the typeset text `COM-OS`); `26.11` is APPROVED with terms/consent out of
initial-release scope and analytics enabled (**C2** resolved: owner-managed legal, no ongoing
escalation); the `og:image`/PAGE-027 asset blocker in **A2** is lifted (mark decided; artwork not
produced here); the package-wide sign-off in **A3** may now proceed (all four previously-open
decisions closed 2026-10-11, clearing GATE-3). The dated table above remains the 2026-10-09 record.
