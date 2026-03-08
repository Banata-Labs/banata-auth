"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CopyEnvBlockProps {
	clientId: string;
}

export function CopyEnvBlock({ clientId }: CopyEnvBlockProps) {
	const [copied, setCopied] = useState(false);

	const clientIdValue = clientId || "<your-project-client-id>";

	const envBlock = [
		`BANATA_CLIENT_ID="${clientIdValue}"`,
		`BANATA_API_KEY="<generate in API Keys>"`,
	].join("\n");

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(envBlock);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback: select text for manual copy
		}
	}

	return (
		<Card className="flex flex-col justify-between">
			<CardHeader>
				<CardTitle className="text-sm">Copy environment variables</CardTitle>
				<CardDescription>
					Add these to your{" "}
					<code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code> file.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-3">
				<div className="group relative rounded-md border bg-muted/50 px-3 py-2">
					<p className="font-mono text-xs text-muted-foreground select-all">
						BANATA_CLIENT_ID=&quot;{clientIdValue}&quot;
					</p>
				</div>
				<div className="group relative rounded-md border bg-muted/50 px-3 py-2">
					<p className="font-mono text-xs text-muted-foreground">
						BANATA_API_KEY=&quot;
						<Link
							href="/api-keys"
							className="text-primary underline underline-offset-2 hover:text-primary/80"
						>
							Generate one in API Keys &rarr;
						</Link>
						&quot;
					</p>
				</div>
				<Button variant="outline" size="sm" className="mt-1 w-fit gap-2" onClick={handleCopy}>
					{copied ? (
						<>
							<Check className="size-3.5" />
							Copied!
						</>
					) : (
						<>
							<Copy className="size-3.5" />
							Copy to clipboard
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
