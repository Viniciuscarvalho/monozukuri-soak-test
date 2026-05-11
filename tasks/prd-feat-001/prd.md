# PRD: Add error logging utility

- **Feature ID:** feat-001
- **Title:** Add error logging utility
- **Priority:** none
- **Labels:** —
- **Dependencies:** none
- **Source:** orchestrator backlog (markdown)

## Problem Statement

The codebase currently has no shared logging primitive. Modules that need to
surface diagnostic information (errors, warnings, informational events) must
either call `console.*` directly or invent ad-hoc formatting. This leads to
inconsistent log output (no timestamps, no level tags, no structured context),
makes log lines harder to scan during local development, and prevents
downstream tooling from parsing logs reliably. A small, dependency-free logger
module gives every caller a single, consistent way to emit messages and lays
the groundwork for future log routing without churning every call site.

## User Story

As a developer working in this codebase, I want a single `logger` utility that
emits timestamped, level-tagged messages with optional structured context, so
that diagnostic output is consistent across modules and easy to scan or parse.

## Goals

- Provide `error(message, context?)`, `warn(message, context?)`, and
  `info(message, context?)` functions exported from `src/utils/logger.js`.
- Each call produces a single console line prefixed with an ISO-8601 timestamp
  and an uppercase level tag.
- When a `context` object is supplied, append its JSON serialization to the
  line.
- Route output to the level-appropriate console method (`console.error`,
  `console.warn`, `console.log`).
- Zero runtime dependencies; CommonJS module style matching the existing
  `src/utils/validate.js`.

## Functional Requirements

1. **FR-1 — Public API.** The module exports exactly three functions:
   `error`, `warn`, `info`. Each accepts `(message: string, context?: object)`.
2. **FR-2 — Output format.** Each function emits one line:
   `[<ISO-8601 timestamp>] [<LEVEL>] <message>` followed by a single space and
   `JSON.stringify(context)` only when `context` is provided.
3. **FR-3 — Routing.** `error` writes via `console.error`; `warn` via
   `console.warn`; `info` via `console.log`.
4. **FR-4 — Timestamp.** Timestamps are generated at call time via
   `new Date().toISOString()`.
5. **FR-5 — Context handling.** When `context` is `undefined`, no trailing
   JSON is appended. When provided, the value is serialized with
   `JSON.stringify` and joined to the base line with a single space.

## Success Criteria

- `src/utils/logger.js` exists and exports `error`, `warn`, and `info`.
- `error("boom")` writes a single line via `console.error` matching
  `^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[ERROR\] boom$`.
- `warn("careful")` writes via `console.warn` with `[WARN]` tag.
- `info("hello")` writes via `console.log` with `[INFO]` tag.
- `info("ctx", { a: 1 })` appends ` {"a":1}` to the formatted line.
- `npm test` passes, including unit tests in `src/utils/logger.test.js` that
  cover each level and both with-context and without-context paths.
- The module has no runtime dependencies beyond Node built-ins.

## Out of Scope

- Log levels beyond `error` / `warn` / `info` (no `debug`, `trace`, `fatal`).
- Log level filtering, environment-based silencing, or runtime configuration.
- File or network transports; output is console-only.
- Log rotation, buffering, or asynchronous flushing.
- Structured-logging integrations (Pino, Winston, OpenTelemetry, etc.).
- Internationalization or message templating.
- Redaction of sensitive fields in the `context` object.
