import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: [
		"@banata-auth/nextjs",
		"@banata-auth/react",
		"@banata-auth/shared",
	],
};

export default nextConfig;
