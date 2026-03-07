"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { SignUpForm } from "@banata-auth/react";
import { LogoMark } from "@/components/logo";

/**
 * Dashboard sign-up page.
 *
 * Dogfoods the `<SignUpForm />` component from `@banata-auth/react`.
 */
export default function SignUpPage() {
	const { data: session, isPending } = authClient.useSession();

	// If already authenticated, redirect to dashboard
	useEffect(() => {
		if (!isPending && session?.user) window.location.href = "/";
	}, [isPending, session]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
		<SignUpForm
			authClient={authClient}
			callbackURL="/"
			title="Create your account"
			description="Get started with Banata Auth"
			socialProviders={[
				{ id: "github", label: "GitHub" },
			]}
			logo={<LogoMark size={36} className="text-primary" />}
				footer={
					<p>
						Already have an account?{" "}
						<a
							href="/sign-in"
							className="font-medium text-primary hover:underline"
						>
							Sign in
						</a>
					</p>
				}
			/>
		</div>
	);
}
