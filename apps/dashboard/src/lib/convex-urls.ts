function normalizeEnv(value: string | undefined): string | undefined {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function deriveConvexSiteUrl(convexUrl: string | undefined): string | undefined {
	const normalized = normalizeEnv(convexUrl);
	if (!normalized) {
		return undefined;
	}
	if (normalized.endsWith(".convex.site")) {
		return normalized;
	}
	if (!normalized.endsWith(".convex.cloud")) {
		return undefined;
	}
	return `${normalized.slice(0, -".convex.cloud".length)}.convex.site`;
}

export function resolveDashboardConvexSiteUrl(): string | undefined {
	return (
		normalizeEnv(process.env.NEXT_PUBLIC_CONVEX_SITE_URL) ??
		deriveConvexSiteUrl(process.env.NEXT_PUBLIC_CONVEX_URL)
	);
}
