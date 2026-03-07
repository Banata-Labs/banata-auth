"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

/**
 * Dashboard sign-up page.
 *
 * Since the dashboard uses GitHub-only auth, sign-up is handled
 * through the GitHub OAuth flow on the sign-in page.
 */
export default function SignUpPage() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	useEffect(() => {
		if (!isPending && session?.user) {
			window.location.href = "/";
		} else if (!isPending) {
			router.replace("/sign-in");
		}
	}, [isPending, session, router]);

	return null;
}
