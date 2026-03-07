"use client";

import { LogoMark } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { prefetchDashboardData } from "@/lib/dashboard-api";
import { SignInForm } from "@banata-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Dashboard sign-in page.
 *
 * Dogfoods the `<SignInForm />` component from `@banata-auth/react`,
 * proving that the auth-ui kit works end-to-end with Better Auth + Convex.
 */
export default function SignInPage() {
	const { data: session, isPending } = authClient.useSession();
	const searchParams = useSearchParams();
	const redirectUrl = searchParams.get("redirect_url") ?? "/";

	// If already authenticated, redirect immediately + pre-warm dashboard data
	useEffect(() => {
		if (!isPending && session?.user) {
			prefetchDashboardData();
			window.location.href = redirectUrl;
		}
	}, [isPending, session, redirectUrl]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<SignInForm
				authClient={authClient}
				callbackURL={redirectUrl}
				title="Sign in to Banata"
				description="Access the Banata Auth dashboard"
				socialOnly
				socialProviders={[{ id: "github", label: "GitHub" }]}
				logo={<LogoMark size={36} className="text-primary" />}
			/>
		</div>
	);
}
