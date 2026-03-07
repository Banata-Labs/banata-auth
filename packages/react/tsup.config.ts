import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/convex-provider.tsx", "src/client-plugins.ts"],
	format: ["esm"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	treeshake: true,
	external: [
		"@banata-auth/react",
		"@banata-auth/shared",
		"@convex-dev/better-auth",
		"@convex-dev/better-auth/nextjs",
		"@convex-dev/better-auth/nextjs/client",
		"better-auth",
		"better-auth/cookies",
		"convex",
		"convex/react",
		"next",
		"next/server",
		"next/headers",
		"react",
	],
});
