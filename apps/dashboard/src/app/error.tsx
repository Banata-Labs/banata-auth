"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error for observability (replace with your telemetry later)
		console.error("[Banata Dashboard Error]", error);
	}, [error]);

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
			<div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
				<AlertTriangle className="size-8 text-destructive" />
			</div>

			<div className="max-w-md space-y-2">
				<h2 className="text-xl font-semibold text-foreground">
					Something went wrong
				</h2>
				<p className="text-sm text-muted-foreground">
					An unexpected error occurred while rendering this page. This has been
					logged and we&apos;ll look into it.
				</p>
				{error.digest && (
					<p className="font-mono text-xs text-muted-foreground/60">
						Error ID: {error.digest}
					</p>
				)}
			</div>

			<div className="flex gap-3">
				<Button onClick={reset}>Try again</Button>
				<Button
					variant="outline"
					onClick={() => {
						window.location.href = "/";
					}}
				>
					Go to Dashboard
				</Button>
			</div>
		</div>
	);
}
