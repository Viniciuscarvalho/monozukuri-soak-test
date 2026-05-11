# TechSpec: Add error logging utility

- **Feature ID:** feat-001
- **PRD:** `tasks/prd-feat-001/prd.md`
- **Stack:** Node.js (CommonJS), `node --test` for unit tests

## Technical Approach

Implement a single-file, dependency-free logger module at `src/utils/logger.js`
that exports three functions — `error`, `warn`, `info` — each with the
signature `(message: string, context?: object) => void`. The module follows the
same CommonJS export pattern already used by `src/utils/validate.js`, keeping
the codebase stylistically uniform and avoiding any build/transform step.

A private `formatMessage(level, message, context)` helper composes the output
line:

1. Capture `new Date().toISOString()` at call time.
2. Build the base string `` `[${timestamp}] [${level}] ${message}` ``.
3. If `context !== undefined`, append a single space and
   `JSON.stringify(context)`; otherwise return the base string unchanged.

Each public function calls `formatMessage` with its uppercase level tag
(`ERROR`, `WARN`, `INFO`) and then routes the formatted string to the
level-appropriate console method:

- `error` → `console.error`
- `warn` → `console.warn`
- `info` → `console.log`

The check `context !== undefined` (rather than truthiness) preserves valid
falsy contexts such as `null`, `0`, or `""` and is the explicit contract from
PRD FR-5. No transports, filtering, environment toggles, or async buffering are
added — output is synchronous and console-only, matching the PRD's Out of
Scope section.

Unit tests live in `src/utils/logger.test.js` using the built-in `node:test`
runner. The test file monkey-patches the relevant `console` method around each
call to capture emitted lines, then asserts against the regex contracts in the
PRD's Success Criteria. Tests cover: (a) each level routes to the correct
`console.*` method, (b) the ISO-8601 + level-tag + message format, (c) the
with-context path appends `JSON.stringify(context)`, and (d) the no-context
path emits no trailing `undefined`. The original `console` method is restored
after each capture so tests do not leak global state.

The `test` script in `package.json` is set to
`node --test src/*.test.js src/**/*.test.js` so that both top-level and
nested-utility test files are discovered without an external runner.

## Architecture Notes

- **Module style:** CommonJS (`module.exports = { error, warn, info }`) to
  match `src/utils/validate.js`. Do not introduce ESM in this feature.
- **No new dependencies:** the module relies solely on Node built-ins
  (`Date`, `JSON`, `console`). `package.json` gains no `dependencies` or
  `devDependencies` entries.
- **Synchronous I/O:** writes go directly through `console.*`. No queuing,
  batching, or async flush is introduced; ordering is preserved by the JS
  event loop.
- **Stateless module:** no module-level mutable state, no configuration
  object, no singleton. Each call is independent, which keeps the surface
  trivial to test and safe to import from anywhere.
- **Forward-compat hook:** the private `formatMessage` helper is the single
  seam where a future transport, level filter, or redactor would be inserted.
  It is intentionally not exported now to keep the public API minimal (PRD
  FR-1).
- **Test isolation:** tests patch `console[method]` per-case and restore it
  immediately, so test order does not matter and parallel `node --test`
  workers remain safe.

## Files Likely Touched

- `src/utils/logger.js` — new module implementing `error`, `warn`, `info` and
  the private `formatMessage` helper.
- `src/utils/logger.test.js` — new `node:test` unit tests covering all PRD
  Success Criteria.
- `package.json` — set/confirm `scripts.test` to
  `node --test src/*.test.js src/**/*.test.js` so the new test file is
  discovered.

## Dependencies

- None. Implementation uses only Node built-ins (`Date`, `JSON`, `console`,
  `node:test`, `node:assert/strict`). No additions to `package.json`'s
  `dependencies` or `devDependencies`.

## Risks

- **Console patching in tests:** capturing output by reassigning
  `console.error/warn/log` is fragile if a test throws before restoring the
  original. Mitigation: use a small `captureConsole(method, fn)` helper that
  wraps the call and restores the original method on exit; keep each test
  case scoped to one method.
- **Timestamp non-determinism:** `new Date().toISOString()` produces a
  different value each call. Mitigation: assert via regex
  (`^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[LEVEL\] ...`) rather
  than exact-string equality.
- **`JSON.stringify` edge cases:** circular references throw, and `undefined`
  / function values are dropped. The PRD does not require handling these; the
  current scope passes objects through verbatim. Documenting this here so
  callers know failures bubble out of the logger.
- **Test discovery glob:** `src/**/*.test.js` relies on shell globbing
  semantics. On shells where `**` is not enabled it would silently match
  nothing under nested directories. Mitigation: keep both `src/*.test.js` and
  `src/**/*.test.js` patterns; verify locally with `npm test` before
  shipping.
- **Scope creep:** the PRD explicitly excludes log-level filtering, env-based
  silencing, file/network transports, and redaction. Resist adding any of
  these in this feature even if convenient.

## Validation Gate

- `npm test` must pass with the new `src/utils/logger.test.js` included and
  all existing tests still green.
