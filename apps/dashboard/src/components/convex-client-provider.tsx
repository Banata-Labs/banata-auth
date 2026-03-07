"use client";

import { authClient } from "@/lib/auth-client";
import { BanataConvexProvider } from "@banata-auth/react/convex";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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
	return (
		<BanataConvexProvider client={convex} authClient={authClient} initialToken={initialToken}>
			{children}
		</BanataConvexProvider>
	);
}
