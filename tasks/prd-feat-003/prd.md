# PRD — feat-003: Add greeting customization

## Metadata

- **Feature ID:** feat-003
- **Title:** Add greeting customization
- **Priority:** None (assigned by backlog)
- **Labels:** none
- **Dependencies:** none
- **Source:** orchestrator backlog (markdown)
- **Complexity:** S
- **Target file:** `src/index.js`

## Problem Statement

The current `hello()` function in `src/index.js` produces a single fixed greeting string of the form `Hey, ${name}!`. Callers have no way to request a different tone — formal correspondence, casual chat, or themed/playful output all collapse to the same casual phrasing. This limits the function's usefulness as a demo/example utility and prevents downstream consumers from selecting an appropriate register for their context.

We need a small, backwards-compatible extension that lets callers pick a greeting style without breaking any existing call site that passes only a `name`.

## Overview

Extend `hello()` to accept a second parameter `style` with three valid values: `'formal'`, `'casual'`, and `'pirate'`. The default value is `'casual'`, which preserves the current behavior for all existing callers. Each style maps to a distinct phrasing of the greeting.

This is a self-contained source-level change with unit-test coverage. There are no new runtime dependencies, no API surface beyond the function signature, and no persistence or I/O concerns.

## Goals

1. Add a `style` parameter to `hello(name, style)` accepting `'formal' | 'casual' | 'pirate'`.
2. Default `style` to `'casual'` so existing single-argument calls return the same string they did before.
3. Cover each style with a unit test, plus a test for the default-argument path.
4. Keep the change scoped to `src/index.js` (and its sibling test file) — no new dependencies, no refactor of unrelated code.

## Non-Goals

- Internationalization or localization of greeting strings.
- Runtime validation that throws on unknown style strings (we fall back to the default instead — see Open Questions if this should change).
- Adding more styles beyond the three listed (formal/casual/pirate).
- Exposing the style map as a public export, plugin point, or configuration surface.
- Changing the build, packaging, or distribution of this module.

## User Stories

- **As a consumer of `hello()`**, I can call `hello("Ada")` and get the same casual greeting I got before this change, so my existing code continues to work.
- **As a consumer of `hello()`**, I can call `hello("Ada", "formal")` to get a polite/formal greeting suitable for business contexts.
- **As a consumer of `hello()`**, I can call `hello("Ada", "pirate")` to get a themed greeting for playful contexts (demos, easter eggs, examples).
- **As a maintainer**, I can run `npm test` and see all greeting-style behaviors verified, so I can refactor with confidence.

## Functional Requirements

1. `hello(name, style)` MUST accept a second positional parameter `style` of type string.
2. When `style === 'casual'` (or is omitted), the function MUST return `` `Hey, ${name}!` ``.
3. When `style === 'formal'`, the function MUST return `` `Good day, ${name}.` ``.
4. When `style === 'pirate'`, the function MUST return `` `Ahoy, ${name}! Arr!` ``.
5. When `style` is an unrecognized string (e.g. `'shouty'`, `''`, `undefined`), the function MUST fall back to the casual greeting rather than throwing.
6. The function MUST continue to default `name` to `'world'` when no name is provided.
7. The function MUST remain a named ESM export (`export function hello`).

## Acceptance Criteria

- [ ] `hello("Ada")` returns `"Hey, Ada!"` (default style preserved).
- [ ] `hello("Ada", "casual")` returns `"Hey, Ada!"`.
- [ ] `hello("Ada", "formal")` returns `"Good day, Ada."`.
- [ ] `hello("Ada", "pirate")` returns `"Ahoy, Ada! Arr!"`.
- [ ] `hello("Ada", "unknown-style")` returns `"Hey, Ada!"` (graceful fallback, no throw).
- [ ] `hello()` with no args returns `"Hey, world!"`.
- [ ] `npm test` exits 0 with all unit tests passing.
- [ ] No new entries appear in `package.json` `dependencies` (test runner uses `node:test`).

## Out of Scope

- Validation of `name` (length, type, sanitization).
- Async or streaming variants of the greeting.
- A CLI wrapper for the function.
- Snapshot or property-based testing.
- Logging or telemetry.

## Risks and Mitigations

| Risk                                                       | Likelihood | Impact | Mitigation                                                                  |
| ---------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------- |
| Existing callers passing extra args break                  | Low        | Low    | New param is positional and last; old single-arg calls keep working.        |
| Unknown-style strings cause surprise output                | Low        | Low    | Documented fallback to casual; covered by an explicit test.                 |
| Future style additions cause churn in the dispatch logic   | Low        | Low    | Internal `STYLES` map is a literal — adding a key is one line plus a test.  |
| Test runner choice (`node:test`) unavailable on older Node | Low        | Medium | Project already targets modern Node (ESM in source); pin engines if needed. |

## Open Questions

1. Should an unknown style throw instead of falling back? Current decision: **fall back to casual** (lower friction, matches forgiving JS idioms). Revisit if a consumer reports the silent fallback masking a bug.
2. Should `style` be case-insensitive (`'FORMAL'` → formal)? Current decision: **case-sensitive** for simplicity; revisit if real callers ask.

## Success Metrics

- All acceptance-criteria assertions pass in CI on the feature branch.
- Zero changes required to existing call sites elsewhere in the repo (backwards compatibility preserved).
- Feature ships in a single PR with a passing `npm test`.
