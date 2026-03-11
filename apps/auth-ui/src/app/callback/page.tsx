"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	asCrossDomainActions,
	generateHostedOneTimeToken,
	useProjectAuthClient,
} from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import { useEffect, useRef, useState } from "react";

function getOttFromWindow(): string | null {
	if (typeof window === "undefined") {
		return null;
	}
	return new URLSearchParams(window.location.search).get("ott");
}

export default function CallbackPage() {
	const { customerAuthBaseUrl, customerCallbackUrl, scopedPath } = useProjectAuthConfig();
	const authClient = useProjectAuthClient(customerAuthBaseUrl);
	const { data: session, isPending } = authClient.useSession();
	const [status, setStatus] = useState<"verifying" | "redirecting" | "idle" | "error">("verifying");
	const [error, setError] = useState<string | null>(null);
	const hasHandledOttRef = useRef(false);
	const hasStartedRedirectRef = useRef(false);

	useEffect(() => {
		if (!customerAuthBaseUrl || hasHandledOttRef.current) {
			return;
		}

		const token = getOttFromWindow();
		if (!token) {
			hasHandledOttRef.current = true;
			setStatus("idle");
			return;
		}

		hasHandledOttRef.current = true;
		void (async () => {
			try {
				setStatus("verifying");
				const result = await asCrossDomainActions(authClient).crossDomain.oneTimeToken.verify({
					token,
				});
				const sessionToken = result.data?.session?.token;
				if (sessionToken) {
					await authClient.getSession({
						fetchOptions: {
							headers: {
								Authorization: `Bearer ${sessionToken}`,
							},
						},
					});
					asCrossDomainActions(authClient).crossDomain.updateSession();
				}
				setStatus("idle");
			} catch (loadError) {
				setStatus("error");
				setError(
					loadError instanceof Error ? loadError.message : "Unable to verify hosted sign-in.",
				);
			}
		})();
	}, [authClient, customerAuthBaseUrl]);

	useEffect(() => {
		if (isPending || !session?.user || !customerCallbackUrl || hasStartedRedirectRef.current) {
			return;
		}

		hasStartedRedirectRef.current = true;
		void (async () => {
			try {
				setStatus("redirecting");
				const token = await generateHostedOneTimeToken(authClient);
				if (!token) {
					throw new Error("Unable to create a handoff token for the customer app.");
				}
				const url = new URL(customerCallbackUrl);
				url.searchParams.set("ott", token);
				window.location.href = url.toString();
			} catch (redirectError) {
				hasStartedRedirectRef.current = false;
				setStatus("error");
				setError(
					redirectError instanceof Error
						? redirectError.message
						: "Unable to hand off the session to the customer app.",
				);
			}
		})();
	}, [authClient, customerCallbackUrl, isPending, session]);

	const params =
		typeof window === "undefined"
			? new URLSearchParams()
			: new URLSearchParams(window.location.search);
	const code = params.get("code");
	const state = params.get("state");
	const ott = params.get("ott");

	return (
		<AuthCard title="Auth callback" description="Finalizing authentication.">
			<p className="text-sm text-muted-foreground">
				Authorization code:{" "}
				<Badge variant={code ? "default" : "secondary"}>{code ? "received" : "not used"}</Badge>
			</p>
			<p className="text-sm text-muted-foreground">State: {state ?? "not provided"}</p>
			<p className="text-sm text-muted-foreground">
				Handoff token:{" "}
				<Badge variant={ott ? "default" : "secondary"}>{ott ? "received" : "pending"}</Badge>
			</p>
			{status === "verifying" ? (
				<p className="text-sm text-muted-foreground">Verifying the hosted session...</p>
			) : null}
			{status === "redirecting" ? (
				<p className="text-sm text-muted-foreground">Redirecting back to the customer app...</p>
			) : null}
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
			<Button
				type="button"
				variant="outline"
				onClick={() => {
					window.location.href = scopedPath("/sign-in");
				}}
			>
				Back to sign in
			</Button>
		</AuthCard>
	);
}
