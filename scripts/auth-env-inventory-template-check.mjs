import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const templatePath = join(process.cwd(), "testing/auth-production-env-inventory-template.json");

const requiredVariables = [
	"BETTER_AUTH_SECRET",
	"SITE_URL",
	"BANATA_AUTH_APP_SECRET",
	"BANATA_JWT_SIGNING_KEY_KMS_ID",
	"BANATA_VAULT_KMS_KEY_ID",
	"BANATA_REFRESH_TOKEN_PEPPER_KMS_ID",
	"BANATA_WEBHOOK_SIGNING_PEPPER",
	"BANATA_API_KEY",
	"BANATA_AUTH_URL",
	"VITE_BANATA_HOSTED_AUTH_URL",
	"VITE_BANATA_CLIENT_ID",
];

const disallowedEvidencePatterns = [
	/ba_(live|test)_[a-z0-9_]{12,}/i,
	/GOCSPX-[a-z0-9_-]{8,}/i,
	/whsec_[a-z0-9_]{8,}/i,
	/re_[a-z0-9_]{8,}/i,
	/sk_(live|test)_[a-z0-9_]{8,}/i,
	/(secret|token|cookie|otp|password)\s*[:=]\s*["']?[a-z0-9_./+=-]{12,}/i,
];

if (!existsSync(templatePath)) {
	console.error("Missing testing/auth-production-env-inventory-template.json");
	process.exit(1);
}

const template = JSON.parse(readFileSync(templatePath, "utf8"));
const variables = Array.isArray(template.variables) ? template.variables : [];
const byName = new Map(variables.map((item) => [item?.name, item]));
let failed = false;

for (const name of requiredVariables) {
	const item = byName.get(name);
	if (!item) {
		console.error(`FAIL missing env inventory variable ${name}`);
		failed = true;
		continue;
	}
	if (!["pending", "verified", "blocked"].includes(item.status)) {
		console.error(`FAIL ${name}: invalid status ${JSON.stringify(item.status)}`);
		failed = true;
	}
	if (item.required !== true) {
		console.error(`FAIL ${name}: required variables must be marked required`);
		failed = true;
	}
	if (item.environmentScoped !== true) {
		console.error(`FAIL ${name}: must record environmentScoped true`);
		failed = true;
	}
	if (typeof item.runtime !== "string" || item.runtime.trim().length < 3) {
		console.error(`FAIL ${name}: missing runtime`);
		failed = true;
	}
	if (typeof item.valueEvidence !== "string" || item.valueEvidence.trim().length < 6) {
		console.error(`FAIL ${name}: missing redacted value evidence`);
		failed = true;
	}
	for (const pattern of disallowedEvidencePatterns) {
		if (pattern.test(item.valueEvidence) || pattern.test(item.notes ?? "")) {
			console.error(`FAIL ${name}: env inventory must not include raw secret-looking values`);
			failed = true;
		}
	}
	console.log(`${item.status.toUpperCase()} ${name}`);
}

if (typeof template.deployment?.releaseIdentifier !== "string") {
	console.error("FAIL deployment.releaseIdentifier is required");
	failed = true;
}

if (
	!Array.isArray(template.logReview?.forbiddenValues) ||
	template.logReview.forbiddenValues.length < 5
) {
	console.error("FAIL logReview.forbiddenValues must list sensitive value classes");
	failed = true;
}

if (failed) {
	process.exitCode = 1;
}
