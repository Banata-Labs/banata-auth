import { type ReactNode } from "react";

// Re-export from @convex-dev/better-auth/react so consumers don't
// need to add it as a direct dependency.
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { AuthClient } from "@convex-dev/better-auth/react";

/**
 * Props for BanataConvexProvider — the recommended way to wrap your
 * Next.js app when using Banata Auth with Convex.
 */
export interface BanataConvexProviderProps {
	children: ReactNode;

	/**
	 * A ConvexReactClient instance.
	 *
	 * @example
	 * ```ts
	 * import { ConvexReactClient } from "convex/react";
	 * const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
	 * ```
	 */
	client: {
		setAuth(fetchToken: (args: { forceRefreshToken: boolean }) => Promise<string | null | undefined>): void;
		clearAuth(): void;
	};

	/**
	 * The Better Auth client instance (from `createAuthClient`).
	 *
	 * @example
	 * ```ts
	 * import { createAuthClient } from "better-auth/react";
	 * import { convexClient } from "@convex-dev/better-auth/client/plugins";
	 * export const authClient = createAuthClient({ plugins: [convexClient()] });
	 * ```
	 */
	authClient: AuthClient;

	/**
	 * Optional initial JWT token for SSR hydration.
	 * Pass from `getToken()` in your root layout's server component.
	 */
	initialToken?: string | null;
}

/**
 * Recommended provider for Banata Auth + Convex apps.
 *
 * Wraps your app with `ConvexBetterAuthProvider` from `@convex-dev/better-auth`,
 * handling token exchange between Better Auth sessions and Convex JWTs,
 * automatic re-authentication on token expiry, and SSR hydration.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { BanataConvexProvider } from "@banata-auth/react/convex";
 * import { getToken } from "@banata-auth/nextjs/server";
 *
 * export default async function RootLayout({ children }) {
 *   const token = await getToken();
 *   return (
 *     <html>
 *       <body>
 *         <BanataConvexProvider
 *           client={convex}
 *           authClient={authClient}
 *           initialToken={token}
 *         >
 *           {children}
 *         </BanataConvexProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function BanataConvexProvider({
	children,
	client,
	authClient,
	initialToken,
}: BanataConvexProviderProps) {
	return (
		<ConvexBetterAuthProvider
			client={client}
			authClient={authClient}
			initialToken={initialToken}
		>
			{children}
		</ConvexBetterAuthProvider>
	);
}
