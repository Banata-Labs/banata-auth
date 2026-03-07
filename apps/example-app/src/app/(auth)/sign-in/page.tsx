"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleEmailSignIn(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			await authClient.signIn.email({
				email,
				password,
				callbackURL: "/dashboard",
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Sign-in failed");
		} finally {
			setLoading(false);
		}
	}

	async function handleGitHubSignIn() {
		await authClient.signIn.social({
			provider: "github",
			callbackURL: "/dashboard",
		});
	}

	return (
		<main style={{ maxWidth: 400, margin: "100px auto" }}>
			<h1>Sign In</h1>

			{error && (
				<div style={{ color: "red", marginBottom: 16 }}>{error}</div>
			)}

			<form onSubmit={handleEmailSignIn}>
				<div style={{ marginBottom: 12 }}>
					<label htmlFor="email">Email</label>
					<br />
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						style={{ width: "100%", padding: 8 }}
					/>
				</div>

				<div style={{ marginBottom: 12 }}>
					<label htmlFor="password">Password</label>
					<br />
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						style={{ width: "100%", padding: 8 }}
					/>
				</div>

				<button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
					{loading ? "Signing in..." : "Sign in with Email"}
				</button>
			</form>

			<hr style={{ margin: "24px 0" }} />

			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<button type="button" onClick={handleGitHubSignIn} style={{ padding: 10 }}>
					Sign in with GitHub
				</button>
			</div>
		</main>
	);
}
