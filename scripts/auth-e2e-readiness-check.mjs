import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const manifestPath = join(process.cwd(), "testing/auth-e2e-scenarios.json");

const requiredScenarioIds = [
	"email-password",
	"github-oauth",
	"google-oauth",
	"oauth-state-and-origin",
	"email-otp",
	"phone-otp-sms",
	"phone-otp-whatsapp",
	"passkey",
	"mfa-totp",
	"logout",
	"session-refresh",
	"hosted-ui-callback",
	"customer-app-return",
	"convex-jwt-validation",
	"org-rbac",
	"project-isolation",
];

function scenarioEvidence(scenario) {
	if (Array.isArray(scenario.evidence)) {
		return scenario.evidence;
	}
	if (Array.isArray(scenario.evidenceReferences)) {
		return scenario.evidenceReferences;
	}
	if (typeof scenario.evidenceUrl === "string" && scenario.evidenceUrl.trim()) {
		return [scenario.evidenceUrl.trim()];
	}
	return [];
}

if (!existsSync(manifestPath)) {
	console.error("Missing testing/auth-e2e-scenarios.json");
	process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const scenarios = Array.isArray(manifest.requiredScenarios) ? manifest.requiredScenarios : [];
const byId = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
let failed = false;

for (const id of requiredScenarioIds) {
	const scenario = byId.get(id);
	if (!scenario) {
		console.error(`FAIL missing scenario ${id}`);
		failed = true;
		continue;
	}

	if (scenario.status !== "passed") {
		console.error(
			`${scenario.status?.toUpperCase?.() ?? "UNKNOWN"} ${id}: deployed browser E2E evidence is not passed`,
		);
		failed = true;
		continue;
	}

	const evidence = scenarioEvidence(scenario).filter(
		(item) => typeof item === "string" && item.trim().length >= 12,
	);
	if (evidence.length === 0) {
		console.error(`FAIL ${id}: passed scenario needs at least one concrete evidence reference`);
		failed = true;
		continue;
	}

	console.log(`PASS ${id}`);
}

if (failed) {
	console.error(
		"\nBrowser E2E is not production-ready. Update testing/auth-e2e-scenarios.json with passed status and evidence only after running the deployed flow.",
	);
	process.exitCode = 1;
}
