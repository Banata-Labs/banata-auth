import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const templatePath = join(process.cwd(), "testing/auth-production-gate-evidence-template.json");
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

if (!existsSync(templatePath)) {
	console.error("Missing testing/auth-production-gate-evidence-template.json");
	process.exit(1);
}

const template = JSON.parse(readFileSync(templatePath, "utf8"));
const gates = Array.isArray(template.gates) ? template.gates : [];
const requiredIdSet = new Set(requiredIds);
const byId = new Map(gates.map((gate) => [gate.id, gate]));
let failed = false;

for (const gate of gates) {
	if (!gate || typeof gate.id !== "string") {
		console.error("FAIL invalid gate template entry");
		failed = true;
		continue;
	}
	if (!requiredIdSet.has(gate.id)) {
		console.error(`FAIL unknown gate template ${gate.id}`);
		failed = true;
	}
	if (gates.filter((entry) => entry?.id === gate.id).length > 1) {
		console.error(`FAIL duplicate gate template ${gate.id}`);
		failed = true;
	}
}

for (const id of requiredIds) {
	const gate = byId.get(id);
	if (!gate) {
		console.error(`FAIL missing gate template ${id}`);
		failed = true;
		continue;
	}
	if (typeof gate.owner !== "string" || gate.owner.length < 3) {
		console.error(`FAIL ${id}: missing owner`);
		failed = true;
	}
	if (!Array.isArray(gate.requiredEvidence) || gate.requiredEvidence.length < 3) {
		console.error(`FAIL ${id}: missing required evidence checklist`);
		failed = true;
		continue;
	}
	for (const evidence of gate.requiredEvidence) {
		if (typeof evidence !== "string" || evidence.length < 20) {
			console.error(`FAIL ${id}: weak evidence item ${JSON.stringify(evidence)}`);
			failed = true;
		}
	}
	console.log(`READY ${id}`);
}

if (failed) {
	process.exitCode = 1;
}
