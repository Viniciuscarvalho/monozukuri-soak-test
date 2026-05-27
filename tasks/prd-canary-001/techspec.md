# TechSpec — canary-001: Add release canary marker

> **Token budget for this document: 1200 words max.** Code over prose. Tables over paragraphs. Show interfaces, not explanations of interfaces.

**Feature:** canary-001
**Inherits from:** `./prd.md`
**Date:** 2026-05-27
**Status:** draft

---

## Approach

Add one dependency-free ESM module that exports the marker as a named function. Keep the existing `src/index.js`, `package.json`, and npm script behavior unchanged so the canary proves the loop can carry a narrow additive source change. Verification is command-based: import the new module directly, assert function shape and exact string equality, then run the existing `npm test`.

### Key decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Export shape | Named ESM export `canaryMarker` | Matches existing ESM style in `src/index.js` and PRD import contract. |
| Marker implementation | Literal string return in a pure function | Enforces exact value, constant-time execution, and no I/O/env/timer/randomness. |

---

## Existing codebase patterns this feature MUST follow

```js
export function hello(name = "world") {
  return `Hello, ${name}!`;
}
```

```js
// No logging exists in current source; do not add logging for this marker.
```

```json
{
  "scripts": { "test": "echo 'no tests yet'; exit 0" }
}
```

**Naming:** files `kebab-case.js` under `src/` · functions `camelCase` · types `n/a`

**Project conventions** (from learning store):

- Keep canary changes feature-scoped, deterministic, dependency-free, and compatible with direct command verification.
- Preserve existing npm test behavior unless the PRD explicitly requires package metadata changes.

---

## File change map

> **File budget: ≤ 20 files touched.** If this feature requires more, it's two features — split it before proceeding.

files_likely_touched:
- `src/canary-marker.js`

### New files

| Path | Purpose | Implements |
| --- | --- | --- |
| `src/canary-marker.js` | Export pure release canary marker function. | FR-001, NFR-001, NFR-002 |

### Modified files

| Path | Change | Risk | Implements |
| --- | --- | --- | --- |
| None | No existing source or package metadata changes planned. | low | FR-002, NFR-003 |

### Read for context only

| Path | Why |
| --- | --- |
| `src/index.js` | Existing ESM export style and baseline public export to preserve. |
| `package.json` | Existing `npm test` command and dependency-free package metadata. |
| `tasks/prd-canary-001/prd.md` | Source of FR/NFR and exact marker string. |

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

1. Exposes `canaryMarker` as a named ESM export.
2. Returns the exact literal string `monozukuri-v2-canary-ready`.
3. Performs no input reads, I/O, env access, timers, randomness, logging, or dynamic string construction.

**Errors:**

| Condition | Handling |
| --- | --- |
| Caller passes arguments | Ignore by JavaScript default behavior; return the same literal. |
| Marker value is changed, cased differently, or padded | Direct node verification exits non-zero. |

### ExistingPackageContract

**Location:** `package.json`, `src/index.js`
**Implements:** FR-002, NFR-003

**Public interface:**

```js
export function hello(name = "world") {
  return `Hello, ${name}!`;
}
```

**Behavior:**

1. Leave `src/index.js` unchanged.
2. Leave `package.json` dependencies and scripts unchanged.
3. Validate compatibility with the existing `npm test` script.

**Errors:**

| Condition | Handling |
| --- | --- |
| Existing export changes | Reject during diff review. |
| Runtime dependency added | Reject during `package.json` inspection. |

---

## Testing

**Coverage target:** 100% of new marker behavior by command verification.

| Scope | Test file / command | Covers |
| --- | --- | --- |
| Unit | `node --input-type=module -e "import('./src/canary-marker.js').then(m=>{if(typeof m.canaryMarker!=='function')process.exit(1);if(m.canaryMarker()!=='monozukuri-v2-canary-ready')process.exit(1)})"` | FR-001 exact export and return value; NFR-001 pure call path |
| Regression | `npm test` | FR-002 and NFR-003 existing package behavior |
| Inspection | `src/canary-marker.js`, `package.json`, `src/index.js` | NFR-002 and hard constraints: no I/O/env/dependencies/unrelated export changes |

### Validation commands

```bash
node --input-type=module -e "import('./src/canary-marker.js').then(m=>{if(typeof m.canaryMarker!=='function')process.exit(1);if(m.canaryMarker()!=='monozukuri-v2-canary-ready')process.exit(1)})"
npm test
git diff -- src/canary-marker.js src/index.js package.json
git diff --check
```

All four commands must exit 0 before the cycle gate passes. The `git diff --` command is a scoped inspection gate: expected source diff is only `src/canary-marker.js`.

---

## Task ordering

_Hint for the Tasks phase — not binding, but the agent should justify any deviation._

1. Create `src/canary-marker.js` — unlocks all FR-001/NFR-001/NFR-002 checks.
2. Run direct node import assertion — proves export shape and exact marker string.
3. Run `npm test` and scoped diff checks — proves FR-002/NFR-003 and no unrelated package/source changes.

```
create marker → direct node assertion
                   ↓
             npm test + scoped diff
                   ↓
             PR handoff
```

---

**Handoff to Tasks phase:** every component, file, and test referenced above must appear in at least one task. Each task must touch ≤ 5 files and complete in ≤ 60 minutes of agent time.
