# TechSpec: Add error logging utility (feat-001)

## Metadata

- **Feature ID:** feat-001
- **Title:** Add error logging utility
- **PRD:** `tasks/prd-feat-001/prd.md`
- **Complexity:** S
- **Stack:** Node.js (CommonJS), built-in `node:test` runner
- **Status:** Implemented in `src/utils/logger.js`

## Overview

A small, dependency-free logging utility that exposes three severity functions
(`error`, `warn`, `info`) producing uniformly formatted lines with an ISO-8601
timestamp, an uppercase severity tag, the caller's message, and an optional
JSON-serialized context object. Each severity routes to the matching
`console.*` method so stdout/stderr semantics are preserved for downstream
redirection.

The utility is the project's first shared infrastructure module; subsequent
features (validation helpers, the `hello()` entry point, future utilities)
will be free to adopt it without taking on a third-party logging dependency.

## Technical Approach

### Module shape

`src/utils/logger.js` is a CommonJS module that exports exactly three named
functions:

```js
module.exports = { error, warn, info };
```

Each function has the same signature:

```
fn(message: string, context?: object) => void
```

Internally, the three exported functions are thin wrappers around a single
private `formatMessage(level, message, context)` helper that produces the
output string. The wrappers differ only in (a) the literal level tag they pass
and (b) which `console.*` method they invoke.

### Output format

`formatMessage` builds the line as:

```
[<ISO timestamp>] [<LEVEL>] <message>[ <JSON.stringify(context)>]
```

- Timestamp: `new Date().toISOString()` — UTC, millisecond precision, fixed
  width, lexicographically sortable.
- Level tag: literal `ERROR`, `WARN`, or `INFO` wrapped in square brackets.
- Context tail: appended only when `context !== undefined`. The check is on
  identity to `undefined` (not falsy), so `null`, `0`, `false`, and empty
  objects/arrays are preserved if explicitly passed (`JSON.stringify` handles
  each correctly; `null` and `0` render literally, empty object renders as
  `{}`). The check rules out the case where the caller passed no second
  argument and prevents the substring `undefined` from leaking into output.

### Severity routing

| Function                   | Level tag | Console method  | Stream |
| -------------------------- | --------- | --------------- | ------ |
| `error(message, context?)` | `ERROR`   | `console.error` | stderr |
| `warn(message, context?)`  | `WARN`    | `console.warn`  | stderr |
| `info(message, context?)`  | `INFO`    | `console.log`   | stdout |

This matches Node's default behaviour for `console.*` and lets operators
filter stderr-only output by redirection (`2>/dev/null`, `2>err.log`).

### Single-call guarantee

Each public function performs exactly one `console.*` invocation. The full
formatted line is passed as a single string argument, not as multiple
arguments — this avoids `util.format` spacing surprises and keeps test
capture trivial (`args.join(' ')` returns the same string the user sees).

### Dependencies

- Runtime: Node.js only. No `npm install` step, no new entries in
  `package.json` dependencies.
- Test: `node:test` and `node:assert/strict` (built-in, no devDependencies).

## Files Likely Touched

The following files will be created or modified by this implementation. This
list is exhaustive — no other files in the repository will be edited as part
of feat-001.

- `src/utils/logger.js` — **create**. Implements the private `formatMessage`
  helper plus the three exported functions (`error`, `warn`, `info`). This is
  the primary deliverable.
- `src/utils/logger.test.js` — **create**. Houses the five `node:test` cases
  that map 1:1 to the PRD acceptance criteria, plus the local
  `captureConsole` helper used to assert against `console.*` output.
- `package.json` — **update**. Adjust the `test` script so it globs
  `src/**/*.test.js` (in addition to any existing entries), ensuring
  `npm test` discovers and runs the new logger tests alongside the existing
  `src/index.test.js` and `src/utils/validate.test.js` suites.

Files explicitly NOT touched (deferred per PRD Out-of-Scope):

- `src/index.js` — will continue to use `console.*` directly until a future
  feature opts it in to the logger.
- `src/utils/validate.js` — same; not rewired in this PR.
- No new dependencies in `package.json` — runtime is Node built-ins only.

## File-Level Changes

| File                       | Action | Purpose                                                                                |
| -------------------------- | ------ | -------------------------------------------------------------------------------------- |
| `src/utils/logger.js`      | create | Implements `formatMessage` helper plus the three exported functions.                   |
| `src/utils/logger.test.js` | create | Five `node:test` cases covering the acceptance criteria from the PRD.                  |
| `package.json`             | update | Ensure the `test` script globs `src/**/*.test.js` so logger tests run with `npm test`. |

## Test Strategy

Tests live in `src/utils/logger.test.js` and use the built-in `node:test`
runner. A local helper `captureConsole(method, fn)` swaps the named
`console[method]` for a recording function, runs the callback, and restores
the original synchronously — preventing cross-test contamination if a test
throws (the restore happens on the synchronous path after `fn()` returns; the
acceptance criteria do not require async behaviour).

The five test cases map 1:1 to the PRD acceptance criteria:

1. `info('hello')` — line matches
   `/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] hello$/`.
2. `warn('something off')` — line ends with `[WARN] something off`, captured
   on `console.warn`.
3. `error('broke')` — line ends with `[ERROR] broke`, captured on
   `console.error`.
4. `info('loaded', { userId: 42 })` — line contains
   `[INFO] loaded {"userId":42}`.
5. `error('plain error')` — line does **not** contain the substring
   `undefined`.

Each test asserts `calls.length === 1` to enforce the single-call guarantee.

`npm test` runs `node --test src/*.test.js src/**/*.test.js`, which picks up
the logger tests alongside existing `index.test.js` and `validate.test.js`
suites.

## Edge Cases and Failure Modes

- **`context === null`:** appended as the literal `null` (PRD-conformant: the
  forbidden substring is `undefined`, not `null`).
- **Falsy but defined `context`** (`0`, `false`, `""`): appended via
  `JSON.stringify`, which yields `0`, `false`, `""` respectively. Accepted
  because the guard is `!== undefined`, not truthiness.
- **Circular `context`:** `JSON.stringify` throws `TypeError`. Per PRD Risks
  section, this is the caller's responsibility in v1; the utility does not
  catch or sanitize. A future feature can swap in a safe-stringify helper
  without changing the public signature.
- **Non-string `message`:** template-literal interpolation calls
  `String(message)` implicitly. Numbers/booleans render as expected; objects
  render as `[object Object]`. Documented behaviour, not a guarded error —
  the typed contract in Functional Requirements puts string-coercion on the
  caller.
- **`console.*` reassignment by tests:** the test helper restores the
  original method after each test; if a future test forgets to do so, the
  next test sees corrupted output. Mitigation is local to test code, not the
  module under test.

## Security and Privacy

- No I/O beyond `console.*` — no files written, no network calls.
- No automatic redaction. Callers must not pass secrets/PII in `context`; the
  module serializes the object verbatim. This is consistent with PRD
  Non-Goals (no PII handling).
- No `eval`, no dynamic `require`, no user-controlled property access.

## Performance Considerations

- One `Date` allocation, one `toISOString` call, one template-literal join,
  and optionally one `JSON.stringify` per log call. Negligible at the
  expected call rate; no batching or async buffering needed.
- No hidden allocations in the hot path beyond what Node itself does for
  `console.*` formatting.

## Rollout Plan

Single PR on branch `feat/feat-001`. No feature flag, no migration, no
runtime configuration. Merging the PR makes the utility available to all
`src/` modules; existing modules continue to use `console.*` directly until
a future feature opts them in.

## Out of Scope (deferred to future features)

- Wiring the logger into `src/index.js` and `src/utils/validate.js`.
- Log-level filtering, env-var toggles, or runtime configuration.
- JSON-only output mode, file/network transports, log rotation.
- TypeScript types or `.d.ts` declarations.
- Safe-stringify for circular `context`, automatic PII redaction.
- Additional levels (`debug`, `trace`, `fatal`).

## Open Questions

None. The PRD is unambiguous and the implementation has no remaining design
decisions.
