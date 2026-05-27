# PRD — canary-002: Add release canary metadata

> **Token budget for this document: 600 words max.** Be specific, not narrative. Every sentence must drive a code decision. No introductions, no conclusions, no rationale paragraphs.

**Feature:** canary-002
**Source:** markdown
**Date:** 2026-05-27
**Status:** draft

---

## Context

**Stack:** nodejs · JavaScript · none · npm
**Test framework:** npm test
**Entry points relevant to this feature:** src/canary-metadata.js

### Project conventions to follow

- Use small deterministic ES module exports that match the existing `src/index.js` style.
- Keep the feature isolated to the requested canary metadata surface.
- Do not add dependencies or change package scripts for this S-sized feature.

### Original request

> **Description:** Add `src/canary-metadata.js` exporting a `canaryMetadata()` function that returns an object with `project: "monozukuri-soak-test"` and `purpose: "v2-live-canary"`. Keep the change small and deterministic.
> **Complexity:** S

---

## Problem

The project has no release canary metadata module. Downstream checks need a deterministic exported function that identifies this soak-test project and the v2 live-canary purpose.

---

## Solution

Add a focused metadata module that exports `canaryMetadata()`. The function returns a stable object containing the exact requested `project` and `purpose` string fields.

---

## Success criteria

| Criterion       | How verified       |
| --------------- | ------------------ |
| `src/canary-metadata.js` exists and exports `canaryMetadata` | Inspect the file or import it from Node |
| `canaryMetadata()` returns the exact requested object values | Run `npm test` or a direct Node import check |

_Each criterion must be verifiable by running a command or inspecting a file. No subjective metrics._

---

## Functional requirements

### FR-001: Export canary metadata [MUST]

**Behavior:** `src/canary-metadata.js` exports a named `canaryMetadata()` function.

**Acceptance criteria:**

1. Given the module is imported, when `canaryMetadata` is referenced, then it is available as a function.
2. Given `canaryMetadata()` is called, when it returns, then the result equals `{ project: "monozukuri-soak-test", purpose: "v2-live-canary" }`.

**Negative cases:**

1. Given the function is called, when evaluating the returned object, then it must not include extra fields or environment-dependent values.

### FR-002: Preserve existing project behavior [SHOULD]

**Behavior:** The change does not modify existing source files, scripts, or runtime configuration.

**Acceptance criteria:**

1. Given the current project files, when the feature is implemented, then only the new metadata module and relevant task artifacts are changed.
2. Given the existing test command, when `npm test` runs, then it exits successfully.

**Negative cases:**

1. Given this feature is implemented, when dependencies or package scripts are inspected, then no dependency or script churn is present.

---

## Non-functional requirements

| ID      | Type          | Requirement         | Validation                      |
| ------- | ------------- | ------------------- | ------------------------------- |
| NFR-001 | Performance   | Function returns a static object without I/O or async work | `node -e "import('./src/canary-metadata.js').then(m=>console.log(m.canaryMetadata()))"` |
| NFR-002 | Security      | No secrets, filesystem reads, network calls, or environment reads | Inspect `src/canary-metadata.js` |
| NFR-003 | Compatibility | Keep existing npm test behavior unchanged | Tests pass against existing API |

_Only list NFRs that the agent will actively enforce. Skip aspirational ones._

---

## Hard constraints

- No new runtime dependencies.
- No changes to existing public exports unless required by tests.

_Things the implementation MUST NOT do. Be specific: "no new runtime dependencies" beats "minimize dependencies"._

---

## Out of scope

- Adding release automation, CI workflows, or package publishing metadata.
- Editing the existing `hello()` function or unrelated canary features.

_Things explicitly excluded from this feature. Anything else is implicitly fair game._

---

**Handoff to TechSpec:** every FR ID and NFR ID above must be addressed by a component, file, or test in the TechSpec.
