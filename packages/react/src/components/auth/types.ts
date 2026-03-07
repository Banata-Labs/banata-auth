/**
 * Minimal auth client interface expected by auth form components.
 *
 * This is deliberately loose — it matches the shape returned by
 * `createAuthClient` from `better-auth/react` without coupling
 * the package to a specific Better Auth version.
 */
export interface AuthClientLike {
	signIn: {
		email: (params: {
			email: string;
			password: string;
			callbackURL?: string;
		}) => Promise<{ data?: unknown; error?: { message?: string } | null }>;
		social: (params: {
			provider: string;
			callbackURL?: string;
		}) => Promise<{ data?: unknown; error?: { message?: string } | null }>;
	};
	signUp: {
		email: (params: {
			name: string;
			email: string;
			password: string;
			callbackURL?: string;
		}) => Promise<{ data?: unknown; error?: { message?: string } | null }>;
	};
	signOut: () => Promise<unknown>;
}

export interface SocialProvider {
	/** Provider ID passed to `authClient.signIn.social()` (e.g., "github", "google"). */
	id: string;
	/** Optional display label. Falls back to the built-in provider registry. */
	label?: string;
	/** Optional icon element or component. Falls back to the built-in provider registry. */
	icon?: React.ReactNode;
}
