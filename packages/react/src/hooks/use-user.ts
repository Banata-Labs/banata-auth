"use client";

import type { User } from "@banata-auth/shared";
import { useBanataAuth } from "../provider";

export interface UseUserReturn {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	/** Sign out the current user. */
	signOut: () => Promise<void>;
}

/**
 * Hook to access the current authenticated user.
 *
 * @example
 * ```tsx
 * function Profile() {
 *   const { user, isLoading, signOut } = useUser();
 *   if (isLoading) return <Spinner />;
 *   if (!user) return <SignInPrompt />;
 *   return (
 *     <div>
 *       <h1>Welcome, {user.name}</h1>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUser(): UseUserReturn {
	const { user, isLoading, isAuthenticated, signOut } = useBanataAuth();
	return { user, isLoading, isAuthenticated, signOut };
}
