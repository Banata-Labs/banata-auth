"use client";

import { useEffect } from "react";
import { AuthCard } from "@banata-auth/react";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function CallbackPage() {
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && session?.user) {
			window.location.href = "/org-selector";
		}
	}, [isPending, session]);

	const params =
		typeof window === "undefined"
			? new URLSearchParams()
			: new URLSearchParams(window.location.search);
	const code = params.get("code");
	const state = params.get("state");

	return (
		<AuthCard title="Auth callback" description="Finalizing authentication.">
			<p className="text-sm text-muted-foreground">Authorization code: <Badge variant={code ? "default" : "destructive"}>{code ? "received" : "missing"}</Badge></p>
			<p className="text-sm text-muted-foreground">State: {state ?? "not provided"}</p>
			<Button type="button" variant="outline" onClick={() => window.location.href = "/sign-in"}>Back to sign in</Button>
		</AuthCard>
	);
}
