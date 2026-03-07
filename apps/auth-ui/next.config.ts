import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@banata-auth/nextjs", "@banata-auth/react", "@convex-dev/better-auth"],
};

export default nextConfig;
