"use client";

import Link from "next/link";
import { AuthCard } from "@banata-auth/react";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
	const params =
		typeof window === "undefined"
			? new URLSearchParams()
			: new URLSearchParams(window.location.search);
	const message = params.get("message") ?? "Unexpected authentication error";

	return (
		<AuthCard title="Unable to continue" description="The sign-in flow returned an error.">
			<p className="text-sm text-destructive">{message}</p>
			<Button asChild variant="outline">
				<Link href="/sign-in">Back to sign in</Link>
			</Button>
		</AuthCard>
	);
}
