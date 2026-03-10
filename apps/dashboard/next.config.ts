import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: [
		"@convex-dev/better-auth",
		"@banata-auth/shared",
		"@banata-auth/sdk",
		"@banata-auth/react",
		"@banata-auth/nextjs",
		"@banata-auth/convex",
	],
};

export default nextConfig;
