import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: "convex",
					environment: "edge-runtime",
					include: ["convex/**/*.test.ts"],
				},
			},
		],
		coverage: {
			reporter: ["text", "html"],
		},
	},
	server: {
		deps: {
			inline: ["convex-test"],
		},
	},
});
