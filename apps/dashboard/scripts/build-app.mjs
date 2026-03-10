import { spawn } from "node:child_process";

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

const child = spawn("bunx next build", [], {
	cwd: process.cwd(),
	env,
	shell: true,
	stdio: "inherit",
});

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 1);
});
