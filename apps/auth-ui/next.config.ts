import type { NextConfig } from "next";

const securityHeaders = [
	{
		key: "Content-Security-Policy",
		value:
			"default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https: wss:; form-action 'self'; upgrade-insecure-requests",
	},
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
	{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },
	{ key: "Cross-Origin-Resource-Policy", value: "same-site" },
	{ key: "Cache-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
	transpilePackages: ["@banata-auth/nextjs", "@banata-auth/react", "@convex-dev/better-auth"],
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
