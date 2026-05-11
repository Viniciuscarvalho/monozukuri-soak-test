# PRD: Add error logging utility (feat-001)

## Metadata

- **Feature ID:** feat-001
- **Title:** Add error logging utility
- **Priority:** none (from backlog)
- **Labels:** (none)
- **Dependencies:** none
- **Complexity:** S
- **Source:** orchestrator backlog (markdown)

## Problem Statement

The Node.js codebase has no shared logging primitive. Callers that need to report
errors, warnings, or informational events must reach for `console.*` directly,
which leaves output without a consistent timestamp, severity label, or
structured-context format. As more modules are added (validation helpers, the
`hello()` entry point, future utilities) this inconsistency makes it harder to
scan output, grep for severity levels, or attach structured context such as a
user id or request payload to a log line.

We need a small, dependency-free logging utility that all modules in `src/` can
import, so every log line is uniformly formatted and routed to the correct
console stream for its severity.

## Goals

- Provide a single module at `src/utils/logger.js` exporting `error()`,
  `warn()`, and `info()` functions.
- Each function accepts `(message, context?)` where `message` is a string and
  `context` is an optional object.
- Every emitted line is prefixed with an ISO-8601 timestamp and an uppercase
  severity tag (`[ERROR]`, `[WARN]`, `[INFO]`).
- `error()` writes to `console.error`, `warn()` writes to `console.warn`,
  `info()` writes to `console.log`, so callers' redirections (stderr vs stdout)
  behave as expected.
- When `context` is provided it is appended to the line as compact JSON; when
  omitted the line ends with the message and the literal string `undefined`
  never appears in output.

## Non-Goals

- No log transports beyond the Node `console` (no files, no network, no
  syslog).
- No log-level filtering, environment-based verbosity switches, or runtime
  configuration.
- No structured (JSON-only) output mode; the human-readable line is the only
  format.
- No log rotation, sampling, redaction, or PII handling.
- No third-party logging library (winston, pino, bunyan) is introduced.
- No `debug` / `trace` / `fatal` levels — only the three listed above.

## User Stories

- As a developer adding a new feature, I can `require('./utils/logger')` and
  call `info('feature loaded', { name })` so the event appears in stdout with a
  timestamp and the context object serialized inline.
- As a developer debugging a failure, I can call `error('db connect failed',
{ code: err.code })` and see the line on stderr with `[ERROR]` so I can grep
  it out of mixed output.
- As an operator tailing logs, I can scan timestamps to correlate events and
  rely on stable severity tags for filtering.

## Functional Requirements

1. The module lives at `src/utils/logger.js` and is consumable via CommonJS
   (`require('./utils/logger')` from `src/` siblings).
2. The module exports exactly three functions: `error`, `warn`, `info`.
3. Each function signature is `(message: string, context?: object) => void`.
4. Each call produces exactly one console invocation.
5. Output format when `context` is omitted:
   `[<ISO timestamp>] [<LEVEL>] <message>`
6. Output format when `context` is provided:
   `[<ISO timestamp>] [<LEVEL>] <message> <JSON.stringify(context)>`
7. Timestamps use `new Date().toISOString()` (UTC, millisecond precision).
8. Level tags are the literal strings `ERROR`, `WARN`, `INFO`.
9. Routing: `error → console.error`, `warn → console.warn`, `info →
console.log`.
10. When `context` is omitted, the substring `undefined` must not appear in the
    output line.

## Acceptance Criteria

- `info('hello')` produces a single `console.log` call matching
  `/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] hello$/`.
- `warn('something off')` produces a single `console.warn` call ending in
  `[WARN] something off`.
- `error('broke')` produces a single `console.error` call ending in
  `[ERROR] broke`.
- `info('loaded', { userId: 42 })` produces a single line containing
  `[INFO] loaded {"userId":42}`.
- `error('plain error')` (no context) produces a line that does not contain
  the substring `undefined`.
- All five behaviours are covered by tests in `src/utils/logger.test.js` using
  the built-in `node:test` runner; `npm test` exits 0.

## Out of Scope

- Wiring the logger into existing modules (`src/index.js`,
  `src/utils/validate.js`). That is a follow-up if/when those modules need
  logging; this feature only delivers the utility.
- Configuration files, env vars, or runtime toggles.
- TypeScript types or `.d.ts` declarations.

## Risks and Mitigations

- **Risk:** Tests intercept `console.*` by reassigning the method; if a future
  test forgets to restore the original, later tests see corrupted output.
  **Mitigation:** the existing test helper `captureConsole` restores the
  original method synchronously after the callback returns.
- **Risk:** `JSON.stringify` throws on circular context objects.
  **Mitigation:** callers are responsible for passing serializable context;
  documented implicitly via the typed signature and not handled in v1 (matches
  Non-Goals).
- **Risk:** Severity routing surprises callers expecting all output on stdout.
  **Mitigation:** routing is documented in Functional Requirements and matches
  Node convention (`console.error`/`console.warn` → stderr).

## Dependencies

- Runtime: Node.js (already the project's primary stack per CLAUDE.md). No new
  npm dependencies.
- Test: `node:test` and `node:assert/strict` (built-in). The `npm test` script
  already globs `src/**/*.test.js`.

## Open Questions

- None at this time. The seed spec is unambiguous and the implementation has
  no remaining design decisions.
