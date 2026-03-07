"use client";

import type { Organization, Session, User } from "@banata-auth/shared";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

// ─── Context Value ──────────────────────────────────────────────────

export interface BanataAuthContextValue {
	user: User | null;
	session: Session | null;
	organization: Organization | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	/** Error from the last session fetch attempt, or null if successful. */
	error: Error | null;
	/** Sign out the current user. */
	signOut: () => Promise<void>;
	/** Refresh the auth state (re-fetch user/session). */
	refresh: () => Promise<void>;
	/** Set the active organization for the session. */
	setActiveOrganization: (organizationId: string | null) => Promise<void>;
}

const BanataAuthContext = createContext<BanataAuthContextValue | null>(null);

// ─── Hook ───────────────────────────────────────────────────────────

/**
 * Access the Banata Auth context.
 * Must be used within a BanataAuthProvider.
 */
export function useBanataAuth(): BanataAuthContextValue {
	const context = useContext(BanataAuthContext);
	if (!context) {
		throw new Error("useBanataAuth must be used within a BanataAuthProvider");
	}
	return context;
}

// ─── Auth Adapter Interface ─────────────────────────────────────────

/**
 * Interface for the auth adapter that connects to the actual auth backend.
 * Consumers implement this to bridge their Convex/Better Auth setup.
 *
 * @example
 * ```tsx
 * // In your app, using Convex Better Auth:
 * const adapter: BanataAuthAdapter = {
 *   fetchSession: async () => {
 *     const session = await authClient.getSession();
 *     return session ? { user: session.user, session: session.session } : null;
 *   },
 *   signOut: async () => {
 *     await authClient.signOut();
 *   },
 *   setActiveOrganization: async (orgId) => {
 *     await authClient.organization.setActive({ organizationId: orgId });
 *   },
 * };
 * ```
 */
export interface BanataAuthAdapter {
	/** Fetch the current session and user. Returns null if not authenticated. */
	fetchSession: () => Promise<{
		user: User;
		session: Session;
		organization?: Organization | null;
	} | null>;
	/** Sign out the current user. */
	signOut: () => Promise<void>;
	/** Set the active organization. */
	setActiveOrganization?: (organizationId: string | null) => Promise<void>;
}

// ─── Provider Props ─────────────────────────────────────────────────

export interface BanataAuthProviderProps {
	children: ReactNode;

	/**
	 * Auth adapter for connecting to the auth backend.
	 * Required unless using controlled mode with `user`/`session` props.
	 */
	adapter?: BanataAuthAdapter;

	/**
	 * Controlled mode: directly pass in the user.
	 * When provided, the adapter's fetchSession is not called.
	 */
	user?: User | null;

	/**
	 * Controlled mode: directly pass in the session.
	 */
	session?: Session | null;

	/**
	 * Controlled mode: directly pass in the organization.
	 */
	organization?: Organization | null;

	/**
	 * Controlled mode: directly pass in loading state.
	 */
	isLoading?: boolean;

	/**
	 * Controlled mode: sign out handler.
	 */
	onSignOut?: () => Promise<void>;

	/**
	 * Controlled mode: set active organization handler.
	 */
	onSetActiveOrganization?: (organizationId: string | null) => Promise<void>;
}

// ─── Provider Component ─────────────────────────────────────────────

/**
 * Root provider for Banata Auth React components.
 *
 * Supports two modes:
 *
 * 1. **Adapter mode** — provide a `BanataAuthAdapter` that bridges to your
 *    auth backend (Convex + Better Auth). The provider handles fetching
 *    and caching the session.
 *
 * 2. **Controlled mode** — pass `user`, `session`, and `isLoading` directly.
 *    Useful when you already have auth state from your framework (e.g.,
 *    from Convex's built-in auth hooks).
 *
 * @example Adapter mode
 * ```tsx
 * <BanataAuthProvider adapter={myAdapter}>
 *   <App />
 * </BanataAuthProvider>
 * ```
 *
 * @example Controlled mode (with Convex)
 * ```tsx
 * function AuthWrapper({ children }) {
 *   const { user, session, isLoading } = useConvexAuth();
 *   return (
 *     <BanataAuthProvider user={user} session={session} isLoading={isLoading}>
 *       {children}
 *     </BanataAuthProvider>
 *   );
 * }
 * ```
 */
export function BanataAuthProvider({
	children,
	adapter,
	user: controlledUser,
	session: controlledSession,
	organization: controlledOrganization,
	isLoading: controlledIsLoading,
	onSignOut,
	onSetActiveOrganization,
}: BanataAuthProviderProps) {
	// Determine if we're in controlled mode
	const isControlled = controlledUser !== undefined || controlledSession !== undefined;

	// ── Adapter Mode State ──
	const [adapterUser, setAdapterUser] = useState<User | null>(null);
	const [adapterSession, setAdapterSession] = useState<Session | null>(null);
	const [adapterOrganization, setAdapterOrganization] = useState<Organization | null>(null);
	const [adapterIsLoading, setAdapterIsLoading] = useState(!isControlled);
	const [adapterError, setAdapterError] = useState<Error | null>(null);

	// ── Fetch session via adapter ──
	const fetchSession = useCallback(async () => {
		if (!adapter || isControlled) return;

		setAdapterIsLoading(true);
		setAdapterError(null);
		try {
			const result = await adapter.fetchSession();
			if (result) {
				setAdapterUser(result.user);
				setAdapterSession(result.session);
				setAdapterOrganization(result.organization ?? null);
			} else {
				setAdapterUser(null);
				setAdapterSession(null);
				setAdapterOrganization(null);
			}
		} catch (err) {
			console.error("[BanataAuth] Failed to fetch session:", err);
			setAdapterError(err instanceof Error ? err : new Error(String(err)));
			setAdapterUser(null);
			setAdapterSession(null);
			setAdapterOrganization(null);
		} finally {
			setAdapterIsLoading(false);
		}
	}, [adapter, isControlled]);

	// Initial fetch
	useEffect(() => {
		if (!isControlled && adapter) {
			fetchSession();
		}
	}, [isControlled, adapter, fetchSession]);

	// ── Resolved values ──
	const user = isControlled ? (controlledUser ?? null) : adapterUser;
	const session = isControlled ? (controlledSession ?? null) : adapterSession;
	const organization = isControlled ? (controlledOrganization ?? null) : adapterOrganization;
	const isLoading = isControlled ? (controlledIsLoading ?? false) : adapterIsLoading;
	const error = isControlled ? null : adapterError;

	// ── Actions ──
	const signOut = useCallback(async () => {
		if (onSignOut) {
			await onSignOut();
		} else if (adapter) {
			await adapter.signOut();
			setAdapterUser(null);
			setAdapterSession(null);
			setAdapterOrganization(null);
		}
	}, [adapter, onSignOut]);

	const setActiveOrganization = useCallback(
		async (organizationId: string | null) => {
			if (onSetActiveOrganization) {
				await onSetActiveOrganization(organizationId);
			} else if (adapter?.setActiveOrganization) {
				await adapter.setActiveOrganization(organizationId);
				// Re-fetch to update session's activeOrganizationId
				await fetchSession();
			}
		},
		[adapter, onSetActiveOrganization, fetchSession],
	);

	// ── Context value ──
	const value = useMemo<BanataAuthContextValue>(
		() => ({
			user,
			session,
			organization,
			isLoading,
			isAuthenticated: user !== null && session !== null,
			error,
			signOut,
			refresh: fetchSession,
			setActiveOrganization,
		}),
		[user, session, organization, isLoading, error, signOut, fetchSession, setActiveOrganization],
	);

	return <BanataAuthContext.Provider value={value}>{children}</BanataAuthContext.Provider>;
}
