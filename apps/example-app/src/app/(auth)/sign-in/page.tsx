"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useMemo, useState } from "react";

interface PublicAuthConfig {
	authMethods?: {
		emailPassword?: boolean;
		magicLink?: boolean;
		emailOtp?: boolean;
		passkey?: boolean;
	};
	socialProviders?: Record<string, { enabled?: boolean }>;
}

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [config, setConfig] = useState<PublicAuthConfig | null>(null);
	const [configError, setConfigError] = useState<string | null>(null);
	const [configLoading, setConfigLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function loadConfig() {
			try {
				const response = await fetch("/api/auth/banata/config/public", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: "{}",
				});
				if (!response.ok) {
					throw new Error("Unable to load Banata project config");
				}
				const payload = (await response.json()) as PublicAuthConfig;
				if (!cancelled) {
					setConfig(payload);
					setConfigError(null);
				}
			} catch (loadError) {
				if (!cancelled) {
					setConfig(null);
					setConfigError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load Banata project config",
					);
				}
			} finally {
				if (!cancelled) {
					setConfigLoading(false);
				}
			}
		}

		void loadConfig();
		return () => {
			cancelled = true;
		};
	}, []);

	const enabledSocialProviders = useMemo(
		() =>
			Object.entries(config?.socialProviders ?? {})
				.filter(([, provider]) => provider.enabled !== false)
				.map(([providerId]) => providerId),
		[config],
	);
	const emailPasswordEnabled = config?.authMethods?.emailPassword ?? false;
	const hasUnimplementedMethod =
		(config?.authMethods?.magicLink ?? false) ||
		(config?.authMethods?.emailOtp ?? false) ||
		(config?.authMethods?.passkey ?? false);

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
			<p>This sample app reads your Banata dashboard auth config at runtime.</p>

			{configLoading && <div style={{ marginBottom: 16 }}>Loading project auth settings...</div>}

			{configError && (
				<div style={{ color: "red", marginBottom: 16 }}>{configError}</div>
			)}

			{error && (
				<div style={{ color: "red", marginBottom: 16 }}>{error}</div>
			)}

			{emailPasswordEnabled ? (
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
			) : null}

			{enabledSocialProviders.length > 0 ? <hr style={{ margin: "24px 0" }} /> : null}

			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				{enabledSocialProviders.includes("github") ? (
					<button type="button" onClick={handleGitHubSignIn} style={{ padding: 10 }}>
						Sign in with GitHub
					</button>
				) : null}
				{!configLoading && !emailPasswordEnabled && enabledSocialProviders.length === 0 ? (
					<div>No supported sample-app sign-in methods are enabled for this project.</div>
				) : null}
				{hasUnimplementedMethod ? (
					<div style={{ color: "#666", fontSize: 14 }}>
						This sample page only renders email/password and GitHub. Your Banata project may
						also have passwordless or passkey methods enabled.
					</div>
				) : null}
			</div>
		</main>
	);
}
