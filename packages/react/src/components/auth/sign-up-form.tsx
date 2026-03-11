"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { formatAuthClientError } from "./format-error";
import { SocialButtons } from "./social-buttons";
import type { AuthClientLike, SocialProvider } from "./types";

export interface SignUpFormProps {
	/** The Better Auth client instance. */
	authClient: AuthClientLike;
	/** URL to redirect to after successful sign-up. Defaults to "/". */
	callbackURL?: string;
	/** Social providers to render (below the email/password form). */
	socialProviders?: SocialProvider[];
	/** Called after a successful sign-up (before redirect). */
	onSuccess?: () => void;
	/**
	 * Custom redirect handler for SPA-friendly navigation.
	 * When provided, this is called instead of `window.location.href`.
	 * Use this to integrate with your router (e.g., Next.js `router.push`).
	 */
	onRedirect?: (url: string) => void;
	/** Optional branding slot above the form (e.g., a logo). */
	logo?: ReactNode;
	/** Card title. Defaults to "Create account". */
	title?: string;
	/** Card description. */
	description?: string;
	/** Link element rendered below the form (e.g., "Already have an account? Sign in"). */
	footer?: ReactNode;
	/** Additional class names on the outer wrapper. */
	className?: string;
}

/**
 * A complete sign-up form component that calls the Better Auth client
 * for email/password registration.
 */
export function SignUpForm({
	authClient,
	callbackURL = "/",
	socialProviders = [],
	onSuccess,
	onRedirect,
	logo,
	title = "Create account",
	description,
	footer,
	className,
}: SignUpFormProps) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);
		try {
			const result = await authClient.signUp.email({
				name,
				email,
				password,
				callbackURL,
			});
			if (result.error) {
				setError(formatAuthClientError(result.error, "Unable to create account"));
				return;
			}
			onSuccess?.();
			if (onRedirect) {
				onRedirect(callbackURL);
			} else {
				window.location.href = callbackURL;
			}
		} catch {
			setError("An unexpected error occurred");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className={`mx-auto w-full max-w-md px-4 ${className ?? ""}`}>
			<div
				className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl"
				style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)" }}
			>
				{logo && <div className="mb-5 flex justify-center">{logo}</div>}
				<div className="mb-6 text-center">
					<h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
						{title}
					</h1>
					{description && (
						<p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
							{description}
						</p>
					)}
				</div>

				<div className="grid gap-4">
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid gap-2">
							<label
								htmlFor="banata-signup-name"
								className="text-sm font-medium"
								style={{ color: "var(--foreground)" }}
							>
								Full name
							</label>
							<input
								id="banata-signup-name"
								type="text"
								placeholder="Your name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="h-10 w-full rounded-lg px-3 text-sm outline-none transition-all"
								style={{
									backgroundColor: "var(--background)",
									border: "1px solid var(--input)",
									color: "var(--foreground)",
								}}
							/>
						</div>
						<div className="grid gap-2">
							<label
								htmlFor="banata-signup-email"
								className="text-sm font-medium"
								style={{ color: "var(--foreground)" }}
							>
								Email
							</label>
							<input
								id="banata-signup-email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="h-10 w-full rounded-lg px-3 text-sm outline-none transition-all"
								style={{
									backgroundColor: "var(--background)",
									border: "1px solid var(--input)",
									color: "var(--foreground)",
								}}
							/>
						</div>
						<div className="grid gap-2">
							<label
								htmlFor="banata-signup-password"
								className="text-sm font-medium"
								style={{ color: "var(--foreground)" }}
							>
								Password
							</label>
							<input
								id="banata-signup-password"
								type="password"
								placeholder="Create a password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="h-10 w-full rounded-lg px-3 text-sm outline-none transition-all"
								style={{
									backgroundColor: "var(--background)",
									border: "1px solid var(--input)",
									color: "var(--foreground)",
								}}
							/>
						</div>
						{error && (
							<p className="text-sm" style={{ color: "var(--destructive)" }}>
								{error}
							</p>
						)}
						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-1 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50"
							style={{
								backgroundColor: "var(--primary)",
								color: "#fff",
							}}
						>
							{isSubmitting ? "Creating account..." : "Create account"}
						</button>
					</form>

					{socialProviders.length > 0 && (
						<div className="relative my-1">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full" style={{ borderTop: "1px solid var(--border)" }} />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span
									className="px-3"
									style={{
										backgroundColor: "var(--card)",
										color: "var(--muted-foreground)",
									}}
								>
									or
								</span>
							</div>
						</div>
					)}

					{socialProviders.length > 0 && (
						<SocialButtons
							authClient={authClient}
							providers={socialProviders}
							callbackURL={callbackURL}
						/>
					)}

					{footer && (
						<div className="pt-2 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
							{footer}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
