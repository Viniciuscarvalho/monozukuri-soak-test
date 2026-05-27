# TechSpec — canary-002: Add release canary metadata

> **Token budget for this document: 1200 words max.** Code over prose. Tables over paragraphs. Show interfaces, not explanations of interfaces.

**Feature:** canary-002
**Inherits from:** `./prd.md`
**Date:** 2026-05-27
**Status:** draft

---

## Approach

Add one ES module beside the existing `src/index.js`, matching the current named-export style. Keep the implementation as a pure synchronous function returning a literal object, with no reads from environment, filesystem, package metadata, or network. Do not re-export it from `src/index.js`, because the PRD says no public export changes unless required by tests. Verify through the existing `npm test` script and a direct Node import check.

### Key decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Module surface | New named export in `src/canary-metadata.js` only | Satisfies FR-001 while preserving existing exports for FR-002 |
| Metadata source | Hard-coded literal return object | Enforces deterministic output and NFR-001/NFR-002 |

---

## Existing codebase patterns this feature MUST follow

```javascript
export function hello(name = "world") {
  return `Hello, ${name}!`;
}
```

```javascript
// No logging pattern exists in current source; keep this module silent.
```

```bash
npm test
node -e "import('./src/canary-metadata.js').then(m=>console.log(m.canaryMetadata()))"
```

**Naming:** files `kebab-case.js` · functions `camelCase` · types `PascalCase` if added

**Project conventions** (from learning store):

- Small deterministic ES module exports.
- No dependency or package-script churn for S-sized canary features.

---

## File change map

> **File budget: ≤ 20 files touched.** If this feature requires more, it's two features — split it before proceeding.

files_likely_touched:
- src/canary-metadata.js

### New files

| Path | Purpose | Implements |
| --- | --- | --- |
| `src/canary-metadata.js` | Export deterministic release canary metadata | FR-001, NFR-001, NFR-002 |

### Modified files

| Path | Change | Risk | Implements |
| --- | --- | --- | --- |
| None | No existing source, package, script, or config changes | low | FR-002, NFR-003 |

### Read for context only

| Path | Why |
| --- | --- |
| `src/index.js` | Match ES module export style |
| `package.json` | Confirm existing `npm test` and no dependency changes |

---

## Components

### Canary Metadata Module

**Location:** `src/canary-metadata.js`
**Implements:** FR-001, NFR-001, NFR-002

**Public interface:**

```javascript
export function canaryMetadata() {
  return {
    project: "monozukuri-soak-test",
    purpose: "v2-live-canary",
  };
}
```

**Behavior:**

1. Importing `src/canary-metadata.js` exposes named function `canaryMetadata`.
2. Calling `canaryMetadata()` returns exactly two fields: `project` and `purpose`.
3. Each call returns static values with no I/O, async work, configuration, or environment dependency.

**Errors:**
| Condition | Handling |
|---|---|
| Missing named export | Direct import check fails before code phase completes |
| Extra fields or dynamic values | Direct equality check fails before code phase completes |

---

## Data model

```javascript
/**
 * @returns {object} exact project and purpose release canary metadata
 */
```

**Migrations required:** No
**Migration:** None; no persisted data is touched.

---

## Testing

**Coverage target:** 100% of the new function behavior by direct command validation.

| Scope | Test file | Covers |
| --- | --- | --- |
| Unit | `src/canary-metadata.js` via direct Node import | Named export, exact object values, no extra fields |
| Regression | existing `npm test` script | Existing project behavior remains compatible |

### Validation commands

```bash
npm test
node -e "import('./src/canary-metadata.js').then(m=>{const got=m.canaryMetadata(); const exp={project:'monozukuri-soak-test',purpose:'v2-live-canary'}; if(JSON.stringify(got)!==JSON.stringify(exp)) process.exit(1);})"
npm pkg get scripts >/dev/null
node -e "import('./src/index.js').then(m=>{if(m.hello('world')!=='Hello, world!') process.exit(1);})"
```

_All four commands must exit 0 before the cycle gate passes._

---

## Task ordering

_Hint for the Tasks phase — not binding, but the agent should justify any deviation._

1. Create `src/canary-metadata.js` — unlocks FR-001 and all metadata NFRs.
2. Run direct Node import validation — confirms exact return shape and named export.
3. Run `npm test` and existing import smoke check — confirms FR-002 and NFR-003.

```
Create module -> Direct import check
                 ↓
          npm test + existing import smoke
                 ↓
          PR artifact summary
```

---

**Handoff to Tasks phase:** every component, file, and test referenced above must appear in at least one task. Each task must touch ≤ 5 files and complete in ≤ 60 minutes of agent time.
