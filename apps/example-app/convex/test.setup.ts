/// <reference types="vite/client" />

// convex-test requires a Vite-style module map via import.meta.glob.
// This only works when tests are executed through Vitest (which provides the
// Vite transform layer).  When running under Bun's built-in test runner the
// glob call will fail — use `vitest run` instead for Convex integration tests.

export const modules = import.meta.glob("./**/*.ts");
