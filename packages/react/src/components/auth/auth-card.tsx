"use client";

import type { ReactNode } from "react";

export interface AuthCardProps {
	/** Card heading. */
	title: string;
	/** Optional subheading below the title. */
	description?: string;
	/** Card body. */
	children: ReactNode;
	/** Optional branding slot rendered above the title (e.g., a logo). */
	logo?: ReactNode;
	/** Additional class names for the outer wrapper. */
	className?: string;
}

/**
 * A centred, max-width card wrapper for authentication screens.
 *
 * Uses inline styles with CSS custom properties for cross-app
 * compatibility — works in any app that defines the standard
 * shadcn/ui CSS variables (--card, --foreground, --border, etc.).
 *
 * @example
 * ```tsx
 * <AuthCard title="Sign in" description="Welcome back.">
 *   <SignInForm authClient={authClient} />
 * </AuthCard>
 * ```
 */
export function AuthCard({
	title,
	description,
	children,
	logo,
	className,
}: AuthCardProps) {
	return (
		<div
			className={`mx-auto w-full max-w-md px-4 ${className ?? ""}`}
		>
			<div
				className="rounded-2xl border p-8"
				style={{
					backgroundColor: "var(--card)",
					borderColor: "var(--border)",
					boxShadow:
						"0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
				}}
			>
				{logo && (
					<div className="mb-5 flex justify-center">{logo}</div>
				)}
				<div className="mb-6 text-center">
					<h1
						className="text-2xl font-bold tracking-tight"
						style={{ color: "var(--foreground)" }}
					>
						{title}
					</h1>
					{description && (
						<p
							className="mt-2 text-sm"
							style={{ color: "var(--muted-foreground)" }}
						>
							{description}
						</p>
					)}
				</div>
				<div className="grid gap-4">{children}</div>
			</div>
		</div>
	);
}
