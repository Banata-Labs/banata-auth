import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

// ── Types ───────────────────────────────────────────────────────────

export interface BanataAuthServerOptions {
	/**
	 * Your Convex cloud URL (e.g. `https://adjective-animal-123.convex.cloud`).
	 * Typically `process.env.NEXT_PUBLIC_CONVEX_URL`.
	 */
	convexUrl: string;

	/**
	 * Your Convex site URL (e.g. `https://adjective-animal-123.convex.site`).
	 * Typically `process.env.NEXT_PUBLIC_CONVEX_SITE_URL`.
	 */
	convexSiteUrl: string;
}

/**
 * Create the Banata Auth server utilities for Next.js.
 *
 * This is the recommended way to configure server-side auth helpers.
 * It wraps `@convex-dev/better-auth/nextjs` so consumers don't need
 * that package as a direct dependency.
 *
 * Returns `handler`, `isAuthenticated`, `getToken`, `preloadAuthQuery`,
 * `fetchAuthQuery`, `fetchAuthMutation`, and `fetchAuthAction`.
 *
 * @example
 * ```ts
 * // lib/auth-server.ts
 * import { createBanataAuthServer } from "@banata-auth/nextjs/server";
 *
 * export const {
 *   handler,
 *   isAuthenticated,
 *   getToken,
 *   preloadAuthQuery,
 *   fetchAuthQuery,
 *   fetchAuthMutation,
 *   fetchAuthAction,
 * } = createBanataAuthServer({
 *   convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
 *   convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
 * });
 * ```
 *
 * @example
 * ```ts
 * // app/api/auth/[...all]/route.ts
 * import { handler } from "@/lib/auth-server";
 * export const { GET, POST } = handler;
 * ```
 *
 * @example
 * ```ts
 * // app/layout.tsx (server component)
 * import { getToken, isAuthenticated } from "@/lib/auth-server";
 * import { redirect } from "next/navigation";
 *
 * export default async function Layout({ children }) {
 *   if (!(await isAuthenticated())) redirect("/sign-in");
 *   const token = await getToken();
 *   return <Provider initialToken={token}>{children}</Provider>;
 * }
 * ```
 */
export function createBanataAuthServer(opts: BanataAuthServerOptions) {
	return convexBetterAuthNextJs({
		convexUrl: opts.convexUrl,
		convexSiteUrl: opts.convexSiteUrl,
	});
}

// Re-export the return type so consumers can type their variables if needed
export type BanataAuthServer = ReturnType<typeof createBanataAuthServer>;
