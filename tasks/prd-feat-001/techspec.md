# TechSpec — feat-001: Add error logging utility

**Feature:** feat-001
**Inherits from:** `./prd.md`
**Date:** 2026-05-11
**Status:** ready
**Platform:** Node.js (npm), Node ≥ 18

---

## Files Likely Touched

- `src/utils/logger.js` (new) — implementation of `error`, `warn`, `info` exports.
- `src/utils/logger.test.js` (new) — `node:test` unit suite covering all three exports.
- `package.json` (modified) — wire `scripts.test` to `node --test src/**/*.test.js` and ensure `"type": "module"` is set.
- `src/index.js` (read-only) — referenced for ESM export-style conventions; no edits.

---

## Technical Approach

Implement a stateless ESM utility module at `src/utils/logger.js` that wraps the native `console` methods with ISO 8601 timestamps and an optional context payload. The module exposes three named functions — `error`, `warn`, `info` — each accepting `(message: string, context?: object)`. The design follows the existing `export function` pattern in `src/index.js`, requires zero new runtime or dev dependencies, has no side effects at import time, and avoids any global state.

Tests use Node's built-in `node:test` runner (available on Node ≥ 18) so the project stays dependency-free. Each test replaces the relevant `console` method with a spy in a `beforeEach`/`afterEach` pair to assert that the correct prefix, message, and (optional) context are forwarded, then restores the original implementation. The `npm test` script is wired to `node --test src/**/*.test.js` so the suite runs from a clean checkout with no install step beyond `npm install`.

### Key decisions

| Decision         | Choice                                           | Why                                                              |
| ---------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| Module format    | ESM `export function`                            | Matches the only existing source file (`src/index.js`)           |
| Severity routing | `console.error` / `console.warn` / `console.log` | Matches native severity routing; preserves stdout vs stderr      |
| Timestamp source | `new Date().toISOString()`                       | Zero-dependency, universally parseable, lexicographic-sortable   |
| Test runner      | `node:test` (built-in)                           | No new deps; stable on all modern Node LTS versions              |
| State / I/O      | None at import time                              | Module is pure functions over `console`; safe to import anywhere |

---

## Architecture Overview

The feature introduces a single utility module with no architectural footprint beyond a new directory (`src/utils/`). The module sits below any future application code that needs to emit diagnostic output and depends only on the platform-provided `console` global. No singletons, factories, classes, or initialization hooks are introduced; consumers import the named functions and call them directly.

```
Caller (any module in src/)
        │
        ▼
src/utils/logger.js   ──►   console.error / console.warn / console.log
        ▲
        │ imported by
        ▼
src/utils/logger.test.js   (node:test, replaces console.* with spies)
```

Future evolution paths (structured JSON output, transports beyond `console`, level gating) are explicitly out of scope (see PRD Non-Goals), but the three-function public surface is small enough to keep an internal swap source-compatible.

---

## Existing Codebase Patterns to Follow

The new code MUST mirror the conventions already present in the repo:

```js
// src/index.js — ESM named exports, no default export, default parameters
export function hello(name = "world") {
  return `Hello, ${name}!`;
}
```

```js
// node:test style for the new test file
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
```

**Conventions:**

- File names: `kebab-case.js`
- Function names: `camelCase`
- No classes, no default exports
- ESM only (`"type": "module"` in `package.json` is assumed; if absent, this TechSpec implies adding it — see Configuration below)
- One module = one responsibility

---

## File Change Map

### New files

| Path                       | Purpose                                                | Implements          |
| -------------------------- | ------------------------------------------------------ | ------------------- |
| `src/utils/logger.js`      | `error()`, `warn()`, `info()` with ISO 8601 timestamps | FR-001 — FR-008     |
| `src/utils/logger.test.js` | Unit tests for all three log functions                 | FR-001, AC-1 — AC-8 |

### Modified files

| Path           | Change                                                                                                  | Risk | Implements    |
| -------------- | ------------------------------------------------------------------------------------------------------- | ---- | ------------- |
| `package.json` | Replace placeholder `test` script with `node --test src/**/*.test.js`; ensure `"type": "module"` is set | low  | FR-009, NFR-2 |

### Read for context only

| Path           | Why                                                       |
| -------------- | --------------------------------------------------------- |
| `src/index.js` | Confirms ESM export style and absence of existing logging |

---

## Components

### Component: `logger`

- **Location:** `src/utils/logger.js`
- **Implements:** FR-001 — FR-008
- **Side effects at import time:** none

**Public interface:**

```js
/**
 * Emit an INFO-level diagnostic line via console.log.
 * @param {string} message - Required human-readable message.
 * @param {object} [context={}] - Optional context object; forwarded only if it has own enumerable keys.
 */
export function info(message, context = {}) {}

/**
 * Emit a WARN-level diagnostic line via console.warn.
 * Same signature and forwarding rules as info().
 */
export function warn(message, context = {}) {}

/**
 * Emit an ERROR-level diagnostic line via console.error.
 * Same signature and forwarding rules as info().
 */
export function error(message, context = {}) {}
```

**Behavior (shared by all three functions):**

1. Compute `timestamp = new Date().toISOString()` at call time.
2. Compute `level` as the uppercase severity (`INFO`, `WARN`, `ERROR`).
3. Build `prefix = \`[${timestamp}] [${level}]\``.
4. If `context` is non-null and has at least one own enumerable key, call the matching `console` method with `(prefix, message, context)`.
5. Otherwise, call the matching `console` method with `(prefix, message)`.
6. Return `undefined`.

**Severity routing table:**

| Function | Underlying console method | Stream |
| -------- | ------------------------- | ------ |
| `info`   | `console.log`             | stdout |
| `warn`   | `console.warn`            | stderr |
| `error`  | `console.error`           | stderr |

**Error handling:**

| Condition                       | Handling                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `message` is not a string       | No guard — caller's responsibility; native `console` handles coercion                             |
| `context` is `null`             | Treat as empty: do NOT forward the `context` arg to `console` (matches FR-007)                    |
| `context` is `undefined`        | Default parameter `{}` kicks in; treated as empty — do NOT forward                                |
| `context` is an empty object    | Do NOT forward — empty object has no own enumerable keys                                          |
| `context` is a non-object value | Out of contract per PRD; behavior is "treat as empty unless it has own keys" — pragmatically skip |

---

## Data Model

No persisted data. The module is stateless; nothing is stored in memory across calls.

_This section intentionally minimal — feature does not introduce a data model._

---

## API Design

No external HTTP, RPC, or CLI interface. The "API" is the three named ESM exports documented in **Components → logger → Public interface** above. No versioning, content negotiation, or schema concerns apply.

_This section intentionally minimal — feature does not expose a network or process boundary._

---

## Configuration

No new runtime configuration keys, environment variables, or config files.

The only configuration change is in `package.json`:

| Key            | Before                                                        | After                            | Reason                                  |
| -------------- | ------------------------------------------------------------- | -------------------------------- | --------------------------------------- |
| `scripts.test` | `"echo \"Error: no test specified\" && exit 1"` (placeholder) | `"node --test src/**/*.test.js"` | Wire the new test suite into `npm test` |
| `type`         | (absent or `"commonjs"`)                                      | `"module"`                       | Ensure ESM resolution for `src/**/*.js` |

If `"type": "module"` is already present, the second row is a no-op verification step.

---

## Testing Strategy

**Coverage target:** 100% line and branch coverage for `src/utils/logger.js` — the module is three pure functions, each with two branches (context forwarded vs not), so the surface is small enough to exhaustively cover.

| Scope | Test file                  | Covers                                                                                                                               |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Unit  | `src/utils/logger.test.js` | `info`, `warn`, `error` — message-only, message + non-empty context, null context, empty context, severity routing, timestamp format |

### Test cases (one `it` block per row)

| ID  | Scenario                        | Asserts                                                                                                |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| T-1 | `info("hello")`                 | `console.log` called once with `(prefix, "hello")`; prefix matches `/^\[<iso>\] \[INFO\]$/`            |
| T-2 | `warn("careful", { code: 1 })`  | `console.warn` called once with `(prefix, "careful", { code: 1 })`; prefix tagged `[WARN]`             |
| T-3 | `error("boom")`                 | `console.error` called once; prefix tagged `[ERROR]`                                                   |
| T-4 | `info("x", null)`               | `console.log` called with exactly 2 args (no context forwarded)                                        |
| T-5 | `info("x", {})`                 | `console.log` called with exactly 2 args (empty object not forwarded)                                  |
| T-6 | `error("boom", { id: 42 })`     | `console.error` called with 3 args including the context object                                        |
| T-7 | Importing the module (no calls) | None of `console.log` / `console.warn` / `console.error` invoked                                       |
| T-8 | Timestamp format                | Captured prefix matches `/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z\] \[(INFO\|WARN\|ERROR)\]$/` |

**Spy pattern:** in `beforeEach`, replace `console.log`, `console.warn`, `console.error` with stub functions that record `arguments`; in `afterEach`, restore the originals to keep test runs isolated and not pollute the runner's output.

### Validation commands

```bash
npm test
# Lint and type-check are not configured in this project — no additional commands required.
```

The cycle gate is: **`npm test` exits 0** with all assertions passing.

---

## Dependencies

No new runtime dependencies. No new dev dependencies.

| Type    | Package | Version | Reason          |
| ------- | ------- | ------- | --------------- |
| runtime | —       | —       | none introduced |
| dev     | —       | —       | none introduced |

The test runner (`node:test`), assertion library (`node:assert/strict`), and timestamp utility (`Date#toISOString`) are all Node.js platform built-ins.

---

## Security Considerations

- **Secret leakage via `context`:** The module does not redact or filter any field in the `context` object. Callers are responsible for not passing secrets (passwords, tokens, PII) into log calls. This is documented in PRD NFR-5 and is not enforced at the code level.
- **No I/O beyond stdout/stderr:** The module does not open files, network sockets, or child processes, so the attack surface is limited to whatever the host's `console` already exposes.
- **No dynamic code execution:** The module does not call `eval`, `Function`, or `import()` with dynamic strings.
- **No prototype pollution risk:** The `context` argument is forwarded by reference to `console.*` without iteration or merging into another object.

---

## Performance Considerations

Each log call adds:

1. One `new Date()` + `toISOString()` call (~µs).
2. Two string concatenations to build the prefix.
3. One `console.*` invocation (dominant cost; identical to a direct `console.*` call).

There is no measurable overhead relative to raw `console.*` for the expected usage (occasional diagnostic emission, not hot-path logging). No buffering, batching, or async work is performed.

---

## Risks and Mitigations

| Risk                                                                          | Likelihood | Impact | Mitigation                                                                                                      |
| ----------------------------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| Tests rely on capturing `console` output and are flaky under parallel runners | Low        | Low    | Use `node:test` with explicit `console` method replacements scoped to each test, restored in `afterEach`        |
| `node --test` glob behavior differs across Node minor versions                | Low        | Low    | Pin script to `node --test src/**/*.test.js`; document Node ≥ 18 requirement in NFR-2                           |
| `package.json` missing `"type": "module"` causes import failure               | Low        | Medium | Verify and add `"type": "module"` as part of the `package.json` task                                            |
| Callers log secrets via the `context` object                                  | Medium     | Medium | Document in PRD NFR-5 that redaction is out of scope; revisit if usage grows                                    |
| Future need for structured/JSON logs forces a rewrite                         | Medium     | Low    | Keep the public surface to three functions so an internal swap to a different formatter stays source-compatible |

---

## Task Ordering

1. **task-001** — Create `src/utils/logger.js` with `info`, `warn`, `error` exports per the Components section. Pure code; no tests yet.
2. **task-002** — Update `package.json`: set `scripts.test` to `node --test src/**/*.test.js`; ensure `"type": "module"`. Required before the test command can resolve ESM imports.
3. **task-003** — Create `src/utils/logger.test.js` covering test cases T-1 — T-8 with `node:test` and console-method spies.
4. **task-004** — Run `npm test` and confirm exit 0. This is the cycle gate.

```
task-001 (logger.js)
        │
        ▼
task-002 (package.json: test script + "type": "module")
        │
        ▼
task-003 (logger.test.js — depends on logger.js existing and ESM resolution being correct)
        │
        ▼
task-004 (npm test — gate; must exit 0)
```

Every component (`logger`), every file (`src/utils/logger.js`, `src/utils/logger.test.js`, `package.json`), and the final test run is covered by at least one task. Each task touches ≤ 3 files and is expected to complete in ≤ 15 minutes of agent time.

---

## Open Questions

None. All design decisions are captured above; the PRD's "Open Questions" section is also empty.

---

**Handoff to Tasks phase:** the four tasks listed above are the complete and ordered work plan. No additional discovery or scoping is required before implementation begins.
