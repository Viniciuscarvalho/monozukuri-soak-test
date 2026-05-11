# TechSpec — feat-001: Add error logging utility

**Feature:** feat-001
**Inherits from:** `./prd.md`
**Date:** 2026-05-11
**Status:** ready

---

## Approach

Implement a stateless ESM utility module at `src/utils/logger.js` that wraps the native `console` methods with ISO 8601 timestamps and an optional context payload. The design follows the existing `export function` pattern in `src/index.js`, requires zero new dependencies, and avoids any global state or side effects on import. Tests use Node's built-in `node:test` runner (Node ≥ 18) so the project stays dependency-free.

### Key decisions

| Decision         | Choice                     | Why                                                    |
| ---------------- | -------------------------- | ------------------------------------------------------ |
| Module format    | ESM `export function`      | Matches the only existing source file (`src/index.js`) |
| Timestamp source | `new Date().toISOString()` | Zero-dependency, universally parseable, sortable       |
| Test runner      | `node:test` (built-in)     | No new deps; available on all modern Node LTS versions |

---

## Existing codebase patterns this feature MUST follow

```js
// src/index.js — ESM named exports, no default export
export function hello(name = "world") {
  return `Hello, ${name}!`;
}
```

```js
// No existing logging — mirror console.error / console.warn / console.log
// console.error("[timestamp] [ERROR] message", context?)
```

```js
// No existing tests — introduce node:test style
import { describe, it } from "node:test";
import assert from "node:assert/strict";
```

**Naming:** files `kebab-case.js` · functions `camelCase` · no classes needed

---

## File change map

### New files

| Path                       | Purpose                                       | Implements |
| -------------------------- | --------------------------------------------- | ---------- |
| `src/utils/logger.js`      | `error()`, `warn()`, `info()` with timestamps | FR-001     |
| `src/utils/logger.test.js` | Unit tests for all three log functions        | FR-001     |

### Modified files

| Path           | Change                                                                | Risk | Implements |
| -------------- | --------------------------------------------------------------------- | ---- | ---------- |
| `package.json` | Replace placeholder `test` script with `node --test src/**/*.test.js` | low  | FR-001     |

### Read for context only

| Path           | Why                                                       |
| -------------- | --------------------------------------------------------- |
| `src/index.js` | Confirms ESM export style and absence of existing logging |

---

## Components

### logger

**Location:** `src/utils/logger.js`
**Implements:** FR-001

**Public interface:**

```js
/**
 * @param {string} message
 * @param {object} [context={}]
 */
export function info(message, context = {}) {}
export function warn(message, context = {}) {}
export function error(message, context = {}) {}
```

**Behavior:**

1. Capture `new Date().toISOString()` as `timestamp`.
2. Build prefix string: `[${timestamp}] [${LEVEL}]`.
3. If `context` has own keys, call `console.method(prefix, message, context)`; otherwise `console.method(prefix, message)`.

**Errors:**

| Condition                 | Handling                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `message` is not a string | No guard — caller's responsibility; native `console` handles coercion                            |
| `context` is `null`       | Default parameter is `{}`, so only applies when caller passes `null` explicitly — treat as empty |

---

## Data model

No persisted data. Omitted.

---

## API design

No external HTTP interface. Omitted.

---

## Configuration

No new config keys. Omitted.

---

## Testing

**Coverage target:** 100% (utility is 3 pure functions, trivially coverable)

| Scope | Test file                  | Covers                                                                  |
| ----- | -------------------------- | ----------------------------------------------------------------------- |
| Unit  | `src/utils/logger.test.js` | `info`, `warn`, `error` — message only, message + context, null context |

### Validation commands

```bash
npm test
# (lint/type-check not configured yet — add if tooling is added)
```

_`npm test` must exit 0 before the cycle gate passes._

---

## Dependencies

No new dependencies.

---

## Task ordering

1. Create `src/utils/logger.js` — core implementation; everything else depends on this
2. Update `package.json` test script — needed before tests can run
3. Create `src/utils/logger.test.js` — validates implementation
4. Run `npm test` and confirm exit 0 — cycle gate

```
task-1 (logger.js)
    ↓
task-2 (package.json)  →  task-3 (logger.test.js)
                                ↓
                           task-4 (npm test — gate)
```

---

**Handoff to Tasks phase:** every component (`logger`), every file (`src/utils/logger.js`, `src/utils/logger.test.js`, `package.json`), and the test run must appear in at least one task. Each task touches ≤ 3 files and completes in ≤ 15 minutes of agent time.
