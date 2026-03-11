"use client";

import { ProjectAuthLogo } from "@/components/project-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjectAuthClient } from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import { useState } from "react";

export default function ResetPasswordPage() {
	const token =
		typeof window === "undefined"
			? ""
			: (new URLSearchParams(window.location.search).get("token") ?? "");
	const [password, setPassword] = useState("");
	const [done, setDone] = useState(false);
	const { config, customerAuthBaseUrl } = useProjectAuthConfig();
	const authClient = useProjectAuthClient(customerAuthBaseUrl);

	return (
		<AuthCard
			title="Set a new password"
			description="Password reset tokens expire in 1 hour."
			logo={<ProjectAuthLogo branding={config?.branding} />}
		>
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					await authClient.resetPassword({ token, newPassword: password });
					setDone(true);
				}}
				className="grid gap-3"
			>
				<Label htmlFor="password">New password</Label>
				<Input
					id="password"
					type="password"
					placeholder="New password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					required
				/>
				<Button type="submit" disabled={!token}>
					Reset password
				</Button>
			</form>
			{done ? (
				<p className="text-sm text-muted-foreground">Password updated. You can sign in now.</p>
			) : null}
		</AuthCard>
	);
}
