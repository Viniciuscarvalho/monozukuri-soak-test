# TechSpec - canary-001: Add release canary marker

> **Token budget for this document: 1200 words max.** Code over prose. Tables over paragraphs. Show interfaces, not explanations of interfaces.

**Feature:** canary-001
**Inherits from:** `./prd.md`
**Date:** 2026-05-27
**Status:** draft

---

## Approach

Add a single ESM-style source module beside the existing `src/index.js` export. Keep `canaryMarker()` pure: no parameters, no I/O, no environment access, and one exact string literal return. Do not modify `package.json`, `src/index.js`, workflow files, or dependencies; verification is command-driven and inspection-based because this fixture has only an npm test script.

### Key decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Module shape | Named ESM export in `src/canary-marker.js` | Matches existing `src/index.js` style and PRD acceptance criteria. |
| Verification | Direct Node import command plus `npm test` and inspection | No test framework exists, and PRD asks for deterministic file/command validation only. |

---

## Existing codebase patterns this feature MUST follow

```js
export function hello(name = "world") {
  return `Hello, ${name}!`;
}
```

```json
{
  "scripts": { "test": "echo 'no tests yet'; exit 0" }
}
```

```bash
node --input-type=module -e "import('./src/canary-marker.js').then(m=>{if(m.canaryMarker()!=='monozukuri-v2-canary-ready')process.exit(1)})"
```

**Naming:** files `kebab-case.js` under `src/`, functions `camelCase`, types `none`

**Project conventions** (from learning store):

- No feature-specific learning entries are recorded for this run.
- Keep the change small, deterministic, dependency-free, and verified by commands or inspection.

---

## File change map

> **File budget: <= 20 files touched.** If this feature requires more, it's two features - split it before proceeding.

files_likely_touched:
- `src/canary-marker.js`

### New files

| Path | Purpose | Implements |
| --- | --- | --- |
| `src/canary-marker.js` | Export the deterministic release canary marker function. | FR-001, NFR-001, NFR-002 |

### Modified files

| Path | Change | Risk | Implements |
| --- | --- | --- | --- |
| None | No existing file should change. | low | FR-002, NFR-003 |

### Read for context only

| Path | Why |
| --- | --- |
| `src/index.js` | Preserve existing `hello()` export and ESM style. |
| `package.json` | Confirm `npm test` remains unchanged and no dependencies are added. |
| `tasks/prd-canary-001/prd.md` | Source of FR/NFR and acceptance criteria. |

---

## Components

### Canary marker module

**Location:** `src/canary-marker.js`
**Implements:** FR-001, NFR-001, NFR-002

**Public interface:**

```js
export function canaryMarker() {
  return "monozukuri-v2-canary-ready";
}
```

**Behavior:**

1. Exposes `canaryMarker` as a named export.
2. Returns exactly `monozukuri-v2-canary-ready`.
3. Performs constant work with no reads from files, network, environment, process state, parameters, or module-level mutable state.

**Errors:**

| Condition | Handling |
| --- | --- |
| Marker string is changed | Direct Node verification exits non-zero. |
| Named export is missing | Dynamic import verification rejects or `m.canaryMarker` is not callable. |

### Fixture preservation

**Location:** `src/index.js`, `package.json`
**Implements:** FR-002, NFR-003

**Public interface:**

```js
// unchanged
export function hello(name = "world") {
  return `Hello, ${name}!`;
}
```

**Behavior:**

1. Leave `src/index.js` unchanged.
2. Leave `package.json` dependencies and scripts unchanged.
3. Confirm the existing npm test script still exits 0.

**Errors:**

| Condition | Handling |
| --- | --- |
| Existing files are modified unnecessarily | Reject by diff inspection. |
| `npm test` fails | Stop implementation until regression is fixed. |

---

## Testing

**Coverage target:** 100% of the new exported function behavior by direct command.

| Scope | Test file | Covers |
| --- | --- | --- |
| Unit command | `src/canary-marker.js` | FR-001 exact return value and named export. |
| Inspection | `src/canary-marker.js` | NFR-001 constant work and NFR-002 no I/O or runtime state access. |
| Regression command | `package.json`, `src/index.js` | FR-002 and NFR-003 fixture preservation. |

### Validation commands

```bash
npm test
git diff --check
node --check src/canary-marker.js
node --input-type=module -e "import('./src/canary-marker.js').then(m=>{if(m.canaryMarker()!=='monozukuri-v2-canary-ready')process.exit(1)})"
```

All four commands must exit 0 before the cycle gate passes.

---

## Task ordering

1. Create `src/canary-marker.js` - minimal implementation for FR-001 and NFR-001/NFR-002.
2. Inspect diff for unrelated edits - enforces FR-002 scope.
3. Run validation commands - proves npm regression and marker behavior.

```
Create marker module -> inspect diff -> run npm/node/git validations -> PR
```

---

**Handoff to Tasks phase:** every component, file, and test referenced above must appear in at least one task. Each task must touch <= 5 files and complete in <= 60 minutes of agent time.
