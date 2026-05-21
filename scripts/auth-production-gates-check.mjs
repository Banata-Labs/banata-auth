import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const evidencePath = join(process.cwd(), "testing/auth-production-gates.json");
const templatePath = join(process.cwd(), "testing/auth-production-gate-evidence-template.json");
const allowedStatuses = new Set(["passed", "disabled-with-owner", "pending"]);
const requiredIds = [
	"final-domain-deploy-isolation",
	"ci-monorepo-checks",
	"sms-whatsapp-provider-delivery",
	"phone-otp-session-issuance",
	"browser-e2e-core-auth",
	"real-oauth-providers",
	"sso-scim-real-idp",
	"kms-key-custody",
	"production-env-inventory",
	"monitoring-alerting-incident-response",
	"security-review-signoff",
];

if (!existsSync(evidencePath)) {
	console.error(`Missing production gate evidence file: ${evidencePath}`);
	process.exit(1);
}

if (!existsSync(templatePath)) {
	console.error(`Missing production gate evidence template: ${templatePath}`);
	process.exit(1);
}

const manifest = JSON.parse(readFileSync(evidencePath, "utf8"));
const template = JSON.parse(readFileSync(templatePath, "utf8"));
const gates = Array.isArray(manifest.gates) ? manifest.gates : [];
const templateGates = Array.isArray(template.gates) ? template.gates : [];
const requiredIdSet = new Set(requiredIds);
const byId = new Map(gates.map((gate) => [gate?.id, gate]));
const templateById = new Map(templateGates.map((gate) => [gate?.id, gate]));
let failed = false;

for (const id of requiredIds) {
	if (!byId.has(id)) {
		console.error(`FAIL missing required production gate ${id}`);
		failed = true;
	}
}

for (const gate of gates) {
	if (!gate || typeof gate.id !== "string") {
		console.error("FAIL invalid gate entry");
		failed = true;
		continue;
	}
	if (!requiredIdSet.has(gate.id)) {
		console.error(`FAIL unknown production gate ${gate.id}`);
		failed = true;
		continue;
	}
	if (gates.filter((entry) => entry?.id === gate.id).length > 1) {
		console.error(`FAIL duplicate production gate ${gate.id}`);
		failed = true;
		continue;
	}
	if (!allowedStatuses.has(gate.status)) {
		console.error(`FAIL ${gate.id}: invalid status ${JSON.stringify(gate.status)}`);
		failed = true;
		continue;
	}
	const evidence = Array.isArray(gate.evidence) ? gate.evidence : [];
	const templateGate = templateById.get(gate.id);
	const requiredEvidence = Array.isArray(templateGate?.requiredEvidence)
		? templateGate.requiredEvidence
		: [];
	if (gate.status === "passed" && evidence.length === 0) {
		console.error(`FAIL ${gate.id}: passed gates must include evidence references`);
		failed = true;
		continue;
	}
	if (gate.status === "passed" && evidence.length < requiredEvidence.length) {
		console.error(
			`FAIL ${gate.id}: passed gates must include at least ${requiredEvidence.length} evidence references`,
		);
		failed = true;
		continue;
	}
	if (gate.status === "disabled-with-owner" && evidence.length === 0) {
		console.error(`FAIL ${gate.id}: disabled gates must include owner/decision evidence`);
		failed = true;
		continue;
	}
	if (
		gate.status === "disabled-with-owner" &&
		(typeof gate.owner !== "string" || gate.owner.trim().length < 3)
	) {
		console.error(`FAIL ${gate.id}: disabled gates must include an owner`);
		failed = true;
		continue;
	}
	for (const item of evidence) {
		if (typeof item !== "string" || item.length < 20) {
			console.error(`FAIL ${gate.id}: weak evidence reference ${JSON.stringify(item)}`);
			failed = true;
		}
	}
	if (gate.status === "pending") {
		if (typeof gate.notes !== "string" || gate.notes.trim().length < 20) {
			console.error(`FAIL ${gate.id}: pending gates must include meaningful notes`);
			failed = true;
			continue;
		}
		console.error(`PENDING ${gate.id}: ${gate.notes ?? "production evidence required"}`);
		failed = true;
		continue;
	}
	console.log(`PASS ${gate.id}`);
}

if (gates.length === 0) {
	console.error("FAIL no production gates listed");
	failed = true;
}

if (failed) {
	process.exitCode = 1;
}
