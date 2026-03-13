import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

function deriveConvexSiteUrl(convexUrl) {
	if (typeof convexUrl !== "string" || convexUrl.trim().length === 0) {
		return null;
	}
	if (convexUrl.endsWith(".convex.site")) {
		return convexUrl;
	}
	if (!convexUrl.endsWith(".convex.cloud")) {
		return null;
	}
	return `${convexUrl.slice(0, -".convex.cloud".length)}.convex.site`;
}

const env = { ...process.env };
if (!env.NEXT_PUBLIC_CONVEX_SITE_URL) {
	const derivedSiteUrl = deriveConvexSiteUrl(env.NEXT_PUBLIC_CONVEX_URL);
	if (derivedSiteUrl) {
		env.NEXT_PUBLIC_CONVEX_SITE_URL = derivedSiteUrl;
		console.log(`[banata-dashboard] Derived NEXT_PUBLIC_CONVEX_SITE_URL=${derivedSiteUrl}`);
	}
}

const requiredPackageBuilds = [
	"../../packages/shared/dist/index.js",
	"../../packages/sdk/dist/index.js",
	"../../packages/react/dist/index.js",
	"../../packages/nextjs/dist/index.js",
	"../../packages/convex/dist/index.js",
];

function run(command, customEnv = env) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, [], {
			cwd: process.cwd(),
			env: customEnv,
			shell: true,
			stdio: "inherit",
		});

		child.on("exit", (code, signal) => {
			if (signal) {
				process.kill(process.pid, signal);
				return;
			}
			if (code === 0) {
				resolve();
				return;
			}
			reject(new Error(`Command failed: ${command}`));
		});
	});
}

async function main() {
	const missingBuildOutput = requiredPackageBuilds.some((relativePath) => {
		const resolvedPath = join(process.cwd(), relativePath);
		return !existsSync(resolvedPath);
	});

	if (missingBuildOutput) {
		console.log("[banata-dashboard] Package build outputs missing. Building workspace packages first.");
		await run("bun run build:packages");
	}

	await run("bunx next build");
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
