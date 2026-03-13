"use client";

import { authClient } from "@/lib/auth-client";
import { BanataConvexProvider } from "@banata-auth/react/convex";
import { ConvexReactClient } from "convex/react";
import { type ReactNode, useMemo } from "react";

/**
 * Dogfoods @banata-auth/react/convex — exactly how a customer would use it.
 */
export function ConvexClientProvider({
	children,
	initialToken,
}: {
	children: ReactNode;
	initialToken?: string | null;
}) {
	const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
	const convex = useMemo(() => {
		if (!convexUrl) {
			return null;
		}
		return new ConvexReactClient(convexUrl);
	}, [convexUrl]);

	if (!convex) {
		return <>{children}</>;
	}

	return (
		<BanataConvexProvider client={convex} authClient={authClient} initialToken={initialToken}>
			{children}
		</BanataConvexProvider>
	);
}
