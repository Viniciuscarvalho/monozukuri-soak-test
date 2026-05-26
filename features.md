# Canary backlog

## [FEAT] canary-001: Add release canary marker
**Description:** Add `src/canary-marker.js` exporting a `canaryMarker()` function that returns the exact string `monozukuri-v2-canary-ready`. Keep the change small and deterministic.
**Complexity:** S

## [FEAT] canary-002: Add release canary metadata
**Description:** Add `src/canary-metadata.js` exporting a `canaryMetadata()` function that returns an object with `project: "monozukuri-soak-test"` and `purpose: "v2-live-canary"`. Keep the change small and deterministic.
**Complexity:** S
