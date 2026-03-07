"use client";

import { useState } from "react";
import { AuthCard } from "@banata-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function MagicLinkPage() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);

	return (
		<AuthCard title="Magic Link" description="Get a secure sign-in link sent to your inbox.">
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					await fetch("/api/auth/sign-in/magic-link", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ email, callbackURL: "/org-selector" }),
					});
					setSent(true);
				}}
				className="grid gap-3"
			>
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required />
				<Button type="submit">Send magic link</Button>
			</form>
			{sent ? <p className="text-sm text-muted-foreground">If the account exists, a magic link is on the way.</p> : null}
		</AuthCard>
	);
}
