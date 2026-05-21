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
	if (!["pending", "passed", "blocked"].includes(scenario.status)) {
		console.error(`FAIL ${id}: invalid status ${JSON.stringify(scenario.status)}`);
		failed = true;
	}
	if (typeof scenario.description !== "string" || scenario.description.length < 20) {
		console.error(`FAIL ${id}: missing meaningful description`);
		failed = true;
	}
	console.log(`${scenario.status.toUpperCase()} ${id}`);
}

if (failed) {
	process.exitCode = 1;
}
