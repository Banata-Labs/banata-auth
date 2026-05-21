import { spawnSync } from "node:child_process";

const checks = [
	["bun", ["run", "typecheck"]],
	["bun", ["run", "test"]],
	["bun", ["run", "verify:auth-readiness"]],
	["bun", ["run", "verify:auth-e2e-scenarios"]],
	["bun", ["run", "verify:auth-security-review"]],
	["bun", ["run", "verify:auth-operations-readiness"]],
	["bun", ["run", "verify:auth-maturity-readiness"]],
	["bun", ["run", "verify:auth-production-gate-template"]],
	["bun", ["run", "--cwd", "apps/docs", "build"]],
	["bun", ["run", "--cwd", "apps/example-app", "typecheck"]],
	["bun", ["run", "--cwd", "apps/example-app", "build"]],
	["git", ["diff", "--check"]],
];

for (const [command, args] of checks) {
	const label = [command, ...args].join(" ");
	console.log(`\n$ ${label}`);
	const result = spawnSync(command, args, {
		stdio: "inherit",
		shell: process.platform === "win32",
	});

	if (result.status !== 0) {
		console.error(`\nFAIL ${label}`);
		process.exit(result.status ?? 1);
	}
}

console.log("\nLocal auth readiness checks passed.");
