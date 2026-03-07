"use client";

/**
 * Client-side utilities for Banata Auth + Next.js.
 *
 * Re-exports `usePreloadedAuthQuery` from `@convex-dev/better-auth/nextjs/client`
 * so consumers don't need that package as a direct dependency.
 *
 * @example
 * ```tsx
 * import { usePreloadedAuthQuery } from "@banata-auth/nextjs/client";
 * import type { Preloaded } from "convex/react";
 * import { api } from "@/convex/_generated/api";
 *
 * export function Header({
 *   preloadedUser,
 * }: {
 *   preloadedUser: Preloaded<typeof api.auth.getCurrentUser>;
 * }) {
 *   const user = usePreloadedAuthQuery(preloadedUser);
 *   return <h1>{user?.name}</h1>;
 * }
 * ```
 */
export { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
