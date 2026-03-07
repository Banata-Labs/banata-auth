"use client";

import type { ReactNode } from "react";
import { useBanataAuth } from "../provider";

export interface AuthBoundaryProps {
	/** Content shown when the user is authenticated. */
	authenticated: ReactNode;
	/** Content shown when the user is not authenticated. */
	unauthenticated?: ReactNode;
	/** Content shown while auth state is loading. */
	loading?: ReactNode;
}

/**
 * Conditionally renders children based on authentication state.
 *
 * @example
 * ```tsx
 * <AuthBoundary
 *   authenticated={<Dashboard />}
 *   unauthenticated={<LoginPage />}
 *   loading={<Spinner />}
 * />
 * ```
 */
export function AuthBoundary({
	authenticated,
	unauthenticated = null,
	loading = null,
}: AuthBoundaryProps) {
	const { isLoading, isAuthenticated } = useBanataAuth();

	if (isLoading) return <>{loading}</>;
	if (isAuthenticated) return <>{authenticated}</>;
	return <>{unauthenticated}</>;
}
