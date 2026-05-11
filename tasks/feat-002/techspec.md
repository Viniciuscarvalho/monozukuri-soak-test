# TechSpec — feat-002: Add input validation helper

**Feature:** feat-002
**Date:** 2026-05-11

---

## Files

| File                         | Action | Purpose                                  |
| ---------------------------- | ------ | ---------------------------------------- |
| `src/utils/validate.js`      | Create | Exports `isEmail`, `isUrl`, `isNonEmpty` |
| `src/utils/validate.test.js` | Create | Unit tests via `node:test`               |
| `package.json`               | Update | Point `test` script at test runner       |

---

## src/utils/validate.js

```js
// isEmail — RFC-5321 simplified regex; rejects null/undefined via type guard
export function isEmail(value) { ... }

// isUrl — delegates to URL constructor; restricts to http/https protocol
export function isUrl(value) { ... }

// isNonEmpty — string type guard + trim check
export function isNonEmpty(value) { ... }
```

### isEmail

- Type-guard: return `false` if `typeof value !== 'string'`.
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — covers the common case; not a full RFC parser.
- Return `regex.test(value)`.

### isUrl

- Type-guard: return `false` if `typeof value !== 'string'`.
- Wrap `new URL(value)` in try/catch; catch returns `false`.
- After successful parse, check `url.protocol === 'http:' || url.protocol === 'https:'`.

### isNonEmpty

- Type-guard: return `false` if `typeof value !== 'string'`.
- Return `value.trim().length > 0`.

---

## src/utils/validate.test.js

Uses `node:test` + `node:assert` (zero install). Structure:

```
describe isEmail
  ✓ valid: user@example.com
  ✓ valid: user@example.co.uk
  ✗ invalid: not-an-email
  ✗ invalid: empty string
  ✗ invalid: null
  ✗ invalid: undefined

describe isUrl
  ✓ valid: https://example.com
  ✓ valid: http://sub.domain.io/path?q=1
  ✗ invalid: not-a-url
  ✗ invalid: ftp://example.com
  ✗ invalid: null
  ✗ invalid: undefined

describe isNonEmpty
  ✓ valid: "hello"
  ✓ valid: "  x  "
  ✗ invalid: ""
  ✗ invalid: "   "
  ✗ invalid: null
  ✗ invalid: undefined
  ✗ invalid: 42 (non-string)
```

---

## package.json update

```json
"test": "node --experimental-vm-modules src/utils/validate.test.js"
```

Since `src/index.js` uses ESM (`export`), the package needs `"type": "module"` or the test file uses `.mjs`. Simplest: add `"type": "module"` to `package.json` and run with `node src/utils/validate.test.js`.

---

## FR / NFR traceability

| ID                    | Addressed by                                     |
| --------------------- | ------------------------------------------------ |
| FR-001                | `isEmail` in `validate.js` + isEmail tests       |
| FR-002                | `isUrl` in `validate.js` + isUrl tests           |
| FR-003                | `isNonEmpty` in `validate.js` + isNonEmpty tests |
| NFR (no runtime deps) | `node:test`, `node:assert` — built-ins only      |
