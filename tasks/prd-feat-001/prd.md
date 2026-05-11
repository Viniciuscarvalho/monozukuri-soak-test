# PRD — feat-001: Add error logging utility

**Feature ID:** feat-001
**Title:** Add error logging utility
**Priority:** none
**Complexity:** S
**Labels:** _none_
**Dependencies:** none
**Date:** 2026-05-11
**Status:** ready
**Platform:** Node.js (npm)

---

## Problem Statement

The repository currently has no shared, structured way to emit log messages. The only source file (`src/index.js`) does not produce diagnostic output, and downstream code that needs to surface errors, warnings, or informational messages would otherwise reach directly for `console.*` calls. That ad-hoc approach leads to:

- Inconsistent message formatting across modules (no timestamp, no severity tag).
- No single seam to evolve later (e.g. switch to a structured logger, redact fields, ship to a transport).
- Difficulty correlating events during local development and tests because messages lack a sortable timestamp.

We need a tiny, dependency-free utility that standardises log output at three severity levels and gives the codebase one place to call into when emitting diagnostic information.

## Overview

Introduce `src/utils/logger.js` exposing three named functions — `error(message, context?)`, `warn(message, context?)`, and `info(message, context?)` — that each print an ISO 8601 timestamp, a severity tag, the message, and (when provided) an optional context object to the corresponding `console` method. The module is a stateless ESM utility with no side effects on import and no new runtime dependencies.

## Goals

- **G1.** Provide three named exports — `error`, `warn`, `info` — from `src/utils/logger.js`.
- **G2.** Every emitted line begins with an ISO 8601 UTC timestamp and an uppercase severity tag (e.g. `[2026-05-11T13:53:04.000Z] [ERROR] ...`).
- **G3.** Each function accepts a required `message: string` and an optional `context: object` and forwards the context to the underlying `console` call when it has own keys.
- **G4.** Zero new runtime or dev dependencies; use the built-in `node:test` runner for unit tests.
- **G5.** Test suite is wired into `npm test` and exits 0 on a clean checkout.

## Non-Goals

- No log levels beyond `error`, `warn`, `info` (no `debug`, `trace`, `fatal`).
- No log filtering, level configuration, or environment-based gating.
- No transport other than `console` (no files, network, syslog, OpenTelemetry).
- No structured JSON output mode — plain console formatting only.
- No log redaction, sampling, or rate limiting.
- No singleton/class-based logger or factory; the module exports plain functions only.

## User Stories

- **US-1.** As a developer working in this repo, I can `import { error, warn, info } from "./utils/logger.js"` and emit a timestamped message so that I do not have to hand-roll formatting at each call site.
- **US-2.** As a developer debugging an issue, I can pass a context object as the second argument (e.g. `error("DB query failed", { queryId, ms })`) and see it printed alongside the message so I can correlate the event.
- **US-3.** As a maintainer, I can run `npm test` and get a green result that exercises all three log functions, so I trust the utility before adopting it elsewhere.

## Functional Requirements

- **FR-001.** `src/utils/logger.js` MUST export three named functions: `error`, `warn`, `info`.
- **FR-002.** Each function MUST accept `(message: string, context?: object)` where `context` defaults to `{}`.
- **FR-003.** Each function MUST compute `timestamp = new Date().toISOString()` at call time.
- **FR-004.** Each function MUST build a prefix in the shape `[${timestamp}] [${LEVEL}]` where `LEVEL` is the uppercase severity (`ERROR`, `WARN`, `INFO`).
- **FR-005.** When `context` has at least one own enumerable key, the function MUST call the matching `console` method with `(prefix, message, context)`; otherwise it MUST call it with `(prefix, message)`.
- **FR-006.** `error` MUST route through `console.error`, `warn` through `console.warn`, and `info` through `console.log` (matching native severity routing).
- **FR-007.** A `null` context passed explicitly MUST be treated as empty (no `context` argument forwarded to `console`).
- **FR-008.** The module MUST have no side effects at import time (no top-level `console` calls, no I/O, no global mutation).
- **FR-009.** `package.json`'s `test` script MUST execute the new test suite via `node --test` so `npm test` runs the logger tests.

## Non-Functional Requirements

- **NFR-1. Dependencies:** No new runtime or dev dependencies. Use only Node.js built-ins.
- **NFR-2. Node compatibility:** Works on Node.js ≥ 18 (which ships `node:test` and stable `--test`).
- **NFR-3. Style:** ESM (`export function`) matching `src/index.js`; file names `kebab-case.js`; function names `camelCase`; no classes.
- **NFR-4. Performance:** Each call adds only a `Date#toISOString` and a string concat; no measurable overhead relative to raw `console.*`.
- **NFR-5. Security:** The module does not redact input. Callers are responsible for not logging secrets; this is documented but not enforced.
- **NFR-6. Test coverage:** 100% line and branch coverage for `src/utils/logger.js` (3 pure functions, trivially covered).

## Acceptance Criteria

- **AC-1.** `import { error, warn, info } from "./src/utils/logger.js"` resolves and exposes three functions.
- **AC-2.** `info("hello")` prints a single line to stdout matching `/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z\] \[INFO\] hello$/`.
- **AC-3.** `warn("careful", { code: 1 })` prints the prefix + message + the `{ code: 1 }` object to stderr via `console.warn`.
- **AC-4.** `error("boom")` prints to stderr via `console.error` and is tagged `[ERROR]`.
- **AC-5.** `info("x", null)` does NOT forward a context argument to `console.log` (i.e. behaves like `info("x")`).
- **AC-6.** `info("x", {})` does NOT forward the empty object — only the prefix and message are passed.
- **AC-7.** Importing the module produces no console output.
- **AC-8.** `npm test` exits with status 0 and reports passing tests for all three functions across the message-only, message+context, and null/empty-context cases.

## Scope

### In scope

- `src/utils/logger.js` (new) — implementation.
- `src/utils/logger.test.js` (new) — `node:test` suite.
- `package.json` (modified) — wire `test` script to `node --test src/**/*.test.js`.

### Out of scope

- Modifying `src/index.js` or any other existing source to adopt the logger.
- Adding lint, type-check, or coverage tooling.
- Publishing or packaging concerns.

## Risks and Mitigations

| Risk                                                                          | Likelihood | Impact | Mitigation                                                                                                       |
| ----------------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| Tests rely on capturing `console` output and are flaky under parallel runners | Low        | Low    | Use `node:test` with explicit `console` method spies/replacements scoped to each test, restored in `afterEach`.  |
| `node --test` glob behavior differs across Node minor versions                | Low        | Low    | Pin script to `node --test src/**/*.test.js`; document Node ≥ 18 requirement in NFR-2.                           |
| Callers log secrets via the `context` object                                  | Medium     | Medium | Document in NFR-5 that redaction is out of scope; revisit if usage grows.                                        |
| Future need for structured/JSON logs forces a rewrite                         | Medium     | Low    | Keep the public surface to three functions so an internal swap to a different formatter stays source-compatible. |

## Open Questions

- None at this time. The feature is scoped tightly enough that all decisions are captured in the TechSpec.

## Success Metrics

- `npm test` is green on the PR branch and on `main` after merge.
- The three exported functions are importable and produce output matching the regex in AC-2 / AC-3 / AC-4.
- No new entries in `package.json` `dependencies` or `devDependencies`.

## References

- Feature seed: `tasks/prd-feat-001/prd-seed.md`
- Feature context: `.monozukuri-context.md`
- Platform context: `.monozukuri/platform-context.json`
- Existing pattern source: `src/index.js`
- Downstream artifact: `tasks/prd-feat-001/tech-spec.md`
