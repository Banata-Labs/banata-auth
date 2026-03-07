"use client";

import { useState } from "react";
import { resolveSocialProviders } from "./provider-registry";
import type { AuthClientLike, SocialProvider } from "./types";

export interface SocialButtonsProps {
	/** The Better Auth client instance. */
	authClient: AuthClientLike;
	/** List of social providers to render buttons for. */
	providers: SocialProvider[];
	/** URL to redirect to after successful social sign-in. */
	callbackURL?: string;
	/** Additional class name for the container. */
	className?: string;
}

/**
 * Renders a button per social provider.  Each button calls
 * `authClient.signIn.social()` with the provider id.
 *
 * Uses inline styles with CSS custom properties for cross-app
 * compatibility — works in any app that defines the standard
 * shadcn/ui CSS variables (--background, --foreground, --border, etc.).
 *
 * @example
 * ```tsx
 * <SocialButtons
 *   authClient={authClient}
 *   providers={[{ id: "github", label: "GitHub" }]}
 *   callbackURL="/"
 * />
 * ```
 */
export function SocialButtons({
	authClient,
	providers,
	callbackURL,
	className,
}: SocialButtonsProps) {
	const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const resolvedProviders = resolveSocialProviders(providers);

	if (resolvedProviders.length === 0) return null;

	async function handleSocialSignIn(providerId: string) {
		setError(null);
		setLoadingProvider(providerId);
		try {
			const result = await authClient.signIn.social({
				provider: providerId,
				callbackURL,
			});

			// Better Auth may return a redirect URL instead of auto-redirecting
			if (result.error) {
				setError(result.error.message ?? `Unable to sign in with ${providerId}`);
				return;
			}

			// Some Better Auth configurations return a URL to redirect to
			const data = result.data as Record<string, unknown> | undefined;
			if (data && typeof data.url === "string") {
				window.location.href = data.url;
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "An unexpected error occurred";
			setError(message);
		} finally {
			setLoadingProvider(null);
		}
	}

	return (
		<div className={`grid gap-2 ${className ?? ""}`}>
			{error && (
				<p className="text-sm" style={{ color: "var(--destructive)" }}>
					{error}
				</p>
			)}
			{resolvedProviders.map((provider) => (
				<button
					key={provider.id}
					type="button"
					disabled={loadingProvider !== null}
					className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
					style={{
						backgroundColor: "var(--background)",
						border: "1px solid var(--input)",
						color: "var(--foreground)",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.opacity = "0.85";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.opacity = "1";
					}}
					onClick={() => void handleSocialSignIn(provider.id)}
				>
					{provider.icon}
					{loadingProvider === provider.id ? "Redirecting..." : `Continue with ${provider.label}`}
				</button>
			))}
		</div>
	);
}
