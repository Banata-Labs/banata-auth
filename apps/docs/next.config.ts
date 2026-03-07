import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	transpilePackages: ["lucide-react"],
	serverExternalPackages: ["shiki", "rehype-pretty-code"],
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
};

export default nextConfig;
