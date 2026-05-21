const DEFAULT_AUTH_URL = "https://auth.banata.dev";
const DEFAULT_HOSTED_UI_URL = "https://auth-ui.banata.dev";
const DEFAULT_DOCS_URL = "https://auth-docs.banata.dev";

const authUrl = normalizeUrl(process.env.BANATA_AUTH_URL || DEFAULT_AUTH_URL);
const hostedUiUrl = normalizeUrl(
	process.env.BANATA_HOSTED_AUTH_URL ||
		process.env.VITE_BANATA_HOSTED_AUTH_URL ||
		DEFAULT_HOSTED_UI_URL,
);
const docsUrl = normalizeUrl(process.env.BANATA_DOCS_URL || DEFAULT_DOCS_URL);
const projectId = process.env.BANATA_PROJECT_ID;
const clientId = process.env.BANATA_CLIENT_ID || process.env.VITE_BANATA_CLIENT_ID;

let failed = false;

function normalizeUrl(value) {
	return value.replace(/\/$/, "");
}

function pass(label, details) {
	console.log(`PASS ${label}: ${details}`);
}

function skip(label, details) {
	console.log(`SKIP ${label}: ${details}`);
}

function fail(label, details) {
	failed = true;
	console.error(`FAIL ${label}: ${details}`);
}

async function probeHeadOrGet(label, url, allowedStatuses = new Set([200, 301, 302, 307, 308])) {
	try {
		let response = await fetch(url, { method: "HEAD", redirect: "manual" });
		if (response.status === 405) {
			response = await fetch(url, { method: "GET", redirect: "manual" });
		}
		const server = response.headers.get("server") || "unknown server";
		const location = response.headers.get("location");
		const detail = `${response.status} ${response.statusText}${location ? ` -> ${location}` : ""}; server=${server}`;
		if (allowedStatuses.has(response.status)) {
			pass(label, detail);
			return;
		}
		fail(label, detail);
	} catch (err) {
		fail(label, err instanceof Error ? err.message : String(err));
	}
}

async function probePublicConfig() {
	if (!projectId && !clientId) {
		skip(
			"auth-public-config",
			"set BANATA_CLIENT_ID, VITE_BANATA_CLIENT_ID, or BANATA_PROJECT_ID to verify project-scoped public config",
		);
		return;
	}

	const body = {};
	if (projectId) body.projectId = projectId;
	if (clientId) body.clientId = clientId;

	try {
		const response = await fetch(`${authUrl}/api/auth/banata/config/public`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
			redirect: "manual",
		});
		const text = await response.text();
		const detail = `${response.status} ${response.statusText}; ${text.slice(0, 120).replace(/\s+/g, " ")}`;
		if (response.ok) {
			pass("auth-public-config", detail);
			return;
		}
		fail("auth-public-config", detail);
	} catch (err) {
		fail("auth-public-config", err instanceof Error ? err.message : String(err));
	}
}

await probeHeadOrGet("auth-root", authUrl);
await probeHeadOrGet("hosted-ui-root", hostedUiUrl);
await probeHeadOrGet("docs-root", docsUrl);
await probePublicConfig();

if (failed) {
	process.exitCode = 1;
}
