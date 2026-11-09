# Penpot Adapter Contract

**Status:** API surface AUDITED (read-only) · generated plugin code
integration **VERIFIED live on 2026-10-10** (see
`evidence/runs/design-phaseD-penpot-live-verify-2026-10-10.md`).

This is the version-controlled record of the Penpot Plugin API surface that the
Company OS design toolchain assumes. It is the reference that
`tools/penpot_plugin_codegen.py` emits against, that
`tools/penpot_plugin_runtime.py` drives on the offline mock
(`tests/penpot_mock/`), and that the live adapter confirmed on 2026-10-10 when
the `verify:false` program shape was dispatched and read back to VERIFIED on a
real connected workspace.

## Authority and scope

- The repository is authoritative; **Penpot is downstream-only** (decision
  26.16). This document records facts about Penpot's API; it neither grants
  permission nor changes policy.
- The audit below was performed against the published Penpot plugin type
  definitions (doc.plugins.penpot.app) and the connected Penpot instance
  (**Penpot 2.18.3**) via **read-only** introspection of the plugin API surface.
  No Penpot object was created, modified, renamed, deleted, or exported.
- Nothing here is a claim that the mapping works on a real workspace. That
  requires a live, human-approved target and a live adapter run (decision
  26.16; see *Boundaries*).

## Permission model

The plugin API is gated by declared permissions in the plugin manifest. The
operations this contract relies on require:

| Permission | Required for |
|---|---|
| `content:read` | reading shape/page state (read-back verification, `page.root`) |
| `content:write` | creating pages, boards, shapes, components, tokens, plugin-data markers |

The generated module must therefore run under a plugin that declares at least
`content:read` + `content:write`. A read-only invocation (verification pass) can
run under `content:read` alone. The toolchain never requests broader user data
permissions.

## Audited Plugin API surface

### Shape creation (on `penpot`)

| Member | Signature | Used for |
|---|---|---|
| `createBoard()` | `() => Board` | component roots / frames |
| `createRectangle()` | `() => Rectangle` | nodes |
| `createEllipse()` | `() => Ellipse` | nodes |
| `createPath()` | `() => Path` | nodes |
| `createText(text)` | `(text: string) => Text \| null` | text nodes |
| `group(shapes)` | `(shapes: Shape[]) => Group \| null` | node grouping |

### Page management

| Member | Signature | Used for |
|---|---|---|
| `createPage()` | `() => Page` | `ensure_page` |
| `openPage(page)` | `(page: string \| Page) => Promise<void>` | activation (live adapter) |
| `currentPage` | `Page \| null` | default creation target |
| `page.name` / `page.id` | `string` | identity |
| `page.root` | `Shape` (board) | root container; `root.appendChild(child)` |
| `page.findShapes(criteria)` | `({name?, nameLike?, type?}) => Shape[]` | idempotent lookup |
| `page.getShapeById(id)` | `(id: string) => Shape \| null` | read-back |

### Library, components and tokens

| Member | Signature | Used for |
|---|---|---|
| `penpot.library.local` | `Library` | the file's own library |
| `library.createComponent(shapes)` | `(shapes: Shape[]) => LibraryComponent` | `create_component` |
| `library.local.components` | `LibraryComponent[]` | idempotent lookup (`manifest_id`) |
| `library.tokens.sets` | `TokenSet[]` | token catalog navigation |
| `catalog.addSet({name, active?})` | `({name, active?}) => TokenSet` | named "Company OS" set |
| `set.addToken({type, name, value})` | `({type, name, value}) => Token` | `create_variable` upsert |
| `set.tokens` | `Token[]` | idempotent lookup (unique token `name`) |
| `File.revn` | `number` | open-file revision monotonic guard |

Penpot `TokenType` values relevant to Company OS: `color`, `fontFamilies`,
`fontWeights`, `dimension`, `number`, `spacing`, `borderRadius`, `borderWidth`,
`opacity`, `shadow`, `typography`. Mapping from Company OS token `type` is in
`tools/penpot_plugin_codegen.py::TOKEN_TYPE_MAP`.

### Plugin-data markers (identity + idempotency)

`PluginData` surfaces (`ShapeBase`, `Page`, `File`, `Library`,
`LibraryComponent`) all expose `setPluginData`/`getPluginData`/`getPluginDataKeys`
with a **string value**. The generated module writes `company-os:`-prefixed
markers (`node_id`, `page_id`, `manifest_id`, `identity`, `effects`, token value
markers) and reads them back verbatim. This is the mechanism that makes an
`UNKNOWN_OUTCOME` recoverable **by observation** instead of an unsafe retry.

### Verification: export

| Member | Signature | Purpose |
|---|---|---|
| `shape.export(config)` | `({type: "png"\|"jpeg"\|"svg"\|"webp"\|"pdf", scale?, ...}) => Promise<Uint8Array>` | visual export comparison (future) |
| `File.export(type, libraryExportType?)` | `("penpot"\|"zip", ...) => Promise<Uint8Array>` | whole-file download (not used by the one-way flow) |

`ShapeBase.export` confirms **shape-level** visual export exists in the Plugin
API, so a pixel-level parity check is possible in principle. It is not
implemented (see *Boundaries*).

### Audited but unused

`createShapeFromSvg`, `createBoolean`, `alignHorizontal/…`, `flatten`,
`history`, `viewport`, `selection`, `currentUser` — present in the API, not part
of the one-way repo→Penpot modelling flow.

## Operation mapping

| Plan kind | Plugin program | Idempotency | Read-back proof |
|---|---|---|---|
| `create_variable` | `TokenSet.addToken({type,name,value})` in the "Company OS" set | upsert keyed by unique token `name` | live token exists + `vareffects:` marker |
| `ensure_page` | `penpot.createPage()` + `page_id` marker | `findPage(page_id)` reuse | `page_id` marker + `identity` marker |
| `create_component` | `library.local.createComponent([board])` + `manifest_id` markers | `findComponent(manifest_id)` reuse | `manifest_id` + `identity` + `effects` markers |
| `create_node` | `penpot.create{Board,Rectangle,Ellipse,Text,Path,Group}` + `node_id` marker | `findShape(node_id)` reuse | `node_id` + `identity` + `effects` markers |

Every created object carries a `company-os:identity` marker (the plan's stable
`target`) and a `company-os:effects`/`company-os:vareffects:` marker (the
declared, token-bound effects), so the offline comparator matches on the
identifiers the compiler chose — never on ephemeral Penpot UUIDs.

## Explicitly unsupported

- **File creation via the Plugin API** — no Plugin API method creates a file, so
  the generated plugin program must not call `createFile` (the member does not
  exist). Company OS file *existence* is instead ensured out-of-band by
  `tools/penpot_provision.py` over the Penpot Cloud command API (`create-file`,
  find-or-create, read-back verified; manifest PEN-001). Connecting any created
  file to the MCP plugin remains a founder action.
- **Project creation / rename / delete** — not part of the Plugin API or the
  one-way flow.
- **Live execution** — the generated module is exercised **only** against the
  offline mock. Every program call carries `verified: false`; nothing is claimed
  against a real workspace.

## Mock fidelity (tests/penpot_mock)

`penpot_mock.mjs` models the audited subset: `createPage`, `openPage`,
`currentPage`, `createBoard/Rectangle/Ellipse/Path/Text`, `group`, `Page` with
`root`/`findShapes`/`getShapeById`, `Library.createComponent`, `TokenCatalog`
with `addSet`/`getSetById`, `TokenSet.addToken`, plugin-data on shapes/pages/
file/library, and a JSON persistence layer (`serialize`/`deserialize`) so a run
can survive separate processes. It is a **test double**: it models names and
shapes, not concurrent editing, real layout, or Penpot's stringification of
token values. It intentionally mirrors the audited shapes above.

## Boundaries (honesty)

- The audit is against published types plus read-only introspection on the
  connected instance; it is **not** a live execute/observe test.
- `apply` targets `penpot.currentPage` (see `sourcePage`); multi-page routing is
  a live-adapter concern and is deliberately out of scope offline.
- Visual export comparison (`shape.export`) is possible but **not implemented**;
  the offline read-back comparator proves structural effect parity only.
- `integration_status` is `LIVE_VERIFIED_2026-10-10` after the phase-D live run;
  a compiled program still carries `verified: false` — only a journaled live
  read-back proves an artefact.