# TechSpec - canary-002: Add release canary metadata

> **Token budget for this document: 1200 words max.** Code over prose. Tables over paragraphs. Show interfaces, not explanations of interfaces.

**Feature:** canary-002
**Inherits from:** `./prd.md`
**Date:** 2026-05-27
**Status:** draft

---

## Approach

Add a single ESM-style source module beside the existing `src/index.js` export. Keep `canaryMetadata()` pure: no parameters, no I/O, no environment access, and one object literal containing the exact `project` and `purpose` values. Do not modify `package.json`, `src/index.js`, workflow files, or dependencies; verification is command-driven and inspection-based because this fixture has only an npm test script.

### Key decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Module shape | Named ESM export in `src/canary-metadata.js` | Matches existing `src/index.js` style and PRD acceptance criteria. |
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
node --input-type=module -e "import('./src/canary-metadata.js').then(m=>{const v=m.canaryMetadata();if(v.project!=='monozukuri-soak-test'||v.purpose!=='v2-live-canary')process.exit(1)})"
```

**Naming:** files `kebab-case.js` under `src/`, functions `camelCase`, types `none`

**Project conventions** (from learning store):

- Keep the change small, deterministic, dependency-free, and verified by commands or inspection.
- Preserve existing fixture behavior; read existing files for context but avoid unrelated edits.

---

## File change map

> **File budget: <= 20 files touched.** If this feature requires more, it's two features - split it before proceeding.

files_likely_touched:
- `src/canary-metadata.js`

### New files

| Path | Purpose | Implements |
| --- | --- | --- |
| `src/canary-metadata.js` | Export the deterministic release canary metadata function. | FR-001, NFR-001, NFR-002 |

### Modified files

| Path | Change | Risk | Implements |
| --- | --- | --- | --- |
| None | No existing file should change. | low | FR-002, NFR-003 |

### Read for context only

| Path | Why |
| --- | --- |
| `src/index.js` | Preserve existing `hello()` export and ESM style. |
| `package.json` | Confirm `npm test` remains unchanged and no dependencies are added. |
| `tasks/prd-canary-002/prd.md` | Source of FR/NFR and acceptance criteria. |

---

## Components

### Canary metadata module

**Location:** `src/canary-metadata.js`
**Implements:** FR-001, NFR-001, NFR-002

**Public interface:**

```js
export function canaryMetadata() {
  return {
    project: "monozukuri-soak-test",
    purpose: "v2-live-canary",
  };
}
```

**Behavior:**

1. Export only a named `canaryMetadata` function.
2. Return a new object with exact `project` and `purpose` string fields.
3. Perform no file, network, environment, process, or dependency access.

**Errors:**
| Condition | Handling |
|---|---|
| Export missing or renamed | Direct import verification exits non-zero. |
| Metadata value changed | Direct import verification exits non-zero. |

### Existing fixture surface

**Location:** `src/index.js`, `package.json`
**Implements:** FR-002, NFR-003

**Public interface:**

```js
export function hello(name = "world") {
  return `Hello, ${name}!`;
}
```

**Behavior:**

1. Leave `src/index.js` unchanged.
2. Leave `package.json` scripts and dependency fields unchanged.
3. Verify existing package behavior with `npm test`.

**Errors:**
| Condition | Handling |
|---|---|
| Existing source or package files changed | Reject in diff inspection. |
| Existing test script fails | Stop before cycle gate. |

---

## Testing

**Coverage target:** 100% of the new helper behavior by direct command and inspection.

| Scope | Test file | Covers |
| --- | --- | --- |
| Unit | `src/canary-metadata.js` | FR-001 exact export and returned fields. |
| Static | `src/canary-metadata.js` | NFR-001 and NFR-002 constant-time, no-I/O implementation. |
| Integration | `package.json` script | FR-002 and NFR-003 existing package behavior via `npm test`. |

### Validation commands

```bash
npm test
git diff --check
node --check src/canary-metadata.js
node --input-type=module -e "import('./src/canary-metadata.js').then(m=>{const v=m.canaryMetadata();if(v.project!=='monozukuri-soak-test'||v.purpose!=='v2-live-canary')process.exit(1)})"
```

All commands must exit 0 before the cycle gate passes.

---

## Task ordering

1. Create `src/canary-metadata.js` - completes the only write surface.
2. Inspect diff and source - confirms no unrelated file changes, dependencies, I/O, or runtime state access.
3. Run validation commands - proves package behavior and direct metadata contract.

```
create module -> inspect diff/source
              -> npm test, git diff --check, node --check, direct import check
              -> PR
```

---

**Handoff to Tasks phase:** every component, file, and test referenced above must appear in at least one task. Each task must touch <= 5 files and complete in <= 60 minutes of agent time.
