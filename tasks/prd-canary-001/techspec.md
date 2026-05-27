# TechSpec — canary-001: Add release canary marker

> **Token budget for this document: 1200 words max.** Code over prose. Tables over paragraphs. Show interfaces, not explanations of interfaces.

**Feature:** canary-001
**Inherits from:** `./prd.md`
**Date:** 2026-05-27
**Status:** draft

---

## Approach

Add one isolated ES module at `src/canary-marker.js` with a named `canaryMarker()` export. The function returns the fixed string literal directly, with no imports, I/O, environment reads, or dependency changes. `src/index.js` remains unchanged so the existing `hello()` API is preserved. Verification uses the existing `npm test` script plus a direct Node import assertion against the new module.

### Key decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Export surface | New dedicated module only | PRD asks for `src/canary-marker.js`; changing `src/index.js` would expand scope and risk FR-002. |
| Marker value | Inline string literal | Deterministic, constant-time, no runtime state, satisfies FR-001 and NFR-001/NFR-002. |

---

## Existing codebase patterns this feature MUST follow

```js
export function hello(name = "world") {
  return `Hello, ${name}!`;
}
```

```js
// No logging in existing source; marker module should not add logging.
```

```bash
npm test
```

**Naming:** files `kebab-case.js` · functions `camelCase` · types `none for this feature`

**Project conventions** (from learning store):

- Use named ES module exports consistent with `src/index.js`.
- Keep canary scope isolated unless tests require package script changes.

---

## File change map

> **File budget: ≤ 20 files touched.** This feature touches 1 implementation file.

files_likely_touched:
- `src/canary-marker.js`

### New files

| Path | Purpose | Implements |
| --- | --- | --- |
| `src/canary-marker.js` | Named marker export returning the exact canary string. | FR-001, NFR-001, NFR-002 |

### Modified files

| Path | Change | Risk | Implements |
| --- | --- | --- | --- |
| None | No existing source or package metadata changes planned. | low | FR-002, NFR-003 |

### Read for context only

| Path | Why |
| --- | --- |
| `src/index.js` | Confirm ES module export style and preserve existing API. |
| `package.json` | Confirm package manager and existing `npm test` command. |

---

## Components

### CanaryMarkerModule

**Location:** `src/canary-marker.js`
**Implements:** FR-001, NFR-001, NFR-002

**Public interface:**

```js
export function canaryMarker() {
  return "monozukuri-v2-canary-ready";
}
```

**Behavior:**

1. Exposes a named ES module export `canaryMarker`.
2. Returns exactly `monozukuri-v2-canary-ready` on every call.
3. Performs no imports, I/O, network access, filesystem reads, environment reads, logging, or mutation.

**Errors:**
| Condition | Handling |
| --- | --- |
| Marker string changed | Direct Node assertion fails. |
| Export missing or renamed | Import/assertion fails before the implementation gate passes. |

### ExistingIndexModule

**Location:** `src/index.js`
**Implements:** FR-002, NFR-003

**Public interface:**

```js
export function hello(name = "world") {
  return `Hello, ${name}!`;
}
```

**Behavior:**

1. Leave this file unchanged.
2. Preserve the existing `hello()` named export.
3. Use `npm test` as the package-level regression check.

**Errors:**
| Condition | Handling |
| --- | --- |
| `src/index.js` changes | Diff review rejects scope expansion. |
| Package test fails | Fix before cycle gate. |

---

## Testing

**Coverage target:** 100% of the new marker function.

| Scope | Test file | Covers |
| --- | --- | --- |
| Unit | inline Node import assertion | `canaryMarker` export exists and returns the exact string. |
| Regression | existing `npm test` script | Existing package behavior still passes. |
| Scope | git diff review | No unrelated source, package, dependency, or metadata changes. |

### Validation commands

```bash
npm test
node -e "import('./src/canary-marker.js').then(m=>{if(typeof m.canaryMarker!=='function')throw new Error('missing canaryMarker'); if(m.canaryMarker()!=='monozukuri-v2-canary-ready')throw new Error('bad marker');})"
git diff -- src/index.js package.json
git diff -- src/canary-marker.js
```

_All four commands must exit 0 before the cycle gate passes; the last two are scope/inspection gates._

---

## Task ordering

1. Add `src/canary-marker.js` — creates the only implementation surface.
2. Run direct Node import assertion — proves FR-001 and NFR-001/NFR-002.
3. Run `npm test` and inspect diff scope — proves FR-002/NFR-003 and canary isolation.

```
Add marker module -> Node import assertion
                 -> npm test
                 -> diff scope review
```

---

**Handoff to Tasks phase:** every component, file, and validation command above must appear in at least one task. Each task must touch ≤ 5 files and complete in ≤ 60 minutes of agent time.
