import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const manifestPath = join(process.cwd(), "testing/auth-security-review-checklist.json");
const requiredIds = [
	"security-headers",
	"content-security-policy",
	"cookie-policy",
	"csrf-origin-policy",
	"secret-log-redaction",
	"oauth-callback-policy",
	"provider-dashboard-hardening",
	"incident-logging-and-retention",
];

if (!existsSync(manifestPath)) {
	console.error("Missing testing/auth-security-review-checklist.json");
	process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const items = Array.isArray(manifest.reviewItems) ? manifest.reviewItems : [];
const byId = new Map(items.map((item) => [item.id, item]));
let failed = false;

for (const id of requiredIds) {
	const item = byId.get(id);
	if (!item) {
		console.error(`FAIL missing review item ${id}`);
		failed = true;
		continue;
	}
	if (!["pending", "passed", "blocked"].includes(item.status)) {
		console.error(`FAIL ${id}: invalid status ${JSON.stringify(item.status)}`);
		failed = true;
	}
	if (typeof item.description !== "string" || item.description.length < 40) {
		console.error(`FAIL ${id}: missing meaningful description`);
		failed = true;
	}
	console.log(`${item.status.toUpperCase()} ${id}`);
}

if (failed) {
	process.exitCode = 1;
}
