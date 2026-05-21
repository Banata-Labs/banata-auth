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

function evidenceReferences(item) {
	if (Array.isArray(item.evidence)) {
		return item.evidence;
	}
	if (Array.isArray(item.evidenceReferences)) {
		return item.evidenceReferences;
	}
	if (typeof item.evidenceUrl === "string" && item.evidenceUrl.trim()) {
		return [item.evidenceUrl.trim()];
	}
	return [];
}

function hasMeaningfulEvidence(item) {
	return evidenceReferences(item).some(
		(entry) => typeof entry === "string" && entry.trim().length >= 12,
	);
}

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
	if (item.status === "passed" && !hasMeaningfulEvidence(item)) {
		console.error(`FAIL ${id}: passed review items need concrete evidence`);
		failed = true;
	}
	if (
		item.status === "blocked" &&
		(typeof item.owner !== "string" || item.owner.trim().length === 0)
	) {
		console.error(`FAIL ${id}: blocked review items need an owner`);
		failed = true;
	}
	console.log(`${item.status.toUpperCase()} ${id}`);
}

if (failed) {
	process.exitCode = 1;
}
