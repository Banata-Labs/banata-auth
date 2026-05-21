import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { completeHostedAuth } from "@/lib/hosted-auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AuthCallbackPage() {
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		void (async () => {
			try {
				const next = await completeHostedAuth("/api/auth");
				if (!cancelled) {
					navigate(next, { replace: true });
				}
			} catch (loadError) {
				if (!cancelled) {
					setError(loadError instanceof Error ? loadError.message : "Unable to complete sign in.");
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [navigate]);

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-6">
			<Card className="w-full max-w-lg">
				<CardHeader>
					<CardTitle>{error ? "Sign-in failed" : "Finishing sign-in"}</CardTitle>
					<CardDescription>
						{error
							? "The hosted auth handoff could not be completed."
							: "Banata is finishing the hosted callback and creating your local session."}
					</CardDescription>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					{error ?? "One moment while we verify the callback token."}
				</CardContent>
			</Card>
		</div>
	);
}
