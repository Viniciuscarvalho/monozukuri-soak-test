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
**Entry points relevant to this feature:** src/index.js, src/canary-metadata.js

### Project conventions to follow

- Keep phase artifacts compatible with `lib/schema/validate.sh` required headings.
- In full_auto mode, make deterministic choices and avoid clarifying questions.
- Prefer narrow scope: add only the requested file and preserve existing behavior.
- Do not add dependencies for small deterministic metadata helpers.

### Original request

> **Description:** Add `src/canary-metadata.js` exporting a `canaryMetadata()` function that returns an object with `project: "monozukuri-soak-test"` and `purpose: "v2-live-canary"`. Keep the change small and deterministic.
> **Complexity:** S

---

## Problem

The project has no dedicated module exposing release canary metadata. Downstream canary checks need a stable exported function that returns the expected project and purpose values without relying on mutable process state.
_(2–3 sentences. What is broken or missing today that this feature fixes.)_

---

## Solution

Add a small JavaScript module at `src/canary-metadata.js`. Export `canaryMetadata()` so callers can import it and receive the required metadata object with deterministic values.
_(2–3 sentences. What we're building. No implementation details — those go in TechSpec.)_

---

## Success criteria

| Criterion       | How verified       |
| --------------- | ------------------ |
| `src/canary-metadata.js` exists and exports `canaryMetadata` | Inspect `src/canary-metadata.js` |
| `canaryMetadata()` returns the exact project and purpose fields | Run `npm test` or import the module in a Node check |

_Each criterion must be verifiable by running a command or inspecting a file. No subjective metrics._

---

## Functional requirements

### FR-001: Export canary metadata function [MUST]

**Behavior:** `src/canary-metadata.js` must export a named `canaryMetadata()` function that returns `{ project: "monozukuri-soak-test", purpose: "v2-live-canary" }`.

**Acceptance criteria:**

1. Given the module is imported, when `canaryMetadata()` is called, then it returns an object with `project` set to `"monozukuri-soak-test"`.
2. Given the module is imported, when `canaryMetadata()` is called, then it returns an object with `purpose` set to `"v2-live-canary"`.

**Negative cases:**

1. Given the module is inspected, when exports are checked, then there is no default export replacing the named `canaryMetadata` export.

### FR-002: Preserve existing project behavior [SHOULD]

**Behavior:** The metadata module must not change `src/index.js`, package scripts, or existing runtime output.

**Acceptance criteria:**

1. Given the existing package, when `npm test` runs, then it exits successfully.
2. Given `src/index.js` is inspected, when this feature is complete, then the existing `hello` export remains unchanged.

**Negative cases:**

1. Given the implementation is reviewed, when package metadata is inspected, then no new runtime dependency was added for this feature.

---

## Non-functional requirements

| ID      | Type          | Requirement         | Validation                      |
| ------- | ------------- | ------------------- | ------------------------------- |
| NFR-001 | Performance   | The helper must be constant time and perform no I/O | `npm test`              |
| NFR-002 | Security      | The helper must not read environment variables, files, or network resources | Inspect `src/canary-metadata.js`          |
| NFR-003 | Compatibility | Keep existing npm package behavior and exports intact | Tests pass against existing API |

_Only list NFRs that the agent will actively enforce. Skip aspirational ones._

---

## Hard constraints

- No new runtime dependencies.
- Do not change existing `src/index.js` behavior.

_Things the implementation MUST NOT do. Be specific: "no new runtime dependencies" beats "minimize dependencies"._

---

## Out of scope

- Publishing or wiring canary metadata into release automation.
- Adding broader application metadata beyond the requested project and purpose fields.

_Things explicitly excluded from this feature. Anything else is implicitly fair game._

---

**Handoff to TechSpec:** every FR ID and NFR ID above must be addressed by a component, file, or test in the TechSpec.
