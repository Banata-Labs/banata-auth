"use client";

import type { Session } from "@banata-auth/shared";
import { useBanataAuth } from "../provider";

export interface UseSessionReturn {
	session: Session | null;
	isLoading: boolean;
	/** Refresh the auth state (re-fetch user/session). */
	refresh: () => Promise<void>;
}

/**
 * Hook to access the current session.
 *
 * @example
 * ```tsx
 * function SessionInfo() {
 *   const { session, isLoading, refresh } = useSession();
 *   if (isLoading) return <Spinner />;
 *   if (!session) return <p>No active session</p>;
 *   return (
 *     <div>
 *       <p>Session expires: {session.expiresAt}</p>
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSession(): UseSessionReturn {
	const { session, isLoading, refresh } = useBanataAuth();
	return { session, isLoading, refresh };
}
