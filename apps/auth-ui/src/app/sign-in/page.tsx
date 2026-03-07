"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, SocialButtons } from "@banata-auth/react";
import { PasskeyButton } from "@/components/passkey-button";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	return (
		<div className="mt-14">
			<AuthCard title="Sign in" description="Use email, social SSO, or passkey.">
				<form
					onSubmit={async (event) => {
						event.preventDefault();
						setError(null);
						const result = await authClient.signIn.email({
							email,
							password,
							callbackURL: "/org-selector",
						});
						if (result.error) {
							setError(result.error.message ?? "Unable to sign in");
							return;
						}
						window.location.href = "/org-selector";
					}}
					className="grid gap-3"
				>
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="password">Password</Label>
						<Input id="password" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
					</div>
					<Button type="submit">Continue</Button>
				</form>
				{error ? <p className="text-sm text-destructive">{error}</p> : null}
				<Separator />
				<PasskeyButton callbackURL="/org-selector" />
				<SocialButtons
					authClient={authClient}
					providers={[{ id: "github", label: "GitHub" }]}
					callbackURL="/org-selector"
				/>
				<p className="text-sm text-muted-foreground">
					Need an account? <Link href="/sign-up">Create one</Link>
				</p>
				<p className="text-sm text-muted-foreground">
					Prefer passwordless? <Link href="/magic-link">Magic link</Link> or <Link href="/email-otp">Email OTP</Link>
				</p>
				<p className="text-sm text-muted-foreground">
					Forgot your password? <Link href="/forgot-password">Reset it</Link>
				</p>
			</AuthCard>
		</div>
	);
}
