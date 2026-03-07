import { defineConfig } from "tsup";

export default defineConfig({
	entry: [
		"src/index.ts",
		"src/server.ts",
		"src/client.ts",
		"src/middleware.ts",
		"src/bot-protection.ts",
	],
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
