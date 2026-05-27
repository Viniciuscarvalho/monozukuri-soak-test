# PRD — canary-001: Add release canary marker

> **Token budget for this document: 600 words max.** Be specific, not narrative. Every sentence must drive a code decision. No introductions, no conclusions, no rationale paragraphs.

**Feature:** canary-001
**Source:** orchestrator backlog (markdown)
**Date:** 2026-05-27
**Status:** draft

---

## Context

**Stack:** nodejs · JavaScript · ES modules · npm
**Test framework:** npm test
**Entry points relevant to this feature:** src/canary-marker.js; package.json

### Project conventions to follow

- Use named ES module exports consistent with src/index.js.
- Keep the feature isolated to the requested marker module unless tests require package script changes.

### Original request

> Add `src/canary-marker.js` exporting a `canaryMarker()` function that returns the exact string `monozukuri-v2-canary-ready`. Keep the change small and deterministic.

---

## Problem

The project has no release canary marker export that downstream validation can call. The canary loop needs a deterministic function with a fixed return value to prove the implementation and test phases can move a small feature through the workflow.
_(2–3 sentences. What is broken or missing today that this feature fixes.)_

---

## Solution

Add a dedicated marker module that exports `canaryMarker()`. The function returns the exact requested string every time and does not depend on runtime state.
_(2–3 sentences. What we're building. No implementation details — those go in TechSpec.)_

---

## Success criteria

| Criterion       | How verified       |
| --------------- | ------------------ |
| `src/canary-marker.js` exists and exports `canaryMarker` | Inspect `src/canary-marker.js` |
| `canaryMarker()` returns `monozukuri-v2-canary-ready` | Run `npm test` or a Node import assertion |

_Each criterion must be verifiable by running a command or inspecting a file. No subjective metrics._

---

## Functional requirements

### FR-001: Export canary marker function [MUST]

**Behavior:** `src/canary-marker.js` exports a named `canaryMarker()` function that returns `monozukuri-v2-canary-ready`.

**Acceptance criteria:**

1. Given the module is imported, when `canaryMarker` is read, then it is a function export.
2. Given `canaryMarker()` is called, when it returns, then the value is exactly `monozukuri-v2-canary-ready`.

**Negative cases:**

1. Given the marker string is changed, when verification calls `canaryMarker()`, then the test or assertion fails.

### FR-002: Preserve existing behavior [SHOULD]

**Behavior:** The marker addition does not change `src/index.js` behavior or existing package metadata.

**Acceptance criteria:**

1. Given existing imports from `src/index.js`, when the marker module is added, then the existing `hello()` export remains unchanged.
2. Given package scripts are run, when `npm test` executes, then it exits successfully.

**Negative cases:**

1. Given unrelated files are modified, when the diff is reviewed, then the change is rejected for exceeding canary scope.

---

## Non-functional requirements

| ID      | Type          | Requirement         | Validation                      |
| ------- | ------------- | ------------------- | ------------------------------- |
| NFR-001 | Performance   | Marker lookup is constant-time and performs no I/O | `node -e "import('./src/canary-marker.js').then(m=>console.log(m.canaryMarker()))"` |
| NFR-002 | Security      | No environment variables, secrets, network calls, or filesystem reads are introduced | Inspect `src/canary-marker.js` |
| NFR-003 | Compatibility | Existing `src/index.js` API remains unchanged | Tests pass against existing API |

_Only list NFRs that the agent will actively enforce. Skip aspirational ones._

---

## Hard constraints

- No new runtime dependencies.
- Do not change the requested return string, spelling, or casing.

_Things the implementation MUST NOT do. Be specific: "no new runtime dependencies" beats "minimize dependencies"._

---

## Out of scope

- Adding release metadata beyond the marker string.
- Refactoring existing exports or package configuration.

_Things explicitly excluded from this feature. Anything else is implicitly fair game._

---

**Handoff to TechSpec:** every FR ID and NFR ID above must be addressed by a component, file, or test in the TechSpec.
