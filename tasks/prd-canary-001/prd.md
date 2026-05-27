# PRD — canary-001: Add release canary marker

> **Token budget for this document: 600 words max.** Be specific, not narrative. Every sentence must drive a code decision. No introductions, no conclusions, no rationale paragraphs.

**Feature:** canary-001
**Source:** markdown
**Date:** 2026-05-27
**Status:** draft

---

## Context

**Stack:** nodejs · JavaScript · none · npm
**Test framework:** npm script
**Entry points relevant to this feature:** src/canary-marker.js, npm test

### Project conventions to follow

- Keep the feature change small and deterministic.
- Use existing npm project structure and avoid new runtime dependencies.
- Verify with commands or file inspection only.

### Original request

> **Description:** Add `src/canary-marker.js` exporting a `canaryMarker()` function that returns the exact string `monozukuri-v2-canary-ready`. Keep the change small and deterministic.
> **Complexity:** S

---

## Problem

The canary fixture lacks a stable release marker module. Downstream release checks need one deterministic export to prove the loop can add a small source file without unrelated behavior changes.

---

## Solution

Add a dedicated JavaScript module that exports `canaryMarker()`. The function returns only the required marker string and does not depend on runtime state.

---

## Success criteria

| Criterion       | How verified       |
| --------------- | ------------------ |
| `src/canary-marker.js` exists and exports `canaryMarker` | Inspect `src/canary-marker.js` |
| `canaryMarker()` returns `monozukuri-v2-canary-ready` exactly | Run `node --input-type=module -e "import('./src/canary-marker.js').then(m=>{if(m.canaryMarker()!=='monozukuri-v2-canary-ready')process.exit(1)})"` |

---

## Functional requirements

### FR-001: Export release canary marker [MUST]

**Behavior:** `src/canary-marker.js` exports a named `canaryMarker()` function that returns `monozukuri-v2-canary-ready`.

**Acceptance criteria:**

1. Given the module is imported, when `canaryMarker()` is called, then it returns `monozukuri-v2-canary-ready`.
2. Given the source file is inspected, when exports are reviewed, then `canaryMarker` is available as a named export.

**Negative cases:**

1. Given the returned value is changed, when the verification command runs, then the command exits non-zero.

### FR-002: Preserve existing fixture behavior [SHOULD]

**Behavior:** The change does not modify existing source exports, package metadata, or workflow configuration.

**Acceptance criteria:**

1. Given `src/index.js` exists, when the feature is implemented, then its exported `hello()` function remains unchanged.
2. Given `package.json` exists, when the feature is implemented, then no new dependency entry is added.

**Negative cases:**

1. Given unrelated files are modified, when the diff is inspected, then the change is rejected as out of scope.

---

## Non-functional requirements

| ID      | Type          | Requirement         | Validation                      |
| ------- | ------------- | ------------------- | ------------------------------- |
| NFR-001 | Performance   | `canaryMarker()` performs constant work and no I/O | `node --input-type=module -e "import('./src/canary-marker.js').then(m=>m.canaryMarker())"` |
| NFR-002 | Security      | The module reads no environment variables, files, network, or process state | Inspect `src/canary-marker.js` |
| NFR-003 | Compatibility | Existing npm test script continues to pass | Tests pass against existing API |

---

## Hard constraints

- Do not add runtime or dev dependencies.
- Do not change existing files unless required for verification.

---

## Out of scope

- Adding canary metadata for `canary-002`.
- Reworking test, CI, package, or Monozukuri configuration.

---

**Handoff to TechSpec:** every FR ID and NFR ID above must be addressed by a component, file, or test in the TechSpec.
