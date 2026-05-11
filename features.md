# features.md

## [FEAT] feat-001: Add error logging utility
**Description:** Create `src/utils/logger.js` with `error()`, `warn()`, and `info()` functions that take a message and optional context object. Output to console with timestamps.
**Complexity:** S

## [FEAT] feat-002: Add input validation helper
**Description:** Create `src/utils/validate.js` with `isEmail()`, `isUrl()`, and `isNonEmpty()` functions. Each returns boolean. Add unit tests.
**Complexity:** S

## [FEAT] feat-003: Add greeting customization
**Description:** Extend the existing `hello()` function in `src/index.js` to accept a second parameter `style` ('formal' | 'casual' | 'pirate'). Default 'casual'.
**Complexity:** S

## [FEAT] feat-004: Add config loading
- depends on: feat-001
**Description:** Create `src/config.js` that loads `.env` file or reads from `process.env`. Export a `config` object with typed access. Handle missing values with defaults.
**Complexity:** M

## [FEAT] feat-005: Add greeting API endpoint
- depends on: feat-001, feat-003
**Description:** Create a minimal HTTP server in `src/server.js` using Node's built-in `http` module that responds to GET /hello with JSON. Uses the logger from feat-001 and the hello function from feat-003.
**Complexity:** M
