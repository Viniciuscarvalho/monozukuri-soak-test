# TechSpec — feat-003: Add greeting customization

## Metadata

- **Feature ID:** feat-003
- **Title:** Add greeting customization
- **Source PRD:** `tasks/prd-feat-003/prd.md`
- **Target file:** `src/index.js`
- **Test file:** `src/index.test.js`
- **Complexity:** S
- **Dependencies:** none

## Overview

Extend the existing `hello(name)` function in `src/index.js` to accept an optional second positional parameter `style`, which selects one of three greeting phrasings: `casual`, `formal`, or `pirate`. The change is backwards-compatible — existing single-argument call sites continue to return the current `Hey, ${name}!` string. Unknown style values gracefully fall back to `casual` rather than throwing. Coverage is provided via the built-in `node:test` runner, wired into `npm test`. No new dependencies are introduced.

## Technical Approach

The implementation is a small, self-contained source-level change. The chosen approach is a **lookup-table dispatch** rather than a `switch` or chain of `if/else`, because:

- Adding a new style is a single-line addition to the map plus a single test.
- The map is module-private — there is no public plugin/extension surface to maintain.
- Dispatch becomes a constant-time property lookup with a `??` fallback to the default style.

### Function shape

```js
const STYLES = {
  casual: (name) => `Hey, ${name}!`,
  formal: (name) => `Good day, ${name}.`,
  pirate: (name) => `Ahoy, ${name}! Arr!`,
};

export function hello(name = "world", style = "casual") {
  const greet = STYLES[style] ?? STYLES.casual;
  return greet(name);
}
```

Key properties:

1. **Default-preserving:** `style` defaults to `"casual"`, so `hello("Ada")` returns the same string as before.
2. **Forgiving:** `STYLES[style] ?? STYLES.casual` falls back when `style` is `undefined`, an empty string, or any unrecognized key. No throw.
3. **Case-sensitive lookup:** intentional simplicity; documented in the PRD's Open Questions.
4. **ESM named export preserved:** `export function hello` — no breaking change to module shape.

### Test strategy

Tests live alongside the source in `src/index.test.js` and use `node:test` + `node:assert/strict` — both bundled with Node, so zero new dependencies. The test file covers each acceptance criterion from the PRD:

| Test                               | Assertion                                                |
| ---------------------------------- | -------------------------------------------------------- |
| default style is casual            | `hello("Alice")` contains `"Alice"` and `"Hey"`          |
| explicit casual style              | `hello("Alice", "casual") === "Hey, Alice!"`             |
| formal style                       | `hello("Alice", "formal") === "Good day, Alice."`        |
| pirate style                       | `hello("Alice", "pirate") === "Ahoy, Alice! Arr!"`       |
| unknown style falls back to casual | `hello("Alice", "klingon") === hello("Alice", "casual")` |

### Tooling

`package.json` `scripts.test` is set to `node --test src/index.test.js`. This exits non-zero on failure, so it composes cleanly with CI.

## Architecture

There is no architectural change. The module remains a single ESM file exporting a single pure function. Data flow is:

```
caller → hello(name, style) → STYLES[style] | STYLES.casual → returns string
```

No I/O, no async, no state, no global side effects.

## Architecture Notes

- The function remains pure and synchronous; no introduction of async, I/O, or shared state.
- Dispatch is data-driven (lookup table) rather than control-flow (`switch`/`if`) to keep style additions to a one-line change.
- The `STYLES` map is module-private to avoid coupling downstream consumers to its shape; introspection or extension is deliberately not a public surface (see Open Questions).
- ESM module shape is preserved (named export `hello`) so the change is import-compatible with existing call sites.

## Data Model

No persisted data. The only in-memory structure is the module-private `STYLES` object:

- **Type:** `Record<string, (name: string) => string>`
- **Keys:** `"casual" | "formal" | "pirate"` (closed set; not exported)
- **Values:** pure formatter functions taking a `name` string and returning the greeting string

## API / Interface Changes

### Public function signature

**Before:**

```js
export function hello(name = "world"): string
```

**After:**

```js
export function hello(name = "world", style = "casual"): string
```

### Behavioral contract

| Call                      | Returns             |
| ------------------------- | ------------------- |
| `hello()`                 | `"Hey, world!"`     |
| `hello("Ada")`            | `"Hey, Ada!"`       |
| `hello("Ada", "casual")`  | `"Hey, Ada!"`       |
| `hello("Ada", "formal")`  | `"Good day, Ada."`  |
| `hello("Ada", "pirate")`  | `"Ahoy, Ada! Arr!"` |
| `hello("Ada", "unknown")` | `"Hey, Ada!"`       |
| `hello("Ada", undefined)` | `"Hey, Ada!"`       |

No exceptions are thrown for any input shape.

## Files Likely Touched

The implementation is expected to modify or create the following files. This list satisfies the pre-Code implicit-dep gate (ADR-015 §3b) and serves as the authoritative scope boundary for the Code phase.

- `src/index.js` — **modify**: add module-private `STYLES` map; extend `hello` signature with the `style` parameter and lookup-table dispatch.
- `src/index.test.js` — **add**: five `node:test` cases covering default-style, explicit casual, formal, pirate, and unknown-style fallback.
- `package.json` — **modify**: set `scripts.test` to `node --test src/index.test.js`. No additions to `dependencies` or `devDependencies`.

### files_likely_touched (machine-readable)

```json
["src/index.js", "src/index.test.js", "package.json"]
```

## File-Level Changes

| File                | Change kind | Description                                                                        |
| ------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `src/index.js`      | modify      | Add `STYLES` map; extend `hello` signature with `style` param and dispatch logic.  |
| `src/index.test.js` | add         | Five `node:test` cases covering default, explicit casual, formal, pirate, unknown. |
| `package.json`      | modify      | Set `scripts.test` to `node --test src/index.test.js`.                             |

## Dependencies

No new external dependencies. The change relies exclusively on Node.js built-ins:

- `node:test` — bundled test runner (Node ≥ 18).
- `node:assert/strict` — bundled assertion library.

`package.json` `dependencies` and `devDependencies` remain unchanged.

## Testing Strategy

- **Framework:** `node:test` + `node:assert/strict` (built into Node, no new deps).
- **Scope:** unit-test the exported function only; no integration or E2E layer exists.
- **Coverage targets:** every branch of the `STYLES[style] ?? STYLES.casual` dispatch — three explicit styles, one default-arg path, one unknown-key fallback path.
- **Run command:** `npm test` (wraps `node --test src/index.test.js`); exits 0 on success.
- **CI integration:** the existing CI (if any) runs `npm test`; no new pipeline configuration required.

## Performance Considerations

Negligible. The change replaces a single template-literal evaluation with a property lookup plus a function call — both O(1). No allocations beyond the existing return string. No runtime cost relative to the current implementation.

## Security Considerations

- **No user-controlled keys in dangerous sinks:** `STYLES[style]` is a plain object indexed by a string. There is no `eval`, no dynamic `require`/`import`, no shell invocation. A malicious `style` value can at worst miss the lookup and fall through to the casual default.
- **Prototype-pollution surface:** `STYLES` is a literal object; an attacker-controlled `style` like `"__proto__"` would resolve via the prototype chain. The `?? STYLES.casual` short-circuit handles non-function results indirectly because the formatter is then invoked; to be defensive, the lookup could use `Object.hasOwn(STYLES, style)` if hardening is later required. Not required for this feature scope (the function is a demo utility, not exposed to untrusted input).
- **No PII, secrets, or logging:** the function does not touch credentials, network, or storage.

## Rollout / Migration

- **Strategy:** ship directly. The change is additive and backwards-compatible — any caller passing only `name` sees identical output to before.
- **Feature flag:** not required; the new parameter is opt-in via positional argument.
- **Migration of existing callers:** none. No call sites need to change.
- **Rollback:** revert the single commit; no data or state to undo.

## Risks

- Existing single-arg callers break — mitigated by the `style` parameter defaulting to `"casual"`, preserving the original return string verbatim.
- Unknown-style values silently fall back, potentially masking a caller bug — documented behavior, covered by a dedicated test, and flagged in the PRD's Open Questions for later revisit.
- `node:test` is unavailable on Node < 18 — the project is already ESM and assumes modern Node; pin `engines.node` if a regression is reported.
- Future style additions could create merge conflicts in `STYLES` — the map is a flat literal, so adding a key is a one-line change plus a sibling test.
- Crafted `style` values (e.g. `"__proto__"`) resolve via the prototype chain — the `?? STYLES.casual` short-circuit catches non-function results; can be hardened with `Object.hasOwn` if the function is later exposed to untrusted input.

## Risks and Mitigations

| Risk                                                            | Likelihood | Impact | Mitigation                                                                                          |
| --------------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------------- |
| Existing single-arg callers break                               | Low        | Low    | New param defaults to `"casual"`; existing return string is unchanged.                              |
| Unknown style silently falls back, masking a caller bug         | Low        | Low    | Documented behavior; covered by a dedicated test. Open Question in PRD flags revisit if reported.   |
| `node:test` unavailable on older Node versions (< 18)           | Low        | Medium | Project source is already ESM (modern Node assumed); pin `engines.node` later if regressions arise. |
| Future style additions cause merge conflicts in `STYLES`        | Low        | Low    | Map is a literal; adding a key is a one-line addition plus a test.                                  |
| Prototype-chain lookup via crafted `style` (e.g. `"__proto__"`) | Very Low   | Low    | Lookup returns a non-formatter; `?? STYLES.casual` short-circuit catches null; can harden later.    |

## Open Questions

1. Should an unknown style **throw** instead of silently defaulting? Current decision: **fall back to casual** (forgiving JS idiom). Revisit if a consumer reports silent fallback masking a real bug.
2. Should `style` matching be **case-insensitive** (`"FORMAL"` → formal)? Current decision: **case-sensitive** for simplicity. Revisit if real callers request it.
3. Should `STYLES` be exported (read-only) for downstream introspection? Current decision: **no** — keep the surface minimal until there is a concrete use case.

## Success Criteria

- `npm test` passes locally and in CI with all five new unit tests green.
- `hello("Ada")` returns the exact pre-change string (`"Hey, Ada!"`), confirming backwards compatibility.
- `package.json` `dependencies` block remains empty (or unchanged) — no new runtime deps.
- Single PR ships the change with the PRD's acceptance-criteria checklist fully ticked.

## Handoff Notes

Ready for the Tasks phase. The minimum task breakdown is:

1. Wire `npm test` script in `package.json`.
2. Extend `hello()` in `src/index.js` with the `style` parameter and `STYLES` dispatch map.
3. Add `src/index.test.js` with the five test cases listed in **Testing Strategy**.
4. Verify `npm test` exits 0 and all acceptance-criteria boxes from the PRD can be checked.
