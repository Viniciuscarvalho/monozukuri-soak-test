# PRD — feat-002: Add input validation helper

**Feature:** feat-002
**Stack:** nodejs · ES modules · npm
**Date:** 2026-05-11
**Status:** approved

---

## Problem

The project has no reusable input-validation utilities. Ad-hoc checks are duplicated across callers and untested, making it error-prone to validate email addresses, URLs, and non-empty strings consistently.

## Solution

Create `src/utils/validate.js` exporting three boolean-returning functions (`isEmail`, `isUrl`, `isNonEmpty`) backed by unit tests using the Node.js built-in test runner.

## Success criteria

| Criterion                                       | How verified                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/utils/validate.js` exports three functions | `node -e "import('./src/utils/validate.js').then(m => console.log(Object.keys(m)))"` |
| All unit tests pass                             | `npm test` exits 0                                                                   |

---

## Functional requirements

### FR-001: isEmail [MUST]

**Behavior:** Returns `true` for valid RFC-5321-compliant email addresses; `false` otherwise.

**Acceptance criteria:**

1. Given a well-formed email `user@example.com`, `isEmail` returns `true`.
2. Given `user@example.co.uk`, `isEmail` returns `true`.

**Negative cases:**

1. Given `not-an-email`, `isEmail` returns `false`.
2. Given empty string `""`, `isEmail` returns `false`.
3. Given `null` or `undefined`, `isEmail` returns `false`.

### FR-002: isUrl [MUST]

**Behavior:** Returns `true` for valid absolute URLs (http/https); `false` otherwise.

**Acceptance criteria:**

1. Given `https://example.com`, `isUrl` returns `true`.
2. Given `http://sub.domain.io/path?q=1`, `isUrl` returns `true`.

**Negative cases:**

1. Given `not-a-url`, `isUrl` returns `false`.
2. Given `ftp://example.com`, `isUrl` returns `false` (http/https only).
3. Given `null` or `undefined`, `isUrl` returns `false`.

### FR-003: isNonEmpty [MUST]

**Behavior:** Returns `true` if value is a string with at least one non-whitespace character; `false` otherwise.

**Acceptance criteria:**

1. Given `"hello"`, `isNonEmpty` returns `true`.
2. Given `"  x  "`, `isNonEmpty` returns `true` (trimmed non-empty).

**Negative cases:**

1. Given `""`, `isNonEmpty` returns `false`.
2. Given `"   "` (whitespace only), `isNonEmpty` returns `false`.
3. Given `null`, `undefined`, or a non-string, `isNonEmpty` returns `false`.

---

## Hard constraints

- No new runtime npm dependencies (use built-ins only).
- No modification to `src/index.js` or existing exports.

## Out of scope

- Async validation.
- Sanitisation / transformation (functions return boolean only).
- Phone number or date validation.
