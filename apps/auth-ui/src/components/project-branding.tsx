"use client";

import type { RuntimeBrandingConfig } from "@banata-auth/shared";

export function ProjectAuthLogo({
	branding,
	size = 56,
}: {
	branding?: RuntimeBrandingConfig | null;
	size?: number;
}) {
	const logoUrl = branding?.logoUrl?.trim();
	if (!logoUrl) {
		return null;
	}

	return (
		<div
			className="flex items-center justify-center rounded-2xl border bg-background/70 p-3 shadow-sm"
			style={{
				borderColor: "hsl(var(--border))",
			}}
		>
			<img
				src={logoUrl}
				alt="Project logo"
				style={{ width: size, height: size, objectFit: "contain" }}
			/>
		</div>
	);
}
