import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const manifestPath = join(process.cwd(), "testing/auth-maturity-readiness.json");
const requiredIds = [
	"enterprise-byok",
	"device-risk-scoring",
	"auth-anomaly-detection",
	"session-forensics",
	"fine-grained-authorization",
	"enterprise-compliance-packaging",
];

if (!existsSync(manifestPath)) {
	console.error("Missing testing/auth-maturity-readiness.json");
	process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const capabilities = Array.isArray(manifest.capabilities) ? manifest.capabilities : [];
const byId = new Map(capabilities.map((capability) => [capability.id, capability]));
let failed = false;

for (const id of requiredIds) {
	const capability = byId.get(id);
	if (!capability) {
		console.error(`FAIL missing maturity capability ${id}`);
		failed = true;
		continue;
	}
	if (!["planned", "beta", "available", "deferred"].includes(capability.status)) {
		console.error(`FAIL ${id}: invalid status ${JSON.stringify(capability.status)}`);
		failed = true;
	}
	if (typeof capability.owner !== "string" || capability.owner.length < 3) {
		console.error(`FAIL ${id}: missing owner`);
		failed = true;
	}
	if (typeof capability.notes !== "string" || capability.notes.length < 40) {
		console.error(`FAIL ${id}: missing meaningful notes`);
		failed = true;
	}
	console.log(`${capability.status.toUpperCase()} ${id}`);
}

if (failed) {
	process.exitCode = 1;
}
